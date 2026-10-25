"""Unit tests for AgentProof Local Quarantine Manager."""

import hashlib
from pathlib import Path
import pytest
from agentproof.quarantine_manager import QuarantineManager


@pytest.fixture
def quarantine(tmp_path):
    vault_base = tmp_path / "quarantine_root"
    return QuarantineManager(quarantine_dir=vault_base)


def test_quarantine_requires_explicit_confirmation(tmp_path, quarantine):
    target = tmp_path / "payload.exe"
    target.write_bytes(b"suspicious content")

    res = quarantine.quarantine_file(target, confirmed=False)
    assert res["success"] is False
    assert "requires explicit user confirmation" in res["error"]
    assert target.exists()


def test_quarantine_moves_file_and_updates_manifest(tmp_path, quarantine):
    target = tmp_path / "suspicious.exe"
    content = b"sample-malicious-bytes-12345"
    target.write_bytes(content)
    expected_hash = hashlib.sha256(content).hexdigest()

    res = quarantine.quarantine_file(target, reason="EICAR detection", confirmed=True)
    assert res["success"] is True
    assert res["sha256"] == expected_hash
    assert not target.exists(), "Source file must be moved out of user path"

    # Verify manifest
    files = quarantine.list_quarantined_files()
    assert len(files) == 1
    entry = files[0]
    assert entry["quarantine_id"] == res["quarantine_id"]
    assert entry["original_filename"] == "suspicious.exe"
    assert entry["sha256"] == expected_hash
    assert entry["status"] == "quarantined"


def test_restore_quarantined_file(tmp_path, quarantine):
    target = tmp_path / "important_document.doc.exe"
    content = b"restorable-data-payload"
    target.write_bytes(content)

    q_res = quarantine.quarantine_file(target, confirmed=True)
    qid = q_res["quarantine_id"]
    assert not target.exists()

    # Restore requires confirmation
    bad_res = quarantine.restore_file(qid, confirmed=False)
    assert bad_res["success"] is False
    assert "requires explicit user confirmation" in bad_res["error"]

    # Confirmed restore
    restore_res = quarantine.restore_file(qid, confirmed=True)
    assert restore_res["success"] is True
    assert target.exists(), "File must be restored to original path"
    assert target.read_bytes() == content

    # Manifest status updated
    files = quarantine.list_quarantined_files()
    entry = next(f for f in files if f["quarantine_id"] == qid)
    assert entry["status"] == "restored"


def test_delete_quarantined_file(tmp_path, quarantine):
    target = tmp_path / "dangerous.sh"
    target.write_bytes(b"rm -rf /")

    q_res = quarantine.quarantine_file(target, confirmed=True)
    qid = q_res["quarantine_id"]

    # Delete requires confirmation
    bad_del = quarantine.delete_quarantined_file(qid, confirmed=False)
    assert bad_del["success"] is False

    # Confirmed deletion
    del_res = quarantine.delete_quarantined_file(qid, confirmed=True)
    assert del_res["success"] is True

    files = quarantine.list_quarantined_files()
    entry = next(f for f in files if f["quarantine_id"] == qid)
    assert entry["status"] == "permanently_deleted"


def test_path_traversal_defense(quarantine):
    # Attempting to quarantine the vault itself must fail
    vault_item = quarantine.vault_dir / "test.bin"
    vault_item.write_bytes(b"vault file")

    res = quarantine.quarantine_file(vault_item, confirmed=True)
    assert res["success"] is False
    assert "Cannot quarantine a file already within the quarantine vault" in res["error"]
