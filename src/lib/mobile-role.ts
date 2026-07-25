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
// 场长(manager)：不参与工单处理，仅能查看自己上报的工单；不能诊断也不能执行
export function canVisit(r: Role) {
  return r === "admin" || r === "vet";
}
export function canExecute(r: Role) {
  return (
    r === "vet_assistant" ||
    r === "immunizer" ||
    r === "hoof_trimmer" ||
    r === "vet"
  );
}
// 诊断权限：仅兽医可诊断疾病；管理员/场长仅查看
export function canDiagnose(r: Role, type?: string) {
  if (r === "vet") return type === "疾病治疗" || type === "产后护理";
  return false;
}
// 是否能查看全场/经营级数据：管理员/场长/兽医
export function canViewOperations(r: Role) {
  return r === "admin" || r === "manager" || r === "vet";
}
// 场长登录账号名（用于"仅查看自己上报的工单"过滤）
export const MANAGER_ACCOUNT_NAME = "李雨晴";


