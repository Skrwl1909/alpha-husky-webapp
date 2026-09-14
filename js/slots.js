(function (global) {
  "use strict";

  const BUILDING_ID = "abandoned_wallets_vault";
  const MODAL_ID = "recoveryTerminalBack";
  const STYLE_ID = "recoveryWheelStyles";
  const SPIN_MS = 2540;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const GHOST_IMAGE = "images/slots/ghost_ledger_alpha_teaser.png";

  const S = {
    apiPost: null,
    tg: null,
    spinning: false,
    redeeming: false,
    lastState: null,
    segments: [],
    rotationDeg: 0,
  };

  function el(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function numberOr(value, fallback) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
    const f = Number(fallback);
    return Number.isFinite(f) ? f : 0;
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function makeRunId(prefix, key) {
    if (typeof global.AH_makeRunId === "function") return global.AH_makeRunId(prefix, key);
    const uid = String(global.Telegram?.WebApp?.initDataUnsafe?.user?.id || "0");
    return `${prefix}:${uid}:${String(key || "").slice(0, 48)}:${Date.now()}:${Math.random().toString(16).slice(2, 10)}`;
  }

  function ensureStyles() {
    if (el(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#${MODAL_ID}{position:fixed;inset:0;z-index:999990;display:none;align-items:flex-end;justify-content:center;background:rgba(2,5,9,.78);backdrop-filter:blur(9px);font-family:Inter,system-ui,-apple-system,sans-serif;color:#edf6f8}
.rw-shell{position:relative;width:min(100%,520px);max-height:96dvh;overflow:auto;border:1px solid rgba(128,193,205,.22);border-bottom:0;border-radius:26px 26px 0 0;background:radial-gradient(circle at 50% 8%,rgba(47,106,119,.20),transparent 34%),linear-gradient(180deg,#10191f,#080d12 72%);box-shadow:0 -24px 80px rgba(0,0,0,.48);padding:18px 16px calc(18px + env(safe-area-inset-bottom))}
.rw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:12px}.rw-eyebrow{font-size:10px;letter-spacing:.24em;color:#75b8c3;font-weight:900}.rw-title{font-size:24px;letter-spacing:.07em;font-weight:950;margin-top:3px}.rw-sub{font-size:12px;color:#91a2a8;margin-top:4px;line-height:1.35}.rw-close{width:38px;height:38px;border:1px solid rgba(255,255,255,.12);border-radius:13px;background:#121d23;color:#dfecef;font-size:22px;cursor:pointer}
.rw-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}.rw-stat{min-width:0;border:1px solid rgba(126,186,197,.15);border-radius:13px;background:rgba(255,255,255,.035);padding:9px 10px}.rw-stat-label{font-size:9px;letter-spacing:.11em;color:#769099;font-weight:850}.rw-stat-value{margin-top:3px;font-size:15px;font-weight:900;white-space:nowrap}
.rw-wheel-stage{position:relative;width:min(86vw,360px);aspect-ratio:1;margin:2px auto 12px;filter:drop-shadow(0 18px 28px rgba(0,0,0,.42))}.rw-pointer{position:absolute;z-index:4;left:50%;top:-3px;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:27px solid #d9f6f3;filter:drop-shadow(0 3px 5px rgba(0,0,0,.7))}.rw-wheel-ring{position:absolute;inset:8px;border-radius:50%;border:1px solid rgba(178,232,234,.34);background:#081015;box-shadow:inset 0 0 0 7px rgba(4,8,11,.9),inset 0 0 36px rgba(90,185,190,.14)}.rw-rotor{width:100%;height:100%;transform-origin:50% 50%;will-change:transform}.rw-segment{stroke:rgba(2,7,10,.72);stroke-width:1.2}.rw-segment.is-ineligible{opacity:.18}.rw-segment-label{fill:#eefafa;font-size:5px;font-weight:900;letter-spacing:.02em;text-anchor:middle;dominant-baseline:middle;pointer-events:none}.rw-hub{position:absolute;z-index:3;inset:50% auto auto 50%;transform:translate(-50%,-50%);width:31%;aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(168,225,227,.32);background:radial-gradient(circle at 45% 35%,#263b42,#0b1318 70%);box-shadow:0 0 0 7px rgba(4,10,13,.85),0 0 30px rgba(71,178,181,.18);font-size:10px;line-height:1.18;letter-spacing:.12em;font-weight:950;color:#d9f4f2}
.rw-result{min-height:66px;border:1px solid rgba(121,192,199,.18);border-radius:15px;background:rgba(2,8,11,.46);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;text-align:center}.rw-result.is-rare{border-color:rgba(99,186,227,.42)}.rw-result.is-special{border-color:rgba(156,116,232,.44)}.rw-result.is-legendary{border-color:rgba(223,181,83,.52);box-shadow:inset 0 0 24px rgba(213,158,49,.08)}.rw-result-title{font-size:10px;letter-spacing:.18em;font-weight:950;color:#82b7be}.rw-result-value{margin-top:4px;font-size:19px;letter-spacing:.055em;font-weight:950}.rw-status{min-height:18px;text-align:center;font-size:11px;color:#82959c;margin:7px 0}
.rw-spin{width:100%;min-height:52px;border:1px solid rgba(155,225,218,.35);border-radius:15px;background:linear-gradient(180deg,#29525a,#18363d);color:#f3ffff;font-size:15px;letter-spacing:.13em;font-weight:950;cursor:pointer;box-shadow:0 11px 24px rgba(0,0,0,.24)}.rw-spin:disabled{opacity:.46;cursor:not-allowed}.rw-spin.is-busy{animation:rw-pulse 1s ease-in-out infinite}
.rw-ledger{display:grid;grid-template-columns:78px 1fr;gap:12px;align-items:center;margin-top:12px;padding:11px;border:1px solid rgba(117,167,177,.15);border-radius:16px;background:rgba(255,255,255,.028)}.rw-ghost{width:78px;height:78px;object-fit:cover;border-radius:12px;filter:saturate(.78) contrast(1.06)}.rw-ledger-name{font-size:13px;font-weight:900}.rw-ledger-meta{margin-top:3px;font-size:11px;color:#8fa0a7}.rw-progress{height:6px;margin-top:8px;overflow:hidden;border-radius:999px;background:#18252b}.rw-progress>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#4b8e9b,#a9e5df);transition:width .25s ease}.rw-redeem{display:none;width:100%;margin-top:9px;padding:10px;border:1px solid rgba(182,230,222,.30);border-radius:11px;background:#172d33;color:#eafffb;font-size:10px;letter-spacing:.08em;font-weight:900;cursor:pointer}.rw-redeem:disabled{opacity:.45}
@keyframes rw-pulse{50%{filter:brightness(1.15)}}
@media(min-width:560px){#${MODAL_ID}{align-items:center}.rw-shell{border-bottom:1px solid rgba(128,193,205,.22);border-radius:26px;max-height:92vh}}
@media(max-width:370px){.rw-shell{padding-left:12px;padding-right:12px}.rw-title{font-size:21px}.rw-stat{padding:8px 7px}.rw-stat-value{font-size:13px}.rw-wheel-stage{width:min(82vw,320px)}}
@media(prefers-reduced-motion:reduce){.rw-rotor{transition-duration:.01ms!important}.rw-spin.is-busy{animation:none}}
`;
    document.head.appendChild(style);
  }

  function ensureModal() {
    let back = el(MODAL_ID);
    if (back) return back;
    back = document.createElement("div");
    back.id = MODAL_ID;
    back.innerHTML = `
      <section class="rw-shell" role="dialog" aria-modal="true" aria-labelledby="rwTitle">
        <header class="rw-head">
          <div><div class="rw-eyebrow">ABANDONED WALLETS</div><div id="rwTitle" class="rw-title">RECOVERY WHEEL</div><div class="rw-sub">One signal. One real recovery. Server-authoritative.</div></div>
          <button id="rwClose" class="rw-close" aria-label="Close">×</button>
        </header>
        <div class="rw-stats">
          <div class="rw-stat"><div class="rw-stat-label">BONES</div><div id="rwBones" class="rw-stat-value">—</div></div>
          <div class="rw-stat"><div class="rw-stat-label">FREE SPINS</div><div id="rwFree" class="rw-stat-value">0</div></div>
          <div class="rw-stat"><div class="rw-stat-label">SPIN COST</div><div id="rwCost" class="rw-stat-value">25</div></div>
        </div>
        <div class="rw-wheel-stage">
          <div class="rw-pointer" aria-hidden="true"></div>
          <div class="rw-wheel-ring"><svg id="rwRotor" class="rw-rotor" viewBox="0 0 200 200" role="img" aria-label="Weighted Recovery Wheel"></svg></div>
          <div class="rw-hub">ALPHA<br>RECOVERY</div>
        </div>
        <div id="rwResult" class="rw-result"><div id="rwResultTitle" class="rw-result-title">SYSTEM READY</div><div id="rwResultValue" class="rw-result-value">EVERY SPIN RECOVERS</div></div>
        <div id="rwStatus" class="rw-status">Syncing wheel…</div>
        <button id="rwSpin" class="rw-spin" disabled>SPIN</button>
        <div class="rw-ledger">
          <img class="rw-ghost" src="${GHOST_IMAGE}" alt="Ghost Ledger Alpha">
          <div><div class="rw-ledger-name">Ghost Ledger Alpha</div><div id="rwLedgerCount" class="rw-ledger-meta">Ledger Shards: 0 / 180</div><div id="rwLedgerDaily" class="rw-ledger-meta">Daily Ledger Shards: 0 / 2</div><div class="rw-progress"><i id="rwLedgerFill"></i></div><div id="rwGhostStatus" class="rw-ledger-meta">Locked</div><button id="rwRedeem" class="rw-redeem">UNLOCK GHOST LEDGER ALPHA</button></div>
        </div>
      </section>`;
    document.body.appendChild(back);
    el("rwClose")?.addEventListener("click", close);
    el("rwSpin")?.addEventListener("click", spin);
    el("rwRedeem")?.addEventListener("click", redeemGhost);
    back.addEventListener("click", (event) => { if (event.target === back) close(); });
    return back;
  }

  function polar(radius, angleDeg) {
    const radians = (angleDeg - 90) * Math.PI / 180;
    return { x: 100 + radius * Math.cos(radians), y: 100 + radius * Math.sin(radians) };
  }

  function arcPath(startDeg, endDeg, radius = 92) {
    const sweep = Math.max(0, endDeg - startDeg);
    if (sweep <= 0) return "";
    const start = polar(radius, startDeg);
    const end = polar(radius, endDeg);
    return `M 100 100 L ${start.x.toFixed(4)} ${start.y.toFixed(4)} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x.toFixed(4)} ${end.y.toFixed(4)} Z`;
  }

  function normalizeSegments(rawSegments) {
    if (!Array.isArray(rawSegments)) return [];
    const rows = rawSegments.map((raw) => ({
      id: String(raw?.id || ""),
      label: String(raw?.label || raw?.rewardDescription || "REWARD"),
      tier: String(raw?.tier || "standard"),
      weight: Math.max(0, numberOr(raw?.weight, 0)),
      effectiveWeight: Math.max(0, numberOr(raw?.effectiveWeight, raw?.weight)),
      eligible: raw?.eligible !== false,
      rewardDescription: String(raw?.rewardDescription || raw?.label || "Reward"),
    })).filter((row) => row.id);
    const total = rows.reduce((sum, row) => sum + (row.eligible ? row.effectiveWeight : 0), 0);
    if (total <= 0) return [];
    let cursor = 0;
    return rows.map((row) => {
      const sweep = row.eligible ? (row.effectiveWeight / total) * 360 : 0;
      const out = { ...row, startDeg: cursor, endDeg: cursor + sweep, centerDeg: cursor + (sweep / 2), sweepDeg: sweep };
      cursor += sweep;
      return out;
    });
  }

  function svgNode(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function segmentColor(segment, index) {
    const palettes = {
      standard: ["#1e3940", "#28474e"], rare: ["#235270", "#2f6687"],
      special: ["#4b386b", "#5a447c"], ledger: ["#315b5c", "#477778"], legendary: ["#806128", "#9b7631"],
    };
    const colors = palettes[segment.tier] || palettes.standard;
    return colors[index % colors.length];
  }

  function renderWheel(rawSegments) {
    const rotor = el("rwRotor");
    const segments = normalizeSegments(rawSegments);
    S.segments = segments;
    if (!rotor) return segments;
    rotor.innerHTML = "";
    segments.forEach((segment, index) => {
      const path = svgNode("path", {
        d: arcPath(segment.startDeg, segment.endDeg),
        fill: segmentColor(segment, index),
        class: `rw-segment${segment.eligible ? "" : " is-ineligible"}`,
        "data-segment-id": segment.id,
        "data-weight": segment.weight,
        "data-effective-weight": segment.effectiveWeight,
        "aria-label": `${segment.label}, ${segment.weight}%`,
      });
      const title = svgNode("title");
      title.textContent = `${segment.label} · ${segment.weight}%`;
      path.appendChild(title);
      rotor.appendChild(path);

      if (segment.sweepDeg >= 9) {
        const pos = polar(segment.sweepDeg >= 30 ? 62 : 70, segment.centerDeg);
        const label = svgNode("text", { x: pos.x, y: pos.y, class: "rw-segment-label", transform: `rotate(${segment.centerDeg} ${pos.x} ${pos.y})` });
        label.textContent = segment.label.replace(/^\+1 /, "").replace(/^\+2 /, "2 ").replace(/^\+4 /, "4 ");
        rotor.appendChild(label);
      }
    });
    return segments;
  }

  function stateFrom(payload) {
    if (payload?.state && typeof payload.state === "object") return payload.state;
    return payload && typeof payload === "object" ? payload : {};
  }

  function setResult(headline, rewardText, tier) {
    const box = el("rwResult");
    if (box) box.className = `rw-result${tier && tier !== "standard" ? ` is-${tier}` : ""}`;
    if (el("rwResultTitle")) el("rwResultTitle").textContent = String(headline || "RECOVERED");
    if (el("rwResultValue")) el("rwResultValue").textContent = String(rewardText || "REWARD SECURED");
  }

  function renderState(payload) {
    const prior = S.lastState && typeof S.lastState === "object" ? S.lastState : {};
    const incoming = stateFrom(payload);
    const state = { ...prior, ...incoming };
    state.fragments = { ...(prior.fragments || {}), ...(incoming.fragments || {}) };
    state.ghostLedger = { ...(prior.ghostLedger || {}), ...(incoming.ghostLedger || {}) };
    state.wheel = { ...(prior.wheel || {}), ...(incoming.wheel || {}) };
    S.lastState = state;

    if (Array.isArray(state.wheel.segments)) renderWheel(state.wheel.segments);
    if (el("rwBones")) el("rwBones").textContent = state.bonesBalance == null ? "—" : String(numberOr(state.bonesBalance, 0));
    if (el("rwFree")) el("rwFree").textContent = String(numberOr(state.freeSpins, 0));
    if (el("rwCost")) el("rwCost").textContent = `${numberOr(state.spinCostBones, 25)} Bones`;

    const fragments = state.fragments || {};
    const owned = numberOr(fragments.owned, 0);
    const goal = Math.max(1, numberOr(fragments.goal, 180));
    const earned = numberOr(fragments.earnedToday, 0);
    const cap = Math.max(1, numberOr(fragments.dailyCap, 2));
    if (el("rwLedgerCount")) el("rwLedgerCount").textContent = `Ledger Shards: ${owned} / ${goal}`;
    if (el("rwLedgerDaily")) el("rwLedgerDaily").textContent = `Daily Ledger Shards: ${earned} / ${cap}`;
    if (el("rwLedgerFill")) el("rwLedgerFill").style.width = `${clamp((owned / goal) * 100, 0, 100)}%`;

    const ghost = state.ghostLedger || {};
    const ghostOwned = ghost.owned === true;
    const ghostEquipped = ghost.equipped === true;
    if (el("rwGhostStatus")) el("rwGhostStatus").textContent = ghostOwned ? (ghostEquipped ? "Unlocked · Equipped" : "Unlocked · Ready in Skins") : `${Math.max(0, goal - owned)} shards remaining`;
    const redeem = el("rwRedeem");
    if (redeem) {
      redeem.style.display = ghost.canRedeem === true && !ghostOwned ? "block" : "none";
      redeem.disabled = S.redeeming || S.spinning;
    }

    const spinButton = el("rwSpin");
    if (spinButton) {
      spinButton.disabled = S.spinning || state.canRecover !== true;
      spinButton.classList.toggle("is-busy", S.spinning);
      spinButton.textContent = S.spinning ? "RECOVERING…" : "SPIN";
    }
    return state;
  }

  function selectedGeometry(segmentId) {
    return S.segments.find((segment) => segment.id === String(segmentId || "")) || null;
  }

  function animateToSegment(segmentId) {
    const rotor = el("rwRotor");
    const selected = selectedGeometry(segmentId);
    if (!rotor || !selected || selected.sweepDeg <= 0) return Promise.resolve(false);
    const currentTurns = Math.floor(S.rotationDeg / 360);
    const target = ((currentTurns + 6) * 360) - selected.centerDeg;
    S.rotationDeg = target;
    rotor.style.transition = `transform ${SPIN_MS}ms cubic-bezier(.12,.72,.12,1)`;
    rotor.style.transform = `rotate(${target}deg)`;
    rotor.dataset.landedSegmentId = selected.id;
    rotor.dataset.landedCenterDeg = String(selected.centerDeg);
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(true); } };
      rotor.addEventListener?.("transitionend", finish, { once: true });
      setTimeout(finish, SPIN_MS + 80);
    });
  }

  async function post(path, payload) {
    if (typeof S.apiPost === "function") {
      const out = await S.apiPost(path, payload || {});
      if (out?.ok === false) { const error = new Error(String(out.reason || "REQUEST_FAILED")); error.data = out; throw error; }
      return out;
    }
    const initData = S.tg?.initData || global.Telegram?.WebApp?.initData || "";
    const response = await fetch((global.API_BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(initData ? { Authorization: `Bearer ${initData}` } : {}) },
      body: JSON.stringify({ init_data: initData, ...(payload || {}) }),
    });
    const out = await response.json().catch(() => ({ ok: false, reason: `HTTP_${response.status}` }));
    if (!response.ok || out?.ok === false) { const error = new Error(String(out?.reason || `HTTP_${response.status}`)); error.data = out; throw error; }
    return out;
  }

  function setStatus(text) { if (el("rwStatus")) el("rwStatus").textContent = String(text || ""); }

  async function loadState() {
    setStatus("Syncing wheel…");
    const out = await post("/webapp/slots/state", { buildingId: BUILDING_ID });
    renderState(out);
    setStatus("Recovery Wheel online.");
    return out;
  }

  async function spin() {
    if (S.spinning) return false;
    S.spinning = true;
    renderState(S.lastState || {});
    setStatus("Server resolving recovery signal…");
    setResult("SCANNING", "OUTCOME LOCKED BY SERVER", "standard");
    let out = null;
    try {
      out = await post("/webapp/slots/spin", { buildingId: BUILDING_ID, run_id: makeRunId("slots_spin", "recovery_wheel") });
      const segmentId = out?.result?.segmentId || out?.segment?.id;
      try { await animateToSegment(segmentId); } catch (_) { /* reward remains authoritative */ }
      renderState(out);
      const tier = String(out?.segment?.tier || selectedGeometry(segmentId)?.tier || "standard");
      setResult(out?.result?.headline, out?.result?.rewardText || out?.result?.summary, tier);
      setStatus("Recovery committed.");
      try { S.tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      return out;
    } catch (error) {
      if (error?.data?.state) renderState(error.data);
      const reason = String(error?.data?.reason || error?.message || "RECOVERY_FAILED");
      setResult("RECOVERY ABORTED", reason === "NOT_ENOUGH_BONES" ? "NOT ENOUGH BONES" : reason, "standard");
      setStatus("No reward was committed.");
      try { S.tg?.showAlert?.(reason); } catch (_) {}
      return false;
    } finally {
      S.spinning = false;
      renderState(S.lastState || {});
    }
  }

  async function redeemGhost() {
    if (S.redeeming || S.spinning || S.lastState?.ghostLedger?.canRedeem !== true) return false;
    S.redeeming = true;
    renderState(S.lastState || {});
    setStatus("Confirming Ledger completion…");
    try {
      const out = await post("/webapp/slots/redeem", { run_id: makeRunId("slots_redeem", "ghost_ledger_alpha") });
      renderState(out);
      setResult("IDENTITY UNLOCKED", "GHOST LEDGER ALPHA", "legendary");
      setStatus("Permanent skin ownership secured. Equip it from Skins.");
      return out;
    } catch (error) {
      if (error?.data?.state) renderState(error.data);
      setStatus(String(error?.data?.reason || error?.message || "Unlock failed"));
      return false;
    } finally {
      S.redeeming = false;
      renderState(S.lastState || {});
    }
  }

  function close() {
    const modal = el(MODAL_ID);
    if (modal) modal.style.display = "none";
    try { global.navClose?.(MODAL_ID); } catch (_) {}
  }

  async function open(meta) {
    ensureStyles();
    const modal = ensureModal();
    modal.style.display = "flex";
    try { global.navOpen?.(MODAL_ID); } catch (_) {}
    const description = String(meta?.desc || "").trim();
    if (description) {
      const sub = modal.querySelector?.(".rw-sub");
      if (sub) sub.textContent = description;
    }
    try { await loadState(); return true; }
    catch (_) { setStatus("Recovery Wheel offline."); setResult("OFFLINE", "TRY AGAIN LATER", "standard"); return false; }
  }

  function init(options) {
    const config = options || {};
    if (typeof config.apiPost === "function") S.apiPost = config.apiPost;
    if (config.tg) S.tg = config.tg;
    if (!S.tg) S.tg = global.Telegram?.WebApp || null;
  }

  const API = { init, open, close, refresh: loadState };
  global.RecoveryTerminal = API;
  global.Slots = API;
  global.AH_SLOTS_WHEEL_TEST = {
    state: S,
    normalizeSegments,
    renderWheel,
    renderState,
    selectedGeometry,
    animateToSegment,
    setResult,
    ensureStyles,
    ensureModal,
    spin,
    redeemGhost,
  };
})(window);
