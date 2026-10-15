#!/usr/bin/env node
// Scout Portrait P1: scoped, deterministic presentation tests (no backend).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = pathName => fs.readFileSync(path.join(root, pathName), "utf8");
const src = read("js/scout_comms.js");
const fs2 = read("js/first_signal_v2.js");
const missions = read("js/missions.js");
const scoutGuide = read("js/scout_guide.js");
const index = read("index.html");
let count = 0;
function check(name, callback) {
  callback();
  count++;
  console.log("PASS", name);
}
function browser() {
  const elements = new Map();
  const bodyChildren = [];
  function node(tag) {
    return {
      tag, id: "", innerHTML: "", hidden: false, dataset: {}, style: {},
      setAttribute() {}, addEventListener() {}, remove() {
        const i = bodyChildren.indexOf(this);
        if (i !== -1) bodyChildren.splice(i, 1);
      },
      querySelector(selector) { return selector === "button" ? { onclick: null } : null; },
      appendChild(child) { this.lastChild = child; },
    };
  }
  const body = {
    classList: { add() {}, remove() {} },
    appendChild(child) { bodyChildren.push(child); },
  };
  const document = {
    readyState: "loading", visibilityState: "visible",
    head: { appendChild(el) { if (el.id) elements.set(el.id, el); } },
    body,
    addEventListener() {}, createElement: node,
    getElementById(id) {
      if (id === "hubBack") return elements.get("hubBack") || null;
      if (id === "missionsModal") return null;
      if (id === "equipped-root") return null;
      if (id === "campaignBack") return null;
      return elements.get(id) || null;
    }
  };
  const window = {
    localStorage: { getItem() { return null; }, setItem() {} },
    addEventListener() {},
    getComputedStyle() { return { display: "block" }; }
  };
  const ctx = vm.createContext({ window, document, console });
  vm.runInContext(src, ctx, { filename: "scout_comms.js" });
  return { window, document, elements, bodyChildren, ctx, node };
}

const b = browser();
check("Shared module exposes a single render function", () => {
  assert.equal(typeof b.window.ScoutComms.render, "function");
  assert.ok(Object.isFrozen(b.window.ScoutComms));
});

check("Portait uses existing Missions Scout artwork and speaker identity", () => {
  const html = b.window.ScoutComms.render("One trace is real.");
  assert.match(html, /mission_npc_scout_avatar\.webp/);
  assert.match(html, /SCOUT · COMMS/);
  assert.match(html, /PACK RADIO/);
  assert.match(html, /ah-scout-comms__meter/);
  assert.match(html, /loading="lazy"/);
  assert.equal(html.includes("mission_npc_warden_avatar"), false);
});

check("Scout prose is escaped, not executable HTML", () => {
  const html = b.window.ScoutComms.render('<img src=x onerror=alert(1)>&"');
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes("&amp;"));
  assert.ok(!html.includes('<img src=x'));
});

check("Missing portrait displays initial without broken-image icon", () => {
  const html = b.window.ScoutComms.render("Signal found.");
  assert.match(html, /onerror="this\.hidden=true;this\.nextElementSibling\.hidden=false;this\.onerror=null;"/);
  assert.match(html, /class="ah-scout-comms__fallback" aria-hidden="true" hidden>S/);
  assert.match(b.elements.get("ah-scout-comms-p1").textContent, /\.ah-scout-comms \[hidden\]\{display:none!important\}/);
});

check("Styles install exactly once; mobile widths and reduced-motion handled", () => {
  const headCount = b.elements.size;
  b.window.ScoutComms.render("Again.");
  assert.equal(b.elements.size, headCount);
  const css = b.elements.get("ah-scout-comms-p1").textContent;
  assert.match(css, /@media\(max-width:360px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /#ahScoutGuide:has\(> \.ah-scout-comms\)/);
});

check("Locked state is visual only", () => {
  assert.match(b.window.ScoutComms.render("Locked", { locked: true }), /ah-scout-comms--locked/);
  assert.doesNotMatch(b.window.ScoutComms.render("Default"), /ah-scout-comms--locked/);
});

check("Main loads Scout Comms before First Signal and ScoutGuide", () => {
  const a = index.indexOf('/js/scout_comms.js?v=');
  const f = index.indexOf('js/first_signal_v2.js?v=');
  const s = index.indexOf('/js/scout_guide.js?v=');
  assert.ok(a !== -1 && f > a && s > f);
});

check("Missions renderer delegates to shared Scout and retains fallback", () => {
  assert.ok(missions.includes('if (window.ScoutComms?.render) return window.ScoutComms.render(line)'));
  assert.ok(missions.includes('return renderMissionDebriefVoice("scout", line, "");'));
});

check("Hub ScoutGuide retains dismissal and no new progression calls", () => {
  assert.ok(scoutGuide.includes('global.Missions.renderScoutVoice(lines[beat])'));
  assert.ok(scoutGuide.includes('card.querySelector("button").onclick = dismiss'));
  assert.ok(!src.includes("apiPost("));
});

await (async () => {
  vm.runInContext(fs2, b.ctx, { filename: "first_signal_v2.js" });
  const stages = [
    { state: "NOT_STARTED" },
    { state: "MISSION_STARTED", status: "RUNNING", interceptV2: true },
    { state: "MISSION_STARTED", status: "READY", interceptV2: true, interceptSecured: true },
    { state: "REWARD_RECEIVED", reward: { itemKey: "rustfang_fangs" } },
    { state: "COMPLETED" }
  ];
  for (const stage of stages) {
    b.window.apiPost = async (endpoint) => {
      assert.equal(endpoint, "/webapp/missions/state", "no mission writes");
      return { ok: true, firstSignal: { eligible: true, ...stage } };
    };
    b.window.Missions = { close() {} };
    b.window.Onboarding = { isOpen() { return false; } };
    assert.equal(await b.window.FirstSignalV2.open(), true);
    const view = b.bodyChildren.at(-1).innerHTML;
    assert.match(view, /class="ah-scout-comms/);
    assert.match(view, /mission_npc_scout_avatar\.webp/);
    assert.match(view, /SCOUT · COMMS/);
    assert.match(view, /data-act="/);
    b.window.FirstSignalV2.close();
  }
})();
count++;
console.log("PASS", "First Signal displays shared Scout portrait for all five stages");

console.log("verify_scout_portrait_p1: PASS", count, "checks; mock only, no device E2E");
