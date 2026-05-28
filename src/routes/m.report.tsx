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
  UserCheck,
  Sparkles,
  FileText,
  Check,
  ImagePlus,
  ChevronDown,
  Pencil,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole } from "@/lib/mobile-role";
import { toast } from "sonner";

type ReportSearch = { target?: string; barn?: string; lock?: number };

export const Route = createFileRoute("/m/report")({
  head: () => ({ meta: [{ title: "现场上报 · 奇点智牧" }] }),
  validateSearch: (s: Record<string, unknown>): ReportSearch => ({
    target: typeof s.target === "string" ? s.target : undefined,
    barn: typeof s.barn === "string" ? s.barn : undefined,
    lock: s.lock ? 1 : undefined,
  }),
  component: ReportPage,
});

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

// 具备处方权的处理人（admin / 兽医 / 场长）
const prescriptionHandlers = [
  { id: "u-li", name: "李雨晴", role: "兽医" },
  { id: "u-chen", name: "陈晓东", role: "兽医" },
  { id: "u-wang", name: "王建国", role: "场长" },
  { id: "u-zhao", name: "赵兽医", role: "兽医" },
];

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

function ReportPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const role = useRole();
  // 健康类工作：内部角色（兽医/场长/兽医助理/管理员）与外部专项执行人员（如修蹄工）均可上报
  const canReportHealth = true;

  const [kind] = useState<ReportKind>("health");

  const [targets, setTargets] = useState<string[]>(search.target ? [search.target] : []);
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
    setTarget("");
  };
  const removeTarget = (t: string) => setTargets((prev) => prev.filter((x) => x !== t));
  const updateTarget = (oldVal: string, newVal: string) => {
    const v = newVal.trim();
    if (!v) return;
    setTargets((prev) => prev.map((x) => (x === oldVal ? v : x)));
  };
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState<number[]>([1, 2]);
  const [videos, setVideos] = useState<number[]>([]);
  const [voiceSecs, setVoiceSecs] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // 健康
  const [workType, setWorkType] = useState<WorkType | "">("");
  const cfg = workType ? workTypeConfig[workType] : null;
  const [symptomTags, setSymptomTags] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [note, setNote] = useState("");
  const [handlerId, setHandlerId] = useState<string>("");
  const [diseaseQ, setDiseaseQ] = useState("");
  const [diseaseFocused, setDiseaseFocused] = useState(false);
  const [suspectedDisease, setSuspectedDisease] = useState<string>("");

  // 切换工作类型时重置标签集
  useEffect(() => {
    if (cfg?.tags) {
      setSymptomTags([...cfg.tags.presets, "其他"]);
    } else {
      setSymptomTags([]);
    }
    setSymptoms([]);
    setShowCustomInput(false);
    setCustomSymptom("");
    setNote("");
    if (!cfg?.allowDisease) {
      setSuspectedDisease("");
      setDiseaseQ("");
    }
  }, [workType]);


  // 是否完成"线索上传"——之后才显示疑似疾病
  const evidenceReady =
    desc.trim().length > 0 || photos.length > 0 || videos.length > 0 || voiceSecs !== null;

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

  const toggleSymptom = (s: string) => {
    if (s === "其他") {
      setShowCustomInput(true);
      return;
    }
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const addCustomSymptom = () => {
    const v = customSymptom.trim();
    if (!v) return;
    if (!symptomTags.includes(v)) {
      // 插入到"其他"之前
      setSymptomTags((prev) => {
        const idx = prev.indexOf("其他");
        const copy = [...prev];
        copy.splice(idx, 0, v);
        return copy;
      });
    }
    if (!symptoms.includes(v)) setSymptoms((prev) => [...prev, v]);
    setCustomSymptom("");
    setShowCustomInput(false);
  };


  const startVoice = () => {
    if (recording) {
      setRecording(false);
      setVoiceSecs(12);
      return;
    }
    setRecording(true);
  };

  const canSubmit =
    targets.length > 0 &&
    workType !== "" &&
    (!cfg?.tags?.required || symptoms.length > 0) &&
    (!cfg?.note || note.trim().length > 0) &&
    handlerId !== "" &&
    desc.trim().length > 0 &&
    evidenceReady;


  const submit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => navigate({ to: "/m/health" }), 900);
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
    <MobileShell title="现场上报" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-3">
        {kind === "health" ? (
          <>

            {/* 上报对象 */}
            <Section title="上报对象" required hint="可一次性上报多个对象">
              {lockTarget ? (
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
                    const canDelete = targets.length > 1;
                    return (
                      <div
                        key={t}
                        className="flex items-center h-12 px-3 rounded-lg bg-surface-subtle border border-border text-body text-foreground gap-2"
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
                              className="font-mono flex-1 min-w-0 h-8 px-2 rounded-md bg-card border border-border text-body"
                              onClick={(e) => e.stopPropagation()}
                            />
                            {lockBarn && (
                              <span className="font-mono text-text-tertiary shrink-0">· {barn}</span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="font-mono truncate">
                              {`#${t}${lockBarn ? ` · ${barn}` : ""}`}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTarget(t);
                                setEditingValue(t);
                              }}
                              className="ml-auto h-7 w-7 inline-flex items-center justify-center rounded-full text-text-tertiary hover:text-foreground"
                              aria-label="编辑"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTarget(t);
                                }}
                                className="h-7 w-7 inline-flex items-center justify-center rounded-full text-text-tertiary hover:text-foreground"
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
                  <div className="text-caption text-text-tertiary">
                    至少保留 1 项；牛舍信息不可更改
                  </div>
                  {lockBarn && (
                    <>
                      {!showAddPanel ? (
                        <button
                          onClick={() => setShowAddPanel(true)}
                          className="w-full h-10 rounded-lg border border-dashed border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          追加同牛舍其他牛只
                        </button>
                      ) : (
                        <div className="rounded-lg border border-border bg-card p-2 space-y-2">
                          <div className="flex gap-2">
                            <div className="flex-1 relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
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
                                placeholder="输入牛只编号搜索"
                                className="w-full h-9 pl-8 pr-2 rounded-md bg-surface-subtle border border-border text-body-sm"
                              />
                            </div>
                            <button className="h-9 px-2.5 rounded-md bg-brand-subtle text-primary inline-flex items-center gap-1 text-body-sm">
                              <ScanLine className="h-4 w-4" /> 扫码
                            </button>
                            <button
                              onClick={() => {
                                setShowAddPanel(false);
                                setAddQuery("");
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-md text-text-tertiary"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {addMatches.length === 0 ? (
                              <span className="text-caption text-text-tertiary px-1 py-1">无匹配结果</span>
                            ) : (
                              addMatches.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => addTarget(s)}
                                  className="h-7 px-2.5 rounded-full bg-surface-subtle border border-border text-caption text-text-secondary inline-flex items-center gap-1 font-mono"
                                >
                                  <Plus className="h-3 w-3" />
                                  {s}
                                </button>
                              ))
                            )}
                          </div>
                          <div className="text-caption text-text-tertiary">
                            该牛舍共 {sameBarnPool.length + targets.length} 头，按编号搜索或扫码添加
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTarget(target);
                        }
                      }}
                      placeholder="输入牛只编号或牛舍后回车添加，可多选"
                      className="flex-1 h-12 px-3 rounded-lg bg-card border border-border text-body placeholder:text-text-tertiary"
                    />
                    <button
                      onClick={() => addTarget(target)}
                      disabled={!target.trim()}
                      className="h-12 px-3 rounded-lg bg-primary text-primary-foreground text-body-sm disabled:opacity-40"
                    >
                      添加
                    </button>
                    <button className="h-12 px-3 rounded-lg bg-brand-subtle text-primary inline-flex items-center gap-1 text-body-sm">
                      <ScanLine className="h-4 w-4" /> 扫码
                    </button>
                  </div>
                  {targets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-surface-subtle border border-border">
                      {targets.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-full bg-card border border-border text-caption text-foreground"
                        >
                          {t}
                          <button
                            onClick={() => removeTarget(t)}
                            className="h-5 w-5 inline-flex items-center justify-center rounded-full text-text-tertiary hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <span className="ml-auto self-center text-caption text-text-tertiary">
                        共 {targets.length} 项
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {["3 号牛舍", "犊牛舍 A", "批量·待挤奶群"].map((q) => (
                      <button
                        key={q}
                        onClick={() => addTarget(q)}
                        className="h-7 px-2.5 rounded-full bg-card border border-border text-caption text-text-secondary"
                      >
                        + {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* 工作类型 */}
            <Section title="工作类型" required>
              <div className="grid grid-cols-4 gap-2">
                {healthWorkTypes.map((t) => {
                  const active = workType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setWorkType(t)}
                      className={`h-10 rounded-lg border text-body-sm transition-colors ${
                        active
                          ? "bg-brand-subtle border-primary/30 text-primary"
                          : "bg-card border-border text-text-secondary"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </Section>

            {workType !== "" && (
              <>
                {/* 标签字段（按工作类型显示） */}
                {cfg?.tags && (
                  <Section
                    title={cfg.tags.label}
                    required={cfg.tags.required}
                    hint={`可多选；可通过"其他"自行添加`}
                  >
                  <div className="flex flex-wrap gap-2">
                    {symptomTags.map((t) => {
                      const active = symptoms.includes(t);
                      const isOther = t === "其他";
                      return (
                        <button
                          key={t}
                          onClick={() => toggleSymptom(t)}
                          className={`h-8 px-3 rounded-full text-body-sm transition-colors inline-flex items-center gap-1 ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : isOther
                              ? "bg-card border border-dashed border-border text-text-secondary"
                              : "bg-card border border-border text-text-secondary"
                          }`}
                        >
                          {isOther && <Plus className="h-3 w-3" />}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {showCustomInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        autoFocus
                        value={customSymptom}
                        onChange={(e) => setCustomSymptom(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                        placeholder="输入自定义标签"
                        className="flex-1 h-10 px-3 rounded-lg bg-card border border-border text-body-sm"
                      />
                      <button
                        onClick={addCustomSymptom}
                        className="h-10 px-3 rounded-lg bg-primary text-primary-foreground text-body-sm"
                      >
                        添加
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomSymptom("");
                        }}
                        className="h-10 px-3 rounded-lg bg-card border border-border text-text-secondary text-body-sm"
                      >
                        取消
                      </button>
                    </div>
                  )}
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
                      className="w-full p-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary resize-none"
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
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                        <input
                          value={diseaseQ}
                          onChange={(e) => {
                            setDiseaseQ(e.target.value);
                            setDiseaseFocused(true);
                          }}
                          onFocus={() => setDiseaseFocused(true)}
                          onBlur={() => setTimeout(() => setDiseaseFocused(false), 150)}
                          placeholder="搜索疾病名称，或根据症状自动推荐"
                          className="w-full h-12 pl-9 pr-3 rounded-lg bg-card border border-border text-body placeholder:text-text-tertiary"
                        />
                        {diseaseFocused && diseaseMatches.length > 0 && (
                          <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg max-h-72 overflow-auto">
                            {diseaseMatches.map((d) => {
                              const overlap = d.symptoms.filter((s) => symptoms.includes(s));
                              return (
                                <button
                                  key={d.name}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setSuspectedDisease(d.name);
                                    setDiseaseFocused(false);
                                  }}
                                  className="w-full text-left px-3 py-2.5 hover:bg-surface-subtle border-b border-border last:border-b-0"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-body-sm text-foreground">{d.name}</span>
                                    {overlap.length > 0 && (
                                      <span className="tag tag-brand">
                                        匹配 {overlap.length} 项症状
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-caption text-text-tertiary mt-0.5 truncate">
                                    典型症状：{d.symptoms.join("、")}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
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

                {/* 处理人（放在最后，下拉展开选择） */}
                <Section title="处理人" required hint="仅可选择具备处方权的角色">
                  <HandlerDropdown
                    value={handlerId}
                    onChange={setHandlerId}
                    options={prescriptionHandlers}
                  />
                </Section>
              </>
            )}
          </>
        ) : null}

      </div>

      {/* 底部提交 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDraftDialog(true)}
            className="h-12 px-4 rounded-lg border border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center active:bg-surface-subtle"
          >
            存草稿
          </button>
          <button
            disabled={!canSubmit || submitted}
            onClick={submit}
            className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground text-body disabled:opacity-50 transition-opacity"
          >
            {submitted ? "已提交,工作已生成" : "提交上报"}
          </button>
        </div>
      </div>

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
                  const draft = {
                    id: `DR-${Date.now().toString().slice(-6)}`,
                    target: targets.join("、"),
                    targets,
                    workType,
                    symptoms,
                    customSymptom,
                    note,
                    handlerId,
                    suspectedDisease,
                    desc,
                    photos,
                    videos,
                    voiceSecs,
                    savedAt: new Date().toISOString(),
                  };
                  try {
                    const raw = localStorage.getItem("report:drafts");
                    const list = raw ? JSON.parse(raw) : [];
                    list.unshift(draft);
                    localStorage.setItem("report:drafts", JSON.stringify(list));
                  } catch {
                    localStorage.setItem("report:drafts", JSON.stringify([draft]));
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

  return (
    <>
      <Section title="照片 / 视频" hint="支持拍摄或从相册选择">
        <div className="grid grid-cols-3 gap-2">
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
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/80 text-background inline-flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {remaining > 0 && (
            <label className="aspect-square rounded-lg border border-dashed border-border bg-card flex flex-col items-center justify-center gap-1 text-text-tertiary cursor-pointer">
              <ImagePlus className="h-5 w-5" />
              <span className="text-caption">拍摄 / 选择</span>
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
      </Section>

      <Section title="现场录音">
        {voiceSecs === null ? (
          <button
            onClick={onVoiceToggle}
            className={`w-full h-12 rounded-lg border inline-flex items-center justify-center gap-2 text-body-sm transition-colors ${
              recording
                ? "border-[var(--state-danger)]/40 bg-[var(--state-danger)]/8 text-[var(--state-danger)]"
                : "border-border bg-card text-text-secondary"
            }`}
          >
            <Mic className={`h-4 w-4 ${recording ? "animate-pulse" : ""}`} />
            {recording ? "录音中…点击结束" : "按下开始录音"}
          </button>
        ) : (
          <div className="flex items-center gap-2 h-12 px-3 rounded-lg bg-brand-subtle border border-primary/20">
            <Mic className="h-4 w-4 text-primary" />
            <div className="flex-1 h-1.5 rounded-full bg-primary/20 overflow-hidden">
              <div className="h-full w-1/2 bg-primary" />
            </div>
            <span className="text-caption text-primary font-mono">00:{String(voiceSecs).padStart(2, "0")}</span>
            <button
              onClick={() => setVoiceSecs(null)}
              className="h-7 w-7 rounded-full bg-card border border-border inline-flex items-center justify-center text-text-tertiary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </Section>

      <Section title={descLabel} required>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="请补充关键信息（必填）"
          rows={3}
          className="w-full p-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary resize-none"
        />
        <div className="text-right text-caption text-text-tertiary mt-1">{desc.length} / 200</div>
      </Section>

    </>
  );
}

function HandlerDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string; role: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-12 px-3 rounded-lg border border-border bg-card flex items-center justify-between"
      >
        <span className="inline-flex items-center gap-1.5">
          <UserCheck className={`h-3.5 w-3.5 ${selected ? "text-primary" : "text-text-tertiary"}`} />
          {selected ? (
            <>
              <span className="text-body-sm text-foreground">{selected.name}</span>
              <span className="text-caption text-text-tertiary">· {selected.role}</span>
            </>
          ) : (
            <span className="text-body-sm text-text-tertiary">点击选择处理人</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
            {options.map((o) => {
              const active = o.id === value;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className={`w-full px-3 h-12 flex items-center justify-between text-left border-b border-border last:border-b-0 ${
                    active ? "bg-brand-subtle" : "hover:bg-surface-subtle"
                  }`}
                >
                  <div>
                    <div className={`text-body-sm ${active ? "text-primary" : "text-foreground"}`}>{o.name}</div>
                    <div className="text-caption text-text-tertiary mt-0.5">{o.role}</div>
                  </div>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
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
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-body-sm text-text-secondary">
          {title}
          {required && <span className="text-[var(--state-danger)] ml-0.5">*</span>}
        </div>
        {hint && <div className="text-caption text-text-tertiary">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

