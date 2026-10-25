"""Unit tests for AgentProof Local File Scanner."""

import hashlib
from pathlib import Path
import pytest
from agentproof.file_scanner import EICAR_SIGNATURE, FileScanner


@pytest.fixture
def scanner():
    return FileScanner()


def test_scan_benign_text_file(tmp_path, scanner):
    test_file = tmp_path / "hello.txt"
    content = b"AgentProof local security inspection test."
    test_file.write_bytes(content)

    res = scanner.scan_file(test_file)
    assert res["success"] is True
    assert res["filename"] == "hello.txt"
    assert res["size_bytes"] == len(content)
    assert res["sha256"] == hashlib.sha256(content).hexdigest()
    assert res["sha1"] == hashlib.sha1(content).hexdigest()
    assert res["md5"] == hashlib.md5(content).hexdigest()
    assert res["is_double_extension"] is False
    assert res["eicar_detected"] is False
    assert res["risk_score"] == 0


def test_detect_deceptive_double_extension(tmp_path, scanner):
    bad_file = tmp_path / "invoice_march.pdf.exe"
    bad_file.write_bytes(b"MZ\x90\x00\x03\x00\x00\x00")

    res = scanner.scan_file(bad_file)
    assert res["success"] is True
    assert res["is_double_extension"] is True
    assert res["is_dangerous_extension"] is True
    assert res["risk_score"] >= 75
    assert any("double-extension" in f["id"] for f in res["findings"])


def test_detect_magic_byte_mismatch(tmp_path, scanner):
    # Executable header pretending to be a PDF
    fake_pdf = tmp_path / "statement.pdf"
    fake_pdf.write_bytes(b"MZ\x90\x00\x03\x00\x00\x00binary-code")

    res = scanner.scan_file(fake_pdf)
    assert res["success"] is True
    assert any("mismatch" in f["id"] for f in res["findings"])
    assert res["risk_score"] >= 60


def test_detect_eicar_test_string(tmp_path, scanner):
    eicar_file = tmp_path / "eicar.com"
    eicar_file.write_bytes(EICAR_SIGNATURE)

    res = scanner.scan_file(eicar_file)
    assert res["success"] is True
    assert res["eicar_detected"] is True
    assert any("eicar" in f["id"] for f in res["findings"])
    assert res["risk_score"] == 100


def test_scan_nonexistent_file(tmp_path, scanner):
    missing_file = tmp_path / "does_not_exist.bin"
    res = scanner.scan_file(missing_file)
    assert res["success"] is False
    assert "does not exist" in res["error"]


def test_antivirus_availability(scanner):
    avail = scanner.is_antivirus_available()
    assert isinstance(avail, bool)
