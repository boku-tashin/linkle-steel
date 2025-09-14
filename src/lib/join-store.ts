// src/lib/join-store.ts
const KEY = "linkle_joined_v1";

type JoinedMap = Record<string, { joinedAt: number }>;

function read(): JoinedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as JoinedMap) : {};
  } catch {
    return {};
  }
}

function write(map: JoinedMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {}
}

export function hasJoined(id: string) {
  const map = read();
  return !!map[id];
}

export function join(id: string) {
  const map = read();
  map[id] = { joinedAt: Date.now() };
  write(map);
}

export function leave(id: string) {
  const map = read();
  if (map[id]) {
    delete map[id];
    write(map);
  }
}