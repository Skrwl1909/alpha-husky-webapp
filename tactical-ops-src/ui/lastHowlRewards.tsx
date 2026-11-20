import React from "react";

const tiers = [3, 5, 7, 10];
const caps = { bones: 96, scrap: 25, rune_dust: 2 };
type Amounts = typeof caps;
type Status = "CLAIMED" | "WEEKLY_LIMIT" | "NO_IMPROVEMENT" | "NO_REWARD" | "PENDING" | "UNAVAILABLE";
export type LastHowlRewardsReceipt = {
  version: 1; runId: string; week: string | null; status: Status;
  amounts: Amounts; weeklyEarned: Amounts; weeklyLimit: Amounts;
  milestones: number[]; claimedMilestones: number[];
  nextMilestone: number | null; nextBestWave: number | null;
};

export function parseLastHowlRewards(value: unknown, runId: string, waves: number): LastHowlRewardsReceipt | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const r = value as LastHowlRewardsReceipt;
  const statuses: Status[] = ["CLAIMED", "WEEKLY_LIMIT", "NO_IMPROVEMENT", "NO_REWARD", "PENDING", "UNAVAILABLE"];
  const amountObject = (v: Amounts) => v && typeof v === "object" && !Array.isArray(v)
    && Object.keys(v).length === 3 && Object.entries(caps).every(([a, cap]) => Number.isSafeInteger(v[a as keyof Amounts])
      && v[a as keyof Amounts] >= 0 && v[a as keyof Amounts] <= cap);
  const tierList = (v: number[]) => Array.isArray(v) && v.every((w, i) => tiers.includes(w) && (i === 0 || w > v[i - 1]));
  if (r.version !== 1 || r.runId !== runId || !statuses.includes(r.status)
    || (r.week === null ? r.status !== "UNAVAILABLE" : typeof r.week !== "string" || !/^\d{4}-W\d{2}$/.test(r.week))
    || !amountObject(r.amounts) || !amountObject(r.weeklyEarned) || !amountObject(r.weeklyLimit)
    || !Object.entries(caps).every(([a, cap]) => r.weeklyLimit[a as keyof Amounts] === cap
      && r.amounts[a as keyof Amounts] <= r.weeklyEarned[a as keyof Amounts])
    || !tierList(r.milestones) || !tierList(r.claimedMilestones)
    || r.milestones.some(w => w > waves || !r.claimedMilestones.includes(w))
    || r.nextMilestone !== (tiers.find(w => !r.claimedMilestones.includes(w)) ?? null)
    || (r.nextBestWave !== null && (!Number.isSafeInteger(r.nextBestWave) || r.nextBestWave < 3 || r.nextBestWave > 10))) return null;
  const paid = Object.values(r.amounts).some(n => n > 0);
  if ((r.status === "CLAIMED") !== paid || (r.amounts.rune_dust > 0 && !r.milestones.includes(10))
    || (r.status === "WEEKLY_LIMIT" && !Object.entries(caps).every(([a, cap]) => r.weeklyEarned[a as keyof Amounts] === cap))) return null;
  return r;
}

export function LastHowlRewards({ value, runId, waves, abandoned = false }: { value: unknown; runId: string; waves: number; abandoned?: boolean }) {
  if (abandoned) return <p className="t-last-howl-rewards" role="status">ABANDONED · NO REWARDS</p>;
  const receipt = parseLastHowlRewards(value, runId, waves);
  if (!receipt || receipt.status === "UNAVAILABLE") return <p className="t-last-howl-rewards" role="status">NO REWARDS RECORDED · Start a new run for weekly supply.</p>;
  if (receipt.status === "PENDING") return <p className="t-last-howl-rewards" role="status">REWARD PENDING · Reconnect to confirm.</p>;
  const limit = Object.entries(caps).every(([a, cap]) => receipt.weeklyEarned[a as keyof Amounts] === cap);
  const next = receipt.nextMilestone ?? receipt.nextBestWave;
  return <div className="t-last-howl-rewards" aria-label="Server-confirmed Last Howl rewards" data-reward-status={receipt.status}>
    <strong>{receipt.status === "CLAIMED" ? "SUPPLY CLAIMED" : limit ? "WEEKLY LIMIT" : receipt.status === "NO_IMPROVEMENT" ? "TOP 3 UNCHANGED" : "REACH WAVE 3 FOR SUPPLIES"}</strong>
    {receipt.status === "CLAIMED" ? <p className="t-last-howl-reward-amounts">
      {receipt.amounts.bones > 0 ? <span>+{receipt.amounts.bones} Bones</span> : null}
      {receipt.amounts.scrap > 0 ? <span>+{receipt.amounts.scrap} Scrap</span> : null}
      {receipt.amounts.rune_dust > 0 ? <span>+{receipt.amounts.rune_dust} Rune Dust</span> : null}
    </p> : null}
    {receipt.milestones.length ? <p>MILESTONES {receipt.milestones.join(" · ")} · CLAIMED</p> : null}
    <small>WEEK {receipt.week} · Best 3 runs pay; better runs replace weaker ones.</small>
    <small>WEEKLY {receipt.weeklyEarned.bones}/{caps.bones} Bones · {receipt.weeklyEarned.scrap}/{caps.scrap} Scrap · {receipt.weeklyEarned.rune_dust}/{caps.rune_dust} Dust</small>
    <small>{limit ? "WEEKLY LIMIT REACHED" : next ? `NEXT ${receipt.nextMilestone ? "MILESTONE" : "BEST RUN"} · WAVE ${next}` : "ALL MILESTONES CLAIMED"}</small>
  </div>;
}
