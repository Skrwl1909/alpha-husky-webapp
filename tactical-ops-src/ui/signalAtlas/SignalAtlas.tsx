import { growthPreviewBase, savedGrowthHero, DOCTRINE_TRADEOFF } from "../../data/buildPreview";
import { canSelectLungeDoctrine, canonicalGrowthSkillId, resolveGrowthSkill, WIDE_LUNGE, type LungeDoctrine } from "../../data/playerGrowth";
import { skillEffectView } from "../skillEffectView";
import { useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { SIGNAL_ATLAS_ASSETS } from "./signalAtlasAssets";
import { useBattleStore } from "../../store/battleStore";
import { HERO_PATHS, HERO_SKILLS, type Discipline, type HeroId } from "../../data/playerGrowth";
import { getSkill } from "../../data/skills";
import { UNIT_DEFS } from "../../data/units";
import { tacticalActionImageForSkill } from "../tacticalActionIcons";
import { tacticalEmblemFor } from "../tacticalEmblems";
import { portraitFallback } from "../PlayerIdentity";
import { ATLAS_SECTORS, HERO_TITLES, HERO_SUBTITLES, PATH_EXPLANATIONS, getNodeView, hasActiveGrowthRun, atlasSectorPosition, type AtlasSector, type availableAtlasUpgrade } from "./model";

type Feedback = { kind: "success" | "error"; text: string } | null;
type Selection = { skillId: string; rank: 0|1|2 };
// Hide decorative failures; retain text, native borders and the existing portrait fallback.
function hideArt(event: SyntheticEvent<HTMLImageElement>) { event.currentTarget.hidden = true; }
function atlasPortraitFallback(event: SyntheticEvent<HTMLImageElement>) {
  if (event.currentTarget.dataset.fallback) { hideArt(event); return; }
  event.currentTarget.dataset.fallback = "1"; portraitFallback(event);
}
const atlasArt = Object.fromEntries(Object.entries(SIGNAL_ATLAS_ASSETS).map(([key,src])=>[`--tsa-${key}`,`url("${src}")`])) as CSSProperties;
const RESERVES = [
  {id:"future-a", title:"FUTURE 01",x:14,y:62},
  {id:"future-b", title:"FUTURE 02",x:86,y:62},
  {id:"future-c", title:"FUTURE 03",x:14,y:86},
  {id:"future-d", title:"FUTURE 04",x:86,y:86},
];

/** A schematic, not a second combat simulator. Geometry follows the resolved skill. */
function DoctrineFootprint({ wide, centered, range }: { wide: boolean; centered: boolean; range: number }) {
  return <div className={`tsa-footprint ${wide ? "is-wide" : "is-heavy"}`} aria-hidden="true">
    {Array.from({ length: 25 }, (_, index) => {
      const x = index % 5, y = Math.floor(index / 5);
      const player = centered ? x === 2 && y === 2 : x === 0 && y === 2;
      const aimX = centered ? 2 : wide ? 1 : Math.min(3, Math.max(1, range));
      const aimY = 2;
      const affected = wide && Math.max(Math.abs(x - aimX), Math.abs(y - aimY)) <= 1 && !player;
      const target = !centered && x === aimX && y === aimY;
      const enemy = target || wide && (centered ? (x === 3 && y === 1 || x === 1 && y === 3) : x === 2 && y === 1);
      const route = !wide && y === 2 && x > 0 && x < aimX;
      return <span key={index} className={`tsa-footprint-tile${affected ? " is-affected" : ""}${route ? " is-route" : ""}${player ? " is-player" : ""}${enemy ? " is-enemy" : ""}${target ? " is-target" : ""}`}>
        {player ? "◆" : enemy ? "✕" : route ? "›" : ""}
      </span>;
    })}
  </div>;
}

export function SignalAtlas({ onClose, target }: { onClose: () => void; target?: ReturnType<typeof availableAtlasUpgrade> }) {
  const progression = useBattleStore(s=>s.progression);
  const growth = progression?.playerGrowth;
  const progressionPending = useBattleStore(s=>s.progressionCommitPending);
  const progressionError = useBattleStore(s=>s.progressionError);
  const upgrade = useBattleStore(s=>s.upgradeGrowth);
  const respec = useBattleStore(s=>s.respecGrowth);
  const saveDoctrine = useBattleStore(s=>s.selectLungeDoctrine);
  const [heroId,setHeroId] = useState<HeroId>(target?.heroId ?? "alpha");
  // Open on actionable skills. The ornamental combat network remains available as a map.
  const [view,setView] = useState<"atlas"|"sector">("sector");
  const [sectorId,setSectorId] = useState(() => target
    ? ATLAS_SECTORS[target.heroId].find(sector => sector.skillIds.includes(target.skillId))?.id ?? ""
    : "assault");
  const [sectorPage,setSectorPage] = useState(0);
  const [pathPreview,setPathPreview] = useState<Discipline>(() => savedGrowthHero(growth, heroId)?.discipline ?? HERO_PATHS[heroId][0]);
  const [selection,setSelection] = useState<Selection | null>(target ?? null);
  const [confirm,setConfirm] = useState<"upgrade"|"respec"|null>(null);
  const [saving,setSaving] = useState(false);
  const [feedback,setFeedback] = useState<Feedback>(null);
  const [doctrineFeedback,setDoctrineFeedback] = useState("");
  const [showFuture,setShowFuture] = useState(false);
  const [compactFocus,setCompactFocus] = useState(true);
  const [doctrineStage,setDoctrineStage] = useState(false);
  const dialogRef=useRef<HTMLDivElement>(null);
  const inspectorRef=useRef<HTMLElement>(null);
  const doctrineRef=useRef<HTMLElement>(null);
  const sectors=ATLAS_SECTORS[heroId];
  const sectorPageCount=Math.ceil(sectors.length/3);
  const visibleSectors=sectors.slice(sectorPage*3,(sectorPage+1)*3);
  const sector=sectors.find(s=>s.id===sectorId) || sectors[0];
  const hero=savedGrowthHero(growth,heroId) || null;
  const chosenPath=pathPreview;
  useEffect(()=>{setPathPreview(hero?.discipline || HERO_PATHS[heroId][0]);},[heroId,hero?.discipline]);
  const points=growth ? growth.earnedPoints-growth.spentPoints : 0;
  const unavailable=saving || progressionPending;
  const activeRun=hasActiveGrowthRun(progression);
  const doctrineLocked = activeRun || Boolean(progression?.signalTrials?.activeRun || progression?.lastHowl?.status === "ACTIVE");
  const showDoctrine = heroId === "ally-02" && sector.id === "pursuit" && progression?.lungeDoctrineAvailable && hero;
  useEffect(()=>{if(doctrineStage && !showDoctrine)setDoctrineStage(false);},[doctrineStage,showDoctrine]);
  const doctrineEligible = canSelectLungeDoctrine(hero ?? undefined);
  const node=selection && sector.skillIds.includes(selection.skillId)
    ? getNodeView(heroId,selection.skillId,selection.rank,hero,chosenPath,points,growthPreviewBase(selection.skillId,progression),activeRun) : null;
  const baseSkill = node ? growthPreviewBase(node.skillId, progression) : null;
  const currentSkill = baseSkill && hero ? skillEffectView(resolveGrowthSkill(baseSkill, hero), hero) : null;
  const nextHero = hero && baseSkill && node?.changes.length
    ? { ...hero, discipline: hero.discipline ?? chosenPath, ranks: { ...hero.ranks, [canonicalGrowthSkillId(baseSkill.id)]: node.rank } }
    : null;
  const nextSkill = baseSkill && nextHero ? skillEffectView(resolveGrowthSkill(baseSkill, nextHero), nextHero) : null;
  const canBuy=Boolean(node?.state==="available" && !unavailable && growth);
  const canRespec=Boolean(hero?.discipline && !hero.respecUsed && Object.keys(hero.ranks).length>0 && !unavailable && !activeRun);
  const purchased=hero?.ranks || {};
  useEffect(()=>{
    if(!confirm)return;
    const previous=document.activeElement as HTMLElement | null;
    const dialog=dialogRef.current;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    function keydown(event: KeyboardEvent){
      if(event.key==="Escape"){event.preventDefault();setConfirm(null);return;}
      if(event.key!=="Tab" || !dialog)return;
      const buttons=Array.from(dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      const first=buttons[0],last=buttons[buttons.length-1];
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
    }
    document.addEventListener("keydown",keydown);
    return ()=>{document.body.style.overflow=previousOverflow;document.removeEventListener("keydown",keydown);previous?.focus();};
  },[confirm]);
  function inspect(skillId:string,rank:0|1|2){
    if(unavailable)return;
    setSelection({skillId,rank});setFeedback(null);setConfirm(null);
    requestAnimationFrame(()=>inspectorRef.current?.scrollIntoView({block:"nearest",behavior:"instant"}));
  }

  function changeHero(id:HeroId){
    if(unavailable)return;
    setHeroId(id);setSectorPage(0);setSectorId(ATLAS_SECTORS[id][0].id);setPathPreview(growth?.heroes.find(h=>h.heroId===id)?.discipline || HERO_PATHS[id][0]);
    setView("sector");setDoctrineStage(false);setSelection(null);setFeedback(null);setConfirm(null);setDoctrineFeedback("");
  }
  function openSector(s:AtlasSector){
    if(unavailable)return;
    setSectorId(s.id);setView("sector");setDoctrineStage(false);setSelection(null);setConfirm(null);setFeedback(null);
  }
  async function commitUpgrade(){
    if(!node || !canBuy || !growth || !progression || !hero)return;
    const captured={ heroId, path:chosenPath, skillId:node.skillId, rank:node.rank as 1|2, revision:progression.revision };
    setConfirm(null);setFeedback(null);setSaving(true);
    try {
      await upgrade(captured.heroId,captured.path,captured.skillId,captured.rank);
      const current=useBattleStore.getState();
      const saved=current.progression?.playerGrowth?.heroes.find(h=>h.heroId===captured.heroId);
      if(current.progression && current.progression.revision>captured.revision &&
        (saved?.ranks[captured.skillId]||0)>=captured.rank && !current.progressionError) {
        setFeedback({kind:"success",text:`SERVER RECORDED · ${getSkill(captured.skillId).name} RANK ${captured.rank}. Your next accepted run will use the saved skill. Existing runs keep their frozen build.`});
      } else {
        setFeedback({kind:"error",text:current.progressionError || "Upgrade not confirmed by the server. Points and skill ownership remain server-owned; refresh and retry."});
      }
    } catch {
      setFeedback({kind:"error",text:"Could not verify server receipt. Refresh before retrying."});
    } finally {setSaving(false);}
  }
  async function commitRespec(){
    if(!canRespec || !progression)return;
    const initial=progression.revision;
    const id=heroId;
    setConfirm(null);setFeedback(null);setSaving(true);
    try{
      await respec(id);
      const current=useBattleStore.getState();
      const saved=current.progression?.playerGrowth?.heroes.find(h=>h.heroId===id);
      if(current.progression && current.progression.revision>initial && saved?.respecUsed && !Object.keys(saved.ranks).length && !current.progressionError){
        setPathPreview(HERO_PATHS[id][0]);setSelection(null);
        setFeedback({kind:"success",text:"SERVER RECORDED · This hero's one-time reset was used."});
      } else setFeedback({kind:"error",text:current.progressionError||"Reset not confirmed. Refresh and check server progression."});
    } catch{setFeedback({kind:"error",text:"Reset receipt could not be verified."});}
    finally{setSaving(false);}
  }
  async function commitDoctrine(choice: LungeDoctrine) {
    setDoctrineFeedback("");
    const recorded = await saveDoctrine(choice);
    setDoctrineFeedback(recorded ? "Server recorded. Applies to the next accepted run."
      : "Save not confirmed. Refresh to check your saved choice.");
  }

  return <section className="tsa-root" style={atlasArt} inert={Boolean(confirm)} aria-busy={unavailable} aria-label="Signal Atlas character Skillbook">
    <header className="tsa-header">
      <div><span className="tsa-eyebrow">TACTICAL OPS / CHARACTER DEVELOPMENT</span>
        <h2>THE SIGNAL ATLAS</h2><span className="tsa-subtitle">THE CHAIN REMEMBERS</span></div>
      <div className="tsa-points" aria-label={growth?`${points} unspent skill points`:"Points unavailable"}><strong>{growth?points:"—"}</strong><small>POINTS<br/>AVAILABLE</small></div>
    </header>
    <div className="tsa-hero-tabs" role="group" aria-label="Choose character">
      {(Object.keys(HERO_TITLES) as HeroId[]).map(id=><button type="button" key={id} disabled={unavailable} aria-pressed={heroId===id}
        className={heroId===id?"is-active":""} onClick={()=>changeHero(id)}>
        <img src={UNIT_DEFS[id].portrait} onError={atlasPortraitFallback} alt=""/>
        <span><b>{HERO_TITLES[id]}</b><small>{HERO_SUBTITLES[id]}</small></span></button>)}
    </div>
    <div className="tsa-signal-rule" aria-hidden="true"><span/>SIGNAL LINK STABLE<span/></div>
    {!growth?<p className="tsa-banner" role="status">Waiting for authenticated Skillbook progression. No skills can be purchased offline.</p>:null}
    {activeRun?<p className="tsa-banner" role="status" id="tsa-active-run"><strong>ACTIVE RUN · COMPLETE CURRENT MISSION</strong><br/>Upgrades and one-time resets unlock after the server records the mission result. Your accepted build stays unchanged.</p>:null}
    <div className="tsa-nav" role="group" aria-label="Skillbook view">
      <button type="button" className={view==="atlas"?"is-current":""} aria-label="◈ ATLAS OVERVIEW" aria-pressed={view==="atlas"} onClick={()=>{setView("atlas");setDoctrineStage(false);setConfirm(null);setFeedback(null);}} disabled={unavailable}>◈ NETWORK MAP</button>
      <button type="button" className={view==="sector"?"is-current":""} aria-label="◇ SECTOR FOCUS" aria-pressed={view==="sector"} onClick={()=>{setView("sector");setDoctrineStage(false);}} disabled={unavailable}>◇ SKILL TREE</button>
      <button type="button" onClick={onClose} disabled={unavailable} aria-label="Close Signal Atlas">✕ CLOSE</button>
    </div>
    {view==="atlas"?<div className="tsa-overview">
      <div className="tsa-atlas-title"><span>ALPHA HUSKY / {HERO_TITLES[heroId]}</span><strong>COMBAT NETWORK</strong><small>Select a live sector to inspect its real skills.</small></div>
      <div className="tsa-atlas-map" aria-label="Interactive skill sector map">
        <svg className="tsa-links" viewBox="0 0 360 370" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="180" cy="185" r="129" fill="none" stroke="#426074" strokeWidth="1" strokeDasharray="4 9"/>
          <circle cx="180" cy="185" r="99" fill="none" stroke="#2F728D" strokeWidth="1"/>
          {visibleSectors.map((s,i)=>{const p=atlasSectorPosition(i,visibleSectors.length);return <path key={s.id} d={`M180 185 L${p.x*3.6} ${p.y*3.7}`} fill="none" stroke="#6AC4DF" strokeWidth="2.8"/>;})}
          <path d="M180 185 L47 126 M180 185 L313 126 M180 185 L47 289 M180 185 L313 289" fill="none" stroke="#466071" strokeWidth="1.5" strokeDasharray="5 7"/>
        </svg>
        <div className="tsa-core-housing" aria-hidden="true"><img className="tsa-core-bezel" src={SIGNAL_ATLAS_ASSETS.coreBezel} onError={hideArt} alt=""/></div>
        <div className="tsa-core"><img className="tsa-core-portrait" src={UNIT_DEFS[heroId].portrait} onError={atlasPortraitFallback} alt=""/><img className="tsa-core-emblem" onError={hideArt} src={tacticalEmblemFor(heroId,null)||""} alt=""/><b>{HERO_TITLES[heroId]}</b><small>COMBAT CORE</small></div>
        {visibleSectors.map((s,i)=><button key={s.id} className={`tsa-sector tsa-tone-${s.tone}`} style={{left:`${atlasSectorPosition(i,visibleSectors.length).x}%`,top:`${atlasSectorPosition(i,visibleSectors.length).y}%`}} type="button" onClick={()=>openSector(s)} disabled={unavailable} aria-label={`Open ${s.title} sector, ${s.skillIds.length} skills`}>
          <span className="tsa-sector-glyph"><img src={s.emblemSrc} alt="" decoding="async" onError={e=>{ e.currentTarget.style.display="none"; e.currentTarget.parentElement?.setAttribute("data-art-failed","1"); }}/><span className="tsa-sector-glyph-fallback" aria-hidden="true">{s.tone==="amber"?"✦":"◎"}</span></span><b>{s.title}</b><small>{s.description}</small><em>RECORDED · {s.skillIds.reduce((sum,id)=>sum+(purchased[id]||0),0)}/{s.skillIds.length*2}</em>
        </button>)}
        {sectors.length<=2 && RESERVES.map(s=><div className="tsa-reserve" key={s.id} style={{left:`${s.x}%`,top:`${s.y}%`}} aria-label="Unreleased expansion placeholder">⊕</div>)}
      </div>
      {sectorPageCount>1?<div className="tsa-page-controls" aria-label="Sector pages"><button type="button" disabled={unavailable||sectorPage===0} onClick={()=>setSectorPage(p=>Math.max(0,p-1))}>← PREVIOUS</button><span>SECTORS {sectorPage+1} / {sectorPageCount}</span><button type="button" disabled={unavailable||sectorPage===sectorPageCount-1} onClick={()=>setSectorPage(p=>Math.min(sectorPageCount-1,p+1))}>NEXT →</button></div>:null}
      <div className="tsa-atlas-footer">
        <span><b>●</b> LIVE SECTOR</span><span>◌ DESIGN RESERVE — NOT RELEASED</span>
      </div>
      <button type="button" className="tsa-future-toggle" disabled={unavailable} aria-expanded={showFuture} onClick={()=>setShowFuture(v=>!v)}>FUTURE EXPANSION {showFuture?"−":"+"}</button>
      {showFuture?<p className="tsa-explain">This atlas can accept additional sectors without changing existing skill IDs. Grey markers are design space only—not earnable abilities, locked missions or promised rewards.</p>:null}
    </div>:<div className={`tsa-focus ${doctrineStage ? "is-doctrine-stage" : ""}`} aria-label="Live skill tree">
      <div className="tsa-focus-heading"><div><span className="tsa-eyebrow">LIVE SKILL TREE / {HERO_TITLES[heroId]}</span><h3>{sector.title} NETWORK</h3><small>{sector.description} · {sector.skillIds.length} real combat skills</small></div><button type="button" onClick={()=>setView("atlas")} disabled={unavailable}>← MAP</button></div>
      <div className="tsa-sector-switch" role="group" aria-label="Choose live sector">{sectors.map(s=><button type="button" key={s.id} aria-label={`Open ${s.title} sector, ${s.skillIds.length} skills`} aria-pressed={s.id===sector.id} disabled={unavailable} onClick={()=>openSector(s)}>{s.title}<small>{s.skillIds.reduce((sum,id)=>sum+(purchased[id]||0),0)}/{s.skillIds.length*2} RECORDED</small></button>)}</div>
      <div className="tsa-blueprint-overline" aria-hidden="true"><span>TACTICAL SKILL BLUEPRINT</span><span>LIVE BUILD · {HERO_TITLES[heroId]}</span></div>
      <div className="tsa-forge-stage" aria-label={`${HERO_TITLES[heroId]} combat blueprint`}>
        <div className="tsa-identity" aria-label={`${HERO_TITLES[heroId]} combat identity`}>
          <div className="tsa-identity-portrait">
            <img className="tsa-identity-bezel" src={SIGNAL_ATLAS_ASSETS.coreBezel} onError={hideArt} alt=""/>
            <img className="tsa-identity-face" src={UNIT_DEFS[heroId].portrait} onError={atlasPortraitFallback} alt=""/>
          </div>
          <div className="tsa-identity-copy"><span className="tsa-eyebrow">OPERATIVE / COMBAT CORE</span><strong>{HERO_TITLES[heroId]}</strong><span>{hero?.discipline ? `${hero.discipline.toUpperCase()} · RECORDED` : "CHOOSE A DISCIPLINE"}</span></div>
          <div className="tsa-identity-progress"><strong>{sector.skillIds.reduce((sum,id)=>sum+(purchased[id]||0),0)}<small>/{sector.skillIds.length*2}</small></strong><span>RANKS SAVED</span></div>
        </div>
        <div className="tsa-disciplines" role="group" aria-label="Choose specialization preview">
          {HERO_PATHS[heroId].map(p=><button key={p} type="button" aria-pressed={chosenPath===p} disabled={unavailable}
            onClick={()=>{setPathPreview(p);setSelection(null);setFeedback(null);}}
            className={chosenPath===p?"is-chosen":""}>
            <img onError={hideArt} src={tacticalEmblemFor(heroId,p)||""} alt=""/><b>{p.toUpperCase()}</b>
            <span>{hero?.discipline===p?"SERVER RECORDED":hero?.discipline?"ALTERNATIVE · UNAVAILABLE":"PREVIEW PATH"}</span></button>)}
        </div>
      </div>
      {showDoctrine && !doctrineStage && <button type="button" className="tsa-doctrine-jump" disabled={unavailable} onClick={()=>{setDoctrineStage(true);requestAnimationFrame(()=>doctrineRef.current?.scrollIntoView({block:"start",behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));}}>
        <span><b>LUNGE FIELD DOCTRINE</b><small>HEAVY ↔ WIDE · 0 SKILL POINTS</small></span><span aria-hidden="true">↗</span>
      </button>}
      <p className="tsa-path-explain">{PATH_EXPLANATIONS[chosenPath]} {hero?.discipline?"Your recorded discipline is fixed until an eligible one-time reset.":"Previewing does not save a discipline. Your first successful skill purchase selects it."}</p>
      <button type="button" className="tsa-detail-toggle" disabled={unavailable} aria-pressed={!compactFocus} onClick={()=>setCompactFocus(v=>!v)}>{compactFocus?"SHOW FULL SKILL DETAILS +":"COMPACT SKILL NETWORK −"}</button>
      <div className={`tsa-lanes ${compactFocus?"is-compact":""}`}>
        {sector.skillIds.map(skillId=>{
          const skill=getSkill(skillId);
          return <div className="tsa-lane" key={skillId}>
            <div className="tsa-lane-title"><img onError={hideArt} src={tacticalActionImageForSkill(skillId)||""} alt=""/><div><b>{skill.name}</b><small>{skill.slot} · {skill.desc}</small></div><span>{purchased[skillId]||0}/2</span></div>
            <div className="tsa-node-line" role="group" aria-label={`${skill.name} upgrade ranks`}>
              {([0,1,2] as const).map((rank,index)=>{
                const current=getNodeView(heroId,skillId,rank,hero,chosenPath,points,growthPreviewBase(skillId,progression),activeRun);
                const focused=selection?.skillId===skillId && selection.rank===rank;
                return <div className="tsa-node-wrap" key={current.id}>
                  {index>0?<span className={`tsa-connector ${(purchased[skillId]||0)>=rank?"is-lit":""}`} aria-hidden="true"/>:null}
                  <button type="button" disabled={unavailable} aria-pressed={focused} onClick={()=>inspect(skillId,rank)}
                    className={`tsa-node tsa-state-${current.state} ${focused?"is-focused":""}`}
                    aria-label={`${skill.name} rank ${rank}, ${current.state}: ${current.reason}`}>
                    <img onError={hideArt} src={tacticalActionImageForSkill(skillId)||""} alt=""/>{rank>0?<span className="tsa-rank-stamp" aria-hidden="true">{current.state==="maxed"||current.state==="recorded"?"✓":current.state==="needs-rank-one"?"⌁":rank===2?"II":"I"}</span>:null}
                  </button><small>{rank===0?"BASE":`RANK ${rank===1?"I":"II"}`}</small><span className="tsa-node-status">{({base:"OWNED",recorded:"SAVED",maxed:"MAXED",available:"AVAILABLE","needs-rank-one":"NEEDS I","no-points":"NO POINTS","different-discipline":"OTHER PATH","no-effect":"NO CHANGE",unavailable:"OFFLINE","active-run":"ACTIVE RUN"})[current.state]}</span>
                </div>;
              })}
            </div>
          </div>;
        })}
      </div>
      <section ref={inspectorRef} className={`tsa-inspector ${node ? "has-selection" : "is-prompt"}`} aria-label="Skill node inspection" aria-live="polite">
        {node ? <><span className="tsa-eyebrow">{getSkill(node.skillId).name} / {node.rank===0?"BASE":`RANK ${node.rank===1?"I":"II"}`}</span>
          <h3>{node.title}</h3><div className="tsa-saved-rank">SAVED RANK {purchased[node.skillId]||0} / 2 · {node.rank===0?"BASE ACTION":`INSPECTING RANK ${node.rank}`}</div><p>{node.reason}</p>
          {currentSkill ? <p><b>CURRENT · R{currentSkill.rank}</b>{currentSkill.discipline ? ` · ${currentSkill.discipline.toUpperCase()}` : ""}
            {node.skillId === "u03-mend" ? ` · GROWTH V${currentSkill.version}` : ""}<br/>
            {[currentSkill.geometry, ...currentSkill.effects].join(" · ")}</p> : null}
          {nextSkill ? <p><b>NEXT · R{nextSkill.rank}</b> · {chosenPath.toUpperCase()}<br/>
            {[nextSkill.geometry, ...nextSkill.effects].join(" · ")}<br/>{DOCTRINE_TRADEOFF[chosenPath]}</p> : null}
          {node.changes.length?<div className="tsa-deltas">{node.changes.map(c=><strong key={c}>{c}</strong>)}</div>:null}
          <div className="tsa-inspector-bottom"><span>{node.rank===0?"ALREADY OWNED":node.state==="recorded"||node.state==="maxed"?"SERVER RECORDED":node.changes.length?"COST: 1 SKILL POINT":""}</span>
          <button type="button" disabled={!canBuy} aria-describedby={activeRun?"tsa-active-run":undefined} onClick={()=>setConfirm("upgrade")}>{saving?"SAVING…":node.state==="active-run"?"COMPLETE CURRENT MISSION":node.state==="available"?"REVIEW UPGRADE":"UNAVAILABLE"}</button></div>
        </>:<><span className="tsa-eyebrow">◈ SELECT A SKILL NODE</span><p>Tap any rank to inspect its effect, requirements and saved progression.</p></>}
      </section>
      {showDoctrine && <section ref={doctrineRef} className="tsa-doctrine" aria-label="Lunge field doctrine">
        {doctrineStage && <button type="button" className="tsa-doctrine-back" disabled={unavailable} onClick={()=>setDoctrineStage(false)}>← BACK TO SKILL TREE</button>}
        <div className="tsa-doctrine-heading"><div><span className="tsa-eyebrow">PURSUIT / A2 LUNGE</span><h3>LUNGE FIELD DOCTRINE</h3><p>Two tactics. One saved choice. <strong>0 skill points</strong> to switch.</p></div><span className="tsa-doctrine-insignia" aria-hidden="true">⌁</span></div>
        <p className="tsa-doctrine-requirement">{doctrineEligible ? "✓ PURSUER LUNGE RANK I UNLOCKED" : "◈ REQUIRES PURSUER LUNGE RANK I"} <span>· Applies to your next accepted run</span></p>
        {doctrineLocked && <p role="status">Finish the active run to switch.</p>}
        <div className="tsa-doctrine-choices">
        {(["heavy", WIDE_LUNGE] as const).map(choice => {
          const selected = (hero.lungeDoctrine ?? "heavy") === choice;
          const previewHero = { ...hero, discipline: "pursuer" as const,
            ranks: { ...hero.ranks, "u02-burst": hero.ranks["u02-burst"] || 1 },
            lungeDoctrine: choice === WIDE_LUNGE ? WIDE_LUNGE : undefined };
          const skill = resolveGrowthSkill(growthPreviewBase("u02-burst", progression), previewHero);
          const damage = skill.effects.find(item => item.kind === "damage")?.multiplier;
          const wide = choice === WIDE_LUNGE;
          const centered = wide && skill.targetType === "ENEMY_AOE";
          const locked = !doctrineEligible || doctrineLocked || unavailable;
          const title = wide ? "Wide Lunge" : "Heavy Lunge";
          return <div className={`tsa-doctrine-option ${wide ? "is-wide" : "is-heavy"} ${selected ? "is-selected" : ""}`} key={choice}>
            <button type="button" className="tsa-doctrine-card" aria-label={`${title}${selected ? " · Selected" : ""}`} aria-pressed={selected}
              disabled={selected || locked} onClick={() => void commitDoctrine(choice)}>
              <span className="tsa-doctrine-card-top"><span className="tsa-doctrine-art"><img src={tacticalActionImageForSkill("u02-burst") || ""} onError={hideArt} alt=""/></span><span className="tsa-doctrine-card-title"><strong>{title.toUpperCase()}</strong><small>{wide ? centered ? "CLOSE-RANGE SWEEP" : "MULTI-TARGET STRIKE" : "PRECISION FINISHER"}</small></span><span className="tsa-doctrine-badge">{selected ? "✓ SELECTED" : locked ? "◇ LOCKED" : "＋ CHOOSE"}</span></span>
              <span className="tsa-doctrine-specs"><span>{wide ? centered ? "AROUND CNC" : "ADJACENT AIM" : `RANGE ${skill.maxRange}`}</span><span>{typeof damage === "number" ? `${Math.round(damage*100)}%` : "—"} · {wide ? "AREA" : "SINGLE"}</span></span>
              <DoctrineFootprint wide={wide} centered={centered} range={skill.maxRange}/>
              <span className="tsa-doctrine-card-desc">{wide ? skill.desc : "Hit one priority enemy harder. Trade away the area coverage of Wide Lunge."}</span>
              <span className="tsa-doctrine-card-footer">{selected ? "CURRENTLY SAVED" : !doctrineEligible ? "UNLOCK WITH PURSUER LUNGE RANK I" : doctrineLocked ? "COMPLETE CURRENT RUN TO SWITCH" : unavailable ? "WAITING FOR SERVER" : "SELECT DOCTRINE · FREE"}</span>
            </button>
          </div>;
        })}
        </div>
        <p className="tsa-doctrine-truth">◈ The server records your choice. An accepted mission keeps its original variant, even after resuming.</p>
        {doctrineFeedback && <p className="tsa-doctrine-receipt" role="status">{doctrineFeedback}</p>}
      </section>}
      <div className="tsa-secondary"><button type="button" disabled={!canRespec} aria-describedby={activeRun?"tsa-active-run":undefined} onClick={()=>setConfirm("respec")}>{hero?.respecUsed?"ONE-TIME RESET USED":"RESET THIS HERO · ONCE FREE"}</button><small>Pack Mastery remains separate.</small></div>
    </div>}
    {progressionError?<p className="tsa-feedback error" role="alert">{progressionError}</p>:feedback?<p className={`tsa-feedback ${feedback.kind}`} role={feedback.kind==="error"?"alert":"status"}>{feedback.text}</p>:null}
    {confirm && typeof document!=="undefined"?createPortal(<div className="tsa-dialog-backdrop"><div ref={dialogRef} className="tsa-dialog" role="dialog" aria-modal="true" aria-labelledby="tsa-confirm-title">
      <span className="tsa-eyebrow">SERVER-RECORDED ACTION</span>
      <h3 id="tsa-confirm-title">{confirm==="upgrade"?"CONFIRM SKILL UPGRADE":"CONFIRM ONE-TIME RESET"}</h3>
      {activeRun?<p role="status">ACTIVE RUN · COMPLETE CURRENT MISSION before confirming an upgrade or reset.</p>:null}
      <p>{confirm==="upgrade" ? `${node?.title} · cost 1 shared skill point. ${hero?.discipline?"Existing discipline remains recorded.":`First purchase will record ${chosenPath.toUpperCase()} as this hero's discipline.`}` : "Refund this hero's spent skill points and clear their specialization. You cannot use this one-time reset again."}</p>
      {confirm==="upgrade" && node?.changes.length?<div className="tsa-deltas">{node.changes.map(c=><strong key={c}>{c}</strong>)}</div>:null}
      {confirm === "upgrade" ? <p>{DOCTRINE_TRADEOFF[chosenPath]}<br/>1 shared point. First purchase selects this doctrine. One reset per hero. Applies to the next accepted run; saved runs stay frozen.</p> : null}
      <div className="tsa-dialog-actions"><button type="button" onClick={()=>setConfirm(null)}>CANCEL</button><button type="button" className="is-primary" disabled={confirm==="upgrade"?!canBuy:!canRespec} onClick={()=>void (confirm==="upgrade"?commitUpgrade():commitRespec())}>CONFIRM</button></div>
    </div></div>,document.getElementById("tacticalOpsRoot") || document.body):null}
  </section>;
}
