import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Search,
  Plus,
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
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { TransferBarnControl } from "@/components/m/transfer-barn-control";
import { ConfirmTransferDialog } from "@/components/m/confirm-transfer-dialog";
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

// 疾病库（关联症状）
type Disease = { name: string; symptoms: string[]; rx: Prescription[] };
const diseaseLibrary: Disease[] = [
  {
    name: "支气管肺炎",
    symptoms: ["高烧", "咳嗽", "鼻液", "呼吸急促", "食欲下降"],
    rx: [
      { id: "r1", kind: "drug", name: "氟尼辛葡甲胺注射液", maker: "齐鲁动保", spec: "100ml / 瓶", use: "肌肉注射", dose: "2ml", days: "3" },
      { id: "r2", kind: "drug", name: "头孢噻呋钠", maker: "礼蓝动保", spec: "1g / 支", use: "肌肉注射", dose: "1g", days: "3" },
    ],
  },
  {
    name: "急性乳房炎",
    symptoms: ["高烧", "乳房红肿", "产奶骤降", "食欲下降"],
    rx: [
      { id: "r1", kind: "drug", name: "头孢噻呋钠", maker: "礼蓝动保", spec: "1g / 支", use: "乳房灌注", dose: "1g", days: "3" },
      { id: "r2", kind: "drug", name: "氟尼辛葡甲胺", maker: "齐鲁动保", spec: "100ml / 瓶", use: "肌肉注射", dose: "2ml", days: "2" },
      { id: "r3", kind: "therapy", name: "乳房热敷按摩", therapyMethod: "热敷", frequency: "2 次 / 天", desc: "每次 10 分钟，促进炎症消散", days: "3" },
    ],
  },
  {
    name: "瘤胃酸中毒",
    symptoms: ["食欲下降", "反刍减少", "腹泻", "脱水"],
    rx: [
      { id: "r1", kind: "drug", name: "碳酸氢钠", maker: "华北制药", spec: "500g / 袋", use: "口服", dose: "200g", days: "2" },
      { id: "r2", kind: "drug", name: "复合维生素 B", maker: "扬州威克", spec: "100ml / 瓶", use: "肌肉注射", dose: "10ml", days: "3" },
    ],
  },
  {
    name: "酮病",
    symptoms: ["食欲下降", "产奶骤降", "精神萎靡"],
    rx: [
      { id: "r1", kind: "drug", name: "50% 葡萄糖", maker: "石药集团", spec: "500ml / 瓶", use: "静脉注射", dose: "500ml", days: "2" },
    ],
  },
  {
    name: "犊牛腹泻症",
    symptoms: ["腹泻", "脱水", "精神萎靡"],
    rx: [
      { id: "r1", kind: "drug", name: "口服补液盐", maker: "瑞普生物", spec: "100g / 包", use: "口服", dose: "1 包", days: "3" },
    ],
  },
];

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
};

// 药品库（用于编辑弹层中搜索匹配）
type DrugItem = { name: string; maker: string; spec: string; recommendedUse: string; defaultUnit: string };
const drugLibrary: DrugItem[] = [
  { name: "氟尼辛葡甲胺注射液", maker: "齐鲁动保", spec: "100ml / 瓶", recommendedUse: "肌肉注射", defaultUnit: "ml" },
  { name: "头孢噻呋钠", maker: "礼蓝动保", spec: "1g / 支", recommendedUse: "肌肉注射", defaultUnit: "g" },
  { name: "碳酸氢钠", maker: "华北制药", spec: "500g / 袋", recommendedUse: "口服", defaultUnit: "g" },
  { name: "复合维生素 B", maker: "扬州威克", spec: "100ml / 瓶", recommendedUse: "肌肉注射", defaultUnit: "ml" },
  { name: "50% 葡萄糖", maker: "石药集团", spec: "500ml / 瓶", recommendedUse: "静脉注射", defaultUnit: "ml" },
  { name: "口服补液盐", maker: "瑞普生物", spec: "100g / 包", recommendedUse: "口服", defaultUnit: "g" },
  { name: "青霉素钠", maker: "华北制药", spec: "80 万 IU / 支", recommendedUse: "肌肉注射", defaultUnit: "IU" },
  { name: "土霉素注射液", maker: "齐鲁动保", spec: "100ml / 瓶", recommendedUse: "肌肉注射", defaultUnit: "ml" },
  { name: "维生素 C 注射液", maker: "石药集团", spec: "10ml / 支", recommendedUse: "静脉注射", defaultUnit: "ml" },
  { name: "地塞米松磷酸钠", maker: "瑞普生物", spec: "5ml / 支", recommendedUse: "肌肉注射", defaultUnit: "ml" },
];

// 使用方式枚举
const useMethods = [
  "肌肉注射",
  "静脉注射",
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

  // 症状（带入上报症状，可加减）
  const [symptoms, setSymptoms] = useState<string[]>(reportedSymptoms);
  const [symptomInput, setSymptomInput] = useState("");

  // 疾病
  const [disease, setDisease] = useState<string>("");
  const [diseaseQuery, setDiseaseQuery] = useState("");
  const [diseaseFocused, setDiseaseFocused] = useState(false);


  // 标准处方（系统内置，不可改药品/剂量/天数；按体重自动算量）
  const [stdRxList, setStdRxList] = useState<Prescription[]>([]);
  const [stdExcluded, setStdExcluded] = useState<Set<string>>(new Set());
  const [cattleWeight, setCattleWeight] = useState("");
  // 特殊处方（需填原因，可自由编辑）
  const [specialReason, setSpecialReason] = useState("");
  const [specialList, setSpecialList] = useState<Prescription[]>([]);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);

  // 终止工单
  const [confirmTerminate, setConfirmTerminate] = useState(false);
  const [termReason, setTermReason] = useState("");
  const [termReasonOther, setTermReasonOther] = useState("");
  const [needTransfer, setNeedTransfer] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
  const earTagLabel = getOrderEarTagLabel(id);

  // 体征数据
  const [temperature, setTemperature] = useState("");
  const [ketone, setKetone] = useState("");

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
    return diseaseLibrary
      .map((d) => ({
        ...d,
        matched: d.symptoms.filter((s) => symptoms.includes(s)).length,
      }))
      .filter((d) => !kw || d.name.toLowerCase().includes(kw))
      .sort((a, b) => b.matched - a.matched);
  }, [diseaseQuery, symptoms]);

  // 候选症状（去除已选）
  const symptomSuggestions = useMemo(() => {
    const kw = symptomInput.trim().toLowerCase();
    return symptomLibrary
      .filter((s) => !symptoms.includes(s))
      .filter((s) => !kw || s.toLowerCase().includes(kw))
      .slice(0, 8);
  }, [symptomInput, symptoms]);

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
    setStdRxList(d.rx.map((r) => ({ ...r })));
    setStdExcluded(new Set());
    setDiseaseFocused(false);
  };

  const toggleStdRx = (rxId: string) => {
    setStdExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(rxId)) next.delete(rxId);
      else next.add(rxId);
      return next;
    });
  };

  const removeSpecialRx = (rxId: string) =>
    setSpecialList((prev) => prev.filter((r) => r.id !== rxId));

  const saveRxEdit = () => {
    if (!editingRx) return;
    setSpecialList((prev) => prev.map((r) => (r.id === editingRx.id ? editingRx : r)));
    setEditingRx(null);
  };

  const submit = () => {
    if (symptoms.length === 0) {
      toast.error("请至少填写一个症状");
      return;
    }
    const temp = parseFloat(temperature);
    if (!temperature.trim() || Number.isNaN(temp)) {
      toast.error("请填写牛只体温");
      return;
    }
    if (temp < 30 || temp > 45) {
      toast.error("体温应在 30 ~ 45 ℃ 之间");
      return;
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
    if (rxList.length === 0) {
      toast.error("处方不能为空");
      return;
    }
    if (photos.length === 0 && videos.length === 0) {
      toast.error("请上传至少一张照片或一段视频");
      return;
    }
    toast.success("诊断已提交");
    navigate({ to: "/m/health/$id", params: { id }, search: { tab: "review" } });
  };

  return (
    <MobileShell title="诊断记录" back hideTabBar>
      <div className="pb-28">
        {/* 工单号（吸顶） */}
        <div className="sticky top-12 z-20 bg-[var(--bg-page)] px-4 pt-3 pb-2 flex items-center justify-between gap-2 border-b border-border">
          <div className="text-caption text-text-tertiary">
            工单 <span className="font-mono text-text-secondary">{id}</span>
          </div>
          <button
            onClick={() => setConfirmTerminate(true)}
            className="text-caption text-[var(--state-danger)] font-medium hover:underline"
          >
            终止工单
          </button>
        </div>

        {/* 顶部提示 */}
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center gap-1.5 text-caption text-primary">
            <Sparkles className="h-3 w-3" />
            已自动将上报信息填写至下方，方便编辑更改
          </div>
        </div>

        <div className="px-4 space-y-3">
          {/* === 症状 === */}
          <Section
            title="症状"
            extra={<span className="text-caption text-text-tertiary">{symptoms.length} 个</span>}
          >
            <TagPicker
              selected={symptoms}
              onChange={setSymptoms}
              presets={symptomLibrary}
            />
          </Section>

          {/* === 体征数据 === */}
          <Section title="体征数据">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <div className="text-caption text-text-tertiary mb-1">
                  体温 <span className="text-[var(--state-danger)]">*</span>
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

          {/* === 处方 === */}
          <Section
            title="处方"
            extra={<span className="text-caption text-text-tertiary">{rxList.length} 项</span>}
          >
            {rxList.length === 0 ? (
              <div className="text-caption text-text-tertiary text-center py-4">
                选择疾病后将自动载入推荐处方，可逐项调整
              </div>
            ) : (
              <ul className="space-y-2">
                {rxList.map((r) => {
                  const isTherapy = r.kind === "therapy";
                  const unit = r.doseUnit || "ml";
                  const slotsText = r.splitTime && r.slots
                    ? (["morning", "noon", "evening"] as SlotKey[])
                        .filter((k) => r.slots?.[k])
                        .map((k) => `${SLOT_LABEL[k]} ${r.slots?.[k]}${unit}`)
                        .join(" / ")
                    : "";
                  return (
                    <li
                      key={r.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
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
                            <span className={`tag ${isTherapy ? "tag-muted" : "tag-brand"}`}>
                              {isTherapy ? "治疗手段" : "用药"}
                            </span>
                          </div>
                          <div className="text-caption text-text-tertiary mt-1">
                            {isTherapy
                              ? [r.therapyMethod, r.frequency, r.days && `${r.days} 天`].filter(Boolean).join(" · ")
                              : [
                                  r.spec,
                                  r.use,
                                  !r.splitTime && r.dose && `${r.dose}${unit} / 次`,
                                  !r.splitTime && r.timesPerDay && `${r.timesPerDay} 次 / 天`,
                                  r.days && `${r.days} 天`,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                          </div>
                          {!isTherapy && r.splitTime && slotsText && (
                            <div className="text-caption text-primary mt-1">{slotsText}</div>
                          )}
                          {isTherapy && r.desc && (
                            <div className="text-caption text-text-tertiary mt-1 line-clamp-2">{r.desc}</div>
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
                            onClick={() => removeRx(r.id)}
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
            <div className="mt-2">
              <button
                onClick={() => {
                  const nextId = `r${Date.now()}`;
                  const item: Prescription = {
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
                  };
                  setEditingRx(item);
                  setRxList((prev) => [...prev, item]);
                }}
                className="w-full h-9 rounded-lg border border-dashed border-border text-body-sm text-text-secondary inline-flex items-center justify-center gap-1.5"
              >
                <Pill className="h-3.5 w-3.5" /> 新增用药
              </button>

            </div>
          </Section>


        {/* === 现场记录 === */}
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
                  <span className="text-[10px]">添加</span>
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

      {/* 终止工单确认 — M 端底部弹层 */}
      {confirmTerminate && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => {
            setConfirmTerminate(false);
            setTermReason("");
            setTermReasonOther("");
            setNeedTransfer(false);
            setTransferTo("");
          }}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 h-12 flex items-center justify-between border-b border-border">
              <div className="text-body font-medium text-[var(--state-danger)]">终止工单</div>
              <button
                type="button"
                onClick={() => {
                  setConfirmTerminate(false);
                  setTermReason("");
                  setTermReasonOther("");
                  setNeedTransfer(false);
                  setTransferTo("");
                }}
                className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <div className="text-caption text-text-tertiary mb-2">终止原因</div>
                <div className="flex flex-wrap gap-1.5">
                  {["牛只健康，无需治疗", "牛只已死亡", "牛只已淘汰", "已转交其他工单", "其他"].map((r) => {
                    const active = termReason === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTermReason(r)}
                        className={`h-8 px-3 rounded-full text-body-sm border ${
                          active
                            ? "bg-brand-subtle text-primary border-primary/40"
                            : "bg-card text-text-secondary border-border"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
                {termReason === "其他" && (
                  <textarea
                    value={termReasonOther}
                    onChange={(e) => setTermReasonOther(e.target.value)}
                    placeholder="请输入其他终止原因"
                    className="mt-2 h-20 w-full rounded-lg bg-white border border-border p-3 text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
                  />
                )}
              </div>

              <TransferBarnControl
                enabled={needTransfer}
                onEnabledChange={setNeedTransfer}
                value={transferTo}
                onValueChange={setTransferTo}
                bordered={false}
              />
            </div>

            <div className="p-4 pt-0 pb-[calc(env(safe-area-inset-bottom)+16px)] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmTerminate(false);
                  setTermReason("");
                  setTermReasonOther("");
                  setNeedTransfer(false);
                  setTransferTo("");
                }}
                className="flex-1 h-11 rounded-lg border border-border text-body text-text-secondary"
              >
                取消
              </button>
              <button
                type="button"
                disabled={!termReason || (termReason === "其他" && !termReasonOther.trim()) || (needTransfer && !transferTo.trim())}
                onClick={() => {
                  const reason = termReason === "其他" ? termReasonOther.trim() : termReason;
                  if (!reason) return;
                  if (needTransfer && !transferTo.trim()) return;
                  if (needTransfer) {
                    setTransferConfirmOpen(true);
                    return;
                  }
                  toast.success("工单已终止");
                  navigate({ to: "/m/health/$id", params: { id }, search: { tab: "review" } });
                }}
                className="flex-1 h-11 rounded-lg bg-[var(--state-danger)] text-white text-body disabled:opacity-50"
              >
                确认终止
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmTransferDialog
        open={transferConfirmOpen}
        earTag={earTagLabel}
        barn={transferTo}
        onCancel={() => setTransferConfirmOpen(false)}
        onConfirm={() => {
          setTransferConfirmOpen(false);
          toast.success(`工单已终止，已安排转栏至 ${transferTo}`);
          navigate({ to: "/m/health/$id", params: { id }, search: { tab: "review" } });
        }}
      />

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
    </MobileShell>
  );
}


function Section({
  title,
  children,
  extra,
}: {
  title: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-card-title text-foreground">{title}</div>
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
    });
    setQuery(d.name);
    setFocused(false);
  };


  const setSlot = (k: SlotKey, v: string) =>
    onChange({ ...value, slots: { ...(value.slots || {}), [k]: v } });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onCancel}>
      <div
        className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl p-4 space-y-4 max-h-[85vh] overflow-y-auto"
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
                    setQuery(e.target.value);
                    setFocused(true);
                    onChange({ ...value, name: e.target.value, maker: "", spec: "" });
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder="输入药品名称搜索"
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
              </div>
              {matched && (
                <div className="rounded-md bg-brand-subtle border border-primary/15 px-2.5 py-1.5 text-caption text-text-secondary mt-1.5">
                  <span className="text-primary font-medium">{matched.maker}</span>
                  <span className="mx-1.5 text-text-tertiary">·</span>
                  规格 {matched.spec}
                </div>
              )}
            </div>

            {/* 使用方式 */}
            <div className="space-y-1.5">
              <span className="text-caption text-text-tertiary">使用方式</span>
              <div className="flex flex-wrap gap-1.5">
                {useMethods.map((m) => {
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
                          className={`text-[10px] px-1 rounded ${
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
