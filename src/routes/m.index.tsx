import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Baby, Stethoscope, UtensilsCrossed, Activity, Lock, BadgeCheck, Truck, Droplets } from "lucide-react";

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
  gradient: string;
};

const MODULES: Module[] = [
  { id: "vet", name: "智慧兽医", desc: "诊疗 · 处方 · 药品", icon: Stethoscope, to: "/m/homepage", enabled: true, tone: "#00A85A", gradient: "linear-gradient(135deg,#00A85A 0%,#3FD49C 100%)" },
  { id: "birth", name: "智能接生", desc: "产前预警 · 接产", icon: Baby, enabled: false, tone: "#8B5CF6", gradient: "linear-gradient(135deg,#8B5CF6 0%,#C084FC 100%)" },
  { id: "feed", name: "饲喂管理", desc: "配方 · 投喂任务", icon: UtensilsCrossed, enabled: false, tone: "#06B6D4", gradient: "linear-gradient(135deg,#0891B2 0%,#22D3EE 100%)" },
  { id: "env", name: "环境监测", desc: "温湿度 · 氨气", icon: Activity, enabled: false, tone: "#F59E0B", gradient: "linear-gradient(135deg,#F59E0B 0%,#FBBF24 100%)" },
  { id: "transport", name: "运牛管理", desc: "调运 · 路线追踪", icon: Truck, enabled: false, tone: "#3B82F6", gradient: "linear-gradient(135deg,#2563EB 0%,#60A5FA 100%)" },
  { id: "milk", name: "产奶分析", desc: "产量 · 品质监控", icon: Droplets, enabled: false, tone: "#0EA5E9", gradient: "linear-gradient(135deg,#0284C7 0%,#7DD3FC 100%)" },
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

            <div className="grid grid-cols-2 gap-3">
              {MODULES.map((m) => {
                const Icon = m.icon;
                const disabled = !m.enabled;
                return (
                  <button
                    key={m.id}
                    onClick={() => pick(m)}
                    disabled={disabled}
                    className={`relative aspect-square rounded-2xl overflow-hidden text-left p-3.5 flex flex-col justify-between shadow-card transition-transform ${
                      disabled ? "" : "active:scale-[0.97]"
                    }`}
                    style={{
                      background: disabled ? "var(--bg-surface)" : m.gradient,
                      border: disabled ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {!disabled && (
                      <>
                        <span aria-hidden className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-white/15" />
                        <span aria-hidden className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-white/10" />
                      </>
                    )}
                    <div
                      className="relative h-11 w-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: disabled ? "var(--bg-surface-subtle)" : "rgba(255,255,255,0.22)",
                        color: disabled ? "var(--text-tertiary)" : "#ffffff",
                        backdropFilter: disabled ? undefined : "blur(4px)",
                      }}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.9} />
                    </div>
                    <div className="relative">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-card-title font-medium truncate"
                          style={{ color: disabled ? "var(--text-secondary)" : "#ffffff" }}
                        >
                          {m.name}
                        </span>
                        {disabled && (
                          <Lock className="h-3 w-3 text-text-tertiary shrink-0" />
                        )}
                      </div>
                      <div
                        className="text-caption mt-0.5 truncate"
                        style={{ color: disabled ? "var(--text-tertiary)" : "rgba(255,255,255,0.85)" }}
                      >
                        {disabled ? "未开通" : m.desc}
                      </div>
                    </div>
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
