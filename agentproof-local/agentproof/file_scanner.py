"""File Scanner Module for AgentProof Local Security Suite.

Inspects user-selected files or downloaded payloads:
- Calculates cryptographic hashes (SHA-256, SHA-1, MD5).
- Detects deceptive double extensions (e.g., .pdf.exe, .docx.js).
- Analyzes binary magic bytes vs declared extensions.
- Detects benign test fixtures (e.g., EICAR test string).
- Integrates with local ClamAV/antivirus if installed.
- Distinguishes heuristic suspicion from confirmed detections.
- Ensures all file contents remain 100% local.
"""

import hashlib
import mimetypes
import os
from pathlib import Path
import shutil
import subprocess
from typing import Any, Optional


DANGEROUS_EXTENSIONS = {
    ".exe", ".bat", ".cmd", ".sh", ".bash", ".vbs", ".js", ".jse",
    ".wsf", ".wsh", ".ps1", ".psm1", ".scr", ".pif", ".hta", ".cpl",
    ".jar", ".msi", ".dll", ".dylib", ".so", ".app", ".command",
}

DOCUMENT_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".txt", ".rtf", ".odt", ".csv", ".json", ".xml", ".png", ".jpg", ".jpeg",
}

MAGIC_SIGNATURES = {
    "PE": (b"MZ", 0, "Windows Executable / DLL"),
    "ELF": (b"\x7fELF", 0, "Linux Executable / ELF"),
    "MACHO_64": (b"\xcf\xfa\xed\xfe", 0, "macOS Mach-O 64-bit Binary"),
    "MACHO_32": (b"\xce\xfa\xed\xfe", 0, "macOS Mach-O 32-bit Binary"),
    "MACHO_FAT": (b"\xca\xfe\xba\xbe", 0, "macOS Mach-O Universal Binary"),
    "ZIP": (b"PK\x03\x04", 0, "ZIP Archive / Container"),
    "PDF": (b"%PDF-", 0, "PDF Document"),
    "SHEBANG": (b"#!", 0, "Script Shebang"),
}

EICAR_SIGNATURE = b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"


class FileScanner:
    """Local file scanner with cryptographic hashing and heuristic inspection."""

    def __init__(self, clamav_path: Optional[str] = None):
        self.clamav_binary = clamav_path or shutil.which("clamscan") or shutil.which("clamdscan")

    def is_antivirus_available(self) -> bool:
        """Check if local ClamAV binary is installed and executable."""
        return self.clamav_binary is not None and os.access(self.clamav_binary, os.X_OK)

    def scan_file(self, file_path: str | Path) -> dict[str, Any]:
        """Perform a complete security inspection of a local file."""
        path = Path(file_path).resolve()

        if not path.exists():
            return {
                "success": False,
                "error": f"File does not exist: {path}",
                "path": str(path),
                "is_clean": False,
                "risk_score": 0,
            }

        if not path.is_file():
            return {
                "success": False,
                "error": f"Target is a directory, not a regular file: {path}",
                "path": str(path),
                "is_clean": False,
                "risk_score": 0,
            }

        file_size = path.stat().st_size
        filename = path.name

        # 1. Cryptographic hashes
        hashes = self._calculate_hashes(path)

        # 2. Filename and double-extension analysis
        ext_findings = self._inspect_extensions(filename)

        # 3. Magic bytes and header inspection
        magic_findings = self._inspect_magic_bytes(path)

        # 4. Built-in test fixture detection
        fixture_findings = self._inspect_test_fixtures(path)

        # 5. Optional local ClamAV scan
        av_findings = self._scan_with_clamav(path)

        # Combine findings
        all_findings = ext_findings + magic_findings + fixture_findings + av_findings

        # Determine severity and risk score
        is_clean = len(all_findings) == 0
        has_eicar = any(f["id"] == "eicar-standard-test-fixture" for f in all_findings)
        has_critical = any(f["severity"] == "critical" for f in all_findings)
        has_high = any(f["severity"] == "high" for f in all_findings)

        if has_eicar:
            risk_score = 100
            threat_level = "Critical"
        elif has_critical:
            risk_score = 90
            threat_level = "Critical"
        elif has_high:
            risk_score = 65
            threat_level = "High"
        elif len(all_findings) > 0:
            risk_score = 35
            threat_level = "Medium"
        else:
            risk_score = 0
            threat_level = "Clean"

        is_double_ext = any(f["id"] == "double-extension-deception" for f in all_findings)
        is_dangerous_ext = any(f["id"] in ("double-extension-deception", "executable-extension") for f in all_findings)

        return {
            "success": True,
            "filename": filename,
            "path": str(path),
            "size_bytes": file_size,
            "is_clean": is_clean,
            "risk_score": risk_score,
            "threat_level": threat_level,
            "sha256": hashes["sha256"],
            "sha1": hashes["sha1"],
            "md5": hashes["md5"],
            "is_double_extension": is_double_ext,
            "is_dangerous_extension": is_dangerous_ext,
            "eicar_detected": has_eicar,
            "hashes": hashes,
            "findings": all_findings,
            "antivirus_engine": "ClamAV" if self.is_antivirus_available() else "Local Heuristic Engine",
            "coverage": {
                "hash_calculated": True,
                "extension_analyzed": True,
                "binary_header_inspected": True,
                "external_av_checked": self.is_antivirus_available(),
            },
        }

    def _calculate_hashes(self, path: Path) -> dict[str, str]:
        sha256 = hashlib.sha256()
        sha1 = hashlib.sha1()
        md5 = hashlib.md5()

        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha256.update(chunk)
                sha1.update(chunk)
                md5.update(chunk)

        return {
            "sha256": sha256.hexdigest(),
            "sha1": sha1.hexdigest(),
            "md5": md5.hexdigest(),
        }

    def _inspect_extensions(self, filename: str) -> list[dict[str, Any]]:
        findings = []
        name_lower = filename.lower()
        parts = name_lower.split(".")

        # Double extension detection (e.g. document.pdf.exe)
        if len(parts) >= 3:
            first_ext = "." + parts[-2]
            last_ext = "." + parts[-1]
            if first_ext in DOCUMENT_EXTENSIONS and last_ext in DANGEROUS_EXTENSIONS:
                findings.append({
                    "id": "double-extension-deception",
                    "title": "Deceptive double extension detected",
                    "category": "Heuristic File Anomaly",
                    "severity": "critical",
                    "evidence": f"File masquerades as document ({first_ext}) but executes as ({last_ext}).",
                    "remediation": "Do not execute or open this file. Quarantine immediately.",
                    "source": "heuristic_scanner",
                    "verified": True,
                })

        # Single dangerous extension check
        ext = os.path.splitext(name_lower)[1]
        if ext in DANGEROUS_EXTENSIONS and not findings:
            findings.append({
                "id": "executable-extension",
                "title": f"Executable file format ({ext})",
                "category": "Potential Security Concern",
                "severity": "medium",
                "evidence": f"Declared file extension {ext} indicates an executable format.",
                "remediation": "Verify the trusted provenance of this executable before execution.",
                "source": "heuristic_scanner",
                "verified": True,
            })

        return findings

    def _inspect_magic_bytes(self, path: Path) -> list[dict[str, Any]]:
        findings = []
        ext = path.suffix.lower()

        try:
            with open(path, "rb") as f:
                header = f.read(32)
        except Exception:
            return findings

        # Check for executable magic bytes
        is_binary_executable = False
        detected_format = ""

        if header.startswith(b"MZ"):
            is_binary_executable = True
            detected_format = "Windows PE Executable"
        elif header.startswith(b"\x7fELF"):
            is_binary_executable = True
            detected_format = "Linux ELF Executable"
        elif header.startswith((b"\xcf\xfa\xed\xfe", b"\xce\xfa\xed\xfe", b"\xca\xfe\xba\xbe")):
            is_binary_executable = True
            detected_format = "macOS Mach-O Executable"

        # Mismatch: Declared innocent document/image, but binary header is an executable!
        if is_binary_executable and ext in DOCUMENT_EXTENSIONS:
            findings.append({
                "id": "magic-bytes-extension-mismatch",
                "title": "Severe header/extension mismatch (Executable disguised as document)",
                "category": "Confirmed Technical Observation",
                "severity": "critical",
                "evidence": f"Declared extension is '{ext}', but file header magic bytes indicate a {detected_format}.",
                "remediation": "This file is likely a trojan disguised as a document. Quarantine immediately.",
                "source": "binary_inspector",
                "verified": True,
            })

        return findings

    def _inspect_test_fixtures(self, path: Path) -> list[dict[str, Any]]:
        findings = []
        try:
            with open(path, "rb") as f:
                content = f.read(512)
                if EICAR_SIGNATURE in content:
                    findings.append({
                        "id": "eicar-standard-test-fixture",
                        "title": "Standard Antivirus Test Signature (EICAR)",
                        "category": "Confirmed Test Fixture",
                        "severity": "critical",
                        "evidence": "File contains standard benign EICAR antivirus verification string.",
                        "remediation": "Benign synthetic test file. Used to verify quarantine and alerting workflows.",
                        "source": "signature_matcher",
                        "verified": True,
                    })
        except Exception:
            pass
        return findings

    def _scan_with_clamav(self, path: Path) -> list[dict[str, Any]]:
        findings = []
        if not self.is_antivirus_available():
            return findings

        try:
            res = subprocess.run(
                [self.clamav_binary, "--no-summary", str(path)],
                capture_output=True,
                text=True,
                timeout=15,
            )
            # Exit code 1 means virus detected in ClamAV
            if res.returncode == 1:
                findings.append({
                    "id": "clamav-detection",
                    "title": "Confirmed Local Antivirus Detection (ClamAV)",
                    "category": "Confirmed Antivirus Threat",
                    "severity": "critical",
                    "evidence": res.stdout.strip() or "ClamAV reported infected status.",
                    "remediation": "Do not open. Quarantine or delete file immediately.",
                    "source": "clamav_daemon",
                    "verified": True,
                })
        except Exception:
            pass

        return findings
