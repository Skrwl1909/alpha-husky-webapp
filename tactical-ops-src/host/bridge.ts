export interface HostBridge {
  requestClose: () => void;
  openFieldRecord?: () => void;
  dbg: boolean;
}

let host: HostBridge = { requestClose: () => {}, dbg: false };

export function setHost(next: Partial<HostBridge>): void {
  host = { ...host, ...next };
}

export function getHost(): HostBridge {
  return host;
}
