import { useSyncExternalStore } from "react";

export type Role = "worker" | "manager";

const KEY = "mp:role";
const listeners = new Set<() => void>();

function read(): Role {
  if (typeof window === "undefined") return "worker";
  return (localStorage.getItem(KEY) as Role) || "worker";
}

export function setRole(r: Role) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, r);
  listeners.forEach((fn) => fn());
}

export function useRole(): Role {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "worker"
  );
}

export const roleLabel: Record<Role, string> = {
  worker: "一线工作人员",
  manager: "牧场管理者",
};
