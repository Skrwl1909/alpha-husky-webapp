/** Player Voice V1: receipt truth and authored player-readable UX. Synthetic only. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
const vite = await createServer({ configFile:false, server:{middlewareMode:true,hmr:false}, appType:"custom" });
try {
 const [impact, field, opportunity, operations] = await Promise.all([
  vite.ssrLoadModule("/tactical-ops-src/ui/afterActionImpact.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/livingBattlefield.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/progressionOpportunity.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/operations.ts")
 ]);
 const base = { runId:"synthetic", missionId:"field-relay-hold", victory:true,
   pressureBefore:2,pressureAfter:1,regionalApplied:true,rankBefore:3,rankAfter:3,
   progressEarned:2, firstCycleSecure:true, masteryChanges:[],
   veteranCareer:{before:3,after:3,unlocked:false,reason:"ROTATION_CREDIT_USED"} };
 const p32=impact.recordedImpact({...base,pressureBefore:3,pressureAfter:2},null);
 assert.equal(p32.title,"PRESSURE DOWN.");
 assert.equal(p32.beat,"step");
 assert.match(p32.detail,/still arrives on schedule/);
 const p21=impact.recordedImpact(base,null);
 assert.equal(p21.title,"HOUND HELD BACK!");
 assert.equal(p21.beat,"breakthrough");
 assert.match(p21.detail,/1 round later/);
 assert.match(p21.detail,/Ongoing missions keep their timing/);
 const p10=impact.recordedImpact({...base,pressureBefore:1,pressureAfter:0},null);
 assert.equal(p10.title,"AREA CLEAR!");
 assert.equal(p10.beat,"clear");
 assert.match(p10.detail,/No extra delay stacks/);
 const replay=impact.recordedImpact({...base,regionalApplied:false,firstCycleSecure:false},null);
 assert.equal(replay.title,"WIN SAVED");
 assert.doesNotMatch(replay.detail,/HOUND|extra round/i);
 const failed=impact.recordedImpact({...base,victory:false,regionalApplied:false,firstCycleSecure:false},null);
 assert.equal(failed.title,"ATTEMPT SAVED");
 const promotion=impact.recordedImpact({...base,rankAfter:4,regionalApplied:false},null);
 assert.equal(promotion.kind,"milestone");
 const now=field.fieldWindow(operations.getMissionDef("field-relay-hold"),{pressure:1,reportVersion:3,directiveSet:"pursuit",directiveTier:"standard"});
 assert(now?.delayed && now.actualRound===now.baseRound+1,"real resolver must own the delayed round");
 const original={pressure:2,reportVersion:3,directiveSet:"pursuit",directiveTier:"standard"};
 const saved=structuredClone(original);
 const frozen=field.fieldWindow(operations.getMissionDef("field-relay-hold"),original);
 assert.equal(frozen?.delayed,false);
 assert.deepEqual(original,saved,"frozen accepted context cannot mutate");
 const brief=readFileSync("tactical-ops-src/ui/App.tsx","utf8");
 const battle=readFileSync("tactical-ops-src/ui/Battle.tsx","utf8");
 const results=readFileSync("tactical-ops-src/ui/FieldOpResults.tsx","utf8");
 const css=readFileSync("tactical-ops-src/ui/fieldOpResults.css","utf8");
 assert(brief.includes('GET TO THE RELAY. USE RECOVER.'),"clear first-read goal");
 assert(brief.includes('FULL RECOVER RULES'),"precise rules stay available");
 assert(brief.includes('mission?.directive?.recoverEveryRounds'),"do not invent a fixed timing");
 assert(brief.includes('const quickRecover = recoverBrief && !(mission?.objective?.type === "RECOVER" && mission.objective.squadExtractionRadius != null);'),"special Recover modes not overwritten");
 assert(brief.includes('data-opportunity-status={veteranBrief.status}'),"Veteran status still server-owned");
 assert(brief.includes('primaryPurpose.resume ? "ACCEPTED OPERATION" : "NEXT OPERATION"'),"War Table speaks clearly");
 assert(battle.includes('acceptedWindow?.delayed && activeHound'),"no claimed battlefield advantage without engine timing");
 assert(battle.includes('acceptedWindow.actualRound === activeHound.triggerRound'),"match actual combat round");
 assert(battle.includes('data-player-voice-hound'),"visible HUD benefit");
 assert(results.includes('data-impact-beat={impact.beat}'),"graded result emphasis");
 assert(results.includes('victory ? "VICTORY" : "DEFEAT"'),"defeats must not be called wins");
 assert(results.includes('className="t-fr-ledger"'),"unchanged accounting still expandable");
 for(const k of ["step","breakthrough","clear"])
   assert(css.includes('data-impact-beat="'+k+'"'),"impact beat styling "+k);
 const view=opportunity.veteranOpportunityView();
 assert.equal(view.status,"unknown");
 assert.doesNotMatch(view.copy,/guaranteed|granted/i,"missing server projection cannot promise a reward");
 const words=[p32.title,p21.title,p10.title];
 assert(words.every(t=>t.length<=25),"headlines should be glanceable on mobile");
 console.log("PASS Player Voice V1: pressure 3→2 / 2→1 / 1→0, receipt states, frozen run, HOUND timing, brief/war table/battle/results, mobile emphasis");
} finally { await vite.close(); }
