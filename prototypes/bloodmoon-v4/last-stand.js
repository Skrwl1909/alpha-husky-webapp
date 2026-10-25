import {Encounter,fromRecording,replay} from './simulation.js';
import {bindInput} from './input.js';
import {loadAssets,bossImage} from './assets.js';
import {Presentation,combatCue,combatVisuals,PLAYER_VISUAL} from './presentation.js';
import {LOCAL_PROFILES} from './combat-parameters.js';
import {DEMO_SCENARIOS} from './p2/demo-profiles.js';
import {P3_PROFILES} from './p3/balance.js';
import {combatParameters} from './combat-parameters.js';
import {integratedMode,childTransport} from './integration.js';
const scenarioFor=value=>value.startsWith('p3-')?P3_PROFILES[value.slice(3)]:DEMO_SCENARIOS[value];
const $=id=>document.getElementById(id),canvas=$('arena');
let game=new Encounter(1909,{},scenarioFor($('profile').value)?.parameters??LOCAL_PROFILES[$('profile').value]),running=false,playback=null,replayIndex=0,saved=null;
let accumulator=0,previous=0,presentation=null,assetResult=null,renderedState='loading';
const input=bindInput(canvas,(x,y)=>{if(running&&!playback)game.setInput(x,y);});
$('lite').checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
const integrated=integratedMode();let transport=null,ticket=null,context=null,busy=false,pendingSubmission=null,verified=null,integrationError='';
const storageKey='alpha-last-stand-p5-pending';
if(integrated){
  $('developer').hidden=true;$('start').disabled=true;$('restart').disabled=true;
  try{transport=childTransport();}catch{integrationError='Open Last Stand through Blood Moon to authenticate.';}
}
async function connect(){
  if(!transport)return;
  try{const r=await transport.request('state');if(!r?.ok||!r.data?.enabled)throw Error(r?.reason||'FEATURE_DISABLED');context=r.data;
    if(!context.supported)throw Error('UNSUPPORTED_WAVE: continue with the existing raid strike.');
    if(!context.canStart)throw Error(context.reason||'INELIGIBLE');integrationError='';$('start').disabled=!assetResult?.ready;
    $('result').textContent='Authenticated Last Stand';$('summary').textContent=`Wave ${context.wave} · Faction boss ${context.sharedHP}/${context.sharedMaxHP} HP. Verified no-credit preview; attempts and raid progress remain unchanged.`;
  }catch(e){integrationError=e.message;$('result').textContent='Last Stand unavailable';$('summary').textContent=integrationError;}
}
async function submitIntegrated(){
  if(busy||!pendingSubmission)return;busy=true;$('start').disabled=true;$('result').textContent='Verifying combat…';
  try{const response=await transport.request('submit',pendingSubmission);
    if(!response?.ok||!response.data?.verified)throw Error(response?.reason||'VERIFICATION_FAILED');
    verified=response.data;integrationError='';sessionStorage.removeItem(storageKey);
    $('result').textContent=verified.status==='won'?'Verified solo victory':'Verified run ended';
    $('summary').textContent='No raid credit awarded. Attempts, cooldowns, shared HP, contribution and rewards are unchanged. Settlement policy remains pending.';
    $('start').textContent='New encounter';pendingSubmission=null;
  }catch(e){integrationError=e.message;$('result').textContent='Result not credited';
    const terminal=['EXPIRED','STALE_RAID_INSTANCE','INVALID_ENCOUNTER','INVALID_TRACE','INVALID_SUBMISSION','FEATURE_DISABLED','ENGINE_VERSION_UNAVAILABLE'].includes(e.message);
    if(terminal){pendingSubmission=null;ticket=null;sessionStorage.removeItem(storageKey);}
    $('summary').textContent=terminal?`${e.message}. No credit awarded. Request a new eligible encounter or return to the raid.`:`${e.message}. Retry sends the same recorded run; no client damage or victory claim is accepted.`;
    $('start').textContent=terminal?'Request new encounter':'Retry verification';}
  finally{busy=false;$('start').disabled=false;}
}
async function startIntegrated(){
  if(busy||running||!transport||!assetResult?.ready)return;
  if(pendingSubmission)return submitIntegrated();
  busy=true;
  try{
    let stored=null;try{stored=JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{}
    if(stored?.record&&(!Number.isInteger(stored.record.ticks)||stored.record.ticks<0||stored.record.ticks>4500||!Array.isArray(stored.record.trace)||stored.record.trace.length>9002)){sessionStorage.removeItem(storageKey);throw Error('INVALID_LOCAL_RECORD');}
    if(stored?.submission&&stored.record){
      game=replay(stored.record);saved=stored.record;pendingSubmission=stored.submission;$('overlay').hidden=false;$('replay').disabled=false;busy=false;return submitIntegrated();
    }
    const current=await transport.request('state');if(!current?.ok||!current.data?.canStart)throw Error(current?.data?.reason||current?.reason||'INELIGIBLE');context=current.data;
    const run_id=stored?.run_id||crypto.randomUUID();sessionStorage.setItem(storageKey,JSON.stringify({run_id}));
    const r=await transport.request('start',{run_id,raidInstanceId:context.raidInstanceId});if(!r?.ok)throw Error(r?.reason||'START_FAILED');
    if(r.data?.policyId!=='last-stand-p3-v1'||r.data?.mode!=='AUTHENTICATED_NO_CREDIT'||!Number.isInteger(r.data.seed))throw Error('UNSUPPORTED_SERVER_POLICY');
    ticket={...structuredClone(r.data),parameters:combatParameters(r.data.parameters)};verified=null;integrationError='';start();
    if(stored?.record&&stored.record.seed===ticket.seed&&JSON.stringify(stored.record.parameters)===JSON.stringify(ticket.parameters)){
      const resumed=replay(stored.record);if(resumed.status==='playing'){game=resumed;game.setInput();}
    }
  }catch(e){integrationError=e.message;$('result').textContent='Encounter unavailable';$('summary').textContent=e.message;if(['EXPIRED','ENCOUNTER_COMPLETED','STALE_RAID_INSTANCE'].includes(e.message)){sessionStorage.removeItem(storageKey);$('start').textContent='Request new encounter';}}
  finally{busy=false;}
}
window.addEventListener('pagehide',()=>{if(integrated&&ticket&&!playback&&!verified)sessionStorage.setItem(storageKey,JSON.stringify({run_id:ticket.run_id,record:game.recording(),submission:pendingSubmission}));});

function start(record=null){
  if(!assetResult?.ready)return;
  input.reset();playback=record;replayIndex=0;presentation.reset();
  const scenario=scenarioFor($('profile').value);
  game=record?fromRecording(record):integrated?new Encounter(ticket.seed,{},ticket.parameters):new Encounter(1909,{},scenario?.parameters??LOCAL_PROFILES[$('profile').value]);
  $('player-hp').max=game.t.playerHP;$('boss-hp').max=game.t.bossHP;
  accumulator=0;previous=0;running=true;$('overlay').hidden=true;$('profile').disabled=true;
  $('developer').open=false;window.scrollTo(0,0);document.body.classList.add('combat-active');
}
$('start').onclick=()=>integrated?startIntegrated():start();$('restart').onclick=()=>integrated?startIntegrated():start();
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
  if(integrated)$('restart').disabled=running||busy||!context?.canStart;
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
  if(integrated&&!running){$('status').textContent=integrationError|| (verified?'Server verified · no raid credit awarded.':'Authenticated no-credit preview · server snapshot required.');if(!ticket){$('player-value').textContent='SERVER';$('boss-value').textContent=context?`${context.sharedHP} / ${context.sharedMaxHP}`:'SERVER';}}
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
        if(integrated&&!playback){pendingSubmission={run_id:ticket.run_id,ticks:game.tick,trace:game.recording().trace};sessionStorage.setItem(storageKey,JSON.stringify({run_id:ticket.run_id,record:game.recording(),submission:pendingSubmission}));void submitIntegrated();}
        if(integrated&&playback)$('result').textContent='Replay complete · no raid credit';

      }
    }
  }
  previous=ms;render();requestAnimationFrame(frame);
}
window.lastStand={snapshot:()=>structuredClone({tick:game.tick,time:game.time,status:game.status,player:game.player,boss:game.boss,phase:game.phase,phaseTime:game.phaseTime,pressure:game.pressure,attack:game.attack,input:game.input,moving:game.moving,events:game.events,playback:!!playback}),recording:()=>game.recording(),
  visuals:()=>structuredClone({ready:assetResult?.ready??false,failures:assetResult?.failures??[],loaded:Object.keys(assetResult?.images??{}),bossState:renderedState,bossSource:bossImage(assetResult?.images??{},renderedState)?.src??null,playerFrameDirection:presentation?.direction,playerSize:PLAYER_VISUAL.size,hitboxRadius:game.t.playerRadius,feedback:combatVisuals(game,$('lite').checked)})};
assetResult=await loadAssets();
$('start').disabled=!assetResult.ready||integrated;$('restart').disabled=!assetResult.ready||integrated;
if(assetResult.ready){presentation=new Presentation(canvas,assetResult.images);$('asset-status').textContent=assetResult.failures.length?`Optional art unavailable: ${assetResult.failures.join(', ')}. Boss states fall back to idle.`:'Original Alpha Husky art loaded';}
else{$('result').textContent='Encounter art unavailable';$('summary').textContent='An essential asset could not load. Reload to retry.';$('asset-status').textContent=`Unavailable: ${assetResult.failures.join(', ')}`;}
requestAnimationFrame(frame);

if(integrated)void connect();
