import {Encounter,hits} from '../simulation.js';

export function safeTarget(g,margin=34) {
  let best=null;
  for(let x=25;x<=335;x+=10)for(let y=190;y<=340;y+=10){
    if(hits({x,y},g.attack,margin)||Math.hypot(x-g.boss.x,y-g.boss.y)>250)continue;
    const d=Math.hypot(x-g.player.x,y-g.player.y);
    if(!best||d<best.d)best={x,y,d};
  }
  return best;
}
// A reproducible test policy, not a claim about human success rates.
// Delay, wider dodges and periodic misses model bounded imperfections.
export function drive(parameters,seed=1909,{reaction=.25,margin=34,misses=[],missEvery=0,idle=false,alwaysMove=false,limit=75}={}) {
  const g=new Encounter(seed,{limit},parameters);let number=0,target=null,reactAt=0;
  const metrics={warnings:0,unreachable:0,movingTicks:0,stationaryTicks:0,recoveryShots:0};
  while(g.status==='playing'){
    if(g.attackNumber!==number){
      number=g.attackNumber;g.setInput();target=null;reactAt=g.time+reaction;
      metrics.warnings++;
      const safe=safeTarget(g,margin);
      if(!safe||safe.d/g.t.speed+reaction>=g.phaseTime)metrics.unreachable++;
      if(!idle&&!misses.includes(number)&&!(missEvery&&number%missEvery===0))target=safe;
    }
    if(alwaysMove)g.setInput(Math.cos(g.time),Math.sin(g.time));
    else if(target&&g.time>=reactAt){
      const dx=target.x-g.player.x,dy=target.y-g.player.y,d=Math.hypot(dx,dy);
      if(d>4)g.setInput(dx/d,dy/d);
      else{g.setInput();target=null;}
    }
    const before=g.events.length;g.step();
    metrics[g.moving?'movingTicks':'stationaryTicks']++;
    if(g.phase==='recovery')metrics.recoveryShots+=g.events.slice(before).filter(e=>e.type==='boss-hit').length;
  }
  return {game:g,metrics};
}
