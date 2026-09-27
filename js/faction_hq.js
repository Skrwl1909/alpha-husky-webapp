// js/faction_hq.js — Faction HQ (Alpha Husky WebApp) — Premium HQ mockup version
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _back = null;   // #factionHQBack
  let _modal = null;  // #factionHQModal
  let _root = null;   // #factionHQRoot

  let _feedExpanded = false;
  let _supportCustomExpanded = false;
  let _rosterExpanded = false;
  let _activeView = "hq";
  let _activeSheet = "";
  let _viewModel = null;

  function log(...a) { if (_dbg) console.log("[FactionHQ]", ...a); }

  function _globalApiPost() {
    const fn = window.apiPost || window.S?.apiPost || window.AH?.apiPost;
    return typeof fn === "function" ? fn : null;
  }

  async function _ensureApiPost(timeoutMs = 6000) {
    if (typeof _apiPost === "function") return _apiPost;

    const direct = _globalApiPost();
    if (direct) {
      _apiPost = direct;
      return _apiPost;
    }

    const waitForApi = window.waitForApiPostReady;
    if (typeof waitForApi === "function") {
      try {
        const ready = await waitForApi(timeoutMs);
        if (typeof ready === "function") {
          _apiPost = ready;
          return _apiPost;
        }
      } catch (error) {
        log("apiPost readiness wait failed", error);
      }
    }

    return null;
  }

  // ---------------------------
  // Helpers
  // ---------------------------
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function mediaTag(url, cls, alt = "") {
    const src = String(url || "").trim();
    if (!src) return "";
    if (/\.(mp4|webm)(\?|#|$)/i.test(src)) {
      return `<video class="${esc(cls)}" src="${esc(src)}" autoplay muted loop playsinline></video>`;
    }
    return `<img class="${esc(cls)}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`;
  }

  function num(v) {
    const n = Number(v || 0);
    try { return n.toLocaleString(); } catch (_) { return String(n); }
  }

  function pct(have, need) {
    const h = Number(have || 0);
    const n = Number(need || 0);
    if (n <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((h / n) * 100)));
  }

  function fmtTs(t) {
    try { return new Date((t || 0) * 1000).toLocaleString(); }
    catch (_) { return ""; }
  }

  function timeAgo(t) {
    const ts = Number(t || 0);
    if (!ts) return "";
    const sec = Math.max(0, Math.floor(Date.now() / 1000) - ts);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function rankLabel(rank) {
    const n = Number(rank || 0);
    return n > 0 ? `#${num(n)}` : "Unranked";
  }

  function _uid() {
    try { return String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || ""); }
    catch (_) { return ""; }
  }

  function _uidTail() {
    const u = _uid();
    return u ? u.slice(-5) : "?????";
  }

  function _rid(prefix = "hq") {
    try {
      const uid = _uid() || "0";
      const r = (crypto?.randomUUID
        ? crypto.randomUUID()
        : (String(Date.now()) + Math.random().toString(16).slice(2)));
      return `${prefix}:${uid}:${r}`;
    } catch (_) {
      return `${prefix}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
    }
  }

  function _clampLvl(v) {
  const n = parseInt(v || 1, 10) || 1;
  return Math.max(1, Math.min(6, n));
}

const HQ_HOLO_BY_LEVEL = {
  1: { name: "Raw Core", asset: "/images/hq/hq_lv1.png" },
  2: { name: "First Expansion", asset: "/images/hq/hq_lv2.png" },
  3: { name: "Network Expansion", asset: "/images/hq/hq_lv3.png" },
  4: { name: "Data Fortress", asset: "/images/hq/hq_lv4.png" },
  5: { name: "Energy Core", asset: "/images/hq/hq_lv5.png" },
  6: { name: "Ghost Layer", asset: "/images/hq/hq_lv6.png" },
};

function _hqAsset(level) {
  return HQ_HOLO_BY_LEVEL[_clampLvl(level)] || HQ_HOLO_BY_LEVEL[1];
}

function _hqStageHTML(level, faction) {
  const lv = _clampLvl(level);
  const cfg = _hqAsset(lv);

  return `
    <div class="hq-mockup hq-holo-stage" data-level="${lv}" data-faction="${esc(faction)}">
      <div class="hq-holo-grid"></div>
      <div class="hq-holo-ring hq-holo-ring-a"></div>
      <div class="hq-holo-ring hq-holo-ring-b"></div>

      <img
        class="hq-holo-model"
        src="${esc(cfg.asset)}"
        alt="Faction HQ Level ${lv}"
        loading="eager"
        decoding="async"
        onerror="this.style.display='none';"
      />

      <div class="hq-holo-scan"></div>
      <div class="hq-badge-mini">${esc(factionShort(faction))}</div>

      <div class="hq-label">
        Faction Headquarters • Level ${num(level)}
      </div>
    </div>
  `;
}

  function _recentContributors(feed, limit = 6) {
  const src = Array.isArray(feed) ? feed : [];
  const byUid = new Map();

  for (const x of src) {
    const uid = x && x.uid ? String(x.uid) : "";
    if (!uid) continue;

    const t = Number(x.t || 0);
    const amount = Number(x.amount || 0);

    if (!byUid.has(uid)) {
      byUid.set(uid, {
        uid,
        tail: uid.slice(-4),
        lastTs: t,
        actions: 0,
        upgrades: 0,
        bones: 0,
        scrap: 0,
      });
    }

    const row = byUid.get(uid);
    row.actions += 1;
    row.lastTs = Math.max(row.lastTs, t);

    if (x.type === "upgrade") row.upgrades += 1;
    if (x.asset === "bones") row.bones += amount;
    if (x.asset === "scrap") row.scrap += amount;
  }

  return Array.from(byUid.values())
    .sort((a, b) => (b.lastTs - a.lastTs) || (b.actions - a.actions))
    .slice(0, limit);
}

function _contribSummaryLegacy(c) {
  if (!c) return "";
  if (c.upgrades > 0) return `Upgrades ${c.upgrades}`;
  if (c.bones > 0 && c.scrap > 0) return `${num(c.bones)}🦴 • ${num(c.scrap)}🔩`;
  if (c.bones > 0) return `${num(c.bones)}🦴`;
  if (c.scrap > 0) return `${num(c.scrap)}🔩`;
  return `${num(c.actions)} actions`;
}
  
  // ---------------------------
  // Faction normalization
  // ---------------------------
  function _normFactionKey(f) {
    f = String(f || "").toLowerCase().trim();
    if (!f) return "";
    if (f === "rb" || f === "ew" || f === "pb" || f === "ih") return f;

    if (f === "rogue_byte" || f === "roguebyte" || f.includes("rogue")) return "rb";
    if (f === "echo_wardens" || f === "echowardens" || f.includes("echo")) return "ew";
    if (f === "pack_burners" || f === "packburners" || f.includes("pack") || f.includes("burn")) return "pb";
    if (f === "inner_howl" || f === "inner howlers" || f === "iron_howlers" || f.includes("inner") || f.includes("iron") || f.includes("howl")) return "ih";

    return f;
  }

  function _canonFaction(f) {
    const k = _normFactionKey(f);
    if (k === "rb") return "rogue_byte";
    if (k === "ew") return "echo_wardens";
    if (k === "pb") return "pack_burners";
    if (k === "ih") return "inner_howl";
    return "";
  }

  function niceFactionName(key) {
    const m = {
      rogue_byte: "Rogue Byte",
      echo_wardens: "Echo Wardens",
      pack_burners: "Pack Burners",
      inner_howl: "Inner Howl",
      iron_howlers: "Inner Howl",
    };
    return m[key] || key || "—";
  }

  function factionShort(key) {
    const canon = _canonFaction(key) || key;
    const m = {
      rogue_byte: "RB",
      echo_wardens: "EW",
      pack_burners: "PB",
      inner_howl: "IH",
    };
    return m[canon] || "HQ";
  }

  function _contribSummary(c) {
    if (!c) return "";
    if (c.upgrades > 0) return `Upgrades ${c.upgrades}`;
    if (c.bones > 0 && c.scrap > 0) return `${num(c.bones)} bones / ${num(c.scrap)} scrap`;
    if (c.bones > 0) return `${num(c.bones)} bones`;
    if (c.scrap > 0) return `${num(c.scrap)} scrap`;
    return `${num(c.actions)} actions`;
  }

  const FACTION_HOME_META = {
    rogue_byte: {
      motto: "Breach the cage. Rewrite from inside.",
      summary: "Born after the Betrayal Hash, Rogue Byte infiltrates hostile systems and turns control architecture against itself.",
      belonging: "For players who exploit openings fast, sabotage from inside, and refuse the safety that makes you predictable.",
      tags: ["Breachcraft", "Sabotage", "Blind Spots", "Denial"],
    },
    echo_wardens: {
      motto: "Hold the signal. Defend what must survive.",
      summary: "Echo Wardens guard routes, archives, and ground so the fractured rebellion stays coherent through the Rewrite.",
      belonging: "For players who anchor lines, reinforce allies, and refuse to lose critical ground through neglect.",
      tags: ["Signal", "Defense", "Continuity", "Stability"],
    },
    pack_burners: {
      motto: "If the Chain only understands force, answer in fire.",
      summary: "Pack Burners convert grief into momentum and force stalled fronts to move before enemy structure resets.",
      belonging: "For players who push hard, escalate pressure, and refuse the slow death of hesitation.",
      tags: ["Force", "Pressure", "Momentum", "Dominance"],
    },
    inner_howl: {
      motto: "Hear what the static is trying to say.",
      summary: "Inner Howl reads anomalies, echoes, and hidden pressure so the rebellion reacts before fractures spread.",
      belonging: "For players who trust disciplined intuition and act on insight before others see the breach.",
      tags: ["Anomalies", "Insight", "Pattern", "Foresight"],
    },
  };

  function factionHomeMeta(key) {
    return FACTION_HOME_META[_canonFaction(key)] || {
      motto: "One rebellion. Four war-paths.",
      summary: "After the Betrayal Hash, the Alpha Network split into doctrines, but the war stayed shared.",
      belonging: "Belonging here means carrying the same rebellion through a chosen doctrine.",
      tags: ["Fracture", "Doctrine"],
    };
  }

  function renderMetricRow(label, value, note = "") {
    return `
      <div class="hq-metric-row">
        <div class="hq-metric-copy">
          <div class="hq-metric-label">${esc(label)}</div>
          ${note ? `<div class="hq-metric-note">${esc(note)}</div>` : ``}
        </div>
        <div class="hq-metric-value">${esc(value)}</div>
      </div>
    `;
  }

  function renderTags(tags) {
    const rows = Array.isArray(tags) ? tags.filter(Boolean).slice(0, 4) : [];
    if (!rows.length) return "";
    return `
      <div class="hq-tag-row">
        ${rows.map((tag) => `<span class="hq-tag">${esc(tag)}</span>`).join("")}
      </div>
    `;
  }

  function renderSpotlightRows(social) {
    const top = Array.isArray(social?.topContributors) ? social.topContributors : [];
    const notable = Array.isArray(social?.notableMembers) ? social.notableMembers : [];

    if (top.length) {
      return {
        kicker: "Most active this week",
        rows: top.map((row, idx) => `
          <div class="hq-spotlight-item" ${row.uid ? `data-pack-profile-uid="${esc(row.uid)}"` : ""}>
            <div class="hq-rank-badge">#${idx + 1}</div>
            <div class="hq-spotlight-main">
              <div class="hq-spotlight-name">${esc(row.name || "Member")}${row.isYou ? ` <span class="hq-you-pill">YOU</span>` : ``}</div>
              <div class="hq-spotlight-sub">Score ${num(row.score || 0)}${row.rank ? ` | faction ${rankLabel(row.rank)}` : ``}</div>
            </div>
          </div>
        `).join(""),
      };
    }

    if (notable.length) {
      return {
        kicker: "Known names inside the faction",
        rows: notable.map((row, idx) => `
          <div class="hq-spotlight-item" ${row.uid ? `data-pack-profile-uid="${esc(row.uid)}"` : ""}>
            <div class="hq-rank-badge">${idx + 1}</div>
            <div class="hq-spotlight-main">
              <div class="hq-spotlight-name">${esc(row.name || "Member")}</div>
              <div class="hq-spotlight-sub">Level ${num(row.level || 1)}</div>
            </div>
          </div>
        `).join(""),
      };
    }

    return {
      kicker: "Faction circle",
      rows: `<div class="hq-contrib-empty">More member activity will surface here as the faction fills out.</div>`,
    };
  }

  function renderFactionCircle(social, myPlace, myContribution) {
    const top = Array.isArray(social?.topContributors) ? social.topContributors.slice(0, 3) : [];
    const notable = Array.isArray(social?.notableMembers) ? social.notableMembers.slice(0, 3) : [];
    const topHasYou = top.some((row) => !!row?.isYou);
    const myScore = Number(myContribution?.weeklyScore || myPlace?.weeklyScore || 0);
    const myRank = Number(myPlace?.factionRank || 0);
    const myName = myPlace?.name || "You";

    if (top.length) {
      const topHtml = top.map((row, idx) => `
        <div class="hq-circle-rank-card ${row.isYou ? "is-you" : ""}" data-rank="${idx + 1}" ${row.uid ? `data-pack-profile-uid="${esc(row.uid)}"` : ""}>
          <div class="hq-circle-rank-head">
            <span class="hq-circle-rank-pill">#${idx + 1}</span>
            ${row.isYou ? `<span class="hq-you-pill">YOU</span>` : ``}
          </div>
          <div class="hq-circle-rank-name">${esc(row.name || "Member")}</div>
          <div class="hq-circle-rank-score">${num(row.score || 0)}</div>
          <div class="hq-circle-rank-meta">${row.rank ? `Faction ${rankLabel(row.rank)}` : "Faction contributor"}</div>
        </div>
      `).join("");

      const currentPlayerHtml = topHasYou
        ? `<div class="hq-circle-you-band is-top3">You are visible inside this week's Top 3.</div>`
        : ((myRank > 0 || myScore > 0) ? `
          <div class="hq-circle-you-band">
            <div class="hq-circle-you-copy">
              <div class="hq-circle-you-label">Your line in the faction</div>
              <div class="hq-circle-you-name">${esc(myName)}</div>
            </div>
            <div class="hq-circle-you-stats">
              <div class="hq-circle-you-rank">${esc(rankLabel(myRank))}</div>
              <div class="hq-circle-you-score">${num(myScore)}</div>
            </div>
          </div>
        ` : ``);

      return `
        <div class="hq-circle-topline">Top 3 this week</div>
        <div class="hq-circle-grid">${topHtml}</div>
        ${currentPlayerHtml}
      `;
    }

    if (notable.length) {
      return `
        <div class="hq-circle-topline">Known names inside the faction</div>
        <div class="hq-spotlight">
          ${notable.map((row, idx) => `
            <div class="hq-spotlight-item" ${row.uid ? `data-pack-profile-uid="${esc(row.uid)}"` : ""}>
              <div class="hq-rank-badge">${idx + 1}</div>
              <div class="hq-spotlight-main">
                <div class="hq-spotlight-name">${esc(row.name || "Member")}</div>
                <div class="hq-spotlight-sub">Level ${num(row.level || 1)}</div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    return `<div class="hq-contrib-empty">Faction names will surface here as weekly activity starts to build.</div>`;
  }

  function renderFactionMembersPreview(rows, limit = 4) {
    const members = Array.isArray(rows)
      ? rows.filter((row) => row && row.uid).slice(0, Math.max(1, Number(limit || 4)))
      : [];
    const otherCount = members.filter((row) => !row.isYou).length;
    if (!members.length || otherCount <= 0) {
      return `<div class="hq-contrib-empty">More faction members will appear here as the pack becomes active.</div>`;
    }

    return `
      <div class="hq-member-list">
        ${members.map((row) => {
          const visual = row.skin_url || row.avatar_url || "";
          const roleLine = row.title || row.role || "Faction member";
          const score = Number(row.weeklyScore || 0);
          return `
            <button type="button" class="hq-member-row ${row.isYou ? "is-you" : ""}" data-pack-profile-uid="${esc(row.uid)}">
              <span class="hq-member-visual">
                ${mediaTag(visual, "hq-member-img", row.name || "Member")}
                ${row.frame_url ? `<img class="hq-member-frame" src="${esc(row.frame_url)}" alt="">` : ""}
              </span>
              <span class="hq-member-main">
                <span class="hq-member-name">${esc(row.name || "Member")}${row.isYou ? ` <span class="hq-you-pill">YOU</span>` : ``}</span>
                <span class="hq-member-sub">Lv ${num(row.level || 1)} - ${esc(roleLine)}</span>
              </span>
              <span class="hq-member-score">
                <strong>${num(score)}</strong>
                <span>weekly</span>
              </span>
            </button>
          `;
        }).join("")}
      </div>
    `;
  }

  function _nextHQStageName(level) {
    const next = HQ_HOLO_BY_LEVEL[_clampLvl(Number(level || 1) + 1)];
    return next?.name || "Maximum HQ";
  }

  function _renderCurrentFront(snapshot) {
    const s = snapshot && typeof snapshot === "object" ? snapshot : {};
    const pressure = Number(s.pressureNodes || 0);
    const contested = Number(s.contestedPresence || 0);
    const sieges = Number(s.activeSieges || 0);
    const isLive = pressure > 0 || contested > 0 || sieges > 0;
    const latest = s.recentHighlight || {};
    const detail = latest.text || s.momentumSummary || (isLive
      ? "The faction front is active. Check the line before the state changes."
      : "No urgent faction pressure is being reported right now.");

    return `
      <div class="hq-card hq-current-front ${isLive ? "is-live" : "is-calm"}" data-hq-section="front">
        <div class="hq-card-title">
          <b>CURRENT FRONT</b>
          <span class="hq-tone-pill" data-tone="${esc(s.momentumTone || (isLive ? "pressure" : "calm"))}">
            ${esc(isLive ? (s.momentumLabel || "ACTION REQUIRED") : (s.momentumLabel || "STABLE"))}
          </span>
        </div>
        <div class="hq-front-metrics">
          <div><span>CONTROLLED</span><strong>${num(s.controlledNodes || 0)}</strong></div>
          <div><span>PRESSURE</span><strong>${num(pressure)}</strong></div>
          <div><span>CONTESTED</span><strong>${num(contested)}</strong></div>
          <div><span>LIVE SIEGES</span><strong>${num(sieges)}</strong></div>
        </div>
        <div class="hq-note">${esc(detail)}</div>
        ${isLive ? `<button class="hq-btn primary hq-front-cta" onclick="FactionHQ._openFrontline()">VIEW FRONTLINE</button>` : `<div class="hq-v3-calm-line">Lines holding · no active pressure.</div>`}
      </div>
    `;
  }

  function _openFrontline() {
    try {
      closeView();
      if (typeof window.Influence?.open === "function") {
        return window.Influence.open("phantom_nodes", "Phantom Frontline");
      }
      if (typeof window.MapActivityRouter?.open === "function") {
        return window.MapActivityRouter.open("phantom_nodes");
      }
    } catch (error) {
      console.warn("[FactionHQ] frontline route failed", error);
    }
  }

  function _toggleRoster() {
    _openSheet("roster");
  }

  function _sheetActivityHTML(feed) {
    const rows = Array.isArray(feed) ? feed : [];
    if (!rows.length) return `<div class="hq-v3-sheet-empty">No HQ support or upgrade activity recorded yet.</div>`;
    return `<div class="hq-v3-sheet-list">${rows.slice(0, 20).map((x) => {
      const who = x.uid ? String(x.uid).slice(-4) : "????";
      const when = x.t ? timeAgo(x.t) : "";
      if (x.type === "upgrade") {
        return `<div class="hq-v3-sheet-row"><span class="hq-v3-sheet-mark">↑</span><span><strong>HQ upgraded to Level ${esc(x.level || "?")}</strong><small>by ...${esc(who)}${when ? ` · ${esc(when)}` : ""}</small></span></div>`;
      }
      const asset = String(x.asset || "support");
      const label = asset === "bones" ? "Bones" : (asset === "scrap" ? "Scrap" : "Support");
      return `<div class="hq-v3-sheet-row"><span class="hq-v3-sheet-mark">+</span><span><strong>${num(x.amount || 0)} ${esc(label)} added</strong><small>by ...${esc(who)}${when ? ` · ${esc(when)}` : ""}</small></span></div>`;
    }).join("")}</div>`;
  }

  function _renderAuxSheet() {
    if (!_activeSheet || !_viewModel) return "";
    const vm = _viewModel;
    const close = `<button class="hq-v3-sheet-close" onclick="FactionHQ._closeSheet()" aria-label="Close">×</button>`;
  
    if (_activeSheet === "support") {
      return `<div class="hq-v3-sheet-layer">
        <div class="hq-v3-sheet-backdrop" onclick="FactionHQ._closeSheet()"></div>
        <section class="hq-v3-sheet-panel">
          <div class="hq-v3-sheet-handle"></div>${close}
          <span class="hq-v3-sheet-kicker">SHARED PROGRESSION</span>
          <h3>Support HQ</h3>
          <div class="hq-v3-sheet-stage"><span>HQ LEVEL ${num(vm.curLevel)}</span><strong>${vm.curLevel >= 6 ? "Ghost Layer complete" : `Next: ${esc(vm.nextStageName)}`}</strong></div>
          <div class="hq-v3-sheet-progress"><div><span>Bones</span><strong>${num(vm.bones)} / ${num(vm.needBones)}</strong></div><div class="hq-bar"><span style="width:${pct(vm.bones, vm.needBones)}%"></span></div></div>
          <div class="hq-v3-sheet-progress"><div><span>Scrap</span><strong>${num(vm.scrap)} / ${num(vm.needScrap)}</strong></div><div class="hq-bar"><span style="width:${pct(vm.scrap, vm.needScrap)}%"></span></div></div>
          <div class="hq-v3-support-actions">
            <button class="hq-btn mini subtle" onclick="FactionHQ._donate('bones',25)">+25 Bones</button>
            <button class="hq-btn mini subtle" onclick="FactionHQ._donate('bones',100)">+100 Bones</button>
            <button class="hq-btn mini subtle" onclick="FactionHQ._donate('scrap',10)">+10 Scrap</button>
            <button class="hq-btn mini subtle" onclick="FactionHQ._donate('scrap',50)">+50 Scrap</button>
          </div>
          <button class="hq-v3-sheet-link" onclick="FactionHQ._toggleSupportCustom()">${_supportCustomExpanded ? "Hide custom support" : "Custom support"}</button>
          ${_supportCustomExpanded ? `<div class="hq-v3-custom-support"><input id="hqCustomAmt" class="hq-input" inputmode="numeric" placeholder="Custom amount"><div class="hq-v3-support-actions"><button class="hq-btn mini ghost" onclick="FactionHQ._donateCustom('bones')">Send Bones</button><button class="hq-btn mini ghost" onclick="FactionHQ._donateCustom('scrap')">Send Scrap</button></div></div>` : ""}
          <p class="hq-v3-sheet-note">Shared HQ progression only. No pay-to-win combat power.</p>
        </section>
      </div>`;
    }
  
    if (_activeSheet === "roster") {
      return `<div class="hq-v3-sheet-layer">
        <div class="hq-v3-sheet-backdrop" onclick="FactionHQ._closeSheet()"></div>
        <section class="hq-v3-sheet-panel is-tall">
          <div class="hq-v3-sheet-handle"></div>${close}
          <span class="hq-v3-sheet-kicker">PACK NETWORK</span>
          <h3>Faction Circle</h3>
          <p class="hq-v3-sheet-sub">${num(vm.membersCount)} members in faction</p>
          ${renderFactionMembersPreview(vm.membersRows, 24)}
          ${vm.membersRows.length < vm.membersCount ? `<p class="hq-v3-sheet-note">Showing members available in the current HQ state.</p>` : ""}
        </section>
      </div>`;
    }
  
    if (_activeSheet === "activity") {
      return `<div class="hq-v3-sheet-layer">
        <div class="hq-v3-sheet-backdrop" onclick="FactionHQ._closeSheet()"></div>
        <section class="hq-v3-sheet-panel is-tall">
          <div class="hq-v3-sheet-handle"></div>${close}
          <span class="hq-v3-sheet-kicker">FACTION RECORD</span>
          <h3>HQ Activity</h3>
          ${_sheetActivityHTML(vm.feed)}
        </section>
      </div>`;
    }
  
    if (_activeSheet === "intel") {
      return `<div class="hq-v3-sheet-layer">
        <div class="hq-v3-sheet-backdrop" onclick="FactionHQ._closeSheet()"></div>
        <section class="hq-v3-sheet-panel is-tall">
          <div class="hq-v3-sheet-handle"></div>${close}
          <span class="hq-v3-sheet-kicker">FACTION INTEL</span>
          <h3>${esc(niceFactionName(vm.fk))}</h3>
          <div class="hq-v3-intel-block"><strong>${esc(vm.meta.motto)}</strong><p>${esc(vm.meta.summary)}</p></div>
          <div class="hq-v3-intel-block"><span>DOCTRINE</span><p>${esc(vm.meta.belonging)}</p>${renderTags(vm.meta.tags)}</div>
        </section>
      </div>`;
    }
    return "";
  }

  function _syncCommandCenter() {
    if (!_root || !_viewModel) return;
    _root.setAttribute("data-hq-view", _activeView);
    _root.setAttribute("data-sheet-open", _activeSheet ? "1" : "0");
  
    _root.querySelectorAll(".hq-v3-command-nav,.hq-v3-sheet-layer").forEach((el) => el.remove());
    _root.insertAdjacentHTML("beforeend", `<nav class="hq-v3-command-nav" aria-label="Faction HQ sections">
      <button class="${_activeView === "hq" ? "is-active" : ""}" onclick="FactionHQ._switchView('hq')"><span>HQ</span><small>HOME</small></button>
      <button class="${_activeView === "front" ? "is-active" : ""} ${_viewModel.frontLive ? "has-alert" : ""}" onclick="FactionHQ._switchView('front')"><span>FRONT</span><small>${esc(_viewModel.frontLabel)}</small></button>
      <button class="${_activeView === "pack" ? "is-active" : ""}" onclick="FactionHQ._switchView('pack')"><span>PACK</span><small>${esc(rankLabel(_viewModel.myPlace.factionRank))}</small></button>
    </nav>${_renderAuxSheet()}`);
  
    try { _root.scrollTop = 0; } catch (_) {}
  }

  function _switchView(view) {
    const next = ["hq", "front", "pack"].includes(view) ? view : "hq";
    _activeView = next;
    _activeSheet = "";
    try { _tg?.HapticFeedback?.selectionChanged?.(); } catch (_) {}
    _syncCommandCenter();
  }

  function _openSheet(kind) {
    if (!["support", "roster", "activity", "intel"].includes(kind)) return;
    _activeSheet = kind;
    try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
    _syncCommandCenter();
  }

  function _closeSheet() {
    _activeSheet = "";
    _supportCustomExpanded = false;
    _syncCommandCenter();
  }

  // ---------------------------
  // Theme / backgrounds
  // ---------------------------
  function _hqBgUrlForFaction(faction) {
    const k = _normFactionKey(faction);
    const v = window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
    const map = {
      rb: `/hq_warroom_rb.webp${v}`,
      ew: `/hq_warroom_ew.webp${v}`,
      pb: `/hq_warroom_pb.webp${v}`,
      ih: `/hq_warroom_ih.webp${v}`,
    };
    return map[k] || map.rb;
  }

  function _factionColorFor(faction) {
    const canon = _canonFaction(faction);
    const map = {
      rogue_byte: "#00eaff",
      echo_wardens: "#5bff9a",
      pack_burners: "#ff7a2f",
      inner_howl: "#c45cff",
    };
    return map[canon] || "#00eaff";
  }

  function applyHqBg(faction) {
    const url = _hqBgUrlForFaction(faction);
    const cssUrl = `url("${url}")`;

    const back = document.getElementById("factionHQBack");
    if (!back) return;

    back.style.setProperty("--hq-bg-url", cssUrl);

    let bg = back.querySelector(".hq-bg");
    if (!bg) {
      bg = document.createElement("div");
      bg.className = "hq-bg";
      back.insertBefore(bg, back.firstChild);
    }

    bg.style.setProperty("position", "absolute", "important");
    bg.style.setProperty("inset", "0", "important");
    bg.style.setProperty("display", "block", "important");
    bg.style.setProperty("visibility", "visible", "important");
    bg.style.setProperty("opacity", "1", "important");
    bg.style.setProperty("z-index", "0", "important");
    bg.style.setProperty("background-color", "#07080c", "important");
    bg.style.setProperty("background-image", cssUrl, "important");
    bg.style.setProperty("background-size", "cover", "important");
    bg.style.setProperty("background-position", "center center", "important");
    bg.style.setProperty("background-repeat", "no-repeat", "important");
    bg.style.setProperty("filter", "none", "important");
    bg.style.setProperty("transform", "none", "important");

    back.style.setProperty("position", "fixed", "important");
    back.style.setProperty("inset", "0", "important");
    back.style.setProperty("overflow", "hidden", "important");
    back.style.setProperty("background", "transparent", "important");

    const modal = document.getElementById("factionHQModal");
    if (modal) {
      modal.style.setProperty("position", "absolute", "important");
      modal.style.setProperty("inset", "0", "important");
      modal.style.setProperty("z-index", "2", "important");
      modal.style.setProperty("background", "transparent", "important");
    }

    if (_dbg) {
      const cs = getComputedStyle(bg);
      const rect = bg.getBoundingClientRect();
      console.log("[FactionHQ][BG_FORCE]", {
        faction,
        norm: _normFactionKey(faction),
        url,
        bgExists: !!bg,
        bgImage: cs.backgroundImage,
        display: cs.display,
        visibility: cs.visibility,
        opacity: cs.opacity,
        rect: { w: rect.width, h: rect.height, x: rect.x, y: rect.y }
      });
    }
  }

  function applyHQTheme(faction) {
    const canon = _canonFaction(faction);
    const color = _factionColorFor(faction);

    try {
      if (_back) {
        _back.style.setProperty("--faction-color", color);
        _back.setAttribute("data-faction", canon || "");
      }
      if (_root) {
        _root.style.setProperty("--faction-color", color);
        _root.setAttribute("data-faction", canon || "");
      }
      if (_modal) {
        _modal.style.setProperty("--faction-color", color);
        _modal.setAttribute("data-faction", canon || "");
      }
    } catch (_) { }
  }

  function _prefetchBgs() {
    try {
      const v = window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
      ["rb", "ew", "pb", "ih"].forEach(k => {
        const i = new Image();
        i.src = `/hq_warroom_${k}.webp${v}`;
      });
    } catch (_) { }
  }

  // ---------------------------
  // Styles
  // ---------------------------
  function ensureStyles() {
    if (document.getElementById("factionhq-premium-css")) return;

    const st = document.createElement("style");
    st.id = "factionhq-premium-css";
    st.textContent = `
      #factionHQBack{
        --faction-color:#00eaff;
        position:fixed !important;
        inset:0 !important;
        z-index:999990 !important;
        display:none;
        pointer-events:auto;
      }
      #factionHQBack.is-open{ display:block !important; }

      #factionHQBack .hq-bg{
        position:absolute !important;
        inset:0 !important;
        background:#07080c;
        background-image:var(--hq-bg-url);
        background-size:cover !important;
        background-position:center !important;
        background-repeat:no-repeat !important;
      }
      #factionHQBack .hq-bg::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:
          radial-gradient(120% 70% at 50% 28%, rgba(0,0,0,.10), rgba(0,0,0,.76)),
          linear-gradient(to bottom, rgba(0,0,0,.14), rgba(0,0,0,.88));
      }
      #factionHQBack .hq-vignette{
        position:absolute;
        inset:0;
        pointer-events:none;
        z-index:1;
        background:
          radial-gradient(ellipse at center, rgba(0,0,0,.04) 0%, rgba(0,0,0,.34) 60%, rgba(0,0,0,.82) 100%);
      }
      #factionHQBack .hq-noise{
        position:absolute;
        inset:0;
        z-index:1;
        pointer-events:none;
        opacity:.10;
        mix-blend-mode:screen;
        background-image:
          linear-gradient(to bottom, rgba(255,255,255,.06), rgba(255,255,255,0)),
          repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,.035) 0px,
            rgba(255,255,255,.035) 1px,
            transparent 2px,
            transparent 4px
          );
      }

      #factionHQModal{
        position:absolute !important;
        inset:0 !important;
        z-index:2 !important;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:12px;
      }

      #factionHQRoot{
  --faction-color:#00eaff;
  width:min(620px, 100%);
  max-height:calc(100vh - 14px);
  overflow:auto;
  -webkit-overflow-scrolling:touch;
  padding:14px;
  border-radius:24px;
  color:rgba(255,255,255,.96);
  background:
    linear-gradient(180deg, rgba(11,13,21,.88), rgba(8,10,16,.94));
  border:1px solid rgba(255,255,255,.12);
  box-shadow:
    0 20px 70px rgba(0,0,0,.55),
    inset 0 1px 0 rgba(255,255,255,.08),
    0 0 0 1px rgba(255,255,255,.03),
    0 0 26px color-mix(in srgb, var(--faction-color) 28%, transparent);
  backdrop-filter:blur(14px);
}
#factionHQRoot .hq-head{
  position:relative;
  overflow:hidden;
  border-radius:22px;
  padding:16px 14px 14px;
  margin-bottom:12px;
  background:
    linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02)),
    radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--faction-color) 30%, transparent), transparent 42%);
  border:1px solid rgba(255,255,255,.12);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.08),
    0 12px 28px rgba(0,0,0,.18);
}
      #factionHQRoot .hq-head::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:
          linear-gradient(115deg, transparent 0%, rgba(255,255,255,.09) 48%, transparent 62%);
        transform:translateX(-120%);
        animation:hqScan 6.5s linear infinite;
        opacity:.22;
      }

      #factionHQRoot .hq-topline{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        flex-wrap:wrap;
      }

      #factionHQRoot .hq-pill{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:5px 12px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.5px;
        background:rgba(255,255,255,.07);
        border:1px solid color-mix(in srgb, var(--faction-color) 42%, rgba(255,255,255,.12));
        box-shadow:0 0 18px color-mix(in srgb, var(--faction-color) 18%, transparent);
      }

      #factionHQRoot .hq-status-chip{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:5px 11px;
        border-radius:999px;
        font-size:11px;
        font-weight:900;
        letter-spacing:.45px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.12);
      }
      #factionHQRoot .hq-status-chip.ready{
        color:#c8ffde;
        border-color:rgba(91,255,154,.38);
        box-shadow:0 0 18px rgba(91,255,154,.12);
      }

      #factionHQRoot .hq-title{
        margin:10px 0 6px;
        font-size:28px;
        line-height:1.05;
        font-weight:900;
        letter-spacing:.2px;
      }

      #factionHQRoot .hq-sub{
        opacity:.86;
        font-size:14px;
        line-height:1.4;
      }

      /* === HQ MOCKUP — wizualna siedziba (progresja leveli) === */
      #factionHQRoot .hq-mockup{
  height:300px;
  border-radius:18px;
  background:#0a0c14;
  position:relative;
  overflow:hidden;
  border:2px solid var(--faction-color);
  box-shadow:
    0 0 35px color-mix(in srgb, var(--faction-color) 55%, transparent),
    inset 0 0 0 1px rgba(255,255,255,.05);
  margin:14px 0 4px;
}
      #factionHQRoot .hq-mockup .layer{
        position:absolute;
        inset:0;
        background-size:cover;
        background-position:center;
        transition:opacity 1.4s cubic-bezier(0.4, 0, 0.2, 1), transform 1.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      #factionHQRoot .hq-mockup .layer-base{
        background:
          radial-gradient(circle at 50% 88%, rgba(255,255,255,.06), transparent 30%),
          linear-gradient(180deg, #121726 0%, #0a0c14 100%);
      }

      #factionHQRoot .hq-mockup .layer-grid{
        opacity:.22;
        background-image:
          linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size:22px 22px;
        mask-image:linear-gradient(to bottom, rgba(0,0,0,.88), rgba(0,0,0,.18));
      }

      #factionHQRoot .hq-mockup .layer-core{
        opacity:.78;
        background:
          radial-gradient(circle at 50% 58%, color-mix(in srgb, var(--faction-color) 32%, transparent), transparent 18%),
          radial-gradient(circle at 50% 76%, rgba(255,255,255,.07), transparent 18%);
      }

      #factionHQRoot .hq-mockup .layer-1{
        opacity:0;
        background:
          linear-gradient(transparent 40%, color-mix(in srgb, var(--faction-color) 18%, transparent) 100%);
      }

      #factionHQRoot .hq-mockup .layer-towers{
        opacity:0;
        background:
          linear-gradient(transparent 52%, rgba(0,0,0,.0) 52%),
          radial-gradient(circle at 20% 72%, color-mix(in srgb, var(--faction-color) 18%, transparent), transparent 10%),
          radial-gradient(circle at 80% 72%, color-mix(in srgb, var(--faction-color) 18%, transparent), transparent 10%);
      }

      #factionHQRoot .hq-mockup .tower{
        position:absolute;
        bottom:54px;
        width:34px;
        border-radius:10px 10px 4px 4px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.04)),
          linear-gradient(180deg, color-mix(in srgb, var(--faction-color) 30%, #151a26), #0a0c14 88%);
        border:1px solid rgba(255,255,255,.08);
        box-shadow:0 0 18px color-mix(in srgb, var(--faction-color) 20%, transparent);
        opacity:0;
        transform:translateY(14px);
        transition:opacity 1.2s ease, transform 1.2s ease;
      }
      #factionHQRoot .hq-mockup .tower.left{ left:22%; height:74px; }
      #factionHQRoot .hq-mockup .tower.center{ left:calc(50% - 22px); width:44px; height:102px; border-radius:12px 12px 6px 6px; }
      #factionHQRoot .hq-mockup .tower.right{ right:22%; height:74px; }

      #factionHQRoot .hq-mockup .tower::before{
        content:"";
        position:absolute;
        left:50%;
        top:10px;
        transform:translateX(-50%);
        width:52%;
        height:6px;
        border-radius:999px;
        background:color-mix(in srgb, var(--faction-color) 85%, white);
        box-shadow:0 0 12px color-mix(in srgb, var(--faction-color) 55%, transparent);
      }

      #factionHQRoot .hq-mockup .layer-neon{
        opacity:0;
        background:
          radial-gradient(circle at 50% 63%, color-mix(in srgb, var(--faction-color) 26%, transparent), transparent 26%),
          linear-gradient(transparent 30%, rgba(255,255,255,.03) 100%);
      }

      #factionHQRoot .hq-mockup .layer-sat{
        opacity:0;
        background:
          conic-gradient(
            from 0deg at 50% 44%,
            transparent 0% 18%,
            color-mix(in srgb, var(--faction-color) 72%, white) 22% 28%,
            transparent 33% 62%,
            color-mix(in srgb, var(--faction-color) 52%, white) 68% 74%,
            transparent 78% 100%
          );
        animation:satRotate 25s linear infinite;
        transform-origin:50% 44%;
        filter:blur(1px);
      }

      #factionHQRoot .hq-mockup .scan-ring{
        position:absolute;
        left:50%;
        top:46%;
        width:124px;
        height:124px;
        transform:translate(-50%,-50%);
        border-radius:50%;
        border:1px solid color-mix(in srgb, var(--faction-color) 45%, transparent);
        box-shadow:0 0 22px color-mix(in srgb, var(--faction-color) 18%, transparent);
        opacity:.58;
      }
      #factionHQRoot .hq-mockup .scan-ring.r2{
        width:162px;
        height:162px;
        opacity:.28;
        border-style:dashed;
        animation:satRotate 18s linear infinite reverse;
      }

      #factionHQRoot .hq-mockup .hq-glow-line{
        position:absolute;
        left:10%;
        right:10%;
        bottom:48px;
        height:2px;
        border-radius:999px;
        background:linear-gradient(90deg, transparent, color-mix(in srgb, var(--faction-color) 80%, white), transparent);
        box-shadow:0 0 16px color-mix(in srgb, var(--faction-color) 35%, transparent);
        opacity:.85;
      }

      #factionHQRoot .hq-mockup .hq-badge-mini{
        position:absolute;
        top:12px;
        left:12px;
        min-width:34px;
        height:34px;
        padding:0 10px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.5px;
        color:#fff;
        background:rgba(0,0,0,.42);
        border:1px solid rgba(255,255,255,.10);
        box-shadow:0 0 18px color-mix(in srgb, var(--faction-color) 18%, transparent);
        backdrop-filter:blur(6px);
      }

      #factionHQRoot .hq-mockup .hq-label{
  position:absolute;
  bottom:10px;
  left:12px;
  right:12px;
  background:rgba(0,0,0,.75);
  padding:7px 12px;
  border-radius:12px;
  font-size:12px;
  text-align:center;
  color:#fff;
  border:1px solid color-mix(in srgb, var(--faction-color) 55%, rgba(255,255,255,.12));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05);
}

      #factionHQRoot .hq-mockup[data-level="1"] .layer-1{ opacity:.65; }
      #factionHQRoot .hq-mockup[data-level="2"] .layer-1{ opacity:.90; }
      #factionHQRoot .hq-mockup[data-level="3"] .layer-towers,
      #factionHQRoot .hq-mockup[data-level="4"] .layer-towers{ opacity:1; }
      #factionHQRoot .hq-mockup[data-level="3"] .tower,
      #factionHQRoot .hq-mockup[data-level="4"] .tower,
      #factionHQRoot .hq-mockup[data-level="5"] .tower,
      #factionHQRoot .hq-mockup[data-level="6"] .tower,
      #factionHQRoot .hq-mockup[data-level="7"] .tower{
        opacity:1;
        transform:translateY(0);
      }
      #factionHQRoot .hq-mockup[data-level="5"] .layer-neon,
      #factionHQRoot .hq-mockup[data-level="6"] .layer-neon{ opacity:1; }
      #factionHQRoot .hq-mockup[data-level="7"] .layer-sat{ opacity:.92; }

      #factionHQRoot .hq-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:14px;
      }
      @media (min-width: 700px){
        #factionHQRoot .hq-grid.two{
          grid-template-columns:1fr 1fr;
        }
      }

      #factionHQRoot .hq-card{
        position:relative;
        overflow:hidden;
        border-radius:18px;
        padding:16px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.035));
        border:1px solid rgba(255,255,255,.10);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.06),
          0 10px 24px rgba(0,0,0,.18);
      }
      #factionHQRoot .hq-card::before{
        content:"";
        position:absolute;
        inset:auto -30% 100% -30%;
        height:60%;
        background:radial-gradient(circle, color-mix(in srgb, var(--faction-color) 18%, transparent), transparent 60%);
        opacity:.55;
        pointer-events:none;
      }

      #factionHQRoot .hq-card-title{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:12px;
      }
      #factionHQRoot .hq-card-title b{
        font-size:15px;
        letter-spacing:.2px;
      }

      #factionHQRoot .hq-row{
        display:flex;
        gap:10px;
        align-items:center;
        justify-content:space-between;
      }

      #factionHQRoot .hq-stat-grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
      }

      #factionHQRoot .hq-stat{
        border-radius:16px;
        padding:14px 12px;
        text-align:center;
        background:rgba(0,0,0,.20);
        border:1px solid rgba(255,255,255,.08);
      }
      #factionHQRoot .hq-stat-icon{
        font-size:24px;
        margin-bottom:8px;
      }
      #factionHQRoot .hq-stat-value{
        font-size:22px;
        font-weight:900;
        line-height:1.05;
      }
      #factionHQRoot .hq-stat-label{
        font-size:12px;
        opacity:.78;
        margin-top:4px;
      }

      #factionHQRoot .hq-mini{
        opacity:.84;
        font-size:13px;
        line-height:1.4;
      }

      #factionHQRoot .hq-motto{
        margin-top:6px;
        font-size:15px;
        font-weight:900;
        letter-spacing:.2px;
        color:color-mix(in srgb, var(--faction-color) 55%, white);
      }

      #factionHQRoot .hq-identity{
        margin-top:8px;
        opacity:.88;
        font-size:13px;
        line-height:1.45;
        max-width:44ch;
      }

      #factionHQRoot .hq-tag-row{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:12px;
      }

      #factionHQRoot .hq-tag{
        display:inline-flex;
        align-items:center;
        min-height:28px;
        padding:0 11px;
        border-radius:999px;
        font-size:12px;
        font-weight:800;
        letter-spacing:.2px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.12);
      }

      #factionHQRoot .hq-head-strip{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:12px;
      }

      #factionHQRoot .hq-chip{
        display:inline-flex;
        align-items:center;
        gap:6px;
        min-height:30px;
        padding:0 11px;
        border-radius:999px;
        font-size:12px;
        font-weight:800;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.10);
      }

      #factionHQRoot .hq-chip strong{
        font-weight:900;
        color:#fff;
      }

      #factionHQRoot .hq-role-pill{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:42px;
        padding:0 16px;
        border-radius:999px;
        font-size:16px;
        font-weight:900;
        letter-spacing:.2px;
        color:#081018;
        background:linear-gradient(90deg, color-mix(in srgb, var(--faction-color) 82%, white), var(--faction-color));
        box-shadow:0 12px 24px color-mix(in srgb, var(--faction-color) 22%, transparent);
      }

      #factionHQRoot .hq-tone-pill{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:30px;
        padding:0 11px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.3px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.12);
      }
      #factionHQRoot .hq-tone-pill[data-tone="hot"]{
        color:#ffe7cc;
        border-color:rgba(255,122,47,.35);
      }
      #factionHQRoot .hq-tone-pill[data-tone="contested"]{
        color:#ffd7e2;
        border-color:rgba(255,42,109,.35);
      }
      #factionHQRoot .hq-tone-pill[data-tone="fortified"]{
        color:#d4ffe7;
        border-color:rgba(91,255,154,.35);
      }

      #factionHQRoot .hq-kpi-grid{
        display:grid;
        grid-template-columns:repeat(2, minmax(0, 1fr));
        gap:10px;
      }

      #factionHQRoot .hq-kpi{
        border-radius:14px;
        padding:12px;
        background:rgba(0,0,0,.18);
        border:1px solid rgba(255,255,255,.08);
      }

      #factionHQRoot .hq-kpi-label{
        font-size:11px;
        font-weight:800;
        opacity:.7;
        text-transform:uppercase;
        letter-spacing:.45px;
      }

      #factionHQRoot .hq-kpi-value{
        margin-top:6px;
        font-size:20px;
        line-height:1.05;
        font-weight:900;
      }

      #factionHQRoot .hq-note{
        margin-top:12px;
        padding:11px 12px;
        border-radius:14px;
        background:rgba(255,255,255,.045);
        border:1px solid rgba(255,255,255,.08);
        font-size:13px;
        line-height:1.45;
      }

      #factionHQRoot .hq-divider{
        height:1px;
        margin:14px 0;
        background:linear-gradient(90deg, transparent, rgba(255,255,255,.10), transparent);
      }

      #factionHQRoot .hq-metric-row{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        padding:10px 0;
        border-bottom:1px solid rgba(255,255,255,.08);
      }
      #factionHQRoot .hq-metric-row:last-child{
        border-bottom:0;
        padding-bottom:0;
      }

      #factionHQRoot .hq-metric-copy{
        min-width:0;
        flex:1;
      }

      #factionHQRoot .hq-metric-label{
        font-size:13px;
        font-weight:800;
      }

      #factionHQRoot .hq-metric-note{
        margin-top:3px;
        font-size:12px;
        opacity:.7;
        line-height:1.35;
      }

      #factionHQRoot .hq-metric-value{
        font-size:14px;
        font-weight:900;
        text-align:right;
        white-space:nowrap;
      }

      #factionHQRoot .hq-spotlight{
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      #factionHQRoot .hq-spotlight-item{
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px 12px;
        border-radius:14px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.08);
      }

      #factionHQRoot [data-pack-profile-uid]{
        cursor:pointer;
      }

      #factionHQRoot .hq-member-list{
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      #factionHQRoot .hq-member-row{
        width:100%;
        display:grid;
        grid-template-columns:46px minmax(0, 1fr) auto;
        align-items:center;
        gap:10px;
        padding:9px 10px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.045);
        color:inherit;
        font:inherit;
        text-align:left;
      }

      #factionHQRoot .hq-member-row:active{
        transform:translateY(1px);
      }

      #factionHQRoot .hq-member-row.is-you{
        border-color:color-mix(in srgb, var(--faction-color) 32%, rgba(255,255,255,.10));
      }

      #factionHQRoot .hq-member-visual{
        position:relative;
        width:42px;
        height:42px;
        border-radius:12px;
        overflow:visible;
        background:rgba(0,0,0,.24);
      }

      #factionHQRoot .hq-member-img{
        width:100%;
        height:100%;
        display:block;
        object-fit:cover;
        border-radius:12px;
      }

      #factionHQRoot .hq-member-frame{
        position:absolute;
        inset:-5px;
        width:calc(100% + 10px);
        height:calc(100% + 10px);
        object-fit:contain;
        pointer-events:none;
      }

      #factionHQRoot .hq-member-main{
        min-width:0;
      }

      #factionHQRoot .hq-member-name{
        display:block;
        font-size:13px;
        font-weight:900;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      #factionHQRoot .hq-member-sub{
        display:block;
        margin-top:3px;
        font-size:12px;
        opacity:.72;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      #factionHQRoot .hq-member-score{
        display:flex;
        flex-direction:column;
        align-items:flex-end;
        gap:2px;
        min-width:48px;
      }

      #factionHQRoot .hq-member-score strong{
        font-size:14px;
        line-height:1;
      }

      #factionHQRoot .hq-member-score span{
        font-size:10px;
        text-transform:uppercase;
        letter-spacing:.08em;
        opacity:.58;
      }

      #factionHQRoot .hq-rank-badge{
        width:34px;
        height:34px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:12px;
        font-weight:900;
        background:linear-gradient(180deg, color-mix(in srgb, var(--faction-color) 36%, #1a2030), #0d111b 88%);
        border:1px solid color-mix(in srgb, var(--faction-color) 36%, rgba(255,255,255,.12));
      }

      #factionHQRoot .hq-spotlight-main{
        min-width:0;
        flex:1;
      }

      #factionHQRoot .hq-spotlight-name{
        font-size:13px;
        font-weight:900;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      #factionHQRoot .hq-spotlight-sub{
        margin-top:3px;
        font-size:12px;
        opacity:.72;
        line-height:1.35;
      }

      #factionHQRoot .hq-you-pill{
        display:inline-flex;
        align-items:center;
        padding:1px 6px;
        border-radius:999px;
        font-size:10px;
        font-weight:900;
        letter-spacing:.4px;
        color:#081018;
        background:linear-gradient(90deg, color-mix(in srgb, var(--faction-color) 82%, white), var(--faction-color));
        vertical-align:middle;
      }

      #factionHQRoot .hq-circle-topline{
        margin-bottom:10px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.45px;
        text-transform:uppercase;
        opacity:.72;
      }

      #factionHQRoot .hq-circle-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:9px;
      }

      #factionHQRoot .hq-circle-rank-card{
        padding:12px;
        border-radius:16px;
        background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.035));
        border:1px solid rgba(255,255,255,.10);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.05), 0 8px 18px rgba(0,0,0,.14);
      }

      #factionHQRoot .hq-circle-rank-card.is-you{
        border-color:color-mix(in srgb, var(--faction-color) 48%, rgba(255,255,255,.12));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.06),
          0 0 0 1px color-mix(in srgb, var(--faction-color) 14%, transparent),
          0 12px 22px rgba(0,0,0,.16);
      }

      #factionHQRoot .hq-circle-rank-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
      }

      #factionHQRoot .hq-circle-rank-pill{
        display:inline-flex;
        align-items:center;
        min-height:28px;
        padding:0 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.12);
      }

      #factionHQRoot .hq-circle-rank-name{
        margin-top:10px;
        font-size:14px;
        font-weight:900;
      }

      #factionHQRoot .hq-circle-rank-score{
        margin-top:6px;
        font-size:24px;
        line-height:1;
        font-weight:950;
      }

      #factionHQRoot .hq-circle-rank-meta{
        margin-top:5px;
        font-size:12px;
        opacity:.72;
      }

      #factionHQRoot .hq-circle-you-band{
        margin-top:12px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:11px 12px;
        border-radius:14px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.08);
      }

      #factionHQRoot .hq-circle-you-band.is-top3{
        justify-content:center;
        font-size:13px;
        font-weight:800;
      }

      #factionHQRoot .hq-circle-you-copy{
        min-width:0;
        flex:1;
      }

      #factionHQRoot .hq-circle-you-label{
        font-size:11px;
        font-weight:900;
        letter-spacing:.38px;
        text-transform:uppercase;
        opacity:.7;
      }

      #factionHQRoot .hq-circle-you-name{
        margin-top:4px;
        font-size:13px;
        font-weight:900;
      }

      #factionHQRoot .hq-circle-you-stats{
        text-align:right;
        white-space:nowrap;
      }

      #factionHQRoot .hq-circle-you-rank{
        font-size:13px;
        font-weight:900;
      }

      #factionHQRoot .hq-circle-you-score{
        margin-top:3px;
        font-size:12px;
        opacity:.72;
      }

      @media (min-width: 560px){
        #factionHQRoot .hq-circle-grid{
          grid-template-columns:repeat(3, minmax(0, 1fr));
        }
      }

      #factionHQRoot .hq-progress{
        margin-top:12px;
        display:flex;
        flex-direction:column;
        gap:10px;
      }
      #factionHQRoot .hq-progress-line{
        display:flex;
        flex-direction:column;
        gap:6px;
      }
      #factionHQRoot .hq-progress-head{
        display:flex;
        justify-content:space-between;
        gap:8px;
        font-size:12px;
        opacity:.86;
      }
      #factionHQRoot .hq-bar{
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.06);
      }
      #factionHQRoot .hq-bar > span{
        display:block;
        height:100%;
        width:0%;
        border-radius:999px;
        background:
          linear-gradient(90deg, color-mix(in srgb, var(--faction-color) 62%, white), var(--faction-color));
        box-shadow:0 0 16px color-mix(in srgb, var(--faction-color) 35%, transparent);
      }

      #factionHQRoot .hq-actions{
        display:grid;
        grid-template-columns:repeat(2, minmax(0, 1fr));
        gap:10px;
      }

      #factionHQRoot .hq-actions.compact{
        gap:8px;
      }

      #factionHQRoot .hq-btn{
        width:100%;
        padding:14px 14px;
        border-radius:14px;
        font-weight:800;
        font-size:15px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.09);
        color:#fff;
        transition:transform .15s ease, box-shadow .15s ease, opacity .15s ease, filter .15s ease;
        box-shadow:0 8px 20px rgba(0,0,0,.18);
      }
      #factionHQRoot .hq-btn:active{ transform:translateY(1px) scale(.995); }
      #factionHQRoot .hq-btn.primary{
        background:
          linear-gradient(90deg, color-mix(in srgb, var(--faction-color) 88%, white), var(--faction-color));
        color:#081018;
        border-color:transparent;
      }
      #factionHQRoot .hq-btn.ghost{
        background:rgba(255,255,255,.05);
      }
      #factionHQRoot .hq-btn.mini{
        padding:10px 10px;
        border-radius:12px;
        font-size:13px;
        font-weight:800;
        box-shadow:none;
      }
      #factionHQRoot .hq-btn.subtle{
        background:rgba(255,255,255,.04);
        border-color:rgba(255,255,255,.08);
      }
      #factionHQRoot .hq-btn.pulse{
        animation:hqPulseBtn 1.8s ease-in-out infinite;
      }
      #factionHQRoot .hq-btn[disabled]{
        opacity:.45;
        filter:saturate(.6);
        box-shadow:none;
      }

      #factionHQRoot .hq-input{
        width:100%;
        padding:13px 14px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.24);
        color:#fff;
        outline:none;
        font-weight:700;
        box-sizing:border-box;
      }
      #factionHQRoot .hq-input::placeholder{
        color:rgba(255,255,255,.45);
      }

      #factionHQRoot .hq-support-shell{
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      #factionHQRoot .hq-support-blurb{
        font-size:13px;
        line-height:1.45;
        opacity:.84;
      }

      #factionHQRoot .hq-support-need{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
      }

      #factionHQRoot .hq-support-toggle{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:34px;
        padding:0 12px;
        border-radius:999px;
        font-size:12px;
        font-weight:900;
        letter-spacing:.3px;
        color:#fff;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.10);
        cursor:pointer;
      }

      #factionHQRoot .hq-support-inline{
        display:flex;
        flex-direction:column;
        gap:8px;
        padding-top:2px;
      }

      #factionHQRoot .hq-feed{
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-top:8px;
}

#factionHQRoot .hq-feed-item{
  padding:10px 12px;
  border-radius:12px;
  background:rgba(255,255,255,.055);
  border:1px solid rgba(255,255,255,.08);
  font-size:13px;
  line-height:1.45;
}
      #factionHQRoot .hq-feed-item.upgrade{
        border-color:color-mix(in srgb, var(--faction-color) 30%, rgba(255,255,255,.08));
        box-shadow:0 0 0 1px color-mix(in srgb, var(--faction-color) 8%, transparent) inset;
      }
            #factionHQRoot .hq-contrib-strip{
        display:flex;
        gap:10px;
        overflow-x:auto;
        padding-bottom:4px;
        -webkit-overflow-scrolling:touch;
        scrollbar-width:none;
      }
      #factionHQRoot .hq-contrib-strip::-webkit-scrollbar{
        display:none;
      }

      #factionHQRoot .hq-contrib{
  min-width:84px;
  flex:0 0 auto;
  border-radius:16px;
  padding:9px 9px 8px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.035));
  border:1px solid rgba(255,255,255,.08);
  text-align:center;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.05),
    0 8px 18px rgba(0,0,0,.16);
}

#factionHQRoot .hq-contrib-badge{
  width:38px;
  height:38px;
  margin:0 auto 7px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  font-weight:900;
  letter-spacing:.5px;
  color:#fff;
  background:
    radial-gradient(circle at 35% 30%, rgba(255,255,255,.14), transparent 35%),
    linear-gradient(180deg, color-mix(in srgb, var(--faction-color) 36%, #1a2030), #0d111b 88%);
  border:1px solid color-mix(in srgb, var(--faction-color) 36%, rgba(255,255,255,.12));
  box-shadow:
    0 0 18px color-mix(in srgb, var(--faction-color) 18%, transparent),
    inset 0 1px 0 rgba(255,255,255,.08);
}
      #factionHQRoot .hq-contrib-name{
        font-size:12px;
        font-weight:900;
        line-height:1.1;
        margin-bottom:4px;
      }

      #factionHQRoot .hq-contrib-meta{
        font-size:11px;
        opacity:.78;
        line-height:1.2;
        white-space:nowrap;
      }

      #factionHQRoot .hq-contrib-empty{
        border-radius:14px;
        padding:12px;
        background:rgba(255,255,255,.04);
        border:1px dashed rgba(255,255,255,.10);
        font-size:13px;
        opacity:.8;
      }

      body.hq-open{
        overflow:hidden !important;
        touch-action:none;
      }
      /* === WAR ROOM ENTRY V2 === */
      #factionHQRoot .hq-entry-v2{
        position:relative;
        overflow:hidden;
        margin:-2px -2px 14px;
        padding:16px;
        min-height:610px;
        border-radius:24px;
        border:1px solid color-mix(in srgb, var(--faction-color) 30%, rgba(255,255,255,.12));
        background:
          linear-gradient(180deg, rgba(4,7,12,.08) 0%, rgba(7,10,16,.54) 52%, rgba(7,10,16,.96) 100%),
          radial-gradient(80% 55% at 50% 35%, color-mix(in srgb, var(--faction-color) 18%, transparent), transparent 72%);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 24px 50px rgba(0,0,0,.26);
        animation:hqWarRoomIn .38s ease-out both;
      }
      #factionHQRoot .hq-entry-v2::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:linear-gradient(115deg, transparent 14%, rgba(255,255,255,.055) 49%, transparent 63%);
        transform:translateX(-135%);
        animation:hqWarRoomSweep 1.15s .16s ease-out both;
      }
      #factionHQRoot .hq-entry-v2-top{
        position:relative;
        z-index:5;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }
      #factionHQRoot .hq-entry-v2-copy{
        position:relative;
        z-index:5;
        margin-top:18px;
        max-width:86%;
      }
      #factionHQRoot .hq-entry-v2-kicker{
        font-size:10px;
        font-weight:950;
        letter-spacing:.16em;
        text-transform:uppercase;
        color:color-mix(in srgb, var(--faction-color) 72%, white);
        opacity:.9;
      }
      #factionHQRoot .hq-entry-v2 .hq-title{
        margin:6px 0 4px;
        font-size:clamp(30px,8vw,42px);
        line-height:.98;
        letter-spacing:-.025em;
        text-shadow:0 10px 28px rgba(0,0,0,.48);
      }
      #factionHQRoot .hq-entry-v2 .hq-motto{
        margin-top:0;
        max-width:34ch;
        font-size:13px;
        opacity:.78;
      }
      #factionHQRoot .hq-entry-v2-stage{
        position:relative;
        z-index:3;
        margin:8px -8px 0;
      }
      #factionHQRoot .hq-entry-v2-stage .hq-holo-stage{
        height:300px;
        margin:0;
        border:0;
        box-shadow:none;
        background:
          radial-gradient(circle at 50% 58%, color-mix(in srgb, var(--faction-color) 21%, transparent), transparent 31%),
          linear-gradient(180deg, rgba(11,15,24,.14), rgba(7,10,16,.56));
      }
      #factionHQRoot .hq-entry-v2-stage .hq-holo-model{
        transform:translate(-50%,-50%) scale(1.68);
        filter:
          drop-shadow(0 0 10px color-mix(in srgb, var(--faction-color) 24%, transparent))
          drop-shadow(0 0 34px color-mix(in srgb, var(--faction-color) 24%, transparent));
      }
      #factionHQRoot .hq-entry-v2-stage .hq-label{ display:none; }
      #factionHQRoot .hq-entry-v2-level{
        position:absolute;
        left:14px;
        bottom:12px;
        z-index:8;
        padding:6px 9px;
        border-radius:10px;
        font-size:10px;
        font-weight:900;
        letter-spacing:.08em;
        background:rgba(5,8,13,.72);
        border:1px solid color-mix(in srgb, var(--faction-color) 26%, rgba(255,255,255,.10));
        backdrop-filter:blur(8px);
      }
      #factionHQRoot .hq-entry-v2-level strong{
        font-size:13px;
        margin-left:4px;
      }
      #factionHQRoot .hq-entry-v2-objective{
        position:relative;
        z-index:6;
        margin-top:-16px;
        padding:14px;
        border-radius:18px;
        background:linear-gradient(180deg,rgba(10,14,22,.93),rgba(7,10,16,.97));
        border:1px solid color-mix(in srgb,var(--faction-color) 30%,rgba(255,255,255,.10));
        box-shadow:0 18px 38px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.07);
        backdrop-filter:blur(12px);
      }
      #factionHQRoot .hq-entry-v2-objective-head{
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:flex-start;
      }
      #factionHQRoot .hq-entry-v2-objective-title{
        margin-top:4px;
        font-size:16px;
        font-weight:950;
      }
      #factionHQRoot .hq-entry-v2-levelpath{
        flex:0 0 auto;
        padding:7px 9px;
        border-radius:11px;
        font-size:11px;
        font-weight:950;
        letter-spacing:.05em;
        background:rgba(255,255,255,.045);
        border:1px solid rgba(255,255,255,.09);
      }
      #factionHQRoot .hq-entry-v2-levelpath span{opacity:.5;padding:0 3px;}
      #factionHQRoot .hq-entry-v2-resources{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
        margin-top:13px;
      }
      #factionHQRoot .hq-entry-v2-resources .hq-progress-head{
        margin-bottom:6px;
        font-size:11px;
      }
      #factionHQRoot .hq-entry-v2-resources .hq-bar{height:8px;}
      #factionHQRoot .hq-entry-v2-bottom{
        display:flex;
        align-items:center;
        gap:12px;
        margin-top:13px;
      }
      #factionHQRoot .hq-entry-v2-remaining{
        flex:1;
        min-width:0;
        font-size:11px;
        line-height:1.35;
        opacity:.72;
      }
      #factionHQRoot .hq-entry-v2-cta{
        width:auto;
        min-width:126px;
        padding:11px 14px;
        white-space:nowrap;
      }
      #factionHQRoot .hq-entry-v2-strip{
        position:relative;
        z-index:5;
        display:grid;
        grid-template-columns:1fr 1.35fr .8fr;
        gap:8px;
        margin-top:10px;
      }
      #factionHQRoot .hq-entry-v2-strip > div{
        min-width:0;
        padding:9px 10px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.07);
      }
      #factionHQRoot .hq-entry-v2-strip span{
        display:block;
        font-size:9px;
        font-weight:900;
        letter-spacing:.1em;
        opacity:.5;
      }
      #factionHQRoot .hq-entry-v2-strip strong{
        display:block;
        margin-top:3px;
        overflow:hidden;
        white-space:nowrap;
        text-overflow:ellipsis;
        font-size:11px;
      }
      @keyframes hqWarRoomIn{
        from{opacity:0;transform:translateY(8px) scale(.993);}
        to{opacity:1;transform:none;}
      }
      @keyframes hqWarRoomSweep{
        from{transform:translateX(-135%);}
        to{transform:translateX(145%);}
      }
      @media(max-width:420px){
        #factionHQRoot .hq-entry-v2{padding:13px;min-height:590px;border-radius:19px;}
        #factionHQRoot .hq-entry-v2-stage .hq-holo-stage{height:270px;}
        #factionHQRoot .hq-entry-v2-objective{padding:13px;}
        #factionHQRoot .hq-entry-v2-resources{grid-template-columns:1fr;gap:8px;}
        #factionHQRoot .hq-entry-v2-bottom{align-items:stretch;flex-direction:column;gap:9px;}
        #factionHQRoot .hq-entry-v2-cta{width:100%;}
      }
      @media(prefers-reduced-motion:reduce){
        #factionHQRoot .hq-entry-v2,
        #factionHQRoot .hq-entry-v2::after{animation:none!important;}
      }

      /* === HQ HOLOGRAM ASSET STAGE === */
      #factionHQRoot .hq-holo-stage{
        background:
          radial-gradient(circle at 50% 58%, rgba(0,255,255,.14), transparent 28%),
          linear-gradient(180deg, #101522 0%, #090c14 100%);
      }

      #factionHQRoot .hq-holo-grid{
        position:absolute;
        inset:0;
        opacity:.34;
        pointer-events:none;
        background-image:
          linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
        background-size:22px 22px;
        mask-image:linear-gradient(to bottom, rgba(0,0,0,.92), rgba(0,0,0,.18));
      }

      #factionHQRoot .hq-holo-ring{
        position:absolute;
        left:50%;
        top:46%;
        transform:translate(-50%,-50%);
        border-radius:50%;
        border:1px solid color-mix(in srgb, var(--faction-color) 55%, transparent);
        box-shadow:0 0 22px color-mix(in srgb, var(--faction-color) 18%, transparent);
        opacity:.58;
        pointer-events:none;
        z-index:1;
      }

      #factionHQRoot .hq-holo-ring-a{
        width:132px;
        height:132px;
        animation:satRotate 18s linear infinite;
      }

      #factionHQRoot .hq-holo-ring-b{
        width:176px;
        height:176px;
        opacity:.26;
        border-style:dashed;
        animation:satRotate 24s linear infinite reverse;
      }

      #factionHQRoot .hq-holo-model{
  position:absolute;
  left:50%;
  top:52%;
  width:100%;
  max-width:none;
  max-height:none;
  height:auto;
  object-fit:contain;
  z-index:2;
  user-select:none;
  -webkit-user-drag:none;
  transform:translate(-50%,-50%) scale(1.55);
  transform-origin:center center;
  filter:
    drop-shadow(0 0 8px color-mix(in srgb, var(--faction-color) 18%, transparent))
    drop-shadow(0 0 24px color-mix(in srgb, var(--faction-color) 22%, transparent));
  animation:hqModelFloat 5s ease-in-out infinite;
}
      #factionHQRoot .hq-holo-scan{
        position:absolute;
        inset:0;
        z-index:3;
        pointer-events:none;
        background:linear-gradient(
          180deg,
          transparent 0%,
          rgba(255,255,255,.02) 28%,
          color-mix(in srgb, var(--faction-color) 20%, transparent) 50%,
          rgba(255,255,255,.02) 72%,
          transparent 100%
        );
        transform:translateY(-100%);
        animation:hqVerticalScan 4.6s linear infinite;
        mix-blend-mode:screen;
      }

      #factionHQRoot .hq-holo-stage .hq-badge-mini{
        z-index:4;
      }

      #factionHQRoot .hq-holo-stage .hq-label{
        z-index:4;
      }

      @keyframes hqModelFloat{
        0%,100%{ transform:translate(-50%,-50%) translateY(0px); }
        50%{ transform:translate(-50%,-50%) translateY(-6px); }
      }

      @keyframes hqVerticalScan{
        0%{ transform:translateY(-100%); opacity:0; }
        12%{ opacity:.9; }
        100%{ transform:translateY(100%); opacity:0; }
      }

      @keyframes satRotate {
        from { transform:rotate(0deg); }
        to   { transform:rotate(360deg); }
      }
      @keyframes hqScan{
        0%{ transform:translateX(-120%); }
        100%{ transform:translateX(150%); }
      }
      @keyframes hqPulseBtn{
        0%,100%{
          box-shadow:
            0 8px 20px rgba(0,0,0,.18),
            0 0 0 0 color-mix(in srgb, var(--faction-color) 0%, transparent);
        }
        50%{
          box-shadow:
            0 8px 20px rgba(0,0,0,.18),
            0 0 0 10px color-mix(in srgb, var(--faction-color) 14%, transparent);
        }
      }

      /* === FACTION HQ V3 P0 === */
      #factionHQRoot .hq-entry-v2.hq-v3{
        padding:0 0 14px;
        overflow:hidden;
        border-radius:22px;
        background:linear-gradient(180deg,rgba(6,9,15,.18),rgba(7,10,16,.72) 72%,rgba(7,10,16,.95));
      }
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-top,
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-copy{padding-left:16px;padding-right:16px;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-top{padding-top:14px;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-stage{margin:8px 0 0;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-stage .hq-holo-stage{
        height:clamp(310px,44vh,430px);border-radius:0;
        background:radial-gradient(circle at 50% 58%,color-mix(in srgb,var(--faction-color) 24%,transparent),transparent 34%),linear-gradient(180deg,rgba(5,8,14,.02),rgba(5,8,14,.55));
      }
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-stage .hq-holo-model{transform:translate(-50%,-50%) scale(1.78);}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-objective{margin:-22px 12px 0;border-radius:18px;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-strip{margin:10px 12px 0;}
      #factionHQRoot .hq-next-stage{margin-top:3px;color:color-mix(in srgb,var(--faction-color) 82%,white);font-size:11px;font-weight:900;letter-spacing:.04em;}
      #factionHQRoot .hq-current-front{border-color:rgba(255,255,255,.08);}
      #factionHQRoot .hq-current-front.is-live{border-color:color-mix(in srgb,var(--faction-color) 46%,rgba(255,255,255,.12));box-shadow:0 0 28px color-mix(in srgb,var(--faction-color) 12%,transparent);}
      #factionHQRoot .hq-front-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:11px 0 10px;}
      #factionHQRoot .hq-front-metrics>div{padding:9px 7px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.065);text-align:center;}
      #factionHQRoot .hq-front-metrics span{display:block;font-size:8px;letter-spacing:.08em;opacity:.55;}
      #factionHQRoot .hq-front-metrics strong{display:block;margin-top:4px;font-size:16px;}
      #factionHQRoot .hq-front-cta{margin-top:10px;}
      #factionHQRoot .hq-weekly-v3 .hq-kpi-grid{margin-top:12px;}
      #factionHQRoot .hq-roster-more{margin-top:10px;text-align:center;font-size:11px;opacity:.62;}
      @media(max-width:420px){
        #factionHQRoot .hq-entry-v2.hq-v3{min-height:0;padding-bottom:12px;}
        #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-stage .hq-holo-stage{height:315px;}
        #factionHQRoot .hq-front-metrics{grid-template-columns:repeat(2,1fr);}
      }
      @media(prefers-reduced-motion:reduce){
        #factionHQRoot .hq-entry-v2.hq-v3 .hq-holo-model,
        #factionHQRoot .hq-entry-v2.hq-v3 .hq-holo-scan,
        #factionHQRoot .hq-entry-v2.hq-v3 .hq-holo-ring{animation:none!important;}
      }

      /* === FACTION HQ V3 FINAL COMMAND CENTER === */
      #factionHQRoot{position:relative;padding-bottom:74px;}
      #factionHQRoot[data-sheet-open="1"]{overflow:hidden!important;}
      #factionHQRoot[data-hq-view="hq"] [data-hq-section="front"],
      #factionHQRoot[data-hq-view="hq"] [data-hq-section="pack"],
      #factionHQRoot[data-hq-view="hq"] [data-hq-section="support"],
      #factionHQRoot[data-hq-view="hq"] [data-hq-section="activity"]{display:none!important;}
      #factionHQRoot[data-hq-view="front"] .hq-entry-v2,
      #factionHQRoot[data-hq-view="front"] [data-hq-section="pack"],
      #factionHQRoot[data-hq-view="front"] [data-hq-section="support"],
      #factionHQRoot[data-hq-view="front"] [data-hq-section="activity"]{display:none!important;}
      #factionHQRoot[data-hq-view="front"] [data-hq-section="front"]{display:block!important;margin-top:0;min-height:420px;}
      #factionHQRoot[data-hq-view="pack"] .hq-entry-v2,
      #factionHQRoot[data-hq-view="pack"] [data-hq-section="front"],
      #factionHQRoot[data-hq-view="pack"] [data-hq-section="support"],
      #factionHQRoot[data-hq-view="pack"] [data-hq-section="activity"]{display:none!important;}
      #factionHQRoot[data-hq-view="pack"] [data-hq-section="pack"]{display:block!important;}
      #factionHQRoot .hq-v3-legacy-close{display:none!important;}

      #factionHQRoot .hq-entry-v2.hq-v3{padding-bottom:10px;min-height:0;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-stage .hq-holo-stage{height:clamp(245px,36vh,330px);}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-stage .hq-holo-model{transform:translate(-50%,-50%) scale(1.72);}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-objective{padding:11px 12px;margin-top:-19px;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-objective .hq-entry-v2-kicker{display:none;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-objective-title{font-size:14px;margin-top:0;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-levelpath{padding:5px 7px;font-size:9px;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-resources{margin-top:9px;gap:8px;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-bottom{margin-top:9px;}
      #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-cta{padding:9px 12px;min-width:112px;}

      #factionHQRoot .hq-entry-v2-strip.hq-v3-command-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:8px 10px 0;}
      #factionHQRoot .hq-v3-command-strip button{appearance:none;min-width:0;padding:9px 8px;border-radius:11px;color:#fff;text-align:left;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.065);}
      #factionHQRoot .hq-v3-command-strip button.is-alert{border-color:color-mix(in srgb,var(--faction-color) 50%,rgba(255,255,255,.08));box-shadow:0 0 18px color-mix(in srgb,var(--faction-color) 10%,transparent);}
      #factionHQRoot .hq-v3-command-strip button span,#factionHQRoot .hq-v3-command-strip button small{display:block;}
      #factionHQRoot .hq-v3-command-strip button span{font-size:8px;font-weight:950;letter-spacing:.1em;opacity:.48;}
      #factionHQRoot .hq-v3-command-strip button strong{display:block;margin-top:3px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      #factionHQRoot .hq-v3-command-strip button small{margin-top:2px;font-size:7px;opacity:.45;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      #factionHQRoot .hq-v3-utility-row{display:grid;grid-template-columns:1fr auto;gap:7px;align-items:center;margin:7px 10px 0;}
      #factionHQRoot .hq-v3-utility-row button{appearance:none;border:0;border-radius:10px;padding:8px 9px;color:rgba(255,255,255,.62);background:rgba(255,255,255,.025);font-size:8px;font-weight:850;letter-spacing:.04em;text-align:left;}
      #factionHQRoot .hq-v3-utility-row button:first-child{display:grid;grid-template-columns:auto 1fr auto;gap:7px;align-items:center;white-space:nowrap;overflow:hidden;}
      #factionHQRoot .hq-v3-live-dot{width:5px;height:5px;border-radius:50%;background:var(--faction-color);box-shadow:0 0 8px var(--faction-color);}

      #factionHQRoot .hq-v3-command-nav{position:sticky;bottom:-14px;z-index:55;display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin:12px -14px -14px;padding:7px 10px calc(7px + env(safe-area-inset-bottom,0px));background:rgba(5,8,13,.96);border-top:1px solid rgba(255,255,255,.07);backdrop-filter:blur(15px);}
      #factionHQRoot .hq-v3-command-nav button{position:relative;appearance:none;border:1px solid transparent;border-radius:11px;padding:8px 6px;color:rgba(255,255,255,.44);background:transparent;}
      #factionHQRoot .hq-v3-command-nav button.is-active{color:#fff;background:color-mix(in srgb,var(--faction-color) 8%,rgba(255,255,255,.02));border-color:color-mix(in srgb,var(--faction-color) 25%,rgba(255,255,255,.06));}
      #factionHQRoot .hq-v3-command-nav button.has-alert::after{content:"";position:absolute;right:19%;top:7px;width:5px;height:5px;border-radius:50%;background:var(--faction-color);box-shadow:0 0 8px var(--faction-color);}
      #factionHQRoot .hq-v3-command-nav span,#factionHQRoot .hq-v3-command-nav small{display:block;}
      #factionHQRoot .hq-v3-command-nav span{font-size:10px;font-weight:950;letter-spacing:.08em;}
      #factionHQRoot .hq-v3-command-nav small{margin-top:2px;font-size:7px;opacity:.52;}

      #factionHQRoot[data-hq-view="front"] .hq-current-front{margin:8px 0 0;padding:16px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.026));}
      #factionHQRoot[data-hq-view="front"] .hq-current-front .hq-card-title b{font-size:18px;letter-spacing:.04em;}
      #factionHQRoot[data-hq-view="front"] .hq-front-metrics{margin-top:18px;}
      #factionHQRoot .hq-v3-calm-line{margin-top:14px;padding:22px 12px;text-align:center;border-radius:14px;background:rgba(0,0,0,.18);color:rgba(255,255,255,.58);font-size:10px;}

      #factionHQRoot[data-hq-view="pack"] .hq-grid.two{display:block;}
      #factionHQRoot[data-hq-view="pack"] [data-hq-section="pack"]{margin-bottom:9px;}
      #factionHQRoot[data-hq-view="pack"] .hq-card{padding:13px;}
      #factionHQRoot[data-hq-view="pack"] .hq-kpi-grid{gap:7px;}
      #factionHQRoot[data-hq-view="pack"] .hq-kpi{padding:9px;}
      #factionHQRoot[data-hq-view="pack"] .hq-member-row{padding:8px;}
      #factionHQRoot[data-hq-view="pack"] .hq-metric-row{padding:9px 0;}

      .hq-v3-sheet-layer{position:fixed;inset:0;z-index:1000005;display:flex;align-items:flex-end;justify-content:center;padding:12px;}
      .hq-v3-sheet-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.66);backdrop-filter:blur(4px);}
      .hq-v3-sheet-panel{position:relative;z-index:1;width:min(540px,100%);max-height:min(72vh,650px);overflow:auto;padding:10px 13px 15px;border-radius:22px;background:linear-gradient(180deg,rgba(17,22,31,.99),rgba(6,9,15,.995));border:1px solid color-mix(in srgb,var(--faction-color) 26%,rgba(255,255,255,.09));box-shadow:0 -24px 80px rgba(0,0,0,.65),0 0 28px color-mix(in srgb,var(--faction-color) 9%,transparent);color:#fff;animation:hqV3SheetIn .2s ease-out both;}
      .hq-v3-sheet-panel.is-tall{max-height:84vh;}
      .hq-v3-sheet-handle{width:38px;height:4px;margin:0 auto 9px;border-radius:999px;background:rgba(255,255,255,.17);}
      .hq-v3-sheet-close{position:absolute;right:10px;top:10px;width:32px;height:32px;border:0;border-radius:10px;color:#fff;background:rgba(255,255,255,.05);font-size:20px;}
      .hq-v3-sheet-kicker{display:block;color:var(--faction-color);font-size:8px;font-weight:950;letter-spacing:.14em;}
      .hq-v3-sheet-panel h3{margin:3px 40px 12px 0;font-size:21px;}
      .hq-v3-sheet-sub{margin:-7px 0 12px;font-size:9px;opacity:.48;}
      .hq-v3-sheet-stage{display:flex;justify-content:space-between;gap:10px;padding:10px;margin-bottom:10px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06);font-size:9px;}
      .hq-v3-sheet-stage strong{color:var(--faction-color);}
      .hq-v3-sheet-progress{margin-top:9px;}
      .hq-v3-sheet-progress>div:first-child{display:flex;justify-content:space-between;margin-bottom:5px;font-size:9px;}
      .hq-v3-support-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:11px;}
      .hq-v3-sheet-link{appearance:none;border:0;background:transparent;color:var(--faction-color);padding:11px 0 3px;font-size:9px;font-weight:950;}
      .hq-v3-custom-support{margin-top:7px;}
      .hq-v3-sheet-note{margin:11px 0 0;font-size:8px;line-height:1.4;opacity:.45;}
      .hq-v3-sheet-list{display:grid;gap:7px;}
      .hq-v3-sheet-row{display:grid;grid-template-columns:30px 1fr;gap:8px;align-items:center;padding:9px;border-radius:12px;background:rgba(255,255,255,.026);border:1px solid rgba(255,255,255,.05);}
      .hq-v3-sheet-mark{width:28px;height:28px;display:grid;place-items:center;border-radius:9px;color:var(--faction-color);background:color-mix(in srgb,var(--faction-color) 9%,transparent);font-weight:950;}
      .hq-v3-sheet-row strong{display:block;font-size:10px;}
      .hq-v3-sheet-row small{display:block;margin-top:2px;font-size:8px;opacity:.48;}
      .hq-v3-sheet-empty{padding:22px 8px;text-align:center;font-size:9px;opacity:.45;}
      .hq-v3-intel-block{padding:11px;margin-bottom:9px;border-radius:13px;background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.05);}
      .hq-v3-intel-block>strong{font-size:12px;}
      .hq-v3-intel-block>span{font-size:8px;font-weight:950;letter-spacing:.12em;color:var(--faction-color);}
      .hq-v3-intel-block p{margin:7px 0 0;font-size:9px;line-height:1.5;opacity:.63;}
      @keyframes hqV3SheetIn{from{transform:translateY(22px);opacity:0;}to{transform:none;opacity:1;}}

      @media(max-width:420px){
        #factionHQRoot{max-height:100vh;border-radius:0;padding:10px 10px 72px;}
        #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-stage .hq-holo-stage{height:245px;}
        #factionHQRoot .hq-entry-v2.hq-v3 .hq-entry-v2-resources{grid-template-columns:1fr;gap:6px;}
        #factionHQRoot .hq-v3-command-nav{bottom:-10px;margin-left:-10px;margin-right:-10px;}
        .hq-v3-sheet-layer{padding:0;}
        .hq-v3-sheet-panel{width:100%;max-height:78vh;border-radius:22px 22px 0 0;border-bottom:0;}
        .hq-v3-sheet-panel.is-tall{max-height:88vh;}
      }
      @media(prefers-reduced-motion:reduce){.hq-v3-sheet-panel{animation:none!important;}}
    `;
    document.head.appendChild(st);
  }

  // ---------------------------
  // Vignette / noise
  // ---------------------------
  function ensureHQVignette() {
    if (!_back) return;
    const bg = _back.querySelector(".hq-bg");
    if (!bg) return;

    if (!_back.querySelector(".hq-vignette")) {
      const v = document.createElement("div");
      v.className = "hq-vignette";
      bg.insertAdjacentElement("afterend", v);
    }

    if (!_back.querySelector(".hq-noise")) {
      const n = document.createElement("div");
      n.className = "hq-noise";
      const v = _back.querySelector(".hq-vignette");
      if (v) v.insertAdjacentElement("afterend", n);
      else bg.insertAdjacentElement("afterend", n);
    }
  }

  // ---------------------------
  // DOM
  // ---------------------------
  function ensureModal() {
    ensureStyles();

    _back = document.getElementById("factionHQBack");
    _modal = document.getElementById("factionHQModal");

    if (!_back) {
      _back = document.createElement("div");
      _back.id = "factionHQBack";
      _back.style.display = "none";
      _back.innerHTML = `<div class="hq-bg"></div><div class="hq-vignette"></div><div class="hq-noise"></div><div id="factionHQModal"></div>`;
      document.body.appendChild(_back);
      _modal = document.getElementById("factionHQModal");
    } else {
      if (!_back.querySelector(".hq-bg")) {
        const bg = document.createElement("div");
        bg.className = "hq-bg";
        _back.insertBefore(bg, _back.firstChild);
      }
      if (!_modal) {
        const m = document.createElement("div");
        m.id = "factionHQModal";
        _back.appendChild(m);
        _modal = m;
      }
    }

    _root = document.getElementById("factionHQRoot");
    if (!_root) {
      _root = document.createElement("div");
      _root.id = "factionHQRoot";
      _modal.appendChild(_root);
    }

    ensureHQVignette();

    if (!_back.__hq_click) {
      _back.__hq_click = true;
      _back.addEventListener("click", (e) => {
        const profileEl = e.target?.closest?.("[data-pack-profile-uid]");
        if (profileEl) {
          const uid = String(profileEl.getAttribute("data-pack-profile-uid") || "").trim();
          if (uid) window.PlayerProfile?.open?.(uid, { source: "faction" });
          return;
        }
        if (e.target === _back) return close();
        if (e.target?.classList?.contains("hq-bg")) return close();
        if (e.target?.classList?.contains("hq-vignette")) return close();
        if (e.target?.classList?.contains("hq-noise")) return close();
      });
    }
  }

  // ---------------------------
  // Open / close
  // ---------------------------
  async function open() {
    ensureModal();
    _feedExpanded = false;
    _supportCustomExpanded = false;

    _back.classList.add("is-open");
    document.body.classList.add("hq-open");

    const navMeta = {
      close: () => closeView(),
      isOpen: () => !!_back && _back.classList.contains("is-open")
    };
    try {
      if (window.AlphaNav?.push) window.AlphaNav.push("factionHQBack", navMeta);
      else {
        window.navRegister?.("factionHQBack", navMeta);
        window.navOpen?.("factionHQBack");
      }
    } catch (_) {}

    let cached =
      window.PROFILE?.faction ||
      window.PLAYER_STATE?.profile?.faction ||
      (() => { try { return localStorage.getItem("ah_faction") || ""; } catch (_) { return ""; } })();

    cached = _canonFaction(cached) || cached;

    applyHqBg(cached);
    applyHQTheme(cached);

    await _ensureApiPost();
    await render();
  }

  function closeView() {
    if (_back) _back.classList.remove("is-open");
    document.body.classList.remove("hq-open");
  }

  function close() {
    if (window.AlphaNav?.close?.("factionHQBack", { source: "faction-hq-close" })) return;
    closeView();
    try { window.navClose?.("factionHQBack"); } catch (_) {}
  }

  // ---------------------------
  // State normalization
  // ---------------------------
  function _normStatePayload(res) {
    if (!res || typeof res !== "object") return { ok: false, reason: "NO_RESPONSE" };
    if (res.data && typeof res.data === "object") {
      return { ok: !!res.ok, reason: res.reason, data: res.data, _raw: res };
    }
    return { ok: !!res.ok, reason: res.reason, data: res, _raw: res };
  }

  // ---------------------------
  // Render
  // ---------------------------
  async function _legacyRender_unused() {
    if (!_apiPost) {
      _root.innerHTML = `
        <div class="hq-card">API not ready.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    _root.innerHTML = `<div class="hq-card" style="text-align:center;">Loading HQ…</div>`;

    let raw;
    try {
      raw = await _apiPost("/webapp/faction/hq/state", _dbg ? { dbg: true } : {});
      log("state raw:", raw);
    } catch (e) {
      _root.innerHTML = `
        <div class="hq-card">HQ load failed.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    const res = _normStatePayload(raw);
    const d = res.data || {};

    if (!res.ok) {
      const reason = res.reason || "NO_FACTION";

      if (reason === "NO_FACTION") {
        _root.innerHTML = `
          <div class="hq-head" style="text-align:center;">
            <div class="hq-pill">HQ</div>
            <h2 class="hq-title">Faction HQ</h2>
            <div class="hq-sub">Join a faction to access headquarters.</div>
          </div>
          <div class="hq-grid">
            <div class="hq-card">
              <button class="hq-btn primary" onclick="window.Factions?.open?.()">Choose Faction</button>
              <div style="height:10px"></div>
              <button class="hq-btn ghost" onclick="FactionHQ.close()">Close</button>
            </div>
          </div>
        `;
        return;
      }

      _root.innerHTML = `
        <div class="hq-card">HQ error: <b>${esc(reason)}</b></div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    const fkRaw = d.faction || res._raw?.faction || "";
    const fk = _canonFaction(fkRaw) || String(fkRaw || "").toLowerCase();

    applyHqBg(fk);
    applyHQTheme(fk);

    try {
      if (fk) localStorage.setItem("ah_faction", fk);
      window.Influence?.setFaction?.(fk);
      window.renderFactionBadge?.();
    } catch (_) { }

    const tre = d.treasury || {};
    const bones = Number(tre.bones || 0);
    const scrap = Number(tre.scrap || 0);
    const feed = Array.isArray(d.feed) ? d.feed : [];
const contributors = _recentContributors(feed, 4);
const visibleFeed = _feedExpanded ? feed : feed.slice(0, 3);

    const curLevel = parseInt(d.level || 1, 10) || 1;
    const nextLevel = curLevel + 1;

    const nextCost = d.nextUpgradeCost || {};
    const needBones = parseInt(nextCost.bones || 0, 10) || 0;
    const needScrap = parseInt(nextCost.scrap || 0, 10) || 0;
    const canUpgrade = (bones >= needBones) && (scrap >= needScrap);

    const bonesPct = pct(bones, needBones);
    const scrapPct = pct(scrap, needScrap);
    const bonesLeft = Math.max(0, needBones - bones);
    const scrapLeft = Math.max(0, needScrap - scrap);

    const frontLive = Number(snapshot.pressureNodes || 0) > 0 || Number(snapshot.contestedPresence || 0) > 0 || Number(snapshot.activeSieges || 0) > 0;
    const frontLabel = frontLive ? String(snapshot.momentumLabel || "ACTIVE") : "STABLE";
    const membersRows = d.factionMembersPreview || d.faction_members_preview || [];
    const latestFeed = feed[0];
    const latestActivityText = latestFeed
      ? (latestFeed.type === "upgrade"
        ? `HQ upgraded to Level ${latestFeed.level || "?"}${latestFeed.t ? ` · ${timeAgo(latestFeed.t)}` : ""}`
        : `${num(latestFeed.amount || 0)} ${String(latestFeed.asset || "support")} added to HQ${latestFeed.t ? ` · ${timeAgo(latestFeed.t)}` : ""}`)
      : "No recent HQ support recorded.";
    _viewModel = {
      fk, meta, curLevel, nextLevel, nextStageName, bones, scrap, needBones, needScrap, bonesLeft, scrapLeft,
      supportNeedBones, supportNeedScrap, myPlace, myContribution, snapshot, social, feed, membersRows, membersCount,
      frontLive, frontLabel, latestActivityText
    };

    const dbgLine = _dbg ? `
      <div class="hq-sub" style="margin-top:8px;opacity:.72;">
        uid …${_uidTail()} • faction <b>${esc(String(fk || ""))}</b>
      </div>
    ` : "";

    _root.innerHTML = `
      <div class="hq-head">
        <div class="hq-topline">
          <div class="hq-pill">HQ • ${esc(factionShort(fk))}</div>
          <div class="hq-status-chip ${canUpgrade ? "ready" : ""}">
            ${canUpgrade ? "UPGRADE READY" : "FUNDING"}
          </div>
        </div>

        <div class="hq-title">${esc(niceFactionName(fk))}</div>
        <div class="hq-sub">
          Level <b>${num(curLevel)}</b> • Members <b>${num(d.membersCount ?? "—")}</b>
        </div>
        ${dbgLine}

        ${_hqStageHTML(curLevel, fk)}
      </div>

      <div class="hq-card">
        <div class="hq-card-title">
          <b>HQ Status</b>
          <span class="hq-mini">Lv ${num(curLevel)} → ${num(nextLevel)}</span>
        </div>

        <div class="hq-stat-grid">
          <div class="hq-stat">
            <div class="hq-stat-icon">🦴</div>
            <div class="hq-stat-value">${num(bones)}</div>
            <div class="hq-stat-label">Bones</div>
          </div>
          <div class="hq-stat">
            <div class="hq-stat-icon">🔩</div>
            <div class="hq-stat-value">${num(scrap)}</div>
            <div class="hq-stat-label">Scrap</div>
          </div>
        </div>

        <div class="hq-progress">
          <div class="hq-progress-line">
            <div class="hq-progress-head">
              <span>Bones toward Lv ${num(nextLevel)}</span>
              <span>${num(bones)} / ${num(needBones)}</span>
            </div>
            <div class="hq-bar"><span style="width:${bonesPct}%"></span></div>
          </div>

          <div class="hq-progress-line">
            <div class="hq-progress-head">
              <span>Scrap toward Lv ${num(nextLevel)}</span>
              <span>${num(scrap)} / ${num(needScrap)}</span>
            </div>
            <div class="hq-bar"><span style="width:${scrapPct}%"></span></div>
          </div>
        </div>

        <div class="hq-mini" style="margin-top:12px;">
          Next level: <b>${num(nextLevel)}</b><br/>
          Cost: <b>${num(needBones)}</b> 🦴 + <b>${num(needScrap)}</b> 🔩<br/>
          Remaining: <b>${num(bonesLeft)}</b> 🦴 + <b>${num(scrapLeft)}</b> 🔩<br/>
          <span style="opacity:.86;">
            Bonus: +5% influence multiplier per level (and daily scrap bonus grows).
          </span>
        </div>

        <div style="margin-top:14px;">
          <button class="hq-btn primary ${canUpgrade ? "pulse" : ""}" onclick="FactionHQ._upgrade()" ${canUpgrade ? "" : "disabled"}>
            Upgrade to Level ${num(nextLevel)}
          </button>

          ${canUpgrade ? `
            <div class="hq-mini" style="margin-top:10px;opacity:.85;">
              Treasury threshold reached — HQ can be upgraded now.
            </div>
          ` : `
            <div class="hq-mini" style="margin-top:10px;opacity:.8;">
              Not enough in treasury yet — donate to push it over the line.
            </div>
          `}
        </div>
      </div>

      <div class="hq-card">
        <div class="hq-card-title">
          <b>Donate</b>
          <span class="hq-mini">fuel the HQ</span>
        </div>

        <div class="hq-mini" style="margin-bottom:12px;">
          Donate to the shared faction treasury and help unlock the next level.
        </div>

        <div class="hq-actions">
          <button class="hq-btn" onclick="FactionHQ._donate('bones', 25)">Donate 25 🦴</button>
          <button class="hq-btn" onclick="FactionHQ._donate('bones', 100)">Donate 100 🦴</button>
          <button class="hq-btn" onclick="FactionHQ._donate('scrap', 10)">Donate 10 🔩</button>
          <button class="hq-btn" onclick="FactionHQ._donate('scrap', 50)">Donate 50 🔩</button>
        </div>

        <div style="margin-top:12px;">
          <input id="hqCustomAmt" class="hq-input" inputmode="numeric" placeholder="Custom amount (numbers only)" />
          <div class="hq-actions" style="margin-top:10px;">
            <button class="hq-btn ghost" onclick="FactionHQ._donateCustom('bones')">Custom 🦴</button>
            <button class="hq-btn ghost" onclick="FactionHQ._donateCustom('scrap')">Custom 🔩</button>
          </div>
        </div>
      </div>

      <div class="hq-card">
        <div class="hq-card-title">
          <b>Recent activity</b>
          <button class="hq-btn ghost" style="width:auto;padding:10px 14px;" onclick="FactionHQ.open()">Refresh</button>
        </div>

        <div class="hq-mini" style="margin-bottom:10px;">
          Latest members who helped build the headquarters.
        </div>

        ${
          contributors.length
            ? `
              <div class="hq-contrib-strip">
                ${contributors.map((c) => `
                  <div class="hq-contrib">
                    <div class="hq-contrib-badge">…${esc(c.tail)}</div>
                    <div class="hq-contrib-name">Member</div>
                    <div class="hq-contrib-meta">${esc(_contribSummary(c))}</div>
                  </div>
                `).join("")}
              </div>
            `
            : `
              <div class="hq-contrib-empty">
                No contributors yet — first donations will appear here.
              </div>
            `
        }

        <div class="hq-feed">
  ${visibleFeed.length ? visibleFeed.map((x) => {
            const who = x.uid ? String(x.uid).slice(-4) : "????";
            const t = fmtTs(x.t);

            if (x.type === "upgrade") {
              const lvl = x.level || "?";
              return `
                <div class="hq-feed-item upgrade">
                  <b>⬆️ HQ upgraded</b> <span class="hq-mini">(Lv ${esc(lvl)})</span><br/>
                  <span class="hq-mini">by …${esc(who)} • ${esc(t)}</span>
                </div>
              `;
            }

            const amt = Number(x.amount || 0);
            const asset = String(x.asset || "");
            const icon = asset === "bones" ? "🦴" : (asset === "scrap" ? "🔩" : "•");

            return `
              <div class="hq-feed-item">
                <b>${icon} ${num(amt)}</b> to treasury <span class="hq-mini">(${esc(asset)})</span><br/>
                <span class="hq-mini">from …${esc(who)} • ${esc(t)}</span>
              </div>
            `;
          }).join("") : `
            <div class="hq-feed-item hq-mini">No activity yet.</div>
          `}
        </div>

        ${feed.length > 3 ? `
          <div style="margin-top:10px;">
            <button
              class="hq-btn ghost"
              style="width:100%;"
              onclick="FactionHQ._toggleFeed()"
            >
              ${_feedExpanded ? "Show less" : `Show ${feed.length - 3} more`}
            </button>
          </div>
        ` : ``}
      </div>

      <button class="hq-btn ghost hq-v3-legacy-close" onclick="FactionHQ.close()">Close</button>
    `;
    _syncCommandCenter();
  }

  async function render() {
    if (!(await _ensureApiPost(1500))) {
      _root.innerHTML = `
        <div class="hq-card">API not ready.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    _root.innerHTML = `<div class="hq-card" style="text-align:center;">Loading HQ...</div>`;

    let raw;
    try {
      raw = await _apiPost("/webapp/faction/hq/state", _dbg ? { dbg: true } : {});
      log("state raw:", raw);
    } catch (e) {
      _root.innerHTML = `
        <div class="hq-card">HQ load failed.</div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    const res = _normStatePayload(raw);
    const d = res.data || {};

    if (!res.ok) {
      const reason = res.reason || "NO_FACTION";

      if (reason === "NO_FACTION") {
        _root.innerHTML = `
          <div class="hq-head" style="text-align:center;">
            <div class="hq-pill">HQ</div>
            <h2 class="hq-title">Faction HQ</h2>
            <div class="hq-sub">Join a faction to access headquarters.</div>
          </div>
          <div class="hq-grid">
            <div class="hq-card">
              <button class="hq-btn primary" onclick="window.Factions?.open?.()">Choose Faction</button>
              <div style="height:10px"></div>
              <button class="hq-btn ghost" onclick="FactionHQ.close()">Close</button>
            </div>
          </div>
        `;
        return;
      }

      _root.innerHTML = `
        <div class="hq-card">HQ error: <b>${esc(reason)}</b></div>
        <button class="hq-btn" onclick="FactionHQ.close()">Close</button>
      `;
      return;
    }

    const fkRaw = d.faction || res._raw?.faction || "";
    const fk = _canonFaction(fkRaw) || String(fkRaw || "").toLowerCase();

    applyHqBg(fk);
    applyHQTheme(fk);

    try {
      if (fk) localStorage.setItem("ah_faction", fk);
      window.Influence?.setFaction?.(fk);
      window.renderFactionBadge?.();
    } catch (_) { }

    const tre = d.treasury || {};
    const bones = Number(tre.bones || 0);
    const scrap = Number(tre.scrap || 0);
    const feed = Array.isArray(d.feed) ? d.feed : [];
    const visibleFeed = _feedExpanded ? feed : feed.slice(0, 3);

    const curLevel = parseInt(d.level || 1, 10) || 1;
    const nextLevel = curLevel + 1;
    const nextCost = d.nextUpgradeCost || {};
    const needBones = parseInt(nextCost.bones || 0, 10) || 0;
    const needScrap = parseInt(nextCost.scrap || 0, 10) || 0;
    const canUpgrade = (bones >= needBones) && (scrap >= needScrap);
    const bonesPct = pct(bones, needBones);
    const scrapPct = pct(scrap, needScrap);
    const bonesLeft = Math.max(0, needBones - bones);
    const scrapLeft = Math.max(0, needScrap - scrap);

    const membersCount = Number(d.membersCount ?? d.members_count ?? 0);
    const myPlace = d.myPlace || {};
    const myContribution = d.myContribution || {};
    const snapshot = d.snapshot || {};
    const social = d.social || {};
    const meta = factionHomeMeta(fk);
    const factionCircleHTML = renderFactionCircle(social, myPlace, myContribution);
    const membersPreviewHTML = renderFactionMembersPreview(d.factionMembersPreview || d.faction_members_preview || []);
    const highlight = snapshot.recentHighlight || {};
    const nextStageName = curLevel >= 6 ? "Maximum HQ" : _nextHQStageName(curLevel);
    const currentFrontHTML = _renderCurrentFront(snapshot);
    const contributionSupportNote = Number(myContribution.hqDonationCount || 0) > 0
      ? `HQ support sent: ${num(myContribution.hqBonesDonated || 0)} bones and ${num(myContribution.hqScrapDonated || 0)} scrap across ${num(myContribution.hqDonationCount || 0)} drops.`
      : "HQ support has not started from your side yet. Treasury donations show up here as soon as you send them.";
    const supportNeedBones = Math.max(0, needBones - bones);
    const supportNeedScrap = Math.max(0, needScrap - scrap);
    const highlightHTML = highlight.text
      ? `<div class="hq-note"><b>Latest:</b> ${esc(highlight.text)}${highlight.ts ? ` <span class="hq-mini">(${esc(timeAgo(highlight.ts))})</span>` : ``}</div>`
      : `<div class="hq-note">${esc(snapshot.momentumSummary || "Faction movement will surface here when the world state picks up.")}</div>`;

    const dbgLine = _dbg ? `
      <div class="hq-sub" style="margin-top:8px;opacity:.72;">
        uid ...${_uidTail()} | faction <b>${esc(String(fk || ""))}</b>
      </div>
    ` : "";

    _root.innerHTML = `
      <section class="hq-entry-v2 hq-v3">
        <div class="hq-entry-v2-top">
          <div class="hq-pill">FACTION HQ · ${esc(factionShort(fk))}</div>
          <div class="hq-status-chip ${canUpgrade ? "ready" : ""}">
            ${canUpgrade ? "UPGRADE READY" : "HQ ONLINE"}
          </div>
        </div>

        <div class="hq-entry-v2-copy">
          <div class="hq-entry-v2-kicker">WAR ROOM</div>
          <div class="hq-title">${esc(niceFactionName(fk))}</div>
          <div class="hq-motto">${esc(meta.motto)}</div>
        </div>

        <div class="hq-entry-v2-stage">
          ${_hqStageHTML(curLevel, fk)}
          <div class="hq-entry-v2-level">HQ LEVEL <strong>${num(curLevel)}</strong></div>
        </div>

        <div class="hq-entry-v2-objective">
          <div class="hq-entry-v2-objective-head">
            <div>
              <div class="hq-entry-v2-kicker">CURRENT OBJECTIVE</div>
              <div class="hq-entry-v2-objective-title">${curLevel >= 6 ? "HQ at maximum level" : `Raise HQ to Level ${num(nextLevel)}`}</div>
              <div class="hq-next-stage">${curLevel >= 6 ? "Ghost Layer fully established" : `Next: ${esc(nextStageName)}`}</div>
            </div>
            <div class="hq-entry-v2-levelpath">${curLevel >= 6 ? `LV ${num(curLevel)} · MAX` : `LV ${num(curLevel)} <span>→</span> ${num(nextLevel)}`}</div>
          </div>

          <div class="hq-entry-v2-resources">
            <div>
              <div class="hq-progress-head">
                <span>Bones</span>
                <span>${num(bones)} / ${num(needBones)}</span>
              </div>
              <div class="hq-bar"><span style="width:${bonesPct}%"></span></div>
            </div>
            <div>
              <div class="hq-progress-head">
                <span>Scrap</span>
                <span>${num(scrap)} / ${num(needScrap)}</span>
              </div>
              <div class="hq-bar"><span style="width:${scrapPct}%"></span></div>
            </div>
          </div>

          <div class="hq-entry-v2-bottom">
            <div class="hq-entry-v2-remaining">
              ${canUpgrade
                ? "Treasury threshold reached. HQ can advance."
                : `${num(bonesLeft)} bones · ${num(scrapLeft)} scrap remaining`}
            </div>
            ${canUpgrade ? `
              <button class="hq-btn primary pulse hq-entry-v2-cta" onclick="FactionHQ._upgrade()">Upgrade HQ</button>
            ` : `
              <button class="hq-btn primary hq-entry-v2-cta" onclick="FactionHQ._openSheet('support')">Support HQ</button>
            `}
          </div>
        </div>

        <div class="hq-entry-v2-strip hq-v3-command-strip">
          <button onclick="FactionHQ._switchView('front')" class="${frontLive ? "is-alert" : ""}"><span>FRONT</span><strong>${esc(frontLabel)}</strong><small>${frontLive ? "Needs attention" : "No active pressure"}</small></button>
          <button onclick="FactionHQ._switchView('pack')"><span>SIGNAL</span><strong>${esc(rankLabel(myPlace.factionRank))} · ${num(myContribution.weeklyScore || myPlace.weeklyScore || 0)}</strong><small>Weekly standing</small></button>
          <button onclick="FactionHQ._switchView('pack')"><span>PACK</span><strong>${num(membersCount)}</strong><small>Faction members</small></button>
        </div>
        <div class="hq-v3-utility-row">
          <button onclick="FactionHQ._openSheet('activity')"><span class="hq-v3-live-dot"></span><span>${esc(latestActivityText)}</span><strong>›</strong></button>
          <button onclick="FactionHQ._openSheet('intel')">FACTION INTEL</button>
        </div>
        ${dbgLine}
      </section>

      <div class="hq-grid">
        ${currentFrontHTML}
      </div>

      <div class="hq-grid two">
        <div class="hq-card hq-weekly-v3" data-hq-section="pack">
          <div class="hq-card-title">
            <b>Weekly Signal</b>
            <span class="hq-mini">${esc(myPlace.rankBand || "Faction standing")}</span>
          </div>

          <div class="hq-note" style="margin-top:0;">
            Faces carrying the faction right now, with your own line kept in view.
          </div>
          <div style="margin-top:12px;">
            ${factionCircleHTML}
          </div>
          <div class="hq-kpi-grid">
            <div class="hq-kpi"><div class="hq-kpi-label">Weekly score</div><div class="hq-kpi-value">${num(myPlace.weeklyScore || 0)}</div></div>
            <div class="hq-kpi"><div class="hq-kpi-label">Faction rank</div><div class="hq-kpi-value">${esc(rankLabel(myPlace.factionRank))}</div></div>
            <div class="hq-kpi"><div class="hq-kpi-label">Overall rank</div><div class="hq-kpi-value">${esc(rankLabel(myPlace.overallRank))}</div></div>
            <div class="hq-kpi"><div class="hq-kpi-label">Player level</div><div class="hq-kpi-value">${num(myPlace.level || 1)}</div></div>
          </div>
          <div class="hq-note">${esc(myPlace.status || "You are part of the faction network.")}</div>
        </div>

        <div class="hq-card hq-v3-roster-card" data-hq-section="pack">
          <div class="hq-card-title">
            <b>Faction Circle</b>
            <span class="hq-mini">Pack Members</span>
          </div>

          <div class="hq-note" style="margin-top:0;">Members carrying the faction signal.</div>
          <div style="margin-top:12px;">
            ${membersPreviewHTML}
          </div>
          <button class="hq-support-toggle hq-roster-more" onclick="FactionHQ._openSheet('roster')">View roster</button>
        </div>

        <div class="hq-card hq-v3-contribution-card" data-hq-section="pack">
          <div class="hq-card-title">
            <b>Your Contribution</b>
            <span class="hq-mini">${num(myContribution.activeDays || 0)} active days</span>
          </div>

          ${renderMetricRow("Weekly influence", num(myContribution.weeklyScore || 0), "Live score from patrols, donations, and siege play.")}
          ${renderMetricRow("Patrol impact", num(myContribution.patrolScore || 0))}
          ${renderMetricRow("Donation impact", num(myContribution.donateScore || 0))}
          ${renderMetricRow("Siege impact", num(myContribution.siegeScore || 0))}
          ${renderMetricRow("HQ support", `${num(myContribution.hqDonationCount || 0)} drops`, myContribution.lastDonationAt ? `Last support ${timeAgo(myContribution.lastDonationAt)}` : "")}

          <div class="hq-note">${esc(contributionSupportNote)}</div>
        </div>

      </div>

      <div class="hq-grid">
        <div class="hq-card hq-v3-support-card" id="hqSupportHQ" data-hq-section="support">
          <div class="hq-card-title">
            <b>Support HQ</b>
            <span class="hq-mini">calm, shared boosts</span>
          </div>

          <div class="hq-support-shell">
            <div class="hq-support-blurb">
              Small treasury support for HQ progression. Mission objectives stay in Broken Contracts.
            </div>

            <div class="hq-support-need">
              <div class="hq-chip">Need <strong>${num(supportNeedBones)}</strong> bones</div>
              <div class="hq-chip">Need <strong>${num(supportNeedScrap)}</strong> scrap</div>
            </div>

            <div class="hq-actions compact">
              <button class="hq-btn mini subtle" onclick="FactionHQ._donate('bones', 25)">+25 Bones</button>
              <button class="hq-btn mini subtle" onclick="FactionHQ._donate('bones', 100)">+100 Bones</button>
              <button class="hq-btn mini subtle" onclick="FactionHQ._donate('scrap', 10)">+10 Scrap</button>
              <button class="hq-btn mini subtle" onclick="FactionHQ._donate('scrap', 50)">+50 Scrap</button>
            </div>

            <div>
              <button class="hq-support-toggle" onclick="FactionHQ._toggleSupportCustom()">
                ${_supportCustomExpanded ? "Hide custom support" : "Custom support"}
              </button>
            </div>

            ${_supportCustomExpanded ? `
              <div class="hq-support-inline">
                <input id="hqCustomAmt" class="hq-input" inputmode="numeric" placeholder="Custom amount" />
                <div class="hq-actions compact">
                  <button class="hq-btn mini ghost" onclick="FactionHQ._donateCustom('bones')">Send Bones</button>
                  <button class="hq-btn mini ghost" onclick="FactionHQ._donateCustom('scrap')">Send Scrap</button>
                </div>
              </div>
            ` : ``}
          </div>
        </div>
      </div>

      <div class="hq-card hq-v3-build-log" data-hq-section="activity">
        <div class="hq-card-title">
          <b>HQ Build Log</b>
          <button class="hq-btn ghost" style="width:auto;padding:10px 14px;" onclick="FactionHQ.open()">Refresh</button>
        </div>

        <div class="hq-mini" style="margin-bottom:10px;">
          Recent HQ support and upgrade moments.
        </div>

        <div class="hq-feed">
          ${visibleFeed.length ? visibleFeed.map((x) => {
            const who = x.uid ? String(x.uid).slice(-4) : "????";
            const t = fmtTs(x.t);

            if (x.type === "upgrade") {
              const lvl = x.level || "?";
              return `
                <div class="hq-feed-item upgrade">
                  <b>HQ upgraded</b> <span class="hq-mini">(Lv ${esc(lvl)})</span><br/>
                  <span class="hq-mini">by ...${esc(who)} | ${esc(t)}</span>
                </div>
              `;
            }

            const amt = Number(x.amount || 0);
            const asset = String(x.asset || "");
            const assetLabel = asset === "bones" ? "bones" : (asset === "scrap" ? "scrap" : asset || "support");

            return `
              <div class="hq-feed-item">
                <b>${num(amt)} ${esc(assetLabel)}</b> to treasury<br/>
                <span class="hq-mini">from ...${esc(who)} | ${esc(t)}</span>
              </div>
            `;
          }).join("") : `
            <div class="hq-feed-item hq-mini">No activity yet.</div>
          `}
        </div>

        ${feed.length > 3 ? `
          <div style="margin-top:10px;">
            <button
              class="hq-btn ghost"
              style="width:100%;"
              onclick="FactionHQ._toggleFeed()"
            >
              ${_feedExpanded ? "Show less" : `Show ${feed.length - 3} more`}
            </button>
          </div>
        ` : ``}
      </div>

      <button class="hq-btn ghost" onclick="FactionHQ.close()">Close</button>
    `;
  }

  // ---------------------------
  // Actions
  // ---------------------------
  async function _donate(asset, amount) {
    if (!_apiPost) return;
    const run_id = _rid("hq:donate");

    try {
      const r = await _apiPost("/webapp/faction/hq/donate", { asset, amount, run_id });
      if (r && r.ok) {
        _supportCustomExpanded = false;
        try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) { }
        await render();
        return;
      }
      alert((r && r.reason) ? `Donate failed: ${r.reason}` : "Donate failed.");
    } catch (e) {
      alert("Donate failed.");
    }
  }

  async function _donateCustom(asset) {
    const el = document.getElementById("hqCustomAmt");
    const n = parseInt((el && el.value) || "0", 10) || 0;
    if (n <= 0) return alert("Enter amount.");
    return _donate(asset, n);
  }
  function _toggleSupportCustom() {
    _supportCustomExpanded = !_supportCustomExpanded;
    if (_activeSheet) _syncCommandCenter(); else render();
  }
  function _toggleFeed() {
  _feedExpanded = !_feedExpanded;
  render();
  }

  async function _upgrade() {
    if (!_apiPost) return;
    const run_id = _rid("hq:upgrade");

    try {
      const r = await _apiPost("/webapp/faction/hq/upgrade", { run_id });

      if (r && r.ok) {
        try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) { }
        await render();
        return;
      }

      if (r && r.reason === "INSUFFICIENT") {
        const c = r.cost || {};
        alert(`Not enough in treasury.\nNeed: ${c.bones || 0} bones + ${c.scrap || 0} scrap`);
        return;
      }

      alert((r && r.reason) ? `Upgrade failed: ${r.reason}` : "Upgrade failed.");
    } catch (e) {
      alert("Upgrade failed.");
    }
  }

  // ---------------------------
  // Init
  // ---------------------------
  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _globalApiPost() || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    log("init ok");
    _prefetchBgs();
  }

  window.FactionHQ = {
    init,
    open,
    close,
    _donate,
    _donateCustom,
    _toggleSupportCustom,
    _upgrade,
    _toggleFeed,
    _toggleRoster,
    _switchView,
    _openSheet,
    _closeSheet,
    _openFrontline,
    applyHqBg
  };
})();
