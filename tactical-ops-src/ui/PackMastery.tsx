import { useBattleStore } from "../store/battleStore";
import { masteryDef, masteryRecord, companionRunLocked, type PackMastery, type MasteryChange } from "../data/packMastery";
import { UNIT_DEFS } from "../data/units";
import { portraitFallback } from "./PlayerIdentity";
import { VETERAN_OPTIONS, veteranRequirement } from "../data/veteran";
import { useState } from "react";
import { savedMasteryProof, alternateMasteryProof } from "./s3PowerProof";

function compactEffect(unlock: NonNullable<ReturnType<typeof masteryDef>>["trained"]) {
  const labels: Record<string, string> = {
    "REACH CONTROL": "PRESSURE +1 RANGE", "WIDE SHELTER": "PACK SUPPORT +1 RANGE",
    "RELAY SCOUT": "RECOVER FROM 2 CELLS", "RELENTLESS": "PRESSURE COOLDOWN -1 TURN",
    "PIN DOWN": "PRESSURE DEBUFFS +1 TURN", "STEADY HAND": "MEND COOLDOWN -1 TURN",
    "SILENT SHELTER": "PACK SUPPORT: NO HEALING / IGNORE DISRUPTION",
    "REACHING SNARE": "HAMSTRING +1 RANGE", "PATHFINDER": "MOVE +1 CELL",
  };
  return labels[unlock.name] || unlock.copy;
}

function masteryReason(change: MasteryChange) {
  if (change.gained === 3) return "FIRST CLEAR + CHALLENGE";
  if (change.progress < 8) return change.gained === 2 ? "FIRST CLEAR" : "CHALLENGE";
  return "FIRST CLEAR / CHALLENGE / CAP REACHED";
}

function companionRole(id: string, petName?: string | null) {
  if (id === "ally-02") return { label: "CNC", sublabel: "RELAY SCOUT" };
  if (id === "ally-03") return { label: "SHADOW", sublabel: "STEALTH OPERATIVE" };
  return { label: "PET", sublabel: petName || "COMPANION" };
}

export function PackMasteryPanel({ snapshot }: { snapshot?: PackMastery }) {
  const progression = useBattleStore((s) => s.progression);
  const pending = useBattleStore((s) => s.progressionCommitPending || s.busy);
  const select = useBattleStore((s) => s.selectMastery);
  const pet = progression?.equippedPet;
  const [selectedId, setSelectedId] = useState("ally-02");
  const ids = ["ally-02", "ally-03", ...(pet ? [`pet:${pet.id}`] : [])];


  return (
    <section className="t-panel t-brief-block t-pack-mastery t-pack-mastery-premium t-pack-mastery-v29" aria-label="Pack Mastery">
      <div className="t-pack-head">
        <div>
          <div className="t-kicker">Your squad</div>
          <h2 className="t-title">PACK MASTERY</h2>
          <p>Take companions into Field Ops to unlock permanent tactical abilities.</p>
        </div>
        <small>First clear +2 · challenge +1</small>
      </div>

      <nav className="t-premium-mastery-roster" aria-label="Select companion mastery">
        {ids.map(id => <button type="button" key={id} className={selectedId === id ? "is-selected" : ""} aria-pressed={selectedId === id} onClick={() => setSelectedId(id)}><img src={id.startsWith("pet:") ? pet?.img || UNIT_DEFS["ally-03"].portrait : UNIT_DEFS[id].portrait} alt="" onError={portraitFallback} /><strong>{companionRole(id,pet?.name).label}</strong></button>)}
      </nav>
      <div className="t-pack-list t-premium-mastery-selected">
        {ids.map((id) => {
          const def = masteryDef(id);
          if (!def || (ids.includes(selectedId) && id !== selectedId) || (!ids.includes(selectedId) && id !== ids[0])) return null;
          const m = masteryRecord(snapshot || progression?.packMastery, id);
          const locked = Boolean(snapshot) || companionRunLocked(progression,id);
          const active = m.stage >= 3 && m.selected ? def.options[m.selected] : null;
          const role = companionRole(id, pet?.name);
          const activeUnlock = active || (m.stage >= 2 ? def.trained : null);
          const nextAt = m.stage < 2 ? 3 : m.stage < 3 ? 8 : null;
          const proof = snapshot ? null : savedMasteryProof(id, { packMastery: progression?.packMastery, kodaSidegrade: progression?.kodaSidegrade, shadowSidegrade: progression?.shadowSidegrade }, pet, progression?.playerGrowth);
          const alternate = snapshot ? [] : alternateMasteryProof(id, { packMastery: progression?.packMastery, kodaSidegrade: progression?.kodaSidegrade, shadowSidegrade: progression?.shadowSidegrade }, pet, progression?.playerGrowth);
          const nextCopy = m.stage < 2
            ? compactEffect(def.trained)
            : m.stage < 3
              ? "Choose a specialization"
              : "Foundation options unlocked";

          return (
            <article key={id} className="t-mastery-row t-mastery-premium-row t-mastery-card-v29" data-mastery-companion={id}>
              <div className="t-mastery-avatar t-premium-avatar" aria-hidden="true"><img src={id.startsWith("pet:") ? pet?.img || UNIT_DEFS["ally-03"].portrait : UNIT_DEFS[id].portrait} alt="" onError={portraitFallback} /></div>
              <div className="t-mastery-main">
                {m.stage >= 2 ? <div className={`t-mastery-combat-badge ${m.stage >= 3 ? "is-signature" : "is-trained"}`}>{m.stage >= 3 ? "SIGNATURE EVOLUTION · 8/8" : "AWAKENED · 3/8"}</div> : null}
                <div className="t-mastery-topline">
                  <div>
                    <strong>{role.label}</strong>
                    <span>{role.sublabel}</span>
                  </div>
                  <div className="t-mastery-status">
                    <span>{m.progress}/8 MASTERY</span>
                    <b>{m.stage >= 3 ? "MASTERED" : `STAGE ${m.stage}`}</b>
                  </div>
                </div>

                <div className="t-mastery-progressline">
                  <progress className="t-progress" aria-label={`${def.name} mastery`} value={m.progress} max={8} />
                </div>

                {m.veteran && m.progress===8 ? <div className="t-growth-delta" data-veteran-mastery={id}>
                  <strong>8/8 FOUNDATION COMPLETE → VETERAN {m.veteran.credits}/12</strong>
                  <progress className="t-progress" value={m.veteran.credits} max={12} aria-label="Veteran Mastery" />
                  <small>{veteranRequirement(m.veteran,id==="ally-03"?"SHADOW":id.startsWith("pet:")?"PET":"CNC")}</small>
                  <small>{m.veteran.lastCycle===progression?.fieldOps?.board?.cycleId ? "This rotation's credit is recorded. Your next eligible rotation can add one." : "Next: win an Advanced eligible objective with this companion and all three allies standing."}</small>
                  <b>{VETERAN_OPTIONS[id==="ally-03"?"SHADOW":id.startsWith("pet:")?"PET":"CNC"].name}</b>
                  <small>{VETERAN_OPTIONS[id==="ally-03"?"SHADOW":id.startsWith("pet:")?"PET":"CNC"].copy}</small>
                  {m.stage===4 ? <button type="button" className="t-btn" disabled={pending||locked} aria-pressed={m.veteran.enabled} onClick={()=>void select(id,m.veteran!.enabled?"VETERAN_OFF":"VETERAN_ON")}>{m.veteran.enabled?"VETERAN OPTION ON · DISABLE":"ENABLE VETERAN OPTION"}</button> : <small>Unlock: 12 eligible rotation credits across both objective families. Participation, not verified skill-use proof.</small>}
                </div> : null}
                <div className="t-mastery-now-next">
                  <div>
                    <span className="t-kicker">Active</span>
                    <strong>{activeUnlock ? activeUnlock.name : "NO MASTERY YET"}</strong>
                    <small>{activeUnlock ? id === "ally-03" && m.selected === "A" && progression?.playerGrowth?.version === 2 && progression.playerGrowth.heroes.find(h => h.heroId === id)?.discipline === "medic" ? "MEND +8 BASE HEAL · COOLDOWN 1" : compactEffect(activeUnlock) : "Earn 3 Mastery to unlock the first ability."}</small>
                  </div>
                  <div>
                    <span className="t-kicker">Next</span>
                    <strong>{nextAt ? `AT ${nextAt} MASTERY` : "FOUNDATION COMPLETE"}</strong>
                    <small>{nextCopy}</small>
                  </div>
                </div>

                {m.stage >= 2 ? <p><small>TRAINED · {def.trained.name}: {def.trained.copy}</small></p> : null}
                {m.stage >= 3 ? <div className="t-growth-delta" aria-label="Saved versus alternate Mastery"><small>{snapshot ? "FROZEN" : "SAVED"} {m.selected} → ALTERNATE {m.selected === "A" ? "B" : "A"}</small>{alternate.length ? alternate.map(row => <b key={row}>{row}</b>) : <small>{snapshot ? "This run uses its frozen A/B. Compare alternatives in the War Table." : "No additional effective change in this composition."}</small>}<small>{id === "ally-02" ? "INTERCEPT: recharge sooner or keep control longer." : id === "ally-03" ? "HOLD: compare MEND timing against healing-free, disruption-safe shelter. MEDIC + STEADY HAND in V2 adds 8 base healing at the cooldown floor." : "RECOVER / INTERCEPT: choose objective mobility or HAMSTRING reach."} Foundation 8/8 is complete. Veteran progress and its optional role capability appear below when supported by the server.</small></div> : null}
                {proof ? <div className="t-growth-delta" aria-label="Saved Pack Mastery power proof"><small>POWER PROOF · {proof.comparison}</small>{proof.changes.map(change => <b key={change}>{change}</b>)}</div> : null}
                <details className="t-detail t-mastery-detail">
                  <summary>{m.stage >= 3 ? "Specialization" : "Ability details"}</summary>
                  <p>{m.stage >= 2 ? "TRAINED" : "AT 3 MASTERY"}: {def.trained.name} / {def.trained.copy}</p>
                  {m.stage >= 3 ? (
                    <>
                      <div className="t-brief-actions">
                        {(["A", "B"] as const).map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            className={`t-btn ${m.selected === choice ? "t-btn-primary" : ""}`}
                            aria-pressed={m.selected === choice}
                            disabled={pending || locked}
                            onClick={() => void select(id, choice)}
                          >
                            {def.options[choice].name}{m.selected === choice ? " / ACTIVE" : ""}
                          </button>
                        ))}
                      </div>
                      {(["A", "B"] as const).map((choice) => <p key={choice}><small>{def.options[choice].name}: {id === "ally-03" && choice === "A" && progression?.playerGrowth?.version === 2 ? "MEND cooldown -1, floor 1. With MEDIC at the floor: +8 base healing instead." : def.options[choice].copy}</small></p>)}
                    </>
                  ) : (
                    <p><small>Specializations unlock at 8 Mastery.</small></p>
                  )}
                </details>
                {locked ? <small className="t-mastery-locked">Finish this companion's current run before changing specialization.</small> : null}
              </div>
            </article>
          );
        })}
      </div>

      {!pet ? <small className="t-pack-pet-note">Equip a PET to add it to Pack Mastery.</small> : null}
    </section>
  );
}

export function MasteryFeedback({ changes, victory }: { changes?: MasteryChange[]; victory: boolean }) {
  if (!changes?.length) return null;
  return <section className="t-mastery-feedback" aria-label="Pack Mastery"><div className="t-kicker">PACK MASTERY</div>{changes.map((change) => {
    const def = masteryDef(change.unitId);
    if (!def) return null;
    return <div className={`t-mastery-row t-mastery-reward ${change.beforeStage !== change.stage ? "is-unlock" : ""}`} key={change.unitId} data-mastery-unit={change.unitId}>
      <div className="t-mastery-heading"><strong>{def.name}</strong><span>{change.stage === 3 ? "STAGE 3 COMPLETE" : `STAGE ${change.beforeStage !== change.stage ? `${change.beforeStage} → ` : ""}${change.stage}`}</span>{change.gained > 0 || change.stage < 3 ? <b>+{change.gained} MASTERY</b> : null}</div>
      {change.gained > 0 ? <small>{masteryReason(change)}</small> : null}
      <progress className="t-progress" aria-label={`${def.name} mastery`} value={change.progress} max={8} />
      {change.beforeStage < 2 && change.stage >= 2 ? <div className="t-mastery-unlock"><strong>AWAKENED · {def.trained.name}</strong><p>{def.trained.copy}</p></div> : null}
      {change.newOptions.length ? <div className="t-mastery-unlock is-signature"><strong>SIGNATURE EVOLUTION · 8/8</strong><p>{def.options.A.name} / {def.options.B.name}</p><p>Specializations unlocked. Choose outside an active run.</p></div> : null}
      {change.veteran ? <p data-veteran-delta={change.unitId}>VETERAN {change.veteran.before} → {change.veteran.after}/12 · {change.veteran.unlocked ? "OPTION UNLOCKED" : change.veteran.reason.replaceAll("_"," ").toLowerCase()}</p> : null}
      {!change.gained && change.progress < 8 ? <small>{victory ? "Award already earned. Try another mission or challenge." : "Clear a Field Op to progress."}</small> : null}
    </div>;
  })}</section>;
}
