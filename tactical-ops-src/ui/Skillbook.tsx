import { SignalAtlas } from "./signalAtlas/SignalAtlas";

/** The official Skillbook uses only canonical, server-owned Atlas progression. */
export function SkillbookPanel({ onClose }: { onClose: () => void }) {
  return <SignalAtlas onClose={onClose} />;
}
