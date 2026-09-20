# AGENTS.md — designs/

Instructions for coding agents working on O2's UI. Repo-wide rules in the root `README.md`,
`PLAN.md` and `STATUS.md` still apply.

## What this folder is

`designs/<version>/` holds the UI source of truth for that version: a runnable prototype plus a
spec. Design decisions live here; `src/desktop/` implements them. Current version: `0.1`.

## Order of authority

1. `designs/0.1/SPEC.md` — resolved values, behaviour, keyboard map. Cite it in PRs.
2. `designs/0.1/O2 Launcher.dc.html` — the prototype. Use it when the spec is ambiguous; read the
   JS at the bottom for ranking and dispatch behaviour.
3. Your own judgement — only for things neither covers, and say so in the PR body.

Never re-derive a colour, size or animation curve by eye from a screenshot. Every value is written
down. If a value you need is missing, add it to `SPEC.md` in the same change.

## Rules

- **Do not edit the prototype to match the implementation.** It flows the other way. If the
  implementation must diverge (platform constraint, perf), change `SPEC.md` and note why in
  `CHANGELOG.md`.
- **The prototype is not production code.** It is a browser-only Design Component with a fake app
  catalog and an inline calculator. Do not copy its JS into `src/`. Port the *values* and the
  *behaviour*; use the real `src/core` functions for logic.
- **Keep `src/core` platform-independent.** UI work belongs in `src/desktop/`.
- **Security invariants are not negotiable.** Renderer keeps `contextIsolation`, the preload API
  stays narrow, `shell: false` on all subprocesses, HTTP(S)-only URLs, no `eval` in the arithmetic
  path, side effects only on explicit Enter. A UI change that needs a new IPC call must add a
  validated channel, not widen an existing one.
- **Config is file-based by design.** The app renders config read-only and opens `$EDITOR` to
  change it. Do not build in-app config editing.
- **Every config shape change touches three places**: `src/core/types.ts`, the Ajv schema in
  `src/core/config.ts`, and `examples/config.json`. Add a test in `tests/core.test.ts`.
- **Run before opening a PR**: `corepack npm run typecheck`, `corepack npm test`,
  `corepack npm run simulate`. UI contract changes also touch `tests/ui-contract.test.ts`.
- **Do not claim macOS verification from Linux.** Signing, notarization, permissions and Intel
  runtime cannot be checked there — say so rather than asserting success.

## Starting a new design version

Copy the previous folder to `designs/<next>/`, keep `SPEC.md` complete (not a diff), and record
what changed in that version's `CHANGELOG.md`. Leave older folders untouched.

## Implementing 0.1

Work in this order; each step is independently shippable.

1. Window chrome, search bar, fonts, colours — replaces the inline `<style>` in
   `src/desktop/index.html`.
2. Result rows at the new sizing, keeping today's IPC payload.
3. Grouping: add `group` and `kind` to search results, render headers.
4. Ranking: port `score()` from the prototype into `src/core/search.ts` with tests.
5. Footer, status line, result counts.
6. Config peek + **Open in editor**.
7. Large Type: `display` step type, `⌘L`, overlay.
