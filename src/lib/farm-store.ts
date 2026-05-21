import { useSyncExternalStore } from "react";

export type Farm = {
  id: string;
  name: string;
  region: string;
  scale: string;
};

export const FARMS: Farm[] = [
  { id: "f1", name: "1 号牧场", region: "黑龙江·齐齐哈尔", scale: "存栏 1,284" },
  { id: "f2", name: "2 号牧场", region: "黑龙江·大庆", scale: "存栏 968" },
  { id: "f3", name: "3 号牧场", region: "内蒙古·呼伦贝尔", scale: "存栏 2,150" },
  { id: "f4", name: "4 号牧场", region: "山东·济宁", scale: "存栏 720" },
  { id: "f5", name: "5 号牧场", region: "宁夏·吴忠", scale: "存栏 1,032" },
];

const KEY = "mp:farmId";
const listeners = new Set<() => void>();

function read(): string {
  if (typeof window === "undefined") return FARMS[0].id;
  return localStorage.getItem(KEY) || FARMS[0].id;
}

export function setFarmId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, id);
  listeners.forEach((fn) => fn());
}

export function useFarmId(): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    read,
    () => FARMS[0].id
  );
}

export function useFarm(): Farm {
  const id = useFarmId();
  return FARMS.find((f) => f.id === id) ?? FARMS[0];
}
