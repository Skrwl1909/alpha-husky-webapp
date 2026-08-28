/**
 * Production IIFE entry.
 * Loaded by js/boot_loaders.js → window.TacticalOps.open().
 * Bundled into js/tactical_ops.js. Do not import from the TanStack preview tree.
 */
import { attachGlobal, API, VERSION } from "./bootstrap";
import * as Combat from "../combat";

const api = attachGlobal();

try {
  const w = window as unknown as {
    __AH_TACTICAL_OPS_VER__: string;
    __TACTICAL_COMBAT__: typeof Combat;
    TacticalOps: typeof API;
  };
  w.__AH_TACTICAL_OPS_VER__ = VERSION;
  w.__TACTICAL_COMBAT__ = Combat;
  w.TacticalOps = api;
} catch {
  /* ignore */
}

export default api;
export { API, VERSION };
export * from "../combat";
