(function (global) {
  "use strict";
  const KEY = "ah.ftue.scoutGuide.v1";
  const lines = {
    1: "Signal detected. Open Missions, select FIRST SIGNAL, then start when you're ready. I'll watch the route.",
    2: "The signal is ready. Resolve the mission and see what came through.",
    4: "Rustfang Fangs recovered. Compare them with your equipped gear, then press Equip when you're ready.",
    8: "You're stronger now. Open Missions and select RELAY-7. Let's see where that signal leads.",
    16: "Choose your direction, then leave your mark. One lead is enough to move forward.",
    32: "The wider world is open. Lose the trail? Explore Alpha in the Hub shows the places you can go."
  };
  let consumed = 0, active = 0, fresh = false, card = null;
  try { consumed = (Number(global.localStorage.getItem(KEY)) || 0) & 63; } catch (_) {}
  function read(key) { try { return global.localStorage.getItem(key) || ""; } catch (_) { return ""; } }

  // Only current state selects a message. Stored bits only suppress repeats.
  function resolve(inputs, context = {}) {
    const fs = inputs?.firstSignal || inputs?.tutorial?.first_signal;
    const payload = inputs?.campaign, camp = payload?.campaign;
    if (!fs?.eligible || !fs.faction_selected) return 0;
    if (fs.state === "NOT_STARTED") return 1;
    if (fs.state === "MISSION_STARTED") return fs.status === "READY" ? 2 : 0;
    if (fs.state === "REWARD_RECEIVED") return 4;
    if (fs.state !== "COMPLETED" || !payload?.eligible || payload.ok === false || payload.show === false || !camp) return 0;
    if (!camp.markLeft) {
      if (camp.playerDirective || context.campaignOpen) return 16;
      return 8;
    }
    if (!camp.playerDirective || context.handoff !== camp.playerDirective || context.discovery !== "consumed") return 0;
    // Existing veterans are not enrolled by a completion flag alone.
    return context.participated ? 32 : 0;
  }

  function visible(id) {
    const node = document.getElementById(id);
    return node && !node.hidden && global.getComputedStyle(node).display !== "none";
  }
  function hide() { if (card) card.remove(); }
  function setFresh(value) {
    fresh = !!value;
    if (!fresh) hide();
  }
  function dismiss() { active = 0; hide(); }
  function refresh() {
    if (!fresh || document.visibilityState === "hidden" || global.Awakening?.isOpen?.() || global.Oath?.isOpen?.()) { hide(); return; }
    const campaignOpen = !!visible("campaignBack");
    const inputs = global.StoryDelivery?.gatherInputs?.();
    const beat = resolve(inputs, {
      campaignOpen, handoff: read("ah.sd.markHandoffConsumed.v1"),
      discovery: read("ah.sd.tacticalDiscovery.v1"), participated: !!(consumed & 31)
    });
    if (active !== beat) { active = 0; hide(); }
    if (!beat || (!active && (consumed & beat))) return;
    let host = null;
    if (global.Onboarding?.isOpen?.()) host = document.getElementById("obBody");
    else if (visible("missionsModal")) host = document.getElementById("mGuidedLead") || document.getElementById("missionsRoot");
    else if (document.getElementById("equipped-root")) host = document.getElementById("eq-compare-host");
    else if (campaignOpen) host = document.getElementById("campaignRoot");
    else if (visible("hubBack")) host = document.getElementById("hubStoryRoot");
    if (!host || !global.Missions?.renderScoutVoice) { hide(); return; }
    if (!card) {
      card = document.createElement("aside");
      card.id = "ahScoutGuide";
      card.setAttribute("aria-label", "Scout guidance");
    }
    if (card.dataset.beat !== String(beat)) {
      card.dataset.beat = String(beat);
      card.innerHTML = global.Missions.renderScoutVoice(lines[beat])
        + '<button type="button" class="ah-scout-dismiss" aria-label="Dismiss Scout guidance">Dismiss</button>';
      card.querySelector("button").onclick = dismiss;
    }
    host.appendChild(card);
    active = beat;
    consumed |= beat;
    try { global.localStorage.setItem(KEY, String(consumed)); } catch (_) {}
  }
  function init() {
    const style = document.createElement("style");
    style.textContent = '#ahScoutGuide{margin-top:12px;padding:10px;border:1px solid rgba(145,226,255,.18);border-radius:14px;background:rgba(8,18,29,.94);color:#eef8ff;}#ahScoutGuide .m-debrief-voice{display:flex;gap:10px;align-items:flex-start;}#ahScoutGuide .m-debrief-avatar,#ahScoutGuide .m-debrief-avatar-fallback{width:44px;height:44px;flex:0 0 44px;border-radius:12px;object-fit:cover;}#ahScoutGuide .m-debrief-copy{min-width:0;}#ahScoutGuide .m-report-label{font-size:11px;letter-spacing:.1em;font-weight:900;color:#9fd6ff;}#ahScoutGuide .m-debrief-line{font-size:13px;line-height:1.4;overflow-wrap:anywhere;}#ahScoutGuide .ah-scout-dismiss{display:block;margin-left:auto;min-height:44px;padding:8px 12px;border:0;background:transparent;color:#bdd7e8;font:inherit;font-size:12px;cursor:pointer;}';
    document.head.appendChild(style);
    global.StoryDelivery?.subscribe(refresh);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") { active = 0; setFresh(false); }
    });
    global.addEventListener("pagehide", () => { active = 0; setFresh(false); });
    const start = () => { void global.StoryDelivery?.refreshReturn(); };
    if (global.runAfterFirstProfileRender) global.runAfterFirstProfileRender(start, 600);
    else start();
  }
  global.ScoutGuide = { resolve, refresh, setFresh, dismiss };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})(window);
