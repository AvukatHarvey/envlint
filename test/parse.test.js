'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { parse } = require('../src');

const val = (src, key) => parse(src).entries.get(key)?.value;

test('basic key=value', () => {
  assert.strictEqual(val('FOO=bar', 'FOO'), 'bar');
});

test('ignores comments and blank lines', () => {
  const { entries } = parse('# comment\n\nA=1\n  # indented comment\nB=2');
  assert.deepStrictEqual([...entries.keys()], ['A', 'B']);
});

test('export prefix', () => {
  assert.strictEqual(val('export TOKEN=abc', 'TOKEN'), 'abc');
});

test('quoted values', () => {
  assert.strictEqual(val('A="hello world"', 'A'), 'hello world');
  assert.strictEqual(val("A='single # not comment'", 'A'), 'single # not comment');
  assert.strictEqual(val('A=`tick`', 'A'), 'tick');
});

test('inline comments on unquoted values', () => {
  assert.strictEqual(val('PORT=3000 # default port', 'PORT'), '3000');
  assert.strictEqual(val('URL=http://x.com/#anchor', 'URL'), 'http://x.com/#anchor');
});

test('escape sequences in double quotes', () => {
  assert.strictEqual(val('A="line1\\nline2 \\"q\\""', 'A'), 'line1\nline2 "q"');
  assert.strictEqual(val("A='raw\\n'", 'A'), 'raw\\n');
});

test('multi-line double-quoted values', () => {
  const { entries, errors } = parse('KEY="-----BEGIN\nabc\n-----END"\nNEXT=1');
  assert.strictEqual(entries.get('KEY').value, '-----BEGIN\nabc\n-----END');
  assert.strictEqual(entries.get('NEXT').value, '1');
  assert.strictEqual(errors.length, 0);
});

test('empty values', () => {
  assert.strictEqual(val('A=', 'A'), '');
  assert.strictEqual(val('A=""', 'A'), '');
});

test('CRLF line endings', () => {
  assert.deepStrictEqual([...parse('A=1\r\nB=2\r\n').entries.keys()], ['A', 'B']);
});

test('reports duplicates', () => {
  const { duplicates, entries } = parse('A=1\nA=2');
  assert.deepStrictEqual(duplicates, [{ key: 'A', line: 2 }]);
  assert.strictEqual(entries.get('A').value, '2');
});

test('reports errors', () => {
  const { errors } = parse('NOEQUALS\n1BAD=x\nU="open');
  assert.strictEqual(errors.length, 3);
  assert.deepStrictEqual(errors.map((e) => e.line), [1, 2, 3]);
});

test('tracks continuation lines of multi-line values', () => {
  const { continuationLines } = parse('A=1\nKEY="x\n# not a comment\ny"\nB=2');
  assert.deepStrictEqual([...continuationLines], [3, 4]);
});
