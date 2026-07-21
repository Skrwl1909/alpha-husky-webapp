(function () {
  "use strict";

  const ROOT_ID = "signalBrokerRoot";
  const STYLE_ID = "signal-broker-shell-p0-css";
  const BODY_OPEN_CLASS = "signal-broker-open";
  const RELAY7_PORTRAIT_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778846885/awakening/relay7/relay7_avatar_v1.webp";

  const SIGNAL_BROKER_SHELL_STATE = Object.freeze({
    mode: "shell",
    npc: {
      name: "RELAY-7",
      role: "PACK SIGNAL HANDLER · CONTRACT BROKER",
      location: "DEAD RELAY EXCHANGE",
      status: "Contract line offline"
    },
    dialogue: "You already know my signal.\n\nCampaign reports are only one part of the work.\n\nDead routes keep carrying fragments the Pack cannot afford to ignore.\n\nI track them here.\n\nThe contract line is not active yet. When it opens, you will take one signal at a time and bring the result back to me.",
    offers: [],
    activeContract: null,
    readyToTurnIn: false
  });

  let initialized = false;
  let isOpen = false;
  let scrollRestore = "";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function queueForDom(callback) {
    if (document.body) {
      callback();
      return true;
    }
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return false;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{ position:fixed; inset:0; z-index:1000001; pointer-events:none; }
#${ROOT_ID}[data-open="1"]{ pointer-events:auto; }
#${ROOT_ID} .signal-broker-back{
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  box-sizing:border-box; padding:max(14px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(14px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left));
  background:rgba(2,6,9,.76); backdrop-filter:blur(7px); -webkit-backdrop-filter:blur(7px);
  opacity:0; visibility:hidden; transition:opacity .18s ease, visibility .18s ease;
}
#${ROOT_ID}[data-open="1"] .signal-broker-back{ opacity:1; visibility:visible; }
#${ROOT_ID} .signal-broker-panel{
  width:min(840px, 100%); max-height:calc(100dvh - max(28px, env(safe-area-inset-top) + env(safe-area-inset-bottom)));
  display:flex; flex-direction:column; min-height:0; overflow:hidden; position:relative;
  color:#dce7ec; border:1px solid rgba(124,190,201,.28); border-radius:18px;
  background:linear-gradient(145deg, rgba(22,34,40,.99), rgba(8,14,18,.995));
  box-shadow:0 26px 72px rgba(0,0,0,.62), inset 0 1px 0 rgba(211,242,244,.07);
}
#${ROOT_ID} .signal-broker-panel::before{
  content:""; position:absolute; inset:0; pointer-events:none; opacity:.24;
  background:repeating-linear-gradient(0deg, rgba(176,229,235,.035) 0 1px, transparent 1px 5px), radial-gradient(circle at 84% 8%, rgba(66,193,210,.15), transparent 32%);
}
#${ROOT_ID} .signal-broker-head, #${ROOT_ID} .signal-broker-body, #${ROOT_ID} .signal-broker-footer{ position:relative; z-index:1; }
#${ROOT_ID} .signal-broker-head{ display:flex; gap:14px; align-items:center; padding:16px 18px 14px; border-bottom:1px solid rgba(142,203,213,.17); }
#${ROOT_ID} .signal-broker-portrait{
  flex:0 0 68px; width:68px; height:68px; border-radius:12px; position:relative; overflow:hidden;
  border:1px solid rgba(111,207,220,.34); background:linear-gradient(145deg, #17262d, #080e12);
  box-shadow:inset 0 0 0 4px rgba(0,0,0,.18);
}
#${ROOT_ID} .signal-broker-portrait-img{ position:relative; z-index:1; display:block; width:100%; height:100%; object-fit:cover; object-position:center; }
#${ROOT_ID} .signal-broker-portrait-fallback{ position:absolute; inset:0; display:grid; place-items:center; color:#8bcfd9; font-size:16px; font-weight:900; letter-spacing:.08em; }
#${ROOT_ID} .signal-broker-title{ min-width:0; flex:1; }
#${ROOT_ID} .signal-broker-kicker, #${ROOT_ID} .signal-broker-section-label{ color:#8bcfd9; font-size:10px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; }
#${ROOT_ID} .signal-broker-location{ margin:2px 0 4px; color:#9eb1ba; font-size:12px; }
#${ROOT_ID} .signal-broker-name{ margin:0; color:#eff8fa; font-size:22px; line-height:1.05; letter-spacing:.01em; }
#${ROOT_ID} .signal-broker-status{ display:inline-flex; align-items:center; gap:7px; margin-top:7px; color:#bedde1; font-size:12px; }
#${ROOT_ID} .signal-broker-status::before{ content:""; width:7px; height:7px; border-radius:50%; background:#d89a45; box-shadow:0 0 7px rgba(222,157,65,.46); }
#${ROOT_ID} .signal-broker-close{ width:44px; min-width:44px; height:44px; border-radius:10px; border:1px solid rgba(171,213,218,.25); color:#dceef0; background:rgba(255,255,255,.045); font-size:26px; line-height:1; cursor:pointer; }
#${ROOT_ID} .signal-broker-close:focus-visible{ outline:2px solid #75d9e5; outline-offset:2px; }
#${ROOT_ID} .signal-broker-body{ min-height:0; overflow-y:auto; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; padding:16px 18px 18px; }
#${ROOT_ID} .signal-broker-dialogue{ margin:0 0 18px; padding:14px 15px; white-space:pre-line; color:#d2e0e4; line-height:1.5; font-size:14px; border-left:2px solid rgba(91,208,222,.58); background:rgba(101,184,194,.055); }
#${ROOT_ID} .signal-broker-section{ margin-top:16px; }
#${ROOT_ID} .signal-broker-section-label{ margin-bottom:8px; color:#b8d3d8; }
#${ROOT_ID} .signal-broker-active, #${ROOT_ID} .signal-broker-offer{ border:1px solid rgba(147,192,198,.18); background:linear-gradient(135deg, rgba(171,220,224,.055), rgba(0,0,0,.12)); }
#${ROOT_ID} .signal-broker-active{ padding:13px 14px; color:#aebfc4; }
#${ROOT_ID} .signal-broker-offers{ display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; }
#${ROOT_ID} .signal-broker-offer{ min-height:122px; padding:13px; border-radius:11px; }
#${ROOT_ID} .signal-broker-offer h4{ margin:0 0 8px; color:#e4f2f4; font-size:13px; letter-spacing:.035em; }
#${ROOT_ID} .signal-broker-offer p{ margin:0; color:#aebec3; font-size:12px; line-height:1.42; }
#${ROOT_ID} .signal-broker-pending{ display:inline-block; margin-top:12px; color:#d9ad70; font-size:10px; font-weight:800; letter-spacing:.09em; }
#${ROOT_ID} .signal-broker-state-zone[hidden]{ display:none !important; }
#${ROOT_ID} .signal-broker-footer{ padding:13px 18px calc(13px + env(safe-area-inset-bottom)); color:#9cb4ba; font-size:12px; line-height:1.4; border-top:1px solid rgba(142,203,213,.14); background:rgba(0,0,0,.13); }
body.${BODY_OPEN_CLASS}{ overflow:hidden !important; }
body.${BODY_OPEN_CLASS} #packComms, body.${BODY_OPEN_CLASS} #packCommsBtn, body.${BODY_OPEN_CLASS} #communityBtn, body.${BODY_OPEN_CLASS} .pack-comms, body.${BODY_OPEN_CLASS} .pack-comms-btn, body.${BODY_OPEN_CLASS} .community-btn, body.${BODY_OPEN_CLASS} [data-pack-comms]{ visibility:hidden !important; pointer-events:none !important; }
@media (max-width:640px){
  #${ROOT_ID} .signal-broker-back{ align-items:stretch; padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom); }
  #${ROOT_ID} .signal-broker-panel{ width:100%; max-height:100%; border-radius:0; border-left:0; border-right:0; }
  #${ROOT_ID} .signal-broker-head{ padding:13px 14px; gap:11px; }
  #${ROOT_ID} .signal-broker-portrait{ flex-basis:52px; width:52px; height:52px; }
  #${ROOT_ID} .signal-broker-name{ font-size:19px; }
  #${ROOT_ID} .signal-broker-body{ padding:14px 14px 18px; }
  #${ROOT_ID} .signal-broker-offers{ grid-template-columns:1fr; }
  #${ROOT_ID} .signal-broker-offer{ min-height:auto; }
  #${ROOT_ID} .signal-broker-footer{ padding:12px 14px calc(12px + env(safe-area-inset-bottom)); }
}
@media (prefers-reduced-motion:reduce){ #${ROOT_ID} *, #${ROOT_ID} *::before, #${ROOT_ID} *::after{ animation:none !important; transition:none !important; } }
`;
    document.head.appendChild(style);
  }

  function ensureRootNow() {
    ensureStyles();
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.setAttribute("data-open", "0");
      root.addEventListener("click", onRootClick);
      document.addEventListener("keydown", onKeyDown);
      document.body.appendChild(root);
    }
    return root;
  }

  function ensureRoot() {
    if (!document.body) {
      queueForDom(ensureRootNow);
      return null;
    }
    return ensureRootNow();
  }

  function onRootClick(event) {
    const target = event.target;
    if (target?.id === "signalBrokerBack" || target?.closest?.("#signalBrokerClose")) close();
  }

  function onKeyDown(event) {
    if (isOpen && event.key === "Escape") close();
  }

  function render() {
    const root = ensureRoot();
    if (!root) return null;
    const state = SIGNAL_BROKER_SHELL_STATE;
    root.innerHTML = `
      <div id="signalBrokerBack" class="signal-broker-back" role="presentation">
        <section id="signalBrokerPanel" class="signal-broker-panel" role="dialog" aria-modal="true" aria-labelledby="signalBrokerName">
          <header class="signal-broker-head">
            <div id="signalBrokerPortrait" class="signal-broker-portrait" aria-label="RELAY-7 portrait" role="img">
              <div class="signal-broker-portrait-fallback" aria-hidden="true">R7</div>
              <img class="signal-broker-portrait-img" src="${escapeHtml(RELAY7_PORTRAIT_URL)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">
            </div>
            <div class="signal-broker-title">
              <h2 id="signalBrokerName" class="signal-broker-name">${escapeHtml(state.npc.name)}</h2>
              <div class="signal-broker-kicker">${escapeHtml(state.npc.role)}</div>
              <div id="signalBrokerLocation" class="signal-broker-location">${escapeHtml(state.npc.location)}</div>
              <div id="signalBrokerStatus" class="signal-broker-status">${escapeHtml(state.npc.status)}</div>
            </div>
            <button id="signalBrokerClose" class="signal-broker-close" type="button" aria-label="Close RELAY-7 broker panel">&times;</button>
          </header>
          <div class="signal-broker-body">
            <p id="signalBrokerDialogue" class="signal-broker-dialogue">${escapeHtml(state.dialogue)}</p>
            <div id="signalBrokerLoading" class="signal-broker-state-zone" hidden aria-live="polite"></div>
            <div id="signalBrokerError" class="signal-broker-state-zone" hidden role="alert"></div>
            <div id="signalBrokerEmptyState" class="signal-broker-state-zone" hidden></div>
            <section class="signal-broker-section" aria-labelledby="signalBrokerActiveLabel">
              <div id="signalBrokerActiveLabel" class="signal-broker-section-label">Active Contract</div>
              <div id="signalBrokerActiveContract" class="signal-broker-active">No active contract. The contract line is offline.</div>
              <div id="signalBrokerReadyToTurnIn" class="signal-broker-state-zone" hidden></div>
              <div id="signalBrokerRewardCapNotice" class="signal-broker-state-zone" hidden></div>
            </section>
            <section class="signal-broker-section" aria-labelledby="signalBrokerOffersLabel">
              <div id="signalBrokerOffersLabel" class="signal-broker-section-label">Contract Offers</div>
              <div id="signalBrokerOffers" class="signal-broker-offers" aria-label="Contract offer previews">
                <article class="signal-broker-offer" aria-disabled="true"><h4>Field Recovery</h4><p>Cross-system recovery assignment.</p><span class="signal-broker-pending">OFFLINE</span></article>
                <article class="signal-broker-offer" aria-disabled="true"><h4>Relay Stabilization</h4><p>Restore field data and signal infrastructure.</p><span class="signal-broker-pending">SIGNAL LOCKED</span></article>
                <article class="signal-broker-offer" aria-disabled="true"><h4>Broken Circuit</h4><p>Recover components and rebuild damaged relay hardware.</p><span class="signal-broker-pending">COMING ONLINE</span></article>
              </div>
            </section>
          </div>
          <footer id="signalBrokerFooter" class="signal-broker-footer">RELAY-7 is monitoring the exchange. Pack contracts cannot be taken yet.</footer>
        </section>
      </div>`;
    return root;
  }

  function openNow() {
    const root = render();
    if (!root) return false;
    if (isOpen) return true;
    isOpen = true;
    scrollRestore = document.body.style.overflow;
    document.body.classList.add(BODY_OPEN_CLASS);
    root.setAttribute("data-open", "1");
    try {
      const navMeta = { close: closeView, isOpen: () => isOpen };
      if (window.AlphaNav?.push) window.AlphaNav.push(ROOT_ID, navMeta);
      else {
        window.navRegister?.(ROOT_ID, navMeta);
        window.navOpen?.(ROOT_ID);
      }
    } catch (_) {}
    return true;
  }

  function open() {
    if (!document.body) {
      queueForDom(openNow);
      return false;
    }
    return openNow();
  }

  function closeView() {
    const root = ensureRoot();
    isOpen = false;
    document.body?.classList.remove(BODY_OPEN_CLASS);
    if (document.body) document.body.style.overflow = scrollRestore;
    scrollRestore = "";
    root?.setAttribute("data-open", "0");
  }

  function close() {
    try {
      if (window.AlphaNav?.close?.(ROOT_ID, { source: "signal-broker-close" })) return;
    } catch (_) {}
    closeView();
    try { window.navClose?.(ROOT_ID); } catch (_) {}
  }

  function init() {
    if (initialized) return;
    initialized = true;
    ensureRoot();
  }

  window.SignalBroker = { init, open, close, render };
  init();
})();
