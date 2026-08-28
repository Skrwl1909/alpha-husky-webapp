import { useEffect } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { useBattleStore } from "../store/battleStore";
import { loadMuted, setMuted, unlockAudio } from "../audio";
import { OPERATION } from "../data/units";
import { BattleScreen } from "./Battle";

function Background({ dim = 0.55 }: { dim?: number }) {
  return (
    <div className="t-bg" aria-hidden="true">
      <img src="/images/tactical_ops/battlefield.jpg" alt="" />
      <div className="t-vignette" style={{ background: `rgb(10 12 16 / ${dim})` }} />
    </div>
  );
}

function Hub() {
  const openBrief = useBattleStore((s) => s.openBrief);
  return (
    <div className="t-fill">
      <Background dim={0.35} />
      <div className="t-vignette" />
      <div className="t-hub">
        <div className="t-hub-copy">
          <div className="t-kicker">Alpha Husky</div>
          <h1 className="t-title">Tactical Ops</h1>
          <h2>Combat Core</h2>
          <div className="t-panel t-op-card">
            <span className="t-kicker">Operation</span>
            <strong>{OPERATION.name}</strong>
            <p>{OPERATION.objective}</p>
          </div>
          <div className="t-brief-actions">
            <button type="button" className="t-btn t-btn-primary" onClick={openBrief}>
              Mission Brief
              <ChevronRight className="t-ico" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Brief() {
  const deploy = useBattleStore((s) => s.deploy);
  const backToHub = useBattleStore((s) => s.backToHub);
  return (
    <div className="t-fill">
      <Background dim={0.55} />
      <div className="t-brief">
        <div className="t-kicker">Tactical Ops</div>
        <h1 className="t-title" style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", margin: "0.2rem 0 0.2rem" }}>
          {OPERATION.name}
        </h1>
        <p style={{ color: "var(--t-muted)", margin: 0, maxWidth: "40rem" }}>{OPERATION.objective}</p>
        <div className="t-brief-grid">
          <div className="t-panel t-brief-block">
            <h3>Allied squad</h3>
            <div className="t-unit-row">
              <img src="/images/tactical_ops/alpha-portrait.jpg" alt="" />
              <div>
                <div className="t-title" style={{ fontSize: "0.95rem" }}>
                  ALPHA
                </div>
                <div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>
                  Melee pressure · Strike / Rend / Howl · MOVE 3
                </div>
              </div>
            </div>
            <div className="t-unit-row">
              <img src="/images/tactical_ops/ally02.png" alt="" style={{ objectPosition: "50% 12%" }} />
              <div>
                <div className="t-title" style={{ fontSize: "0.95rem" }}>
                  UNIT 02
                </div>
                <div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>
                  Ranged control · Shot / Burst / Suppress · MOVE 2
                </div>
              </div>
            </div>
            <div className="t-unit-row">
              <img src="/images/tactical_ops/ally03.png" alt="" style={{ objectPosition: "50% 12%" }} />
              <div>
                <div className="t-title" style={{ fontSize: "0.95rem" }}>
                  UNIT 03
                </div>
                <div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>
                  Support · Tap / Mend / Pack Support · MOVE 2
                </div>
              </div>
            </div>
          </div>
          <div className="t-panel t-brief-block">
            <h3>Hostile force</h3>
            <div className="t-unit-row">
              <div className="t-unit-ph enemy" />
              <div>
                <div className="t-title" style={{ fontSize: "0.95rem" }}>
                  HOSTILE × 3
                </div>
                <div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>Melee · Strike / Maul · 68 HP</div>
              </div>
            </div>
            <div className="t-unit-row">
              <div className="t-unit-ph enemy" />
              <div>
                <div className="t-title" style={{ fontSize: "0.95rem" }}>
                  HOSTILE LEADER
                </div>
                <div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>Heavy · Crush / Intimidate · 148 HP</div>
              </div>
            </div>
            <p style={{ color: "var(--t-faint)", fontSize: "0.78rem", margin: "0.8rem 0 0", lineHeight: 1.45 }}>
              Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.
            </p>
          </div>
        </div>
        <div className="t-brief-actions">
          <button type="button" className="t-btn t-btn-ghost" onClick={backToHub}>
            Back
          </button>
          <button type="button" className="t-btn t-btn-primary" onClick={deploy}>
            Deploy
            <ChevronRight className="t-ico" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Sector() {
  const dismiss = useBattleStore((s) => s.dismissSector);
  useEffect(() => {
    let id = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      if (t - t0 >= 1600) dismiss();
      else id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [dismiss]);
  return (
    <div className="t-fill">
      <Background dim={0.5} />
      <div className="t-overlay" style={{ background: "rgb(10 12 16 / 0.45)" }}>
        <div className="t-modal t-panel">
          <div className="t-kicker">Operation</div>
          <h2 className="t-title">Sector Secured</h2>
          <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>Hostile force eliminated.</p>
          <button type="button" className="t-btn t-btn-primary" onClick={dismiss}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function Results() {
  const results = useBattleStore((s) => s.battle.results);
  const replay = useBattleStore((s) => s.replay);
  const backToHub = useBattleStore((s) => s.backToHub);
  if (!results) return null;
  return (
    <div className="t-fill">
      <Background dim={0.6} />
      <div className="t-overlay">
        <div className="t-modal t-panel">
          <div className="t-kicker">Broken Signal</div>
          <h2 className="t-title">Operation Complete</h2>
          <dl className="t-stats">
            <div>
              <dt>Turns taken</dt>
              <dd>{String(results.turns).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Hostiles eliminated</dt>
              <dd>{results.hostilesEliminated}</dd>
            </div>
            <div>
              <dt>Squad standing</dt>
              <dd>{results.squadStanding} / 3</dd>
            </div>
            <div>
              <dt>Damage taken</dt>
              <dd>{results.damageTaken}</dd>
            </div>
          </dl>
          <div className="t-brief-actions" style={{ justifyContent: "center" }}>
            <button type="button" className="t-btn t-btn-primary" onClick={replay}>
              Replay operation
            </button>
            <button type="button" className="t-btn" onClick={backToHub}>
              Return to Tactical Ops
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Defeat() {
  const replay = useBattleStore((s) => s.replay);
  const backToHub = useBattleStore((s) => s.backToHub);
  return (
    <div className="t-fill">
      <Background dim={0.7} />
      <div className="t-overlay">
        <div className="t-modal t-panel">
          <div className="t-kicker" style={{ color: "var(--t-enemy)" }}>
            Broken Signal
          </div>
          <h2 className="t-title">Operation Failed</h2>
          <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>All allied units are down.</p>
          <div className="t-brief-actions" style={{ justifyContent: "center" }}>
            <button type="button" className="t-btn t-btn-primary" onClick={replay}>
              <RotateCcw className="t-ico" /> Retry
            </button>
            <button type="button" className="t-btn" onClick={backToHub}>
              Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TacticalApp() {
  const screen = useBattleStore((s) => s.screen);
  const selectSkill = useBattleStore((s) => s.selectSkill);
  const skipTurn = useBattleStore((s) => s.skipTurn);
  const muted = useBattleStore((s) => s.muted);

  useEffect(() => {
    if (loadMuted()) {
      useBattleStore.setState({ muted: true });
      setMuted(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = useBattleStore.getState();
      const actor = st.battle.units.find((u) => u.id === st.battle.activeId);
      if (e.key === "1" && actor) selectSkill(actor.skillIds[0]);
      if (e.key === "2" && actor) selectSkill(actor.skillIds[1]);
      if (e.key === "3" && actor) selectSkill(actor.skillIds[2]);
      if (e.key === "s" || e.key === "S") skipTurn();
    };
    window.addEventListener("keydown", onKey);
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", unlock);
    };
  }, [selectSkill, skipTurn]);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  return (
    <div className="t-shell">
      {screen === "hub" ? <Hub /> : null}
      {screen === "brief" ? <Brief /> : null}
      {screen === "battle" ? <BattleScreen /> : null}
      {screen === "sector" ? <Sector /> : null}
      {screen === "results" ? <Results /> : null}
      {screen === "defeat" ? <Defeat /> : null}
    </div>
  );
}
