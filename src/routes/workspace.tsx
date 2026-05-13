import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ChevronRight, LogOut, ShieldCheck, Activity } from "lucide-react";
import cattleImg from "@/assets/module-cattle.jpg";
import sheepImg from "@/assets/module-sheep.jpg";
import riceImg from "@/assets/module-rice.jpg";
import parkImg from "@/assets/module-park.jpg";
import { ModuleTransition, type TransitionState } from "@/components/module-transition";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "工作台 — 选择业务模块" }] }),
  component: WorkspacePage,
});

type Module = {
  key: string;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  to: string;
  enabled: boolean;
  toneVar: string; // CSS var for the tone color
  stats: { label: string; value: string }[];
};

const modules: Module[] = [
  {
    key: "cattle",
    title: "牛 · 牧场管理",
    subtitle: "Cattle Farm",
    desc: "覆盖生产、健康、仓储、组织与配置全流程",
    image: cattleImg,
    to: "/",
    enabled: true,
    toneVar: "var(--brand)",
    stats: [
      { label: "在管牧场", value: "6" },
      { label: "在栏头数", value: "12,486" },
      { label: "今日工单", value: "38" },
    ],
  },
  {
    key: "sheep",
    title: "羊 · 牧场管理",
    subtitle: "Sheep Farm",
    desc: "肉羊与奶羊全周期管理，模块即将上线",
    image: sheepImg,
    to: "/workspace",
    enabled: false,
    toneVar: "var(--effect-ai-cyan)",
    stats: [
      { label: "在管牧场", value: "—" },
      { label: "在栏只数", value: "—" },
      { label: "状态", value: "筹备中" },
    ],
  },
  {
    key: "rice",
    title: "水稻 · 农场管理",
    subtitle: "Rice Farm",
    desc: "种植、灌溉、植保、仓储一体化（试运行）",
    image: riceImg,
    to: "/workspace",
    enabled: false,
    toneVar: "var(--state-warning)",
    stats: [
      { label: "在管农场", value: "—" },
      { label: "在管面积", value: "—" },
      { label: "状态", value: "试运行" },
    ],
  },
  {
    key: "park",
    title: "智慧园区",
    subtitle: "Smart Park",
    desc: "园区设施、能耗、安防与访客一体化管理",
    image: parkImg,
    to: "/workspace",
    enabled: false,
    toneVar: "var(--effect-ai-purple)",
    stats: [
      { label: "在管园区", value: "—" },
      { label: "覆盖楼宇", value: "—" },
      { label: "状态", value: "筹备中" },
    ],
  },
];

function WorkspacePage() {
  const navigate = useNavigate();
  const [transition, setTransition] = useState<TransitionState>(null);

  const handleEnter = (m: Module, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!m.enabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTransition({
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      tone: m.toneVar,
      image: m.image,
      variant: "pc",
      title: m.title,
    });
  };

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden">
      {/* ============ 背景视觉层 ============ */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--brand) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--brand) 8%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 85%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-[420px] -z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 30% 0%, color-mix(in oklab, var(--brand) 10%, transparent) 0%, transparent 70%), radial-gradient(ellipse 50% 100% at 80% 0%, color-mix(in oklab, var(--effect-ai-purple) 10%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 right-[8%] h-[380px] w-[380px] rounded-full bg-[var(--effect-ai-purple)]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] -left-24 h-[420px] w-[420px] rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-[20%] h-[460px] w-[460px] rounded-full bg-[var(--effect-ai-cyan)]/10 blur-3xl" />
      <svg
        className="pointer-events-none absolute top-0 right-0 w-[680px] h-[520px] opacity-40"
        viewBox="0 0 680 520"
        fill="none"
      >
        <path d="M680 0 L380 520" stroke="url(#g1)" strokeWidth="1" />
        <path d="M680 80 L300 520" stroke="url(#g1)" strokeWidth="1" />
        <path d="M680 160 L220 520" stroke="url(#g1)" strokeWidth="1" />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* ============ 顶部导航 ============ */}
      <header className="relative px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-brand-subtle text-primary font-semibold flex items-center justify-center">奇</div>
          <div className="leading-tight">
            <div className="text-card-title font-medium text-foreground">奇点智能管理平台</div>
            <div className="text-caption text-text-tertiary">Singularity · Workspace</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-caption text-text-tertiary">
            <span className="inline-flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-primary" /> 系统正常</span>
            <span className="h-3 w-px bg-border" />
            <span>v 2.6.0</span>
          </div>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> 退出登录
          </button>
        </div>
      </header>

      {/* ============ 主内容 ============ */}
      <main className="relative max-w-[1280px] mx-auto px-6 pt-16 pb-16">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption bg-brand-subtle text-primary mb-3">
              <Sparkles className="h-3 w-3" /> 欢迎回来，张磊
            </div>
            <h1 className="text-page-title text-foreground">请选择你要进入的业务模块</h1>
            <p className="text-body text-text-secondary mt-1.5">
              一个账号统管多业态，每个模块拥有独立的数据空间与权限体系
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-text-secondary">
            <div className="text-right">
              <div className="text-caption text-text-tertiary">在管业务</div>
              <div className="text-section-title text-foreground tabular-nums">4 类</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-right">
              <div className="text-caption text-text-tertiary">最近登录</div>
              <div className="text-section-title text-foreground tabular-nums">今天 09:12</div>
            </div>
          </div>
        </div>

        {/* 卡片网格 — PC 24px gutter */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((m) => {
            // 横向渐变蒙层：左侧重(92%) → 右侧轻(18%)，从左向右透明度降低（蒙层变薄、图片更显）
            const overlay = `linear-gradient(90deg,
              color-mix(in oklab, ${m.toneVar} 92%, transparent) 0%,
              color-mix(in oklab, ${m.toneVar} 70%, transparent) 35%,
              color-mix(in oklab, ${m.toneVar} 42%, transparent) 70%,
              color-mix(in oklab, ${m.toneVar} 18%, transparent) 100%)`;
            return (
              <button
                key={m.key}
                disabled={!m.enabled}
                onClick={(e) => handleEnter(m, e)}
                className={`group relative text-left rounded-2xl border border-border/60 bg-card overflow-hidden h-[340px] transition-all
                  ${m.enabled
                    ? "hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_var(--brand)] cursor-pointer"
                    : "opacity-85 cursor-not-allowed"}`}
              >
                <img
                  src={m.image}
                  alt={m.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div
                  className="absolute inset-0 backdrop-blur-[1.5px]"
                  style={{ background: overlay }}
                />
                {/* 顶部反光 */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/15 to-transparent" />

                {/* 状态徽标 — 仅未开通时显示在右上 */}
                {!m.enabled && (
                  <div className="relative p-6 flex items-center justify-end">
                    <span className="px-2 py-0.5 rounded-full text-caption bg-black/35 backdrop-blur-md text-white border border-white/20">
                      即将上线
                    </span>
                  </div>
                )}

                {/* 文本区 */}
                <div className="absolute inset-x-0 bottom-0 p-6 pt-10">
                  <div className="text-caption text-white/70 tracking-wide uppercase mb-1">{m.subtitle}</div>
                  <div className="flex items-center gap-1.5 text-white">
                    <h3 className="text-section-title font-medium drop-shadow-sm">{m.title}</h3>
                    {m.enabled && (
                      <ChevronRight className="h-4 w-4 opacity-80 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                  <p className="text-body-sm text-white/85 mt-1.5 leading-relaxed">{m.desc}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-white/20">
                    {m.stats.map((s) => (
                      <div key={s.label}>
                        <div className="text-caption text-white/70">{s.label}</div>
                        <div className="text-card-title text-white tabular-nums mt-0.5 drop-shadow-sm">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-between flex-wrap gap-3">
          <p className="text-caption text-text-tertiary inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            模块数据物理隔离，权限按账号体系下发
          </p>
          <p className="text-caption text-text-tertiary">
            需要新增业务模块？请联系平台管理员或前往
            <a className="text-primary hover:underline mx-1">配置中心</a>
          </p>
        </div>
      </main>

      <ModuleTransition
        state={transition}
        onDone={() => {
          if (transition) {
            const target = modules.find((x) => x.title === transition.title);
            if (target) navigate({ to: target.to });
            setTimeout(() => setTransition(null), 80);
          }
        }}
      />
    </div>
  );
}
