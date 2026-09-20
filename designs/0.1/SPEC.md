# O2 0.1 — UI spec

All values are literal. Where the prototype computes a style in JS, the number below is the
resolved value. Dark appearance only in 0.1.

## Window

- Width `760px`, centred, corner radius `18px`, clipped content.
- Background `rgba(16,23,19,.86)` with `backdrop-filter: blur(40px) saturate(180%)`.
- Border `1px solid rgba(255,255,255,.09)`.
- Shadow `0 40px 90px -20px rgba(0,0,0,.75), 0 0 0 1px rgba(0,0,0,.4)`.
- Height is content-driven: bar + results (max `430px`, scrolls) + footer `46px`.
- Entry animation: `opacity 0→1`, `translateY(-10px)→0`, `scale(.985)→1`, `340ms cubic-bezier(.2,.9,.25,1)`.

## Colour

| Role | Value |
| --- | --- |
| Accent | `#7cc3a2` |
| Ink | `#e8efea` (input `#f0f5f2`) |
| Ink secondary | `rgba(232,239,234,.45)` |
| Ink tertiary / hints | `rgba(232,239,234,.32)` |
| Group header | `rgba(232,239,234,.34)` |
| Hairlines | `rgba(255,255,255,.06–.09)` |
| Row selected | `rgba(255,255,255,.075)` + `inset 3px 0 0 -1px` accent |
| Backdrop | `radial-gradient(120% 80% at 50% -10%, #17241d, #0b100d 62%)` |

Result tiles are tinted per item at `tint + 1f` background, `tint + 2e` border, `tint` glyph.
Tints in use: `#4aa3ff` blue, `#c86bd8` purple, `#7cc3a2` green, `#e0b23c` yellow, `#e8734a`
orange, `#e05a5a` red, `#9aa8a1` grey (default).

## Type

Geist (UI) and Geist Mono (paths, keys, counts, status).

| Element | Style |
| --- | --- |
| Wordmark `o2` | 600 · 34px · `-.045em` · accent |
| Query input | 400 · 26px · `-.015em` |
| Row title | 450 · 15.5px |
| Row subtitle | 400 · 12.5px |
| Group header | 500 · 10.5px · uppercase · `.1em` |
| Row hint, footer | 400 · 11–11.5px mono |
| Large Type | 300 · clamp, see below |

## Search bar

Three treatments; `hairline` is the 0.1 default.

- **hairline** — wordmark, then input, `18px 20px` padding, `1px` bottom hairline.
- **glass** — `40px` rounded accent-tinted mark tile, bar inset `14px` with its own
  `rgba(255,255,255,.05)` fill and `14px` radius.
- **token** — mark slot becomes a chip showing the detected mode (`App`, `Calculator`, `Workflow`,
  `Web`) at `14px` mono on `accent + 1f`.

In `hairline` and `glass` the mode label sits right-aligned at 11px mono uppercase, fading in only
when there is a query. Caret is accent-coloured. Placeholder: `Search apps, run a workflow, do math`.

## Results

Flat list of rows preceded by group headers. Header shows label, a 1px rule filling the remaining
width, and the group count in mono. Groups, in order:

1. `Top hit` / `Workflow` / `Calculator` — exactly one row, whichever the dispatch resolved to
2. `Applications` — remaining app matches, ranked
3. `Workflows` — keyword matches not already fired, shown as previews (`calc 20 * 3 · calc → copy`)
4. `Fallback` — always present: *Search the web for “…”*

Empty query shows `Recent` (3) and `Workflows` (3).

Row: height `58px`, horizontal padding `14px`, radius `12px`, gap `14px`. Tile `38×38`, radius
`10px`. Title, then subtitle at `3px` offset; both truncate with ellipsis. Right-aligned hint
(`⏎ open`, `⏎ run`, `⏎ copy`, or the keyword) at `rgba(…,.22)`, rising to `.6` when selected.
Hover moves selection; rows fade in `180ms`.

Ranking (prototype `score()`, port as-is): prefix match `1000 − len`, initials match `900 − len`,
word-start match `780 − len`, subsequence `520 − gaps`, no match `−1`.

## Footer

Height `46px`, top hairline, `rgba(0,0,0,.18)` fill. Left: accent dot + `~/.config/o2/config.json`
as a button (hover `rgba(255,255,255,.06)`) — opens the config peek. Right, mono `11px`:
result count · `⏎ run` · `⌘L large` · `⌘, config`.

## Config peek

Panel below the window, same width, radius `14px`, animates height/opacity. Header: `config.json`,
subline `N workflows · validated · read-only here`, buttons **Open in editor** (accent outline) and
**Close**. Body: syntax-highlighted read-only JSON, `12px/1.85` mono, max height `300px`.
Keys `#7fb0d6`, strings `#7cc3a2`, numbers `#d8a657`, punctuation `rgba(232,239,234,.55)`.

Editing always leaves the app: **Open in editor** shells out to `$EDITOR` / `open -t`. The app
never writes the file. On regaining focus, re-validate against the Ajv schema and, on failure, show
the validator message in the footer in `#e05a5a` instead of the result count.

## Large Type

Full-screen overlay, `z-index 50`, `rgba(6,10,8,.93)` + `blur(24px)`, fade `160ms`.
Text centred, 300 weight, `-.035em`, `#f3f8f5`, `overflow-wrap: anywhere`, selectable:

| Text length | Size |
| --- | --- |
| ≤ 18 chars | `clamp(56px, 14vw, 180px)` |
| 19–48 | `clamp(40px, 9vw, 116px)` |
| > 48 | `clamp(28px, 5.5vw, 68px)` |

Below it, `esc or click to dismiss` at 12px mono `rgba(243,248,245,.32)`.

Two entry points: the `large` keyword workflow (`{"type":"display"}` step), and `⌘L`, which
displays the current query — or, when a calculator result is selected, that result. Empty input
shows the footer message `Large Type needs some text`. Any key, Esc, or a click dismisses; the
overlay swallows the key that dismissed it.

## Keyboard

| Key | Action |
| --- | --- |
| `⌥Space` | Toggle window (existing global hotkey) |
| `↑` `↓` | Move selection, scroll to keep row in view (8px margin) |
| `⏎` | Run the selected row |
| `⌘1`–`⌘9` | Run the *n*th row |
| `⌘L` | Large Type |
| `⌘,` | Toggle config peek |
| `Esc` | Clear query and close peek; if Large Type is open, close that first |

## Status line

The footer count doubles as the status line. Running: `Running…`. Result messages replace it for
`2200ms` (`Opened Safari`, `14 copied to clipboard`, `Ran Search GitHub → electron`), shown in the
prototype as an accent pill under the window — in the app, render them inline in the footer.
Errors use `#e05a5a`.

## Out of scope for 0.1

Light appearance, file search, clipboard history, snippets, an action panel, a settings window,
app icons from the bundle (0.1 uses letter tiles — real `NSWorkspace` icons are a 0.2 item).
