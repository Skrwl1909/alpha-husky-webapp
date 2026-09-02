import { create } from "zustand";
import type { BattleEvent, BattleState, CombatUnit, Screen } from "../combat/types";
import { a1Range, planAi, applyAi, previewQueue, reachableCells, startBattle, tryMove, trySkill, trySkip, tryRecover, advanceToNext } from "../combat";
import { availableSkills } from "../combat/skills";
import { skillNeedsTargetPick, validTargetIds } from "../combat/targeting";
import { getSkill } from "../data/skills";
import { sfx, setMuted as persistMute, isMuted } from "../audio";
import { hydrateEquippedState, identityCache, resolvePlayerIdentity, type PlayerIdentity } from "../host/identity";
import {
  FoundationProgressionError,
  type FoundationProgressionState,
  continueOperationMission,
  continueFoundationRun,
  createFoundationRequestId,
  loadFoundationProgression,
  startOperationMission,
  startFoundationRun,
} from "../host/foundationProgression";
import { VERSION } from "../version";
import {
  DEFAULT_ONBOARDING_STAGE,
  getOnboardingEncounter,
  resolveDeploySpawns,
  type OnboardingEncounterId,
} from "../data/onboarding";
import { getMissionDef, recoverSpawnsForSquad, type MissionStatus } from "../data/operations";
import type { SpawnSpec } from "../data/units";

export const TACTICAL_VERSION = VERSION;

export interface FloatText {
  id: number;
  unitId: string;
  text: string;
  kind: string;
}

interface UiBattle {
  screen: Screen;
  battle: BattleState;
  busy: boolean;
  banner: string | null;
  ticker: string | null;
  floats: FloatText[];
  attackingId: string | null;
  impactId: string | null;
  impactKey: number;
  muted: boolean;
  queue: string[];
  identity: PlayerIdentity;
  onboardingEnabled: boolean;
  onboardingStageId: OnboardingEncounterId;
  onboardingCompleted: Partial<Record<OnboardingEncounterId, true>>;
  lastVictoryKey: string | null;
  currentRunKey: string | null;
  progression: FoundationProgressionState | null;
  progressionStatus: "idle" | "loading" | "ready" | "error";
  progressionError: string | null;
  progressionCommitPending: boolean;
  continueRequestId: string | null;
  foundationCompleted: boolean;
  selectedMissionId: string | null;
  missionFirstClear: boolean | null;
  selectedSquadIds: string[];
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "undefined") {
      setTimeout(resolve, ms);
      return;
    }
    const start = performance.now();
    const step = (t: number) => {
      if (t - start >= ms) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

let floatSeq = 1;
let impactSeq = 1;
let runGen = 0;

function refreshQueue(battle: BattleState): string[] {
  return previewQueue(battle, 7);
}

function emptyBattle(): BattleState {
  return {
    units: [],
    activeId: null,
    inspectId: null,
    actionSkillId: null,
    mode: "idle",
    round: 1,
    unitTurn: 0,
    actionsLeftInRound: 0,
    outcome: "ongoing",
    damageTaken: 0,
    hostilesEliminated: 0,
    results: null,
    seed: 1,
    objective: null,
  };
}

interface Store extends UiBattle {
  openBrief: () => void;
  openOperationBrief: (missionId: string) => void;
  backToHub: () => void;
  deploy: () => void;
  inspectUnit: (id: string) => void;
  selectCell: (c: number, r: number) => void;
  selectSkill: (skillId: string) => void;
  selectTarget: (id: string) => void;
  selectRecover: () => void;
  selectRecoverTeammate: (unitId: "ally-02" | "ally-03") => void;
  skipTurn: () => void;
  cancel: () => void;
  replay: () => void;
  dismissSector: () => void;
  toggleMute: () => void;
  refreshIdentity: () => void;
  loadFoundationProgression: () => Promise<void>;
  configureOnboarding: (opts: { enabled?: boolean; stageId?: string | null }) => void;
  continueOnboarding: () => void;
}

function activeUnit(battle: BattleState): CombatUnit | undefined {
  return battle.units.find((u) => u.id === battle.activeId);
}

function stageFromProgression(state: FoundationProgressionState): OnboardingEncounterId {
  return state.foundationStage === "completed" ? "full-broken-signal" : state.foundationStage;
}

export const useBattleStore = create<Store>((set, get) => {
  const pushFloat = (unitId: string, text: string, kind: string) => {
    const id = floatSeq++;
    set((s) => ({ floats: [...s.floats, { id, unitId, text, kind }] }));
    void wait(900).then(() => {
      set((s) => ({ floats: s.floats.filter((f) => f.id !== id) }));
    });
  };

  const playEvents = async (events: BattleEvent[], g: number) => {
    for (const ev of events) {
      if (g !== runGen) return;
      if (ev.type === "ticker" && ev.text) set({ ticker: ev.text });
      if (ev.type === "banner" && ev.text) {
        set({ banner: ev.text });
        sfx("turn");
        await wait(520);
        if (g !== runGen) return;
        set({ banner: null });
      }
      if (ev.type === "damage" && ev.unitId && ev.text) {
        sfx("hit");
        set({ impactId: ev.unitId, impactKey: impactSeq++ });
        pushFloat(ev.unitId, ev.text, ev.kind ?? "dmg");
        await wait(280);
      }
      if (ev.type === "heal" && ev.unitId && ev.text) {
        sfx("heal");
        pushFloat(ev.unitId, ev.text, "heal");
        await wait(240);
      }
      if (ev.type === "status" && ev.unitId && ev.text) {
        sfx("status");
        pushFloat(ev.unitId, ev.text, ev.kind ?? "status");
        await wait(180);
      }
      if (ev.type === "expire" && ev.unitId && ev.text) {
        pushFloat(ev.unitId, ev.text, "info");
      }
      if (ev.type === "defeat" && ev.unitId) {
        pushFloat(ev.unitId, ev.text ?? "DOWN", "info");
        await wait(260);
      }
      if (ev.type === "move") sfx("move");
    }
  };

  const finishIfNeeded = async (g: number) => {
    const { battle } = get();
    if (battle.outcome === "victory") {
      set({ busy: true, banner: "SECTOR SECURED", ticker: null, attackingId: null });
      sfx("win");
      await wait(1400);
      if (g !== runGen) return true;
      set({ screen: "sector", busy: false, banner: null });
      return true;
    }
    if (battle.outcome === "defeat") {
      set({ busy: true, banner: "OPERATION FAILED", ticker: null, attackingId: null });
      sfx("lose");
      await wait(1200);
      if (g !== runGen) return true;
      set({ screen: "defeat", busy: false, banner: null });
      return true;
    }
    return false;
  };

  const continueLoop = async (g: number) => {
    if (g !== runGen) return;
    if (await finishIfNeeded(g)) return;
    const nxt = advanceToNext(get().battle);
    set({ battle: nxt.state, queue: refreshQueue(nxt.state) });
    await playEvents(nxt.events, g);
    if (g !== runGen) return;
    if (await finishIfNeeded(g)) return;
    const actor = activeUnit(get().battle);
    if (!actor) {
      set({ busy: false });
      return;
    }
    if (actor.team === "enemy") {
      set({ busy: true, ticker: `${actor.name}` });
      await wait(280);
      if (g !== runGen) return;
      await runEnemy(g);
      return;
    }
    set({
      busy: false,
      ticker: actor.hasMoved ? `${actor.name}  ·  act` : `${actor.name}  ·  move or act`,
    });
  };

  const runEnemy = async (g: number) => {
    const st = get().battle;
    const actor = activeUnit(st);
    if (!actor || actor.team !== "enemy") {
      await continueLoop(g);
      return;
    }
    const action = planAi(st);
    if (action.type === "move") {
      set({ attackingId: null });
    }
    if (action.type === "skill") {
      set({ attackingId: actor.id });
    }
    const applied = applyAi(get().battle, action);
    set({ battle: applied.state, queue: refreshQueue(applied.state), attackingId: action.type === "skill" ? actor.id : null });
    await playEvents(applied.events, g);
    if (g !== runGen) return;
    set({ attackingId: null });
    await wait(160);
    await continueLoop(g);
  };

  const afterPlayerAction = async (g: number) => {
    if (await finishIfNeeded(g)) return;
    await continueLoop(g);
  };

  const applyCanonicalProgression = (progression: FoundationProgressionState) => {
    const stage = stageFromProgression(progression);
    set({
      progression,
      progressionStatus: "ready",
      progressionError: null,
      progressionCommitPending: false,
      onboardingEnabled: true,
      onboardingStageId: stage,
      foundationCompleted: progression.completed,
    });
  };

  const beginBattle = (g: number, runKey: string, spawnsOverride?: SpawnSpec[], recoverTerminal?: { c: number; r: number }) => {
    const identity = identityCache(resolvePlayerIdentity());
    const { onboardingEnabled, onboardingStageId } = get();
    const spawns = spawnsOverride || resolveDeploySpawns(onboardingEnabled, onboardingStageId);
    const started = startBattle(identity, spawns, recoverTerminal ? { type: "RECOVER", terminal: recoverTerminal, completed: false } : null);
    sfx("turn");
    set({
      screen: "battle",
      identity,
      battle: started.state,
      queue: refreshQueue(started.state),
      busy: true,
      banner: null,
      ticker: null,
      floats: [],
      attackingId: null,
      impactId: null,
      currentRunKey: runKey,
      continueRequestId: null,
    });
    void (async () => {
      await playEvents(started.events, g);
      if (g !== runGen) return;
      const actor = activeUnit(get().battle);
      if (actor?.team === "enemy") {
        await runEnemy(g);
        return;
      }
      set({ busy: false, ticker: actor ? actor.name + "  ·  move or act" : null });
    })();
  };

  return {
    screen: "hub",
    battle: emptyBattle(),
    busy: false,
    banner: null,
    ticker: null,
    floats: [],
    attackingId: null,
    impactId: null,
    impactKey: 0,
    muted: false,
    queue: [],
    identity: resolvePlayerIdentity(),
    onboardingEnabled: false,
    onboardingStageId: DEFAULT_ONBOARDING_STAGE,
    onboardingCompleted: {},
    lastVictoryKey: null,
    currentRunKey: null,
    progression: null,
    progressionStatus: "idle",
    progressionError: null,
    progressionCommitPending: false,
    continueRequestId: null,
    foundationCompleted: false,
    selectedMissionId: null,
    missionFirstClear: null,
    selectedSquadIds: [],

    configureOnboarding: (opts) => {
      const prevEnabled = get().onboardingEnabled;
      const nextEnabled = typeof opts.enabled === "boolean" ? opts.enabled : prevEnabled;
      let nextStage = get().onboardingStageId;
      let completed = get().onboardingCompleted;
      let lastVictoryKey = get().lastVictoryKey;
      let currentRunKey = get().currentRunKey;
      if (opts.stageId != null && opts.stageId !== "") {
        nextStage = getOnboardingEncounter(opts.stageId).id;
      } else if (nextEnabled && !prevEnabled) {
        nextStage = DEFAULT_ONBOARDING_STAGE;
        completed = {};
        lastVictoryKey = null;
        currentRunKey = null;
      }
      set({
        onboardingEnabled: nextEnabled,
        onboardingStageId: nextStage,
        onboardingCompleted: completed,
        lastVictoryKey,
        currentRunKey,
      });
    },
    loadFoundationProgression: async () => {
      set({ progressionStatus: "loading", progressionError: null });
      try {
        const progression = await loadFoundationProgression();
        applyCanonicalProgression(progression);
        if (progression.completed && progression.operations?.["broken-signal"]) set({ screen: "war-table" });
      } catch (error) {
        const reason = error instanceof FoundationProgressionError ? error.code : "progression_request_failed";
        const canonical = error instanceof FoundationProgressionError ? error.state : null;
        if (canonical) applyCanonicalProgression(canonical);
        set({
          progressionStatus: canonical ? "ready" : "error",
          progressionError: reason,
        });
      }
    },
    refreshIdentity: () => {
      const identity = identityCache(resolvePlayerIdentity());
      set({ identity });
      void hydrateEquippedState().then((ok) => {
        if (!ok) return;
        const next = identityCache(resolvePlayerIdentity());
        set({ identity: next });
      });
    },
    openBrief: () => {
      const current = get();
      if (current.foundationCompleted || current.progressionStatus === "error") return;
      sfx("ui");
      set({ screen: "brief", identity: identityCache(resolvePlayerIdentity()) });
    },
    openOperationBrief: (missionId) => {
      const current = get();
      const mission = getMissionDef(missionId);
      const status = current.progression?.operations?.["broken-signal"]?.missions[missionId] as MissionStatus | undefined;
      if (!current.foundationCompleted || !mission || !status || status === "locked") return;
      sfx("ui");
      set({ screen: "brief", selectedMissionId: missionId, missionFirstClear: null, selectedSquadIds: [], progressionError: null, identity: identityCache(resolvePlayerIdentity()) });
    },
    backToHub: () => {
      runGen++;
      sfx("ui");
      set({
        screen: get().foundationCompleted && get().progression?.operations?.["broken-signal"] ? "war-table" : "hub",
        battle: emptyBattle(),
        banner: null,
        ticker: null,
        busy: false,
        floats: [],
        queue: [],
        identity: identityCache(resolvePlayerIdentity()),
        selectedMissionId: null,
        missionFirstClear: null,
        selectedSquadIds: [],
      });
    },
    deploy: () => {
      const g = ++runGen;
      const persisted = get();
      if (persisted.onboardingEnabled && persisted.progression) {
        if (persisted.progressionStatus !== "ready") return;
        if (persisted.foundationCompleted) {
          const mission = getMissionDef(persisted.selectedMissionId);
          if (!mission || !mission.executable) return;
          const squadIds = mission.objectiveType === "RECOVER" ? persisted.selectedSquadIds : undefined;
          const spawns = mission.objectiveType === "RECOVER" ? recoverSpawnsForSquad(squadIds || []) : mission.spawns;
          if (!spawns) {
            set({ progressionError: "Choose ALPHA + KODA or ALPHA + SHADOW before deployment." });
            return;
          }
          set({ busy: true, ticker: "Preparing operation run…", progressionError: null });
          void (async () => {
            try {
              const started = await startOperationMission(
                createFoundationRequestId("mission-start"),
                persisted.progression.revision,
                mission.missionId,
                squadIds,
              );
              if (g !== runGen) return;
              applyCanonicalProgression(started.state);
              const canonicalSpawns = mission.objectiveType === "RECOVER"
                ? recoverSpawnsForSquad(started.run.squadIds)
                : spawns;
              if (!canonicalSpawns) throw new FoundationProgressionError("invalid_progression_response");
              beginBattle(g, started.run.runId, canonicalSpawns, mission.objectiveType === "RECOVER" ? mission.terminal : undefined);
            } catch (error) {
              if (g !== runGen) return;
              const reason = error instanceof FoundationProgressionError ? error.code : "progression_request_failed";
              const canonical = error instanceof FoundationProgressionError ? error.state : null;
              if (canonical) applyCanonicalProgression(canonical);
              set({ screen: "war-table", busy: false, ticker: null, progressionError: reason, selectedMissionId: null });
            }
          })();
          return;
        }
        set({ busy: true, ticker: "Preparing Foundation run…", progressionError: null });
        void (async () => {
          try {
            const progression = await startFoundationRun(
              createFoundationRequestId("start"),
              persisted.progression.revision,
            );
            if (g !== runGen) return;
            applyCanonicalProgression(progression);
            if (progression.completed || !progression.activeRunId) {
              set({ screen: "war-table", battle: emptyBattle(), busy: false, ticker: null });
              return;
            }
            beginBattle(g, progression.activeRunId);
          } catch (error) {
            if (g !== runGen) return;
            const reason = error instanceof FoundationProgressionError ? error.code : "progression_request_failed";
            const canonical = error instanceof FoundationProgressionError ? error.state : null;
            if (canonical) applyCanonicalProgression(canonical);
            set({
              screen: "brief",
              busy: false,
              ticker: null,
              progressionError: reason,
            });
          }
        })();
        return;
      }
      const identity = identityCache(resolvePlayerIdentity());
      const { onboardingEnabled, onboardingStageId } = get();
      const spawns = resolveDeploySpawns(onboardingEnabled, onboardingStageId);
      const started = startBattle(identity, spawns);
      sfx("turn");
      set({
        screen: "battle",
        identity,
        battle: started.state,
        queue: refreshQueue(started.state),
        busy: true,
        banner: null,
        ticker: null,
        floats: [],
        attackingId: null,
        impactId: null,
        currentRunKey: `${onboardingStageId}:${g}`,
      });
      void (async () => {
        await playEvents(started.events, g);
        if (g !== runGen) return;
        const actor = activeUnit(get().battle);
        if (actor?.team === "enemy") {
          await runEnemy(g);
          return;
        }
        set({ busy: false, ticker: actor ? `${actor.name}  ·  move or act` : null });
      })();
    },
    inspectUnit: (id: string) => {
      const { battle, busy, screen } = get();
      if (busy || screen !== "battle") return;
      const unit = battle.units.find((u) => u.id === id);
      if (!unit || unit.defeated) return;
      if (battle.mode === "targeting" && battle.actionSkillId) {
        get().selectTarget(id);
        return;
      }
      sfx("select");
      set({
        battle: {
          ...battle,
          inspectId: battle.inspectId === id ? null : id,
        },
      });
    },
    selectCell: (c: number, r: number) => {
      const { battle, busy, screen } = get();
      if (busy || screen !== "battle") return;
      const occupant = battle.units.find((u) => !u.defeated && u.c === c && u.r === r);
      if (occupant) {
        get().inspectUnit(occupant.id);
        return;
      }
      if (battle.mode === "targeting") {
        set({ battle: { ...battle, mode: "selected", actionSkillId: null } });
        return;
      }
      const actor = activeUnit(battle);
      if (!actor || actor.team !== "ally" || actor.hasMoved || actor.hasActed) return;
      const res = tryMove(battle, c, r);
      if (!res.ok) return;
      sfx("move");
      set({ battle: res.state, queue: refreshQueue(res.state), ticker: `${actor.name}  ·  repositions` });
    },
    selectSkill: (skillId: string) => {
      const { battle, busy } = get();
      if (busy) return;
      const actor = activeUnit(battle);
      if (!actor || actor.team !== "ally" || actor.hasActed || actor.defeated) return;
      if (!actor.skillIds.includes(skillId)) return;
      const skill = getSkill(skillId);
      if ((actor.cooldowns[skillId] ?? 0) > 0) return;
      if (battle.mode === "targeting" && battle.actionSkillId === skillId) {
        set({ battle: { ...battle, mode: "selected", actionSkillId: null } });
        return;
      }
      sfx("select");
      if (!skillNeedsTargetPick(skill)) {
        const g = ++runGen;
        set({ busy: true, attackingId: actor.id });
        const res = trySkill(battle, skillId);
        if (!res.ok) {
          set({ busy: false, attackingId: null, ticker: `${actor.name}  ·  no target in range` });
          return;
        }
        set({ battle: res.state, queue: refreshQueue(res.state) });
        void (async () => {
          await playEvents(res.events, g);
          set({ attackingId: null });
          await afterPlayerAction(g);
        })();
        return;
      }
      const targets = validTargetIds(battle.units, actor, skill);
      set({
        battle: { ...battle, mode: "targeting", actionSkillId: skillId, inspectId: null },
        ticker:
          targets.length === 0
            ? skill.maxRange <= 1
              ? `${actor.name}  ·  melee — move adjacent`
              : `${actor.name}  ·  no target in range`
            : skill.desc,
      });
    },
    selectTarget: (id: string) => {
      const { battle, busy } = get();
      if (busy || battle.mode !== "targeting" || !battle.actionSkillId) return;
      const actor = activeUnit(battle);
      if (!actor || actor.hasActed) return;
      const g = ++runGen;
      set({ busy: true, attackingId: actor.id });
      const res = trySkill(battle, battle.actionSkillId, id);
      if (!res.ok) {
        set({ busy: false, attackingId: null });
        return;
      }
      set({ battle: res.state, queue: refreshQueue(res.state) });
      void (async () => {
        await playEvents(res.events, g);
        set({ attackingId: null });
        await afterPlayerAction(g);
      })();
    },
    selectRecover: () => {
      const { battle, busy } = get();
      if (busy) return;
      const actor = activeUnit(battle);
      if (!actor || actor.team !== "ally" || actor.hasActed || actor.defeated) return;
      const res = tryRecover(battle);
      if (!res.ok) {
        set({ ticker: `${actor.name}  ·  move adjacent to the relay terminal` });
        return;
      }
      const g = ++runGen;
      set({ busy: true, battle: res.state, queue: refreshQueue(res.state), ticker: "SIGNAL RECOVERED" });
      void (async () => {
        await playEvents(res.events, g);
        await afterPlayerAction(g);
      })();
    },
    selectRecoverTeammate: (unitId) => {
      const current = get();
      if (current.selectedMissionId !== "broken-signal-recover") return;
      set({ selectedSquadIds: ["alpha", unitId], progressionError: null });
    },
    skipTurn: () => {
      const { battle, busy } = get();
      if (busy) return;
      const actor = activeUnit(battle);
      if (!actor || actor.team !== "ally" || actor.hasActed) return;
      const g = ++runGen;
      const res = trySkip(battle);
      if (!res.ok) return;
      set({ battle: res.state, busy: true, ticker: res.events[0]?.text ?? null });
      void afterPlayerAction(g);
    },
    cancel: () => {
      const { battle, busy } = get();
      if (busy) return;
      if (battle.mode === "targeting") {
        set({ battle: { ...battle, mode: "selected", actionSkillId: null } });
        return;
      }
      set({ battle: { ...battle, inspectId: null } });
    },
    replay: () => {
      get().deploy();
    },
    continueOnboarding: () => {
      const s = get();
      if (s.screen !== "results") return;
      if (s.battle.outcome !== "victory") return;
      if (s.foundationCompleted && s.selectedMissionId) {
        if (s.progressionCommitPending || !s.currentRunKey || !s.progression) return;
        const requestId = s.continueRequestId || createFoundationRequestId("mission-continue");
        set({ progressionCommitPending: true, progressionError: null, continueRequestId: requestId });
        void (async () => {
          try {
            const committed = await continueOperationMission(requestId, s.progression.revision, s.currentRunKey as string);
            applyCanonicalProgression(committed.state);
            runGen++;
            sfx("ui");
            set({
              screen: "war-table",
              battle: emptyBattle(),
              banner: null,
              ticker: null,
              busy: false,
              floats: [],
              queue: [],
              currentRunKey: null,
              continueRequestId: null,
              missionFirstClear: committed.firstClear,
              selectedMissionId: null,
              selectedSquadIds: [],
            });
          } catch (error) {
            const reason = error instanceof FoundationProgressionError ? error.code : "progression_request_failed";
            const canonical = error instanceof FoundationProgressionError ? error.state : null;
            if (canonical) applyCanonicalProgression(canonical);
            set({ progressionCommitPending: false, progressionError: reason });
          }
        })();
        return;
      }
      if (!s.onboardingEnabled) {
        get().backToHub();
        return;
      }
      if (s.progression) {
        if (s.progressionCommitPending || !s.currentRunKey) return;
        const requestId = s.continueRequestId || createFoundationRequestId("continue");
        set({
          progressionCommitPending: true,
          progressionError: null,
          continueRequestId: requestId,
        });
        void (async () => {
          try {
            const progression = await continueFoundationRun(
              requestId,
              s.progression.revision,
              s.currentRunKey as string,
            );
            applyCanonicalProgression(progression);
            runGen++;
            sfx("ui");
            if (progression.completed) {
              set({
                screen: "war-table",
                battle: emptyBattle(),
                banner: null,
                ticker: null,
                busy: false,
                floats: [],
                queue: [],
                currentRunKey: null,
                continueRequestId: null,
              });
              return;
            }
            set({
              screen: "brief",
              battle: emptyBattle(),
              banner: null,
              ticker: null,
              busy: false,
              floats: [],
              queue: [],
              currentRunKey: null,
              continueRequestId: null,
              identity: identityCache(resolvePlayerIdentity()),
            });
          } catch (error) {
            const reason = error instanceof FoundationProgressionError ? error.code : "progression_request_failed";
            const canonical = error instanceof FoundationProgressionError ? error.state : null;
            if (canonical) {
              applyCanonicalProgression(canonical);
              if (canonical.completed) {
                set({ screen: "war-table", battle: emptyBattle(), currentRunKey: null, continueRequestId: null });
              } else if (canonical.foundationStage !== s.onboardingStageId) {
                set({ screen: "brief", battle: emptyBattle(), currentRunKey: null, continueRequestId: null });
              }
            }
            set({
              progressionCommitPending: false,
              progressionError: reason,
            });
          }
        })();
        return;
      }
      const current = getOnboardingEncounter(s.onboardingStageId);
      const key = s.currentRunKey;
      if (key && s.lastVictoryKey !== key) {
        const completed = { ...s.onboardingCompleted, [current.id]: true as const };
        const nextId = current.next;
        set({
          onboardingCompleted: completed,
          lastVictoryKey: key,
          onboardingStageId: nextId ?? current.id,
        });
        if (!nextId) {
          get().backToHub();
          return;
        }
      } else if (!current.next) {
        get().backToHub();
        return;
      }
      runGen++;
      sfx("ui");
      set({
        screen: "brief",
        battle: emptyBattle(),
        banner: null,
        ticker: null,
        busy: false,
        floats: [],
        queue: [],
        identity: identityCache(resolvePlayerIdentity()),
      });
    },
    dismissSector: () => {
      sfx("ui");
      set({ screen: "results" });
    },
    toggleMute: () => {
      const next = !get().muted;
      persistMute(next);
      set({ muted: next });
    },
  };
});

export function snapshotState() {
  const s = useBattleStore.getState();
  const b = s.battle;
  const actor = activeUnit(b);
  const idn = s.identity;
  return {
    version: TACTICAL_VERSION,
    screen: s.screen,
    turn: b.round,
    phase: actor?.team === "enemy" ? "enemy" : "player",
    mode: b.mode,
    selectedId: b.activeId,
    busy: s.busy,
    units: b.units.map((u) => ({
      id: u.id,
      name: u.name,
      side: u.team,
      hp: u.hp,
      maxHp: u.maxHp,
      atk: u.atk,
      def: u.def,
      spd: u.spd,
      move: u.move,
      c: u.c,
      r: u.r,
      hasMoved: u.hasMoved,
      hasActed: u.hasActed,
      guarding: u.statuses.some((st) => st.type === "GUARD"),
      defeated: u.defeated,
      strikeRange: a1Range(u),
      statuses: u.statuses,
      cooldowns: u.cooldowns,
    })),
    results: b.results,
    activeId: b.activeId,
    queue: s.queue,
    identity: {
      source: idn.source,
      live: idn.live,
      unitName: idn.unitName,
      skinKey: idn.skinKey,
      skinName: idn.skinName,
      weapon: idn.weaponLabel,
      armor: idn.armorLabel,
      summary: idn.summary,
    },
  };
}

export function moveCellsNow(): { c: number; r: number }[] {
  const { battle, busy } = useBattleStore.getState();
  if (busy || battle.mode === "targeting") return [];
  const actor = activeUnit(battle);
  if (!actor || actor.team !== "ally" || actor.hasMoved || actor.hasActed || actor.defeated) return [];
  return reachableCells(actor, battle.units);
}

export function targetIdsNow(): Set<string> {
  const { battle } = useBattleStore.getState();
  const set = new Set<string>();
  if (battle.mode !== "targeting" || !battle.actionSkillId) return set;
  const actor = activeUnit(battle);
  if (!actor) return set;
  try {
    const skill = getSkill(battle.actionSkillId);
    for (const id of validTargetIds(battle.units, actor, skill)) set.add(id);
  } catch {
    /* ignore */
  }
  return set;
}

export function hudSkills() {
  const { battle } = useBattleStore.getState();
  const actor = activeUnit(battle);
  if (!actor) return [];
  return availableSkills(battle, actor);
}

if (typeof window !== "undefined") {
  (window as unknown as { __tactical?: unknown }).__tactical = useBattleStore;
}

export { availableSkills };
