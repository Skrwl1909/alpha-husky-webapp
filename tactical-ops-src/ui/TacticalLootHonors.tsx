import { useEffect, useState, type SyntheticEvent } from "react";
import { ArrowRight, Bone, Hammer, ShieldCheck, Zap, Gem, Award, Frame, Sparkles, LockKeyhole, Shield } from "lucide-react";
import { getHost } from "../host/bridge";
import { parseLootHonors, type LootParseResult, type EquipmentGrant, type PrestigeGrant, type CurrencyType } from "../data/lootHonors";
import { TACTICAL_BADGES, TACTICAL_FRAMES, tacticalHonor, type HonorDefinition } from "../data/tacticalHonors";

const currencyLabels: Record<CurrencyType,string> = { exp:"EXP", bones:"Bones", scrap:"Scrap", rune_dust:"Rune Dust" };
const currencyIcons = { exp:Zap, bones:Bone, scrap:Hammer, rune_dust:Gem };
const labels: Record<PrestigeGrant["type"],string> = { badge:"BADGE UNLOCKED", frame:"FRAME UNLOCKED", skin:"SKIN UNLOCKED", title:"TITLE UNLOCKED", aura:"AURA UNLOCKED" };

function Artwork({src, fallback}:{src?:string; fallback?:HonorDefinition}) {
  const [failed,setFailed] = useState(false);
  const path = src || fallback?.image;
  useEffect(()=>setFailed(false),[path]);
  return path && !failed ? <img className="t-loot-art" src={path} alt="" loading="lazy" decoding="async"
    onError={(_event:SyntheticEvent<HTMLImageElement>)=>setFailed(true)} /> :
    <Shield className="t-loot-fallback" aria-hidden="true" />;
}
function Stats({drop}:{drop:EquipmentGrant}) {
  const stats = drop.stats ? Object.entries(drop.stats) : [];
  if (!stats.length) return null;
  const compare = drop.equipped?.stats;
  return <dl className="t-loot-stats" aria-label="Confirmed item statistics">
    {stats.map(([key,value])=>{
      const known = compare && Object.prototype.hasOwnProperty.call(compare,key);
      const delta = known ? value - compare[key] : null;
      return <div key={key}><dt>{key.replace(/_/g," ").toUpperCase()}</dt><dd>{value >= 0 ? "+" : ""}{value}</dd>
        {delta != null ? <dd data-delta={delta>0?"up":delta<0?"down":"same"} aria-label={"Versus equipped " + (delta > 0 ? "+" : "") + delta}>{delta > 0 ? "+" : ""}{delta}</dd> : null}
      </div>;
    })}
    {drop.equipped && <p>Compared with {drop.equipped.name} · confirmed stats</p>}
  </dl>;
}
function EquipmentCard({drop}:{drop:EquipmentGrant}) {
  const open = getHost().openInventory;
  return <article className="t-loot-equipment" data-rarity={drop.rarity} aria-label={drop.rarity + " equipment drop: " + drop.name}>
    <div className="t-loot-equipment-art"><Artwork src={drop.imageUrl} /><span className="t-loot-quantity">×{drop.quantity}</span></div>
    <div className="t-loot-equipment-copy">
      <div className="t-loot-rarity">{drop.rarity.toUpperCase()} · {drop.slot.toUpperCase()}</div>
      <h3>{drop.name}</h3>
      <Stats drop={drop}/>
      <button className="t-btn" type="button" disabled={!open} onClick={open}>
        {open ? "VIEW / COMPARE IN INVENTORY" : "VIEW IN INVENTORY WHEN AVAILABLE"} <ArrowRight aria-hidden="true" />
      </button>
    </div>
  </article>;
}
function PrestigeCard({grant}:{grant:PrestigeGrant}) {
  const definition = tacticalHonor(grant.id);
  const openBadges = getHost().openBadges;
  const openProfile = getHost().openProfile;
  const inBadgeWall = grant.type === "badge" || grant.type === "title" || grant.type === "aura";
  const canOpen = inBadgeWall ? Boolean(openBadges) : Boolean(openProfile);
  const openCollection = () => { if (inBadgeWall) openBadges?.(grant.type === "badge" ? grant.id : undefined); else openProfile?.(); };
  return <article className="t-loot-prestige" data-rarity={grant.rarity} aria-label={labels[grant.type]+": "+grant.name}>
    <div className="t-loot-prestige-art"><Artwork src={grant.imageUrl} fallback={definition} /></div>
    <div className="t-loot-prestige-copy"><span className="t-loot-rarity">{labels[grant.type]}</span>
      <h3>{grant.name}</h3><small>{grant.rarity.toUpperCase()} · Permanently recorded by the server</small>
      {canOpen ? <button type="button" className="t-btn" onClick={openCollection}>VIEW COLLECTION <ArrowRight aria-hidden="true"/></button> : null}
    </div>
  </article>;
}

/** Only call this with a matching server-result record, not a local win or a test fixture. */
export function TacticalLootReveal({result}:{result:LootParseResult}) {
  if (result.state === "replayed") return <p className="t-loot-replayed" role="status">RECEIPT PREVIOUSLY RECORDED · No new rewards granted.</p>;
  if (result.state !== "confirmed") return null;
  const {currencies,equipment,unlocks,receiptId} = result.receipt;
  const paid = currencies.filter(r=>r.amount>0);
  if (!paid.length && !equipment.length && !unlocks.length)
    return <p className="t-loot-replayed" role="status">NO NEW REWARDS RECORDED FOR THIS VICTORY.</p>;
  const peak = equipment.some(item=>item.rarity==="legendary") ? "legendary" :
    equipment.some(item=>item.rarity==="epic" || item.rarity==="rare") ? "rare" : "standard";
  return <section className="t-loot-reveal" aria-label="Server-confirmed Tactical Loot and Honors" data-reveal={peak} data-receipt-id={receiptId}>
    <div className="t-loot-heading"><ShieldCheck aria-hidden="true"/><div><span>AFTER ACTION / CONFIRMED</span><h2>LOOT &amp; HONORS</h2></div></div>
    {paid.length ? <div className="t-loot-currencies" aria-label="Confirmed currency rewards">{paid.map(reward=>{
      const Icon = currencyIcons[reward.kind];
      return <div className="t-loot-currency" key={reward.kind}><Icon aria-hidden="true"/><strong>+{reward.amount.toLocaleString()}</strong><small>{currencyLabels[reward.kind]}</small></div>;
    })}</div> : null}
    {equipment.length ? <div className="t-loot-items">{equipment.map(drop=><EquipmentCard key={drop.grantId} drop={drop}/>)}</div> : null}
    {unlocks.length ? <div className="t-loot-unlocks">{unlocks.map(grant=><PrestigeCard key={grant.grantId} grant={grant}/>)}</div> : null}
    <small className="t-loot-receipt">SAVED RECEIPT · {receiptId}</small>
  </section>;
}

type BadgeState = {key:string; owned:boolean; progress?:{current?:number;target?:number;label?:string}};
function HonorTile({honor,state}:{honor:HonorDefinition;state?:BadgeState}) {
  const owned = state?.owned === true;
  const progress = state?.progress && Number.isSafeInteger(state.progress.current) &&
    Number.isSafeInteger(state.progress.target) && (state.progress.target ?? 0)>0
    ? Math.max(0,Math.min(state.progress.current!,state.progress.target!)) : null;
  return <article className="t-honors-tile" data-rarity={honor.tier} data-owned={owned?"yes":"no"}
    aria-label={honor.name + (owned ? ", unlocked" : ", locked") + ". " + honor.requirement}>
    <div className="t-honors-image"><Artwork src={honor.image}/>{!owned ? <LockKeyhole aria-hidden="true" className="t-honors-lock"/> : null}</div>
    <div className="t-honors-copy"><span>{owned ? "UNLOCKED" : "LOCKED"} · {honor.tier.toUpperCase()}</span>
      <h3>{honor.name}</h3><p>{honor.description}</p><small>{honor.requirement}</small>
      {progress !== null ? <progress value={progress} max={state!.progress!.target} aria-label={honor.name+" confirmed progress"}/> : null}
      {progress !== null ? <small>Progress {progress}/{state!.progress!.target}</small> : null}
    </div>
  </article>;
}

/** Locked catalog is design metadata; only /webapp/badges/state can mark a badge owned. */
export function TacticalHonorsCollection() {
  const [expanded,setExpanded] = useState(false);
  const [badges,setBadges] = useState<BadgeState[]>([]);
  const [loading,setLoading] = useState(false);
  useEffect(()=>{
    if (!expanded || !getHost().readHonorBadges) return;
    let live=true;setLoading(true);
    getHost().readHonorBadges!().then(raw=>{
      if (!live) return;
      const list = raw && typeof raw === "object" && Array.isArray((raw as {badges?:unknown}).badges)
        ? (raw as {badges:unknown[]}).badges : [];
      const normalized = list.filter((v):v is BadgeState=>!!v && typeof v==="object" &&
        typeof (v as BadgeState).key==="string" && (v as BadgeState).owned===true || !!v && typeof v==="object" &&
        typeof (v as BadgeState).key==="string" && (v as BadgeState).owned===false);
      setBadges(normalized);
    }).catch(()=>{if(live) setBadges([])}).finally(()=>{if(live)setLoading(false)});
    return ()=>{live=false};
  },[expanded]);
  const lookup = new Map(badges.map(b=>[b.key.toLowerCase(),b]));
  const openBadges = getHost().openBadges;
  return <details className="t-honors-collection" onToggle={event=>setExpanded(event.currentTarget.open)} aria-label="Tactical Honors collection">
    <summary><Award aria-hidden="true"/> TACTICAL HONORS <span>8 BADGES · 2 FRAMES</span></summary>
    <p className="t-honors-intro">The Fracture · Forged through battle. Future collection concepts; unlocks only count once confirmed by the game server.</p>
    {loading ? <p role="status">Checking confirmed badge ownership…</p> : null}
    <div className="t-honors-grid">{TACTICAL_BADGES.map(h=><HonorTile key={h.id} honor={h} state={lookup.get(h.id.toLowerCase())}/>)}</div>
    <h3 className="t-honors-frames-heading"><Frame aria-hidden="true"/> PROFILE FRAMES · FUTURE UNLOCKS</h3>
    <div className="t-honors-grid">{TACTICAL_FRAMES.map(h=><HonorTile key={h.id} honor={h}/>)}</div>
    <p className="t-honors-intro">Frames are visual concepts until server entitlements and profile selection support them.</p>
    {openBadges ? <button className="t-btn" type="button" onClick={()=>openBadges()}>OPEN BADGE WALL <ArrowRight aria-hidden="true"/></button> : null}
  </details>;
}
