import type { FieldContext } from './fieldOps';
import type { FieldOpsProgression } from '../host/foundationProgression';
import { getMissionDef } from './operations';

export type OpportunityStatus = 'eligible' | 'claimed' | 'locked' | 'unknown';
const reasons = {
  CREDIT_AVAILABLE: 'Win an eligible Advanced Field Op this rotation. The optional challenge is separate. A Veteran credit is saved only after server confirmation.',
  DIVERSITY_AVAILABLE: 'Credits are full. Win this new Advanced objective to add missing mission or objective diversity; no extra credit is promised.',
  ROTATION_CREDIT_USED: 'Veteran credit already saved this rotation. Another objective cannot grant a second credit. Check unfinished clear or challenge goals.',
  VETERAN_COMPLETE: 'Veteran career complete. Pack Extraction is optional practice; no progression reward.',
  COMMANDER_CERTIFICATION_REQUIRED: 'Commander certification is required. Work on unfinished clear and challenge goals first.',
  ADVANCED_UNAVAILABLE: 'Advanced conditions are not available from this server state.',
  NO_MEANINGFUL_OBJECTIVE: 'No new Veteran objective is available on this board. Check other unfinished goals or return after rotation.',
  STATUS_UNAVAILABLE: 'Veteran availability is not confirmed. Clear and challenge goals below are separate; no Veteran credit is promised.',
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
  if (context?.masteryChallenge || context?.veteranChallenge) return {status:'locked', copy:'Optional practice. No Veteran credit or other progression reward.'};
  if (accepted && (context?.progressionVersion !== 2 || context.cycleId !== field?.board?.cycleId)) return {status:'unknown', copy:'Accepted conditions are preserved. Veteran eligibility for this run comes only from its server receipt.'};
  const opportunity = parseVeteranOpportunity(field?.veteranOpportunity, field?.board?.cycleId);
  if (field?.board?.nextRotationAt && field.board.nextRotationAt * 1000 <= Date.now()) return {status:'unknown', copy:'The board rotation ended. Refresh to confirm the next opportunity; no new credit is promised.'};
  if (!opportunity) return unknown;
  if (opportunity.status !== 'eligible') return {status:opportunity.status, copy:reasons[opportunity.reason]};
  if (missionId && !opportunity.missionIds.includes(missionId)) return {status:'locked', copy:'This mission has no new Veteran opportunity confirmed. Choose the recommended Advanced objective at the War Table.'};
  if (missionId && context?.directiveTier !== 'advanced') return {status:'locked', copy:'Choose Advanced conditions for this Veteran opportunity. A Standard victory does not qualify.'};
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
