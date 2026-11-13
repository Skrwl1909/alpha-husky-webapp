import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";
import { openPurposeBrief, TacticalApp } from "../ui/App";
import { TACTICAL_CSS } from "../styles";
import { setHost, type HostBridge } from "./bridge";
import { snapshotState, useBattleStore } from "../store/battleStore";
import * as Combat from "../combat";
import { resolveTacticalLayout } from "../layout";
import { VERSION } from "../version";
import { serviceRecord } from "../ui/serviceRecord";
import { commandPurpose } from "../ui/returnPurpose";

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
  const chrome = measure(".t-top") + measure(".t-dock");
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

const BROWSER_EXIT_ID = "tacticalOpsBrowserExit";

/** Browser Guest only: keep native Telegram / packaged APK navigation unchanged. */
function browserGuestActive(): boolean {
  const w = window as unknown as { AlphaBrowserGuestV1?: { active?: boolean } };
  return w.AlphaBrowserGuestV1?.active === true;
}

function onBrowserExit(): void {
  if (!M.isOpen || document.querySelector('.tsa-dialog[aria-modal="true"]')) return;
  const state = useBattleStore.getState();
  if (state.progressionCommitPending || state.busy || state.kodaSavePending || state.shadowSavePending) {
    window.alert("Finish the current action before leaving Tactical Ops.");
    return;
  }
  const savedResult = [state.fieldResult, state.campaignResult, state.chapterResult]
    .some(result => result?.runId === state.currentRunKey);
  if (state.screen === "results" && state.currentRunKey && !savedResult) {
    window.alert("This mission result is not yet server-recorded. Save or retry before exiting.");
    return;
  }
  if (state.screen === "battle" && !window.confirm(
    "Exit Tactical Ops? Unsaved combat actions may be lost. Your accepted run can be resumed from its saved start.",
  )) return;
  closeView();
}

/** Outside React's root: its rerenders cannot remove the host exit control. */
function showBrowserExit(): void {
  if (!browserGuestActive()) return;
  let button = document.getElementById(BROWSER_EXIT_ID) as HTMLButtonElement | null;
  if (button) return;
  button = document.createElement("button");
  button.id = BROWSER_EXIT_ID;
  button.type = "button";
  button.textContent = "× Exit";
  button.setAttribute("aria-label", "Exit Tactical Ops");
  button.title = "Return to Alpha Husky Dashboard";
  button.style.cssText = [
    "position:fixed",
    "top:calc(env(safe-area-inset-top, 0px) + 10px)",
    "right:calc(env(safe-area-inset-right, 0px) + 10px)",
    "z-index:2147483000",
    "min-height:44px",
    "min-width:76px",
    "padding:9px 13px",
    "border:1px solid #7da9c4",
    "border-radius:11px",
    "background:rgba(8,21,36,.96)",
    "color:#edf6ff",
    "font:700 14px system-ui,sans-serif",
    "cursor:pointer",
  ].join(";");
  button.addEventListener("click", onBrowserExit);
  document.body.appendChild(button);
}

function onKey(e: KeyboardEvent): void {
  if (!M.isOpen || e.key !== "Escape") return;
  // The Atlas confirmation owns Escape before the surrounding host can close.
  if (document.querySelector('.tsa-dialog[aria-modal="true"]')) return;
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

function onProfileUpdated(): void {
  if (M.isOpen) useBattleStore.getState().refreshIdentity();
}

function hardClose(): void {
  document.getElementById(BROWSER_EXIT_ID)?.remove();
  M.isOpen = false;
  unbindKeys();
  unbindResize();
  window.removeEventListener("ah:profile-updated", onProfileUpdated);
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

export async function open(missionId?: string): Promise<void> {
  await progressionReady;
  useBattleStore.getState().refreshIdentity();
  if (typeof missionId === "string" && missionId) {
    useBattleStore.getState().openOperationBrief(missionId);
  }
  const el = ensureRoot();
  const { FieldRecord: fieldRecord, Forge: forge, HomeNav: homeNav, Inventory: inventory } = window as Window & {
    FieldRecord?: { openSelf?: (options: { focusService: boolean }) => Promise<boolean> };
    Inventory?: { open?: () => Promise<unknown> };
    HomeNav?: { openInventory?: () => unknown };
    Forge?: HostBridge["forge"];
  };
  setHost({
    requestClose: closeView,
    openInventory: typeof homeNav?.openInventory === "function" || typeof inventory?.open === "function" ? () => {
      closeView();
      if (typeof homeNav?.openInventory === "function") void homeNav.openInventory();
      else void inventory?.open?.();
    } : undefined,
    openFieldRecord: fieldRecord?.openSelf ? () => {
      closeView();
      void fieldRecord.openSelf?.({ focusService: true });
    } : undefined,
    forge: typeof forge?.nextUpgrade === "function" && typeof forge.openUpgrade === "function" ? {
      nextUpgrade: () => forge.nextUpgrade(),
      openUpgrade: (key) => {
        closeView();
        forge.openUpgrade(key);
      },
    } : undefined,
    dbg: M.dbg,
  });
  M.isOpen = true;
  el.setAttribute("data-open", "1");
  lockScroll();
  bindKeys();
  bindResize();
  window.addEventListener("ah:profile-updated", onProfileUpdated);
  applyHostGeometry();
  if (!M.reactRoot) M.reactRoot = createRoot(el);
  M.reactRoot.render(createElement(TacticalApp));
  pushHostNav();
  showBrowserExit();
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

async function loadServiceRecord() {
  await progressionReady;
  const { progression, progressionStatus } = useBattleStore.getState();
  if (progressionStatus !== "ready" || !progression) throw new Error("Service record unavailable");
  return serviceRecord(progression);
}

async function openNextObjective() {
  await progressionReady;
  // A profile card may outlive the rotation or a newly accepted run.
  // Re-read canonical state before routing; never follow a stale recommendation.
  await useBattleStore.getState().loadFoundationProgression();
  const { progression, progressionStatus, progressionError } = useBattleStore.getState();
  if (progressionStatus !== "ready" || progressionError || !progression) {
    throw new Error("Current Tactical Ops objective could not be verified");
  }
  const next = commandPurpose(progression).primary;
  await open();
  if (next) openPurposeBrief(next);
}

export const API = { init, open, close: closeView, refresh: getState, getState, loadServiceRecord, openNextObjective };

export function attachGlobal(): typeof API {
  (window as unknown as { TacticalOps: typeof API }).TacticalOps = API;
  return API;
}
