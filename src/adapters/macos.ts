import { spawn } from "node:child_process";
import { execFile } from "node:child_process";
import type { Adapter, AppRecord } from "../core/types.js";
export class MacAdapter implements Adapter {
  async launchApp(app: AppRecord) { await new Promise<void>((resolve, reject) => execFile("open", ["-a", app.path], (error) => error ? reject(error) : resolve())); }
  async copy(text: string) { const child = spawn("pbcopy", [], { stdio: ["pipe", "ignore", "pipe"] }); child.stdin.end(text); await new Promise<void>((resolve, reject) => { child.on("error", reject); child.on("close", (code) => code ? reject(new Error(`pbcopy exited ${code}`)) : resolve()); }); }
  async openUrl(url: string) { await new Promise<void>((resolve, reject) => execFile("open", [url], (error) => error ? reject(error) : resolve())); }
  async exec(command: string, args: string[], input: string, timeoutMs: number, signal?: AbortSignal) { const child = spawn(command, args, { shell: false, stdio: ["pipe", "pipe", "pipe"], signal }); child.stdin.end(input); let stdout = "", stderr = ""; child.stdout.on("data", (chunk) => { stdout += chunk; }); child.stderr.on("data", (chunk) => { stderr += chunk; }); const timer = setTimeout(() => child.kill("SIGTERM"), timeoutMs); return await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => { child.on("error", reject); child.on("close", (code) => { clearTimeout(timer); if (code) reject(new Error(`command exited ${code}: ${stderr.slice(0, 500)}`)); else resolve({ stdout, stderr }); }); }); }
}
