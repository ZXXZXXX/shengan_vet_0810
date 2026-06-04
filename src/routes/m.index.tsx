import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Baby, Stethoscope, UtensilsCrossed, Activity, ChevronRight, Lock, BadgeCheck } from "lucide-react";

const ACCOUNT = {
  name: "李雨晴",
  workId: "W-1024",
  role: "兽医",
  group: "奇点智牧集团",
  farms: ["1号牧场", "3号牧场"],
};

export const Route = createFileRoute("/m/")({
  head: () => ({ meta: [{ title: "工作台 · 奇点智牧" }] }),
  component: MWorkspacePage,
});

type Module = {
  id: string;
  name: string;
  desc: string;
  icon: typeof Stethoscope;
  to?: string;
  enabled: boolean;
  tone: string;
};

const MODULES: Module[] = [
  { id: "vet", name: "智慧兽医", desc: "诊疗 · 处方 · 药品", icon: Stethoscope, to: "/m/homepage", enabled: true, tone: "var(--brand)" },
  { id: "birth", name: "智能接生", desc: "产前预警 · 接产记录", icon: Baby, enabled: false, tone: "var(--effect-ai-purple)" },
  { id: "feed", name: "饲喂管理", desc: "配方下发 · 投喂任务", icon: UtensilsCrossed, enabled: false, tone: "var(--effect-ai-cyan)" },
  { id: "env", name: "环境监测", desc: "温湿度 · 氨气监测", icon: Activity, enabled: false, tone: "var(--state-warning)" },
];

function MWorkspacePage() {
  const navigate = useNavigate();
  const enabledCount = MODULES.filter((m) => m.enabled).length;

  const pick = (m: Module) => {
    if (!m.enabled || !m.to) return;
    try { localStorage.setItem("mp:active_module", m.id); } catch {}
    navigate({ to: m.to });
  };

  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col">
        {/* 顶部：集团条 */}
        <div
          className="px-5 pt-11 pb-4 text-white"
          style={{ background: "linear-gradient(135deg, #00A85A 0%, #1FBE6F 100%)" }}
        >
          <div className="text-caption text-white/85">{ACCOUNT.group}</div>
          <div className="mt-1 text-page-title font-semibold tracking-tight">工作台</div>
        </div>

        <div className="flex-1 px-4 pt-4 pb-8 space-y-4">
          {/* 名片 */}
          <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[color-mix(in_oklab,var(--brand)_12%,transparent)] text-[color:var(--brand)] flex items-center justify-center text-card-title font-semibold shrink-0">
                {ACCOUNT.name.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-card-title text-foreground font-medium truncate">{ACCOUNT.name}</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-[color-mix(in_oklab,var(--brand)_10%,transparent)] text-[color:var(--brand)]">
                    <BadgeCheck className="h-2.5 w-2.5" />{ACCOUNT.role}
                  </span>
                </div>
                <div className="text-caption text-text-tertiary mt-1 truncate">工号 {ACCOUNT.workId}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-start gap-2">
              <span className="text-caption text-text-tertiary shrink-0">所属牧场</span>
              <div className="flex flex-wrap gap-1.5">
                {ACCOUNT.farms.map((f) => (
                  <span key={f} className="inline-flex items-center px-2 py-0.5 rounded bg-surface-subtle text-caption text-foreground">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 业务入口 */}
          <div>
            <div className="px-1 pb-2 flex items-center justify-between">
              <span className="text-section-title text-foreground font-medium">业务入口</span>
              <span className="text-caption text-text-tertiary">已开通 {enabledCount} / {MODULES.length}</span>
            </div>

            <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-card">
              {MODULES.map((m, i) => {
                const Icon = m.icon;
                const disabled = !m.enabled;
                return (
                  <button
                    key={m.id}
                    onClick={() => pick(m)}
                    disabled={disabled}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors ${
                      i > 0 ? "border-t border-border" : ""
                    } ${disabled ? "opacity-55" : "active:bg-[var(--bg-surface-subtle)]"}`}
                  >
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: disabled ? "var(--bg-surface-subtle)" : `color-mix(in oklab, ${m.tone} 14%, transparent)`,
                        color: disabled ? "var(--text-tertiary)" : m.tone,
                      }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.85} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-body text-foreground font-medium truncate">{m.name}</span>
                        {disabled && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-surface-subtle text-text-tertiary">
                            <Lock className="h-2.5 w-2.5" />未开通
                          </span>
                        )}
                      </div>
                      <div className="text-caption text-text-tertiary mt-0.5 truncate">{m.desc}</div>
                    </div>
                    {!disabled && <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 text-caption text-text-tertiary text-center">
              如需开通其他系统，请联系您的牧场管理员
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
