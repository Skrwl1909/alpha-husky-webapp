(function (global) {
  "use strict";

  const KEY = "ah.discovery.postFtue.v1";
  let saved = { introSeen: false };
  try { saved = { ...saved, ...JSON.parse(global.localStorage.getItem(KEY) || "{}") }; } catch (_) {}

  const GROUPS = Object.freeze([
    Object.freeze({
      id: "identity",
      title: "YOUR HUSKY",
      line: "Everything tied to your character starts here.",
      items: Object.freeze([
        Object.freeze({ id: "character", name: "Your Husky", line: "Gear, skins, frames, badges, stats and pets." })
      ])
    }),
    Object.freeze({
      id: "world",
      title: "WORLD",
      line: "Places worth knowing after training.",
      items: Object.freeze([
        Object.freeze({ id: "forge", name: "Worksmith Forge", line: "Find where equipped gear can be improved." }),
        Object.freeze({ id: "adopt", name: "Adopt Center", line: "Find companions for your Pack." })
      ])
    }),
    Object.freeze({
      id: "pack",
      title: "PACK & SERVICES",
      line: "Useful systems that live behind Hub.",
      items: Object.freeze([
        Object.freeze({ id: "shop", name: "Shop", line: "Browse useful supplies and current stock." }),
        Object.freeze({ id: "howlboard", name: "Howlboard", line: "See Pack rankings and progression." }),
        Object.freeze({ id: "support", name: "Support", line: "Project support and HOWL holder utilities." })
      ])
    })
  ]);

  const ALL = Object.freeze(GROUPS.flatMap(group => group.items));

  function persist() { try { global.localStorage.setItem(KEY, JSON.stringify(saved)); } catch (_) {} }
  function read(key) { try { return global.localStorage.getItem(key) || ""; } catch (_) { return ""; } }
  function inputs() { return global.StoryDelivery?.gatherInputs?.() || {}; }

  function veteranReady(current) {
    const fs = current?.firstSignal || current?.tutorial?.first_signal || {};
    const world = String(fs.world_discovery || fs.worldDiscovery || "").toLowerCase();
    if (fs?.eligible === false && current?.campaign?.eligible === false) return true;
    return fs?.state === "COMPLETED" && world === "done" && read("ah.sd.tacticalDiscovery.v1") === "consumed";
  }

  function completionState(current = inputs()) {
    let spine = null;
    try { spine = global.FirstSessionSpine?.view?.(current) || null; } catch (_) {}
    if (spine?.complete === true) return { available: true, freshGraduate: true };
    if (veteranReady(current)) return { available: true, freshGraduate: false };
    return { available: false, freshGraduate: false };
  }

  function discovered(id) {
    try { return global.GuidedNavigation?.reached?.(id) === true || global.GuidedNavigation?.state?.()?.[id]?.reached === true; }
    catch (_) { return false; }
  }

  function view(current = inputs()) {
    const gate = completionState(current);
    const count = ALL.filter(item => discovered(item.id)).length;
    return {
      available: gate.available,
      intro: gate.available && gate.freshGraduate && !saved.introSeen,
      discovered: count,
      total: ALL.length,
      complete: count === ALL.length
    };
  }

  function dismiss() {
    saved.introSeen = true;
    persist();
    refresh();
  }

  async function go(id) {
    if (!view().available) return false;
    if (!ALL.some(item => item.id === id)) return false;
    const started = global.GuidedNavigation?.start?.(id, { replay: true, source: "discovery_guide" }) === true;
    if (!started) return false;
    dismiss();
    return true;
  }

  function row(item) {
    const known = discovered(item.id);
    return '<div class="ah-discovery-row" data-discovery-row="' + item.id + '">'
      + '<div class="ah-discovery-copy"><div class="ah-discovery-name">' + item.name + '</div>'
      + '<div class="ah-discovery-line">' + item.line + '</div></div>'
      + '<span class="ah-discovery-state" data-discovery-state="' + item.id + '">' + (known ? 'DISCOVERED' : 'UNEXPLORED') + '</span>'
      + '<button type="button" class="ah-discovery-go" data-guide-go="' + item.id + '">' + (known ? 'SHOW ME' : 'FIND IT') + '</button>'
      + '</div>';
  }

  function render(root) {
    const current = view();
    root.hidden = !current.available;
    if (!current.available) return;
    root.innerHTML = '<div class="ah-discovery-intro" data-guide-intro' + (current.intro ? '' : ' hidden') + '>'
      + '<div class="ah-discovery-kicker">TRAINING COMPLETE</div>'
      + '<b>EXPLORE ALPHA</b>'
      + '<p>You know the basics. This stays in Hub → Quick Access whenever you need to find a system again.</p>'
      + '<div class="ah-discovery-intro-actions"><button type="button" class="ah-action" data-guide-start>Explore</button><button type="button" class="ah-action" data-guide-later>Later</button></div>'
      + '</div>'
      + '<details class="ah-discovery-shell"><summary><span>EXPLORE ALPHA</span><small>' + current.discovered + '/' + current.total + ' discovered</small></summary>'
      + '<div class="ah-discovery-learned"><b>YOU ALREADY KNOW:</b> Missions · Tactical Ops · Map · Blood Moon</div>'
      + GROUPS.map(group => '<section class="ah-discovery-group" data-discovery-group="' + group.id + '"><div class="ah-discovery-group-head"><b>' + group.title + '</b><span>' + group.line + '</span></div>' + group.items.map(row).join("") + '</section>').join("")
      + '<p role="status" data-guide-status></p></details>';

    const details = root.querySelector(".ah-discovery-shell");
    const later = root.querySelector("[data-guide-later]");
    const start = root.querySelector("[data-guide-start]");
    if (later) later.onclick = dismiss;
    if (start) start.onclick = () => { dismiss(); if (details) details.open = true; };
    details?.addEventListener("toggle", () => { if (details.open) dismiss(); });
  }

  function refresh() {
    const current = view();
    const badge = document.querySelector?.('#ahBottomNav [data-badge="hub"]');
    if (badge) {
      badge.hidden = !current.intro;
      badge.textContent = current.intro ? "NEW" : "";
      badge.setAttribute?.("aria-label", current.intro ? "New discovery guide available in Hub" : "");
    }
    const root = document.getElementById("alphaDiscoveryGuide");
    if (!root) return;
    const wasOpen = !!root.querySelector(".ah-discovery-shell")?.open;
    render(root);
    const details = root.querySelector(".ah-discovery-shell");
    if (details && wasOpen) details.open = true;
  }

  function reset() {
    saved = { introSeen: false };
    try { global.localStorage.removeItem(KEY); } catch (_) {}
    refresh();
  }

  function init() {
    const root = document.getElementById("alphaDiscoveryGuide");
    if (!root) return;

    if (!document.getElementById("ah-post-ftue-discovery-style")) {
      const style = document.createElement("style");
      style.id = "ah-post-ftue-discovery-style";
      style.textContent = '.ah-discovery-intro{margin:6px 0 10px;padding:14px;border:1px solid rgba(159,214,255,.22);border-radius:14px;background:linear-gradient(180deg,rgba(15,31,45,.94),rgba(7,16,25,.94));color:#eef8ff}.ah-discovery-intro[hidden]{display:none}.ah-discovery-intro p{margin:6px 0 12px;font-size:12px;line-height:1.45;opacity:.82}.ah-discovery-kicker{font-size:10px;font-weight:900;letter-spacing:.14em;color:#9fd6ff;margin-bottom:4px}.ah-discovery-intro-actions{display:flex;gap:8px}.ah-discovery-shell{border-top:1px solid rgba(255,255,255,.08)}.ah-discovery-shell>summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;font-weight:900;letter-spacing:.04em}.ah-discovery-shell>summary small{font-size:10px;opacity:.6;font-weight:700;white-space:nowrap}.ah-discovery-learned{padding:0 0 12px;font-size:10px;line-height:1.45;opacity:.62}.ah-discovery-group{padding:10px 0;border-top:1px solid rgba(255,255,255,.07)}.ah-discovery-group-head{margin-bottom:4px}.ah-discovery-group-head>b{display:block;font-size:11px;letter-spacing:.1em;color:#9fd6ff}.ah-discovery-group-head>span{display:block;margin-top:2px;font-size:11px;opacity:.58}.ah-discovery-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 10px;align-items:center;padding:10px 0}.ah-discovery-copy{min-width:0}.ah-discovery-name{font-size:13px;font-weight:850}.ah-discovery-line{margin-top:2px;font-size:11px;line-height:1.35;opacity:.68}.ah-discovery-state{grid-column:1;font-size:9px;font-weight:900;letter-spacing:.11em;opacity:.52}.ah-discovery-go{grid-column:2;grid-row:1/3;min-width:76px;min-height:40px;padding:8px 10px;border:1px solid rgba(159,214,255,.24);border-radius:10px;background:rgba(159,214,255,.08);color:#dff5ff;font-size:10px;font-weight:900;letter-spacing:.05em;cursor:pointer}.ah-discovery-go:disabled{opacity:.45;cursor:default}[data-guide-status]{min-height:14px;margin:6px 0 0;font-size:11px;color:#ffc9c9}';
      document.head.appendChild(style);
    }

    root.addEventListener("click", async event => {
      const button = event.target.closest("[data-guide-go]");
      if (!button) return;
      button.disabled = true;
      try {
        const ok = await go(button.getAttribute("data-guide-go"));
        const status = root.querySelector("[data-guide-status]");
        if (status) status.textContent = ok ? "" : "Could not start guidance right now. Try again from Hub.";
      } catch (_) {
        const status = root.querySelector("[data-guide-status]");
        if (status) status.textContent = "Could not start guidance right now. Try again from Hub.";
      } finally { button.disabled = false; }
    });

    global.StoryDelivery?.subscribe?.(refresh);
    global.FirstSessionSpine?.subscribe?.(refresh);
    global.addEventListener?.("ah:guided-navigation-state", refresh);
    refresh();
  }

  global.DiscoveryGuide = { view, go, dismiss, refresh, reset, groups: () => GROUPS };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})(window);
