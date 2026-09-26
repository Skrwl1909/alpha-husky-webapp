// Alpha Husky — Hub Premium Command Deck V1
// Presentation/interaction only. StoryDelivery, Stats, LivingWorld and HomeNav remain state owners.
(function () {
  "use strict";

  if (window.__ahHubPremiumV1Bound) return;
  window.__ahHubPremiumV1Bound = true;

  const ROOT_ID = "hubBack";
  const DECK_ID = "ahHubDeck";
  const DRAWER_ID = "hubSystemsDrawer";
  const STORY_ID = "hubStoryRoot";
  const GOAL_ID = "hubGoalRoot";

  let root = null;
  let deck = null;
  let dots = [];
  let slides = [];
  let storyObserver = null;
  let settleTimer = 0;
  let activeIndex = 0;
  let pointerDown = false;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerDragged = false;
  let suppressClickUntil = 0;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function now() {
    return (window.performance && typeof window.performance.now === "function")
      ? window.performance.now()
      : Date.now();
  }

  function cacheDom() {
    root = document.getElementById(ROOT_ID);
    deck = document.getElementById(DECK_ID);
    dots = root ? $$("[data-hub-deck-dot]", root) : [];
    slides = deck ? $$(".ah-command-slide", deck) : [];
    return !!(root && deck && slides.length === 3);
  }

  function getSlideIndexFromScroll() {
    if (!deck || !slides.length) return 0;
    const width = deck.clientWidth || slides[0]?.clientWidth || 1;
    return Math.max(0, Math.min(slides.length - 1, Math.round(deck.scrollLeft / width)));
  }

  function setActiveIndex(index, opts) {
    if (!slides.length || !deck) return;
    const next = Math.max(0, Math.min(slides.length - 1, Number(index) || 0));
    activeIndex = next;

    dots.forEach((dot, i) => {
      const on = i === next;
      dot.setAttribute("aria-selected", on ? "true" : "false");
      dot.tabIndex = on ? 0 : -1;
    });

    slides.forEach((slide, i) => {
      slide.setAttribute("aria-hidden", i === next ? "false" : "true");
    });

    if (opts?.scroll) {
      const left = next * (deck.clientWidth || 0);
      try {
        deck.scrollTo({ left, behavior: opts.instant ? "auto" : "smooth" });
      } catch (_) {
        deck.scrollLeft = left;
      }
    }
  }

  function syncActiveFromScroll() {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => setActiveIndex(getSlideIndexFromScroll()), 70);
  }

  function resetDeck() {
    if (!cacheDom()) return;
    activeIndex = 0;
    deck.scrollLeft = 0;
    setActiveIndex(0);
  }

  function syncStoryPriority() {
    if (!root) root = document.getElementById(ROOT_ID);
    if (!root) return;
    const story = document.getElementById(STORY_ID);
    const hasStory = !!story && story.childElementCount > 0 && String(story.textContent || "").trim().length > 0;
    root.classList.toggle("ahp-has-story", hasStory);
  }

  function observeStory() {
    const story = document.getElementById(STORY_ID);
    if (!story || storyObserver) {
      syncStoryPriority();
      return;
    }
    storyObserver = new MutationObserver(syncStoryPriority);
    storyObserver.observe(story, { childList: true, subtree: true, characterData: true });
    syncStoryPriority();
  }

  function drawer() {
    return document.getElementById(DRAWER_ID);
  }

  function isSystemsOpen() {
    return drawer()?.dataset.open === "1";
  }

  function openSystems() {
    const panel = drawer();
    if (!panel) return false;
    panel.dataset.open = "1";
    panel.setAttribute("aria-hidden", "false");
    root?.classList.add("ahp-systems-open");
    const trigger = root?.querySelector("[data-hub-open-systems]");
    trigger?.setAttribute("aria-expanded", "true");
    window.setTimeout(() => panel.querySelector("[data-hub-close-systems]")?.focus({ preventScroll: true }), 30);
    return true;
  }

  function closeSystems(opts) {
    const panel = drawer();
    if (!panel || panel.dataset.open !== "1") return false;
    panel.dataset.open = "0";
    panel.setAttribute("aria-hidden", "true");
    root?.classList.remove("ahp-systems-open");
    const trigger = root?.querySelector("[data-hub-open-systems]");
    trigger?.setAttribute("aria-expanded", "false");
    if (opts?.restoreFocus !== false) {
      window.setTimeout(() => trigger?.focus({ preventScroll: true }), 20);
    }
    return true;
  }

  function wireDeck() {
    if (!deck || deck.dataset.hubPremiumBound === "1") return;
    deck.dataset.hubPremiumBound = "1";

    deck.addEventListener("scroll", syncActiveFromScroll, { passive: true });

    deck.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerDown = true;
      pointerDragged = false;
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
    }, { passive: true });

    deck.addEventListener("pointermove", (event) => {
      if (!pointerDown) return;
      const dx = Math.abs(event.clientX - pointerStartX);
      const dy = Math.abs(event.clientY - pointerStartY);
      if (dx > 9 && dx > dy) pointerDragged = true;
    }, { passive: true });

    const endPointer = () => {
      if (pointerDown && pointerDragged) suppressClickUntil = now() + 260;
      pointerDown = false;
      pointerDragged = false;
    };
    deck.addEventListener("pointerup", endPointer, { passive: true });
    deck.addEventListener("pointercancel", endPointer, { passive: true });

    deck.addEventListener("click", (event) => {
      if (now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);

    deck.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const dir = event.key === "ArrowRight" ? 1 : -1;
      setActiveIndex(activeIndex + dir, { scroll: true });
    });
  }

  function wireControls() {
    if (!root || root.dataset.hubPremiumControlsBound === "1") return;
    root.dataset.hubPremiumControlsBound = "1";

    root.addEventListener("click", (event) => {
      const dot = event.target.closest("[data-hub-deck-dot]");
      if (dot && root.contains(dot)) {
        const idx = Number(dot.getAttribute("data-hub-deck-dot"));
        if (Number.isFinite(idx)) setActiveIndex(idx, { scroll: true });
        return;
      }

      if (event.target.closest("[data-hub-open-systems]")) {
        openSystems();
        return;
      }

      if (event.target.closest("[data-hub-close-systems]")) {
        closeSystems();
      }
    });

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isSystemsOpen()) {
        event.preventDefault();
        closeSystems();
      }
    });
  }

  function ensureGoalPlaceholder() {
    const goal = document.getElementById(GOAL_ID);
    if (!goal || goal.childElementCount || String(goal.textContent || "").trim()) return;
    goal.innerHTML = `
      <div class="ahp-objective ahp-skeleton" aria-label="Loading next move">
        <div class="ahp-kicker">NEXT MOVE</div>
        <div class="ahp-skeleton-line -short"></div>
        <div class="ahp-skeleton-line"></div>
        <div class="ahp-skeleton-line"></div>
        <div class="ahp-skeleton-line"></div>
      </div>`;
  }

  function activate() {
    if (!init()) return false;
    closeSystems({ restoreFocus: false });
    ensureGoalPlaceholder();
    syncStoryPriority();
    resetDeck();
    return true;
  }

  function init() {
    if (!cacheDom()) return false;
    root.classList.add("ah-hub-premium");
    wireDeck();
    wireControls();
    observeStory();
    setActiveIndex(getSlideIndexFromScroll());
    return true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.HubPremium = Object.freeze({
    init,
    activate,
    resetDeck,
    openSystems,
    closeSystems,
    isSystemsOpen,
    setCard(index) { setActiveIndex(index, { scroll: true }); }
  });
})();
