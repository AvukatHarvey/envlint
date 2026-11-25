# Contributing to envlint

Thanks for your interest! envlint aims to stay **small, fast and dependency-free**.

## Getting started

```bash
git clone https://github.com/AvukatHarvey/envlint.git
cd envlint
npm test
```

No `npm install` needed — there are no dependencies. Tests use the built-in `node:test` runner.

## Project layout

```
bin/envlint.js   CLI (argument parsing + output)
src/parse.js     .env parser
src/check.js     comparison logic and example generation
test/            unit and CLI tests
```

## Guidelines

1. **Open an issue first** for anything bigger than a small fix, so we can agree on the approach.
2. **No runtime dependencies.** Node.js ≥ 18 built-ins only.
3. **Add tests** for every bug fix and feature.
4. Keep the CLI output readable and the `--json` shape backwards compatible.
5. Update `README.md` when you add or change an option, and add a line under `[Unreleased]` in `CHANGELOG.md`.

Looking for something to work on? Check [ROADMAP.md](ROADMAP.md) and issues labelled `good first issue`.

## Releasing (maintainers)

1. Move the `[Unreleased]` entries in `CHANGELOG.md` under a new `## [x.y.z] - YYYY-MM-DD` heading and update the links at the bottom.
2. Bump `"version"` in `package.json` to the same `x.y.z`.
3. Push to `main`. The **Release** workflow tags the commit and creates the GitHub Release from the changelog.
