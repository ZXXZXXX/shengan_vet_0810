import { useSyncExternalStore } from "react";

// 内部：管理员、兽医、场长、兽医助理、免疫员；外部：修蹄工等
export type Role =
  | "admin"
  | "vet"
  | "manager"
  | "vet_assistant"
  | "immunizer"
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
  immunizer: "免疫员",
  hoof_trimmer: "修蹄工",
};

export const roleGroup: Record<Role, "internal" | "external"> = {
  admin: "internal",
  vet: "internal",
  manager: "internal",
  vet_assistant: "internal",
  immunizer: "internal",
  hoof_trimmer: "external",
};

// 权限：诊断 vs 执行
export function canVisit(r: Role) {
  return r === "admin" || r === "vet" || r === "manager";
}
export function canExecute(r: Role) {
  return (
    r === "vet_assistant" ||
    r === "immunizer" ||
    r === "hoof_trimmer" ||
    r === "vet" ||
    r === "manager"
  );
}
// 诊断权限：兽医/场长可诊断疾病；管理员仅查看
export function canDiagnose(r: Role, type?: string) {
  if (r === "vet" || r === "manager") return type === "疾病治疗";
  return false;
}
// 是否能查看全场/经营级数据：兽医与场长一致
export function canViewOperations(r: Role) {
  return r === "admin" || r === "manager" || r === "vet";
}


