import { contractName, FIELD_HONOR, REACH_REND_TRADEOFF } from "../data/fieldContracts";
import { useEffect, useState, type ReactNode } from "react";
import { Check, Shield, AlertTriangle, ShieldCheck, Zap, Bone, Hammer, ArrowRight } from "lucide-react";
import type { FieldResult } from "../data/fieldOps";
import { fieldResultPurpose } from "./returnPurpose";
import { masteryDef } from "../data/packMastery";
import { veteranReceiptReason } from "../data/progressionOpportunity";
import { recordedImpact } from "./afterActionImpact";
import { UNIT_DEFS } from "../data/units";
import { tacticalActionImageForSkill } from "./tacticalActionIcons";
import { getHost, type ForgeUpgrade } from "../host/bridge";

function NextForgeUpgrade() {
  const forge = getHost().forge;
  const [upgrade, setUpgrade] = useState<ForgeUpgrade | null | "unavailable" | "loading">("loading");
  useEffect(() => {
    if (!forge) return;
    let current = true;
    forge.nextUpgrade().then(
      result => { if (current) setUpgrade(result); },
      () => { if (current) setUpgrade("unavailable"); },
    );
    return () => { current = false; };
  }, [forge]);

  const rows = upgrade && typeof upgrade === "object" ? upgrade.rows : [];
  const materialsKnown = rows.length > 0;
  const materialsReady = materialsKnown && rows.every(row => row.missing <= 0);
  return <section className="t-fr-consequence t-fr-forge" aria-label="Next Forge upgrade"
    data-materials={materialsKnown ? (materialsReady ? "ready" : "needed") : "unknown"}>
    <span className="t-kicker">NEXT FORGE UPGRADE</span>
    {forge && upgrade && typeof upgrade === "object" ? <>
      <div className="t-fr-forge-head">
        <span className="t-fr-forge-symbol" aria-hidden="true"><Hammer /></span>
        <div className="t-fr-forge-identity">
          <strong>{upgrade.name} · ★{upgrade.stars}</strong>
          <span className="t-fr-forge-readiness">{materialsKnown ? (materialsReady ? "MATERIALS READY" : "MATERIALS NEEDED") : "CHECK MATERIALS IN FORGE"}</span>
        </div>
      </div>
      <ul>{upgrade.rows.map(row => <li key={row.label} data-ready={row.missing <= 0 ? "yes" : "no"}>
        <span>{row.label} <b>{row.have.toLocaleString()} / {row.need.toLocaleString()}</b></span>
        {row.missing > 0 ? <small>Missing {row.missing.toLocaleString()} · {row.source}</small> : null}
      </li>)}</ul>
      <button type="button" className="t-btn" onClick={() => forge.openUpgrade(upgrade.key)}>View upgrade in Forge</button>
    </> : <p role="status">{!forge || upgrade === "unavailable" ? "Forge details are unavailable. You can still choose your next operation."
      : upgrade === null ? "No equipped upgrade could be confirmed."
      : "Checking equipped gear and materials…"}</p>}
  </section>;
}

/** Presentation only. Receipt ownership is checked by Results before passing it here. */
export function FieldOpResults({ victory, missionName, plate, receipt, pending, error, failure,
  consequence, nextObjective, reachRendNext, actions, children }: {
  victory: boolean; missionName: string; plate: string; receipt: FieldResult | null;
  pending: boolean; error: string | null; failure: string;
  consequence: { label: string; detail: string } | null;
  nextObjective?: string;
  reachRendNext?: string;
  actions: ReactNode; children: ReactNode;
}) {
  const award = receipt?.victory ? receipt.contractAward : undefined;
  const reachReward = award?.reward === "reach-rend";
  const rewardIcon = reachReward ? tacticalActionImageForSkill("alpha-reach-rend") : null;
  const state = receipt ? "confirmed" : pending ? "pending" : error ? "failed" : "unrecorded";
  const meaning = receipt ? fieldResultPurpose(receipt) : null;
  const tacticalOnly = receipt?.rewardAmountsAvailable !== false && receipt?.xpGranted === 0 && receipt.bonesGranted === 0;
  const amountsAvailable = receipt && (receipt.victory || tacticalOnly) && receipt.rewardAmountsAvailable !== false &&
    Number.isSafeInteger(receipt.xpGranted) && receipt.xpGranted >= 0 &&
    Number.isSafeInteger(receipt.bonesGranted) && receipt.bonesGranted >= 0;
  const payout = receipt?.victory && amountsAvailable && !tacticalOnly ? receipt : null;
  // Read-only presentation priority. No estimated thresholds or local-outcome rewards.
  const masteryMilestone = receipt?.masteryChanges?.find(change => change.veteran?.unlocked || change.stage > change.beforeStage);
  const rankAdvance = receipt && receipt.rankAfter > receipt.rankBefore;
  const milestone = Boolean(award?.reward || receipt?.veteranCareer?.unlocked || rankAdvance || masteryMilestone);
  const careerAdvance = receipt?.veteranCareer && receipt.veteranCareer.after > receipt.veteranCareer.before;
  const masteryGain = receipt?.masteryChanges?.some(change => change.gained > 0);
  const missionImpact = receipt ? recordedImpact(receipt, consequence) : null;
  const impact = award ? null : missionImpact;
  const achievement = receipt?.veteranCareer?.unlocked ? "VETERAN EARNED"
    : rankAdvance ? `RANK ${receipt.rankAfter} EARNED`
    : masteryMilestone ? `${masteryDef(masteryMilestone.unitId)?.name || masteryMilestone.unitId} · ${masteryMilestone.veteran?.unlocked ? "VETERAN" : `STAGE ${masteryMilestone.stage}`}`
    : careerAdvance ? "VETERAN CAREER ADVANCED"
    : masteryGain ? "PACK MASTERY RECORDED"
    : receipt && receipt.progressEarned > 0 ? `+${receipt.progressEarned} COMMANDER ${receipt.progressEarned === 1 ? "POINT" : "POINTS"}`
    : "RUN RECORDED";
  const progressOnly = impact?.kind === "recorded" && (masteryGain || (receipt?.progressEarned ?? 0) > 0);
  const majorUnlock = award?.reward === "field-tested" ? `FIELD HONOR · ${FIELD_HONOR}`
    : receipt?.veteranCareer?.unlocked || rankAdvance || masteryMilestone ? achievement : null;
  const primaryAction = <div className="t-brief-actions t-result-actions">{actions}</div>;
  return <div className={`t-modal t-panel t-results t-field-results ${victory ? "is-victory" : "is-failure"}`} data-reach-reward={reachReward || undefined} data-recording={state} data-milestone={milestone ? "confirmed" : undefined}>
    {reachReward ? <section className="t-fr-reach-reward" aria-label="Confirmed field contract">
      <img className="t-fr-reward-portrait" src={UNIT_DEFS.alpha.portrait} alt="" />
      <div className="t-fr-reward-copy">
        <span className="t-kicker">VICTORY · ALPHA / A2</span>
        {rewardIcon ? <img className="t-fr-reward-icon" src={rewardIcon} alt="" /> : null}
        <h2>Reach Rend</h2>
        <strong>Unlocked</strong>
        <p className="t-fr-reward-stats">{REACH_REND_TRADEOFF}</p>
        <p>{reachRendNext}</p>
        {nextObjective ? <p>{nextObjective}</p> : null}
        {primaryAction}
        <small>{missionName} · {contractName(award.id)} completed · {award.count}/3</small>
      </div>
    </section> : <header className={`t-outcome-hero${victory ? " t-fr-triumph" : ""}`}>
      <img className="t-results-plate" src={plate} alt="" aria-hidden="true" />
      {victory ? <span className="t-fr-triumph-emblem" aria-hidden="true"><ShieldCheck /></span> : null}
      <div className="t-kicker">{missionName}</div>
      <h2 className="t-title">{victory ? "VICTORY" : "DEFEAT"}</h2>
      {!victory ? <p className="t-fr-outcome">{failure}</p> : null}
    </header>}
    <div className="t-fr-record" role="status" aria-live="polite" aria-atomic="true">
      {receipt ? <Check aria-hidden="true" /> : state === "failed" ? <AlertTriangle aria-hidden="true" /> : <Shield aria-hidden="true" />}
      <div><strong>{receipt ? "SERVER RECORDED" : pending ? "RECORDING RESULT…" : error ? "RECORDING FAILED" : "RESULT NOT RECORDED"}</strong>
        <p>{receipt ? "Receipt-confirmed progress below." : pending ? "Waiting for confirmation. Earnings are not confirmed yet." : "Earnings are not confirmed. Retry saving this result."}</p></div>
    </div>
    {state === "failed" ? <p className="t-fr-error" role="alert">{error}</p> : null}
    {receipt ? <section className="t-fr-consequence" aria-label="Character payout">
      <span className="t-kicker">{payout ? "CONFIRMED PAYOUT" : tacticalOnly ? "TACTICAL RESULT" : "CHARACTER PAYOUT"}</span>
      {payout ? <div className="t-fr-payout-grid" aria-label="Receipt-confirmed rewards">
        <div className="t-fr-reward-unit" data-reward="exp">
          <Zap aria-hidden="true" />
          <span><strong>+{payout.xpGranted.toLocaleString()}</strong><small>EXP</small></span>
        </div>
        <div className="t-fr-reward-unit" data-reward="bones">
          <Bone aria-hidden="true" />
          <span><strong>+{payout.bonesGranted.toLocaleString()}</strong><small>Bones</small></span>
        </div>
      </div>
        : <p>{tacticalOnly
          ? "No EXP or Bones awarded for this result." : "Character payout amounts are unavailable."}</p>}
    </section> : null}
    {award && !reachReward ? <section className="t-fr-consequence t-field-contract" aria-label="Confirmed field contract">
      <div className="t-kicker">{contractName(award.id)} completed · {award.count}/3</div>
      <strong className={majorUnlock ? "t-fr-major-unlock" : undefined}>{award.reward === "field-tested" ? `Field Honor earned · ${FIELD_HONOR}` : "One more contract unlocks Reach Rend"}</strong>
    </section> : null}
    {majorUnlock && !award && !impact ? <div className="t-fr-major-unlock">{majorUnlock}</div> : null}
    {receipt && impact ? <section className="t-fr-consequence t-fr-impact" data-impact-kind={impact.kind} data-impact-beat={impact.beat} aria-label="Confirmed gameplay consequence">
      <span className="t-fr-impact-overline">WHAT CHANGED</span>
      <strong className="t-fr-impact-title">{progressOnly ? achievement : impact.title}</strong>
      {receipt.victory && impact.kind === "world" && receipt.regionalApplied &&
        Number.isInteger(receipt.pressureBefore) && Number.isInteger(receipt.pressureAfter) &&
        receipt.pressureBefore >= 0 && receipt.pressureAfter >= 0 &&
        receipt.pressureBefore !== receipt.pressureAfter ?
        <div className="t-fr-pressure-change" data-confirmed-pressure="true"
          aria-label={`Confirmed pressure ${receipt.pressureBefore} to ${receipt.pressureAfter}`}>
          <span>PRESSURE <strong>{receipt.pressureBefore}</strong></span>
          <ArrowRight aria-hidden="true" />
          <span>PRESSURE <strong>{receipt.pressureAfter}</strong></span>
        </div> : null}
      <p>{progressOnly ? "Saved in your mission record." : impact.detail}</p>
    </section> : null}
    {payout && !pending ? <NextForgeUpgrade key={payout.runId} /> : null}
    {receipt && !reachReward ? <div className="t-fr-next"><span className="t-kicker">WHAT’S NEXT</span>{nextObjective ? <p>{nextObjective}</p> : null}</div> : null}
    {!reachReward ? primaryAction : null}
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
  </div>;
}


/**
 * Receipt-truthful, compact aftermath for optional Lockdown / Pack Extraction.
 * The local victory is never confused with server-recorded permanent access.
 * Existing detailed evidence and gameplay actions are passed through unchanged.
 */
export function SpecialFieldOpResults({ victory, missionName, plate, receipt, pending, error, failure,
  kind, nextObjective, actions, children }: {
  victory: boolean; missionName: string; plate: string; receipt: FieldResult | null;
  pending: boolean; error: string | null; failure: string;
  kind: "lockdown" | "extraction"; nextObjective?: string; actions: ReactNode; children: ReactNode;
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
      <div className="t-fr-next"><span className="t-kicker">WHAT’S NEXT</span>{nextObjective ? <p>{nextObjective}</p> : null}</div>
    </> : null}
    <div className="t-brief-actions t-result-actions">{actions}</div>
    <div className="t-fr-details">{children}</div>
  </div>;
}
