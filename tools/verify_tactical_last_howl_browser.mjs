import assert from "node:assert/strict";
import { createServer } from "vite";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const entry = `
import React from "react";
import { createRoot } from "react-dom/client";
import { TacticalApp } from "/tactical-ops-src/ui/App.tsx";
import { TACTICAL_CSS } from "/tactical-ops-src/styles.ts";
import { useBattleStore as store } from "/tactical-ops-src/store/battleStore.ts";
import { stepLastHowl } from "/tactical-ops-src/combat/lastHowlAuthority.ts";
import { setHost } from "/tactical-ops-src/host/bridge.ts";
const style = document.createElement("style");
style.textContent = TACTICAL_CSS;
document.head.append(style);
const profile = { version: 3, mode: "battle-v1", alpha: { hp: 120, atk: 28, def: 12, spd: 14 }, pet: null };
const roster = { squadIds: ["alpha","ally-02","ally-03"], combatProfileV2: { pet: null }, packMastery: {} };
const wide = new URLSearchParams(location.search).has("wide");
const playerGrowth = { version: 2, revision: 1, heroes: [
  { heroId: "alpha", discipline: null, ranks: {} },
  { heroId: "ally-02", discipline: "pursuer", ranks: { "u02-burst": 1 }, lungeDoctrine: "wide-v1" },
  { heroId: "ally-03", discipline: null, ranks: {} },
] };
const encounter = { seed: 7, ...roster, activeCombatProfileV3: profile, ...(wide ? { playerGrowth } : {}) };
let fresh = stepLastHowl(encounter);
if (wide) {
  const board = fresh.snapshot.battle;
  const cnc = board.units.find(unit => unit.id === "ally-02");
  const foes = board.units.filter(unit => unit.team === "enemy");
  Object.assign(cnc, { c: 5, r: 3, hasActed: false });
  foes.forEach((unit, i) => Object.assign(unit, { c: 6, r: 3 + i }));
  board.activeId = cnc.id;
  fresh = stepLastHowl(encounter, fresh.snapshot);
}
const persisted = JSON.parse(sessionStorage.lastHowl || "null");
let creates = persisted?.creates || 0;
let active = persisted?.active ?? null;
const save = () => sessionStorage.lastHowl = JSON.stringify({creates, active});
const canonical = { version: 1, revision: 1, completed: true, foundationStage: "completed", vnextStartAvailable: true,
  operations: { "broken-signal": { status: "cleared", missions: {} } } };
if (!new URLSearchParams(location.search).has("off")) canonical.lastHowl = {
  version: 1, status: active?.status ?? null, runId: active?.runId ?? null, best: active?.best ?? null,
};
window.apiPost = async (path, body) => {
  if (path.endsWith("/last-howl/start")) {
    assertPrevious(body.previousRunId);
    active = { ...fresh.view, mode: "last_howl", runId: "fixture-" + ++creates, revision: 0, token: "fixture-token",
      status: "ACTIVE", activeCombatProfileV3: profile, newRecord: false, best: active?.best ?? null, roster };
  } else if (path.endsWith("/last-howl/command")) {
    if (body.command?.type === "abandon") {
      active = { ...active, status: "ABANDONED", token: null, revision: active.revision + 1,
        completedWaves: active.completedWaves || 0, eliteKills: active.eliteKills || 0, kills: active.kills || 0,
        newRecord: false, battle: { ...active.battle, outcome: "defeat", activeId: null } };
    } else if (wide) {
      fresh = stepLastHowl(encounter, fresh.snapshot, body.command);
      if (!fresh) throw Error("invalid fixture action");
      window.receivedHits = fresh.frames[0].events.filter(event => event.type === "damage").length;
      active = { ...active, ...fresh.view, frames: fresh.frames, revision: active.revision + 1 };
    } else {
      const score = { runId: active.runId, completedWaves: 4, kills: 14, eliteKills: 0, status: "DEFEATED" };
      active = { ...active, ...score, revision: 1, token: null, best: score, newRecord: true,
        battle: { ...active.battle, outcome: "defeat", activeId: null } };
    }
  } else if (!path.endsWith("/last-howl/state")) return { ok: true, data: canonical };
  save();
  return { ok: true, lastHowl: active };
};
function assertPrevious(id) {
  if (id !== (active?.runId ?? null)) throw Error("wrong previous run");
}
setHost({ openForge: () => { window.forgeOpened = true; } });
store.setState({ progression: canonical, progressionStatus: "ready", foundationCompleted: true, screen: "war-table" });
createRoot(document.getElementById("mount")).render(React.createElement(TacticalApp));
`;
const server = await createServer({
  configFile: false, cacheDir: "node_modules/.vite-last-howl-browser", resolve: { preserveSymlinks: true },
  plugins: [{
    name: "last-howl-fixture",
    configureServer(vite) {
      vite.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/last-howl-fixture")) return next();
        res.setHeader("Content-Type", "text/html");
        res.end('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@last-howl"></script>');
      });
    },
    resolveId(id) { if (id === "/@last-howl") return "\0last-howl"; },
    load(id) { if (id === "\0last-howl") return entry; },
  }],
  optimizeDeps: { include: ["react", "react-dom/client", "react/jsx-dev-runtime", "lucide-react", "zustand"] },
  server: { host: "127.0.0.1", port: 0, hmr: false },
});
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, args: ["--no-sandbox"] });
const url = `http://127.0.0.1:${server.httpServer.address().port}/last-howl-fixture`;
try {
  for (const [width, height] of [[320, 568], [390, 844], [430, 932]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.setDefaultTimeout(18000);
    await page.goto(url + "?off");
    await page.getByRole("heading", { name: "TACTICAL OPS", exact: true }).waitFor().catch(error => {
      throw Error(`War Table failed to mount: ${errors.join("\n")}`, { cause: error });
    });
    assert.equal(await page.getByRole("region", { name: "Last Howl" }).count(), 0);
    await page.goto(url);
    await page.getByRole("button", { name: "DEPLOY", exact: true }).click();
    const hud = page.locator(".t-last-howl-hud");
    await hud.waitFor();
    assert.match(await hud.innerText(), /WAVE 1.*KILLS 0.*SQUAD 3\/3/s);
    assert.equal(await page.locator(".t-grid > i").count(), 70);
    assert(await hud.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
    const abandon = hud.getByRole("button", { name: "ABANDON RUN", exact: true });
    const abandonRect = await abandon.boundingBox();
    const hudRect = await hud.boundingBox();
    assert(abandonRect && hudRect && abandonRect.y >= hudRect.y - 1 &&
      abandonRect.y + abandonRect.height <= hudRect.y + hudRect.height + 1,
      'Last Howl abandon must be inside the visible HUD, not clipped by the 44px rail');
    const field = page.locator(".t-field-wrap");
    assert((await field.boundingBox()).y >= (await hud.boundingBox()).y + (await hud.boundingBox()).height - 1);
    await hud.getByRole("button", { name: "EXIT", exact: true }).click();
    await page.reload();
    await page.getByRole("button", { name: "RESUME", exact: true }).click();
    await hud.waitFor();
    await page.keyboard.press("s");
    const results = page.locator(".t-last-howl-results");
    await results.waitFor();
    assert.match(await results.innerText(), /WAVES CLEARED\s*4[\s\S]*NEW RECORD[\s\S]*No rewards/);
    assert(await results.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
    await results.getByRole("button", { name: "UPGRADE IN FORGE" }).click();
    assert(await page.evaluate(() => window.forgeOpened));
    await results.getByRole("button", { name: "TRY AGAIN" }).click();
    await hud.waitFor();
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.lastHowl).active.runId), "fixture-2");
    await hud.getByRole("button", { name: "ABANDON RUN", exact: true }).tap();
    const confirm = hud.getByRole("group", { name: "Confirm abandoning Last Howl" });
    await confirm.getByRole("button", { name: "CONFIRM ABANDON" }).tap();
    await results.getByText("RUN ABANDONED").waitFor();
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.lastHowl).active.status), "ABANDONED");
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(url + "?wide");
    await page.getByRole("button", { name: "DEPLOY", exact: true }).click();
    const lunge = page.getByRole("button", { name: /^A2 WIDE LUNGE/ });
    assert.match(await lunge.getAttribute("aria-label"), /Range 1 · Radius 1.*1× per target instead of 1\.55×/);
    assert.equal(await page.locator(".t-actions .t-act").count(), 3);
    await lunge.tap();
    await page.getByRole("button", { name: /Legal target$/ }).first().tap();
    await page.waitForFunction(() => window.receivedHits === 2);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS ${width}px touch HUD, wide-lunge target, results, gated card, resume, retry and Forge bridge`);
  }
} finally {
  await browser.close();
  await server.close();
}
