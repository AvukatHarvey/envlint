'use strict';

const { parse } = require('./parse');

/**
 * Compare an env file against an example/template file.
 *
 * @param {string} envSrc      contents of .env
 * @param {string} exampleSrc  contents of .env.example
 * @param {object} [opts]
 * @param {boolean} [opts.allowExtra=false]  don't report keys missing from the example
 * @param {boolean} [opts.allowEmpty=false]  don't report keys with empty values
 * @param {string[]} [opts.optional=[]]      keys that may be missing or empty
 */
function check(envSrc, exampleSrc, opts = {}) {
  const { allowExtra = false, allowEmpty = false, optional = [] } = opts;
  const optionalSet = new Set(optional);
  const env = parse(envSrc);
  const example = parse(exampleSrc);

  const missing = [];
  const empty = [];
  const extra = [];

  for (const key of example.entries.keys()) {
    if (optionalSet.has(key)) continue;
    if (!env.entries.has(key)) missing.push(key);
    else if (!allowEmpty && env.entries.get(key).value === '') empty.push(key);
  }

  if (!allowExtra) {
    for (const key of env.entries.keys()) {
      if (!example.entries.has(key)) extra.push(key);
    }
  }

  const duplicates = env.duplicates.map((d) => d.key);
  const errors = env.errors;
  const exampleDuplicates = example.duplicates.map((d) => d.key);
  const exampleErrors = example.errors;
  const ok =
    !missing.length && !empty.length && !extra.length && !duplicates.length && !errors.length &&
    !exampleDuplicates.length && !exampleErrors.length;

  return { ok, missing, empty, extra, duplicates, errors, exampleDuplicates, exampleErrors };
}

/**
 * Build a .env.example from a .env file: keeps keys, comments and blank lines,
 * strips every value.
 * @param {string} envSrc
 */
function toExample(envSrc) {
  const out = [];
  const { entries, continuationLines } = parse(envSrc);
  const seen = new Set();
  const lines = String(envSrc).replace(/\r\n?/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    // Never copy the content of multi-line values: it may contain secrets.
    if (continuationLines.has(i + 1)) continue;
    const raw = lines[i];
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) { out.push(raw); continue; }
    const m = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=/.exec(line);
    if (m && entries.has(m[1]) && !seen.has(m[1])) {
      seen.add(m[1]);
      out.push(`${m[1]}=`);
    }
  }
  return out.join('\n').replace(/\n*$/, '\n');
}

module.exports = { check, toExample };
