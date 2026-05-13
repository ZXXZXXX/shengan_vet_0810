import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, ChevronRight, LogOut } from "lucide-react";
import cattleImg from "@/assets/module-cattle.jpg";
import sheepImg from "@/assets/module-sheep.jpg";
import riceImg from "@/assets/module-rice.jpg";
import parkImg from "@/assets/module-park.jpg";

export const Route = createFileRoute("/m/workspace")({
  head: () => ({ meta: [{ title: "工作台 · 奇点智牧" }] }),
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
    desc: "工单 · 健康 · 档案，一线全流程作业",
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

function MWorkspacePage() {
  const navigate = useNavigate();

  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col relative overflow-hidden">
        {/* ============ 背景视觉层（M 端更柔和） ============ */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklab, var(--brand) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--brand) 6%, transparent) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "radial-gradient(ellipse 80% 50% at 50% 0%, black 40%, transparent 80%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -right-12 h-56 w-56 rounded-full bg-[var(--effect-ai-purple)]/15 blur-3xl" />
          <div className="absolute top-[30%] -left-16 h-56 w-56 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute bottom-10 right-[-40px] h-60 w-60 rounded-full bg-[var(--effect-ai-cyan)]/10 blur-3xl" />
        </div>

        {/* 顶部 — M 端 16px page margin */}
        <header className="px-4 pt-12 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-subtle text-primary font-semibold flex items-center justify-center text-body-sm">奇</div>
            <div className="leading-tight">
              <div className="text-body font-medium text-foreground">奇点智牧</div>
              <div className="text-caption text-text-tertiary">选择业务模块</div>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/m/login" })}
            className="inline-flex items-center gap-1 text-caption text-text-tertiary"
          >
            <LogOut className="h-3 w-3" /> 退出
          </button>
        </header>

        {/* 欢迎 */}
        <section className="px-4 pt-6 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption bg-brand-subtle text-primary mb-2">
            <Sparkles className="h-3 w-3" /> 欢迎，李师傅
          </div>
          <h1 className="text-page-title text-foreground">请选择业务模块</h1>
          <p className="text-body-sm text-text-tertiary mt-1">一个账号统管多业态</p>
        </section>

        {/* 模块卡片 — M 端横向图卡（与 PC 差异化） */}
        <section className="px-4 pb-10 space-y-3 flex-1">
          {modules.map((m) => (
            <button
              key={m.key}
              disabled={!m.enabled}
              onClick={() => m.enabled && navigate({ to: m.to })}
              className={`relative w-full text-left rounded-2xl overflow-hidden border border-border/60 h-[112px] active:scale-[.99] transition-all
                ${m.enabled ? "" : "opacity-85"}`}
            >
              <img
                src={m.image}
                alt={m.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 backdrop-blur-[1.5px]"
                style={{ background: m.overlay }}
              />
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/15 to-transparent" />

              <div className="relative h-full p-4 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <h3 className="text-card-title text-white drop-shadow-sm">{m.title}</h3>
                  {m.badge && (
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-caption backdrop-blur-md border
                      ${m.enabled
                        ? "bg-white/25 text-white border-white/30"
                        : "bg-black/30 text-white border-white/20"}`}>
                      {m.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-body-sm text-white/85 line-clamp-1 leading-snug pr-2">{m.desc}</p>
                  {m.enabled && (
                    <ChevronRight className="h-4 w-4 text-white/90 shrink-0" />
                  )}
                </div>
              </div>
            </button>
          ))}

          <p className="pt-4 text-caption text-text-tertiary text-center">
            需要新增业务模块请联系平台管理员
          </p>
        </section>
      </div>
    </div>
  );
}
