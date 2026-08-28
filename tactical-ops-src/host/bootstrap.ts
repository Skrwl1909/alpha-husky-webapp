import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";
import { TacticalApp } from "../ui/App";
import { TACTICAL_CSS } from "../styles";
import { setHost } from "./bridge";
import { snapshotState, useBattleStore } from "../store/battleStore";
import * as Combat from "../combat";
import { resolveTacticalLayout } from "../layout";

export const VERSION = "tactical_ops.js v2.2.1-responsive-playability";
const ROOT_ID = "tacticalOpsRoot";
const STYLE_ID = "tacticalOpsStyles";
const FONT_ID = "tacticalOpsFonts";

interface Runtime {
  apiPost: ((...args: unknown[]) => unknown) | null;
  tg: { expand?: () => void } | null;
  dbg: boolean;
  root: HTMLElement | null;
  isOpen: boolean;
  reactRoot: Root | null;
  keyHandlerBound: boolean;
  resizeBound: boolean;
  prevBodyOverflow: string;
  prevHtmlOverflow: string;
}

const M: Runtime = {
  apiPost: null,
  tg: null,
  dbg: false,
  root: null,
  isOpen: false,
  reactRoot: null,
  keyHandlerBound: false,
  resizeBound: false,
  prevBodyOverflow: "",
  prevHtmlOverflow: "",
};

try {
  (window as unknown as { __AH_TACTICAL_OPS_VER__: string }).__AH_TACTICAL_OPS_VER__ = VERSION;
  (window as unknown as { __TACTICAL_COMBAT__: typeof Combat }).__TACTICAL_COMBAT__ = Combat;
} catch {
  /* ignore */
}

function injectStyles(): void {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = TACTICAL_CSS;
}

function injectFonts(): void {
  if (document.getElementById(FONT_ID)) return;
  const el = document.createElement("link");
  el.id = FONT_ID;
  el.rel = "stylesheet";
  el.href =
    "https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Source+Sans+3:wght@400;600;700&display=swap";
  document.head.appendChild(el);
}

function stampLayout(): void {
  const el = M.root || document.getElementById(ROOT_ID);
  if (!el) return;
  const vv = window.visualViewport;
  const w = el.clientWidth || vv?.width || window.innerWidth;
  const h = el.clientHeight || vv?.height || window.innerHeight;
  el.setAttribute("data-layout", resolveTacticalLayout(w, h));
}

function onResize(): void {
  stampLayout();
}

function bindResize(): void {
  if (M.resizeBound) return;
  window.addEventListener("resize", onResize);
  try {
    window.visualViewport?.addEventListener("resize", onResize);
  } catch {
    /* ignore */
  }
  M.resizeBound = true;
}

function unbindResize(): void {
  if (!M.resizeBound) return;
  window.removeEventListener("resize", onResize);
  try {
    window.visualViewport?.removeEventListener("resize", onResize);
  } catch {
    /* ignore */
  }
  M.resizeBound = false;
}

function lockScroll(): void {
  M.prevBodyOverflow = document.body.style.overflow;
  M.prevHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

function unlockScroll(): void {
  document.body.style.overflow = M.prevBodyOverflow;
  document.documentElement.style.overflow = M.prevHtmlOverflow;
}

function onKey(e: KeyboardEvent): void {
  if (!M.isOpen || e.key !== "Escape") return;
  const t = useBattleStore.getState();
  if (t.screen === "battle" && t.battle.mode === "targeting") {
    t.cancel();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  if (t.screen === "brief") {
    t.backToHub();
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  e.preventDefault();
  e.stopPropagation();
  closeView();
}

function bindKeys(): void {
  if (M.keyHandlerBound) return;
  document.addEventListener("keydown", onKey, true);
  M.keyHandlerBound = true;
}

function unbindKeys(): void {
  if (!M.keyHandlerBound) return;
  document.removeEventListener("keydown", onKey, true);
  M.keyHandlerBound = false;
}

function ensureRoot(): HTMLElement {
  injectStyles();
  injectFonts();
  let el = document.getElementById(ROOT_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = ROOT_ID;
    el.setAttribute("data-open", "0");
    document.body.appendChild(el);
  }
  M.root = el;
  return el;
}

function hardClose(): void {
  M.isOpen = false;
  unbindKeys();
  unbindResize();
  unlockScroll();
  if (M.reactRoot) {
    M.reactRoot.unmount();
    M.reactRoot = null;
  }
  const el = M.root || document.getElementById(ROOT_ID);
  if (el) {
    el.setAttribute("data-open", "0");
    el.innerHTML = "";
  }
  try {
    useBattleStore.getState().backToHub();
  } catch {
    /* ignore */
  }
}

export function init(deps?: { apiPost?: unknown; tg?: unknown; dbg?: boolean }): typeof API {
  const t = deps && typeof deps === "object" ? deps : {};
  if (typeof t.apiPost === "function") M.apiPost = t.apiPost as Runtime["apiPost"];
  if (t.tg) M.tg = t.tg as Runtime["tg"];
  if (typeof t.dbg === "boolean") M.dbg = t.dbg;
  setHost({ requestClose: closeView, dbg: M.dbg });
  return API;
}

export async function open(): Promise<void> {
  const el = ensureRoot();
  setHost({ requestClose: closeView, dbg: M.dbg });
  M.isOpen = true;
  el.setAttribute("data-open", "1");
  lockScroll();
  bindKeys();
  bindResize();
  stampLayout();
  if (!M.reactRoot) M.reactRoot = createRoot(el);
  M.reactRoot.render(createElement(TacticalApp));
  try {
    M.tg?.expand?.();
  } catch {
    /* ignore */
  }
}

export function closeView(): void {
  if (!M.isOpen) return;
  hardClose();
}

export function getState() {
  return { ...snapshotState(), open: M.isOpen, version: VERSION };
}

export const API = { init, open, close: closeView, refresh: getState, getState };

export function attachGlobal(): typeof API {
  (window as unknown as { TacticalOps: typeof API }).TacticalOps = API;
  return API;
}
