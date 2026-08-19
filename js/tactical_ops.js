(function (global) {
  "use strict";

  const VERSION = "tactical_ops.js v1.0.0";
  const ROOT_ID = "tacticalOpsRoot";
  const STYLE_ID = "tacticalOpsStyles";
  const STATE_PATH = "/webapp/tactical-ops/state";
  const ACTION_PATH = "/webapp/tactical-ops/action";
  const ALLOWED_ACTIONS = ["DEPLOY", "TACTICAL_ACTION", "ACKNOWLEDGE"];
  const ALLOWED_PLANS = ["standard_plan", "safe_route", "force_breach", "deep_scan"];
  const ANIMATION_TIMEOUT_MS = 1700;
  const HYDRATION_TIMEOUT_MS = 1300;

  const PLAN_COPY = {
    standard_plan: { label: "STANDARD", tag: "BALANCED", effect: "No tactical modifier." },
    safe_route: { label: "SAFE ROUTE", tag: "CONTROL", effect: "Your first incorrect response does not cost Operation Control." },
    force_breach: { label: "FORCE BREACH", tag: "RISK", effect: "Correct STRIKE opportunities hit harder. Wrong STRIKE calls cost more Control." },
    deep_scan: { label: "DEEP SCAN", tag: "INTEL", effect: "Command guidance identifies the recommended response in the early rounds." }
  };
  const INTENT_COPY = {
    HEAVY_ASSAULT: "Incoming pressure.",
    FORTIFY: "Enemy is hardening its position.",
    EXPOSED: "An opening has appeared."
  };
  const RESULT_COPY = {
    CLEAN_VICTORY: "CLEAN VICTORY",
    VICTORY: "VICTORY",
    COSTLY_SUCCESS: "COSTLY SUCCESS",
    FAILED_OPERATION: "OPERATION FAILED"
  };

  const runtime = {
    apiPost: null,
    tg: null,
    dbg: false,
    root: null,
    isOpen: false,
    serverState: null,
    selectedPlan: "",
    busy: false,
    busyAction: "",
    statusText: "",
    syncGeneration: 0,
    mutationGeneration: 0,
    pendingMutation: null,
    stageMountedByTacticalOps: false,
    stageOperationId: "",
    stageGeneration: 0,
    animationInProgress: false,
    stateInFlight: null,
    keyHandlerBound: false
  };

  try { global.__AH_TACTICAL_OPS_VER__ = VERSION; } catch (_) {}

  function log(...args) {
    if (runtime.dbg) {
      try { console.debug("[TacticalOps]", ...args); } catch (_) {}
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function text(value, fallback) {
    const out = String(value == null ? "" : value).trim();
    return out || (fallback || "");
  }

  function asCount(value) {
    const num = Number(value);
    return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0;
  }

  function prefersReducedMotion() {
    try {
      return !!global.matchMedia && !!global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }

  function notify(message) {
    const copy = text(message);
    if (!copy) return;
    runtime.statusText = copy;
    try {
      if (typeof global.showToast === "function") { global.showToast(copy); return; }
      if (global.AlphaToast?.show) { global.AlphaToast.show({ message: copy }); return; }
    } catch (_) {}
  }

  function makeRequestId(kind) {
    const prefix = kind === "DEPLOY" ? "top_deploy_" : kind === "ACKNOWLEDGE" ? "top_ack_" : "top_round_";
    try {
      if (global.crypto?.randomUUID) return prefix + String(global.crypto.randomUUID()).replace(/-/g, "");
    } catch (_) {}
    const bytes = new Uint8Array(16);
    try {
      if (global.crypto?.getRandomValues) global.crypto.getRandomValues(bytes);
      else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    } catch (_) {
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }
    return prefix + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function getApiPost() {
    const fn = runtime.apiPost || global.apiPost || global.S?.apiPost || global.AH?.apiPost || null;
    return typeof fn === "function" ? fn : null;
  }

  function extractCode(payload) {
    if (!payload || typeof payload !== "object") return "";
    return text(payload.code || payload.reason || payload.error || payload?.details?.code);
  }

  function normalizeRoundLog(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter((row) => row && typeof row === "object").slice(0, 3).map((row) => ({
      round: asCount(row.round),
      enemyIntent: text(row.enemyIntent).toUpperCase(),
      tacticalAction: text(row.tacticalAction || row.action).toUpperCase(),
      correct: !!row.correct,
      stabilityBefore: asCount(row.stabilityBefore),
      stabilityAfter: asCount(row.stabilityAfter),
      controlBefore: asCount(row.controlBefore),
      controlAfter: asCount(row.controlAfter),
      safeRouteUsed: !!row.safeRouteUsed
    }));
  }

  function normalizeOperation(raw) {
    if (!raw || typeof raw !== "object") return null;
    const phase = text(raw.phase).toUpperCase();
    if (phase !== "FIGHTING" && phase !== "RESOLVED") return null;
    return {
      operationId: text(raw.operationId),
      operationKey: text(raw.operationKey),
      nodeId: text(raw.nodeId),
      faction: text(raw.faction),
      phase,
      selectedPlan: text(raw.selectedPlan).toLowerCase(),
      round: Math.max(1, Math.min(3, asCount(raw.round) || 1)),
      enemyIntent: text(raw.enemyIntent).toUpperCase() || null,
      enemyStability: Math.max(0, Math.min(3, asCount(raw.enemyStability))),
      operationControl: Math.max(0, Math.min(3, asCount(raw.operationControl))),
      safeRouteUsed: !!raw.safeRouteUsed,
      roundLog: normalizeRoundLog(raw.roundLog),
      result: text(raw.result) || null,
      createdAt: asCount(raw.createdAt) || null,
      resolvedAt: asCount(raw.resolvedAt) || null,
      recommendedAction: text(raw.recommendedAction).toUpperCase() || null,
      consequence: {
        status: text(raw?.consequence?.status || "NOT_APPLIED") || "NOT_APPLIED"
      }
    };
  }

  function normalizePublicState(raw) {
    const root = raw && typeof raw === "object" ? (raw.data && typeof raw.data === "object" ? raw.data : raw) : {};
    const eligibility = root.eligibility && typeof root.eligibility === "object" ? root.eligibility : {};
    const daily = root.daily && typeof root.daily === "object" ? root.daily : {};
    const operations = Array.isArray(root.operations) ? root.operations.filter((row) => row && typeof row === "object") : [];
    return {
      featureEnabled: !!root.featureEnabled,
      version: asCount(root.version),
      eligibility: {
        hasFaction: !!eligibility.hasFaction,
        warTableLevel: asCount(eligibility.warTableLevel),
        canDeploy: !!eligibility.canDeploy
      },
      daily: {
        used: asCount(daily.used),
        limit: Math.max(1, asCount(daily.limit) || 3)
      },
      operations: operations.map((row) => ({
        operationKey: text(row.operationKey),
        title: text(row.title, "Signal Suppression"),
        nodeId: text(row.nodeId),
        rounds: asCount(row.rounds) || 3,
        supportedPlans: (Array.isArray(row.supportedPlans) ? row.supportedPlans : ALLOWED_PLANS)
          .map((plan) => String(plan || "").toLowerCase())
          .filter((plan) => ALLOWED_PLANS.indexOf(plan) !== -1)
      })),
      activeOperation: normalizeOperation(root.activeOperation),
      lastOperation: normalizeOperation(root.lastOperation)
    };
  }

  function catalog() {
    const rows = runtime.serverState?.operations || [];
    return rows[0] || {
      operationKey: "edge_signal_suppression_v1",
      title: "Signal Suppression",
      nodeId: "edge_of_chain",
      rounds: 3,
      supportedPlans: ALLOWED_PLANS.slice()
    };
  }

  function viewMode() {
    const active = runtime.serverState?.activeOperation;
    if (active?.phase === "FIGHTING") return "BATTLE";
    if (active?.phase === "RESOLVED") return "RESULT";
    if (runtime.serverState && runtime.serverState.featureEnabled === false) return "UNAVAILABLE";
    if (!runtime.serverState) return "LOADING";
    return "BRIEFING";
  }

  function settle(promise, timeoutMs) {
    if (!promise || typeof promise.then !== "function") return Promise.resolve(false);
    let timer = null;
    return Promise.race([
      Promise.resolve(promise).catch(() => false),
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(false), Math.max(100, Number(timeoutMs) || 1200));
      })
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{position:fixed;inset:0;z-index:1500;pointer-events:none;}
#${ROOT_ID}[data-open="1"]{pointer-events:auto;}
.tops-overlay{position:absolute;inset:0;opacity:0;transition:opacity .16s ease;}
#${ROOT_ID}[data-open="1"] .tops-overlay{opacity:1;}
.tops-backdrop{position:absolute;inset:0;border:0;background:rgba(2,5,9,.84);}
.tops-shell{position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:center;padding:14px 12px calc(18px + env(safe-area-inset-bottom,0px));overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}
.tops-panel{position:relative;width:min(100%,520px);margin:0 auto;padding:16px 14px 18px;border:1px solid rgba(123,183,206,.22);border-radius:18px;background:linear-gradient(180deg,#0b1219 0%,#070b10 62%,#05080c 100%);box-shadow:0 24px 70px rgba(0,0,0,.55);color:#d7e6ee;}
.tops-kicker{margin:0 0 4px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7bb7ce;}
.tops-title{margin:0 0 8px;font-size:26px;line-height:1.05;letter-spacing:.04em;text-transform:uppercase;}
.tops-copy{margin:0 0 12px;font-size:14px;line-height:1.45;color:#b7c8d2;}
.tops-note{margin:8px 0 0;font-size:12px;line-height:1.4;color:#8ea3af;}
.tops-status{min-height:18px;margin:0 0 10px;font-size:12px;color:#9ec3ce;}
.tops-block{margin:0 0 14px;padding:12px;border:1px solid rgba(123,183,206,.16);border-radius:12px;background:rgba(8,14,20,.72);}
.tops-block h3{margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8ec5d6;}
.tops-row{display:flex;justify-content:space-between;gap:10px;margin:4px 0;font-size:13px;}
.tops-plans{display:grid;gap:8px;}
.tops-plan{display:block;width:100%;text-align:left;padding:10px 11px;border:1px solid rgba(123,183,206,.18);border-radius:10px;background:#0a1118;color:#d7e6ee;}
.tops-plan.is-selected{border-color:rgba(126,206,224,.7);box-shadow:inset 0 0 0 1px rgba(126,206,224,.28);}
.tops-plan strong{display:block;font-size:13px;letter-spacing:.08em;}
.tops-plan span{display:block;margin-top:3px;font-size:12px;color:#9db0ba;}
.tops-plan em{display:inline-block;margin-top:5px;font-style:normal;font-size:10px;letter-spacing:.14em;color:#7bb7ce;}
.tops-actions{display:grid;grid-template-columns:1fr;gap:8px;}
.tops-actions--triple{grid-template-columns:1fr 1fr 1fr;}
.tops-btn{min-height:48px;padding:12px 14px;border:1px solid rgba(123,183,206,.24);border-radius:12px;background:#101920;color:#e8f4f8;font-size:13px;letter-spacing:.08em;text-transform:uppercase;}
.tops-btn--primary{background:linear-gradient(180deg,#1a3a46,#10242c);border-color:rgba(126,206,224,.45);}
.tops-btn[disabled]{opacity:.45;}
.tops-intent{margin:0;font-size:28px;line-height:1;letter-spacing:.06em;text-transform:uppercase;color:#f0d08a;}
.tops-meters{display:grid;gap:8px;}
.tops-meter{display:flex;justify-content:space-between;align-items:center;gap:10px;}
.tops-dots{letter-spacing:.18em;color:#7bb7ce;font-size:16px;}
.tops-scan{margin:0 0 10px;padding:8px 10px;border:1px solid rgba(240,208,138,.28);border-radius:10px;color:#f0d08a;font-size:12px;letter-spacing:.08em;text-transform:uppercase;}
.tops-recap{display:grid;gap:6px;font-size:13px;font-family:ui-monospace,Consolas,monospace;}
.tops-close{position:absolute;top:10px;right:10px;min-width:44px;min-height:44px;border:0;background:transparent;color:#9db0ba;font-size:22px;}
.tops-stage{min-height:0;}
@media (max-width:420px){
  .tops-title{font-size:22px;}
  .tops-intent{font-size:22px;}
  .tops-actions--triple{grid-template-columns:1fr;}
}
@media (prefers-reduced-motion: reduce){
  .tops-overlay{transition:none;}
}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    ensureStyles();
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.setAttribute("data-open", "0");
      document.body.appendChild(root);
      root.addEventListener("click", onRootClick);
    }
    if (!runtime.keyHandlerBound) {
      document.addEventListener("keydown", onKeyDown, true);
      runtime.keyHandlerBound = true;
    }
    runtime.root = root;
    return root;
  }

  function meterDots(value) {
    const filled = Math.max(0, Math.min(3, asCount(value)));
    return `${"●".repeat(filled)}${"○".repeat(3 - filled)}` || "○○○";
  }

  function planMeta(key) {
    return PLAN_COPY[key] || { label: text(key, "PLAN").toUpperCase(), tag: "", effect: "" };
  }

  function intentLine(intent) {
    return INTENT_COPY[text(intent).toUpperCase()] || "Hostile posture shifting.";
  }

  function resultLabel(result) {
    return RESULT_COPY[text(result).toUpperCase()] || text(result, "OPERATION COMPLETE").replace(/_/g, " ");
  }

  function feedbackFromEntry(entry) {
    if (!entry) return "";
    const stabilityDrop = asCount(entry.stabilityBefore) - asCount(entry.stabilityAfter);
    const controlHeld = asCount(entry.controlAfter) === asCount(entry.controlBefore);
    if (entry.correct && stabilityDrop > 1) return "BREACH EFFECTIVE";
    if (entry.correct) return "COUNTER SUCCESSFUL";
    if (controlHeld) return "CONTROL HELD";
    return "PRESSURE TAKEN";
  }

  function renderHeader(kicker, title, closeable) {
    return `
      ${closeable ? `<button type="button" class="tops-close" data-tops-action="close" aria-label="Close">×</button>` : ""}
      <p class="tops-kicker">${escapeHtml(kicker)}</p>
      <h1 class="tops-title">${escapeHtml(title)}</h1>
      <p class="tops-status" aria-live="polite">${escapeHtml(runtime.statusText)}</p>
    `;
  }

  function renderLoading() {
    return `
      ${renderHeader("TACTICAL OPS", "COMMAND LINK", true)}
      <p class="tops-copy">Establishing command link.</p>
    `;
  }

  function renderUnavailable() {
    const active = runtime.serverState?.activeOperation;
    if (active) {
      return `
        ${renderHeader("TACTICAL OPS", "COMMAND LINK OFFLINE", true)}
        <p class="tops-copy">Operation state preserved.</p>
        <div class="tops-block">
          <h3>${escapeHtml(active.phase)}</h3>
          <p class="tops-copy">${escapeHtml(active.operationKey || "Signal Suppression")}</p>
        </div>
      `;
    }
    return `
      ${renderHeader("TACTICAL OPS", "COMMAND LINK UNAVAILABLE", true)}
      <p class="tops-copy">The field network is offline.</p>
    `;
  }

  function renderBriefing() {
    const state = runtime.serverState || {};
    const op = catalog();
    const daily = state.daily || { used: 0, limit: 3 };
    const eligibility = state.eligibility || {};
    const plans = (op.supportedPlans || ALLOWED_PLANS).filter((plan) => plan !== "secure_cache");
    const canDeploy = !!eligibility.canDeploy && !!runtime.selectedPlan && !runtime.busy;
    let lockNote = "Select a plan to deploy.";
    if (!eligibility.hasFaction) lockNote = "A faction is required before deployment.";
    else if (asCount(eligibility.warTableLevel) < 1) lockNote = "War Table Level 1 required.";
    else if (daily.used >= daily.limit) lockNote = "Daily operations used.";
    else if (!runtime.selectedPlan) lockNote = "Select a plan to deploy.";
    const planCards = plans.map((plan) => {
      const meta = planMeta(plan);
      const selected = runtime.selectedPlan === plan ? " is-selected" : "";
      return `
        <button type="button" class="tops-plan${selected}" data-tops-action="select-plan" data-plan="${escapeHtml(plan)}" ${runtime.busy ? "disabled" : ""}>
          <strong>${escapeHtml(meta.label)}</strong>
          <em>${escapeHtml(meta.tag)}</em>
          <span>${escapeHtml(meta.effect)}</span>
        </button>
      `;
    }).join("");
    return `
      ${renderHeader("TACTICAL OPS // EDGE OF THE CHAIN", op.title || "SIGNAL SUPPRESSION", true)}
      <p class="tops-copy">Hostile signal activity detected. Break its tactical hold in three rounds.</p>
      <section class="tops-block">
        <h3>How it works</h3>
        <p class="tops-copy">Read the enemy intent. Choose your response. Break Stability before Control collapses.</p>
        <div class="tops-row"><span>STABILITY</span><span>Break it to collapse the hostile position.</span></div>
        <div class="tops-row"><span>CONTROL</span><span>Lose it and the operation fails.</span></div>
      </section>
      <section class="tops-block">
        <h3>Daily ops</h3>
        <p class="tops-copy">${escapeHtml(String(daily.used))} / ${escapeHtml(String(daily.limit))}</p>
        <p class="tops-note">Deploying commits 1 daily operation. Active operations can be resumed later.</p>
      </section>
      <section class="tops-block">
        <h3>Select plan</h3>
        <div class="tops-plans">${planCards}</div>
      </section>
      <div class="tops-actions">
        <button type="button" class="tops-btn tops-btn--primary" data-tops-action="deploy" ${canDeploy ? "" : "disabled"}>DEPLOY</button>
      </div>
      <p class="tops-note">${escapeHtml(lockNote)}</p>
    `;
  }

  function renderBattle() {
    const op = runtime.serverState?.activeOperation;
    if (!op) return renderLoading();
    const plan = planMeta(op.selectedPlan);
    const rec = op.recommendedAction;
    const latest = op.roundLog[op.roundLog.length - 1] || null;
    const feedback = runtime.animationInProgress ? feedbackFromEntry(latest) : "";
    return `
      ${renderHeader("TACTICAL OPS", `ROUND ${op.round} / 3`, true)}
      <p class="tops-copy">${escapeHtml((catalog().title || "SIGNAL SUPPRESSION").toUpperCase())} · ${escapeHtml(plan.label)}</p>
      <div id="tacticalOpsCombatStage" class="tops-stage ah-elite-stage-host" data-operation-id="${escapeHtml(op.operationId)}" aria-label="Tactical combat scene"></div>
      ${rec ? `<p class="tops-scan">DEEP SCAN · ${escapeHtml(rec)} RECOMMENDED</p>` : ""}
      <section class="tops-block">
        <h3>Enemy intent</h3>
        <p class="tops-intent">${escapeHtml(op.enemyIntent || "UNKNOWN")}</p>
        <p class="tops-copy">${escapeHtml(intentLine(op.enemyIntent))}</p>
      </section>
      <section class="tops-block tops-meters">
        <div class="tops-meter"><span>ENEMY STABILITY</span><span class="tops-dots">${meterDots(op.enemyStability)}</span></div>
        <div class="tops-meter"><span>OPERATION CONTROL</span><span class="tops-dots">${meterDots(op.operationControl)}</span></div>
      </section>
      ${feedback ? `<p class="tops-scan">${escapeHtml(feedback)}</p>` : ""}
      <div class="tops-actions tops-actions--triple">
        <button type="button" class="tops-btn" data-tops-action="tactical" data-tactical-action="STRIKE" ${runtime.busy ? "disabled" : ""}>STRIKE</button>
        <button type="button" class="tops-btn" data-tops-action="tactical" data-tactical-action="GUARD" ${runtime.busy ? "disabled" : ""}>GUARD</button>
        <button type="button" class="tops-btn" data-tops-action="tactical" data-tactical-action="EXPLOIT" ${runtime.busy ? "disabled" : ""}>EXPLOIT</button>
      </div>
    `;
  }

  function renderResult() {
    const op = runtime.serverState?.activeOperation;
    if (!op) return renderLoading();
    const recap = (op.roundLog || []).map((row) => {
      const mark = row.correct ? "✓" : "—";
      return `<div>R${escapeHtml(String(row.round))}  ${escapeHtml(row.enemyIntent || "—")}   ${escapeHtml(row.tacticalAction || "—")}   ${mark}</div>`;
    }).join("");
    const debug = runtime.dbg
      ? `<p class="tops-note">DBG // CONSEQUENCE: ${escapeHtml(op.consequence?.status || "NOT_APPLIED")}</p>`
      : "";
    return `
      ${renderHeader("OPERATION COMPLETE", resultLabel(op.result), true)}
      <section class="tops-block tops-meters">
        <div class="tops-meter"><span>FINAL STABILITY</span><span class="tops-dots">${meterDots(op.enemyStability)}</span></div>
        <div class="tops-meter"><span>FINAL CONTROL</span><span class="tops-dots">${meterDots(op.operationControl)}</span></div>
      </section>
      <section class="tops-block">
        <h3>Tactical record</h3>
        <div class="tops-recap">${recap || "<div>No rounds recorded.</div>"}</div>
      </section>
      <div class="tops-actions">
        <button type="button" class="tops-btn tops-btn--primary" data-tops-action="acknowledge" ${runtime.busy ? "disabled" : ""}>RETURN TO WAR TABLE</button>
      </div>
      <p class="tops-note">Closing without returning keeps this result waiting.</p>
      ${debug}
    `;
  }

  function renderRetry() {
    if (!runtime.pendingMutation || runtime.busy) return "";
    return `
      <div class="tops-actions" style="margin-top:10px">
        <button type="button" class="tops-btn" data-tops-action="retry">RETRY LAST COMMAND</button>
      </div>
    `;
  }

  function panelHtml() {
    const mode = viewMode();
    let body = renderBriefing();
    if (mode === "LOADING") body = renderLoading();
    else if (mode === "UNAVAILABLE") body = renderUnavailable();
    else if (mode === "BATTLE") body = renderBattle();
    else if (mode === "RESULT") body = renderResult();
    return body + renderRetry();
  }

  function render() {
    const root = ensureRoot();
    if (!root) return;
    root.setAttribute("data-open", runtime.isOpen ? "1" : "0");
    if (!runtime.isOpen) {
      root.innerHTML = "";
      return;
    }
    root.innerHTML = `
      <div class="tops-overlay">
        <button type="button" class="tops-backdrop" data-tops-action="close" aria-label="Close Tactical Ops"></button>
        <div class="tops-shell">
          <section class="tops-panel" role="dialog" aria-modal="true">${panelHtml()}</section>
        </div>
      </div>
    `;
    if (viewMode() === "BATTLE") void hydrateStage();
    else invalidateStage("not_fighting");
  }

  function stageConfig(op) {
    return {
      operationId: text(op.operationId),
      round: asCount(op.round) || 1,
      roundCount: 3,
      planLabel: planMeta(op.selectedPlan).label,
      player: { displayName: "ALPHA CELL" },
      enemy: { displayName: "HOSTILE SIGNAL" },
      enemyIntent: text(op.enemyIntent, "SIGNAL_SHIFT"),
      enemyStability: asCount(op.enemyStability),
      operationControl: asCount(op.operationControl),
      reducedMotion: prefersReducedMotion()
    };
  }

  function invalidateStage(reason) {
    runtime.stageGeneration += 1;
    if (!runtime.stageMountedByTacticalOps) return;
    runtime.stageMountedByTacticalOps = false;
    runtime.stageOperationId = "";
    try { global.EliteCombatStage?.destroy?.(); } catch (error) {
      log("stage destroy failed", reason, error?.message || error);
    }
  }

  async function hydrateStage() {
    const op = runtime.serverState?.activeOperation;
    if (!runtime.isOpen || op?.phase !== "FIGHTING" || !op.operationId) return false;
    const host = runtime.root?.querySelector?.("#tacticalOpsCombatStage");
    if (!host || host.getAttribute("data-operation-id") !== op.operationId) {
      invalidateStage("host_mismatch");
      return false;
    }
    const generation = ++runtime.stageGeneration;
    const operationId = op.operationId;
    try {
      const ensureLoaded = global.ensureEliteCombatStageLoaded || global.AHBootLoaders?.ensureEliteCombatStageLoaded;
      if (typeof ensureLoaded !== "function") throw new Error("stage loader missing");
      await ensureLoaded(getApiPost(), runtime.tg, runtime.dbg);
      if (
        generation !== runtime.stageGeneration
        || !runtime.isOpen
        || !host.isConnected
        || viewMode() !== "BATTLE"
        || runtime.serverState?.activeOperation?.operationId !== operationId
      ) return false;
      const mounted = await global.EliteCombatStage?.mount?.(host, stageConfig(op));
      if (generation !== runtime.stageGeneration) return false;
      runtime.stageMountedByTacticalOps = !!mounted;
      runtime.stageOperationId = mounted ? operationId : "";
      return !!mounted;
    } catch (error) {
      log("stage hydration failed; DOM battle retained", error?.message || error);
      if (generation === runtime.stageGeneration && runtime.stageMountedByTacticalOps) invalidateStage("hydrate_fail");
      return false;
    }
  }

  async function playCanonicalRound(previous, next) {
    const beforeLog = previous?.activeOperation?.roundLog || [];
    const afterOp = next?.activeOperation;
    const afterLog = afterOp?.roundLog || [];
    if (!afterOp || afterLog.length !== beforeLog.length + 1) return false;
    const latest = afterLog[afterLog.length - 1];
    if (!latest) return false;
    runtime.statusText = feedbackFromEntry(latest);
    if (prefersReducedMotion()) return false;
    if (!runtime.stageMountedByTacticalOps) {
      const hydrated = await settle(hydrateStage(), HYDRATION_TIMEOUT_MS);
      if (!hydrated) return false;
    }
    try {
      const animation = global.EliteCombatStage?.playRound?.({
        operationId: text(afterOp.operationId || previous?.activeOperation?.operationId),
        round: asCount(latest.round) || 1,
        nextRound: afterOp.phase === "RESOLVED" ? asCount(latest.round) : asCount(afterOp.round),
        action: text(latest.tacticalAction),
        enemyIntent: text(latest.enemyIntent || previous?.activeOperation?.enemyIntent),
        nextEnemyIntent: text(afterOp.enemyIntent),
        correct: !!latest.correct,
        previousEnemyStability: asCount(latest.stabilityBefore),
        enemyStability: asCount(latest.stabilityAfter),
        previousOperationControl: asCount(latest.controlBefore),
        operationControl: asCount(latest.controlAfter),
        stabilityDelta: asCount(latest.stabilityAfter) - asCount(latest.stabilityBefore),
        controlDelta: asCount(latest.controlAfter) - asCount(latest.controlBefore)
      });
      return !!(await settle(Promise.resolve(animation), ANIMATION_TIMEOUT_MS));
    } catch (error) {
      log("round animation skipped", error?.message || error);
      return false;
    }
  }

  async function fetchState() {
    const apiPost = getApiPost();
    if (!apiPost) throw new Error("apiPost missing");
    const generation = ++runtime.syncGeneration;
    const task = Promise.resolve(apiPost(STATE_PATH, {}));
    runtime.stateInFlight = task;
    try {
      const raw = await task;
      if (generation !== runtime.syncGeneration) return runtime.serverState;
      if (!raw || raw.ok === false) throw Object.assign(new Error(extractCode(raw) || "STATE_FAIL"), { data: raw });
      runtime.serverState = normalizePublicState(raw);
      return runtime.serverState;
    } finally {
      if (runtime.stateInFlight === task) runtime.stateInFlight = null;
    }
  }

  function operationAdvanced(previous, next, pending) {
    if (!pending || !next) return false;
    if (pending.action === "DEPLOY") {
      return !!(next.activeOperation && next.activeOperation.phase === "FIGHTING" && next.version > asCount(previous?.version));
    }
    if (pending.action === "TACTICAL_ACTION") {
      const before = asCount(previous?.activeOperation?.roundLog?.length);
      const after = asCount(next.activeOperation?.roundLog?.length);
      return after > before || next.activeOperation?.phase === "RESOLVED";
    }
    if (pending.action === "ACKNOWLEDGE") {
      return !next.activeOperation && asCount(next.version) > asCount(previous?.version);
    }
    return false;
  }

  async function refreshCanonical(reason) {
    log("refresh", reason);
    const previous = runtime.serverState;
    const next = await fetchState();
    if (runtime.pendingMutation && operationAdvanced(previous, next, runtime.pendingMutation)) {
      runtime.pendingMutation = null;
    }
    return next;
  }

  async function sendMutation(action, payload) {
    if (ALLOWED_ACTIONS.indexOf(action) === -1) return;
    if (runtime.busy) return;
    const apiPost = getApiPost();
    if (!apiPost) {
      notify("Command link unavailable.");
      return;
    }
    const expectedVersion = asCount(runtime.serverState?.version);
    const requestId = makeRequestId(action);
    const pending = { action, requestId, expectedVersion, payload: payload || {} };
    runtime.pendingMutation = pending;
    runtime.busy = true;
    runtime.busyAction = action;
    runtime.mutationGeneration += 1;
    const generation = runtime.mutationGeneration;
    render();
    const previous = runtime.serverState;
    try {
      const raw = await apiPost(ACTION_PATH, {
        action,
        requestId,
        expectedVersion,
        payload: pending.payload
      });
      if (generation !== runtime.mutationGeneration) return;
      if (!raw || raw.ok === false) {
        const code = extractCode(raw);
        if (code === "version_conflict" || code === "stale_round" || code === "round_already_applied") {
          notify(code === "version_conflict" ? "Command state changed. Refreshing." : code === "round_already_applied" ? "That decision is already recorded." : "That round is no longer current.");
          runtime.pendingMutation = null;
          await refreshCanonical(code);
          return;
        }
        throw Object.assign(new Error(code || "ACTION_FAILED"), { data: raw, code });
      }
      const next = normalizePublicState(raw);
      runtime.pendingMutation = null;
      if (action === "TACTICAL_ACTION") {
        runtime.animationInProgress = true;
        try {
          await playCanonicalRound(previous, next);
        } finally {
          runtime.animationInProgress = false;
        }
      }
      if (generation !== runtime.mutationGeneration) return;
      runtime.serverState = next;
      runtime.statusText = "";
      if (action === "ACKNOWLEDGE" && !next.activeOperation) {
        runtime.busy = false;
        runtime.busyAction = "";
        close();
        return;
      }
    } catch (error) {
      if (generation !== runtime.mutationGeneration) return;
      const code = text(error?.code || error?.data?.code || error?.message);
      if (code === "version_conflict" || code === "stale_round" || code === "round_already_applied") {
        notify(code === "round_already_applied" ? "That decision is already recorded." : "Refreshing command state.");
        runtime.pendingMutation = null;
        try { await refreshCanonical(code); } catch (_) {}
      } else {
        try {
          const recovered = await refreshCanonical("ambiguous_transport");
          if (!operationAdvanced(previous, recovered, pending)) {
            runtime.statusText = "Signal dropped. Retry uses the same command.";
          } else {
            runtime.pendingMutation = null;
          }
        } catch (_) {
          runtime.statusText = "Signal dropped. Retry uses the same command.";
        }
      }
    } finally {
      if (generation === runtime.mutationGeneration) {
        runtime.busy = false;
        runtime.busyAction = "";
        if (runtime.isOpen) render();
      }
    }
  }

  async function retryPending() {
    const pending = runtime.pendingMutation;
    if (!pending || runtime.busy) return;
    const apiPost = getApiPost();
    if (!apiPost) return;
    runtime.busy = true;
    runtime.busyAction = pending.action;
    render();
    const previous = runtime.serverState;
    try {
      const raw = await apiPost(ACTION_PATH, {
        action: pending.action,
        requestId: pending.requestId,
        expectedVersion: pending.expectedVersion,
        payload: pending.payload
      });
      if (!raw || raw.ok === false) {
        await refreshCanonical("retry_failed");
        return;
      }
      runtime.serverState = normalizePublicState(raw);
      runtime.pendingMutation = null;
      runtime.statusText = "";
    } catch (_) {
      try { await refreshCanonical("retry_ambiguous"); } catch (err) {
        runtime.statusText = "Signal still dropped.";
      }
      if (operationAdvanced(previous, runtime.serverState, pending)) runtime.pendingMutation = null;
    } finally {
      runtime.busy = false;
      runtime.busyAction = "";
      if (runtime.isOpen) render();
    }
  }

  function onKeyDown(event) {
    if (!runtime.isOpen) return;
    if (event.key !== "Escape") return;
    try {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    } catch (_) {}
    close();
  }

  function onRootClick(event) {
    const el = event.target.closest("[data-tops-action]");
    if (!el) return;
    const action = text(el.getAttribute("data-tops-action"));
    if (action === "close") {
      close();
      return;
    }
    if (action === "select-plan") {
      runtime.selectedPlan = text(el.getAttribute("data-plan")).toLowerCase();
      render();
      return;
    }
    if (action === "deploy") {
      const op = catalog();
      if (!runtime.selectedPlan) return;
      void sendMutation("DEPLOY", {
        operationKey: text(op.operationKey, "edge_signal_suppression_v1"),
        plan: runtime.selectedPlan
      });
      return;
    }
    if (action === "tactical") {
      const tacticalAction = text(el.getAttribute("data-tactical-action")).toUpperCase();
      const round = asCount(runtime.serverState?.activeOperation?.round);
      if (!tacticalAction || !round) return;
      void sendMutation("TACTICAL_ACTION", { round, tacticalAction });
      return;
    }
    if (action === "acknowledge") {
      void sendMutation("ACKNOWLEDGE", {});
      return;
    }
    if (action === "retry") {
      void retryPending();
    }
  }

  function pushNav() {
    const meta = {
      close: () => { closeView(); },
      isOpen: () => runtime.isOpen
    };
    try {
      if (global.AlphaNav?.push) global.AlphaNav.push(ROOT_ID, meta);
      else {
        global.navRegister?.(ROOT_ID, meta);
        global.navOpen?.(ROOT_ID);
      }
    } catch (_) {}
  }

  function closeView() {
    runtime.isOpen = false;
    runtime.animationInProgress = false;
    runtime.busy = false;
    runtime.busyAction = "";
    runtime.statusText = "";
    invalidateStage("close");
    const root = runtime.root || document.getElementById(ROOT_ID);
    if (root) {
      root.setAttribute("data-open", "0");
      root.innerHTML = "";
    }
  }

  function init(deps) {
    const next = deps && typeof deps === "object" ? deps : {};
    if (typeof next.apiPost === "function") runtime.apiPost = next.apiPost;
    if (next.tg) runtime.tg = next.tg;
    if (typeof next.dbg === "boolean") runtime.dbg = next.dbg;
    return API;
  }

  async function open() {
    ensureRoot();
    runtime.isOpen = true;
    runtime.statusText = "";
    render();
    pushNav();
    try {
      await fetchState();
      if (runtime.isOpen) render();
    } catch (error) {
      runtime.statusText = "Command link failed.";
      log("state failed", error?.message || error);
      if (runtime.isOpen) render();
    }
  }

  function close() {
    if (!runtime.isOpen) return;
    if (global.AlphaNav?.close?.(ROOT_ID, { source: "tactical-ops-close" })) return;
    closeView();
    try { global.navClose?.(ROOT_ID); } catch (_) {}
  }

  async function refresh() {
    if (!runtime.isOpen) return runtime.serverState;
    try {
      await refreshCanonical("manual");
    } catch (error) {
      runtime.statusText = "Refresh failed.";
      log("refresh failed", error?.message || error);
    }
    if (runtime.isOpen) render();
    return runtime.serverState;
  }

  function getState() {
    return runtime.serverState ? JSON.parse(JSON.stringify(runtime.serverState)) : null;
  }

  const API = { init, open, close, refresh, getState };
  global.TacticalOps = API;
})(window);
