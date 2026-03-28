(function (global) {
  const MODAL_ID = "brokenContractsBack";
  const ROOT_ID = "bcRoot";
  const STATUS_ID = "bcStatus";
  const META_ID = "bcMeta";
  const CLOSE_ID = "bcClose";
  const REFRESH_ID = "bcRefresh";

  const S = {
    apiPost: null,
    tg: null,
    dbg: null,
    state: null,
  };

  function el(id) {
    return document.getElementById(id);
  }

  function esc(v) {
    return String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function rid(prefix, key) {
    if (typeof global.AH_makeRunId === "function") return global.AH_makeRunId(prefix, key);
    const uid = String(global.Telegram?.WebApp?.initDataUnsafe?.user?.id || "0");
    return `${prefix}:${uid}:${String(key || "").slice(0, 48)}:${Date.now()}`;
  }

  function fmtReset(sec) {
    const total = Math.max(0, Number(sec || 0) | 0);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function fmtReward(reward) {
    const personal = reward?.personal && typeof reward.personal === "object" ? reward.personal : {};
    const bits = Object.entries(personal)
      .filter(([, value]) => Number(value || 0) > 0)
      .map(([key, value]) => `${value} ${key}`);
    return bits.length ? bits.join(" • ") : "No personal reward";
  }

  function setStatus(text) {
    const node = el(STATUS_ID);
    if (node) node.textContent = text || "";
  }

  function setMeta(data) {
    const node = el(META_ID);
    if (!node) return;
    const faction = data?.myFactionCode || data?.myFaction || "—";
    const dayKey = data?.dayKey || "—";
    node.textContent = `Faction: ${faction} • Reset in ${fmtReset(data?.secondsToReset)} • Day ${dayKey}`;
  }

  function renderLoading(msg) {
    setStatus(msg || "Loading Broken Contracts…");
    setMeta(null);
    const root = el(ROOT_ID);
    if (root) root.innerHTML = `<div style="opacity:.78;">${esc(msg || "Loading Broken Contracts…")}</div>`;
  }

  function renderError(msg) {
    setStatus("Error");
    const root = el(ROOT_ID);
    if (root) root.innerHTML = `<div style="color:#ffb4b4;">${esc(msg || "Failed to load Broken Contracts")}</div>`;
  }

  function renderState(data) {
    S.state = data || {};
    setStatus("Ready");
    setMeta(data);

    const contracts = Array.isArray(data?.contracts) ? data.contracts : [];
    const root = el(ROOT_ID);
    if (!root) return;

    if (!contracts.length) {
      root.innerHTML = `<div style="opacity:.78;">No Broken Contracts available.</div>`;
      return;
    }

    root.innerHTML = contracts.map((contract) => {
      const progress = Number(contract?.myFactionProgress || 0);
      const goal = Math.max(1, Number(contract?.goal || 0));
      const pct = Math.max(0, Math.min(100, Math.round((progress / goal) * 100)));
      const claimable = !!contract?.claimable;
      const claimed = Number(contract?.myClaimedAt || 0) > 0;
      const pending = !!contract?.claimPending;
      const btnLabel = claimed ? "Claimed" : pending ? "Pending" : claimable ? "Claim Reward" : "Locked";
      const btnDisabled = claimed || pending || !claimable;

      return `
        <div class="card" style="padding:12px;display:grid;gap:10px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
            <div>
              <div style="font-weight:700;">${esc(contract?.title || contract?.id || "Contract")}</div>
              <div style="opacity:.82;font-size:12px;margin-top:4px;">${esc(contract?.desc || "")}</div>
            </div>
            <div style="opacity:.76;font-size:12px;text-align:right;">
              <div>${esc(contract?.type || "")}</div>
              <div>${progress}/${goal}</div>
            </div>
          </div>

          <div style="height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#7ee787,#58a6ff);"></div>
          </div>

          <div style="display:grid;gap:4px;font-size:12px;opacity:.86;">
            <div>My faction progress: ${progress}/${goal}</div>
            <div>My contribution: ${Number(contract?.myContribution || 0)} / min ${Number(contract?.minPersonalContribution || 0)}</div>
            <div>Reward: ${esc(fmtReward(contract?.reward))}</div>
          </div>

          <div style="display:flex;justify-content:flex-end;">
            <button
              class="btn${claimable ? ' primary' : ''}"
              type="button"
              data-bc-claim="${esc(contract?.id || "")}"
              ${btnDisabled ? "disabled" : ""}
            >${esc(btnLabel)}</button>
          </div>
        </div>
      `;
    }).join("");

    root.querySelectorAll("[data-bc-claim]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const contractId = btn.getAttribute("data-bc-claim");
        if (contractId) claim(contractId);
      });
    });
  }

  async function api(path, payload) {
    let out;
    if (typeof S.apiPost === "function") {
      out = await S.apiPost(path, payload || {});
    } else {
      const init_data = S.tg?.initData || global.Telegram?.WebApp?.initData || "";
      const res = await fetch((global.API_BASE || "") + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(init_data ? { Authorization: `Bearer ${init_data}` } : {})
        },
        body: JSON.stringify({ init_data, ...(payload || {}) })
      });
      out = await res.json();
    }

    if (out && out.ok === false) {
      throw new Error(String(out.reason || out.message || "Request failed"));
    }
    return out;
  }

  async function loadState() {
    renderLoading("Loading Broken Contracts…");
    try {
      const out = await api("/webapp/brokencontracts/state", { includeStandings: false });
      const data = out?.data || out;
      renderState(data);
      return data;
    } catch (err) {
      renderError(String(err?.message || err || "Failed to load Broken Contracts"));
      throw err;
    }
  }

  async function claim(contractId) {
    if (!contractId) return false;
    setStatus(`Claiming ${contractId}…`);
    try {
      const out = await api("/webapp/brokencontracts/claim", {
        contractId,
        run_id: rid("bc:claim", contractId)
      });
      const data = out?.state || out?.data || S.state;
      renderState(data);
      try { S.tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      return true;
    } catch (err) {
      setStatus("Claim failed");
      try { S.tg?.showAlert?.(String(err?.message || err || "Claim failed")); } catch (_) {}
      return false;
    }
  }

  function close() {
    const back = el(MODAL_ID);
    if (back) back.style.display = "none";
    try { global.navClose?.(MODAL_ID); } catch (_) {}
  }

  async function open() {
    BrokenContracts.init({ apiPost: global.S?.apiPost, tg: global.Telegram?.WebApp, dbg: global.dbg || console.debug });
    const back = el(MODAL_ID);
    if (back) back.style.display = "flex";
    try { global.navOpen?.(MODAL_ID); } catch (_) {}
    await loadState();
    return true;
  }

  function wire() {
    const back = el(MODAL_ID);
    const closeBtn = el(CLOSE_ID);
    const refreshBtn = el(REFRESH_ID);
    if (closeBtn && !closeBtn.dataset.bcBound) {
      closeBtn.dataset.bcBound = "1";
      closeBtn.addEventListener("click", close);
    }
    if (refreshBtn && !refreshBtn.dataset.bcBound) {
      refreshBtn.dataset.bcBound = "1";
      refreshBtn.addEventListener("click", () => loadState());
    }
    if (back && !back.dataset.bcBound) {
      back.dataset.bcBound = "1";
      back.addEventListener("click", (ev) => {
        if (ev.target === back) close();
      });
    }
  }

  const BrokenContracts = {
    init(opts) {
      const o = opts && typeof opts === "object" ? opts : {};
      if (typeof o.apiPost === "function") S.apiPost = o.apiPost;
      if (o.tg) S.tg = o.tg;
      if (o.dbg) S.dbg = o.dbg;
      wire();
    },
    open,
    close,
    reload: loadState,
    claim,
  };

  global.BrokenContracts = BrokenContracts;
  global.openBrokenContracts = () => BrokenContracts.open();
})(window);
