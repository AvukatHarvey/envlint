# envlint

> Keep your `.env` in sync with `.env.example` — catch missing, empty and extra variables **before** they break production.

[![CI](https://github.com/AvukatHarvey/envlint/actions/workflows/ci.yml/badge.svg)](https://github.com/AvukatHarvey/envlint/actions/workflows/ci.yml)
![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)

Every team has hit this: someone adds `STRIPE_SECRET` to the code, forgets to tell anyone, and the next deploy crashes. `envlint` is a tiny, **zero-dependency** CLI that compares your env file against its template and fails loudly when they drift apart.

```
$ npx envlint
Missing in .env (1):
  - STRIPE_SECRET
Empty values (1):
  - DATABASE_URL
Not in .env.example (1):
  - OLD_API_KEY
```

## Features

- 🔍 Detects **missing**, **empty**, **extra** and **duplicate** keys, plus syntax errors in both files
- 🚦 CI-friendly exit codes (`0` ok, `1` problems, `2` usage/file error) and `--json` output
- 🧾 `envlint init` generates `.env.example` from `.env` with all values stripped (comments kept)
- 🧩 Understands real-world `.env` syntax: `export`, quotes, multi-line values, inline comments, CRLF
- 📦 No dependencies, Node.js ≥ 18, usable as a library too

## Install

```bash
npm install --save-dev envlint
```

Or run it without installing:

```bash
npx envlint
```

## Usage

```bash
envlint                                  # check .env against .env.example
envlint -e .env.production -x .env.example
envlint --optional SENTRY_DSN,DEBUG      # these may be missing or empty
envlint --allow-extra --allow-empty      # only care about missing keys
envlint --json                           # machine-readable output
envlint init                             # create .env.example from .env
```

| Option | Description |
| --- | --- |
| `-e, --env <file>` | env file to check (default `.env`) |
| `-x, --example <file>` | template file (default `.env.example`) |
| `-o, --optional <keys>` | comma-separated keys allowed to be missing/empty |
| `--allow-extra` | don't fail on keys that aren't in the template |
| `--allow-empty` | don't fail on empty values |
| `--json` | print the result as JSON |
| `--force` | (`init`) overwrite an existing template |
| `--no-color` | disable colors (also respects `NO_COLOR`) |

### In `package.json`

```json
{
  "scripts": {
    "predev": "envlint",
    "prestart": "envlint"
  }
}
```

### In CI (GitHub Actions)

```yaml
- run: npx envlint -e .env.ci --allow-extra
```

### As a library

```js
const { parse, check, toExample } = require('envlint');

const result = check(fs.readFileSync('.env', 'utf8'), fs.readFileSync('.env.example', 'utf8'), {
  optional: ['SENTRY_DSN'],
});
// { ok, missing, empty, extra, duplicates, errors, exampleDuplicates, exampleErrors }
```

## Contributing

Contributions are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the [roadmap](ROADMAP.md) for ideas, many of which are great first issues.

## Türkçe

`envlint`, `.env` dosyanızı `.env.example` şablonuyla karşılaştıran, bağımlılıksız küçük bir komut satırı aracıdır. Eksik, boş, fazla ve tekrarlanan değişkenleri bulur; CI'da sorun varsa build'i durdurur. `envlint init` ile mevcut `.env` dosyanızdan değerleri silinmiş bir `.env.example` üretebilirsiniz. Katkılarınızı bekliyoruz — [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına göz atın.

## License

[MIT](LICENSE)
