export type AppRecord = { name: string; path: string; id: string; icon?: string };
export type Step = { type: "text" | "calc" | "exec" | "copy" | "openUrl" | "display"; value?: string; expression?: string; command?: string; args?: string[]; timeoutMs?: number };
export type Workflow = { id: string; keyword: string; title: string; steps: Step[] };
export type Config = { version: 1; workflows: Workflow[] };
export type Adapter = { launchApp(app: AppRecord): Promise<void>; copy(text: string): Promise<void>; openUrl(url: string): Promise<void>; exec(command: string, args: string[], input: string, timeoutMs: number, signal?: AbortSignal): Promise<{ stdout: string; stderr: string }> };
