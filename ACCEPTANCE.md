# Acceptance checklist

The deterministic suite covers A01–A16 in `tests/core.test.ts` and the UI state/hotkey contract A17–A18 in `tests/ui-contract.test.ts`. Native macOS install, permission, catalog, launch, clipboard, hotkey and quit checks are intentionally marked not-run on Linux.

- [x] A01–A06 search and calculator behavior
- [x] A07–A08 workflow schema/reload behavior
- [x] A09–A14 pipeline, safety, URL, and dry-run behavior
- [x] A15–A16 cancellation/dispatch boundaries
- [x] A17–A18 UI state and listener lifecycle contract
- [ ] macOS packaging/signing/native smoke checks (requires macOS)
