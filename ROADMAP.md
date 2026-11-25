# Roadmap

Ideas that would make envlint more useful. Pick one, open an issue to say you're on it, and send a PR!

## Good first issues
- [ ] `--quiet` flag: print nothing, only set the exit code
- [ ] `--ignore <keys>`: skip keys completely (both missing and extra)
- [ ] Show line numbers for empty/duplicate keys in the human-readable output
- [ ] Support `envlint.config.json` / `"envlint"` field in `package.json` for default options
- [ ] Windows-friendly `npm test` script (avoid shell glob)

## Bigger features
- [ ] Type hints in the example file, e.g. `PORT= # @type number`, `DEBUG= # @type boolean`, `MODE= # @enum dev,prod`
- [ ] `envlint sync`: append missing keys from the template to `.env` interactively
- [ ] Check several env files at once (`-e .env.staging -e .env.production`)
- [ ] Variable expansion awareness (`URL=${HOST}:${PORT}`)
- [ ] Ready-made GitHub Action (`uses: AvukatHarvey/envlint@v1`)
- [ ] Pre-commit hook recipe (husky / lefthook / pre-commit)
- [ ] Warn when a `.env` file is tracked by git
