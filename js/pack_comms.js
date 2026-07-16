// Alpha Husky Pack Comms Lite v0.1 — a small authenticated bridge to Pack Chat.
(function (global) {
  "use strict";

  const STATE_PATH = "/webapp/pack-comms/state";
  const SEND_PATH = "/webapp/pack-comms/send";
  const FALLBACK_POLL_MS = 15000;
  const MAX_TEXT = 200;
  const S = {
    root: null, open: false, enabled: false, sendEnabled: false, loading: false,
    stateInFlight: null, sending: false, pollTimer: null, messages: [], fullChatUrl: "",
    pollAfterMs: FALLBACK_POLL_MS, requestId: "", requestText: "", stateSeq: 0,
    visibilityBound: false, escapeBound: false, unavailable: false,
  };

  function apiPost() {
    const fn = global.apiPost || global.S?.apiPost || global.AH?.apiPost;
    return typeof fn === "function" ? fn : null;
  }

  function text(value) { return String(value ?? "").trim(); }
  function isVisible() { return document.visibilityState !== "hidden"; }
  function validUrl(value) { return /^https:\/\/t\.me\//i.test(text(value)); }
  function pollMs(value) {
    const seconds = Number(value);
    return Number.isFinite(seconds) && seconds >= 5 && seconds <= 120 ? Math.round(seconds * 1000) : FALLBACK_POLL_MS;
  }
  function requestId() {
    try { if (global.crypto?.randomUUID) return global.crypto.randomUUID(); } catch (_) {}
    return "pc:" + Date.now() + ":" + Math.random().toString(36).slice(2, 10);
  }
  function safeError(result) {
    const code = text(result?.code || result?.reason).toUpperCase();
    const known = {
      PACK_COMMS_RATE_LIMIT: "Wait a moment before sending again.",
      PACK_COMMS_REQUEST_IN_PROGRESS: "This message is already being sent.",
      TELEGRAM_SEND_FAILED: "Message could not be sent. Try again.",
      PACK_COMMS_SEND_DISABLED: "Pack Comms is read-only right now.",
      PACK_COMMS_DISABLED: "Pack Comms is currently unavailable.",
      PACK_COMMS_INVALID_TEXT: "Enter a message up to 200 characters.",
      PACK_COMMS_UNAVAILABLE: "Pack Comms is temporarily unavailable.",
      AUTH_FAILED: "Session expired. Reopen Alpha Husky.",
      NO_USER: "Session expired. Reopen Alpha Husky.",
    };
    return known[code] || text(result?.error) || "Pack Comms is temporarily unavailable.";
  }

  function ensureStyles() {
    if (document.getElementById("pack-comms-styles")) return;
    const style = document.createElement("style");
    style.id = "pack-comms-styles";
    style.textContent = `
.pack-comms-root{position:fixed;inset:0;z-index:12000;display:flex;align-items:flex-end;background:rgba(0,0,0,.58);font-family:inherit;color:#eef8ff}
.pack-comms-root *{box-sizing:border-box}.pack-comms-sheet{width:100%;height:min(76vh,760px);display:flex;flex-direction:column;background:linear-gradient(180deg,#111a23,#080d13);border:1px solid rgba(105,213,255,.34);border-bottom:0;border-radius:20px 20px 0 0;box-shadow:0 -20px 60px rgba(0,0,0,.55);padding-bottom:max(12px,calc(env(safe-area-inset-bottom,0px) + 8px))}
.pack-comms-head{flex:0 0 auto;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 16px 12px;border-bottom:1px solid rgba(146,224,255,.14)}.pack-comms-title{margin:0;font-size:17px;letter-spacing:.08em}.pack-comms-subtitle{margin:4px 0 0;color:#91a9b8;font-size:12px}.pack-comms-close{width:44px;height:44px;border:1px solid rgba(146,224,255,.28);border-radius:12px;background:rgba(255,255,255,.04);color:#eaf9ff;font-size:20px;cursor:pointer}.pack-comms-close:focus-visible,.pack-comms-send:focus-visible,.pack-comms-full:focus-visible{outline:2px solid #67dfff;outline-offset:2px}
.pack-comms-status{min-height:20px;padding:8px 16px 0;color:#9edaf1;font-size:12px}.pack-comms-status[hidden]{display:none}.pack-comms-list{flex:1 1 auto;min-height:0;overflow-y:auto;padding:12px 16px 16px;overscroll-behavior:contain}.pack-comms-empty{padding:28px 8px;color:#a4b5c0;line-height:1.45;text-align:center}.pack-comms-message{padding:9px 0;border-bottom:1px solid rgba(255,255,255,.07)}.pack-comms-message:last-child{border-bottom:0}.pack-comms-meta{display:flex;align-items:center;gap:7px;min-width:0;color:#bcd3df;font-size:12px}.pack-comms-pill{flex:0 0 auto;border:1px solid rgba(98,218,255,.35);border-radius:999px;padding:2px 6px;color:#79ddff;font-size:10px;font-weight:800;letter-spacing:.05em}.pack-comms-pill.game{border-color:rgba(255,190,94,.35);color:#ffd08b}.pack-comms-author{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}.pack-comms-time{margin-left:auto;color:#748895;font-variant-numeric:tabular-nums}.pack-comms-text{padding:5px 0 0;color:#eef5f8;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px;line-height:1.4}
.pack-comms-foot{flex:0 0 auto;padding:10px 16px 0;border-top:1px solid rgba(146,224,255,.14)}.pack-comms-readonly{margin:0 0 8px;color:#9eb3be;font-size:12px}.pack-comms-composer{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end}.pack-comms-input{width:100%;min-height:44px;max-height:92px;resize:vertical;border:1px solid rgba(117,215,255,.28);border-radius:12px;background:rgba(0,0,0,.23);color:#effaff;padding:10px;font:inherit;font-size:14px}.pack-comms-input::placeholder{color:#75909d}.pack-comms-send{min-width:58px;min-height:44px;border:1px solid rgba(92,215,255,.45);border-radius:12px;background:rgba(41,151,188,.24);color:#e9fbff;font-weight:800;cursor:pointer}.pack-comms-send:disabled{opacity:.5;cursor:not-allowed}.pack-comms-count{grid-column:1 / -1;margin:-2px 2px 0;color:#78909d;font-size:11px;text-align:right}.pack-comms-error{min-height:18px;margin:6px 0 0;color:#ffb2a6;font-size:12px}.pack-comms-full{width:100%;min-height:44px;margin-top:9px;border:1px solid rgba(146,224,255,.3);border-radius:12px;background:rgba(255,255,255,.045);color:#dff8ff;font:inherit;font-size:13px;font-weight:700;cursor:pointer}.pack-comms-full:disabled{opacity:.45;cursor:not-allowed}
@media (min-width:700px){.pack-comms-root{align-items:center;justify-content:flex-end;padding:24px}.pack-comms-sheet{width:min(448px,100%);height:min(80vh,720px);border:1px solid rgba(105,213,255,.34);border-radius:18px;padding-bottom:12px}}`;
    document.head.appendChild(style);
  }

  function buildPanel() {
    ensureStyles();
    const root = document.createElement("section");
    root.className = "pack-comms-root";
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-label", "Pack Comms");
    root.innerHTML = '<div class="pack-comms-sheet"><header class="pack-comms-head"><div><h2 class="pack-comms-title">PACK COMMS</h2><p class="pack-comms-subtitle">Synced with Pack Chat</p></div><button class="pack-comms-close" type="button" aria-label="Close Pack Comms">×</button></header><div class="pack-comms-status" hidden></div><div class="pack-comms-list" aria-live="polite"></div><footer class="pack-comms-foot"><p class="pack-comms-readonly" hidden>Pack Comms is read-only right now.</p><div class="pack-comms-composer"><textarea class="pack-comms-input" maxlength="200" rows="1" aria-label="Send to Pack Chat" placeholder="Send to Pack Chat…"></textarea><button class="pack-comms-send" type="button">Send</button><div class="pack-comms-count">0 / 200</div></div><div class="pack-comms-error" aria-live="polite"></div><button class="pack-comms-full" type="button">Open full Pack Chat</button></footer></div>';
    root.addEventListener("click", (event) => { if (event.target === root) close(); });
    root.querySelector(".pack-comms-close").addEventListener("click", close);
    root.querySelector(".pack-comms-full").addEventListener("click", openFullChat);
    root.querySelector(".pack-comms-input").addEventListener("input", onInput);
    root.querySelector(".pack-comms-send").addEventListener("click", send);
    return root;
  }

  function refs() { return S.root ? { list:S.root.querySelector(".pack-comms-list"), status:S.root.querySelector(".pack-comms-status"), input:S.root.querySelector(".pack-comms-input"), send:S.root.querySelector(".pack-comms-send"), count:S.root.querySelector(".pack-comms-count"), error:S.root.querySelector(".pack-comms-error"), composer:S.root.querySelector(".pack-comms-composer"), readonly:S.root.querySelector(".pack-comms-readonly"), full:S.root.querySelector(".pack-comms-full") } : {}; }
  function status(message) { const el=refs().status; if (!el) return; el.textContent=text(message); el.hidden=!text(message); }
  function error(message) { const el=refs().error; if (el) el.textContent=text(message); }
  function lockBody() { if (!document.body) return; document.body.dataset.packCommsOverflow=document.body.style.overflow || ""; document.body.style.overflow="hidden"; }
  function unlockBody() { if (!document.body) return; document.body.style.overflow=document.body.dataset.packCommsOverflow || ""; delete document.body.dataset.packCommsOverflow; }

  function formatTime(value) { const ts=Number(value); if (!Number.isFinite(ts) || ts<=0) return ""; try { return new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(ts*1000)); } catch (_) { return ""; } }
  function normalizedRows(rows) { const seen=new Set(), out=[]; for (const raw of Array.isArray(rows)?rows:[]) { const id=text(raw?.id); const body=String(raw?.text??""); if (!id || !text(body) || seen.has(id)) continue; seen.add(id); out.push({id,source:text(raw?.source).toLowerCase(),author:text(raw?.authorName)||"Pack member",body,createdAt:Number(raw?.createdAt)||0}); } return out.slice(-30); }
  function renderMessages(forceBottom) {
    const {list}=refs(); if (!list) return;
    const nearBottom=list.scrollHeight-list.scrollTop-list.clientHeight<48;
    list.textContent="";
    if (!S.messages.length) { const empty=document.createElement("div"); empty.className="pack-comms-empty"; empty.textContent=S.sendEnabled ? "The Pack is quiet right now.\nStart the conversation or open the full Pack Chat." : "The Pack is quiet right now.\nOpen the full Pack Chat or check back soon."; list.appendChild(empty); return; }
    for (const row of S.messages) { const item=document.createElement("article"), meta=document.createElement("div"), pill=document.createElement("span"), author=document.createElement("span"), time=document.createElement("time"), body=document.createElement("div"); item.className="pack-comms-message"; meta.className="pack-comms-meta"; pill.className="pack-comms-pill"; const source=row.source==="telegram"?"TG":row.source==="game"?"GAME":"PACK"; pill.textContent=source; if(source==="GAME")pill.classList.add("game"); author.className="pack-comms-author"; author.textContent=row.author; time.className="pack-comms-time"; time.textContent=formatTime(row.createdAt); body.className="pack-comms-text"; body.textContent=row.body; meta.append(pill,author,time); item.append(meta,body); list.appendChild(item); }
    if (forceBottom || nearBottom) requestAnimationFrame(()=>{ if(S.open) list.scrollTop=list.scrollHeight; });
  }
  function render() { const r=refs(); if(!r.list)return; r.composer.hidden=!S.sendEnabled; r.readonly.hidden=!!S.sendEnabled; r.full.disabled=!validUrl(S.fullChatUrl); renderMessages(false); onInput(); }
  function mergeState(payload, forceBottom) { S.enabled=payload?.enabled===true; S.sendEnabled=S.enabled&&payload?.sendEnabled===true; S.fullChatUrl=text(payload?.fullChatUrl)||S.fullChatUrl; S.pollAfterMs=pollMs(payload?.pollAfterSec); S.messages=normalizedRows(payload?.messages); S.unavailable=false; status(""); render(); if(forceBottom) renderMessages(true); }
  function schedulePoll(delay) { clearPoll(); if(!S.open||!S.enabled||!isVisible())return; S.pollTimer=setTimeout(()=>{S.pollTimer=null; refreshState("poll");},Math.max(0,delay)); }
  function clearPoll(){if(S.pollTimer){clearTimeout(S.pollTimer);S.pollTimer=null;}}

  async function refreshState(kind) {
    if(!S.open||S.stateInFlight)return S.stateInFlight;
    const api=apiPost(); if(!api) throw new Error("apiPost unavailable");
    const token=++S.stateSeq;
    S.stateInFlight=(async()=>{try{const payload=await api(STATE_PATH,{});if(!S.open||token!==S.stateSeq)return payload;if(!payload?.ok)throw payload||{};if(payload.enabled!==true){S.fullChatUrl=text(payload.fullChatUrl)||S.fullChatUrl;S.enabled=false;S.sendEnabled=false;render();return payload;}mergeState(payload,kind==="initial");return payload;}catch(err){if(S.open&&token===S.stateSeq){S.unavailable=true;status("Pack Comms is temporarily unavailable.");if(kind!=="initial")schedulePoll(Math.max(60000,S.pollAfterMs));}throw err;}finally{if(token===S.stateSeq)S.stateInFlight=null;}})();
    try { const result=await S.stateInFlight; if(S.open&&S.enabled&&kind!=="initial")schedulePoll(S.pollAfterMs); return result; } finally {}
  }
  function openFullChat(){const url=S.fullChatUrl;if(!validUrl(url))return;try{global.Telegram?.WebApp?.openTelegramLink?.(url);return;}catch(_){}try{global.AHOpenCommunityLink?.(url);return;}catch(_){}try{global.open(url,"_blank","noopener,noreferrer");}catch(_){global.location.href=url;}}
  async function openFromLauncher(){if(S.open||S.loading)return;S.loading=true;S.open=true;S.root=buildPanel();document.body.appendChild(S.root);lockBody();bindLifecycle();status("Loading Pack Comms…");try{const payload=await refreshState("initial");if(payload?.enabled===true){schedulePoll(S.pollAfterMs);try{global.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.("light");}catch(_){}}else{const rawUrl=text(payload?.fullChatUrl)||S.fullChatUrl;close();global.AHOpenCommunityLink?.(validUrl(rawUrl)?rawUrl:"");}}catch(_){close();global.AHOpenCommunityLink?.();}finally{S.loading=false;}}
  function onInput(){const r=refs();if(!r.input)return;const value=r.input.value||"";r.count.textContent=value.length+" / "+MAX_TEXT;if(S.requestId&&text(value)!==S.requestText){S.requestId="";S.requestText="";}r.send.disabled=S.sending||!S.sendEnabled||!text(value)||value.length>MAX_TEXT;}
  async function send(){const r=refs();if(!S.open||S.sending||!S.sendEnabled||!r.input)return;const raw=r.input.value||"", body=text(raw);if(!body||body.length>MAX_TEXT){error("Enter a message up to 200 characters.");return;}if(!S.requestId){S.requestId=requestId();S.requestText=body;}S.sending=true;error("");onInput();try{const result=await apiPost()(SEND_PATH,{text:body,requestId:S.requestId});if(!result?.ok)throw result||{};const row=normalizedRows([result.message])[0];if(row&&!S.messages.some((x)=>x.id===row.id))S.messages.push(row);S.messages=S.messages.slice(-30);r.input.value="";S.requestId="";S.requestText="";error("");renderMessages(true);onInput();}catch(result){error(safeError(result));}finally{S.sending=false;onInput();}}
  function onVisibility(){if(!S.open)return;if(isVisible()){refreshState("visible").catch(()=>{});}else{clearPoll();}}
  function onEscape(event){if(event.key==="Escape"&&S.open)close();}
  function bindLifecycle(){if(!S.visibilityBound){document.addEventListener("visibilitychange",onVisibility);S.visibilityBound=true;}if(!S.escapeBound){document.addEventListener("keydown",onEscape);S.escapeBound=true;}}
  function close(){if(!S.open&&!S.root)return;S.open=false;S.enabled=false;S.sending=false;S.stateSeq++;clearPoll();S.root?.remove();S.root=null;unlockBody();if(S.visibilityBound){document.removeEventListener("visibilitychange",onVisibility);S.visibilityBound=false;}if(S.escapeBound){document.removeEventListener("keydown",onEscape);S.escapeBound=false;}}
  function init(){const btn=document.getElementById("ahCommunityBtn");if(btn){btn.setAttribute("aria-label","Open Pack Comms");btn.dataset.packCommsLauncher="1";}return API;}
  const API={init,openFromLauncher,close};global.PackComms=API;if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})(window);
