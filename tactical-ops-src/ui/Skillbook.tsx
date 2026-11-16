import type { ComponentProps } from "react";
import { SignalAtlas } from "./signalAtlas/SignalAtlas";

/** The official Skillbook uses only canonical, server-owned Atlas progression. */
export function SkillbookPanel({ onClose, target }: ComponentProps<typeof SignalAtlas>) {
  return target ? <SignalAtlas onClose={onClose} target={target} /> : <SignalAtlas onClose={onClose} />;
}
