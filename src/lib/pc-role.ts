import { useSyncExternalStore } from "react";

export type PcRole = "admin" | "manager" | "vet" | "assistant";

const KEY = "pc:role";
const listeners = new Set<() => void>();

function read(): PcRole {
  if (typeof window === "undefined") return "admin";
  const v = localStorage.getItem(KEY) as PcRole | null;
  if (v === "admin" || v === "manager" || v === "vet" || v === "assistant") return v;
  return "admin";
}

export function setPcRole(r: PcRole) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, r);
  listeners.forEach((fn) => fn());
}

export function usePcRole(): PcRole {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => "admin",
  );
}

export const pcRoleLabel: Record<PcRole, string> = {
  admin: "超级管理员",
  manager: "场长（可审核）",
  vet: "兽医（可审核）",
  assistant: "兽医助理（仅查看）",
};

/** 是否拥有"审核（通过/驳回）"权限 */
export function canReview(r: PcRole): boolean {
  return r === "admin" || r === "vet" || r === "manager";
}

/** 是否为超级管理员（可管理角色等） */
export function isSuperAdmin(r: PcRole): boolean {
  return r === "admin";
}
