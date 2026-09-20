import { app, BrowserWindow, globalShortcut, ipcMain, Menu, Tray, nativeImage } from "electron";
import { join } from "node:path";
import { readFile, access, copyFile } from "node:fs/promises";
import { ConfigStore } from "../core/config.js";
import { discoverMacApps } from "../adapters/catalog.js";
import { MacAdapter } from "../adapters/macos.js";
import { searchApps } from "../core/search.js";
import { dispatch, runWorkflow } from "../core/workflow.js";
let window: BrowserWindow | undefined; let tray: Tray | undefined; let store: ConfigStore;
const adapter = new MacAdapter();
async function config() { const path = join(app.getPath("userData"), "workflows.json"); try { await access(path); } catch { await copyFile(join(process.cwd(), "examples/config.json"), path); } return JSON.parse(await readFile(path, "utf8")); }
function createWindow() { window = new BrowserWindow({ width: 640, height: 420, show: false, webPreferences: { preload: join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false } }); window.loadFile(join(__dirname, "index.html")); window.on("blur", () => window?.hide()); }
app.whenReady().then(async () => { try { store = new ConfigStore(await config()); } catch { store = new ConfigStore({ version: 1, workflows: [] }); } createWindow(); tray = new Tray(nativeImage.createEmpty()); tray.setContextMenu(Menu.buildFromTemplate([{ label: "Reopen", click: () => window?.show() }, { label: "Reload workflows", click: async () => { try { store.reload(await config()); } catch {} } }, { type: "separator" }, { label: "Quit", click: () => app.quit() }])); const registered = globalShortcut.register("Alt+Space", () => window?.show()); if (!registered) console.error("Global hotkey Alt+Space could not be registered"); });
app.on("will-quit", () => globalShortcut.unregisterAll());
ipcMain.handle("search", async (_event, query: unknown) => searchApps(await discoverMacApps(), String(query ?? "")));
ipcMain.handle("execute", async (_event, query: unknown) => { const result = dispatch(String(query ?? ""), store.value); if (result.kind === "workflow") return runWorkflow(store.value, result.keyword, result.input, adapter); if (result.kind === "app") { const apps = await discoverMacApps(); const match = searchApps(apps, result.query)[0]; if (!match) throw new Error("application not found"); await adapter.launchApp(match); return { output: match.name, trace: [] }; } return { output: result.expression, trace: [] }; });
