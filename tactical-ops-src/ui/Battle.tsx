import { missionHud, recoverSignalOpen } from "../combat/missionRules";
import { getMissionDef, missionBattlefield } from "../data/operations";
import { useMemo, useState, type CSSProperties } from "react";
import { Axe, ChevronsRight, Crosshair, HeartPulse, PawPrint, Shield, Slash, Swords, Target, Volume2, VolumeX } from "lucide-react";
import { useBattleStore, moveCellsNow, targetIdsNow } from "../store/battleStore";
import { fieldPercent, cellKey } from "../combat/movement";
import { availableSkills } from "../combat/skills";
import { getSkill } from "../data/skills";
import { getActionPresentation, RECOVER_PRESENTATION, type ActionArchetype } from "./actionPresentation";
import { affinityFor, combatIdentityLabel, combatTier, skillRankLabel } from "./combatIdentity";
import { FX_ROOT, combatFxVisualClasses, combatFxTravelKind } from "./combatFxAtlas";
import { playerBattleGuidance } from "./playerGuidance";
import { tacticalEmblemFor } from "./tacticalEmblems";
import { tacticalActionImageForSkill, tacticalActionImageForCommand } from "./tacticalActionIcons";
import { canRecover } from "../combat/battle";
import { effectiveAtk, effectiveDef, effectiveSpd, STATUS_SHORT } from "../combat/effects";
import { OPERATION } from "../data/units";
import { isMuted, setMuted as persistMute, unlockAudio, sfx } from "../audio";
import type { CombatUnit, StatusType } from "../combat/types";
import { GRID_COLS, GRID_ROWS, BATTLEFIELD_VNEXT_PREVIEW } from "../combat/types";
import { missionLiveProgress, objectiveDirective } from "./missionPurpose";

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

function ActIcon({ archetype }: { archetype?: ActionArchetype }) {
  const props = { className: "t-act-svg", "aria-hidden": true as const };
  if (archetype === "strike") return <Slash {...props} />;
  if (archetype === "heavy") return <Axe {...props} />;
  if (archetype === "control") return <Crosshair {...props} />;
  if (archetype === "heal") return <HeartPulse {...props} />;
  if (archetype === "support") return <Shield {...props} />;
  if (archetype === "objective") return <Target {...props} />;
  return <Swords {...props} />;
}

/** Cosmetic P2 art. Keep Lucide fallback if a static PNG fails to load. */
function ActionArt({ src, archetype, fallback }: { src: string | null; archetype?: ActionArchetype; fallback?: "skip" }) {
  const fallbackArt = fallback === "skip"
    ? <ChevronsRight className="t-act-svg" aria-hidden="true" />
    : <ActIcon archetype={archetype} />;
  if (!src) return fallbackArt;
  return (
    <span className="t-act-art" key={src} aria-hidden="true">
      <img
        className="t-act-image"
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        onError={(event) => event.currentTarget.parentElement?.classList.add("has-icon-error")}
      />
      <span className="t-act-fallback">{fallbackArt}</span>
    </span>
  );
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
  hitReacting = false,
  travelGhost = false,
  shownHp,
}: {
  unit: CombatUnit;
  selected: boolean;
  validTarget: boolean;
  targeting: boolean;
  attacking: boolean;
  inspecting: boolean;
  signalCarrier: boolean;
  interceptTarget?: boolean;
  hitReacting?: boolean;
  travelGhost?: boolean;
  shownHp?: number;
}) {
  const pos = fieldPercent(unit.c, unit.r);
  const hp = shownHp ?? unit.hp;
  const inspectUnit = useBattleStore((s) => s.inspectUnit);
  const selectTarget = useBattleStore((s) => s.selectTarget);
  const className = [
    "t-token",
    unit.team,
    roleClass(unit),
    unit.defeated && hp<=0 ? "defeated" : "",
    unit.hasActed ? "acted" : "",
    selected ? "selected active" : "",
    inspecting ? "inspect" : "",
    targeting && !validTarget && !selected ? "subdued" : "",
    targeting && validTarget ? "targetable" : "",
    attacking ? "attacking" : "",
    hitReacting ? "hit-reacting" : "",
    travelGhost ? "travel-ghost" : "",
    signalCarrier ? "trace-carrier" : "",
    unit.role === "leader" ? "boss-target" : "",
    `depth-${Math.max(0, Math.min(4, Math.floor(unit.r * 4 / (GRID_ROWS - 1))))}`,
    unit.c <= 1 ? "edge-left" : "",
    unit.c >= GRID_COLS - 2 ? "edge-right" : "",
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
      {targeting && validTarget && !unit.defeated ? (
        <span className={`t-target-reticle ${unit.team}`} aria-hidden="true">
          <i /><i /><i /><i />
        </span>
      ) : null}
      {unit.archetype && !unit.defeated ? <span className={`t-enemy-archetype t-archetype-${unit.archetype.toLowerCase()}`} aria-label={`Enemy class: ${unit.archetype}`}>{unit.archetype}</span> : null}
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
      {hp<=0 ? null : (
        <div className="t-plate">
          <div className="t-plate-name">
            <span>{unit.name}</span>
          </div>
          <div className="t-hp">
            <div className="t-hp-bar">
              <i style={{ width: `${(hp / unit.maxHp) * 100}%` }} />
            </div>
            <span className="t-hp-num">
              {hp}/{unit.maxHp}
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

function HudPortrait({ unit }: { unit: CombatUnit }) {
  const [failed, setFailed] = useState(false);
  const image = unit.portrait || unit.sprite;
  return <span className="t-status-portrait" aria-hidden="true">
    {!failed && image ? <img key={image} src={image} alt="" onError={() => setFailed(true)} /> : null}
    <PawPrint className="t-status-portrait-fallback" />
  </span>;
}

function StatusStrip() {
  const inspectId = useBattleStore((s) => s.battle.inspectId);
  const activeId = useBattleStore((s) => s.battle.activeId);
  const units = useBattleStore((s) => s.battle.units);
  const displayHp = useBattleStore((s) => s.displayHp);
  const identity = useBattleStore((s) => s.identity);
  const equippedPet = useBattleStore((s) => s.progression?.equippedPet);
  const [expanded, setExpanded] = useState(false);
  const unit = units.find((u) => u.id === inspectId) || units.find((u) => u.id === activeId) || units.find((u) => u.role === "alpha" && u.team === "ally" && !u.defeated);
  if (!unit) return null;
  const hp = displayHp[unit.id] ?? unit.hp;
  const isAlpha = unit.role === "alpha" || unit.defId === "alpha" || unit.id === "alpha";
  const level = isAlpha ? readHostLevel() : null;
  const kit = isAlpha ? [level != null ? `Lv ${level}` : null, identity.skinName || identity.armorLabel || identity.weaponLabel].filter(Boolean).join(" · ") : "";
  const atk = effectiveAtk(unit);
  const defn = effectiveDef(unit);
  return (
    <button type="button" className={`t-status t-hud-card ${expanded ? "is-expanded" : ""} ${unit.team}${isAlpha ? " is-alpha" : ""}`} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-label={`Selected unit: ${unit.name}, ${unit.hp} of ${unit.maxHp} HP. Toggle combat details`}>
      <HudPortrait key={unit.id} unit={unit} />
      <div className="t-status-main">
        <div className="t-status-head">
          <div className="t-status-name">{unit.name}</div>
          {isAlpha && equippedPet ? <span className="t-status-pet" title={equippedPet.name}><PawPrint className="t-ico" aria-hidden="true" /></span> : null}
        </div>
        {combatIdentityLabel(unit) ? <span className={`t-combat-identity t-identity-${affinityFor(unit)}`}>{tacticalEmblemFor(unit.defId, unit.growth?.discipline) ? <img className="t-combat-emblem" src={tacticalEmblemFor(unit.defId, unit.growth?.discipline)!} alt="" onError={e => { e.currentTarget.style.display = "none"; }} /> : null}{combatIdentityLabel(unit)}</span> : null}
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
    </button>
  );
}

function ObjectiveChip() {
  const battle = useBattleStore((s) => s.battle);
  const [expanded, setExpanded] = useState(false);
  const mission = getMissionDef(useBattleStore((s) => s.selectedMissionId));
  const rulesText = missionHud(battle);
  const liveGoal = mission ? missionLiveProgress(battle) : null;
  const directive = objectiveDirective(battle);
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
    <button type="button" className={`t-obj-chip t-hud-card ${expanded ? "is-expanded" : ""}`} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-label={`Mission objective: ${liveGoal || title}. Toggle mission details`}>
      <strong>{liveGoal || title}</strong>
      <span className="t-objective-directive">{directive.status}</span>
      <small className="t-objective-action">{directive.action}</small>
      {body ? <span>{body}{extras ? ` · ${extras}` : ""}</span> : extras ? <span>{extras}</span> : null}
      {mission?.challenge ? <small>OPTIONAL / {mission.challenge.label}</small> : null}
      {roundCap ? (
        <div className="t-obj-rounds">
          <em>{objective?.type === "HOLD" || objective?.type === "SURVIVE" ? `${directive.progress}/${directive.total} CONTROL` : `Round ${battle.round}/${roundCap}`}</em>
          <span className="t-obj-dots" aria-hidden="true">
            {Array.from({ length: Math.min(roundCap, 8) }, (_, i) => (
              <i key={i} className={i < (objective?.type === "HOLD" || objective?.type === "SURVIVE" ? objective.progress : battle.round) ? "on" : ""} />
            ))}
          </span>
        </div>
      ) : null}
    </button>
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
  if (actor?.team === "enemy") {
    return (
      <div className="t-actions t-actions-enemy" aria-live="polite">
        <div className="t-enemy-command">
          <Swords className="t-enemy-command-icon" aria-hidden="true" />
          <span>ENEMY ACTION</span>
          <small>{actor.name}</small>
        </div>
      </div>
    );
  }
  return (
    <div className={`t-actions${recoveryMission ? " has-obj" : ""}`}>
      {([0, 1, 2] as const).map((i) => {
        const sk = skills[i];
        const on = battle.actionSkillId && sk && battle.actionSkillId === sk.id;
        const cooling = sk && !sk.ready;
        const presentation = sk ? getActionPresentation(sk) : null;
        const tier = sk && actor ? combatTier(actor, sk.id) : "base";
        const rankLabel = sk && actor ? skillRankLabel(actor, sk.id) : null;
        return (
          <button
            key={i}
            type="button"
            className={`t-act t-growth-${tier} ${on ? "on" : ""} ${cooling ? "cooling" : ""} ${presentation ? `kind-${presentation.archetype} fx-${presentation.effectClass}` : ""}`}
            disabled={!allyTurn || !sk || !!cooling}
            aria-pressed={!!on}
            aria-label={sk ? `${sk.slot} ${sk.name}. ${sk.desc}` : `Empty slot A${i + 1}`}
            onClick={() => {
              if (!sk) return;
              unlockAudio();
              selectSkill(sk.id);
            }}
          >
            <ActionArt src={sk ? tacticalActionImageForSkill(sk.id) : null} archetype={presentation?.archetype} />
            <span className="slot">{sk?.slot ?? `A${i + 1}`}</span>
            {rankLabel ? <span className={`t-skill-rank${rankLabel === "SIGNATURE" ? " is-signature" : ""}`} aria-label={`Upgrade ${rankLabel}`}>{rankLabel}</span> : null}
            <span className="name">{sk?.name ?? "—"}</span>
            {presentation ? <span className="meta">{presentation.cue}</span> : null}
            {cooling ? <span className="cd">{sk!.cd}T</span> : null}
          </button>
        );
      })}
      {recoveryMission ? (
        <button
          type="button"
          className={`t-act t-act-obj kind-${RECOVER_PRESENTATION.archetype} fx-${RECOVER_PRESENTATION.effectClass} ${recoverReady ? "on" : "cooling"}`}
          disabled={!allyTurn || !recoverReady}
          aria-label={recoverReady ? "Recover. Complete objective, consumes action." : "Recover unavailable"}
          onClick={() => {
            unlockAudio();
            selectRecover();
          }}
        >
          <ActionArt src={tacticalActionImageForCommand("recover")} archetype={RECOVER_PRESENTATION.archetype} />
          <span className="slot">OBJ</span>
          <span className="name">RECOVER</span>
          <span className="meta">{RECOVER_PRESENTATION.cue}</span>
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
  const lastActionSkillId = useBattleStore((s) => s.lastActionSkillId);
  const combatMoment = useBattleStore((s) => s.combatMoment);
  const combatFx = useBattleStore((s) => s.combatFx);
  const enemyScene = useBattleStore((s) => s.enemyScene);
  const displayHp = useBattleStore((s) => s.displayHp);
  const travelActors = new Set(combatFx.filter(fx=>combatFxTravelKind(fx.name)==="dash" && fx.actorId).map(fx=>fx.actorId));
  const banner = useBattleStore((s) => s.banner);
  const ticker = useBattleStore((s) => s.ticker);
  const floats = useBattleStore((s) => s.floats);
  const consequences = useBattleStore((s) => s.consequences);
  const threats = useBattleStore((s) => s.threats);
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
  const activeSkill = actionSkillId ? getSkill(actionSkillId) : null;
  const focusPresentation = activeSkill ? getActionPresentation(activeSkill) : null;
  const impactSkill = lastActionSkillId ? getSkill(lastActionSkillId) : null;
  const impactPresentation = impactSkill ? getActionPresentation(impactSkill) : null;
  const allyTurn = !!(actor && actor.team === "ally" && !actor.hasActed && !actor.defeated && !busy);
  const impact = units.find((u) => u.id === impactId);
  const impactPos = impact ? fieldPercent(impact.c, impact.r) : null;
  const directive = objectiveDirective(useBattleStore.getState().battle);
  const guidance = playerBattleGuidance(useBattleStore.getState().battle, mission);

  return (
    <div
      className={`t-battle${BATTLEFIELD_VNEXT_PREVIEW ? " battlefield-vnext-preview" : ""}${focusPresentation ? ` is-focusing focus-${focusPresentation.targetClass} effect-${focusPresentation.effectClass}` : ""}`}
      data-impact-kind={impactPresentation?.effectClass || "damage"}
    >
      <header className="t-top t-battle-hud-rail" aria-label="Battle status and mission">
        <StatusStrip />
        <ObjectiveChip />
      </header>
      <div className="t-order-wrap">
        <TurnOrderBar />
      </div>
      {guidance && guidance.title !== directive.status && !["POSITION FIRST","NO ATTACK IN RANGE","HOLD THE RELAY","SECURE THE RELAY","SURVIVE THE WAVES","HOLD FORMATION"].includes(guidance.title) ? <div className="t-player-guidance" role="status"><strong>{guidance.title}</strong><span>{guidance.copy}</span></div> : null}
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
            {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => {
              const c = i % GRID_COLS;
              const r = Math.floor(i / GRID_COLS);
              const pos = fieldPercent(c, r);
              return <i key={`g-${c}-${r}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />;
            })}
          </div>
          {threats.flatMap((threat) => threat.impactTiles.map((cell, i) => {
            const pos = fieldPercent(cell.c, cell.r);
            return <div key={threat.id + ":" + i} className="t-threat-tile" style={{ left: pos.x + "%", top: pos.y + "%" }} aria-hidden="true" />;
          }))}
          {objective?.type === "HOLD" && objective.terminal ? Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => ({ c: i % GRID_COLS, r: Math.floor(i / GRID_COLS) })).filter((cell) => Math.abs(cell.c - objective.terminal!.c) + Math.abs(cell.r - objective.terminal!.r) <= (objective.radius ?? 0)).map((cell) => {
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
          {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => {
            const c = i % GRID_COLS;
            const r = Math.floor(i / GRID_COLS);
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
                hitReacting={u.id === impactId && impactKey > 0}
                shownHp={displayHp[u.id]}
                travelGhost={travelActors.has(u.id)}
                inspecting={u.id === inspectId}
                signalCarrier={u.id === signalCarrierId}
                interceptTarget={objective?.type === "INTERCEPT" && u.id === objective.targetId}
              />
            ))}
          {enemyScene && (() => {
            const from=fieldPercent(enemyScene.from.c,enemyScene.from.r),to=fieldPercent(enemyScene.to.c,enemyScene.to.r);
            const actor=units.find(u=>u.id===enemyScene.actorId);
            const style={"--enemy-x":from.x+"%","--enemy-y":from.y+"%","--enemy-target-x":to.x+"%","--enemy-target-y":to.y+"%","--enemy-duration":enemyScene.durationMs+"ms"} as CSSProperties;
            return <div className={`t-hostile-scene t-hostile-${enemyScene.style}`} key={enemyScene.id} style={style} aria-hidden="true">
              {["melee","heavy"].includes(enemyScene.style)&&actor?<img src={actor.attackSprite||actor.sprite} alt="" />:<svg viewBox="0 0 100 100" preserveAspectRatio="none"><line x1={from.x} y1={from.y} x2={to.x} y2={to.y}/></svg>}
            </div>;
          })()}
          {combatFx.map(effect=>{
            const performer=effect.actorId ? units.find(u=>u.id===effect.actorId) : null;
            const receiver=effect.terminal || units.find(u=>u.id===effect.targetId);
            if(!performer || !effect.from || !receiver || (effect.from.c===receiver.c && effect.from.r===receiver.r))return null;
            const from=fieldPercent(effect.from.c,effect.from.r),to=fieldPercent(receiver.c,receiver.r);
            const travelKind=combatFxTravelKind(effect.name);
            if(travelKind==="none")return null;
            const ranged=travelKind==="beam";
            return <div key={"travel-"+effect.id} className={`t-choreo-travel ${ranged?"ranged":"melee"}`}
              style={{"--from-x":from.x+"%","--from-y":from.y+"%","--to-x":to.x+"%","--to-y":to.y+"%", "--travel-ms":effect.durationMs+"ms"} as CSSProperties} aria-hidden="true">
              {ranged?<svg className="t-choreo-line" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1={from.x} y1={from.y} x2={to.x} y2={to.y}/></svg>:
                <img className="t-choreo-actor" src={performer.attackSprite||performer.sprite} alt="" />}
            </div>;
          })}
          {combatFx.map(effect=>{
            const unit=units.find(u=>u.id===effect.targetId);
            const anchor=effect.terminal||unit;
            if(!anchor)return null;
            const pos=fieldPercent(anchor.c,anchor.r);
            return <div key={effect.id} className={`t-sprite-fx ${["alpha_howl","shadow_pack_heal_def","shadow_pack_def_only","shadow_pack_guard"].includes(effect.name) ? "fx-area fx-support" : ""} ${combatFxVisualClasses(effect.name)}`} style={{left:pos.x+"%",top:pos.y+"%"}} aria-hidden="true">
              <div className="t-sprite-fx-clip" style={{animationDuration:effect.durationMs+"ms"}}>
                <div className="t-sprite-fx-sheet" style={{
                  backgroundImage:`url("${FX_ROOT}${effect.name}.webp")`,
                  animationDuration:effect.durationMs+"ms"
                }}/>
              </div>
            </div>;
          })}
          {combatMoment && (() => {
            const target = units.find(u => u.id === combatMoment.targetId);
            if (!target) return null;
            const pos = fieldPercent(target.c, target.r);
            return <div key={combatMoment.id} className={`t-master-fx fx-affinity-${combatMoment.affinity} fx-tier-${combatMoment.tier} fx-mode-${combatMoment.mode}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-hidden="true">
              <i className="t-master-fx-ring" /><i className="t-master-fx-core" />
            </div>;
          })()}
          {consequences.map(item=>{
            const u=units.find(u=>u.id===item.unitId);
            if(!u)return null;
            const pos=fieldPercent(u.c,u.r);
            return <div key={item.id} className={`t-consequence t-consequence-${item.kind}`}
              style={{left:`clamp(82px, ${pos.x}%, calc(100% - 82px))`,top:`clamp(24px, ${pos.y-14}%, calc(100% - 32px))`}} aria-hidden="true">{item.label}</div>;
          })}
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
            <div
              key={impactKey}
              className={`t-impact t-impact-${impactPresentation?.effectClass || "damage"}`}
              style={{ left: `${impactPos.x}%`, top: `${impactPos.y - 4}%` }}
            />
          ) : null}
        </div>
      </div>
      {threats.length > 0 ? (
        <aside className="t-threat-brief" role="status" aria-live="polite" aria-label="Incoming enemy attack">
          <div className="t-threat-brief-head"><span className="t-threat-brief-pip" aria-hidden="true" /> INCOMING ATTACK <small>RED = DANGER</small></div>
          <div className="t-threat-brief-detail">{threats.length === 1 ? threats[0].predictedEffect : `${threats.length} ENEMY ATTACKS LOCKED`}</div>
          <div className="t-threat-brief-action">MOVE OFF RED <span>·</span> INTERRUPT <span>·</span> GUARD</div>
        </aside>
      ) : null}
      {combatMoment ? <div className={`t-master-moment t-master-moment-${combatMoment.affinity} t-master-moment-${combatMoment.tier}`} role="status" aria-live="polite" key={combatMoment.id}>
        <strong>{combatMoment.title}</strong><small>{combatMoment.consequence}</small>
      </div> : null}
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
          <ActionArt src={tacticalActionImageForCommand("skip")} fallback="skip" />
          Skip
        </button>
      </footer>
    </div>
  );
}
