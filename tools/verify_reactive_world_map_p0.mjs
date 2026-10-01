import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const js = fs.readFileSync(new URL("../js/map_sections_v2.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../css/map_sections_v2.css", import.meta.url), "utf8");

const sections = [
  {
    sectionId: "citadel",
    nodes: [{ nodeId: "alpha_network_hq" }, { nodeId: "howl_treasury" }],
  },
  {
    sectionId: "iron_march",
    nodes: [
      { nodeId: "phantom_nodes" },
      { nodeId: "blood_moon_tower" },
      { nodeId: "edge_of_chain" },
    ],
  },
  {
    sectionId: "locked_horizons",
    nodes: [],
  },
];

const runtime = {
  alpha_network_hq: {
    display: { displayStatus: "CALM", urgency: "low" },
    siege: {},
  },
  howl_treasury: {
    fortified: true,
    display: { displayStatus: "FORTIFIED", urgency: "low" },
    siege: {},
  },
  phantom_nodes: {
    hot: true,
    contested: true,
    display: { displayStatus: "CONTESTED", urgency: "high" },
    siege: {},
  },
  blood_moon_tower: {
    display: { displayStatus: "CALM", urgency: "low" },
    siege: {},
  },
  edge_of_chain: {
    display: { displayStatus: "SIEGE_LIVE", urgency: "critical" },
    siege: { siegeStatus: "running" },
  },
};

const window = {
  addEventListener() {},
  MapSectionAssignments: { getSections: () => sections },
  AHMap: { getNodeRuntimeState: (nodeId) => runtime[nodeId] || null },
};

vm.runInNewContext(js, {
  window,
  document: { createElement() { throw new Error("DOM should not be needed for verifier helpers"); } },
  console,
  Date,
  Math,
  Number,
  String,
  Set,
  Object,
  Array,
  RegExp,
});

const t = window.MapSectionsV2?.__test;
assert.ok(t, "MapSectionsV2 test helpers missing");

assert.deepEqual(
  JSON.parse(JSON.stringify(t.nodeRuntimeSignal("phantom_nodes", runtime.phantom_nodes))),
  { score: 80, state: "FRONTLINE PRESSURE", tone: "alert", nodeId: "phantom_nodes" }
);

assert.deepEqual(
  JSON.parse(JSON.stringify(t.nodeRuntimeSignal("edge_of_chain", runtime.edge_of_chain))),
  { score: 100, state: "CRITICAL", tone: "critical", nodeId: "edge_of_chain" }
);

const iron = t.regionRuntimePresentation("iron_march");
assert.equal(iron.state, "CRITICAL");
assert.equal(iron.tone, "critical");
assert.equal(iron.hotNodeId, "edge_of_chain");

const citadel = t.regionRuntimePresentation("citadel");
assert.equal(citadel.state, "FORTIFIED");
assert.equal(citadel.tone, "fortified");

const locked = t.regionRuntimePresentation("locked_horizons");
assert.equal(locked.state, "UNCHARTED");
assert.equal(locked.tone, "locked");

const phantomPresentation = t.runtimePresentation("phantom_nodes", runtime.phantom_nodes);
assert.match(phantomPresentation.label, /CONTESTED/);
assert.equal(phantomPresentation.tone, "alert");

assert.match(js, /node\.id === "phantom_nodes"\) poi\.dataset\.mapV2Strategic = "frontline"/);
assert.match(js, /startRuntimeUpdates\(getSections\(\)\.flatMap/);

// Regression: WORLD render must initialize runtimeRegion before either the SVG hit
// or the region label reads it. This guards the TDZ crash seen on Map open.
const runtimeInit = js.indexOf("const runtimeRegion = regionRuntimePresentation(currentSection.sectionId);");
const runtimeHitRead = js.indexOf('hit.setAttribute("data-map-v2-runtime-tone", runtimeRegion.tone);');
const runtimeLabelRead = js.indexOf("label.dataset.mapV2RuntimeTone = runtimeRegion.tone;");
assert.ok(runtimeInit >= 0, "runtimeRegion initialization missing");
assert.ok(runtimeHitRead > runtimeInit, "WORLD polygon reads runtimeRegion before initialization");
assert.ok(runtimeLabelRead > runtimeInit, "WORLD label reads runtimeRegion before initialization");
assert.match(css, /data-map-v2-strategic="frontline"/);
assert.match(css, /data-map-v2-runtime-tone="critical"/);
assert.match(css, /opacity:1!important/);

console.log("PASS reactive-world-map-p0 runtime aggregation + Phantom visibility");
