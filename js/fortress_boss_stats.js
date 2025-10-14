// js/fortress_boss_stats.js
// Stałe statystyki bossów Moon Lab (fallback do lokalnej symulacji).
// Uwaga: backend > zawsze wygrywa. To tylko bezpiecznik, gdy backend nie zwróci kroków walki.

(function (w) {
  const B = {
    // Early ladder oparta o CFG z combat.js (widełki L1–L10). 
    // Trzymamy *płaskie* wartości – wystarczą do fallbacku.
    gleam_warden: {
      name: "Gleam Warden", level: 1,
      hpMax: 140, defense: 2, power: 12,
      critChance: 0.10, critMult: 1.5,
      resist_pct: 0.00, dodge_base: 0.06,
      sprite: "images/bosses/gleam_warden.png",
    },
    ion_sentry: {
      name: "Ion Sentry", level: 2,
      hpMax: 180, defense: 4, power: 16,
      critChance: 0.09, critMult: 1.5,
      resist_pct: 0.00, dodge_base: 0.05,
      sprite: "images/bosses/ion_sentry.png",
    },
    shatter_hound: {
      name: "Shatter Hound", level: 3,
      hpMax: 220, defense: 6, power: 22,
      critChance: 0.11, critMult: 1.5,
      resist_pct: 0.00, dodge_base: 0.12,   // szybki przeciwnik
      sprite: "images/bosses/shatter_hound.png",
    },
    flux_corpion: {
      name: "Flux Scorpion", level: 4,
      hpMax: 260, defense: 8, power: 26,
      critChance: 0.12, critMult: 1.55,
      resist_pct: 0.00, dodge_base: 0.07,
      sprite: "images/bosses/flux_corpion.png",
    },
    echo_revenant: {
      name: "Echo Revenant", level: 5,
      hpMax: 325, defense: 10, power: 32,
      critChance: 0.10, critMult: 1.55,
      resist_pct: 0.03, dodge_base: 0.08,
      sprite: "images/bosses/echo_revenant.png",
    },
    neon_goliath: {
      name: "Neon Goliath", level: 6,
      hpMax: 360, defense: 12, power: 36,
      critChance: 0.08, critMult: 1.5,
      resist_pct: 0.05, dodge_base: 0.04,
      sprite: "images/bosses/neon_goliath.png",
    },
    atrium_sentinel: {
      name: "Atrium Sentinel", level: 7,
      hpMax: 440, defense: 14, power: 42,
      critChance: 0.09, critMult: 1.55,
      resist_pct: 0.05, dodge_base: 0.05,
      sprite: "images/bosses/atrium_sentinel.png",
    },
    core_custodian: {
      name: "Core Custodian", level: 8,
      hpMax: 480, defense: 16, power: 46,
      critChance: 0.10, critMult: 1.6,
      resist_pct: 0.06, dodge_base: 0.05,
      sprite: "images/bosses/core_custodian.png",
    },
    lunar_myrmidon: {
      name: "Lunar Myrmidon", level: 9,
      hpMax: 540, defense: 18, power: 52,
      critChance: 0.11, critMult: 1.6,
      resist_pct: 0.07, dodge_base: 0.06,
      sprite: "images/bosses/lunar_myrmidon.png",
    },
    phase_knight: {
      name: "Phase Knight", level: 10,
      hpMax: 600, defense: 20, power: 58,
      critChance: 0.12, critMult: 1.65,
      resist_pct: 0.08, dodge_base: 0.07,
      sprite: "images/bosses/phase_knight.png",
    },
  };

  // Eksport do global scope:
  w.FORTRESS_BOSS_STATS = B;
})(window);
