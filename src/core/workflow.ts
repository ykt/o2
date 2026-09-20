import { calculate } from "./calculator.js";
import { isCalculationQuery } from "./calculator.js";
import type { Adapter, Config, Step } from "./types.js";

export type Trace = { index: number; type: string; input: string; output?: string; error?: string };
function template(value: string | undefined, input: string) { return (value ?? input).replace("{{input}}", input); }
function url(value: string): URL { const parsed = new URL(value); if (!/^https?:$/.test(parsed.protocol)) throw new Error("only http/https URLs are allowed"); return parsed; }
export async function runWorkflow(config: Config, keyword: string, initial: string, adapter: Adapter, options: { signal?: AbortSignal; dryRun?: boolean; } = {}): Promise<{ output: string; trace: Trace[] }> {
  const workflow = config.workflows.find((item) => item.keyword === keyword); if (!workflow) throw new Error(`unknown workflow: ${keyword}`);
  let input = initial.trim(); const trace: Trace[] = [];
  for (let index = 0; index < workflow.steps.length; index++) {
    if (options.signal?.aborted) throw new Error(`workflow ${workflow.id} cancelled`);
    const step: Step = workflow.steps[index]; const before = input;
    try {
      if (step.type === "text") input = template(step.value, input);
      else if (step.type === "calc") input = calculate(template(step.expression, input));
      else if (step.type === "copy") { if (!options.dryRun) await adapter.copy(input); }
      else if (step.type === "openUrl") { const parsed = url(template(step.value, input)); if (!options.dryRun) await adapter.openUrl(parsed.toString()); }
      else if (step.type === "exec") { const result = options.dryRun ? { stdout: input, stderr: "" } : await adapter.exec(step.command!, step.args ?? [], input, step.timeoutMs ?? 5000, options.signal); if (result.stdout.length > 1024 * 1024 || result.stderr.length > 1024 * 1024) throw new Error("process output exceeded 1 MiB"); input = result.stdout; }
      trace.push({ index, type: step.type, input: before, output: input });
    } catch (e) { const message = `workflow ${workflow.id} step ${index + 1}: ${e instanceof Error ? e.message : String(e)}`; trace.push({ index, type: step.type, input: before, error: message }); throw Object.assign(new Error(message), { trace }); }
  }
  return { output: input, trace };
}
export function dispatch(query: string, config: Config): { kind: "workflow"; keyword: string; input: string } | { kind: "calc"; expression: string } | { kind: "app"; query: string } {
  const trimmed = query.trim();
  for (const w of config.workflows) if (trimmed === w.keyword || (trimmed.startsWith(w.keyword) && /\s/.test(trimmed[w.keyword.length] ?? ""))) return { kind: "workflow", keyword: w.keyword, input: trimmed.slice(w.keyword.length).trimStart() };
  if (isCalculationQuery(trimmed)) return { kind: "calc", expression: trimmed.replace(/^=/, "").trim() };
  return { kind: "app", query: trimmed };
}
