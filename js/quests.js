// public/js/quests.js
(function (global) {
  // ===== Utils =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const noop = () => {};

  function isComplete(q) {
    const req = q.req || q.required || {};
    const prg = q.progress || {};
    const keys = Object.keys(req);
    if (!keys.length) return false;
    for (const k of keys) {
      if (Number(prg[k] || 0) < Number(req[k] || 0)) return false;
    }
    return true;
  }

  function progressPct(item) {
    // Prefer new server fields if present
    if (item && item.progressTotal != null && item.reqTotal != null) {
      const need = Math.max(1, Number(item.reqTotal) || 1);
      const have = Math.min(Number(item.progressTotal) || 0, need);
      return Math.max(0, Math.min(100, Math.round(100 * have / need)));
    }
    if (item && item.percent != null) {
      const p = Number(item.percent) || 0;
      return Math.max(0, Math.min(100, Math.round(p)));
    }
    // Legacy fallback (sum per-keys)
    const req = item.required || item.req || {};
    const prg = item.progress || {};
    const keys = Object.keys(req);
    if (!keys.length) return 0;
    let need = 0, have = 0;
    for (const k of keys) {
      const n = Number(req[k] || 0);
      const h = Math.min(Number(prg[k] || 0), n);
      need += n; have += h;
    }
    return Math.max(0, Math.min(100, Math.round(100 * have / Math.max(1, need))));
  }

  function typeLabel(t) {
    if (t === "chain" || t === "story") return "Story";
    if (t === "daily") return "Daily";
    if (t === "repeatable") return "Repeatable";
    if (t === "bounty") return "Bounty";
    return String(t || "Quest");
  }

    // ===== API =====
  // Obsługa obu zestawów endpointów (nowe i stare) – próbujemy po kolei
  const EP = {
    list: ["/webapp/quests/state", "/webapp/daily/state", "/webapp/quests"],
    accept: ["/webapp/quests/accept", "/webapp/quest/accept"],
    complete: ["/webapp/quests/complete", "/webapp/quest/complete"],
  };

  async function apiPostRaw(path, payload) {
    if (global.S && typeof global.S.apiPost === "function") {
      return await global.S.apiPost(path, payload || {});
    }
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.reason || res.statusText);
      err.status = res.status; err.data = data; err.path = path;
      throw err;
    }
    return data;
  }

  // spróbuj kolejnych ścieżek; 404 -> następna, każdy inny błąd -> przerwij
  async function postFirstOk(paths, payload) {
    let lastErr = null;
    for (const p of paths) {
      try {
        const out = await apiPostRaw(p, payload);
        return out;
      } catch (e) {
        lastErr = e;
        if (e && e.status === 404) continue;
        throw e;
      }
    }
    throw lastErr || new Error("All endpoints failed");
  }

  async function fetchRaw() {
    const out = await postFirstOk(EP.list, {});
    return out; // może być {ok, quests, active} albo nowy format grupowany
  }
  async function acceptQuest(id) {
    return postFirstOk(EP.accept, { id });
  }
  async function completeQuest(id) {
    return postFirstOk(EP.complete, { id });
  }

  function normalizeBoard(payload) {
  // Nowy format (już masz)
  const hasNew = payload && (payload.ready || payload.accepted || payload.available || payload.done);
  if (hasNew) {
    return {
      ready: payload.ready || [],
      accepted: payload.accepted || [],
      available: payload.available || [],
      done: payload.done || []
    };
  

  // NOWE: Obsługa daily legacy {normal, raid}
  if (payload && (payload.normal || payload.raid)) {
    const out = { ready: [], accepted: [], available: [], done: [] };
    // Normal daily
    if (payload.normal) {
      const q = payload.normal;
      if (q.claimed || q.done) {
        out.done.push({ ...q, status: "cooldown" });  // Claimed/done → cooldown
      } else if (q.availableActions && q.availableActions.length > 0) {
        out.available.push({ ...q, status: "available", type: "daily" });  // Available → available
      } else {
        out.accepted.push({ ...q, status: "accepted", type: "daily" });  // In progress
      }
    }
    // Raid (analogicznie)
    if (payload.raid) {
      const q = payload.raid;
      if (q.claimed || q.done) {
        out.done.push({ ...q, status: "cooldown" });
      } else if (q.availableActions && q.availableActions.length > 0) {
        out.available.push({ ...q, status: "available", type: "daily" });  // Raid jako daily
      } else {
        out.accepted.push({ ...q, status: "accepted", type: "daily" });
      }
    }
    return out;
  }

  // Legacy fallback (już masz) – active/quests jako accepted/ready
  const out = { ready: [], accepted: [], available: [], done: [] };
  const list = Array.isArray(payload?.active) ? payload.active
             : Array.isArray(payload?.quests) ? payload.quests
             : [];
  for (const q of list) {
    const ready = (q.ready === true) ? true : isComplete(q);
    if (ready) out.ready.push({ ...q, status: "ready" });
    else out.accepted.push({ ...q, status: "accepted" });
  }
  return out;
}
  }

  // ===== Rendering =====
  const STATUS_ORDER = { ready: 0, accepted: 1, available: 2, cooldown: 3 };
  const TABS = ["all", "daily", "repeatable", "story", "bounties"];

  function mergeBoard(board) {
    const add = (arr, status) => (arr || []).map(q => ({ ...q, status }));
    return [
      ...add(board.ready, "ready"),
      ...add(board.accepted, "accepted"),
      ...add(board.available, "available"),
      ...add(board.done, "cooldown"),
    ];
  }

  function matchTab(item, tab) {
    if (tab === "all") return true;
    if (tab === "daily") return item.type === "daily";
    if (tab === "repeatable") return item.type === "repeatable";
    if (tab === "story") return (item.type === "chain" || item.type === "story");
    if (tab === "bounties") return item.type === "bounty";
    return true;
  }

  function matchFilter(item, filter) {
    if (filter === "any") return true;
    return item.status === filter;
  }

  function sortItems(items) {
    return items.sort((a, b) => {
      const o = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      if (o !== 0) return o;
      return (a.title || a.name || a.id).localeCompare(b.title || b.name || b.id);
    });
  }

  function rewardBadges(rew) {
    const items = [];
    for (const [k, v] of Object.entries(rew || {})) {
      if (v == null || v === 0) continue;
      items.push(`<span class="q-badge">${esc(k)} +${esc(v)}</span>`);
    }
    return items.join(" ");
  }

  function cooldownText(iso) {
    if (!iso) return "Today";
    const end = new Date(iso).getTime();
    const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
    if (left <= 0) return "Soon";
    const h = Math.floor(left / 3600);
    const m = Math.floor((left % 3600) / 60);
    const s = left % 60;
    return h > 0 ? `${h}h ${m}m` : (m > 0 ? `${m}m ${s}s` : `${s}s`);
  }

  function makeCard(q, actions) {
    const pct = progressPct(q);

    // New meta line using progressTotal/reqTotal/unit if present
    const need = (q.reqTotal != null) ? Number(q.reqTotal) : sumVals(q.req || q.required);
    const have = (q.progressTotal != null) ? Number(q.progressTotal)
               : sumClamp(q.progress, q.req || q.required);
    const unit = q.unit || "steps";
    const metaLine = `${have}/${need} ${esc(unit)} • ${pct}%`;

    const title = esc(q.title || q.name || q.id);
    const type = esc(typeLabel(q.type));
    const status = esc(q.status || "accepted");

    const card = document.createElement("div");
    card.className = "quest";
    card.setAttribute("data-type", q.type || "");
    card.setAttribute("data-status", status);

    card.innerHTML = `
      <div class="q-head">
        <div class="q-name">${title} <span class="q-type">(${type})</span></div>
        <div class="q-head-right">
          ${q.step != null && q.steps ? `<span class="q-step">Step ${Number(q.step) + 1}/${Number(q.steps)}</span>` : ""}
          <span class="q-badge">${status}</span>
        </div>
      </div>

      <div class="q-reqs">
        <div class="q-row-top">
          <span class="q-req-name">Progress</span>
          <span class="q-req-val">${pct}%</span>
        </div>
        <div class="q-bar"><div class="q-bar-fill" style="width:${pct}%"></div></div>
        <div class="q-meta">${metaLine}</div>
        ${q.hint ? `<div class="q-hint">${esc(q.hint)}</div>` : ""}
      </div>

      <div class="q-rew">${rewardBadges(q.reward)}</div>
      <div class="q-actions"></div>
    `;

    const act = $(".q-actions", card);

    if (status === "available") {
      const b = document.createElement("button");
      b.className = "q-btn q-btn-acc";
      b.textContent = "Accept";
      b.onclick = () => actions.accept(q.id, b);
      act.appendChild(b);
    } else if (status === "ready") {
      const b = document.createElement("button");
      b.className = "q-btn";
      b.textContent = "Claim";
      b.onclick = () => actions.claim(q.id, b);
      act.appendChild(b);
    } else if (status === "cooldown") {
      const span = document.createElement("span");
      span.className = "q-badge";
      span.title = q.cooldownEndsAt ? new Date(q.cooldownEndsAt).toLocaleString() : "Next reset";
      span.textContent = "Cooldown " + cooldownText(q.cooldownEndsAt);
      act.appendChild(span);
    }
    return card;
  }

  function sumVals(obj) {
    let s = 0; for (const k in (obj||{})) s += (Number(obj[k])||0);
    return s;
  }
  function sumClamp(progress, req) {
    let s = 0;
    const keys = Object.keys(req || {});
    for (const k of keys) {
      const need = Number(req[k]||0);
      const have = Math.min(Number((progress||{})[k]||0), need);
      s += have;
    }
    return s;
  }

  // ===== Controller =====
  const state = {
    tab: "all",
    filter: "any",
    board: null,
    el: {
      back: null,
      list: null,
      tabs: null,
      chips: null,
      status: null,
      refresh: null,
    },
    tg: null,
    debug: noop,
  };

  function setStatus(msg) {
    if (!state.el.status) return;
    state.el.status.textContent = msg || "";
    if (!msg) return;
    clearTimeout(state.el.status._t);
    state.el.status._t = setTimeout(() => { state.el.status.textContent = ""; }, 1800);
  }

  function toast(msg) {
    try {
      if (state.tg?.showPopup) { state.tg.showPopup({ message: msg }); return; }
      if (state.tg?.showAlert) { state.tg.showAlert(msg); return; }
    } catch (_) {}
    console.log("[Quests]", msg);
  }

  function renderCounters(board) {
    const items = mergeBoard(board);
    const countReady = (tab) => items.filter(x => matchTab(x, tab) && x.status === "ready").length;
    ["all","daily","repeatable","story","bounties"].forEach(tab => {
      const el = document.querySelector(`[data-count="${tab}"]`);
      if (el) el.textContent = String(countReady(tab));
    });
  }

  function renderList() {
    if (!state.el.list || !state.board) return;
    const items = sortItems(
      mergeBoard(state.board).filter(x => matchTab(x, state.tab) && matchFilter(x, state.filter))
    );

    state.el.list.innerHTML = "";
    if (!items.length) {
      state.el.list.innerHTML = `<div class="q-empty">No quests here yet.</div>`;
      return;
    }

    const actions = {
      accept: async (id, btn) => {
        try {
          btn.disabled = true;
          setStatus("Accepting…");
          await acceptQuest(id);          // UPDATED: just call and then refresh
          await refresh();                // fetch fresh state
          toast("Accepted");
        } catch (e) {
          state.debug(e);
          toast(e?.message || "Accept failed");
          btn.disabled = false;
        } finally { setStatus(""); }
      },
      claim: async (id, btn) => {
        try {
          btn.disabled = true;
          setStatus("Claiming…");
          const res = await completeQuest(id); // might contain rewardText
          await refresh();                     // UPDATED
          toast(res?.rewardText ? `Claimed: ${res.rewardText}` : "Reward claimed");
        } catch (e) {
          state.debug(e);
          toast(e?.message || "Claim failed");
          btn.disabled = false;
        } finally { setStatus(""); }
      }
    };

    const frag = document.createDocumentFragment();
    for (const q of items) frag.appendChild(makeCard(q, actions));
    state.el.list.appendChild(frag);
  }

  async function refresh() {
    if (!state.el.status) return;
    setStatus("Loading…");
    try {
      const raw = await fetchRaw();
      state.board = normalizeBoard(raw);
      renderCounters(state.board);
      renderList();
      setStatus(""); // ok
    } catch (e) {
      state.debug(e);
      const msg = (e && (e.data?.reason || e.message)) || "Failed to load";
      setStatus("Error: " + msg);
      if (state.el.list) {
        state.el.list.innerHTML = `<div class="q-empty">Failed to load quests<br><small>${esc(msg)}</small></div>`;
      }
    }
  }

  function wireUI() {
    // Tabs (categories)
    state.el.tabs?.addEventListener("click", (e) => {
      const b = e.target.closest(".q-tab");
      if (!b || !b.dataset.tab) return;
      $$(".q-tab", state.el.tabs).forEach(x => x.classList.toggle("q-tab--on", x === b));
      state.tab = b.dataset.tab;
      renderList();
    });

    // Chips (states)
    state.el.chips?.addEventListener("click", (e) => {
      const b = e.target.closest(".q-tab");
      if (!b || !b.dataset.state) return;
      $$(".q-tab", state.el.chips).forEach(x => x.classList.toggle("q-tab--on", x === b));
      state.filter = b.dataset.state;
      renderList();
    });

    // Refresh
    state.el.refresh && (state.el.refresh.onclick = () => refresh());

    // ESC to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.el.back && state.el.back.style.display === "flex") {
        state.el.back.style.display = "none";
      }
    });
  }

  // ===== Public API =====
  const Quests = {
    init({ apiPost: extApiPost, tg, dbg } = {}) {
      if (extApiPost) {
        global.S = global.S || {};
        global.S.apiPost = extApiPost;
      }
      state.tg = tg || null;
      state.debug = typeof dbg === "function" ? dbg : noop;

      state.el.back = $("#qBack");
      state.el.list = $("#qList");
      state.el.tabs = $("#qTabs");
      state.el.chips = $("#qState");
      state.el.status = $("#qStatus");
      state.el.refresh = $("#qRefresh") || $("#q-refresh");

      wireUI();
    },

    async open() {
      if (!state.el.back) {
        this.init({ apiPost: global.S?.apiPost, tg: global.Telegram?.WebApp, dbg: global.dbg || noop });
      }
      if (state.el.back) state.el.back.style.display = "flex";
      await refresh();
    }
  };

  global.Quests = Quests;
})(window);
