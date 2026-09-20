import type { AppRecord } from "./types.js";

export function searchApps(apps: AppRecord[], query: string, limit = 20): AppRecord[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return [];
  const unique = new Map<string, AppRecord>();
  for (const app of apps) unique.set(app.path, app);
  return [...unique.values()].filter((app) => app.name.toLocaleLowerCase().includes(q)).sort((a, b) => {
    const rank = (name: string) => name.toLocaleLowerCase() === q ? 0 : name.toLocaleLowerCase().startsWith(q) ? 1 : 2;
    return rank(a.name) - rank(b.name) || a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()) || a.id.localeCompare(b.id);
  }).slice(0, limit);
}
