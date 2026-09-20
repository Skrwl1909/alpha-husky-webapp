import type { FieldResult } from "../data/fieldOps";

/** Display receipt produced by window.FirstSessionSpine. Tactical Ops does not own FTUE storage. */
export type FirstResultReceipt = {
  runId: string;
  name: string;
  victory: boolean;
  results: {
    turns: number;
    hostilesEliminated: number;
    squadStanding: number;
    squadDeployed: number;
  };
  consequence: string;
  growth: string | null;
  fieldResult?: FieldResult | null;
  confirmed?: boolean;
};

type FirstSessionApi = {
  view: () => { result?: FirstResultReceipt | null };
  subscribe: (fn: () => void) => () => void;
  acknowledge: (runId: string) => boolean;
};

type FirstSessionSpine = {
  view: (input?: unknown) => { result?: FirstResultReceipt | null };
  subscribe: (fn: () => void) => (() => void) | void;
  acknowledge: (runId: string) => boolean;
};

function readSpine(): FirstSessionSpine | null {
  if (typeof window === "undefined") return null;
  const spine = (window as unknown as { FirstSessionSpine?: Partial<FirstSessionSpine> }).FirstSessionSpine;
  if (!spine) return null;
  if (typeof spine.view !== "function" || typeof spine.subscribe !== "function" || typeof spine.acknowledge !== "function") {
    return null;
  }
  return spine as FirstSessionSpine;
}

export function firstSession(): FirstSessionApi | null {
  const spine = readSpine();
  if (!spine) return null;
  return {
    view() {
      return { result: spine.view()?.result ?? undefined };
    },
    subscribe(fn) {
      const unsubscribe = spine.subscribe(fn);
      return typeof unsubscribe === "function" ? unsubscribe : () => undefined;
    },
    acknowledge(runId) {
      return spine.acknowledge(runId) === true;
    },
  };
}
