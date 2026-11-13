/** Focused, offline Forge upgrade visual/authority checks. No economy mutations. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("js/forge.js", "utf8");
const index = readFileSync("index.html", "utf8");
function isolate(begin, end, exported) {
  const from = source.indexOf(begin);
  const to = source.indexOf(end, from);
  assert(from >= 0 && to > from, `Missing ${exported}`);
  return source.slice(from, to) + `\n${exported}`;
}

const compare = vm.runInNewContext(isolate(
  "  function confirmedForgeDelta(before, after) {", "\n  async function openFieldTest()", "confirmedForgeDelta"
));
const initial = { slot: "offhand", key: "rustfang", name: "Rustfang Fangs", stars: 1,
  currentStats: { atk: 4, def: 2 } };
const updated = { ...initial, stars: 2, currentStats: { atk: 6, def: 2 } };
const proof = compare(initial, updated);
assert.equal(proof?.beforeStars, 1);
assert.equal(proof?.afterStars, 2);
assert.equal(proof?.changes.length, 1);
assert.equal(compare(initial, initial), null, "No server-confirmed star increase means no impact");
assert.equal(compare(initial, { ...updated, slot: "weapon" }), null, "Another slot is not a proof");
assert.equal(compare(initial, null), null, "Missing refreshed state is not a proof");

const mounted = [];
const app = { icons: [], actions: [] };
const ctx = {
  _state: { equipped: [{ ...updated, icon: "https://example.test/gear.png" }] },
  esc: value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"),
  statLabel: key => ({ atk: "Attack", def: "Defense" })[key] || key,
  fmtNum: value => String(value),
  mountItemIcon(node, item) { app.icons.push({ node, item }); },
  openFieldTest() {},
  el(tag, className, html = "") {
    const node = {
      tag, className, innerHTML: html, attributes: {}, children: [],
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, cb) { app.actions.push({ name, cb }); },
      appendChild(child) { this.children.push(child); },
      querySelector(selector) { return { selector }; },
    };
    return node;
  },
};
const render = vm.runInNewContext(isolate(
  "  function renderForgeFieldTest(body, proof, revealOnce = false) {", "\n  function renderUpgrade(body)", "renderForgeFieldTest"
), ctx);
const body = { appendChild(node) { mounted.push(node); } };
render(body, null, true);
assert.equal(mounted.length, 0, "Do not celebrate an unconfirmed upgrade");
render(body, proof, true);
assert.equal(mounted.length, 1);
const card = mounted[0];
assert.match(card.className, /is-revealing/);
assert.equal(card.attributes.role, "status");
assert.match(card.innerHTML, /UPGRADE COMPLETE/);
assert.match(card.innerHTML, /Rustfang Fangs/);
assert.match(card.innerHTML, /★1/);
assert.match(card.innerHTML, /★2/);
assert.match(card.innerHTML, /CONFIRMED ITEM STAT CHANGES/);
assert.match(card.innerHTML, /\(\+2\)/);
assert.match(card.innerHTML, /Start a new battle/);
assert.equal(card.children[0].innerHTML, "FIELD TEST IN TACTICAL OPS");
assert.equal(app.icons[0].item.stars, 2, "Artwork must come from refreshed Forge state");
assert.equal(app.actions[0].name, "click", "Field Test CTA stays clickable");

render(body, { ...proof, changes: [] }, false);
assert.doesNotMatch(mounted[1].className, /is-revealing/, "Visual burst is one-shot");
assert.match(mounted[1].innerHTML, /No numeric item-stat change was exposed/);
assert.doesNotMatch(mounted[1].innerHTML, /CONFIRMED ITEM STAT CHANGES/);

const upgrade = source.slice(source.indexOf("    async function doUpgrade(it)"), source.indexOf("    const selected = eq.find", source.indexOf("    async function doUpgrade(it)")));
assert.match(upgrade, /await post\("\/webapp\/forge\/upgrade"/);
assert.match(upgrade, /await loadState\(\);[\s\S]*_lastForgeProof = confirmedForgeDelta\(it, updated\);[\s\S]*_forgeRevealQueued = !!_lastForgeProof/);
assert.match(upgrade, /_lastForgeProof = null;\s*_forgeRevealQueued = false;/);
assert.match(source, /renderForgeFieldTest\(body, _lastForgeProof, revealOnce\);\s*_forgeRevealQueued = false;/);
assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(source, /\.ah-forge \*::before, \.ah-forge \*::after\{ transition:none !important; animation:none !important;/);
assert.match(index, /js\/forge\.js\?v=forge-upgrade-impact-v1-20261113/);
assert.doesNotMatch(upgrade, /Math\.random|localStorage/);
console.log("PASS Forge Upgrade Impact V1: accepted proof, one-shot animation, real icon/deltas, fallback, Field Test, reduced motion");
