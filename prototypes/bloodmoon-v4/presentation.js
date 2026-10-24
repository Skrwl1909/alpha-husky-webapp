import {bossImage,bossState,playerFrame} from './assets.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class Presentation {
  constructor(canvas,images){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.images=images;this.direction='up';
    const scale=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=360*scale;canvas.height=540*scale;this.scale=scale;
    this.backdrop=document.createElement('canvas');this.backdrop.width=canvas.width;this.backdrop.height=canvas.height;
    const c=this.backdrop.getContext('2d');c.scale(scale,scale);c.fillStyle='#101219';c.fillRect(0,0,360,540);
    if(images.arena)c.drawImage(images.arena,146,700,648,972,0,0,360,540);
    c.fillStyle='#080b17';c.globalAlpha=.35;c.fillRect(0,0,360,540);
    if(images.atmosphere){c.globalAlpha=.13;c.drawImage(images.atmosphere,0,0,360,540);}
    c.globalAlpha=.85;if(images.moon)c.drawImage(images.moon,143,4,74,74);c.globalAlpha=1;
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
  text(text,x,y,color='#fff1d9',size=11){const c=this.ctx;c.font=`600 ${size}px system-ui`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#090c13';c.strokeText(text,x,y);c.fillStyle=color;c.fillText(text,x,y);}
  draw(g,anchor,lite){
    const c=this.ctx,p=g.player,b=g.boss,a=g.attack;c.setTransform(this.scale,0,0,this.scale,0,0);c.clearRect(0,0,360,540);c.drawImage(this.backdrop,0,0,360,540);
    c.fillStyle='#09101988';c.fillRect(0,494,360,46);
    c.lineWidth=1;c.setLineDash([4,7]);this.circle(b.x,b.y,g.t.range,null,'#c2d9cf66');c.setLineDash([]);
    if(g.status==='playing'&&a&&['telegraph','impact'].includes(g.phase)){
      c.save();this.shape(a);c.fillStyle=g.phase==='impact'?'#ffd4a5bb':'#d679225c';c.fill();c.strokeStyle='#ffe3a7';c.lineWidth=2.5;c.stroke();c.clip();
      c.strokeStyle='#ffe8b650';c.lineWidth=1;for(let x=-540;x<900;x+=18){c.beginPath();c.moveTo(x,0);c.lineTo(x+540,540);c.stroke();}c.restore();
      const q=a.kind==='CIRCLE'?a.center:{x:180,y:230},x=clamp(q.x,60,300),y=clamp(q.y,185,470);
      this.text(a.kind,x,y,'#fff4d7',16);this.text(g.phase==='impact'?'IMPACT':`${Math.max(0,g.phaseTime).toFixed(1)}s`,x,y+19,'#fff4d7',13);
    }
    const open=['opening','recovery'].includes(g.phase),state=bossState(g),boss=bossImage(this.images,state);
    c.fillStyle='#0008';c.beginPath();c.ellipse(b.x,b.y+41,40,10,0,0,Math.PI*2);c.fill();
    c.lineWidth=1.5;this.circle(b.x,b.y,g.t.bossRadius,null,open?'#b6f4c1aa':'#d98a8688');
    if(boss)c.drawImage(boss,b.x-72,b.y+50-144*.916667,144,144);
    this.text('TOWER HUSK',b.x,166,'#f6d8c4',10);
    c.fillStyle='#302329';c.fillRect(b.x-38,172,76,3);c.fillStyle='#da7774';c.fillRect(b.x-38,172,76*b.hp/g.t.bossHP,3);
    if(g.status==='playing'&&g.time-g.shotAt<.14){
      if(!lite){c.strokeStyle='#c5f4edcc';c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y-12);c.lineTo(b.x,b.y);c.stroke();if(this.images.slash)c.drawImage(this.images.slash,b.x-38,b.y-10,76,25);}
      this.text(`−${g.t.damage}`,b.x+47,b.y-12,'#caffd2',13);
    }
    // Draw the HUD before the Howler so it never covers the player at the lower bound.
    this.text(`${g.time.toFixed(1)} / ${g.t.limit}s  ·  HOWLER ${p.hp}/${g.t.playerHP}  ·  HUSK ${Number(b.hp.toFixed(1))}/${g.t.bossHP}`,180,511,'#d9dfd5',10);
    this.text(g.status==='won'?'TOWER HUSK DEFEATED':g.status!=='playing'?'HOWLER FALLEN':open?'HUSK RECOVERING · STOP TO COUNTER':g.moving?'MOVING · ATTACKS PAUSED':'READ THE MARK · DODGE, THEN COUNTER',180,529,open?'#b6f4c1':'#f6d8c4',10);
    // The cyan disk remains the exact simulation hitbox; art is feet-anchored.
    c.lineWidth=1.5;this.circle(p.x,p.y,g.t.playerRadius,'#0a152acc','#a9fff1');
    const frame=playerFrame(g.input,g.moving,g.time,this.direction,lite);this.direction=frame.direction;
    c.globalAlpha=p.hp<=0?.4:1;
    if(this.images.player)c.drawImage(this.images.player,frame.x,frame.y,256,256,p.x-24,p.y+8-48*.955,48,48);c.globalAlpha=1;
    this.circle(p.x,p.y,g.t.playerRadius,null,g.time-g.hurtAt<.25?'#ffb0a5':'#b2fff0');
    c.fillStyle='#18322d';c.fillRect(p.x-13,Math.min(531,p.y+15),26,3);c.fillStyle='#b4f1d0';c.fillRect(p.x-13,Math.min(531,p.y+15),26*p.hp/g.t.playerHP,3);
    if(g.status==='playing'&&g.time-g.hurtAt<.2){if(!lite&&this.images.burst){c.globalAlpha=.55;c.drawImage(this.images.burst,p.x-22,p.y-24,44,44);c.globalAlpha=1;}this.text(`−${g.t.incomingDamage}`,clamp(p.x+20,20,340),p.y-34,'#ffc2b0',14);}
    if(anchor){c.lineWidth=1;this.circle(anchor.x,anchor.y,38,'#06171b45','#c5ece477');this.circle(anchor.x+g.input.x*30,anchor.y+g.input.y*30,12,'#c7f5e780');}
    return state;
  }
}
