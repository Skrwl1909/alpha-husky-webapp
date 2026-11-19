import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {createServer} from "vite";

const vite = await createServer({configFile:false, server:{middlewareMode:true, hmr:false}});
try {
  const {stepRecover} = await vite.ssrLoadModule("/tactical-ops-src/combat/recoverAuthority.ts");
  const {newS3Proof, recordS3Skill} = await vite.ssrLoadModule("/tactical-ops-src/ui/s3CombatProof.ts");
  // An optional installed worker exercises the exact previous release over its stdin contract.
  const worker = process.argv[2];
  const step = worker ? (encounter, snapshot, command) => JSON.parse(execFileSync(process.execPath, [worker], {
    input:JSON.stringify({encounter, snapshot, command}), encoding:"utf8",
  })) : stepRecover;
  const missionId = "field-relay-recovery";
  const regular = {
    missionId, squadIds:["alpha","ally-02","ally-03"], packMastery:{},
    combatProfileV2:{pet:null},
    combatProfileV3:{version:3, mode:"battle-v1", alpha:{hp:120, atk:28, def:12, spd:14}, pet:null},
    fieldContext:{cycleId:0, pressure:3, approach:"standard", reportVersion:3, directiveTier:"standard", directiveSet:"pursuit"},
    rulesContract:{source:"BACKEND_SNAPSHOT", rulesetVersion:"tactical-intent-vnext.0", missionId, missionRevision:1,
      combatProfileVersion:3, masterySnapshotVersion:1, rewardPolicyVersion:1},
  };

  for (const rank of [0,1,2]) {
    const encounter = {...regular, playerGrowth:{version:1, revision:8, heroes:regular.squadIds.map(heroId => ({
      heroId, discipline:heroId==="alpha" && rank ? "vanguard" : null,
      ranks:heroId==="alpha" && rank ? {"alpha-strike":rank} : {},
    }))}};
    const initial = step(encounter);
    for (const [column, distance] of [[4,2],[3,3]]) {
      const moved = step(encounter, initial, {type:"move", c:column, r:3});
      const actor = moved.battle.units.find(u => u.id === moved.battle.activeId);
      const target = moved.battle.units.find(u => u.id === "h1");
      assert.equal(Math.max(Math.abs(actor.c-target.c),Math.abs(actor.r-target.r)),distance);
      const hit = step(encounter, moved, {type:"skill", skillId:"alpha-strike", targetId:target.id});
      assert.equal(Boolean(hit), distance <= rank+1);
      if (hit) {
        const frame = hit.frames.find(f => f.skillId === "alpha-strike");
        const proof = recordS3Skill(newS3Proof("accepted",missionId),actor,frame.skillId,target.id,frame.events,false,moved.battle);
        assert.match(proof.buildMoment, /STRIKE/i);
      }
    }
  }
  console.log("PASS: same target at 2 tiles rejected at R0, accepted at R1/R2; at 3 tiles accepted only at R2.");
} finally { await vite.close(); }
