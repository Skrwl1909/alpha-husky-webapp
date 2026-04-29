(function (global) {
  const AWAKENING_ASSETS = {
    signal: {
      imageUrl: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1777459181/awakening/awakening_01_signal_detected.webp",
      videoUrl: "https://res.cloudinary.com/dnjwvxinh/video/upload/v1777458942/awakening/awakening_01_signal_detected_loop.webm.webm"
    },
    alphaFoundTrail: {
      imageUrl: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1777459182/awakening/awakening_02_alpha_found_trail.webp",
      videoUrl: "https://res.cloudinary.com/dnjwvxinh/video/upload/v1777458943/awakening/awakening_02_alpha_found_trail_loop.webm.webm"
    },
    originMarks: {
      imageUrl: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1777459182/awakening/awakening_03_origin_marks.webp"
    },
    enterPack: {
      imageUrl: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1777459182/awakening/awakening_04_enter_the_pack.webp"
    }
  };

  const DEFAULT_CHOICES = [
    { key: "stray", label: "Stray", desc: "A survivor found in the chain noise." },
    { key: "broken", label: "Broken", desc: "Something damaged, but not defeated." },
    { key: "forgotten", label: "Forgotten", desc: "A name the old world tried to erase." },
    { key: "unchained", label: "Unchained", desc: "A signal that refused to stay buried." }
  ];

  const SLIDES = [
    {
      key: "signal",
      assetKey: "signal",
      title: "SIGNAL DETECTED",
      body: "Something moved through the chain-waste.\nNot a wallet.\nNot a number.\nA survivor.",
      button: "Continue"
    },
    {
      key: "trail",
      assetKey: "alphaFoundTrail",
      title: "ALPHA FOUND YOUR TRAIL",
      body: "You were not the first to be buried by the old world.\nBut you are still breathing.\nThe Pack is watching.",
      button: "Continue"
    },
    {
      key: "origin",
      assetKey: "originMarks",
      title: "CHOOSE YOUR ORIGIN MARK",
      body: "Before the Pack knew your name,\nthe chain tried to define you.\nWhat answered back?",
      button: "Claim Origin",
      isOrigin: true
    },
    {
      key: "enter",
      assetKey: "enterPack",
      title: "THE HOWL BEGINS",
      body: "Your signal has been recorded.\nNow choose where you stand,\nwho you answer to,\nand what kind of trail you leave behind.",
      button: "Enter the Pack",
      isFinal: true
    }
  ];

  const S = {
    apiPost: null,
    tg: null,
    dbg: false,
    checked: false,
    openedOnce: false,
    open: false,
    index: 0,
    selectedOrigin: "",
    choices: DEFAULT_CHOICES,
    back: null,
    busy: false,
    completeDone: false
  };

  function log(...args) {
    if (S.dbg) {
      try { console.log("[Awakening]", ...args); } catch (_) {}
    }
  }

  function asText(value) {
    return String(value ?? "").trim();
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeChoices(raw) {
    const src = Array.isArray(raw) ? raw : [];
    const out = src
      .map((row) => ({
        key: asText(row?.key).toLowerCase(),
        label: asText(row?.label),
        desc: asText(row?.desc)
      }))
      .filter((row) => row.key && row.label && row.desc);
    return out.length ? out : DEFAULT_CHOICES;
  }

  function toast(message) {
    const text = asText(message);
    if (!text) return;
    try {
      if (typeof global.toast === "function") {
        global.toast(text);
        return;
      }
    } catch (_) {}
    try {
      if (typeof global.showToast === "function") {
        global.showToast(text);
        return;
      }
    } catch (_) {}

    const el = document.createElement("div");
    el.className = "awakening-toast";
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.setAttribute("data-show", "1"));
    setTimeout(() => {
      el.setAttribute("data-show", "0");
      setTimeout(() => el.remove(), 240);
    }, 2200);
  }

  function haptic(kind) {
    try {
      if (kind === "success") S.tg?.HapticFeedback?.notificationOccurred?.("success");
      else S.tg?.HapticFeedback?.impactOccurred?.(kind || "light");
    } catch (_) {}
  }

  function ensureStyles() {
    if (document.getElementById("awakening-css")) return;
    const style = document.createElement("style");
    style.id = "awakening-css";
    style.textContent = `
      #awakeningBack{
        position:fixed !important;
        inset:0 !important;
        z-index:2147483000 !important;
        display:flex;
        align-items:stretch;
        justify-content:center;
        min-height:100vh;
        min-height:100dvh;
        color:#f6f7f2;
        background:#030407;
        pointer-events:auto;
        overflow:hidden;
        isolation:isolate;
      }
      #awakeningBack *{box-sizing:border-box}
      .awakening-panel{
        position:relative;
        width:min(100vw,560px);
        min-height:100vh;
        min-height:100dvh;
        overflow:hidden;
        background:#050608;
        border-inline:1px solid rgba(255,255,255,.08);
        box-shadow:0 0 80px rgba(0,0,0,.82);
      }
      .awakening-bg,
      .awakening-bg-image,
      .awakening-bg-video{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
      }
      .awakening-bg{z-index:0;overflow:hidden;background:#050608}
      .awakening-bg-image{
        background-position:center;
        background-size:cover;
        transform:scale(1.03);
        animation:awakeningZoom 14s ease-out forwards;
      }
      .awakening-bg-video{
        object-fit:cover;
        opacity:0;
        transform:scale(1.02);
        transition:opacity .45s ease;
      }
      .awakening-bg-video.is-ready{opacity:1}
      .awakening-shade{
        position:absolute;
        inset:0;
        z-index:1;
        background:
          radial-gradient(circle at 50% 30%, rgba(255,255,255,.06), transparent 36%),
          linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.30) 46%, rgba(0,0,0,.88)),
          linear-gradient(90deg, rgba(0,0,0,.52), transparent 24%, transparent 76%, rgba(0,0,0,.52));
      }
      .awakening-shade::before{
        content:"";
        position:absolute;
        inset:-20%;
        background:radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,.68) 78%);
        pointer-events:none;
      }
      .awakening-shade::after{
        content:"";
        position:absolute;
        inset:0;
        opacity:.18;
        mix-blend-mode:screen;
        background:repeating-linear-gradient(180deg, rgba(255,255,255,.20) 0 1px, transparent 1px 4px);
        pointer-events:none;
      }
      .awakening-noise{
        position:absolute;
        inset:0;
        z-index:2;
        opacity:.13;
        pointer-events:none;
        background:
          linear-gradient(90deg, transparent 0 47%, rgba(88,241,255,.18) 48% 49%, transparent 50% 100%),
          repeating-linear-gradient(115deg, transparent 0 9px, rgba(255,255,255,.12) 10px, transparent 11px 17px);
        animation:awakeningStatic 1.7s steps(4,end) infinite;
      }
      .awakening-skip{
        position:absolute;
        top:max(12px, env(safe-area-inset-top));
        right:12px;
        z-index:7;
        height:34px;
        padding:0 13px;
        border-radius:8px;
        border:1px solid rgba(255,255,255,.16);
        color:rgba(255,255,255,.82);
        background:rgba(5,6,8,.54);
        font:800 11px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:.08em;
        text-transform:uppercase;
        cursor:pointer;
        backdrop-filter:blur(10px);
      }
      .awakening-skip:disabled{opacity:.55;cursor:default}
      .awakening-copy{
        position:absolute;
        left:14px;
        right:14px;
        bottom:max(18px, env(safe-area-inset-bottom));
        z-index:6;
        padding:16px;
        border-radius:8px;
        border:1px solid rgba(255,255,255,.14);
        background:linear-gradient(180deg, rgba(7,9,13,.76), rgba(4,5,8,.88));
        box-shadow:0 22px 60px rgba(0,0,0,.42);
        backdrop-filter:blur(14px);
        animation:awakeningFade .28s ease both;
      }
      .awakening-step{
        display:flex;
        align-items:center;
        gap:8px;
        margin:0 0 10px;
        color:rgba(246,247,242,.58);
        font:800 11px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .awakening-step i{
        display:block;
        width:34px;
        height:1px;
        background:linear-gradient(90deg, rgba(88,241,255,.75), rgba(255,183,77,.52));
      }
      .awakening-title{
        margin:0;
        color:#fffdf5;
        font:950 27px/1.02 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:0;
        text-transform:uppercase;
        text-shadow:0 2px 20px rgba(0,0,0,.55);
      }
      .awakening-body{
        margin:12px 0 0;
        color:rgba(246,247,242,.83);
        font:600 15px/1.42 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        white-space:pre-line;
      }
      .awakening-origins{
        display:grid;
        grid-template-columns:1fr;
        gap:8px;
        margin-top:14px;
      }
      .awakening-origin{
        display:block;
        width:100%;
        text-align:left;
        padding:11px 12px;
        border-radius:8px;
        border:1px solid rgba(255,255,255,.13);
        background:rgba(255,255,255,.055);
        color:#f8faf5;
        cursor:pointer;
      }
      .awakening-origin b{
        display:block;
        font-size:14px;
        line-height:1.1;
      }
      .awakening-origin span{
        display:block;
        margin-top:5px;
        color:rgba(246,247,242,.68);
        font-size:12px;
        line-height:1.28;
      }
      .awakening-origin[aria-pressed="true"]{
        border-color:rgba(88,241,255,.86);
        background:linear-gradient(180deg, rgba(88,241,255,.18), rgba(255,183,77,.08));
        box-shadow:0 0 0 1px rgba(88,241,255,.32), 0 0 26px rgba(88,241,255,.20);
      }
      .awakening-actions{
        display:flex;
        align-items:center;
        justify-content:flex-end;
        gap:10px;
        margin-top:16px;
      }
      .awakening-primary{
        min-height:42px;
        width:100%;
        border:1px solid rgba(255,255,255,.18);
        border-radius:8px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.03)),
          linear-gradient(90deg, rgba(88,241,255,.34), rgba(255,183,77,.22));
        color:#fffdf5;
        font:950 12px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:.11em;
        text-transform:uppercase;
        cursor:pointer;
        box-shadow:0 14px 32px rgba(0,0,0,.32);
      }
      .awakening-primary:disabled{
        opacity:.42;
        cursor:default;
        filter:saturate(.5);
      }
      .awakening-notice{
        display:none;
        margin-top:11px;
        color:#ffd27d;
        font-size:12px;
        line-height:1.3;
      }
      .awakening-notice[data-show="1"]{display:block}
      .awakening-toast{
        position:fixed;
        left:50%;
        bottom:max(82px, calc(env(safe-area-inset-bottom) + 62px));
        z-index:2147483100;
        transform:translate(-50%, 10px);
        opacity:0;
        max-width:min(88vw,360px);
        padding:10px 14px;
        border-radius:8px;
        border:1px solid rgba(88,241,255,.42);
        background:rgba(6,8,12,.92);
        color:#f7fbff;
        box-shadow:0 16px 38px rgba(0,0,0,.36);
        font:800 13px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        transition:opacity .2s ease, transform .2s ease;
      }
      .awakening-toast[data-show="1"]{opacity:1;transform:translate(-50%,0)}
      @keyframes awakeningFade{
        from{opacity:0;transform:translateY(8px)}
        to{opacity:1;transform:translateY(0)}
      }
      @keyframes awakeningZoom{
        from{transform:scale(1.03)}
        to{transform:scale(1.10)}
      }
      @keyframes awakeningStatic{
        0%{transform:translate3d(0,0,0)}
        25%{transform:translate3d(1px,-1px,0)}
        50%{transform:translate3d(-1px,1px,0)}
        75%{transform:translate3d(1px,1px,0)}
        100%{transform:translate3d(0,0,0)}
      }
      @media (min-width:440px){
        .awakening-copy{left:18px;right:18px;bottom:max(20px, env(safe-area-inset-bottom));padding:18px}
        .awakening-title{font-size:31px}
        .awakening-body{font-size:16px}
        .awakening-origins{grid-template-columns:1fr 1fr}
        .awakening-primary{width:auto;min-width:178px}
      }
      @media (prefers-reduced-motion:reduce){
        .awakening-bg-image,
        .awakening-noise,
        .awakening-copy{animation:none}
      }
    `;
    document.head.appendChild(style);
  }

  function assetFor(slide) {
    return AWAKENING_ASSETS[slide.assetKey] || {};
  }

  function ensureModal() {
    ensureStyles();
    if (S.back && document.body.contains(S.back)) return S.back;

    const back = document.createElement("div");
    back.id = "awakeningBack";
    back.setAttribute("role", "dialog");
    back.setAttribute("aria-modal", "true");
    back.setAttribute("aria-label", "The Awakening");
    back.innerHTML = `
      <div class="awakening-panel">
        <div class="awakening-bg" aria-hidden="true"></div>
        <div class="awakening-shade" aria-hidden="true"></div>
        <div class="awakening-noise" aria-hidden="true"></div>
        <button type="button" class="awakening-skip">Skip</button>
        <div class="awakening-copy"></div>
      </div>
    `;

    back.querySelector(".awakening-skip")?.addEventListener("click", () => {
      void skip();
    });

    S.back = back;
    document.body.appendChild(back);
    return back;
  }

  function renderBackground(slide) {
    const back = ensureModal();
    const bg = back.querySelector(".awakening-bg");
    if (!bg) return;

    const asset = assetFor(slide);
    const imageUrl = asText(asset.imageUrl);
    const videoUrl = asText(asset.videoUrl);
    bg.innerHTML = "";

    const img = document.createElement("div");
    img.className = "awakening-bg-image";
    if (imageUrl) img.style.backgroundImage = `url("${imageUrl.replace(/"/g, "%22")}")`;
    bg.appendChild(img);

    if (!videoUrl) return;

    const video = document.createElement("video");
    video.className = "awakening-bg-video";
    video.src = videoUrl;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("loop", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    if (imageUrl) video.poster = imageUrl;

    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      try { video.pause(); } catch (_) {}
      video.remove();
    };
    const ready = () => {
      if (settled) return;
      settled = true;
      video.classList.add("is-ready");
    };

    video.addEventListener("canplay", ready, { once: true });
    video.addEventListener("playing", ready, { once: true });
    video.addEventListener("error", fail, { once: true });
    video.addEventListener("stalled", fail, { once: true });
    bg.appendChild(video);

    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(fail);
    }
    setTimeout(() => {
      if (!settled) fail();
    }, 2200);
  }

  function originHtml() {
    return `
      <div class="awakening-origins" role="list">
        ${S.choices.map((choice) => `
          <button
            type="button"
            class="awakening-origin"
            role="listitem"
            aria-pressed="${choice.key === S.selectedOrigin ? "true" : "false"}"
            data-origin="${esc(choice.key)}"
          >
            <b>${esc(choice.label)}</b>
            <span>${esc(choice.desc)}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function setNotice(message) {
    const el = S.back?.querySelector?.(".awakening-notice");
    if (!el) return;
    const text = asText(message);
    el.textContent = text;
    el.setAttribute("data-show", text ? "1" : "0");
  }

  function setBusy(on) {
    S.busy = !!on;
    const back = S.back;
    if (!back) return;
    back.querySelectorAll("button").forEach((button) => {
      if (button.classList.contains("awakening-origin")) {
        button.disabled = S.busy;
        return;
      }
      button.disabled = S.busy;
    });
    updatePrimaryState();
  }

  function updatePrimaryState() {
    const slide = SLIDES[S.index] || SLIDES[0];
    const primary = S.back?.querySelector?.(".awakening-primary");
    if (!primary) return;
    primary.disabled = S.busy || (slide.isOrigin && !S.selectedOrigin);
  }

  function render() {
    const back = ensureModal();
    const slide = SLIDES[S.index] || SLIDES[0];
    const copy = back.querySelector(".awakening-copy");
    if (!copy) return;

    renderBackground(slide);
    copy.innerHTML = `
      <div class="awakening-step"><i></i><span>${esc(S.index + 1)} / ${esc(SLIDES.length)}</span></div>
      <h1 class="awakening-title">${esc(slide.title)}</h1>
      <div class="awakening-body">${esc(slide.body)}</div>
      ${slide.isOrigin ? originHtml() : ""}
      <div class="awakening-actions">
        <button type="button" class="awakening-primary">${esc(slide.button)}</button>
      </div>
      <div class="awakening-notice" data-show="0" role="status" aria-live="polite"></div>
    `;

    copy.querySelectorAll(".awakening-origin").forEach((button) => {
      button.addEventListener("click", () => {
        if (S.busy) return;
        S.selectedOrigin = asText(button.getAttribute("data-origin")).toLowerCase();
        haptic("light");
        render();
      });
    });

    copy.querySelector(".awakening-primary")?.addEventListener("click", () => {
      void next();
    });
    updatePrimaryState();
  }

  async function next() {
    if (S.busy) return;
    const slide = SLIDES[S.index] || SLIDES[0];

    if (slide.isOrigin && !S.selectedOrigin) {
      setNotice("Choose an Origin Mark first.");
      return;
    }

    if (slide.isFinal) {
      await complete(false);
      return;
    }

    S.index = Math.min(S.index + 1, SLIDES.length - 1);
    haptic("light");
    render();
  }

  async function complete(skipped) {
    if (S.completeDone || S.busy) return;
    setBusy(true);
    setNotice("");

    try {
      const payload = skipped
        ? { skipped: true }
        : { origin_mark: S.selectedOrigin, skipped: false };
      const out = await S.apiPost("/webapp/awakening/complete", payload);
      if (!out || out.ok === false) throw new Error(out?.reason || "AWAKENING_COMPLETE_FAILED");
      S.completeDone = true;
      close();
      toast("Awakening recorded.");
      haptic("success");
    } catch (err) {
      log("complete failed", err);
      if (skipped) {
        close();
        return;
      }
      setBusy(false);
      setNotice("Could not record the Awakening. Try again.");
    }
  }

  async function skip() {
    if (S.busy) return;
    await complete(true);
  }

  function open(state) {
    if (S.open || S.openedOnce) return false;
    S.openedOnce = true;
    S.open = true;
    S.index = 0;
    S.selectedOrigin = "";
    S.completeDone = false;
    S.choices = normalizeChoices(state?.choices || DEFAULT_CHOICES);
    ensureModal();
    document.documentElement.classList.add("ah-modal-open");
    document.body.classList.add("ah-awakening-open");
    render();
    return true;
  }

  function close() {
    const back = S.back;
    S.open = false;
    S.busy = false;
    if (back) {
      back.querySelectorAll("video").forEach((video) => {
        try { video.pause(); } catch (_) {}
      });
      back.remove();
    }
    S.back = null;
    document.body.classList.remove("ah-awakening-open");
    if (!global.AH_NAV?.stack?.length) {
      document.documentElement.classList.remove("ah-modal-open");
    }
  }

  async function checkState() {
    if (S.checked || typeof S.apiPost !== "function") return;
    S.checked = true;
    try {
      const out = await S.apiPost("/webapp/awakening/state", {});
      if (!out || out.ok === false || !out.should_show) return;
      open(out);
    } catch (err) {
      log("state skipped", err);
    }
  }

  function init(deps = {}) {
    if (typeof deps.apiPost === "function") S.apiPost = deps.apiPost;
    S.tg = deps.tg || global.Telegram?.WebApp || global.tg || S.tg || null;
    S.dbg = typeof deps.dbg === "boolean" ? deps.dbg : !!deps.dbg || S.dbg;

    if (typeof S.apiPost === "function") {
      setTimeout(() => {
        void checkState();
      }, 0);
    }

    return API;
  }

  const API = { init, open, close };
  global.Awakening = API;
  global.AWAKENING_ASSETS = AWAKENING_ASSETS;
})(window);
