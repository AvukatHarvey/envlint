'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { check, toExample } = require('../src');

test('ok when files match', () => {
  const r = check('A=1\nB=2', 'A=\nB=');
  assert.strictEqual(r.ok, true);
});

test('detects missing, empty and extra keys', () => {
  const r = check('A=1\nB=\nC=3', 'A=\nB=\nD=');
  assert.strictEqual(r.ok, false);
  assert.deepStrictEqual(r.missing, ['D']);
  assert.deepStrictEqual(r.empty, ['B']);
  assert.deepStrictEqual(r.extra, ['C']);
});

test('allowExtra / allowEmpty', () => {
  const r = check('A=\nX=1', 'A=', { allowExtra: true, allowEmpty: true });
  assert.strictEqual(r.ok, true);
});

test('optional keys', () => {
  const r = check('A=1\nB=', 'A=\nB=\nC=', { optional: ['B', 'C'] });
  assert.strictEqual(r.ok, true);
});

test('duplicates make the check fail', () => {
  const r = check('A=1\nA=2', 'A=');
  assert.strictEqual(r.ok, false);
  assert.deepStrictEqual(r.duplicates, ['A']);
});

test('toExample strips values, keeps comments', () => {
  const out = toExample('# Database\nDB_URL=postgres://u:p@h/db\n\nexport SECRET="s3cr3t"\nDB_URL=again\n');
  assert.strictEqual(out, '# Database\nDB_URL=\n\nSECRET=\n');
});
