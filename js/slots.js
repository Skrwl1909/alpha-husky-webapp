(function (global) {
  const BUILDING_ID = "abandoned_wallets_vault";
  const MODAL_ID = "recoveryTerminalBack";
  const STYLE_ID = "recoveryTerminalStyles";

  const IMAGE = {
    frame: "images/slots/slot_frame_2048.png",
    reel1: "images/slots/reel1.png",
    reel2: "images/slots/reel2.png",
    reel3: "images/slots/reel3.png",
    spinVideo: "images/slots/reels_spin_512.webm",
    ghostLedgerAlphaTeaser: "images/slots/ghost_ledger_alpha_teaser.png",
    VISOR: "images/slots/VISOR.png",
    WILD: "images/slots/WILD.png",
    RELIC: "images/slots/RELIC.png",
    SCATTER: "images/slots/SCATTER.png",
    SCRAP: "images/slots/SCRAP.png",
    SHARD: "images/slots/SHARD.png",
  };

  const DEFAULT_ROWS = [
    ["VISOR", "RELIC", "SCRAP"],
    ["SCRAP", "WILD", "SHARD"],
    ["RELIC", "SCRAP", "VISOR"],
  ];
  const SPIN_SYMBOLS = ["VISOR", "WILD", "RELIC", "SCATTER", "SCRAP", "SHARD"];
  const SPIN_MIN_MS = 920;
  const SPIN_TICK_MS = 54;
  const REEL_STOP_DELAY_MS = 210;

  const S = {
    apiPost: null,
    tg: null,
    dbg: false,
    spinning: false,
    lastState: null,
    cells: [],
    cellEls: [],
    reels: [],
    spinIntervals: [],
    spinVideo: null,
    spinVideoUsable: true,
    spinVideoActive: false,
  };

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function makeRunId(prefix, key) {
    if (typeof global.AH_makeRunId === "function") {
      return global.AH_makeRunId(prefix, key);
    }
    const uid = String(global.Telegram?.WebApp?.initDataUnsafe?.user?.id || "0");
    const rand = Math.random().toString(16).slice(2, 10);
    return `${prefix}:${uid}:${String(key || "").slice(0, 48)}:${Date.now()}:${rand}`;
  }

  function el(id) {
    return document.getElementById(id);
  }

  function normalizeRows(rows) {
    const src = Array.isArray(rows) ? rows : DEFAULT_ROWS;
    const out = [];
    for (let r = 0; r < 3; r += 1) {
      const row = Array.isArray(src[r]) ? src[r] : [];
      const normalized = [];
      for (let c = 0; c < 3; c += 1) {
        normalized.push(String(row[c] || "SCRAP").toUpperCase());
      }
      out.push(normalized);
    }
    return out;
  }

  function symbolImage(symbol) {
    return IMAGE[String(symbol || "").toUpperCase()] || IMAGE.SCRAP;
  }

  function setStatus(text) {
    const node = el("rtStatus");
    if (node) node.textContent = text || "";
  }

  function setResultCard(kind, title, meta) {
    const box = el("rtResult");
    const titleEl = el("rtResultTitle");
    const metaEl = el("rtResultMeta");
    if (!box || !titleEl || !metaEl) return;

    box.classList.remove("is-neutral", "is-win", "is-special", "is-miss");
    box.classList.add(kind || "is-neutral");
    titleEl.textContent = title || "";
    metaEl.textContent = meta || "";
  }

  function setSummary(text) {
    setResultCard("is-neutral", text || "", "");
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms || 0))));
  }

  function clearWinHighlights() {
    const cells = S.cellEls || [];
    for (let r = 0; r < cells.length; r += 1) {
      const row = cells[r] || [];
      for (let c = 0; c < row.length; c += 1) {
        row[c]?.classList?.remove("is-payline-win", "is-hit", "is-wild-hit");
      }
    }
  }

  function clearSpinIntervals() {
    const arr = Array.isArray(S.spinIntervals) ? S.spinIntervals : [];
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i]) clearInterval(arr[i]);
    }
    S.spinIntervals = [];
  }

  async function startSpinVideoOverlay() {
    const frame = el("rtBoardFrame");
    const video = S.spinVideo || el("rtSpinVideo");
    if (!frame || !video || S.spinVideoUsable === false) return false;

    try {
      video.currentTime = 0;
      const maybePromise = video.play?.();
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }
      frame.classList.add("video-spin-active");
      S.spinVideoActive = true;
      return true;
    } catch (err) {
      frame.classList.remove("video-spin-active");
      S.spinVideoActive = false;
      if (String(err?.name || "") === "NotSupportedError") {
        S.spinVideoUsable = false;
      }
      return false;
    }
  }

  function stopSpinVideoOverlay() {
    const frame = el("rtBoardFrame");
    const video = S.spinVideo || el("rtSpinVideo");
    frame?.classList?.remove("video-spin-active");
    S.spinVideoActive = false;
    if (!video) return;
    try { video.pause?.(); } catch (_) {}
    try { video.currentTime = 0; } catch (_) {}
  }

  function setCellSymbol(row, col, symbol) {
    const img = S.cells?.[row]?.[col];
    if (!img) return;
    const sym = String(symbol || "SCRAP").toUpperCase();
    img.src = symbolImage(sym);
    img.alt = sym;
  }

  function setColumnSymbols(col, rows) {
    const safe = normalizeRows(rows);
    setCellSymbol(0, col, safe[0][col]);
    setCellSymbol(1, col, safe[1][col]);
    setCellSymbol(2, col, safe[2][col]);
  }

  function cycleReelColumn(col) {
    const topNow = String(S.cells?.[0]?.[col]?.alt || "SCRAP").toUpperCase();
    const midNow = String(S.cells?.[1]?.[col]?.alt || "SCRAP").toUpperCase();
    const nextTop = SPIN_SYMBOLS[Math.floor(Math.random() * SPIN_SYMBOLS.length)] || "SCRAP";
    setCellSymbol(2, col, midNow);
    setCellSymbol(1, col, topNow);
    setCellSymbol(0, col, nextTop);
  }

  function startVisualSpin() {
    clearWinHighlights();
    clearSpinIntervals();
    setResultCard("is-neutral", "Recovering cache...", "Reels spinning.");
    void startSpinVideoOverlay();

    const reels = Array.isArray(S.reels) ? S.reels : [];
    for (let col = 0; col < reels.length; col += 1) {
      const reel = reels[col];
      reel?.classList?.remove("is-settle");
      reel?.classList?.add("is-rolling");
      cycleReelColumn(col);
      S.spinIntervals[col] = setInterval(() => cycleReelColumn(col), SPIN_TICK_MS + (col * 8));
    }
  }

  async function stopVisualSpin(finalRows) {
    const reels = Array.isArray(S.reels) ? S.reels : [];
    const safeRows = normalizeRows(finalRows);
    const usedVideo = !!S.spinVideoActive;
    stopSpinVideoOverlay();
    if (usedVideo) await sleep(110);

    for (let col = 0; col < reels.length; col += 1) {
      if (S.spinIntervals[col]) {
        clearInterval(S.spinIntervals[col]);
        S.spinIntervals[col] = null;
      }

      setColumnSymbols(col, safeRows);
      const reel = reels[col];
      reel?.classList?.remove("is-rolling");
      reel?.classList?.add("is-settle");
      setTimeout(() => reel?.classList?.remove("is-settle"), 220);

      if (col < reels.length - 1) await sleep(REEL_STOP_DELAY_MS);
    }

    clearSpinIntervals();
  }

  function buildSpinOutcome(out, rows) {
    const safeRows = normalizeRows(rows);
    const payline = safeRows[1];
    const rewards = out?.rewards || {};
    const lineSymbol = String(out?.result?.lineSymbol || "").toUpperCase();
    const scatterCount = Number(out?.result?.scatterCount || 0);
    const freeSpins = Number(rewards.free_spins || 0);
    const scatterTriggered = scatterCount >= 3 || freeSpins > 0;
    const fragmentWon = !!out?.fragment?.won;
    const wildAssist = !!lineSymbol && lineSymbol !== "WILD" && payline.includes("WILD");

    const gains = [];
    const bones = Number(rewards.bones || 0);
    const scrap = Number(rewards.scrap || 0);
    const dust = Number(rewards.rune_dust || 0);
    const shardAmount = Number(rewards.shard_amount || 0);
    const shardSlot = String(rewards.shard_slot || "").replace(/_/g, " ").trim();

    if (bones > 0) gains.push(`+${bones} Bones`);
    if (scrap > 0) gains.push(`+${scrap} Scrap`);
    if (dust > 0) gains.push(`+${dust} Rune Dust`);
    if (shardAmount > 0) gains.push(`+${shardAmount} ${shardSlot ? `${shardSlot} Shards` : "Shards"}`);

    const lineWin = !!lineSymbol;
    const hasAnything = lineWin || scatterTriggered || fragmentWon || gains.length > 0;

    if (!hasAnything) {
      return {
        kind: "is-miss",
        title: "Recovery failed. Nothing salvageable found.",
        meta: "No rewards this cycle.",
        lineWin: false,
        wildAssist: false,
      };
    }

    let title = "Recovery successful.";
    if (wildAssist) title = "WILD completed the line.";
    else if (lineWin) title = "Line recovery successful.";
    else if (freeSpins > 0) title = `Cache breach: +${freeSpins} Free Spin${freeSpins > 1 ? "s" : ""}.`;
    else if (scatterTriggered) title = "Cache breach detected.";
    else if (fragmentWon) title = "Ledger Shard recovered.";
    else if (gains.length > 0) title = `Recovered: ${gains.join(", ")}.`;

    const lines = [];
    if (lineWin && !wildAssist && lineSymbol) lines.push(`Recovered line: ${lineSymbol}.`);
    if (wildAssist) lines.push("WILD-assisted recovery confirmed.");
    if (gains.length > 0) lines.push(`Recovered: ${gains.join(", ")}.`);
    if (freeSpins > 0) lines.push(`Cache breach: +${freeSpins} Free Spin${freeSpins > 1 ? "s" : ""}.`);
    else if (scatterTriggered) lines.push("Cache breach detected.");
    if (fragmentWon) lines.push("Ledger Shard recovered.");

    return {
      kind: lineWin || gains.length ? "is-win" : "is-special",
      title,
      meta: lines.join(" "),
      lineWin: !!lineWin,
      wildAssist: !!wildAssist,
      lineSymbol,
      payline,
    };
  }

  function applyWinPresentation(outcome) {
    clearWinHighlights();
    if (!outcome || !outcome.lineWin) return;

    const payline = Array.isArray(outcome.payline) ? outcome.payline : [];
    for (let col = 0; col < 3; col += 1) {
      const cell = S.cellEls?.[1]?.[col];
      if (!cell) continue;
      const symbol = String(payline[col] || "").toUpperCase();
      cell.classList.add("is-payline-win", "is-hit");
      if (symbol === "WILD") cell.classList.add("is-wild-hit");
    }
  }

  function ensureStyles() {
    if (el(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
.rt-back{
  position:fixed; inset:0; z-index:100050;
  display:none; align-items:flex-end; justify-content:center;
  background:rgba(7,10,14,.72);
  backdrop-filter:blur(4px);
}
.rt-panel{
  width:min(96vw,760px);
  max-height:92vh;
  overflow:auto;
  color:#eaf3ff;
  border-radius:18px 18px 0 0;
  border:1px solid rgba(170,198,255,.22);
  background:
    radial-gradient(95% 90% at 50% -10%, rgba(86,140,240,.20), transparent 55%),
    linear-gradient(180deg, rgba(14,19,28,.98), rgba(9,12,18,.98));
  box-shadow:0 -16px 48px rgba(0,0,0,.45);
}
.rt-head{
  display:flex; justify-content:space-between; align-items:flex-start; gap:10px;
  padding:14px 14px 10px;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.rt-title{
  margin:0; font-size:19px; font-weight:800; letter-spacing:.01em;
}
.rt-sub{
  margin-top:4px; opacity:.82; font-size:12px; line-height:1.35;
}
.rt-close{
  min-width:38px; height:38px; border-radius:12px;
  border:1px solid rgba(255,255,255,.16);
  background:rgba(255,255,255,.06); color:#fff; font-size:20px; cursor:pointer;
}
.rt-body{
  padding:12px 14px 16px;
  display:grid; gap:10px;
}
.rt-status{
  font-size:12px; opacity:.82;
}
.rt-board-frame{
  position:relative;
  overflow:hidden;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.12);
  background:
    linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01)),
    url("${IMAGE.frame}") center / cover no-repeat;
  padding:10px;
}
.rt-board-wrap{
  position:relative;
  border-radius:12px;
  overflow:hidden;
}
.rt-board{
  position:relative;
  z-index:1;
  transition:opacity .18s ease, filter .18s ease;
  display:grid;
  grid-template-columns:repeat(3, minmax(0, 1fr));
  gap:9px;
}
.rt-spin-video{
  position:absolute;
  inset:0;
  z-index:3;
  width:100%;
  height:100%;
  object-fit:cover;
  opacity:0;
  pointer-events:none;
  transition:opacity .16s ease;
  border-radius:10px;
  background:rgba(8,12,18,.45);
}
.rt-board-frame.video-spin-active .rt-spin-video{
  opacity:1;
}
.rt-board-frame.video-spin-active .rt-board{
  opacity:.08;
  filter:saturate(.8) blur(.6px);
}
.rt-reel{
  border-radius:12px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.16);
  background-size:cover;
  background-position:center;
  box-shadow:inset 0 0 0 1px rgba(8,12,20,.34);
}
.rt-reel.is-rolling{
  animation:rt-reel-roll-bg .11s linear infinite;
}
.rt-reel.is-rolling .rt-cell img{
  animation:rt-symbol-roll .09s linear infinite;
  will-change:transform, opacity, filter;
}
.rt-reel.is-settle{
  animation:rt-reel-settle .22s ease-out;
}
.rt-cell{
  min-height:76px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-bottom:1px solid rgba(255,255,255,.10);
  background:linear-gradient(180deg, rgba(8,12,18,.58), rgba(8,12,18,.30));
}
.rt-cell:last-child{
  border-bottom:none;
}
.rt-cell.payline{
  background:linear-gradient(180deg, rgba(176,230,255,.20), rgba(115,191,255,.13));
  box-shadow:inset 0 0 0 1px rgba(189,230,255,.30);
}
.rt-cell.is-payline-win{
  background:linear-gradient(180deg, rgba(188,255,228,.36), rgba(129,220,255,.30));
  box-shadow:
    inset 0 0 0 1px rgba(214,255,236,.50),
    0 0 12px rgba(144,236,255,.34);
}
.rt-cell.is-hit img{
  animation:rt-hit-pop .42s ease;
  filter:drop-shadow(0 0 8px rgba(193,255,236,.70));
}
.rt-cell.is-wild-hit{
  box-shadow:
    inset 0 0 0 1px rgba(255,240,193,.65),
    0 0 14px rgba(255,228,148,.45);
}
.rt-cell.is-wild-hit img{
  filter:drop-shadow(0 0 10px rgba(255,230,146,.85));
}
.rt-cell img{
  width:52px; height:52px; object-fit:contain; image-rendering:auto;
  filter:drop-shadow(0 3px 6px rgba(0,0,0,.35));
}
@keyframes rt-reel-roll-bg{
  from { background-position:center 0px; }
  to   { background-position:center 32px; }
}
@keyframes rt-symbol-roll{
  from { transform:translateY(-24px); opacity:.58; filter:drop-shadow(0 3px 6px rgba(0,0,0,.35)) blur(.55px); }
  to   { transform:translateY(24px); opacity:1; filter:drop-shadow(0 3px 6px rgba(0,0,0,.35)) blur(0); }
}
@keyframes rt-reel-settle{
  0%   { transform:translateY(0); }
  38%  { transform:translateY(8px); }
  74%  { transform:translateY(-3px); }
  100% { transform:translateY(0); }
}
@keyframes rt-hit-pop{
  0%   { transform:scale(1); }
  35%  { transform:scale(1.08); }
  100% { transform:scale(1); }
}
.rt-metrics{
  display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:8px;
}
.rt-metric{
  border:1px solid rgba(255,255,255,.12);
  border-radius:12px;
  background:rgba(255,255,255,.04);
  padding:8px;
}
.rt-k{
  font-size:11px; opacity:.7; text-transform:uppercase; letter-spacing:.08em;
}
.rt-v{
  margin-top:3px; font-size:14px; font-weight:700;
}
.rt-progress{
  border:1px solid rgba(255,255,255,.12);
  border-radius:12px;
  padding:9px 10px;
  background:rgba(255,255,255,.04);
}
.rt-progress-top{
  display:flex; justify-content:space-between; gap:10px; align-items:center;
  font-size:12px;
}
.rt-progress-bar{
  height:7px; border-radius:999px; overflow:hidden;
  background:rgba(255,255,255,.11);
  margin-top:7px;
}
.rt-progress-fill{
  height:100%; width:0%;
  background:linear-gradient(90deg, rgba(132,236,180,.9), rgba(140,210,255,.95));
  transition:width .25s ease;
}
.rt-teaser{
  display:grid;
  grid-template-columns:84px 1fr;
  gap:10px;
  border:1px solid rgba(189,208,255,.20);
  border-radius:12px;
  padding:8px;
  background:
    radial-gradient(120% 120% at 100% -20%, rgba(120,176,255,.14), transparent 45%),
    rgba(255,255,255,.03);
}
.rt-teaser-art{
  position:relative;
  border-radius:10px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.18);
  background:linear-gradient(180deg, rgba(26,34,50,.95), rgba(12,18,28,.95));
  min-height:86px;
}
.rt-teaser-img{
  width:100%;
  height:100%;
  min-height:86px;
  display:block;
  object-fit:contain;
  object-position:center;
}
.rt-teaser-sil{
  display:none;
  position:absolute;
  left:50%;
  top:48%;
  width:50px;
  height:62px;
  transform:translate(-50%, -50%);
  border-radius:26px 26px 18px 18px;
  background:linear-gradient(180deg, rgba(188,210,255,.20), rgba(108,126,160,.14));
  filter:blur(.3px);
}
.rt-teaser-lock{
  position:absolute;
  z-index:3;
  left:6px;
  right:6px;
  bottom:6px;
  border-radius:999px;
  text-align:center;
  font-size:9px;
  letter-spacing:.12em;
  font-weight:800;
  padding:3px 0;
  color:#d7e7ff;
  border:1px solid rgba(255,255,255,.20);
  background:rgba(10,14,22,.72);
}
.rt-teaser-k{
  font-size:10px;
  letter-spacing:.11em;
  text-transform:uppercase;
  opacity:.72;
}
.rt-teaser-name{
  margin-top:2px;
  font-size:14px;
  font-weight:800;
}
.rt-teaser-progress{
  margin-top:4px;
  font-size:11px;
  opacity:.90;
}
.rt-teaser-line{
  margin-top:4px;
  font-size:11px;
  line-height:1.3;
  opacity:.80;
}
.rt-teaser-bar{
  margin-top:6px;
  height:5px;
  border-radius:999px;
  overflow:hidden;
  background:rgba(255,255,255,.12);
}
.rt-teaser-fill{
  width:0%;
  height:100%;
  background:linear-gradient(90deg, rgba(160,218,255,.95), rgba(155,248,211,.92));
  transition:width .25s ease;
}
.rt-result{
  border:1px dashed rgba(170,198,255,.26);
  border-radius:12px;
  padding:8px 9px;
  background:rgba(255,255,255,.02);
}
.rt-result-title{
  font-size:12px;
  line-height:1.32;
  font-weight:700;
}
.rt-result-meta{
  margin-top:4px;
  font-size:11px;
  line-height:1.32;
  opacity:.85;
}
.rt-result.is-win{
  border-color:rgba(153,255,209,.50);
  background:rgba(124,242,192,.10);
}
.rt-result.is-special{
  border-color:rgba(153,213,255,.50);
  background:rgba(145,205,255,.10);
}
.rt-result.is-miss{
  border-color:rgba(255,170,170,.34);
  background:rgba(255,122,122,.08);
}
.rt-footer{
  position:sticky; bottom:0; z-index:2;
  display:flex; gap:8px; align-items:center;
  padding:10px 14px 14px;
  background:linear-gradient(180deg, rgba(9,12,18,0), rgba(9,12,18,.98) 38%);
}
.rt-recover{
  width:100%;
  border:none;
  border-radius:13px;
  padding:12px 14px;
  font-size:15px;
  font-weight:800;
  cursor:pointer;
  color:#062131;
  background:linear-gradient(90deg, #8ce4ff, #b9f3d6);
  box-shadow:0 8px 24px rgba(108,220,255,.24);
}
.rt-recover[disabled]{
  opacity:.55; cursor:not-allowed; box-shadow:none;
}
.rt-recover.is-loading{
  opacity:.85;
  filter:saturate(.78);
}
@media (max-width:560px){
  .rt-metrics{ grid-template-columns:1fr; }
  .rt-cell{ min-height:68px; }
}
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    let back = el(MODAL_ID);
    if (back) return back;

    back = document.createElement("div");
    back.id = MODAL_ID;
    back.className = "rt-back";
    back.innerHTML = `
      <div class="rt-panel" role="dialog" aria-modal="true" aria-label="Recovery Terminal">
        <div class="rt-head">
          <div>
            <h2 class="rt-title">Recovery Terminal</h2>
            <div class="rt-sub">Abandoned Wallets signal recovery. Stable outputs only.</div>
          </div>
          <button id="rtClose" class="rt-close" type="button" aria-label="Close">x</button>
        </div>
        <div class="rt-body">
          <div id="rtStatus" class="rt-status">Syncing terminal...</div>
          <div id="rtBoardFrame" class="rt-board-frame">
            <div class="rt-board-wrap">
              <div id="rtBoard" class="rt-board"></div>
              <video id="rtSpinVideo" class="rt-spin-video" muted playsinline preload="auto" loop aria-hidden="true">
                <source src="${IMAGE.spinVideo}" type="video/webm">
              </video>
            </div>
          </div>
          <div class="rt-metrics">
            <div class="rt-metric"><div class="rt-k">Free Spins</div><div id="rtFree" class="rt-v">0</div></div>
            <div class="rt-metric"><div class="rt-k">Recovery Cost</div><div id="rtCost" class="rt-v">0 Bones</div></div>
            <div class="rt-metric"><div class="rt-k">Bones</div><div id="rtBones" class="rt-v">-</div></div>
          </div>
          <div class="rt-progress">
            <div class="rt-progress-top">
              <div>Ledger Shards</div>
              <div id="rtFragCount">0 / 0</div>
            </div>
            <div class="rt-progress-bar"><div id="rtFragFill" class="rt-progress-fill"></div></div>
            <div id="rtFragHint" style="margin-top:6px;font-size:11px;opacity:.78;"></div>
          </div>
          <div class="rt-teaser">
            <div class="rt-teaser-art">
              <img id="rtTeaserImg" class="rt-teaser-img" src="${IMAGE.ghostLedgerAlphaTeaser}" alt="Ghost Ledger Alpha teaser" loading="lazy">
              <div id="rtTeaserFallback" class="rt-teaser-sil"></div>
              <div class="rt-teaser-lock">LOCKED</div>
            </div>
            <div>
              <div class="rt-teaser-k">Exclusive Skin</div>
              <div class="rt-teaser-name">Ghost Ledger Alpha</div>
              <div id="rtTeaserProgress" class="rt-teaser-progress">0 / 0 Ledger Shards</div>
              <div class="rt-teaser-line">Collect Ledger Shards to unlock Ghost Ledger Alpha.</div>
              <div class="rt-teaser-bar"><div id="rtTeaserFill" class="rt-teaser-fill"></div></div>
            </div>
          </div>
          <div id="rtResult" class="rt-result is-neutral" aria-live="polite">
            <div id="rtResultTitle" class="rt-result-title">Awaiting recovery cycle.</div>
            <div id="rtResultMeta" class="rt-result-meta">Tap Recover to run the terminal.</div>
          </div>
        </div>
        <div class="rt-footer">
          <button id="rtRecover" class="rt-recover" type="button">Recover</button>
        </div>
      </div>
    `;

    document.body.appendChild(back);

    const teaserImg = el("rtTeaserImg");
    const teaserFallback = el("rtTeaserFallback");
    const spinVideo = el("rtSpinVideo");
    if (teaserImg && teaserFallback) {
      const showFallback = () => {
        teaserImg.style.display = "none";
        teaserFallback.style.display = "block";
      };
      const hideFallback = () => {
        teaserFallback.style.display = "none";
        teaserImg.style.display = "block";
      };

      teaserImg.addEventListener("load", hideFallback, { once: true });
      teaserImg.addEventListener("error", showFallback, { once: true });

      if (teaserImg.complete) {
        if (teaserImg.naturalWidth > 0) hideFallback();
        else showFallback();
      }
    }
    if (spinVideo) {
      spinVideo.muted = true;
      spinVideo.playsInline = true;
      spinVideo.preload = "auto";
      S.spinVideo = spinVideo;
      S.spinVideoUsable = true;
      const markVideoUnavailable = () => {
        S.spinVideoUsable = false;
        stopSpinVideoOverlay();
      };
      spinVideo.addEventListener("error", markVideoUnavailable);
      try { spinVideo.load?.(); } catch (_) {}
    } else {
      S.spinVideo = null;
      S.spinVideoUsable = false;
    }

    const board = el("rtBoard");
    const reelBg = [IMAGE.reel1, IMAGE.reel2, IMAGE.reel3];
    S.cells = [[], [], []];
    S.cellEls = [[], [], []];
    S.reels = [];
    for (let col = 0; col < 3; col += 1) {
      const reel = document.createElement("div");
      reel.className = "rt-reel";
      reel.style.backgroundImage = `url("${reelBg[col]}")`;
      for (let row = 0; row < 3; row += 1) {
        const cell = document.createElement("div");
        cell.className = `rt-cell ${row === 1 ? "payline" : ""}`.trim();
        const img = document.createElement("img");
        img.alt = "Slot symbol";
        img.src = symbolImage("SCRAP");
        cell.appendChild(img);
        reel.appendChild(cell);
        S.cells[row][col] = img;
        S.cellEls[row][col] = cell;
      }
      board.appendChild(reel);
      S.reels[col] = reel;
    }

    el("rtClose")?.addEventListener("click", close);
    el("rtRecover")?.addEventListener("click", onRecoverClick);
    back.addEventListener("click", (ev) => {
      if (ev.target === back) close();
    });

    if (!document.body.dataset.rtEscBound) {
      document.body.dataset.rtEscBound = "1";
      document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape" && el(MODAL_ID)?.style.display !== "none") close();
      });
    }

    return back;
  }

  function renderBoard(rows) {
    const safeRows = normalizeRows(rows);
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        const img = S.cells?.[r]?.[c];
        if (!img) continue;
        const sym = safeRows[r][c];
        img.src = symbolImage(sym);
        img.alt = sym;
      }
    }
  }

  function renderState(payload) {
    const state = payload?.state || payload || {};
    S.lastState = state;

    const boardRows = state?.board?.rows || payload?.board?.rows || DEFAULT_ROWS;
    renderBoard(boardRows);

    const freeSpins = Number(state.freeSpins || 0);
    const spinCost = Number(state.spinCostBones || 0);
    const canRecover = !!state.canRecover;
    const bonesBal = state.bonesBalance;

    const frag = state.fragments || {};
    const fragOwned = Number(frag.owned || 0);
    const fragGoal = Number(frag.goal || 0);
    const fragPct = Math.max(0, Math.min(100, Number(frag.pct || 0)));
    const earnedToday = Number(frag.earnedToday || 0);
    const dailyCap = Number(frag.dailyCap || 0);

    const freeEl = el("rtFree");
    if (freeEl) freeEl.textContent = String(freeSpins);
    const costEl = el("rtCost");
    if (costEl) costEl.textContent = `${spinCost} Bones`;
    const bonesEl = el("rtBones");
    if (bonesEl) bonesEl.textContent = (bonesBal == null ? "-" : String(bonesBal));

    const fragCount = el("rtFragCount");
    if (fragCount) fragCount.textContent = `${fragOwned} / ${fragGoal}`;
    const fragFill = el("rtFragFill");
    if (fragFill) fragFill.style.width = `${fragPct}%`;
    const teaserProgress = el("rtTeaserProgress");
    if (teaserProgress) teaserProgress.textContent = `${fragOwned} / ${fragGoal} Ledger Shards`;
    const teaserFill = el("rtTeaserFill");
    if (teaserFill) teaserFill.style.width = `${fragPct}%`;
    const fragHint = el("rtFragHint");
    if (fragHint) {
      fragHint.textContent = `Daily Ledger Shards: ${earnedToday}/${dailyCap}.`;
    }

    const btn = el("rtRecover");
    if (btn) {
      btn.disabled = S.spinning || !canRecover;
      btn.classList.toggle("is-loading", !!S.spinning);
      btn.textContent = S.spinning ? "Recovering..." : "Recover";
    }
  }

  function listRewards(out) {
    const rewards = out?.rewards || {};
    const parts = [];
    const bones = Number(rewards.bones || 0);
    const scrap = Number(rewards.scrap || 0);
    const dust = Number(rewards.rune_dust || 0);
    const freeSpins = Number(rewards.free_spins || 0);
    const shardAmount = Number(rewards.shard_amount || 0);
    const shardSlot = String(rewards.shard_slot || "").replace(/_/g, " ").trim();

    if (bones > 0) parts.push(`+${bones} Bones`);
    if (scrap > 0) parts.push(`+${scrap} Scrap`);
    if (dust > 0) parts.push(`+${dust} Rune Dust`);
    if (shardAmount > 0) {
      const label = shardSlot ? `${shardSlot} shards` : "shards";
      parts.push(`+${shardAmount} ${label}`);
    }
    if (freeSpins > 0) {
      parts.push(`+${freeSpins} Free Spin${freeSpins > 1 ? "s" : ""}`);
    }
    if (out?.fragment?.won) {
      parts.push("+1 Ledger Shard");
    }
    return parts;
  }

  async function post(path, payload) {
    const body = payload || {};

    if (typeof S.apiPost === "function") {
      const out = await S.apiPost(path, body);
      if (out && out.ok === false) {
        const err = new Error(String(out.reason || out.message || "REQUEST_FAILED"));
        err.data = out;
        throw err;
      }
      return out;
    }

    const initData = S.tg?.initData || global.Telegram?.WebApp?.initData || "";
    const res = await fetch((global.API_BASE || "") + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(initData ? { Authorization: `Bearer ${initData}` } : {}),
      },
      body: JSON.stringify({ init_data: initData, ...body }),
    });
    const out = await res.json().catch(() => ({ ok: false, reason: `HTTP_${res.status}` }));
    if (!res.ok || out?.ok === false) {
      const err = new Error(String(out?.reason || `HTTP_${res.status}`));
      err.data = out;
      throw err;
    }
    return out;
  }

  async function loadState() {
    setStatus("Syncing terminal...");
    const out = await post("/webapp/slots/state", { buildingId: BUILDING_ID });
    renderState(out);
    setSummary("Recover to scan one cycle.");
    setStatus("Recovery terminal online.");
    return out;
  }

  async function onRecoverClick() {
    if (S.spinning) return;
    S.spinning = true;
    const btn = el("rtRecover");
    if (btn) {
      btn.disabled = true;
      btn.classList.add("is-loading");
      btn.textContent = "Recovering...";
    }

    const startedAt = Date.now();
    setStatus("Recovering signal...");
    startVisualSpin();

    try {
      const out = await post("/webapp/slots/spin", {
        buildingId: BUILDING_ID,
        run_id: makeRunId("slots_spin", "recovery_terminal"),
      });

      const elapsed = Date.now() - startedAt;
      if (elapsed < SPIN_MIN_MS) await sleep(SPIN_MIN_MS - elapsed);

      const finalRows = normalizeRows(out?.board?.rows || DEFAULT_ROWS);
      await stopVisualSpin(finalRows);

      renderState(out?.state || out);
      const outcome = buildSpinOutcome(out, finalRows);
      setResultCard(outcome.kind, outcome.title, outcome.meta);
      applyWinPresentation(outcome);

      setStatus(outcome.kind === "is-miss" ? "No recovery found." : "Cycle complete.");
      try { S.tg?.HapticFeedback?.notificationOccurred?.(outcome.kind === "is-miss" ? "warning" : "success"); } catch (_) {}
    } catch (err) {
      const reason = String(err?.data?.reason || err?.message || "Recovery failed");

      const elapsed = Date.now() - startedAt;
      if (elapsed < SPIN_MIN_MS) await sleep(SPIN_MIN_MS - elapsed);
      await stopVisualSpin(S.lastState?.board?.rows || DEFAULT_ROWS);

      if (err?.data?.state) renderState(err.data);
      clearWinHighlights();
      setStatus("Recovery failed.");
      if (reason === "NOT_ENOUGH_BONES") {
        setResultCard("is-miss", "Recovery aborted.", "Not enough Bones for this recovery cycle.");
      } else {
        setResultCard("is-miss", "Recovery failed.", reason);
      }
      try { S.tg?.showAlert?.(reason); } catch (_) {}
    } finally {
      clearSpinIntervals();
      stopSpinVideoOverlay();
      for (let i = 0; i < (S.reels || []).length; i += 1) {
        S.reels[i]?.classList?.remove("is-rolling", "is-settle");
      }
      S.spinning = false;
      const canRecover = !!S.lastState?.canRecover;
      if (btn) {
        btn.classList.remove("is-loading");
        btn.textContent = "Recover";
        btn.disabled = !canRecover;
      }
    }
  }

  function close() {
    const back = el(MODAL_ID);
    if (back) back.style.display = "none";
    stopSpinVideoOverlay();
    try { global.navClose?.(MODAL_ID); } catch (_) {}
  }

  async function open(meta) {
    ensureStyles();
    const back = ensureModal();
    back.style.display = "flex";
    try { global.navOpen?.(MODAL_ID); } catch (_) {}

    const desc = String(meta?.desc || "").trim();
    if (desc) {
      const sub = back.querySelector(".rt-sub");
      if (sub) sub.textContent = `Abandoned Wallets. ${desc}`;
    }

    try {
      await loadState();
      return true;
    } catch (err) {
      setStatus("Terminal offline.");
      setSummary("Failed to load Recovery Terminal.");
      return false;
    }
  }

  function init(opts) {
    const cfg = opts || {};
    if (typeof cfg.apiPost === "function") S.apiPost = cfg.apiPost;
    if (cfg.tg) S.tg = cfg.tg;
    if (typeof cfg.dbg === "boolean") S.dbg = cfg.dbg;
    if (!S.tg) S.tg = global.Telegram?.WebApp || null;
  }

  const API = {
    init,
    open,
    close,
    refresh: loadState,
  };

  global.RecoveryTerminal = API;
  global.Slots = API;
})(window);
