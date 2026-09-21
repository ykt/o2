import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("launcher", {
  search: (query: string) => ipcRenderer.invoke("search", query),
  execute: (query: string, id: string) => ipcRenderer.invoke("execute", query, id),
  dismiss: () => ipcRenderer.invoke("dismiss"),
  configPeek: () => ipcRenderer.invoke("configPeek"),
  openEditor: () => ipcRenderer.invoke("openEditor"),
  onFocus: (callback: () => void) => ipcRenderer.on("focus-query", callback),
  onNotice: (callback: (message: string) => void) => ipcRenderer.on("notice", (_event, message: string) => callback(message))
});
