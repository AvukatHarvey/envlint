'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const BIN = path.join(__dirname, '..', 'bin', 'envlint.js');

function run(files, args = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlint-'));
  for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), content);
  const r = spawnSync(process.execPath, [BIN, '--no-color', ...args], { cwd: dir, encoding: 'utf8' });
  return { ...r, dir };
}

test('exit 0 when in sync', () => {
  const r = run({ '.env': 'A=1', '.env.example': 'A=' });
  assert.strictEqual(r.status, 0);
  assert.match(r.stdout, /matches/);
});

test('exit 1 with report when out of sync', () => {
  const r = run({ '.env': 'A=1', '.env.example': 'A=\nB=' });
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /Missing in \.env \(1\)/);
  assert.match(r.stdout, /- B/);
});

test('--json output', () => {
  const r = run({ '.env': 'A=1', '.env.example': 'B=' }, ['--json']);
  assert.strictEqual(r.status, 1);
  const json = JSON.parse(r.stdout);
  assert.deepStrictEqual(json.missing, ['B']);
  assert.deepStrictEqual(json.extra, ['A']);
});

test('exit 2 on missing file', () => {
  const r = run({ '.env.example': 'A=' });
  assert.strictEqual(r.status, 2);
  assert.match(r.stderr, /file not found/);
});

test('custom paths and --optional', () => {
  const r = run({ 'prod.env': 'A=1', 'tpl.env': 'A=\nB=' }, ['-e', 'prod.env', '-x', 'tpl.env', '-o', 'B']);
  assert.strictEqual(r.status, 0);
});

test('init writes example and refuses to overwrite', () => {
  const r = run({ '.env': 'A=secret\nB=x' }, ['init']);
  assert.strictEqual(r.status, 0);
  assert.strictEqual(fs.readFileSync(path.join(r.dir, '.env.example'), 'utf8'), 'A=\nB=\n');
  const again = spawnSync(process.execPath, [BIN, 'init'], { cwd: r.dir, encoding: 'utf8' });
  assert.strictEqual(again.status, 2);
});
