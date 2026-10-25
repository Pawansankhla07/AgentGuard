"""Script to generate benign, controlled security test fixtures for AgentProof Local."""

from pathlib import Path
from agentproof.file_scanner import EICAR_SIGNATURE


def generate_fixtures(base_dir: Path) -> dict[str, Path]:
    fixtures_dir = base_dir / "fixtures"
    fixtures_dir.mkdir(parents=True, exist_ok=True)

    created = {}

    # 1. Benign text file
    benign_txt = fixtures_dir / "sample_quarterly_report.txt"
    benign_txt.write_text(
        "AgentProof Local Security Suite - Verified Benign Document.\n"
        "Created for testing cryptographic hashing and zero-false-positive baseline verification.\n",
        encoding="utf-8",
    )
    created["benign"] = benign_txt

    # 2. Deceptive double extension (.pdf.exe)
    double_ext = fixtures_dir / "invoice_march_2026.pdf.exe"
    # Small synthetic PE header bytes
    double_ext.write_bytes(b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00Synthetic-PE-Test-Payload")
    created["double_ext"] = double_ext

    # 3. Magic byte mismatch (.png extension with PE magic header)
    mismatch_img = fixtures_dir / "profile_picture.png"
    mismatch_img.write_bytes(b"MZ\x90\x00\x03\x00\x00\x00Fake-PNG-Pretending-To-Be-Image")
    created["mismatch"] = mismatch_img

    # 4. Official standard benign EICAR antivirus test signature
    eicar_file = fixtures_dir / "eicar_standard_test.com"
    eicar_file.write_bytes(EICAR_SIGNATURE)
    created["eicar"] = eicar_file

    return created


if __name__ == "__main__":
    target = Path(__file__).resolve().parent.parent / "data"
    res = generate_fixtures(target)
    print(f"Generated {len(res)} controlled test fixtures in: {target / 'fixtures'}")
    for name, p in res.items():
        print(f"  - [{name}] {p.name} ({p.stat().st_size} bytes)")
