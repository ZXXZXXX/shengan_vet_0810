import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, ScanLine, X, Stethoscope, PackageMinus, Lock } from "lucide-react";
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

const healthTypes = ["体温异常", "采食下降", "乳房炎", "跛行", "外伤", "其他"];
const lossTypes = ["疾病死亡", "意外死亡", "淘汰处置", "丢失", "其他"];
const levels = ["低", "中", "高"];

function ReportPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const locked = !!search.lock && (!!search.target || !!search.barn);
  const lockTarget = !!search.lock && !!search.target;
  const lockBarn = !!search.lock && !!search.barn;
  const [kind, setKind] = useState<ReportKind>("health");
  const [target, setTarget] = useState(search.target ?? "");
  const [barn] = useState(search.barn ?? "");
  const [type, setType] = useState<string>("体温异常");
  const [level, setLevel] = useState<string>("中");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState<number[]>([1, 2]);
  const [submitted, setSubmitted] = useState(false);

  const types = kind === "health" ? healthTypes : lossTypes;

  // 切换类别时重置 type
  const switchKind = (k: ReportKind) => {
    setKind(k);
    setType(k === "health" ? healthTypes[0] : lossTypes[0]);
  };

  const canSubmit = target.trim() && desc.trim();

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
                onClick={() => switchKind(t.k)}
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


        {/* 处理对象 */}
        <Section title={kind === "health" ? "处理对象" : "损耗对象"} required>
          {locked ? (
            <div className="space-y-2">
              <div className="flex items-center h-12 px-3 rounded-lg bg-surface-subtle border border-border text-body text-foreground">
                <span className="font-mono">#{target}</span>
                <span className="ml-auto inline-flex items-center gap-1 text-caption text-text-tertiary">
                  <Lock className="h-3 w-3" /> 已锁定
                </span>
              </div>
              {barn && (
                <div className="flex items-center h-12 px-3 rounded-lg bg-surface-subtle border border-border text-body text-foreground">
                  <span className="text-body-sm text-text-tertiary mr-2">牛舍</span>
                  <span>{barn}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-caption text-text-tertiary">
                    <Lock className="h-3 w-3" /> 已锁定
                  </span>
                </div>
              )}
              <div className="text-caption text-text-tertiary">
                通过牛只档案进入,基础信息已自动填写,不可编辑
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="输入或扫描耳标 / 物资编号"
                className="flex-1 h-12 px-3 rounded-lg bg-card border border-border text-body placeholder:text-text-tertiary"
              />
              <button className="h-12 px-3 rounded-lg bg-brand-subtle text-primary inline-flex items-center gap-1 text-body-sm">
                <ScanLine className="h-4 w-4" /> 扫码
              </button>
            </div>
          )}
        </Section>

        {/* 事件类型 */}
        <Section title={kind === "health" ? "事件类型" : "损耗类型"} required>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
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

        {/* 优先级（仅健康） */}
        {kind === "health" && (
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
        )}

        {/* 损耗数量 */}
        {kind === "loss" && (
          <Section title="损耗数量" required>
            <input
              defaultValue="1"
              type="number"
              min={1}
              className="w-full h-12 px-3 rounded-lg bg-card border border-border text-body"
            />
          </Section>
        )}

        {/* 现场照片 */}
        <Section title="现场照片 / 视频">
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
            placeholder={
              kind === "health"
                ? "描述发现的异常情况、体温/采食量等关键数据"
                : "描述损耗发生时间、地点、原因等"
            }
            rows={4}
            className="w-full p-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary resize-none"
          />
          <div className="text-right text-caption text-text-tertiary mt-1">
            {desc.length} / 200
          </div>
        </Section>
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
