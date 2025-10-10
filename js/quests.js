// public/js/quests.js
(function (global) {
  // ---- utils ---------------------------------------------------------------
  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const byId = (id) => document.getElementById(id);

  async function post(path, payload) {
    // zgodne z Twoim S.apiPost; fallback na fetch gdyby nie było S
    const res = await (global.S && global.S.apiPost ? global.S.apiPost(path, payload || {}) : fetch(path, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload || {})
    }).then(r=>r.json()));
    return (res && res.data) ? res.data : res;
  }

  const endpoints = {
    list:  "/webapp/quests",
    action: "/webapp/quests/action",       // preferowane
    accept_legacy: "/webapp/quest/accept", // fallback
  };

  // ---- API -----------------------------------------------------------------
  async function fetchQuests() {
    const data = await post(endpoints.list, {});
    if (!data || data.ok === false) throw new Error(data?.reason || "Failed to fetch quests");
    return data;
  }
  async function acceptQuest(id) {
    let data = await post(endpoints.action, { action:"accept", questId:id });
    if (!data || data.ok === false) {
      data = await post(endpoints.accept_legacy, { id });
    }
    if (!data || data.ok === false) throw new Error(data?.reason || data?.msg || "Failed to accept quest");
    return data;
  }

  // ---- UI (modal) ----------------------------------------------------------
  function ensureModal() {
    let wrap = byId("quests-modal");
    if (wrap) return wrap;
    wrap = document.createElement("div");
    wrap.id = "quests-modal";
    wrap.className = "q-modal";
    wrap.innerHTML = `
      <div class="q-modal-body">
        <div class="q-modal-head">
          <h2 class="q-title">Mission Board</h2>
          <div class="q-head-actions">
            <button id="q-refresh" type="button" class="q-btn q-btn-ghost" aria-label="refresh">↻</button>
            <button id="q-close" type="button" class="q-btn q-btn-ghost" aria-label="close">×</button>
          </div>
        </div>
        <div id="q-status" class="q-status"></div>
        <div class="q-filters" id="q-filters" hidden>
          <button class="q-tab q-tab--on" data-f="all">All</button>
          <button class="q-tab" data-f="daily">Daily</button>
          <button class="q-tab" data-f="repeatable">Repeatable</button>
          <button class="q-tab" data-f="chain">Story</button>
        </div>
        <div id="quest-board" class="quest-board"></div>
      </div>`;
    document.body.appendChild(wrap);
    byId("q-close").onclick = () => { wrap.remove(); };
    byId("q-refresh").onclick = () => { Quests.fetch(); };
    return wrap;
  }

  function reqProgressRows(q) {
    const rows = [];
    const req = q.req || {};
    const prog = q.progress || {};
    for (const k of Object.keys(req)) {
      const need = Number(req[k] || 0);
      const have = Number(prog[k] || 0);
      const pct = need > 0 ? Math.min(100, Math.floor((have/need)*100)) : 0;
      rows.push(`
        <div class="q-row">
          <div class="q-row-top">
            <span class="q-req-name">${esc(k)}</span>
            <span class="q-req-val">${have}/${need}</span>
          </div>
          <div class="q-bar"><div class="q-bar-fill" style="width:${pct}%"></div></div>
        </div>
      `);
    }
    return rows.join("");
  }

  function rewardBadgeList(reward) {
    const items = [];
    for (const [k,v] of Object.entries(reward || {})) {
      items.push(`<span class="q-badge">${esc(k)} +${esc(v)}</span>`);
    }
    return items.join(" ");
  }

  function isQuestDone(q) {
    const req = q.req || {};
    const prog = q.progress || {};
    for (const [k,v] of Object.entries(req)) {
      if ((prog[k] || 0) < v) return false;
    }
    return Object.keys(req).length > 0;
  }

  function card(q) {
    const done = isQuestDone(q);
    const acceptBtn = (q.type === "repeatable")
      ? `<button class="q-btn q-btn-acc" data-accept="${esc(q.id)}">Accept</button>`
      : "";
    const stepInfo = (q.steps && typeof q.step !== "undefined")
      ? `<span class="q-step">Step ${Number(q.step)+1}/${Number(q.steps)}</span>`
      : "";
    const doneTag = done ? `<span class="q-done">Complete</span>` : "";

    return `
      <div class="quest" data-type="${esc(q.type)}">
        <div class="q-head">
          <div class="q-name">${esc(q.name)} <span class="q-type">(${esc(q.type)})</span></div>
          <div class="q-head-right">
            ${stepInfo}
            ${doneTag}
          </div>
        </div>
        <div class="q-reqs">${reqProgressRows(q)}</div>
        <div class="q-rew">${rewardBadgeList(q.reward)}</div>
        <div class="q-actions">${acceptBtn}</div>
      </div>
    `;
  }

  function bindCardEvents(root) {
    root.querySelectorAll("[data-accept]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-accept");
        btn.disabled = true;
        setStatus("Accepting quest…");
        try {
          await acceptQuest(id);
          await Quests.fetch();
          setStatus("Accepted ✔");
        } catch (e) {
          console.error(e);
          setStatus("Failed to accept quest.");
          btn.disabled = false;
        }
      });
    });
  }

  function setStatus(s, kind) {
    const el = byId("q-status");
    if (!el) return;
    el.textContent = s || "";
    el.className = `q-status ${kind || ""}`;
    if (s) {
      clearTimeout(el._t);
      el._t = setTimeout(()=>{ el.textContent = ""; }, 2000);
    }
  }

  function bindFilters() {
    const filters = byId("q-filters");
    if (!filters) return;
    filters.hidden = false;
    filters.addEventListener("click", (e) => {
      const b = e.target.closest(".q-tab");
      if (!b) return;
      filters.querySelectorAll(".q-tab").forEach(x=>x.classList.remove("q-tab--on"));
      b.classList.add("q-tab--on");
      const f = b.getAttribute("data-f");
      const cards = document.querySelectorAll(".quest-board .quest");
      cards.forEach(c => {
        const t = c.getAttribute("data-type");
        c.style.display = (f === "all" || t === f) ? "" : "none";
      });
    });
  }

  // ---- public API ----------------------------------------------------------
  const Quests = {
    async open() {
      ensureModal();
      await this.fetch();
      bindFilters();
    },
    async fetch() {
      const board = byId("quest-board") || ensureModal().querySelector("#quest-board");
      board.innerHTML = `<div class="q-loader">Loading quests…</div>`;
      try {
        const data = await fetchQuests();
        const list = data.active || [];
        if (data.warning === "QUESTS_MODULE_MISSING") setStatus("Quests module not found on server.", "warn");
        if (!list.length) { board.innerHTML = `<div class="q-empty">No quests available right now.</div>`; return; }
        board.innerHTML = list.map(card).join("");
        bindCardEvents(board);
      } catch (e) {
        console.error(e);
        board.innerHTML = `<div class="q-empty">Failed to load quests.</div>`;
      }
    }
  };

  global.Quests = Quests;
})(window);
