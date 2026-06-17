import { useSyncExternalStore, useMemo } from "react";

export type PickupItem = {
  name: string;
  spec?: string;
  qty: string;
  stock?: string; // 当前库存
  /** 情况一：最小单位有二维码，每个都可单独扫码录入。情况二（false）：仅上级包装有码，按包扫描后输入数量。 */
  unitScannable?: boolean;
  /** 情况二专用：该药品当前打开包装内剩余数量（用于限定最大可取数量） */
  packRemain?: number;
};

/** 从「2 瓶」「6 支」等文本中解析数量与单位 */
export function parseQty(qty: string): { num: number; unit: string } {
  const m = qty.match(/^\s*(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return { num: 0, unit: "" };
  return { num: Number(m[1]), unit: (m[2] ?? "").trim() };
}

export type PickupResult = "claimed" | "invalidated";

export type Pickup = {
  id: string;
  title: string;
  source: string; // 关联工作/损耗单
  barn: string;
  approvedAt: string;
  visitor: string;
  warehouse: string;
  items: PickupItem[];
  result?: PickupResult; // 历史结果状态
  handledAt?: string; // 处理时间
  invalidReason?: string; // 无需领物原因
};

export const PICKUPS: Pickup[] = [
  {
    id: "PK-2381",
    title: "退烧治疗药品领取",
    source: "WO-2381",
    barn: "3 号牛舍",
    approvedAt: "今日 09:42",
    visitor: "张磊（场长）",
    warehouse: "中央药房 · A 区货架 03",
    items: [
      { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", qty: "2 瓶", stock: "12 瓶" },
      { name: "头孢噻呋钠", spec: "1g / 支", qty: "6 支", stock: "48 支" },
    ],
  },
  {
    id: "PK-1029",
    title: "口蹄疫疫苗补领",
    source: "LS-1029",
    barn: "2 号牛舍",
    approvedAt: "今日 10:15",
    visitor: "刘洋（兽医）",
    warehouse: "冷链库 · 冷柜 #3",
    items: [
      { name: "口蹄疫疫苗 A 型", spec: "10ml / 支", qty: "8 支", stock: "60 支" },
    ],
  },
];

/** 既往记录（已领取 / 已失效） */
export const PICKUP_HISTORY: Pickup[] = [
  {
    id: "PK-2103",
    title: "产后护理药品领取",
    source: "WO-2103",
    barn: "1 号牛舍",
    approvedAt: "昨日 14:20",
    visitor: "王芳（兽医）",
    warehouse: "中央药房 · B 区货架 01",
    items: [
      { name: "钙注射液", spec: "500ml / 瓶", qty: "1 瓶" },
      { name: "维生素 AD", spec: "10ml / 支", qty: "3 支" },
    ],
    result: "claimed",
    handledAt: "昨日 15:05",
  },
  {
    id: "PK-2098",
    title: "蹄病治疗药品领取",
    source: "WO-2098",
    barn: "4 号牛舍",
    approvedAt: "昨日 09:10",
    visitor: "张磊（场长）",
    warehouse: "中央药房 · A 区货架 05",
    items: [
      { name: "蹄浴液", spec: "5L / 桶", qty: "1 桶" },
    ],
    result: "claimed",
    handledAt: "昨日 10:30",
  },
  {
    id: "PK-2085",
    title: "驱虫药品领取",
    source: "WO-2085",
    barn: "2 号牛舍",
    approvedAt: "05-24 16:00",
    visitor: "刘洋（兽医）",
    warehouse: "中央药房 · C 区货架 02",
    items: [
      { name: "伊维菌素", spec: "50ml / 瓶", qty: "2 瓶" },
    ],
    result: "invalidated",
    handledAt: "05-24 16:30",
    invalidReason: "现场已有备用物资",
  },
  {
    id: "PK-2072",
    title: "退烧药品领取",
    source: "WO-2072",
    barn: "3 号牛舍",
    approvedAt: "05-23 08:30",
    visitor: "王芳（兽医）",
    warehouse: "中央药房 · A 区货架 02",
    items: [
      { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", qty: "1 瓶" },
    ],
    result: "invalidated",
    handledAt: "05-23 09:00",
    invalidReason: "由其他人代为领取",
  },
];

const KEY = "mp:pickup-claimed";
const INVALIDATED_KEY = "mp:pickup-invalidated";
const SCANNED_ITEMS_KEY = "mp:pickup-scanned-items";
const listeners = new Set<() => void>();

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function readInvalidatedMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(INVALIDATED_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function readScannedItemsMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SCANNED_ITEMS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

let claimedSnapshot: string[] = typeof window === "undefined" ? [] : Array.from(readSet(KEY));
let invalidatedSnapshot: Record<string, string> = typeof window === "undefined" ? {} : readInvalidatedMap();
let scannedItemsSnapshot: Record<string, string[]> = typeof window === "undefined" ? {} : readScannedItemsMap();

function refresh() {
  claimedSnapshot = Array.from(readSet(KEY));
  invalidatedSnapshot = readInvalidatedMap();
  scannedItemsSnapshot = readScannedItemsMap();
  listeners.forEach((fn) => fn());
}

export function scanPickupItem(pickupId: string, itemName: string) {
  if (typeof window === "undefined") return;
  const map = readScannedItemsMap();
  const cur = new Set(map[pickupId] ?? []);
  cur.add(itemName);
  map[pickupId] = Array.from(cur);
  localStorage.setItem(SCANNED_ITEMS_KEY, JSON.stringify(map));
  refresh();
}

export function unscanPickupItem(pickupId: string, itemName: string) {
  if (typeof window === "undefined") return;
  const map = readScannedItemsMap();
  const cur = new Set(map[pickupId] ?? []);
  cur.delete(itemName);
  map[pickupId] = Array.from(cur);
  localStorage.setItem(SCANNED_ITEMS_KEY, JSON.stringify(map));
  refresh();
}

export function useScannedItems(pickupId: string): string[] {
  const all = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => scannedItemsSnapshot,
    () => scannedItemsSnapshot,
  );
  return all[pickupId] ?? [];
}


export function claimPickup(id: string) {
  if (typeof window === "undefined") return;
  const set = readSet(KEY);
  set.add(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  refresh();
}

export function unclaimPickup(id: string) {
  if (typeof window === "undefined") return;
  const set = readSet(KEY);
  set.delete(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  refresh();
}

export function invalidatePickup(id: string, reason?: string) {
  if (typeof window === "undefined") return;
  const map = readInvalidatedMap();
  map[id] = reason || "";
  localStorage.setItem(INVALIDATED_KEY, JSON.stringify(map));
  refresh();
}

export function useClaimed(): string[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => claimedSnapshot,
    () => claimedSnapshot
  );
}

export function useInvalidated(): Record<string, string> {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => invalidatedSnapshot,
    () => invalidatedSnapshot
  );
}

export function usePickupHistory(): Pickup[] {
  const claimed = useClaimed();
  const invalidated = useInvalidated();
  return useMemo(() => {
    const dynamicClaimed = PICKUPS.filter((p) => claimed.includes(p.id)).map((p) => ({
      ...p,
      result: "claimed" as PickupResult,
    }));
    const dynamicInvalidated = PICKUPS.filter((p) => Object.prototype.hasOwnProperty.call(invalidated, p.id)).map((p) => ({
      ...p,
      result: "invalidated" as PickupResult,
      invalidReason: invalidated[p.id],
    }));
    return [...PICKUP_HISTORY, ...dynamicClaimed, ...dynamicInvalidated].sort((a, b) => {
      const ta = a.handledAt || a.approvedAt;
      const tb = b.handledAt || b.approvedAt;
      return tb.localeCompare(ta);
    });
  }, [claimed, invalidated]);
}

export function isClaimed(id: string, claimed: string[]) {
  return claimed.includes(id);
}

export function getPickup(id: string): Pickup | null {
  const found =
    PICKUPS.find((p) => p.id === id) ??
    PICKUP_HISTORY.find((p) => p.id === id);
  if (found) return found;
  // 合成兜底数据，避免从工单跳转过来时领取单为空
  const source = id.replace(/^PK-?/i, "");
  return {
    id,
    title: "诊疗物资领取",
    source: source.startsWith("LS") ? source : `WO-${source.replace(/^WO-?/i, "")}`,
    barn: "3 号牛舍",
    approvedAt: "今日 09:42",
    visitor: "王医生",
    warehouse: "中央药房 · A 区货架 03",
    items: [
      { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", qty: "2 瓶", stock: "12 瓶" },
      { name: "头孢噻呋钠", spec: "1g / 支", qty: "6 支", stock: "48 支" },
    ],
  };
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
