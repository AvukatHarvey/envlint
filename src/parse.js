'use strict';

/**
 * Parse the contents of a .env file.
 *
 * Supports:
 *   - comments (# ...) and blank lines
 *   - optional `export ` prefix
 *   - single, double and backtick quoted values
 *   - multi-line double/backtick quoted values
 *   - inline comments after unquoted values (`KEY=value # comment`)
 *   - escape sequences (\n, \r, \t, \", \\) inside double quotes
 *
 * @param {string} src
 * @returns {{ entries: Map<string, {value: string, line: number}>, duplicates: Array<{key: string, line: number}>, errors: Array<{line: number, message: string}> }}
 */
function parse(src) {
  const entries = new Map();
  const duplicates = [];
  const errors = [];
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    let line = lines[i].trim();
    if (line === '' || line.startsWith('#')) continue;

    if (line.startsWith('export ')) line = line.slice(7).trimStart();

    const eq = line.indexOf('=');
    if (eq === -1) {
      errors.push({ line: lineNo, message: `missing "=" in "${truncate(line)}"` });
      continue;
    }

    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(key)) {
      errors.push({ line: lineNo, message: `invalid key "${truncate(key)}"` });
      continue;
    }

    let rest = line.slice(eq + 1).trimStart();
    let value;
    const q = rest[0];

    if (q === '"' || q === "'" || q === '`') {
      let body = rest.slice(1);
      let close = findClosingQuote(body, q);
      // multi-line support for " and `
      while (close === -1 && q !== "'" && i + 1 < lines.length) {
        i++;
        body += '\n' + lines[i];
        close = findClosingQuote(body, q);
      }
      if (close === -1) {
        errors.push({ line: lineNo, message: `unterminated ${q} quote for "${key}"` });
        continue;
      }
      value = body.slice(0, close);
      if (q === '"') value = unescape(value);
    } else {
      const hash = rest.search(/\s#/);
      value = (hash === -1 ? rest : rest.slice(0, hash)).trim();
    }

    if (entries.has(key)) duplicates.push({ key, line: lineNo });
    entries.set(key, { value, line: lineNo });
  }

  return { entries, duplicates, errors };
}

function findClosingQuote(s, q) {
  for (let j = 0; j < s.length; j++) {
    if (s[j] === '\\' && q === '"') { j++; continue; }
    if (s[j] === q) return j;
  }
  return -1;
}

function unescape(s) {
  return s.replace(/\\([nrt"\\])/g, (_, c) => ({ n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\' })[c]);
}

function truncate(s, n = 40) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

module.exports = { parse };
