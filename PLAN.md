# Simple Launcher plan

## Scope

Build a small Alfred-like desktop launcher with application search, a constrained calculator, and linear JSON text workflows. The core is platform-independent TypeScript; Electron is a thin macOS-oriented shell. Linux is used for deterministic simulation only.

## Decisions

- One package with `src/core`, `src/adapters`, `src/desktop`, `tests`, and `examples`.
- Node's `child_process.spawn` with `shell: false`; workflow configuration is local JSON and validated with Ajv/JSON Schema.
- Electron renderer uses context isolation and a narrow preload API.
- Default hotkey is Alt+Space; macOS packaging/signing and native permission smoke checks remain platform work.

## Remote execution

Implementation is authorized on Bob under `/opt/labs/simple-launcher`. The installed Codex binary is present at `/home/ykt/.local/bin/codex`; no detached worker is started by this project because the implementation is completed in this supervised task. tmux is available for later bounded packaging jobs.
