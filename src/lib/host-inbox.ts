// src/lib/host-inbox.ts
export type HostNotification = {
  id: string;              // uuid-ish
  hostName: string;        // 通知対象の主催者（完全一致）
  listingId: string;
  listingTitle: string;
  when: string;            // ISO文字列
  applicant?: { name?: string };
  status: "unread" | "read";
  type: "join-request" | "message";
};

const KEY = "host:notifications";
const READ = "read" as const;
const UNREAD = "unread" as const;

// ---- storage 基本ユーティリティ ----
function loadAll(): HostNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = JSON.parse(raw || "[]");
    return Array.isArray(arr) ? (arr as HostNotification[]) : [];
  } catch {
    return [];
  }
}

function saveAll(list: HostNotification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  // 受信箱タブに即反映させたい時のシグナル
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
  } catch {}
}

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();

// ---- Public API ----
export function pushNotification(
  n: Omit<HostNotification, "id" | "when" | "status">
) {
  const list = loadAll();
  list.unshift({
    id: uuid(),
    when: new Date().toISOString(),
    status: UNREAD,
    ...n,
  });
  saveAll(list);
}

export function getNotifications(hostName: string): HostNotification[] {
  const target = norm(hostName);
  return loadAll().filter((n) => norm(n.hostName) === target);
}

export function unreadCount(hostName: string): number {
  return getNotifications(hostName).filter((n) => n.status === UNREAD).length;
}

export function markAsRead(id: string) {
  const list = loadAll();
  const i = list.findIndex((x) => x.id === id);
  if (i >= 0) {
    // 点更新：status を READ（リテラル）で上書き
    list[i] = { ...list[i], status: READ };
    saveAll(list);
  }
}

export function markAllRead(hostName: string) {
  const list = loadAll();
  const target = norm(hostName);

  // ★ map ではなく in-place で更新：リテラル型のまま保てる
  let changed = false;
  for (let i = 0; i < list.length; i++) {
    if (norm(list[i].hostName) === target && list[i].status !== READ) {
      list[i] = { ...list[i], status: READ };
      changed = true;
    }
  }
  if (changed) saveAll(list);
}