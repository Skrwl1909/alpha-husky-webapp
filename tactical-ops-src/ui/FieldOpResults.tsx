import type { ReactNode } from "react";
import { Check, Shield, AlertTriangle } from "lucide-react";
import type { FieldResult } from "../data/fieldOps";
import { fieldResultPurpose } from "./returnPurpose";
import { masteryDef } from "../data/packMastery";

/** Presentation only. Receipt ownership is checked by Results before passing it here. */
export function FieldOpResults({ victory, missionName, plate, receipt, pending, error, failure,
  consequence, next, actions, children }: {
  victory: boolean; missionName: string; plate: string; receipt: FieldResult | null;
  pending: boolean; error: string | null; failure: string;
  consequence: { label: string; detail: string } | null;
  next: { title: string; reason: string } | null;
  actions: ReactNode; children: ReactNode;
}) {
  const state = receipt ? "confirmed" : pending ? "pending" : error ? "failed" : "unrecorded";
  const meaning = receipt ? fieldResultPurpose(receipt) : null;
  const amountsAvailable = receipt && receipt.rewardAmountsAvailable !== false &&
    Number.isInteger(receipt.xpGranted) && Number.isInteger(receipt.bonesGranted);
  return <div className={`t-modal t-panel t-results t-field-results ${victory ? "is-victory" : "is-failure"}`} data-recording={state}>
    <header className="t-outcome-hero">
      <img className="t-results-plate" src={plate} alt="" aria-hidden="true" />
      <span className="t-outcome-stamp">FIELD OP / AFTER ACTION</span>
      <div className="t-kicker">{missionName}</div>
      <h2 className="t-title">{victory ? "OBJECTIVE SECURED" : "MISSION LOST"}</h2>
      <p className="t-fr-outcome">{victory ? "Your squad completed the objective." : failure} <span>Local battle outcome.</span></p>
    </header>
    <div className="t-fr-record" role="status" aria-live="polite" aria-atomic="true">
      {receipt ? <Check aria-hidden="true" /> : state === "failed" ? <AlertTriangle aria-hidden="true" /> : <Shield aria-hidden="true" />}
      <div><strong>{receipt ? "SERVER RECORDED" : pending ? "RECORDING RESULT…" : error ? "RECORDING FAILED" : "RESULT NOT RECORDED"}</strong>
        <p>{receipt ? "This mission receipt confirms the progress below." : pending ? "Waiting for confirmation. Earnings are not confirmed yet." : "Earnings are not confirmed. Retry saving this result."}</p></div>
    </div>
    {state === "failed" ? <p className="t-fr-error" role="alert">{error}</p> : null}
    {receipt ? <>
      <section className="t-fr-earned" aria-label="Confirmed mission earnings">
        <h3>RECORDED THIS RUN</h3>
        <dl className="t-fr-rewards">
          <div><dt>EXP</dt><dd aria-label={amountsAvailable ? undefined : "EXP amount unavailable"}>{amountsAvailable ? `+${receipt.xpGranted}` : "—"}</dd></div>
          <div><dt>Bones</dt><dd aria-label={amountsAvailable ? undefined : "Bones amount unavailable"}>{amountsAvailable ? `+${receipt.bonesGranted}` : "—"}</dd></div>
          <div><dt>Commander points</dt><dd>+{receipt.progressEarned}</dd></div>
        </dl>
        {!amountsAvailable ? <p>Character reward amounts were not supplied by this receipt.</p> : null}
        <p className="t-fr-eligibility">{meaning?.exhausted}</p>
        <div className="t-fr-rank"><span>COMMANDER</span><strong>RANK {receipt.rankBefore !== receipt.rankAfter ? `${receipt.rankBefore} → ` : ""}{receipt.rankAfter}</strong>
          <small>{receipt.progressBefore} → {receipt.progressAfter} total points · rank shown by this receipt</small></div>
        {receipt.veteranCareer ? <p className="t-fr-delta" data-veteran-career-delta="true"><strong>VETERAN CAREER</strong> {receipt.veteranCareer.before} → {receipt.veteranCareer.after}/12 · {receipt.veteranCareer.unlocked ? "RANK 4 · PACK EXTRACTION UNLOCKED" : receipt.veteranCareer.reason.replaceAll("_", " ").toLowerCase()}</p> : null}
        {receipt.masteryChanges?.map(change => <p className="t-fr-delta" key={change.unitId}><strong>{masteryDef(change.unitId)?.name || change.unitId}</strong> +{change.gained} Mastery · {change.progress}/8 Foundation{change.beforeStage !== change.stage ? ` · Stage ${change.beforeStage} → ${change.stage}` : ""}{change.veteran ? ` · Veteran ${change.veteran.before} → ${change.veteran.after}/12` : ""}</p>)}
      </section>
      <section className="t-fr-consequence" aria-label="Confirmed gameplay consequence">
        <span className="t-kicker">WHAT CHANGED</span>
        <strong>{consequence?.label || "FIELD RECORD UPDATED"}</strong>
        <p>{consequence?.detail || meaning?.changed}</p>
      </section>
    </> : null}
    {receipt && next ? <div className="t-fr-next"><span className="t-kicker">NEXT MOVE</span><strong>{next.title}</strong><p>{next.reason}</p></div> : null}
    <div className="t-brief-actions t-result-actions">{actions}</div>
    <div className="t-fr-details">{children}</div>
  </div>;
}
