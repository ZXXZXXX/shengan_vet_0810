import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, ScanLine, ChevronDown, X, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/health/report")({
  head: () => ({ meta: [{ title: "异常上报 · 奇点智牧" }] }),
  component: ReportPage,
});

const eventTypes = ["体温异常", "采食下降", "乳房炎", "跛行", "外伤", "其他"];
const levels = ["低", "中", "高"];

function ReportPage() {
  const navigate = useNavigate();
  const [target, setTarget] = useState("");
  const [type, setType] = useState<string>("体温异常");
  const [level, setLevel] = useState<string>("中");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState<number[]>([1, 2]);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = target.trim() && desc.trim();

  const submit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(() => navigate({ to: "/m/health" }), 900);
  };

  return (
    <MobileShell title="健康异常上报" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-3">
        {/* AI 提示 */}
        <div className="rounded-xl p-3 border border-[var(--effect-ai-purple)]/20 bg-gradient-to-br from-[var(--effect-ai-purple)]/8 to-[var(--effect-ai-cyan)]/8 flex items-start gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[var(--effect-ai-purple)] mt-0.5" />
          <p className="text-caption text-text-secondary leading-relaxed">
            上传清晰的现场照片，AI 将自动识别可能的异常类型并预填表单。
          </p>
        </div>

        {/* 处理对象 */}
        <Section title="处理对象" required>
          <div className="flex gap-2">
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="输入或扫描耳标编号"
              className="flex-1 h-12 px-3 rounded-lg bg-card border border-border text-body placeholder:text-text-tertiary"
            />
            <button className="h-12 px-3 rounded-lg bg-brand-subtle text-primary inline-flex items-center gap-1 text-body-sm">
              <ScanLine className="h-4 w-4" /> 扫码
            </button>
          </div>
        </Section>

        {/* 事件类型 */}
        <Section title="事件类型" required>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`h-8 px-3 rounded-full text-body-sm transition-colors ${
                  type === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-text-secondary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        {/* 优先级 */}
        <Section title="紧急程度">
          <div className="grid grid-cols-3 gap-2">
            {levels.map((l) => {
              const active = level === l;
              const tone =
                l === "高"
                  ? "text-[var(--state-danger)] border-[var(--state-danger)]/40 bg-[var(--state-danger)]/8"
                  : l === "中"
                  ? "text-[var(--state-warning)] border-[var(--state-warning)]/40 bg-[var(--state-warning)]/8"
                  : "text-text-secondary border-border bg-card";
              return (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`h-10 rounded-lg border text-body-sm transition-colors ${
                    active ? tone : "bg-card border-border text-text-secondary"
                  }`}
                >
                  {l === "高" ? "紧急" : l === "中" ? "一般" : "观察"}
                </button>
              );
            })}
          </div>
        </Section>

        {/* 现场照片 */}
        <Section title="现场照片">
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

        {/* 描述 */}
        <Section title="详细描述" required>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="描述发现的异常情况、体温/采食量等关键数据"
            rows={4}
            className="w-full p-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary resize-none"
          />
          <div className="text-right text-caption text-text-tertiary mt-1">
            {desc.length} / 200
          </div>
        </Section>

        {/* 抄送 */}
        <Section title="抄送">
          <button className="w-full h-12 px-3 rounded-lg bg-card border border-border text-body-sm text-text-secondary inline-flex items-center justify-between">
            <span>选择牧场管理者</span>
            <ChevronDown className="h-4 w-4 text-text-tertiary" />
          </button>
        </Section>
      </div>

      {/* 底部提交 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          disabled={!canSubmit || submitted}
          onClick={submit}
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body disabled:opacity-50 transition-opacity"
        >
          {submitted ? "已提交，工单已生成" : "提交上报"}
        </button>
      </div>
    </MobileShell>
  );
}

function Section({
  title,
  required,
  children,
}: {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-body-sm text-text-secondary mb-2">
        {title}
        {required && <span className="text-[var(--state-danger)] ml-0.5">*</span>}
      </div>
      {children}
    </div>
  );
}
