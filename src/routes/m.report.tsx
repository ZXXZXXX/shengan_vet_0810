import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  ScanLine,
  X,
  Mic,
  Video,
  Search,
  Plus,
  Sparkles,
  FileText,
  Check,
  ImagePlus,
  Pencil,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { TransferBarnControl } from "@/components/m/transfer-barn-control";
import { ConfirmTransferDialog } from "@/components/m/confirm-transfer-dialog";
import { TagPicker } from "@/components/m/tag-picker";
import {
  RelatedOrderPicker,
  RelatedOrderCard,
  type RelatedOrder,
} from "@/components/related-order-picker";
import { DiseasePicker } from "@/components/disease-picker";
import { useRole } from "@/lib/mobile-role";
import { toast } from "sonner";

type ReportSearch = {
  target?: string;
  barn?: string;
  lock?: number;
  draftId?: string;
  revisitFrom?: string;
  revisitReason?: string;
};

export const Route = createFileRoute("/m/report")({
  head: () => ({ meta: [{ title: "疾病上报 · 奇点智牧" }] }),
  validateSearch: (s: Record<string, unknown>): ReportSearch => ({
    target: typeof s.target === "string" ? s.target : undefined,
    barn: typeof s.barn === "string" ? s.barn : undefined,
    lock: s.lock ? 1 : undefined,
    draftId: typeof s.draftId === "string" ? s.draftId : undefined,
    revisitFrom: typeof s.revisitFrom === "string" ? s.revisitFrom : undefined,
    revisitReason: typeof s.revisitReason === "string" ? s.revisitReason : undefined,
  }),
  component: ReportPage,
});

// 复诊原因预设
const REVISIT_REASONS = [
  "症状未缓解",
  "症状加重",
  "出现新症状",
  "用药反应异常",
  "需进一步检查",
];

// mock：根据牛只编号生成近 7 日疾病诊疗工单号
function recentDiseaseOrderOf(cowId: string): string | null {
  if (!cowId) return null;
  const num = parseInt(cowId.replace(/\D/g, ""), 10);
  if (isNaN(num)) return null;
  // mock：编号能被 2 整除的牛只视为近 7 日有疾病诊疗工单
  if (num % 2 !== 0) return null;
  return `WO-2026${String(num).padStart(4, "0").slice(-4)}`;
}


type ReportKind = "health";


// 健康工作类型
const healthWorkTypes = ["疾病治疗", "修蹄", "产后护理", "干奶", "疫苗", "驱虫", "普修"] as const;
type WorkType = (typeof healthWorkTypes)[number];

// 每种工作类型的字段配置
type WorkTypeConfig = {
  tags?: { label: string; required: boolean; presets: string[] };
  note?: { label: string; placeholder: string };
  allowDisease: boolean;
};

const workTypeConfig: Record<WorkType, WorkTypeConfig> = {
  疾病治疗: {
    tags: {
      label: "症状标签",
      required: true,
      presets: ["体温升高", "采食下降", "反刍减少", "精神沉郁", "乳房红肿", "跛行", "腹泻", "鼻液增多", "外伤出血", "卧地不起"],
    },
    allowDisease: true,
  },
  修蹄: {
    tags: {
      label: "问题 / 症状标签",
      required: true,
      presets: ["跛行", "蹄底溃疡", "趾间皮炎", "蹄叶炎", "蹄壁裂", "白线病", "蹄过长", "腐蹄"],
    },
    allowDisease: false,
  },
  产后护理: {
    tags: {
      label: "护理 / 异常标签",
      required: true,
      presets: ["胎衣不下", "产道损伤", "子宫复旧异常", "低血钙", "酮病风险", "产后发热", "BCS 偏低", "恶露异常"],
    },
    allowDisease: true,
  },
  干奶: {
    note: { label: "事项说明", placeholder: "请描述干奶批次、用药及注意事项" },
    allowDisease: false,
  },
  疫苗: {
    note: { label: "事项说明", placeholder: "请描述疫苗品种、批次、覆盖范围等" },
    allowDisease: false,
  },
  驱虫: {
    note: { label: "事项说明", placeholder: "请描述驱虫药品、覆盖范围、给药方式" },
    allowDisease: false,
  },
  普修: {
    tags: {
      label: "问题标签",
      required: true,
      presets: ["采食下降", "精神沉郁", "外伤", "卧地不起", "体况下降", "行为异常", "其他异常"],
    },
    allowDisease: false,
  },
};


// 疾病知识库 + 自动治疗方案
const diseaseKB: { name: string; symptoms: string[]; plan: { rx: string; drugs: string[]; duration: string } }[] = [
  {
    name: "乳房炎",
    symptoms: ["乳房红肿", "体温升高", "产奶量骤降"],
    plan: { rx: "RX-001 乳房炎标准处方 A", drugs: ["乳房炎抗生素 5mg ×2", "消炎药 ×1"], duration: "5 天" },
  },
  {
    name: "口蹄疫",
    symptoms: ["体温升高", "口腔水疱", "跛行"],
    plan: { rx: "RX-002 口蹄疫紧急处方", drugs: ["口蹄疫疫苗 A 型 ×1", "消毒液 ×5L"], duration: "立即" },
  },
  {
    name: "蹄叶炎",
    symptoms: ["跛行", "卧地不起"],
    plan: { rx: "RX-003 蹄叶炎康复处方", drugs: ["消炎止痛剂 ×1", "蹄部护理液 ×1"], duration: "7 天" },
  },
  {
    name: "酮病",
    symptoms: ["采食下降", "产奶量骤降", "体温偏低"],
    plan: { rx: "RX-004 酮病调理处方", drugs: ["丙二醇 500ml ×1", "葡萄糖注射液"], duration: "3 天" },
  },
  {
    name: "瘤胃酸中毒",
    symptoms: ["采食下降", "腹泻", "精神沉郁"],
    plan: { rx: "RX-005 瘤胃调理处方", drugs: ["碳酸氢钠", "瘤胃缓冲剂"], duration: "3 天" },
  },
];

// 根据牛只编号查询所属牛舍（mock）
function barnOfCattle(id: string): string {
  const n = parseInt(id.replace(/\D/g, ""), 10);
  if (!isNaN(n)) {
    const idx = (Math.floor(n / 100) % 8) + 1;
    return `${idx} 号牛舍`;
  }
  return "未知牛舍";
}

function loadDraft(draftId?: string, target?: string): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("report:drafts");
    if (!raw) return null;
    const list = JSON.parse(raw) as any[];
    if (draftId) return list.find((x) => x.id === draftId) ?? null;
    if (target) return list.find((x) => x.target === target) ?? null;
    return null;
  } catch {
    return null;
  }
}

function ReportPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const role = useRole();
  // 健康类工作：内部角色（兽医/场长/兽医助理/管理员）与外部专项执行人员（如修蹄工）均可上报
  const canReportHealth = true;

  // 草稿预填：从 localStorage 读取，保证编辑页与上报页排版/字段完全一致
  const draft = useMemo(
    () => loadDraft(search.draftId, search.target),
    [search.draftId, search.target]
  );
  const draftId = draft?.id as string | undefined;

  const [kind] = useState<ReportKind>("health");

  // 上报模式：扫到牛舍且无指定牛只 → 默认以牛舍为对象；从现场上报入口进入时支持手动切换
  const lockMode = !!search.barn || !!search.target;
  const [mode, setMode] = useState<"cow" | "barn">(
    !!search.barn && !search.target ? "barn" : "cow"
  );
  const barnMode = mode === "barn";

  const [targets, setTargets] = useState<string[]>(
    draft?.targets?.length
      ? draft.targets
      : draft?.target
      ? String(draft.target).split("、").filter(Boolean)
      : search.target
      ? [search.target]
      : []
  );
  const [barns, setBarns] = useState<string[]>(
    barnMode && search.barn ? [search.barn] : []
  );
  // 牛舍信息：优先使用 URL 锁定值，否则按首个牛只编号自动获取
  const barn = useMemo(() => {
    if (search.barn) return search.barn;
    if (targets.length > 0) return barnOfCattle(targets[0]);
    return "";
  }, [search.barn, targets]);
  const lockBarn = !!barn;

  const addTarget = (v: string) => {
    const t = v.trim();
    if (!t) return;
    setTargets((prev) => (prev.includes(t) ? prev : [...prev, t]));
  };

  const removeTarget = (t: string) => setTargets((prev) => prev.filter((x) => x !== t));
  const updateTarget = (oldVal: string, newVal: string) => {
    const v = newVal.trim();
    if (!v) return;
    setTargets((prev) => prev.map((x) => (x === oldVal ? v : x)));
  };

  // 牛舍多选（barnMode）
  const allBarns = useMemo(
    () => Array.from({ length: 48 }, (_, i) => `${i + 1} 号牛舍`),
    []
  );

  const addBarn = (v: string) => {
    const t = v.trim();
    if (!t) return;
    setBarns((prev) => (prev.includes(t) ? prev : [...prev, t]));
  };
  const removeBarn = (t: string) => {
    setBarns((prev) => (prev.length <= 1 ? prev : prev.filter((x) => x !== t)));
  };
  const [barnAddQuery, setBarnAddQuery] = useState("");
  const [barnPickerOpen, setBarnPickerOpen] = useState(false);
  const barnMatches = useMemo(() => {
    const kw = barnAddQuery.trim();
    const pool = allBarns.filter((b) => !barns.includes(b));
    return kw ? pool.filter((b) => b.includes(kw)) : pool;
  }, [allBarns, barns, barnAddQuery]);


  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [desc, setDesc] = useState<string>(draft?.desc ?? "");
  const [photos, setPhotos] = useState<number[]>(draft?.photos ?? [1, 2]);
  const [videos, setVideos] = useState<number[]>(draft?.videos ?? []);
  const [voiceSecs, setVoiceSecs] = useState<number | null>(draft?.voiceSecs ?? null);
  const [recording, setRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // 复诊关联
  const fromRevisit = !!search.revisitFrom;
  const [isRevisit, setIsRevisit] = useState<boolean | null>(
    fromRevisit ? true : null
  );
  const [relatedOrderId, setRelatedOrderId] = useState<string>(
    search.revisitFrom ?? ""
  );
  const [revisitReason, setRevisitReason] = useState<string>(
    search.revisitReason ?? ""
  );
  const [revisitReasonOther, setRevisitReasonOther] = useState("");
  const [orderPickerOpen, setOrderPickerOpen] = useState(false);
  const [detectDialog, setDetectDialog] = useState<{
    cowId: string;
    orderId: string;
  } | null>(null);
  

  // 可选关联工单候选（含近 7 日检测到的工单 + 该牛只最近的几条 mock 工单）
  const candidateOrders = useMemo<RelatedOrder[]>(() => {
    const cowId = targets[0] ?? "";
    const targetLabel = cowId ? `#${cowId}` : "—";
    const detected = cowId ? recentDiseaseOrderOf(cowId) : null;
    const list: RelatedOrder[] = [];
    if (detected) {
      list.push({
        id: detected,
        type: "疾病治疗",
        conclusion: "乳房炎急性发作",
        target: targetLabel,
        reportedAt: "2026-05-26 08:12",
        diagnosedAt: "2026-05-26 09:30",
        startedAt: "2026-05-26 10:05",
        completedAt: "2026-05-26 16:40",
        recent: true,
      });
    }
    const extras: RelatedOrder[] = [
      { id: "WO-20260128", type: "疾病治疗", conclusion: "蹄叶炎", target: targetLabel, reportedAt: "2026-04-28 09:10", diagnosedAt: "2026-04-28 10:20", startedAt: "2026-04-28 11:00", completedAt: "2026-04-28 17:20" },
      { id: "WO-20260117", type: "疾病治疗", conclusion: "瘤胃酸中毒", target: targetLabel, reportedAt: "2026-04-17 07:45", diagnosedAt: "2026-04-17 08:50", startedAt: "2026-04-17 09:30", completedAt: "2026-04-17 15:10" },
      { id: "WO-20260105", type: "疾病治疗", conclusion: "酮病", target: targetLabel, reportedAt: "2026-04-05 08:20", diagnosedAt: "2026-04-05 09:15", startedAt: "2026-04-05 10:00", completedAt: "2026-04-05 14:30" },
    ];
    extras.forEach((o) => {
      if (!list.find((x) => x.id === o.id)) list.push(o);
    });
    return list;
  }, [targets]);

  const selectedOrder = useMemo(
    () => candidateOrders.find((o) => o.id === relatedOrderId) ?? null,
    [candidateOrders, relatedOrderId]
  );

  // 牛只填好后探测近 7 日工单：按"首个牛只编号"为粒度，换一头牛重新触发
  const [detectedFor, setDetectedFor] = useState<string | null>(
    fromRevisit && targets[0] ? targets[0] : null
  );
  useEffect(() => {
    if (fromRevisit || barnMode) return;
    const cowId = targets[0];
    if (!cowId) return;
    if (detectedFor === cowId) return;
    const orderId = recentDiseaseOrderOf(cowId);
    setDetectedFor(cowId);
    if (orderId) {
      setDetectDialog({ cowId, orderId });
    } else if (isRevisit === null) {
      setIsRevisit(false);
      setRelatedOrderId("-");
    }
  }, [targets, barnMode, fromRevisit, detectedFor, isRevisit]);

  // 健康
  // 仅支持疾病治疗类型工单
  const [workType] = useState<WorkType>("疾病治疗");
  const cfg = workTypeConfig[workType];
  const [symptoms, setSymptoms] = useState<string[]>(draft?.symptoms ?? []);
  const [note, setNote] = useState<string>(draft?.note ?? "");
  const [diseaseQ, setDiseaseQ] = useState("");
  const [diseaseFocused, setDiseaseFocused] = useState(false);
  const [diseasePickerOpen, setDiseasePickerOpen] = useState(false);
  const [suspectedDisease, setSuspectedDisease] = useState<string>(draft?.suspectedDisease ?? "");


  // 是否转栏
  const [needTransfer, setNeedTransfer] = useState(false);
  const [transferBarn, setTransferBarn] = useState<string>("");
  const [transferQ, setTransferQ] = useState("");
  const [transferFocused, setTransferFocused] = useState(false);
  const lastTransferBarn = typeof window !== "undefined"
    ? localStorage.getItem("mp:lastTransferBarn") ?? ""
    : "";

  // 是否完成"线索上传"——之后才显示疑似疾病（照片/视频必填）
  const evidenceReady = photos.length > 0 || videos.length > 0;

  const diseaseMatches = useMemo(() => {
    const kw = diseaseQ.trim().toLowerCase();
    const base = kw
      ? diseaseKB.filter((d) => d.name.toLowerCase().includes(kw))
      : // 没有关键词时，按症状重合度排序
        [...diseaseKB].sort((a, b) => {
          const ai = a.symptoms.filter((s) => symptoms.includes(s)).length;
          const bi = b.symptoms.filter((s) => symptoms.includes(s)).length;
          return bi - ai;
        });
    return base.slice(0, 6);
  }, [diseaseQ, symptoms]);

  const selectedDisease = useMemo(
    () => diseaseKB.find((d) => d.name === suspectedDisease) ?? null,
    [suspectedDisease]
  );



  const startVoice = () => {
    if (recording) {
      setRecording(false);
      setVoiceSecs(12);
      return;
    }
    setRecording(true);
  };

  const finalRevisitReason =
    revisitReason === "其他" ? revisitReasonOther.trim() : revisitReason;

  const canSubmit =
    (barnMode ? barns.length > 0 : targets.length > 0) &&
    (!cfg?.tags?.required || symptoms.length > 0) &&
    (!cfg?.note || note.trim().length > 0) &&
    desc.trim().length > 0 &&
    evidenceReady &&
    (isRevisit !== true || finalRevisitReason.length > 0);



  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
  const earTagLabel = useMemo(() => {
    if (barnMode) {
      if (barns.length === 0) return "本批牛只";
      return barns.length === 1 ? `${barns[0]} 整栏` : `${barns.join("、")} 整栏`;
    }
    if (targets.length === 0) return "本批牛只";
    const formatted = targets.map((t) => (t.startsWith("#") ? t : `#${t}`));
    if (formatted.length === 1) return formatted[0];
    if (formatted.length <= 3) return formatted.join("、");
    return `${formatted.slice(0, 2).join("、")} 等 ${formatted.length} 头`;
  }, [barnMode, barns, targets]);

  const doSubmit = () => {
    setSubmitted(true);
    setTimeout(() => navigate({ to: "/m/health" }), 900);
  };

  const submit = () => {
    if (!canSubmit) return;
    if (needTransfer && transferBarn) {
      setTransferConfirmOpen(true);
      return;
    }
    doSubmit();
  };

  // 同牛舍其他牛只（mock 数据，规模 30+ 头，需搜索/扫码添加）
  const sameBarnPool = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => `A${2382 + i}`).filter(
        (x) => !targets.includes(x)
      ),
    [targets]
  );
  const [addQuery, setAddQuery] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const addMatches = useMemo(() => {
    const kw = addQuery.trim().toLowerCase();
    const base = kw ? sameBarnPool.filter((x) => x.toLowerCase().includes(kw)) : sameBarnPool;
    return base.slice(0, 8);
  }, [addQuery, sameBarnPool]);
  

  return (
    <MobileShell title="疾病上报" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-5">
        {kind === "health" ? (
          <>

            {/* 上报对象 */}
            <Section
              title="上报对象"
              required
            >

              {!lockMode && (
                <div className="mb-2.5 inline-flex rounded-full border border-border bg-surface-subtle p-0.5">
                  {[
                    { v: "cow" as const, label: "按牛只" },
                    { v: "barn" as const, label: "按牛舍" },
                  ].map((opt) => {
                    const active = mode === opt.v;
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => {
                          if (mode === opt.v) return;
                          setMode(opt.v);
                          setTargets([]);
                          setBarns([]);
                          setAddQuery("");
                          setBarnAddQuery("");
                        }}
                        className={`h-8 min-w-[72px] px-3 rounded-full text-body-sm transition-colors ${
                          active
                            ? "bg-card text-foreground border border-border shadow-sm"
                            : "text-text-tertiary"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {barnMode ? (
                <div className="space-y-2">
                  {barns.map((b) => (
                    <div
                      key={b}
                      className="flex items-center h-12 pl-3 pr-2 rounded-xl bg-card border border-border text-body text-foreground gap-2"
                    >
                      <span className="truncate">{b}</span>
                      <button
                        onClick={() => setBarns([])}
                        className="ml-auto h-9 w-9 inline-flex items-center justify-center rounded-full text-text-tertiary active:bg-surface-subtle"
                        aria-label="删除"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {barns.length === 0 && (
                    <div className="rounded-xl border border-border bg-card p-2.5 space-y-2.5">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                          <input
                            autoFocus
                            value={barnAddQuery}
                            onChange={(e) => setBarnAddQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && barnAddQuery.trim()) {
                                e.preventDefault();
                                addBarn(barnAddQuery.trim());
                                setBarnAddQuery("");
                              }
                            }}
                            placeholder="输入牛舍编号搜索或回车添加"
                            className="w-full h-11 pl-9 pr-2 rounded-lg bg-surface-subtle border border-border text-body"
                          />
                        </div>
                        <button className="h-11 px-3 rounded-lg bg-brand-subtle text-primary inline-flex items-center gap-1 text-body-sm font-medium active:scale-[0.97] transition-transform">
                          <ScanLine className="h-4 w-4" /> 扫码
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {barnMatches.length === 0 ? (
                          <span className="text-caption text-text-tertiary px-1 py-1">无匹配结果</span>
                        ) : (
                          barnMatches.map((s) => (
                            <button
                              key={s}
                              onClick={() => addBarn(s)}
                              className="h-8 px-3 rounded-full bg-surface-subtle border border-border text-caption text-text-secondary inline-flex items-center gap-1 active:scale-[0.96]"
                            >
                              <Plus className="h-3 w-3" />
                              {s}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
              <div
                className="space-y-2"
                onClick={(e) => {
                  if (editingTarget && (e.target as HTMLElement).tagName !== "INPUT") {
                    updateTarget(editingTarget, editingValue);
                    setEditingTarget(null);
                  }
                }}
              >
                {targets.map((t) => {
                  const isEditing = editingTarget === t;
                  const canDelete = true;
                  const tBarn = search.barn ?? barnOfCattle(t);
                  return (
                    <div
                      key={t}
                      className="flex items-center h-12 pl-3 pr-2 rounded-xl bg-card border border-border text-body text-foreground gap-2"
                    >
                      {isEditing ? (
                        <>
                          <span className="font-mono text-text-tertiary">#</span>
                          <input
                            autoFocus
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateTarget(t, editingValue);
                                setEditingTarget(null);
                              } else if (e.key === "Escape") {
                                setEditingTarget(null);
                              }
                            }}
                            className="font-mono flex-1 min-w-0 h-9 px-2 rounded-md bg-surface-subtle border border-border text-body"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="font-mono text-text-tertiary shrink-0 text-caption">· {tBarn}</span>
                        </>
                      ) : (
                        <>
                          <span className="font-mono truncate">
                            {`#${t} · ${tBarn}`}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTarget(t);
                              setEditingValue(t);
                            }}
                            className="ml-auto h-9 w-9 inline-flex items-center justify-center rounded-full text-text-tertiary active:bg-surface-subtle"
                            aria-label="编辑"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTarget(t);
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-full text-text-tertiary active:bg-surface-subtle"
                              aria-label="删除"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                {targets.length > 0 && (
                  <div className="text-caption text-text-tertiary">
                    牛舍信息根据牛只编号自动获取，不可更改
                  </div>
                )}
                {targets.length === 0 && (
                  <div className="rounded-xl border border-border bg-card p-2.5 space-y-2.5">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                        <input
                          autoFocus
                          value={addQuery}
                          onChange={(e) => setAddQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && addQuery.trim()) {
                              e.preventDefault();
                              addTarget(addQuery.trim());
                              setAddQuery("");
                            }
                          }}
                          placeholder="输入牛只编号回车添加"
                          className="w-full h-11 pl-9 pr-2 rounded-lg bg-surface-subtle border border-border text-body"
                        />
                      </div>
                      <button className="h-11 px-3 rounded-lg bg-brand-subtle text-primary inline-flex items-center gap-1 text-body-sm font-medium active:scale-[0.97] transition-transform">
                        <ScanLine className="h-4 w-4" /> 扫码
                      </button>
                    </div>
                    <div className="text-caption text-text-tertiary">
                      输入牛只编号后，将自动获取所属牛舍信息
                    </div>
                  </div>
                )}
              </div>
              )}

            </Section>


            {/* 复诊信息：默认折叠，仅切到"是"时展开 */}
            {!barnMode && (
              <Section title="复诊信息">
                <div className="flex items-center justify-between">
                  <div className="text-body-sm text-foreground">是否为复诊</div>
                  <div className="inline-flex rounded-full border border-border bg-surface-subtle p-0.5">
                    {[
                      { v: false, label: "否" },
                      { v: true, label: "是" },
                    ].map((opt) => {
                      const active = isRevisit === opt.v;
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => {
                            if (opt.v) {
                              setIsRevisit(true);
                              if (!relatedOrderId || relatedOrderId === "-") {
                                const cowId = targets[0];
                                const detected = cowId ? recentDiseaseOrderOf(cowId) : null;
                                setRelatedOrderId(detected ?? "");
                              }
                            } else {
                              setIsRevisit(false);
                              setRelatedOrderId("-");
                              setRevisitReason("");
                              setRevisitReasonOther("");
                            }
                          }}
                          className={`h-8 min-w-[56px] px-3 rounded-full text-body-sm transition-colors ${
                            active
                              ? opt.v
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-foreground border border-border"
                              : "text-text-tertiary"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isRevisit === true && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="text-caption text-text-tertiary mb-2">
                        关联原始工单 <span className="text-[var(--state-danger)]">*</span>
                      </div>
                      {selectedOrder ? (
                        <div className="space-y-2">
                          <RelatedOrderCard order={selectedOrder} selected />
                          <button
                            type="button"
                            onClick={() => setOrderPickerOpen(true)}
                            className="w-full h-10 rounded-lg border border-dashed border-border bg-card text-body-sm text-text-secondary active:bg-surface-subtle"
                          >
                            重新选择
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOrderPickerOpen(true)}
                          className="w-full h-11 rounded-lg border border-dashed border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1 active:bg-surface-subtle"
                        >
                          <Search className="h-4 w-4" />
                          选择关联工单
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="text-caption text-text-tertiary mb-2">
                        复诊原因 <span className="text-[var(--state-danger)]">*</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[...REVISIT_REASONS, "其他"].map((r) => {
                          const active = revisitReason === r;
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setRevisitReason(r)}
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
                      {revisitReason === "其他" && (
                        <textarea
                          value={revisitReasonOther}
                          onChange={(e) => setRevisitReasonOther(e.target.value)}
                          placeholder="请输入复诊原因"
                          className="mt-2 w-full min-h-[72px] rounded-lg border border-border bg-card px-3 py-2 text-body-sm placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary/40"
                        />
                      )}
                    </div>
                  </div>
                )}
              </Section>
            )}

            {(
              <></>
            )}
            {true && (
              <>
                {/* 标签字段（按工作类型显示） */}
                {cfg?.tags && (
                  <Section
                    title={cfg.tags.label}
                    required={cfg.tags.required}
                    hint="可多选；输入关键词搜索，未命中可直接新建"
                  >
                    <TagPicker
                      selected={symptoms}
                      onChange={setSymptoms}
                      presets={cfg.tags.presets}
                    />
                  </Section>
                )}


                {/* 事项说明（干奶 / 疫苗 / 驱虫） */}
                {cfg?.note && (
                  <Section title={cfg.note.label} required>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={cfg.note.placeholder}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-card border border-border text-body placeholder:text-text-tertiary resize-none leading-relaxed"
                    />
                    <div className="text-right text-caption text-text-tertiary mt-1">{note.length} / 200</div>
                  </Section>
                )}

                {/* 处理人已移至页面底部 */}


                {/* 证据材料 / 线索 */}
                <EvidenceSection
                  desc={desc}
                  setDesc={setDesc}
                  photos={photos}
                  setPhotos={setPhotos}
                  videos={videos}
                  setVideos={setVideos}
                  voiceSecs={voiceSecs}
                  setVoiceSecs={setVoiceSecs}
                  recording={recording}
                  onVoiceToggle={startVoice}
                />

                {/* 疑似疾病 —— 仅在线索上传后显示 */}
                {cfg?.allowDisease && evidenceReady && (
                  <Section
                    title="疑似疾病"
                    hint="可选；选择后将从诊疗知识库自动拉取治疗方案"
                  >
                    {!suspectedDisease ? (
                      <button
                        type="button"
                        onClick={() => setDiseasePickerOpen(true)}
                        className="w-full h-11 rounded-lg border border-dashed border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1 active:bg-surface-subtle"
                      >
                        <Search className="h-4 w-4" />
                        选择疑似疾病
                      </button>
                    ) : (
                      <div className="rounded-lg border border-primary/20 bg-brand-subtle p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-primary" />
                            <span className="text-body-sm text-primary font-medium">
                              {suspectedDisease}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSuspectedDisease("");
                              setDiseaseQ("");
                            }}
                            className="text-caption text-text-tertiary"
                          >
                            重选
                          </button>
                        </div>
                        {selectedDisease && (
                          <div className="rounded-md bg-card border border-border p-2.5 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
                              <Sparkles className="h-3 w-3 text-primary" />
                              已自动匹配治疗方案
                            </div>
                            <div className="flex items-center gap-1.5 text-body-sm text-foreground">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              {selectedDisease.plan.rx}
                            </div>
                            <div className="text-caption text-text-secondary">
                              用药：{selectedDisease.plan.drugs.join("、")}
                            </div>
                            <div className="text-caption text-text-secondary">
                              疗程：{selectedDisease.plan.duration}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Section>
                )}

                {/* 是否转栏 */}
                <Section title="是否转栏" hint="转入新栏会同步更新档案">
                  <TransferBarnControl
                    enabled={needTransfer}
                    onEnabledChange={setNeedTransfer}
                    value={transferBarn}
                    onValueChange={setTransferBarn}
                    exclude={[barn, ...barns]}
                    bordered={false}
                  />
                </Section>

              </>
            )}
          </>
        ) : null}

      </div>

      {/* 底部提交 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card/95 backdrop-blur border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_16px_-8px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowDraftDialog(true)}
            className="h-12 px-4 rounded-xl border border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center active:bg-surface-subtle active:scale-[0.98] transition-transform"
          >
            存草稿
          </button>
          <button
            disabled={!canSubmit || submitted}
            onClick={submit}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-body font-medium disabled:opacity-50 active:scale-[0.98] transition-all shadow-[0_4px_12px_-4px_color-mix(in_oklab,var(--primary)_55%,transparent)] disabled:shadow-none"
          >
            {submitted ? "已提交,工作已生成" : "提交上报"}
          </button>
        </div>
      </div>

      {/* 复诊检测弹窗 */}
      <DiseasePicker
        open={diseasePickerOpen}
        onClose={() => setDiseasePickerOpen(false)}
        diseases={diseaseKB}
        selectedName={suspectedDisease}
        matchedSymptoms={symptoms}
        onSelect={(d) => setSuspectedDisease(d.name)}
      />

      <RelatedOrderPicker
        open={orderPickerOpen}
        onClose={() => setOrderPickerOpen(false)}
        orders={candidateOrders}
        selectedId={relatedOrderId}
        onSelect={(o) => setRelatedOrderId(o.id)}
      />

      {detectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[360px] rounded-2xl bg-card p-5 space-y-4">
            <h3 className="text-card-title text-foreground">是否为复诊？</h3>
            <p className="text-body-sm text-text-secondary">
              监测到牛只
              <span className="font-mono text-foreground"> #{detectDialog.cowId} </span>
              近 7 日有疾病诊疗工单
              <span className="font-mono text-foreground"> {detectDialog.orderId}</span>
              ，本次是否为复诊？
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsRevisit(false);
                  setRelatedOrderId("-");
                  setDetectDialog(null);
                }}
                className="flex-1 h-10 rounded-lg border border-border bg-card text-body-sm text-text-secondary"
              >
                否，非复诊
              </button>
              <button
                onClick={() => {
                  setIsRevisit(true);
                  setRelatedOrderId(detectDialog.orderId);
                  setDetectDialog(null);
                }}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm"
              >
                是，复诊
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmTransferDialog
        open={transferConfirmOpen}
        earTag={earTagLabel}
        barn={transferBarn}
        onCancel={() => setTransferConfirmOpen(false)}
        onConfirm={() => {
          setTransferConfirmOpen(false);
          doSubmit();
        }}
      />


      {/* 存草稿确认弹窗 */}
      {showDraftDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-[360px] rounded-2xl bg-card p-5 space-y-4">
            <h3 className="text-card-title text-foreground">保存草稿？</h3>
            <p className="text-body-sm text-text-secondary">
              当前已填写的内容将被保存为草稿，下次进入可继续编辑。
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDraftDialog(false)}
                className="flex-1 h-10 rounded-lg border border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const draftRecord = {
                    id: draftId ?? `DR-${Date.now().toString().slice(-6)}`,
                    target: targets.join("、"),
                    targets,
                    workType,
                    symptoms,
                    note,
                    suspectedDisease,
                    desc,
                    photos,
                    videos,
                    voiceSecs,
                    savedAt: new Date().toISOString(),
                  };
                  try {
                    const raw = localStorage.getItem("report:drafts");
                    const list: any[] = raw ? JSON.parse(raw) : [];
                    const idx = list.findIndex((x) => x.id === draftRecord.id);
                    if (idx >= 0) list.splice(idx, 1);
                    list.unshift(draftRecord);
                    localStorage.setItem("report:drafts", JSON.stringify(list));
                  } catch {
                    localStorage.setItem("report:drafts", JSON.stringify([draftRecord]));
                  }
                  setShowDraftDialog(false);
                  toast.success("草稿已保存");
                  setTimeout(() => navigate({ to: "/m/drafts" }), 400);
                }}


                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function EvidenceSection({
  desc,
  setDesc,
  photos,
  setPhotos,
  videos,
  setVideos,
  voiceSecs,
  setVoiceSecs,
  recording,
  onVoiceToggle,
  hideVideo,
  descLabel = "具体描述",
}: {
  desc: string;
  setDesc: (v: string) => void;
  photos: number[];
  setPhotos: React.Dispatch<React.SetStateAction<number[]>>;
  videos: number[];
  setVideos: React.Dispatch<React.SetStateAction<number[]>>;
  voiceSecs: number | null;
  setVoiceSecs: (v: number | null) => void;
  recording: boolean;
  onVoiceToggle: () => void;
  hideVideo?: boolean;
  descLabel?: string;
}) {

  type MediaItem = { id: number; type: "photo" | "video" };
  const media: MediaItem[] = [
    ...photos.map((id) => ({ id, type: "photo" as const })),
    ...videos.map((id) => ({ id, type: "video" as const })),
  ];
  const maxMedia = 9;
  const remaining = maxMedia - media.length;

  const voiceCount = voiceSecs === null ? 0 : 1;

  return (
    <Section title="现场记录">
      <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mb-2">
        <Camera className="h-3.5 w-3.5" /> 照片 / 视频
        <span className="text-[var(--state-danger)]">*</span>
        <span>· {media.length} 条</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {media.map((m) => (
          <div
            key={`${m.type}-${m.id}`}
            className="relative aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border flex items-center justify-center"
          >
            {m.type === "video" && <Video className="h-5 w-5 text-text-tertiary" />}
            <button
              onClick={() =>
                m.type === "photo"
                  ? setPhotos((prev) => prev.filter((x) => x !== m.id))
                  : setVideos((prev) => prev.filter((x) => x !== m.id))
              }
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/85 text-background inline-flex items-center justify-center shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <label className="aspect-square rounded-lg bg-surface-subtle flex flex-col items-center justify-center gap-1 text-text-tertiary cursor-pointer active:bg-border transition-colors">
            <Camera className="h-5 w-5" />
            <span className="text-caption">添加</span>
            <input
              type="file"
              accept={hideVideo ? "image/*" : "image/*,video/*"}
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                files.forEach((f) => {
                  if (f.type.startsWith("video/")) setVideos((p) => [...p, Date.now() + Math.random()]);
                  else setPhotos((p) => [...p, Date.now() + Math.random()]);
                });
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mt-4 mb-2">
        <Mic className="h-3.5 w-3.5" /> 录音 · {voiceCount} 条
      </div>
      {voiceSecs === null ? (
        <button
          onClick={onVoiceToggle}
          className={`w-full h-11 rounded-lg border border-dashed inline-flex items-center justify-center gap-2 text-body-sm active:scale-[0.98] transition-all ${
            recording
              ? "border-[var(--state-danger)]/50 bg-[var(--state-danger)]/8 text-[var(--state-danger)]"
              : "border-border bg-card text-text-secondary"
          }`}
        >
          <Mic className={`h-4 w-4 ${recording ? "animate-pulse" : ""}`} />
          {recording ? "录音中…点击结束" : "点击开始录音"}
        </button>
      ) : (
        <div className="flex items-center gap-2 h-11 px-3 rounded-lg bg-brand-subtle border border-primary/20">
          <Mic className="h-4 w-4 text-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full w-1/2 bg-primary" />
          </div>
          <span className="text-caption text-primary font-mono">00:{String(voiceSecs).padStart(2, "0")}</span>
          <button
            onClick={() => setVoiceSecs(null)}
            className="h-7 w-7 rounded-full bg-card border border-border inline-flex items-center justify-center text-text-tertiary active:bg-surface-subtle"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mt-4">
        <div className="text-body-sm text-foreground mb-2">
          {descLabel}
          <span className="text-[var(--state-danger)] ml-0.5">*</span>
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="补充体征、用药反应、隔离建议等"
          rows={3}
          maxLength={500}
          className="w-full p-3 rounded-lg bg-card border border-border text-body placeholder:text-text-tertiary resize-none leading-relaxed"
        />
        <div className="text-right text-caption text-text-tertiary mt-1">{desc.length} / 500</div>
      </div>
    </Section>
  );
}

function Section({
  title,
  required,
  hint,
  children,
}: {
  title: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="text-card-title text-foreground">
          {title}
          {required && <span className="text-[var(--state-danger)] ml-0.5">*</span>}
        </div>
        {hint && <div className="text-caption text-text-tertiary text-right">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

