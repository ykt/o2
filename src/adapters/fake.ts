import type { Adapter, AppRecord } from "../core/types.js";
export class FakeAdapter implements Adapter {
  launched: AppRecord[] = []; copied: string[] = []; opened: string[] = []; executions: { command: string; args: string[]; input: string }[] = []; stdout = new Map<string, string>();
  async launchApp(app: AppRecord) { this.launched.push(app); }
  async copy(text: string) { this.copied.push(text); }
  async openUrl(url: string) { this.opened.push(url); }
  async exec(command: string, args: string[], input: string) { this.executions.push({ command, args, input }); return { stdout: this.stdout.get(command) ?? input, stderr: "diagnostic" }; }
}
