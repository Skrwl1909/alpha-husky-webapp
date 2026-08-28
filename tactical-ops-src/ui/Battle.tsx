import { useMemo } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useBattleStore, moveCellsNow, targetIdsNow } from "../store/battleStore";
import { fieldPercent, cellKey } from "../combat/movement";
import { availableSkills } from "../combat/skills";
import { effectiveAtk, effectiveDef, effectiveSpd, STATUS_SHORT } from "../combat/effects";
import { OPERATION } from "../data/units";
import { isMuted, setMuted as persistMute, unlockAudio, sfx } from "../audio";
import type { CombatUnit, StatusType } from "../combat/types";

function isBuff(t: StatusType): boolean {
  return t === "ATK_UP" || t === "DEF_UP" || t === "SPD_UP" || t === "GUARD";
}

function roleClass(unit: CombatUnit): string {
  if (unit.role === "leader") return "leader";
  if (unit.role === "hostile") return "hound";
  if (unit.role === "alpha") return "alpha";
  if (unit.role === "ranged") return "skirmisher";
  if (unit.role === "support") return "support";
  return "";
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
    roleClass(unit),
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
      <Ring selected={selected} guarding={unit.statuses.some((s) => s.type === "GUARD") && !unit.defeated} />
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
  const unit = units.find((u) => u.id === inspectId) || units.find((u) => u.id === activeId);
  if (!unit) {
    return <aside className="t-status t-status-empty" aria-hidden="true" />;
  }
  return (
    <aside className={`t-status ${unit.team}`} onPointerDown={(e) => e.stopPropagation()} aria-label="Selected unit">
      <img src={unit.portrait || unit.sprite} alt="" />
      <div className="t-status-main">
        <div className="t-status-name">{unit.name}</div>
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
          <dd>{effectiveAtk(unit)}</dd>
        </div>
        <div>
          <dt>DEF</dt>
          <dd>{effectiveDef(unit)}</dd>
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
  const selectCell = useBattleStore((s) => s.selectCell);
  const skipTurn = useBattleStore((s) => s.skipTurn);
  const cancel = useBattleStore((s) => s.cancel);
  const toggleMute = useBattleStore((s) => s.toggleMute);

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

  return (
    <div className="t-battle">
      <header className="t-top">
        <div className="t-brand">
          <img src="/images/tactical_ops/alpha-portrait.jpg" alt="" />
          <div>
            <h1 className="t-title">Alpha Husky</h1>
            <p>Tactical Ops</p>
          </div>
        </div>
        <div className="t-turn">
          <strong>TURN {String(round).padStart(2, "0")}</strong>
          <span className="t-turn-sub">
            {phaseLabel}
            {actor ? ` · ${actor.name}` : ""}
          </span>
        </div>
        <div className="t-obj">
          {OPERATION.name}
          <small>Secure sector</small>
        </div>
      </header>
      <div className="t-order-wrap">
        <TurnOrderBar />
      </div>
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
          <div className="t-grid" aria-hidden="true">
            {Array.from({ length: 40 }, (_, i) => {
              const c = i % 8;
              const r = Math.floor(i / 8);
              const pos = fieldPercent(c, r);
              return <i key={`g-${c}-${r}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />;
            })}
          </div>
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
          Skip
        </button>
      </footer>
    </div>
  );
}
