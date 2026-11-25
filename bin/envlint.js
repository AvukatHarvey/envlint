#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { check, toExample } = require('../src');
const pkg = require('../package.json');

let quietMode = false;

const HELP = `envlint v${pkg.version} — keep .env and .env.example in sync

Usage:
  envlint [check] [options]     compare .env against .env.example (default)
  envlint init [options]        generate .env.example from .env (values stripped)

Options:
  -e, --env <file>          env file to check          (default: .env)
  -x, --example <file>      template file               (default: .env.example)
  -o, --optional <keys>     comma separated keys allowed to be missing/empty
      --allow-extra         don't fail on keys missing from the example
      --allow-empty         don't fail on keys with empty values
      --json                machine-readable output
  -q, --quiet               print nothing; use only the exit code
      --force               (init) overwrite an existing example file
      --no-color            disable colors
  -h, --help                show this help
  -v, --version             show version

Exit codes: 0 = ok, 1 = problems found, 2 = usage / file error`;

function parseArgs(argv) {
  quietMode = argv.includes('--quiet') || argv.includes('-q');
  const args = { cmd: 'check', env: '.env', example: '.env.example', optional: [], quiet: quietMode, color: process.stdout.isTTY && !process.env.NO_COLOR };
  const take = (i) => {
    if (argv[i + 1] === undefined) fail(`missing value for ${argv[i]}`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case 'check': case 'init': args.cmd = a; break;
      case '-e': case '--env': args.env = take(i); i++; break;
      case '-x': case '--example': args.example = take(i); i++; break;
      case '-o': case '--optional': args.optional.push(...take(i).split(',').map((s) => s.trim()).filter(Boolean)); i++; break;
      case '--allow-extra': args.allowExtra = true; break;
      case '--allow-empty': args.allowEmpty = true; break;
      case '--json': args.json = true; break;
      case '-q': case '--quiet': args.quiet = true; break;
      case '--force': args.force = true; break;
      case '--no-color': args.color = false; break;
      case '-h': case '--help': if (!quietMode) console.log(HELP); process.exit(0);
      case '-v': case '--version': if (!quietMode) console.log(pkg.version); process.exit(0);
      default: fail(`unknown argument: ${a}\nRun "envlint --help" for usage.`);
    }
  }
  return args;
}

function fail(msg) {
  if (!quietMode) console.error(`envlint: ${msg}`);
  process.exit(2);
}

function read(file) {
  try {
    return fs.readFileSync(path.resolve(file), 'utf8');
  } catch (e) {
    fail(e.code === 'ENOENT' ? `file not found: ${file}` : e.message);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const c = (code, s) => (args.color ? `\x1b[${code}m${s}\x1b[0m` : s);

  if (args.cmd === 'init') {
    if (fs.existsSync(args.example) && !args.force) fail(`${args.example} already exists (use --force to overwrite)`);
    fs.writeFileSync(args.example, toExample(read(args.env)));
    if (!args.quiet) console.log(c(32, `✓ wrote ${args.example}`));
    return;
  }

  const result = check(read(args.env), read(args.example), args);

  if (args.json) {
    if (!args.quiet) console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  }

  if (result.ok) {
    if (!args.quiet) console.log(c(32, `✓ ${args.env} matches ${args.example}`));
    return;
  }

  const section = (title, items, color) => {
    if (args.quiet || !items.length) return;
    console.log(c(color, `${title} (${items.length}):`));
    for (const k of items) console.log(`  - ${k}`);
  };
  section(`Missing in ${args.env}`, result.missing, 31);
  section('Empty values', result.empty, 33);
  section(`Not in ${args.example}`, result.extra, 36);
  section('Duplicate keys', result.duplicates, 35);
  section(`Parse errors in ${args.env}`, result.errors.map((e) => `line ${e.line}: ${e.message}`), 31);
  section(`Duplicate keys in ${args.example}`, result.exampleDuplicates, 35);
  section(`Parse errors in ${args.example}`, result.exampleErrors.map((e) => `line ${e.line}: ${e.message}`), 31);
  process.exit(1);
}

main();
