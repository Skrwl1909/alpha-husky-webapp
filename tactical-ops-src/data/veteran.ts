export interface VeteranProgress { version: 1; credits: number; missionIds: string[]; lastCycle: number | null; enabled: boolean }
export interface VeteranDelta { before: number; after: number; reason: string; unlocked: boolean }
export const VETERAN_TARGET = 12;
export const OBJECTIVE_FAMILIES: Record<string,string> = {"field-relay-recovery":"RECOVER","field-relay-intercept":"INTERCEPT","field-relay-hold":"HOLD","field-isolated-hold":"HOLD","field-squad-survival":"SURVIVE","field-rearguard":"SURVIVE"};
export function parseVeteran(raw: unknown): VeteranProgress | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const v=raw as VeteranProgress;
  return v.version===1 && Number.isInteger(v.credits) && v.credits>=0 && v.credits<=12 && Array.isArray(v.missionIds) && v.missionIds.every(m=>Object.hasOwn(OBJECTIVE_FAMILIES,m)) && (v.lastCycle===null || Number.isInteger(v.lastCycle)) && typeof v.enabled==="boolean" ? {...v,missionIds:[...v.missionIds]} : undefined;
}
export function veteranComplete(v: VeteranProgress | undefined, commander=false): boolean {
  return !!v && v.credits>=12 && new Set(v.missionIds).size >= (commander?4:2) && new Set(v.missionIds.map(m=>OBJECTIVE_FAMILIES[m])).size >= (commander?3:2);
}
export function veteranRequirement(v: VeteranProgress | undefined, role?: string): string {
  const families=new Set(v?.missionIds.map(m=>OBJECTIVE_FAMILIES[m]));
  return role ? `${role==="SHADOW"?"HOLD + SURVIVE":"RECOVER + INTERCEPT"} · ${families.size}/2 objective families · 1 credit per rotation`
    : `${new Set(v?.missionIds).size}/4 missions · ${families.size}/3 objective families · 1 credit per rotation`;
}
export const VETERAN_OPTIONS = {
  CNC:{name:"STATIC FIELD",copy:"PRESSURE becomes radius-1 control with no damage. Range -1 and cooldown +1. A/B control timing still applies."},
  SHADOW:{name:"FOCUSED WARD",copy:"PACK SUPPORT becomes 3-turn GUARD with no healing, radius -1 and cooldown +1. Trade coverage for protection duration."},
  PET:{name:"EXTRACTION SCOUT",copy:"RECOVER reaches 3 cells. HAMSTRING cooldown +1. Trade control frequency for objective reach."},
} as const;
