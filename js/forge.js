// js/forge.js — Vault Forge Hub (Upgrade + Shards Craft) for Alpha Husky WebApp
// Visual rework: compact mobile forging station. Production APIs, costs, and validation unchanged.
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  function init({ apiPost, tg, dbg }) {
    _apiPost = apiPost || null;
    _tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
    _dbg = !!dbg;
  }

  function logActionPerf(name, startedAt) {
    try { window.__ahPerf?.action?.(name, startedAt); } catch (_) {}
  }

  async function post(path, payload) {
    if (_apiPost) return await _apiPost(path, payload || {});
    const API_BASE = window.API_BASE || "";
    const initData = (_tg && _tg.initData) || window.__INIT_DATA__ || "";
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: initData, ...(payload || {}) }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error((json && (json.reason || json.error)) || `HTTP_${res.status}`);
    if (json && json.ok === false) throw new Error(json.reason || "ERROR");
    return json;
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => {
      switch (m) {
        case "&": return "\u0026amp;";
        case "<": return "\u0026lt;";
        case ">": return "\u0026gt;";
        case '"': return "\u0026quot;";
        default: return "\u0026#039;";
      }
    });
  }

  function rid(prefix = "forge") {
    try { return `${prefix}:${crypto.randomUUID()}`; }
    catch { return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e9)}`; }
  }

  function pick(obj, path, fallback = undefined) {
    try {
      const parts = String(path).split(".");
      let cur = obj;
      for (const p of parts) {
        if (!cur) return fallback;
        cur = cur[p];
      }
      return (cur === undefined ? fallback : cur);
    } catch {
      return fallback;
    }
  }

  function _num(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  function _pct01(v, fallback01) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback01;
    if (n > 1.000001) return n / 100;
    return n;
  }

  function fmtNum(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "0";
    return Math.abs(n) >= 1000 ? n.toLocaleString("en-US") : String(n);
  }

  function rarityKey(v) {
    const s = String(v || "").trim().toLowerCase();
    if (s === "legendary") return "legendary";
    if (s === "epic") return "epic";
    if (s === "rare") return "rare";
    if (s === "uncommon") return "uncommon";
    return "common";
  }

  function rarityClass(v) {
    return `is-${rarityKey(v)}`;
  }

  function cap(s) {
    const v = String(s || "");
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : "";
  }

  function slotCaption(it) {
    const label = String((it && (it.slotLabel || it.slot)) || "Gear");
    return label.replace(/_/g, " ");
  }

  function starsHtml(cur, max) {
    const c = Math.max(0, Number(cur || 0));
    const m = Math.max(c, Number(max || 0));
    const shown = Math.min(Math.max(m, 1), 8);
    let out = `<span class="ah-stars" aria-label="${c} of ${m} stars">`;
    for (let i = 0; i < shown; i++) {
      out += `<span class="ah-star ${i < c ? "filled" : ""}">★</span>`;
    }
    out += `</span>`;
    return out;
  }

  function statLabel(key) {
    const raw = String(key || "").trim();
    if (!raw) return "Stat";
    const map = {
      str: "Strength",
      strength: "Strength",
      agi: "Agility",
      agility: "Agility",
      def: "Defense",
      defense: "Defense",
      vit: "Vitality",
      vitality: "Vitality",
      luck: "Luck",
      int: "Intelligence",
      intelligence: "Intelligence",
      hp: "HP",
      health: "HP",
      atk: "Attack",
      attack: "Attack",
      armor: "Armor",
      dmg_resist: "DMG Resist",
      dmgresist: "DMG Resist",
      damage_resist: "DMG Resist",
    };
    return map[raw.toLowerCase()] || cap(raw.replace(/_/g, " "));
  }

  function orderedStatKeys(stats) {
    const preferred = [
      "armor", "hp", "health", "dmg_resist", "damage_resist", "dmgresist",
      "strength", "str", "attack", "atk", "agility", "agi",
      "defense", "def", "vitality", "vit", "luck", "intelligence", "int",
    ];
    const seen = new Set();
    const keys = [];
    preferred.forEach((key) => {
      if (stats && Object.prototype.hasOwnProperty.call(stats, key) && !seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    });
    Object.keys(stats || {}).sort().forEach((key) => {
      if (!seen.has(key)) keys.push(key);
    });
    return keys;
  }

  function formatStatValue(value) {
    if (value == null || value === "") return "";
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return "";
      if (/[^\d.+eE-]/.test(trimmed)) return trimmed;
      const n = Number(trimmed);
      if (!Number.isFinite(n)) return trimmed;
      if (n > 0) return `+${n}`;
      return String(n);
    }
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    if (n > 0) return `+${n}`;
    return String(n);
  }

  function nextStatValue(current, key, preview) {
    const projected = preview && preview.projectedStats;
    if (projected && Object.prototype.hasOwnProperty.call(projected, key)) {
      return projected[key];
    }
    const gainType = String((preview && preview.gainType) || "");
    if (gainType === "exact") {
      const gain = ((preview && preview.exactGain) || {})[key];
      if (gain == null) return null;
      const c = Number(current);
      const g = Number(gain);
      if (Number.isFinite(c) && Number.isFinite(g)) return c + g;
      return null;
    }
    const range = ((preview && preview.projectedRanges) || {})[key];
    if (range && (range.min != null || range.max != null)) {
      const min = Number(range.min ?? 0);
      const max = Number(range.max ?? min);
      return min === max ? min : `${min}–${max}`;
    }
    return null;
  }

  function renderStatDelta(it, preview) {
    const current = (preview && preview.currentStats) || (it && it.currentStats) || {};
    const projected = (preview && preview.projectedStats) || {};
    const exactGain = (preview && preview.exactGain) || {};
    const ranges = (preview && preview.projectedRanges) || {};
    const bag = Object.assign({}, current, projected, exactGain, ranges);
    const keys = orderedStatKeys(bag).slice(0, 6);
    if (!keys.length) {
      const summary = getUpgradeGainSummary(preview);
      return `<div class="ah-stat-empty">${esc(summary.summary)}</div>`;
    }
    return keys.map((key) => {
      const cur = Object.prototype.hasOwnProperty.call(current, key) ? current[key] : null;
      const next = nextStatValue(cur, key, preview || {});
      const curTxt = cur == null || cur === "" ? "—" : formatStatValue(cur);
      if (next == null || next === "") {
        return `
          <div class="ah-stat-row">
            <span class="ah-stat-label">${esc(statLabel(key))}</span>
            <span class="ah-stat-cur">${esc(curTxt)}</span>
          </div>`;
      }
      return `
        <div class="ah-stat-row">
          <span class="ah-stat-label">${esc(statLabel(key))}</span>
          <span class="ah-stat-pair">
            <span class="ah-stat-cur">${esc(curTxt)}</span>
            <span class="ah-stat-arrow" aria-hidden="true">→</span>
            <span class="ah-stat-next">${esc(formatStatValue(next))}</span>
          </span>
        </div>`;
    }).join("");
  }

  function renderCurrentStats(stats) {
    const keys = orderedStatKeys(stats || {});
    if (!keys.length) {
      return `<div class="ah-small">No item stats on this piece.</div>`;
    }
    return keys.map((key) => `
      <div class="ah-stat-row">
        <span class="ah-stat-label">${esc(statLabel(key))}</span>
        <span class="ah-stat-cur">${esc(formatStatValue((stats || {})[key]))}</span>
      </div>
    `).join("");
  }

  function renderProjectedRanges(ranges) {
    const keys = orderedStatKeys(ranges || {});
    if (!keys.length) return "";
    return keys.map((key) => {
      const row = (ranges || {})[key] || {};
      const min = Number(row.min ?? 0);
      const max = Number(row.max ?? min);
      const value = (min === max) ? `${min}` : `${min}-${max}`;
      return `
        <div class="ah-stat-row">
          <span class="ah-stat-label">${esc(statLabel(key))}</span>
          <span class="ah-stat-cur">${esc(value)}</span>
        </div>
      `;
    }).join("");
  }

  function materialRows(cost, materials) {
    const balance = mats();
    const order = [
      ["bones", "Bones"],
      ["scrap", "Scrap"],
      ["rune_dust", "Rune Dust"],
    ];
    return order.map(([asset, label]) => {
      const need = Number((materials && materials.need && materials.need[asset]) ?? (cost && cost[asset]) ?? 0);
      const have = Number((materials && materials.have && materials.have[asset]) ?? balance[asset] ?? 0);
      const ok = (materials && materials.enough && Object.prototype.hasOwnProperty.call(materials.enough, asset))
        ? !!materials.enough[asset]
        : have >= need;
      return { asset, label, need, have, ok };
    }).filter((row) => row.need > 0 || row.have > 0);
  }

  function getUpgradeStatusMeta(it, preview) {
    const atCap = !!(preview && preview.atCap);
    const isMaxed = atCap || Number((it && it.stars) || 0) >= Number((it && it.maxStars) || 0);
    if (isMaxed) return { isMaxed: true, label: "Maxed", className: "is-maxed" };
    if (it && it.canUpgrade) return { isMaxed: false, label: "Ready", className: "is-ready" };
    return { isMaxed: false, label: "Missing Materials", className: "is-missing" };
  }

  function getUpgradeGainSummary(preview) {
    const gainType = String((preview && preview.gainType) || "");
    const previewMessage = String((preview && preview.message) || "").trim();
    const statPool = Array.isArray(preview && preview.statPool) ? preview.statPool : [];
    const pool = statPool.map((key) => statLabel(key)).join(" / ");

    if (gainType === "exact") {
      const exactGain = (preview && preview.exactGain) || {};
      const exactKeys = orderedStatKeys(exactGain);
      const summary = exactKeys.length
        ? exactKeys.map((key) => `+${Number(exactGain[key] || 0)} ${statLabel(key)}`).join(" · ")
        : (previewMessage || "Exact stat gain");
      return { summary, pool };
    }

    if (gainType === "random") {
      const totalMax = Number((preview && preview.possibleGain && preview.possibleGain.totalPointsMax) || 2);
      return { summary: `+1 to +${totalMax} item stat points`, pool };
    }

    return { summary: previewMessage || "No upgrade preview available.", pool };
  }

  function matIcon(asset) {
    if (asset === "bones") {
      return `<svg class="ah-mat-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.2 8.1c-.9-1.8.1-3.9 2-4.4 1.2-.3 2.4.2 3.1 1.2L12 8.4l2.7-3.5c.7-1 1.9-1.5 3.1-1.2 1.9.5 2.9 2.6 2 4.4l-2.4 4.7 2.4 4.7c.9 1.8-.1 3.9-2 4.4-1.2.3-2.4-.2-3.1-1.2L12 15.6l-2.7 3.5c-.7 1-1.9 1.5-3.1 1.2-1.9-.5-2.9-2.6-2-4.4l2.4-4.7-2.4-4.7z"/></svg>`;
    }
    if (asset === "scrap") {
      return `<svg class="ah-mat-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 16.5 12 4l8 12.5H4zm3.2-1.5h9.6L12 8.2 7.2 15z"/><path fill="currentColor" d="M7 18h10v2H7z"/></svg>`;
    }
    return `<svg class="ah-mat-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.4 18.4 12 12 21.6 5.6 12 12 2.4zm0 3.5L8.2 12 12 18.1 15.8 12 12 5.9z"/></svg>`;
  }

  function mountItemIcon(node, it, fallbackSize) {
    if (!node) return;
    node.innerHTML = "";
    const src = it && it.icon;
    if (!src) {
      node.textContent = "◈";
      return;
    }
    const img = document.createElement("img");
    img.alt = (it && (it.name || it.key)) || "item";
    img.src = src;
    img.decoding = "async";
    img.onerror = () => {
      img.remove();
      node.textContent = "◈";
      node.style.display = "grid";
      node.style.placeItems = "center";
      node.style.fontWeight = "700";
      node.style.fontSize = fallbackSize || "22px";
    };
    node.appendChild(img);
  }

  function ensureFonts() {
    if (document.getElementById("ah-forge-fonts")) return;
    const l = document.createElement("link");
    l.id = "ah-forge-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Rajdhani:wght@500;600;700&display=swap";
    document.head.appendChild(l);
  }

  function ensureStyles() {
    if (document.getElementById("ah-forge-styles")) return;

    const s = el("style");
    s.id = "ah-forge-styles";
    s.textContent = `
      .ah-forge-backdrop{
        position:fixed; inset:0; z-index:2147483640;
        display:flex; align-items:stretch; justify-content:center;
        background:
          radial-gradient(ellipse 80% 40% at 50% 100%, rgba(180,90,18,.22), transparent 52%),
          radial-gradient(ellipse 50% 30% at 80% 0%, rgba(80,50,20,.18), transparent 46%),
          #050505;
      }
      .ah-forge{
        --ah-bg:#090b10;
        --ah-elev:#12151c;
        --ah-elev-2:#181c24;
        --ah-line:rgba(196,154,84,.32);
        --ah-line-dim:rgba(255,255,255,.08);
        --ah-amber:#e0b15a;
        --ah-amber-2:#c4892d;
        --ah-text:#f3ead8;
        --ah-dim:rgba(243,234,216,.64);
        --ah-ok:#8ef0b0;
        --ah-bad:#ffb0ae;
        --ah-radius:14px;
        --ah-font:"Rajdhani", "Segoe UI", system-ui, sans-serif;
        --ah-display:"Cinzel", "Palatino Linotype", Palatino, serif;
        position:relative;
        display:flex; flex-direction:column;
        width:min(430px,100%);
        height:100%;
        max-height:100dvh;
        color:var(--ah-text);
        font-family:var(--ah-font);
        background:
          radial-gradient(ellipse 90% 36% at 50% 118%, rgba(196,90,16,.28), transparent 54%),
          linear-gradient(180deg, rgba(255,255,255,.03), transparent 18%),
          linear-gradient(180deg, #141108 0%, #0b0d12 42%, #07080c 100%);
        border-left:1px solid rgba(196,154,84,.18);
        border-right:1px solid rgba(196,154,84,.18);
        overflow:hidden;
        box-shadow:0 0 80px rgba(0,0,0,.55);
      }
      .ah-forge *{ box-sizing:border-box; }
      .ah-forge::before{
        content:"";
        position:absolute; inset:0; pointer-events:none;
        background:
          linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px) 0 0 / 72px 72px,
          radial-gradient(circle at 18% 8%, rgba(224,177,90,.08), transparent 24%);
        opacity:.7;
      }
      .ah-forge-head{
        position:relative;
        display:flex; flex-direction:column; gap:4px;
        padding:8px 12px 8px;
        flex:0 0 auto;
        background:
          linear-gradient(180deg, rgba(20,16,12,.92), rgba(12,12,16,.55));
        border-bottom:1px solid rgba(196,154,84,.16);
      }
      .ah-head-top{
        display:flex; align-items:center; justify-content:space-between; gap:8px;
      }
      .ah-forge-back, .ah-forge-close{
        appearance:none; border:0; background:transparent;
        min-width:40px; height:40px; flex:0 0 auto;
        color:var(--ah-text);
        display:flex; align-items:center; gap:4px;
        cursor:pointer;
        border-radius:10px;
        padding:0 6px 0 2px;
        font-family:var(--ah-font);
      .ah-forge-back span{ white-space:nowrap; }
      .ah-forge-back:hover, .ah-forge-close:hover{ background:rgba(255,255,255,.05); }
      .ah-head-copy{ min-width:0; flex:1; padding-top:2px; }
      .ah-forge-eyebrow{
        font-size:10px; font-weight:700; letter-spacing:.16em;
        text-transform:uppercase; color:var(--ah-amber);
        display:flex; align-items:center; gap:7px;
      }
      .ah-forge-eyebrow .dot{
        width:5px; height:5px; border-radius:99px;
        background:var(--ah-amber);
        box-shadow:0 0 10px rgba(224,177,90,.7);
      }
      .ah-forge-title{
        font-family:var(--ah-display);
        font-size:clamp(20px,5.6vw,24px);
        font-weight:700; line-height:1.12;
        letter-spacing:.01em; color:#f6e6c4;
        margin-top:2px;
      }
      .ah-forge-sub{
        font-size:11px; line-height:1.3; color:var(--ah-dim); margin-top:2px;
      }
      .ah-forge-tabs{
        position:relative;
        display:flex; align-items:center; gap:8px;
        padding:8px 12px 10px;
        flex:0 0 auto;
      }
      .ah-forge-tab{
        appearance:none; cursor:pointer;
        flex:1; height:40px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, #1a1d24, #12141a);
        color:#d8c7a8;
        font-family:var(--ah-font);
        font-weight:700; font-size:13px; letter-spacing:.12em;
        display:inline-flex; align-items:center; justify-content:center; gap:7px;
      }
      .ah-forge-tab.active{
        border-color:rgba(224,177,90,.55);
        background:linear-gradient(180deg, #d7a44a, #9a6218);
        color:#1a1208;
        box-shadow:0 6px 18px rgba(180,100,20,.28), inset 0 1px 0 rgba(255,255,255,.28);
      }
      .ah-forge-survivor{
        flex:0 0 auto;
        max-width:92px;
        padding:6px 8px;
        border:1px solid rgba(196,154,84,.3);
        border-radius:8px;
        font-size:9px; font-weight:700; letter-spacing:.08em;
        text-transform:uppercase; color:#e8d3a4;
        line-height:1.2; text-align:center;
        background:rgba(0,0,0,.28);
      }
      .ah-forge-body{
        position:relative;
        flex:1 1 auto;
        min-height:0;
        overflow:auto;
        overflow-x:hidden;
        padding:0 12px 12px;
        -webkit-overflow-scrolling:touch;
      }
      .ah-forge-dock{
        flex:0 0 auto;
        display:flex; align-items:stretch; gap:8px;
        padding:10px 12px calc(10px + env(safe-area-inset-bottom, 0px));
        border-top:1px solid rgba(196,154,84,.18);
        background:linear-gradient(180deg, rgba(10,10,12,.92), rgba(6,6,8,.98));
      }
      .ah-forge-bal{
        display:grid;
        grid-template-columns:repeat(3, minmax(0,1fr));
        gap:6px;
        margin:0 0 10px;
        padding:8px;
        border:1px solid rgba(196,154,84,.18);
        border-radius:12px;
        background:linear-gradient(180deg, rgba(18,16,14,.9), rgba(10,12,16,.9));
      }
      .ah-res{
        display:flex; align-items:center; gap:6px; min-width:0;
      }
      .ah-res-ico{
        width:22px; height:22px; flex:0 0 auto;
        color:var(--ah-amber);
        display:grid; place-items:center;
      }
      .ah-mat-svg{ width:18px; height:18px; display:block; }
      .ah-res-copy{ min-width:0; display:flex; flex-direction:column; line-height:1.05; }
      .ah-res-label{
        font-size:9px; font-weight:700; letter-spacing:.1em;
        text-transform:uppercase; color:var(--ah-dim);
      }
      .ah-res-val{
        font-size:14px; font-weight:700; font-variant-numeric:tabular-nums;
        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
      }
      .ah-gear-block{ margin-bottom:10px; }
      .ah-kicker{
        font-size:10px; font-weight:700; letter-spacing:.16em;
        text-transform:uppercase; color:rgba(224,177,90,.88);
        margin-bottom:6px;
      }
      .ah-gear-row{ display:flex; align-items:center; gap:4px; }
      .ah-gear-arrow{
        appearance:none; border:0; background:transparent;
        width:28px; height:64px; color:#e8d3a4; cursor:pointer;
        font-size:22px; flex:0 0 auto;
      }
      .ah-gear-scroller{
        display:flex; gap:8px; overflow-x:auto; overflow-y:hidden;
        scroll-snap-type:x proximity;
        padding:2px 2px 6px;
        flex:1; min-width:0;
        scrollbar-width:none;
      }
      .ah-gear-scroller::-webkit-scrollbar{ display:none; }
      .ah-gear-tile{
        appearance:none; cursor:pointer;
        flex:0 0 72px; width:72px;
        display:flex; flex-direction:column; align-items:center; gap:4px;
        padding:6px 4px 6px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, #171a21, #101218);
        color:inherit;
        scroll-snap-align:start;
      }
      .ah-gear-tile .ah-ico{
        width:48px; height:48px; border-radius:10px;
        overflow:hidden; background:rgba(0,0,0,.35);
        display:grid; place-items:center;
        border:1px solid rgba(255,255,255,.06);
      }
      .ah-gear-tile .ah-ico img, .ah-stage-ico img, .ah-ico img{
        width:100%; height:100%; object-fit:contain; display:block;
      }
      .ah-gear-tile span{
        font-size:10px; font-weight:700; letter-spacing:.04em;
        text-transform:uppercase; color:var(--ah-dim);
        white-space:nowrap; overflow:hidden; max-width:100%;
        text-overflow:ellipsis;
      }
      .ah-gear-tile.selected{
        border-color:rgba(224,177,90,.7);
        background:linear-gradient(180deg, rgba(80,52,16,.45), #14110c);
        box-shadow:0 0 0 1px rgba(224,177,90,.2), 0 8px 18px rgba(160,90,16,.2);
      }
      .ah-gear-tile.selected span{ color:#f6e6c4; }
      .ah-stage{
        display:grid;
        grid-template-columns:min(42%, 158px) minmax(0,1fr);
        gap:10px;
        padding:10px;
        border:1px solid rgba(196,154,84,.22);
        border-radius:14px;
        background:
          radial-gradient(circle at 30% 80%, rgba(196,90,16,.16), transparent 42%),
          linear-gradient(180deg, rgba(22,18,14,.88), rgba(10,12,16,.92));
        margin-bottom:10px;
        min-height:168px;
      }
      .ah-stage-art{
        position:relative;
        min-height:148px;
        display:grid; place-items:center;
      }
      .ah-pedestal{
        position:absolute; left:8%; right:8%; bottom:8px; height:28px;
        border-radius:50%;
        background:radial-gradient(ellipse at center, rgba(224,177,90,.45), rgba(80,40,8,.05) 70%);
        filter:blur(1px);
        pointer-events:none;
      }
      .ah-stage-ico{
        position:relative;
        width:min(100%, 140px); aspect-ratio:1;
        display:grid; place-items:center;
        filter:drop-shadow(0 10px 18px rgba(0,0,0,.45));
      }
      .ah-stage-info{ min-width:0; display:flex; flex-direction:column; gap:4px; }
      .ah-stage-cat{
        font-size:10px; font-weight:700; letter-spacing:.16em;
        text-transform:uppercase; color:var(--ah-amber);
        display:flex; align-items:center; gap:6px;
      }
      .ah-stage-name{
        font-family:var(--ah-display);
        font-size:clamp(15px,4.4vw,18px);
        font-weight:700; line-height:1.15; color:#f7ecd4;
      }
      .ah-stage-meta{
        display:flex; align-items:center; gap:8px; flex-wrap:wrap;
      }
      .ah-tag{
        display:inline-flex; align-items:center; justify-content:center;
        min-height:20px; padding:2px 8px; border-radius:6px;
        border:1px solid rgba(255,255,255,.12);
        font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
      }
      .ah-tag.is-uncommon{ border-color:rgba(104,255,173,.3); color:#c9ffe1; }
      .ah-tag.is-rare{ border-color:rgba(90,170,255,.34); color:#d8ebff; }
      .ah-tag.is-epic{ border-color:rgba(197,133,255,.34); color:#ecd7ff; }
      .ah-tag.is-legendary{ border-color:rgba(224,177,90,.5); color:#ffe5b6; }
      .ah-starline{
        font-size:12px; font-weight:700; color:#ffd47f;
        font-variant-numeric:tabular-nums;
      }
      .ah-star{ font-size:12px; opacity:.28; line-height:1; }
      .ah-star.filled{ opacity:1; color:#ffd47f; text-shadow:0 0 8px rgba(255,192,76,.28); }
      .ah-lvl{
        display:inline-flex; align-items:center; gap:8px;
        margin-top:2px; padding:5px 8px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:8px; background:rgba(0,0,0,.28);
        font-size:12px; font-weight:700; font-variant-numeric:tabular-nums;
      }
      .ah-lvl .to{ color:var(--ah-ok); }
      .ah-stats{ display:flex; flex-direction:column; gap:2px; margin-top:4px; }
      .ah-stat-row{
        display:flex; align-items:baseline; justify-content:space-between; gap:8px;
        padding:3px 0; border-bottom:1px solid rgba(255,255,255,.05);
        font-size:12px; font-weight:600;
      }
      .ah-stat-row:last-child{ border-bottom:0; }
      .ah-stat-label{ color:var(--ah-dim); text-transform:capitalize; }
      .ah-stat-pair{ display:inline-flex; align-items:baseline; gap:6px; font-variant-numeric:tabular-nums; }
      .ah-stat-cur{ color:#f3ead8; }
      .ah-stat-arrow{ color:rgba(243,234,216,.4); }
      .ah-stat-next{ color:var(--ah-ok); }
      .ah-stat-empty, .ah-small{ font-size:12px; color:var(--ah-dim); line-height:1.35; }
      .ah-lore{
        margin-top:4px; font-size:11px; line-height:1.35; color:var(--ah-dim);
        font-style:italic;
      }
      .ah-cost{
        padding:8px 10px 10px;
        border:1px solid rgba(196,154,84,.18);
        border-radius:12px;
        background:linear-gradient(180deg, rgba(16,14,12,.9), rgba(10,12,16,.9));
      }
      .ah-cost-grid{
        display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:6px;
      }
      .ah-cost-cell{
        display:flex; flex-direction:column; align-items:flex-start; gap:2px;
        padding:8px 8px 7px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,.07);
        background:rgba(0,0,0,.28);
        min-width:0;
      }
      .ah-cost-cell .lab{
        display:flex; align-items:center; gap:5px;
        font-size:10px; font-weight:700; letter-spacing:.08em;
        text-transform:uppercase; color:var(--ah-dim);
      }
      .ah-cost-cell .val{
        font-size:16px; font-weight:700; font-variant-numeric:tabular-nums;
      }
      .ah-cost-cell.is-ok .val{ color:var(--ah-ok); }
      .ah-cost-cell.is-missing .val{ color:var(--ah-bad); }
      .ah-missing{
        margin-top:8px; font-size:11px; color:#ffd4d4;
      }
      .ah-upgrade-cta, .ah-btn{
        appearance:none; cursor:pointer;
        border-radius:12px; font-family:var(--ah-font);
        font-weight:700; letter-spacing:.14em;
      }
      .ah-upgrade-cta{
        flex:1; min-height:48px;
        border:1px solid rgba(255,220,150,.45);
        background:linear-gradient(180deg, #f0c56a, #c07a22 58%, #8a4e12);
        color:#1a1208;
        font-size:16px;
        display:inline-flex; align-items:center; justify-content:center; gap:8px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 10px 22px rgba(180,90,10,.28);
      }
      .ah-upgrade-cta svg{ width:16px; height:16px; }
      .ah-upgrade-cta:hover:not(:disabled){ filter:brightness(1.05); }
      .ah-upgrade-cta:disabled{
        opacity:.5; cursor:default; filter:saturate(.65);
      }
      .ah-crystal-slot{
        flex:0 0 84px;
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        gap:4px;
        border:1px solid rgba(255,255,255,.1);
        border-radius:12px;
        background:rgba(0,0,0,.28);
        color:var(--ah-dim);
        font-size:10px; font-weight:700; letter-spacing:.04em;
        text-transform:uppercase; text-align:center; line-height:1.15;
        cursor:pointer; padding:6px;
      }
      .ah-crystal-slot input{ width:16px; height:16px; accent-color:#e0b15a; }
      .ah-btn{
        padding:10px 12px; min-height:42px;
        border:1px solid rgba(185,152,117,.26);
        background:linear-gradient(180deg, #2a241c, #161410);
        color:#f6d3a6; font-size:13px;
      }
      .ah-btn.primary{
        background:linear-gradient(180deg, #d7a44a, #9a6218);
        border-color:rgba(255,220,150,.4); color:#1a1208;
      }
      .ah-btn:disabled{ opacity:.45; cursor:default; }
      .ah-btnrow{ display:flex; gap:8px; flex-wrap:wrap; }
      .ah-note, .ah-panel{
        padding:12px;
        border:1px solid rgba(196,154,84,.18);
        border-radius:14px;
        background:linear-gradient(180deg, rgba(22,18,14,.7), rgba(10,12,16,.7));
        margin-bottom:10px;
      }
      .ah-section-title{
        font-family:var(--ah-display); font-size:18px; font-weight:700; line-height:1.15;
      }
      .ah-section-copy{ font-size:12px; color:var(--ah-dim); line-height:1.4; margin-top:4px; }
      .ah-field{
        display:grid; gap:6px; padding:10px;
        border:1px solid rgba(255,255,255,.08); border-radius:12px;
        background:rgba(0,0,0,.2); margin-bottom:8px;
      }
      .ah-field label{ font-weight:700; font-size:13px; letter-spacing:.04em; }
      .ah-field-copy{ font-size:11px; color:var(--ah-dim); }
      .ah-control{
        width:100%; min-width:0; padding:10px 12px; border-radius:10px;
        border:1px solid rgba(166,125,83,.26);
        background:#16141a; color:#f8e7cd; font-weight:700; font-family:var(--ah-font);
      }
      .ah-stepper{ display:grid; grid-template-columns:auto 1fr auto; gap:8px; align-items:center; }
      .ah-stepper .ah-btn{ min-width:42px; height:42px; padding:0; }
      .ah-quick{ display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
      .ah-chipbar{ display:flex; flex-wrap:wrap; gap:6px; }
      .ah-chip{
        appearance:none; cursor:pointer;
        border:1px solid rgba(255,255,255,.1);
        background:#16141a; color:inherit; border-radius:999px;
        padding:8px 10px; font-weight:700; font-size:12px; font-family:var(--ah-font);
      }
      .ah-chip.active{
        border-color:rgba(224,177,90,.5);
        background:linear-gradient(180deg, rgba(215,164,74,.3), rgba(80,40,12,.4));
        color:#fff5e2;
      }
      .ah-chip .count{ opacity:.8; margin-left:5px; }
      .ah-slot-ghost-select{
        position:absolute !important; opacity:0 !important; pointer-events:none !important;
        width:1px !important; height:1px !important; overflow:hidden !important;
      }
      .ah-preview-shell, .ah-forecast-card, .ah-result{
        border:1px solid rgba(255,255,255,.08); border-radius:12px;
        background:rgba(0,0,0,.22); padding:10px; margin-top:8px;
      }
      .ah-preview-kicker, .ah-forecast-card .k{ font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ah-amber); font-weight:700; }
      .ah-preview-title, .ah-forecast-card .v{ font-size:16px; font-weight:700; }
      .ah-forecast-grid{ display:grid; gap:8px; }
      .ah-preview-badge, .ah-status-chip{
        display:inline-flex; align-items:center; min-height:22px; padding:3px 8px;
        border-radius:999px; border:1px solid rgba(255,255,255,.12); font-size:10px;
        font-weight:700; letter-spacing:.08em; text-transform:uppercase;
      }
      .ah-status-chip.is-ready, .ah-preview-badge{ border-color:rgba(104,255,173,.28); color:#c9ffe1; }
      .ah-status-chip.is-missing{ border-color:rgba(255,176,174,.28); color:#ffd2d1; }
      .ah-status-chip.is-maxed{ border-color:rgba(255,210,122,.28); color:#ffe7bd; }
      .ah-meter{ height:8px; border-radius:99px; overflow:hidden; background:rgba(255,255,255,.08); margin-top:6px; }
      .ah-meter-fill{ height:100%; width:0; background:linear-gradient(90deg, #c07a22, #f0c56a); }
      .ah-pity-row{ display:flex; justify-content:space-between; gap:8px; margin-top:10px; font-size:12px; }
      .ah-results{ display:grid; gap:8px; }
      .ah-result{ display:flex; align-items:center; gap:10px; }
      .ah-results-empty{ font-size:12px; color:var(--ah-dim); padding:10px; }
      .ah-ico{
        width:44px; height:44px; border-radius:10px; overflow:hidden;
        background:rgba(0,0,0,.3); display:grid; place-items:center; flex:0 0 auto;
      }
      .ah-toast{
        position:fixed; left:50%; transform:translateX(-50%); bottom:16px;
        z-index:2147483641; max-width:min(560px,92vw);
        padding:10px 12px; border-radius:12px;
        border:1px solid rgba(255,255,255,.12); background:rgba(0,0,0,.86);
        color:#f3ead8; font-family:var(--ah-font); font-weight:600;
      }
      .ah-divider{ height:1px; background:rgba(255,255,255,.08); margin:10px 0; }
      #forge-error{ margin-top:12px; font-size:12px; white-space:pre-wrap; }
      @media (max-width:360px){
        .ah-forge-survivor{ display:none; }
        .ah-stage{ grid-template-columns:38% minmax(0,1fr); gap:8px; padding:8px; }
        .ah-gear-tile{ flex-basis:64px; width:64px; }
      }
      @media (prefers-reduced-motion: reduce){
        .ah-forge *{ transition:none !important; animation:none !important; }
      }
    `;
    document.head.appendChild(s);
  }

  function toast(msg) {
    const t = el("div", "ah-toast", esc(msg));
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  }

  const FORGE_MODAL_ID = "ahForgeBack";
  let _scrollLockRestore = null;

  function lockScroll(lock) {
    if (!document.body) return;
    if (lock) {
      if (!_scrollLockRestore) {
        _scrollLockRestore = {
          overflow: document.body.style.overflow || "",
          touchAction: document.body.style.touchAction || "",
        };
      }
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return;
    }
    const prev = _scrollLockRestore;
    _scrollLockRestore = null;
    document.body.style.overflow = prev ? prev.overflow : "";
    document.body.style.touchAction = prev ? prev.touchAction : "";
  }

  function restoreMobileShellAfterForgeExit(source = "forge-cleanup") {
    const forgeStillOpen = !!document.getElementById(FORGE_MODAL_ID);
    const stack = Array.isArray(window.AH_NAV?.stack) ? window.AH_NAV.stack : [];
    const remainingStack = stack.filter((id) => id && id !== FORGE_MODAL_ID);
    const anotherSheetOpen = !!document.querySelector(
      "#hubBack[data-open='1'], #charBack[data-open='1'], #shareBack[data-open='1'], #supportBack[data-open='1'], #statsBack[data-open='1'], #qBack[data-open='1']"
    );
    const shouldUnlockShell = !forgeStillOpen && remainingStack.length === 0 && !anotherSheetOpen;
    const app = document.getElementById("app");
    const shell = document.querySelector(".app");
    const nav = document.getElementById("ahBottomNav");
    const clearClasses = [
      "ah-forge-open", "forge-open", "crafting-open", "craft-open",
      "route-lock", "modal-open", "sheet-open",
    ];

    [document.body, app, shell, nav].forEach((node) => {
      if (!node || !node.classList) return;
      clearClasses.forEach((className) => node.classList.remove(className));
    });

    if (shouldUnlockShell) {
      document.documentElement.classList.remove("ah-modal-open", "ah-forge-open", "forge-open", "crafting-open", "route-lock");
      document.body.classList.remove("ah-modal-open", "ah-sheet-open");
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    [app, shell, nav].forEach((node) => {
      if (!node || !node.style) return;
      node.style.removeProperty("display");
      node.style.removeProperty("visibility");
      node.style.removeProperty("opacity");
      node.style.removeProperty("pointer-events");
      node.style.removeProperty("transform");
    });

    if (nav) {
      nav.removeAttribute("hidden");
      nav.setAttribute("aria-hidden", "false");
      nav.style.removeProperty("display");
      nav.style.removeProperty("visibility");
      nav.style.removeProperty("opacity");
      nav.style.removeProperty("pointer-events");
    }

    requestAnimationFrame(() => {
      try { window.dispatchEvent(new Event("resize")); } catch (_) {}
      requestAnimationFrame(() => {
        try { window.dispatchEvent(new Event("resize")); } catch (_) {}
      });
    });

    if (_dbg) {
      try { console.debug("[Forge] restored mobile shell", { source, shouldUnlockShell }); } catch (_) {}
    }
  }

  function debugBottomNavLayoutSnapshot(phase = "manual") {
    const nav = document.getElementById("ahBottomNav");
    const btn = nav && nav.querySelector(".ah-navbtn");
    const ico = btn && btn.querySelector(".ah-ico");
    const read = (node, props) => {
      if (!node) return null;
      const cs = getComputedStyle(node);
      return props.reduce((out, prop) => {
        out[prop] = cs.getPropertyValue(prop);
        return out;
      }, {});
    };
    const snap = {
      phase,
      at: new Date().toISOString(),
      bodyClasses: document.body ? Array.from(document.body.classList) : [],
      htmlClasses: document.documentElement ? Array.from(document.documentElement.classList) : [],
      navInline: nav ? nav.getAttribute("style") || "" : null,
      appInline: document.getElementById("app")?.getAttribute("style") || "",
      nav: read(nav, ["display", "visibility", "opacity", "pointer-events", "position", "height", "left", "right", "bottom", "transform"]),
      button: read(btn, ["display", "width", "height", "padding", "transform"]),
      icon: read(ico, ["display", "width", "height", "border-radius", "border-width", "background-color", "overflow", "flex-basis"]),
    };
    const store = window.__ahForgeNavDebug || (window.__ahForgeNavDebug = []);
    store.push(snap);
    const baseline = store[0];
    snap.compareToFirst = baseline && baseline !== snap ? {
      navHeightChanged: baseline.nav?.height !== snap.nav?.height,
      navDisplayChanged: baseline.nav?.display !== snap.nav?.display,
      navPointerChanged: baseline.nav?.["pointer-events"] !== snap.nav?.["pointer-events"],
      iconWidthChanged: baseline.icon?.width !== snap.icon?.width,
      iconHeightChanged: baseline.icon?.height !== snap.icon?.height,
      iconBorderChanged: baseline.icon?.["border-width"] !== snap.icon?.["border-width"],
      bodyLockLeftover: snap.bodyClasses.some((className) => /forge|craft|route-lock|modal-open|sheet-open/.test(className)),
      navInlineLeftover: !!snap.navInline,
    } : null;
    try { console.table(store.map((item) => ({ phase: item.phase, navHeight: item.nav?.height, navDisplay: item.nav?.display, iconWidth: item.icon?.width, iconHeight: item.icon?.height, iconBorder: item.icon?.["border-width"], navInline: item.navInline || "" }))); } catch (_) {}
    return snap;
  }

  let _root = null;
  let _tab = "upgrade";
  let _state = null;
  let _busy = false;
  let _closing = false;
  let _ctx = { buildingId: null, name: "Forgotten Tokens’ Vault" };
  let _pityOverride = {};
  let _lastCraft = { slot: null, made: [], spent: null, echo: null };
  let _selectedUpgradeKey = null;
  let _useIceCrystal = false;

  function getCfg() {
    const cfg = (_state && _state.craftCfg) || {};
    const weights = cfg.weights || {};

    const baseCost = _num(cfg.baseCost ?? cfg.baseShardCost, 5);
    const refineCost = _num(cfg.refineCost ?? cfg.refineAdd, 2);
    const pityTrigger = _num(cfg.pityTrigger ?? cfg.pity ?? cfg.pityN, 5);

    let uncommonBase = cfg.uncommonBase ?? cfg.baseUncommon;
    if (uncommonBase == null) {
      const wc = _num(weights.common, 80);
      const wu = _num(weights.uncommon, 20);
      const total = wc + wu;
      uncommonBase = total > 0 ? (wu / total) : 0.20;
    }
    uncommonBase = _pct01(uncommonBase, 0.20);

    let uncommonRefineAdd = cfg.uncommonRefineAdd ?? cfg.refineUncommonAdd;
    if (uncommonRefineAdd == null) uncommonRefineAdd = 0.05;
    uncommonRefineAdd = _pct01(uncommonRefineAdd, 0.05);

    let uncommonCap = cfg.uncommonCap;
    uncommonCap = _pct01(uncommonCap, 0.55);

    const pEpic = _pct01(cfg.pEpic ?? cfg.epicBase ?? 0, 0);
    const pLegendary = _pct01(cfg.pLegendary ?? cfg.legendaryBase ?? 0, 0);
    const rareShare = _pct01(cfg.rareShareOfUpgraded ?? cfg.rareShare ?? 0.25, 0.25);

    return {
      baseCost,
      refineCost,
      pity: pityTrigger,
      uncommonBase,
      uncommonRefineAdd,
      uncommonCap,
      pEpic,
      pLegendary,
      rareShare,
    };
  }

  function shardsHave(slot) {
    const map = (_state && _state.shards) || {};
    return map[`${slot}_shards`] ?? 0;
  }

  function mats() {
    return (_state && _state.balances) || {};
  }

  function fmtCost(cost) {
    const c = cost || {};
    return `Bones ${c.bones || 0} · Scrap ${c.scrap || 0} · Dust ${c.rune_dust || 0}`;
  }

  function missingForCost(cost) {
    const b = mats();
    const c = cost || {};
    const miss = {
      bones: Math.max(0, (c.bones || 0) - (b.bones || 0)),
      scrap: Math.max(0, (c.scrap || 0) - (b.scrap || 0)),
      rune_dust: Math.max(0, (c.rune_dust || 0) - (b.rune_dust || 0)),
    };
    const parts = [];
    if (miss.bones) parts.push(`${miss.bones} Bones`);
    if (miss.scrap) parts.push(`${miss.scrap} Scrap`);
    if (miss.rune_dust) parts.push(`${miss.rune_dust} Dust`);
    return parts;
  }

  function dockEl() {
    return _root && _root.querySelector(".ah-forge-dock");
  }

  function clearDock() {
    const dock = dockEl();
    if (dock) dock.innerHTML = "";
    return dock;
  }

  function renderBalances(container) {
    const b = mats();
    const wrap = el("div", "ah-forge-bal");
    [
      ["bones", "Bones", b.bones],
      ["scrap", "Scrap", b.scrap],
      ["rune_dust", "Rune Dust", b.rune_dust],
    ].forEach(([asset, label, v]) => {
      if (v == null) return;
      wrap.appendChild(el("div", "ah-res", `
        <div class="ah-res-ico">${matIcon(asset)}</div>
        <div class="ah-res-copy">
          <span class="ah-res-label">${esc(label)}</span>
          <span class="ah-res-val">${esc(fmtNum(v))}</span>
        </div>
      `));
    });
    container.appendChild(wrap);
  }

  function itemLore(it, preview) {
    const raw = (it && (it.lore || it.flavor || it.description || it.desc)) || "";
    const text = String(raw).trim();
    if (text && text.length < 160) return text;
    const msg = String((preview && preview.message) || "").trim();
    if (msg && !/upgrade|stat|material|preview/i.test(msg) && msg.length < 140) return msg;
    return "";
  }

  function renderUpgrade(body) {
    const eq = (_state && _state.equipped) || [];
    const dock = clearDock();

    if (!eq.length) {
      body.appendChild(el("div", "ah-note",
        `<div class="ah-kicker">Forge Bench</div>
         <div class="ah-section-title">No equipped items found</div>
         <div class="ah-section-copy">Equip a piece of gear first, then return to the vault to inspect upgrade costs.</div>`
      ));
      return;
    }

    if (!_selectedUpgradeKey || !eq.some((x) => x.key === _selectedUpgradeKey)) {
      _selectedUpgradeKey = eq[0].key;
    }

    async function doUpgrade(it) {
      if (!it || _busy || !it.canUpgrade) return;
      const perfT0 = window.__ahPerf?.now?.() || Date.now();
      const crystalMeta = (it.upgradePreview && it.upgradePreview.iceCrystal) || {};
      const shouldUseIceCrystal = !!(_useIceCrystal && crystalMeta && crystalMeta.canUse);
      _busy = true;
      draw();

      try {
        await post("/webapp/forge/upgrade", {
          buildingId: _ctx.buildingId,
          slot: it.slot,
          run_id: rid("web_upg"),
          use_ice_crystal: shouldUseIceCrystal,
        });
        _useIceCrystal = false;
        await loadState();
        toast(`Forged ${it.slotLabel || it.slot} to ★${Number((it.upgradePreview && it.upgradePreview.nextLevel) || (Number(it.stars || 0) + 1))}.`);
      } catch (e) {
        toast(`Upgrade failed: ${e.message}`);
      } finally {
        _busy = false;
        draw();
        logActionPerf("forge_upgrade", perfT0);
      }
    }

    const selected = eq.find((x) => x.key === _selectedUpgradeKey) || eq[0];
    const preview = (selected && selected.upgradePreview) || {};
    const cost = preview.cost || (selected && selected.costNext) || null;
    const miss = cost ? missingForCost(cost) : [];
    const statusMeta = getUpgradeStatusMeta(selected, preview);
    const isMaxed = statusMeta.isMaxed;
    const rKey = rarityKey(selected && selected.rarity);
    const nextStars = Number(preview.nextLevel || Math.min(Number((selected && selected.maxStars) || 0), Number((selected && selected.stars) || 0) + 1));
    const materials = preview.materials || null;
    const crystal = preview.iceCrystal || {};
    const crystalOwned = Number(crystal.owned || 0);
    const crystalCanUse = !!crystal.canUse && crystalOwned > 0;
    const crystalMessage = String(crystal.message || "").trim();
    const showCrystal = !isMaxed && !!(selected && selected.canUpgrade) && (crystalOwned > 0 || crystalMessage);
    if (!showCrystal || !crystalCanUse) _useIceCrystal = false;

    const selector = el("div", "ah-gear-block");
    selector.appendChild(el("div", "ah-kicker", "Select Gear"));
    const row = el("div", "ah-gear-row");
    const prevBtn = el("button", "ah-gear-arrow", "‹");
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Previous gear");
    const nextBtn = el("button", "ah-gear-arrow", "›");
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Next gear");
    const scroller = el("div", "ah-gear-scroller");

    eq.forEach((it) => {
      const tile = el("button", `ah-gear-tile ${rarityClass(it.rarity)}${_selectedUpgradeKey === it.key ? " selected" : ""}`);
      tile.type = "button";
      tile.dataset.key = it.key;
      const ico = el("div", `ah-ico ${rarityClass(it.rarity)}`);
      mountItemIcon(ico, it, "16px");
      tile.appendChild(ico);
      tile.appendChild(el("span", "", esc(slotCaption(it))));
      tile.addEventListener("click", () => {
        if (_selectedUpgradeKey !== it.key) _useIceCrystal = false;
        _selectedUpgradeKey = it.key;
        draw();
      });
      scroller.appendChild(tile);
    });

    prevBtn.addEventListener("click", () => {
      scroller.scrollBy({ left: -88, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", () => {
      scroller.scrollBy({ left: 88, behavior: "smooth" });
    });

    row.appendChild(prevBtn);
    row.appendChild(scroller);
    row.appendChild(nextBtn);
    selector.appendChild(row);
    body.appendChild(selector);

    requestAnimationFrame(() => {
      const selTile = scroller.querySelector(".ah-gear-tile.selected");
      if (selTile && selTile.scrollIntoView) {
        try { selTile.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" }); } catch (_) {}
      }
    });

    const lore = itemLore(selected, preview);
    const stage = el("div", `ah-stage ${rarityClass(rKey)}`);
    stage.innerHTML = `
      <div class="ah-stage-art">
        <div class="ah-pedestal"></div>
        <div class="ah-stage-ico ${rarityClass(rKey)}" id="ah-detail-ico"></div>
      </div>
      <div class="ah-stage-info">
        <div class="ah-stage-cat">◈ ${esc(slotCaption(selected))}</div>
        <div class="ah-stage-name">${esc(selected.name || selected.slotLabel || "Item")}</div>
        <div class="ah-stage-meta">
          <span class="ah-tag ${rarityClass(rKey)}">${esc(selected.rarity || "common")}</span>
          <span class="ah-starline">★ ${esc(String(Number(selected.stars || 0)))} / ${esc(String(Number(selected.maxStars || 0)))}</span>
        </div>
        <div class="ah-lvl">
          <span>Lv. ${esc(String(Number(selected.stars || 0)))}</span>
          <span class="ah-stat-arrow">→</span>
          <span class="to">Lv. ${esc(String(isMaxed ? Number(selected.stars || 0) : nextStars))}</span>
        </div>
        <div class="ah-stats">${renderStatDelta(selected, preview)}</div>
        ${lore ? `<div class="ah-lore">${esc(lore)}</div>` : ""}
      </div>
    `;
    body.appendChild(stage);
    mountItemIcon(stage.querySelector("#ah-detail-ico"), selected, "28px");

    const costRows = materialRows(cost, materials).filter((row) => row.need > 0);
    const costBox = el("div", "ah-cost");
    costBox.innerHTML = `
      <div class="ah-kicker">Upgrade Cost</div>
      ${costRows.length ? `
        <div class="ah-cost-grid">
          ${costRows.map((row) => `
            <div class="ah-cost-cell ${row.ok ? "is-ok" : "is-missing"}">
              <div class="lab">${matIcon(row.asset)} ${esc(row.label)}</div>
              <div class="val">${esc(fmtNum(row.need))}</div>
            </div>
          `).join("")}
        </div>
      ` : `<div class="ah-small">${isMaxed ? "No further upgrades." : "No upgrade cost exposed for this piece."}</div>`}
      ${miss.length ? `<div class="ah-missing">Missing: ${esc(miss.join(", "))}</div>` : ""}
    `;
    body.appendChild(costBox);

    if (!dock) return;

    const ctaIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 14.5 12 8.5 18 14.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 18.5 12 12.5 18 18.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const cta = el(
      "button",
      "ah-upgrade-cta",
      _busy ? "Forging..." : (isMaxed ? "Item Maxed" : (selected.canUpgrade ? `${ctaIcon} Upgrade` : "Missing Materials"))
    );
    cta.type = "button";
    cta.disabled = _busy || isMaxed || !selected.canUpgrade;
    cta.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      doUpgrade(selected);
    });
    dock.appendChild(cta);

    if (showCrystal) {
      const slot = el("label", "ah-crystal-slot");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = !!(_useIceCrystal && crystalCanUse);
      box.disabled = !crystalCanUse || _busy;
      box.addEventListener("change", () => {
        _useIceCrystal = !!box.checked;
      });
      slot.appendChild(box);
      slot.appendChild(el("span", "", `Ice Crystal${crystalOwned ? ` (${crystalOwned})` : ""}`));
      dock.appendChild(slot);
    }
  }

  function renderCraft(body) {
    const cfg = getCfg();
    const dock = clearDock();
    const shardSlots = (_state && _state.shardSlots) || [
      "weapon", "armor", "fangs", "cloak", "collar", "helmet", "ring", "offhand", "gloves"
    ];

    const pools = pick(_state, "rollCfg.pools", null);
    const poolsLine = pools
      ? `Pools: C ${pools.common || 0} / U ${pools.uncommon || 0} / R ${pools.rare || 0} / E ${pools.epic || 0} / L ${pools.legendary || 0}`
      : "Slot pool data not exposed.";
    const basePlus = Math.min(1, (cfg.uncommonBase || 0));

    body.appendChild(el("div", "ah-note",
      `<div class="ah-kicker">Shard Forge</div>
       <div class="ah-section-title">Token-infused crafting</div>
       <div class="ah-section-copy">Spend slot shards to roll gear from that slot’s pool. Refine increases shard cost per pull.</div>
       <div class="ah-small" style="margin-top:6px">Base ${cfg.baseCost} · Refine +${cfg.refineCost}/lvl · Pity ${cfg.pity} · ${esc(poolsLine)} · Upgraded base ${Math.round(basePlus * 100)}%</div>`
    ));

    const controls = el("div", "ah-panel");

    function currentPity(slot) {
      const fromState = _state && _state.pityMap && _state.pityMap[slot];
      if (fromState != null) return fromState;
      const fromOverride = _pityOverride && _pityOverride[slot];
      return (fromOverride != null ? fromOverride : null);
    }

    function makeField(label, copy) {
      const wrap = el("div", "ah-field");
      const left = el("div", "", `<label>${esc(label)}</label>${copy ? `<div class="ah-field-copy">${copy}</div>` : ""}`);
      const right = el("div", "");
      wrap.appendChild(left);
      wrap.appendChild(right);
      return { wrap, right };
    }

    const slotField = makeField("Slot", "Craft consumes {slot}_shards from the chosen category.");
    const sel = document.createElement("select");
    sel.className = "ah-control ah-slot-ghost-select";
    const chipbar = el("div", "ah-chipbar");

    function renderSlotChips() {
      chipbar.innerHTML = "";
      const current = sel.value || shardSlots[0] || "weapon";
      shardSlots.forEach((s) => {
        const b = el("button", `ah-chip ${current === s ? "active" : ""}`, `${esc(cap(s))}<span class="count">${shardsHave(s)}</span>`);
        b.type = "button";
        b.disabled = _busy;
        b.addEventListener("click", () => {
          if (_busy) return;
          sel.value = s;
          renderSlotChips();
          updateCost();
        });
        chipbar.appendChild(b);
      });
    }

    function refreshSlotLabels() {
      Array.from(sel.options).forEach((opt) => {
        const s = opt.value;
        opt.textContent = `${cap(s)} (${shardsHave(s)})`;
      });
      renderSlotChips();
    }

    shardSlots.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = `${cap(s)} (${shardsHave(s)})`;
      sel.appendChild(opt);
    });
    slotField.right.appendChild(sel);
    slotField.right.appendChild(chipbar);

    const countField = makeField("Count", "How many pulls to execute in one batch.");
    const countWrap = el("div", "ah-stepper");
    const countMinus = el("button", "ah-btn", "−");
    countMinus.type = "button";
    const inpCount = document.createElement("input");
    inpCount.type = "number";
    inpCount.min = "1";
    inpCount.max = "50";
    inpCount.value = "1";
    inpCount.className = "ah-control";
    const countPlus = el("button", "ah-btn", "+");
    countPlus.type = "button";
    countWrap.appendChild(countMinus);
    countWrap.appendChild(inpCount);
    countWrap.appendChild(countPlus);
    countField.right.appendChild(countWrap);

    const quick = el("div", "ah-quick");
    [1, 5, 10].forEach((n) => {
      const b = el("button", "ah-btn", String(n));
      b.type = "button";
      b.disabled = _busy;
      b.addEventListener("click", () => {
        inpCount.value = String(n);
        updateCost();
      });
      quick.appendChild(b);
    });
    countField.right.appendChild(quick);

    const refineField = makeField("Refine", "Extra pressure increases shard cost per pull.");
    const refWrap = el("div", "ah-stepper");
    const refMinus = el("button", "ah-btn", "−");
    refMinus.type = "button";
    const inpRef = document.createElement("input");
    inpRef.type = "number";
    inpRef.min = "0";
    inpRef.max = "5";
    inpRef.value = "0";
    inpRef.className = "ah-control";
    const refPlus = el("button", "ah-btn", "+");
    refPlus.type = "button";
    refWrap.appendChild(refMinus);
    refWrap.appendChild(inpRef);
    refWrap.appendChild(refPlus);
    refineField.right.appendChild(refWrap);

    const previewPanel = el("div", "ah-panel");
    const fDbg = el("div", "ah-small", "");

    function clampField(input, min, max) {
      const n = Math.max(min, Math.min(max, parseInt(input.value || String(min), 10) || min));
      input.value = String(n);
      return n;
    }

    countMinus.addEventListener("click", () => {
      const n = clampField(inpCount, 1, 50);
      inpCount.value = String(Math.max(1, n - 1));
      updateCost();
    });
    countPlus.addEventListener("click", () => {
      const n = clampField(inpCount, 1, 50);
      inpCount.value = String(Math.min(50, n + 1));
      updateCost();
    });
    refMinus.addEventListener("click", () => {
      const n = clampField(inpRef, 0, 5);
      inpRef.value = String(Math.max(0, n - 1));
      updateCost();
    });
    refPlus.addEventListener("click", () => {
      const n = clampField(inpRef, 0, 5);
      inpRef.value = String(Math.min(5, n + 1));
      updateCost();
    });

    function updateCost() {
      const slot = sel.value;
      const n = clampField(inpCount, 1, 50);
      const r = clampField(inpRef, 0, 5);
      const per = (cfg.baseCost || 5) + r * (cfg.refineCost || 2);
      const total = per * n;
      const have = shardsHave(slot);
      const left = have - total;
      const pU = Math.min((cfg.uncommonBase || 0) + (cfg.uncommonRefineAdd || 0) * r, (cfg.uncommonCap || 1));
      const pRare = pU * (cfg.rareShare || 0.25);
      const pUncommon = Math.max(0, pU - pRare);
      const pity = currentPity(slot);
      const pityMax = Number(cfg.pity || 0);
      const pityRatio = (pity != null && pityMax > 0) ? Math.max(0, Math.min(1, Number(pity) / pityMax)) : 0;
      let pityClass = "";
      let pityLabel = "Cold";
      if (pityRatio >= 1) { pityClass = "charged"; pityLabel = "Charged"; }
      else if (pityRatio >= 0.66) { pityClass = "hot"; pityLabel = "Heating Up"; }
      let spendState = "Ready";
      if (left < 0) spendState = "Insufficient Shards";
      else if (left === 0) spendState = "Exact Spend";

      previewPanel.className = "ah-panel ah-preview-shell";
      previewPanel.innerHTML = `
        <div class="ah-preview-top" style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
          <div>
            <div class="ah-preview-kicker">Forge Preview</div>
            <div class="ah-preview-title">${esc(cap(slot))} shard roll</div>
          </div>
          <div class="ah-preview-badge">${esc(spendState)}</div>
        </div>
        <div class="ah-forecast-grid">
          <div class="ah-forecast-card">
            <div class="k">Shard Spend</div>
            <div class="v">${total} total</div>
            <div class="ah-small">Have ${have} · Per pull ${per} · After ${left}</div>
          </div>
          <div class="ah-forecast-card">
            <div class="k">Odds Snapshot</div>
            <div class="v">${Math.round(pU * 100)}% upgraded</div>
            <div class="ah-small">Rare ${(pRare * 100).toFixed(2)}% / Uncommon ${(pUncommon * 100).toFixed(2)}%</div>
          </div>
        </div>
        ${pity != null ? `
          <div class="ah-pity-row">
            <span>${esc(pityLabel)}</span>
            <b>${Number(pity)} / ${pityMax}</b>
          </div>
          <div class="ah-meter"><div class="ah-meter-fill" style="width:${Math.round(pityRatio * 100)}%"></div></div>
        ` : ""}
      `;
      fDbg.textContent = `preview(per=${per}, total=${total}, count=${n}, refine=${r}, slot=${slot})`;
      renderSlotChips();

      if (dock) {
        const existing = dock.querySelector(".ah-upgrade-cta");
        if (existing) {
          existing.disabled = _busy || left < 0;
          existing.textContent = _busy ? "Forging..." : (left < 0 ? "Need Shards" : "Forge Pull");
        }
      }
    }

    inpCount.addEventListener("input", updateCost);
    inpRef.addEventListener("input", updateCost);
    sel.addEventListener("change", updateCost);

    const btn = el("button", "ah-upgrade-cta", "Forge Pull");
    btn.type = "button";
    btn.disabled = _busy;
    btn.addEventListener("click", async () => {
      if (_busy) return;
      const perfT0 = window.__ahPerf?.now?.() || Date.now();
      const slot = sel.value;
      const count = clampField(inpCount, 1, 50);
      const refine = clampField(inpRef, 0, 5);
      const per = (cfg.baseCost || 5) + refine * (cfg.refineCost || 2);
      const total = per * count;
      const have = shardsHave(slot);
      if (have < total) {
        toast(`Not enough ${slot}_shards (need ${total}, have ${have}).`);
        return;
      }
      _busy = true;
      draw();
      try {
        const run_id = rid("web_craft");
        const res = await post("/webapp/forge/craft", {
          buildingId: _ctx.buildingId,
          slot,
          count,
          refine,
          run_id,
          client_preview: { per, total, have, slot, count, refine },
        });
        const data = pick(res, "data", null) || pick(res, "result.data", null) || null;
        const made = pick(res, "made", null) || pick(res, "result.made", null) || [];
        const pityMap = pick(res, "pityMap", null) || pick(res, "result.pityMap", null) || pick(data, "pityMap", null);
        const pity = pick(res, "pity", null) ?? pick(res, "result.pity", null) ?? pick(data, "pity", null);
        const spent = pick(res, "spent", null) ?? pick(res, "need", null) ?? pick(res, "result.spent", null);
        const echo = pick(res, "echo", null) || pick(res, "result.echo", null) || null;
        const have_after = pick(res, "have_after", null) ?? pick(res, "result.have_after", null) ?? pick(data, `shards.${slot}_shards`, null);
        _lastCraft = { slot, made, spent: spent != null ? Number(spent) : null, echo };
        if (data) {
          _state = data;
        } else {
          _state = _state || {};
          _state.shards = _state.shards || {};
          if (have_after != null) _state.shards[`${slot}_shards`] = Number(have_after);
          if (pityMap) _state.pityMap = pityMap;
          else if (pity != null) {
            _state.pityMap = _state.pityMap || {};
            _state.pityMap[slot] = Number(pity);
          }
        }
        if (pityMap && pityMap[slot] != null) _pityOverride[slot] = Number(pityMap[slot]);
        else if (pity != null) _pityOverride[slot] = Number(pity);
        const craftMessage = String(pick(res, "message", "") || pick(res, "result.message", "") || "");
        if (craftMessage) toast(craftMessage);
        else if (spent != null && Number(spent) !== Number(total)) toast(`Server spent ${spent} (preview ${total})`);
        else toast(made.length ? `Crafted ${made.length} item(s).` : "Craft complete.");
        try { refreshSlotLabels(); } catch (_) {}
        try { updateCost(); } catch (_) {}
        const uiErrorEl = document.getElementById("forge-error");
        if (uiErrorEl) uiErrorEl.textContent = "";
      } catch (e) {
        let uiErrorEl = document.getElementById("forge-error");
        if (!uiErrorEl) {
          uiErrorEl = document.createElement("pre");
          uiErrorEl.id = "forge-error";
          const mount =
            document.querySelector("#forge-modal .modal-body") ||
            document.querySelector("#forge-modal") ||
            document.querySelector("#forge") ||
            (_root && _root.querySelector(".ah-forge-body")) ||
            document.body;
          mount.appendChild(uiErrorEl);
        }
        console.error("CRAFT ERROR:", e);
        const status = e?.status ?? e?.data?.status ?? "";
        const payload = e?.data?.data || e?.data || {};
        const rawMsg = (e && typeof e === "object" && e.message) ? e.message : String(e);
        const reason = payload?.reason || rawMsg || "unknown";
        let payloadPretty = "";
        try { payloadPretty = JSON.stringify(payload, null, 2); } catch { payloadPretty = String(payload); }
        uiErrorEl.textContent = `Craft failed${status ? " [" + status + "]" : ""}: ${reason}\n\nPAYLOAD:\n${payloadPretty}`;
        toast(`Craft failed${status ? " [" + status + "]" : ""}: ${reason}`);
      } finally {
        _busy = false;
        draw();
        logActionPerf("forge_craft", perfT0);
      }
    });

    controls.appendChild(slotField.wrap);
    controls.appendChild(countField.wrap);
    controls.appendChild(refineField.wrap);
    controls.appendChild(previewPanel);
    controls.appendChild(fDbg);
    body.appendChild(controls);

    const results = el("div", "ah-panel");
    results.appendChild(el("div", "ah-kicker", "Craft Results"));
    const out = el("div", "ah-results");
    const made = (_lastCraft && _lastCraft.made) || [];
    if (!made.length) {
      out.appendChild(el("div", "ah-results-empty", "No craft results yet. Run a shard pull to populate this panel."));
    } else {
      made.forEach((it) => {
        const obj = (typeof it === "string") ? { key: it } : (it || {});
        const rKey = rarityKey(obj.rarity);
        const card = el("div", `ah-result ${rarityClass(rKey)}`);
        const ico = el("div", `ah-ico ${rarityClass(rKey)}`);
        mountItemIcon(ico, obj, "16px");
        const meta = el("div", "", `<b>${esc(obj.name || obj.key || "Item")}</b><div class="ah-small">${esc(obj.rarity || "common")} · ${esc(cap(_lastCraft.slot || ""))}</div>`);
        card.appendChild(ico);
        card.appendChild(meta);
        out.appendChild(card);
      });
    }
    results.appendChild(out);
    body.appendChild(results);

    if (dock) dock.appendChild(btn);
    refreshSlotLabels();
    updateCost();
  }

  function draw() {
    if (!_root) return;

    const title = _root.querySelector(".ah-forge-title");
    const sub = _root.querySelector(".ah-forge-sub");
    const eyebrow = _root.querySelector(".ah-forge-eyebrow");

    if (title) title.textContent = _ctx.name || "Forgotten Tokens’ Vault";
    if (eyebrow) eyebrow.innerHTML = `<span class="dot"></span><span>Worksmith Forge</span>`;
    if (sub) sub.textContent = "Old gear. New power. Forge what endures.";

    const tabs = _root.querySelectorAll(".ah-forge-tab");
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === _tab));

    const body = _root.querySelector(".ah-forge-body");
    body.innerHTML = "";

    if (!_state) {
      clearDock();
      body.appendChild(el("div", "ah-note",
        `<div class="ah-kicker">Loading</div>
         <div class="ah-section-title">Connecting to the vault</div>
         <div class="ah-section-copy">Pulling forge state, balances, shard pools and upgrade data…</div>`
      ));
      return;
    }

    renderBalances(body);
    if (_tab === "upgrade") renderUpgrade(body);
    else renderCraft(body);
  }

  async function loadState() {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const res = await post("/webapp/forge/state", {
      buildingId: _ctx.buildingId,
      run_id: rid("forge_state")
    });
    _state = (res && (res.data || res)) || null;
    logActionPerf("forge_state", perfT0);
  }

  function isOpen() {
    return !!((_root && _root.isConnected) || document.getElementById(FORGE_MODAL_ID));
  }

  function teardownView() {
    if (!isOpen()) {
      restoreMobileShellAfterForgeExit("forge-teardown-noop");
      return;
    }
    lockScroll(false);
    const node = _root || document.getElementById(FORGE_MODAL_ID);
    if (node) node.remove();
    _root = null;
    _state = null;
    _busy = false;
    _tab = "upgrade";
    restoreMobileShellAfterForgeExit("forge-teardown");
  }

  function closeViaNav(source = "forge-close") {
    if (_closing) return true;
    _closing = true;
    try {
      if (window.AlphaNav?.close?.(FORGE_MODAL_ID, { source, fallback: false })) return true;
      teardownView();
      return false;
    } finally {
      _closing = false;
    }
  }

  function mount() {
    if (_root && _root.isConnected) return;

    ensureFonts();
    ensureStyles();
    lockScroll(true);
    document.body.classList.add("ah-forge-open");

    const stale = document.getElementById(FORGE_MODAL_ID);
    if (stale && stale !== _root) {
      try { stale.remove(); } catch (_) {}
    }

    const backdrop = el("div", "ah-forge-backdrop");
    backdrop.id = FORGE_MODAL_ID;
    const modal = el("div", "ah-forge");

    const head = el("div", "ah-forge-head");
    const top = el("div", "ah-head-top");
    const back = el("button", "ah-forge-back", `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Alpha Husky</span>`);
    back.type = "button";
    back.setAttribute("aria-label", "Close forge");
    back.addEventListener("click", () => closeViaNav("forge-close"));
    top.appendChild(back);

    const left = el("div", "ah-head-copy");
    left.appendChild(el("div", "ah-forge-eyebrow", `<span class="dot"></span><span>Worksmith Forge</span>`));
    left.appendChild(el("div", "ah-forge-title", _ctx.name || "Forgotten Tokens’ Vault"));
    left.appendChild(el("div", "ah-forge-sub", "Old gear. New power. Forge what endures."));
    head.appendChild(top);
    head.appendChild(left);

    const tabs = el("div", "ah-forge-tabs");
    [
      ["upgrade", `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 18h4l9.2-9.2a1.5 1.5 0 0 0 0-2.1L15.3 4.8a1.5 1.5 0 0 0-2.1 0L4 14v4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M13 6.5 17.5 11" stroke="currentColor" stroke-width="1.8"/></svg> Upgrade`],
      ["craft", `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 4 8v8l8 5 8-5V8l-8-5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg> Craft`],
    ].forEach(([k, label]) => {
      const t = el("button", "ah-forge-tab", label);
      t.type = "button";
      t.dataset.tab = k;
      t.addEventListener("click", () => {
        _tab = k;
        draw();
      });
      tabs.appendChild(t);
    });
    tabs.appendChild(el("div", "ah-forge-survivor", "Forged by survivors"));

    const body = el("div", "ah-forge-body", "");
    const dock = el("div", "ah-forge-dock");
    modal.appendChild(head);
    modal.appendChild(tabs);
    modal.appendChild(body);
    modal.appendChild(dock);
    backdrop.appendChild(modal);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeViaNav("forge-backdrop");
    });

    _root = backdrop;
    document.body.appendChild(backdrop);
    const navMeta = {
      close: () => teardownView(),
      isOpen: () => isOpen(),
      fallback: false
    };
    try { window.AlphaNav?.push?.(FORGE_MODAL_ID, navMeta); } catch (_) {}
  }

  function unmount() {
    teardownView();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest && e.target.closest("#ahBottomNav [data-go]");
    if (!btn) return;
    if (isOpen()) closeViaNav("forge-bottom-nav");
    else restoreMobileShellAfterForgeExit("forge-bottom-nav-click");
  }, true);

  async function open(ctx) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    _ctx = {
      buildingId: ctx && ctx.buildingId ? ctx.buildingId : null,
      name: (ctx && ctx.name) || "Forgotten Tokens’ Vault",
    };

    if (_root && _root.isConnected) {
      closeViaNav("forge-reopen");
    }
    mount();
    try {
      await loadState();
    } catch (e) {
      toast(`Forge load failed: ${e.message}`);
    } finally {
      draw();
      logActionPerf("forge_open", perfT0);
    }
  }

  window.Forge = {
    init,
    open,
    close: () => closeViaNav("forge-api-close"),
    restoreMobileShellAfterForgeExit,
    debugBottomNavLayoutSnapshot,
  };
})();
