// public/js/quests.js
(function (global) {
  // ===== Utils =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const noop = () => {};

  function isComplete(q) {
    const req = q.req || q.required || {};
    const prg = q.progress || {};
    for (const k in req) {
      if ((prg[k] || 0) < req[k]) return false;
    }
    return true;
  }

  function progressPct(item) {
    if (item?.progressTotal != null && item?.reqTotal != null) {
      const need = Math.max(1, Number(item.reqTotal));
      const have = Math.min(Number(item.progressTotal), need);
      return Math.round(100 * have / need);
    }
    if (item?.percent != null) return Math.max(0, Math.min(100, Math.round(item.percent)));

    const req = item?.req || item?.required || {};
    const prg = item?.progress || {};
    let total = 0, done = 0;
    for (const k in req) {
      const n = Number(req[k]) || 0;
      const h = Math.min(Number(prg[k]) || 0, n);
      total += n; done += h;
    }
    return total ? Math.round(100 * done / total) : 0;
  }

  // ===== Kategorie i etykiety =====
  const TYPE_LABEL = {
Eclipse    daily: "Daily",
    weekly: "Weekly",
    story: "Story",
    chain: "Story",           // chain to też story w UI
    repeatable: "Bounty",
    bounty: "Bounty",
    bounties: "Bounty"
  };
  function typeLabel(t) {
    t = String(t || "").toLowerCase();
    return TYPE_LABEL[t] || "Quest";
  }

  // ===== Zakładki – UPORZĄDKOWANE i z Weekly! =====
  // Usunięto „all” (nadmiarowe), zostawiono tylko sensowne kategorie
  const TABS = [
    { id: "daily",   name: "Daily",   icon: "calendar-day" },
    { id: "weekly",  name: "Weekly",  icon: "calendar-week" },
    { id: "story",   name: "Story",   icon: "book-open" },
    { id: "bounty",  name: "Bounty",  icon: "crosshair" }
  ];

  // ===== API =====
  const EP = {
    list: ["/webapp/quests/state", "/webapp/daily/state", "/webapp/quests"],
    accept: ["/webapp/quests/accept", "/webapp/quest/accept"],
    complete: ["/webapp/quests/complete", "/webapp/quest/complete"],
  };

  async function apiPost(path, payload = {}) {
    if (global.S?.apiPost) return global.S.apiPost(path, payload);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.reason || res.statusText);
    return data;
  }

  async function postFirst(paths, payload) {
    let lastErr;
    for (const p of paths) {
      try { return await apiPost(p, payload); }
      catch (e) { lastErr = e; if (e.status !== 404) throw e; }
    }
    throw lastErr;
  }

  async function fetchQuests() { return postFirst(EP.list, {}); }
  async function acceptQuest(id) { return postFirst(EP.accept, { id }); }
  async function completeQuest(id) { return postFirst(EP.complete, { id }); }

  // ===== Normalizacja danych z backendu =====
  function normalizeBoard(raw) {
    if (raw?.board) raw = raw.board;
    if (raw?.ready || raw?.accepted) {
      return {
        ready: raw.ready || [],
        accepted: raw.accepted || [],
        available: raw.available || [],
        done: raw.done || []
      };
    }
    // legacy daily
    if (raw?.normal || raw?.raid) {
      const out = { ready: [], accepted: [], available: [], done: [] };
      [raw.normal, raw.raid].forEach(q => {
        if (!q) return;
        if (q.claimed || q.done) out.done.push({ ...q, status: "cooldown", type: "daily" });
        else if (q.availableActions?.length) out.available.push({ ...q, status: "available", type: "daily" });
        else out.accepted.push({ ...q, status: "accepted", type: "daily" });
      });
      return out;
    }
    // najstarszy format
    const list = Array.isArray(raw?.active) ? raw.active : raw?.quests || [];
    const out = { ready: [], accepted: [], available: [], done: [] };
    list.forEach(q => {
      if (isComplete(q)) out.ready.push({ ...q, status: "ready" });
      else out.accepted.push({ ...q, status: "accepted" });
    });
    return out;
  }

  // ===== Filtry i sortowanie =====
  const STATUS_ORDER = { ready: 0, accepted: 1, available: 2, cooldown: 3, done: 4 };

  function questTab(q) {
    const type = String(q.category || q.type || "").toLowerCase();
    if (type === "daily") return "daily";
    if (type === "weekly") return "weekly";
    if (type === "story" || type === "chain") return "story";
    return "bounty"; // repeatable / bounty / event
  }

  function matchesTab(q, tab) {
    if (tab === "all") return true;
    return questTab(q) === tab;
  }

  function sortQuests(items) {
    return items.sort((a, b) => {
      const sa = STATUS_ORDER[a.status] ?? 9;
      const sb = STATUS_ORDER[b.status] ?? 9;
      if (sa !== sb) return sa - sb;
      return (a.name || a.title || "").localeCompare(b.name || b.title || "");
    });
  }

  // ===== Renderowanie =====
  function rewardBadges(reward) {
    if (!reward) return "";
    return Object.entries(reward)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `<span class="q-badge">${esc(k)} +${esc(v)}</span>`)
      .join(" ");
  }

  function cooldownText(iso) {
    if (!iso) return "Soon";
    const left = Math.max(0, (new Date(iso) - Date.now()) / 1000);
    if (left < 60) return `${Math.floor(left)}s`;
    if (left < 3600) return `${Math.floor(left / 60)}m`;
    if (left < 86400) return `${Math.floor(left / 3600)}h`;
    return `${Math.floor(left / 86400)}d`;
  }

  function makeCard(q, actions) {
    const pct = progressPct(q);
    const type = typeLabel(q.category || q.type);
    const tab = questTab(q);
    const desc = esc(q.desc || q.description || "");
    const hint = q.hint ? `<div class="q-hint">${esc(q.hint)}</div>` : "";

    const card = document.createElement("div");
    card.className = `quest quest--${tab} quest--${q.status}`;
    card.dataset.type = tab;
    card.dataset.status = q.status;

    card.innerHTML = `
      <div class="q-head">
        <div class="q-name">${esc(q.name || q.title || q.id)} <span class="q-type">(${type})</span></div>
        ${desc ? `<div class="q-desc">${desc}</div>` : ""}
      </div>
      <div class="q-progress">
        <div class="q-bar"><div class="q-fill" style="width:${pct}%"></div></div>
        <div class="q-pct">${pct}%</div>
      </div>
      ${hint}
      <div class="q-reward">${rewardBadges(q.reward)}</div>
      <div class="q-actions"></div>
    `;

    const act = card.querySelector(".q-actions");

    if (q.status === "available") {
      const btn = document.createElement("button");
      btn.className = "q-btn q-btn-acc";
      btn.textContent = "Accept";
      btn.onclick = () => actions.accept(q.id, btn);
      act.appendChild(btn);
    }
    else if (q.status === "ready") {
      const btn = document.createElement("button");
      btn.className = "q-btn";
      btn.textContent = "Claim";
      btn.onclick = () => actions.claim(q.id, btn);
      act.appendChild(btn);
    }
    else if (q.status === "cooldown") {
      act.innerHTML = `<span class="q-cooldown">Cooldown ${cooldownText(q.cooldownEndsAt)}</span>`;
    }

    return card;
  }

  // ===== Główny kontroler =====
  const state = {
    tab: "daily",
    board: null,
    el: {},
    tg: null,
    debug: noop
  };

  function setStatus(msg) {
    if (state.el.status) state.el.status.textContent = msg || "";
  }

  function toast(msg) {
    try { state.tg?.showPopup?.({ message: msg }); }
    catch { console.log("[Quests]", msg); }
  }

  function renderTabs() {
    if (!state.el.tabs) return;
    state.el.tabs.innerHTML = TABS.map(t => `
      <button class="q-tab ${state.tab === t.id ? 'q-tab--on' : ''}" data-tab="${t.id}">
        <i class="icon-${t.icon}"></i> ${t.name}
        <span class="q-count" data-count="${t.id}">0</span>
      </button>
    `).join("");
  }

  function updateCounters() {
    if (!state.board) return;
    const all = [];
    for (const list of Object.values(state.board)) all.push(...(list || []));

    TABS.forEach(tab => {
      const count = all.filter(q => q.status === "ready" && questTab(q) === tab.id).length;
      const el = state.el.tabs?.querySelector(`[data-count="${tab.id}"]`);
      if (el) el.textContent = count || "";
    });
  }

  function renderList() {
    if (!state.el.list || !state.board) return;
    const items = [];
    for (const list of Object.values(state.board)) items.push(...(list || []));

    const filtered = items
      .filter(q => matchesTab(q, state.tab))
      .map(q => ({ ...q, status: q.status || (isComplete(q) ? "ready" : "accepted") }));

    const sorted = sortQuests(filtered);
    state.el.list.innerHTML = "";

    if (!sorted.length) {
      state.el.list.innerHTML = '<div class="q-empty">No quests in this category yet.</div>';
      return;
    }

    const actions = {
      accept: async (id, btn) => {
        btn.disabled = true; setStatus("Accepting…");
        try { await acceptQuest(id); await refresh(); toast("Quest accepted"); }
        catch (e) { toast("Failed"); btn.disabled = false; }
        finally { setStatus(""); }
      },
      claim: async (id, btn) => {
        btn.disabled = true; setStatus("Claiming…");
        try { const res = await completeQuest(id); await refresh(); toast(res?.rewardText || "Reward claimed!"); }
        catch (e) { toast("Failed"); btn.disabled = false; }
        finally { setStatus(""); }
      }
    };

    const frag = document.createDocumentFragment();
    sorted.forEach(q => frag.appendChild(makeCard(q, actions)));
    state.el.list.appendChild(frag);
  }

  async function refresh() {
    setStatus("Loading quests…");
    try {
      const raw = await fetchQuests();
      state.board = normalizeBoard(raw);
      updateCounters();
      renderList();
      setStatus("");
    } catch (e) {
      state.debug(e);
      setStatus("Error loading quests");
      state.el.list.innerHTML = `<div class="q-empty">Failed to load<br><small>${esc(e.message)}</small></div>`;
    }
  }

  function initUI() {
    state.el.back = $("#qBack");
    const root = state.el.back || document;
    state.el.list = $("#qList", root);
    state.el.tabs = $("#qTabs", root);
    state.el.status = $("#qStatus", root);
    state.el.refresh = $("#qRefresh", root) || $("#q-refresh", root);

    renderTabs();

    state.el.tabs.addEventListener("click", e => {
      const btn = e.target.closest(".q-tab");
      if (!btn) return;
      const tab = btn.dataset.tab;
      $$(".q-tab", state.el.tabs).forEach(b => b.classList.toggle("q-tab--on", b === btn));
      state.tab = tab;
      renderList();
    });

    state.el.refresh && (state.el.refresh.onclick = refresh);

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && state.el.back?.style.display === "flex") {
        state.el.back.style.display = "none";
      }
    });
  }

  // ===== Public API =====
  global.Quests = {
    init({ tg, debug } = {}) {
      state.tg = tg || global.Telegram?.WebApp || null;
      state.debug = debug || noop;
      initUI();
    },
    async open() {
      if (!state.el.back) this.init();
      state.el.back.style.display = "flex";
      await refresh();
    }
  };

})(window);
