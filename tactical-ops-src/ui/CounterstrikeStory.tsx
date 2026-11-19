import { useEffect, useRef, useState } from "react";
import type { CounterstrikeResult } from "../data/counterstrike";
import {
  confirmedHoundWave, STORY_HOUND_MS, STORY_INTRO_MS, STORY_INTRO_SEEN_KEY,
  STORY_LITE_KEYART, storyLiteEnabled, verifiedFalseRelayResult,
} from "./counterstrikeStoryModel";

function reducedMotion(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function introSeen(): boolean {
  try { return window.sessionStorage.getItem(STORY_INTRO_SEEN_KEY) === "1"; } catch { return false; }
}

function markIntroSeen(): void {
  try { window.sessionStorage.setItem(STORY_INTRO_SEEN_KEY, "1"); } catch { /* Cosmetic preference only. */ }
}

/** Visual briefing precedes the existing squad picker; it never deploys a run. */
export function CounterstrikeStoryIntro({ resuming }: { resuming: boolean }) {
  const enabled = storyLiteEnabled();
  const [open, setOpen] = useState(() => enabled && !resuming && !introSeen() && !reducedMotion());
  const [sequence, setSequence] = useState(0);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    skipRef.current?.focus({ preventScroll: true });
    const timer = window.setTimeout(() => { markIntroSeen(); setOpen(false); }, reducedMotion() ? 0 : STORY_INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [open, sequence]);

  if (!enabled) return null;
  const replay = () => {
    if (reducedMotion()) return;
    setSequence(value => value + 1);
    setOpen(true);
  };
  const skip = () => { markIntroSeen(); setOpen(false); };

  return <>
    <div className="t-false-relay-brief-plate">
      <img src={STORY_LITE_KEYART} alt="" decoding="async" />
      <div><span>PACK NETWORK / ENCRYPTED</span><strong>THE FALSE RELAY</strong></div>
      <button type="button" className="t-btn t-false-relay-replay" onClick={replay} disabled={reducedMotion()}>
        REPLAY TRANSMISSION
      </button>
    </div>
    {open ? <div className="t-false-relay-intro" key={sequence} role="dialog" aria-modal="true" aria-label="False Relay intercepted transmission" data-story-intro="playing">
      <img className="t-false-relay-art" src={STORY_LITE_KEYART} alt="" decoding="async" />
      <div className="t-false-relay-vignette" aria-hidden="true" />
      <div className="t-false-relay-amber" aria-hidden="true" />
      <div className="t-false-relay-cyan" aria-hidden="true" />
      <div className="t-false-relay-scan" aria-hidden="true" />
      <header className="t-false-relay-top">
        <div><strong>ALPHA HUSKY</strong><span>TACTICAL OPERATIONS</span></div>
        <button ref={skipRef} type="button" onClick={skip} aria-label="Skip False Relay introduction">SKIP ›</button>
      </header>
      <div className="t-false-relay-copy">
        <span className="t-false-relay-label">FIELD OP / RESTRICTED</span>
        <h2>COUNTERSTRIKE</h2>
        <p className="t-false-relay-subtitle">THE FALSE RELAY</p>
        <div className="t-false-relay-transmission">
          <small>▸ SIGNAL COURIER // INTERCEPT</small>
          <strong>HOUND ACTIVITY DETECTED</strong>
          <span>DEAD RELAY SECTOR · SOURCE UNKNOWN</span>
        </div>
        <div className="t-false-relay-objective">
          <span>PRIMARY OBJECTIVE</span>
          <strong>CAPTURE &amp; HOLD THE RELAY</strong>
          <small>5 clean checkpoints · Clear adjacent hostiles</small>
        </div>
        <p className="t-false-relay-foot">MISSION BRIEF FOLLOWS · DEPLOY IS YOUR DECISION</p>
      </div>
    </div> : null}
  </>;
}

/** Observe only new lines of the already accepted, server-produced radio transcript. */
export function CounterstrikeStoryHoundCue({ radio, runId }: { radio: string[]; runId: string | null }) {
  const enabled = storyLiteEnabled();
  const previous = useRef<{ runId: string | null; seen: Set<string> }>({ runId, seen: new Set(radio) });
  const [wave, setWave] = useState<1 | 2 | null>(null);

  useEffect(() => {
    if (!enabled || !runId) return;
    if (previous.current.runId !== runId) {
      previous.current = { runId, seen: new Set(radio) };
      setWave(null);
      return;
    }
    let arrived: 1 | 2 | null = null;
    for (const line of radio) {
      if (!previous.current.seen.has(line)) arrived = confirmedHoundWave(line) ?? arrived;
      previous.current.seen.add(line);
    }
    if (arrived !== null) setWave(arrived);
  }, [enabled, radio, runId]);

  useEffect(() => {
    if (wave === null) return;
    // Reduced-motion players get a static, readable warning for the same duration.
    const timer = window.setTimeout(() => setWave(null), STORY_HOUND_MS);
    return () => window.clearTimeout(timer);
  }, [wave]);

  if (!enabled || wave === null) return null;
  return <div className="t-false-relay-hound-cue" role="status" aria-label="Confirmed HOUND reinforcement" data-hound-wave={wave}>
    <span>▸ PACK COMMS / VERIFIED</span>
    <strong>HOUND REINFORCEMENTS CONFIRMED</strong>
    <small>WAVE {wave} · RELAY APPROACH UNDER PRESSURE</small>
  </div>;
}

/** The native Results screen remains fully interactive and authoritative. */
export function CounterstrikeStoryAftermath({ result }: { result: CounterstrikeResult | null }) {
  if (!storyLiteEnabled() || !verifiedFalseRelayResult(result)) return null;
  return <div className={`t-false-relay-aftermath ${result.victory ? "is-secured" : "is-lost"}`} data-story-aftermath={result.victory ? "victory" : "defeat"}>
    <img src={STORY_LITE_KEYART} alt="" loading="lazy" decoding="async" />
    <div className="t-false-relay-aftermath-copy">
      <span>OPERATION AFTERMATH / SERVER CONFIRMED</span>
      <strong>{result.victory ? "SIGNAL HELD" : "POSITION LOST"}</strong>
      <small>{result.victory ? "TRANSMISSION PRESERVED" : "RELAY CONTROL DENIED"} · SOURCE UNKNOWN</small>
    </div>
  </div>;
}
