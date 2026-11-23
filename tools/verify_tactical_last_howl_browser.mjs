import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
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
const link = new URLSearchParams(location.search).has("link");
const scent = new URLSearchParams(location.search).has("scent");
const wide = new URLSearchParams(location.search).has("wide");
const playerGrowth = { version: 2, revision: 1, heroes: [
  link ? {heroId:"alpha", discipline:"vanguard", ranks:{"alpha-howl":1}, packLink:"pack-link-v1"} : scent ? {heroId:"alpha", discipline:"vanguard", ranks:{"alpha-rend":1}, bloodScent:"blood-scent-v1"} : { heroId: "alpha", discipline: null, ranks: {} },
  { heroId: "ally-02", discipline: "pursuer", ranks: { "u02-burst": 1 }, lungeDoctrine: "wide-v1" },
  { heroId: "ally-03", discipline: null, ranks: {} },
] };
const encounter = { seed: 7, ...roster, activeCombatProfileV3: profile, ...(wide || scent || link ? { playerGrowth } : {}) };
let fresh = stepLastHowl(encounter);
if (link) {
  const board = fresh.snapshot.battle;
  const alpha = board.units.find(unit => unit.defId === "alpha");
  const teammate = board.units.find(unit => unit.defId === "ally-02");
  Object.assign(alpha,{c:4,r:3,hasActed:false});
  Object.assign(teammate,{c:5,r:3});
  board.activeId=alpha.id;
  fresh=stepLastHowl(encounter,fresh.snapshot);
}
if (scent) {
  const board = fresh.snapshot.battle;
  const alpha = board.units.find(unit => unit.defId === "alpha");
  const target = board.units.find(unit => unit.team === "enemy");
  Object.assign(alpha, {c:4,r:3,hasActed:false});
  Object.assign(target, {c:5,r:3,statuses:[{id:"bleed",type:"BLEED",source:"alpha-rend",duration:2,value:8}]});
  alpha.cooldowns["alpha-rend"]=2;
  board.activeId=alpha.id;
  fresh=stepLastHowl(encounter,fresh.snapshot);
}
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
    } else if (wide || scent || link) {
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
const commandEvidence = "artifacts/command-deck-v2";
mkdirSync(commandEvidence, { recursive: true });
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
    const operation = page.getByRole("region", { name: "Last Howl" });
    await operation.waitFor();
    assert.equal(await operation.getAttribute("data-run-status"), "ready");
    assert.equal(await operation.getByText("BEST WAVES", { exact: true }).count(), 1);
    assert.equal(await operation.getByText("BEST KILLS", { exact: true }).count(), 1);
    assert(await operation.locator("img.t-cdv2-operation-scene").evaluate(async image => {
      await image.decode();
      return image.naturalWidth >= 1000 && image.naturalHeight >= 500;
    }), "premium operation artwork must load at native resolution");
    const deploy = operation.getByRole("button", { name: "DEPLOY", exact: true });
    const deployRect = await deploy.boundingBox();
    assert(deployRect && deployRect.height >= 44 && deployRect.width >= 110, "primary deploy action must be touch-sized");
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "COMMAND must not horizontally overflow");
    assert(await operation.evaluate(element => element.scrollWidth <= element.clientWidth + 1), "operation card content must fit mobile width");
    const regularMission = page.locator('.t-cdv2-overview [data-primary-purpose="true"]');
    if (await regularMission.count()) {
      const missionBox = await regularMission.boundingBox();
      const howlBox = await operation.boundingBox();
      assert(missionBox && howlBox && missionBox.y < howlBox.y, "normal COMMAND prioritizes the next actionable mission above optional Last Howl");
    }
    await page.screenshot({ path: `${commandEvidence}/${width}-command-ready.png`, fullPage: true, animations: "disabled" });
    await deploy.scrollIntoViewIfNeeded();
    assert(await deploy.evaluate(button => {
      const rect = button.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return hit === button || button.contains(hit);
    }), "LAST HOWL DEPLOY must be topmost at its mobile tap location");
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
    assert.equal(await operation.getAttribute("data-run-status"), "active");
    await operation.getByText("Resume with the build saved at deployment.").waitFor();
    if (await regularMission.count()) {
      const missionBox = await regularMission.boundingBox();
      const howlBox = await operation.boundingBox();
      assert(missionBox && howlBox && howlBox.y < missionBox.y, "active Last Howl RESUME has priority above unaccepted missions");
    }
    await page.screenshot({ path: `${commandEvidence}/${width}-command-active.png`, fullPage: true, animations: "disabled" });
    await page.getByRole("button", { name: "RESUME", exact: true }).click();
    await hud.waitFor();
    await page.keyboard.press("s");
    const results = page.locator(".t-last-howl-results");
    await results.waitFor();
    assert.match(await results.innerText(), /WAVES CLEARED\s*4[\s\S]*NEW RECORD[\s\S]*NO REWARDS RECORDED/);
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
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(url + "?scent");
    await page.getByRole("button", {name:"DEPLOY",exact:true}).click();
    await page.getByRole("button", {name:/^A1 STRIKE/}).tap();
    await page.getByRole("button", {name:/Legal target$/}).first().tap();
    const feedback = page.locator(".t-float").filter({hasText:"BLOOD SCENT"});
    await feedback.waitFor();
    assert.match(await feedback.innerText(), /REND cooldown 2.*1/);
    mkdirSync("artifacts/blood-scent", {recursive:true});
    await page.screenshot({path:`artifacts/blood-scent/${width}-activation.png`});
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(url + "?link");
    await page.getByRole("button",{name:"DEPLOY",exact:true}).click();
    await page.getByRole("button",{name:/^A3 HOWL/}).tap();
    const linkFeedback = page.locator(".t-float").filter({hasText:"PACK LINK"});
    try { await linkFeedback.waitFor(); } catch(error) { console.error('PACK_LINK_STATE',await page.evaluate(()=>{const s=fixture.store.getState();return {screen:s.screen,busy:s.busy,floats:s.floats,ticker:s.ticker,lastHowl:s.lastHowl?.status,errors:s.progressionError,frameEvidence:s.lastHowl?.frames?.map(f=>f.events).flat().filter(e=>String(e.text).includes('PACK'))}})); throw error; }
    mkdirSync("artifacts/pack-link",{recursive:true});
    await page.screenshot({path:`artifacts/pack-link/${width}-activation.png`});
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS ${width}px premium COMMAND art, touch deploy/resume, HUD, results, target, retry and Forge bridge`);
  }
} finally {
  await browser.close();
  await server.close();
}
