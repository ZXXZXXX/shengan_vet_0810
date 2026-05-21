import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, ChevronRight, LogOut } from "lucide-react";
import cattleImg from "@/assets/module-cattle.jpg";
import sheepImg from "@/assets/module-sheep.jpg";
import riceImg from "@/assets/module-rice.jpg";
import parkImg from "@/assets/module-park.jpg";
import { ModuleTransition, type TransitionState } from "@/components/module-transition";

export const Route = createFileRoute("/m/workspace")({
  head: () => ({ meta: [{ title: "首页 · 奇点智牧" }] }),
  component: MWorkspacePage,
});

type Module = {
  key: string;
  title: string;
  desc: string;
  image: string;
  to: string;
  enabled: boolean;
  overlay: string;
  badge?: string;
};

// 蒙层方向：从右下角(浓) → 左上角(淡)，使底层图片在左上角更显
const overlayFor = (tone: string) =>
  `radial-gradient(125% 125% at 100% 100%,
    color-mix(in oklab, ${tone} 92%, transparent) 0%,
    color-mix(in oklab, ${tone} 70%, transparent) 35%,
    color-mix(in oklab, ${tone} 42%, transparent) 70%,
    color-mix(in oklab, ${tone} 18%, transparent) 100%)`;

const modules: Module[] = [
  {
    key: "cattle",
    title: "牛 · 牧场管理",
    desc: "工作 · 健康 · 档案，一线全流程作业",
    image: cattleImg,
    to: "/m/",
    enabled: true,
    overlay: overlayFor("var(--brand)"),
    badge: "已开通",
  },
  {
    key: "sheep",
    title: "羊 · 牧场管理",
    desc: "肉羊 / 奶羊全周期，模块筹备中",
    image: sheepImg,
    to: "/m/workspace",
    enabled: false,
    overlay: overlayFor("var(--effect-ai-cyan)"),
    badge: "即将上线",
  },
  {
    key: "rice",
    title: "水稻 · 农场管理",
    desc: "种植 · 植保 · 仓储一体化",
    image: riceImg,
    to: "/m/workspace",
    enabled: false,
    overlay: overlayFor("var(--state-warning)"),
    badge: "试运行",
  },
  {
    key: "park",
    title: "智慧园区",
    desc: "园区设施 · 能耗 · 安防 · 访客",
    image: parkImg,
    to: "/m/workspace",
    enabled: false,
    overlay: overlayFor("var(--effect-ai-purple)"),
    badge: "筹备中",
  },
];

const toneByKey: Record<string, string> = {
  cattle: "var(--brand)",
  sheep: "var(--effect-ai-cyan)",
  rice: "var(--state-warning)",
  park: "var(--effect-ai-purple)",
};

function MWorkspacePage() {
  const navigate = useNavigate();
  const [transition, setTransition] = useState<TransitionState>(null);

  const handleEnter = (m: Module, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!m.enabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTransition({
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      tone: toneByKey[m.key] ?? "var(--brand)",
      image: m.image,
      variant: "mobile",
      title: m.title,
    });
  };

  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col relative overflow-hidden bg-[var(--bg-page)]">
        {/* ============ Hero 渐变背景（曲面波形） ============ */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[340px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--brand) 92%, black) 0%, var(--brand) 45%, color-mix(in oklab, var(--effect-ai-cyan) 60%, var(--brand)) 100%)",
              clipPath:
                "path('M 0 0 L 440 0 L 440 260 C 330 320, 200 300, 110 290 C 60 285, 20 295, 0 305 Z')",
            }}
          />
          {/* 高光光斑 */}
          <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute top-10 -left-12 h-44 w-44 rounded-full bg-[var(--effect-ai-cyan)]/40 blur-3xl" />
          <div className="absolute top-32 right-1/3 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
          {/* 细网格点 */}
          <div
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
        </div>

        {/* 顶部 */}
        <header className="relative px-4 pt-12 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur text-white font-semibold flex items-center justify-center text-body-sm border border-white/30">奇</div>
            <div className="leading-tight">
              <div className="text-body font-medium text-white">奇点智牧</div>
              <div className="text-caption text-white/75">选择业务模块</div>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/m/login" })}
            className="inline-flex items-center gap-1 text-caption text-white/80 hover:text-white"
          >
            <LogOut className="h-3 w-3" /> 退出
          </button>
        </header>

        {/* 欢迎 — Hero 文案区 */}
        <section className="relative px-4 pt-6 pb-8">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption bg-white/20 text-white backdrop-blur-md border border-white/25 mb-3">
            <Sparkles className="h-3 w-3" /> 欢迎，李师傅
          </div>
          <h1 className="text-page-title text-white tracking-tight">请选择业务模块</h1>
          <p className="text-body-sm text-white/80 mt-1">一个账号统管多业态</p>
        </section>

        {/* 模块卡片 — 浮起白卡 + 圆形图片头像 */}
        <section className="relative px-4 pb-10 space-y-3 flex-1">
          {modules.map((m) => (
            <button
              key={m.key}
              disabled={!m.enabled}
              onClick={(e) => handleEnter(m, e)}
              className={`group relative w-full text-left rounded-2xl bg-card border border-border/60 shadow-[0_8px_24px_-12px_rgba(15,42,18,0.18)] active:scale-[.99] transition-all overflow-hidden
                ${m.enabled ? "hover:shadow-[0_12px_32px_-12px_rgba(15,42,18,0.25)]" : "opacity-75"}`}
            >
              {/* 渐变装饰条（从右下衰减到左上） */}
              <div
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{ background: m.overlay }}
              />
              <div className="relative flex items-center gap-3 p-3">
                {/* 圆角图片头像 */}
                <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden ring-1 ring-white/40">
                  <img
                    src={m.image}
                    alt={m.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: m.overlay, opacity: 0.35 }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-card-title text-foreground truncate">{m.title}</h3>
                    {m.badge && (
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-caption border
                        ${m.enabled
                          ? "bg-brand-subtle text-primary border-primary/20"
                          : "bg-muted text-text-tertiary border-border"}`}>
                        {m.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-text-secondary line-clamp-1 mt-1 pr-2">{m.desc}</p>
                </div>

                {m.enabled && (
                  <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
                )}
              </div>
            </button>
          ))}

          <p className="pt-4 text-caption text-text-tertiary text-center">
            需要新增业务模块请联系平台管理员
          </p>
        </section>
      </div>

      <ModuleTransition
        state={transition}
        onComplete={() => {
          if (!transition) return;
          const target = modules.find((x) => x.title === transition.title);
          if (target) navigate({ to: target.to });
          setTimeout(() => setTransition(null), 80);
        }}
        onCancel={() => setTransition(null)}
      />
    </div>
  );
}
