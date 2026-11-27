/** Compare a built power worker with the pinned production worker for one variant.
 * Matching V3 stats means the power path must not change combat. Exit 0 only on parity.
 */
import {spawn} from "node:child_process";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const [family, legacyPath, powerPath] = process.argv.slice(2);
if (!family || !legacyPath || !powerPath) {
  console.error("usage: node tools/verify_power_worker_parity.mjs <operation|counterstrike|last-howl> <legacy.cjs> <power.cjs>");
  process.exit(2);
}
const projection = {
  version: "tactical-power-projection-p2.v1",
  activation: "LAB_ONLY",
  canonicalSnapshotId: "a".repeat(64),
  initiativeSource: "tactical-combat-profile-v3",
  legacyProfileId: "b".repeat(64),
  alpha: {hp: 120, atk: 28, def: 12, spd: 14},
  gearImpactPolicy: "included-in-canonical-attributes-no-v31-carry",
  projectionId: "c".repeat(64),
};
const v3 = {version: 3, mode: "battle-v1", alpha: {hp: 120, atk: 28, def: 12, spd: 14}, pet: null};
const rules = {source: "BACKEND_SNAPSHOT", rulesetVersion: "tactical-intent-vnext.0", missionRevision: 1,
  combatProfileVersion: 3, masterySnapshotVersion: 1, rewardPolicyVersion: 1};
function encounter() {
  if (family === "operation") {
    return {
      runId: "field_recover_v1_" + "ab".repeat(16),
      missionId: "field-relay-recovery",
      squadIds: ["alpha", "ally-02", "ally-03"],
      packMastery: {},
      fieldContext: {cycleId: 7, pressure: 1, approach: "standard", reportVersion: 3, directiveTier: "standard", directiveSet: "pursuit"},
      rulesContract: {...rules, missionId: "field-relay-recovery"},
      combatProfileV2: {version: 2, mode: "inputs-only", alpha: {level: 1, base: {}, gear: {}}, pet: null},
      combatProfileV3: v3,
    };
  }
  if (family === "counterstrike") {
    return {
      runId: "counterstrike_v1_" + "cd".repeat(16),
      missionId: "counterstrike-false-relay",
      squadIds: ["alpha", "ally-02", "ally-03"],
      packMastery: {},
      combatProfileV2: {pet: null},
      combatProfileV3: v3,
      rulesContract: {...rules, missionId: "counterstrike-false-relay"},
      counterstrikeContract: {version: 1, rulesetVersion: "counterstrike-false-relay.1", missionRevision: 1, reinforcementDelay: 0, intelStatus: "NONE", intelConsumedByRunId: null},
      kodaSidegrade: null, shadowSidegrade: null,
    };
  }
  return {
    seed: 7, squadIds: ["alpha", "ally-02", "ally-03"], combatProfileV2: {pet: null},
    packMastery: {}, activeCombatProfileV3: v3,
  };
}
function signature(result) {
  if (result == null) return {rejected: true};
  const battle = result.battle || result.snapshot?.battle;
  if (!battle) return {missing: true};
  return {
    outcome: battle.outcome,
    round: battle.round,
    units: (battle.units || []).map(unit => ({
      id: unit.id, hp: unit.hp, maxHp: unit.maxHp, atk: unit.atk, def: unit.def, spd: unit.spd,
      c: unit.c, r: unit.r, defeated: unit.defeated,
    })),
  };
}
function run(file, payload) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], {stdio: ["pipe", "pipe", "pipe"]});
    let out = "", err = "";
    child.stdout.on("data", chunk => { out += chunk; });
    child.stderr.on("data", chunk => { err += chunk; });
    child.on("error", reject);
    child.on("close", code => {
      if (code) reject(new Error(file + " exit " + code + " " + err.slice(0, 400)));
      else resolve(out);
    });
    child.stdin.end(JSON.stringify(payload));
  });
}
const base = encounter();
const powered = {...base, powerProjection: projection};
const [legacyText, powerText] = await Promise.all([
  run(legacyPath, {encounter: base}),
  run(powerPath, {encounter: powered}),
]);
const legacy = JSON.parse(legacyText);
const poweredResult = JSON.parse(powerText);
const left = signature(legacy);
const right = signature(poweredResult);
let commandParity = null;
if (JSON.stringify(left) === JSON.stringify(right) && left.outcome === "ongoing") {
  const snap = family === "operation"
    ? {battle: legacy.battle, cycle: legacy.cycle, statusSequence: legacy.statusSequence}
    : legacy.snapshot;
  const poweredSnap = {...snap, projectionId: projection.projectionId};
  const [legacyStep, powerStep] = await Promise.all([
    run(legacyPath, {encounter: base, snapshot: snap, command: {type: "skip"}}),
    run(powerPath, {encounter: powered, snapshot: poweredSnap, command: {type: "skip"}}),
  ]);
  const a = JSON.parse(legacyStep);
  const b = JSON.parse(powerStep);
  commandParity = JSON.stringify(signature(a)) === JSON.stringify(signature(b));
}
const same = JSON.stringify(left) === JSON.stringify(right) && commandParity !== false;
const digest = createHash("sha256").update(readFileSync(powerPath)).digest("hex");
console.log(JSON.stringify({family, parity: same, commandParity, sha256: digest, legacy: left, power: same ? undefined : right}));
process.exit(same ? 0 : 1);
