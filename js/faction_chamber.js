// js/faction_chamber.js — Faction Identity & Initiation V1
(function(global){
 let apiPost=null,tg=null,root=null,active="",holdTimer=0,holdStart=0,holdRAF=0,busy=false;
 const seenKey="ah_faction_chamber_reveal_v1";
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const meta=k=>global.FactionIdentity?.get?.(k);
 const SCENES=Object.freeze({
  neutral:"/images/factions/faction_chamber_neutral.webp",
  ih:"/images/factions/faction_chamber_inner_howl.webp",
  rb:"/images/factions/faction_chamber_rogue_byte.webp",
  ew:"/images/factions/faction_chamber_echo_wardens.webp",
  pb:"/images/factions/faction_chamber_pack_burners.webp"
 });
 function haptic(kind="light"){try{ if(kind==="success")tg?.HapticFeedback?.notificationOccurred?.("success"); else tg?.HapticFeedback?.impactOccurred?.(kind);}catch(_){}}
 function ensure(){
  if(root&&document.body.contains(root))return root;
  root=document.createElement("div");root.id="factionChamber";root.setAttribute("aria-hidden","true");
  root.innerHTML='<div class="fc-scene"><div class="fc-architecture"></div><div class="fc-beam"></div><div class="fc-core"></div><div class="fc-fog"></div><div class="fc-signals"></div></div><div class="fc-ui"><div class="fc-top"><div class="fc-kicker">FACTION SIGNAL</div><button class="fc-close" aria-label="Close">×</button></div><div class="fc-bottom"></div></div>';
  document.body.appendChild(root);root.querySelector(".fc-close").onclick=close;
  root.querySelector(".fc-signals").onclick=e=>{const b=e.target.closest("[data-key]");if(b)select(b.dataset.key)};
  return root;
 }
 function renderSignals(){const host=root.querySelector(".fc-signals");host.innerHTML=global.FactionIdentity.all.map(f=>'<button class="fc-signal '+(active===f.key?"is-active":"")+'" data-key="'+f.key+'" aria-label="'+esc(f.name)+'"><img src="'+esc(f.icon80)+'" alt=""></button>').join("");}
 function render(){
  ensure(); const f=meta(active); const sceneKey=f?.key||"neutral";
  root.style.setProperty("--fc-accent",f?.rgb||"145,225,255");
  root.style.setProperty("--fc-scene-image",'url("'+(SCENES[sceneKey]||SCENES.neutral)+'")');
  root.dataset.faction=sceneKey;
  root.classList.toggle("fc-neutral",!f);
  renderSignals();
  const bottom=root.querySelector(".fc-bottom");
  if(!f){bottom.innerHTML='<div class="fc-title">EXPLORE THE SIGNALS</div><div class="fc-copy">One Pack. Four answers. No choice is required yet.</div><div class="fc-traits">TAP A SIGNAL TO ENTER ITS FREQUENCY</div>';return;}
  bottom.innerHTML='<div class="fc-title">'+esc(f.name)+'</div><div class="fc-creed">'+esc(f.creed)+'</div><div class="fc-copy">'+esc(f.doctrine)+'</div><div class="fc-traits">'+f.traits.map(esc).join(" · ")+'</div><div class="fc-actions"><button class="fc-btn" data-back>BACK TO CHAMBER</button><button class="fc-btn primary fc-hold" data-bind><i class="fc-hold-fill"></i><span>HOLD TO BIND</span></button></div>';
  bottom.querySelector("[data-back]").onclick=()=>{
    root?.classList.add("fc-switching");
    setTimeout(()=>{active="";render();requestAnimationFrame(()=>root?.classList.remove("fc-switching"));},110);
  };
  const bind=bottom.querySelector("[data-bind]");["pointerdown","touchstart"].forEach(ev=>bind.addEventListener(ev,startHold,{passive:false}));["pointerup","pointercancel","pointerleave","touchend","touchcancel"].forEach(ev=>bind.addEventListener(ev,cancelHold,{passive:false}));
 }
 function select(k){
  if(busy)return;
  const next=global.FactionIdentity.normalize(k);
  if(!next||next===active)return;
  haptic("light");
  root?.classList.add("fc-switching");
  setTimeout(()=>{
    active=next;
    render();
    requestAnimationFrame(()=>root?.classList.remove("fc-switching"));
  },110);
 }
 function startHold(e){if(e.cancelable)e.preventDefault();if(busy||!active||holdTimer)return;holdStart=performance.now();const btn=e.currentTarget;const tick=now=>{const p=Math.min(1,(now-holdStart)/1050);btn.style.setProperty("--hold",Math.round(p*100)+"%");if(p>=1){holdTimer=0;holdRAF=0;void bind();return;}holdRAF=requestAnimationFrame(tick)};holdTimer=1;holdRAF=requestAnimationFrame(tick);}
 function cancelHold(e){if(e?.cancelable)e.preventDefault();if(holdRAF)cancelAnimationFrame(holdRAF);holdRAF=0;holdTimer=0;e?.currentTarget?.style?.setProperty("--hold","0%");}
 async function bind(){const f=meta(active);if(!f||busy)return;busy=true;const btn=root.querySelector("[data-bind]");if(btn){btn.disabled=true;btn.querySelector("span").textContent="BINDING SIGNAL...";}
  try{if(typeof apiPost!=="function")throw new Error("API_NOT_READY");const run_id="faction:"+Date.now()+":"+Math.random().toString(16).slice(2);const res=await apiPost("/webapp/faction/join",{faction:f.slug,faction_key:f.key,factionSlug:f.slug,run_id});if(!(res&&(res.ok===true||res.success===true||res.data?.ok===true)))throw new Error(res?.reason||res?.data?.reason||"JOIN_FAILED");
   try{localStorage.setItem("ah_faction",f.key)}catch(_){}
   if(global.PLAYER_STATE?.profile)global.PLAYER_STATE.profile.faction=f.key;if(global.PROFILE)global.PROFILE.faction=f.key;
   haptic("success");bottomBound(f);setTimeout(()=>{close();global.FactionHQ?.open?.();},900);
  }catch(err){busy=false;if(btn){btn.disabled=false;btn.querySelector("span").textContent="HOLD TO BIND";btn.style.setProperty("--hold","0%");}alert("Signal bind failed: "+(err?.message||"unknown"));}
 }
 function bottomBound(f){const bottom=root.querySelector(".fc-bottom");bottom.innerHTML='<div class="fc-creed">SIGNAL BOUND</div><div class="fc-title">WELCOME TO '+esc(f.name)+'</div><div class="fc-copy">Your signal is recognized. Entering your HQ.</div>';}
 function open(){ensure();active="";busy=false;root.classList.add("is-open");root.setAttribute("aria-hidden","false");document.documentElement.classList.add("ah-modal-open");render();let seen=false;try{seen=localStorage.getItem(seenKey)==="1";localStorage.setItem(seenKey,"1")}catch(_){}if(!seen){const r=document.createElement("div");r.className="fc-reveal";r.innerHTML="<div><small>PACK SIGNAL DETECTED</small><strong>ONE WOUND.<br>FOUR ANSWERS.</strong></div>";root.appendChild(r);setTimeout(()=>r.remove(),3600);}return true;}
 function close(){cancelHold();root?.classList.remove("is-open");root?.setAttribute("aria-hidden","true");if(!document.querySelector(".is-open"))document.documentElement.classList.remove("ah-modal-open");}
 function init(opts={}){apiPost=opts.apiPost||apiPost;tg=opts.tg||tg||global.Telegram?.WebApp||null;}
 global.FactionChamber={init,open,close,select};
})(window);
