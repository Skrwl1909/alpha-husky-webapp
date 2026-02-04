// public/js/quests.js
(function (global) {
  // ===== Utils =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const noop = () => {};

  function mkRunId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  // ===== Cloudinary (Legendary Path main reward preview) =====
  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload/";
  const LP_CLOUD_VER = "v1769370188"; // <- z Twoich działających ikon

  // ✅ prefix dla ikon gear (dokładnie jak w lp_ashclaw)
const LP_EQUIP_PREFIX = "v1769370188/equip/";

  // accepts:
  // - full URL: https://res.cloudinary.com/.../image/upload/v123/folder/file.png
  // - path after /upload/: v123/folder/file.png
  // - plain path: folder/file.png
  function cdn(src) {
    const s = String(src || "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    return CLOUD_BASE + s.replace(/^\/+/, "");
  }

  // ✅ ONE MAIN REWARD per track (shown once on the card, not per step)
 // (optional) fallback map — możesz zostawić tylko lp_ashclaw, reszta poleci auto z previewLoot
const LP_TRACK_REWARD = {
  "lp_ashclaw": {
    icon: "v1769370188/equip/rustfire_seraph_helmet.png",
    name: "Rustfire Seraph Helmet"
  }
};

  function _lpCfgAuto(q) {
  const id = String(q?.id || "").toLowerCase();
  const nm = String(q?.name || "").toLowerCase();
  const ds = String(q?.desc || "").toLowerCase();
  const hay = `${id} ${nm} ${ds}`;

  const mk = (slot, label) => ({
    icon: `${LP_CLOUD_VER}/equip/rustfire_seraph_${slot}.png`,
    name: label
  });

  if (hay.includes("ashclaw")) return mk("helmet", "Rustfire Seraph Helmet");
  if (hay.includes("eternal alpha") || hay.includes("legendary_alpha_final")) return mk("weapon", "Rustfire Seraph Weapon");
  if (hay.includes("forge") || hay.includes("legendary_forge_final") || hay.includes("smith")) return mk("offhand", "Rustfire Seraph Offhand");
  if (hay.includes("bond") || hay.includes("true companion") || hay.includes("legendary_pet_final")) return mk("collar", "Rustfire Seraph Collar");
  if (hay.includes("void") || hay.includes("explorer") || hay.includes("legendary_explorer_final")) return mk("armor", "Rustfire Seraph Armor");
  if (hay.includes("tycoon") || hay.includes("bone emperor") || hay.includes("legendary_tycoon_final")) return mk("cloak", "Rustfire Seraph Cloak");

  return null;
}
  
function _getTrackId(q) {
  return String(q?.id || q?.trackId || q?.lpTrackId || "").trim();
}

function _slug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function _title(s) {
  s = String(s || "").replace(/[_\-]+/g, " ").trim();
  return s ? s.replace(/\b\w/g, m => m.toUpperCase()) : "";
}

// icon resolver: supports /assets/*, full URLs, and Cloudinary paths
function _iconSrc(src) {
  const s = String(src || "").trim();
  if (!s) return "";
  if (s.startsWith("/assets/")) return s;
  return cdn(s); // cdn() already accepts full URLs / cloudinary paths
}

// pick preview loot: server previewLoot > track loot[0] > first step loot[0]
function _pickPreviewLoot(q) {
  if (q && typeof q.previewLoot === "object" && q.previewLoot) return q.previewLoot;

  if (Array.isArray(q?.loot) && q.loot[0] && typeof q.loot[0] === "object") return q.loot[0];

  const steps = Array.isArray(q?.steps) ? q.steps : null;
  if (steps) {
    for (const s of steps) {
      const ll = s?.loot;
      if (Array.isArray(ll) && ll[0] && typeof ll[0] === "object") return ll[0];
    }
  }
  return null;
}

function _lootToRewardCfg(loot) {
  if (!loot || typeof loot !== "object") return null;

  // if backend ever adds explicit icon/name, use it
  const icon = loot.icon || loot.image || loot.img || "";
  const name = loot.name || loot.label || "";

  if (icon || name) {
    return { icon: icon || "", name: name || "Final Reward" };
  }

  // gear: derive from set+slot
  if (String(loot.type || "").toLowerCase() === "gear") {
    const set = loot.set || loot.set_name || loot.set_id || "";
    const slot = loot.slot || "";
    const setSlug = _slug(set);
    const slotSlug = _slug(slot);

    // local assets path (recommended)
    const localIcon = (setSlug && slotSlug)
      ? `/assets/equip/${setSlug}_${slotSlug}.png`
      : "";

    const humanName = (set && slot)
      ? `${_title(setSlug)} ${_title(slotSlug)}`
      : "Final Reward";

    return { icon: localIcon, name: humanName };
  }

  return null;
}

function _renderTrackReward(q) {
  const trackId = _getTrackId(q);

  // 1) manual map, jeśli jest
  let cfg = LP_TRACK_REWARD?.[trackId];

  // 2) auto fallback po id/name/desc
  if (!cfg) cfg = _lpCfgAuto(q);

  if (!cfg) return "";

  const iconUrl = cdn(cfg.icon); // cfg.icon = "v.../equip/xxx.png"
  const name = esc(cfg.name || "Main reward");

  const img = iconUrl
    ? `<img class="q-track-reward-icon"
            src="${esc(iconUrl)}"
            alt=""
            loading="lazy"
            decoding="async"
            style="width:22px;height:22px;max-width:22px;max-height:22px;object-fit:cover;border-radius:6px;flex:0 0 22px;display:block;"
            onerror="this.style.display='none'">`
    : "";

  return `
    <div class="q-track-reward" data-track-reward="1">
      <span class="q-track-reward-label">Main reward</span>
      ${img}
      <span class="q-track-reward-name">${name}</span>
    </div>
  `;
}

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
    t = String(t || "").toLowerCase();
    if (t === "daily") return "Daily";
    if (t === "story") return "Story";
    if (t === "chain") return "Story";
    if (t === "repeatable") return "Repeatable";
    if (t === "legendary" || t === "legendary_path" || t === "legendarypath") return "Legendary Path";
    if (t === "bounty" || t === "bounties") return "Bounty";
    return "Quest";
  }

  function statusLabel(s) {
    s = String(s || "").toLowerCase();
    if (s === "ready") return "Ready";
    if (s === "accepted") return "In progress";
    if (s === "available") return "Available";
    if (s === "cooldown") return "Cooldown";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ✅ Track meta jako doneSteps/totalSteps (nie suma 10+20+5)
  function stepsTotals(stepsArr) {
    const steps = Array.isArray(stepsArr) ? stepsArr : [];
    const total = steps.length;
    let done = 0;
    for (const s of steps) {
      const need = Number(s?.need ?? 0) || 0;
      const cur = Number(s?.cur ?? 0) || 0;
      const claimed = !!s?.claimed;
      const claimable = !claimed && need > 0 && cur >= need;
      if (claimed || claimable) done += 1;
    }
    const pct = total > 0 ? Math.round(100 * done / total) : 0;
    return { have: done, need: Math.max(1, total), pct: Math.max(0, Math.min(100, pct)) };
  }

  function anyLegendaryStepClaimable(q) {
    const steps = Array.isArray(q?.steps) ? q.steps
      : (Array.isArray(q?.trackSteps) ? q.trackSteps : null);
    if (!steps || !steps.length) return false;
    return steps.some((s) => {
      const sid = String(s?.id || s?.stepId || "").trim();
      const need = Number(s?.need ?? 0) || 0;
      const cur = Number(s?.cur ?? 0) || 0;
      const claimed = !!s?.claimed;
      return !!sid && !claimed && need > 0 && cur >= need;
    });
  }

  // ===== API =====
  const EP = {
    list: ["/webapp/quests/state", "/webapp/daily/state", "/webapp/quests"],
    accept: ["/webapp/quests/accept", "/webapp/quest/accept"],
    complete: ["/webapp/quests/complete", "/webapp/quest/complete"],
  };

  async function apiPostRaw(path, payload) {
    if (global.S && typeof global.S.apiPost === "function") {
      return await global.S.apiPost(path, payload || {});
    }

    // ✅ fallback: doklej init_data żeby nie było 401 gdy S.apiPost nie jest ustawione
    const p = { ...(payload || {}) };
    if (!("init_data" in p) && !("initData" in p)) {
      const initData = global.Telegram?.WebApp?.initData || "";
      if (initData) p.init_data = initData;
    }

    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.reason || res.statusText);
      err.status = res.status; err.data = data; err.path = path;
      throw err;
    }
    return data;
  }

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
    const out = await postFirstOk(EP.list, {}) || {};
    return out;
  }

  async function acceptQuest(id, run_id) {
    return postFirstOk(EP.accept, { id, questId: id, run_id });
  }
  async function completeQuest(id, run_id) {
    return postFirstOk(EP.complete, { id, questId: id, run_id });
  }

  // Legendary Path: claim specific step via stepId
  async function claimLegendaryStep(trackId, stepId, run_id) {
    return postFirstOk(EP.complete, { id: trackId, questId: trackId, stepId, run_id });
  }

  function normalizeBoard(payload) {
    if (!payload) payload = {};

    // 0) unwrap { ok:true, data:{...} }
    if (payload && payload.ok === true && payload.data) payload = payload.data;

    // 1) Nowy format opakowany: { ok, board:{ready,accepted,...}, ... }
    if (
      payload.board &&
      (payload.board.ready || payload.board.accepted || payload.board.available || payload.board.done)
    ) {
      payload = payload.board;
    }

    // 2) Nowy format (grupowany bezpośrednio na root)
    const hasNew = payload && (payload.ready || payload.accepted || payload.available || payload.done);
    if (hasNew) {
      return {
        ready: payload.ready || [],
        accepted: payload.accepted || [],
        available: payload.available || [],
        done: payload.done || [],
      };
    }

    // 2b) Format: { quests:[...], board:[...] } (active + mission board)
    if (payload && (Array.isArray(payload.quests) || Array.isArray(payload.board))) {
      const out = { ready: [], accepted: [], available: [], done: [] };

      const active = Array.isArray(payload.quests) ? payload.quests : [];
      for (const q of active) {
        // jeśli track ma claimable step, traktuj jak ready (UX)
        const stepsArr = Array.isArray(q.steps) ? q.steps : (Array.isArray(q.trackSteps) ? q.trackSteps : null);
        const trackReady = Array.isArray(stepsArr) && stepsArr.length && anyLegendaryStepClaimable({ steps: stepsArr });

        const ready = trackReady ? true : ((q.ready === true) ? true : isComplete(q));
        if (ready) out.ready.push({ ...q, status: q.status || "ready" });
        else out.accepted.push({ ...q, status: q.status || "accepted" });
      }

      const board = Array.isArray(payload.board) ? payload.board : [];
      for (const q of board) {
        const s = String(q.status || "available").toLowerCase();
        if (s === "ready") out.ready.push({ ...q, status: "ready" });
        else if (s === "accepted") out.accepted.push({ ...q, status: "accepted" });
        else if (s === "cooldown" || s === "done") out.done.push({ ...q, status: "cooldown" });
        else out.available.push({ ...q, status: "available" });
      }

      return out;
    }

    // 3) Obsługa daily legacy {normal, raid}
    if (payload && (payload.normal || payload.raid)) {
      const out = { ready: [], accepted: [], available: [], done: [] };

      if (payload.normal) {
        const q = payload.normal;
        if (q.claimed || q.done) out.done.push({ ...q, status: "cooldown" });
        else if (q.availableActions && q.availableActions.length > 0) out.available.push({ ...q, status: "available", type: "daily" });
        else out.accepted.push({ ...q, status: "accepted", type: "daily" });
      }

      if (payload.raid) {
        const q = payload.raid;
        if (q.claimed || q.done) out.done.push({ ...q, status: "cooldown" });
        else if (q.availableActions && q.availableActions.length > 0) out.available.push({ ...q, status: "available", type: "daily" });
        else out.accepted.push({ ...q, status: "accepted", type: "daily" });
      }

      return out;
    }

    // 4) Legacy fallback – active/quests jako accepted/ready
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

  // ===== Rendering =====
  const STATUS_ORDER = { ready: 0, accepted: 1, available: 2, cooldown: 3 };
  const TABS = ["all", "daily", "legendary", "story", "repeatable", "bounties"];

  function mergeBoard(board) {
    const add = (arr, status) => (arr || []).map(q => ({ ...q, status }));
    return [
      ...add(board.ready, "ready"),
      ...add(board.accepted, "accepted"),
      ...add(board.available, "available"),
      ...add(board.done, "cooldown"),
    ];
  }

  function questCategory(item) {
    return (item && (item.category || item.type || "")).toString();
  }

  function matchTab(item, tab) {
    const cat = questCategory(item).toLowerCase();
    if (tab === "all") return true;
    if (tab === "daily") return cat === "daily";
    if (tab === "story") return (cat === "story" || cat === "chain");
    if (tab === "repeatable") return cat === "repeatable";
    if (tab === "legendary") return (cat === "legendary" || cat === "legendary_path" || cat === "legendarypath");
    if (tab === "bounties") return (cat === "bounties" || cat === "bounty");
    return true;
  }

  function matchFilter(item, filter) {
    if (filter === "any") return true;
    return item.status === filter;
  }

  function sortItems(items) {
    return items.sort((a, b) => {
      // legendary track first (nice UX)
      const al = matchTab(a, "legendary") ? 0 : 1;
      const bl = matchTab(b, "legendary") ? 0 : 1;
      if (al !== bl) return al - bl;

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

  function sumVals(obj) {
    let s = 0; for (const k in (obj || {})) s += (Number(obj[k]) || 0);
    return s;
  }
  function sumClamp(progress, req) {
    let s = 0;
    const keys = Object.keys(req || {});
    for (const k of keys) {
      const need = Number(req[k] || 0);
      const have = Math.min(Number((progress || {})[k] || 0), need);
      s += have;
    }
    return s;
  }

  function makeCard(q, actions) {
    const cat = questCategory(q);
    const title = esc(q.title || q.name || q.id);
    const typeRaw = q.type || cat;
    const type = esc(typeLabel(typeRaw));

    // track steps alias
    const stepsArr = Array.isArray(q.steps) ? q.steps : (Array.isArray(q.trackSteps) ? q.trackSteps : null);
    const hasSteps = Array.isArray(stepsArr) && stepsArr.length > 0;

    // ✅ UI-ready: jeśli track ma claimable step, pokazuj status Ready
    let statusRaw = q.status || "accepted";
    if (hasSteps && anyLegendaryStepClaimable({ steps: stepsArr })) statusRaw = "ready";
    const status = esc(statusLabel(statusRaw));

    const desc = q.desc || q.description || "";
    const hint = q.hint || q.tips || "";
    const reqLines = Array.isArray(q.reqLines) ? q.reqLines : null;

    // Meta/progress
    let pct = progressPct(q);
    let need = (q.reqTotal != null) ? Number(q.reqTotal) : sumVals(q.req || q.required);
    let have = (q.progressTotal != null) ? Number(q.progressTotal) : sumClamp(q.progress, q.req || q.required);
    let unit = q.unit || "actions";

    // If legendary steps exist and backend didn't send totals: compute doneSteps/totalSteps
    if (hasSteps && (q.reqTotal == null || q.progressTotal == null)) {
      const t = stepsTotals(stepsArr);
      have = t.have;
      need = t.need;
      pct = t.pct;
      unit = q.unit || "steps";
    }

    const metaLine = `${have}/${need} ${esc(unit)} • ${pct}%`;

    // ✅ show ONE main reward for whole track
    const trackRewardHtml = hasSteps ? _renderTrackReward(q) : "";

    const card = document.createElement("div");
    card.className = "quest";
    card.setAttribute("data-type", cat || "");
    card.setAttribute("data-status", statusRaw);

    card.innerHTML = `
      <div class="q-head">
        <div class="q-name-wrapper">
          <div class="q-name">
            ${title} <span class="q-type">(${type})</span>
          </div>
          ${desc ? `<div class="q-desc">${esc(desc)}</div>` : ""}
          ${trackRewardHtml}
        </div>
        <div class="q-head-right">
          ${q.step != null && q.steps && !hasSteps
            ? `<span class="q-step">Step ${Number(q.step) + 1}/${Number(q.steps)}</span>`
            : ""
          }
          <span class="q-badge">${status}</span>
        </div>
      </div>

      <div class="q-reqs">
        <div class="q-row-top">
          <span class="q-req-name">Progress</span>
          <span class="q-req-val">${pct}%</span>
        </div>
        <div class="q-bar">
          <div class="q-bar-fill" style="width:${pct}%"></div>
        </div>

        ${reqLines
          ? `<div class="q-req-lines">
              ${reqLines.map(r => `
                <div class="q-req-line">
                  <span class="q-req-line-name">${esc(r.label || r.key || "Req")}</span>
                  <span class="q-req-line-val">${esc(r.cur ?? 0)}/${esc(r.need ?? 0)}${r.unit ? " " + esc(r.unit) : ""}</span>
                </div>
              `).join("")}
            </div>`
          : ""
        }

        <div class="q-meta">${metaLine}</div>
        ${hint ? `<div class="q-hint">${esc(hint)}</div>` : ""}
      </div>

      <div class="q-rew">${rewardBadges(q.reward)}</div>
      <div class="q-actions"></div>
    `;

    const act = $(".q-actions", card);

    // === Legendary Track render (3-step card) ===
    if (hasSteps) {
      if (act) act.innerHTML = "";

      const reqs = $(".q-reqs", card);
      const wrap = document.createElement("div");
      wrap.className = "q-steps-wrap";

      stepsArr.forEach((s) => {
        const sid = String(s.id || s.stepId || "").trim();
        const needS = Number(s.need ?? 0) || 0;
        const curS = Number(s.cur ?? 0) || 0;
        const claimed = !!s.claimed;
        const claimable = !!sid && !claimed && needS > 0 && curS >= needS;

        const stepTitle = (s.label || s.title || sid || "Step");

        const row = document.createElement("div");
        row.className = "q-step-row";
        row.innerHTML = `
          <div class="q-step-left">
            <div class="q-step-title"><span>${esc(stepTitle)}</span></div>
            <div class="q-step-sub">${esc(curS)}/${esc(needS)}${s.unit ? " " + esc(s.unit) : ""}</div>
          </div>
          <div class="q-step-right"></div>
        `;

        const right = $(".q-step-right", row);

        if (claimed) {
          const badge = document.createElement("span");
          badge.className = "q-badge";
          badge.textContent = "Claimed";
          right.appendChild(badge);
        } else {
          const btn = document.createElement("button");
          btn.className = "q-btn q-btn-acc";
          btn.textContent = claimable ? "Claim" : (curS > 0 ? "In progress" : "Locked");
          btn.disabled = !claimable;
          btn.onclick = () => actions.legendaryClaim(q.id, sid, btn);
          right.appendChild(btn);
        }

        wrap.appendChild(row);
      });

      if (reqs) reqs.appendChild(wrap);
      return card;
    }

    // === Default behavior for normal quests ===
    if (statusRaw === "available") {
      // Legacy daily → /webapp/daily/action
      if (q.type === "daily" && Array.isArray(q.availableActions) && q.availableActions.length) {
        const action = q.availableActions.includes("daily_claim")
          ? "daily_claim"
          : q.availableActions[0];
        const isRaid = !!(q.raid || q.isRaid || /raid/i.test(String(q.id || "")));
        const b = document.createElement("button");
        b.className = "q-btn q-btn-acc";
        b.textContent = action === "daily_claim" ? "Claim" : "Do it";
        b.onclick = () => actions.daily(action, isRaid, b);
        act.appendChild(b);
      } else {
        const b = document.createElement("button");
        b.className = "q-btn q-btn-acc";
        b.textContent = "Accept";
        b.onclick = () => actions.accept(q.id, b);
        act.appendChild(b);
      }
    } else if (statusRaw === "ready") {
      const b = document.createElement("button");
      b.className = "q-btn";
      b.textContent = "Claim";
      b.onclick = () => actions.claim(q.id, b);
      act.appendChild(b);
    } else if (statusRaw === "cooldown") {
      const span = document.createElement("span");
      span.className = "q-badge";
      span.title = q.cooldownEndsAt ? new Date(q.cooldownEndsAt).toLocaleString() : "Next reset";
      span.textContent = "Cooldown " + cooldownText(q.cooldownEndsAt);
      act.appendChild(span);
    }

    return card;
  }

  // ===== Controller =====
  const state = {
    tab: "all",
    filter: "any",
    board: null,
    lpOpen: new Set(), // ✅ 2A: pamięta otwarty LP quest (accordion)
    _wired: false,
    el: {
      back: null,
      list: null,
      tabs: null,
      chips: null,
      status: null,
      refresh: null,
      close: null,
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
    } catch (_) { }
    console.log("[Quests]", msg);
  }

  function closeModal() {
    try {
      if (global.navCloseTop) { global.navCloseTop(); return; }
    } catch (_) { }
    if (state.el.back) state.el.back.style.display = "none";
  }

  // ✅ 2B: Legendary Path accordion (collapse details until expanded)
  function applyLegendaryAccordion(card, qid, defaultCollapsed) {
    if (!card) return;
    const id = String(qid || "").trim();
    if (!id) return;

    const head = $(".q-head", card);
    const headRight = $(".q-head-right", card);
    const reqs = $(".q-reqs", card);
    const rew = $(".q-rew", card);
    const act = $(".q-actions", card);

    card.classList.add("quest--lp");
    card.dataset.qid = id;

    // Wrap body (details) so we can collapse everything except the header (+ main reward)
    let body = $(".q-acc-body", card);
    if (!body) {
      body = document.createElement("div");
      body.className = "q-acc-body";
      if (head) head.insertAdjacentElement("afterend", body);

      if (reqs) body.appendChild(reqs);
      if (rew) body.appendChild(rew);
      if (act) body.appendChild(act);
    }

    // Toggle button (chevron)
    let tbtn = $(".q-acc-toggle", card);
    if (!tbtn && headRight) {
      tbtn = document.createElement("button");
      tbtn.type = "button";
      tbtn.className = "q-acc-toggle";
      tbtn.setAttribute("aria-label", "Toggle details");
      tbtn.innerHTML = `<span class="q-acc-chevron">▾</span>`;
      headRight.prepend(tbtn);
    }

    function setOpen(open, silent) {
      card.classList.toggle("is-open", !!open);
      if (tbtn) tbtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (!silent) {
        if (open) state.lpOpen.add(id);
        else state.lpOpen.delete(id);
      }
    }

    function closeOthers() {
      if (!state.el.list) return;
      $$(".quest--lp.is-open", state.el.list).forEach(el => {
        if (el === card) return;
        el.classList.remove("is-open");
        const bid = el.dataset.qid;
        if (bid) state.lpOpen.delete(bid);
        const b = el.querySelector(".q-acc-toggle");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }

    const wantOpen = state.lpOpen.has(id) ? true : false; // ✅ default closed always
setOpen(wantOpen, true);

    const toggle = () => {
      const open = !card.classList.contains("is-open");
      if (open) closeOthers();
      setOpen(open, false);
    };

    if (tbtn) {
      tbtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); toggle(); };
    }

    if (head) {
      head.style.cursor = "pointer";
      head.addEventListener("click", (e) => {
        if (e.target.closest("button")) return; // don't toggle when clicking buttons in header
        toggle();
      });
    }
  }

  function renderCounters(board) {
    const items = mergeBoard(board);

    const isReadyForTab = (x, tab) => {
      if (!matchTab(x, tab)) return false;
      if (tab === "legendary" && anyLegendaryStepClaimable(x)) return true;
      return x.status === "ready";
    };

    TABS.forEach(tab => {
      const scope = state.el.tabs || state.el.back || document;
      const el = scope.querySelector(`[data-count="${tab}"]`);
      if (el) {
        const c = items.filter(x => isReadyForTab(x, tab)).length;
        el.textContent = String(c);
      }
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
          await acceptQuest(id, mkRunId("qacc"));
          await refresh();
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
          const res = await completeQuest(id, mkRunId("qcmp"));
          await refresh();
          toast(res?.rewardText ? `Claimed: ${res.rewardText}` : "Reward claimed");
        } catch (e) {
          state.debug(e);
          toast(e?.message || "Claim failed");
          btn.disabled = false;
        } finally { setStatus(""); }
      },

      legendaryClaim: async (trackId, stepId, btn) => {
        try {
          if (btn) btn.disabled = true;
          setStatus("Claiming…");
          const res = await claimLegendaryStep(trackId, stepId, mkRunId("lp"));
          await refresh();
          toast(res?.rewardText ? `Claimed: ${res.rewardText}` : "Claimed");
        } catch (e) {
          state.debug(e);
          const reason = e?.data?.reason || e?.message || "Claim failed";
          toast(reason === "NOT_READY" ? "Not ready yet" : reason);
          if (btn) btn.disabled = false;
        } finally { setStatus(""); }
      },

      daily: async (action, raid, btn) => {
        try {
          if (btn) btn.disabled = true;
          setStatus("Doing…");
          const caller = (global.S && global.S.apiPost) ? global.S.apiPost : apiPostRaw;
          await caller("/webapp/daily/action", { action, raid });
          await refresh();
          toast("Done");
        } catch (e) {
          state.debug(e);
          toast(e?.message || "Action failed");
          if (btn) btn.disabled = false;
        } finally { setStatus(""); }
      }
    };

    // ✅ 2C: when rendering LP tracks, apply accordion (collapsed by default in Legendary tab)
    const frag = document.createDocumentFragment();
    for (const q of items) {
      const card = makeCard(q, actions);

      const stepsArr = Array.isArray(q.steps) ? q.steps : (Array.isArray(q.trackSteps) ? q.trackSteps : null);
      const hasSteps = Array.isArray(stepsArr) && stepsArr.length > 0;
      const cat = String(q.cat || q.category || q.type || "").toLowerCase();
    const isLP = hasSteps && (cat === "legendary" || cat === "legendary_path" || cat === "legendarypath");

    if (isLP) {
      applyLegendaryAccordion(card, String(q.id || ""), true); // ✅ ALWAYS collapsed by default
    }

      frag.appendChild(card);
    }
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
      setStatus("");
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
    if (state._wired) return;
    state._wired = true;

    state.el.tabs?.addEventListener("click", (e) => {
      const b = e.target.closest(".q-tab");
      if (!b || !b.dataset.tab) return;

      const nextTab = b.dataset.tab;
      // optional: when entering Legendary, reset open state so it starts collapsed
      if (nextTab === "legendary" && state.tab !== "legendary") {
        try { state.lpOpen.clear(); } catch (_) {}
      }

      $$(".q-tab", state.el.tabs).forEach(x => x.classList.toggle("q-tab--on", x === b));
      $$(".q-tab[role='tab']", state.el.tabs).forEach(x => x.setAttribute("aria-selected", x === b ? "true" : "false"));

      state.tab = nextTab;
      renderList();
    });

    state.el.chips?.addEventListener("click", (e) => {
      const b = e.target.closest(".q-tab");
      if (!b || !b.dataset.state) return;
      $$(".q-tab", state.el.chips).forEach(x => x.classList.toggle("q-tab--on", x === b));
      state.filter = b.dataset.state;
      renderList();
    });

    if (state.el.refresh) state.el.refresh.onclick = () => refresh();
    if (state.el.close) state.el.close.onclick = () => closeModal();

    state.el.back?.addEventListener("click", (e) => {
      if (e.target === state.el.back) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.el.back && state.el.back.style.display === "flex") {
        closeModal();
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
      const root = state.el.back || document;

      state.el.list = $("#qList", root);
      state.el.tabs = $("#qTabs", root);
      state.el.chips = $("#qState", root);
      state.el.status = $("#qStatus", root);
      state.el.refresh = $("#qRefresh", root) || $("#q-refresh", root);
      state.el.close = $("#qClose", root) || $("#closeQuests", root);

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
