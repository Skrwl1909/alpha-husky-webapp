import { useBattleStore } from "../store/battleStore";
import { masteryDef, masteryRecord, type PackMastery, type MasteryChange } from "../data/packMastery";

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
  const ids = ["ally-02", "ally-03", ...(pet ? [`pet:${pet.id}`] : [])];
  const runs = [progression?.fieldOps?.activeMissionRun, ...Object.values(progression?.operations || {}).map((op: any) => op.activeMissionRun)] as Array<{ squadIds: string[] } | undefined>;

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

      <div className="t-pack-list">
        {ids.map((id) => {
          const def = masteryDef(id);
          if (!def) return null;
          const m = masteryRecord(snapshot || progression?.packMastery, id);
          const locked = runs.some((run) => run?.squadIds.includes(id));
          const active = m.stage >= 3 && m.selected ? def.options[m.selected] : null;
          const role = companionRole(id, pet?.name);
          const activeUnlock = active || (m.stage >= 2 ? def.trained : null);
          const nextAt = m.stage < 2 ? 3 : m.stage < 3 ? 8 : null;
          const nextCopy = m.stage < 2
            ? compactEffect(def.trained)
            : m.stage < 3
              ? "Choose a specialization"
              : "All mastery options unlocked";

          return (
            <article key={id} className="t-mastery-row t-mastery-premium-row t-mastery-card-v29" data-mastery-companion={id}>
              <div className="t-mastery-avatar" aria-hidden="true">{role.label}</div>
              <div className="t-mastery-main">
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

                <div className="t-mastery-now-next">
                  <div>
                    <span className="t-kicker">Active</span>
                    <strong>{activeUnlock ? activeUnlock.name : "NO MASTERY YET"}</strong>
                    <small>{activeUnlock ? compactEffect(activeUnlock) : "Earn 3 Mastery to unlock the first ability."}</small>
                  </div>
                  <div>
                    <span className="t-kicker">Next</span>
                    <strong>{nextAt ? `AT ${nextAt} MASTERY` : "COMPLETE"}</strong>
                    <small>{nextCopy}</small>
                  </div>
                </div>

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
                      {(["A", "B"] as const).map((choice) => <p key={choice}><small>{def.options[choice].name}: {def.options[choice].copy}</small></p>)}
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
    return <div className="t-mastery-row" key={change.unitId} data-mastery-unit={change.unitId}>
      <div className="t-mastery-heading"><strong>{def.name}</strong><span>{change.stage === 3 ? "STAGE 3 COMPLETE" : `STAGE ${change.beforeStage !== change.stage ? `${change.beforeStage} → ` : ""}${change.stage}`}</span>{change.gained > 0 || change.stage < 3 ? <b>+{change.gained} MASTERY</b> : null}</div>
      {change.gained > 0 ? <small>{masteryReason(change)}</small> : null}
      <progress className="t-progress" aria-label={`${def.name} mastery`} value={change.progress} max={8} />
      {change.beforeStage < 2 && change.stage >= 2 ? <details className="t-detail"><summary>UNLOCKED · {def.trained.name}</summary><p>{def.trained.copy}</p></details> : null}
      {change.newOptions.length ? <details className="t-detail"><summary>SPECIALIZATIONS UNLOCKED</summary><p>{def.options.A.name} (active) · {def.options.B.name}</p><p>{def.options.A.copy}</p><p>Choose outside a committed attempt.</p></details> : null}
      {!change.gained && change.progress < 8 ? <small>{victory ? "Award already earned. Try another mission or challenge." : "Clear a Field Op to progress."}</small> : null}
    </div>;
  })}</section>;
}
