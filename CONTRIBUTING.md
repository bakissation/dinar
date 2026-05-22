# Contributing to @bakissation/dinar

Thanks for your interest! This is a small, dependency-free TypeScript money type — it's used in **payment and tax math**, so correctness and backward compatibility matter more than features.

> **This project is maintainer-led.** **Bug reports are very welcome** (open an issue). If you'd like to contribute a fix or feature, please **open an issue first** so we can agree on the approach. The branching/PR mechanics below apply to changes that have been agreed.

## Branching model

This repo uses a three-tier promotion flow:

```
your fork ──PR──▶ dev ──▶ staging ──▶ main (releases tagged here)
                  ▲         (maintainer-promoted)
            contributors
            target dev
```

- **Open all PRs against `dev`.** PRs to `staging` or `main` from contributors will be redirected.
- The maintainer promotes `dev → staging → main` and cuts releases from `main`.
- `dev`, `staging`, and `main` are all protected: CI must pass and changes land via pull request.
- **Merges use merge commits** (squash & rebase are disabled), so keep each branch's commits clean Conventional Commits — they land individually and drive the release version.

## Dev setup

```bash
git clone https://github.com/bakissation/dinar.git
cd dinar
npm install
npm run build
npm test
```

No environment or credentials are needed — the library is pure and the tests are fully deterministic.

## Before you open a PR

All of these must pass (this is exactly what CI runs):

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

## Conventions

- **Backward compatibility is sacred.** Never remove/rename exports, change signatures, change rounding behaviour, or change error codes/class names without a **major** version bump. Add new optional params and new methods alongside existing ones; new behaviour is opt-in.
- **The centimes invariant is the whole point:** every amount is an integer number of centimes. Never introduce floating-point amounts into internal state — do integer math and round explicitly. New parsing/formatting must stay float-safe.
- **Type safety:** strict TypeScript, explicit return types on public APIs, no `any`.
- **Errors:** throw `MoneyError` with a stable `code`; never throw bare strings.
- **Tests:** cover construction, arithmetic, rounding modes, allocation (including remainder distribution), parsing edge cases, and formatting. Keep formatting assertions resilient to the platform's `Intl` separators.
- **One concern per file**; public API is re-exported from `src/index.ts`.

## Commits & versioning

Versioning and releases are **fully automated** by [semantic-release](https://semantic-release.gitbook.io/) from your commit messages — **do not bump `package.json` or edit `CHANGELOG.md` by hand.** Just write good [Conventional Commits](https://www.conventionalcommits.org/):

- `fix:` → patch, `feat:` → minor, `feat!:` / `BREAKING CHANGE:` → major. `docs:`/`chore:`/`refactor:`/`test:` don't trigger a release.
- On merge, a release is cut automatically per channel: **`dev` → `x.y.z-alpha.n`**, **`staging` → `x.y.z-beta.n`**, **`main` → `x.y.z`** (stable). Release notes are generated into [GitHub Releases](https://github.com/bakissation/dinar/releases).
- `package.json` `version` is a managed placeholder (`0.0.0-semantically-released`) — the git tag / GitHub Release is the source of truth.

## PR checklist

- [ ] Targets `dev`
- [ ] `lint`, `typecheck`, `build`, `test` all pass
- [ ] Conventional commit messages
- [ ] Backward compatibility maintained (or a `feat!:` major is intended)
- [ ] No manual version bump / CHANGELOG edit (automated from your commits)
- [ ] Internal state stays integer centimes (no floating-point amounts)
