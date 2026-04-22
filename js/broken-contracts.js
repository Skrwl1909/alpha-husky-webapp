(function (global) {
  const MODAL_ID = "brokenContractsBack";
  const ROOT_ID = "bcRoot";
  const STATUS_ID = "bcStatus";
  const META_ID = "bcMeta";
  const CLOSE_ID = "bcClose";
  const REFRESH_ID = "bcRefresh";

  const ORDER_SORT = {
    faction_patrol_donate: 0,
    missions_medium_plus: 1,
    bones_real_sinks: 2
  };

  const ORDER_BRIEF = {
    faction_patrol_donate: {
      tier: "primary",
      kicker: "Primary Faction Order",
      directive: "Hold Frontline Nodes",
      why: "Patrol and Donate actions on Phantom Nodes are the direct frontline input for this order.",
      impact: "If your faction completes this before reset, qualifying contributors can claim cycle rewards.",
      links: [
        "Map / Phantom Nodes: Patrol and Donate feed this order directly.",
        "CTA + Mailbox: reward-ready prompts route players back here.",
        "Oracle escalation remains a follow-up phase."
      ]
    },
    missions_medium_plus: {
      tier: "secondary",
      kicker: "Secondary Order",
      directive: "Sustain Mission Pressure",
      why: "Mission throughput keeps faction activity active across the whole cycle.",
      impact: "Completion unlocks contributor rewards for eligible faction members."
    },
    bones_real_sinks: {
      tier: "secondary",
      kicker: "Secondary Order",
      directive: "Fuel War Economy",
      why: "Real resource spending proves active commitment, not passive holding.",
      impact: "Completion unlocks contributor rewards for eligible faction members."
    }
  };

  const S = {
    apiPost: null,
    tg: null,
    dbg: null,
    state: null,
    hideObserver: null
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

  function assetLabel(key) {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function rewardChips(reward) {
    const personal = reward?.personal && typeof reward.personal === "object" ? reward.personal : {};
    return Object.entries(personal)
      .filter(([, value]) => Number(value || 0) > 0)
      .map(([key, value]) => ({
        key,
        label: assetLabel(key),
        value: Number(value || 0)
      }));
  }

  function normalizeFaction(v) {
    const raw = String(v || "").trim().toLowerCase();
    const map = {
      rb: "rogue_byte",
      rogue_byte: "rogue_byte",
      ew: "echo_wardens",
      echo_wardens: "echo_wardens",
      pb: "pack_burners",
      pack_burners: "pack_burners",
      ih: "inner_howl",
      inner_howl: "inner_howl"
    };
    return map[raw] || raw;
  }

  function factionCode(v) {
    const fk = normalizeFaction(v);
    const map = {
      rogue_byte: "RB",
      echo_wardens: "EW",
      pack_burners: "PB",
      inner_howl: "IH"
    };
    return map[fk] || String(v || "").slice(0, 4).toUpperCase() || "----";
  }

  function pct(value, goal) {
    const g = Math.max(1, Number(goal || 0));
    const v = Math.max(0, Number(value || 0));
    return Math.max(0, Math.min(100, Math.round((v / g) * 100)));
  }

  function metrics(contract) {
    const factionProgress = Number(contract?.myFactionProgress || 0);
    const goal = Math.max(1, Number(contract?.goal || 0));
    const myContribution = Number(contract?.myContribution || 0);
    const minContribution = Math.max(1, Number(contract?.minPersonalContribution || 0));
    return {
      factionProgress,
      goal,
      myContribution,
      minContribution,
      factionPct: pct(factionProgress, goal),
      contributionPct: pct(myContribution, minContribution)
    };
  }

  function statusUi(contract) {
    const claimable = !!contract?.claimable;
    const claimed = Number(contract?.myClaimedAt || 0) > 0;
    const pending = !!contract?.claimPending;

    const m = metrics(contract);
    const hasAnyProgress = m.factionProgress > 0 || m.myContribution > 0;
    const factionDone = m.factionProgress >= m.goal;
    const myDone = m.myContribution >= m.minContribution;

    if (claimable) {
      return {
        mode: "button",
        label: "Claim",
        cls: "primary bc-claim",
        disabled: false
      };
    }
    if (claimed) return { mode: "badge", label: "Claimed", cls: "is-claimed" };
    if (pending) return { mode: "badge", label: "Pending", cls: "is-pending" };
    if (factionDone && myDone) return { mode: "badge", label: "Ready", cls: "is-ready" };
    if (hasAnyProgress) return { mode: "badge", label: "In Progress", cls: "is-progress" };
    return { mode: "badge", label: "Locked", cls: "is-locked" };
  }

  function renderBadgeOrButton(contract) {
    const ui = statusUi(contract);
    if (ui.mode === "button") {
      return `
        <button
          class="btn ${esc(ui.cls || "")}"
          type="button"
          data-bc-claim="${esc(contract?.id || "")}"
          ${ui.disabled ? "disabled" : ""}
        >${esc(ui.label)}</button>
      `;
    }
    return `<span class="bc-badge ${esc(ui.cls || "")}">${esc(ui.label)}</span>`;
  }

  function setStatus(text) {
    const node = el(STATUS_ID);
    if (node) node.textContent = text || "";
  }

  function setMeta(data) {
    const node = el(META_ID);
    if (!node) return;
    const faction = data?.myFactionCode || factionCode(data?.myFaction) || "----";
    const dayKey = data?.dayKey || "-";
    node.textContent = `Faction ${faction} War Orders - Reset in ${fmtReset(data?.secondsToReset)} - Cycle ${dayKey}`;
  }

  function renderLoading(msg) {
    setStatus(msg || "Loading faction war orders...");
    setMeta(null);
    const root = el(ROOT_ID);
    if (root) root.innerHTML = `<div class="bc-empty">${esc(msg || "Loading faction war orders...")}</div>`;
  }

  function renderError(msg) {
    setStatus("Error");
    const root = el(ROOT_ID);
    if (root) {
      root.innerHTML = `<div class="bc-empty" style="color:#ffb4b4;">${esc(msg || "Failed to load faction war orders")}</div>`;
    }
  }

  function syncShellState(open) {
    document.body.classList.toggle("bc-open", !!open);
  }

  function isVisible(node) {
    if (!node) return false;
    if (node.style.display === "none") return false;
    try {
      return window.getComputedStyle(node).display !== "none";
    } catch (_) {
      return true;
    }
  }

  function orderBrief(contract) {
    const id = String(contract?.id || "");
    const base = ORDER_BRIEF[id] || {};
    const tier = base.tier || "secondary";
    return {
      tier,
      kicker: base.kicker || (tier === "primary" ? "Primary Faction Order" : "Secondary Order"),
      directive: base.directive || "Faction Directive",
      why: base.why || "Push faction progress before reset and secure your claim eligibility.",
      impact: base.impact || "Completion unlocks contributor claims for eligible faction members.",
      links: Array.isArray(base.links) ? base.links : []
    };
  }

  function orderPriority(contract) {
    const id = String(contract?.id || "");
    const brief = orderBrief(contract);
    const base = Number.isFinite(ORDER_SORT[id]) ? ORDER_SORT[id] : 999;
    return brief.tier === "primary" ? base - 1000 : base;
  }

  function sortContracts(contracts) {
    return [...contracts].sort((a, b) => {
      const pa = orderPriority(a);
      const pb = orderPriority(b);
      if (pa !== pb) return pa - pb;
      const ga = Number(a?.goal || 0);
      const gb = Number(b?.goal || 0);
      return gb - ga;
    });
  }

  function raceSnapshot(contract, myFaction, myFactionCode) {
    const progressByFaction = contract?.progressByFaction && typeof contract.progressByFaction === "object"
      ? contract.progressByFaction
      : null;
    if (!progressByFaction) return null;

    const table = Object.entries(progressByFaction)
      .map(([faction, value]) => ({
        faction: normalizeFaction(faction),
        value: Math.max(0, Number(value || 0)),
        code: factionCode(faction)
      }))
      .sort((a, b) => b.value - a.value);
    if (!table.length) return null;

    const leader = table[0];
    const topValue = leader.value;
    const topCount = table.filter((row) => row.value === topValue).length;
    const myKey = normalizeFaction(myFaction);
    const myRow = myKey ? table.find((row) => row.faction === myKey) : null;
    const myCode = myFactionCode || (myRow ? myRow.code : "");
    const myValue = myRow ? myRow.value : 0;

    let status = "observer";
    if (myRow) {
      if (myValue === topValue && topCount === 1) status = "leading";
      else if (myValue === topValue) status = "tied";
      else status = "behind";
    }

    return {
      leaderCode: leader.code,
      leaderValue: leader.value,
      myCode: myCode || "",
      myValue,
      gapToLeader: myRow ? Math.max(0, topValue - myValue) : topValue,
      status
    };
  }

  function renderProgress(label, value, goal, fillClass) {
    const percent = pct(value, goal);
    const fill = percent > 0 ? `${fillClass} has-progress` : fillClass;
    return `
      <div class="bc-section">
        <div class="bc-row">
          <span class="bc-row-label">${esc(label)}</span>
          <span class="bc-row-value">${esc(value)}/${esc(goal)}<span class="bc-row-percent">${esc(percent)}%</span></span>
        </div>
        <div class="bc-bar">
          <div class="${esc(fill)}" style="width:${esc(percent)}%;"></div>
        </div>
      </div>
    `;
  }

  function renderRewards(contract) {
    const rewards = rewardChips(contract?.reward);
    if (!rewards.length) {
      return `<span class="bc-chip"><span class="bc-chip-key">Reward</span><span class="bc-chip-val">None</span></span>`;
    }
    return rewards.map((reward) => `
      <span class="bc-chip">
        <span class="bc-chip-key">${esc(reward.label)}</span>
        <span class="bc-chip-val">+${esc(reward.value)}</span>
      </span>
    `).join("");
  }

  function renderRace(contract, data, compact) {
    const race = raceSnapshot(contract, data?.myFaction, data?.myFactionCode);
    const goal = Math.max(1, Number(contract?.goal || 0));
    if (!race) return `<div class="bc-race-line">Race data unavailable.</div>`;

    let context = "Join the race.";
    if (race.status === "leading") context = `${race.myCode} is leading this order.`;
    if (race.status === "tied") context = `${race.myCode} is tied for lead.`;
    if (race.status === "behind") context = `${race.myCode} is behind by ${race.gapToLeader}.`;

    if (compact) {
      return `
        <div class="bc-race-line">
          Leader ${esc(race.leaderCode)} ${esc(race.leaderValue)}/${esc(goal)} · ${esc(context)}
        </div>
      `;
    }

    return `
      <div class="bc-race">
        <div class="bc-race-title">Faction Race</div>
        <div class="bc-race-line">Leader: ${esc(race.leaderCode)} ${esc(race.leaderValue)}/${esc(goal)}</div>
        <div class="bc-race-line">Your side: ${race.myCode ? `${esc(race.myCode)} ${esc(race.myValue)}/${esc(goal)}` : "No faction selected"}</div>
        <div class="bc-race-context">${esc(context)}</div>
      </div>
    `;
  }

  function renderPrimary(contract, data) {
    const type = String(contract?.type || "generic").toLowerCase();
    const m = metrics(contract);
    const brief = orderBrief(contract);
    const links = brief.links.length
      ? `<div class="bc-links">${brief.links.map((line) => `<div class="bc-link-line">${esc(line)}</div>`).join("")}</div>`
      : "";

    return `
      <section class="bc-order-hero">
        <div class="bc-order-kicker">${esc(brief.kicker)} · Reset in ${esc(fmtReset(data?.secondsToReset))}</div>
        <div class="bc-card bc-card-primary type-${esc(type)}">
          <div class="bc-card-head">
            <div class="bc-card-copy">
              <div class="bc-card-title">${esc(contract?.title || contract?.id || "Order")}</div>
              <div class="bc-card-desc">${esc(contract?.desc || "")}</div>
            </div>
            ${renderBadgeOrButton(contract)}
          </div>

          <div class="bc-callout">
            <div class="bc-callout-title">Directive</div>
            <div class="bc-callout-text">${esc(brief.directive)}</div>
          </div>

          ${renderProgress("Faction objective", m.factionProgress, m.goal, "bc-fill")}
          ${renderProgress("My contribution (qualify for reward)", m.myContribution, m.minContribution, "bc-fill is-contrib")}

          ${renderRace(contract, data, false)}

          <div class="bc-callout">
            <div class="bc-callout-title">Why it matters</div>
            <div class="bc-callout-text">${esc(brief.why)}</div>
          </div>

          <div class="bc-impact">
            <div class="bc-impact-title">Cycle impact on completion</div>
            <div class="bc-impact-text">${esc(brief.impact)}</div>
          </div>

          ${links}

          <div class="bc-rewards">${renderRewards(contract)}</div>
        </div>
      </section>
    `;
  }

  function renderSecondary(contract, data) {
    const type = String(contract?.type || "generic").toLowerCase();
    const m = metrics(contract);
    const brief = orderBrief(contract);
    return `
      <article class="bc-card bc-card-secondary type-${esc(type)}">
        <div class="bc-card-head">
          <div class="bc-card-copy">
            <div class="bc-card-overline">${esc(brief.kicker)}</div>
            <div class="bc-card-title">${esc(contract?.title || contract?.id || "Order")}</div>
            <div class="bc-card-desc">${esc(contract?.desc || "")}</div>
          </div>
          ${renderBadgeOrButton(contract)}
        </div>

        ${renderProgress("Faction", m.factionProgress, m.goal, "bc-fill")}
        ${renderProgress("You", m.myContribution, m.minContribution, "bc-fill is-contrib")}

        <div class="bc-race-mini">${renderRace(contract, data, true)}</div>

        <div class="bc-impact">
          <div class="bc-impact-title">Why</div>
          <div class="bc-impact-text">${esc(brief.why)}</div>
        </div>

        <div class="bc-rewards">${renderRewards(contract)}</div>
      </article>
    `;
  }

  function bindClaimButtons(root) {
    root.querySelectorAll("[data-bc-claim]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const contractId = btn.getAttribute("data-bc-claim");
        if (contractId) claim(contractId);
      });
    });
  }

  function renderState(data) {
    S.state = data || {};
    setStatus(`Orders active · ${fmtReset(data?.secondsToReset)} to reset`);
    setMeta(data);

    const contracts = Array.isArray(data?.contracts) ? data.contracts : [];
    const root = el(ROOT_ID);
    if (!root) return;

    if (!contracts.length) {
      root.innerHTML = `<div class="bc-empty">No faction orders available.</div>`;
      return;
    }

    const ordered = sortContracts(contracts);
    const primary = ordered[0];
    const secondary = ordered.slice(1);

    const secondaryHtml = secondary.length
      ? `
        <section class="bc-secondary-wrap">
          <div class="bc-secondary-head">Supporting Orders</div>
          <div class="bc-secondary-grid">
            ${secondary.map((contract) => renderSecondary(contract, data)).join("")}
          </div>
        </section>
      `
      : "";

    root.innerHTML = `
      <div class="bc-board">
        ${renderPrimary(primary, data)}
        ${secondaryHtml}
      </div>
    `;

    bindClaimButtons(root);
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
    renderLoading("Loading faction war orders...");
    try {
      const out = await api("/webapp/brokencontracts/state", { includeStandings: true });
      const data = out?.data || out;
      renderState(data);
      return data;
    } catch (err) {
      renderError(String(err?.message || err || "Failed to load faction war orders"));
      throw err;
    }
  }

  async function claim(contractId) {
    if (!contractId) return false;
    setStatus(`Claiming ${contractId}...`);
    try {
      const out = await api("/webapp/brokencontracts/claim", {
        contractId,
        run_id: rid("bc:claim", contractId)
      });
      const data = out?.state || out?.data || S.state;
      renderState(data);
      try {
        S.tg?.HapticFeedback?.notificationOccurred?.("success");
      } catch (_) {}
      return true;
    } catch (err) {
      setStatus("Claim failed");
      try {
        S.tg?.showAlert?.(String(err?.message || err || "Claim failed"));
      } catch (_) {}
      return false;
    }
  }

  function close() {
    const back = el(MODAL_ID);
    syncShellState(false);
    if (back) back.style.display = "none";
    try {
      global.navClose?.(MODAL_ID);
    } catch (_) {}
  }

  async function open() {
    BrokenContracts.init({
      apiPost: global.S?.apiPost,
      tg: global.Telegram?.WebApp,
      dbg: global.dbg || console.debug
    });

    const back = el(MODAL_ID);
    syncShellState(true);
    if (back) back.style.display = "flex";
    const root = el(ROOT_ID);
    if (root) root.scrollTop = 0;

    try {
      global.navOpen?.(MODAL_ID);
    } catch (_) {}

    try {
      await loadState();
      try {
        el(CLOSE_ID)?.focus?.({ preventScroll: true });
      } catch (_) {}
      return true;
    } catch (err) {
      close();
      throw err;
    }
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
    if (back && !back.dataset.bcObserved) {
      back.dataset.bcObserved = "1";
      S.hideObserver = new MutationObserver(() => {
        if (!isVisible(back)) syncShellState(false);
      });
      S.hideObserver.observe(back, {
        attributes: true,
        attributeFilter: ["style", "class", "hidden"]
      });
    }
    if (!document.body.dataset.bcEscBound) {
      document.body.dataset.bcEscBound = "1";
      document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape" && isVisible(el(MODAL_ID))) close();
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
    claim
  };

  global.BrokenContracts = BrokenContracts;
  global.openBrokenContracts = () => BrokenContracts.open();
})(window);
