import { chapterNextMission } from '../data/campaignChapter';
import { BROKEN_SIGNAL, DEAD_RELAY, getMissionDef, missionForContext } from '../data/operations';
import type { FoundationProgressionState } from '../host/foundationProgression';
import type { FieldResult } from '../data/fieldOps';
import { nextFieldMission } from './missionPurpose';

export type PurposeAction = { missionId: string; title: string; reason: string; tier: 'standard' | 'advanced'; resume: boolean; chapter?: boolean; masteryChallenge?: 'relay-lockdown-v1' };
/** A single read-only decision hierarchy. Never changes eligibility or the accepted run. */
export function commandPurpose(p: FoundationProgressionState | null | undefined): { primary: PurposeAction | null; alternatives: PurposeAction[] } {
  if (!p?.completed) return { primary: null, alternatives: [] };
  const f = p.fieldOps, b = f?.board;
  const action = (missionId: string, title: string, reason: string, tier: 'standard' | 'advanced' = 'standard', resume = false): PurposeAction => ({ missionId, title, reason, tier, resume });
  const saved = p.chapterActiveMission || f?.activeMissionRun || Object.values(p.operations || {}).find(op => op.activeMissionRun)?.activeMissionRun;
  let primary = saved && getMissionDef(saved.missionId) ? action(saved.missionId, 'FINISH YOUR ACCEPTED MISSION', 'Your accepted squad and conditions are preserved. The battle restarts at round 1.', saved.fieldContext?.directiveTier || 'standard', true) : null;
  if (primary && saved?.fieldContext?.masteryChallenge) primary.masteryChallenge = saved.fieldContext.masteryChallenge;
  if (p.tacticalChapter?.status === 'ACTIVE' && p.tacticalChapter.doctrine === 'RECON' && (!saved || saved === p.chapterActiveMission)) {
    const id = chapterNextMission(p.tacticalChapter);
    if (id) primary = { ...action(id, saved ? 'FINISH YOUR ACCEPTED CHAPTER RUN' : 'CONTINUE GHOST SIGNAL', 'Complete the next chapter objective. Chapter progress and Intel advance only on an accepted server result.', saved?.fieldContext?.directiveTier || 'standard', Boolean(saved)), chapter: true };
  }
  if (!primary) for (const op of [BROKEN_SIGNAL, DEAD_RELAY]) {
    const id = op.orderedMissionIds.find(id => p.operations?.[op.operationId]?.missions[id] === 'available');
    if (id) { primary = action(id, 'CONTINUE THE STORY', id === 'dead-relay-courier' ? 'Defeat the courier to open Hold. An early first win can record Courier Trace for delayed Hold reinforcements.' : id.endsWith('hold') ? 'Control the relay to unlock the Guardian.' : id.endsWith('guardian') ? 'Defeat the Guardian to record The Dead Relay campaign completion.' : id.endsWith('commander') ? 'Defeat the commander to complete Broken Signal.' : 'Complete this story objective to unlock the next campaign mission.'); break; }
  }
  const candidates: PurposeAction[] = [];
  if (!primary && f?.masteryPath && (f.commander?.rank || 0) >= 3 && b?.reportVersion === 3) {
    if (f.masteryPath.unlockedChallenge) {
      const recorded = Boolean(f.masteryPath.firstLockdownClear);
      const canRecord = f.masteryPath.firstLockdownClear !== undefined;
      const lockdown = { ...action('field-relay-hold', recorded ? 'RELAY LOCKDOWN · COMPLETED' : 'RELAY MASTERY · 1/1', f.lockdownPlansAvailable ? 'Choose Anchor to defend one tile with slower support, or Crosslink to rotate north, east, then south with normal support. Optional practice; no currency or progression rewards.' : recorded
        ? 'Your first recorded Relay Lockdown clear is saved permanently. Try another holder or squad for optional practice; no further unlock or reward is promised.'
        : canRecord ? 'Relay Mastery recorded. Win Relay Lockdown to save its first completion: hold the exact relay tile while nearby enemies contest it, with a deadline and slower support. No currency or progression rewards.'
        : 'Relay Mastery recorded. Relay Lockdown is available for optional practice: hold the exact relay tile while nearby enemies contest it, with a deadline and slower support. No currency or progression rewards.', 'advanced'), masteryChallenge: f.masteryPath.unlockedChallenge };
      // An already recorded, reward-free challenge must not displace eligible rotation progress.
      // Preserve the finished challenge as a legal optional route when no accepted run exists.
      if (recorded) candidates.push(lockdown);
      else primary = lockdown;
    } else {
      const id = b.activeMissionIds.find(id => ['field-relay-hold','field-isolated-hold'].includes(id));
      if (id) primary = action(id, 'RELAY MASTERY · 0/1', 'Win this Advanced HOLD to record Relay Mastery and permanently unlock Relay Lockdown. Standard clears and aggregate Advanced totals do not qualify. The next challenge pins the holder to the relay tile under a deadline and slower support.', 'advanced');
    }
  }
  if (b && f?.records && f.commander) {
    for (const id of b.activeMissionIds) {
      const base = getMissionDef(id); if (!base) continue;
      const m = missionForContext(base, { reportVersion: b.reportVersion || 2 });
      const r = f.records[id];
      if (r?.lastClearCycle !== b.cycleId) candidates.push(action(id, 'SECURE A FIELD OP', 'First clear is open this rotation. A confirmed victory records this operation; regional effects depend on the server receipt.'));
      if (m.challenge && r?.lastChallengeCycle !== b.cycleId) candidates.push(action(id, 'OPTIONAL CHALLENGE', `${m.challenge.label}. ${r?.lastClearCycle === b.cycleId ? "Clear bonus already secured; an eligible challenge can still add progress." : "An eligible first clear and challenge can record progress this rotation."}`));
      if (f.commander.unlockedDirectiveTiers?.includes('advanced') && r?.lastAdvancedCycle !== b.cycleId) candidates.push(action(id, 'ADVANCED CHALLENGE', 'Face the Advanced conditions shown in the briefing. An accepted clear enters your Advanced record; no extra currency is promised.', 'advanced'));
    }
    // Prefer unfinished clears, then optional challenges, then Advanced; finished optional practice is last.
    // No accepted run is replaced: saved missions were resolved above.
    const priority = (a: PurposeAction) => a.title === 'SECURE A FIELD OP' ? 0 : a.title === 'OPTIONAL CHALLENGE' ? 1 : a.title === 'ADVANCED CHALLENGE' ? 2 : 3;
    candidates.sort((a, b) => priority(a) - priority(b));
    primary ||= candidates.shift() || (() => { const n = nextFieldMission(f); return n.missionId ? action(n.missionId, 'PRACTICE WITH YOUR SQUAD', `Current clear and challenge goals are recorded${f.commander?.unlockedDirectiveTiers?.includes('advanced') ? ', including Advanced' : ''}. Try another squad or route for practice; no new rotation bonus or rank is promised.`) : null; })();
  }
  const used = new Set(primary ? [primary.missionId] : []);
  const alternatives: PurposeAction[] = [];
  if (!saved) for (const title of ['OPTIONAL CHALLENGE', 'ADVANCED CHALLENGE']) {
    const candidate = candidates.find(a => a.title === title && !used.has(a.missionId));
    if (candidate) { alternatives.push(candidate); used.add(candidate.missionId); }
  }
  if (!saved) for (const candidate of candidates) {
    if (alternatives.length >= 2) break;
    if (!used.has(candidate.missionId)) { alternatives.push(candidate); used.add(candidate.missionId); }
  }
  // Preserve access to finished Relay Lockdown as a clearly optional third route.
  // It must never hide the next eligible clear/challenge or an accepted mission.
  if (!saved && alternatives.length < 3) {
    const practice = candidates.find(a => a.title === 'RELAY LOCKDOWN · COMPLETED' && !used.has(a.missionId));
    if (practice) alternatives.push(practice);
  }
  return { primary, alternatives };
}

/** Only canonical receipt fields justify an earned or changed claim. */
export function fieldResultPurpose(r: FieldResult): { earned: string; exhausted: string; changed: string; future: string } {
  if (r.veteranChallenge) return {earned:'Optional Veteran practice recorded. No currency or progression.',exhausted:'No eligible progress from practice.',changed:'No regional change.',future:'Return to an eligible Advanced Field Op.'};
  if (r.lockdownPlan) return {
    earned: `Server accepted ${r.lockdownPlan === 'anchor' ? 'Anchor' : 'Crosslink'} · ${r.victory ? 'objective completed' : 'attempt failed'}. No currency, Commander or Pack Mastery progress.`,
    exhausted: 'Optional practice; permanent Relay Mastery access preserved.',
    changed: 'Accepted plan recorded; no regional change.',
    future: r.lockdownPlan === 'anchor' ? 'Try Crosslink: rotate between three relay checkpoints with normal support recharge.' : 'Try Anchor: hold one tile with slower support recharge.' };
  if (r.masteryChallenge) return {
    earned: 'Optional challenge result recorded. No currency, Commander or Pack Mastery progress.',
    exhausted: r.victory ? r.lockdownFirstClear ? 'First recorded Relay Lockdown clear saved permanently.' : 'This Relay Lockdown attempt completed. Relay Mastery remains 1/1.' : 'Relay Lockdown failed. Your permanent unlock is preserved.',
    changed: r.firstLockdownClear ? 'Lockdown completion is permanently recorded. No regional change or additional unlock.' : 'No permanent Lockdown completion confirmed by this receipt. No regional change.',
    future: r.victory ? 'Try a different holder or squad in Relay Lockdown; no additional progression reward.' : 'Keep an ally on the exact relay tile and clear adjacent contesters before round 7.' };
  const earned = r.rewardAmountsAvailable === false ? `Character reward amounts unavailable · ${r.progressEarned} Commander points recorded` : `${r.xpGranted} EXP · ${r.bonesGranted} Bones · ${r.progressEarned} Commander points recorded`;
  const exhausted = !r.victory ? 'No clear recorded. No victory bonus earned.'
    : r.firstCycleSecure === false ? `Clear bonus already secured this rotation. ${r.challengeBonus > 0 ? `Challenge bonus earned: +${r.challengeBonus}.` : r.challengeSuccess ? 'Challenge met; no new challenge bonus granted.' : 'Challenge not met.'}`
    : r.firstCycleSecure === true ? 'First clear recorded this rotation.' : 'Clear bonus eligibility not supplied; only the amounts above are confirmed.';
  const changed = r.regionalApplied && r.pressureBefore !== r.pressureAfter ? `Signal Pressure ${r.pressureBefore} → ${r.pressureAfter}.`
    : r.frontJustSecured ? 'Current rotation front secured.' : 'No regional change confirmed by this receipt.';
  const future = r.masteryUnlocked ? 'Relay Mastery recorded · 1/1. Relay Lockdown is permanently unlocked, including outside the base mission rotation.' : r.regionalApplied && r.pressureBefore >= 2 && r.pressureAfter < 2
    ? 'New relevant Field Ops delay reinforcements by 1 round. Already accepted runs keep their original timing.'
    : r.regionalApplied && r.pressureBefore < 2 && r.pressureAfter >= 2
      ? 'New relevant Field Ops use scheduled reinforcement timing. Already accepted runs keep their original timing.'
      : r.advancedUnlocked ? 'Advanced conditions are now available in eligible mission briefs.'
      : 'No new battle modifier confirmed. Use your saved squad abilities or attempt an unfinished challenge.';
  return { earned, exhausted, changed, future };
}
