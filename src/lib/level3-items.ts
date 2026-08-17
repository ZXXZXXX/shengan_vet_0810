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
  /** 领用人（三级库归属人） */
  holder: string;
  /** 领用人岗位 */
  holderRole?: string;
  /** 组合用药分组 ID（同一组合内的药品共用） */
  comboId?: string;
  /** 组合用药使用范围 */
  comboScope?: "shared" | "single";
  /** 共用于多头牛时的牛只数量 */
  comboCattleCount?: number;
};


/** 当前登录人（个人三级库视角） */
export const CURRENT_HOLDER = "李雨晴";

/** 演示数据基准日（数据中最新的领用日），运行时会整体平移到「今天」 */
const DEMO_BASE_DATE = "2026-08-07";

/** 把演示数据里的固定日期平移到最近几天，保证始终落在「近 7 天」窗口内 */
function shiftDemoDate(s: string): string {
  const [d, t = ""] = s.split(" ");
  const base = new Date(`${DEMO_BASE_DATE}T00:00:00`).getTime();
  const cur = new Date(`${d}T00:00:00`).getTime();
  if (Number.isNaN(base) || Number.isNaN(cur)) return s;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const shifted = new Date(today.getTime() + (cur - base));
  const p = (n: number) => String(n).padStart(2, "0");
  const day = `${shifted.getFullYear()}-${p(shifted.getMonth() + 1)}-${p(shifted.getDate())}`;
  return t ? `${day} ${t}` : day;
}

const RAW_L3_ITEMS: L3Item[] = [

  {
    code: "SN-8801-0231",
    name: "精制盐酸头孢噻呋注射液",
    spec: "5% 100ml/瓶",
    batch: "B240517",
    manufacturer: "齐鲁动保",
    used: true,
    claimedAt: "2026-08-07 07:42",
    usedAt: "2026-08-07 09:10",
    cattle: ["01-24-2412", "01-24-2376"],
    holder: "李雨晴",
    holderRole: "兽医助理",
  },
  {
    code: "SN-8801-0232",
    name: "精制盐酸头孢噻呋注射液",
    spec: "5% 100ml/瓶",
    batch: "B240517",
    manufacturer: "齐鲁动保",
    used: false,
    claimedAt: "2026-08-07 07:42",
    holder: "李雨晴",
    holderRole: "兽医助理",
  },
  {
    code: "SN-6620-1187",
    name: "氟尼辛葡甲胺注射液",
    spec: "100ml/瓶",
    batch: "B240603",
    manufacturer: "瑞普生物",
    used: true,
    claimedAt: "2026-08-07 07:42",
    usedAt: "2026-08-07 08:55",
    cattle: ["01-24-2381"],
    holder: "李雨晴",
    holderRole: "兽医助理",
  },
  {
    code: "SN-4410-0902",
    name: "20% 葡萄糖注射液",
    spec: "500ml/瓶",
    batch: "B240419",
    manufacturer: "华农动保",
    used: false,
    claimedAt: "2026-08-06 07:30",
    holder: "李雨晴",
    holderRole: "兽医助理",
  },
  {
    code: "SN-4410-0903",
    name: "复方氯化钠注射液",
    spec: "500ml/瓶",
    batch: "B240422",
    manufacturer: "华农动保",
    used: true,
    claimedAt: "2026-08-06 07:30",
    usedAt: "2026-08-06 10:12",
    cattle: ["01-24-2298"],
    holder: "李雨晴",
    holderRole: "兽医助理",
  },
  // —— 其他人员（全场视角可见）——
  {
    code: "SN-8801-0240",
    name: "精制盐酸头孢噻呋注射液",
    spec: "5% 100ml/瓶",
    batch: "B240517",
    manufacturer: "齐鲁动保",
    used: false,
    claimedAt: "2026-08-07 07:50",
    holder: "王志强",
    holderRole: "兽医助理",
  },
  {
    code: "SN-3320-0455",
    name: "产后灌注剂",
    spec: "100ml/瓶",
    batch: "B240708",
    manufacturer: "大华农",
    used: true,
    claimedAt: "2026-08-07 07:50",
    usedAt: "2026-08-07 10:26",
    cattle: ["02-24-1180"],
    holder: "王志强",
    holderRole: "兽医助理",
  },
  {
    code: "SN-9912-0071",
    name: "口蹄疫双价灭活疫苗",
    spec: "100ml/瓶",
    batch: "B240611",
    manufacturer: "中农威特",
    used: true,
    claimedAt: "2026-08-07 06:58",
    usedAt: "2026-08-07 09:40",
    cattle: ["03-24-0912", "03-24-0915", "03-24-0918"],
    holder: "赵敏",
    holderRole: "免疫员",
  },
  {
    code: "SN-9912-0072",
    name: "口蹄疫双价灭活疫苗",
    spec: "100ml/瓶",
    batch: "B240611",
    manufacturer: "中农威特",
    used: false,
    claimedAt: "2026-08-07 06:58",
    holder: "赵敏",
    holderRole: "免疫员",
  },
  {
    code: "SN-7701-0338",
    name: "硫酸铜溶液",
    spec: "5L/桶",
    batch: "B240520",
    manufacturer: "华农动保",
    used: false,
    claimedAt: "2026-08-06 08:05",
    holder: "陈立",
    holderRole: "修蹄工",
  },
  {
    code: "SN-7701-0339",
    name: "水杨酸粉",
    spec: "500g/袋",
    batch: "B240502",
    manufacturer: "瑞普生物",
    used: true,
    claimedAt: "2026-08-06 08:05",
    usedAt: "2026-08-06 11:48",
    cattle: ["01-24-2455"],
    holder: "陈立",
    holderRole: "修蹄工",
  },
  // —— 组合用药（同一 comboId 为一组）——
  {
    code: "SN-8801-0251",
    name: "精制盐酸头孢噻呋注射液",
    spec: "5% 100ml/瓶",
    batch: "B240517",
    manufacturer: "齐鲁动保",
    used: false,
    claimedAt: "2026-08-07 08:12",
    holder: "李雨晴",
    holderRole: "兽医助理",
    comboId: "CB-20260807-01",
    comboScope: "single",
  },
  {
    code: "SN-6620-1195",
    name: "氟尼辛葡甲胺注射液",
    spec: "100ml/瓶",
    batch: "B240603",
    manufacturer: "瑞普生物",
    used: false,
    claimedAt: "2026-08-07 08:12",
    holder: "李雨晴",
    holderRole: "兽医助理",
    comboId: "CB-20260807-01",
    comboScope: "single",
  },
  {
    code: "SN-4410-0921",
    name: "复方氯化钠注射液",
    spec: "500ml/瓶",
    batch: "B240422",
    manufacturer: "华农动保",
    used: false,
    claimedAt: "2026-08-07 08:12",
    holder: "李雨晴",
    holderRole: "兽医助理",
    comboId: "CB-20260807-01",
    comboScope: "single",
  },
  {
    code: "SN-3320-0461",
    name: "产后灌注剂",
    spec: "100ml/瓶",
    batch: "B240708",
    manufacturer: "大华农",
    used: true,
    claimedAt: "2026-08-07 07:20",
    usedAt: "2026-08-07 10:05",
    cattle: ["02-24-1180", "02-24-1192"],
    holder: "王志强",
    holderRole: "兽医助理",
    comboId: "CB-20260807-02",
    comboScope: "shared",
    comboCattleCount: 2,
  },
  {
    code: "SN-4410-0930",
    name: "20% 葡萄糖注射液",
    spec: "500ml/瓶",
    batch: "B240419",
    manufacturer: "华农动保",
    used: true,
    claimedAt: "2026-08-07 07:20",
    usedAt: "2026-08-07 10:05",
    cattle: ["02-24-1180", "02-24-1192"],
    holder: "王志强",
    holderRole: "兽医助理",
    comboId: "CB-20260807-02",
    comboScope: "shared",
    comboCattleCount: 2,
  },
];


/** 演示数据：三级库（个人库）中的药品（日期已平移到最近几天） */
export const L3_ITEMS: L3Item[] = RAW_L3_ITEMS.map((i) => ({
  ...i,
  claimedAt: shiftDemoDate(i.claimedAt),
  usedAt: i.usedAt ? shiftDemoDate(i.usedAt) : undefined,
}));
