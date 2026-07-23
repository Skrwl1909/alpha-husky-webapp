(function () {
  "use strict";

  const ROOT_ID = "signalBrokerRoot";
  const STYLE_ID = "signal-broker-shell-p0-css";
  const BODY_OPEN_CLASS = "signal-broker-open";
  const RELAY7_PORTRAIT_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778846885/awakening/relay7/relay7_avatar_v1.webp";
  const VALID_STATUSES = new Set(["available", "active", "claimable", "claimed", "expired", "unavailable"]);
  const runtime = {
    initialized: false,
    open: false,
    session: 0,
    state: null,
    stateLoading: null,
    stateLoadingSession: 0,
    mutationPending: false,
    requestIds: Object.create(null),
    timerId: null,
    timerRefreshPending: false,
    serverOffsetMs: 0,
    error: "",
    scrollRestore: "",
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function asObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : null; }
  function finite(value) { const number = Number(value); return Number.isFinite(number) ? number : null; }
  function getApiPost() { return window.S?.apiPost || window.apiPost || window.AH?.apiPost || null; }
  function relayAuthorized() { return window.WorldExploration?.canOpenDeadRelay?.() === true; }
  function lockedReason() {
    if (typeof window.WorldExploration?.showDeadRelayLocked === "function") window.WorldExploration.showDeadRelayLocked();
    else (window.Telegram?.WebApp || window.tg)?.showAlert?.("Dead Relay Exchange is locked. Complete and claim Relay Fringe 01 first.");
  }
  function humanize(value) { return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
  function formatCountdown(seconds) {
    const total = Math.max(0, Math.ceil(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    return hours ? `${hours}h ${String(minutes).padStart(2, "0")}m` : `${minutes}m ${String(secs).padStart(2, "0")}s`;
  }
  function messageFor(code) {
    const messages = {
      feature_disabled: "Relay-7 contracts are currently offline.",
      relay7_locked: "Dead Relay Exchange is locked. Complete and claim Relay Fringe 01 first.",
      contract_cycle_expired: "This contract cycle has ended. Refreshing current contracts.",
      contract_not_active: "This contract is no longer available.",
      contract_not_complete: "This contract is not ready to claim yet.",
      contract_already_claimed: "This contract has already been claimed.",
      daily_credit_limit_reached: "The current cycle credit limit has been reached.",
      strict_v2_unavailable: "Relay-7 is temporarily unavailable. Please try again.",
      invalid_request: "That Relay-7 request could not be accepted.",
      unauthorized: "Telegram authorization is required.",
    };
    return messages[String(code || "")] || "Relay-7 is unavailable right now. Please refresh.";
  }
  function responseCode(error) { return error?.response?.code || error?.response?.reason || error?.data?.code || error?.data?.reason || error?.message || ""; }
  function makeRequestId(kind, contractId, cycleId) {
    const key = `${kind}:${cycleId || ""}:${contractId || ""}`;
    if (!runtime.requestIds[key]) {
      const crypto = window.crypto;
      const entropy = crypto?.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0].toString(36) : Math.random().toString(36).slice(2);
      runtime.requestIds[key] = `relay7_${kind}_${Date.now()}_${entropy}`.slice(0, 128);
    }
    return runtime.requestIds[key];
  }
  function clearRequestId(kind, contractId, cycleId) { delete runtime.requestIds[`${kind}:${cycleId || ""}:${contractId || ""}`]; }

  function normalizeState(raw) {
    const payload = asObject(raw?.state) || asObject(raw?.data?.state) || asObject(raw?.data) || asObject(raw);
    const serverNow = finite(payload?.serverNow);
    const cycleEndsAt = finite(payload?.cycleEndsAt);
    const contracts = Array.isArray(payload?.contracts) ? payload.contracts : null;
    if (!payload || payload.ok === false || !(serverNow > 0) || !(cycleEndsAt > 0) || typeof payload.cycleId !== "string" || !payload.cycleId || !contracts) return null;
    const safeContracts = contracts.map((contract) => {
      const progress = finite(contract?.progress);
      const target = finite(contract?.target);
      const status = String(contract?.status || "");
      const valid = typeof contract?.id === "string" && contract.id && typeof contract?.title === "string" && contract.title
        && typeof contract?.activityType === "string" && contract.activityType && progress != null && target != null && progress >= 0 && target > 0 && VALID_STATUSES.has(status);
      return valid ? { ...contract, progress: Math.min(progress, target), target, status } : null;
    });
    if (safeContracts.some((contract) => !contract)) return null;
    const next = asObject(payload.nextSectorRequirement);
    const daily = finite(payload.dailyCreditsEarned);
    const maximum = finite(payload.maximumDailyCredits);
    const lifetime = finite(payload.lifetimeProgressionCredits);
    if (!next || finite(next.current) == null || finite(next.required) == null || daily == null || maximum == null || lifetime == null) return null;
    return { ...payload, serverNow, cycleEndsAt, contracts: safeContracts, nextSectorRequirement: next };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{ position:fixed; inset:0; z-index:1000001; pointer-events:none; }
#${ROOT_ID}[data-open="1"]{ pointer-events:auto; }
#${ROOT_ID} .signal-broker-back{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; box-sizing:border-box; padding:max(14px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left)); background:rgba(2,6,9,.76); backdrop-filter:blur(7px); -webkit-backdrop-filter:blur(7px); opacity:0; visibility:hidden; transition:opacity .18s ease, visibility .18s ease; }
#${ROOT_ID}[data-open="1"] .signal-broker-back{ opacity:1; visibility:visible; }
#${ROOT_ID} .signal-broker-panel{ width:min(840px, 100%); max-height:calc(100dvh - max(28px, env(safe-area-inset-top) + env(safe-area-inset-bottom))); display:flex; flex-direction:column; min-height:0; overflow:hidden; position:relative; color:#dce7ec; border:1px solid rgba(124,190,201,.28); border-radius:18px; background:linear-gradient(145deg, rgba(22,34,40,.99), rgba(8,14,18,.995)); box-shadow:0 26px 72px rgba(0,0,0,.62), inset 0 1px 0 rgba(211,242,244,.07); }
#${ROOT_ID} .signal-broker-panel::before{ content:""; position:absolute; inset:0; pointer-events:none; opacity:.24; background:repeating-linear-gradient(0deg, rgba(176,229,235,.035) 0 1px, transparent 1px 5px), radial-gradient(circle at 84% 8%, rgba(66,193,210,.15), transparent 32%); }
#${ROOT_ID} .signal-broker-head, #${ROOT_ID} .signal-broker-body, #${ROOT_ID} .signal-broker-footer{ position:relative; z-index:1; }
#${ROOT_ID} .signal-broker-head{ display:flex; gap:14px; align-items:center; padding:16px 18px 14px; border-bottom:1px solid rgba(142,203,213,.17); }
#${ROOT_ID} .signal-broker-portrait{ flex:0 0 68px; width:68px; height:68px; border-radius:12px; position:relative; overflow:hidden; border:1px solid rgba(111,207,220,.34); background:linear-gradient(145deg, #17262d, #080e12); box-shadow:inset 0 0 0 4px rgba(0,0,0,.18); }
#${ROOT_ID} .signal-broker-portrait-img{ position:relative; z-index:1; display:block; width:100%; height:100%; object-fit:cover; object-position:center; }
#${ROOT_ID} .signal-broker-portrait-fallback{ position:absolute; inset:0; display:grid; place-items:center; color:#8bcfd9; font-size:16px; font-weight:900; letter-spacing:.08em; }
#${ROOT_ID} .signal-broker-title{ min-width:0; flex:1; }
#${ROOT_ID} .signal-broker-kicker, #${ROOT_ID} .signal-broker-section-label{ color:#8bcfd9; font-size:10px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; }
#${ROOT_ID} .signal-broker-location{ margin:2px 0 4px; color:#9eb1ba; font-size:12px; }
#${ROOT_ID} .signal-broker-name{ margin:0; color:#eff8fa; font-size:22px; line-height:1.05; letter-spacing:.01em; }
#${ROOT_ID} .signal-broker-status{ display:inline-flex; align-items:center; gap:7px; margin-top:7px; color:#bedde1; font-size:12px; }
#${ROOT_ID} .signal-broker-status::before{ content:""; width:7px; height:7px; border-radius:50%; background:#d89a45; box-shadow:0 0 7px rgba(222,157,65,.46); }
#${ROOT_ID} .signal-broker-close{ width:44px; min-width:44px; height:44px; border-radius:10px; border:1px solid rgba(171,213,218,.25); color:#dceef0; background:rgba(255,255,255,.045); font-size:26px; line-height:1; cursor:pointer; }
#${ROOT_ID} .signal-broker-body{ min-height:0; overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; padding:16px 18px 18px; }
#${ROOT_ID} .signal-broker-dialogue{ margin:0 0 14px; padding:13px 14px; color:#d2e0e4; line-height:1.45; font-size:13px; border-left:2px solid rgba(91,208,222,.58); background:rgba(101,184,194,.055); }
#${ROOT_ID} .signal-broker-state-zone[hidden]{ display:none !important; }
#${ROOT_ID} .signal-broker-cycle{ display:flex; flex-wrap:wrap; gap:8px 14px; margin:0 0 14px; color:#a9c3c8; font-size:12px; }
#${ROOT_ID} .signal-broker-summary{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-bottom:16px; }
#${ROOT_ID} .signal-broker-summary div{ padding:10px; border:1px solid rgba(147,192,198,.18); border-radius:10px; background:rgba(171,220,224,.045); }
#${ROOT_ID} .signal-broker-summary span{ display:block; color:#8faeb3; font-size:10px; letter-spacing:.06em; text-transform:uppercase; }
#${ROOT_ID} .signal-broker-summary b{ display:block; margin-top:4px; color:#e4f2f4; font-size:13px; }
#${ROOT_ID} .signal-broker-offers{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; }
#${ROOT_ID} .signal-broker-offer{ display:flex; min-height:145px; padding:13px; border:1px solid rgba(147,192,198,.18); border-radius:11px; background:linear-gradient(135deg, rgba(171,220,224,.055), rgba(0,0,0,.12)); flex-direction:column; }
#${ROOT_ID} .signal-broker-offer h4{ margin:0 0 7px; color:#e4f2f4; font-size:13px; letter-spacing:.035em; }
#${ROOT_ID} .signal-broker-offer p{ margin:0; color:#aebec3; font-size:12px; line-height:1.42; }
#${ROOT_ID} .signal-broker-contract-progress{ margin:12px 0 7px !important; color:#d8ecef !important; font-weight:800; }
#${ROOT_ID} .signal-broker-contract-status{ margin-top:auto !important; color:#8fcbd1 !important; font-size:10px !important; font-weight:800; letter-spacing:.09em; text-transform:uppercase; }
#${ROOT_ID} .signal-broker-action,#${ROOT_ID} .signal-broker-refresh{ margin-top:10px; min-height:36px; border:1px solid rgba(112,208,217,.42); border-radius:8px; color:#e8fbfc; background:rgba(55,142,153,.24); font:800 11px/1 system-ui,sans-serif; letter-spacing:.06em; cursor:pointer; text-transform:uppercase; }
#${ROOT_ID} .signal-broker-action.is-claim{ border-color:rgba(222,178,93,.46); background:rgba(143,103,47,.27); }
#${ROOT_ID} .signal-broker-action:disabled{ border-color:rgba(150,177,180,.16); color:#99adb0; background:rgba(255,255,255,.035); cursor:not-allowed; }
#${ROOT_ID} .signal-broker-error{ margin:0 0 13px; padding:10px 11px; border:1px solid rgba(225,136,113,.25); border-radius:9px; color:#f0b6aa; background:rgba(119,35,25,.2); font-size:12px; line-height:1.4; }
#${ROOT_ID} .signal-broker-footer{ padding:13px 18px calc(13px + env(safe-area-inset-bottom)); color:#9cb4ba; font-size:12px; line-height:1.4; border-top:1px solid rgba(142,203,213,.14); background:rgba(0,0,0,.13); }
body.${BODY_OPEN_CLASS}{ overflow:hidden !important; }
body.${BODY_OPEN_CLASS} #packComms,body.${BODY_OPEN_CLASS} #packCommsBtn,body.${BODY_OPEN_CLASS} #communityBtn,body.${BODY_OPEN_CLASS} .pack-comms,body.${BODY_OPEN_CLASS} .pack-comms-btn,body.${BODY_OPEN_CLASS} .community-btn,body.${BODY_OPEN_CLASS} [data-pack-comms]{ visibility:hidden !important; pointer-events:none !important; }
@media (max-width:640px){ #${ROOT_ID} .signal-broker-back{ align-items:stretch; padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom); } #${ROOT_ID} .signal-broker-panel{ width:100%; max-height:100%; border-radius:0; border-left:0; border-right:0; } #${ROOT_ID} .signal-broker-head{ padding:13px 14px; gap:11px; } #${ROOT_ID} .signal-broker-portrait{ flex-basis:52px; width:52px; height:52px; } #${ROOT_ID} .signal-broker-name{ font-size:19px; } #${ROOT_ID} .signal-broker-body{ padding:14px 14px 18px; } #${ROOT_ID} .signal-broker-offers{ grid-template-columns:1fr; } #${ROOT_ID} .signal-broker-offer{ min-height:auto; } #${ROOT_ID} .signal-broker-summary{ grid-template-columns:1fr; } #${ROOT_ID} .signal-broker-footer{ padding:12px 14px calc(12px + env(safe-area-inset-bottom)); } }
@media (prefers-reduced-motion:reduce){ #${ROOT_ID} *,#${ROOT_ID} *::before,#${ROOT_ID} *::after{ animation:none !important; transition:none !important; } }
`;
    document.head.appendChild(style);
  }

  function ensureRootNow() {
    ensureStyles();
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.setAttribute("data-open", "0");
      root.addEventListener("click", onRootClick);
      document.body.appendChild(root);
    }
    return root;
  }
  function ensureRoot() {
    if (!document.body) return null;
    return ensureRootNow();
  }
  function onRootClick(event) {
    const target = event.target;
    if (target?.id === "signalBrokerBack" || target?.closest?.("#signalBrokerClose")) { close(); return; }
    const action = target?.closest?.("[data-relay7-action]");
    if (!action) return;
    const kind = action.dataset.relay7Action;
    if (kind === "refresh") void refreshState({ session: runtime.session, force: true });
    if (kind === "accept") void acceptContract(action.dataset.contractId || "");
    if (kind === "claim") void claimContract(action.dataset.contractId || "");
  }

  function contractAction(contract, state) {
    const status = VALID_STATUSES.has(contract.status) ? contract.status : "unavailable";
    if (runtime.mutationPending) return '<button class="signal-broker-action" type="button" disabled>Processing</button>';
    if (status === "available") {
      if (state.feature?.enabled === true) return `<button class="signal-broker-action" type="button" data-relay7-action="accept" data-contract-id="${escapeHtml(contract.id)}">Accept</button>`;
      return '<button class="signal-broker-action" type="button" disabled>Offline</button>';
    }
    if (status === "active") return '<button class="signal-broker-action" type="button" disabled>In Progress</button>';
    if (status === "claimable") {
      if (contract.canClaim === true) return `<button class="signal-broker-action is-claim" type="button" data-relay7-action="claim" data-contract-id="${escapeHtml(contract.id)}">Claim</button>`;
      return '<button class="signal-broker-action" type="button" disabled>Unavailable</button>';
    }
    if (status === "claimed") return '<button class="signal-broker-action" type="button" disabled>Claimed</button>';
    if (status === "expired") return '<button class="signal-broker-action" type="button" disabled>Expired</button>';
    return '<button class="signal-broker-action" type="button" disabled>Unavailable</button>';
  }
  function renderContract(contract, state) {
    const status = VALID_STATUSES.has(contract.status) ? contract.status : "unavailable";
    const objective = typeof contract.description === "string" && contract.description.trim() ? contract.description.trim() : humanize(contract.activityType);
    return `<article class="signal-broker-offer" data-contract-status="${escapeHtml(status)}"><h4>${escapeHtml(contract.title)}</h4><p>${escapeHtml(objective)}</p><p class="signal-broker-contract-progress">${escapeHtml(`${contract.progress} / ${contract.target}`)}</p><p class="signal-broker-contract-status">${escapeHtml(humanize(status))}</p>${contractAction(contract, state)}</article>`;
  }
  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const state = runtime.state;
    const hasState = !!state;
    const contracts = hasState ? state.contracts.map((contract) => renderContract(contract, state)).join("") : '<article class="signal-broker-offer" aria-disabled="true"><h4>Unavailable</h4><p>Relay-7 state is not available.</p></article>';
    const seconds = hasState ? Math.max(0, Math.ceil((state.cycleEndsAt * 1000 - (Date.now() + runtime.serverOffsetMs)) / 1000)) : 0;
    const cycle = hasState ? `<div class="signal-broker-cycle"><span>UTC cycle ${escapeHtml(state.cycleId)}</span><span>Reset in <b>${escapeHtml(formatCountdown(seconds))}</b></span></div>` : "";
    const next = hasState ? state.nextSectorRequirement : null;
    const summary = hasState ? `<section class="signal-broker-summary" aria-label="Relay-7 progression"><div><span>This cycle</span><b>${escapeHtml(`${state.dailyCreditsEarned} / ${state.maximumDailyCredits}`)} credits</b></div><div><span>Next sector</span><b>${escapeHtml(`${next.current} / ${next.required}`)} credits</b></div><div><span>Lifetime</span><b>${escapeHtml(`${state.lifetimeProgressionCredits}`)} credits</b></div></section>` : "";
    const error = runtime.error ? `<div id="signalBrokerError" class="signal-broker-error" role="alert">${escapeHtml(runtime.error)} <button class="signal-broker-refresh" type="button" data-relay7-action="refresh">Refresh</button></div>` : '<div id="signalBrokerError" class="signal-broker-state-zone" hidden></div>';
    const loading = runtime.stateLoading ? '<div id="signalBrokerLoading" class="signal-broker-error">Loading current Relay-7 cycle…</div>' : '<div id="signalBrokerLoading" class="signal-broker-state-zone" hidden></div>';
    root.innerHTML = `<div id="signalBrokerBack" class="signal-broker-back" role="presentation"><section id="signalBrokerPanel" class="signal-broker-panel" role="dialog" aria-modal="true" aria-labelledby="signalBrokerName"><header class="signal-broker-head"><div id="signalBrokerPortrait" class="signal-broker-portrait" aria-label="RELAY-7 portrait" role="img"><div class="signal-broker-portrait-fallback" aria-hidden="true">R7</div><img class="signal-broker-portrait-img" src="${RELAY7_PORTRAIT_URL}" alt="" loading="lazy" decoding="async" onerror="this.remove()"></div><div class="signal-broker-title"><h2 id="signalBrokerName" class="signal-broker-name">RELAY-7</h2><div class="signal-broker-kicker">PACK SIGNAL HANDLER · CONTRACT BROKER</div><div id="signalBrokerLocation" class="signal-broker-location">DEAD RELAY EXCHANGE</div><div id="signalBrokerStatus" class="signal-broker-status">${hasState ? (state.feature?.enabled === true ? "Contract line active" : "Contract line offline") : "Awaiting relay state"}</div></div><button id="signalBrokerClose" class="signal-broker-close" type="button" aria-label="Close RELAY-7 broker panel">&times;</button></header><div class="signal-broker-body"><p id="signalBrokerDialogue" class="signal-broker-dialogue">Cycle contracts are authoritative. Progress updates from completed activities; progression credit is granted only when you manually claim a completed contract.</p>${loading}${error}${cycle}${summary}<section class="signal-broker-section" aria-labelledby="signalBrokerOffersLabel"><div id="signalBrokerOffersLabel" class="signal-broker-section-label">Current contracts</div><div id="signalBrokerOffers" class="signal-broker-offers" aria-label="Current Relay-7 contracts">${contracts}</div></section><div id="signalBrokerActiveContract" hidden></div><div id="signalBrokerEmptyState" class="signal-broker-state-zone" hidden></div><div id="signalBrokerReadyToTurnIn" class="signal-broker-state-zone" hidden></div><div id="signalBrokerRewardCapNotice" class="signal-broker-state-zone" hidden></div></div><footer id="signalBrokerFooter" class="signal-broker-footer">Lifetime credits are progression milestones, not currency. Reaching the displayed requirement makes the next World Exploration scan available; it does not unlock the sector automatically.</footer></section></div>`;
    root.setAttribute("data-open", runtime.open ? "1" : "0");
    return root;
  }

  function stopTimer() { if (runtime.timerId) clearInterval(runtime.timerId); runtime.timerId = null; }
  function tickTimer() {
    if (!runtime.open || !runtime.state) return;
    render();
    const remaining = runtime.state.cycleEndsAt * 1000 - (Date.now() + runtime.serverOffsetMs);
    if (remaining <= 0 && !runtime.timerRefreshPending) {
      runtime.timerRefreshPending = true;
      void refreshState({ session: runtime.session, force: true }).finally(() => { runtime.timerRefreshPending = false; });
    }
  }
  function startTimer() { if (!runtime.timerId) runtime.timerId = window.setInterval(tickTimer, 1000); }
  async function request(path, body) {
    const apiPost = getApiPost();
    if (typeof apiPost !== "function") throw new Error("strict_v2_unavailable");
    const response = await apiPost(path, body);
    if (!response || response.ok === false) {
      const error = new Error(response?.code || response?.reason || "invalid_request");
      error.response = response;
      throw error;
    }
    return response;
  }
  async function refreshState({ session = runtime.session } = {}) {
    if (!runtime.open || !relayAuthorized()) return null;
    if (runtime.stateLoading && runtime.stateLoadingSession === session) return runtime.stateLoading;
    const task = (async () => {
      try {
        const raw = await request("/webapp/relay7/contracts/state", {});
        const next = normalizeState(raw);
        if (!next) throw new Error("invalid_request");
        if (!runtime.open || session !== runtime.session) return null;
        runtime.state = next;
        runtime.serverOffsetMs = next.serverNow * 1000 - Date.now();
        runtime.error = "";
        startTimer();
      } catch (error) {
        if (!runtime.open || session !== runtime.session) return null;
        runtime.error = messageFor(responseCode(error));
      } finally {
        if (runtime.stateLoading === task) { runtime.stateLoading = null; runtime.stateLoadingSession = 0; }
        if (runtime.open && session === runtime.session) render();
      }
      return runtime.state;
    })();
    runtime.stateLoading = task;
    runtime.stateLoadingSession = session;
    try { return await task; } finally { if (runtime.stateLoading === task) runtime.stateLoading = null; }
  }
  async function mutate(kind, contractId) {
    if (!runtime.open || !relayAuthorized() || runtime.mutationPending || !runtime.state) return;
    const contract = runtime.state.contracts.find((row) => row.id === contractId);
    if (!contract) return;
    const cycleId = runtime.state.cycleId;
    if (kind === "accept" && !(runtime.state.feature?.enabled === true && contract.status === "available")) return;
    if (kind === "claim" && !(contract.status === "claimable" && contract.canClaim === true)) return;
    runtime.mutationPending = true;
    runtime.error = "";
    const session = runtime.session;
    render();
    const requestId = makeRequestId(kind, contractId, cycleId);
    try {
      const body = kind === "accept" ? { contractId, requestId } : { cycleId, contractId, requestId };
      await request(kind === "accept" ? "/webapp/relay7/contracts/accept" : "/webapp/relay7/contracts/claim", body);
      if (!runtime.open || session !== runtime.session) return;
      clearRequestId(kind, contractId, cycleId);
      await refreshState({ session });
    } catch (error) {
      if (!runtime.open || session !== runtime.session) return;
      const code = responseCode(error);
      runtime.error = messageFor(code);
      if (error?.response || error?.data) clearRequestId(kind, contractId, cycleId);
      if (["contract_cycle_expired", "contract_not_active", "contract_not_complete", "contract_already_claimed", "daily_credit_limit_reached", "feature_disabled"].includes(String(code))) {
        await refreshState({ session });
      }
    } finally {
      if (session === runtime.session) {
        runtime.mutationPending = false;
        if (runtime.open) render();
      }
    }
  }
  function acceptContract(contractId) { return mutate("accept", contractId); }
  function claimContract(contractId) { return mutate("claim", contractId); }

  function openNow() {
    if (!relayAuthorized()) { lockedReason(); return false; }
    const root = render();
    if (!root) return false;
    if (!runtime.open) {
      runtime.open = true;
      runtime.session += 1;
      runtime.scrollRestore = document.body.style.overflow;
      document.body.classList.add(BODY_OPEN_CLASS);
      try {
        const navMeta = { close: closeView, isOpen: () => runtime.open, fallback: false };
        if (window.AlphaNav?.push) window.AlphaNav.push(ROOT_ID, navMeta);
        else { window.navRegister?.(ROOT_ID, navMeta); window.navOpen?.(ROOT_ID); }
      } catch (_) {}
    }
    root.setAttribute("data-open", "1");
    void refreshState({ session: runtime.session });
    return true;
  }
  async function open() {
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => { void open(); }, { once: true });
      return false;
    }
    if (!runtime.open) {
      const refreshExploration = window.WorldExploration?.refreshState;
      if (typeof refreshExploration !== "function") { lockedReason(); return false; }
      try { await refreshExploration({ force: true }); } catch (_) {}
    }
    return openNow();
  }
  function closeView() {
    runtime.session += 1;
    runtime.open = false;
    runtime.mutationPending = false;
    runtime.timerRefreshPending = false;
    runtime.state = null;
    stopTimer();
    document.body?.classList.remove(BODY_OPEN_CLASS);
    if (document.body) document.body.style.overflow = runtime.scrollRestore;
    runtime.scrollRestore = "";
    ensureRoot()?.setAttribute("data-open", "0");
  }
  function close() {
    try { if (window.AlphaNav?.close?.(ROOT_ID, { source: "signal-broker-close" })) return; } catch (_) {}
    closeView();
    try { window.navClose?.(ROOT_ID); } catch (_) {}
  }
  function init() {
    if (runtime.initialized) return;
    runtime.initialized = true;
    ensureRoot();
    document.addEventListener("keydown", (event) => { if (runtime.open && event.key === "Escape") close(); });
    document.addEventListener("visibilitychange", () => { if (!document.hidden && runtime.open) void refreshState({ session: runtime.session }); });
  }

  window.SignalBroker = { init, open, close, render, refreshState };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
