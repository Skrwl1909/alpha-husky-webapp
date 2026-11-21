import { TacticalLootReveal } from "./TacticalLootHonors";
import { parseLootHonors } from "../data/lootHonors";
type StoryResultViewProps = {
  title: string;
  mission: string;
  art: string;
  phase: "unsaved" | "saving" | "failed" | "saved";
  op02Ready: boolean;
  op02Cleared: boolean;
  nextMission: string | null;
  turns: number;
  squadStanding: number;
  squadDeployed: number;
  onAction: () => void;
  lootAndHonors?: unknown;
  runId?: string | null;
  missionId?: string | null;
};

export function StoryResultView({
  title, mission, art, phase, op02Ready, op02Cleared, nextMission,
  turns, squadStanding, squadDeployed, onAction, lootAndHonors, runId, missionId,
}: StoryResultViewProps) {
  const confirmed = phase === "saved";
  const rewards = parseLootHonors(lootAndHonors,runId??null,missionId??null,confirmed);
  const status = confirmed ? "VICTORY SAVED" : phase === "saving" ? "SAVING…" :
    phase === "failed" ? "SAVE FAILED" : "READY TO SAVE";
  return <main className="t-fill t-story-result-root" aria-label="Operation result" data-story-save={phase}>
    <div className="t-story-result-shade" aria-hidden="true" />
    <section className="t-story-result-card" aria-label={mission}>
      <header className="t-story-result-hero">
        <img src={art} alt="" aria-hidden="true" />
        <div className="t-story-result-hero-copy">
          <span className="t-story-result-eyebrow">OPERATION 01 / {mission}</span>
          <h1>{title}</h1>
          <span className="t-story-result-line" aria-hidden="true" />
        </div>
      </header>
      <div className="t-story-result-body">
        <div className={`t-story-result-status is-${phase}`} role="status" aria-live="polite">
          <span className="t-story-result-status-mark" aria-hidden="true">{confirmed ? "✓" : "◆"}</span>
          <span>{status}</span>
        </div>
        <TacticalLootReveal result={rewards} />
        {op02Ready ? <p className="t-story-result-unlock">{op02Cleared ? "OP 02 CLEARED" : "OP 02 READY"}</p> : null}
        {confirmed && nextMission ? <div className="t-story-result-next"><small>UP NEXT</small><strong>{nextMission}</strong></div> : null}
        <button type="button" className="t-story-result-action" disabled={phase === "saving"} onClick={onAction}>
          {phase === "saving" ? "SAVING…" : confirmed ? "NEXT MISSION" : phase === "failed" ? "RETRY SAVE" : "SAVE VICTORY"}
          <span aria-hidden="true">{confirmed ? "→" : "›"}</span>
        </button>
        <details className="t-story-result-details">
          <summary>BATTLE DETAILS</summary>
          <div><span>Turns</span><strong>{turns}</strong></div>
          <div><span>Squad standing</span><strong>{squadStanding}/{squadDeployed}</strong></div>
        </details>
      </div>
    </section>
  </main>;
}
