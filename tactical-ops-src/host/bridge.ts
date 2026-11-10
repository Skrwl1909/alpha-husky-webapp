export interface ForgeUpgrade {
  key: string;
  name: string;
  stars: number;
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
