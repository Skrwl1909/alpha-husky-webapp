import { useMemo, type ComponentType } from "react";
import {
  AudioWaveform,
  ChevronsUp,
  Crosshair,
  Droplets,
  HeartPulse,
  Radio,
  SkipForward,
  Swords,
  Users,
  Volume2,
  VolumeX,
  Wind,
  Zap,
} from "lucide-react";
import { useBattleStore, moveCellsNow, targetIdsNow } from "../store/battleStore";
import { fieldPercent, cellKey } from "../combat/movement";
import { availableSkills } from "../combat/skills";
import { effectiveAtk, effectiveDef, effectiveSpd, STATUS_SHORT } from "../combat/effects";
import { FALLBACK_PORTRAIT, OPERATION } from "../data/units";
import { isMuted, setMuted as persistMute, unlockAudio, sfx } from "../audio";
import type { CombatUnit, StatusType } from "../combat/types";

const SKILL_ICON: Record<string, ComponentType<{ className?: string }>> = {
  "alpha-strike": Swords,
  "alpha-rend": Droplets,
  "alpha-howl": AudioWaveform,
  "u02-shot": Crosshair,
  "u02-burst": ChevronsUp,
  "u02-suppress": Wind,
  "u03-tap": Radio,
  "u03-mend": HeartPulse,
  "u03-pack": Users,
};

function plateName(unit: CombatUnit): string {
  if (unit.role === "hostile") return "HOUND";
  if (unit.role === "leader") return "LEADER";
  return unit.name;
}

function isBuff(t: StatusType): boolean {
  return t === "ATK_UP" || t === "DEF_UP" || t === "SPD_UP" || t === "GUARD";
}

function Portrait({ src }: { src: string }) {
  return (
    <img
      src={src}
      alt=""
      onError={(e) => {
        const el = e.currentTarget;
        if (el.dataset.fb === "1") return;
        el.dataset.fb = "1";
        el.src = FALLBACK_PORTRAIT;
      }}
    />
  );
}

function Ring({ selected, guarding }: { selected: boolean; guarding: boolean }) {
  return (
    <svg className="t-ring" viewBox="0 0 100 40" aria-hidden="true">
      <ellipse cx="50" cy="24" rx="46" ry="14" className="t-ring-soft" />
      <ellipse
        cx="50"
        cy="24"
        rx={selected ? 42 : 36}
        ry={selected ? 12.5 : 10.5}
        fill="none"
        stroke="currentColor"
        strokeWidth={selected ? 2.1 : 1.35}
        opacity={selected ? 0.95 : 0.72}
      />
      <ellipse
        cx="50"
        cy="24"
        rx={selected ? 33 : 27}
        ry={selected ? 9.2 : 7.4}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
        strokeDasharray="2.4 3.1"
      />
      {selected ? (
        <ellipse cx="50" cy="24" rx="20" ry="5.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      ) : null}
      {guarding ? (
        <ellipse cx="50" cy="24" rx="47" ry="14.5" fill="none" stroke="currentColor" strokeWidth="1.15" opacity="0.9" />
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
}: {
  unit: CombatUnit;
  selected: boolean;
  validTarget: boolean;
  targeting: boolean;
  attacking: boolean;
  inspecting: boolean;
}) {
  const pos = fieldPercent(unit.c, unit.r);
  const inspectUnit = useBattleStore((s) => s.inspectUnit);
  const selectTarget = useBattleStore((s) => s.selectTarget);
  const className = [
    "t-token",
    unit.team,
    unit.role,
    unit.role === "leader" ? "leader" : "",
    unit.role === "hostile" ? "hound" : "",
    unit.defeated ? "defeated" : "",
    unit.hasActed ? "acted" : "",
    selected ? "selected active" : "",
    inspecting ? "inspect" : "",
    targeting && !validTarget && !selected ? "subdued" : "",
    targeting && validTarget ? "targetable" : "",
    attacking ? "attacking" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const src = attacking && unit.attackSprite ? unit.attackSprite : unit.sprite;
  return (
    <div
      className={className}
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: 4 + unit.r * 4 + (selected ? 2 : 0) }}
    >
      <span className="t-ground" aria-hidden="true" />
      <Ring selected={selected} guarding={unit.statuses.some((s) => s.type === "GUARD") && !unit.defeated} />
      <img className="body" src={src} alt="" draggable={false} />
      {unit.weaponIcon && unit.role === "alpha" ? (
        <img className="t-gear" src={unit.weaponIcon} alt="" draggable={false} />
      ) : null}
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
            <i className={unit.team === "enemy" ? "mark enemy" : "mark ally"} />
            <span>{plateName(unit)}</span>
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
            <Portrait src={u.portrait || u.sprite} />
          </div>
        );
      })}
    </div>
  );
}

function InspectPanel() {
  const inspectId = useBattleStore((s) => s.battle.inspectId);
  const units = useBattleStore((s) => s.battle.units);
  const unit = units.find((u) => u.id === inspectId);
  if (!unit) return null;
  return (
    <aside className="t-inspect" onPointerDown={(e) => e.stopPropagation()}>
      <h4>{unit.name}</h4>
      <dl>
        <div><dt>HP</dt><dd>{unit.hp}/{unit.maxHp}</dd></div>
        <div><dt>ATK</dt><dd>{effectiveAtk(unit)}</dd></div>
        <div><dt>DEF</dt><dd>{effectiveDef(unit)}</dd></div>
        <div><dt>SPD</dt><dd>{effectiveSpd(unit)}</dd></div>
        <div><dt>MOVE</dt><dd>{unit.move}</dd></div>
      </dl>
      {unit.statuses.length ? (
        <div className="t-chips" style={{ marginTop: 8 }}>
          {unit.statuses.map((st) => (
            <span key={st.id} className={`t-chip ${isBuff(st.type) ? "buff" : "debuff"}`} title={`${STATUS_SHORT[st.type]} ${st.duration}T`}>
              {STATUS_SHORT[st.type]} {st.duration}T
            </span>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--t-faint)", fontSize: "0.68rem", margin: "0.4rem 0 0" }}>No active statuses</p>
      )}
    </aside>
  );
}

function SkillHud() {
  const battle = useBattleStore((s) => s.battle);
  const busy = useBattleStore((s) => s.busy);
  const selectSkill = useBattleStore((s) => s.selectSkill);
  const actor = battle.units.find((u) => u.id === battle.activeId);
  const allyTurn = !!(actor && actor.team === "ally" && !actor.hasActed && !actor.defeated && !busy);
  const skills = actor ? availableSkills(battle, actor) : [];
  return (
    <div className="t-actions">
      {([0, 1, 2] as const).map((i) => {
        const sk = skills[i];
        const on = battle.actionSkillId && sk && battle.actionSkillId === sk.id;
        const cooling = sk && !sk.ready;
        const Icon = sk ? SKILL_ICON[sk.id] || Zap : null;
        return (
          <button
            key={i}
            type="button"
            className={`t-act ${on ? "on" : ""} ${cooling ? "cooling" : ""}`}
            disabled={!allyTurn || !sk || !!cooling}
            onClick={() => {
              if (!sk) return;
              unlockAudio();
              selectSkill(sk.id);
            }}
          >
            <span className="row">
              {Icon ? <Icon className="t-act-ico" /> : null}
              <span className="slot">{sk?.slot ?? `A${i + 1}`}</span>
              {sk?.name ?? "—"}
            </span>
            <small>{sk?.desc ?? ""}</small>
            {cooling ? <span className="cd">{sk!.cd}T</span> : null}
          </button>
        );
      })}
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
  const identity = useBattleStore((s) => s.identity);
  const selectCell = useBattleStore((s) => s.selectCell);
  const skipTurn = useBattleStore((s) => s.skipTurn);
  const cancel = useBattleStore((s) => s.cancel);
  const toggleMute = useBattleStore((s) => s.toggleMute);

  const moves = useMemo(
    () => new Set(moveCellsNow().map((c) => cellKey(c.c, c.r))),
    [units, activeId, mode, busy, actionSkillId],
  );
  const targets = useMemo(
    () => targetIdsNow(),
    [units, activeId, mode, actionSkillId],
  );

  const actor = units.find((u) => u.id === activeId);
  const allyTurn = !!(actor && actor.team === "ally" && !actor.hasActed && !actor.defeated && !busy);
  const impact = units.find((u) => u.id === impactId && !u.defeated);
  const impactPos = impact ? fieldPercent(impact.c, impact.r) : null;
  const phaseLabel = actor?.team === "enemy" ? "Enemy act" : "Your act";
  const brandPortrait = identity.portraitUrl || FALLBACK_PORTRAIT;

  return (
    <div className="t-battle">
      <div className="t-hint">Rotate for full tactical view</div>
      <div className="t-rotate-gate" role="dialog" aria-label="Rotate device">
        <div>
          <strong>Rotate device to play Tactical Ops</strong>
          <span>Landscape is required for the battlefield.</span>
        </div>
      </div>
      <header className="t-top">
        <div className="t-brand">
          <Portrait src={brandPortrait} />
          <div>
            <h1 className="t-title">Alpha Husky</h1>
            <p>Tactical Ops V1</p>
            <span className="t-loadout-chip">{identity.summary}</span>
          </div>
        </div>
        <div className="t-turn">
          <strong>TURN {String(round).padStart(2, "0")}</strong>
          <span className="t-turn-sub">{phaseLabel}{actor ? ` · ${actor.name}` : ""}</span>
          <TurnOrderBar />
        </div>
        <div className="t-obj">
          <span className="t-faction">Wasteland Guild</span>
          {OPERATION.name}
          <small>Secure sector</small>
        </div>
      </header>
      {ticker ? <div className="t-ticker">{ticker}</div> : null}
      <div className="t-field-wrap">
        <div
          className="t-field"
          onPointerDown={() => {
            if (!busy) cancel();
          }}
        >
          <img className="t-field-art" src="/images/tactical_ops/battlefield.jpg" alt="" />
          <div className="t-field-grade" />
          <div className="t-vignette" />
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
      <InspectPanel />
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
          Skip <SkipForward className="t-ico" />
        </button>
      </footer>
    </div>
  );
}
