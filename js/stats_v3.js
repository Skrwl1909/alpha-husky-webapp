
(function(){
  "use strict";
  const KEYS=["strength","agility","defense","vitality","intelligence","luck"];
  const LABEL={strength:"STR",agility:"AGI",defense:"DEF",vitality:"VIT",intelligence:"INT",luck:"LUCK"};
  const clean=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const percent=(v)=>Math.min(100,Math.max(0,num(v)));
  let tab="overview",sheet="",notice="",scrollMemory={overview:0,build:0,legacy:0},onAction=null;
  const el=(s)=>document.querySelector(s);
  function buttonTab(which,label){return '<button type="button" role="tab" aria-selected="'+(tab===which)+'" data-s3-tab="'+which+'">'+label+'</button>';}
  function shell(content){
    const root=el("#statsRoot");if(!root)return;
    root.classList.add("ah-stats-v3");
    root.innerHTML='<div class="s3-shell"><nav role="tablist" aria-label="Character views" class="s3-tabs">'+buttonTab("overview","OVERVIEW")+buttonTab("build","BUILD")+buttonTab("legacy","LEGACY")+'</nav><div class="s3-body" role="tabpanel">'+(notice?'<div class="s3-notice" role="status">'+clean(notice)+'</div>':'')+content+'</div></div>';
  }
  function box(title,body){return '<section class="s3-box"><div class="s3-label">'+title+'</div>'+body+'</section>';}
  function bar(label,current,max,pct){return '<div class="s3-bar-row"><div><b>'+label+'</b><span>'+clean(current)+' / '+clean(max)+'</span></div><div class="s3-track"><i style="width:'+percent(pct)+'%"></i></div></div>';}
  function details(title,body){return '<button class="s3-more" type="button" data-s3-sheet="'+title+'">'+body+' <span>›</span></button>';}
  function attrRow(k,stats,points){
    const t=num(stats.totals?.[k]);return '<div class="s3-attribute"><button class="s3-attr-info" type="button" data-s3-sheet="'+k+'"><span>'+LABEL[k]+'</span><strong>'+clean(t)+'</strong><small>'+k+'</small></button><button type="button" class="s3-plus" data-s3-upgrade="'+k+'" aria-label="Add one '+k+'" '+(points<=0?'disabled':'')+'>+</button></div>';
  }
  function stage(stats,ctx){
    const hero=el("#player-skin"),img=hero?.currentSrc||hero?.getAttribute("src")||"";
    const name=el("#heroName")?.textContent?.trim()||"Alpha Husky";
    return '<div class="s3-stage">'+(img?'<img class="s3-portrait" src="'+clean(img)+'" alt="Equipped character skin" onerror="this.style.visibility=\'hidden\'">':'<span>Character skin syncing</span>')+'<div class="s3-stage-title"><strong>'+clean(name)+'</strong><b>LEVEL '+clean(num(stats.level,1))+'</b></div></div>';
  }
  function overview(stats,ctx){
    const goal=ctx.goal||{},sp=num(ctx.power?.signalPower),points=num(ctx.mystats?.unspentPoints),hp=stats.hp||{},xp=stats.xp||{},pet=stats.pet||{};
    const hpCur=num(hp.current,stats.hpCur),hpMax=num(hp.max,stats.hpMax),xpCur=num(xp.current_in_level,stats.xpCur),xpMax=num(xp.needed_for_next_level,stats.xpNeed);
    const combat=stats.statBreakdown?.snapshot?.display;
    const primary=combat?[["MAX HP",combat.maxHp],["ATTACK",combat.attack],["BASE REDUCTION",combat.baseDefenseReduction],["DODGE",combat.dodge]]:[];
    return stage(stats,ctx)+'<div class="s3-power"><span>SIGNAL POWER</span><strong>'+clean(sp)+'</strong><button data-s3-tab="build" type="button">'+points+' POINTS READY ›</button></div>'+
      box("NEXT REAL STEP",'<h3>'+clean(goal.nextThreshold?.label||"Progression syncing")+'</h3><p>'+(num(goal.missingPower)>0?'Missing '+clean(num(goal.missingPower))+' Signal Power · ':'')+clean(goal.bestMove||"")+'</p>')+
      '<div class="s3-bars">'+bar("HP",hpCur,hpMax,hp.pct??stats.hpPct??(hpMax?100*hpCur/hpMax:0))+bar("XP",xpCur,xpMax,xp.pct??stats.xpPct??(xpMax?100*xpCur/xpMax:0))+(pet.name&&pet.name!=="None"?bar("PET",num(pet.current,pet.xpCur),num(pet.max,pet.xpNeed),pet.pct??stats.petPct):'')+'</div>'+
      box("COMBAT SNAPSHOT",'<div class="s3-combat">'+primary.map(([k,v])=>'<div><span>'+k+'</span><strong>'+clean(v)+'</strong></div>').join('')+'</div>'+(primary.length?'':'<p>Combat data syncing.</p>')+details("combat","All Combat Stats"));
  }
  function build(stats,ctx){
    const points=num(ctx.mystats?.unspentPoints),training=stats.statTraining||{},rank=num(training.rank);
    const resources=training.nextCost&&typeof training.nextCost==="object"?Object.entries(training.nextCost).map(([k,v])=>clean(k)+": "+clean(v)).join(" · "):"";
    const balances=training.balances&&typeof training.balances==="object"?Object.entries(training.balances).map(([k,v])=>clean(k)+": "+clean(v)).join(" · "):"";
    return '<div class="s3-build-title"><span>AVAILABLE STAT POINTS</span><strong>'+points+'</strong></div><div class="s3-attributes">'+KEYS.map(k=>attrRow(k,stats,points)).join('')+'</div>'+
    box("STAT TRAINING",'<h3>Rank '+rank+' / 10</h3><p>Training grants one unspent point. Spending that point is a separate action.</p>'+(resources?'<p>Next cost: '+resources+'</p>':'')+(balances?'<p>Balances: '+balances+'</p>':'')+
      '<button type="button" class="s3-primary" data-s3-training '+(!training.canPurchase?'disabled':'')+'>'+(training.maxed?'MAX TRAINING':!training.enabled?'TRAINING OFFLINE':training.canPurchase?'PURCHASE TRAINING':'TRAINING LOCKED')+'</button>')+
      details("equipment","Equipment · Pet · Active Sets")+details("attributes","Attribute details");
  }
  function legacy(stats,ctx){
    const ms=ctx.progression?.signalMilestones?.milestones||[],focus=ms.find(m=>m.status==="claimable")||ms.find(m=>m.status==="locked"),wall=ctx.progression?.moonlabWall;
    return '<div class="s3-power s3-legacy-power"><span>RECORDED SIGNAL POWER</span><strong>'+clean(num(ctx.power?.signalPower))+'</strong></div>'+
    box("NEXT MILESTONE",focus?'<h3>'+clean(focus.shortLabel||focus.name)+'</h3><p>'+(focus.status==="claimable"?'Ready to claim':clean(num(focus.missingPower))+' Signal Power remaining')+'</p>'+(focus.status==="claimable"?'<button class="s3-primary" data-s3-claim="'+clean(focus.id)+'">Claim Milestone</button>':''):'<h3>'+clean(ctx.goal?.nextThreshold?.label||"Progression syncing")+'</h3>')+
    box("MOON LAB BEST WALL",wall?.available?'<h3>Floor '+clean(num(wall.bestFloor??wall.highestClearedFloor))+'</h3><p>Current floor '+clean(num(wall.currentFloor))+' · Sector '+clean(num(wall.sector))+'</p>':'<p>Moon Lab progress syncing.</p>')+
    details("milestones","Full Milestone Record");
  }
  function showSheet(name,stats,ctx){
    const root=el("#statsRoot");if(!root)return;
    const old=root.querySelector(".s3-sheet-back");old?.remove();
    if(!name)return;
    let body="";
    if(name==="combat")body=ctx.original.combat();
    else if(name==="milestones")body=ctx.original.milestones()+ctx.original.moonlab()+ctx.original.signal();
    else if(name==="sync")body=ctx.original.sync();
    else if(name==="equipment"){
      const gear=stats.gear||{},pet=stats.pet||{},sets=Array.isArray(stats.sets)?stats.sets:[];
      body='<h3>Equipment</h3>'+KEYS.map(k=>num(gear[k])?'<p>'+LABEL[k]+' '+clean(gear[k])+'</p>':'').join('')+'<h3>Active companion</h3><p>'+clean(pet.label||pet.name||"None")+'</p><h3>Sets</h3>'+(sets.length?sets.map(x=>'<p>'+clean(Array.isArray(x)?x[0]:x.name)+'</p>').join(''):'<p>No active sets.</p>');
    } else {
      const chosen=name==="attributes"?KEYS:[name];
      body=chosen.map(k=>{const info=stats.statBreakdown?.stats?.[k]||{};return '<section class="s3-sheet-stat"><h3>'+LABEL[k]+' · '+clean(num(stats.totals?.[k]))+'</h3><p>Base '+clean(num(stats.base?.[k]))+' · Pet '+clean(num(stats.petStats?.[k]))+' · Gear '+clean(num(stats.gear?.[k]))+'</p>'+(info.description?'<p>'+clean(info.description)+'</p>':'')+(info.currentEffect?'<p>Current: '+clean(info.currentEffect)+'</p>':'')+(info.nextPointEffect?'<p>Next point: '+clean(info.nextPointEffect)+'</p>':'')+'</section>';}).join('');
    }
    root.insertAdjacentHTML("beforeend",'<div class="s3-sheet-back"><section class="s3-sheet" role="dialog" aria-modal="true" aria-label="Character details"><div class="s3-sheet-head"><b>'+clean(name.toUpperCase())+'</b><button type="button" data-s3-close aria-label="Close details">✕</button></div><div class="s3-sheet-body">'+body+'</div></section></div>');
    root.querySelector("[data-s3-close]")?.focus();
  }
  function render(stats,ctx){
    const area=el(".s3-body");if(area)scrollMemory[tab]=area.scrollTop;
    shell(tab==="overview"?overview(stats,ctx):tab==="build"?build(stats,ctx):legacy(stats,ctx));
    const next=el(".s3-body");if(next)next.scrollTop=scrollMemory[tab]||0;
    if(sheet)showSheet(sheet,stats,ctx);
  }
  function handle(e,stats,ctx){
    const target=e.target?.nodeType===1?e.target:e.target?.parentElement;if(!target)return false;
    const close=target.closest("[data-s3-close]");
    if(close){e.preventDefault();sheet="";render(stats,ctx);return true;}
    const tabBtn=target.closest("[data-s3-tab]");
    if(tabBtn){e.preventDefault();tab=tabBtn.dataset.s3Tab;sheet="";render(stats,ctx);return true;}
    const sheetBtn=target.closest("[data-s3-sheet]");
    if(sheetBtn){e.preventDefault();sheet=sheetBtn.dataset.s3Sheet;showSheet(sheet,stats,ctx);return true;}
    const plus=target.closest("[data-s3-upgrade]");
    if(plus){e.preventDefault();e.stopPropagation();if(!plus.disabled)onAction?.("upgrade",plus.dataset.s3Upgrade);return true;}
    const training=target.closest("[data-s3-training]");
    if(training){e.preventDefault();if(!training.disabled)onAction?.("training");return true;}
    const claim=target.closest("[data-s3-claim]");
    if(claim){e.preventDefault();onAction?.("claim",claim.dataset.s3Claim);return true;}
    return false;
  }
  function reset(){tab="overview";sheet="";notice="";scrollMemory={overview:0,build:0,legacy:0};}
  function feedback(message){notice=String(message||"");}
  window.AlphaStats3={render,handle,reset,feedback,onAction(fn){onAction=fn;}};
})();
