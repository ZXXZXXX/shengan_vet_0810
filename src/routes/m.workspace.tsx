import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stethoscope, UtensilsCrossed, Truck, Activity, ChevronRight, Lock, Building2 } from "lucide-react";
import grasslandHero from "@/assets/grassland-hero.png";

const ACCOUNT = {
  name: "李雨晴",
  role: "兽医",
  group: "奇点智牧集团",
};


export const Route = createFileRoute("/m/workspace")({
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
    name: "智慧兽医系统",
    desc: "疾病诊疗、处方执行、药品库存全流程",
    icon: Stethoscope,
    to: "/m",
    enabled: true,
    tone: "var(--brand)",
  },
  {
    id: "feed",
    name: "自动喂食系统",
    desc: "饲喂配方、投喂任务与设备状态",
    icon: UtensilsCrossed,
    enabled: false,
    tone: "var(--effect-ai-cyan)",
  },
  {
    id: "transport",
    name: "运牛管理系统",
    desc: "调运计划、车辆与司机调度",
    icon: Truck,
    enabled: false,
    tone: "var(--effect-ai-purple)",
  },
  {
    id: "monitor",
    name: "智能监测系统",
    desc: "采食、反刍、运动等行为监测",
    icon: Activity,
    enabled: false,
    tone: "var(--state-warning)",
  },
];

function MWorkspacePage() {
  const navigate = useNavigate();

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
        {/* 顶部 banner */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={grasslandHero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-[var(--bg-page)]" />
          <div className="relative px-5 pt-10">
            <div className="flex items-center gap-2 text-caption text-white/90">
              <span>奇点智牧 · 工作台</span>
              <span className="text-white/50">·</span>
              <Building2 className="h-3 w-3" />
              <span className="truncate">{ACCOUNT.group}</span>
            </div>
            <h1 className="text-page-title text-white mt-1 tracking-tight">
              你好，{ACCOUNT.name}
            </h1>
            <p className="text-body-sm text-white/85 mt-1">
              当前身份 {ACCOUNT.role} · 请选择业务模块继续办公
            </p>
          </div>
        </div>

        {/* 模块卡片 */}
        <div className="flex-1 px-4 pt-2 pb-8 space-y-3">



          {MODULES.map((m) => {
            const Icon = m.icon;
            const disabled = !m.enabled;
            return (
              <button
                key={m.id}
                onClick={() => pick(m)}
                disabled={disabled}
                className={`w-full text-left rounded-2xl bg-card border border-border p-4 flex items-center gap-3 transition-all ${
                  disabled
                    ? "opacity-60"
                    : "active:scale-[0.99] hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `color-mix(in oklab, ${m.tone} 14%, transparent)`,
                    color: m.tone,
                  }}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
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

          <div className="pt-2 text-caption text-text-tertiary text-center">
            如需开通其他系统，请联系您的牧场管理员
          </div>
        </div>
      </div>
    </div>
  );
}
