#!/usr/bin/env node
/** Combined current-main release boundary for meaningful builds + battlefield decisions.
 * Existing dedicated suites remain authorities; this gate guarantees both run together.
 * Server-owned Growth V2 is now canonical; this gate does not migrate accounts
 * or replace private auth/device testing. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
const growth=read('tactical-ops-src/data/playerGrowth.ts');
const battle=read('tactical-ops-src/ui/Battle.tsx');
const p5=read('tactical-ops-src/ui/battlePresentation.ts');
const host=read('tactical-ops-src/host/foundationProgression.ts');
assert(growth.includes('rulesVersion'),'V1/V2 growth separation must survive');
assert(growth.includes('u03-mend'),'meaningful rescue repair remains present');
assert(battle.includes('deriveBattlePresentation'),'canonical Battle must use the P5 decision director');
assert(p5.includes('deriveBattlePresentation'),'P5 decision director is missing');
assert(host.includes('parseGrowthProgression'),'canonical backend Growth V2 must be parsed');
const run=(name,script)=>{
  const result=spawnSync(process.execPath,[script],{encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});
  if(result.stdout)process.stdout.write(result.stdout);
  if(result.stderr)process.stderr.write(result.stderr);
  assert.equal(result.status,0,name+' must PASS against the same current source and accepted-run semantics');
};
run('G1 meaningful combat deltas','tools/verify_tactical_g1_fieldcraft.mjs');
run('P5 battlefield decision and targeting','tools/verify_tactical_battlefield_p5.mjs');
run('G1 transaction truth','tools/verify_tactical_g1_transactions.mjs');
run('VNext accepted-run wire','tools/verify_tactical_vnext_run_contract_wire.mjs');

/**
 * Cross-system executable proof, not just two independent smoke suites:
 * the SAME accepted V2 build must give SHADOW a legal range-4 MEND target
 * while P5 prioritizes a real announced threat, and the engine must heal.
 * A frozen V1 snapshot must still reject that out-of-range heal.
 * All data is synthetic; this does not contact the private backend.
 */
async function verifyCombinedBattle() {
  const {createServer}=await import('vite');
  const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
  try {
    const load=p=>vite.ssrLoadModule('/tactical-ops-src/'+p+'.ts');
    const [growth,side,battle,skills,ui,intent,types]=await Promise.all([
      'data/playerGrowth','data/shadowSidegrade','combat/battle',
      'combat/skills','ui/battlePresentation','combat/intentContract',
      'combat/types',
    ].map(load));
    types.selectAcceptedBattleRules({rulesetVersion:intent.TACTICAL_VNEXT_RULESET});
    const heroes=[
      {heroId:'alpha',discipline:'vanguard',ranks:{}},
      {heroId:'ally-02',discipline:'pursuer',ranks:{}},
      {heroId:'ally-03',discipline:'medic',ranks:{'u03-mend':1}},
    ];
    const issued={version:2,revision:17,heroes};
    const spawns=side.withTeammateSidegrades([
      {id:'alpha',defId:'alpha',c:3,r:1},
      {id:'ally-03',defId:'ally-03',c:0,r:1},
      {id:'enemy',defId:'hostile',c:5,r:1},
    ],{shadowSidegrade:'B'});
    function makeBattle(snapshot) {
      let b=battle.createBattle(null,spawns,null,null,null,null,snapshot);
      return {...b,activeId:'ally-03',mode:'targeting',actionSkillId:'u03-mend',
        units:b.units.map(u=>u.id==='alpha'?{...u,c:4,r:1,hp:20}:
          u.id==='ally-03'?{...u,c:0,r:1}: { ...u,c:6,r:2 })};
    }
    const v2=makeBattle(issued);
    const shadow=v2.units.find(u=>u.id==='ally-03');
    assert.equal(shadow.growth.rulesVersion,2);
    const mend=skills.unitSkills(shadow).find(s=>s.name==='MEND');
    assert.equal(mend.maxRange,4,'server-issued V2 MEND R1 reaches 4 cells');
    const threatened=intent.announceIntent({
      id:'combined-v2-p5',enemyId:'enemy',kind:'ATTACK',
      targetUnitId:'alpha',targetTile:{c:4,r:1},
      impactTiles:[{c:4,r:1}],predictedEffect:'Announced strike',
      warnsOnUnitTurn:3,resolvesOnUnitTurn:4,
      responses:['REPOSITION','DISRUPT'],fallbackPolicy:'CANCEL',
    },v2).plan;
    const input={battle:v2,busy:false,
      activeRulesetVersion:intent.TACTICAL_VNEXT_RULESET,threats:[threatened],
      combatMoment:null,combatFx:[],consequences:[],floats:[],
      banner:null,mission:null};
    const decision=ui.deriveBattlePresentation(input);
    assert.equal(decision.mode,'REACT','announced danger retains P5 headline');
    assert.equal(decision.targeting,true,'P5 does not hide legal targeting');
    assert(decision.targetIds.includes('alpha'),'MEND R1 range-4 ally must be a legal P5 target');
    assert(decision.danger.has('4,1'),'threat tile remains visible');
    const cast=skills.applySkill(v2,mend.id,'alpha');
    assert(cast.ok,'real engine must accept P5 displayed heal');
    const heal=cast.events.find(e=>e.type==='heal' && e.unitId==='alpha');
    assert(heal && heal.amount>0,'real engine actually heals the target');
    const resolved=ui.deriveBattlePresentation({...input,battle:cast.state,busy:true,
      threats:[],floats:[{unitId:'alpha',text:'+'+heal.amount,kind:'heal'}]});
    assert.equal(resolved.result,'HEAL +'+heal.amount+' · ALPHA',
      'P5 must report confirmed heal, not projected impact');
    issued.heroes[2].ranks['u03-mend']=0;
    assert.equal(v2.units.find(u=>u.id==='ally-03').growth.ranks['u03-mend'],1,
      'accepted V2 build frozen against later account mutation');

    const legacy=makeBattle({version:1,revision:12,heroes:[
      {heroId:'alpha',discipline:'vanguard',ranks:{}},
      {heroId:'ally-02',discipline:'pursuer',ranks:{}},
      {heroId:'ally-03',discipline:'medic',ranks:{'u03-mend':1}},
    ]});
    const oldShadow=legacy.units.find(u=>u.id==='ally-03');
    assert.equal(oldShadow.growth.rulesVersion,1);
    const oldMend=skills.unitSkills(oldShadow).find(s=>s.name==='MEND');
    assert.equal(oldMend.maxRange,3,'frozen V1 keeps historical reach');
    const oldDecision=ui.deriveBattlePresentation({...input,battle:legacy,threats:[]});
    assert(!oldDecision.targetIds.includes('alpha'),'P5 must not offer illegal V1 target');
    assert.equal(skills.applySkill(legacy,oldMend.id,'alpha').ok,false,
      'engine must reject the same illegal V1 cast');
    console.log('PASS: combined V2 MEND R1 + P5 threat/target/heal + frozen V1 real-engine cross-proof');
  } finally {
    await vite.close();
  }
}
await verifyCombinedBattle();

console.log('PASS: current-main combined G1+P5 release boundary; private backend/device QA separate');
