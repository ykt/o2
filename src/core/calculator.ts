type Token = { kind: "num" | "op" | "l" | "r"; value: string };
const MAX = 256;
function tokenize(input: string): Token[] {
  if (input.length > MAX) throw new Error("expression is too long");
  const out: Token[] = []; let i = 0;
  while (i < input.length) {
    if (/\s/.test(input[i])) { i++; continue; }
    if (/[0-9.]/.test(input[i])) { const start = i; while (i < input.length && /[0-9.eE+-]/.test(input[i])) { if ((input[i] === "+" || input[i] === "-") && i > start && !/[eE]/.test(input[i - 1])) break; i++; } const value = input.slice(start, i); if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) throw new Error("invalid number"); out.push({ kind: "num", value }); continue; }
    if ("+-*/".includes(input[i])) out.push({ kind: "op", value: input[i++ ] }); else if (input[i] === "(") { out.push({ kind: "l", value: input[i++] }); } else if (input[i] === ")") { out.push({ kind: "r", value: input[i++] }); } else throw new Error("unsupported token");
  }
  return out;
}
export function calculate(raw: string): string {
  const tokens = tokenize(raw); let i = 0; let depth = 0;
  const primary = (): number => { if (++depth > 32) throw new Error("expression is too deep"); const t = tokens[i++]; let n: number; if (!t) throw new Error("incomplete expression"); if (t.kind === "num") n = Number(t.value); else if (t.kind === "op" && (t.value === "+" || t.value === "-")) { const x = primary(); n = t.value === "-" ? -x : x; } else if (t.kind === "l") { n = additive(); if (tokens[i++]?.kind !== "r") throw new Error("missing closing parenthesis"); } else throw new Error("expected number"); depth--; return n; };
  const multiplicative = (): number => { let n = primary(); while (tokens[i]?.kind === "op" && "*/".includes(tokens[i].value)) { const op = tokens[i++].value; const r = primary(); if (op === "/" && r === 0) throw new Error("division by zero"); n = op === "*" ? n * r : n / r; } return n; };
  const additive = (): number => { let n = multiplicative(); while (tokens[i]?.kind === "op" && "+-".includes(tokens[i].value)) { const op = tokens[i++].value; const r = multiplicative(); n = op === "+" ? n + r : n - r; } return n; };
  const result = additive(); if (i !== tokens.length || !Number.isFinite(result)) throw new Error("invalid expression"); const normalized = Object.is(result, -0) ? 0 : result; return Number(normalized.toPrecision(12)).toString();
}
export function isCalculationQuery(query: string): boolean { const q = query.trim(); return q.startsWith("=") || (/^[\d\s().+*/-]+$/.test(q) && /[+*/-]/.test(q) && /\d/.test(q)); }
