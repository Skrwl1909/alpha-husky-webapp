import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";
import { TacticalApp } from "../ui/App";
import { TACTICAL_CSS } from "../styles";
import { setHost } from "./bridge";
import { snapshotState, TACTICAL_VERSION, useBattleStore } from "../store/battleStore";
import { hydrateEquippedState, identityCache, resolvePlayerIdentity } from "./identity";
import * as Combat from "../combat";

export const VERSION = TACTICAL_VERSION;
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
  prevBodyOverflow: "",
  prevHtmlOverflow: "",
};

try {
  (window as unknown as { __AH_TACTICAL_OPS_VER__: string }).__AH_TACTICAL_OPS_VER__ = VERSION;
  (window as unknown as { __TACTICAL_COMBAT__: typeof Combat }).__TACTICAL_COMBAT__ = Combat;
} catch {
  /* ignore */
}

function log(...args: unknown[]): void {
  if (!M.dbg) return;
  try {
    console.debug("[TacticalOps]", ...args);
  } catch {
    /* ignore */
  }
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

function exposeDebug(on: boolean): void {
  const w = window as unknown as { __tactical?: unknown };
  if (on) w.__tactical = useBattleStore;
  else if ("__tactical" in w) {
    try {
      delete w.__tactical;
    } catch {
      w.__tactical = undefined;
    }
  }
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

function navPush(): void {
  const handle = {
    close: () => {
      hardClose();
    },
    isOpen: () => M.isOpen,
  };
  const w = window as unknown as {
    AlphaNav?: { push?: (id: string, h: unknown) => void; close?: (id: string, meta?: unknown) => boolean };
    navRegister?: (id: string, h: unknown) => void;
    navOpen?: (id: string) => void;
    navClose?: (id: string) => void;
  };
  try {
    if (w.AlphaNav?.push) w.AlphaNav.push(ROOT_ID, handle);
    else {
      w.navRegister?.(ROOT_ID, handle);
      w.navOpen?.(ROOT_ID);
    }
  } catch (err) {
    log("nav push failed", err);
  }
}

function hardClose(): void {
  M.isOpen = false;
  unbindKeys();
  unlockScroll();
  exposeDebug(false);
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
  try {
    if (M.apiPost && typeof window !== "undefined") {
      (window as unknown as { apiPost?: unknown }).apiPost =
        (window as unknown as { apiPost?: unknown }).apiPost || M.apiPost;
    }
  } catch {
    /* ignore */
  }
  setHost({ requestClose: closeView, dbg: M.dbg });
  exposeDebug(M.dbg);
  log("init", { dbg: M.dbg, version: VERSION, hasApiPost: typeof M.apiPost === "function" });
  return API;
}

export async function open(): Promise<void> {
  const el = ensureRoot();
  setHost({ requestClose: closeView, dbg: M.dbg });
  identityCache(resolvePlayerIdentity());
  void hydrateEquippedState().then(() => {
    try {
      useBattleStore.getState().refreshIdentity();
    } catch {
      /* ignore */
    }
  });
  try {
    useBattleStore.getState().refreshIdentity();
  } catch {
    /* ignore */
  }
  M.isOpen = true;
  el.setAttribute("data-open", "1");
  lockScroll();
  bindKeys();
  exposeDebug(M.dbg);
  if (!M.reactRoot) M.reactRoot = createRoot(el);
  M.reactRoot.render(createElement(TacticalApp));
  navPush();
  try {
    M.tg?.expand?.();
  } catch {
    /* ignore */
  }
  log("open");
}

export function closeView(): void {
  if (!M.isOpen) return;
  const w = window as unknown as {
    AlphaNav?: { close?: (id: string, meta?: unknown) => boolean };
    navClose?: (id: string) => void;
  };
  try {
    if (w.AlphaNav?.close?.(ROOT_ID, { source: "tactical-ops-close" })) return;
  } catch {
    /* ignore */
  }
  hardClose();
  try {
    w.navClose?.(ROOT_ID);
  } catch {
    /* ignore */
  }
  log("close");
}

export async function refresh() {
  return getState();
}

export function getState() {
  return { ...snapshotState(), open: M.isOpen, version: VERSION };
}

export const API = { init, open, close: closeView, refresh, getState };

export function attachGlobal(): typeof API {
  (window as unknown as { TacticalOps: typeof API }).TacticalOps = API;
  return API;
}
