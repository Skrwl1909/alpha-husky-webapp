// Alpha Husky - Field Record presentation facade (canonical history stays server-side)
(function (global) {
  "use strict";

  const SEEN_KEY = "ah.fieldRecord.activationSeen.v1";
  let shownThisRuntime = false;

  function text(value) {
    return String(value ?? "").trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function profile() {
    return global.__PROFILE__ || global.profileState || global.lastProfile || global.PROFILE || {};
  }

  function currentUid() {
    const p = profile();
    const candidates = [
      global.Telegram?.WebApp?.initDataUnsafe?.user?.id,
      p.uid,
      p.id,
      p.user_id,
      global.__ahRealProfileData?.uid,
      global.__ahRealProfileData?.id,
    ];
    for (const candidate of candidates) {
      const uid = text(candidate);
      if (uid && uid !== "0") return uid;
    }
    return "";
  }

  function presentationKey() {
    let devFresh = false;
    try { devFresh = global.DevFresh?.isActive?.() === true; } catch (_) {}
    return SEEN_KEY + (devFresh ? ".devFresh" : "");
  }

  function alreadySeen() {
    if (shownThisRuntime) return true;
    try { return global.localStorage.getItem(presentationKey()) === "1"; } catch (_) { return false; }
  }

  function markSeen() {
    shownThisRuntime = true;
    try { global.localStorage.setItem(presentationKey(), "1"); } catch (_) {}
  }

  function closeActivation() {
    const root = document.getElementById("fieldRecordActivationBack");
    if (root) root.remove();
  }

  function ensureActivationStyles() {
    if (document.getElementById("field-record-activation-css")) return;
    const style = document.createElement("style");
    style.id = "field-record-activation-css";
    style.textContent = `
      #fieldRecordActivationBack{position:fixed;inset:0;z-index:1003000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(1,4,8,.82);backdrop-filter:blur(8px)}
      .fr-activation{width:min(92vw,460px);padding:24px;border:1px solid rgba(125,211,252,.28);border-radius:16px;background:linear-gradient(180deg,rgba(13,19,27,.98),rgba(6,9,14,.98));box-shadow:0 24px 80px rgba(0,0,0,.62),inset 0 1px rgba(255,255,255,.05);color:#f4f7fb;text-align:left}
      .fr-activation-kicker{font:850 11px/1.2 ui-sans-serif,system-ui,sans-serif;letter-spacing:.18em;color:rgba(125,211,252,.78)}
      .fr-activation h2{margin:9px 0 14px;font:950 25px/1.05 ui-sans-serif,system-ui,sans-serif;letter-spacing:.04em}
      .fr-activation p{margin:0;color:rgba(231,238,248,.76);font:500 14px/1.55 ui-sans-serif,system-ui,sans-serif}
      .fr-activation-identity{margin:18px 0 12px;padding:11px 12px;border-left:2px solid rgba(125,211,252,.72);background:rgba(125,211,252,.055);font:850 13px/1.3 ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
      .fr-activation-final{color:rgba(244,247,251,.9)!important}
      .fr-activation-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:20px}
      .fr-activation-actions button{min-height:42px;flex:1;padding:0 14px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#f4f7fb;font:850 11px/1 ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;cursor:pointer}
      .fr-activation-actions .is-primary{border-color:rgba(125,211,252,.42);background:rgba(34,105,155,.55)}
    `;
    document.head.appendChild(style);
  }

  function identityLine(details) {
    const p = profile();
    const callsign = text(details?.callsign || p.nickname || p.name || document.getElementById("heroName")?.textContent);
    const faction = text(details?.faction || p.faction).replace(/[_-]+/g, " ");
    return [callsign, faction].filter(Boolean).join("  ·  ");
  }

  function presentActivation(details = {}) {
    if (alreadySeen() || typeof document === "undefined" || !document.body) return false;
    ensureActivationStyles();
    closeActivation();
    const back = document.createElement("div");
    back.id = "fieldRecordActivationBack";
    back.innerHTML = `
      <section class="fr-activation" role="dialog" aria-modal="true" aria-labelledby="fieldRecordActivationTitle">
        <div class="fr-activation-kicker">NETWORK RECORD</div>
        <h2 id="fieldRecordActivationTitle">FIELD RECORD ACTIVATED</h2>
        <p>Training complete.<br>From here, the Network records the trail you actually leave behind.</p>
        ${identityLine(details) ? `<div class="fr-activation-identity">${escapeHtml(identityLine(details))}</div>` : ""}
        <p class="fr-activation-final">The rest is yours to write.</p>
        <div class="fr-activation-actions">
          <button type="button" class="is-primary" data-field-record-view>VIEW FIELD RECORD</button>
          <button type="button" data-field-record-continue>CONTINUE</button>
        </div>
      </section>`;
    markSeen();
    back.addEventListener("click", function (event) {
      if (event.target === back || event.target.closest("[data-field-record-continue]")) closeActivation();
      const view = event.target.closest("[data-field-record-view]");
      if (view) {
        closeActivation();
        void openSelf();
      }
    });
    document.body.appendChild(back);
    back.querySelector("[data-field-record-view]")?.focus?.();
    return true;
  }

  async function openSelf(options = {}) {
    const uid = currentUid();
    if (!uid || typeof global.PlayerProfile?.open !== "function") return false;
    const charBack = document.getElementById("charBack");
    if (charBack) charBack.style.display = "none";
    return !!(await global.PlayerProfile.open(uid, { source: options.source || "field_record_self" }));
  }

  function resetPresentation() {
    shownThisRuntime = false;
    closeActivation();
    try {
      global.localStorage.removeItem(SEEN_KEY);
      global.localStorage.removeItem(SEEN_KEY + ".devFresh");
    } catch (_) {}
  }

  global.FieldRecord = {
    openSelf,
    presentActivation,
    resetPresentation,
    presentationStorageKey: SEEN_KEY,
  };
})(window);
