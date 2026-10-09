// Alpha Husky — Share Studio V1
// Identity Card + Recorded Moment. Presentation/export only; canonical player truth stays server-side.
(function (global) {
  "use strict";

  const CARD_W = 1080;
  const CARD_H = 1350;
  const DEFAULT_LINK = "https://alphahusky.win/";
  const NETWORK_TIMEOUT_MS = 45000;
  const STATE_TIMEOUT_MS = 12000;
  const FONT_TIMEOUT_MS = 2500;
  const PNG_TIMEOUT_MS = 10000;
  const ASSET_TIMEOUT_MS = 12000;
  const MAX_BADGES = 3;
  const TELEGRAM_SHARE_TIMEOUT_MS = 90000;
  const DOWNLOAD_RESPONSE_TIMEOUT_MS = 30000;

  const FACTIONS = {
    rogue_byte: { label: "ROGUE BYTE", rgb: [0, 215, 255], secondary: [183, 38, 70], motif: "BREACH NETWORK" },
    echo_wardens: { label: "ECHO WARDENS", rgb: [238, 181, 86], secondary: [104, 177, 224], motif: "RESONANCE SIGNAL" },
    inner_howl: { label: "INNER HOWL", rgb: [104, 222, 244], secondary: [150, 191, 224], motif: "SILENT RESONANCE" },
    pack_burners: { label: "PACK BURNERS", rgb: [255, 123, 78], secondary: [244, 192, 89], motif: "PRESSURE FORGE" },
    pack: { label: "PACK", rgb: [116, 207, 242], secondary: [210, 225, 238], motif: "ALPHA NETWORK" },
  };

  // Exact path case matches the deployed assets on the art branch.
  const IDENTITY_BG_ROOT = "/assets/Share/Identity/";
  const IDENTITY_BG_BY_FACTION = {
    rogue_byte: "identity_bg_rogue_byte.webp",
    echo_wardens: "identity_bg_echo_wardens.webp",
    inner_howl: "identity_bg_inner_howl.webp",
    pack_burners: "identity_bg_pack_burners.webp",
    pack: "identity_bg_master_dark.webp",
  };

  const MOMENT_STYLE = {
    first_signal: { kicker: "FIRST SIGNAL", headline: "SIGNAL RECORDED", accent: [95, 211, 255], sub: "THE TRAIL BEGINS" },
    tactical_training: { kicker: "TACTICAL TRAINING", headline: "TRAINING VERIFIED", accent: [96, 218, 190], sub: "COMBAT RECORD CONFIRMED" },
    broken_signal: { kicker: "BROKEN SIGNAL", headline: "OPERATION CLEARED", accent: [244, 65, 105], sub: "OPERATION 01 COMPLETE" },
    blood_moon: { kicker: "BLOOD MOON", headline: "MOON RECORD", accent: [236, 51, 79], sub: "LUNAR RECORD VERIFIED" },
    moon_lab: { kicker: "MOON LAB", headline: "SECTOR CLEARED", accent: [89, 202, 238], sub: "LADDER RECORD VERIFIED" },
    siege: { kicker: "SIEGE", headline: "FORTRESS RECORD", accent: [239, 157, 77], sub: "SIEGE RESULT VERIFIED" },
  };

  const S = {
    mode: "identity",
    requestedMomentKey: "",
    state: null,
    player: null,
    moment: null,
    blob: null,
    objectUrl: "",
    upload: null,
    busy: false,
    openPromise: null,
    bound: false,
    skinReady: false,
    stage: "idle",
    lastError: "",
  };

  const $ = (id) => document.getElementById(id);
  const txt = (v) => String(v == null ? "" : v).trim();
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rgba = (rgb, a) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

  function normalizeMode(v) {
    const x = txt(v).toLowerCase();
    return x === "moment" ? "moment" : "identity"; // old hub/equipped routes intentionally converge on identity
  }

  function normalizeFaction(v) {
    const k = txt(v).toLowerCase().replace(/[\s-]+/g, "_");
    if (k === "rb" || k.includes("rogue")) return "rogue_byte";
    if (k === "ew" || k.includes("echo") || k.includes("warden")) return "echo_wardens";
    if (k === "ih" || k.includes("inner")) return "inner_howl";
    if (k === "pb" || k.includes("burner")) return "pack_burners";
    return "pack";
  }

  function factionMeta(player) {
    return FACTIONS[normalizeFaction(player?.faction)] || FACTIONS.pack;
  }

  async function loadIdentityBackground(player) {
    const file = IDENTITY_BG_BY_FACTION[normalizeFaction(player?.faction)] || IDENTITY_BG_BY_FACTION.pack;
    const selected = await loadImage(IDENTITY_BG_ROOT + file);
    if (selected) return selected;
    if (file !== IDENTITY_BG_BY_FACTION.pack) {
      return await loadImage(IDENTITY_BG_ROOT + IDENTITY_BG_BY_FACTION.pack);
    }
    return null; // Existing vector background remains a reliable fallback.
  }

  function getApiBase() { return txt(global.API_BASE || ""); }
  function getShareLink() { return txt(global.WEBAPP_BASE || DEFAULT_LINK).replace(/\/+$/, "") + "/"; }
  function getTelegram() { return global.Telegram?.WebApp || global.tg || null; }

  function telegramVersionAtLeast(minimum) {
    const tg = getTelegram();
    if (!tg) return false;
    try { if (typeof tg.isVersionAtLeast === "function") return !!tg.isVersionAtLeast(minimum); } catch (_) {}
    const parse = (v) => String(v || "").split(".").slice(0, 3).map((n) => /^\d+$/.test(n) ? Number(n) : NaN);
    const current = parse(tg.version), target = parse(minimum);
    if (!current.length || current.some(Number.isNaN)) return false;
    for (let i = 0; i < 3; i++) {
      const a = current[i] || 0, b = target[i] || 0;
      if (a !== b) return a > b;
    }
    return true;
  }
  function inTelegram() { return !!txt(getTelegram()?.initData); }
  function telegramShareSupported() {
    return inTelegram() && telegramVersionAtLeast("8.0") && typeof getTelegram()?.shareMessage === "function";
  }
  function telegramDownloadSupported() {
    return inTelegram() && telegramVersionAtLeast("8.0") && typeof getTelegram()?.downloadFile === "function";
  }
  function withDeadline(operation, timeoutMs, label = "NETWORK_TIMEOUT") {
    let timer;
    return Promise.race([
      Promise.resolve().then(operation),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(label)), timeoutMs); })
    ]).finally(() => clearTimeout(timer));
  }

  function toast(message, title) {
    const tg = getTelegram();
    const msg = txt(message);
    try { if (tg?.showPopup) return tg.showPopup({ title: txt(title) || "Share Studio", message: msg, buttons: [{ type: "close" }] }); } catch (_) {}
    try { if (tg?.showAlert) return tg.showAlert(msg); } catch (_) {}
    try { global.alert((title ? title + "\n\n" : "") + msg); } catch (_) {}
  }

  function setStatus(message) {
    const el = $("shareCardStatus");
    if (!el) return;
    el.textContent = txt(message);
    if (el.textContent) el.dataset.show = "1"; else delete el.dataset.show;
  }

  function apiPost(path, payload) {
    const fn = global.apiPost || global.S?.apiPost || global.AH?.apiPost;
    if (typeof fn !== "function") throw new Error("API_NOT_READY");
    return fn(path, payload || {});
  }

  function multipartAuthHeaders() {
    const headers = {};
    const session = txt(global.__ahAlphaAccountSession?.sessionToken || global.__ahAlphaAccountSession?.session_token);
    const initData = txt(getTelegram()?.initData || global.__INIT_DATA__ || global.__INIT_DATA || "");
    if (session) headers.Authorization = `Bearer ${session}`;
    else if (initData) headers.Authorization = `Bearer ${initData}`;
    return headers;
  }

  async function fetchWithTimeout(url, opts, timeoutMs) {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs || NETWORK_TIMEOUT_MS) : null;
    try { return await fetch(url, ctrl ? { ...(opts || {}), signal: ctrl.signal } : (opts || {})); }
    catch (e) { if (e?.name === "AbortError") throw new Error("NETWORK_TIMEOUT"); throw e; }
    finally { if (timer) clearTimeout(timer); }
  }

  function proxify(raw) {
    const input = txt(raw);
    if (!input) return "";
    if (/^(blob:|data:)/i.test(input)) return input;
    try {
      const u = new URL(input, global.location?.origin || DEFAULT_LINK);
      if (u.hostname === "res.cloudinary.com" && u.pathname.startsWith("/dnjwvxinh/image/upload/")) {
        const proxy = new URL((getApiBase() || global.location?.origin || "") + "/webapp/img", global.location?.origin || DEFAULT_LINK);
        proxy.searchParams.set("u", u.toString());
        return proxy.toString();
      }
      return u.toString();
    } catch (_) { return input; }
  }

  async function loadImage(raw) {
    const src = proxify(raw);
    if (!src) return null;
    return await new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const finish = (value) => { if (done) return; done = true; clearTimeout(timer); resolve(value); };
      const timer = setTimeout(() => finish(null), ASSET_TIMEOUT_MS);
      if (!/^(data:|blob:)/i.test(src)) img.crossOrigin = "anonymous";
      img.onload = async () => { try { await img.decode?.(); } catch (_) {} finish(img); };
      img.onerror = () => finish(null);
      img.src = src;
    });
  }

  async function loadState() {
    S.stage = "state";
    const data = await withDeadline(() => apiPost("/webapp/share/card/state", {}), STATE_TIMEOUT_MS, "STATE_TIMEOUT");
    if (!data || data.ok === false || !data.player) throw new Error(data?.reason || "SHARE_STATE_FAILED");
    S.state = data;
    S.player = data.player;
    S.stage = "state-ready";
    selectMoment(S.requestedMomentKey);
    return data;
  }

  function moments() {
    const list = S.state?.share?.moments;
    // Fail closed: only explicitly server-verified marks are shareable.
    return Array.isArray(list) ? list.filter((m) => m && m.verified === true && txt(m.key)) : [];
  }

  function selectMoment(key) {
    const list = moments();
    const wanted = txt(key).toLowerCase();
    S.moment = wanted ? (list.find((m) => txt(m.key).toLowerCase() === wanted) || null) : (list[list.length - 1] || null);
    syncMomentSelector();
    return S.moment;
  }

  function activeSkinUrl(player) {
    const skin = player?.skin || {};
    // Skin may be a URL string in the canonical profile. Never substitute an avatar.
    return txt((typeof skin === "string" ? skin : (skin.url || skin.img || skin.preview_url || skin.previewUrl)) || player?.heroImg || "/assets/skins/lunarhowl_skin.webp");
  }
  function frameUrl(player) { const f = player?.frame || {}; return txt(f.url || f.img || f.preview_url || f.previewUrl || ""); }

  function publicBadges(player) {
    const arr = Array.isArray(player?.badges) ? player.badges : [];
    return arr.slice(0, MAX_BADGES).map((b) => ({ key: txt(b.key), name: txt(b.name || b.key), icon: txt(b.icon || b.iconUrl || b.icon_url) }));
  }

  function publicHistory(player) {
    return Array.isArray(player?.fieldRecord?.marks) ? player.fieldRecord.marks.filter((m) => m?.verified === true && txt(m?.key)) : [];
  }

  function isoDate(ts) {
    if (!ts) return "";
    let d;
    if (typeof ts === "number") d = new Date(ts < 1e12 ? ts * 1000 : ts);
    else d = new Date(ts);
    if (!Number.isFinite(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d).toUpperCase();
  }

  function rounded(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + rr, y); ctx.arcTo(x + w, y, x + w, y + h, rr); ctx.arcTo(x + w, y + h, x, y + h, rr); ctx.arcTo(x, y + h, x, y, rr); ctx.arcTo(x, y, x + w, y, rr); ctx.closePath();
  }

  function fitContain(img, box, scale = 1) {
    if (!img) return null;
    const s = Math.min(box.w / img.width, box.h / img.height) * scale;
    const w = img.width * s, h = img.height * s;
    return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
  }

  const transparentCropCache = new WeakMap();
  function artworkSourceRect(img) {
    if (!img) return null;
    if (transparentCropCache.has(img)) return transparentCropCache.get(img);
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    let result = { x: 0, y: 0, w, h };
    if (w < 1 || h < 1) return result;
    try {
      // Inspect a tiny copy only; don't read full-resolution images on a mobile client.
      const thumb = document.createElement("canvas");
      const scale = Math.min(1, 192 / Math.max(w, h));
      thumb.width = Math.max(1, Math.round(w * scale));
      thumb.height = Math.max(1, Math.round(h * scale));
      const c = thumb.getContext("2d", { willReadFrequently: true });
      c.drawImage(img, 0, 0, thumb.width, thumb.height);
      const pixels = c.getImageData(0, 0, thumb.width, thumb.height).data;
      let minX = thumb.width, minY = thumb.height, maxX = -1, maxY = -1;
      for (let y = 0; y < thumb.height; y++) for (let x = 0; x < thumb.width; x++) {
        if (pixels[(y * thumb.width + x) * 4 + 3] > 18) {
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
      }
      // Never crop opaque backgrounds or insignificant edge padding.
      if (maxX >= minX && maxY >= minY) {
        const px = Math.max(2, Math.round((maxX - minX + 1) * .045));
        const py = Math.max(2, Math.round((maxY - minY + 1) * .045));
        const lx = Math.max(0, minX - px), ly = Math.max(0, minY - py);
        const rx = Math.min(thumb.width, maxX + px + 1), ry = Math.min(thumb.height, maxY + py + 1);
        if (rx - lx < thumb.width * .93 || ry - ly < thumb.height * .93) {
          result = { x: lx / thumb.width * w, y: ly / thumb.height * h, w: (rx - lx) / thumb.width * w, h: (ry - ly) / thumb.height * h };
        }
      }
    } catch (_) { /* CORS or asset type: keep unmodified source as a safe fallback. */ }
    transparentCropCache.set(img, result);
    return result;
  }

  function fitCover(img, box, focusX = .5, focusY = .36, scale = 1) {
    if (!img) return null;
    const s = Math.max(box.w / img.width, box.h / img.height) * scale;
    const w = img.width * s, h = img.height * s;
    return { x: box.x - Math.max(0, w - box.w) * clamp(focusX, 0, 1), y: box.y - Math.max(0, h - box.h) * clamp(focusY, 0, 1), w, h };
  }

  function drawTracked(ctx, text, x, y, font, color, spacing = 4, align = "left") {
    const value = txt(text).toUpperCase();
    ctx.save(); ctx.font = font; ctx.fillStyle = color; ctx.textBaseline = "alphabetic";
    const widths = [...value].map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + Math.max(0, value.length - 1) * spacing;
    let dx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
    for (let i = 0; i < value.length; i++) { ctx.fillText(value[i], dx, y); dx += widths[i] + spacing; }
    ctx.restore();
  }

  function drawFitted(ctx, text, x, y, options = {}) {
    const raw = txt(text), maxWidth = Number(options.maxWidth || 800);
    const weight = Number(options.weight || 800), largest = Number(options.size || 40);
    const smallest = Number(options.minSize || 18), color = options.color || "#fff";
    let size = largest, label = raw;
    ctx.save(); ctx.fillStyle = color; ctx.textAlign = options.align || "left";
    do {
      ctx.font = `${weight} ${size}px system-ui`;
      if (ctx.measureText(label).width <= maxWidth) break;
      size -= 2;
    } while (size >= smallest);
    size = Math.max(smallest, size);
    ctx.font = `${weight} ${size}px system-ui`;
    if (ctx.measureText(label).width > maxWidth) {
      const ellipsis = "…";
      while (label.length && ctx.measureText(label + ellipsis).width > maxWidth) label = label.slice(0, -1);
      label += ellipsis;
    }
    ctx.fillText(label, x, y); ctx.restore();
  }

  function wrap(ctx, text, x, y, width, lineHeight, maxLines) {
    const words = txt(text).split(/\s+/).filter(Boolean);
    const lines = []; let current = "";
    for (const word of words) {
      const test = current ? current + " " + word : word;
      if (ctx.measureText(test).width > width && current) {
        lines.push(current); current = word;
      } else current = test;
    }
    if (current) lines.push(current);
    const display = lines.slice(0, maxLines);
    for (let i = 0; i < display.length; i++) {
      let label = display[i];
      const overflows = i === display.length - 1 && lines.length > maxLines;
      if (overflows) label += "…";
      while (label.length > 1 && ctx.measureText(label).width > width) {
        label = label.endsWith("…") ? label.slice(0, -2) + "…" : label.slice(0, -1) + "…";
      }
      ctx.fillText(label, x, y + i * lineHeight);
    }
    return display.length;
  }

  function drawBackground(ctx, primary, secondary, momentMode) {
    const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    bg.addColorStop(0, "#03070d"); bg.addColorStop(.55, "#07101a"); bg.addColorStop(1, "#02050a");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, CARD_W, CARD_H);

    const glow = ctx.createRadialGradient(CARD_W * .53, CARD_H * .34, 0, CARD_W * .53, CARD_H * .34, 620);
    glow.addColorStop(0, rgba(primary, momentMode ? .22 : .16)); glow.addColorStop(.48, rgba(secondary, .08)); glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Cinematic faction environment. Vector-only and deterministic so exported PNG
    // always matches the preview, including slower Telegram WebViews.
    ctx.save();
    const horizon = momentMode ? 845 : 862;
    const shafts = ctx.createLinearGradient(0, 160, 0, horizon + 310);
    shafts.addColorStop(0, rgba(primary, .00));
    shafts.addColorStop(.48, rgba(primary, .11));
    shafts.addColorStop(1, rgba(secondary, .00));
    ctx.fillStyle = shafts;
    for (const [cx, dw, tilt] of [[230,280,-110],[525,350,35],[815,280,120]]) {
      ctx.beginPath(); ctx.moveTo(cx - 12, 40); ctx.lineTo(cx + 12, 40);
      ctx.lineTo(cx + dw / 2 + tilt, horizon); ctx.lineTo(cx - dw / 2 + tilt, horizon);
      ctx.closePath(); ctx.fill();
    }
    // Broken vault/relay infrastructure. These remain behind the player art.
    ctx.strokeStyle = rgba(primary, .16); ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      const inset = 120 + i * 86;
      ctx.beginPath(); ctx.moveTo(inset, horizon); ctx.lineTo(inset + 32, 320 + i * 64);
      ctx.lineTo(CARD_W - inset - 32, 320 + i * 64);
      ctx.lineTo(CARD_W - inset, horizon); ctx.stroke();
    }
    const core = ctx.createRadialGradient(540, 575, 80, 540, 575, 390);
    core.addColorStop(0, rgba(primary, .10)); core.addColorStop(.55, rgba(primary, .035)); core.addColorStop(1, rgba(primary, 0));
    ctx.fillStyle = core; ctx.fillRect(110, 180, 860, 790);
    // Orbital calibration elements: contrast without competing with the skin.
    ctx.setLineDash([4,18]); ctx.strokeStyle = rgba(primary, .30); ctx.lineWidth = 1.3;
    for (const r of [292, 342]) {
      ctx.beginPath(); ctx.ellipse(540, 565, r, r * 1.06, -.08, .17, Math.PI * 1.82); ctx.stroke();
    }
    ctx.setLineDash([]);
    // Industrial floor and atmospheric perspective.
    const floor = ctx.createLinearGradient(0, horizon - 125, 0, horizon + 230);
    floor.addColorStop(0, 'rgba(1,5,9,0)'); floor.addColorStop(.5, 'rgba(4,12,20,.57)');
    floor.addColorStop(1, 'rgba(1,4,8,.95)');
    ctx.fillStyle = floor; ctx.fillRect(0, horizon - 125, CARD_W, 355);
    ctx.strokeStyle = rgba(primary,.16); ctx.lineWidth=1;
    for (let x = -480; x <= 1580; x += 115) {
      ctx.beginPath();ctx.moveTo(540, horizon);ctx.lineTo(x, horizon + 230);ctx.stroke();
    }
    for (const y of [horizon + 27, horizon + 72, horizon + 143]) {
      ctx.beginPath(); ctx.moveTo(70,y); ctx.lineTo(1010,y);ctx.stroke();
    }
    // Deterministic motes rather than animated GPU-heavy particles.
    for (let i=0; i<105; i++) {
      const x=(i*337 + (i*i*17)%97)%CARD_W;
      const y=115 + ((i*271 + (i*i*13)%199) % 880);
      const a=.13+(i%7)*.032;
      ctx.fillStyle=rgba(i%4===0?secondary:primary,a);
      ctx.fillRect(x,y,i%11===0?2.2:1.1,i%11===0?2.2:1.1);
    }
    ctx.restore();

    ctx.save(); ctx.globalAlpha = .14; ctx.strokeStyle = rgba(primary, .55); ctx.lineWidth = 1;
    for (let x = -CARD_H; x < CARD_W + CARD_H; x += 78) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + CARD_H, CARD_H); ctx.stroke(); }
    ctx.globalAlpha = .12; for (let y = 78; y < CARD_H; y += 78) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CARD_W, y); ctx.stroke(); }
    ctx.restore();

    const vig = ctx.createRadialGradient(CARD_W / 2, CARD_H / 2, 420, CARD_W / 2, CARD_H / 2, 900);
    vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,.82)"); ctx.fillStyle = vig; ctx.fillRect(0, 0, CARD_W, CARD_H);
  }

  function drawIdentityBackground(ctx, image, primary, secondary) {
    if (!image) {
      drawBackground(ctx, primary, secondary, false);
      return;
    }
    // Cover, never stretch. Artwork footer captions live in the cropped/darkened
    // lower area; live player text and badges remain the only readable footer.
    const fit = fitCover(image, { x: 0, y: 0, w: CARD_W, h: CARD_H }, .5, .34);
    ctx.save();
    ctx.fillStyle = "#03070d";
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.drawImage(image, fit.x, fit.y, fit.w, fit.h);

    ctx.fillStyle = "rgba(2,6,12,.16)";
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    const header = ctx.createLinearGradient(0, 0, 0, 280);
    header.addColorStop(0, "rgba(2,6,12,.89)");
    header.addColorStop(.58, "rgba(2,6,12,.52)");
    header.addColorStop(1, "rgba(2,6,12,0)");
    ctx.fillStyle = header;
    ctx.fillRect(0, 0, CARD_W, 280);

    const footer = ctx.createLinearGradient(0, 835, 0, CARD_H);
    footer.addColorStop(0, "rgba(2,7,14,0)");
    footer.addColorStop(.22, "rgba(2,7,14,.80)");
    footer.addColorStop(.42, "rgba(2,7,14,.98)");
    footer.addColorStop(1, "rgba(2,7,14,.99)");
    ctx.fillStyle = footer;
    ctx.fillRect(0, 835, CARD_W, CARD_H - 835);

    const edge = ctx.createRadialGradient(CARD_W / 2, CARD_H * .45, 300, CARD_W / 2, CARD_H * .45, 940);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,.63)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.restore();
  }

  function drawFrame(ctx, primary) {
    ctx.save(); rounded(ctx, 34, 34, CARD_W - 68, CARD_H - 68, 36); ctx.strokeStyle = rgba(primary, .36); ctx.lineWidth = 2; ctx.stroke();
    rounded(ctx, 49, 49, CARD_W - 98, CARD_H - 98, 29); ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }

  function drawCharacter(ctx, img, frameImg, primary, mode) {
    const box = mode === "moment" ? { x: 110, y: 260, w: 860, h: 760 } : { x: 90, y: 205, w: 900, h: 790 };
    ctx.save(); rounded(ctx, box.x, box.y, box.w, box.h, 34); ctx.clip();
    const haze = ctx.createRadialGradient(CARD_W / 2, box.y + box.h * .48, 30, CARD_W / 2, box.y + box.h * .48, 470);
    haze.addColorStop(0, rgba(primary, .16)); haze.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = haze; ctx.fillRect(box.x, box.y, box.w, box.h);
    // Equipped cosmetic frame sits BEHIND the real skin, never across the face.
    if (frameImg && mode === "identity") {
      const framing = fitContain(frameImg, { x: box.x - 20, y: box.y - 12, w: box.w + 40, h: box.h + 24 }, 1.00);
      ctx.save();
      ctx.globalAlpha = .65;
      ctx.drawImage(frameImg, framing.x, framing.y, framing.w, framing.h);
      ctx.restore();
    }
    if (img) {
      const crop = artworkSourceRect(img);
      const sourceSize = { width: crop.w, height: crop.h };
      const fit = fitContain(sourceSize, { x: box.x + 34, y: box.y + 8, w: box.w - 68, h: box.h + 18 }, mode === "moment" ? 1.15 : 1.06);
      // Soft coloured rim light traces the true equipped-skin silhouette.
      ctx.save(); ctx.globalAlpha = .19; ctx.filter = 'blur(22px)';
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, fit.x - 7, fit.y - 5, fit.w + 14, fit.h + 10);
      ctx.restore();
      ctx.shadowColor = rgba(primary, .30); ctx.shadowBlur = 16;
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, fit.x, fit.y, fit.w, fit.h);
      ctx.shadowBlur = 0;
    } else {
      drawTracked(ctx, "IDENTITY VISUAL UNAVAILABLE", CARD_W / 2, box.y + box.h / 2, "700 22px system-ui", "rgba(225,235,245,.46)", 3, "center");
    }
    const shade = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
    shade.addColorStop(0, "rgba(0,0,0,.12)"); shade.addColorStop(.63, "rgba(0,0,0,0)"); shade.addColorStop(1, "rgba(0,0,0,.82)"); ctx.fillStyle = shade; ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.restore();

  }

  function drawBadgeStrip(ctx, badges, imgs, primary, y) {
    const usable = badges.slice(0, MAX_BADGES); if (!usable.length) return;
    const width = 254, gap = 14, total = usable.length * width + Math.max(0, usable.length - 1) * gap;
    let x = (CARD_W - total) / 2;
    usable.forEach((b, i) => {
      rounded(ctx, x, y, width, 84, 17); ctx.fillStyle = "rgba(5,12,20,.82)"; ctx.strokeStyle = rgba(primary, .22); ctx.lineWidth = 1.2; ctx.fill(); ctx.stroke();
      const im = imgs[i]; if (im) { const f = fitContain(im, { x: x + 14, y: y + 12, w: 58, h: 58 }, 1); ctx.drawImage(im, f.x, f.y, f.w, f.h); }
      ctx.fillStyle = "rgba(239,246,252,.92)"; ctx.font = "800 19px system-ui"; ctx.textAlign = "left"; wrap(ctx, b.name, x + 82, y + 33, width - 94, 23, 2);
      x += width + gap;
    });
  }

  function drawIdentity(ctx, player, assets) {
    const faction = factionMeta(player), primary = faction.rgb, secondary = faction.secondary;
    drawIdentityBackground(ctx, assets.background, primary, secondary); drawFrame(ctx, primary);
    drawTracked(ctx, "ALPHA HUSKY", 78, 98, "900 24px system-ui", "rgba(242,248,255,.92)", 7);
    drawTracked(ctx, "FIELD IDENTITY", 78, 137, "750 13px system-ui", rgba(primary, .9), 4);
    drawTracked(ctx, faction.label, CARD_W - 76, 111, "850 14px system-ui", rgba(primary, .9), 3, "right");
    ctx.fillStyle = "rgba(235,242,250,.42)"; ctx.font = "650 12px system-ui"; ctx.textAlign = "right"; ctx.fillText(faction.motif, CARD_W - 76, 139); ctx.textAlign = "left";

    drawCharacter(ctx, assets.skin, assets.frame, primary, "identity");

    const highlights = publicHistory(player).slice(-2);
    highlights.forEach((mark, i) => {
      const x = 112 + i * 428, y = 906;
      rounded(ctx, x, y, 409, 49, 12);
      ctx.fillStyle = "rgba(3,10,18,.80)"; ctx.strokeStyle = rgba(primary, .33);
      ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
      drawFitted(ctx, `RECORDED // ${txt(mark.label || mark.key).toUpperCase()}`, x + 16, y + 31,
        { weight: 750, size: 17, minSize: 11, maxWidth: 379, color: "rgba(236,244,251,.82)" });
    });

    const name = txt(player?.name) || "HOWLER";
    const title = txt(player?.displayTitle || player?.activeTitle || player?.title);
    const origin = txt(player?.origin_label || player?.originLabel);
    drawFitted(ctx, name, 92, 1027, { weight: 950, size: 50, minSize: 25, maxWidth: 872, color: "#f6f8fb" });
    if (title) drawFitted(ctx, title, 93, 1064, { weight: 750, size: 27, minSize: 17, maxWidth: 865, color: "rgba(234,241,249,.76)" });
    const meta = [faction.label, `LV ${Number(player?.level || 1)}`].filter(Boolean).join("  ·  ");
    drawFitted(ctx, meta, 94, 1106, { weight: 850, size: 16, minSize: 12, maxWidth: 872, color: rgba(primary, .92) });
    if (origin) drawFitted(ctx, `ORIGIN // ${origin.toUpperCase()}`, 94, 1137, { weight: 700, size: 15, minSize: 12, maxWidth: 870, color: "rgba(227,235,244,.46)" });

    drawBadgeStrip(ctx, publicBadges(player), assets.badges, primary, 1168);

    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.moveTo(78, 1282); ctx.lineTo(CARD_W - 78, 1282); ctx.stroke();
    drawTracked(ctx, "THE RECORD REMEMBERS", 80, 1314, "800 13px system-ui", "rgba(235,242,250,.58)", 3.6);
    ctx.fillStyle = "rgba(235,242,250,.52)"; ctx.font = "650 14px system-ui"; ctx.textAlign = "right"; ctx.fillText("alphahusky.win", CARD_W - 80, 1314); ctx.textAlign = "left";
  }

  function momentTheme(moment, faction) {
    const key = txt(moment?.key).toLowerCase();
    const direct = MOMENT_STYLE[key];
    if (direct) return direct;
    if (key.includes("blood") || key.includes("moon")) return MOMENT_STYLE.blood_moon;
    if (key.includes("siege")) return MOMENT_STYLE.siege;
    return { kicker: txt(moment?.label || "RECORDED MOMENT").toUpperCase(), headline: "RECORD VERIFIED", accent: faction.rgb, sub: "FIELD RECORD CONFIRMED" };
  }

  function drawMoment(ctx, player, moment, assets) {
    const faction = factionMeta(player), theme = momentTheme(moment, faction), primary = theme.accent, secondary = faction.rgb;
    drawBackground(ctx, primary, secondary, true); drawFrame(ctx, primary);
    drawTracked(ctx, "ALPHA HUSKY", 78, 96, "900 23px system-ui", "rgba(244,248,252,.92)", 7);
    drawTracked(ctx, "RECORDED MOMENT", 78, 134, "780 13px system-ui", rgba(primary, .95), 4);
    drawTracked(ctx, "VERIFIED RECORD", CARD_W - 76, 104, "850 13px system-ui", "rgba(243,247,251,.58)", 3, "right");

    drawTracked(ctx, theme.kicker, CARD_W / 2, 194, "900 16px system-ui", rgba(primary, .95), 4.2, "center");
    drawFitted(ctx, theme.headline, CARD_W / 2, 245, { weight: 950, size: 51, minSize: 25, maxWidth: 890, align: "center", color: "#f7f8fb" });

    drawCharacter(ctx, assets.skin, null, primary, "moment");

    drawFitted(ctx, txt(player?.name) || "HOWLER", 92, 1048, { weight: 920, size: 34, minSize: 20, maxWidth: 850, color: "rgba(247,249,252,.96)" });
    drawFitted(ctx, `${faction.label} · LV ${Number(player?.level || 1)}`, 94, 1083, { weight: 830, size: 14, minSize: 11, maxWidth: 850, color: rgba(faction.rgb,.92) });

    ctx.fillStyle = "rgba(234,241,248,.72)"; ctx.font = "650 20px system-ui"; wrap(ctx, txt(moment?.copy || theme.sub), 94, 1127, CARD_W - 188, 29, 2);
    const date = moment?.dateKnown === true ? isoDate(moment?.occurredAt) : "RECORDED IN FIELD HISTORY";
    drawTracked(ctx, date || "RECORDED IN FIELD HISTORY", 94, 1206, "800 13px system-ui", "rgba(235,242,250,.48)", 2.4);

    rounded(ctx, 750, 1170, 238, 50, 25); ctx.fillStyle = rgba(primary, .10); ctx.strokeStyle = rgba(primary, .42); ctx.fill(); ctx.stroke();
    drawTracked(ctx, "VERIFIED", 869, 1202, "900 13px system-ui", rgba(primary, .95), 3.2, "center");

    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.moveTo(78, 1282); ctx.lineTo(CARD_W - 78, 1282); ctx.stroke();
    drawTracked(ctx, "THE RECORD REMEMBERS", 80, 1314, "800 13px system-ui", "rgba(235,242,250,.58)", 3.6);
    ctx.fillStyle = "rgba(235,242,250,.52)"; ctx.font = "650 14px system-ui"; ctx.textAlign = "right"; ctx.fillText("alphahusky.win", CARD_W - 80, 1314); ctx.textAlign = "left";
  }

  async function render() {
    if (!S.player) await loadState();
    S.stage = "fonts";
    try { await withDeadline(() => document.fonts?.ready || Promise.resolve(), FONT_TIMEOUT_MS, "FONTS_TIMEOUT"); }
    catch (_) { console.warn("[ShareStudio] fonts timeout: proceeding with fallback fonts"); }
    S.stage = "assets";
    setStatus("Loading card artwork…");
    const player = S.player || {};
    const badges = publicBadges(player);
    const [skin, frame, background, ...badgeImgs] = await Promise.all([
      loadImage(activeSkinUrl(player)),
      loadImage(frameUrl(player)),
      S.mode === "identity" ? loadIdentityBackground(player) : Promise.resolve(null),
      ...badges.map((b) => loadImage(b.icon))
    ]);
    S.skinReady = !!(activeSkinUrl(player) && skin);
    if (S.mode === "moment" && !S.moment) {
      S.blob = null; S.upload = null;
      if (S.objectUrl) URL.revokeObjectURL(S.objectUrl); S.objectUrl = "";
      const blockedCanvas = $("shareCardCanvas");
      if (blockedCanvas) {
        const blockedCtx = blockedCanvas.getContext("2d");
        if (blockedCtx) { blockedCtx.clearRect(0, 0, blockedCanvas.width, blockedCanvas.height); drawBackground(blockedCtx, FACTIONS.pack.rgb, FACTIONS.pack.secondary, true); drawFitted(blockedCtx, "NO VERIFIED MOMENT", CARD_W / 2, CARD_H / 2, { size: 38, maxWidth: 900, align: "center" }); }
      }
      syncUiAfterRender();
      setStatus(S.requestedMomentKey ? "This exact Field Record entry is not verified or no longer available." : "No verified moments available yet.");
      return null;
    }
    S.stage = "canvas"; setStatus("Rendering card…");
    const canvas = $("shareCardCanvas"); if (!canvas) throw new Error("MISSING_CANVAS");
    canvas.width = CARD_W; canvas.height = CARD_H;
    const ctx = canvas.getContext("2d", { alpha: false }); if (!ctx) throw new Error("NO_CANVAS_CONTEXT");
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    if (S.mode === "moment" && S.moment) drawMoment(ctx, player, S.moment, { skin, frame, badges: badgeImgs });
    else drawIdentity(ctx, player, { skin, frame, background, badges: badgeImgs });

    S.stage = "png-export"; setStatus("Preparing PNG…");
    try {
      S.blob = await withDeadline(() => new Promise((resolve, reject) => {
        if (typeof canvas.toBlob !== "function") return reject(new Error("TO_BLOB_UNSUPPORTED"));
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error("PNG_EXPORT_FAILED")), "image/png");
      }), PNG_TIMEOUT_MS, "PNG_EXPORT_TIMEOUT");
    } catch (error) {
      console.warn("[ShareStudio] canvas export fallback", txt(error?.message));
      const dataUrl = canvas.toDataURL("image/png");
      const encoded = dataUrl.split(",")[1];
      if (!encoded) throw new Error("PNG_EXPORT_FAILED");
      const binary = atob(encoded), bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      S.blob = new Blob([bytes], { type: "image/png" });
    }
    if (!S.blob || S.blob.size < 5000) throw new Error("PNG_EXPORT_FAILED");
    if (S.objectUrl) URL.revokeObjectURL(S.objectUrl);
    S.objectUrl = URL.createObjectURL(S.blob); S.upload = null;
    S.stage = "ready"; S.lastError = "";
    syncUiAfterRender();
    if (!S.skinReady) setStatus("Equipped skin could not be verified or loaded. Preview only — sharing disabled.");
    return S.blob;
  }

  function identityCaption() {
    const p = S.player || {}; const f = factionMeta(p);
    const title = txt(p.displayTitle || p.activeTitle || p.title);
    return [`My Alpha.`, [title, f.label, `Lv ${Number(p.level || 1)}`].filter(Boolean).join(" · "), `The record remembers.`, `#AlphaHusky`].filter(Boolean).join("\n");
  }
  function momentCaption() {
    const m = S.moment || {}; return [`${txt(m.label || "Record")} — recorded.`, txt(m.copy || "Another record added."), `#AlphaHusky`].filter(Boolean).join("\n");
  }
  function caption() { return S.mode === "moment" && S.moment ? momentCaption() : identityCaption(); }

  function filename() {
    const name = (txt(S.player?.name) || "howler").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "howler";
    if (S.mode === "moment" && S.moment) {
      const event = txt(S.moment.key || "record").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `alpha-husky-record-${event}-${name}.png`;
    }
    return `alpha-husky-identity-${name}.png`;
  }

  function ensureExportable() {
    if (S.mode === "moment" && !S.moment) throw new Error("MOMENT_NOT_VERIFIED");
    if (!S.skinReady) throw new Error("ACTIVE_SKIN_UNAVAILABLE");
    if (!S.blob || !S.objectUrl) throw new Error("EXPORT_NOT_READY");
  }

  function buildFile() {
    if (!S.blob || typeof File === "undefined") return null;
    try { return new File([S.blob], filename(), { type: "image/png" }); } catch (_) { return null; }
  }

  async function copyCaption() {
    const value = caption();
    try { await navigator.clipboard.writeText(value); return true; } catch (_) {}
    const ta = document.createElement("textarea"); ta.value = value; ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (_) {} ta.remove(); return !!ok;
  }

  async function nativeShare() {
    if (!S.blob) await render();
    ensureExportable();
    const file = buildFile();
    if (!file || typeof navigator.share !== "function") return false;
    try { if (navigator.canShare && !navigator.canShare({ files: [file] })) return false; } catch (_) { return false; }
    try { await navigator.share({ files: [file], title: S.mode === "moment" ? "Alpha Husky Recorded Moment" : "Alpha Husky Identity", text: caption() }); return true; }
    catch (e) { if (e?.name === "AbortError") throw e; return false; }
  }

  function hideManualPreview() {
    const wrap = $("shareCardManualPreview"), img = $("shareCardManualImage");
    if (wrap) wrap.hidden = true;
    if (img) img.removeAttribute("src");
  }

  function showManualPreview(reason) {
    ensureExportable();
    const wrap = $("shareCardManualPreview"), img = $("shareCardManualImage");
    if (!wrap || !img) return false;
    img.src = S.objectUrl;
    wrap.hidden = false;
    setStatus(reason || "Open the image below; long-press it and choose Save Image if your client supports it.");
    return true;
  }

  async function requestTelegramDownload(url) {
    const tg = getTelegram();
    if (!telegramDownloadSupported() || !/^https:\/\//i.test(txt(url))) return false;
    // Callback means permission was accepted, NOT that the file reached Gallery/Files.
    return await withDeadline(() => new Promise((resolve, reject) => {
      try { tg.downloadFile({ url, file_name: filename() }, (accepted) => resolve(accepted === true)); }
      catch (error) { reject(error); }
    }), DOWNLOAD_RESPONSE_TIMEOUT_MS, "DOWNLOAD_RESPONSE_TIMEOUT");
  }

  async function saveImage() {
    if (!S.blob) await render();
    ensureExportable();
    if (inTelegram()) {
      if (telegramDownloadSupported()) {
        try {
          const upload = await ensureUpload();
          const url = txt(upload?.download_abs || upload?.abs);
          if (await requestTelegramDownload(url)) {
            setStatus("Download accepted by Telegram. Check device Downloads/Files; completion cannot be verified here.");
            return "telegram-download-accepted";
          }
        } catch (error) {
          console.warn("[ShareStudio] Telegram download could not start", txt(error?.message));
        }
      }
      showManualPreview("Telegram download unavailable or declined. Long-press the full-size image below and use Save Image if your device supports it.");
      return "manual-preview";
    }
    // Browser download is a best-effort request; JS has no reliable completion signal.
    const a = document.createElement("a");
    a.href = S.objectUrl; a.download = filename(); a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setStatus("Download requested. Check browser Downloads; this app cannot verify that it completed.");
    return "browser-download-requested";
  }

  async function ensureUpload() {
    if (S.upload) return S.upload;
    if (!S.blob) await render();
    ensureExportable();
    const form = new FormData(); form.append("file", S.blob, filename()); form.append("variant", S.mode);
    const res = await fetchWithTimeout((getApiBase() || "") + "/webapp/share/card/upload", { method: "POST", headers: multipartAuthHeaders(), body: form }, NETWORK_TIMEOUT_MS);
    const data = await res.json().catch(() => ({})); if (!res.ok || data?.ok === false) throw new Error(data?.reason || "UPLOAD_FAILED");
    S.upload = data; return data;
  }

  async function waitForTelegramShare(tg, preparedId) {
    return await new Promise((resolve, reject) => {
      let settled = false, callbackFailTimer = null;
      const settle = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout); clearTimeout(callbackFailTimer);
        try { tg.offEvent?.("shareMessageSent", onSent); } catch (_) {}
        try { tg.offEvent?.("shareMessageFailed", onFailed); } catch (_) {}
        if (error) reject(error); else resolve(true);
      };
      const onSent = () => settle();
      const onFailed = (event) => {
        const error = txt(event?.error || "UNKNOWN_ERROR").toUpperCase();
        settle(new Error(error === "USER_DECLINED" ? "TELEGRAM_SHARE_CANCELLED" : `TELEGRAM_${error}`));
      };
      const timeout = setTimeout(() => settle(new Error("TELEGRAM_SHARE_TIMEOUT")), TELEGRAM_SHARE_TIMEOUT_MS);
      try {
        tg.onEvent?.("shareMessageSent", onSent);
        tg.onEvent?.("shareMessageFailed", onFailed);
        tg.shareMessage(preparedId, (sent) => {
          if (sent === true) return settle();
          if (sent === false && !settled) {
            // Failure event can follow the false callback; allow it to explain the cause.
            callbackFailTimer = setTimeout(() => settle(new Error("TELEGRAM_SHARE_NOT_SENT")), 500);
          }
        });
      } catch (error) { settle(error); }
    });
  }

  async function shareTelegram() {
    if (!telegramShareSupported()) throw new Error("TELEGRAM_UNSUPPORTED");
    const up = await ensureUpload();
    const data = await withDeadline(() => apiPost("/webapp/share/card/telegram/prepare", {
      variant: S.mode, caption: caption(), photo_url: up.jpg_abs || up.jpg_url || up.abs || up.url
    }), NETWORK_TIMEOUT_MS);
    if (data?.ok === false || !data?.prepared_message_id) throw new Error(data?.reason || "TELEGRAM_PREPARE_FAILED");
    return await waitForTelegramShare(getTelegram(), data.prepared_message_id);
  }

  function telegramShareErrorMessage(error) {
    const reason = txt(error?.message).toUpperCase();
    if (reason === "TELEGRAM_SHARE_CANCELLED") return "";
    if (reason === "TELEGRAM_UNSUPPORTED") return "Telegram 8.0+ is required for direct sharing. Use Share or Save Image instead.";
    if (reason === "TELEGRAM_MESSAGE_EXPIRED") return "The Telegram sharing link expired. Please retry.";
    if (reason === "TELEGRAM_MESSAGE_SEND_FAILED") return "Telegram could not send the image. Please retry.";
    if (reason === "TELEGRAM_SHARE_TIMEOUT") return "Telegram did not respond. Try again or Save Image.";
    if (reason === "TELEGRAM_UNSUPPORTED" || reason === "TELEGRAM_UNKNOWN_ERROR") return "Telegram sharing is unavailable on this client.";
    if (reason === "NETWORK_TIMEOUT") return "Telegram preparation timed out. Please retry.";
    return "Telegram could not share this image. Please retry or use Save Image.";
  }

  function openExternal(url) {
    try { if (getTelegram()?.openLink) return getTelegram().openLink(url); } catch (_) {}
    global.open(url, "_blank", "noopener");
  }

  async function shareX() {
    if (!S.blob) await render();
    ensureExportable();
    const copied = await copyCaption();
    const params = new URLSearchParams();
    params.set("text", caption()); params.set("url", getShareLink());
    openExternal("https://x.com/intent/tweet?" + params.toString());
    setStatus(`X opened with text only, without the PNG attachment. Save Image and attach it manually.${copied ? " Caption also copied." : ""}`);
    return true;
  }

  function syncModeTabs() {
    const hasMoments = moments().length > 0;
    // Never silently replace a requested Moment with a different card.
    document.querySelectorAll("[data-share-mode]").forEach((btn) => {
      const isMoment = btn.dataset.shareMode === "moment";
      const active = btn.dataset.shareMode === S.mode;
      btn.classList.toggle("is-active", active); btn.setAttribute("aria-selected", active ? "true" : "false");
      if (isMoment) { btn.disabled = !hasMoments; btn.title = hasMoments ? "" : "No verified moments yet"; }
    });
    const picker = $("shareMomentPicker"); if (picker) picker.hidden = S.mode !== "moment";
  }

  function syncMomentSelector() {
    const sel = $("shareMomentSelect"); if (!sel) return;
    const list = moments();
    sel.innerHTML = "";
    if (!list.length) { const o = document.createElement("option"); o.value = ""; o.textContent = "No verified moments yet"; sel.appendChild(o); sel.disabled = true; return; }
    sel.disabled = false;
    list.slice().reverse().forEach((m) => { const o = document.createElement("option"); o.value = txt(m.key); o.textContent = txt(m.label || m.key); sel.appendChild(o); });
    if (S.moment) sel.value = txt(S.moment.key);
  }

  function syncUiAfterRender() {
    syncModeTabs(); syncMomentSelector();
    const title = $("shareCardTitle"); if (title) title.textContent = "Share Studio";
    const context = $("shareCardContext"); if (context) context.textContent = S.mode === "moment" ? "RECORDED MOMENT // VERIFIED HISTORY" : "IDENTITY // THIS IS MY ALPHA";
    const cap = $("shareCardCaptionPreview"); if (cap) cap.textContent = caption();
    const meta = $("shareCardMeta"); if (meta) meta.textContent = S.mode === "moment" ? "Built from verified Field Record data. The achievement cannot be edited here." : "Built from your live player identity, active skin and displayed badges.";
    const empty = $("shareMomentEmpty"); if (empty) empty.hidden = !(S.mode === "moment" && !S.moment);
    hideManualPreview();
    setStatus("");
  }

  function setBusy(v) {
    S.busy = !!v;
    const allowed = !S.busy && S.skinReady && !!S.blob && (S.mode !== "moment" || !!S.moment);
    ["shareCardPrimaryBtn", "shareCardXBtn", "shareCardSaveBtn", "shareCardCopyBtn"].forEach((id) => {
      const el = $(id); if (el) el.disabled = !allowed;
    });
    const tg = $("shareCardTelegramBtn");
    if (tg) {
      tg.disabled = !allowed || !telegramShareSupported();
      tg.title = telegramShareSupported() ? "" : "Direct share requires Telegram Mini App 8.0+. Use Share or Save Image instead.";
    }
    const picker = $("shareMomentSelect"); if (picker) picker.disabled = S.busy || !moments().length;
  }

  async function rerender() {
    setBusy(true); setStatus("Preparing record…");
    try { await render(); }
    catch (e) { console.error("[ShareStudio] render failed", e); setStatus("COULDN'T PREPARE THIS RECORD. TRY AGAIN."); throw e; }
    finally { setBusy(false); }
  }

  async function setMode(mode, momentKey) {
    S.mode = normalizeMode(mode);
    S.requestedMomentKey = momentKey != null ? txt(momentKey) : "";
    if (!S.state) await loadState(); else selectMoment(S.requestedMomentKey);
    syncModeTabs(); await rerender();
  }

  async function open(mode, options) {
    const modal = $("shareBack"); if (!modal) return false;
    const opts = options && typeof options === "object" ? options : {};
    S.mode = normalizeMode(mode); S.requestedMomentKey = txt(opts.momentKey || (typeof options === "string" ? options : ""));
    modal.style.display = "flex"; modal.dataset.open = "1"; document.body.classList.add("ah-sheet-open");
    try { global.navOpen?.(modal); } catch (_) {}
    if (S.openPromise) return S.openPromise;
    S.openPromise = (async () => {
      setBusy(true); setStatus("Loading live record…");
      S.stage = "starting"; S.lastError = "";
      const retry = $("shareCardRetryBtn"); if (retry) retry.hidden = true;
      try { await loadState(); syncModeTabs(); await render(); return true; }
      catch (e) {
        const failedStage = S.stage;
        S.stage = "failed"; S.lastError = txt(e?.message).slice(0, 100);
        console.error("[ShareStudio] open failed", { stage: failedStage, reason: S.lastError, httpStatus: Number(e?.status || 0) });
        setStatus("Could not prepare card (" + failedStage + "). Retry or close and reopen.");
        const retry = $("shareCardRetryBtn"); if (retry) retry.hidden = false;
        return false;
      }
      finally { setBusy(false); S.openPromise = null; }
    })();
    return S.openPromise;
  }

  function close() {
    const modal = $("shareBack"); if (modal) { modal.style.display = "none"; delete modal.dataset.open; }
    document.body.classList.remove("ah-sheet-open");
    hideManualPreview();
    if (S.objectUrl) URL.revokeObjectURL(S.objectUrl); S.objectUrl = ""; S.blob = null; S.upload = null; S.skinReady = false;
    try { global.navClose?.(modal); } catch (_) {}
  }

  function bind() {
    if (S.bound) return; S.bound = true;
    document.querySelectorAll("[data-share-mode]").forEach((btn) => btn.addEventListener("click", () => {
      if (!S.busy) void setMode(btn.dataset.shareMode).catch((e) => setStatus(txt(e?.message) || "Unable to render card."));
    }));
    $("shareMomentSelect")?.addEventListener("change", (e) => {
      if (!S.busy) { S.requestedMomentKey = txt(e.target.value); selectMoment(S.requestedMomentKey); void rerender().catch(() => {}); }
    });
    $("shareCardManualClose")?.addEventListener("click", hideManualPreview);
    $("shareCardRetryBtn")?.addEventListener("click", () => { if (!S.busy) void open(S.mode, { momentKey: S.requestedMomentKey }); });
    $("shareCardPrimaryBtn")?.addEventListener("click", async () => {
      if (S.busy) return; setBusy(true);
      try {
        const ok = await nativeShare();
        if (!ok) { showManualPreview("Native image sharing is unavailable. Long-press the image below to save it, or use Save Image."); }
      } catch (e) { if (e?.name !== "AbortError") toast("Sharing failed. Try Save Image."); }
      finally { setBusy(false); }
    });
    $("shareCardTelegramBtn")?.addEventListener("click", async () => {
      if (S.busy) return; setBusy(true);
      try { await shareTelegram(); setStatus("Telegram confirmed the image was shared."); }
      catch (e) {
        console.warn("[ShareStudio] Telegram failed", { status: Number(e?.status || 0), reason: txt(e?.data?.reason || e?.message).slice(0, 100) });
        const message = telegramShareErrorMessage(e);
        if (message) { setStatus(message); toast(message); }
      }
      finally { setBusy(false); }
    });
    $("shareCardXBtn")?.addEventListener("click", async () => {
      if (S.busy) return; setBusy(true);
      try { await shareX(); } catch (_) { toast("X intent could not open. Try Save Image."); }
      finally { setBusy(false); }
    });
    $("shareCardSaveBtn")?.addEventListener("click", async () => {
      if (S.busy) return; setBusy(true);
      try { await saveImage(); }
      catch (e) { console.warn("[ShareStudio] save unavailable", txt(e?.message)); toast("Image download could not start. Try Share."); }
      finally { setBusy(false); }
    });
    $("shareCardCopyBtn")?.addEventListener("click", async () => setStatus(await copyCaption() ? "Caption copied." : "Caption copy failed."));
  }

  global.ShareCard = {
    open,
    openHub: () => open("identity"),
    openEquipped: () => open("identity"),
    openIdentity: () => open("identity"),
    openMoment: (momentKey) => open("moment", { momentKey }),
    hide: close,
    getState: () => ({ mode: S.mode, player: S.player, moment: S.moment }),
    getDiagnostics: () => ({ stage: S.stage, lastError: S.lastError, playerLoaded: !!S.player, imageReady: !!S.blob, skinReady: S.skinReady, busy: S.busy }),
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true }); else bind();
})(window);
