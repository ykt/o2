# Changelog

## 0.1 — search window

First designed surface. Everything below is new relative to `src/desktop/index.html`.

- Dark translucent window, 760px, Geist / Geist Mono, accent `#7cc3a2`.
- Grouped results with headers and counts (`Top hit`, `Applications`, `Workflows`, `Fallback`)
  instead of one flat list.
- Roomy 58px rows: tinted tile, title, subtitle, right-aligned action hint.
- Workflow rows show their step chain (`calc → copy`) and the parsed argument.
- Idle state shows recents and workflow keywords rather than an empty list.
- Footer with the config path, live result count and key hints.
- Config peek: read-only syntax-highlighted `config.json` with **Open in editor**.
- Large Type overlay, via the `large` keyword or `⌘L`.
- Selection follows the pointer; rows and window animate in.

### Requires core changes

- `display` step type in `src/core/types.ts` and the Ajv enum in `src/core/config.ts`.
- Search IPC results carry `group` and `kind`.

### Deferred

Light appearance · real app icons · file search · clipboard history · snippets · action panel ·
settings window.
