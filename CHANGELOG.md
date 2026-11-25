# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed
- README: install and run envlint straight from GitHub (`github:AvukatHarvey/envlint`); the package is not published on npm.
- Release workflow creates tags and GitHub Releases automatically from `CHANGELOG.md`.

## [0.1.1] - 2026-11-25

### Fixed
- **Security:** `envlint init` no longer copies the content of multi-line values into `.env.example`. Lines starting with `#` inside a quoted value (e.g. a private key) were treated as comments and could leak secrets.
- Lines swallowed by an unterminated quote are no longer copied by `envlint init`.
- Parse errors and duplicate keys in the example file are now reported (`exampleErrors`, `exampleDuplicates`) instead of silently passing.
- `npm test` now works on Windows.

### Changed
- CI runs on Linux, Windows and macOS with Node.js 18, 20, 22 and 24.

## [0.1.0] - 2026-11-25

### Added
- `envlint` / `envlint check`: compare `.env` against `.env.example` and report missing, empty, extra and duplicate keys and parse errors.
- `envlint init`: generate `.env.example` from `.env` with values stripped.
- Options: `--env`, `--example`, `--optional`, `--allow-extra`, `--allow-empty`, `--json`, `--force`, `--no-color`.
- Programmatic API: `parse`, `check`, `toExample`.

[Unreleased]: https://github.com/AvukatHarvey/envlint/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/AvukatHarvey/envlint/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/AvukatHarvey/envlint/commit/e5148df
