import { useSyncExternalStore } from "react";

export type PickupItem = {
  name: string;
  spec?: string;
  qty: string;
};

export type Pickup = {
  id: string;
  title: string;
  source: string; // 关联工作/损耗单
  barn: string;
  approvedAt: string;
  approver: string;
  warehouse: string;
  items: PickupItem[];
};

export const PICKUPS: Pickup[] = [
  {
    id: "PK-2381",
    title: "退烧治疗药品领取",
    source: "WO-2381",
    barn: "3 号牛舍",
    approvedAt: "今日 09:42",
    approver: "张磊（场长）",
    warehouse: "中央药房 · A 区货架 03",
    items: [
      { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", qty: "2 瓶" },
      { name: "头孢噻呋钠", spec: "1g / 支", qty: "6 支" },
      { name: "一次性注射器", spec: "20ml", qty: "8 支" },
    ],
  },
  {
    id: "PK-1029",
    title: "口蹄疫疫苗补领",
    source: "LS-1029",
    barn: "2 号牛舍",
    approvedAt: "今日 10:15",
    approver: "刘洋（兽医）",
    warehouse: "冷链库 · 冷柜 #3",
    items: [
      { name: "口蹄疫疫苗 A 型", spec: "10ml / 支", qty: "8 支" },
      { name: "保温运输袋", spec: "小号", qty: "1 个" },
    ],
  },
];

const KEY = "mp:pickup-claimed";
const listeners = new Set<() => void>();

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

let snapshot: string[] = typeof window === "undefined" ? [] : Array.from(readSet());

function refresh() {
  snapshot = Array.from(readSet());
  listeners.forEach((fn) => fn());
}

export function claimPickup(id: string) {
  if (typeof window === "undefined") return;
  const set = readSet();
  set.add(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  refresh();
}

export function unclaimPickup(id: string) {
  if (typeof window === "undefined") return;
  const set = readSet();
  set.delete(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  refresh();
}

export function useClaimed(): string[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => snapshot
  );
}

export function isClaimed(id: string, claimed: string[]) {
  return claimed.includes(id);
}

export function getPickup(id: string) {
  return PICKUPS.find((p) => p.id === id) ?? null;
}

/** Fake QR pattern (deterministic from id) */
export function qrMatrix(seed: string, size = 21): boolean[][] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 0xffffffff;
  };
  const m: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => rand() > 0.55)
  );
  // finder patterns (corners)
  const stamp = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++)
      for (let j = -1; j <= 7; j++) {
        const rr = r + i,
          cc = c + j;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        if (i === -1 || i === 7 || j === -1 || j === 7) m[rr][cc] = false;
        else if (i === 0 || i === 6 || j === 0 || j === 6) m[rr][cc] = true;
        else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) m[rr][cc] = true;
        else m[rr][cc] = false;
      }
  };
  stamp(0, 0);
  stamp(0, size - 7);
  stamp(size - 7, 0);
  return m;
}
