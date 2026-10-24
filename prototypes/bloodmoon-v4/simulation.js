import {combatParameters,combatTuning} from './combat-parameters.js';
export const TUNING = Object.freeze({ width: 360, height: 540, step: 1 / 60,
  speed: 230, playerRadius: 11, bossRadius: 29, playerHP: 3, bossHP: 96,
  range: 270, stationaryDelay: .25, cooldown: .48, damage: 1, incomingDamage: 1,
  telegraph: 1.1, impact: .2, recovery: .65, opening: .75,
  escalationAt: 30, finalEscalationAt: 50, pressuredRecovery: .55, finalRecovery: .48,
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
  constructor(seed = 1909, tuning = {}, parameters = null) {
    this.parameters = parameters ? combatParameters(parameters) : null;
    this.t = {...TUNING, ...tuning, ...(this.parameters ? combatTuning(this.parameters) : {})}; this.seed = seed >>> 0; this.rng = this.seed || 1;
    this.orderRng = (this.seed ^ 0x9e3779b9) >>> 0 || 1;
    this.pressure = 0; this.attackQueue = []; this.lastOrder = '';
    this.tick = 0; this.time = 0; this.status = 'playing';
    this.player = {x:180,y:300,hp:this.t.playerHP};
    this.boss = {x:180,y:105,hp:this.t.bossHP};
    this.input = {x:0,y:0}; this.moving = false; this.still = 0;
    this.shotAt = -99; this.hurtAt = -99; this.phase = 'opening';
    this.phaseTime = this.t.opening; this.attackNumber = 0;
    this.events = []; this.trace = []; this.attack = null;
  }
  random(key = 'rng') { this[key] ^= this[key] << 13; this[key] ^= this[key] >>> 17; this[key] ^= this[key] << 5; return (this[key] >>> 0)/4294967296; }
  recoveryDuration() { return this.pressure === 2 ? this.t.finalRecovery : this.pressure === 1 ? this.t.pressuredRecovery : this.t.recovery; }
  nextAttack() {
    const kinds = ['LINE','CIRCLE','CONE'];
    if (!this.pressure) return kinds[this.attackNumber % 3];
    if (!this.attackQueue.length) {
      const order = [...kinds];
      for (let i = order.length-1; i > 0; i--) {
        const j = Math.floor(this.random('orderRng')*(i+1));
        [order[i],order[j]] = [order[j],order[i]];
      }
      if (order[0] === this.attack?.kind) [order[0],order[1]] = [order[1],order[0]];
      // Avoid both a repeated bag and simply continuing the opening rotation.
      const previous = this.lastOrder || kinds.map((_,i)=>kinds[(this.attackNumber+i)%3]).join(',');
      if (order.join(',') === previous) [order[1],order[2]] = [order[2],order[1]];
      this.lastOrder = order.join(','); this.attackQueue = order;
    }
    return this.attackQueue.shift();
  }
  log(type, data = {}) { this.events.push({tick:this.tick,type,...data}); }
  setInput(x = 0,y = 0) {
    const d = Math.max(1, Math.hypot(x,y)); const next = {x:x/d,y:y/d};
    if (next.x !== this.input.x || next.y !== this.input.y) {
      this.input = next; this.trace.push({tick:this.tick,...next});
    }
  }
  beginAttack() {
    const kind = this.nextAttack(); this.attackNumber++;
    const origin = {x:this.boss.x,y:this.boss.y};
    const angle = Math.atan2(this.player.y-origin.y,this.player.x-origin.x);
    this.attack = {kind,origin,angle,center:{x:this.player.x,y:this.player.y},
      end:{x:origin.x+Math.cos(angle)*650,y:origin.y+Math.sin(angle)*650},
      width:this.t.lineWidth, radius:kind==='CIRCLE'?this.t.circleRadius:this.t.coneRadius,
      halfAngle:this.t.coneHalfAngle, hit:false};
    this.phase = 'telegraph';
    this.phaseTime = this.t.telegraph + this.random() * .08;
    this.log('telegraph',{kind,pressure:this.pressure});
  }
  step() {
    if (this.status !== 'playing') return;
    const t = this.t, dt = t.step; this.tick++; this.time = this.tick*dt;
    const pressure = t.finalEscalationAt != null && this.time >= t.finalEscalationAt ? 2 : t.escalationAt != null && this.time >= t.escalationAt ? 1 : 0;
    if (pressure !== this.pressure) {
      this.pressure = pressure;
      this.log('escalation',{pressure,recovery:this.recoveryDuration()});
      // Do not truncate an active warning, impact or recovery at a threshold.
    }
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
      } else { this.phase = 'recovery'; this.phaseTime = this.recoveryDuration(); this.log('opening',{recovery:this.phaseTime}); }
    }
    if (this.phase === 'impact' && !this.attack.hit &&
        this.time-this.hurtAt >= t.invulnerability && hits(this.player,this.attack,t.playerRadius)) {
      this.attack.hit = true; const damage = Math.min(this.player.hp,t.incomingDamage); this.player.hp = Math.max(0,this.player.hp-damage); this.hurtAt = this.time;
      this.log('player-hit',{kind:this.attack.kind,hp:this.player.hp,damage});
    }
    if (this.player.hp <= 0) return this.finish('lost');
    if (!this.moving && this.still >= t.stationaryDelay &&
        this.time-this.shotAt >= t.cooldown && distance(this.player,this.boss) <= t.range) {
      this.shotAt = this.time; const damage = Math.min(this.boss.hp,t.damage);
      this.boss.hp = Math.max(0,Math.round((this.boss.hp-damage)*1e9)/1e9);
      this.log('boss-hit',{hp:this.boss.hp,damage});
      if (!this.boss.hp) return this.finish('won');
    }
    if (this.time >= t.limit) this.finish('timeout');
  }
  finish(status) { this.status = status; this.setInput(); this.log(status); }
  recording() { return {version:3,seed:this.seed,tuning:this.t,parameters:this.parameters,ticks:this.tick,trace:structuredClone(this.trace)}; }
}
export function fromRecording(record) {
  // Version 1 predates escalation. Preserve its original pacing and attack order.
  const tuning = record.version === 1 ? {...record.tuning,escalationAt:null,finalEscalationAt:null} : record.tuning;
  return new Encounter(record.seed,tuning,record.parameters ?? null);
}
export function replay(record) {
  const game = fromRecording(record); let i = 0;
  while (game.tick < record.ticks && game.status === 'playing') {
    while (record.trace[i]?.tick === game.tick) { const p = record.trace[i++]; game.setInput(p.x,p.y); }
    game.step();
  }
  return game;
}
