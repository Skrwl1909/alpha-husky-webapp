import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const ui = readFileSync("tactical-ops-src/ui/Battle.tsx", "utf8");
const store = readFileSync("tactical-ops-src/store/battleStore.ts", "utf8");
const css = readFileSync("tactical-ops-src/tactical.css", "utf8");

test("pointer activation goes through one click path for mouse, touch and keyboard", () => {
  const token = ui.slice(ui.indexOf("function Token("), ui.indexOf("function HudPortrait("));
  const field = ui.slice(ui.indexOf("{Array.from({ length: GRID_COLS * GRID_ROWS }"), ui.indexOf("{units\n"));
  assert.match(token, /onClick=\{\(e\) => \{/);
  assert.doesNotMatch(token, /onPointerDown=/);
  assert.match(field, /onClick=\{\(e\) => \{/);
  assert.doesNotMatch(field, /onPointerDown=/);
});
test("aiming has cancel, Escape and legal target accessibility", () => {
  assert.match(ui, /event.key !== "Escape"/);
  assert.match(ui, /aria-label=\{presentation.targeting \? "Cancel targeting"/);
  assert.match(ui, /presentation.targetIds.map/);
  assert.match(ui, /selectTarget\(unit.id\)/);
  assert.match(ui, /aria-live="polite"/);
});
test("rejected local commands expose engine reason and Skip rejects visibly", () => {
  for (const reason of ["invalid-target", "need-target", "cooldown", "no-actor", "unknown-skill"]) {
    assert(store.includes('case "' + reason + '"'), reason);
  }
  assert.match(store, /skillFailureGuidance\(res.reason\)/);
  assert.match(store, /Skip not accepted/);
  assert.match(store, /Action not confirmed/);
});
test("visual overlays never block unit hit controls", () => {
  assert.match(css, /\.t-token \*/);
  assert.match(css, /\.t-unit-hit\.is-legal-target \{z-index:36\}/);
  assert.match(css, /touch-action:manipulation/);
});
test("dev latency distinguishes authority roundtrip and received-frame presentation", () => {
  assert.match(store, /import\.meta\.env\.DEV/);
  assert.match(store, /receivedAt - startedAt/);
  assert.match(store, /combatStamp\(\) - receivedAt/);
});
