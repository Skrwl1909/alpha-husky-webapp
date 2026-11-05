#!/usr/bin/env node
/** Geometry and source-ownership gate for the render-only field alignment pass.
 * Physical Telegram/iPhone QA and screenshot review remain mandatory. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const css = readFileSync(resolve(root, "tactical-ops-src/ui/overheadProjection.css"), "utf8");
const base = readFileSync(resolve(root, "tactical-ops-src/tactical.css"), "utf8");
const battle = readFileSync(resolve(root, "tactical-ops-src/ui/Battle.tsx"), "utf8");
const projection = readFileSync(resolve(root, "tactical-ops-src/combat/movement.ts"), "utf8");
const styles = readFileSync(resolve(root, "tactical-ops-src/styles.ts"), "utf8");
assert.match(css, /Battlefield Visual Alignment V1/);
assert.match(base, /\.t-battle \.t-field \{container-type:size\}/);
assert.match(base, /transform-origin:50% 100%/);
assert.match(styles, /OVERHEAD_PROJECTION_CSS/);
assert.match(projection, /left: 12,[\s\S]*right: 88,[\s\S]*top: 24,[\s\S]*bottom: 82/);
assert.match(battle, /left: `\$\{pos\.x\}%`, top: `\$\{pos\.y\}%`/);
assert.match(battle, /className=\{`t-hit t-unit-hit/);

const normal = '#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"] ';
const vnext = '#tacticalOpsRoot .t-battle[data-projection="relay-overhead-v1"].battlefield-vnext-preview ';
const source = css.slice(css.indexOf("/* Battlefield Visual Alignment V1"));
function rule(scope, suffix) {
  const prefix = scope + suffix + " {";
  const pos = source.indexOf(prefix);
  assert.ok(pos >= 0, "Missing field rule " + prefix);
  return source.slice(pos + prefix.length, source.indexOf("}", pos));
}
function widthFor(scope, suffix) {
  const text = rule(scope, suffix);
  const m = text.match(/width:\s*min\(([\d.]+)cqw,\s*([\d.]+)px,\s*([\d.]+)cqh\)/);
  assert.ok(m, "Missing responsive three-axis width " + scope + suffix);
  return m.slice(1).map(Number);
}
assert.match(rule(normal, ".t-token"), /min-width:\s*0/);
assert.match(rule(normal, ".t-token"), /max-width:\s*none/);
assert.match(rule(normal, ".t-token"), /transform:\s*translate\(-50%,\s*-100%\)/);
assert.match(rule(normal, ".t-token .t-ring"), /bottom:\s*-5px/);
for (const [depth, scale] of [[0,.92],[1,.95],[2,.98],[3,1.01],[4,1.04]]) {
  const val=rule(normal, ".t-token.depth-" + depth);
  const match=val.match(/transform:\\s*translate\\(-50%,\\s*-100%\\)\\s+scale\\((\\d*\\.?\\d+)\\)/);
  assert.ok(match && Number(match[1])===scale,"Depth "+depth+" must stay foot-anchored");
}
const variants = [
  [normal, ".t-token", 8, 5, 2.3],
  [normal, ".t-token.alpha", 8, 5, 2.1],
  [normal, ".t-token.leader", 8, 5, 1.25],
  [normal, ".t-token.hound", 8, 5, 1.1],
  [vnext, ".t-token", 10, 7, 2.3],
  [vnext, ".t-token.alpha", 10, 7, 2.1],
  [vnext, ".t-token.leader", 10, 7, 1.25],
  [vnext, ".t-token.hound", 10, 7, 1.1],
];
for (const [scope, cls, cols, rows, maxAspect] of variants) {
  const [xPct, maxPx, yPct] = widthFor(scope, cls);
  const pitchX = 76/(cols-1), pitchY=58/(rows-1);
  for (const [fieldW, fieldH] of [[320,300],[360,460],[390,568],[430,700],[780,360]]) {
    const tokenW=Math.min(fieldW*xPct/100,maxPx,fieldH*yPct/100);
    const scaledW=tokenW*1.04; // front row depth cap from production CSS
    assert.ok(scaledW<fieldW*pitchX/100,cols+"x"+rows+" "+cls+": silhouette exceeds horizontal stride");
    const rowCoverage=scaledW*maxAspect/(fieldH*pitchY/100);
    assert.ok(rowCoverage<1.7,cols+"x"+rows+" "+cls+": art covers too many rows");
  }
}
console.log("BATTLEFIELD ALIGNMENT V1: foot anchors, ring, both grids, 5 viewports, tap ownership PASS");
