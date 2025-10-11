// public/js/quests.js
(function (global) {
  // ===== Utils =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const noop = () => {};

  // Percent by summing all required keys (caps progress at requirement)
  function progressPct(item) {
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

  // Badge label for quest type
  function typeLabel(t) {
    if (t === "chain" || t === "story") return "Story";
    if (t === "daily") return "Daily";
    if (t === "repeatable") return "Repeatable";
    if (t === "bounty") return "Bounty";
    return String(t || "Quest");
  }

  // ===== API layer =====
  const endpoints = {
    list: "/webapp/quests",
    accept: "/webapp/quest/accept",
    complete: "/webapp/quest/complete",
  };

  async function apiPost(path, payload) {
    // prefer S.apiPost z index.html
    if (global.S && typeof global.S.apiPost === "function") {
      return await global.S.apiPost(path, payload || {});
    }
    // twardy fallback
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.reason || res.statusText), { status: res.status, data });
    return data;
  }

  async function fetchBoard() {
    const out = await apiPost(endpoints.list, {});
    // obsługa formatu { ok, data } i „gołego” payloadu
    if (out && out.ok === false) throw new Error(out.error || out.reason || "Failed to fetch quests");
    return out.data || out;
  }

  async function acceptQuest(quest_id) {
    const out = await apiPost(endpoints.accept, { quest_id });
    if (!out || out.ok === false) throw new Error(out.error || out.reason || "Accept failed");
    return out.data || out;
  }

  async function completeQuest(quest_id) {
    const out = await apiPost(endpoints.complete, { quest_id });
    if (!out || out.ok === false) throw new Error(out.error || out.reason || "Claim failed");
    return out.data || out;
  }

  // ===== Rendering =====
  const STATUS_ORDER = { ready: 0, accepted: 1, available: 2, cooldown: 3 };
  const TABS = ["all", "daily", "repeatable", "story", "bounties"];

  function mergeBoard(board) {
    const add = (arr, status) => (arr || []).map(q => ({ ...q, status }));
    // mapuj done -> cooldown
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
    const title = esc(q.title || q.name || q.id);
    const type = esc(typeLabel(q.type));
    const status = esc(q.status);

    const card = document.createElement("div");
    card.className = "quest";
    card.setAttribute("data-type", q.type || "");
    card.setAttribute("data-status", q.status || "");

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
      </div>

      <div class="q-rew">${rewardBadges(q.reward)}</div>
      <div class="q-actions"></div>
    `;

    const act = $(".q-actions", card);

    if (q.status === "available") {
      const b = document.createElement("button");
      b.className = "q-btn q-btn-acc";
      b.textContent = "Accept";
      b.onclick = () => actions.accept(q.id, b);
      act.appendChild(b);
    } else if (q.status === "ready") {
      const b = document.createElement("button");
      b.className = "q-btn";
      b.textContent = "Claim";
      b.onclick = () => actions.claim(q.id, b);
      act.appendChild(b);
    } else if (q.status === "cooldown") {
      const span = document.createElement("span");
      span.className = "q-badge";
      span.title = q.cooldown_end ? new Date(q.cooldown_end).toLocaleString() : "Next reset";
      span.textContent = "Cooldown " + cooldownText(q.cooldown_end);
      act.appendChild(span);
    }
    return card;
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
    TABS.forEach(tab => {
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
          const data = await acceptQuest(id);
          state.board = data || state.board;
          renderCounters(state.board);
          renderList();
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
          const data = await completeQuest(id);
          state.board = data || state.board;
          renderCounters(state.board);
          renderList();
          toast("Reward claimed");
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
      const board = await fetchBoard();
      state.board = board;
      renderCounters(board);
      renderList();
      setStatus("");
    } catch (e) {
      state.debug(e);
      setStatus("Failed to load");
      if (state.el.list) state.el.list.innerHTML = `<div class="q-empty">Failed to load quests.</div>`;
    }
  }

  function wireUI() {
    // Tabs
    state.el.tabs?.addEventListener("click", (e) => {
      const b = e.target.closest(".q-tab");
      if (!b || !b.dataset.tab) return;
      $$(".q-tab", state.el.tabs).forEach(x => x.classList.toggle("q-tab--on", x === b));
      state.tab = b.dataset.tab;
      renderList();
    });

    // Chips (state filter)
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
      // pozwól nadpisać transport (z index.js już przekazujemy)
      if (extApiPost) {
        // podmieniamy nasz apiPost przez referencję
        // (zachowujemy fallbacki gdyby ktoś otworzył poza TG)
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
      // Bind elements if init wasn't called (defensive)
      if (!state.el.back) {
        this.init({ apiPost: global.S?.apiPost, tg: global.Telegram?.WebApp, dbg: global.dbg || noop });
      }
      if (state.el.back) state.el.back.style.display = "flex";
      await refresh();
    }
  };

  global.Quests = Quests;
})(window);
