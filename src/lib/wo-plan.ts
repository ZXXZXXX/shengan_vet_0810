// 工单执行/诊断数据来源：晟安标准处方文档
// 覆盖：疾病治疗（子宫炎类）/ 产后护理 / 修蹄 / 干奶
// 为详情页 <ReviewTab/> 与 <ExecuteSummary/> 提供每张工单对应的
// 疾病结论、处方名称、药品明细（含给药方法/单次剂量/用药方法/标签）与领物清单。

export type PlanDrug = {
  name: string;
  spec: string;             // 规格（用于领物清单）
  manufacturer: string;     // 厂商（用于领物清单）
  use: string;              // 给药方法：肌肉注射 / 静脉推注 / 子宫灌注 / 乳房灌注 / 蹄浴 / 外用喷洒 / 蹄部外用
  dose: string;             // 单次剂量：4.4mL/100kg / 20mL / 2.4g / 100mL 等
  method: string;           // 用药方法：1天1次，连用3天 等
  qty: string;              // 领物数量：3 支 / 1 瓶
  isPrescription: boolean;  // 是否处方药
  isSpecial: boolean;       // 是否特殊药品
  kind?: "drug" | "therapy"; // 药品 or 理疗
};

// 复用药品定义
const D = {
  cef5: {
    name: "5% 盐酸头孢噻呋（畜可健）",
    spec: "100ml / 瓶",
    manufacturer: "礼蓝动保",
    use: "肌肉注射",
    dose: "4.4mL / 100kg",
    method: "1 天 1 次，连用 3 天",
    qty: "1 瓶",
    isPrescription: true,
    isSpecial: true,
  } satisfies PlanDrug,
  cef10: {
    name: "10% 盐酸头孢噻呋注射液（欣利达）",
    spec: "100ml / 瓶",
    manufacturer: "礼蓝动保",
    use: "肌肉注射",
    dose: "20mL / 次",
    method: "3 天 1 次，共 1 次",
    qty: "1 瓶",
    isPrescription: true,
    isSpecial: true,
  } satisfies PlanDrug,
  flunixin: {
    name: "氟尼辛葡甲胺（福欣安）",
    spec: "100ml / 瓶",
    manufacturer: "礼蓝动保",
    use: "静脉推注",
    dose: "4mL / 100kg",
    method: "1 天 1 次，连用 3 天",
    qty: "1 瓶",
    isPrescription: true,
    isSpecial: false,
  } satisfies PlanDrug,
  penicillin: {
    name: "注射用青霉素钠（联治灵）",
    spec: "2.4g / 瓶",
    manufacturer: "联治灵",
    use: "肌肉注射",
    dose: "2.2 万 IU / kg",
    method: "早晚各 1 次，连用 3 天",
    qty: "6 瓶",
    isPrescription: true,
    isSpecial: true,
  } satisfies PlanDrug,
  rifaximin: {
    name: "利福昔明子宫注入剂（澳利舒）",
    spec: "100ml / 瓶",
    manufacturer: "澳利舒",
    use: "子宫灌注",
    dose: "100mL / 次",
    method: "2 天 1 次，共 2-3 次",
    qty: "3 瓶",
    isPrescription: true,
    isSpecial: false,
  } satisfies PlanDrug,
  iodineGlycerin: {
    name: "碘甘油",
    spec: "500ml / 瓶",
    manufacturer: "华畜",
    use: "外阴局部涂抹",
    dose: "适量",
    method: "1 天 2 次，连用 5 天",
    qty: "1 瓶",
    isPrescription: false,
    isSpecial: false,
  } satisfies PlanDrug,
  copperSulfate: {
    name: "10% 硫酸铜蹄浴液",
    spec: "20L / 桶",
    manufacturer: "华畜",
    use: "蹄浴",
    dose: "浸没蹄部",
    method: "隔日 1 次，共 3 次",
    qty: "1 桶",
    isPrescription: false,
    isSpecial: false,
  } satisfies PlanDrug,
  tetracyclineSpray: {
    name: "盐酸四环素喷剂",
    spec: "150ml / 瓶",
    manufacturer: "普莱柯",
    use: "外用喷洒",
    dose: "覆盖病灶",
    method: "1 天 2 次，连用 3 天",
    qty: "1 瓶",
    isPrescription: true,
    isSpecial: false,
  } satisfies PlanDrug,
  hoofBlock: {
    name: "蹄块粘接剂",
    spec: "组套",
    manufacturer: "Demotec",
    use: "对侧健蹄粘接",
    dose: "1 组 / 头",
    method: "单次处理，7 天复查",
    qty: "1 组",
    isPrescription: false,
    isSpecial: false,
  } satisfies PlanDrug,
  hoofDressing: {
    name: "防腐生肌散",
    spec: "50g / 袋",
    manufacturer: "华畜",
    use: "蹄部外敷",
    dose: "覆盖创面",
    method: "1 天 1 次，连用 3 天",
    qty: "2 袋",
    isPrescription: false,
    isSpecial: false,
  } satisfies PlanDrug,
  hoofClean: {
    name: "修蹄清创",
    spec: "-",
    manufacturer: "-",
    use: "蹄部处理",
    dose: "-",
    method: "清除坏死组织并冲洗",
    qty: "-",
    isPrescription: false,
    isSpecial: false,
    kind: "therapy",
  } satisfies PlanDrug,
  drying_cefquinome: {
    name: "头孢喹肟乳房注入剂（牧全欣）",
    spec: "8g / 支",
    manufacturer: "勃林格",
    use: "乳房灌注",
    dose: "1 支 / 乳区",
    method: "干奶当日 1 次，共 4 支 / 头",
    qty: "4 支",
    isPrescription: true,
    isSpecial: true,
  } satisfies PlanDrug,
  drying_ceftiofur: {
    name: "头孢噻呋乳房注入剂（茹通）",
    spec: "8g / 支",
    manufacturer: "礼蓝动保",
    use: "乳房灌注",
    dose: "1 支 / 乳区",
    method: "干奶当日 1 次，共 4 支 / 头",
    qty: "4 支",
    isPrescription: true,
    isSpecial: true,
  } satisfies PlanDrug,
  drying_sealant: {
    name: "乳头内封剂（次硝酸铋）",
    spec: "4g / 支",
    manufacturer: "硕腾",
    use: "乳头封闭",
    dose: "1 支 / 乳区",
    method: "干奶当日 1 次，共 4 支 / 头",
    qty: "4 支",
    isPrescription: false,
    isSpecial: false,
  } satisfies PlanDrug,
};

export type WoPlan = {
  disease: string;
  subType?: string;                  // 子类型，如 "阴道黏膜层撕裂"
  symptoms: string[];
  description: string;               // 具体诊断描述
  prescription: { name: string; note: string };
  drugs: PlanDrug[];
  days: number;                      // 疗程天数（决定"执行任务 01/02/03"数量）
  reviewAction: string;              // 复查具体动作
  diagnoser?: string;
  diagnoseTime?: string;
};

// 处方模版 —— 复用
const PLANS = {
  chuandao_p1: {
    disease: "产道创伤",
    prescription: {
      name: "处方 1 · 5% 头孢噻呋 + 氟尼辛",
      note: "疗程 3-5 天；助产后凉水冲洗外阴 5 分钟，损伤处涂抹碘甘油每日 2 次连用 5 天。",
    },
    drugs: [D.cef5, D.flunixin, D.iodineGlycerin],
    days: 3,
  },
  zigongyan_p1: {
    disease: "产后子宫炎",
    prescription: {
      name: "处方 1 · 青霉素钠 + 氟尼辛",
      note: "产后 10 天内；青霉素钠 2.2 万 IU/kg，早晚各 1 次连用 3 天。",
    },
    drugs: [D.penicillin, D.flunixin],
    days: 3,
  },
  zigongyan_p2: {
    disease: "产后子宫炎",
    prescription: {
      name: "处方 2 · 5% 头孢噻呋 + 氟尼辛",
      note: "产后 10 天内，1 天 1 次连用 3 天。",
    },
    drugs: [D.cef5, D.flunixin],
    days: 3,
  },
  zigongyan_p3: {
    disease: "产后子宫炎",
    prescription: {
      name: "处方 3 · 10% 头孢噻呋 + 利福昔明灌注",
      note: "产后 5 天以上；辅助利福昔明子宫灌注 100mL/次，2 天一次连用 2-3 次。",
    },
    drugs: [D.cef10, D.flunixin, D.rifaximin],
    days: 3,
  },
  neimoyan_p1: {
    disease: "子宫内膜炎",
    prescription: {
      name: "处方 1 · 青霉素钠 + 氟尼辛",
      note: "产后 21-28 天；直肠按压排脓后用药，早晚各 1 次连用 3 天。",
    },
    drugs: [D.penicillin, D.flunixin],
    days: 3,
  },
  neimoyan_p2: {
    disease: "子宫内膜炎",
    prescription: {
      name: "处方 2 · 利福昔明子宫灌注",
      note: "利福昔明 100mL/次，2 天 1 次连用 2-3 次。",
    },
    drugs: [D.rifaximin],
    days: 3,
  },
  fu_p1: {
    disease: "腐蹄病",
    prescription: {
      name: "处方 1 · 修蹄清创 + 头孢噻呋 + 氟尼辛",
      note: "清创后局部包扎，配合全身抗炎 3-5 天。",
    },
    drugs: [D.hoofClean, D.cef5, D.flunixin],
    days: 3,
  },
  fu_p2: {
    disease: "腐蹄病",
    prescription: {
      name: "处方 2 · 修蹄清创 + 蹄浴",
      note: "10% 硫酸铜蹄浴，隔日 1 次连用 3 次；辅助头孢外敷。",
    },
    drugs: [D.hoofClean, D.copperSulfate, D.hoofDressing],
    days: 3,
  },
  tizhi_p1: {
    disease: "蹄趾皮炎",
    prescription: {
      name: "处方 1 · 蹄部清创 + 四环素喷剂",
      note: "清创后喷四环素，绷带包扎 2-3 天。",
    },
    drugs: [D.hoofClean, D.tetracyclineSpray],
    days: 3,
  },
  tikui_p1: {
    disease: "蹄底溃疡",
    prescription: {
      name: "处方 1 · 修蹄清创 + 蹄块 + 抗炎",
      note: "对侧健蹄粘蹄块减压，配合全身抗炎 3-5 天。",
    },
    drugs: [D.hoofClean, D.hoofBlock, D.flunixin, D.cef5],
    days: 3,
  },
  tiyou_p1: {
    disease: "蹄疣",
    prescription: {
      name: "处方 1 · 防腐生肌散 + 蹄浴",
      note: "创面外敷防腐生肌散，蹄浴巩固。",
    },
    drugs: [D.hoofClean, D.hoofDressing, D.copperSulfate],
    days: 3,
  },
  baixian_p1: {
    disease: "白线病",
    prescription: {
      name: "处方 1 · 修蹄清创 + 蹄块",
      note: "清除白线感染灶，对侧粘蹄块，7 天复查。",
    },
    drugs: [D.hoofClean, D.hoofBlock],
    days: 1,
  },
  tiyu: {
    disease: "群体蹄浴",
    prescription: {
      name: "功能性蹄浴液喷蹄",
      note: "10% 硫酸铜蹄浴，隔日 1 次共 3 次。",
    },
    drugs: [D.copperSulfate],
    days: 3,
  },
  drying_p1: {
    disease: "常规干奶",
    prescription: {
      name: "处方 1 · 头孢喹肟乳房注入剂（牧全欣）+ 乳头内封剂",
      note: "干奶当日每乳区 1 支，配合乳头封闭剂。",
    },
    drugs: [D.drying_cefquinome, D.drying_sealant],
    days: 1,
  },
  drying_p2: {
    disease: "常规干奶",
    prescription: {
      name: "处方 2 · 头孢噻呋乳房注入剂（茹通）+ 乳头内封剂",
      note: "干奶当日每乳区 1 支。",
    },
    drugs: [D.drying_ceftiofur, D.drying_sealant],
    days: 1,
  },
  postpartum: {
    disease: "产后保健",
    prescription: {
      name: "产后保健方案 · 抗炎 + 补钙",
      note: "产后 14 天例行检查；异常牛按子宫炎处方处理。",
    },
    drugs: [D.flunixin],
    days: 3,
  },
} as const satisfies Record<string, Omit<WoPlan, "symptoms" | "description" | "reviewAction" | "diagnoser" | "diagnoseTime" | "subType">>;

type PlanKey = keyof typeof PLANS;

const WO_MAP: Record<string, {
  key: PlanKey;
  subType?: string;
  symptoms: string[];
  description: string;
  reviewAction?: string;
  diagnoser?: string;
  diagnoseTime?: string;
}> = {
  // 疾病治疗
  "WO-2298": {
    key: "zigongyan_p2",
    subType: "脓性分泌物 + 高热",
    symptoms: ["体温 39.8℃", "分泌物含 >50% 脓", "产后 8 天"],
    description: "产后 8 天，分泌物脓性伴恶臭，体温 39.8℃，判定为产后子宫炎。",
    reviewAction: "第 4 天复测体温（≤39.0℃）与分泌物性状，评估是否延展疗程。",
    diagnoser: "王医生",
    diagnoseTime: "2026-05-20 10:15",
  },
  "WO-2299": {
    key: "zigongyan_p1",
    subType: "恶臭分泌物",
    symptoms: ["体温 > 39.5℃", "分泌物恶臭", "产后 7 天"],
    description: "产后 7 天出现恶臭分泌物 + 高热。",
    reviewAction: "第 4 天复测体温与阴道分泌物。",
  },
  "WO-2300": {
    key: "neimoyan_p1",
    subType: "亚急性型",
    symptoms: ["直肠检查子宫异常", "分泌物含 >50% 脓", "产后 23 天"],
    description: "产后 23 天直检子宫复旧不良，脓性分泌物。",
    reviewAction: "第 4 天复测分泌物性状。",
  },
  "WO-2301": {
    key: "zigongyan_p3",
    subType: "顽固型",
    symptoms: ["产后 12 天", "分泌物恶臭", "产后 5 天以上"],
    description: "产后 12 天顽固子宫炎，需灌注联合治疗。",
    reviewAction: "第 6 天复查子宫复旧与灌注反应。",
  },
  "WO-2302": {
    key: "chuandao_p1",
    subType: "阴道黏膜层撕裂",
    symptoms: ["阴道黏膜层撕裂", "助产 3 分及以上"],
    description: "助产致产道黏膜撕裂。",
    reviewAction: "第 4 天检查产道愈合与体温。",
  },
  "WO-2303": {
    key: "neimoyan_p2",
    subType: "慢性型",
    symptoms: ["产后 25 天", "分泌物含 >50% 脓"],
    description: "亚急性子宫内膜炎，需子宫灌注 3 次。",
    reviewAction: "第 3 次灌注 7 天后复查。",
  },
  "WO-2440": {
    key: "zigongyan_p2",
    subType: "观察复查",
    symptoms: ["体温 39.6℃", "分泌物含脓"],
    description: "产后子宫炎观察期满，进入复查节点。",
    reviewAction: "复测体温、直检子宫复旧、评估是否停药。",
  },

  // 产后护理
  "PP-2501": {
    key: "postpartum",
    symptoms: ["产后 3 天", "恶露正常", "体温 38.9℃"],
    description: "产后 3 天例行检查：胎衣已排出，恶露正常，体温体征正常；执行常规产后保健。",
    reviewAction: "产后 14 天例检。",
    diagnoser: "王医生",
    diagnoseTime: "2026-05-24 09:20",
  },
  "PP-2601": {
    key: "postpartum",
    symptoms: ["产后 5 天", "轻度水肿"],
    description: "产后 5 天体况良好，执行例行保健。",
    reviewAction: "产后 14 天例检。",
  },
  "PP-2602": {
    key: "postpartum",
    symptoms: ["产后 2 天"],
    description: "产后例检 · 常规护理。",
    reviewAction: "产后 7 天例检。",
  },

  // 修蹄
  "HF-0702": {
    key: "fu_p1",
    symptoms: ["跛行 2 级", "蹄冠红肿", "趾间糜烂"],
    description: "左后蹄腐蹄病，趾间糜烂伴脓性分泌物，采用清创 + 全身抗炎方案。",
    reviewAction: "3 天后复检蹄部创面。",
    diagnoser: "王医生",
    diagnoseTime: "2026-05-22 14:30",
  },
  "HF-0703": {
    key: "fu_p2",
    symptoms: ["跛行 3 级", "蹄部脓肿"],
    description: "右前蹄严重腐蹄，蹄浴联合外敷方案。",
    reviewAction: "5 天后复检。",
  },
  "HF-0704": {
    key: "tizhi_p1",
    symptoms: ["跛行 1 级", "趾间皮炎"],
    description: "趾间皮炎早期，四环素喷剂 + 绷带包扎。",
    reviewAction: "3 天后拆包扎复检。",
  },
  "HF-0705": {
    key: "tikui_p1",
    symptoms: ["跛行 2 级", "蹄底溃疡"],
    description: "左后蹄底溃疡，粘蹄块减压 + 全身抗炎。",
    reviewAction: "7 天后复检减压效果。",
  },
  "HF-0706": {
    key: "tiyou_p1",
    symptoms: ["蹄冠疣状增生", "轻度跛行"],
    description: "蹄疣，防腐生肌散外敷 + 蹄浴。",
    reviewAction: "3 天后复检创面。",
  },
  "HF-0707": {
    key: "baixian_p1",
    symptoms: ["白线分离", "轻度跛行"],
    description: "白线病，远轴侧蹄壁清创 + 蹄块。",
    reviewAction: "7 天后复检。",
  },
  "HF-0708": {
    key: "tiyu",
    symptoms: ["群体轻度跛行", "预防性蹄浴"],
    description: "1 号牛舍群体蹄浴预防干预。",
    reviewAction: "第 3 次蹄浴后评估。",
  },
  "HF-0688": {
    key: "fu_p1",
    symptoms: ["跛行 2 级", "腐蹄"],
    description: "左后蹄腐蹄病复诊。",
    reviewAction: "3 天后复检。",
  },

  // 干奶
  "GN-0208": {
    key: "drying_p1",
    symptoms: ["达到干奶日龄", "预产 55 天", "泌乳量 12kg"],
    description: "常规干奶：低风险牛只，头孢喹肟乳注 + 乳头内封剂。",
    reviewAction: "干奶后 7 天复查乳区。",
    diagnoser: "王医生",
    diagnoseTime: "2026-05-25 10:00",
  },
};

// 疾病 → 默认处方（用于未在表内映射的 WO）
const DEFAULT_BY_DISEASE: Record<string, PlanKey> = {
  "产道创伤": "chuandao_p1",
  "产后子宫炎": "zigongyan_p2",
  "子宫内膜炎": "neimoyan_p1",
  "腐蹄病": "fu_p1",
  "蹄趾皮炎": "tizhi_p1",
  "蹄底溃疡": "tikui_p1",
  "蹄疣": "tiyou_p1",
  "白线病": "baixian_p1",
};

export function getWoPlan(id: string, workType?: string, disease?: string): WoPlan {
  const mapped = WO_MAP[id];
  if (mapped) {
    const p = PLANS[mapped.key];
    return {
      disease: p.disease,
      prescription: p.prescription,
      drugs: p.drugs.slice(),
      days: p.days,
      symptoms: mapped.symptoms,
      description: mapped.description,
      reviewAction: mapped.reviewAction ?? "按疗程完成后复查体征。",
      diagnoser: mapped.diagnoser ?? "王医生",
      diagnoseTime: mapped.diagnoseTime ?? "2026-05-20 10:15",
    };
  }
  // fallback: 按疾病或工单类型给默认处方
  const key: PlanKey =
    (disease ? DEFAULT_BY_DISEASE[disease] : undefined) ??
    (workType === "修蹄" ? "fu_p1"
      : workType === "干奶" ? "drying_p1"
      : workType === "产后护理" ? "postpartum"
      : "zigongyan_p2");
  const p = PLANS[key];
  return {
    disease: disease ?? p.disease,
    prescription: p.prescription,
    drugs: p.drugs.slice(),
    days: p.days,
    symptoms: ["体温升高", "采食下降"],
    description: `${p.disease}·${p.prescription.name}`,
    reviewAction: "按疗程完成后复查体征。",
    diagnoser: "王医生",
    diagnoseTime: "2026-05-20 10:15",
  };
}

// 构建"执行任务 0X"的具体动作文案（简版摘要）
export function buildActionText(plan: WoPlan): string {
  const drugs = plan.drugs.filter((d) => d.kind !== "therapy");
  if (drugs.length === 0) {
    return plan.drugs.map((d) => d.name).join(" + ") + "，并测温记录";
  }
  const summary = drugs
    .map((d) => `${shortName(d.name)} ${d.dose}${useShort(d.use)}`)
    .join(" + ");
  return `${summary}，测温并记录`;
}

function shortName(name: string) {
  // 去括号内厂商别名
  return name.replace(/（[^）]*）/g, "").trim();
}
function useShort(use: string) {
  if (use.includes("肌肉")) return " IM";
  if (use.includes("静脉")) return " IV";
  if (use.includes("子宫")) return " 子宫灌注";
  if (use.includes("乳房")) return " 乳注";
  if (use.includes("蹄浴")) return " 蹄浴";
  return ` ${use}`;
}
