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
  return <div><strong>PACK MASTERY PROGRESSED</strong>{changes.map((change) => {
    const def = masteryDef(change.unitId);
    if (!def) return null;
    return <p key={change.unitId}>{change.kind} / +{change.gained} mastery / {change.progress}/8 / Stage {change.beforeStage} to {change.stage}.
      {change.beforeStage < 2 && change.stage >= 2 ? ` UNLOCKED: ${def.trained.name}. ${def.trained.copy}` : ""}
      {change.newOptions.length ? ` OPTIONS UNLOCKED: ${def.options.A.name} (active) / ${def.options.B.name}. ${def.options.A.copy} Choose outside a committed attempt.` : ""}
      {!change.gained ? change.progress >= 8 ? " V1 path complete; both options remain available." : victory ? " No new award for this mission/rotation; try another Field Op or its challenge." : " Complete a Field Op to develop this companion." : ""}
    </p>;
  })}</div>;
}
