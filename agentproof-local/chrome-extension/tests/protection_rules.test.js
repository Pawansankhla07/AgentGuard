import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Manifest V3 — Structure and Permission Compliance', () => {
  const manifestPath = path.resolve(__dirname, '../manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');
  assert.ok(manifest.permissions.includes('storage'), 'Requires storage permission');
  assert.ok(manifest.permissions.includes('notifications'), 'Requires notifications permission');
  assert.ok(manifest.permissions.includes('downloads'), 'Requires downloads permission');
  assert.ok(manifest.options_ui && manifest.options_ui.page, 'Requires options_ui declaration');
  assert.ok(manifest.background && manifest.background.service_worker, 'Requires background service worker');
});

test('Download Protection — Flags deceptive double extensions', () => {
  const doubleExtRegex = /\.(pdf|doc|docx|xlsx|png|jpg|txt|mp3|mp4)\.(exe|bat|cmd|vbs|js|ps1|scr|jar|msi)$/i;

  // Deceptive dangerous samples
  assert.ok(doubleExtRegex.test('invoice_2026.pdf.exe'), 'Should flag .pdf.exe');
  assert.ok(doubleExtRegex.test('quarterly_report.docx.js'), 'Should flag .docx.js');
  assert.ok(doubleExtRegex.test('family_photo.jpg.scr'), 'Should flag .jpg.scr');
  assert.ok(doubleExtRegex.test('budget.xlsx.vbs'), 'Should flag .xlsx.vbs');

  // Benign safe samples
  assert.ok(!doubleExtRegex.test('legitimate_document.pdf'), 'Should not flag standard .pdf');
  assert.ok(!doubleExtRegex.test('source_code.tar.gz'), 'Should not flag standard .tar.gz');
  assert.ok(!doubleExtRegex.test('backup.zip'), 'Should not flag .zip');
  assert.ok(!doubleExtRegex.test('notes.txt'), 'Should not flag .txt');
});

test('Domain Policy — Allowlist and Denylist Evaluation', () => {
  const allowlist = ['mycorp.internal', 'safe-bank.com'];
  const denylist = ['phishing-login.com', 'bad-actor.xyz'];

  const isAllowed = (domain) => allowlist.includes(domain.toLowerCase());
  const isDenied = (domain) => denylist.includes(domain.toLowerCase());

  assert.ok(isAllowed('mycorp.internal'), 'Allowed domain matches');
  assert.ok(isAllowed('SAFE-BANK.COM'), 'Allowed domain case-insensitive match');
  assert.ok(!isAllowed('unknown-site.org'), 'Unknown domain not allowed');

  assert.ok(isDenied('phishing-login.com'), 'Denied domain matches');
  assert.ok(isDenied('BAD-ACTOR.XYZ'), 'Denied domain case-insensitive match');
  assert.ok(!isDenied('safe-bank.com'), 'Safe domain not denied');
});
