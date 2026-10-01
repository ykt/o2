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

Download a DMG at https://app.ykthalib.com/o2/, open it, and drag o2 to Applications. Launch o2, then use Option+Space to reopen it. Type an app name, an expression such as `2 + 3 * 4`, or `calc 20 * 3`. Arrow keys select a result; Enter opens or executes it. Calculator results are copied to the clipboard. The menu bar provides Edit workflows, Reload workflows, and Quit.

Version 0.1.2 adds the design 0.1 search window, grouped results, config peek, and Large Type. It is an ad-hoc signed preview, not Apple Developer ID signed or notarized. If macOS blocks a trusted download, use System Settings > Privacy & Security > Open Anyway after attempting to open it. Do not disable Gatekeeper.

Build both Apple silicon and Intel DMGs on macOS with `npm ci` then `npm run dist:mac`. Artifacts are written to `release/`. The package includes the HTML, CommonJS sandbox preload, default workflow config, and application icon. No Node.js installation is needed to run the downloaded app. The Apple silicon package was smoke-tested on macOS; the Intel package was built but its runtime has not been tested on an Intel Mac.

Run `node scripts/smoke.mjs` after `npm run build` for native Electron checks, or set `O2_EXECUTABLE` to the packaged app's executable. The smoke check uses an isolated temporary profile. Developer ID signing and notarization require your own Apple credentials and a corresponding build configuration change.

## Safety

Only explicit Enter execution performs side effects. Search is read-only. The renderer has context isolation and receives only validated search/execute IPC calls. Workflow URLs are limited to HTTP(S), arithmetic has no `eval`, and subprocesses run with `shell: false`.
