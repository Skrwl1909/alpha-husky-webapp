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

  function ticks(n, total) {
    let html = '<span class="ah-discovery-ticks" aria-hidden="true">';
    for (let i = 0; i < total; i++) html += i < n ? '<i class="is-on"></i>' : '<i></i>';
    return html + '</span>';
  }

  function row(item) {
    const known = discovered(item.id);
    return '<div class="ah-discovery-row ' + (known ? 'is-discovered' : 'is-unexplored') + '" data-discovery-row="' + item.id + '">'
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
      + '<p>You know the basics. This stays in Hub → All Systems whenever you need to find a system again.</p>'
      + '<div class="ah-discovery-intro-actions"><button type="button" class="ah-action" data-guide-start>Explore</button><button type="button" class="ah-action" data-guide-later>Later</button></div>'
      + '</div>'
      + '<details class="ah-discovery-shell"><summary><span class="ah-discovery-summary-title">EXPLORE ALPHA</span><small><span class="ah-discovery-count">' + current.discovered + '/' + current.total + ' discovered</span>' + ticks(current.discovered, current.total) + '</small></summary>'
      + '<div class="ah-discovery-learned"><b>YOU ALREADY KNOW</b><span class="ah-discovery-chip">Missions</span><span class="ah-discovery-chip">Tactical Ops</span><span class="ah-discovery-chip">Map</span><span class="ah-discovery-chip">Blood Moon</span></div>'
      + GROUPS.map(group => '<section class="ah-discovery-group" data-discovery-group="' + group.id + '"><div class="ah-discovery-group-head"><b>' + group.title + '</b><span>' + group.line + '</span></div>' + group.items.map(row).join("") + '</section>').join("")
      + '<p role="status" data-guide-status></p></details>';

    const details = root.querySelector(".ah-discovery-shell");
    const later = root.querySelector("[data-guide-later]");
    const start = root.querySelector("[data-guide-start]");
    if (later) later.onclick = dismiss;
    if (start) start.onclick = () => {
      dismiss();
      const refreshedDetails = root.querySelector(".ah-discovery-shell");
      if (refreshedDetails) refreshedDetails.open = true;
    };
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
      style.textContent = [
        "#alphaDiscoveryGuide{color:#eef8ff}",
        ".ah-discovery-intro{margin:0 0 8px;padding:8px 10px 9px;border:1px solid rgba(159,214,255,.12);border-radius:10px;background:rgba(10,16,24,.28);color:rgba(238,248,255,.86)}",
        ".ah-discovery-intro[hidden]{display:none}",
        ".ah-discovery-kicker{font-size:8px;font-weight:800;letter-spacing:.16em;color:rgba(159,214,255,.62);margin-bottom:2px}",
        ".ah-discovery-intro>b{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;line-height:1.2;color:rgba(243,248,255,.88)}",
        ".ah-discovery-intro p{margin:4px 0 8px;font-size:11px;line-height:1.35;color:rgba(215,228,242,.68)}",
        ".ah-discovery-intro-actions{display:flex;gap:8px}",
        ".ah-discovery-intro-actions .ah-action,.ah-discovery-intro-actions [data-guide-start],.ah-discovery-intro-actions [data-guide-later]{height:44px;min-height:44px;flex:1;border-radius:9px;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}",
        ".ah-discovery-intro-actions [data-guide-start]{border:1px solid rgba(159,214,255,.28);background:rgba(159,214,255,.08);color:#e8f6ff}",
        ".ah-discovery-intro-actions [data-guide-later]{border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(230,240,255,.66)}",
        ".ah-discovery-intro-actions [data-guide-start]:active,.ah-discovery-intro-actions [data-guide-later]:active{transform:scale(.98)}",
        ".ah-discovery-shell{border:1px solid rgba(159,214,255,.18);border-radius:12px;background:linear-gradient(180deg,rgba(12,20,30,.62),rgba(8,12,18,.4));overflow:hidden}",
        ".ah-discovery-shell[open]{border-color:rgba(159,214,255,.22)}",
        ".ah-discovery-shell>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:8px 10px;user-select:none;background:linear-gradient(180deg,rgba(159,214,255,.05),transparent)}",
        ".ah-discovery-shell>summary::-webkit-details-marker{display:none}",
        ".ah-discovery-shell>summary::before{content:\"\";width:6px;height:6px;margin-right:2px;border-right:1.5px solid rgba(159,214,255,.8);border-bottom:1.5px solid rgba(159,214,255,.8);transform:rotate(-45deg);flex:0 0 auto;transition:transform .15s cubic-bezier(.23,1,.32,1)}",
        ".ah-discovery-shell[open]>summary::before{transform:rotate(45deg);margin-top:-2px}",
        ".ah-discovery-summary-title{flex:1 1 auto;min-width:0;font-size:13px;font-weight:800;letter-spacing:.12em;color:#f2f8ff}",
        ".ah-discovery-shell>summary small{display:flex;align-items:center;gap:6px;font-size:8px;font-weight:600;letter-spacing:.04em;color:rgba(186,208,230,.42);white-space:nowrap}",
        ".ah-discovery-ticks{display:inline-flex;gap:2px}",
        ".ah-discovery-ticks i{display:block;width:4px;height:2px;border-radius:1px;background:rgba(159,214,255,.1)}",
        ".ah-discovery-ticks i.is-on{background:rgba(159,214,255,.34)}",
        ".ah-discovery-learned{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:8px 10px 9px;border-top:1px solid rgba(255,255,255,.06);font-size:10px;line-height:1.2;color:rgba(186,208,230,.62)}",
        ".ah-discovery-learned>b{font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(148,164,189,.86);margin-right:2px}",
        ".ah-discovery-chip{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:999px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(210,224,240,.72);font-size:9.5px;font-weight:700;letter-spacing:.04em;pointer-events:none}",
        ".ah-discovery-group{padding:7px 8px 6px;border-top:1px solid rgba(255,255,255,.06)}",
        ".ah-discovery-group-head{display:flex;flex-direction:column;gap:1px;margin:0 2px 5px}",
        ".ah-discovery-group-head>b{display:block;font-size:10px;font-weight:800;letter-spacing:.14em;color:#9fd6ff}",
        ".ah-discovery-group-head>span{display:block;font-size:10px;line-height:1.3;color:rgba(186,208,230,.58);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
        ".ah-discovery-group[data-discovery-group=\"identity\"]{margin:0 6px 2px;padding:8px;border:1px solid rgba(159,214,255,.16);border-radius:10px;background:linear-gradient(90deg,rgba(159,214,255,.1),rgba(159,214,255,.03) 42%,transparent 78%);box-shadow:inset 2px 0 0 rgba(159,214,255,.45)}",
        ".ah-discovery-row{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto;column-gap:10px;row-gap:1px;align-items:center;min-height:44px;padding:6px 4px 6px 8px;border-radius:8px}",
        ".ah-discovery-row.is-unexplored{background:rgba(159,214,255,.03)}",
        ".ah-discovery-copy{grid-column:1;grid-row:1/3;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:1px}",
        ".ah-discovery-name{font-size:13px;font-weight:800;letter-spacing:.01em;color:#f2f6ff;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
        ".ah-discovery-line{font-size:11px;line-height:1.25;color:rgba(181,194,214,.78);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
        ".ah-discovery-state{grid-column:2;grid-row:2;justify-self:center;font-size:8px;font-weight:800;letter-spacing:.1em;white-space:nowrap;line-height:1;padding-top:1px}",
        ".ah-discovery-row.is-unexplored .ah-discovery-state{color:rgba(159,214,255,.88)}",
        ".ah-discovery-row.is-discovered .ah-discovery-state{color:rgba(186,208,230,.62)}",
        ".ah-discovery-go{grid-column:2;grid-row:1;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:84px;min-height:36px;height:36px;padding:0 10px 0 11px;border-radius:8px;font-size:10px;font-weight:800;letter-spacing:.08em;color:#dff5ff;cursor:pointer}",
        ".ah-discovery-go::before{content:\"\";position:absolute;inset:-4px}",
        ".ah-discovery-go::after{content:\"\";width:5px;height:5px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg);opacity:.8;margin-left:1px}",
        ".ah-discovery-row.is-unexplored .ah-discovery-go{border:1px solid rgba(159,214,255,.32);background:rgba(159,214,255,.1)}",
        ".ah-discovery-row.is-discovered .ah-discovery-go{border:1px solid rgba(220,232,249,.16);background:rgba(10,15,24,.4);color:rgba(223,235,248,.88)}",
        ".ah-discovery-go:active{transform:scale(.98)}",
        ".ah-discovery-go:disabled{opacity:.45;cursor:default}",
        ".ah-discovery-row.is-discovered{box-shadow:inset 0 0 0 1px rgba(159,214,255,.06)}",
        "[data-guide-status]{min-height:0;margin:0;padding:0 10px 8px;font-size:11px;color:#ffc9c9}",
        "[data-guide-status]:empty{display:none}",
        "@media (prefers-reduced-motion:reduce){.ah-discovery-shell>summary::before,.ah-discovery-go,.ah-discovery-intro-actions .ah-action{transition:none}}"
      ].join("");
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
