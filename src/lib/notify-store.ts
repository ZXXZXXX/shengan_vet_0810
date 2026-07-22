import { useSyncExternalStore } from "react";

let unread = 6; // 初始未读数（与 m.notifications 中默认 unread=true 的条数保持一致）
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function setUnreadCount(n: number) {
  const next = Math.max(0, n | 0);
  if (next === unread) return;
  unread = next;
  emit();
}

export function useUnreadCount() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => unread,
    () => unread,
  );
}
