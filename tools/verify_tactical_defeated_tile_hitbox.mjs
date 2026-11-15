import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const battle = read("tactical-ops-src/ui/Battle.tsx");
const movement = read("tactical-ops-src/combat/movement.ts");
const css = read("tactical-ops-src/tactical.css");

test("defeated units do not leave invisible buttons above free movement tiles", () => {
  const token = battle.slice(battle.indexOf("function Token("), battle.indexOf("function HudPortrait("));
  assert.match(token, /!unit\.defeated\s*&&\s*unit\.hp\s*>\s*0\s*\?\s*<button/);
  assert.match(token, /className=\{`t-hit t-unit-hit/);
  assert.doesNotMatch(token, /disabled=\{busy\s*\|\|\s*unit\.defeated\}/);
  assert.match(css, /\.t-token\.defeated\s*\{[^}]*pointer-events:\s*none;/);
});

test("movement still treats defeated enemies as unoccupied", () => {
  const occupied = movement.slice(movement.indexOf("export function occupiedKeys"), movement.indexOf("export function unitAt"));
  assert.match(occupied, /if\s*\(u\.defeated\)\s*continue;/);
  assert.match(battle, /className="t-cell move"/);
});
