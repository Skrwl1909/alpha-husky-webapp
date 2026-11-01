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
  // Read-only presentation priority. No estimated thresholds or local-outcome rewards.
  const masteryMilestone = receipt?.masteryChanges?.find(change => change.veteran?.unlocked || change.stage > change.beforeStage);
  const rankAdvance = receipt && receipt.rankAfter > receipt.rankBefore;
  const milestone = Boolean(receipt?.veteranCareer?.unlocked || rankAdvance || masteryMilestone);
  const careerAdvance = receipt?.veteranCareer && receipt.veteranCareer.after > receipt.veteranCareer.before;
  const masteryGain = receipt?.masteryChanges?.some(change => change.gained > 0);
  const achievement = receipt?.veteranCareer?.unlocked ? "VETERAN EARNED"
    : rankAdvance ? `RANK ${receipt.rankAfter} EARNED`
    : masteryMilestone ? `${masteryDef(masteryMilestone.unitId)?.name || masteryMilestone.unitId} · ${masteryMilestone.veteran?.unlocked ? "VETERAN" : `STAGE ${masteryMilestone.stage}`}`
    : careerAdvance ? "VETERAN CAREER ADVANCED"
    : masteryGain ? "PACK MASTERY RECORDED"
    : receipt && receipt.progressEarned > 0 ? `+${receipt.progressEarned} COMMANDER ${receipt.progressEarned === 1 ? "POINT" : "POINTS"}`
    : "RUN RECORDED";
  return <div className={`t-modal t-panel t-results t-field-results ${victory ? "is-victory" : "is-failure"}`} data-recording={state} data-milestone={milestone ? "confirmed" : undefined}>
    <header className="t-outcome-hero">
      <img className="t-results-plate" src={plate} alt="" aria-hidden="true" />
      <span className="t-outcome-stamp"><span aria-hidden="true">///</span> FIELD OP / AFTER ACTION</span>
      <div className="t-kicker">{missionName}</div>
      <h2 className="t-title">{victory ? "OBJECTIVE SECURED" : "MISSION LOST"}</h2>
      <p className="t-fr-outcome">{victory ? "Objective completed." : failure} <span>Local battle outcome.</span></p>
    </header>
    <div className="t-fr-record" role="status" aria-live="polite" aria-atomic="true">
      {receipt ? <Check aria-hidden="true" /> : state === "failed" ? <AlertTriangle aria-hidden="true" /> : <Shield aria-hidden="true" />}
      <div><strong>{receipt ? "SERVER RECORDED" : pending ? "RECORDING RESULT…" : error ? "RECORDING FAILED" : "RESULT NOT RECORDED"}</strong>
        <p>{receipt ? "Receipt-confirmed progress below." : pending ? "Waiting for confirmation. Earnings are not confirmed yet." : "Earnings are not confirmed. Retry saving this result."}</p></div>
    </div>
    {state === "failed" ? <p className="t-fr-error" role="alert">{error}</p> : null}
    {receipt ? <>
      <section className="t-fr-earned" aria-label="Confirmed mission earnings">
        <div className="t-fr-spotlight">
          <span className="t-fr-insignia" aria-hidden="true">{receipt.rankAfter}</span>
          <div className="t-fr-spotlight-copy">
            <h3>{milestone ? "MILESTONE CONFIRMED" : "RECORDED THIS RUN"}</h3>
            <strong className="t-fr-achievement">{achievement}</strong>
            <div className="t-fr-rank"><span>COMMANDER</span><strong>RANK {receipt.rankBefore !== receipt.rankAfter ? `${receipt.rankBefore} → ` : ""}{receipt.rankAfter}</strong>
              <small>{receipt.progressBefore} → {receipt.progressAfter} total points · rank shown by this receipt</small></div>
          </div>
        </div>
        <dl className="t-fr-rewards">
          <div data-muted={!amountsAvailable || receipt.xpGranted === 0 ? "true" : undefined}><dt>EXP</dt><dd aria-label={amountsAvailable ? undefined : "EXP amount unavailable"}>{amountsAvailable ? `+${receipt.xpGranted}` : "—"}</dd></div>
          <div data-muted={!amountsAvailable || receipt.bonesGranted === 0 ? "true" : undefined}><dt>Bones</dt><dd aria-label={amountsAvailable ? undefined : "Bones amount unavailable"}>{amountsAvailable ? `+${receipt.bonesGranted}` : "—"}</dd></div>
          <div data-muted={receipt.progressEarned === 0 ? "true" : undefined}><dt>Commander points</dt><dd>+{receipt.progressEarned}</dd></div>
        </dl>
        {!amountsAvailable ? <p>Character reward amounts were not supplied by this receipt.</p> : null}
        <p className="t-fr-eligibility">{meaning?.exhausted}</p>
        {receipt.veteranCareer ? <p className="t-fr-delta" data-veteran-career-delta="true"><strong>VETERAN CAREER</strong> {receipt.veteranCareer.before} → {receipt.veteranCareer.after}/12 · {receipt.veteranCareer.unlocked ? "RANK 4 · PACK EXTRACTION UNLOCKED" : receipt.veteranCareer.reason.replaceAll("_", " ").toLowerCase()}</p> : null}
        {receipt.masteryChanges?.map(change => <p className="t-fr-delta" key={change.unitId}><strong>{masteryDef(change.unitId)?.name || change.unitId}</strong> +{change.gained} Mastery · {change.progress}/8 Foundation{change.beforeStage !== change.stage ? ` · Stage ${change.beforeStage} → ${change.stage}` : ""}{change.veteran ? ` · Veteran ${change.veteran.before} → ${change.veteran.after}/12 · ${change.veteran.unlocked ? "OPTION UNLOCKED" : change.veteran.reason.replaceAll("_", " ").toLowerCase()}` : ""}</p>)}
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


/**
 * Receipt-truthful, compact aftermath for optional Lockdown / Pack Extraction.
 * The local victory is never confused with server-recorded permanent access.
 * Existing detailed evidence and gameplay actions are passed through unchanged.
 */
export function SpecialFieldOpResults({ victory, missionName, plate, receipt, pending, error, failure,
  kind, actions, children }: {
  victory: boolean; missionName: string; plate: string; receipt: FieldResult | null;
  pending: boolean; error: string | null; failure: string;
  kind: "lockdown" | "extraction"; actions: ReactNode; children: ReactNode;
}) {
  const state = receipt ? "confirmed" : pending ? "pending" : error ? "failed" : "unrecorded";
  const lockdown = kind === "lockdown";
  const firstRecordedLockdown = lockdown && receipt?.firstLockdownClear === true;
  const plan = receipt?.lockdownPlan === "anchor" ? "ANCHOR" : receipt?.lockdownPlan === "crosslink" ? "CROSSLINK" : null;
  const meaning = receipt ? fieldResultPurpose(receipt) : null;
  return <div className={`t-modal t-panel t-results t-field-results t-special-field-results ${victory ? "is-victory" : "is-failure"}`}
    data-special-result={kind} data-recording={state}
    data-milestone={firstRecordedLockdown ? "confirmed" : undefined}>
    <header className="t-outcome-hero">
      <img className="t-results-plate" src={plate} alt="" aria-hidden="true" />
      <span className="t-outcome-stamp"><span aria-hidden="true">///</span> FIELD OP / AFTER ACTION</span>
      <div className="t-kicker">{missionName}</div>
      <h2 className="t-title">{lockdown ? victory ? "RELAY LOCKDOWN COMPLETE" : "RELAY LOCKDOWN FAILED" :
        victory ? "PACK EXTRACTION COMPLETE" : "PACK EXTRACTION FAILED"}</h2>
      <p className="t-fr-outcome">{victory ? "Local objective completed." : failure} <span>Server confirmation is separate.</span></p>
    </header>
    <div className="t-fr-record" role="status" aria-live="polite" aria-atomic="true">
      {receipt ? <Check aria-hidden="true" /> : state === "failed" ? <AlertTriangle aria-hidden="true" /> : <Shield aria-hidden="true" />}
      <div><strong>{receipt ? "SERVER RECORDED" : pending ? "RECORDING RESULT…" : error ? "RECORDING FAILED" : "RESULT NOT RECORDED"}</strong>
        <p>{receipt ? "Accepted mission receipt confirmed." : pending ? "Waiting for the server receipt; no saved progress confirmed." :
          "The local result has not been saved. Retry recording."}</p></div>
    </div>
    {state === "failed" ? <p className="t-fr-error" role="alert">{error}</p> : null}
    {receipt ? <>
      <section className="t-special-achievement" aria-label="Server-confirmed special operation result">
        <span className="t-kicker">{firstRecordedLockdown ? "PERMANENT FIELD RECORD" : "ACCEPTED OPERATION"}</span>
        <strong>{firstRecordedLockdown ? "LOCKDOWN COMPLETION RECORDED" :
          lockdown ? "LOCKDOWN RUN RECORDED" : "PACK EXTRACTION RUN RECORDED"}</strong>
        <p>{firstRecordedLockdown ? "Relay Mastery 1/1 · completion saved permanently." :
          lockdown ? `Optional practice accepted${plan ? ` · ${plan} plan` : ""}. No new currency or progression rewards.` :
          "Optional Veteran practice accepted. No currency, Commander, Veteran or Pack Mastery progress."}</p>
      </section>
      {meaning?.future ? <section className="t-fr-next" aria-label="Next tactical move">
        <span className="t-kicker">NEXT MOVE</span>
        <strong>{lockdown ? "TRY THE OTHER PLAN" : "RETURN TO FIELD OPS"}</strong>
        <p>{meaning.future}</p>
      </section> : null}
    </> : null}
    <div className="t-brief-actions t-result-actions">{actions}</div>
    <div className="t-fr-details">{children}</div>
  </div>;
}
