# o2

A compact Alfred-like `o2` launcher core with app search, safe arithmetic, and linear JSON workflows. It is designed for macOS and developed with Linux simulations; it has no hosted backend or account system.

## Development

```sh
corepack npm install
corepack npm test
corepack npm run typecheck
corepack npm run simulate
```

The local workflow file is copied to Electron's user-data directory on first launch. Edit `workflows.json`, then use the tray menu's **Reload workflows**. Each workflow passes text from one step to the next. `exec` uses a structured command plus argument array and never invokes a shell.

## Packaging

Run `corepack npm start` on macOS for the Electron shell. A distributable signed macOS package still requires a macOS build/signing host (for example, Electron Forge or electron-builder can be added there). Linux checks cannot prove macOS permissions, global hotkey registration, application metadata, clipboard, or signing behavior.

## Safety

Only explicit Enter execution performs side effects. Search is read-only. The renderer has context isolation and receives only validated search/execute IPC calls. Workflow URLs are limited to HTTP(S), arithmetic has no `eval`, and subprocesses run with `shell: false`.
