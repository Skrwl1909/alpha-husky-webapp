export interface ForgeUpgrade {
  key: string;
  name: string;
  stars: number;
  /** Forge-owned presentation URL; optional for legacy providers. */
  imageUrl?: string;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  rows: { label: string; source: string; have: number; need: number; missing: number }[];
}

export interface HostBridge {
  requestClose: () => void;
  openFieldRecord?: () => void;
  forge?: {
    nextUpgrade: () => Promise<ForgeUpgrade | null>;
    openUpgrade: (key: string) => void;
  };
  dbg: boolean;
}

let host: HostBridge = { requestClose: () => {}, dbg: false };

export function setHost(next: Partial<HostBridge>): void {
  host = { ...host, ...next };
}

export function getHost(): HostBridge {
  return host;
}
