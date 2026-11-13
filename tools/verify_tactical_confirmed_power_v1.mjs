import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const vite = await createServer({ configFile: false, server: { middlewareMode: true } });
try {
  const { confirmedRunCombatPower } = await vite.ssrLoadModule("/tactical-ops-src/ui/runCombatPower.ts");
  const alpha = { hp: 128, atk: 36, def: 18, spd: 15 };
  const v3 = { version: 3, mode: "battle-v1", alpha, pet: null, gearImpactV31: { offense: 9, guard: 4 } };
  const v2 = { pet: null };
  const run = {
    runId: "field_confirmed_01", squadIds: ["alpha", "ally-02", "ally-03"],
    rulesContract: { combatProfileVersion: 3 }, combatProfileV2: v2, combatProfileV3: v3,
  };
  const field = { fieldOps: { activeMissionRun: run } };
  assert.deepEqual(confirmedRunCombatPower(field, run.runId)?.profile.alpha, alpha);
  assert.equal(confirmedRunCombatPower(field, run.runId)?.profile.gearImpactV31.offense, 9);
  assert.equal(confirmedRunCombatPower(field, run.runId)?.petDeployed, false);
  assert.equal(confirmedRunCombatPower(field, "another-run"), null, "never leak a previous run's power");
  assert.equal(confirmedRunCombatPower(field, null), null, "no run means no V3 claim");
  assert.equal(confirmedRunCombatPower(null, run.runId), null, "account switch hides stale data");
  assert.equal(confirmedRunCombatPower({ fieldOps: { activeMissionRun: { ...run, rulesContract: null } } }, run.runId), null);
  assert.equal(confirmedRunCombatPower({ fieldOps: { activeMissionRun: { ...run, combatProfileV3: null } } }, run.runId), null);
  assert.equal(confirmedRunCombatPower({ fieldOps: { activeMissionRun: { ...run, combatProfileV3: { ...v3, alpha: { ...alpha, hp: 900 } } } } }, run.runId), null);

  const pet = { id: "wolf", name: "Wolf", img: "https://example.test/wolf.png", hp: 82, atk: 23, def: 8, spd: 14 };
  const petRun = { ...run, combatProfileV2: { pet: { id: pet.id } }, combatProfileV3: { ...v3, pet }, squadIds: ["alpha", `pet:${pet.id}`, "ally-03"] };
  const petResult = confirmedRunCombatPower({ fieldOps: { activeMissionRun: petRun } }, run.runId);
  assert.equal(petResult?.petDeployed, true);
  assert.equal(petResult?.profile.pet?.hp, 82);
  assert.equal(confirmedRunCombatPower({ fieldOps: { activeMissionRun: { ...petRun, combatProfileV2: v2 } } }, run.runId), null, "pet must match frozen inputs");
  assert.equal(confirmedRunCombatPower({ fieldOps: { activeMissionRun: { ...petRun, squadIds: ["alpha", "ally-02", "ally-03"] } } }, run.runId)?.petDeployed, false);

  const trial = { signalTrials: { activeRun: { ...run, runId: "trial_confirmed_01" } } };
  assert.equal(confirmedRunCombatPower(trial, "trial_confirmed_01")?.profile.alpha.atk, 36);
  const chapter = { chapterActiveMission: { ...run, runId: "chapter_confirmed_01" } };
  assert.equal(confirmedRunCombatPower(chapter, "chapter_confirmed_01")?.profile.alpha.hp, 128);
  const foundation = {
    activeRunId: "foundation_confirmed_01",
    foundationRunRules: { runId: "foundation_confirmed_01", rulesContract: { combatProfileVersion: 3 } },
    activeCombatProfileV3: v3, activeCombatProfileV2: v2,
  };
  assert.equal(confirmedRunCombatPower(foundation, foundation.activeRunId)?.profile.alpha.spd, 15);
  assert.equal(confirmedRunCombatPower({ ...foundation, foundationRunRules: { ...foundation.foundationRunRules, runId: "wrong" } }, foundation.activeRunId), null);
  assert.equal(confirmedRunCombatPower({ ...foundation, activeCombatProfileV3: undefined }, foundation.activeRunId), null);

  const app = readFileSync("tactical-ops-src/ui/App.tsx", "utf8");
  const battle = readFileSync("tactical-ops-src/ui/Battle.tsx", "utf8");
  const css = readFileSync("tactical-ops-src/tactical.css", "utf8");
  assert.match(app, /resuming \? confirmedRunCombatPower/);
  assert.match(app, /ACCEPTED COMBAT POWER/);
  assert.match(app, /Gear changes apply to a new battle/);
  assert.match(battle, /confirmedRunCombatPower\(progression, currentRunKey\)/);
  assert.match(battle, /SERVER-LOCKED V3/);
  assert.match(css, /\.t-battle-hud-rail \.t-run-power-chip/);
  console.log("PASS Tactical Power V1: frozen V3 and pet, run binding, resume, legacy fail-closed, static UI contracts");
} finally {
  await vite.close();
}
