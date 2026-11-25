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

test('reports problems in the example file', () => {
  const r = run({ '.env': 'A=1', '.env.example': 'A=\nA=' });
  assert.strictEqual(r.status, 1);
  assert.match(r.stdout, /Duplicate keys in \.env\.example/);
});

test('quiet mode prints nothing and preserves check exit codes', () => {
  const ok = run({ '.env': 'A=1', '.env.example': 'A=' }, ['--quiet']);
  assert.strictEqual(ok.status, 0);
  assert.strictEqual(ok.stdout, '');
  assert.strictEqual(ok.stderr, '');

  const problems = run({ '.env': 'A=1', '.env.example': 'B=' }, ['-q']);
  assert.strictEqual(problems.status, 1);
  assert.strictEqual(problems.stdout, '');
  assert.strictEqual(problems.stderr, '');
});

test('quiet mode suppresses file errors, JSON, help and version output', () => {
  const missing = run({ '.env.example': 'A=' }, ['--quiet']);
  assert.strictEqual(missing.status, 2);
  assert.strictEqual(missing.stdout, '');
  assert.strictEqual(missing.stderr, '');

  const json = run({ '.env': 'A=1', '.env.example': 'B=' }, ['--json', '--quiet']);
  assert.strictEqual(json.status, 1);
  assert.strictEqual(json.stdout, '');
  assert.strictEqual(json.stderr, '');

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'envlint-'));
  for (const flag of ['--help', '--version']) {
    const r = spawnSync(process.execPath, [BIN, '--quiet', flag], { cwd: dir, encoding: 'utf8' });
    assert.strictEqual(r.status, 0);
    assert.strictEqual(r.stdout, '');
    assert.strictEqual(r.stderr, '');
  }
});

test('quiet init writes the example without printing', () => {
  const r = run({ '.env': 'A=secret' }, ['init', '--quiet']);
  assert.strictEqual(r.status, 0);
  assert.strictEqual(r.stdout, '');
  assert.strictEqual(r.stderr, '');
  assert.strictEqual(fs.readFileSync(path.join(r.dir, '.env.example'), 'utf8'), 'A=\n');
});
