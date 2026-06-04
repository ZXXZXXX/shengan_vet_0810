import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stethoscope, UtensilsCrossed, Truck, Activity, ChevronRight, Lock, Building2 } from "lucide-react";

const ACCOUNT = {
  name: "李雨晴",
  group: "奇点智牧集团",
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
        {/* 顶部品牌区 */}
        <div
          className="relative px-5 pt-12 pb-10 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #00A85A 0%, #1FBE6F 55%, #47DFC7 100%)",
          }}
        >
          {/* 装饰光斑 */}
          <span
            aria-hidden
            className="absolute -top-16 -right-12 h-48 w-48 rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
          />
          <span
            aria-hidden
            className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
          />

          <div className="relative">
            <div className="text-caption text-white/85 tracking-wide">
              SINGULARITY · 智慧牧场
            </div>
            <h1 className="text-page-title text-white mt-1 font-semibold tracking-tight">
              工作台
            </h1>

            {/* 账号信息卡 */}
            <div className="mt-5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white text-[color:var(--brand)] flex items-center justify-center font-semibold shrink-0">
                {ACCOUNT.name.slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-body text-white font-medium truncate">
                  {ACCOUNT.name}
                </div>
                <div className="flex items-center gap-1 text-caption text-white/85 mt-0.5 truncate">
                  <Building2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{ACCOUNT.group}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 模块列表 */}
        <div className="flex-1 px-4 -mt-4 pb-8">
          <div className="rounded-2xl bg-card border border-border p-2 space-y-1 shadow-card">
            <div className="px-3 pt-2 pb-1 flex items-center justify-between">
              <span className="text-card-title text-foreground">业务系统</span>
              <span className="text-caption text-text-tertiary">
                {MODULES.filter((m) => m.enabled).length}/{MODULES.length} 已开通
              </span>
            </div>

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
                      ? "opacity-60"
                      : "active:scale-[0.99] hover:bg-[var(--bg-surface-subtle)]"
                  }`}
                >
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `color-mix(in oklab, ${m.tone} 14%, transparent)`,
                      color: m.tone,
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

          <div className="pt-4 text-caption text-text-tertiary text-center">
            如需开通其他系统，请联系您的牧场管理员
          </div>
        </div>
      </div>
    </div>
  );
}
