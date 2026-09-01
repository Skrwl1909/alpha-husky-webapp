import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";
import { TacticalApp } from "../ui/App";
import { TACTICAL_CSS } from "../styles";
import { setHost } from "./bridge";
import { snapshotState, useBattleStore } from "../store/battleStore";
import * as Combat from "../combat";
import { resolveTacticalLayout } from "../layout";
import { VERSION } from "../version";

export { VERSION };

const ROOT_ID = "tacticalOpsRoot";
const STYLE_ID = "tacticalOpsStyles";
const FONT_ID = "tacticalOpsFonts";

interface Runtime {
  apiPost: ((...args: unknown[]) => unknown) | null;
  tg: { expand?: () => void; viewportHeight?: number; viewportStableHeight?: number } | null;
  dbg: boolean;
  root: HTMLElement | null;
  isOpen: boolean;
  reactRoot: Root | null;
  keyHandlerBound: boolean;
  resizeBound: boolean;
  prevBodyOverflow: string;
  prevHtmlOverflow: string;
  resizeObserver: ResizeObserver | null;
  battleWatcher: MutationObserver | null;
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
  resizeObserver: null,
  battleWatcher: null,
};

let progressionReady: Promise<void> = Promise.resolve();

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

/** Pixel-box the overlay from visualViewport so Telegram Mini App chrome cannot collapse 100%/100dvh. */
function applyHostGeometry(): void {
  const el = M.root || document.getElementById(ROOT_ID);
  if (!el) return;
  const vv = window.visualViewport;
  const tgH = M.tg?.viewportStableHeight || M.tg?.viewportHeight;
  const w = Math.max(1, Math.round(vv?.width || el.clientWidth || window.innerWidth));
  const h = Math.max(
    1,
    Math.round(vv?.height || (typeof tgH === "number" ? tgH : 0) || window.innerHeight),
  );
  const top = Math.round(vv?.offsetTop || 0);
  const left = Math.round(vv?.offsetLeft || 0);
  el.style.position = "fixed";
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.style.right = "auto";
  el.style.bottom = "auto";
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.maxHeight = `${h}px`;
  el.style.setProperty("--tops-w", `${w}px`);
  el.style.setProperty("--tops-h", `${h}px`);
  el.setAttribute("data-layout", resolveTacticalLayout(w, h));
  ensureBattlefieldGeometry(el, w, h);
}

/**
 * Compact field children are position:absolute, so a 0-height .t-field-wrap
 * hides the entire board while header/actions still paint. Lock leftover
 * pixels onto the wrap after HUD chrome is measured.
 */
function ensureBattlefieldGeometry(root: HTMLElement, hostW: number, hostH: number): void {
  const wrap = root.querySelector(".t-field-wrap") as HTMLElement | null;
  if (!wrap) return;
  const layout = root.getAttribute("data-layout") || resolveTacticalLayout(hostW, hostH);
  const measure = (sel: string) => {
    const n = root.querySelector(sel) as HTMLElement | null;
    return n ? Math.round(n.getBoundingClientRect().height) : 0;
  };
  const chrome = measure(".t-top") + measure(".t-order-wrap") + measure(".t-status") + measure(".t-dock");
  const available =
    layout === "wide" ? Math.max(160, hostH) : Math.max(160, hostH - chrome);
  root.style.setProperty("--tops-field-h", `${available}px`);
  wrap.style.display = "block";
  wrap.style.width = "100%";
  wrap.style.minWidth = "0";
  wrap.style.overflow = "hidden";
  if (layout === "wide") {
    wrap.style.position = "absolute";
    wrap.style.inset = "0";
    wrap.style.height = "100%";
    wrap.style.minHeight = "100%";
    wrap.style.maxHeight = "none";
  } else {
    wrap.style.position = "relative";
    wrap.style.inset = "auto";
    wrap.style.flex = "1 1 auto";
    wrap.style.height = `${available}px`;
    wrap.style.minHeight = `${available}px`;
    wrap.style.maxHeight = `${available}px`;
  }
  const field = root.querySelector(".t-field") as HTMLElement | null;
  if (field) {
    field.style.position = "absolute";
    field.style.inset = "0";
    field.style.width = "100%";
    field.style.height = "100%";
  }
  const art = root.querySelector(".t-field-art") as HTMLElement | null;
  if (art) {
    art.style.position = "absolute";
    art.style.inset = "0";
    art.style.width = "100%";
    art.style.height = "100%";
    art.style.objectFit = "cover";
    art.style.display = "block";
  }
}

function onResize(): void {
  applyHostGeometry();
}

function bindResize(): void {
  if (M.resizeBound) return;
  window.addEventListener("resize", onResize);
  try {
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);
  } catch {
    /* ignore */
  }
  try {
    M.resizeObserver = new ResizeObserver(onResize);
    M.resizeObserver.observe(document.documentElement);
    if (M.root) M.resizeObserver.observe(M.root);
  } catch {
    M.resizeObserver = null;
  }
  bindBattleWatcher();
  M.resizeBound = true;
}

function bindBattleWatcher(): void {
  if (!M.root || M.battleWatcher) return;
  try {
    M.battleWatcher = new MutationObserver(() => {
      requestAnimationFrame(() => applyHostGeometry());
    });
    M.battleWatcher.observe(M.root, { childList: true, subtree: true });
  } catch {
    M.battleWatcher = null;
  }
}

function unbindResize(): void {
  if (!M.resizeBound) return;
  window.removeEventListener("resize", onResize);
  try {
    window.visualViewport?.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onResize);
  } catch {
    /* ignore */
  }
  try {
    M.resizeObserver?.disconnect();
  } catch {
    /* ignore */
  }
  M.resizeObserver = null;
  try {
    M.battleWatcher?.disconnect();
  } catch {
    /* ignore */
  }
  M.battleWatcher = null;
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

function pushHostNav(): void {
  const payload = {
    close: () => {
      hardClose();
    },
    isOpen: () => M.isOpen,
  };
  const w = window as unknown as {
    AlphaNav?: { push?: (id: string, p: unknown) => void };
    navRegister?: (id: string, p: unknown) => void;
    navOpen?: (id: string) => void;
  };
  try {
    if (w.AlphaNav?.push) w.AlphaNav.push(ROOT_ID, payload);
    else {
      w.navRegister?.(ROOT_ID, payload);
      w.navOpen?.(ROOT_ID);
    }
  } catch {
    /* host nav is optional */
  }
}

export function init(deps?: {
  apiPost?: unknown;
  tg?: unknown;
  dbg?: boolean;
  onboarding?: "session" | "off";
}): typeof API {
  const t = deps && typeof deps === "object" ? deps : {};
  if (typeof t.apiPost === "function") M.apiPost = t.apiPost as Runtime["apiPost"];
  if (t.tg) M.tg = t.tg as Runtime["tg"];
  if (typeof t.dbg === "boolean") M.dbg = t.dbg;
  try {
    if (M.apiPost && typeof window !== "undefined") {
      const w = window as unknown as { apiPost?: unknown };
      if (typeof w.apiPost !== "function") w.apiPost = M.apiPost;
    }
  } catch {
    /* ignore */
  }
  if (t.onboarding === "session") {
    useBattleStore.getState().configureOnboarding({ enabled: true });
    progressionReady = Promise.resolve();
  } else if (t.onboarding === "off") {
    useBattleStore.getState().configureOnboarding({ enabled: false });
    progressionReady = Promise.resolve();
  } else {
    progressionReady = useBattleStore.getState().loadFoundationProgression();
  }
  setHost({ requestClose: closeView, dbg: M.dbg });
  return API;
}

export async function open(): Promise<void> {
  await progressionReady;
  const el = ensureRoot();
  setHost({ requestClose: closeView, dbg: M.dbg });
  M.isOpen = true;
  el.setAttribute("data-open", "1");
  lockScroll();
  bindKeys();
  bindResize();
  applyHostGeometry();
  if (!M.reactRoot) M.reactRoot = createRoot(el);
  M.reactRoot.render(createElement(TacticalApp));
  pushHostNav();
  try {
    M.tg?.expand?.();
  } catch {
    /* ignore */
  }
  requestAnimationFrame(() => applyHostGeometry());
  setTimeout(() => applyHostGeometry(), 50);
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
    /* fall through */
  }
  hardClose();
  try {
    w.navClose?.(ROOT_ID);
  } catch {
    /* ignore */
  }
}

export function getState() {
  return { ...snapshotState(), open: M.isOpen, version: VERSION };
}

export const API = { init, open, close: closeView, refresh: getState, getState };

export function attachGlobal(): typeof API {
  (window as unknown as { TacticalOps: typeof API }).TacticalOps = API;
  return API;
}
