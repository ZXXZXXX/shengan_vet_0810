import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, ChevronRight, LogOut } from "lucide-react";
import cattleImg from "@/assets/module-cattle.jpg";
import sheepImg from "@/assets/module-sheep.jpg";
import riceImg from "@/assets/module-rice.jpg";

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
  tone: "brand" | "info" | "warm";
  badge?: string;
};

const modules: Module[] = [
  {
    key: "cattle",
    title: "牛 · 牧场管理",
    desc: "工单 · 健康 · 档案，一线全流程作业",
    image: cattleImg,
    to: "/m/",
    enabled: true,
    tone: "brand",
    badge: "已开通",
  },
  {
    key: "sheep",
    title: "羊 · 牧场管理",
    desc: "肉羊 / 奶羊全周期，模块筹备中",
    image: sheepImg,
    to: "/m/workspace",
    enabled: false,
    tone: "info",
    badge: "即将上线",
  },
  {
    key: "rice",
    title: "水稻 · 农场管理",
    desc: "种植 · 植保 · 仓储一体化",
    image: riceImg,
    to: "/m/workspace",
    enabled: false,
    tone: "warm",
    badge: "试运行",
  },
];

const toneMap: Record<string, string> = {
  brand: "from-primary/12 to-primary/3 border-primary/20",
  info: "from-[var(--effect-ai-cyan)]/12 to-[var(--effect-ai-cyan)]/3 border-[var(--effect-ai-cyan)]/20",
  warm: "from-[var(--state-warning)]/12 to-[var(--state-warning)]/3 border-[var(--state-warning)]/20",
};

function MWorkspacePage() {
  const navigate = useNavigate();

  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[var(--effect-ai-purple)]/12 blur-3xl" />
          <div className="absolute top-40 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* 顶部 */}
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

        {/* 模块卡片 */}
        <section className="px-4 pb-10 space-y-3 flex-1">
          {modules.map((m) => (
            <button
              key={m.key}
              disabled={!m.enabled}
              onClick={() => m.enabled && navigate({ to: m.to })}
              className={`group w-full text-left rounded-2xl border bg-gradient-to-br ${toneMap[m.tone]}
                p-4 active:scale-[.99] transition-all
                ${m.enabled ? "" : "opacity-70"}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-card border border-border">
                  <img src={m.image} alt={m.title} loading="lazy" width={48} height={48} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-card-title text-foreground truncate">{m.title}</h3>
                    {m.badge && (
                      <span className={`tag ${m.enabled ? "tag-brand" : "tag-muted"} shrink-0`}>{m.badge}</span>
                    )}
                  </div>
                  <p className="text-body-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed">{m.desc}</p>
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
    </div>
  );
}
