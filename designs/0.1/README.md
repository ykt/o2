# O2 launcher — design 0.1

Reference implementation of the O2 window UI. Open `O2 Launcher.dc.html` in a browser; it is
self-contained apart from the Google Fonts link and a sibling `support.js` runtime. It is a
**design prototype**, not production code — read it for layout, sizing, states and behaviour, then
implement in `src/desktop/`.

Contents:

- `O2 Launcher.dc.html` — interactive prototype (typeable, keyboard-driven)
- `SPEC.md` — visual and behavioural spec, the source of truth for implementation
- `CHANGELOG.md` — what 0.1 covers and what is deliberately out of scope

## What 0.1 covers

Single surface: the search window. Search bar, grouped results, footer, config peek, Large Type
overlay. No separate settings window, no clipboard history, no snippets.

## Mapping to the existing codebase

| Design element | Existing code |
| --- | --- |
| Query dispatch order (workflow → calc → app) | `src/core/workflow.ts` `dispatch()` |
| Calculator row | `src/core/calculator.ts` |
| Workflow rows, step chain display | `src/core/workflow.ts`, `examples/config.json` |
| Application rows | `src/adapters/catalog.ts` |
| Window markup and styles to replace | `src/desktop/index.html`, `src/desktop/renderer.js` |
| Config peek contents | `examples/config.json`, schema in `src/core/config.ts` |

## Two things 0.1 needs from the core

1. **`display` step type** — Large Type. Add `"display"` to the step `type` enum in the Ajv schema
   (`src/core/config.ts`) and to `Step["type"]` (`src/core/types.ts`). In `runWorkflow` it is a
   no-op on `input` that signals the renderer to show the overlay; it must not mutate the value, so
   later steps (e.g. `copy`) still see the same text.
2. **Result grouping in the search IPC payload** — each result needs a `group` label and a stable
   `kind` (`app` | `calc` | `workflow` | `web`) so the renderer can render headers without
   re-deriving intent. See SPEC § Results.
