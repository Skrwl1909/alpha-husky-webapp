import type { ComponentProps } from "react";
import { SignalAtlas } from "./signalAtlas/SignalAtlas";

/** The official Skillbook uses only canonical, server-owned Atlas progression. */
export function SkillbookPanel({ onClose, onOpenMastery, target }: ComponentProps<typeof SignalAtlas>) {
  return target ? <SignalAtlas onClose={onClose} onOpenMastery={onOpenMastery} target={target} /> : <SignalAtlas onClose={onClose} onOpenMastery={onOpenMastery} />;
}
