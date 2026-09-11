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

// The result contract reports capped gains, not per-companion award flags.
// At the cap, name the sources without guessing which supplied the final point.
function masteryReason(change: MasteryChange) {
  if (change.gained === 3) return "FIRST CLEAR + CHALLENGE";
  if (change.progress < 8) return change.gained === 2 ? "FIRST CLEAR" : "CHALLENGE";
  return "FIRST CLEAR / CHALLENGE / CAP REACHED";
}

export function PackMasteryPanel({ snapshot }: { snapshot?: PackMastery }) {
  const progression = useBattleStore((s) => s.progression);
  const pending = useBattleStore((s) => s.progressionCommitPending || s.busy);
  const select = useBattleStore((s) => s.selectMastery);
  const pet = progression?.equippedPet;
  const ids = ["ally-02", "ally-03", ...(pet ? [`pet:${pet.id}`] : [])];
  const runs = [progression?.fieldOps?.activeMissionRun, ...Object.values(progression?.operations || {}).map((op) => op.activeMissionRun)];
  return <section className="t-panel t-brief-block t-pack-mastery" aria-label="Pack Mastery">
    <h3 className="t-kicker">PACK MASTERY</h3>
    <div className="t-mastery-intro">Deploy companions in Field Ops to develop tactical abilities.<br /><small>First clears and challenges earn Mastery.</small></div>
    {ids.map((id) => {
      const def = masteryDef(id), m = masteryRecord(snapshot || progression?.packMastery, id);
      const locked = runs.some((run) => run?.squadIds.includes(id));
      const active = m.stage >= 3 && m.selected ? def.options[m.selected] : null;
      return <div key={id} className="t-mastery-row" data-mastery-companion={id}>
        <div className="t-mastery-heading"><strong>{id.startsWith("pet:") ? `PET / ${pet?.name}` : def.name}</strong><span>STAGE {m.stage} / {m.stage >= 3 ? "COMPLETE" : `${m.progress}/8`}</span></div>
        {m.stage < 3 ? <progress className="t-progress" aria-label={`${def.name} mastery`} value={m.progress} max={8} /> : null}
        {m.stage < 3 ? <div className="t-mastery-next">NEXT: STAGE {m.stage + 1} AT {m.stage === 1 ? 3 : 8}<br /><strong>{m.stage === 1 ? compactEffect(def.trained) : "CHOOSE A SPECIALIZATION"}</strong></div> : null}
        <div className="t-mastery-next">{active ? <>ACTIVE: {active.name}<br /><strong>{compactEffect(active)}</strong></> : m.stage >= 2 ? <>ACTIVE: {def.trained.name}<br /><strong>{compactEffect(def.trained)}</strong></> : "ACTIVE: NONE / UNLOCK AT STAGE 2"}</div>
        <details className="t-detail"><summary>{m.stage >= 3 ? "Change specialization / details" : "Abilities / details"}</summary>
          <p>{m.stage >= 2 ? "TRAINED" : "STAGE 2"}: {def.trained.name} / {def.trained.copy}</p>
          <div className="t-brief-actions">{(["A", "B"] as const).map((choice) => <button key={choice} type="button" className={`t-btn ${m.selected === choice ? "t-btn-primary" : ""}`} aria-pressed={m.selected === choice} disabled={pending || locked || m.stage < 3} onClick={() => void select(id, choice)}>{def.options[choice].name}{m.stage < 3 ? " / STAGE 3" : m.selected === choice ? " / ACTIVE" : ""}</button>)}</div>
          {(["A", "B"] as const).map((choice) => <p key={choice}><small>{def.options[choice].name}: {def.options[choice].copy}</small></p>)}
        </details>
        {locked ? <small>Finish this companion's committed attempt to change its option. The attempt keeps its saved mastery.</small> : null}
      </div>;
    })}
    <details className="t-detail"><summary>How Mastery is earned</summary><p>Per deployed companion, per mission, per rotation: first clear +2; first challenge success +1. Repeats give no extra Mastery. Stage 2 at 3; Stage 3 at 8. Tactical Rank is separate.</p></details>
    {!pet ? <small>Equip a PET to develop its own Mastery.</small> : null}
  </section>;
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
