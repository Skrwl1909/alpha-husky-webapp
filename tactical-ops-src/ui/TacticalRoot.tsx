import { useEffect, useRef } from "react";
import { TacticalApp } from "./App";
import { useTacticalLayout } from "../useTacticalLayout";
import { snapshotState } from "../store/battleStore";
import * as Combat from "../combat";
import { VERSION } from "../version";

export const TACTICAL_VERSION = VERSION;

export function TacticalRoot() {
  const ref = useRef<HTMLDivElement>(null);
  const layout = useTacticalLayout(ref);

  useEffect(() => {
    const w = window as unknown as {
      TacticalOps?: unknown;
      __AH_TACTICAL_OPS_VER__?: string;
      __TACTICAL_COMBAT__?: typeof Combat;
      __tactical?: unknown;
    };
    w.__AH_TACTICAL_OPS_VER__ = TACTICAL_VERSION;
    w.__TACTICAL_COMBAT__ = Combat;
    w.TacticalOps = {
      init: () => w.TacticalOps,
      open: () => {},
      close: () => {},
      refresh: () => snapshotState(),
      getState: () => ({ ...snapshotState(), open: true, version: TACTICAL_VERSION, layout }),
    };
  }, [layout]);

  return (
    <div id="tacticalOpsRoot" ref={ref} data-open="1" data-layout={layout}>
      <TacticalApp />
    </div>
  );
}
