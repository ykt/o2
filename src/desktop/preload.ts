import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("launcher", { search: (query: string) => ipcRenderer.invoke("search", query), execute: (query: string) => ipcRenderer.invoke("execute", query) });
