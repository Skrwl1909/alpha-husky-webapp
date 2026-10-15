// Scout Portrait P1 — one visual voice for First Signal and FTUE ScoutGuide.
// Presentation only. No gameplay state, reward, API, or progression changes.
(function (global) {
  "use strict";

  const STYLE_ID = "ah-scout-comms-p1";
  const AVATAR_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1783676038/alpha_ui/missions/mission_npc_scout_avatar.webp";

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".ah-scout-comms{position:relative;isolation:isolate;min-width:0;overflow:hidden;border:1px solid rgba(113,219,234,.37);border-radius:15px;background:linear-gradient(115deg,rgba(8,33,48,.98),rgba(6,19,31,.97) 72%,rgba(9,31,43,.98));box-shadow:inset 3px 0 0 rgba(117,220,227,.7),inset 0 1px 0 rgba(163,232,240,.09),0 8px 25px rgba(0,0,0,.2);padding:12px 14px 13px;color:#e6f3f8}",
      ".ah-scout-comms::before{content:'';position:absolute;inset:0 auto auto 0;width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(129,236,241,.55),transparent);pointer-events:none}",
      ".ah-scout-comms__head{display:flex;align-items:center;gap:11px;min-width:0}",
      ".ah-scout-comms__avatar,.ah-scout-comms__fallback{display:block;width:48px;height:48px;flex:0 0 48px;border-radius:10px;border:1px solid rgba(131,229,238,.48);background:#061520;box-shadow:0 0 0 2px rgba(113,219,234,.07);object-fit:cover}",
      ".ah-scout-comms__fallback{display:grid;place-items:center;color:#b9eff4;font:900 18px system-ui,sans-serif}",
      ".ah-scout-comms [hidden]{display:none!important}",
      ".ah-scout-comms__identity{display:flex;flex:1 1 auto;flex-direction:column;gap:3px;min-width:0}",
      ".ah-scout-comms__label{color:#b5f0f4;font-size:11px;font-weight:900;letter-spacing:.13em;line-height:1.2}",
      ".ah-scout-comms__channel{color:rgba(180,207,220,.68);font-size:9px;font-weight:750;letter-spacing:.16em;line-height:1.25}",
      ".ah-scout-comms__meter{margin-left:auto;flex:0 0 auto;display:flex;align-items:flex-end;gap:3px;height:17px}",
      ".ah-scout-comms__meter i{display:block;width:3px;height:6px;border-radius:2px;background:#78dce8;opacity:.5;animation:ah-scout-comms-pulse 3.1s ease-in-out infinite}",
      ".ah-scout-comms__meter i:nth-child(2){height:11px;animation-delay:-1s}",
      ".ah-scout-comms__meter i:nth-child(3){height:16px;animation-delay:-2s}",
      ".ah-scout-comms__line{margin:12px 0 0!important;color:#e3f1f7!important;font-size:clamp(13px,3.5vw,15px)!important;line-height:1.48!important;letter-spacing:0!important;overflow-wrap:anywhere;white-space:normal}",
      ".ah-scout-comms__rule{height:1px;margin-top:11px;background:linear-gradient(90deg,rgba(113,219,234,.53),rgba(113,219,234,.09) 60%,transparent)}",
      ".ah-scout-comms--locked{outline:1px solid rgba(142,237,251,.42);outline-offset:-2px}",
      "#ahScoutGuide:has(> .ah-scout-comms){border:0;padding:0;background:transparent;box-shadow:none}",
      "@keyframes ah-scout-comms-pulse{0%,100%{opacity:.35}45%{opacity:.9}}",
      "@media(max-width:360px){.ah-scout-comms{padding:10px 11px 12px}.ah-scout-comms__head{gap:9px}.ah-scout-comms__avatar,.ah-scout-comms__fallback{width:42px;height:42px;flex-basis:42px}.ah-scout-comms__label{font-size:10px}}",
      "@media(prefers-reduced-motion:reduce){.ah-scout-comms__meter i{animation:none!important;opacity:.6}}"
    ].join("");
    document.head.appendChild(style);
  }

  function render(line, options) {
    ensureStyles();
    const locked = !!(options && options.locked);
    // Avatar is decorative: the visible label names the speaker. Initial stays available offline.
    return '<div class="ah-scout-comms' + (locked ? ' ah-scout-comms--locked' : '') + '" role="group" aria-label="Scout communications">'
      + '<div class="ah-scout-comms__head">'
      + '<img class="ah-scout-comms__avatar" src="' + AVATAR_URL + '" alt="" loading="lazy" decoding="async" onerror="this.hidden=true;this.nextElementSibling.hidden=false;this.onerror=null;">'
      + '<span class="ah-scout-comms__fallback" aria-hidden="true" hidden>S</span>'
      + '<div class="ah-scout-comms__identity"><span class="ah-scout-comms__label">SCOUT · COMMS</span>'
      + '<span class="ah-scout-comms__channel">PACK RADIO / LIVE SIGNAL</span></div>'
      + '<span class="ah-scout-comms__meter" aria-hidden="true"><i></i><i></i><i></i></span></div>'
      + '<p class="ah-scout-comms__line">' + escapeHtml(line) + '</p>'
      + '<div class="ah-scout-comms__rule" aria-hidden="true"></div></div>';
  }

  global.ScoutComms = Object.freeze({ render, ensureStyles });
})(window);
