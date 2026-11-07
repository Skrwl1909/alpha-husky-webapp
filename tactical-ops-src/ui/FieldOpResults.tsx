import { contractName, FIELD_HONOR, REACH_REND_TRADEOFF } from "../data/fieldContracts";
import type { ReactNode } from "react";
import { Check, Shield, AlertTriangle } from "lucide-react";
import type { FieldResult } from "../data/fieldOps";
import { fieldResultPurpose } from "./returnPurpose";
import { masteryDef } from "../data/packMastery";
import { veteranReceiptReason } from "../data/progressionOpportunity";
import { recordedImpact } from "./afterActionImpact";

/** Presentation only. Receipt ownership is checked by Results before passing it here. */
export function FieldOpResults({ victory, missionName, plate, receipt, pending, error, failure,
  consequence, contractNext, actions, replayAction, children }: {
  victory: boolean; missionName: string; plate: string; receipt: FieldResult | null;
  pending: boolean; error: string | null; failure: string;
  consequence: { label: string; detail: string } | null;
  contractNext?: string;
  actions: ReactNode; replayAction?: ReactNode; children: ReactNode;
}) {
  const award = receipt?.contractAward;
  const state = receipt ? "confirmed" : pending ? "pending" : error ? "failed" : "unrecorded";
  const meaning = receipt ? fieldResultPurpose(receipt) : null;
  const amountsAvailable = receipt && receipt.rewardAmountsAvailable !== false &&
    Number.isInteger(receipt.xpGranted) && Number.isInteger(receipt.bonesGranted);
  // Read-only presentation priority. No estimated thresholds or local-outcome rewards.
  const masteryMilestone = receipt?.masteryChanges?.find(change => change.veteran?.unlocked || change.stage > change.beforeStage);
  const rankAdvance = receipt && receipt.rankAfter > receipt.rankBefore;
  const milestone = Boolean(award?.reward || receipt?.veteranCareer?.unlocked || rankAdvance || masteryMilestone);
  const careerAdvance = receipt?.veteranCareer && receipt.veteranCareer.after > receipt.veteranCareer.before;
  const masteryGain = receipt?.masteryChanges?.some(change => change.gained > 0);
  const missionImpact = receipt ? recordedImpact(receipt, consequence) : null;
  const impact = award && ["recorded", "secured"].includes(missionImpact?.kind || "") ? null : missionImpact;
  const achievement = receipt?.veteranCareer?.unlocked ? "VETERAN EARNED"
    : rankAdvance ? `RANK ${receipt.rankAfter} EARNED`
    : masteryMilestone ? `${masteryDef(masteryMilestone.unitId)?.name || masteryMilestone.unitId} · ${masteryMilestone.veteran?.unlocked ? "VETERAN" : `STAGE ${masteryMilestone.stage}`}`
    : careerAdvance ? "VETERAN CAREER ADVANCED"
    : masteryGain ? "PACK MASTERY RECORDED"
    : receipt && receipt.progressEarned > 0 ? `+${receipt.progressEarned} COMMANDER ${receipt.progressEarned === 1 ? "POINT" : "POINTS"}`
    : "RUN RECORDED";
  const progressOnly = impact?.kind === "recorded" && (masteryGain || (receipt?.progressEarned ?? 0) > 0);
  return <div className={`t-modal t-panel t-results t-field-results ${victory ? "is-victory" : "is-failure"}`} data-recording={state} data-milestone={milestone ? "confirmed" : undefined}>
    <header className="t-outcome-hero">
      <img className="t-results-plate" src={plate} alt="" aria-hidden="true" />
      <div className="t-kicker">{missionName}</div>
      <h2 className="t-title">{victory ? "VICTORY" : "DEFEAT"}</h2>
      {!victory ? <p className="t-fr-outcome">{failure}</p> : null}
    </header>
    <div className="t-fr-record" role="status" aria-live="polite" aria-atomic="true">
      {receipt ? <Check aria-hidden="true" /> : state === "failed" ? <AlertTriangle aria-hidden="true" /> : <Shield aria-hidden="true" />}
      <div><strong>{receipt ? "SERVER RECORDED" : pending ? "RECORDING RESULT…" : error ? "RECORDING FAILED" : "RESULT NOT RECORDED"}</strong>
        <p>{receipt ? "Receipt-confirmed progress below." : pending ? "Waiting for confirmation. Earnings are not confirmed yet." : "Earnings are not confirmed. Retry saving this result."}</p></div>
    </div>
    {state === "failed" ? <p className="t-fr-error" role="alert">{error}</p> : null}
    {award ? <section className="t-fr-consequence t-field-contract" aria-label="Confirmed field contract">
      <div className="t-kicker">{contractName(award.id)} completed · {award.count}/3</div>
      <strong>{award.reward === "reach-rend" ? "Reach Rend unlocked" : award.reward === "field-tested" ? `Field Honor earned · ${FIELD_HONOR}` : "One more contract unlocks Reach Rend"}</strong>
      {award.reward === "reach-rend" ? <p>Equip it in ALPHA’s Loadout. {REACH_REND_TRADEOFF}.</p> : null}
    </section> : null}
    {receipt && impact ? <section className="t-fr-consequence t-fr-impact" data-impact-kind={impact.kind} data-impact-beat={impact.beat} aria-label="Confirmed gameplay consequence">
      <span className="t-fr-impact-overline">WHAT CHANGED</span>
      <strong className="t-fr-impact-title">{progressOnly ? achievement : impact.title}</strong>
      <p>{progressOnly ? "Saved in your mission record." : impact.detail}</p>
    </section> : null}
    {receipt ? <div className="t-fr-next"><span className="t-kicker">WHAT’S NEXT</span>{contractNext ? <p>{contractNext}</p> : null}</div> : null}
    <div className="t-brief-actions t-result-actions">{actions}</div>
    {receipt ? <details className="t-fr-ledger">
      <summary><span>MISSION RECORD</span><small>Commander · Veteran · Mastery · Rewards</small></summary>
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
        {receipt.veteranCareer?.unlocked ? <p className="t-fr-delta" data-veteran-career-delta="true">VETERAN CAREER {receipt.veteranCareer.before} → {receipt.veteranCareer.after}/12 · RANK 4 · PACK EXTRACTION UNLOCKED</p> : null}
        {receipt.veteranCareer && !receipt.veteranCareer.unlocked ? <div className="t-pi-career" aria-label="Veteran Career progress" data-progress-identity="results">
          <div className="t-pi-career-head"><span>VETERAN CAREER · TOWARD RANK 4</span><strong data-veteran-career-delta="true">{receipt.veteranCareer.before !== receipt.veteranCareer.after ? `${receipt.veteranCareer.before} → ` : ''}{receipt.veteranCareer.after}/12</strong></div>
          <div className="t-pi-track" role="progressbar" aria-label="Veteran career credits" aria-valuemin={0} aria-valuemax={12} aria-valuenow={receipt.veteranCareer.after}><span style={{ width: `${Math.min(100, Math.max(0, receipt.veteranCareer.after / 12 * 100))}%` }} /></div>
          <p>{veteranReceiptReason(receipt.veteranCareer.reason)}</p>
          <small>Rank 4 also requires mission and objective diversity. Check the War Table for the next confirmed opportunity.</small>
        </div> : null}
        <dl className="t-fr-rewards">
          <div data-muted={!amountsAvailable || receipt.xpGranted === 0 ? "true" : undefined}><dt>EXP</dt><dd aria-label={amountsAvailable ? undefined : "EXP amount unavailable"}>{amountsAvailable ? `+${receipt.xpGranted}` : "—"}</dd></div>
          <div data-muted={!amountsAvailable || receipt.bonesGranted === 0 ? "true" : undefined}><dt>Bones</dt><dd aria-label={amountsAvailable ? undefined : "Bones amount unavailable"}>{amountsAvailable ? `+${receipt.bonesGranted}` : "—"}</dd></div>
          <div data-muted={receipt.progressEarned === 0 ? "true" : undefined}><dt>Commander points</dt><dd>+{receipt.progressEarned}</dd></div>
        </dl>
        {!amountsAvailable ? <p>Character reward amounts were not supplied by this receipt.</p> : null}
        <p className="t-fr-eligibility">{meaning?.exhausted}</p>
        {receipt.masteryChanges?.map(change => <p className="t-fr-delta" key={change.unitId}><strong>{masteryDef(change.unitId)?.name || change.unitId}</strong> {change.gained > 0 ? `+${change.gained} Mastery earned` : "No new Mastery earned"} · Foundation {change.progress}/8{change.beforeStage !== change.stage ? ` · Stage ${change.beforeStage} → ${change.stage}` : ""}{change.veteran && (change.veteran.unlocked || change.veteran.after > change.veteran.before) ? ` · Veteran ${change.veteran.before} → ${change.veteran.after}/12 · ${change.veteran.unlocked ? "New option unlocked" : veteranReceiptReason(change.veteran.reason)}` : ""}</p>)}
      </section>
    </details> : null}
    <div className="t-fr-details">{children}</div>
    {receipt ? replayAction : null}
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
  const savedLockdownCompletion = lockdown && Boolean(receipt?.firstLockdownClear);
  const newLockdownMilestone = savedLockdownCompletion && receipt?.lockdownFirstClear === true;
  const plan = receipt?.lockdownPlan === "anchor" ? "ANCHOR" : receipt?.lockdownPlan === "crosslink" ? "CROSSLINK" : null;
  return <div className={`t-modal t-panel t-results t-field-results t-special-field-results ${victory ? "is-victory" : "is-failure"}`}
    data-special-result={kind} data-recording={state}
    data-milestone={newLockdownMilestone ? "confirmed" : undefined}>
    <header className="t-outcome-hero">
      <img className="t-results-plate" src={plate} alt="" aria-hidden="true" />
      <div className="t-kicker">{missionName}</div>
      <h2 className="t-title">{victory ? "VICTORY" : "DEFEAT"}</h2>
      {!victory ? <p className="t-fr-outcome">{failure}</p> : null}
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
        <span className="t-kicker">WHAT CHANGED</span>
        <strong>{savedLockdownCompletion ? "LOCKDOWN COMPLETION RECORDED" :
          lockdown ? "LOCKDOWN RUN RECORDED" : "PACK EXTRACTION RUN RECORDED"}</strong>
        <p>{savedLockdownCompletion ? newLockdownMilestone ? "Relay Mastery 1/1 · first completion saved permanently." : "Relay Mastery 1/1 · previously recorded completion preserved. No new progression reward." :
          lockdown ? `Optional practice accepted${plan ? ` · ${plan} plan` : ""}. No new currency or progression rewards.` :
          "Optional Veteran practice accepted. No currency, Commander, Veteran or Pack Mastery progress."}</p>
      </section>
      <div className="t-fr-next"><span className="t-kicker">WHAT’S NEXT</span></div>
    </> : null}
    <div className="t-brief-actions t-result-actions">{actions}</div>
    <div className="t-fr-details">{children}</div>
  </div>;
}
