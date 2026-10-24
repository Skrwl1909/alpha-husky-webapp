import {Encounter,hits} from '../simulation.js';
export function drive(parameters,seed=1909,{mistakes=0}={}){
  const g=new Encounter(seed,{},parameters);let number=0,target=null,reactAt=0;
  while(g.status==='playing'){
    if(g.attackNumber!==number){
      number=g.attackNumber;g.setInput();target=null;reactAt=g.time+.25;
      if(number>mistakes)for(let x=25;x<=335;x+=10)for(let y=190;y<=340;y+=10){
        if(hits({x,y},g.attack,34)||Math.hypot(x-g.boss.x,y-g.boss.y)>250)continue;
        const d=Math.hypot(x-g.player.x,y-g.player.y);if(!target||d<target.d)target={x,y,d};
      }
    }
    if(target&&g.time>=reactAt){const dx=target.x-g.player.x,dy=target.y-g.player.y,d=Math.hypot(dx,dy);if(d>4)g.setInput(dx/d,dy/d);else{g.setInput();target=null;}}
    g.step();
  }
  return g;
}
