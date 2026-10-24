import {Encounter} from './simulation.js';
import {bindInput} from './input.js';
const $ = id => document.getElementById(id), canvas = $('arena'), ctx = canvas.getContext('2d');
let game = new Encounter(), running = false, playback = null, replayIndex = 0, saved = null;
let accumulator = 0, previous = 0;
const input = bindInput(canvas,(x,y) => { if (running && !playback) game.setInput(x,y); });
$('lite').checked = matchMedia('(prefers-reduced-motion: reduce)').matches;
function start(record = null) {
  input.reset(); playback = record; replayIndex = 0;
  game = new Encounter(record?.seed ?? 1909,record?.tuning ?? {});
  accumulator = 0; previous = 0; running = true; $('overlay').hidden = true;
}
$('start').onclick = () => start(); $('restart').onclick = () => start();
$('replay').onclick = () => {if(saved) start(saved);};
$('export').onclick = () => {
  const blob = new Blob([JSON.stringify({recording:game.recording(),events:game.events},null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'last-stand-log.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
};
function circle(x,y,r,fill,stroke) {ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function shape(a) {
  ctx.beginPath();
  if(a.kind==='CIRCLE') ctx.arc(a.center.x,a.center.y,a.radius,0,Math.PI*2);
  else if(a.kind==='LINE') {
    const dx=Math.cos(a.angle+Math.PI/2)*a.width/2,dy=Math.sin(a.angle+Math.PI/2)*a.width/2;
    ctx.moveTo(a.origin.x+dx,a.origin.y+dy);ctx.lineTo(a.end.x+dx,a.end.y+dy);ctx.lineTo(a.end.x-dx,a.end.y-dy);ctx.lineTo(a.origin.x-dx,a.origin.y-dy);ctx.closePath();
  } else {ctx.moveTo(a.origin.x,a.origin.y);ctx.arc(a.origin.x,a.origin.y,a.radius,a.angle-a.halfAngle,a.angle+a.halfAngle);ctx.closePath();}
}
function render() {
  const g = game, p = g.player, b = g.boss, a = g.attack;
  ctx.clearRect(0,0,360,540);ctx.fillStyle='#19151f';ctx.fillRect(0,0,360,540);
  ctx.strokeStyle='#30252e';ctx.lineWidth=1;
  for(let y=30;y<540;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(360,y);ctx.stroke();}
  circle(180,54,28,'#582e39');
  ctx.setLineDash([5,7]);circle(b.x,b.y,g.t.range,null,'#5c515c');ctx.setLineDash([]);
  ctx.fillStyle='#81717a';ctx.font='10px system-ui';ctx.textAlign='center';ctx.fillText('AUTOATTACK RANGE',180,390);
  if(a && ['telegraph','impact'].includes(g.phase)) {
    ctx.save();ctx.lineWidth=3;shape(a);ctx.fillStyle=g.phase==='impact'?'#ffbd78bd':'#c54b5c55';ctx.fill();ctx.strokeStyle='#ffc18b';ctx.stroke();ctx.clip();
    ctx.strokeStyle='#ffc18b55';ctx.lineWidth=1;
    for(let x=-540;x<900;x+=18){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+540,540);ctx.stroke();}ctx.restore();
    const q=a.kind==='CIRCLE'?a.center:{x:180,y:230};ctx.fillStyle='#fff2d3';ctx.font='bold 16px system-ui';ctx.fillText(a.kind,q.x,q.y);
    ctx.fillText(g.phase==='impact'?'IMPACT':`${Math.max(0,g.phaseTime).toFixed(1)}s`,q.x,q.y+21);
  }
  const open = ['opening','recovery'].includes(g.phase);
  circle(b.x,b.y,34,null,open?'#b5f5c5':'#8b5864');
  // Deliberate schematic silhouettes: Tower Husk and the Howler, no generated assets.
  ctx.fillStyle=g.time-g.shotAt<.1?'#f9e6bc':'#806573';ctx.beginPath();ctx.moveTo(159,78);ctx.lineTo(167,62);ctx.lineTo(177,80);ctx.lineTo(198,68);ctx.lineTo(205,126);ctx.lineTo(155,126);ctx.closePath();ctx.fill();
  ctx.fillStyle='#f4a078';ctx.fillRect(169,91,6,4);ctx.fillRect(187,91,6,4);
  ctx.font='bold 11px system-ui';ctx.fillStyle='#e9c8bf';ctx.fillText('TOWER HUSK',180,151);
  if(g.time-g.shotAt<.12 && !$('lite').checked) {ctx.strokeStyle='#e5ffc4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  circle(p.x,p.y,g.t.playerRadius,g.time-g.hurtAt<.25?'#fa8585':'#c4eee3','#fff8dc');
  ctx.fillStyle='#d7f8ed';ctx.beginPath();ctx.moveTo(p.x-10,p.y-4);ctx.lineTo(p.x-9,p.y-19);ctx.lineTo(p.x-1,p.y-9);ctx.lineTo(p.x+9,p.y-19);ctx.lineTo(p.x+10,p.y-4);ctx.fill();
  ctx.fillStyle='#192128';ctx.fillRect(p.x-5,p.y-3,3,3);ctx.fillRect(p.x+3,p.y-3,3,3);
  if(input.anchor){circle(input.anchor.x,input.anchor.y,38,'#ffffff09','#a6b7b777');circle(input.anchor.x+g.input.x*30,input.anchor.y+g.input.y*30,13,'#ddf2df77');}
  ctx.fillStyle='#ddd0bd';ctx.font='12px system-ui';ctx.textAlign='left';ctx.fillText(`${g.time.toFixed(1)} / ${g.t.limit}s`,14,520);
  ctx.textAlign='right';ctx.fillStyle=open?'#b5f5c5':'#e1a287';ctx.fillText(open?'HUSK RECOVERING — COUNTER':'DODGE THE MARKED SHAPE',346,520);
  $('player-hp').value=p.hp;$('boss-hp').value=b.hp;
  $('player-value').textContent=`${p.hp} / ${g.t.playerHP}`;$('boss-value').textContent=`${b.hp} / ${g.t.bossHP}`;
  const recentHit=g.events.findLast(e=>e.type==='player-hit');
  $('status').textContent=playback?'REPLAY · recorded inputs':recentHit && g.tick-recentHit.tick<85?`Hit by ${recentHit.kind} — leave the marked shape before impact.`:g.moving?'MOVING · attacks paused':Math.hypot(p.x-b.x,p.y-b.y)>g.t.range?'OUT OF RANGE · move inside the dotted ring':'STATIONARY · automatic strikes active';
  $('events').textContent=g.events.slice(-12).map(e=>`${(e.tick*g.t.step).toFixed(2)} ${e.type} ${e.kind??''} ${e.hp??''}`).join('\n');
}
function frame(ms) {
  if(!previous) previous=ms;
  if(running && !document.hidden) {
    accumulator+=Math.min(.1,(ms-previous)/1000);
    while(accumulator>=game.t.step && running) {
      if(playback) while(playback.trace[replayIndex]?.tick===game.tick){const p=playback.trace[replayIndex++];game.setInput(p.x,p.y);}
      game.step();accumulator-=game.t.step;
      if(game.status!=='playing') {
        running=false;input.reset();
        if(!playback) saved=game.recording();
        $('replay').disabled=!saved;$('overlay').hidden=false;
        $('result').textContent=game.status==='won'?'Tower Husk defeated':game.status==='timeout'?'Time ran out':'Howler fallen';
        const last=game.events.findLast(e=>e.type==='player-hit');
        $('summary').textContent=`${game.time.toFixed(1)}s · ${game.boss.hp} Husk HP remaining.${last?` Last hit: ${last.kind}.`:''} Dodge, then release to counter.`;
        $('start').textContent='Try again';
      }
    }
  }
  previous=ms;render();requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// Read-only browser QA observability. No damage overrides or simulated pointer actions.
window.lastStand = {snapshot:()=>structuredClone({tick:game.tick,time:game.time,status:game.status,player:game.player,boss:game.boss,phase:game.phase,phaseTime:game.phaseTime,attack:game.attack,input:game.input,moving:game.moving,events:game.events,playback:!!playback}),recording:()=>game.recording()};
