import { DEPLOYMENT_APPROACHES, type DeploymentApproach, type FieldContext, type MissionChallenge } from "./fieldOps";
import type { SpawnSpec } from "./units";
import type { BattleObjective, MissionDirective, Cell } from "../combat/types";
import { tacticalPetDef, type TacticalPet } from "./companion";
import { UNIT_DEFS } from "./units";
import { missionDirectives } from "./directives";
import { composeDirectives } from "../combat/missionRules";

export type MissionObjectiveType = "ELIMINATE" | "RECOVER" | "BOSS" | "HOLD" | "SURVIVE" | "INTERCEPT";
export type MissionStatus = "locked" | "available" | "cleared";

export interface MissionDef {
  activity?: "CANON" | "FIELD_OP";
  battlefield?: string;
  objective?: BattleObjective;
  directive?: MissionDirective;
  squadHint?: string;
  challenge?: MissionChallenge;
  regionId?: string;
  missionId: string;
  operationId: string;
  name: string;
  objectiveType: MissionObjectiveType;
  squadCap: number;
  briefCopy: string;
  resultsCopy: string;
  executable: boolean;
  spawns?: SpawnSpec[];
  terminal?: Cell;
}

export interface CampaignContext { version: 1; courierTraceAcquired: boolean }
export type ChapterIntel={version:1;effect:"DELAY_REINFORCEMENT";sourceChapterId:"edge-relay";
  missionId:string;baselineRound:number;effectiveRound:number};
/** Frozen modifier from an accepted run; never accept a local progress claim. */
export function applyChapterIntelToRules<T extends {reinforcement: {triggerRound:number}|null}>(rules:T,missionId:string,intel?:ChapterIntel):T {
  if(!intel)return rules;
  if(intel.version!==1||intel.effect!=="DELAY_REINFORCEMENT"||intel.sourceChapterId!=="edge-relay"||
     intel.missionId!==missionId||!rules.reinforcement||rules.reinforcement.triggerRound!==intel.baselineRound||
     intel.effectiveRound!==intel.baselineRound+1)throw Error("chapter_intel_rules_mismatch");
  return {...rules,reinforcement:{...rules.reinforcement,triggerRound:intel.effectiveRound}};
}

export interface TacticalOperationDef {
  operationId: string;
  name: string;
  orderedMissionIds: string[];
}

export const MISSION_BATTLEFIELDS: Record<string, { art: string }> = {
  "broken-signal": { art: "/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png" },
};

export function missionBattlefield(mission: MissionDef | null) {
  return MISSION_BATTLEFIELDS[mission?.battlefield || "broken-signal"] || MISSION_BATTLEFIELDS["broken-signal"];
}

export const BROKEN_SIGNAL_BREACH_SPAWNS: SpawnSpec[] = [
  { defId: "alpha", id: "alpha", c: 0, r: 2 },
  { defId: "ally-02", id: "ally-02", c: 1, r: 0 },
  { defId: "ally-03", id: "ally-03", c: 1, r: 4 },
  { defId: "hostile", id: "h1", c: 5, r: 1 },
  { defId: "hostile", id: "h2", c: 6, r: 3 },
  { defId: "hostile", id: "h3", c: 7, r: 0 },
];

export const BROKEN_SIGNAL_RECOVER_SPAWNS: SpawnSpec[] = [
  { defId: "alpha", id: "alpha", c: 0, r: 2 },
  { defId: "hostile", id: "h1", c: 5, r: 1 },
  { defId: "hostile", id: "h2", c: 6, r: 3 },
];

export const RECOVER_TERMINAL: Cell = { c: 6, r: 2 };

export const BROKEN_SIGNAL_COMMANDER_SPAWNS: SpawnSpec[] = [
  { defId: "alpha", id: "alpha", c: 1, r: 2 },
  { defId: "ally-02", id: "ally-02", c: 1, r: 0 },
  { defId: "ally-03", id: "ally-03", c: 0, r: 3 },
  { defId: "leader", id: "leader", c: 6, r: 2 },
  { defId: "hostile", id: "h1", c: 4, r: 0 },
  { defId: "hostile", id: "h2", c: 5, r: 4 },
];

export const COMMANDER_REINFORCEMENT = {
  spawn: { defId: "hostile", id: "commander-reinforcement", c: 7, r: 4 },
  triggerRound: 2,
} as const;


export function recoverSpawnsForSquad(squadIds: string[], pet?: TacticalPet | null): SpawnSpec[] | null {
  const petSelected = Boolean(pet && squadIds[1] === `pet:${pet.id}`);
  if (squadIds.length !== 2 || squadIds[0] !== "alpha" || (!petSelected && !["ally-02", "ally-03"].includes(squadIds[1]))) return null;
  return [
    { defId: "alpha", id: "alpha", c: 0, r: 2 },
    { defId: squadIds[1], id: squadIds[1], c: 1, r: squadIds[1] === "ally-02" ? 0 : 4,
      ...(petSelected ? { unitDef: tacticalPetDef(pet!) } : {}) },
    ...BROKEN_SIGNAL_RECOVER_SPAWNS.filter((spawn) => spawn.defId === "hostile"),
  ];
}

export function commanderSpawnsForSquad(squadIds: string[], pet?: TacticalPet | null): SpawnSpec[] | null {
  if (squadIds.length !== 3 || squadIds[0] !== "alpha" || new Set(squadIds).size !== 3) return null;
  if (!squadIds.slice(1).every((id) => id === "ally-02" || id === "ally-03" || (pet && id === `pet:${pet.id}`))) return null;
  return [
    { ...BROKEN_SIGNAL_COMMANDER_SPAWNS[0] },
    ...squadIds.slice(1).map((id, index) => ({
      defId: id, id, c: index === 0 ? 1 : 0, r: index === 0 ? 0 : 3,
      ...(pet && id === `pet:${pet.id}` ? { unitDef: tacticalPetDef(pet) } : {}),
    })),
    ...BROKEN_SIGNAL_COMMANDER_SPAWNS.slice(3),
  ];
}

export const BROKEN_SIGNAL: TacticalOperationDef = {
  operationId: "broken-signal",
  name: "BROKEN SIGNAL",
  orderedMissionIds: ["broken-signal-breach", "broken-signal-recover", "broken-signal-commander"],
};

export const DEAD_RELAY: TacticalOperationDef = {
  operationId: "dead-relay", name: "THE DEAD RELAY",
  orderedMissionIds: ["dead-relay-courier", "dead-relay-hold", "dead-relay-guardian"],
};

export const MISSION_DEFS: Record<string, MissionDef> = {
  "broken-signal-breach": {
    missionId: "broken-signal-breach",
    operationId: BROKEN_SIGNAL.operationId,
    name: "BREACH",
    objectiveType: "ELIMINATE",
    squadCap: 3,
    briefCopy: "Break the perimeter before the signal disappears. Eliminate the HOUND MK-2 patrol.",
    resultsCopy: "BREACH CLEARED. RECOVER SIGNAL UNLOCKED.",
    executable: true,
    spawns: BROKEN_SIGNAL_BREACH_SPAWNS,
  },
  "broken-signal-recover": {
    missionId: "broken-signal-recover",
    operationId: BROKEN_SIGNAL.operationId,
    name: "RECOVER SIGNAL",
    objectiveType: "RECOVER",
    squadCap: 2,
    briefCopy: "Reach the relay terminal and recover the signal before the HOUND MK-2 patrol can stop you.",
    resultsCopy: "OBJECTIVE COMPLETE · SIGNAL RECOVERED.",
    executable: true,
    terminal: RECOVER_TERMINAL,
  },
  "broken-signal-commander": {
    missionId: "broken-signal-commander",
    operationId: BROKEN_SIGNAL.operationId,
    name: "SIGNAL COMMANDER",
    objectiveType: "BOSS",
    squadCap: 3,
    briefCopy: "Break the commander signal. Control the HOUND pressure or find an opening to defeat the BRUTE LEADER.",
    resultsCopy: "Continue to save: OPERATION 01 — BROKEN SIGNAL CLEARED · ARCHIVE ENTRY RECORDED · NEXT OPERATION SLOT OPENED. No Operation assigned.",
    executable: true,
    spawns: BROKEN_SIGNAL_COMMANDER_SPAWNS,
  },
};

export function getMissionDef(missionId: string | null | undefined): MissionDef | null {
  return missionId ? MISSION_DEFS[missionId] || null : null;
}


/** Configuration pool. The backend supplies the three active slots for each UTC cycle. */
export const FIELD_OP_IDS = ["field-relay-recovery", "field-relay-hold", "field-squad-survival", "field-relay-intercept", "field-isolated-hold", "field-rearguard"];
const fieldBase = { activity: "FIELD_OP" as const, operationId: "field-ops", regionId: "broken-signal", battlefield: "broken-signal", squadCap: 3, executable: true, resultsCopy: "Field Op complete. Your result records commander progress, the optional challenge and temporary signal pressure." };
Object.assign(MISSION_DEFS, {
  "field-relay-recovery": {
    ...fieldBase, missionId: "field-relay-recovery", name: "RELAY RECOVERY", objectiveType: "RECOVER",
    challenge: { type: "TURN_LIMIT", limit: 4, label: "Recover by the end of round 4" },
    briefCopy: "Reach the relay and use RECOVER from within 1 cell. Eliminating the HOUND patrol is optional.",
    terminal: { c: 6, r: 2 }, objective: { type: "RECOVER", terminal: { c: 6, r: 2 }, completed: false },
    spawns: BROKEN_SIGNAL_RECOVER_SPAWNS.filter((s) => s.defId === "hostile"),
    directive: { type: "SIGNAL_INTERFERENCE", name: "SIGNAL INTERFERENCE", recoverEveryRounds: 2, copy: "RECOVER works only on even rounds (2, 4, 6...). Move and attack normally; reach cover or prepare protection while the signal is jammed." },
    squadHint: "PET mobility can reach the relay early. CNC controls patrol pressure; SHADOW protects a squad waiting for the signal window.",
  },
  "field-relay-hold": {
    ...fieldBase, missionId: "field-relay-hold", name: "RELAY HOLD", objectiveType: "HOLD",
    challenge: { type: "NO_HEALING", label: "Clear without using a healing skill" },
    briefCopy: "Keep at least one ally within 1 cell of the marked relay, with no enemy inside that area, across 3 consecutive round changes. Losing control resets progress.",
    objective: { type: "HOLD", terminal: { c: 3, r: 2 }, radius: 1, duration: 3, progress: 0, checkedRound: 1 },
    spawns: [{ defId: "hostile", id: "h1", c: 5, r: 1 }, { defId: "hostile", id: "h2", c: 6, r: 3 }],
    directive: { type: "REINFORCEMENTS", name: "REINFORCEMENTS", copy: "One HOUND arrives at the marked entry in round 2, or round 3 when signal pressure is reduced/clear (nearest free cell if occupied). Clear or slow enemies before they contest the relay.", reinforcement: { spawn: { defId: "hostile", id: "field-reinforcement", c: 7, r: 2 }, triggerRound: 2, telegraphed: true, spawned: false } },
    squadHint: "CNC pressure helps keep the area clear. SHADOW sustains the holder; PET control can delay the arriving HOUND.",
  },
  "field-squad-survival": {
    ...fieldBase, missionId: "field-squad-survival", name: "SQUAD SURVIVAL", objectiveType: "SURVIVE",
    challenge: { type: "SQUAD", required: ["ally-02", "PET"], label: "Clear with CNC and your equipped PET" },
    briefCopy: "Keep all three squad members standing through 4 rounds, until round 5 begins. Any squad member falling fails the mission. Clearing enemies early does not end the timer.",
    objective: { type: "SURVIVE", duration: 4, progress: 0, checkedRound: 1 },
    spawns: [{ defId: "hostile", id: "h1", c: 4, r: 0 }, { defId: "hostile", id: "h2", c: 5, r: 4 }, { defId: "hostile", id: "h3", c: 6, r: 2 }],
    directive: { type: "DISRUPTED_SUPPORT", name: "DISRUPTED SUPPORT", supportCooldownExtra: 1, copy: "Allied healing and self/ally buff skills take 1 extra personal turn to recharge after use. Attacks and movement are unchanged. Time support carefully and protect the weakest squad member." },
    squadHint: "SHADOW still provides sustain, but timing matters. CNC can reduce incoming pressure; PET mobility and slows help keep the squad safe.",
  },
  "field-relay-intercept": {
    ...fieldBase, missionId: "field-relay-intercept", name: "RELAY INTERCEPT", objectiveType: "RECOVER",
    briefCopy: "Recover at the northern relay from within 1 cell. Rush the terminal or control the patrol before the incoming HOUND closes the route.",
    terminal: { c: 6, r: 0 }, objective: { type: "RECOVER", terminal: { c: 6, r: 0 }, completed: false },
    spawns: [{ defId: "hostile", id: "h1", c: 4, r: 1 }, { defId: "hostile", id: "h2", c: 6, r: 3 }],
    directive: { type: "REINFORCEMENTS", name: "REINFORCEMENTS", copy: "One HOUND enters from the north-east in round 2, or round 3 when signal pressure is reduced/clear. The entry uses the nearest free cell if occupied.", reinforcement: { spawn: { defId: "hostile", id: "field-reinforcement", c: 7, r: 0 }, triggerRound: 2, telegraphed: true, spawned: false } },
    challenge: { type: "NO_HEALING", label: "Recover without using a healing skill" },
    squadHint: "CNC can open the northern route. PET speed favors a rush; SHADOW makes a slower approach safer.",
  },
  "field-isolated-hold": {
    ...fieldBase, missionId: "field-isolated-hold", name: "ISOLATED HOLD", objectiveType: "HOLD",
    briefCopy: "Control the southern relay area within 1 cell for 2 consecutive round changes. Any enemy inside contests it; losing control resets progress. The BRUTE LEADER applies pressure from the center.",
    objective: { type: "HOLD", terminal: { c: 4, r: 3 }, radius: 1, duration: 2, progress: 0, checkedRound: 1 },
    spawns: [{ defId: "leader", id: "leader", c: 6, r: 2 }, { defId: "hostile", id: "h1", c: 5, r: 0 }],
    directive: { type: "DISRUPTED_SUPPORT", name: "DISRUPTED SUPPORT", supportCooldownExtra: 1, copy: "Allied healing and self/ally buff skills take 1 extra personal turn to recharge. Hold the area while planning longer gaps between support actions." },
    challenge: { type: "TURN_LIMIT", limit: 5, label: "Secure the area by the end of round 5" },
    squadHint: "SHADOW can protect a stationary holder. CNC or PET control helps keep the leader outside the area. South Approach changes the route to this relay.",
  },
  "field-rearguard": {
    ...fieldBase, missionId: "field-rearguard", name: "REARGUARD", objectiveType: "SURVIVE",
    briefCopy: "Keep all three squad members standing through 5 rounds, until round 6 begins. Defend against the patrol and the arriving HOUND. Any squad member falling fails the mission.",
    objective: { type: "SURVIVE", duration: 5, progress: 0, checkedRound: 1 },
    spawns: [{ defId: "hostile", id: "h1", c: 4, r: 1 }, { defId: "hostile", id: "h2", c: 5, r: 4 }],
    directive: { type: "REINFORCEMENTS", name: "REINFORCEMENTS", copy: "One HOUND arrives from the south-east in round 3, or round 4 when signal pressure is reduced/clear. Protect the flank or regroup before it arrives.", reinforcement: { spawn: { defId: "hostile", id: "field-reinforcement", c: 7, r: 4 }, triggerRound: 3, telegraphed: true, spawned: false } },
    challenge: { type: "SQUAD", required: ["ally-03", "PET"], label: "Survive with SHADOW and your equipped PET" },
    squadHint: "SHADOW can sustain a defensive group. PET slows help delay the new arrival; CNC offers pressure if you forgo the optional squad challenge.",
  },
  "dead-relay-courier": {
    activity: "CANON", missionId: "dead-relay-courier", operationId: DEAD_RELAY.operationId,
    battlefield: "broken-signal", name: "THE COURIER", objectiveType: "INTERCEPT", squadCap: 3,
    executable: true,
    briefCopy: "HOUND is evacuating relay intel. Stop the reinforced SIGNAL COURIER before it reaches the south-east exit. It moves up to 2 cells each turn, while a HOUND patrol pressures your flank. Slow, intercept or focus fire. Stop it by round 4 on the FIRST successful clear to earn intel for the next mission.",
    resultsCopy: "Courier stopped. Relay coordinates recovered. The counterattack is imminent.",
    objective: { type: "INTERCEPT", targetId: "courier", exit: { c: 7, r: 4 } },
    spawns: [
      // P2: mission-local chase pressure; no global enemy or player scaling.
      { defId: "hostile", id: "courier", c: 4, r: 0, unitDef: { ...UNIT_DEFS.hostile, defId: "signal-courier", name: "SIGNAL COURIER", hp: 100, move: 2 } },
      { defId: "hostile", id: "h1", c: 5, r: 3 },
      { defId: "hostile", id: "h2", c: 3, r: 3 },
    ],
    squadHint: "CNC can suppress the fleeing courier. PET slows make interception easier, while SHADOW keeps a forward blocker alive.",
  },
  "dead-relay-hold": {
    activity: "CANON", missionId: "dead-relay-hold", operationId: DEAD_RELAY.operationId,
    battlefield: "broken-signal", name: "RELAY UNDER FIRE", objectiveType: "HOLD", squadCap: 3,
    executable: true,
    briefCopy: "Hold the relay for 3 consecutive round changes. Any enemy inside the marked zone resets control. Your recovered courier intel delays one HOUND reinforcement by a round.",
    resultsCopy: "Relay secured. The defensive perimeter is stable. Guardian access confirmed.",
    objective: { type: "HOLD", terminal: { c: 3, r: 2 }, radius: 1, duration: 3, progress: 0, checkedRound: 1 },
    spawns: [{ defId: "hostile", id: "h1", c: 5, r: 1 }, { defId: "hostile", id: "h2", c: 6, r: 3 }],
    directive: { type: "REINFORCEMENTS", name: "REINFORCEMENTS", copy: "A HOUND arrives from the east on round 2, or round 3 if courier intel was captured in the first mission.",
      reinforcement: { spawn: { defId: "hostile", id: "dead-relay-reinforcement", c: 7, r: 2 }, triggerRound: 2, telegraphed: true, spawned: false } },
    squadHint: "SHADOW can sustain relay control. CNC and PET prevent enemy contesting.",
  },
  "dead-relay-guardian": {
    activity: "CANON", missionId: "dead-relay-guardian", operationId: DEAD_RELAY.operationId,
    battlefield: "broken-signal", name: "RELAY GUARDIAN", objectiveType: "BOSS", squadCap: 3,
    executable: true,
    briefCopy: "Eliminate the Dead Relay Guardian while a telegraphed HOUND reinforcement closes from the flank. This is the final mission of Operation 02.",
    resultsCopy: "OPERATION 02 — THE DEAD RELAY SECURED. Canonical campaign archive updated.",
    objective: { type: "BOSS", targetId: "leader" },
    spawns: [
      { defId: "leader", id: "leader", c: 6, r: 2, unitDef: { ...UNIT_DEFS.leader, name: "DEAD RELAY GUARDIAN" } },
      { defId: "hostile", id: "h1", c: 4, r: 0 }, { defId: "hostile", id: "h2", c: 5, r: 4 },
    ],
    directive: { type: "REINFORCEMENTS", name: "GUARDIAN REINFORCEMENT", copy: "One HOUND enters from the south-east on round 3. The entry is telegraphed.",
      reinforcement: { spawn: { defId: "hostile", id: "guardian-reinforcement", c: 7, r: 4 }, triggerRound: 3, telegraphed: true, spawned: false } },
    squadHint: "Use your Pack's control and sustain to counter the Guardian's pressure, then focus on the boss.",
  },
} satisfies Record<string, MissionDef>);

// V2.6 accepted attempts keep the old RECOVER contract until committed/abandoned.
const LEGACY_RELAY_INTERCEPT = structuredClone(MISSION_DEFS["field-relay-intercept"]);
MISSION_DEFS["field-relay-intercept"] = {
  ...LEGACY_RELAY_INTERCEPT, objectiveType: "INTERCEPT", terminal: undefined,
  briefCopy: "Stop the SIGNAL COURIER before it reaches the south-east EXIT. It moves 1 cell on each personal turn, taking the shortest free route. Block the route, slow it, or focus fire; patrol kills are optional.",
  objective: { type: "INTERCEPT", targetId: "courier", exit: { c: 7, r: 4 } },
  spawns: [{ defId: "hostile", id: "courier", c: 4, r: 0, unitDef: { ...UNIT_DEFS.hostile, defId: "signal-courier", name: "SIGNAL COURIER", move: 1 } },
    { defId: "hostile", id: "h1", c: 4, r: 2 }, { defId: "hostile", id: "h2", c: 6, r: 3 }],
  challenge: { type: "NO_HEALING", label: "Intercept without using a healing skill" },
  squadHint: "CNC DISRUPTOR and PET HAMSTRING slow the courier's turns. PET mobility can block its exit; SHADOW protects a forward blocker at the cost of another control unit.",
};

export function missionForContext(mission: MissionDef, context?: Partial<FieldContext>, missionRevision = 1): MissionDef {
  if (mission.missionId === "field-relay-intercept" && context?.reportVersion === 3 && missionRevision === 2) {
    return {...mission,
      briefCopy:"The courier starts behind its patrol, close to the eastern escape lane. Cut north to slow and focus it, or send a protected blocker south to the exit. Ignoring the runner loses the operation.",
      objective:{type:"INTERCEPT",targetId:"courier",exit:{c:7,r:4},screenedEscape:true},
      spawns:[{...mission.spawns![0],c:6,r:0},{...mission.spawns![1],c:4,r:0},{...mission.spawns![2],c:5,r:1}],
      squadHint:"Pursue north under the marksman's TARGET LOCK, or anchor the exit while the squad controls the courier. TARGET LOCK tracks its marked ally: break firing range, close inside minimum range, interrupt, or protect. A one-cell sidestep alone does not cancel it."};
  }
  if (context?.reportVersion === 6 && context.veteranChallenge === "pack-extraction-v1") {
    if (mission.missionId !== "field-relay-recovery") throw Error("invalid_veteran_mission");
    return {...mission,name:"VETERAN · PACK EXTRACTION",briefCopy:"Bring all three squad members within 2 orthogonal cells of the relay, then RECOVER on an even round by round 6. A lone runner cannot extract the pack. No progression or currency rewards.",
      objective:{type:"RECOVER",terminal:{c:6,r:2},completed:false,squadExtractionRadius:2},challenge:undefined,
      squadHint:"CNC screens while SHADOW protects the convoy, or use PET mobility and CNC control to regroup. Every deployed unit must reach the extraction area."};
  }
  if (context?.reportVersion === 5 && context.masteryChallenge === "relay-lockdown-v1") {
    if (mission.missionId !== "field-relay-hold" || !["anchor", "crosslink"].includes(context.lockdownPlan!)) throw Error("invalid_lockdown_plan");
    const anchor = missionForContext(mission, { ...context, reportVersion: 4 });
    if (context.lockdownPlan === "anchor") return { ...anchor, name: "RELAY LOCKDOWN · ANCHOR" };
    const relayRoute = [{ c: 3, r: 1 }, { c: 4, r: 2 }, { c: 3, r: 3 }];
    return { ...anchor, name: "RELAY LOCKDOWN · CROSSLINK",
      briefCopy: "Occupy the north, east, then south relay tiles at three consecutive round changes. Clear adjacent enemies at each checkpoint. Miss one and the sequence resets to north. Moving between checkpoints does not reset progress. Finish by round 6; normal support recharge.",
      objective: { type: "HOLD", terminal: relayRoute[0], relayRoute, radius: 1, holderRadius: 0, duration: 3, progress: 0, checkedRound: 1 },
      squadHint: "ALPHA rotates while CNC clears the next relay. Bring SHADOW for healing, or PET for slows and mobility. No specific sidegrade required." };
  }
  if (context?.reportVersion === 4 && context.masteryChallenge === "relay-lockdown-v1") {
    if (mission.missionId !== "field-relay-hold") throw Error("invalid_mastery_mission");
    return { ...mission, name: "RELAY LOCKDOWN",
      briefCopy: "Keep one ally ON the relay tile for 3 consecutive round changes by the end of round 6. Any enemy within 1 orthogonal cell contests it and resets progress. Support recharges 1 personal turn slower; one HOUND arrives in round 2. Decide who anchors the tile and who clears the approaches.",
      objective: { type: "HOLD", terminal: { c: 3, r: 2 }, radius: 1, holderRadius: 0, duration: 3, progress: 0, checkedRound: 1 },
      squadHint: "Anchor ALPHA with SHADOW protection while CNC clears the approach, or trade SHADOW sustain for PET mobility and control. The holder cannot evade off the tile without resetting progress.",
      resultsCopy: "Optional Relay Lockdown result recorded. Relay Mastery remains unlocked; no currency, Commander or Pack Mastery rewards." };
  }
  return mission.missionId === "field-relay-intercept" && context?.reportVersion != null && context.reportVersion < 3 ? LEGACY_RELAY_INTERCEPT : mission;
}

/** The accepted Commander squad rules also supply Field Ops' two tactical slots. */
export function missionSpawnsForSquad(mission: MissionDef, squadIds: string[], pet?: TacticalPet | null, approach: DeploymentApproach = "standard"): SpawnSpec[] | null {
  if (mission.operationId === DEAD_RELAY.operationId) {
    const squad = commanderSpawnsForSquad(squadIds, pet);
    return squad ? [...squad.slice(0, 3), ...(mission.spawns || [])] : null;
  }
  if (mission.activity === "FIELD_OP") {
    const squad = commanderSpawnsForSquad(squadIds, pet);
    return squad && DEPLOYMENT_APPROACHES[approach] ? [...squad.slice(0, 3).map((spawn, i) => ({ ...spawn, ...DEPLOYMENT_APPROACHES[approach].cells[i] })), ...(mission.spawns || [])] : null;
  }
  return mission.objectiveType === "RECOVER" ? recoverSpawnsForSquad(squadIds, pet)
    : mission.objectiveType === "BOSS" ? commanderSpawnsForSquad(squadIds, pet) : mission.spawns || null;
}

export function missionBattleRules(mission: MissionDef, routingTrace = false, context?: Partial<FieldContext>, campaignContext?: CampaignContext | null) {
  mission = missionForContext(mission, context);
  const objective: BattleObjective | null = mission.objective ? structuredClone(mission.objective)
    : mission.objectiveType === "RECOVER" && mission.terminal ? { type: "RECOVER", terminal: { ...mission.terminal }, completed: false }
    : mission.objectiveType === "BOSS" ? { type: "BOSS", targetId: "leader" } : null;
  const directive = composeDirectives(missionDirectives(mission, context));
  const reinforcement = directive?.reinforcement || (mission.objectiveType === "BOSS" ? { ...COMMANDER_REINFORCEMENT, spawn: { ...COMMANDER_REINFORCEMENT.spawn }, telegraphed: routingTrace, spawned: false } : null);
  if (mission.activity === "FIELD_OP" && reinforcement && context && context.pressure < 2) {
    reinforcement.triggerRound += 1;
  }
  if (mission.missionId === "dead-relay-hold" && reinforcement && campaignContext?.courierTraceAcquired) {
    reinforcement.triggerRound = 3;
  }
  return { objective, directive, reinforcement };
}
