import { missionHud, recoverSignalOpen } from "../combat/missionRules";
import { getMissionDef, missionBattlefield } from "../data/operations";
import { useMemo } from "react";
import { Axe, AudioLines, ChevronsRight, PawPrint, Plus, Slash, Swords, Volume2, VolumeX } from "lucide-react";
import { useBattleStore, moveCellsNow, targetIdsNow } from "../store/battleStore";
import { fieldPercent, cellKey } from "../combat/movement";
import { availableSkills } from "../combat/skills";
import { canRecover } from "../combat/battle";
import { effectiveAtk, effectiveDef, effectiveSpd, STATUS_SHORT } from "../combat/effects";
import { OPERATION } from "../data/units";
import { isMuted, setMuted as persistMute, unlockAudio, sfx } from "../audio";
import type { CombatUnit, StatusType } from "../combat/types";

const PRESENTATION = {
  battlefield: "/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png",
  traceTarget: "/images/tactical_ops/presentation/tactical_ops_trace_target.png",
  signalRecovery: "/images/tactical_ops/presentation/tactical_ops_signal_recovery_marker.png",
  bossTarget: "/images/tactical_ops/presentation/tactical_ops_boss_target.png",
  reinforcementWarning: "/images/tactical_ops/presentation/tactical_ops_reinforcement_warning.png",
} as const;

function readHostLevel(): number | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const profile = (w.__PROFILE__ || w.PROFILE || w.profileState || w.lastProfile || {}) as Record<string, unknown>;
  const raw = profile.level ?? profile.lv ?? profile.hero_level ?? profile.heroLevel;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

function isBuff(t: StatusType): boolean {
  return t === "ATK_UP" || t === "DEF_UP" || t === "SPD_UP" || t === "GUARD";
}

function roleClass(unit: CombatUnit): string {
  if (unit.role === "leader") return "leader";
  if (unit.role === "hostile") return "hound";
  if (unit.role === "alpha") return "alpha";
  if (unit.role === "ranged" || unit.role === "skirmisher") return "skirmisher";
  if (unit.role === "support") return "support";
  return "";
}

function ActIcon({ name }: { name?: string }) {
  const n = (name || "").toUpperCase();
  const props = { className: "t-act-svg", "aria-hidden": true as const };
  if (n === "STRIKE" || n === "BITE" || n === "THRUST") return <Slash {...props} />;
  if (n === "REND" || n === "LUNGE" || n === "HAMSTRING") return <Axe {...props} />;
  if (n === "HOWL") return <AudioLines {...props} />;
  if (n === "RECOVER") return <Plus {...props} />;
  return <Swords {...props} />;
}

function formatMod(label: string, effective: number, base: number): string {
  const delta = effective - base;
  if (delta === 0) return `${label} ${effective}`;
  return `${label} ${delta > 0 ? "+" : ""}${delta}`;
}

function Ring({ selected, guarding }: { selected: boolean; guarding: boolean }) {
  return (
    <svg className="t-ring" viewBox="0 0 100 36" aria-hidden="true">
      <ellipse
        cx="50"
        cy="22"
        rx={selected ? 40 : 34}
        ry={selected ? 12 : 10}
        fill="none"
        stroke="currentColor"
        strokeWidth={selected ? 1.8 : 1.2}
        opacity={selected ? 0.95 : 0.55}
      />
      <ellipse
        cx="50"
        cy="22"
        rx={selected ? 32 : 26}
        ry={selected ? 9 : 7}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.4"
        strokeDasharray="2 3"
      />
      {guarding ? (
        <ellipse cx="50" cy="22" rx="44" ry="13.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.85" />
      ) : null}
    </svg>
  );
}

function Token({
  unit,
  selected,
  validTarget,
  targeting,
  attacking,
  inspecting,
  signalCarrier,
  interceptTarget = false,
}: {
  unit: CombatUnit;
  selected: boolean;
  validTarget: boolean;
  targeting: boolean;
  attacking: boolean;
  inspecting: boolean;
  signalCarrier: boolean;
  interceptTarget?: boolean;
}) {
  const pos = fieldPercent(unit.c, unit.r);
  const inspectUnit = useBattleStore((s) => s.inspectUnit);
  const selectTarget = useBattleStore((s) => s.selectTarget);
  const className = [
    "t-token",
    unit.team,
    roleClass(unit),
    unit.defeated ? "defeated" : "",
    unit.hasActed ? "acted" : "",
    selected ? "selected active" : "",
    inspecting ? "inspect" : "",
    targeting && !validTarget && !selected ? "subdued" : "",
    targeting && validTarget ? "targetable" : "",
    attacking ? "attacking" : "",
    signalCarrier ? "trace-carrier" : "",
    unit.role === "leader" ? "boss-target" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const src = attacking && unit.attackSprite ? unit.attackSprite : unit.sprite;
  return (
    <div
      className={className}
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: 4 + unit.r * 4 + (selected ? 2 : 0) }}
    >
      <Ring selected={selected} guarding={unit.statuses.some((s) => s.type === "GUARD") && !unit.defeated} />
      {signalCarrier && !unit.defeated ? <><img className="t-token-marker trace" src={PRESENTATION.traceTarget} alt="" /><span className="t-objective-badge trace">TRACE TARGET</span></> : null}
      {interceptTarget && !unit.defeated ? <><img className="t-token-marker trace" src={PRESENTATION.traceTarget} alt="" /><span className="t-objective-badge trace">COURIER</span></> : null}
      {unit.role === "leader" && !unit.defeated ? <><img className="t-token-marker boss" src={PRESENTATION.bossTarget} alt="" /><span className="t-objective-badge boss">BOSS</span></> : null}
      <img className="body" src={src} alt="" draggable={false} />
      <button
        type="button"
        className="t-hit"
        aria-label={unit.name}
        onPointerDown={(e) => {
          e.stopPropagation();
          unlockAudio();
          if (targeting && validTarget) selectTarget(unit.id);
          else inspectUnit(unit.id);
        }}
      />
      {unit.defeated ? null : (
        <div className="t-plate">
          <div className="t-plate-name">
            <span>{unit.name}</span>
          </div>
          <div className="t-hp">
            <div className="t-hp-bar">
              <i style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} />
            </div>
            <span className="t-hp-num">
              {unit.hp}/{unit.maxHp}
            </span>
          </div>
          {unit.statuses.length ? (
            <div className="t-chips">
              {unit.statuses.slice(0, 3).map((st) => (
                <span key={st.id} className={`t-chip ${isBuff(st.type) ? "buff" : "debuff"}`}>
                  {STATUS_SHORT[st.type]}
                </span>
              ))}
            </div>
          ) : null}
          {signalCarrier && !unit.defeated ? <div className="t-chips"><span className="t-chip buff">TRACE</span></div> : null}
        </div>
      )}
    </div>
  );
}

function TurnOrderBar() {
  const queue = useBattleStore((s) => s.queue);
  const units = useBattleStore((s) => s.battle.units);
  const activeId = useBattleStore((s) => s.battle.activeId);
  return (
    <div className="t-order" aria-label="Turn order">
      {queue.map((id, i) => {
        const u = units.find((x) => x.id === id);
        if (!u) return null;
        return (
          <div
            key={`${id}-${i}`}
            className={`t-order-unit ${u.team === "enemy" ? "enemy" : ""} ${id === activeId && i === 0 ? "active" : ""}`}
            title={u.name}
          >
            <img src={u.portrait || u.sprite} alt="" />
          </div>
        );
      })}
    </div>
  );
}

function StatusStrip() {
  const inspectId = useBattleStore((s) => s.battle.inspectId);
  const activeId = useBattleStore((s) => s.battle.activeId);
  const units = useBattleStore((s) => s.battle.units);
  const identity = useBattleStore((s) => s.identity);
  const equippedPet = useBattleStore((s) => s.progression?.equippedPet);
  const unit = units.find((u) => u.id === inspectId) || units.find((u) => u.id === activeId) || units.find((u) => u.role === "alpha" && u.team === "ally" && !u.defeated);
  if (!unit) return null;
  const isAlpha = unit.role === "alpha" || unit.defId === "alpha" || unit.id === "alpha";
  const level = isAlpha ? readHostLevel() : null;
  const kit = isAlpha ? [level != null ? `Lv ${level}` : null, identity.skinName || identity.armorLabel || identity.weaponLabel].filter(Boolean).join(" · ") : "";
  const atk = effectiveAtk(unit);
  const defn = effectiveDef(unit);
  return (
    <aside className={`t-status ${unit.team}${isAlpha ? " is-alpha" : ""}`} onPointerDown={(e) => e.stopPropagation()} aria-label="Selected unit">
      <img src={unit.portrait || unit.sprite} alt="" />
      <div className="t-status-main">
        <div className="t-status-head">
          <div className="t-status-name">{unit.name}</div>
          {isAlpha && equippedPet ? <span className="t-status-pet" title={equippedPet.name}><PawPrint className="t-ico" aria-hidden="true" /></span> : null}
        </div>
        {kit ? <div className="t-status-kit">{kit}</div> : null}
        <div className="t-status-mods">
          <span>{formatMod("ATK", atk, unit.atk)}</span>
          <span>{formatMod("DEF", defn, unit.def)}</span>
        </div>
        <div className="t-hp">
          <div className="t-hp-bar">
            <i style={{ width: `${(unit.hp / unit.maxHp) * 100}%` }} />
          </div>
          <span className="t-hp-num">
            {unit.hp}/{unit.maxHp}
          </span>
        </div>
        {unit.statuses.length ? (
          <div className="t-chips">
            {unit.statuses.slice(0, 3).map((st) => (
              <span key={st.id} className={`t-chip ${isBuff(st.type) ? "buff" : "debuff"}`}>
                {STATUS_SHORT[st.type]}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <dl className="t-status-stats">
        <div>
          <dt>ATK</dt>
          <dd>{atk}</dd>
        </div>
        <div>
          <dt>DEF</dt>
          <dd>{defn}</dd>
        </div>
        <div>
          <dt>SPD</dt>
          <dd>{effectiveSpd(unit)}</dd>
        </div>
        <div>
          <dt>MOV</dt>
          <dd>{unit.move}</dd>
        </div>
      </dl>
    </aside>
  );
}

function ObjectiveChip() {
  const battle = useBattleStore((s) => s.battle);
  const mission = getMissionDef(useBattleStore((s) => s.selectedMissionId));
  const rulesText = missionHud(battle);
  const objective = battle.objective;
  if (!rulesText && !mission?.challenge && !objective) return null;
  const jammed = objective?.type === "RECOVER" && !recoverSignalOpen(battle);
  const title =
    objective?.type === "RECOVER"
      ? jammed
        ? "Recover — Signal Jammed"
        : "Recover — Signal Open"
      : objective?.type === "SURVIVE"
        ? "Survive"
        : objective?.type === "HOLD"
          ? "Hold"
          : objective?.type === "INTERCEPT"
            ? "Intercept"
            : objective?.type === "BOSS"
              ? "Defeat Commander"
              : mission?.name || "Objective";
  const body =
    objective?.type === "RECOVER"
      ? jammed
        ? "Even rounds only"
        : "Reach the relay and recover"
      : rulesText;
  const extras = [
    battle.directive?.supportCooldownExtra ? `Support cooldowns +${battle.directive.supportCooldownExtra}` : "",
    battle.directive?.maxRounds ? `${Math.max(0, battle.directive.maxRounds - battle.round + 1)} rounds left` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const roundCap =
    objective && (objective.type === "HOLD" || objective.type === "SURVIVE")
      ? objective.duration
      : mission?.challenge?.type === "TURN_LIMIT"
        ? mission.challenge.limit
        : null;
  return (
    <div className="t-obj-chip" role="status">
      <strong>{title}</strong>
      {body ? <span>{body}{extras ? ` · ${extras}` : ""}</span> : extras ? <span>{extras}</span> : null}
      {mission?.challenge ? <small>OPTIONAL / {mission.challenge.label}</small> : null}
      {roundCap ? (
        <div className="t-obj-rounds">
          <em>Round {battle.round}/{roundCap}</em>
          <span className="t-obj-dots" aria-hidden="true">
            {Array.from({ length: Math.min(roundCap, 8) }, (_, i) => (
              <i key={i} className={i < battle.round ? "on" : ""} />
            ))}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function SkillHud() {
  const battle = useBattleStore((s) => s.battle);
  const busy = useBattleStore((s) => s.busy);
  const selectSkill = useBattleStore((s) => s.selectSkill);
  const selectRecover = useBattleStore((s) => s.selectRecover);
  const actor = battle.units.find((u) => u.id === battle.activeId);
  const allyTurn = !!(actor && actor.team === "ally" && !actor.hasActed && !actor.defeated && !busy);
  const skills = actor ? availableSkills(battle, actor) : [];
  const recoveryMission = battle.objective?.type === "RECOVER" && !battle.objective.completed;
  const recoverReady = canRecover(battle);
  return (
    <div className={`t-actions${recoveryMission ? " has-obj" : ""}`}>
      {([0, 1, 2] as const).map((i) => {
        const sk = skills[i];
        const on = battle.actionSkillId && sk && battle.actionSkillId === sk.id;
        const cooling = sk && !sk.ready;
        return (
          <button
            key={i}
            type="button"
            className={`t-act ${on ? "on" : ""} ${cooling ? "cooling" : ""}`}
            disabled={!allyTurn || !sk || !!cooling}
            aria-pressed={!!on}
            aria-label={sk ? `${sk.slot} ${sk.name}. ${sk.desc}` : `Empty slot A${i + 1}`}
            onClick={() => {
              if (!sk) return;
              unlockAudio();
              selectSkill(sk.id);
            }}
          >
            <ActIcon name={sk?.name} />
            <span className="slot">{sk?.slot ?? `A${i + 1}`}</span>
            <span className="name">{sk?.name ?? "—"}</span>
            {cooling ? <span className="cd">{sk!.cd}T</span> : null}
          </button>
        );
      })}
      {recoveryMission ? (
        <button
          type="button"
          className={`t-act t-act-obj ${recoverReady ? "on" : "cooling"}`}
          disabled={!allyTurn || !recoverReady}
          aria-label={recoverReady ? "Recover. Complete objective, consumes action." : "Recover unavailable"}
          onClick={() => {
            unlockAudio();
            selectRecover();
          }}
        >
          <ActIcon name="RECOVER" />
          <span className="slot">OBJ</span>
          <span className="name">RECOVER</span>
        </button>
      ) : null}
    </div>
  );
}

export function BattleScreen() {
  const units = useBattleStore((s) => s.battle.units);
  const round = useBattleStore((s) => s.battle.round);
  const mode = useBattleStore((s) => s.battle.mode);
  const activeId = useBattleStore((s) => s.battle.activeId);
  const inspectId = useBattleStore((s) => s.battle.inspectId);
  const actionSkillId = useBattleStore((s) => s.battle.actionSkillId);
  const banner = useBattleStore((s) => s.banner);
  const ticker = useBattleStore((s) => s.ticker);
  const floats = useBattleStore((s) => s.floats);
  const attackingId = useBattleStore((s) => s.attackingId);
  const impactId = useBattleStore((s) => s.impactId);
  const impactKey = useBattleStore((s) => s.impactKey);
  const muted = useBattleStore((s) => s.muted);
  const busy = useBattleStore((s) => s.busy);
  const selectCell = useBattleStore((s) => s.selectCell);
  const skipTurn = useBattleStore((s) => s.skipTurn);
  const cancel = useBattleStore((s) => s.cancel);
  const toggleMute = useBattleStore((s) => s.toggleMute);
  const objective = useBattleStore((s) => s.battle.objective);
  const mission = getMissionDef(useBattleStore((s) => s.selectedMissionId));
  const reinforcement = useBattleStore((s) => s.battle.reinforcement);
  const signalCarrierId = useBattleStore((s) => s.battle.signalCarrierId);

  const moves = useMemo(
    () => new Set(moveCellsNow().map((c) => cellKey(c.c, c.r))),
    [units, activeId, mode, busy, actionSkillId],
  );
  const targets = useMemo(() => targetIdsNow(), [units, activeId, mode, actionSkillId]);

  const actor = units.find((u) => u.id === activeId);
  const allyTurn = !!(actor && actor.team === "ally" && !actor.hasActed && !actor.defeated && !busy);
  const impact = units.find((u) => u.id === impactId && !u.defeated);
  const impactPos = impact ? fieldPercent(impact.c, impact.r) : null;
  const phaseLabel = actor?.team === "enemy" ? "Enemy act" : "Your act";
  const activityLabel = mission?.activity === "FIELD_OP" ? `FIELD OP / ${mission.name}` : OPERATION.name;

  return (
    <div className="t-battle">
      <header className="t-top">
        <div className="t-brand">
          <div>
            <h1 className="t-title">
              Alpha Husky <span className="t-brand-sep">//</span> Tactical Ops
            </h1>
          </div>
        </div>
        <div className="t-turn">
          <strong>TURN {String(round).padStart(2, "0")}</strong>
          <span className="t-turn-sub">
            {phaseLabel}
            {actor ? ` · ${actor.name}` : ""}
          </span>
        </div>
        <div className="t-obj">{activityLabel}</div>
      </header>
      <div className="t-order-wrap">
        <TurnOrderBar />
      </div>
      <ObjectiveChip />
      {ticker ? <div className="t-ticker">{ticker}</div> : null}
      {reinforcement?.telegraphed && !reinforcement.spawned ? <div className="t-ticker t-ticker-warn">ROUTING TRACE · REINFORCEMENT DETECTED</div> : null}
      <div className="t-field-wrap">
        <div
          className="t-field"
          onPointerDown={(e) => {
            if (busy) return;
            if (e.target !== e.currentTarget) return;
            cancel();
          }}
        >
          <img className="t-field-art" src={missionBattlefield(mission).art} alt="" />
          <div className="t-field-grade" />
          <div className="t-vignette" />
          <div className="t-grid" aria-hidden="true">
            {Array.from({ length: 40 }, (_, i) => {
              const c = i % 8;
              const r = Math.floor(i / 8);
              const pos = fieldPercent(c, r);
              return <i key={`g-${c}-${r}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />;
            })}
          </div>
          {objective?.type === "HOLD" && objective.terminal ? Array.from({ length: 40 }, (_, i) => ({ c: i % 8, r: Math.floor(i / 8) })).filter((cell) => Math.abs(cell.c - objective.terminal!.c) + Math.abs(cell.r - objective.terminal!.r) <= (objective.radius ?? 0)).map((cell) => {
            const pos = fieldPercent(cell.c, cell.r);
            return <div key={`hold-${cell.c}-${cell.r}`} className="t-hold-cell" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-label="Hold area">HOLD</div>;
          }) : null}
          {objective?.type === "RECOVER" ? (() => {
            const pos = fieldPercent(objective.terminal.c, objective.terminal.r);
            return <div className={`t-terminal ${objective.completed ? "complete" : ""}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-label="Relay terminal"><img className="t-objective-marker-art" src={PRESENTATION.signalRecovery} alt="" /><span>RELAY</span><small>{objective.completed ? "RECOVERED" : "RECOVER"}</small></div>;
          })() : null}
          {objective?.type === "INTERCEPT" ? (() => {
            const pos = fieldPercent(objective.exit.c, objective.exit.r);
            return <div className="t-terminal" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-label="Courier escape exit"><img className="t-objective-marker-art" src={PRESENTATION.reinforcementWarning} alt="" /><span>EXIT</span><small>BLOCK / INTERCEPT</small></div>;
          })() : null}
          {reinforcement?.telegraphed && !reinforcement.spawned ? (() => {
            const pos = fieldPercent(reinforcement.spawn.c, reinforcement.spawn.r);
            return <div className="t-reinforcement-marker" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}><img className="t-objective-marker-art" src={PRESENTATION.reinforcementWarning} alt="" /><span>INBOUND</span><small>HOUND</small></div>;
          })() : null}
          {Array.from({ length: 40 }, (_, i) => {
            const c = i % 8;
            const r = Math.floor(i / 8);
            const key = cellKey(c, r);
            if (!moves.has(key)) return null;
            const pos = fieldPercent(c, r);
            return (
              <button
                key={key}
                type="button"
                className="t-cell move"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                aria-label={`Move to ${c},${r}`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  unlockAudio();
                  selectCell(c, r);
                }}
              />
            );
          })}
          {units
            .slice()
            .sort((a, b) => a.r - b.r || a.c - b.c)
            .map((u) => (
              <Token
                key={u.id}
                unit={u}
                selected={u.id === activeId}
                validTarget={targets.has(u.id)}
                targeting={mode === "targeting"}
                attacking={u.id === attackingId}
                inspecting={u.id === inspectId}
                signalCarrier={u.id === signalCarrierId}
                interceptTarget={objective?.type === "INTERCEPT" && u.id === objective.targetId}
              />
            ))}
          {floats.map((f) => {
            const u = units.find((x) => x.id === f.unitId);
            if (!u) return null;
            const pos = fieldPercent(u.c, u.r);
            return (
              <div key={f.id} className={`t-float ${f.kind}`} style={{ left: `${pos.x}%`, top: `${pos.y - 6}%` }}>
                {f.text}
              </div>
            );
          })}
          {impactPos ? (
            <div key={impactKey} className="t-impact" style={{ left: `${impactPos.x}%`, top: `${impactPos.y - 4}%` }} />
          ) : null}
        </div>
      </div>
      <StatusStrip />
      {banner ? (
        <div className="t-banner">
          <span>{banner}</span>
        </div>
      ) : null}
      <footer className="t-dock">
        <button
          type="button"
          className="t-icon-btn"
          aria-label={muted ? "Unmute" : "Mute"}
          onClick={() => {
            const next = !isMuted();
            persistMute(next);
            toggleMute();
            unlockAudio();
            if (!next) sfx("ui");
          }}
        >
          {muted ? <VolumeX className="t-ico" /> : <Volume2 className="t-ico" />}
        </button>
        <SkillHud />
        <button
          type="button"
          className="t-btn t-skip"
          disabled={!allyTurn}
          onClick={() => {
            unlockAudio();
            skipTurn();
          }}
        >
          <ChevronsRight className="t-act-svg" aria-hidden="true" />
          Skip
        </button>
      </footer>
    </div>
  );
}
