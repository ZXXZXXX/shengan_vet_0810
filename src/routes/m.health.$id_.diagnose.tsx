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
  Ban,
  Camera,
  Video,
  PlayCircle,
  Mic,
  Square,
  UserPlus,
  User,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
      { id: "r1", name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", use: "肌肉注射", dose: "2ml / 次", days: "3 天" },
      { id: "r2", name: "头孢噻呋钠", spec: "1g / 支", use: "肌肉注射", dose: "1g / 次", days: "3 天" },
    ],
  },
  {
    name: "急性乳房炎",
    symptoms: ["高烧", "乳房红肿", "产奶骤降", "食欲下降"],
    rx: [
      { id: "r1", name: "头孢噻呋钠", spec: "1g / 支", use: "乳房灌注", dose: "1g / 次", days: "3 天" },
      { id: "r2", name: "氟尼辛葡甲胺", spec: "100ml / 瓶", use: "肌肉注射", dose: "2ml / 次", days: "2 天" },
    ],
  },
  {
    name: "瘤胃酸中毒",
    symptoms: ["食欲下降", "反刍减少", "腹泻", "脱水"],
    rx: [
      { id: "r1", name: "碳酸氢钠", spec: "500g", use: "口服", dose: "200g / 次", days: "2 天" },
      { id: "r2", name: "复合维生素 B", spec: "100ml", use: "肌肉注射", dose: "10ml / 次", days: "3 天" },
    ],
  },
  {
    name: "酮病",
    symptoms: ["食欲下降", "产奶骤降", "精神萎靡"],
    rx: [
      { id: "r1", name: "50% 葡萄糖", spec: "500ml", use: "静脉注射", dose: "500ml / 次", days: "2 天" },
    ],
  },
  {
    name: "犊牛腹泻症",
    symptoms: ["腹泻", "脱水", "精神萎靡"],
    rx: [
      { id: "r1", name: "口服补液盐", spec: "100g / 包", use: "口服", dose: "1 包 / 次", days: "3 天" },
    ],
  },
];

type Prescription = {
  id: string;
  name: string;
  spec: string;
  use: string;
  dose: string;
  days: string;
};

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


  // 处方（默认按选中疾病载入，可编辑）
  const [rxList, setRxList] = useState<Prescription[]>([]);
  const [editingRx, setEditingRx] = useState<Prescription | null>(null);

  // 终止工单
  const [confirmTerminate, setConfirmTerminate] = useState(false);
  const [termNeedTransfer, setTermNeedTransfer] = useState<boolean | null>(null);
  const [termTransferBarn, setTermTransferBarn] = useState("");
  const [termTransferQ, setTermTransferQ] = useState("");
  const lastTransferBarn = typeof window !== "undefined"
    ? window.localStorage.getItem("lastTransferBarn") || ""
    : "";
  const allBarns = useMemo(() => Array.from({ length: 8 }, (_, i) => `${i + 1} 号牛舍`), []);
  const termBarnMatches = useMemo(() => {
    const kw = termTransferQ.trim();
    const pool = allBarns;
    const list = kw ? pool.filter((b) => b.includes(kw)) : pool;
    if (lastTransferBarn && !kw) {
      return [lastTransferBarn, ...list.filter((b) => b !== lastTransferBarn)].slice(0, 6);
    }
    return list.slice(0, 6);
  }, [allBarns, termTransferQ, lastTransferBarn]);

  // 现场记录
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [audios, setAudios] = useState<{ id: string; duration: number }[]>([]);
  const [note, setNote] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);

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
    setRxList(d.rx.map((r) => ({ ...r })));
    setDiseaseFocused(false);
  };


  const removeRx = (rxId: string) =>
    setRxList((prev) => prev.filter((r) => r.id !== rxId));

  const saveRxEdit = () => {
    if (!editingRx) return;
    setRxList((prev) => prev.map((r) => (r.id === editingRx.id ? editingRx : r)));
    setEditingRx(null);
  };

  const submit = () => {
    if (symptoms.length === 0) {
      toast.error("请至少填写一个症状");
      return;
    }
    if (!disease) {
      toast.error("请选择疾病");
      return;
    }
    if (rxList.length === 0) {
      toast.error("处方不能为空");
      return;
    }
    toast.success("诊断已提交");
    navigate({ to: "/m/health/$id", params: { id }, search: { tab: "review" } });
  };

  return (
    <MobileShell title="诊断记录" back={{ to: `/m/health/${id}` }} hideTabBar>
      <div className="pb-28">
        {/* 工单号 */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-2">
          <div className="text-caption text-text-tertiary">
            工单 <span className="font-mono text-text-secondary">{id}</span>
          </div>
          <button
            onClick={() => setConfirmTerminate(true)}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-surface-subtle border border-border text-caption text-text-secondary hover:text-[var(--state-danger)] hover:border-[var(--state-danger)]/40"
          >
            <Ban className="h-3 w-3" /> 牛只一切正常 · 终止工单
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
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-full bg-brand-subtle text-primary text-body-sm"
                >
                  <Activity className="h-3 w-3" />
                  {s}
                  <button
                    onClick={() => removeSymptom(s)}
                    className="h-4 w-4 inline-flex items-center justify-center rounded-full hover:bg-primary/10"
                    aria-label={`移除 ${s}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {symptoms.length === 0 && (
                <span className="text-caption text-text-tertiary">尚未填写症状</span>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                <input
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSymptom(symptomInput.trim());
                    }
                  }}
                  placeholder="输入并回车添加，或从下方选择"
                  className="h-10 w-full pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                />
              </div>
              {symptomSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {symptomSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => addSymptom(s)}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-surface-subtle border border-border text-body-sm text-text-secondary hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-3 w-3" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
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
                  className="h-10 w-full pl-9 pr-9 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
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
                {rxList.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-border bg-surface-subtle p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-body text-foreground inline-flex items-center gap-1.5">
                          <Pill className="h-3.5 w-3.5 text-primary" />
                          {r.name}
                        </div>
                        <div className="text-caption text-text-tertiary mt-1">
                          {r.spec} · {r.use} · {r.dose} · {r.days}
                        </div>
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
                ))}
              </ul>
            )}
            <button
              onClick={() => {
                const nextId = `r${Date.now()}`;
                setEditingRx({
                  id: nextId,
                  name: "",
                  spec: "",
                  use: "肌肉注射",
                  dose: "",
                  days: "3 天",
                });
                setRxList((prev) => [
                  ...prev,
                  { id: nextId, name: "", spec: "", use: "肌肉注射", dose: "", days: "3 天" },
                ]);
              }}
              className="mt-2 w-full h-9 rounded-lg border border-dashed border-border text-body-sm text-text-secondary inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> 新增药品
          </button>
        </Section>

        {/* === 现场记录 === */}
          <Section
            title="现场记录"
            extra={<span className="text-caption text-text-tertiary">可选</span>}
          >
            {/* 照片 / 视频 */}
            <div>
              <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
                <Camera className="h-3 w-3" /> 照片 / 视频 · {photos.length + videos.length} 条
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

            {/* 文字描述 */}
            <div className="mt-3">
              <div className="text-caption text-text-tertiary mb-2">文字描述</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="补充体征、用药反应、隔离建议等"
                className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary resize-none"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setEditingRx(null)}>
          <div
            className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-section-title text-foreground">编辑药品</div>
            <Input label="药品名称" value={editingRx.name} onChange={(v) => setEditingRx({ ...editingRx, name: v })} />
            <Input label="规格" value={editingRx.spec} onChange={(v) => setEditingRx({ ...editingRx, spec: v })} />
            <Input label="给药方式" value={editingRx.use} onChange={(v) => setEditingRx({ ...editingRx, use: v })} />
            <Input label="单次剂量" value={editingRx.dose} onChange={(v) => setEditingRx({ ...editingRx, dose: v })} />
            <Input label="疗程" value={editingRx.days} onChange={(v) => setEditingRx({ ...editingRx, days: v })} />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingRx(null)}
                className="flex-1 h-10 rounded-lg border border-border text-body-sm text-text-secondary"
              >
                取消
              </button>
              <button
                onClick={saveRxEdit}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
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

      {/* 终止工单确认 */}
      <AlertDialog open={confirmTerminate} onOpenChange={(o) => {
        setConfirmTerminate(o);
        if (!o) { setTermNeedTransfer(null); setTermTransferBarn(""); setTermTransferQ(""); }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认终止工单？</AlertDialogTitle>
            <AlertDialogDescription>
              确认牛只一切正常、无需用药后，将直接终止该工单，不再进入执行环节。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-1">
            <div className="text-body-sm text-text-secondary">是否转栏</div>
            <div className="flex gap-2">
              {[
                { v: false, label: "不转栏" },
                { v: true, label: "需转栏" },
              ].map((o) => {
                const active = termNeedTransfer === o.v;
                return (
                  <button
                    key={o.label}
                    onClick={() => {
                      setTermNeedTransfer(o.v);
                      if (!o.v) { setTermTransferBarn(""); setTermTransferQ(""); }
                    }}
                    className={`flex-1 h-9 rounded-lg border text-body-sm ${
                      active
                        ? "border-primary bg-brand-subtle text-primary"
                        : "border-border bg-surface-subtle text-text-secondary"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>

            {termNeedTransfer === true && (
              <div className="space-y-2">
                {termTransferBarn ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-brand-subtle text-primary text-body-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      转入 {termTransferBarn}
                    </span>
                    <button
                      onClick={() => { setTermTransferBarn(""); setTermTransferQ(""); }}
                      className="text-body-sm text-text-tertiary underline"
                    >
                      更换
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                      <input
                        value={termTransferQ}
                        onChange={(e) => setTermTransferQ(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && termTransferQ.trim()) {
                            e.preventDefault();
                            const v = termTransferQ.trim();
                            setTermTransferBarn(v);
                            if (typeof window !== "undefined") window.localStorage.setItem("lastTransferBarn", v);
                          }
                        }}
                        placeholder="搜索或输入栏编号"
                        className="h-10 w-full pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {termBarnMatches.map((b) => (
                        <button
                          key={b}
                          onClick={() => {
                            setTermTransferBarn(b);
                            if (typeof window !== "undefined") window.localStorage.setItem("lastTransferBarn", b);
                          }}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-surface-subtle border border-border text-body-sm text-text-secondary hover:border-primary hover:text-primary"
                        >
                          {b}
                          {b === lastTransferBarn && (
                            <span className="text-[10px] text-text-tertiary">上次</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={termNeedTransfer === null || (termNeedTransfer === true && !termTransferBarn)}
              onClick={() => {
                if (termNeedTransfer === null) return;
                if (termNeedTransfer && !termTransferBarn) return;
                toast.success(
                  termNeedTransfer
                    ? `工单已终止，已转入 ${termTransferBarn}`
                    : "工单已终止"
                );
                navigate({ to: "/m/health/$id", params: { id }, search: { tab: "review" } });
              }}
              className="bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white disabled:opacity-50"
            >
              确认终止
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 添加媒体选择弹层 */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowMediaPicker(false)}>
          <div
            className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-section-title text-foreground">添加现场记录</div>
            <div className="grid grid-cols-2 gap-3">
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
                className="h-10 w-full pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => { setExecutor(""); setShowExecutorPicker(false); setExecutorQuery(""); }}
                className={`w-full h-10 rounded-lg border text-body-sm inline-flex items-center justify-center gap-1.5 ${executor === "" ? "border-primary bg-brand-subtle text-primary" : "border-border bg-surface-subtle text-text-secondary"}`}
              >
                不指派，进入待响应池
              </button>
              {executorMatches.map((name) => (
                <button
                  key={name}
                  onClick={() => { setExecutor(name); setShowExecutorPicker(false); setExecutorQuery(""); }}
                  className={`w-full h-10 rounded-lg border text-body-sm inline-flex items-center justify-center gap-1.5 ${executor === name ? "border-primary bg-brand-subtle text-primary" : "border-border bg-surface-subtle text-text-secondary"}`}
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
        className="h-10 w-full px-3 rounded-lg bg-surface-subtle border border-border text-body-sm focus:outline-none focus:border-primary"
      />
    </label>
  );
}
