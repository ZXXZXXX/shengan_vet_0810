import { useSyncExternalStore } from "react";
import type { Role } from "@/lib/mobile-role";

export type Staff = {
  id: string;
  name: string;
  role: Extract<Role, "vet" | "vet_assistant" | "immunizer" | "hoof_trimmer">;
  /** 本场次是否上班 */
  onShift: boolean;
  /** 不在岗原因 */
  offReason?: "leave" | "absent";
};

/** 本场次在岗人员（演示数据） */
export const SHIFT_STAFF: Staff[] = [
  { id: "u1", name: "陈嘉明", role: "vet", onShift: true },
  { id: "u2", name: "周乐言", role: "vet", onShift: true },
  { id: "u3", name: "赵一鸣", role: "vet_assistant", onShift: true },
  { id: "u4", name: "孙静", role: "vet_assistant", onShift: true },
  { id: "u5", name: "王海涛", role: "immunizer", onShift: true },
  { id: "u6", name: "林晓峰", role: "hoof_trimmer", onShift: true },
  { id: "u7", name: "李文博", role: "vet_assistant", onShift: false, offReason: "leave" },
  { id: "u8", name: "郑楠", role: "immunizer", onShift: false, offReason: "absent" },
];

export const offReasonLabel: Record<"leave" | "absent", string> = {
  leave: "请假",
  absent: "未到岗",
};

const KEY = "mp:task-assignee";
const listeners = new Set<() => void>();

function read(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

let snapshot: Record<string, string> | null = null;
function getSnapshot(): Record<string, string> {
  if (!snapshot) snapshot = read();
  return snapshot;
}
const EMPTY: Record<string, string> = {};

export function assignTasks(ids: string[], name: string) {
  if (typeof window === "undefined") return;
  const next = { ...getSnapshot() };
  ids.forEach((id) => {
    next[id] = name;
  });
  localStorage.setItem(KEY, JSON.stringify(next));
  snapshot = next;
  listeners.forEach((fn) => fn());
}

export function useAssignees(): Record<string, string> {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot,
    () => EMPTY,
  );
}
