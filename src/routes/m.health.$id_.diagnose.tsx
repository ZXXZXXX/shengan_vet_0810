import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Search,
  

  X,
  Send,
  Pill,
  Pencil,
  Trash2,
  Sparkles,
  CheckCircle2,
  
  Camera,
  Video,
  PlayCircle,
  Mic,
  Square,
  UserPlus,
  User,
  Repeat2,
  RefreshCw,
  FileText,
  ChevronDown,
  AlertTriangle,
  Package,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";


import { TagPicker } from "@/components/m/tag-picker";
import { Switch } from "@/components/ui/switch";
import { getOrderEarTagLabel } from "@/lib/work-order-cattle";






export const Route = createFileRoute("/m/health/$id_/diagnose")({
  head: () => ({ meta: [{ title: "诊断记录 · 奇点智牧" }] }),
  component: DiagnosePage,
});

// 上报时的症状（带入）
const reportedSymptoms = ["高烧", "食欲下降", "反刍减少"];

// 候选症状词库
const symptomLibrary = [
  "高烧", "食欲下降", "反刍减少", "咳嗽", "鼻液", "呼吸急促",
  "乳房红肿", "产奶骤降", "跛行", "腹泻", "脱水", "精神萎靡",
];

// 疾病库（关联症状）；每个疾病可包含多个治疗处方方案
type Plan = { id: string; name: string; desc?: string; items: Prescription[] };
type Disease = { name: string; symptoms: string[]; plans: Plan[] };
const diseaseLibrary: Disease[] = [
  {
    name: "支气管肺炎",
    symptoms: ["高烧", "咳嗽", "鼻液", "呼吸急促", "食欲下降"],
    plans: [
      {
        id: "p1",
        name: "方案 A · 抗炎 + 抗生素",
        desc: "适用于高烧伴明显呼吸道症状",
        items: [
          { id: "r1", kind: "drug", name: "氟尼辛葡甲胺注射液", maker: "齐鲁动保", spec: "100ml / 瓶", use: "肌肉注射", dose: "2", doseUnit: "ml", days: "3" },
          { id: "r2", kind: "drug", name: "头孢噻呋钠", maker: "礼蓝动保", spec: "1g / 支", use: "肌肉注射", dose: "1", doseUnit: "g", days: "3" },
        ],
      },
      {
        id: "p2",
        name: "方案 B · 单用抗生素",
        desc: "无明显高烧时的简化方案",
        items: [
          { id: "r1", kind: "drug", name: "头孢噻呋钠", maker: "礼蓝动保", spec: "1g / 支", use: "肌肉注射", dose: "1", doseUnit: "g", days: "5" },
        ],
      },
    ],
  },
  {
    name: "急性乳房炎",
    symptoms: ["高烧", "乳房红肿", "产奶骤降", "食欲下降"],
    plans: [
      {
        id: "p1",
        name: "方案 A · 药物 + 物理治疗",
        desc: "联合用药 + 热敷按摩",
        items: [
          { id: "r1", kind: "drug", name: "头孢噻呋钠", maker: "礼蓝动保", spec: "1g / 支", use: "乳房灌注", dose: "1", doseUnit: "g", days: "3" },
          { id: "r2", kind: "drug", name: "氟尼辛葡甲胺", maker: "齐鲁动保", spec: "100ml / 瓶", use: "肌肉注射", dose: "2", doseUnit: "ml", days: "2" },
          { id: "r3", kind: "therapy", name: "乳房热敷按摩", therapyMethod: "热敷", frequency: "2 次 / 天", desc: "每次 10 分钟，促进炎症消散", days: "3" },
        ],
      },
      {
        id: "p2",
        name: "方案 B · 仅物理治疗",
        desc: "轻症或孕期禁用抗生素时",
        items: [
          { id: "r1", kind: "therapy", name: "乳房热敷按摩", therapyMethod: "热敷", frequency: "3 次 / 天", desc: "每次 15 分钟，配合人工挤奶", days: "5" },
        ],
      },
    ],
  },
  {
    name: "瘤胃酸中毒",
    symptoms: ["食欲下降", "反刍减少", "腹泻", "脱水"],
    plans: [
      {
        id: "p1",
        name: "方案 A · 常规治疗",
        items: [
          { id: "r1", kind: "drug", name: "碳酸氢钠", maker: "华北制药", spec: "500g / 袋", use: "口服", dose: "200", doseUnit: "g", days: "2" },
          { id: "r2", kind: "drug", name: "复合维生素 B", maker: "扬州威克", spec: "100ml / 瓶", use: "肌肉注射", dose: "10", doseUnit: "ml", days: "3" },
        ],
      },
    ],
  },
  {
    name: "酮病",
    symptoms: ["食欲下降", "产奶骤降", "精神萎靡"],
    plans: [
      {
        id: "p1",
        name: "方案 A · 静脉补糖",
        items: [
          { id: "r1", kind: "drug", name: "50% 葡萄糖", maker: "石药集团", spec: "500ml / 瓶", use: "静脉注射", dose: "500", doseUnit: "ml", days: "2" },
        ],
      },
    ],
  },
  {
    name: "犊牛腹泻症",
    symptoms: ["腹泻", "脱水", "精神萎靡"],
    plans: [
      {
        id: "p1",
        name: "方案 A · 补液护理",
        items: [
          { id: "r1", kind: "drug", name: "口服补液盐", maker: "瑞普生物", spec: "100g / 包", use: "口服", dose: "1", doseUnit: "包", days: "3" },
          { id: "r2", kind: "therapy", name: "保温隔离", therapyMethod: "隔离观察", frequency: "全天", desc: "干燥温暖环境，单独看护", days: "5" },
        ],
      },
    ],
  },
];

// 牛只体重档位（用于自动计算剂量）
const WEIGHT_OPTIONS: { label: string; value: number }[] = [
  { label: "200～400 kg", value: 300 },
  { label: "400～600 kg", value: 500 },
  { label: "600～900 kg", value: 750 },
  { label: "900 kg 以上", value: 1000 },
];
const weightLabelOf = (v: number | null) =>
  v == null ? null : WEIGHT_OPTIONS.find((o) => o.value === v)?.label ?? `${v} kg`;

// 库存（仓库实时在册量；用于提交校验）
const drugStock: Record<string, { qty: number; unit: string }> = {
  "氟尼辛葡甲胺注射液": { qty: 120, unit: "ml" },
  "头孢噻呋钠": { qty: 2, unit: "g" }, // 故意偏少，触发缺药提示
  "碳酸氢钠": { qty: 5000, unit: "g" },
  "复合维生素 B": { qty: 800, unit: "ml" },
  "50% 葡萄糖": { qty: 2000, unit: "ml" },
  "口服补液盐": { qty: 30, unit: "包" },
  "氟尼辛葡甲胺": { qty: 200, unit: "ml" },
  "5% 盐酸头孢噻呋（畜可健）": { qty: 600, unit: "ml" },
  "10% 盐酸头孢噻呋注射液（畜可健 / 欣利达）": { qty: 400, unit: "ml" },
  "氟尼辛葡甲胺（福欣安）": { qty: 600, unit: "ml" },
};

// 用药/疾病规则限制（提交时触发二次确认）
const RULES = {
  diseaseReportMax: 2,         // 同一疾病累计上报次数上限
  drugTotalDoseFactorMax: 3,   // 累计剂量相对单次基准的倍数上限
  drugUsageCountMax: 5,        // 同一药品累计使用次数上限
};

// 本牛只历史用药/上报（模拟）
const cattleHistory = {
  diseaseCount: { "支气管肺炎": 2, "急性乳房炎": 1 } as Record<string, number>,
  drugUsage: {
    "头孢噻呋钠": { totalDose: 4, unit: "g", count: 5 }, // 已达上限，触发规则
    "氟尼辛葡甲胺注射液": { totalDose: 6, unit: "ml", count: 3 },
  } as Record<string, { totalDose: number; unit: string; count: number }>,
};


type SlotKey = "morning" | "noon" | "evening";
const SLOT_LABEL: Record<SlotKey, string> = {
  morning: "上午",
  noon: "中午",
  evening: "晚上",
};

type Prescription = {
  id: string;
  kind: "drug" | "therapy";
  name: string;
  days: string;
  // 用药处方
  maker?: string;
  spec?: string;
  use?: string;
  dose?: string;
  doseUnit?: string;
  timesPerDay?: string;
  // 是否区分时间段
  splitTime?: boolean;
  slots?: Partial<Record<SlotKey, string>>;
  // 治疗手段
  therapyMethod?: string;
  frequency?: string;
  desc?: string;
  // 剂量换算方式：默认按 500kg 体重基准换算
  dosePer?: "100kg" | "500kg" | "fixed";
  // 是否属于特殊药品（仅在特殊处方中显示「特殊」标签）
  isSpecialDrug?: boolean;
};

// 体重相关剂量计算（mL/g 等）。fixed 表示单次固定剂量
function computePerDose(r: Prescription, w: number): number {
  const base = parseFloat(r.dose || "0");
  if (Number.isNaN(base) || base <= 0) return 0;
  if (r.dosePer === "fixed") return base;
  if (r.dosePer === "100kg") return Math.round(base * (w / 100) * 10) / 10;
  return Math.round(base * (w / 500) * 10) / 10;
}

// === 产后护理：固定症状池、固定结论、固定标准处方 ===
const POSTPARTUM_SYMPTOMS = [
  "产犊难易度 ≥ 3",
  "产道损伤等级 ≥ 2",
  "产犊数量 ≥ 2",
  "犊牛体重 ≥ 45kg",
  "犊牛为「死胎」",
  "早产",
  "双胎或以上",
  "胎衣不下",
];
const POSTPARTUM_DISEASE: Disease = {
  name: "产后高危",
  symptoms: POSTPARTUM_SYMPTOMS,
  plans: [
    {
      id: "pp-1",
      name: "方案 A · 5% 头孢噻呋 + 氟尼辛",
      desc: "一般产后高危预防性治疗",
      items: [
        { id: "r1", kind: "drug", name: "5% 盐酸头孢噻呋（畜可健）", maker: "礼蓝动保", spec: "100ml / 瓶", use: "肌肉注射", dose: "4.4", doseUnit: "ml", dosePer: "100kg", timesPerDay: "1", days: "3" },
        { id: "r2", kind: "drug", name: "氟尼辛葡甲胺（福欣安）", maker: "礼蓝动保", spec: "100ml / 瓶", use: "静脉推注", dose: "4", doseUnit: "ml", dosePer: "100kg", timesPerDay: "1", days: "3" },
      ],
    },
    {
      id: "pp-2",
      name: "方案 B · 10% 头孢噻呋 + 氟尼辛",
      desc: "感染风险较高 / 体重较大牛只",
      items: [
        { id: "r1", kind: "drug", name: "10% 盐酸头孢噻呋注射液（畜可健 / 欣利达）", maker: "礼蓝动保", spec: "100ml / 瓶", use: "肌肉注射", dose: "20", doseUnit: "ml", dosePer: "fixed", timesPerDay: "1", days: "1" },
        { id: "r2", kind: "drug", name: "氟尼辛葡甲胺（福欣安）", maker: "礼蓝动保", spec: "100ml / 瓶", use: "静脉推注", dose: "4", doseUnit: "ml", dosePer: "100kg", timesPerDay: "1", days: "3" },
      ],
    },
  ],
};

// 药品库（用于编辑弹层中搜索匹配）
type DrugItem = { name: string; maker: string; spec: string; recommendedUse: string; defaultUnit: string; allowedUses: string[]; isSpecial?: boolean };
const drugLibrary: DrugItem[] = [
  { name: "氟尼辛葡甲胺注射液", maker: "齐鲁动保", spec: "100ml / 瓶", recommendedUse: "肌肉注射", defaultUnit: "ml", allowedUses: ["肌肉注射", "静脉注射"] },
  { name: "头孢噻呋钠", maker: "礼蓝动保", spec: "1g / 支", recommendedUse: "肌肉注射", defaultUnit: "g", allowedUses: ["肌肉注射", "皮下注射"] },
  { name: "碳酸氢钠", maker: "华北制药", spec: "500g / 袋", recommendedUse: "口服", defaultUnit: "g", allowedUses: ["口服", "灌服"] },
  { name: "复合维生素 B", maker: "扬州威克", spec: "100ml / 瓶", recommendedUse: "肌肉注射", defaultUnit: "ml", allowedUses: ["肌肉注射", "静脉注射"] },
  { name: "50% 葡萄糖", maker: "石药集团", spec: "500ml / 瓶", recommendedUse: "静脉注射", defaultUnit: "ml", allowedUses: ["静脉注射"] },
  { name: "口服补液盐", maker: "瑞普生物", spec: "100g / 包", recommendedUse: "口服", defaultUnit: "g", allowedUses: ["口服", "灌服"] },
  { name: "青霉素钠", maker: "华北制药", spec: "80 万 IU / 支", recommendedUse: "肌肉注射", defaultUnit: "IU", allowedUses: ["肌肉注射", "静脉注射", "乳房灌注"], isSpecial: true },
  { name: "土霉素注射液", maker: "齐鲁动保", spec: "100ml / 瓶", recommendedUse: "肌肉注射", defaultUnit: "ml", allowedUses: ["肌肉注射", "静脉注射"] },
  { name: "维生素 C 注射液", maker: "石药集团", spec: "10ml / 支", recommendedUse: "静脉注射", defaultUnit: "ml", allowedUses: ["静脉注射", "肌肉注射"] },
  { name: "地塞米松磷酸钠", maker: "瑞普生物", spec: "5ml / 支", recommendedUse: "肌肉注射", defaultUnit: "ml", allowedUses: ["肌肉注射", "静脉注射"], isSpecial: true },
  { name: "5% 盐酸头孢噻呋（畜可健）", maker: "礼蓝动保", spec: "100ml / 瓶", recommendedUse: "肌肉注射", defaultUnit: "ml", allowedUses: ["肌肉注射"] },
  { name: "10% 盐酸头孢噻呋注射液（畜可健 / 欣利达）", maker: "礼蓝动保", spec: "100ml / 瓶", recommendedUse: "肌肉注射", defaultUnit: "ml", allowedUses: ["肌肉注射"] },
  { name: "氟尼辛葡甲胺（福欣安）", maker: "礼蓝动保", spec: "100ml / 瓶", recommendedUse: "静脉推注", defaultUnit: "ml", allowedUses: ["静脉推注", "静脉注射", "肌肉注射"] },
];

// 使用方式枚举
const useMethods = [
  "肌肉注射",
  "静脉注射",
  "静脉推注",
  "皮下注射",
  "乳房灌注",
  "口服",
  "灌服",
  "外用涂抹",
];





// 治疗手段枚举
const therapyMethods = [
  "按摩",
  "热敷",
  "冷敷",
  "灌肠",
  "物理治疗",
  "针灸",
  "蹄部修整",
  "隔离观察",
  "补液护理",
];

const executorPool = ["李雨晴", "张师傅", "王师傅", "刘师傅", "赵师傅", "陈师傅"];

function DiagnosePage() {
  const { id } = useParams({ from: "/m/health/$id_/diagnose" });
  const navigate = useNavigate();

  // 工单类型判断
  const isPostpartum = id.toUpperCase().startsWith("PP");
  const effectiveSymptomLibrary = isPostpartum ? POSTPARTUM_SYMPTOMS : symptomLibrary;
  const effectiveDiseaseLibrary = isPostpartum ? [POSTPARTUM_DISEASE] : diseaseLibrary;

  // 症状（带入上报症状，可加减；产后护理无上报症状）
  const [symptoms, setSymptoms] = useState<string[]>(() => (isPostpartum ? [] : reportedSymptoms));
  const [symptomInput, setSymptomInput] = useState("");

  // 疾病
  const [disease, setDisease] = useState<string>("");
  const [diseaseQuery, setDiseaseQuery] = useState("");
  const [diseaseFocused, setDiseaseFocused] = useState(false);


  // 标准处方（系统内置，按疾病提供多个完整方案，二选一/三选一；按体重自动算量）
  const [stdPlans, setStdPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [cattleWeight, setCattleWeight] = useState<number | null>(null);
  // 特殊处方（需填原因，可自由编辑）
  const [specialReason, setSpecialReason] = useState("");
  const [specialList, setSpecialList] = useState<Prescription[]>([]);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [specialOpen, setSpecialOpen] = useState(false);

  // 提交校验弹窗
  type Shortage = { name: string; need: number; stock: number; unit: string };
  type Violation = { kind: "disease" | "drug"; title: string; detail: string };
  const [submitCheck, setSubmitCheck] = useState<
    | { stage: "stock"; shortages: Shortage[] }
    | { stage: "rules"; violations: Violation[] }
    | null
  >(null);


  const earTagLabel = getOrderEarTagLabel(id);

  // 体征数据
  const [temperature, setTemperature] = useState("");
  const [ketone, setKetone] = useState("");
  // 是否需要每日测量体温（治疗执行任务中带入测温步骤）
  const [dailyTempRequired, setDailyTempRequired] = useState(true);

  // 现场记录
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [audios, setAudios] = useState<{ id: string; duration: number }[]>([]);
  const [note, setNote] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecordSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const startRecord = () => {
    setShowMediaPicker(false);
    setRecordSec(0);
    setRecording(true);
  };
  const stopRecord = () => {
    if (recordSec > 0) {
      setAudios((prev) => [...prev, { id: `a${Date.now()}`, duration: recordSec }]);
    }
    setRecording(false);
    setRecordSec(0);
  };
  const fmtSec = (n: number) => `${Math.floor(n / 60).toString().padStart(2, "0")}:${(n % 60).toString().padStart(2, "0")}`;



  // 指派执行人
  const [executor, setExecutor] = useState("");
  const [showExecutorPicker, setShowExecutorPicker] = useState(false);
  const [executorQuery, setExecutorQuery] = useState("");
  const executorMatches = useMemo(() => {
    const kw = executorQuery.trim();
    const list = kw ? executorPool.filter((n) => n.includes(kw)) : executorPool;
    return list.slice(0, 8);
  }, [executorQuery]);

  // 按匹配症状数排序的候选疾病
  const rankedDiseases = useMemo(() => {
    const kw = diseaseQuery.trim().toLowerCase();
    return effectiveDiseaseLibrary
      .map((d) => ({
        ...d,
        matched: d.symptoms.filter((s) => symptoms.includes(s)).length,
      }))
      .filter((d) => !kw || d.name.toLowerCase().includes(kw))
      .sort((a, b) => b.matched - a.matched);
  }, [diseaseQuery, symptoms, effectiveDiseaseLibrary]);

  // 候选症状（去除已选）
  const symptomSuggestions = useMemo(() => {
    const kw = symptomInput.trim().toLowerCase();
    return effectiveSymptomLibrary
      .filter((s) => !symptoms.includes(s))
      .filter((s) => !kw || s.toLowerCase().includes(kw))
      .slice(0, 8);
  }, [symptomInput, symptoms, effectiveSymptomLibrary]);

  // 产后护理工单：症状、疾病、处方均不预填，由兽医人工选择

  const addSymptom = (s: string) => {
    if (!s || symptoms.includes(s)) return;
    setSymptoms((prev) => [...prev, s]);
    setSymptomInput("");
  };

  const removeSymptom = (s: string) =>
    setSymptoms((prev) => prev.filter((x) => x !== s));

  const pickDisease = (d: (typeof rankedDiseases)[number]) => {
    setDisease(d.name);
    setDiseaseQuery(d.name);
    setStdPlans(d.plans.map((p) => ({ ...p, items: p.items.map((it) => ({ ...it })) })));
    setSelectedPlanId(d.plans[0]?.id ?? "");
    setDiseaseFocused(false);
  };

  const selectedPlan = useMemo(
    () => stdPlans.find((p) => p.id === selectedPlanId) ?? null,
    [stdPlans, selectedPlanId],
  );

  const removeSpecialRx = (rxId: string) =>
    setSpecialList((prev) => prev.filter((r) => r.id !== rxId));

  const saveRxEdit = () => {
    if (!editingRx) return;
    setSpecialList((prev) => prev.map((r) => (r.id === editingRx.id ? editingRx : r)));
    setEditingRx(null);
  };

  const addSpecial = (kind: "drug" | "therapy") => {
    const nextId = `s${Date.now()}`;
    const base: Prescription =
      kind === "drug"
        ? {
            id: nextId,
            kind: "drug",
            name: "",
            maker: "",
            spec: "",
            use: "",
            dose: "",
            doseUnit: "ml",
            timesPerDay: "2",
            days: "3",
            splitTime: false,
            slots: {},
          }
        : {
            id: nextId,
            kind: "therapy",
            name: "",
            therapyMethod: "",
            frequency: "",
            desc: "",
            days: "3",
          };
    setEditingRx(base);
    setSpecialList((prev) => [...prev, base]);
  };

  const doSubmit = () => {
    setSubmitCheck(null);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`health:dailyTemp:${id}`, dailyTempRequired ? "1" : "0");
    }
    toast.success("诊断已提交");
    navigate({ to: "/m/health/$id", params: { id }, search: { tab: "review" } });
  };

  const submit = () => {
    if (symptoms.length === 0) {
      toast.error("请至少填写一个症状");
      return;
    }
    const temp = parseFloat(temperature);
    if (!isPostpartum) {
      if (!temperature.trim() || Number.isNaN(temp)) {
        toast.error("请填写牛只体温");
        return;
      }
      if (temp < 30 || temp > 45) {
        toast.error("体温应在 30 ~ 45 ℃ 之间");
        return;
      }
    } else if (temperature.trim()) {
      if (Number.isNaN(temp) || temp < 30 || temp > 45) {
        toast.error("体温应在 30 ~ 45 ℃ 之间");
        return;
      }
    }
    if (ketone.trim()) {
      const k = parseFloat(ketone);
      if (Number.isNaN(k) || k < 0 || k > 10) {
        toast.error("血酮值应在 0 ~ 10 mmol/L 之间");
        return;
      }
    }
    if (!disease) {
      toast.error("请选择疾病");
      return;
    }
    const planItems = selectedPlan?.items ?? [];
    if (planItems.length === 0 && specialList.length === 0) {
      toast.error("请选择一个标准处方方案或开具特殊处方");
      return;
    }
    if (planItems.some((r) => r.kind === "drug") && cattleWeight == null) {
      toast.error("请选择牛只体重以自动计算剂量");
      return;
    }
    if (specialList.length > 0 && !specialReason.trim()) {
      toast.error("请填写开具特殊处方的原因");
      return;
    }
    if (specialList.some((r) => r.kind === "drug" && (!r.name || !r.dose))) {
      toast.error("请补全特殊处方的药品与剂量");
      return;
    }
    if (specialList.some((r) => r.kind === "therapy" && !r.therapyMethod)) {
      toast.error("请补全特殊理疗的治疗手段");
      return;
    }
    if (photos.length === 0 && videos.length === 0) {
      toast.error("请上传至少一张照片或一段视频");
      return;
    }

    // 汇总所有药品处方（标准 + 特殊）
    const allDrugs = [...planItems, ...specialList].filter((r) => r.kind === "drug");
    const w = cattleWeight ?? 500;

    // 1) 库存校验
    const shortages: Shortage[] = [];
    const need: Record<string, { qty: number; unit: string }> = {};
    for (const r of allDrugs) {
      const perDose = computePerDose(r, w);
      if (perDose <= 0) continue;
      const times = parseFloat(r.timesPerDay || "1") || 1;
      const days = parseFloat(r.days || "1") || 1;
      const total = Math.round(perDose * times * days * 10) / 10;
      const unit = r.doseUnit || "ml";
      if (!need[r.name]) need[r.name] = { qty: 0, unit };
      need[r.name].qty = Math.round((need[r.name].qty + total) * 10) / 10;
    }
    for (const [name, n] of Object.entries(need)) {
      const stock = drugStock[name];
      if (!stock || stock.qty < n.qty) {
        shortages.push({
          name,
          need: n.qty,
          stock: stock?.qty ?? 0,
          unit: stock?.unit ?? n.unit,
        });
      }
    }

    if (shortages.length > 0) {
      setSubmitCheck({ stage: "stock", shortages });
      return;
    }

    proceedRuleCheck();
  };

  // 2) 规则校验（库存通过或用户已确认继续后触发）
  const proceedRuleCheck = () => {
    const planItems = selectedPlan?.items ?? [];
    const allDrugs = [...planItems, ...specialList].filter((r) => r.kind === "drug");
    const w = cattleWeight ?? 500;

    const violations: Violation[] = [];
    const reported = cattleHistory.diseaseCount[disease] ?? 0;
    if (reported + 1 > RULES.diseaseReportMax) {
      violations.push({
        kind: "disease",
        title: `「${disease}」上报次数超限`,
        detail: `当前：${reported + 1} 次；限制：${RULES.diseaseReportMax} 次。`,
      });
    }
    for (const r of allDrugs) {
      const perDose = computePerDose(r, w);
      if (perDose <= 0) continue;
      const times = parseFloat(r.timesPerDay || "1") || 1;
      const days = parseFloat(r.days || "1") || 1;
      const addDose = Math.round(perDose * times * days * 10) / 10;
      const addCount = Math.round(times * days);
      const hist = cattleHistory.drugUsage[r.name];
      if (!hist) continue;
      const unit = hist.unit;
      const nextDose = Math.round((hist.totalDose + addDose) * 10) / 10;
      const nextCount = hist.count + addCount;
      const doseCap = Math.round(RULES.drugTotalDoseFactorMax * perDose * 10) / 10;
      if (nextDose > doseCap) {
        violations.push({
          kind: "drug",
          title: `「${r.name}」累计剂量超限`,
          detail: `当前：${nextDose}${unit}；限制：${doseCap}${unit}。`,
        });
      }
      if (nextCount > RULES.drugUsageCountMax) {
        violations.push({
          kind: "drug",
          title: `「${r.name}」累计使用次数超限`,
          detail: `当前：${nextCount} 次；限制：${RULES.drugUsageCountMax} 次。`,
        });
      }
    }

    if (violations.length === 0) {
      doSubmit();
      return;
    }
    setSubmitCheck({ stage: "rules", violations });
  };


  return (
    <MobileShell title="诊断记录" back hideTabBar>
      <div className="pb-28">
        {/* 工单号（吸顶） */}
        <div className="sticky top-12 z-20 bg-[var(--bg-page)] px-4 pt-3 pb-2 border-b border-border">
          <div className="text-caption text-text-tertiary inline-flex items-center gap-1.5">
            <span>工单</span>
            <span className="font-mono text-text-secondary">{id}</span>
            <span className="text-text-tertiary">·</span>
            <span className="font-mono text-text-secondary">{earTagLabel}</span>
          </div>
        </div>

        {/* 顶部提示 */}
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center gap-1.5 text-caption text-primary">
            <Sparkles className="h-3 w-3" />
            {isPostpartum
              ? "平台下发的产后护理工单，请勾选症状并核对治疗方案"
              : "已自动将上报信息填写至下方，方便编辑更改"}
          </div>
        </div>

        <div className="px-4 space-y-3">
          {/* ===== 牛只情况 分组 ===== */}
          <div className="pt-1 pb-0.5 flex items-center gap-2">
            <span className="text-section-title text-foreground font-medium">牛只情况</span>
            <span className="text-caption text-text-tertiary">症状、体征数据与现场记录</span>
          </div>

          {/* === 症状标签 === */}
          <Section
            title="症状标签"
            required
            hint="输入关键词搜索，或直接创建"
          >
            <TagPicker
              selected={symptoms}
              onChange={setSymptoms}
              presets={effectiveSymptomLibrary}
              disableCreate={isPostpartum}
            />
          </Section>


          {/* === 体征数据 === */}
          <Section title="体征数据">

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <div className="text-caption text-text-tertiary mb-1">
                  体温 {isPostpartum ? <span className="text-text-tertiary">(选填)</span> : <span className="text-[var(--state-danger)]">*</span>}
                </div>
                <div className="relative">
                  <input
                    inputMode="decimal"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="如 39.2"
                    maxLength={5}
                    className="h-10 w-full pl-3 pr-10 rounded-lg bg-white border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-tertiary">℃</span>
                </div>
              </label>
              <label className="block">
                <div className="text-caption text-text-tertiary mb-1">
                  血酮 <span className="text-text-tertiary">(选填)</span>
                </div>
                <div className="relative">
                  <input
                    inputMode="decimal"
                    value={ketone}
                    onChange={(e) => setKetone(e.target.value)}
                    placeholder="如 1.2"
                    maxLength={5}
                    className="h-10 w-full pl-3 pr-16 rounded-lg bg-white border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-tertiary">mmol/L</span>
                </div>
              </label>
            </div>
          </Section>









          {/* === 现场记录（前置:体征数据之后即上传，便于诊断参考） === */}
          <Section title="现场记录">
            {/* 照片 / 视频 */}
            <div>
              <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
                <Camera className="h-3 w-3" /> 照片 / 视频
                <span className="text-[var(--state-danger)]">*</span>
                <span>· {photos.length + videos.length} 条</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((_, i) => (
                  <div key={`p-${i}`} className="relative aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border">
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-card border border-border text-text-secondary inline-flex items-center justify-center"
                      aria-label="删除照片"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {videos.map((_, i) => (
                  <div key={`v-${i}`} className="relative aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border inline-flex items-center justify-center">
                    <PlayCircle className="h-5 w-5 text-text-tertiary" />
                    <button
                      onClick={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-card border border-border text-text-secondary inline-flex items-center justify-center"
                      aria-label="删除视频"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowMediaPicker(true)}
                  className="aspect-square rounded-lg border border-dashed border-border bg-surface-subtle text-text-tertiary inline-flex flex-col items-center justify-center gap-0.5"
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-caption">添加</span>
                </button>
              </div>
            </div>

            {/* 录音 */}
            <div className="mt-3">
              <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
                <Mic className="h-3 w-3" /> 录音 · {audios.length} 条
              </div>
              <div className="space-y-2">
                {audios.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 h-10 px-3 rounded-lg bg-surface-subtle border border-border"
                  >
                    <PlayCircle className="h-4 w-4 text-primary" />
                    <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                      <div className="h-full w-1/3 bg-primary/40" />
                    </div>
                    <span className="text-caption text-text-tertiary tabular-nums">{fmtSec(a.duration)}</span>
                    <button
                      onClick={() => setAudios((prev) => prev.filter((_, idx) => idx !== i))}
                      className="h-5 w-5 rounded-full bg-card border border-border text-text-secondary inline-flex items-center justify-center"
                      aria-label="删除录音"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {recording ? (
                  <button
                    onClick={stopRecord}
                    className="w-full h-10 px-3 rounded-lg bg-[var(--state-danger)]/10 border border-[var(--state-danger)]/40 text-[var(--state-danger)] text-body-sm inline-flex items-center justify-center gap-2"
                  >
                    <span className="relative inline-flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--state-danger)] opacity-60 animate-ping" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--state-danger)]" />
                    </span>
                    正在录音 {fmtSec(recordSec)}
                    <Square className="h-3.5 w-3.5 ml-1" /> 点击结束
                  </button>
                ) : (
                  <button
                    onClick={() => { setRecordSec(0); setRecording(true); }}
                    className="w-full h-10 px-3 rounded-lg border border-dashed border-border text-body-sm text-text-tertiary inline-flex items-center justify-center gap-1.5"
                  >
                    <Mic className="h-3.5 w-3.5" /> 点击开始录音
                  </button>
                )}
              </div>
            </div>

            {/* 文字描述 */}
            <div className="mt-3">
              <div className="text-caption text-text-tertiary mb-2">文字描述<span className="text-[var(--state-danger)] ml-0.5">*</span></div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="补充体征、用药反应、隔离建议等"
                className="w-full px-3 py-2 rounded-lg bg-white border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
              />
              <div className="text-caption text-text-tertiary text-right mt-1">{note.length} / 500</div>
            </div>
          </Section>

          {/* ===== 诊断结论 分组 ===== */}
          <div className="pt-1 pb-0.5 flex items-center gap-2">
            <span className="text-section-title text-foreground font-medium">诊断结论</span>
            <span className="text-caption text-text-tertiary">根据症状选择或新建疾病</span>
          </div>

          {/* === 疾病名称 === */}
          <Section
            title="疾病名称"
            extra={
              <span className="text-caption text-text-tertiary inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                按症状匹配排序
              </span>
            }
          >
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                <input
                  value={diseaseQuery}
                  onChange={(e) => {
                    setDiseaseQuery(e.target.value);
                    setDisease(e.target.value.trim());
                  }}
                  onFocus={() => setDiseaseFocused(true)}
                  onBlur={() => setTimeout(() => setDiseaseFocused(false), 150)}
                  placeholder="搜索或直接输入疾病名称"
                  className="h-10 w-full pl-9 pr-9 rounded-lg bg-white border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                />
                {disease && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary" />
                )}
              </div>
              {diseaseFocused && rankedDiseases.length > 0 && (
                <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden bg-card max-h-72 overflow-y-auto">
                  {rankedDiseases.map((d) => (
                    <li key={d.name}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickDisease(d)}
                        className="w-full px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-surface-subtle text-left"
                      >
                        <div className="min-w-0">
                          <div className="text-body text-foreground truncate">{d.name}</div>
                          <div className="text-caption text-text-tertiary truncate">
                            关联症状：{d.symptoms.join("、")}
                          </div>
                        </div>
                        <span
                          className={`shrink-0 tag ${d.matched > 0 ? "tag-brand" : "tag-muted"}`}
                        >
                          匹配 {d.matched}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {diseaseFocused && rankedDiseases.length === 0 && diseaseQuery.trim() && (
                <div className="text-caption text-text-tertiary px-1">
                  未匹配到库内疾病，将以「{diseaseQuery.trim()}」作为新疾病名称
                </div>
              )}
            </div>

          </Section>

          {/* ===== 治疗方案 分组 ===== */}
          <div className="pt-1 pb-0.5 flex items-center gap-2">
            <span className="text-section-title text-foreground font-medium">治疗方案</span>
            <span className="text-caption text-text-tertiary">标准 / 特殊处方与执行设置</span>
          </div>

          {/* === 标准处方 === */}
          <Section
            title="标准处方"
            extra={
              <span className="text-caption text-text-tertiary">
                {stdPlans.length === 0
                  ? "选择疾病后载入"
                  : `共 ${stdPlans.length} 个方案`}
              </span>
            }
          >
            {stdPlans.length === 0 ? (
              <div className="text-caption text-text-tertiary text-center py-4">
                选择疾病后将自动载入系统推荐处方方案
              </div>
            ) : (
              <div className="space-y-3">
                {/* 牛只体重（下拉选择） */}
                <div>
                  <div className="text-caption text-text-tertiary mb-1.5">
                    牛只体重 <span className="text-[var(--state-danger)]">*</span>
                    <span className="ml-1 text-text-tertiary">用于自动计算剂量</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeightSheetOpen(true)}
                    className="h-10 w-full px-3 rounded-lg bg-white border border-border text-body-sm inline-flex items-center justify-between"
                  >
                    <span className={cattleWeight == null ? "text-text-tertiary" : "text-foreground"}>
                      {cattleWeight == null ? "请选择牛只体重" : weightLabelOf(cattleWeight)}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
                  </button>
                </div>


                {/* 当前方案 */}
                {selectedPlan && (
                  <div className="rounded-lg border border-primary bg-brand-subtle/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-body text-foreground font-medium">
                          {selectedPlan.name}
                        </div>
                        {selectedPlan.desc && (
                          <div className="text-caption text-text-tertiary mt-0.5">{selectedPlan.desc}</div>
                        )}
                      </div>
                      {stdPlans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPlanSheetOpen(true)}
                          aria-label="切换方案"
                          title="切换方案"
                          className="shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-md text-primary bg-card"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      )}

                    </div>

                    <ul className="mt-3 space-y-2">
                      {selectedPlan.items.map((r) => {
                        const isTherapy = r.kind === "therapy";
                        const unit = r.doseUnit || "ml";
                        const baseDose = parseFloat(r.dose || "");
                        const w = cattleWeight ?? 0;
                        const isFixed = r.dosePer === "fixed";
                        const basisKg = r.dosePer === "100kg" ? 100 : 500;
                        const computedDose =
                          !isTherapy && !Number.isNaN(baseDose)
                            ? isFixed
                              ? baseDose
                              : w > 0
                                ? computePerDose(r, w)
                                : null
                            : null;
                        return (
                          <li
                            key={r.id}
                            className="rounded-md border border-border bg-card p-2.5"
                          >
                            <div className="text-body-sm text-foreground inline-flex items-center gap-1.5 flex-wrap">
                              {isTherapy ? (
                                <Activity className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <Pill className="h-3.5 w-3.5 text-primary" />
                              )}
                              {r.name}
                              {!isTherapy && r.maker && (
                                <span className="text-caption text-text-tertiary font-normal">· {r.maker}</span>
                              )}
                              <span className={`tag ${isTherapy ? "tag-muted" : "tag-brand"}`}>
                                {isTherapy ? "理疗" : "用药"}
                              </span>
                            </div>
                            <div className="text-caption text-text-tertiary mt-1">
                              {isTherapy
                                ? [r.therapyMethod, r.frequency, r.days && `${r.days} 天`].filter(Boolean).join(" · ")
                                : [r.spec, r.use, r.timesPerDay && `${r.timesPerDay} 次 / 天`, r.days && `连用 ${r.days} 天`].filter(Boolean).join(" · ")}
                            </div>
                            {r.desc && (
                              <div className="text-caption text-text-tertiary mt-1 inline-flex items-start gap-1">
                                <FileText className="h-3 w-3 shrink-0 mt-0.5" />
                                {r.desc}
                              </div>
                            )}
                            {!isTherapy && (
                              <div className="text-caption text-primary mt-1 inline-flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {isFixed
                                  ? `固定剂量 ${baseDose}${unit} / 次`
                                  : computedDose !== null
                                    ? `自动剂量 ${computedDose}${unit} / 次（基准 ${r.dose}${unit} / ${basisKg}kg）`
                                    : `基准 ${r.dose}${unit} / ${basisKg}kg，请选择体重`}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

              </div>
            )}
          </Section>


          {/* === 特殊处方 === */}
          <Section
            title="特殊处方"
            extra={
              <span className="text-caption text-text-tertiary">
                {specialList.length > 0 ? `${specialList.length} 项` : "可选"}
              </span>
            }
          >
            {!specialOpen && specialList.length === 0 ? (
              <button
                type="button"
                onClick={() => setSpecialOpen(true)}
                className="w-full h-10 rounded-lg border border-dashed border-border text-body-sm text-text-secondary inline-flex items-center justify-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-primary" /> 开具特殊处方
              </button>
            ) : (
              <div className="space-y-3">
                <label className="block">
                  <div className="text-caption text-text-tertiary mb-1">
                    开具原因 <span className="text-[var(--state-danger)]">*</span>
                  </div>
                  <textarea
                    value={specialReason}
                    onChange={(e) => setSpecialReason(e.target.value)}
                    maxLength={200}
                    rows={2}
                    placeholder="如标准处方过敏、合并感染、孕期禁用等"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="text-caption text-text-tertiary text-right">{specialReason.length} / 200</div>
                </label>

                {specialList.length > 0 && (
                  <ul className="space-y-2">
                    {specialList.map((r) => {
                      const isTherapy = r.kind === "therapy";
                      const unit = r.doseUnit || "ml";
                      return (
                        <li key={r.id} className="rounded-lg border border-border bg-card p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="text-body text-foreground inline-flex items-center gap-1.5 flex-wrap">
                                {isTherapy ? (
                                  <Activity className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Pill className="h-3.5 w-3.5 text-primary" />
                                )}
                                {r.name || (isTherapy ? "未填写治疗手段" : "未填写药品")}
                                {!isTherapy && r.maker && (
                                  <span className="text-caption text-text-tertiary font-normal">· {r.maker}</span>
                                )}
                                {!isTherapy && r.isSpecialDrug && (
                                  <span className="tag tag-muted">特殊</span>
                                )}
                              </div>
                              <div className="text-caption text-text-tertiary mt-1">
                                {isTherapy
                                  ? [r.therapyMethod, r.frequency, r.days && `${r.days} 天`].filter(Boolean).join(" · ")
                                  : [
                                      r.spec,
                                      r.use,
                                      r.dose && `${r.dose}${unit} / 次`,
                                      r.timesPerDay && `${r.timesPerDay} 次 / 天`,
                                      r.days && `${r.days} 天`,
                                    ].filter(Boolean).join(" · ")}
                              </div>
                              {r.desc && (
                                <div className="text-caption text-text-tertiary mt-1 inline-flex items-start gap-1">
                                  <FileText className="h-3 w-3 shrink-0 mt-0.5" />
                                  {r.desc}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                onClick={() => setEditingRx({ ...r })}
                                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-primary hover:bg-brand-subtle"
                                aria-label="编辑"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => removeSpecialRx(r.id)}
                                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-[var(--state-danger)] hover:bg-[color-mix(in_oklab,var(--state-danger)_8%,transparent)]"
                                aria-label="删除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {(() => {
                  const reasonReady = specialReason.trim().length > 0;
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!reasonReady}
                          onClick={() => {
                            if (!reasonReady) {
                              toast.error("请先填写开具原因");
                              return;
                            }
                            addSpecial("drug");
                          }}
                          className={`h-9 rounded-lg border border-dashed text-body-sm inline-flex items-center justify-center gap-1.5 ${
                            reasonReady
                              ? "border-border text-text-secondary"
                              : "border-border/60 text-text-tertiary opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <Pill className="h-3.5 w-3.5 text-primary" /> 新增用药
                        </button>
                        <button
                          type="button"
                          disabled={!reasonReady}
                          onClick={() => {
                            if (!reasonReady) {
                              toast.error("请先填写开具原因");
                              return;
                            }
                            addSpecial("therapy");
                          }}
                          className={`h-9 rounded-lg border border-dashed text-body-sm inline-flex items-center justify-center gap-1.5 ${
                            reasonReady
                              ? "border-border text-text-secondary"
                              : "border-border/60 text-text-tertiary opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <Activity className="h-3.5 w-3.5 text-primary" /> 新增理疗
                        </button>
                      </div>
                      {!reasonReady && (
                        <div className="text-caption text-text-tertiary text-center">
                          填写开具原因后才能新增特殊处方
                        </div>
                      )}
                    </>
                  );
                })()}


                {specialList.length === 0 && (
                  <button
                    type="button"
                    onClick={() => { setSpecialOpen(false); setSpecialReason(""); }}
                    className="w-full text-caption text-text-tertiary hover:text-text-secondary"
                  >
                    收起
                  </button>
                )}
              </div>
            )}

          </Section>



          {/* === 每日测量体温（治疗方案的一部分） === */}
          <Section title="每日测量体温">
            <label className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-body-sm text-foreground">需要每日测量体温</div>
                <div className="text-caption text-text-tertiary mt-0.5">开启后，每日治疗执行任务中会包含测温步骤</div>
              </div>
              <Switch checked={dailyTempRequired} onCheckedChange={setDailyTempRequired} />
            </label>
          </Section>

          {/* === 指派执行人 === */}
          <Section
            title="指派执行人"
            extra={<span className="text-caption text-text-tertiary">可选</span>}
          >
            {executor ? (
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-brand-subtle text-primary text-body">
                  <User className="h-3.5 w-3.5" />
                  {executor}
                </span>
                <button
                  onClick={() => setShowExecutorPicker(true)}
                  className="text-body-sm text-text-tertiary underline"
                >
                  更换
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowExecutorPicker(true)}
                className="w-full h-10 px-3 rounded-lg border border-dashed border-border text-body-sm text-text-tertiary inline-flex items-center justify-center gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" /> 选择执行人（可选）
              </button>
            )}
          </Section>
        </div>
      </div>

      {/* 编辑处方弹层 */}
      {editingRx && (
        <DrugEditor
          value={editingRx}
          onChange={setEditingRx}
          onCancel={() => setEditingRx(null)}
          onSave={saveRxEdit}
        />
      )}

      {/* 底部提交按钮 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          onClick={submit}
          className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
        >
          <Send className="h-4 w-4" /> 提交诊断
        </button>
      </div>




      {/* 添加媒体选择弹层 */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowMediaPicker(false)}>
          <div
            className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-section-title text-foreground">添加现场记录</div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => { setPhotos((prev) => [...prev, `p${Date.now()}`]); setShowMediaPicker(false); }}
                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-border bg-surface-subtle text-text-secondary"
              >
                <Camera className="h-6 w-6" />
                <span className="text-body-sm">拍照</span>
              </button>
              <button
                onClick={() => { setVideos((prev) => [...prev, `v${Date.now()}`]); setShowMediaPicker(false); }}
                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-border bg-surface-subtle text-text-secondary"
              >
                <Video className="h-6 w-6" />
                <span className="text-body-sm">拍视频</span>
              </button>
              <button
                onClick={startRecord}
                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border border-border bg-surface-subtle text-text-secondary"
              >
                <Mic className="h-6 w-6" />
                <span className="text-body-sm">录音</span>
              </button>
            </div>
            <button
              onClick={() => setShowMediaPicker(false)}
              className="w-full h-10 rounded-lg border border-border text-body-sm text-text-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 选择执行人弹层 */}
      {showExecutorPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowExecutorPicker(false)}>
          <div
            className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-section-title text-foreground">选择执行人</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <input
                value={executorQuery}
                onChange={(e) => setExecutorQuery(e.target.value)}
                placeholder="搜索姓名"
                className="h-10 w-full pl-9 pr-3 rounded-lg bg-white border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              {executorMatches.map((name) => (
                <button
                  key={name}
                  onClick={() => { setExecutor(name); setShowExecutorPicker(false); setExecutorQuery(""); }}
                  className={`w-full h-10 rounded-lg border text-body-sm inline-flex items-center justify-center gap-1.5 ${executor === name ? "border-primary bg-brand-subtle text-primary" : "border-border bg-white text-text-secondary"}`}
                >
                  <User className="h-3.5 w-3.5" />
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowExecutorPicker(false); setExecutorQuery(""); }}
              className="w-full h-10 rounded-lg border border-border text-body-sm text-text-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 选择牛只体重 */}
      {weightSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setWeightSheetOpen(false)}>
          <div
            className="w-full bg-card rounded-t-2xl p-4 space-y-3 h-[75vh] max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-section text-foreground font-medium">选择牛只体重</div>
              <button
                onClick={() => setWeightSheetOpen(false)}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-text-tertiary"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {WEIGHT_OPTIONS.map((opt) => {
                const active = cattleWeight === opt.value;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        setCattleWeight(opt.value);
                        setWeightSheetOpen(false);
                      }}
                      className={`w-full px-3 py-3 flex items-center justify-between text-left ${
                        active ? "bg-brand-subtle/40 text-primary" : "bg-card text-foreground"
                      }`}
                    >
                      <span className="text-body">{opt.label}</span>
                      {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 切换标准处方方案 */}
      {planSheetOpen && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setPlanSheetOpen(false)}>
          <div
            className="w-full bg-card rounded-t-2xl p-4 space-y-3 h-[75vh] max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="text-section text-foreground font-medium">选择标准处方方案</div>
              <button
                onClick={() => setPlanSheetOpen(false)}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-text-tertiary"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2">
              {stdPlans.map((plan) => {
                const active = plan.id === selectedPlanId;
                return (
                  <li key={plan.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setPlanSheetOpen(false);
                      }}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        active ? "border-primary bg-brand-subtle/40" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-body text-foreground font-medium">{plan.name}</div>
                          {plan.desc && (
                            <div className="text-caption text-text-tertiary mt-0.5">{plan.desc}</div>
                          )}
                          <div className="text-caption text-text-tertiary mt-1">
                            包含 {plan.items.length} 项 ·{" "}
                            {plan.items.filter((i) => i.kind === "drug").length} 用药 /{" "}
                            {plan.items.filter((i) => i.kind === "therapy").length} 理疗
                          </div>
                        </div>
                        <span
                          className={`shrink-0 h-5 w-5 rounded-full border inline-flex items-center justify-center ${
                            active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
                          }`}
                        >
                          {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 提交校验：缺药 / 规则二次确认 */}
      {submitCheck && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSubmitCheck(null)}
        >
          <div
            className="w-full max-w-sm bg-card rounded-2xl p-4 space-y-3 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--state-warning,#F59E0B)]" />
              <div className="text-section text-foreground font-medium">
                {submitCheck.stage === "rules" ? "规则告警" : "提交前请确认"}
              </div>
            </div>

            {submitCheck.stage === "stock" && (
              <div className="space-y-1.5">
                <div className="text-caption text-text-tertiary inline-flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> 库存不足（请联系管理人员调拨库存）
                </div>
                <ul className="rounded-lg border border-border divide-y divide-border">
                  {submitCheck.shortages.map((s) => (
                    <li key={s.name} className="px-3 py-2">
                      <div className="text-body-sm text-foreground">{s.name}</div>
                      <div className="text-caption text-text-tertiary mt-0.5">
                        需要 {s.need}
                        {s.unit} · 库存 {s.stock}
                        {s.unit} · 缺 {Math.round((s.need - s.stock) * 10) / 10}
                        {s.unit}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {submitCheck.stage === "rules" && (
              <div className="space-y-1.5">
                <ul className="rounded-lg border border-[var(--state-danger)]/30 bg-[color-mix(in_oklab,var(--state-danger)_4%,transparent)] divide-y divide-[var(--state-danger)]/20">
                  {submitCheck.violations.map((v, i) => (
                    <li key={i} className="px-3 py-2">
                      <div className="text-body-sm text-foreground">{v.title}</div>
                      <div className="text-caption text-text-tertiary mt-0.5">{v.detail}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setSubmitCheck(null)}
                className="flex-1 h-10 rounded-lg border border-border text-body-sm text-text-secondary"
              >
                返回修改
              </button>
              <button
                onClick={() => {
                  if (submitCheck.stage === "stock") {
                    setSubmitCheck(null);
                    proceedRuleCheck();
                  } else {
                    doSubmit();
                  }
                }}
                className={`flex-1 h-10 rounded-lg text-body-sm text-white font-medium ${
                  submitCheck.stage === "rules"
                    ? "bg-[var(--state-danger)]"
                    : "bg-primary"
                }`}
              >
                {submitCheck.stage === "rules" ? "仍旧提交" : "知道了，继续提交"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>


  );
}


function Section({
  title,
  children,
  extra,
  required,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-card-title text-foreground">
            {title}
            {required && <span className="text-[var(--state-danger)] ml-1">*</span>}
          </div>
          {hint && <span className="text-caption text-text-tertiary truncate">{hint}</span>}
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}


function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-caption text-text-tertiary">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full px-3 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
      />
    </label>
  );
}

function DrugEditor({
  value,
  onChange,
  onCancel,
  onSave,
}: {
  value: Prescription;
  onChange: (v: Prescription) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const isTherapy = value.kind === "therapy";
  const [query, setQuery] = useState(value.name);
  const [focused, setFocused] = useState(false);
  const matches = useMemo(() => {
    const kw = query.trim().toLowerCase();
    if (!kw) return drugLibrary.slice(0, 6);
    return drugLibrary.filter((d) => d.name.toLowerCase().includes(kw)).slice(0, 6);
  }, [query]);
  const matched = drugLibrary.find((d) => d.name === value.name);

  const pickDrug = (d: DrugItem) => {
    onChange({
      ...value,
      name: d.name,
      maker: d.maker,
      spec: d.spec,
      use: value.use || d.recommendedUse,
      doseUnit: value.doseUnit || d.defaultUnit,
      isSpecialDrug: d.isSpecial ?? false,
    });
    setQuery(d.name);
    setFocused(false);
  };


  const setSlot = (k: SlotKey, v: string) =>
    onChange({ ...value, slots: { ...(value.slots || {}), [k]: v } });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onCancel}>
      <div
        className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl p-4 space-y-4 h-[75vh] max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-section-title text-foreground">
          {isTherapy ? "编辑治疗手段" : "编辑药品"}
        </div>

        {isTherapy ? (
          <>
            {/* 治疗手段类型 */}
            <div className="space-y-1.5">
              <span className="text-caption text-text-tertiary">治疗手段</span>
              <div className="flex flex-wrap gap-1.5">
                {therapyMethods.map((m) => {
                  const active = value.therapyMethod === m;
                  return (
                    <button
                      key={m}
                      onClick={() =>
                        onChange({
                          ...value,
                          therapyMethod: m,
                          name: value.name || m,
                        })
                      }
                      className={`h-8 px-3 rounded-full text-caption transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-white border border-border text-text-secondary"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 名称 */}
            <label className="block space-y-1">
              <span className="text-caption text-text-tertiary">方案名称</span>
              <input
                value={value.name}
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                placeholder="如 乳房热敷按摩"
                className="h-10 w-full px-3 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
              />
            </label>

            {/* 频次 / 天数 */}
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-caption text-text-tertiary">频次</span>
                <input
                  value={value.frequency || ""}
                  onChange={(e) => onChange({ ...value, frequency: e.target.value })}
                  placeholder="如 2 次 / 天"
                  className="h-10 w-full px-3 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-caption text-text-tertiary">持续天数</span>
                <div className="relative">
                  <input
                    value={value.days}
                    onChange={(e) => onChange({ ...value, days: e.target.value })}
                    inputMode="numeric"
                    placeholder="如 3"
                    className="h-10 w-full pl-3 pr-9 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-tertiary">天</span>
                </div>
              </label>
            </div>

            {/* 操作说明 */}
            <label className="block space-y-1">
              <span className="text-caption text-text-tertiary">操作说明</span>
              <textarea
                value={value.desc || ""}
                onChange={(e) => onChange({ ...value, desc: e.target.value })}
                placeholder="如：每次 10 分钟，注意力度，观察反应"
                className="h-20 w-full p-3 rounded-lg bg-white border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
              />
            </label>
          </>
        ) : (
          <>
            {/* 药品搜索 */}
            <div className="space-y-1">
              <span className="text-caption text-text-tertiary">药品名称</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  value={query}
                  onChange={(e) => {
                    const next = e.target.value;
                    setQuery(next);
                    setFocused(true);
                    // 只允许从药品库中选择:输入框仅用于搜索,不直接写入 name
                    // 当输入内容与已选药品不一致时,清空已选药品信息
                    if (value.name && next !== value.name) {
                      onChange({ ...value, name: "", maker: "", spec: "" });
                    }
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder="输入关键字从药品库选择"
                  className="h-10 w-full pl-9 pr-3 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
                />
                {focused && matches.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-auto">
                    {matches.map((d) => (
                      <button
                        key={d.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickDrug(d)}
                        className="w-full text-left px-3 py-2.5 hover:bg-surface-subtle border-b border-border last:border-b-0"
                      >
                        <div className="text-body-sm text-foreground">{d.name}</div>
                        <div className="text-caption text-text-tertiary mt-0.5">
                          {d.maker} · {d.spec}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {focused && matches.length === 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg px-3 py-3 text-caption text-text-tertiary">
                    药品库中暂无匹配项,请联系管理员录入后再开具
                  </div>
                )}
              </div>
              {matched ? (
                <div className="rounded-md bg-brand-subtle border border-primary/15 px-2.5 py-1.5 text-caption text-text-secondary mt-1.5">
                  <span className="text-primary font-medium">{matched.maker}</span>
                  <span className="mx-1.5 text-text-tertiary">·</span>
                  规格 {matched.spec}
                </div>
              ) : query.trim() && !value.name ? (
                <div className="text-caption text-[var(--state-alert)] mt-1.5">
                  请从下拉列表中选择药品
                </div>
              ) : null}
            </div>

            {/* 使用方式 */}
            <div className="space-y-1.5">
              <span className="text-caption text-text-tertiary">使用方式</span>
              <div className="flex flex-wrap gap-1.5">
                {(matched?.allowedUses ?? useMethods).map((m) => {
                  const active = value.use === m;
                  const recommended = matched?.recommendedUse === m;
                  return (
                    <button
                      key={m}
                      onClick={() => onChange({ ...value, use: m })}
                      className={`h-8 px-3 rounded-full text-caption transition-colors inline-flex items-center gap-1 ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-white border border-border text-text-secondary"
                      }`}
                    >
                      <span>{m}</span>
                      {recommended && (
                        <span
                          className={`text-caption px-1 rounded ${
                            active
                              ? "bg-white/20 text-primary-foreground"
                              : "bg-brand-subtle text-primary"
                          }`}
                        >
                          推荐
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {matched && (
                <div className="text-caption text-text-tertiary">
                  根据药品说明书，仅可选择以上使用方式
                </div>
              )}
            </div>

            {/* 区分用药时间段 切换 */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-body-sm text-foreground">区分用药时间段</div>
                <div className="text-caption text-text-tertiary mt-0.5">
                  开启后按上午 / 中午 / 晚上分别填写剂量
                </div>
              </div>
              <Switch
                checked={!!value.splitTime}
                onCheckedChange={(checked) =>
                  onChange({ ...value, splitTime: checked })
                }
              />
            </div>

            {/* 剂量 */}
            {value.splitTime ? (
              <div className="space-y-1.5">
                <div className="text-caption text-text-tertiary">分时段剂量</div>
                <div className="grid grid-cols-3 gap-2">
                  {(["morning", "noon", "evening"] as SlotKey[]).map((k) => (
                    <label key={k} className="block space-y-1">
                      <span className="text-caption text-text-tertiary">
                        {SLOT_LABEL[k]}
                      </span>
                      <div className="relative">
                        <input
                          value={value.slots?.[k] || ""}
                          onChange={(e) => setSlot(k, e.target.value)}
                          placeholder="剂量"
                          inputMode="decimal"
                          className="h-10 w-full pl-3 pr-9 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-tertiary">
                          {value.doseUnit || "ml"}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-caption text-text-tertiary">单次用量</span>
                  <div className="relative">
                    <input
                      value={value.dose || ""}
                      onChange={(e) => onChange({ ...value, dose: e.target.value })}
                      inputMode="decimal"
                      placeholder="如 2"
                      className="h-10 w-full pl-3 pr-10 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-tertiary">
                      {value.doseUnit || "ml"}
                    </span>
                  </div>
                </label>

                <label className="block space-y-1">
                  <span className="text-caption text-text-tertiary">每天次数</span>
                  <div className="relative">
                    <input
                      value={value.timesPerDay || ""}
                      onChange={(e) => onChange({ ...value, timesPerDay: e.target.value })}
                      inputMode="numeric"
                      placeholder="如 2"
                      className="h-10 w-full pl-3 pr-12 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-tertiary">次 / 天</span>
                  </div>
                </label>
              </div>
            )}



            {/* 用药天数 */}
            <label className="block space-y-1">
              <span className="text-caption text-text-tertiary">用药天数</span>
              <div className="relative">
                <input
                  value={value.days}
                  onChange={(e) => onChange({ ...value, days: e.target.value })}
                  inputMode="numeric"
                  placeholder="如 3"
                  className="h-10 w-full pl-3 pr-9 rounded-lg bg-white border border-border text-body-sm focus:outline-none focus:border-primary"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-tertiary">天</span>
              </div>
            </label>

            {/* 补充说明 */}
            <label className="block space-y-1">
              <span className="text-caption text-text-tertiary">补充说明</span>
              <textarea
                value={value.desc || ""}
                onChange={(e) => onChange({ ...value, desc: e.target.value })}
                placeholder="如：用药前后需监测体温、注意过敏反应等"
                rows={2}
                className="w-full p-3 rounded-lg bg-white border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
              />
            </label>
          </>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-border text-body-sm text-text-secondary"
          >
            取消
          </button>
          <button
            onClick={onSave}
            className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
