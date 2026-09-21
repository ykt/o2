import { app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray, nativeImage, dialog, shell } from "electron";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, access, copyFile, mkdir } from "node:fs/promises";
import { ConfigStore } from "../core/config.js";
import { discoverMacApps } from "../adapters/catalog.js";
import { MacAdapter } from "../adapters/macos.js";
import { searchApps } from "../core/search.js";
import { calculate } from "../core/calculator.js";
import { dispatch, runWorkflow } from "../core/workflow.js";
const here = dirname(fileURLToPath(import.meta.url));
let window: BrowserWindow;
let tray: Tray;
let store: ConfigStore;
let active: AbortController | undefined;
let apps: Awaited<ReturnType<typeof discoverMacApps>> = [];
let quitting = false;
const adapter = new MacAdapter();
app.setName("o2");
const configPath = () => join(app.getPath("userData"), "workflows.json");
async function config() {
  await mkdir(app.getPath("userData"), { recursive: true });
  try { await access(configPath()); } catch { await copyFile(join(app.getAppPath(), "examples/config.json"), configPath()); }
  return JSON.parse(await readFile(configPath(), "utf8"));
}
function show() { window.show(); window.focus(); window.webContents.send("focus-query"); }
function checkQuery(query: unknown): string {
  if (typeof query !== "string" || query.length > 4096) throw new Error("Invalid query");
  return query;
}
async function results(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    const recent = ["Visual Studio Code", "Safari", "Spotify"].map(name => apps.find(item => item.name === name)).filter(Boolean).map(item => ({ ...item!, detail: item!.path, kind: "app", group: "Recent", hint: "⏎ open", tint: "#4aa3ff" }));
    const workflows = store.value.workflows.slice(0, 3).map(workflow => ({ id: workflow.id, name: workflow.title, detail: `${workflow.keyword} · ${workflow.steps.map(step => step.type).join(" → ")}`, kind: "workflow", group: "Workflows", hint: workflow.keyword, tint: "#7cc3a2" }));
    return [...recent, ...workflows];
  }
  const request = dispatch(trimmed, store.value);
  if (request.kind === "calc") return [{ id: "calculator", name: calculate(request.expression), detail: `${request.expression} · copies to clipboard`, kind: "calc", group: "Top hit", hint: "⏎ copy", tint: "#7cc3a2" }];
  if (request.kind === "workflow") {
    const workflow = store.value.workflows.find(item => item.keyword === request.keyword)!;
    return [{ id: workflow.id, name: workflow.title, detail: `${request.input || workflow.keyword} · ${workflow.steps.map(step => step.type).join(" → ")}`, kind: "workflow", group: "Top hit", hint: "⏎ run", tint: "#7cc3a2" }];
  }
  const matches = searchApps(apps, request.query).map(item => ({ ...item, detail: item.path, kind: "app", group: "Applications", hint: "⏎ open", tint: "#4aa3ff" }));
  const workflows = store.value.workflows.filter(item => item.keyword.includes(request.query.toLocaleLowerCase())).map(workflow => ({ id: workflow.id, name: workflow.title, detail: `${workflow.keyword} · ${workflow.steps.map(step => step.type).join(" → ")}`, kind: "workflow", group: "Workflows", hint: workflow.keyword, tint: "#7cc3a2" }));
  return [...matches, ...workflows, { id: "web-search", name: `Search the web for “${request.query}”`, detail: "Open a browser search", kind: "web", group: "Fallback", hint: "⏎ open", tint: "#9aa8a1" }];
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => { if (window) show(); });
  app.whenReady().then(async () => {
    try { store = new ConfigStore(await config()); }
    catch (error) { store = new ConfigStore({ version: 1, workflows: [] }); dialog.showErrorBox("Workflow configuration", String(error)); }
    apps = await discoverMacApps();
    window = new BrowserWindow({ title: "o2", width: 680, height: 450, minWidth: 480, minHeight: 320, show: false, backgroundColor: "#f6f8f7", webPreferences: { preload: join(here, "preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true } });
    window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    window.webContents.on("will-navigate", event => event.preventDefault());
    window.on("close", event => { if (!quitting) { event.preventDefault(); window.hide(); } });
    await window.loadFile(join(here, "index.html"));
    show();
    tray = new Tray(nativeImage.createEmpty()); tray.setTitle("o2"); tray.setToolTip("o2");
    const menu = [
      { label: "Open o2", click: show },
      { label: "Edit workflows", click: () => { void shell.openPath(configPath()); } },
      { label: "Reload workflows", click: async () => {
        try { const errors = store.reload(await config()); if (errors.length) throw new Error(errors.join("\n")); apps = await discoverMacApps(); }
        catch (error) { dialog.showErrorBox("Workflow configuration", String(error)); }
      } },
      { label: "Quit o2", click: () => app.quit() }
    ];
    tray.setContextMenu(Menu.buildFromTemplate(menu));
    Menu.setApplicationMenu(Menu.buildFromTemplate([{ label: "o2", submenu: menu }, { role: "editMenu" }]));
    if (!globalShortcut.register("Alt+Space", show)) window.webContents.send("notice", "Option+Space is in use. Open o2 from the menu bar.");
  });
  app.on("activate", () => { if (window) show(); });
}
app.on("before-quit", () => { quitting = true; active?.abort(); });
app.on("will-quit", () => globalShortcut.unregisterAll());
ipcMain.handle("search", async (_event, query: unknown) => results(checkQuery(query)));
ipcMain.handle("configPeek", async () => ({ path: configPath(), json: JSON.stringify(store.value, null, 2), workflows: store.value.workflows.length }));
ipcMain.handle("openEditor", async () => shell.openPath(configPath()));
ipcMain.handle("dismiss", () => { if (active) active.abort(); else window.hide(); });
ipcMain.handle("execute", async (_event, query: unknown, selectedId: unknown) => {
  const text = checkQuery(query);
  if (active) throw new Error("A workflow is already running");
  const available = await results(text);
  if (!available.find(item => item.id === selectedId)) throw new Error("Select a result first");
  const controller = new AbortController(); active = controller;
  try {
    if (selectedId === "web-search") { await adapter.openUrl(`https://www.google.com/search?q=${encodeURIComponent(text)}`); window.hide(); return { output: `Opened web search for ${text}` }; }
    const request = dispatch(text, store.value);
    if (request.kind === "workflow") { const workflowResult = await runWorkflow(store.value, request.keyword, request.input, adapter, { signal: controller.signal }); return { ...workflowResult, display: store.value.workflows.find(item => item.keyword === request.keyword)?.steps.some(step => step.type === "display") ? request.input : undefined }; }
    if (request.kind === "calc") { const output = calculate(request.expression); await adapter.copy(output); return { output, message: "Copied to clipboard" }; }
    const match = apps.find(item => item.id === selectedId);
    if (!match) throw new Error("Application is no longer available");
    await adapter.launchApp(match); window.hide(); return { output: match.name };
  } finally { active = undefined; }
});
