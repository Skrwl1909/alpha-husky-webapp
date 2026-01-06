// js/scene_bg.js — Scene background overlay (VIDEO) for Alpha Husky WebApp
// Works with your existing .bg video (background2.*). This adds a second video layer (z=1) for scenes.

(function () {
  const FADE_MS = 220;

  function ver() {
    const v = (window.WEBAPP_VER && String(window.WEBAPP_VER).trim()) || "";
    return v ? `?v=${encodeURIComponent(v)}` : "";
  }

  // Root-level scene assets (same folder as index.html)
  const SCENES = Object.assign(
    {
      shop: {
        type: "video",
        src: `/shop_scene.mp4${ver()}`,
        poster: `/shop_scene.webp${ver()}`, // optional but recommended
      },
    },
    (window.SCENE_BG || {})
  );

  function ensureLayer() {
    let wrap = document.getElementById("sceneBg");
    if (wrap) return wrap;

    wrap = document.createElement("div");
    wrap.id = "sceneBg";
    wrap.setAttribute("aria-hidden", "true");

    // place between .bg and .ui inside .app
    const app = document.querySelector(".app");
    if (app) {
      wrap.style.position = "absolute";
      wrap.style.inset = "0";
      wrap.style.zIndex = "1";
      const ui = app.querySelector(".ui");
      app.insertBefore(wrap, ui || null);
    } else {
      wrap.style.position = "fixed";
      wrap.style.inset = "0";
      wrap.style.zIndex = "1";
      document.body.prepend(wrap);
    }

    wrap.style.pointerEvents = "none";
    wrap.style.opacity = "0";
    wrap.style.transition = `opacity ${FADE_MS}ms ease`;
    wrap.style.overflow = "hidden";

    // video element
    const vid = document.createElement("video");
    vid.id = "sceneBgVideo";
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.autoplay = false;
    vid.preload = "auto";

    vid.style.position = "absolute";
    vid.style.inset = "0";
    vid.style.width = "100%";
    vid.style.height = "100%";
    vid.style.objectFit = "cover";
    vid.style.filter = "contrast(1.06) brightness(.92) saturate(1.06)";

    wrap.appendChild(vid);

    // subtle vignette overlay
    const vignette = document.createElement("div");
    vignette.style.position = "absolute";
    vignette.style.inset = "0";
    vignette.style.background =
      "radial-gradient(ellipse at center, rgba(0,0,0,.08) 0%, rgba(0,0,0,.55) 78%, rgba(0,0,0,.78) 100%)";
    wrap.appendChild(vignette);

    return wrap;
  }

  const wrap = ensureLayer();
  const vid = document.getElementById("sceneBgVideo");

  const stack = [];
  let current = null;
  let busy = false;

  function fadeIn() {
    requestAnimationFrame(() => (wrap.style.opacity = "1"));
  }
  function fadeOut() {
    wrap.style.opacity = "0";
  }

  async function playSceneVideo(scene) {
    if (!vid) return;

    // set poster if provided
    if (scene.poster) vid.setAttribute("poster", scene.poster);

    // set src (reset to force reload when switching)
    if (vid.src !== scene.src) {
      try {
        vid.pause();
      } catch (_) {}
      vid.removeAttribute("src");
      vid.load();
      vid.src = scene.src;
      vid.load();
    }

    // try play (user gesture should exist when opening modal)
    try {
      const p = vid.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch (_) {}
  }

  function stopVideo() {
    if (!vid) return;
    try { vid.pause(); } catch (_) {}
    // drop src to free memory (optional but nice)
    try {
      vid.removeAttribute("src");
      vid.load();
    } catch (_) {}
  }

  async function show(key) {
    const scene = SCENES[key];
    if (!scene) return false;
    if (current === key) return true;
    if (busy) return false;
    busy = true;

    fadeOut();
    await new Promise((r) => setTimeout(r, 16));

    if (scene.type === "video") {
      await playSceneVideo(scene);
    }

    fadeIn();
    current = key;
    document.body.dataset.scene = key;

    setTimeout(() => (busy = false), FADE_MS + 40);
    return true;
  }

  function hide() {
    if (busy) return false;
    busy = true;

    fadeOut();
    current = null;
    document.body.dataset.scene = "";

    setTimeout(() => {
      stopVideo();
      busy = false;
    }, FADE_MS + 40);

    return true;
  }

  window.SceneBg = {
    enter(key) { stack.length = 0; stack.push(key); return show(key); },
    exit() { stack.length = 0; return hide(); },
    push(key) { stack.push(key); return show(key); },
    pop() { if (stack.length) stack.pop(); const top = stack[stack.length - 1]; return top ? show(top) : hide(); },
    is(key) { return current === key; },
  };
})();
