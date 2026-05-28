import { useSyncExternalStore } from "react";

// 内部：管理员、兽医、场长、兽医助理；外部：修蹄工等
export type Role =
  | "admin"
  | "vet"
  | "manager"
  | "vet_assistant"
  | "hoof_trimmer";

const KEY = "mp:role";
const listeners = new Set<() => void>();

function read(): Role {
  if (typeof window === "undefined") return "vet_assistant";
  return (localStorage.getItem(KEY) as Role) || "vet_assistant";
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
    () => "vet_assistant"
  );
}

export const roleLabel: Record<Role, string> = {
  admin: "管理员",
  vet: "兽医",
  manager: "场长",
  vet_assistant: "兽医助理",
  hoof_trimmer: "修蹄工",
};

export const roleGroup: Record<Role, "internal" | "external"> = {
  admin: "internal",
  vet: "internal",
  manager: "internal",
  vet_assistant: "internal",
  hoof_trimmer: "external",
};

// 权限：诊断 vs 执行
export function canVisit(r: Role) {
  return r === "admin" || r === "vet" || r === "manager";
}
export function canExecute(r: Role) {
  return (
    r === "admin" || r === "vet_assistant" || r === "hoof_trimmer" || r === "vet"
  );
}
// 是否能查看全场/经营级数据
export function canViewOperations(r: Role) {
  return r === "admin" || r === "manager";
}
