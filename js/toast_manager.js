(function () {
  const STACK_ID = "alphaToastStack";
  const STYLE_ID = "alphaToastStyles";
  const MAX_VISIBLE = 3;
  const DEFAULT_TTL = 3600;
  const queue = [];
  const active = [];
  let bootQueued = false;
  const VERSION = "2026-06-20-progress-toasts-v1-2-reward-feedback";

  const TYPE_STYLES = {
    success: {
      glow: "rgba(118, 236, 193, .20)",
      border: "rgba(118, 236, 193, .34)",
      accent: "#9df1cf",
      icon: "+"
    },
    drop: {
      glow: "rgba(255, 212, 112, .20)",
      border: "rgba(255, 212, 112, .34)",
      accent: "#ffe29a",
      icon: "*"
    },
    level: {
      glow: "rgba(176, 225, 255, .34)",
      border: "rgba(176, 225, 255, .52)",
      accent: "#d6efff",
      icon: "LV"
    },
    pet: {
      glow: "rgba(170, 145, 255, .20)",
      border: "rgba(170, 145, 255, .34)",
      accent: "#d7c8ff",
      icon: "P"
    },
    den: {
      glow: "rgba(104, 214, 255, .20)",
      border: "rgba(104, 214, 255, .34)",
      accent: "#bcecff",
      icon: "D"
    }
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    if (!document.head) {
      scheduleBoot();
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#${STACK_ID}{
  position:fixed;
  top:calc(env(safe-area-inset-top, 0px) + 12px);
  right:12px;
  z-index:2147483647;
  width:min(340px, calc(100vw - 24px));
  display:flex;
  flex-direction:column;
  gap:8px;
  pointer-events:none;
  isolation:isolate;
 }
#${STACK_ID} .alpha-toast{
  position:relative;
  overflow:hidden;
  padding:11px 12px 11px 12px;
  border-radius:14px;
  border:1px solid var(--toast-border, rgba(255,255,255,.16));
  background:
    radial-gradient(circle at top right, var(--toast-glow, rgba(118,236,193,.18)), transparent 34%),
    linear-gradient(180deg, rgba(14,20,31,.96), rgba(8,12,20,.94));
  box-shadow:
    0 10px 26px rgba(0,0,0,.28),
    0 0 0 1px rgba(255,255,255,.03) inset;
  color:#edf5ff;
  pointer-events:auto;
  transform:translate3d(0, 0, 0);
  opacity:1;
  transition:opacity .2s ease, transform .2s ease;
}
#${STACK_ID} .alpha-toast--level{
  background:
    radial-gradient(circle at top right, rgba(176,225,255,.34), transparent 38%),
    linear-gradient(180deg, rgba(18,26,40,.98), rgba(8,13,23,.96));
  box-shadow:
    0 14px 34px rgba(0,0,0,.34),
    0 0 0 1px rgba(214,239,255,.09) inset;
}
#${STACK_ID} .alpha-toast--level::after{
  content:"";
  position:absolute;
  top:0;
  left:12px;
  right:12px;
  height:1px;
  background:linear-gradient(90deg, transparent, rgba(214,239,255,.88), transparent);
  opacity:.92;
}
#${STACK_ID} .alpha-toast.is-enter{
  opacity:0;
  transform:translate3d(0, -6px, 0);
}
#${STACK_ID} .alpha-toast.is-leave{
  opacity:0;
  transform:translate3d(0, -8px, 0);
}
#${STACK_ID} .alpha-toast--level.is-enter{
  transform:translate3d(0, -10px, 0) scale(.985);
}
#${STACK_ID} .alpha-toast--level.is-leave{
  transform:translate3d(0, -10px, 0) scale(.985);
}
#${STACK_ID} .alpha-toast__row{
  display:flex;
  align-items:flex-start;
  gap:10px;
}
#${STACK_ID} .alpha-toast__badge{
  flex:0 0 auto;
  width:26px;
  height:26px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.06);
  color:var(--toast-accent, #bcecff);
  font-size:11px;
  font-weight:900;
  letter-spacing:.08em;
  text-transform:uppercase;
}
#${STACK_ID} .alpha-toast__body{
  min-width:0;
  flex:1;
}
#${STACK_ID} .alpha-toast__title{
  font-size:13px;
  line-height:1.2;
  font-weight:900;
  color:#f3f8ff;
}
#${STACK_ID} .alpha-toast--level .alpha-toast__title{
  letter-spacing:.14em;
}
#${STACK_ID} .alpha-toast__message{
  margin-top:3px;
  font-size:12px;
  line-height:1.35;
  color:#d8e6f7;
}
#${STACK_ID} .alpha-toast--level .alpha-toast__message{
  color:#edf6ff;
}
#${STACK_ID} .alpha-toast__meta{
  margin-top:4px;
  font-size:10px;
  line-height:1.35;
  color:var(--toast-accent, #bcecff);
  opacity:.92;
}
#${STACK_ID} .alpha-toast--level .alpha-toast__badge{
  width:30px;
  height:30px;
  background:rgba(214,239,255,.12);
  box-shadow:0 0 20px rgba(176,225,255,.14);
}
@media (max-width: 640px){
  #${STACK_ID}{
    left:10px;
    right:10px;
    width:auto;
  }
  #${STACK_ID} .alpha-toast{
    padding:10px 11px;
    border-radius:12px;
  }
  #${STACK_ID} .alpha-toast__title{
    font-size:12px;
  }
  #${STACK_ID} .alpha-toast__message{
    font-size:11px;
  }
}
@media (prefers-reduced-motion: reduce){
  #${STACK_ID} .alpha-toast{
    transition:none !important;
  }
}
`;
    document.head.appendChild(style);
  }

  function ensureStack() {
    if (!document.body) return null;
    ensureStyles();
    let stack = document.getElementById(STACK_ID);
    if (stack) return stack;
    stack = document.createElement("div");
    stack.id = STACK_ID;
    stack.setAttribute("aria-live", "polite");
    stack.setAttribute("aria-atomic", "false");
    document.body.appendChild(stack);
    return stack;
  }

  function scheduleBoot() {
    if (bootQueued) return;
    bootQueued = true;
    const boot = () => {
      bootQueued = false;
      flush();
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
      return;
    }
    window.setTimeout(boot, 0);
  }

  function normalize(opts) {
    const input = (opts && typeof opts === "object") ? opts : {};
    const type = TYPE_STYLES[input.type] ? input.type : "success";
    const title = String(input.title || "").trim() || "Progress Updated";
    const message = String(input.message || "").trim();
    const meta = String(input.meta || "").trim();
    const ttl = Math.max(3000, Math.min(4000, Number(input.ttl) || DEFAULT_TTL));
    return { type, title, message, meta, ttl };
  }

  function removeToast(entry) {
    if (!entry) return;
    const idx = active.indexOf(entry);
    if (idx >= 0) active.splice(idx, 1);
    if (entry.timer) {
      window.clearTimeout(entry.timer);
      entry.timer = 0;
    }
    if (entry.el) {
      entry.el.classList.add("is-leave");
      window.setTimeout(() => {
        try { entry.el?.remove(); } catch (_) {}
      }, 220);
    }
    flush();
  }

  function clearQueuedType(type) {
    for (let i = queue.length - 1; i >= 0; i -= 1) {
      if (queue[i] && queue[i].type === type) queue.splice(i, 1);
    }
  }

  function clearActiveType(type) {
    const entries = active.filter((entry) => entry && entry.type === type);
    entries.forEach((entry) => removeToast(entry));
  }

  function mountToast(stack, toast) {
    const tone = TYPE_STYLES[toast.type] || TYPE_STYLES.success;
    const el = document.createElement("article");
    el.className = `alpha-toast alpha-toast--${esc(toast.type)} is-enter`;
    el.setAttribute("role", "status");
    el.style.setProperty("--toast-glow", tone.glow);
    el.style.setProperty("--toast-border", tone.border);
    el.style.setProperty("--toast-accent", tone.accent);
    el.innerHTML = `
      <div class="alpha-toast__row">
        <div class="alpha-toast__badge" aria-hidden="true">${esc(tone.icon)}</div>
        <div class="alpha-toast__body">
          <div class="alpha-toast__title">${esc(toast.title)}</div>
          ${toast.message ? `<div class="alpha-toast__message">${esc(toast.message)}</div>` : ""}
          ${toast.meta ? `<div class="alpha-toast__meta">${esc(toast.meta)}</div>` : ""}
        </div>
      </div>
    `;
    stack.appendChild(el);
    const entry = { el, timer: 0, type: toast.type };
    active.push(entry);
    const scheduleFrame = typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (cb) => window.setTimeout(cb, 0);
    scheduleFrame(() => {
      el.classList.remove("is-enter");
    });
    entry.timer = window.setTimeout(() => removeToast(entry), toast.ttl);
  }

  function flush() {
    const stack = ensureStack();
    if (!stack) {
      scheduleBoot();
      return;
    }
    while (queue.length && active.length < MAX_VISIBLE) {
      mountToast(stack, queue.shift());
    }
  }

  function show(opts) {
    const toast = normalize(opts);
    if (toast.type === "level") {
      clearQueuedType("level");
      clearActiveType("level");
    }
    queue.push(toast);
    flush();
  }

  function normalizeSummaryLines(lines) {
    const raw = Array.isArray(lines) ? lines : [lines];
    const out = [];
    for (const entry of raw) {
      const text = String(entry == null ? "" : entry).replace(/\s+/g, " ").trim();
      if (!text || out.includes(text)) continue;
      out.push(text);
      if (out.length >= 4) break;
    }
    return out;
  }

  function inferSummaryType(type, lines) {
    if (TYPE_STYLES[type]) return type;
    return lines.some((line) => /^Item found:/i.test(String(line || ""))) ? "drop" : "success";
  }

  function showProgressSummary(opts) {
    const input = (opts && typeof opts === "object") ? opts : {};
    const lines = normalizeSummaryLines(input.lines);
    const message = String(input.message || "").trim() || lines.slice(0, 2).join(" • ");
    const meta = String(input.meta || "").trim() || lines.slice(2).join(" • ");
    if (!message && !meta) return false;
    show({
      type: inferSummaryType(input.type, lines),
      title: String(input.title || "Progress Updated").trim() || "Progress Updated",
      message,
      meta,
      ttl: input.ttl,
    });
    return true;
  }
  const api = (window.AlphaToast && typeof window.AlphaToast === "object")
    ? window.AlphaToast
    : {};
  api.show = show;
  api.showProgressSummary = showProgressSummary;
  api.flush = flush;
  api.version = VERSION;
  window.AlphaToast = api;
})();
