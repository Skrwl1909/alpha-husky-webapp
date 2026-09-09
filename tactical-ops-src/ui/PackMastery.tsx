import { useBattleStore } from "../store/battleStore";
import { masteryDef, masteryRecord, type PackMastery, type MasteryChange } from "../data/packMastery";

export function PackMasteryPanel({ snapshot }: { snapshot?: PackMastery }) {
  const progression = useBattleStore((s) => s.progression);
  const pending = useBattleStore((s) => s.progressionCommitPending || s.busy);
  const select = useBattleStore((s) => s.selectMastery);
  const pet = progression?.equippedPet;
  const ids = ["ally-02", "ally-03", ...(pet ? [`pet:${pet.id}`] : [])];
  const runs = [progression?.fieldOps?.activeMissionRun, ...Object.values(progression?.operations || {}).map((op) => op.activeMissionRun)];
  return <details className="t-panel t-brief-block" style={{ marginTop: "0.8rem" }}>
    <summary className="t-kicker">PACK MASTERY / {ids.map((id) => `${masteryDef(id).name} STAGE ${masteryRecord(snapshot || progression?.packMastery, id).stage}`).join(" / ")}</summary>
    <p>Field Ops: each deployed companion earns +2 for its first clear of each mission per rotation, plus +1 for its first challenge success. Repeats give no extra mastery. Stages: 1 / 0, 2 / 3, 3 / 8. Tactical Rank is separate.</p>
    {ids.map((id) => {
      const def = masteryDef(id), m = masteryRecord(snapshot || progression?.packMastery, id);
      const locked = runs.some((run) => run?.squadIds.includes(id));
      return <div key={id} style={{ marginTop: "0.8rem" }}>
        <strong>{id.startsWith("pet:") ? `PET / ${pet?.name}` : def.name} / MASTERY STAGE {m.stage} / {m.progress}/8</strong>
        <p>{m.stage >= 2 ? "ACTIVE" : "STAGE 2"}: {def.trained.name} / {def.trained.copy}</p>
        <div className="t-brief-actions">{(["A", "B"] as const).map((choice) => <button key={choice} type="button" className={`t-btn ${m.selected === choice ? "t-btn-primary" : ""}`} aria-pressed={m.selected === choice} disabled={pending || locked || m.stage < 3} onClick={() => void select(id, choice)}>{def.options[choice].name}{m.stage < 3 ? " / STAGE 3" : m.selected === choice ? " / ACTIVE" : ""}</button>)}</div>
        <details><summary>Mastery options</summary>{(["A", "B"] as const).map((choice) => <p key={choice}><small>{def.options[choice].name}: {def.options[choice].copy}</small></p>)}</details>
        {m.selected ? <p>{def.options[m.selected].copy}</p> : null}
        {locked ? <small>Finish this companion's committed attempt to change its option. The attempt keeps its saved mastery.</small> : null}
      </div>;
    })}
    {!pet ? <p>Equip a valid PET to view its own mastery. Each existing pet identity develops separately.</p> : null}
  </details>;
}

export function MasteryFeedback({ changes, victory }: { changes?: MasteryChange[]; victory: boolean }) {
  if (!changes?.length) return null;
  return <section className="t-mastery-feedback" aria-label="Pack Mastery"><div className="t-kicker">PACK MASTERY</div>{changes.map((change) => {
    const def = masteryDef(change.unitId);
    if (!def) return null;
    return <div className="t-mastery-row" key={change.unitId} data-mastery-unit={change.unitId}>
      <div className="t-mastery-heading"><strong>{def.name}</strong><span>{change.stage === 3 ? "STAGE 3 COMPLETE" : `STAGE ${change.beforeStage !== change.stage ? `${change.beforeStage} → ` : ""}${change.stage}`}</span><b>+{change.gained}</b></div>
      <progress className="t-progress" aria-label={`${def.name} mastery`} value={change.progress} max={8} />
      {change.beforeStage < 2 && change.stage >= 2 ? <details className="t-detail"><summary>UNLOCKED · {def.trained.name}</summary><p>{def.trained.copy}</p></details> : null}
      {change.newOptions.length ? <details className="t-detail"><summary>SPECIALIZATIONS UNLOCKED</summary><p>{def.options.A.name} (active) · {def.options.B.name}</p><p>{def.options.A.copy}</p><p>Choose outside a committed attempt.</p></details> : null}
      {!change.gained && change.progress < 8 ? <small>{victory ? "Award already earned. Try another mission or challenge." : "Clear a Field Op to progress."}</small> : null}
    </div>;
  })}</section>;
}
