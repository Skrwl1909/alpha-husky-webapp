import { deriveBattlePresentation, cellTouchStyle } from "./battlePresentation";
import { missionHud, recoverSignalOpen } from "../combat/missionRules";
import { getMissionDef, missionBattlefield } from "../data/operations";
import { resolveCurrentEncounter } from "../data/onboarding";
import { foundationBattleGuidance } from "./playerGuidance";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Axe, ChevronsRight, Crosshair, HeartPulse, PawPrint, Shield, Slash, Swords, Target, Volume2, VolumeX } from "lucide-react";
import { useBattleStore, moveCellsNow, targetIdsNow } from "../store/battleStore";
import { fieldPercent, cellKey } from "../combat/movement";
import { availableSkills } from "../combat/skills";
import { getSkill } from "../data/skills";
import { getActionPresentation, RECOVER_PRESENTATION, type ActionArchetype } from "./actionPresentation";
import { affinityFor, combatIdentityLabel, combatTier, skillRankLabel } from "./combatIdentity";
import { FX_ROOT, combatFxVisualClasses, combatFxTravelKind } from "./combatFxAtlas";
import { tacticalEmblemFor } from "./tacticalEmblems";
import { tacticalActionImageForSkill, tacticalActionImageForCommand } from "./tacticalActionIcons";
import { canRecover } from "../combat/battle";
import { effectiveAtk, effectiveDef, effectiveSpd, STATUS_SHORT } from "../combat/effects";
import { FALLBACK_SPRITE, OPERATION } from "../data/units";
import type { PlayerIdentity } from "../host/identity";
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

type Facing = "front" | "back" | "left" | "right";
type FacingCell = { c: number; r: number };
function facingToward(from: FacingCell, to: FacingCell, fallback: Facing): Facing {
  const dx = to.c - from.c, dy = to.r - from.r;
  if (!dx && !dy) return fallback;
  return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "front" : "back");
}
const alphaView = (facing: Facing) => `/images/tactical_ops/alpha_directional/${facing}.png`;

function allowDirectional(unit: CombatUnit, identity: PlayerIdentity): boolean {
  return unit.team === "ally" && unit.role === "alpha" && unit.sprite === FALLBACK_SPRITE &&
    !identity.skinKey?.trim() && !identity.skinUrl?.trim() &&
    identity.source !== "skin" && identity.source !== "character-image";
}
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
  facingTarget,
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
  facingTarget?: FacingCell;
}) {
  const pos = fieldPercent(unit.c, unit.r);
  const hp = shownHp ?? unit.hp;
  const inspectUnit = useBattleStore((s) => s.inspectUnit);
  const selectTarget = useBattleStore((s) => s.selectTarget);
  const busy = useBattleStore((s) => s.busy);
  const identity = useBattleStore((s) => s.identity);
  const isAlpha = unit.team === "ally" && unit.role === "alpha";
  const directionalAlpha = allowDirectional(unit, identity);
  const [artFailed, setArtFailed] = useState(false);
  const className = [
    "t-token",
    unit.team,
    roleClass(unit),
    directionalAlpha && !artFailed ? "directional-alpha" : "",
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
  const previousCell = useRef({ c: unit.c, r: unit.r });
  const [facing, setFacing] = useState<Facing>("front");
  useLayoutEffect(() => {
    const previous = previousCell.current;
    if (previous.c !== unit.c || previous.r !== unit.r) {
      setFacing(current => facingToward(previous, unit, current));
      previousCell.current = { c: unit.c, r: unit.r };
    }
  }, [unit.c, unit.r]);
  useLayoutEffect(() => {
    if (facingTarget) setFacing(current => facingToward(unit, facingTarget, current));
  }, [facingTarget?.c, facingTarget?.r, unit.c, unit.r]);
  const src = directionalAlpha && !artFailed ? alphaView(facing) : attacking && unit.attackSprite ? unit.attackSprite : unit.sprite;
  return (
    <>
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
      {directionalAlpha && !artFailed ? <span className="t-alpha-ground-shadow" aria-hidden="true" /> : null}
      <img className="body" src={src} alt="" draggable={false} onError={isAlpha && !artFailed ? () => setArtFailed(true) : undefined} />
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
      <button
        type="button"
        className={`t-hit t-unit-hit${targeting && validTarget ? " is-legal-target" : ""}`}
        disabled={busy || unit.defeated}
        data-unit-id={unit.id}
        style={{ left: `${pos.x}%`, top: `${pos.y}%`, ...cellTouchStyle(unit.r, GRID_COLS, GRID_ROWS) } as CSSProperties}
        aria-label={`${unit.name}. ${hp}/${unit.maxHp} HP${targeting && validTarget ? ". Legal target" : ""}`}
        onClick={e => { if (e.detail !== 0) return; if (targeting && validTarget) selectTarget(unit.id); else inspectUnit(unit.id); }}
        onPointerDown={(e) => {
          e.stopPropagation();
          unlockAudio();
          if (targeting && validTarget) selectTarget(unit.id);
          else inspectUnit(unit.id);
        }}
      />
    </>
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
  const unit = units.find((u) => u.id === activeId) || units.find((u) => u.team === "ally" && !u.defeated);
  const inspected = units.find(u => u.id === inspectId);
  if (!unit) return null;
  const hp = displayHp[unit.id] ?? unit.hp;
  const isAlpha = unit.role === "alpha" || unit.defId === "alpha" || unit.id === "alpha";
  const level = isAlpha ? readHostLevel() : null;
  const kit = isAlpha ? [level != null ? `Lv ${level}` : null, identity.skinName || identity.armorLabel || identity.weaponLabel].filter(Boolean).join(" · ") : "";
  const atk = effectiveAtk(unit);
  const defn = effectiveDef(unit);
  const detail = `${inspected && inspected.id !== unit.id ? `${inspected.name} ${displayHp[inspected.id] ?? inspected.hp}/${inspected.maxHp} HP · ` : ""}ATK ${atk} · DEF ${defn} · SPD ${effectiveSpd(unit)} · MOV ${unit.move}${kit ? ` · ${kit}` : ""}`;
  return (
    <button type="button" className={`t-status t-hud-card ${expanded ? "is-expanded" : ""} ${unit.team}${isAlpha ? " is-alpha" : ""}`} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-label={`Acting unit: ${unit.name}, ${hp} of ${unit.maxHp} HP. ${expanded ? detail + ". Tap to close details" : "Toggle combat details"}`}>
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
      </div>
      <span className="t-status-detail">{detail}</span>
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
  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);
  const onboardingStageId = useBattleStore((s) => s.onboardingStageId);
  const training = !mission && onboardingEnabled;
  const trainingEncounter = training ? resolveCurrentEncounter(true, onboardingStageId) : null;
  const trainingCue = training ? foundationBattleGuidance(battle, onboardingStageId) : null;
  const rulesText = missionHud(battle);
  const liveGoal = mission ? missionLiveProgress(battle) : null;
  const directive = objectiveDirective(battle);
  const objective = battle.objective;
  if (!rulesText && !mission?.challenge && !objective && !training) return null;
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
              : training ? onboardingStageId === "solo-1" ? "DEFEAT THE SCOUT" : onboardingStageId === "solo-2" ? "DEFEAT BOTH SCOUTS" : "DEFEAT HOSTILES" : mission?.name || "Objective";
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
  const detail = training ? trainingCue?.copy || trainingEncounter?.teaching || "" : `${directive.action}${body ? ` ${body}` : ""}${extras ? ` · ${extras}` : ""}`;
  return (
    <button type="button" className={`t-obj-chip t-hud-card ${training ? "is-training" : ""} ${expanded ? "is-expanded" : ""}`} onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-label={`Mission objective: ${liveGoal || title}. ${expanded ? detail + " Tap to close details." : (trainingCue?.title || directive.status) + ". Tap for details."}`}>
      <strong>{liveGoal || title}</strong>
      <span className="t-objective-summary">{training ? trainingCue?.title || "DEFEAT HOSTILES" : objective?.type === "RECOVER" && objective.completed ? "OBJECTIVE COMPLETE" : directive.status}</span>
      <span className="t-objective-detail">{detail}</span>
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

function SkillHud({ actionStates }: { actionStates: ReturnType<typeof deriveBattlePresentation>["actions"] }) {
  const battle = useBattleStore((s) => s.battle);
  const busy = useBattleStore((s) => s.busy);
  const selectSkill = useBattleStore((s) => s.selectSkill);
  const selectRecover = useBattleStore((s) => s.selectRecover);
  const actor = battle.units.find((u) => u.id === battle.activeId);
  const allyTurn = !!(actor && actor.team === "ally" && !actor.hasActed && !actor.defeated && !busy && battle.outcome === "ongoing");
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
        const reason = actionStates.find(state => state.id === sk?.id)?.reason || "WAIT";
        const tier = sk && actor ? combatTier(actor, sk.id) : "base";
        const rankLabel = sk && actor ? skillRankLabel(actor, sk.id) : null;
        return (
          <button
            key={i}
            type="button"
            className={`t-act t-growth-${tier} ${on ? "on" : ""} ${cooling ? "cooling" : ""} ${presentation ? `kind-${presentation.archetype} fx-${presentation.effectClass}` : ""}`}
            disabled={!allyTurn || !sk || !!cooling}
            aria-pressed={!!on}
            aria-label={sk ? `${sk.slot} ${sk.name}. ${reason}. ${sk.desc}` : `Empty slot A${i + 1}`}
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
            <span className="meta">{reason}</span>
            {cooling ? <span className="cd">{sk!.cd}T</span> : null}
          </button>
        );
      })}
      {recoveryMission ? (
        <button
          type="button"
          className={`t-act t-act-obj kind-${RECOVER_PRESENTATION.archetype} fx-${RECOVER_PRESENTATION.effectClass} ${recoverReady ? "on" : "cooling"}`}
          disabled={!allyTurn || !recoverReady}
          aria-label={recoverReady && allyTurn ? "Recover. Complete objective, consumes action." : !recoverSignalOpen(battle) ? "Recover unavailable. Signal jammed." : "Recover unavailable. Move within relay range on your turn."}
          onClick={() => {
            unlockAudio();
            selectRecover();
          }}
        >
          <ActionArt src={tacticalActionImageForCommand("recover")} archetype={RECOVER_PRESENTATION.archetype} />
          <span className="slot">OBJ</span>
          <span className="name">RECOVER</span>
          <span className="meta">{!allyTurn ? "WAIT" : recoverReady ? "READY" : !recoverSignalOpen(battle) ? "JAMMED" : "GET CLOSER"}</span>
        </button>
      ) : null}
    </div>
  );
}

export function BattleScreen() {
  const battle = useBattleStore((s) => s.battle);
  const activeRulesetVersion = useBattleStore(s => s.activeRulesetVersion);
  const units = battle.units;
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
  const floats = useBattleStore((s) => s.floats);
  const consequences = useBattleStore((s) => s.consequences);
  const pendingThreats = useBattleStore((s) => s.threats);
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
  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);
  const onboardingStageId = useBattleStore((s) => s.onboardingStageId);
  const reinforcement = useBattleStore((s) => s.battle.reinforcement);
  const signalCarrierId = useBattleStore((s) => s.battle.signalCarrierId);
  const identity = useBattleStore((s) => s.identity);

  const moves = useMemo(
    () => new Set(moveCellsNow().map((c) => cellKey(c.c, c.r))),
    [units, activeId, mode, busy, actionSkillId],
  );
  const targets = useMemo(() => targetIdsNow(), [units, activeId, mode, actionSkillId]);

  const presentation = deriveBattlePresentation({ battle, activeRulesetVersion, busy, threats: pendingThreats, combatMoment, combatFx, consequences, floats, banner, mission, onboardingStageId: onboardingEnabled && !mission ? onboardingStageId : null });
  const threats = presentation.threats;
  const actor = presentation.actor;
  const activeSkill = actionSkillId ? getSkill(actionSkillId) : null;
  const focusPresentation = activeSkill ? getActionPresentation(activeSkill) : null;
  const impactSkill = lastActionSkillId ? getSkill(lastActionSkillId) : null;
  const impactPresentation = impactSkill ? getActionPresentation(impactSkill) : null;
  const allyTurn = presentation.interactive;
  const impact = units.find((u) => u.id === impactId);
  const impactPos = impact ? fieldPercent(impact.c, impact.r) : null;

  return (
    <div
      className={`t-battle${onboardingEnabled && !mission ? " is-foundation-training" : ""}${BATTLEFIELD_VNEXT_PREVIEW ? " battlefield-vnext-preview" : ""}${focusPresentation ? ` is-focusing focus-${focusPresentation.targetClass} effect-${focusPresentation.effectClass}` : ""}`}
      data-impact-kind={impactPresentation?.effectClass || "damage"}
      data-decision={presentation.mode}
    >
      <header className="t-top t-battle-hud-rail" aria-label="Battle status and mission">
        <StatusStrip />
        <ObjectiveChip />
      </header>
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
          <div className={`t-command-cue${combatMoment ? " t-master-moment-cue" : ""}`} role="status" aria-live="polite" aria-atomic="true">
            <strong>{presentation.title}</strong><span>{presentation.detail}</span>
            {presentation.sources.length ? <small>{presentation.sources.map(source => `${source.label}. ${source.name} · ${source.effect}`).join(" / ")}</small> : null}
            {presentation.mode === "REACT" && presentation.result ? <small>{presentation.result}</small> : null}
          </div>
          <div className="t-grid" aria-hidden="true">
            {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => {
              const c = i % GRID_COLS;
              const r = Math.floor(i / GRID_COLS);
              const pos = fieldPercent(c, r);
              return <i key={`g-${c}-${r}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />;
            })}
          </div>
          {/* Purely visual threat projection. SVG uses the same percentage field coordinates as tokens. */}
          {threats.length > 0 ? <svg className="t-threat-tethers" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {threats.map((threat, index) => {
              const enemy = units.find(u => u.id === threat.enemyId && !u.defeated);
              const tiles = threat.impactTiles;
              if (!enemy || !tiles.length) return null;
              const from = fieldPercent(enemy.c, enemy.r);
              const destination = threat.targetTile ?? (threat.targetUnitId ? units.find(u => u.id === threat.targetUnitId) : null) ??
                { c: tiles.reduce((sum, tile) => sum + tile.c, 0) / tiles.length, r: tiles.reduce((sum, tile) => sum + tile.r, 0) / tiles.length };
              const to = fieldPercent(destination.c, destination.r);
              if (from.x === to.x && from.y === to.y) return null;
              return <g key={threat.id} className="t-threat-tether" data-threat-index={index + 1}>
                <line className="t-threat-tether-halo" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
                <line className="t-threat-tether-core" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
                <circle className="t-threat-tether-end" cx={to.x} cy={to.y} r=".35" />
              </g>;
            })}
          </svg> : null}
          {threats.flatMap((threat, index) => threat.impactTiles.map((cell, i) => {
            const pos = fieldPercent(cell.c, cell.r);
            return <div key={threat.id + ":" + i} className="t-threat-tile t-threat-tile-v2" data-threat-index={index + 1} style={{ left: pos.x + "%", top: pos.y + "%", ...cellTouchStyle(cell.r, GRID_COLS, GRID_ROWS) } as CSSProperties} aria-hidden="true"><i className="t-threat-corner tl" /><i className="t-threat-corner tr" /><i className="t-threat-corner bl" /><i className="t-threat-corner br" /><span>{index + 1}</span></div>;
          }))}
          {presentation.sources.map(source => {
            const unit = units.find(u => u.id === source.id); if (!unit) return null;
            const pos = fieldPercent(unit.c, unit.r);
            return <span key={source.id} className="t-threat-source" style={{left: `${pos.x}%`, top: `${pos.y}%`}} aria-label={`Threat ${source.label}: ${source.name}, ${source.effect}`}>{source.label}</span>;
          })}
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
            if (!presentation.interactive || !moves.has(key)) return null;
            const pos = fieldPercent(c, r);
            return (
              <button
                key={key}
                type="button"
                className="t-cell move"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, ...cellTouchStyle(r, GRID_COLS, GRID_ROWS) } as CSSProperties}
                aria-label={`Move to ${c},${r}`}
                onClick={e => { if (e.detail === 0) selectCell(c, r); }}
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
                targeting={presentation.targeting}
                attacking={u.id === attackingId}
                hitReacting={u.id === impactId && impactKey > 0}
                shownHp={displayHp[u.id]}
                travelGhost={travelActors.has(u.id)}
                inspecting={u.id === inspectId}
                signalCarrier={u.id === signalCarrierId}
                interceptTarget={objective?.type === "INTERCEPT" && u.id === objective.targetId}
                facingTarget={combatFx.find(f => f.actorId === u.id && f.targetId && f.targetId !== u.id) ? units.find(t => t.id === combatFx.find(f => f.actorId === u.id && f.targetId && f.targetId !== u.id)?.targetId) : undefined}
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
          {presentation.primaryFx.map(effect=>{
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
                <img className="t-choreo-actor" src={allowDirectional(performer,identity) ? alphaView(facingToward(effect.from,receiver,"front")) : performer.attackSprite||performer.sprite} alt="" onError={e => {if(allowDirectional(performer,identity)){e.currentTarget.onerror=null;e.currentTarget.src=performer.attackSprite||performer.sprite;}}} />}
            </div>;
          })}
          {presentation.primaryFx.map(effect=>{
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
          {combatMoment && presentation.showFallbackMasterFx && (() => {
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
          {presentation.targeting && presentation.targetIds.length ? <div className="t-target-assist" role="group" aria-label="Large legal target buttons">
            {presentation.targetIds.map(id => { const unit = units.find(u => u.id === id)!; return <button key={id} type="button" onClick={e => { e.stopPropagation(); unlockAudio(); useBattleStore.getState().selectTarget(id); }}>
              <Crosshair aria-hidden="true"/><span>{unit.name}<small>{unit.hp}/{unit.maxHp} HP</small></span>
            </button>; })}
          </div> : null}
          {impactPos && presentation.showFallbackImpact ? (
            <div
              key={impactKey}
              className={`t-impact t-impact-${impactPresentation?.effectClass || "damage"}`}
              style={{ left: `${impactPos.x}%`, top: `${impactPos.y - 4}%` }}
            />
          ) : null}
        </div>
      </div>
      <footer className="t-dock">
        <button
          type="button"
          className="t-icon-btn"
          aria-label={presentation.targeting ? "Cancel targeting" : muted ? "Unmute" : "Mute"}
          onClick={() => {
            if (presentation.targeting) { cancel(); return; }
            const next = !isMuted();
            persistMute(next);
            toggleMute();
            unlockAudio();
            if (!next) sfx("ui");
          }}
        >
          {presentation.targeting ? <span className="t-cancel-label">×<small>CANCEL</small></span> : muted ? <VolumeX className="t-ico" /> : <Volume2 className="t-ico" />}
        </button>
        <SkillHud actionStates={presentation.actions} />
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
