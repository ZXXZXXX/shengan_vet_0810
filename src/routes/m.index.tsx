import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Baby, Stethoscope, UtensilsCrossed, Activity, ChevronRight, Lock, Building2, BadgeCheck } from "lucide-react";

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
  {
    id: "vet",
    name: "智慧兽医",
    desc: "诊疗、处方、药品全流程",
    icon: Stethoscope,
    to: "/m/homepage",
    enabled: true,
    tone: "var(--brand)",
  },
  {
    id: "birth",
    name: "智能接生",
    desc: "产前预警与接产记录",
    icon: Baby,
    enabled: false,
    tone: "var(--effect-ai-purple)",
  },
  {
    id: "feed",
    name: "饲喂管理",
    desc: "配方下发与投喂任务",
    icon: UtensilsCrossed,
    enabled: false,
    tone: "var(--effect-ai-cyan)",
  },
  {
    id: "env",
    name: "环境监测",
    desc: "牛舍温湿度、氨气监测",
    icon: Activity,
    enabled: false,
    tone: "var(--state-warning)",
  },
];

function MWorkspacePage() {
  const navigate = useNavigate();
  const enabledCount = MODULES.filter((m) => m.enabled).length;

  const pick = (m: Module) => {
    if (!m.enabled || !m.to) return;
    try {
      localStorage.setItem("mp:active_module", m.id);
    } catch {}
    navigate({ to: m.to });
  };

  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col relative">
        {/* 顶部品牌区 */}
        <div
          className="relative px-5 pt-12 pb-16 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #00A85A 0%, #1FBE6F 55%, #47DFC7 100%)",
          }}
        >
          <span
            aria-hidden
            className="absolute -top-16 -right-12 h-48 w-48 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
          />
          <span
            aria-hidden
            className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-1 text-caption text-white/90 tracking-wide">
              <Building2 className="h-3 w-3" />
              <span>{ACCOUNT.group}</span>
            </div>
            <div className="text-caption text-white/80">工号 {ACCOUNT.workId}</div>
          </div>

          <div className="relative mt-3 flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-white text-[color:var(--brand)] flex items-center justify-center text-section-title font-semibold shrink-0 shadow-sm">
              {ACCOUNT.name.slice(-2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-page-title text-white font-semibold tracking-tight truncate">
                  {ACCOUNT.name}
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/20 text-[11px] text-white">
                  <BadgeCheck className="h-2.5 w-2.5" />
                  {ACCOUNT.role}
                </span>
              </div>
              <div className="text-caption text-white/85 mt-1 truncate">
                所属：{ACCOUNT.farms.join("、")}
              </div>
            </div>
          </div>
        </div>

        {/* 模块列表 */}
        <div className="flex-1 px-4 -mt-8 pb-8">
          <div className="rounded-2xl bg-card border border-border p-2 shadow-card">
            <div className="px-3 pt-2 pb-2 flex items-center justify-between">
              <span className="text-card-title text-foreground">业务系统</span>
              <span className="text-caption text-text-tertiary">
                已开通 {enabledCount} / {MODULES.length}
              </span>
            </div>

            <div className="space-y-1">
              {MODULES.map((m) => {
                const Icon = m.icon;
                const disabled = !m.enabled;
                return (
                  <button
                    key={m.id}
                    onClick={() => pick(m)}
                    disabled={disabled}
                    className={`w-full text-left rounded-xl p-3 flex items-center gap-3 transition-all ${
                      disabled
                        ? "opacity-55"
                        : "active:scale-[0.99] hover:bg-[var(--bg-surface-subtle)]"
                    }`}
                  >
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: disabled
                          ? "var(--bg-surface-subtle)"
                          : `color-mix(in oklab, ${m.tone} 14%, transparent)`,
                        color: disabled ? "var(--text-tertiary)" : m.tone,
                      }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.85} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-body text-foreground font-medium truncate">
                          {m.name}
                        </span>
                        {disabled && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-surface-subtle text-text-tertiary">
                            <Lock className="h-2.5 w-2.5" /> 未开通
                          </span>
                        )}
                      </div>
                      <div className="text-caption text-text-tertiary mt-0.5 truncate">
                        {m.desc}
                      </div>
                    </div>
                    {!disabled && (
                      <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 text-caption text-text-tertiary text-center">
            如需开通其他系统，请联系您的牧场管理员
          </div>
        </div>
      </div>
    </div>
  );
}
