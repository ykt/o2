import test from "node:test"; import assert from "node:assert/strict";
import { dispatch } from "../src/core/workflow.js";
test("desktop dispatch distinguishes arithmetic from application names", () => {
  const config = { version: 1 as const, workflows: [] };
  assert.deepEqual(dispatch("2+3*4", config), { kind: "calc", expression: "2+3*4" });
  assert.deepEqual(dispatch("= 20 / 4", config), { kind: "calc", expression: "20 / 4" });
  assert.deepEqual(dispatch("1Password", config), { kind: "app", query: "1Password" });
});
