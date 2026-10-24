export const TUNING = Object.freeze({ width: 360, height: 540, step: 1 / 60,
  speed: 230, playerRadius: 11, bossRadius: 29, playerHP: 3, bossHP: 96,
  range: 270, stationaryDelay: .25, cooldown: .48, damage: 1,
  telegraph: 1.1, impact: .2, recovery: .65, opening: .75,
  lineWidth: 58, circleRadius: 68, coneRadius: 310, coneHalfAngle: .34,
  invulnerability: .6, limit: 75 });
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function segmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = clamp(((p.x-a.x)*dx + (p.y-a.y)*dy)/(dx*dx+dy*dy || 1), 0, 1);
  return Math.hypot(p.x-a.x-t*dx, p.y-a.y-t*dy);
}
export function hits(p, a, radius = TUNING.playerRadius) {
  if (a.kind === 'CIRCLE') return distance(p, a.center) <= a.radius + radius;
  if (a.kind === 'LINE') return segmentDistance(p, a.origin, a.end) <= a.width / 2 + radius;
  const dx = p.x-a.origin.x, dy = p.y-a.origin.y;
  const d = Math.hypot(dx, dy);
  if (d > a.radius + radius) return false;
  let angle = Math.atan2(dy, dx)-a.angle;
  angle = Math.atan2(Math.sin(angle), Math.cos(angle));
  if (Math.abs(angle) <= a.halfAngle) return true;
  // Include the player's radius along both straight edges of the sector.
  return [-1,1].some(sign => segmentDistance(p, a.origin, {
    x:a.origin.x+Math.cos(a.angle+sign*a.halfAngle)*a.radius,
    y:a.origin.y+Math.sin(a.angle+sign*a.halfAngle)*a.radius }) <= radius);
}
export class Encounter {
  constructor(seed = 1909, tuning = {}) {
    this.t = {...TUNING, ...tuning}; this.seed = seed >>> 0; this.rng = this.seed || 1;
    this.tick = 0; this.time = 0; this.status = 'playing';
    this.player = {x:180,y:300,hp:this.t.playerHP};
    this.boss = {x:180,y:105,hp:this.t.bossHP};
    this.input = {x:0,y:0}; this.moving = false; this.still = 0;
    this.shotAt = -99; this.hurtAt = -99; this.phase = 'opening';
    this.phaseTime = this.t.opening; this.attackNumber = 0;
    this.events = []; this.trace = []; this.attack = null;
  }
  random() { this.rng ^= this.rng << 13; this.rng ^= this.rng >>> 17; this.rng ^= this.rng << 5; return (this.rng >>> 0)/4294967296; }
  log(type, data = {}) { this.events.push({tick:this.tick,type,...data}); }
  setInput(x = 0,y = 0) {
    const d = Math.max(1, Math.hypot(x,y)); const next = {x:x/d,y:y/d};
    if (next.x !== this.input.x || next.y !== this.input.y) {
      this.input = next; this.trace.push({tick:this.tick,...next});
    }
  }
  beginAttack() {
    const kind = ['LINE','CIRCLE','CONE'][this.attackNumber++ % 3];
    const origin = {x:this.boss.x,y:this.boss.y};
    const angle = Math.atan2(this.player.y-origin.y,this.player.x-origin.x);
    this.attack = {kind,origin,angle,center:{x:this.player.x,y:this.player.y},
      end:{x:origin.x+Math.cos(angle)*650,y:origin.y+Math.sin(angle)*650},
      width:this.t.lineWidth, radius:kind==='CIRCLE'?this.t.circleRadius:this.t.coneRadius,
      halfAngle:this.t.coneHalfAngle, hit:false};
    this.phase = 'telegraph';
    this.phaseTime = this.t.telegraph + this.random() * .08;
    this.log('telegraph',{kind});
  }
  step() {
    if (this.status !== 'playing') return;
    const t = this.t, dt = t.step; this.tick++; this.time = this.tick*dt;
    // Input intent suppresses attacks even while pushing an arena boundary.
    this.moving = Math.hypot(this.input.x,this.input.y) > .04;
    if (this.moving) {
      this.player.x = clamp(this.player.x+this.input.x*t.speed*dt,t.playerRadius,t.width-t.playerRadius);
      this.player.y = clamp(this.player.y+this.input.y*t.speed*dt,170,t.height-t.playerRadius);
      this.still = 0;
    } else this.still += dt;
    this.phaseTime -= dt;
    if (this.phaseTime <= 1e-9) {
      if (this.phase === 'opening' || this.phase === 'recovery') this.beginAttack();
      else if (this.phase === 'telegraph') {
        this.phase = 'impact'; this.phaseTime = t.impact;
        this.log('impact',{kind:this.attack.kind});
      } else { this.phase = 'recovery'; this.phaseTime = t.recovery; this.log('opening'); }
    }
    if (this.phase === 'impact' && !this.attack.hit &&
        this.time-this.hurtAt >= t.invulnerability && hits(this.player,this.attack,t.playerRadius)) {
      this.attack.hit = true; this.player.hp = Math.max(0,this.player.hp-1); this.hurtAt = this.time;
      this.log('player-hit',{kind:this.attack.kind,hp:this.player.hp});
    }
    if (this.player.hp <= 0) return this.finish('lost');
    if (!this.moving && this.still >= t.stationaryDelay &&
        this.time-this.shotAt >= t.cooldown && distance(this.player,this.boss) <= t.range) {
      this.shotAt = this.time; this.boss.hp = Math.max(0,this.boss.hp-t.damage);
      this.log('boss-hit',{hp:this.boss.hp});
      if (!this.boss.hp) return this.finish('won');
    }
    if (this.time >= t.limit) this.finish('timeout');
  }
  finish(status) { this.status = status; this.setInput(); this.log(status); }
  recording() { return {version:1,seed:this.seed,tuning:this.t,ticks:this.tick,trace:structuredClone(this.trace)}; }
}
export function replay(record) {
  const game = new Encounter(record.seed,record.tuning); let i = 0;
  while (game.tick < record.ticks && game.status === 'playing') {
    while (record.trace[i]?.tick === game.tick) { const p = record.trace[i++]; game.setInput(p.x,p.y); }
    game.step();
  }
  return game;
}
