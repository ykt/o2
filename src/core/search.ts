import type { AppRecord } from "./types.js";

export function searchApps(apps: AppRecord[], query: string, limit = 20): AppRecord[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return [];
  const unique = new Map<string, AppRecord>();
  for (const app of apps) unique.set(app.path, app);
  return [...unique.values()].map(app => ({ app, score: score(app.name, q) })).filter(x => x.score >= 0).sort((a, b) => b.score - a.score || a.app.name.toLocaleLowerCase().localeCompare(b.app.name.toLocaleLowerCase()) || a.app.id.localeCompare(b.app.id)).slice(0, limit).map(x => x.app);
}
export function score(name: string, query: string): number {
  const n = name.toLocaleLowerCase(), q = query.toLocaleLowerCase(); if (!q) return 0;
  if (n.startsWith(q)) return 1000 - n.length;
  const initials = name.split(/[\s-]+/).map(w => w[0] ?? "").join("").toLocaleLowerCase(); if (initials.startsWith(q)) return 900 - n.length;
  if (name.split(/[\s-]+/).some(w => w.toLocaleLowerCase().startsWith(q))) return 780 - n.length;
  let i = 0, gaps = 0; for (const c of n) { if (c === q[i]) i++; else if (i > 0 && i < q.length) gaps++; }
  return i === q.length ? 520 - gaps : -1;
}
