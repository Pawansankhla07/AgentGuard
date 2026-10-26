"""Secure Image Processor and Validator for AgentProof Multimodal Threat Analysis.

Validates image formats, bounds file sizes, prevents zip-bombs/decompression-bombs,
and normalizes screenshots safely for Gemma 4 multimodal inference.
"""

import io
from typing import Tuple
from PIL import Image

from agentproof.config import config
from agentproof.exceptions import InvalidImageError

# Limit max pixel decompression to prevent decompression bomb Denial of Service (DoS)
Image.MAX_IMAGE_PIXELS = 40_000_000  # ~40 megapixels

ALLOWED_MIME_TYPES = {
    "image/png": "PNG",
    "image/jpeg": "JPEG",
    "image/webp": "WEBP",
}

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_DIMENSION = 2048


def validate_and_process_image(
    raw_bytes: bytes,
    filename: str = "upload.png",
) -> Tuple[bytes, str, dict]:
    """
    Validates uploaded raw bytes as a genuine, safe image.
    Performs normalization and bounds checking.

    Returns:
        (normalized_bytes, mime_type, metadata_dict)
    """
    if not raw_bytes:
        raise InvalidImageError("Uploaded screenshot is empty (0 bytes).")

    if len(raw_bytes) > config.max_image_upload_bytes:
        limit_mb = config.max_image_upload_bytes / (1024 * 1024)
        raise InvalidImageError(
            f"Screenshot size ({len(raw_bytes) / (1024*1024):.1f}MB) exceeds "
            f"maximum permitted upload size of {limit_mb:.0f}MB."
        )

    # Magic byte & header inspection via Pillow
    try:
        image_stream = io.BytesIO(raw_bytes)
        img = Image.open(image_stream)
        img.verify()  # Verifies integrity without decoding entire image
    except Exception as exc:
        raise InvalidImageError(f"Corrupted or invalid image data: {exc}") from exc

    # Re-open stream for processing (verify closes/invalidates the stream in Pillow)
    image_stream.seek(0)
    try:
        img = Image.open(image_stream)
        detected_format = (img.format or "").upper()
        orig_width, orig_height = img.size
    except Exception as exc:
        raise InvalidImageError(f"Failed to inspect image dimensions: {exc}") from exc

    format_to_mime = {
        "PNG": "image/png",
        "JPEG": "image/jpeg",
        "WEBP": "image/webp",
    }

    if detected_format not in format_to_mime:
        raise InvalidImageError(
            f"Unsupported image format '{detected_format}'. "
            f"Permitted formats: PNG, JPEG, WEBP."
        )

    mime_type = format_to_mime[detected_format]

    # Dimension bounds check & safe resizing if unusually huge
    target_img = img
    resized = False
    if orig_width > MAX_DIMENSION or orig_height > MAX_DIMENSION:
        target_img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
        resized = True

    # Safe channel normalization: if palette or alpha, flatten cleanly for LLM vision tokens
    if target_img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", target_img.size, (255, 255, 255))
        if target_img.mode == "P":
            target_img = target_img.convert("RGBA")
        background.paste(target_img, mask=target_img.split()[-1] if "A" in target_img.mode else None)
        target_img = background
        out_format = "PNG"
        mime_type = "image/png"
    elif target_img.mode != "RGB":
        target_img = target_img.convert("RGB")
        out_format = detected_format
    else:
        out_format = detected_format

    out_stream = io.BytesIO()
    if out_format == "JPEG":
        target_img.save(out_stream, format="JPEG", quality=90, optimize=True)
    elif out_format == "WEBP":
        target_img.save(out_stream, format="WEBP", quality=90)
    else:
        target_img.save(out_stream, format="PNG", optimize=True)

    normalized_bytes = out_stream.getvalue()
    new_width, new_height = target_img.size

    metadata = {
        "original_filename": filename,
        "format": out_format,
        "mime_type": mime_type,
        "original_size_bytes": len(raw_bytes),
        "normalized_size_bytes": len(normalized_bytes),
        "original_dimensions": [orig_width, orig_height],
        "final_dimensions": [new_width, new_height],
        "resized": resized,
    }

    return normalized_bytes, mime_type, metadata
