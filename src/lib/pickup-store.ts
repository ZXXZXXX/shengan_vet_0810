import { useSyncExternalStore, useMemo } from "react";

export type StockSource = {
  manufacturer: string;
  qty: number; // 该厂商剩余库存
  unit?: string;
};

export type PickupItem = {
  name: string;
  spec?: string;
  qty: string;
  stock?: string; // 当前库存
  usage?: string; // 用法，如 "2ml / 次 · 肌肉注射"
  /** 情况一：最小单位有二维码，每个都可单独扫码录入。情况二（false）：仅上级包装有码，按包扫描后输入数量。 */
  unitScannable?: boolean;
  /** 情况二专用：该药品当前打开包装内剩余数量（用于限定最大可取数量） */
  packRemain?: number;
  /** 本牧场库存中该药品的厂商分布 */
  stockSources?: StockSource[];
  /** 后台规则：是否允许多厂商混用，默认 true */
  allowMixManufacturer?: boolean;
  /** 是否属于药品；false 表示物料/耗材，不进入药品清单统计 */
  isMedicine?: boolean;
};

export type ScannedEntry = {
  code: string;
  qty: number; // 情况一恒为 1；情况二为该包装下取数
  /** 情况二：该次扫描的包装内剩余可取数量 */
  packRemain?: number;
  /** 厂商 */
  manufacturer?: string;
  /** 批号 */
  batch?: string;
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
    barn: "病牛舍 A",
    approvedAt: "今日 09:42",
    visitor: "张磊（场长）",
    warehouse: "中央药房 · A 区货架 03",
    items: [
      {
        name: "氟尼辛葡甲胺注射液",
        spec: "100ml / 瓶",
        qty: "2 瓶",
        stock: "12 瓶",
        usage: "2ml / 次 · 肌肉注射",
        unitScannable: true,
        allowMixManufacturer: false,
        stockSources: [
          { manufacturer: "齐鲁动保", qty: 8, unit: "瓶" },
          { manufacturer: "瑞普生物", qty: 4, unit: "瓶" },
        ],
      },
      {
        name: "头孢噻呋钠",
        spec: "1g / 支",
        qty: "6 支",
        stock: "48 支",
        usage: "1g / 次 · 肌肉注射",
        unitScannable: false,
        packRemain: 20,
        allowMixManufacturer: true,
        stockSources: [
          { manufacturer: "中牧股份", qty: 30, unit: "支" },
          { manufacturer: "辉瑞动保", qty: 18, unit: "支" },
        ],
      },
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
  {
    id: "PK-2299",
    title: "蹄叶炎复发治疗药品领取",
    source: "WO-2299",
    barn: "病牛舍 A",
    approvedAt: "今日 08:50",
    visitor: "刘洋(兽医)",
    warehouse: "中央药房 · A 区货架 02",
    items: [
      {
        name: "氟尼辛葡甲胺注射液",
        spec: "100ml / 瓶",
        qty: "1 瓶",
        stock: "12 瓶",
        usage: "2ml / 次 · 肌肉注射",
        unitScannable: true,
        allowMixManufacturer: false,
        stockSources: [
          { manufacturer: "齐鲁动保", qty: 8, unit: "瓶" },
        ],
      },
      {
        name: "硫酸铜溶液",
        spec: "500ml / 瓶",
        qty: "1 瓶",
        stock: "20 瓶",
        usage: "蹄浴",
        unitScannable: true,
        allowMixManufacturer: true,
      },
    ],
  },
  {
    id: "PK-2301",
    title: "肺炎抗生素治疗药品领取",
    source: "WO-2301",
    barn: "病牛舍 B",
    approvedAt: "今日 09:10",
    visitor: "王芳(兽医)",
    warehouse: "中央药房 · A 区货架 03",
    items: [
      {
        name: "头孢噻呋钠",
        spec: "1g / 支",
        qty: "5 支",
        stock: "48 支",
        usage: "1g / 次 · 肌肉注射",
        unitScannable: false,
        packRemain: 20,
        allowMixManufacturer: true,
        stockSources: [
          { manufacturer: "中牧股份", qty: 30, unit: "支" },
        ],
      },
    ],
  },
  {
    id: "PK-2501",
    title: "产后护理药品领取",
    source: "PP-2501",
    barn: "病牛舍 A",
    approvedAt: "今日 09:30",
    visitor: "王芳(兽医)",
    warehouse: "中央药房 · B 区货架 01",
    items: [
      {
        name: "钙注射液",
        spec: "500ml / 瓶",
        qty: "1 瓶",
        stock: "30 瓶",
        usage: "静脉注射",
        unitScannable: true,
        allowMixManufacturer: true,
      },
      {
        name: "维生素 AD",
        spec: "10ml / 支",
        qty: "3 支",
        stock: "50 支",
        usage: "肌肉注射",
        unitScannable: true,
        allowMixManufacturer: true,
      },
    ],
  },
  // 更多疾病治疗 待执行（覆盖多牛舍，便于"统计药品清单"演示）
  ...([
    { wo: "WO-2298", title: "乳房炎复诊处置药品领取", barn: "病牛舍 A",
      items: [
        { name: "头孢噻呋钠", spec: "1g / 支", qty: "4 支", stock: "48 支", usage: "1g / 次 · 肌肉注射",
          unitScannable: false, packRemain: 16, allowMixManufacturer: true,
          stockSources: [{ manufacturer: "中牧股份", qty: 30, unit: "支" }] },
      ] },
    { wo: "WO-2300", title: "子宫炎第 2 日疗程药品领取", barn: "病牛舍 B",
      items: [
        { name: "氯前列烯醇注射液", spec: "2ml / 支", qty: "2 支", stock: "20 支", usage: "2ml / 次 · 肌肉注射",
          unitScannable: true, allowMixManufacturer: false,
          stockSources: [{ manufacturer: "齐鲁动保", qty: 10, unit: "支" }] },
        { name: "宫炎清", spec: "100ml / 瓶", qty: "1 瓶", stock: "8 瓶", usage: "子宫灌注",
          unitScannable: true, allowMixManufacturer: true },
      ] },
    { wo: "WO-2302", title: "蹄部脓肿排脓物资领取", barn: "病牛舍 B",
      items: [
        { name: "碘酊", spec: "100ml / 瓶", qty: "1 瓶", stock: "30 瓶", usage: "蹄部消毒",
          unitScannable: true, allowMixManufacturer: true },
        { name: "蹄绷带", spec: "1 卷", qty: "2 卷", stock: "50 卷", usage: "蹄部包扎",
          unitScannable: true, allowMixManufacturer: true, isMedicine: false },
      ] },
    { wo: "WO-2303", title: "酮病补液药品领取", barn: "病牛舍 A",
      items: [
        { name: "葡萄糖注射液", spec: "500ml / 瓶", qty: "2 瓶", stock: "40 瓶", usage: "静脉注射",
          unitScannable: true, allowMixManufacturer: true },
        { name: "丙二醇", spec: "1L / 瓶", qty: "1 瓶", stock: "12 瓶", usage: "灌服",
          unitScannable: true, allowMixManufacturer: true },
      ] },
    { wo: "WO-2440", title: "乳房炎复查药品领取", barn: "病牛舍 B",
      items: [
        { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", qty: "1 瓶", stock: "12 瓶", usage: "2ml / 次 · 肌肉注射",
          unitScannable: true, allowMixManufacturer: false,
          stockSources: [{ manufacturer: "齐鲁动保", qty: 8, unit: "瓶" }] },
      ] },
  ] as const).map((v) => ({
    id: `PK-${v.wo}`,
    title: v.title,
    source: v.wo,
    barn: v.barn,
    approvedAt: "今日 09:00",
    visitor: "王芳(兽医)",
    warehouse: "中央药房 · A 区",
    items: [...v.items] as PickupItem[],
  })),
  // ============ 疫苗免疫 工单领药 ============
  ...([
    { wo: "YM-1041", title: "口蹄疫加强免疫 疫苗领取", barn: "犊牛舍 A", vaccine: "口蹄疫疫苗 A 型", spec: "10ml / 支", qty: "9 支" },
    { wo: "YM-1042", title: "布病强免疫 疫苗领取", barn: "2 号牛舍", vaccine: "布鲁氏菌活疫苗", spec: "5ml / 支", qty: "6 支" },
    { wo: "YM-1043", title: "牛流行热免疫 疫苗领取", barn: "1 号牛舍", vaccine: "牛流行热灭活疫苗", spec: "10ml / 支", qty: "5 支" },
    { wo: "YM-1044", title: "炭疽芽孢苗免疫 疫苗领取", barn: "3 号牛舍", vaccine: "无毒炭疽芽孢苗", spec: "5ml / 支", qty: "7 支" },
    { wo: "YM-1045", title: "副伤寒免疫批次 疫苗领取", barn: "犊牛舍 B", vaccine: "副伤寒灭活疫苗", spec: "10ml / 支", qty: "4 支" },
    { wo: "YM-1046", title: "漏针补免 疫苗领取", barn: "1 号牛舍", vaccine: "口蹄疫疫苗 A 型", spec: "10ml / 支", qty: "1 支" },
    { wo: "YM-1047", title: "结核检疫排查 试剂领取", barn: "全场", vaccine: "牛型结核菌素", spec: "5ml / 支", qty: "8 支" },
  ] as const).map((v, i) => ({
    id: `PK-${v.wo}`,
    title: v.title,
    source: v.wo,
    barn: v.barn,
    approvedAt: "今日 08:30",
    visitor: "李强(免疫员)",
    warehouse: "冷链库 · 冷柜 #3",
    items: [
      {
        name: v.vaccine,
        spec: v.spec,
        qty: v.qty,
        stock: `${60 + i * 4} 支`,
        usage: "颈部肌肉注射",
        unitScannable: true,
        allowMixManufacturer: false,
        stockSources: [
          { manufacturer: "中牧股份", qty: 30 + i * 2, unit: "支" },
        ],
      },
    ],
  })),
  // ============ 修蹄 工单领药 ============
  ...([
    { wo: "HF-0702", title: "趾间皮炎处置 物资领取", barn: "1 号牛舍" },
    { wo: "HF-0703", title: "批次修蹄 物资领取", barn: "1 号牛舍" },
    { wo: "HF-0704", title: "异常步态修蹄 物资领取", barn: "2 号牛舍" },
    { wo: "HF-0705", title: "蹄底溃疡处置 物资领取", barn: "3 号牛舍" },
    { wo: "HF-0706", title: "干奶前修蹄 物资领取", barn: "3 号牛舍" },
    { wo: "HF-0707", title: "复查修蹄效果 物资领取", barn: "4 号牛舍" },
    { wo: "HF-0708", title: "蹄部清洁与浴蹄 物资领取", barn: "犊牛舍 A" },
  ] as const).map((v) => ({
    id: `PK-${v.wo}`,
    title: v.title,
    source: v.wo,
    barn: v.barn,
    approvedAt: "今日 08:50",
    visitor: "周斌(修蹄工)",
    warehouse: "中央药房 · A 区货架 05",
    items: [
      {
        name: "硫酸铜溶液",
        spec: "500ml / 瓶",
        qty: "1 瓶",
        stock: "20 瓶",
        usage: "蹄浴",
        unitScannable: true,
        allowMixManufacturer: true,
      },
      {
        name: "碘酊",
        spec: "100ml / 瓶",
        qty: "1 瓶",
        stock: "30 瓶",
        usage: "蹄部消毒",
        unitScannable: true,
        allowMixManufacturer: true,
      },
      {
        name: "蹄绷带",
        spec: "1 卷",
        qty: "2 卷",
        stock: "50 卷",
        usage: "蹄部包扎",
        unitScannable: true,
        allowMixManufacturer: true,
      },
    ],
  })),
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

const KEY = "mp:pickup-claimed:v2";
const INVALIDATED_KEY = "mp:pickup-invalidated:v2";
const SCANNED_CODES_KEY = "mp:pickup-scanned-codes:v2";
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

type ScannedCodesMap = Record<string, Record<string, ScannedEntry[]>>;

function readScannedCodesMap(): ScannedCodesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SCANNED_CODES_KEY);
    return raw ? (JSON.parse(raw) as ScannedCodesMap) : {};
  } catch {
    return {};
  }
}

let claimedSnapshot: string[] = typeof window === "undefined" ? [] : Array.from(readSet(KEY));
let invalidatedSnapshot: Record<string, string> = typeof window === "undefined" ? {} : readInvalidatedMap();
let scannedCodesSnapshot: ScannedCodesMap = typeof window === "undefined" ? {} : readScannedCodesMap();

function refresh() {
  claimedSnapshot = Array.from(readSet(KEY));
  invalidatedSnapshot = readInvalidatedMap();
  scannedCodesSnapshot = readScannedCodesMap();
  listeners.forEach((fn) => fn());
}

function writeScannedCodes(map: ScannedCodesMap) {
  localStorage.setItem(SCANNED_CODES_KEY, JSON.stringify(map));
  refresh();
}

export function addScannedEntry(pickupId: string, itemName: string, entry: ScannedEntry) {
  if (typeof window === "undefined") return;
  const map = readScannedCodesMap();
  const list = [...(map[pickupId]?.[itemName] ?? []), entry];
  map[pickupId] = { ...(map[pickupId] ?? {}), [itemName]: list };
  writeScannedCodes(map);
}

export function updateScannedEntryQty(
  pickupId: string,
  itemName: string,
  index: number,
  qty: number,
) {
  if (typeof window === "undefined") return;
  const map = readScannedCodesMap();
  const list = [...(map[pickupId]?.[itemName] ?? [])];
  if (!list[index]) return;
  list[index] = { ...list[index], qty };
  map[pickupId] = { ...(map[pickupId] ?? {}), [itemName]: list };
  writeScannedCodes(map);
}

export function removeScannedEntry(pickupId: string, itemName: string, index: number) {
  if (typeof window === "undefined") return;
  const map = readScannedCodesMap();
  const list = (map[pickupId]?.[itemName] ?? []).filter((_, i) => i !== index);
  map[pickupId] = { ...(map[pickupId] ?? {}), [itemName]: list };
  writeScannedCodes(map);
}

export function useScannedCodes(pickupId: string): Record<string, ScannedEntry[]> {
  const all = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => scannedCodesSnapshot,
    () => scannedCodesSnapshot,
  );
  return all[pickupId] ?? {};
}

/** 生成一个仿真扫码值 */
export function genScanCode(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rnd = Math.floor(Math.random() * 0xfff)
    .toString(16)
    .toUpperCase()
    .padStart(3, "0");
  return `${prefix}-${ts}${rnd}`;
}

const MANUFACTURER_POOL = ["齐鲁动保", "瑞普生物", "中牧股份", "辉瑞动保", "勃林格"];

/** 基于药品名稳定生成厂商，避免每次重渲染抖动 */
export function pickManufacturer(itemName: string, index: number): string {
  let h = 0;
  for (let i = 0; i < itemName.length; i++) h = (h * 31 + itemName.charCodeAt(i)) >>> 0;
  return MANUFACTURER_POOL[(h + index) % MANUFACTURER_POOL.length];
}

/** 生成批号 */
export function genBatch(): string {
  const yr = 2026;
  const mm = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const dd = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  const prefix = ["L", "B", "C", "K"][Math.floor(Math.random() * 4)];
  return `${prefix}${yr}${mm}${dd}`;
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
      {
        name: "氟尼辛葡甲胺注射液",
        spec: "100ml / 瓶",
        qty: "2 瓶",
        stock: "12 瓶",
        usage: "2ml / 次 · 肌肉注射",
        unitScannable: true,
        allowMixManufacturer: false,
        stockSources: [
          { manufacturer: "齐鲁动保", qty: 8, unit: "瓶" },
          { manufacturer: "瑞普生物", qty: 4, unit: "瓶" },
        ],
      },
      {
        name: "头孢噻呋钠",
        spec: "1g / 支",
        qty: "6 支",
        stock: "48 支",
        usage: "1g / 次 · 肌肉注射",
        unitScannable: false,
        packRemain: 20,
        allowMixManufacturer: true,
        stockSources: [
          { manufacturer: "中牧股份", qty: 30, unit: "支" },
          { manufacturer: "辉瑞动保", qty: 18, unit: "支" },
        ],
      },
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
