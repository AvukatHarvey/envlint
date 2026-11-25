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

test('toExample never copies multi-line value content', () => {
  const src = 'KEY="-----BEGIN\n# secret-looking line\nAPI_TOKEN=leak\n-----END"\n# real comment\nA=1\n';
  const out = toExample(src);
  assert.strictEqual(out, 'KEY=\n# real comment\nA=\n');
  assert.doesNotMatch(out, /secret|leak|BEGIN/);
});

test('toExample does not copy lines swallowed by an unterminated quote', () => {
  const out = toExample('A=1\nB="open\n# hidden\nC=2\n');
  assert.doesNotMatch(out, /hidden/);
});

test('reports errors and duplicates in the example file', () => {
  const r = check('A=1', 'A=\nBROKEN LINE\nA=');
  assert.strictEqual(r.ok, false);
  assert.deepStrictEqual(r.exampleDuplicates, ['A']);
  assert.strictEqual(r.exampleErrors.length, 1);
  assert.strictEqual(r.exampleErrors[0].line, 2);
});
