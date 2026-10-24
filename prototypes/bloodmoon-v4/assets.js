// Original repository assets, referenced in place. No copies or generated art.
export const ASSETS = Object.freeze({
  arena:'/assets/bloodmoon/v2/arena.webp', atmosphere:'/assets/bloodmoon/v2/atmosphere.webp',moon:'/assets/bloodmoon/v2/moon_full.webp',
  idle:'/assets/bloodmoon/v3/enemies/tower_husk/idle.webp',attack:'/assets/bloodmoon/v3/enemies/tower_husk/attack.webp',
  hit:'/assets/bloodmoon/v3/enemies/tower_husk/hit.webp',defeat:'/assets/bloodmoon/v3/enemies/tower_husk/defeat.webp',
  slash:'/assets/bloodmoon/v3/vfx/bloodmoon_impact_slash.webp',burst:'/assets/bloodmoon/v3/vfx/bloodmoon_impact_burst.webp',
  player:'/assets/dojo/v1/processed/alpha_husky_player_sheet_v1.png'
});
const ESSENTIAL = ['arena','idle','player'];
export async function loadAssets(manifest = ASSETS, ImageClass = globalThis.Image, timeout = 8000) {
  const images = {}, failures = [];
  await Promise.all(Object.entries(manifest).map(([key,url])=>new Promise(resolve=>{
    const img = new ImageClass(); let settled = false;
    const complete = ok => {if(settled)return;settled=true;clearTimeout(timer);img.onload=null;img.onerror=null;if(ok && img.naturalWidth>0 && img.naturalHeight>0)images[key]=img;else failures.push(key);resolve();};
    const timer = setTimeout(()=>complete(false),timeout);
    img.onload=()=>complete(true);img.onerror=()=>complete(false);img.src=url;
  })));
  return {images,failures:failures.sort(),ready:ESSENTIAL.every(key=>!!images[key])};
}
export function bossState(g) {
  if(g.boss.hp<=0)return 'defeat';
  if(g.phase==='impact'||g.phase==='telegraph'&&g.phaseTime<.3)return 'attack';
  return g.time-g.shotAt<.16?'hit':'idle';
}
export function bossImage(images,state){return images[state]||images.idle;}
export function playerFrame(input,moving,time,previous='up',lite=false){
  const direction=moving ? Math.abs(input.x)>Math.abs(input.y)?input.x>0?'right':'left':input.y>0?'down':'up' : previous;
  const row={down:0,up:1,right:2,left:3}[direction];
  const column=moving&&!lite?[1,2,3,2][Math.floor(time*8)%4]:0;
  return {direction,x:column*256,y:row*256};
}
