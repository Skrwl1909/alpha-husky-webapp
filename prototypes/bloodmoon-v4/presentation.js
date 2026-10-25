import {bossImage,bossState,playerFrame} from './assets.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const PLAYER_VISUAL=Object.freeze({size:76,originX:.5,originY:.955});
export function combatCue(g){
  if(g.status!=='playing')return {phase:g.status,label:g.status==='won'?'ENCOUNTER CLEARED':'RUN ENDED',message:g.status==='won'?'Tower Husk defeated.':'Read the warning. Dodge, then counter.'};
  const hurt=g.events.findLast(e=>e.type==='player-hit');
  if(hurt&&g.time-hurt.tick*g.t.step<.55)return {phase:'hurt',label:`HIT · ${hurt.kind}`,message:`−${Number(hurt.damage.toFixed(2))} HP · Reposition, then counter.`};
  if(g.phase==='telegraph')return {phase:g.phase,label:`${g.phaseTime<=.3?'IMMINENT':'WARNING'} · ${g.attack.kind} · ${g.phaseTime.toFixed(1)}s`,message:{LINE:'Sidestep the marked lane.',CIRCLE:'Leave the marked ring.',CONE:'Cross an edge of the cone.'}[g.attack.kind]};
  if(g.phase==='impact')return {phase:g.phase,label:`IMPACT · ${g.attack.kind}`,message:'Stay outside the marked shape.'};
  if(Math.hypot(g.player.x-g.boss.x,g.player.y-g.boss.y)>g.t.range)return {phase:g.phase,label:'OUT OF RANGE',message:'Return inside the dotted range line.'};
  return {phase:g.phase,label:g.phase==='recovery'?'COUNTER WINDOW':'ENGAGE',message:g.moving?'Release to counter · attacks paused while moving.':'Hold position · automatic strikes active.'};
}
// All ages come from simulation time: rendering consumes events, never mutates combat.
export function combatVisuals(g,lite=false){
  const shot=g.events.findLast(e=>e.type==='boss-hit'),hurt=g.events.findLast(e=>e.type==='player-hit');
  const shotAge=shot?g.time-shot.tick*g.t.step:99,hurtAge=hurt?g.time-hurt.tick*g.t.step:99;
  return {state:bossState(g),shot,hurt,shotAge,hurtAge,
    connection:g.status==='playing'&&shotAge<.28,number:shotAge<.55,
    hurtVisible:hurtAge<.6,imminent:g.phase==='telegraph'&&g.phaseTime<=.3,
    ready:g.status==='playing'&&!g.moving&&g.still>=g.t.stationaryDelay&&Math.hypot(g.player.x-g.boss.x,g.player.y-g.boss.y)<=g.t.range,
    motion:!lite};
}
export class Presentation {
  constructor(canvas,images){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images=images;this.direction='up';
    const scale=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=360*scale;canvas.height=540*scale;this.scale=scale;
    this.backdrop=document.createElement('canvas');this.backdrop.width=canvas.width;this.backdrop.height=canvas.height;
    const c=this.backdrop.getContext('2d');c.scale(scale,scale);c.fillStyle='#080f19';c.fillRect(0,0,360,540);
    if(images.arena)c.drawImage(images.arena,146,700,648,972,0,0,360,540);
    c.fillStyle='#060e1b';c.globalAlpha=.28;c.fillRect(0,0,360,540);
    if(images.atmosphere){c.globalAlpha=.13;c.drawImage(images.atmosphere,0,0,360,540);}
    c.globalAlpha=.9;if(images.moon)c.drawImage(images.moon,143,4,74,74);c.globalAlpha=1;
    // Bake the subtle outline/brightness once, rather than filtering every frame.
    if(images.player){this.playerAtlas=document.createElement('canvas');this.playerAtlas.width=1024;this.playerAtlas.height=1024;
      const atlas=this.playerAtlas.getContext('2d');atlas.filter='brightness(1.22)';atlas.shadowColor='#91e9ed';atlas.shadowBlur=3;atlas.drawImage(images.player,0,0);}
  }
  reset(){this.direction='up';}
  circle(x,y,r,fill,stroke){const c=this.ctx;c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
  shape(a){const c=this.ctx;c.beginPath();
    if(a.kind==='CIRCLE')c.arc(a.center.x,a.center.y,a.radius,0,Math.PI*2);
    else if(a.kind==='LINE'){
      const dx=Math.cos(a.angle+Math.PI/2)*a.width/2,dy=Math.sin(a.angle+Math.PI/2)*a.width/2;
      c.moveTo(a.origin.x+dx,a.origin.y+dy);c.lineTo(a.end.x+dx,a.end.y+dy);c.lineTo(a.end.x-dx,a.end.y-dy);c.lineTo(a.origin.x-dx,a.origin.y-dy);c.closePath();
    }else{c.moveTo(a.origin.x,a.origin.y);c.arc(a.origin.x,a.origin.y,a.radius,a.angle-a.halfAngle,a.angle+a.halfAngle);c.closePath();}
  }
  text(text,x,y,color='#e9fcff',size=16){const c=this.ctx;c.font=`700 ${size}px system-ui`;c.textAlign='center';c.lineWidth=4;c.strokeStyle='#060d17';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
  draw(g,anchor,lite){
    const c=this.ctx,p=g.player,b=g.boss,a=g.attack,v=combatVisuals(g,lite);
    c.setTransform(this.scale,0,0,this.scale,0,0);c.globalAlpha=1;c.clearRect(0,0,360,540);c.drawImage(this.backdrop,0,0,360,540);
    c.lineWidth=1;c.setLineDash([3,9]);this.circle(b.x,b.y,g.t.range,null,'#84b9c346');c.setLineDash([]);
    if(v.connection){
      const fade=1-v.shotAge/.28;c.save();c.globalAlpha=fade;
      c.strokeStyle='#8cf1ee';c.lineWidth=lite?2:3;c.beginPath();c.moveTo(p.x,p.y-28);c.lineTo(b.x,b.y+15);c.stroke();
      if(!lite){this.circle(b.x,b.y+8,12+v.shotAge*70,null,'#b8ffff');if(this.images.slash)c.drawImage(this.images.slash,b.x-42,b.y-9,84,32);}c.restore();
    }
    // Danger geometry draws above decorative connection VFX; no shake/transforms.
    if(g.status==='playing'&&a&&['telegraph','impact'].includes(g.phase)){
      c.save();this.shape(a);c.fillStyle=g.phase==='impact'?'#c234464d':v.imminent?'#efac4057':'#e6ac3d26';c.fill();
      c.strokeStyle=g.phase==='impact'?'#ff8e87':v.imminent?'#ffe5a1':'#e8bc69';c.lineWidth=v.imminent?3:2;c.stroke();c.clip();
      c.strokeStyle=g.phase==='impact'?'#f27b7b66':'#f6d78c44';c.lineWidth=1;
      for(let x=-540;x<900;x+=24){c.beginPath();c.moveTo(x,0);c.lineTo(x+540,540);c.stroke();}c.restore();
    }
    const open=['opening','recovery'].includes(g.phase),boss=bossImage(this.images,v.state);
    c.fillStyle='#0009';c.beginPath();c.ellipse(b.x,b.y+41,40,10,0,0,Math.PI*2);c.fill();
    c.lineWidth=2;this.circle(b.x,b.y,g.t.bossRadius,null,open?'#88e9d7':'#ab68767a');
    const flinch=!lite&&v.shotAge<.22?Math.sin(v.shotAge/.22*Math.PI)*3:0;
    if(boss)c.drawImage(boss,b.x-72,b.y+50-144*.916667-flinch,144,144);
    if(v.number)this.text(`−${Number(v.shot.damage.toFixed(2))}`,b.x+65,b.y-30-(lite?0:v.shotAge*24),'#aaffee',20);
    // Ground shadow and feet anchoring do not move the simulation point.
    c.fillStyle='#020811c9';c.beginPath();c.ellipse(p.x,p.y+2,23,8,0,0,Math.PI*2);c.fill();
    if(g.moving){const angle=Math.atan2(g.input.y,g.input.x);c.strokeStyle='#71d7e699';c.lineWidth=2;c.beginPath();
      c.moveTo(p.x-Math.cos(angle)*18,p.y-Math.sin(angle)*18);c.lineTo(p.x-Math.cos(angle)*28,p.y-Math.sin(angle)*28);c.stroke();}
    if(v.ready){c.strokeStyle='#c2fff2';c.lineWidth=2;for(const sign of [-1,1]){c.beginPath();c.moveTo(p.x+sign*16,p.y-4);c.lineTo(p.x+sign*20,p.y);c.lineTo(p.x+sign*16,p.y+4);c.stroke();}}
    const frame=playerFrame(g.input,g.moving,g.time,this.direction,lite);this.direction=frame.direction;
    c.globalAlpha=p.hp<=0?.4:1;const size=PLAYER_VISUAL.size;
    if(this.images.player)c.drawImage(this.playerAtlas||this.images.player,frame.x,frame.y,256,256,p.x-size*.5,p.y-size*.955,size,size);c.globalAlpha=1;
    // The only cyan circle around the Howler is the EXACT existing collision radius.
    c.lineWidth=1.7;this.circle(p.x,p.y,g.t.playerRadius,'#09212c44','#a3fff2');
    if(v.hurtVisible){
      c.strokeStyle='#ff958d';c.lineWidth=3;c.beginPath();c.moveTo(p.x-20,p.y-24);c.lineTo(p.x-20,p.y-5);c.moveTo(p.x+20,p.y-24);c.lineTo(p.x+20,p.y-5);c.stroke();
      if(!lite&&v.hurtAge<.18&&this.images.burst){c.globalAlpha=.22;c.drawImage(this.images.burst,p.x-18,p.y-38,36,36);c.globalAlpha=1;}
      this.text(`−${Number(v.hurt.damage.toFixed(2))}`,clamp(p.x+35,32,328),clamp(p.y-63-(lite?0:v.hurtAge*18),188,480),'#ffb3a8',19);
    }
    if(anchor){c.lineWidth=1;this.circle(anchor.x,anchor.y,38,'#06171b22','#c5ece455');this.circle(anchor.x+g.input.x*30,anchor.y+g.input.y*30,10,'#c7f5e755');}
    return v.state;
  }
}
