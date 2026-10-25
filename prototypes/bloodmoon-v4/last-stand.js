import {Encounter,fromRecording} from './simulation.js';
import {bindInput} from './input.js';
import {loadAssets,bossImage} from './assets.js';
import {Presentation,combatCue,combatVisuals,PLAYER_VISUAL} from './presentation.js';
import {LOCAL_PROFILES} from './combat-parameters.js';
import {DEMO_SCENARIOS} from './p2/demo-profiles.js';
import {P3_PROFILES} from './p3/balance.js';
const scenarioFor=value=>value.startsWith('p3-')?P3_PROFILES[value.slice(3)]:DEMO_SCENARIOS[value];
const $=id=>document.getElementById(id),canvas=$('arena');
let game=new Encounter(1909,{},scenarioFor($('profile').value)?.parameters??LOCAL_PROFILES[$('profile').value]),running=false,playback=null,replayIndex=0,saved=null;
let accumulator=0,previous=0,presentation=null,assetResult=null,renderedState='loading';
const input=bindInput(canvas,(x,y)=>{if(running&&!playback)game.setInput(x,y);});
$('lite').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
function start(record=null){
  if(!assetResult?.ready)return;
  input.reset();playback=record;replayIndex=0;presentation.reset();
  const scenario=scenarioFor($('profile').value);
  game=record?fromRecording(record):new Encounter(1909,{},scenario?.parameters??LOCAL_PROFILES[$('profile').value]);
  $('player-hp').max=game.t.playerHP;$('boss-hp').max=game.t.bossHP;
  accumulator=0;previous=0;running=true;$('overlay').hidden=true;$('profile').disabled=true;
  $('developer').open=false;window.scrollTo(0,0);document.body.classList.add('combat-active');
}
$('start').onclick=()=>start();$('restart').onclick=()=>start();
function showResolution(){
  const scenario=scenarioFor($('profile').value);
  $('resolution-status').textContent=scenario?`${scenario.label}: ${scenario.parameters.player.maxHP} HP, ${Number(scenario.parameters.player.damagePerHit.toFixed(3))} damage/hit, ${scenario.parameters.enemy.damagePerHit} incoming. Fixed 1000 boss HP. ${scenario.resolved?'Last Stand support + bounded offense; ward limits one hit to 40% HP. ':''}Proposed demo tuning; no account integration. No attempts, contribution or rewards.`:'P1 local strength fixture; not account data.';
}
$('profile').onchange=showResolution;showResolution();
$('replay').onclick=()=>{if(saved)start(saved);};
$('export').onclick=()=>{
  const blob=new Blob([JSON.stringify({recording:game.recording(),events:game.events},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='last-stand-log.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
function render(){
  const g=game,p=g.player,b=g.boss;
  document.body.classList.toggle('reduced-motion',$('lite').checked);
  renderedState=presentation?.draw(g,input.anchor,$('lite').checked)??'loading';
  $('player-hp').max=g.t.playerHP;$('boss-hp').max=g.t.bossHP;
  $('player-hp').value=p.hp;$('boss-hp').value=b.hp;
  $('player-value').textContent=`${Number(p.hp.toFixed(1))} / ${g.t.playerHP}`;$('boss-value').textContent=`${Number(b.hp.toFixed(1))} / ${g.t.bossHP}`;
  $('player-hp').classList.toggle('damaged',g.time-g.hurtAt<.25);$('boss-hp').classList.toggle('damaged',g.time-g.shotAt<.12);
  const escalation=g.events.findLast(e=>e.type==='escalation'),notice=$('escalation');
  notice.hidden=!running||!escalation||g.time-escalation.tick*g.t.step>=2;
  notice.textContent=escalation?.pressure===2?'HUSK ENRAGED · Keep dodging, then counter':'HUSK STIRS · Faster recovery, mixed attacks';
  const cue=combatCue(g),ready=!running&&g.tick===0;
  $('clock').textContent=`${g.time.toFixed(1)} / ${g.t.limit}s`;
  $('phase-label').textContent=ready?'STAND BY':`${playback?'REPLAY · ':''}${cue.label}`;
  $('status').parentElement.dataset.phase=ready?'ready':cue.phase;
  $('status').textContent=!assetResult?'Loading encounter art…':!assetResult.ready?'Essential art unavailable · reload to retry':ready?'Tower Husk · 75-second encounter.':cue.message;
  $('events').textContent=g.events.slice(-12).map(e=>`${(e.tick*g.t.step).toFixed(2)} ${e.type} ${e.kind??''} ${e.hp??''}${e.type==='escalation'?` stage ${e.pressure} · ${e.recovery*1000}ms recovery`:''}`).join('\n');
}
function frame(ms){
  if(!previous)previous=ms;
  if(running&&!document.hidden){
    accumulator+=Math.min(.1,(ms-previous)/1000);
    while(accumulator>=game.t.step&&running){
      if(playback)while(playback.trace[replayIndex]?.tick===game.tick){const p=playback.trace[replayIndex++];game.setInput(p.x,p.y);}
      game.step();accumulator-=game.t.step;
      if(game.status!=='playing'){
        running=false;input.reset();$('profile').disabled=false;document.body.classList.remove('combat-active');
        if(!playback)saved=game.recording();
        $('replay').disabled=!saved;$('overlay').hidden=false;$('overlay').dataset.outcome=game.status;
        $('result').textContent=game.status==='won'?'Tower Husk defeated':game.status==='timeout'?'The moon has faded':'Howler fallen';
        $('encounter-caption').textContent=game.status==='won'?'LAST STAND · VICTORY':'LAST STAND · DEFEAT';
        const last=game.events.findLast(e=>e.type==='player-hit');
        $('summary').textContent=`${game.time.toFixed(1)}s · Howler ${Number(game.player.hp.toFixed(1))} / ${game.t.playerHP} HP · Husk ${Number(game.boss.hp.toFixed(1))} / ${game.t.bossHP} HP.${last?` Last hit: ${last.kind}.`:''} ${game.status==='won'?'You held your ground.':'Read the warning. Dodge, then stop to counter.'}`;
        $('start').textContent='Fight again';
      }
    }
  }
  previous=ms;render();requestAnimationFrame(frame);
}
window.lastStand={snapshot:()=>structuredClone({tick:game.tick,time:game.time,status:game.status,player:game.player,boss:game.boss,phase:game.phase,phaseTime:game.phaseTime,pressure:game.pressure,attack:game.attack,input:game.input,moving:game.moving,events:game.events,playback:!!playback}),recording:()=>game.recording(),
  visuals:()=>structuredClone({ready:assetResult?.ready??false,failures:assetResult?.failures??[],loaded:Object.keys(assetResult?.images??{}),bossState:renderedState,bossSource:bossImage(assetResult?.images??{},renderedState)?.src??null,playerFrameDirection:presentation?.direction,playerSize:PLAYER_VISUAL.size,hitboxRadius:game.t.playerRadius,feedback:combatVisuals(game,$('lite').checked)})};
assetResult=await loadAssets();
$('start').disabled=!assetResult.ready;$('restart').disabled=!assetResult.ready;
if(assetResult.ready){presentation=new Presentation(canvas,assetResult.images);$('asset-status').textContent=assetResult.failures.length?`Optional art unavailable: ${assetResult.failures.join(', ')}. Boss states fall back to idle.`:'Original Alpha Husky art loaded';}
else{$('result').textContent='Encounter art unavailable';$('summary').textContent='An essential asset could not load. Reload to retry.';$('asset-status').textContent=`Unavailable: ${assetResult.failures.join(', ')}`;}
requestAnimationFrame(frame);
