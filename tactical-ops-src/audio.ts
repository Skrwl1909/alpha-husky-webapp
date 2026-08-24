let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem("tactical-ops-mute", value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function loadMuted(): boolean {
  try {
    muted = localStorage.getItem("tactical-ops-mute") === "1";
  } catch {
    muted = false;
  }
  return muted;
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.05, delay = 0): void {
  if (muted) return;
  const a = getCtx();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(1e-4, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
  osc.connect(g);
  g.connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function sfx(
  name: "select" | "ui" | "move" | "hit" | "guard" | "heal" | "turn" | "win" | "lose" | "status",
): void {
  switch (name) {
    case "select":
      beep(620, 0.06, "triangle", 0.03);
      break;
    case "ui":
      beep(480, 0.05, "square", 0.02);
      break;
    case "move":
      beep(220, 0.08, "sine", 0.03);
      break;
    case "hit":
      beep(140, 0.1, "sawtooth", 0.06);
      beep(90, 0.12, "square", 0.03, 0.02);
      break;
    case "guard":
      beep(360, 0.1, "triangle", 0.04);
      break;
    case "heal":
      beep(520, 0.1, "sine", 0.04);
      beep(780, 0.12, "sine", 0.03, 0.05);
      break;
    case "turn":
      beep(180, 0.14, "triangle", 0.04);
      beep(240, 0.12, "sine", 0.03, 0.08);
      break;
    case "win":
      beep(440, 0.16, "triangle", 0.05);
      beep(660, 0.2, "triangle", 0.045, 0.12);
      break;
    case "lose":
      beep(160, 0.22, "sawtooth", 0.04);
      beep(90, 0.28, "sine", 0.04, 0.1);
      break;
    case "status":
      beep(400, 0.08, "triangle", 0.03);
      break;
  }
}
