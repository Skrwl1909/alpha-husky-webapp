#!/usr/bin/env node
/** PR1B regression: exercise actual TS module imports and createBattle, not just string matching. */
import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});
try {
  const [{ parseCombatProfileV2 }, { parseCombatProfileV3, applyRunCombatProfile }, { recoverSpawnsForSquad }, { createBattle }] = await Promise.all([
    server.ssrLoadModule("/tactical-ops-src/combat/combatProfile.ts"),
    server.ssrLoadModule("/tactical-ops-src/combat/combatProfileV3.ts"),
    server.ssrLoadModule("/tactical-ops-src/data/operations.ts"),
    server.ssrLoadModule("/tactical-ops-src/combat/battle.ts"),
  ]);
  const zero = { strength: 0, agility: 0, defense: 0, vitality: 0, intelligence: 0, luck: 0 };
  const petIdentity = { id: "test-pet-a", name: "Test pet", img: "https://example.invalid/pet.png" };
  const v2 = (pet) => parseCombatProfileV2({
    version: 2, mode: "inputs-only",
    alpha: { level: 12, base: zero, gear: zero },
    pet: pet ? { ...petIdentity, level: 5, effective: zero } : null,
  });
  const v3 = (pet) => parseCombatProfileV3({
    version: 3, mode: "battle-v1",
    alpha: { hp: 130, atk: 33, def: 15, spd: 15 },
    pet: pet ? { ...petIdentity, hp: 85, atk: 22, def: 8, spd: 14 } : null,
  });

  const freshNonPet = recoverSpawnsForSquad(["alpha", "ally-02"]);
  assert.ok(freshNonPet);
  const legacy = createBattle(null, applyRunCombatProfile(freshNonPet, null, null));
  assert.equal(legacy.units.find(u => u.id === "alpha").atk, 28, "legacy alpha base ATK");
  const evolved = createBattle(null, applyRunCombatProfile(freshNonPet, v3(false), v2(false)));
  assert.equal(evolved.units.find(u => u.id === "alpha").atk, 33, "V3 Alpha attack reaches actual battle");
  assert.equal(evolved.units.find(u => u.id === "alpha").maxHp, 130, "V3 Alpha HP reaches actual battle");
  assert.equal(evolved.units.find(u => u.id === "ally-02").atk, legacy.units.find(u => u.id === "ally-02").atk, "other allies unchanged");
  assert.equal(evolved.units.find(u => u.team === "enemy").atk, legacy.units.find(u => u.team === "enemy").atk, "enemies unchanged");

  const petSpawns = recoverSpawnsForSquad(["alpha", "pet:test-pet-a"], petIdentity);
  assert.ok(petSpawns);
  const petBattle = createBattle(null, applyRunCombatProfile(petSpawns, v3(true), v2(true)));
  assert.equal(petBattle.units.find(u => u.id === "pet:test-pet-a").atk, 22, "deployed pet attack reaches actual battle");
  assert.equal(petBattle.units.find(u => u.id === "pet:test-pet-a").maxHp, 85, "pet HP reaches actual battle");
  assert.equal(petBattle.units.find(u => u.id === "alpha").atk, 33, "pet not double-counted into Alpha");
  assert.throws(() => applyRunCombatProfile(petSpawns, v3(true), v2(false)), /combat_profile_version_mismatch/);
  assert.throws(() => applyRunCombatProfile(freshNonPet, v3(true), v2(true)), /combat_squad_mismatch/);
  assert.throws(() => parseCombatProfileV3({ version:3, mode:"battle-v1", alpha:{ hp: 999, atk: 33, def:15, spd:15 }, pet:null }), /invalid_combat_profile_v3/);
  console.log("PR1B_PASS: legacy, Alpha, pet, enemy neutrality, squad mismatch, corrupt V3 — actual createBattle()");
} finally {
  await server.close();
}
