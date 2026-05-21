import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Camera,
  ScanLine,
  X,
  Stethoscope,
  PackageMinus,
  Lock,
  Mic,
  Video,
  Search,
  Minus,
  Plus,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

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

type ReportKind = "health" | "loss";

// 物资库（用于损耗上报快速匹配）
const itemLibrary = [
  "口蹄疫疫苗 A 型",
  "口蹄疫疫苗 O 型",
  "牛瘟疫苗",
  "乳房炎抗生素",
  "头孢噻呋钠注射液",
  "营养补充剂（围产期）",
  "戊二醛消毒液",
  "高锰酸钾",
  "蹄部消毒喷雾",
  "一次性手套",
  "采精管",
];

// 健康常见症状标签
const symptomTags = [
  "体温升高",
  "采食下降",
  "反刍减少",
  "精神沉郁",
  "乳房红肿",
  "跛行",
  "腹泻",
  "鼻液增多",
  "外伤出血",
  "卧地不起",
];

function ReportPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const lockTarget = !!search.lock && !!search.target;
  const lockBarn = !!search.lock && !!search.barn;
  const [kind, setKind] = useState<ReportKind>("health");
  const [target, setTarget] = useState(search.target ?? "");
  const [barn] = useState(search.barn ?? "");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState<number[]>([1, 2]);
  const [videos, setVideos] = useState<number[]>([]);
  const [voiceSecs, setVoiceSecs] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 健康
  const [symptoms, setSymptoms] = useState<string[]>([]);

  // 损耗
  const [itemName, setItemName] = useState("");
  const [itemFocused, setItemFocused] = useState(false);
  const [lossQty, setLossQty] = useState("1");
  const [needReapply, setNeedReapply] = useState<"yes" | "no">("no");
  const [applyName, setApplyName] = useState("");
  const [applyQty, setApplyQty] = useState(1);

  const itemMatches = useMemo(() => {
    const kw = itemName.trim().toLowerCase();
    if (!kw) return itemLibrary.slice(0, 6);
    return itemLibrary.filter((i) => i.toLowerCase().includes(kw)).slice(0, 8);
  }, [itemName]);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const pickItem = (name: string) => {
    setItemName(name);
    setItemFocused(false);
    if (needReapply === "yes" && !applyName) setApplyName(name);
  };

  const startVoice = () => {
    if (recording) {
      setRecording(false);
      setVoiceSecs(12); // mock duration
      return;
    }
    setRecording(true);
  };

  const canSubmit =
    kind === "health"
      ? target.trim().length > 0 &&
        (symptoms.length > 0 || desc.trim().length > 0 || photos.length > 0 || videos.length > 0 || voiceSecs !== null)
      : itemName.trim().length > 0 && Number(lossQty) > 0;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => navigate({ to: "/m/health" }), 900);
  };

  return (
    <MobileShell title="现场上报" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-3">
        {/* 类别 Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-subtle border border-border">
          {(
            [
              { k: "health" as ReportKind, label: "牛只健康", icon: Stethoscope },
              { k: "loss" as ReportKind, label: "损耗问题", icon: PackageMinus },
            ]
          ).map((t) => {
            const Icon = t.icon;
            const active = kind === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setKind(t.k)}
                className={`h-10 rounded-lg text-body-sm inline-flex items-center justify-center gap-1.5 transition-colors ${
                  active
                    ? "bg-card text-primary shadow-sm border border-primary/20"
                    : "text-text-secondary"
                }`}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {kind === "health" ? (
          <>
            {/* 处理对象 */}
            <Section title="处理对象" required>
              {lockTarget ? (
                <div className="space-y-2">
                  <div className="flex items-center h-12 px-3 rounded-lg bg-surface-subtle border border-border text-body text-foreground">
                    <span className="font-mono">#{target}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-caption text-text-tertiary">
                      <Lock className="h-3 w-3" /> 已锁定
                    </span>
                  </div>
                  {lockBarn && (
                    <div className="flex items-center h-12 px-3 rounded-lg bg-surface-subtle border border-border text-body text-foreground">
                      <span className="text-body-sm text-text-tertiary mr-2">牛舍</span>
                      <span>{barn}</span>
                      <span className="ml-auto inline-flex items-center gap-1 text-caption text-text-tertiary">
                        <Lock className="h-3 w-3" /> 已锁定
                      </span>
                    </div>
                  )}
                  <div className="text-caption text-text-tertiary">
                    由扫码进入,信息已自动填写,不可编辑
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="牛只编号 / 牛舍标号 / 批量对象"
                      className="flex-1 h-12 px-3 rounded-lg bg-card border border-border text-body placeholder:text-text-tertiary"
                    />
                    <button className="h-12 px-3 rounded-lg bg-brand-subtle text-primary inline-flex items-center gap-1 text-body-sm">
                      <ScanLine className="h-4 w-4" /> 扫码
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["3 号牛舍", "犊牛舍 A", "批量·待挤奶群"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setTarget(q)}
                        className="h-7 px-2.5 rounded-full bg-card border border-border text-caption text-text-secondary"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* 症状说明 */}
            <Section title="症状说明" hint="可多选；也可不选，直接用证据材料描述">
              <div className="flex flex-wrap gap-2">
                {symptomTags.map((t) => {
                  const active = symptoms.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleSymptom(t)}
                      className={`h-8 px-3 rounded-full text-body-sm transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border text-text-secondary"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 证据材料 */}
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
          </>
        ) : (
          <>
            {/* 物品名称 */}
            <Section title="物品名称" required>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  value={itemName}
                  onChange={(e) => {
                    setItemName(e.target.value);
                    setItemFocused(true);
                  }}
                  onFocus={() => setItemFocused(true)}
                  onBlur={() => setTimeout(() => setItemFocused(false), 150)}
                  placeholder="输入物品名称快速匹配"
                  className="w-full h-12 pl-9 pr-3 rounded-lg bg-card border border-border text-body placeholder:text-text-tertiary"
                />
                {itemFocused && itemMatches.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-auto">
                    {itemMatches.map((m) => (
                      <button
                        key={m}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickItem(m)}
                        className="w-full text-left px-3 h-10 text-body-sm text-foreground hover:bg-surface-subtle border-b border-border last:border-b-0"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* 损耗量 */}
            <Section title="损耗量" required>
              <input
                value={lossQty}
                onChange={(e) => setLossQty(e.target.value.replace(/[^\d.]/g, ""))}
                inputMode="decimal"
                placeholder="例如：8"
                className="w-full h-12 px-3 rounded-lg bg-card border border-border text-body"
              />
            </Section>

            {/* 证据材料（照片 / 文字 / 语音） */}
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
              hideVideo
              descLabel="文字备注"
            />

            {/* 是否需要重新申请 */}
            <Section title="是否需要重新申请该部分物资" required>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { v: "no", label: "暂不申请" },
                  { v: "yes", label: "申请" },
                ] as const).map((o) => {
                  const active = needReapply === o.v;
                  return (
                    <button
                      key={o.v}
                      onClick={() => {
                        setNeedReapply(o.v);
                        if (o.v === "yes") {
                          if (!applyName) setApplyName(itemName);
                          setApplyQty(Math.max(1, Math.ceil(Number(lossQty) || 1)));
                        }
                      }}
                      className={`h-10 rounded-lg border text-body-sm transition-colors ${
                        active
                          ? "bg-brand-subtle border-primary/30 text-primary"
                          : "bg-card border-border text-text-secondary"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>

              {needReapply === "yes" && (
                <div className="mt-3 p-3 rounded-lg border border-border bg-surface-subtle space-y-2">
                  <div className="text-caption text-text-tertiary">
                    已根据损耗内容自动填写，可调整数量
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-text-secondary w-14 shrink-0">物资</span>
                    <input
                      value={applyName}
                      onChange={(e) => setApplyName(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-lg bg-card border border-border text-body"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-text-secondary w-14 shrink-0">数量</span>
                    <div className="flex items-center h-10 rounded-lg border border-border bg-card overflow-hidden">
                      <button
                        onClick={() => setApplyQty((q) => Math.max(1, q - 1))}
                        className="h-full w-10 inline-flex items-center justify-center text-text-secondary"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        value={applyQty}
                        onChange={(e) =>
                          setApplyQty(Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))
                        }
                        inputMode="numeric"
                        className="w-14 h-full text-center bg-transparent text-body"
                      />
                      <button
                        onClick={() => setApplyQty((q) => q + 1)}
                        className="h-full w-10 inline-flex items-center justify-center text-text-secondary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Section>
          </>
        )}
      </div>

      {/* 底部提交 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          disabled={!canSubmit || submitted}
          onClick={submit}
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body disabled:opacity-50 transition-opacity"
        >
          {submitted ? "已提交,任务已生成" : "提交上报"}
        </button>
      </div>
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
  descLabel = "文字描述",
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
  return (
    <>
      <Section title="照片记录">
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div
              key={p}
              className="relative aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border"
            >
              <button
                onClick={() => setPhotos((prev) => prev.filter((x) => x !== p))}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/80 text-background inline-flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <button
              onClick={() => setPhotos((p) => [...p, Date.now()])}
              className="aspect-square rounded-lg border border-dashed border-border bg-card flex flex-col items-center justify-center gap-1 text-text-tertiary"
            >
              <Camera className="h-5 w-5" />
              <span className="text-caption">拍照</span>
            </button>
          )}
        </div>
      </Section>

      {!hideVideo && (
        <Section title="视频记录">
          <div className="grid grid-cols-3 gap-2">
            {videos.map((p) => (
              <div
                key={p}
                className="relative aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border flex items-center justify-center"
              >
                <Video className="h-5 w-5 text-text-tertiary" />
                <button
                  onClick={() => setVideos((prev) => prev.filter((x) => x !== p))}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/80 text-background inline-flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {videos.length < 3 && (
              <button
                onClick={() => setVideos((p) => [...p, Date.now()])}
                className="aspect-square rounded-lg border border-dashed border-border bg-card flex flex-col items-center justify-center gap-1 text-text-tertiary"
              >
                <Video className="h-5 w-5" />
                <span className="text-caption">录像</span>
              </button>
            )}
          </div>
        </Section>
      )}

      <Section title="语音录入">
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

      <Section title={descLabel}>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="补充关键信息（可选）"
          rows={3}
          className="w-full p-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary resize-none"
        />
        <div className="text-right text-caption text-text-tertiary mt-1">{desc.length} / 200</div>
      </Section>
    </>
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
