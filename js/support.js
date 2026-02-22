// js/support.js — minimal Support UI bridge (front-ready)
(function(){
  let _tg=null;

  function init({ tg } = {}){
    _tg = tg || _tg || window.Telegram?.WebApp || null;

    // click in modal: tier buttons
    const back = document.getElementById("supportBack");
    if (back && !back.__wired){
      back.__wired = true;
      back.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-support-tier]");
        if (!btn) return;
        const tier = btn.getAttribute("data-support-tier");

        // for now: open bot /support (backend later: openInvoice)
        try {
          _tg?.HapticFeedback?.impactOccurred?.("light");
          _tg?.openTelegramLink?.("https://t.me/Alpha_husky_bot?start=support");
        } catch(_) {
          _tg?.showAlert?.("Open /support in chat");
        }
      });
    }
  }

  function open(){
    init({});
    const back = document.getElementById("supportBack");
    if (back){
      back.style.display = "flex";
      back.dataset.open = "1";
      try { window.navOpen?.("supportBack"); } catch(_){}
      document.body.classList.add("ah-sheet-open");
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return;
    }
    // fallback if modal missing
    try { _tg?.openTelegramLink?.("https://t.me/Alpha_husky_bot?start=support"); }
    catch(_) { _tg?.showAlert?.("Open /support in chat"); }
  }

  window.Support = window.Support || {};
  window.Support.init = init;
  window.Support.open = open;
})();
