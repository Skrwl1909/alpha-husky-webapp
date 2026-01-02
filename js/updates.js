// Alpha Husky WebApp — Updates / What's New
// Backend endpoints:
//   POST /webapp/updates/state
//   POST /webapp/updates/ack { seenId }
// Usage:
//   window.Updates.init({ apiPost, tg, dbg, btnEl, dotEl })
//   window.Updates.open()

(function () {
  const S = {
    apiPost: null,
    tg: null,
    dbg: false,
    btnEl: null,
    dotEl: null,
    state: null,
    busy: false,
    modalBack: null,
  };

  const log = (...a) => S.dbg && console.log("[Updates]", ...a);

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function nl2br(s) {
    return esc(s).replaceAll("\n", "<br>");
  }

  function toast(msg) {
    if (typeof window.toast === "function") return window.toast(msg);
    try { S.tg?.showPopup?.({ message: msg }); } catch (_) {}
    console.log(msg);
  }

  function openLink(url) {
    if (!url) return;
    try {
      if (S.tg?.openLink) return S.tg.openLink(url);
    } catch (_) {}
    window.open(url, "_blank", "noopener");
  }

  function setDot(on) {
    if (!S.dotEl) return;
    S.dotEl.style.display = on ? "inline-block" : "none";
  }

  function pickLink(links, pred) {
    if (!Array.isArray(links)) return null;
    return links.find((x) => x && typeof x === "object" && pred(String(x.label || ""), String(x.url || ""))) || null;
  }

  function runTestAction(it) {
    // Optional future support: it.cta = {section:"forge|skins|adopt|fortress|quests"}
    const section = it?.cta?.section;
    if (section) {
      if (section === "forge" && window.Forge?.open) return window.Forge.open();
      if (section === "skins" && window.Skins?.open) return window.Skins.open();
      if (section === "adopt" && window.Adopt?.open) return window.Adopt.open();
      if (section === "fortress" && window.Fortress?.open) return window.Fortress.open();
      if (section === "quests" && window.Quests?.open) return window.Quests.open();
    }

    // Fallback #1: if you add a "Try it in-game" link in updates.json, we open that URL
    const test = pickLink(it?.links, (label) => /testuj/i.test(label));
    if (test?.url) return openLink(test.url);

    // Fallback #2: if you have a "WebApp (Dashboard)" link (you do), open it
    const webapp = pickLink(it?.links, (label) => /webapp|dashboard/i.test(label));
    if (webapp?.url) return openLink(webapp.url);

    toast("No test action defined for this update yet.");
  }

  async function api(path, body) {
    if (!S.apiPost) throw new Error("Updates: apiPost missing");
    return S.apiPost(path, body || {});
  }

  async function loadState() {
    const r = await api("/webapp/updates/state", {});
    if (!r?.ok) throw new Error(r?.reason || "updates_state_failed");
    return r.data || {};
  }

  function closeModal() {
    if (S.modalBack) S.modalBack.remove();
    S.modalBack = null;
  }

  function buildModal(st) {
    const back = document.createElement("div");
    back.style.cssText =
      "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.60);display:flex;align-items:center;justify-content:center;padding:16px;";

    const card = document.createElement("div");
    card.style.cssText =
      "width:min(900px,100%);max-height:85vh;overflow:auto;background:#0b0f14;" +
      "border:1px solid rgba(255,255,255,.10);border-radius:16px;box-shadow:0 25px 80px rgba(0,0,0,.55);padding:14px;";

    const head = document.createElement("div");
    head.style.cssText = "display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:6px 6px 10px;";
    head.innerHTML = `
      <div>
        <div style="font-weight:800;font-size:18px;">What’s New</div>
        <div style="opacity:.72;font-size:12px;margin-top:3px;">Latest devlogs & updates</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <button type="button" class="u-open-page" style="padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#fff;cursor:pointer;">Open devlog</button>
        <button type="button" class="u-close" style="padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#fff;cursor:pointer;">Close</button>
      </div>
    `;

    const list = document.createElement("div");
    list.style.cssText = "display:flex;flex-direction:column;gap:10px;padding:6px;";

    const items = Array.isArray(st.items) ? st.items : [];
    if (!items.length) {
      list.innerHTML = `<div style="opacity:.75;padding:14px;">No updates loaded (feed unavailable).</div>`;
    } else {
      for (const it of items) {
        const box = document.createElement("div");
        box.style.cssText =
          "border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.03);";

        const title = esc(it.title || "Update");
        const date = esc(it.date || "");
        const status = it.status ? ` • ${esc(it.status)}` : "";

        // Buttons: Test in game + links
        const hasLinks = Array.isArray(it.links) && it.links.length;

        box.innerHTML = `
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <div style="font-weight:800;">${title}</div>
              <div style="opacity:.68;font-size:12px;margin-top:2px;">${date}${status}</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
              <button type="button" class="u-test" data-id="${esc(it.id || "")}" style="padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#101a24;color:#fff;cursor:pointer;">try it in-game</button>
            </div>
          </div>

          <div style="margin-top:10px;line-height:1.35;opacity:.92;font-size:13px;">
            ${nl2br(it.text || "")}
          </div>

          ${hasLinks ? `
            <div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap;opacity:.9;font-size:12px;">
              ${it.links.map(l => `<a href="${esc(l.url || "#")}" data-link="${esc(l.url || "")}" style="color:#9bd1ff;text-decoration:none;">${esc(l.label || "Link")}</a>`).join("")}
            </div>` : ``}
        `;

        list.appendChild(box);
      }
    }

    const foot = document.createElement("div");
    foot.style.cssText = "display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 6px 4px;";
    foot.innerHTML = `
      <div style="opacity:.55;font-size:12px;">Feed: ${esc(st.feedUrl || "")}</div>
      <button type="button" class="u-mark" style="padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#fff;cursor:pointer;">Mark as read</button>
    `;

    card.appendChild(head);
    card.appendChild(list);
    card.appendChild(foot);
    back.appendChild(card);

    function markAsRead() {
      const latest = String(st.latestId || "");
      if (!latest) return;
      api("/webapp/updates/ack", { seenId: latest }).catch(() => {});
      setDot(false);
      closeModal();
    }

    back.addEventListener("click", (e) => {
      const t = e.target;

      if (t === back) return closeModal();

      if (t?.classList?.contains("u-close")) return closeModal();
      if (t?.classList?.contains("u-open-page")) return openLink(st.pageUrl);
      if (t?.classList?.contains("u-mark")) return markAsRead();

      const link = t?.getAttribute?.("data-link");
      if (link) { e.preventDefault(); return openLink(link); }

      if (t?.classList?.contains("u-test")) {
        const id = t.getAttribute("data-id");
        const it = items.find(x => String(x.id || "") === String(id || ""));
        if (it) runTestAction(it);
        return closeModal();
      }
    });

    return back;
  }

  async function refreshDot() {
    if (S.busy) return;
    S.busy = true;
    try {
      const st = await loadState();
      S.state = st;
      setDot(!!st.hasNew);
      return st;
    } catch (e) {
      log("refreshDot err", e);
      return null;
    } finally {
      S.busy = false;
    }
  }

  async function open() {
    try {
      const st = S.state || (await refreshDot()) || (await loadState());
      S.state = st;

      closeModal();
      S.modalBack = buildModal(st);
      document.body.appendChild(S.modalBack);

      // UX: opening modal counts as "seen" (you can remove this if you prefer manual mark)
      if (st.hasNew && st.latestId) {
        api("/webapp/updates/ack", { seenId: st.latestId }).catch(() => {});
        setDot(false);
      }
    } catch (e) {
      toast("Can't load updates right now.");
    }
  }

  function init({ apiPost, tg, dbg, btnEl, dotEl } = {}) {
    S.apiPost = apiPost || S.apiPost;
    S.tg = tg || S.tg;
    S.dbg = !!dbg;

    S.btnEl = btnEl || S.btnEl;
    S.dotEl = dotEl || S.dotEl;

    if (S.btnEl && !S.btnEl.__updatesBound) {
      S.btnEl.__updatesBound = true;
      S.btnEl.addEventListener("click", (e) => { e.preventDefault(); open(); });
    }

    refreshDot();
  }

  window.Updates = { init, open, refreshDot };
})();
