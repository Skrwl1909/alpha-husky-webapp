import type { FieldContext } from './fieldOps';
import type { FieldOpsProgression } from '../host/foundationProgression';
import { getMissionDef } from './operations';

export type OpportunityStatus = 'eligible' | 'claimed' | 'locked' | 'unknown';
const reasons = {
  CREDIT_AVAILABLE: 'Win an Advanced mission for a Veteran credit. Your result confirms it.',
  DIVERSITY_AVAILABLE: 'Try a different Advanced mission. It can build your Veteran record, but adds no extra credit.',
  ROTATION_CREDIT_USED: 'Veteran credit saved! One per rotation. No second credit yet — try an unfinished challenge.',
  VETERAN_COMPLETE: 'Veteran complete! Pack Extraction is practice — no new rewards.',
  COMMANDER_CERTIFICATION_REQUIRED: 'Earn Commander Rank 3 first. Finish your open missions and challenges.',
  ADVANCED_UNAVAILABLE: 'Advanced is not available right now.',
  NO_MEANINGFUL_OBJECTIVE: 'No new Veteran goal right now. Try unfinished missions or come back next rotation.',
  STATUS_UNAVAILABLE: 'Veteran status unavailable. Other missions are still playable; no credit promised.',
} as const;
export interface VeteranOpportunity {
  version: 1; cycleId: number; status: OpportunityStatus; reason: keyof typeof reasons;
  missionIds: string[]; recommendedMissionId: string | null;
}

/** Optional projection. Bad/missing/future payloads hide the recommendation, not the account. */
export function parseVeteranOpportunity(raw: unknown, cycleId: number | undefined): VeteranOpportunity | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const x = raw as VeteranOpportunity;
  if (x.version !== 1 || !Number.isInteger(x.cycleId) || x.cycleId !== cycleId ||
    !['eligible','claimed','locked','unknown'].includes(x.status) || !Object.hasOwn(reasons, x.reason) ||
    !Array.isArray(x.missionIds) || x.missionIds.some(id => typeof id !== 'string' || getMissionDef(id)?.activity !== 'FIELD_OP') ||
    new Set(x.missionIds).size !== x.missionIds.length ||
    (x.status === 'eligible' ? !x.recommendedMissionId || !x.missionIds.includes(x.recommendedMissionId) || !['CREDIT_AVAILABLE','DIVERSITY_AVAILABLE'].includes(x.reason)
      : x.recommendedMissionId !== null || x.missionIds.length !== 0 || ['CREDIT_AVAILABLE','DIVERSITY_AVAILABLE'].includes(x.reason))) return undefined;
  return { ...x, missionIds: [...x.missionIds] };
}

/** Display server decisions. Never evaluates Veteran credit/family/rotation rules locally. */
export function veteranOpportunityView(field?: FieldOpsProgression, missionId?: string, context?: Partial<FieldContext>, accepted = false): {status: OpportunityStatus; copy: string} {
  const unknown = { status: 'unknown' as const, copy: reasons.STATUS_UNAVAILABLE };
  if (context?.masteryChallenge || context?.veteranChallenge) return {status:'locked', copy:'Practice only. No Veteran credit or rewards.'};
  if (accepted && (context?.progressionVersion !== 2 || context.cycleId !== field?.board?.cycleId)) return {status:'unknown', copy:'Your saved mission keeps its original rules. The result decides Veteran credit.'};
  const opportunity = parseVeteranOpportunity(field?.veteranOpportunity, field?.board?.cycleId);
  if (field?.board?.nextRotationAt && field.board.nextRotationAt * 1000 <= Date.now()) return {status:'unknown', copy:'Rotation ended. Refresh for new missions. No credit promised yet.'};
  if (!opportunity) return unknown;
  if (opportunity.status !== 'eligible') return {status:opportunity.status, copy:reasons[opportunity.reason]};
  if (missionId && !opportunity.missionIds.includes(missionId)) return {status:'locked', copy:'No Veteran credit here. Try the recommended Advanced mission.'};
  if (missionId && context?.directiveTier !== 'advanced') return {status:'locked', copy:'Pick Advanced for Veteran credit. Standard does not count.'};
  return {status:'eligible', copy:reasons[opportunity.reason]};
}

/** Reasons are supplied by the receipt; never infer which combat condition failed. */
export function veteranReceiptReason(reason: string): string {
  return ({
    CREDIT_RECORDED:'Rotation credit saved. Another mission cannot add a second credit this rotation.',
    DIVERSITY_RECORDED:'Objective diversity recorded. The credit total is unchanged.',
    ROTATION_CREDIT_USED:reasons.ROTATION_CREDIT_USED,
    VETERAN_COMPLETE:reasons.VETERAN_COMPLETE,
    ADVANCED_ACCEPTED_CLEAR_REQUIRED:'An eligible accepted Advanced victory in the current rotation was required. This receipt confirms no new Veteran credit.',
    NEW_VETERAN_CONTRACT_REQUIRED:'This accepted run predates the Veteran contract. Its original conditions were preserved.',
    FOUNDATION_REQUIRED_AT_START:'Companion Foundation Mastery was required when this run was accepted.',
    OBJECTIVE_NOT_ELIGIBLE:'This objective does not qualify for this companion’s Veteran role.',
  } as Record<string,string>)[reason] || 'No additional Veteran eligibility detail supplied by this receipt.';
}
