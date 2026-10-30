import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createServer} from "vite";
globalThis.window={location:{search:"?tacticalBattlefieldVNext=1"},localStorage:{getItem:()=>null}};
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
 const [battle,guide,ops]=await Promise.all([
  vite.ssrLoadModule("/tactical-ops-src/combat/battle.ts"),
  vite.ssrLoadModule("/tactical-ops-src/ui/playerGuidance.ts"),
  vite.ssrLoadModule("/tactical-ops-src/data/operations.ts")
 ]);
 const initial=battle.createBattle(null,[
 {id:"alpha",defId:"alpha",c:1,r:1},{id:"ally-02",defId:"ally-02",c:1,r:2},
 {id:"ally-03",defId:"ally-03",c:1,r:3},{id:"enemy",defId:"hostile",c:7,r:1}
 ]);
 const down={...initial,units:initial.units.map(u=>u.id==="alpha"?{...u,hp:0,defeated:true}:u)};
 assert.equal(battle.evaluateOutcome(down).outcome,"ongoing","Alpha loss alone cannot end fight");
 const cnc={...down,activeId:"ally-02",mode:"selected"};
 const sh=cnc.units.find(u=>u.id==="ally-03");
 assert(sh.skillIds.includes("u03-tap"),"Shadow retains offensive attack");
 assert.equal(guide.playerBattleGuidance(cnc,ops.MISSION_DEFS["field-rearguard"]).title,"THE PACK FIGHTS ON");
 const invalid={...cnc,mode:"targeting",actionSkillId:"u02-shot"};
 const hint=guide.playerBattleGuidance(invalid,ops.MISSION_DEFS["field-rearguard"]);
 assert.equal(hint.title,"NO TARGET IN RANGE");
 assert(hint.copy.includes("Tap the skill again to cancel"),"escape route explicitly explained");
 const failed=battle.trySkill(invalid,"u02-shot","enemy");
 assert.equal(failed.ok,false,"invalid shot never consumes action");
 assert.equal(failed.state.units.find(u=>u.id==="ally-02").hasActed,false);
 const skip=battle.trySkip(cnc); assert(skip.ok,"CNC may skip without Alpha");
 const next=battle.advanceToNext({...skip.state,activeId:null});
 assert.notEqual(next.state.outcome,"defeat");
 const field=readFileSync("tactical-ops-src/ui/App.tsx","utf8");
 const view=readFileSync("tactical-ops-src/ui/Battle.tsx","utf8");
 assert(field.includes("commandPurpose(progression)")&&field.includes("FIELD OPS SECURED")&&field.includes("t-wt-next-op"),"one actionable next mission with rotation progress");
 assert(!field.includes('className="t-player-route" aria-label="Your next tactical goal"'),"do not duplicate recommended mission on phone");
 assert(field.includes("OPERATION {activeMissionIds.indexOf"),"mission identity");
 assert(field.includes("t-player-result-meaning"),"results progression explanation");
 assert(view.includes("deriveBattlePresentation") && readFileSync("tactical-ops-src/ui/battlePresentation.ts","utf8").includes("playerBattleGuidance(battle, input.mission)"),"in-battle escape and objective hints routed through director");
 assert(view.includes("role=\"status\""),"accessible notice");
 console.log("PASS Player Clarity: Alpha-down allied continuation, invalid target recovery, skip, mission identity, next step, progress feedback");
} finally {await vite.close();}
