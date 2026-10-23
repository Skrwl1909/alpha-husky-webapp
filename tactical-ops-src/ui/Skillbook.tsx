import { useEffect, useState } from "react";
import { SignalAtlas } from "./signalAtlas/SignalAtlas";
import { useBattleStore } from "../store/battleStore";
import { HERO_PATHS, HERO_SKILLS, UPGRADES, type Discipline, type HeroId } from "../data/playerGrowth";
import { getSkill } from "../data/skills";
import { UNIT_DEFS } from "../data/units";
import { portraitFallback } from "./PlayerIdentity";
import { skillChangePreview } from "./combatIdentity";
import { tacticalEmblemFor } from "./tacticalEmblems";
import { tacticalActionImageForSkill } from "./tacticalActionIcons";

const NAMES: Record<HeroId, string> = { alpha: "ALPHA", "ally-02": "CNC", "ally-03": "SHADOW" };
const PATH_COPY: Record<Discipline, string> = {
  vanguard: "Protects the front line with a guarded HOWL.",
  howlkeeper: "Extends HOWL's squad-wide reach.",
  pursuer: "Extends THRUST's pursuit reach.",
  disruptor: "Extends PRESSURE's enemy control.",
  sentinel: "Adds GUARD to PACK SUPPORT.",
  medic: "Makes MEND available more frequently.",
};

/** Client renders server-owned points and choices only; no optimistic rewards or local storage. */
export function SkillbookPanel() {
  const growth = useBattleStore(s => s.progression?.playerGrowth);
  const pending = useBattleStore(s => s.progressionCommitPending);
  const error = useBattleStore(s => s.progressionError);
  const upgrade = useBattleStore(s => s.upgradeGrowth);
  const respec = useBattleStore(s => s.respecGrowth);
  const [heroId, setHeroId] = useState<HeroId>("alpha");
  const [atlasOpen,setAtlasOpen] = useState(false);
  const [path, setPath] = useState<Discipline>("vanguard");
  const [skillId, setSkillId] = useState<string | null>(null);
  const [respecConfirm, setRespecConfirm] = useState(false);
  const [purchaseProof, setPurchaseProof] = useState<{ heroId: HeroId; skillId: string; rank: 1 | 2 } | null>(null);
  const hero = growth?.heroes.find(h => h.heroId === heroId);
  const remaining = growth ? growth.earnedPoints - growth.spentPoints : 0;

  useEffect(() => {
    setPath(hero?.discipline ?? HERO_PATHS[heroId][0]);
    setSkillId(null);
    setRespecConfirm(false);
  }, [heroId, hero?.discipline]);

  const selectedSkill = skillId ? getSkill(skillId) : null;
  const rank = skillId ? hero?.ranks[skillId] ?? 0 : 0;
  const nextRank = (rank + 1) as 1 | 2;
  const upgradeInfo = skillId ? UPGRADES.find(u => u.skillId === skillId && u.rank === nextRank) : null;
  const locked = pending || !growth || remaining < 1 || (hero?.discipline != null && hero.discipline !== path);
  const delta = skillId && upgradeInfo && hero ? skillChangePreview(skillId, hero, nextRank, path) : [];
  // Match the Atlas: never charge for a rank with zero effective combat improvement.
  const canBuy = !!(skillId && upgradeInfo && !locked && delta.length > 0);
  const canRespec = !!(hero?.discipline && !hero?.respecUsed && Object.keys(hero.ranks).length > 0);
  const savedPowerProof = selectedSkill && hero && rank > 0 && skillId
    ? skillChangePreview(skillId, { ...hero, ranks: { ...hero.ranks, [skillId]: (rank - 1) as 0 | 1 } }, rank as 1 | 2, hero.discipline || path)
    : [];
  const upgradeConfirmed = !!(purchaseProof && !pending && growth?.heroes.find(h => h.heroId === purchaseProof.heroId)?.ranks[purchaseProof.skillId] === purchaseProof.rank);

  if (atlasOpen) return <SignalAtlas onClose={() => setAtlasOpen(false)} />;
  return (
    <section className="t-panel t-growth-panel" aria-label="Character Skillbook">
      <header className="t-growth-heading">
        <div>
          <span className="t-kicker">SQUAD PROGRESSION</span>
          <h2>CHARACTER SKILLBOOK</h2>
          <p>Choose how each squad member fights. Your choices are saved to your Alpha account.</p>
          <button type="button" className="t-growth-atlas-cta" onClick={()=>setAtlasOpen(true)}>◈ OPEN SIGNAL ATLAS · BETA</button>
        </div>
        <div className="t-growth-points"><strong>{growth ? remaining : "—"}</strong><small>AVAILABLE POINTS</small></div>
      </header>
      {!growth ? <p className="t-growth-notice">Skillbook is waiting for authenticated server progression. No upgrades can be spent offline.</p> : (
        <>
          <nav className="t-growth-roster" aria-label="Choose squad member">
            {(Object.keys(NAMES) as HeroId[]).map(id =>
              <button className={id === heroId ? "is-selected" : ""} key={id} aria-pressed={id === heroId}
                type="button" onClick={() => setHeroId(id)}><img src={UNIT_DEFS[id].portrait} alt="" onError={portraitFallback} /><span>{NAMES[id]}</span></button>)}
          </nav>
          <div className="t-growth-copy"><img className="t-growth-core-emblem" src={tacticalEmblemFor(heroId, hero?.discipline) || ""} alt="" onError={e => { e.currentTarget.style.display = "none"; }} /><strong>{NAMES[heroId]}</strong><span>{hero?.discipline ? "SPECIALIZATION LOCKED IN" : "CHOOSE FIRST SPECIALIZATION"}</span></div>
          <div className="t-growth-paths">
            {HERO_PATHS[heroId].map(choice =>
              <button key={choice} type="button"
                className={choice === path ? "is-selected" : ""}
                disabled={pending || (hero?.discipline != null && hero.discipline !== choice)}
                aria-pressed={choice === path}
                onClick={() => { setPath(choice); setSkillId(null); }}>
                <img className="t-growth-path-emblem" src={tacticalEmblemFor(heroId, choice) || ""} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }} /><b>{choice.toUpperCase()}</b><small>{PATH_COPY[choice]}</small>
              </button>)}
          </div>
          <div className="t-growth-skill-list">
            {HERO_SKILLS[heroId].map(id => {
              const base = getSkill(id);
              const current = hero?.ranks[id] ?? 0;
              const next = UPGRADES.find(u => u.skillId === id && u.rank === current + 1);
              return <button type="button" key={id} aria-pressed={skillId === id}
                className={skillId === id ? "is-selected" : ""}
                onClick={() => { setSkillId(id); setRespecConfirm(false); }}>
                <span className="t-growth-skill-title">
                  <span className="t-growth-skill-label">
                    <img className="t-growth-action-icon" src={tacticalActionImageForSkill(id) || ""} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }} />
                    {base.slot} · {base.name}
                  </span>
                  <em>RANK {current}/2</em>
                </span>
                <small>{next ? next.description : "Maximum rank reached"}</small>
              </button>;
            })}
          </div>
          <div className="t-growth-confirm">
            <div aria-live="polite">
              <strong>{selectedSkill ? selectedSkill.name : "SELECT A SKILL"}</strong>
              {savedPowerProof.length ? <div className="t-growth-delta" aria-label="Saved power proof from server progression">
                <small>SAVED POWER PROOF · CURRENT RANK {rank}/2</small>
                {savedPowerProof.map(change => <b key={change}>{change}</b>)}
              </div> : null}
              <small>{upgradeInfo?.description ?? (selectedSkill ? "All upgrades unlocked." : "Select one of the three skills to see its next upgrade.")}</small>
              {delta.length ? <div className="t-growth-delta" aria-label="Actual combat upgrade preview">{delta.map(change => <b key={change}>{change}</b>)}</div> : null}
              {nextRank === 2 && upgradeInfo ? <span className="t-growth-signature">RANK 2 · EVOLVED COMBAT EFFECT</span> : null}
              <small>{hero?.discipline && hero.discipline !== path ? "Other specialization is locked. Use your one free respec to change it." : upgradeInfo && !delta.length ? "No effective combat change at this rank. Purchase disabled pending balance review." : remaining < 1 ? "Earn a point from a first-time mission clear." : "Each upgrade costs 1 point and changes real combat behavior."}</small>
            </div>
            <button className="t-btn t-btn-primary" type="button" disabled={!canBuy}
              onClick={() => { if (skillId && canBuy) { setPurchaseProof({ heroId, skillId, rank: nextRank }); void upgrade(heroId, path, skillId, nextRank); } }}>
              {pending ? "SAVING..." : "CONFIRM UPGRADE"}
            </button>
          </div>
          {upgradeConfirmed ? <p className="t-growth-confirmed" role="status">UPGRADE RECORDED · RANK {purchaseProof?.rank}/2 · READY FOR NEXT BATTLE</p> : null}
          {canRespec ? <div className="t-growth-respec">
            {!respecConfirm ? <button className="t-btn" type="button" disabled={pending} onClick={() => setRespecConfirm(true)}>RESET THIS HERO · ONCE FREE</button> :
              <><span>Refund this hero's skill points and reset their specialization? This is irreversible.</span>
                <button className="t-btn" disabled={pending} type="button" onClick={() => setRespecConfirm(false)}>CANCEL</button>
                <button className="t-btn" disabled={pending} type="button" onClick={() => { setRespecConfirm(false); void respec(heroId); }}>CONFIRM RESET</button></>}
          </div> : hero?.respecUsed ? <small className="t-growth-notice">This hero has already used their one free respec.</small> : null}
          {error ? <p className="t-growth-error" role="alert">{error}</p> : null}
        </>
      )}
    </section>
  );
}
