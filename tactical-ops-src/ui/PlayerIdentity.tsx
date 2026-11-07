import type { SyntheticEvent } from "react";
import { FIELD_HONOR } from "../data/fieldContracts";
import { FALLBACK_PORTRAIT } from "../data/units";
import { useBattleStore } from "../store/battleStore";

export function portraitFallback(event: SyntheticEvent<HTMLImageElement>): void {
  event.currentTarget.src = FALLBACK_PORTRAIT;
}

export function PlayerIdentityCard() {
  const identity = useBattleStore((s) => s.identity);
  const honor = useBattleStore(s => s.progression?.fieldOps?.fieldContracts?.honor);
  return (
    <div className="t-id-card" aria-label="Player identity">
      <img src={identity.portraitUrl} alt="" onError={portraitFallback} />
      <div>
        <strong>{identity.unitName}</strong>
        <small>{identity.summary}</small>
        {honor ? <small className="t-field-contract-honor">Field Honor · {FIELD_HONOR}</small> : null}
      </div>
    </div>
  );
}
