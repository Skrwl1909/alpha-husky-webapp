#!/usr/bin/env node
/** Cross-grid checks for the actual production geometry functions.
 * No mock projection: esbuild loads the authoritative TS module. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";

const root = resolve(import.meta.dirname, "..");
const result = await build({
  entryPoints: [resolve(root, "tactical-ops-src/combat/movement.ts")],
  bundle: true, write: false, format: "esm", platform: "node", target: "es2020",
  logLevel: "silent",
});
assert.equal(result.outputFiles.length, 1);
const url = "data:text/javascript;base64," + Buffer.from(result.outputFiles[0].contents).toString("base64");
const { FIELD_PROJECTION, fieldPercentForGrid, fieldPercent, fieldTouchFootprint } = await import(url);
assert.deepEqual(FIELD_PROJECTION, { left: 12, right: 88, top: 24, bottom: 82, touchFill: 0.82 });

for (const [cols, rows] of [[8,5], [10,7]]) {
  const footprint = fieldTouchFootprint(cols,rows);
  assert.ok(footprint.widthPct > 0 && footprint.heightPct > 0);
  const leftTop = fieldPercentForGrid(0,0,cols,rows);
  const rightBottom = fieldPercentForGrid(cols-1,rows-1,cols,rows);
  assert.deepEqual(leftTop, { x: 12, y: 24 });
  assert.deepEqual(rightBottom, { x: 88, y: 82 });
  const dx = (88 - 12) / (cols - 1);
  const dy = (82 - 24) / (rows - 1);
  assert.ok(footprint.widthPct < dx && footprint.heightPct < dy, "neighbor hitboxes must not overlap");
  let previousRowY=-Infinity;
  for(let r=0;r<rows;r++){
    let previousX=-Infinity;
    for(let c=0;c<cols;c++){
      const p=fieldPercentForGrid(c,r,cols,rows);
      assert.ok(p.x >=12 && p.x<=88 && p.y>=24 && p.y<=82);
      assert.ok(p.x>previousX, "strictly ordered columns");
      previousX=p.x;
      if(c===0){ assert.ok(p.y>previousRowY,"strictly ordered rows"); previousRowY=p.y; }
      // Same physical anchor for painted sprite, legal target, command tap,
      // threat tile and event-driven contact effects.
      for (const kind of ["unit","tap","move","intent","fx"]) {
        const independent=fieldPercentForGrid(c,r,cols,rows);
        assert.deepEqual(independent,p,`${kind} anchor must match`);
      }
    }
  }
  for (const [w,h] of [[320,300],[360,460],[390,568],[430,700],[780,360]]) {
    assert.ok((footprint.widthPct/100*w)<(dx/100*w),"no horizontal touch overlap");
    assert.ok((footprint.heightPct/100*h)<(dy/100*h),"no vertical touch overlap");
  }
}
assert.deepEqual(fieldPercent(0,0),fieldPercentForGrid(0,0,8,5),"default Legacy projection");

const battle=readFileSync(resolve(root,"tactical-ops-src/ui/Battle.tsx"),"utf8");
const ui=readFileSync(resolve(root,"tactical-ops-src/ui/battlePresentation.ts"),"utf8");
const styles=readFileSync(resolve(root,"tactical-ops-src/styles.ts"),"utf8");
assert.match(battle,/data-projection="relay-overhead-v1"/);
assert.match(ui,/fieldTouchFootprint\(columns, rows\)/);
assert.match(styles,/OVERHEAD_PROJECTION_CSS/);
assert.ok((battle.match(/fieldPercent\(/g)||[]).length>=8,"Battle renderer must share the projection helper");
console.log("TACTICAL OVERHEAD V1: Legacy 8x5 and VNext 10x7 anchors, responsive touch footprints, renderer linkage PASS");
