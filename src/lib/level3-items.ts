export type L3Item = {
  /** 单个药品的唯一码（扫码码/追溯码） */
  code: string;
  name: string;
  spec: string;
  batch?: string;
  manufacturer?: string;
  used: boolean;
  claimedAt: string;
  usedAt?: string;
  /** 用到的牛只耳号 */
  cattle?: string[];
};

/** 演示数据：三级库（个人库）中的药品 */
export const L3_ITEMS: L3Item[] = [
  {
    code: "SN-8801-0231",
    name: "精制盐酸头孢噻呋注射液",
    spec: "100ml:5g / 瓶",
    batch: "B240517",
    manufacturer: "齐鲁动保",
    used: true,
    claimedAt: "2026-08-07 07:42",
    usedAt: "2026-08-07 09:10",
    cattle: ["01-24-2412", "01-24-2376"],
  },
  {
    code: "SN-8801-0232",
    name: "精制盐酸头孢噻呋注射液",
    spec: "100ml:5g / 瓶",
    batch: "B240517",
    manufacturer: "齐鲁动保",
    used: false,
    claimedAt: "2026-08-07 07:42",
  },
  {
    code: "SN-6620-1187",
    name: "氟尼辛葡甲胺注射液",
    spec: "100ml / 瓶",
    batch: "B240603",
    manufacturer: "瑞普生物",
    used: true,
    claimedAt: "2026-08-07 07:42",
    usedAt: "2026-08-07 08:55",
    cattle: ["01-24-2381"],
  },
  {
    code: "SN-4410-0902",
    name: "20% 葡萄糖注射液",
    spec: "500ml / 瓶",
    batch: "B240419",
    manufacturer: "华农动保",
    used: false,
    claimedAt: "2026-08-06 07:30",
  },
  {
    code: "SN-4410-0903",
    name: "复方氯化钠注射液",
    spec: "500ml / 瓶",
    batch: "B240422",
    manufacturer: "华农动保",
    used: true,
    claimedAt: "2026-08-06 07:30",
    usedAt: "2026-08-06 10:12",
    cattle: ["01-24-2298"],
  },
];
