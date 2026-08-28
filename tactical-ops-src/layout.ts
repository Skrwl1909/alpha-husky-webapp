/**
 * Viewport-first layout resolver.
 * Never keys off orientation (innerWidth < innerHeight) and never gates play.
 */
export type TacticalLayout = "compact" | "standard" | "wide";

export interface ViewportSize {
  width: number;
  height: number;
}

/** Compact: phones + narrow Telegram Desktop Mini App panels. */
export const COMPACT_MAX = 599;
/** Standard: tablets / medium Mini App windows. */
export const STANDARD_MAX = 899;

export function resolveTacticalLayout(width: number, height: number): TacticalLayout {
  const w = Math.max(0, Math.round(width));
  void height;
  if (w <= COMPACT_MAX) return "compact";
  if (w <= STANDARD_MAX) return "standard";
  return "wide";
}

export const ACCEPTANCE_VIEWPORTS: Array<ViewportSize & { name: string; expect: TacticalLayout }> = [
  { name: "320x568", width: 320, height: 568, expect: "compact" },
  { name: "360x800", width: 360, height: 800, expect: "compact" },
  { name: "390x844", width: 390, height: 844, expect: "compact" },
  { name: "430x932", width: 430, height: 932, expect: "compact" },
  { name: "768x1024", width: 768, height: 1024, expect: "standard" },
  { name: "1280x720", width: 1280, height: 720, expect: "wide" },
  { name: "1920x1080", width: 1920, height: 1080, expect: "wide" },
  { name: "telegram-narrow", width: 420, height: 720, expect: "compact" },
];
