import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, ChevronRight, LogOut } from "lucide-react";
import cattleImg from "@/assets/module-cattle.jpg";
import sheepImg from "@/assets/module-sheep.jpg";
import riceImg from "@/assets/module-rice.jpg";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "工作台 — 选择业务模块" }] }),
  component: WorkspacePage,
});

type Module = {
  key: string;
  title: string;
  desc: string;
  image: string;
  to: string;
  enabled: boolean;
  tone: "brand" | "info" | "warm";
  stats: { label: string; value: string }[];
};

const modules: Module[] = [
  {
    key: "cattle",
    title: "牛 · 牧场管理",
    desc: "覆盖生产、健康、仓储、组织与配置全流程",
    image: cattleImg,
    to: "/",
    enabled: true,
    tone: "brand",
    stats: [
      { label: "在管牧场", value: "6" },
      { label: "在栏头数", value: "12,486" },
      { label: "今日工单", value: "38" },
    ],
  },
  {
    key: "sheep",
    title: "羊 · 牧场管理",
    desc: "肉羊与奶羊全周期管理，模块即将上线",
    image: sheepImg,
    to: "/workspace",
    enabled: false,
    tone: "info",
    stats: [
      { label: "在管牧场", value: "—" },
      { label: "在栏只数", value: "—" },
      { label: "状态", value: "筹备中" },
    ],
  },
  {
    key: "rice",
    title: "水稻 · 农场管理",
    desc: "种植、灌溉、植保、仓储一体化（试运行）",
    image: riceImg,
    to: "/workspace",
    enabled: false,
    tone: "warm",
    stats: [
      { label: "在管农场", value: "—" },
      { label: "在管面积", value: "—" },
      { label: "状态", value: "试运行" },
    ],
  },
];

const toneMap: Record<string, string> = {
  brand: "from-primary/12 to-primary/4 border-primary/20",
  info: "from-[var(--effect-ai-cyan)]/12 to-[var(--effect-ai-cyan)]/4 border-[var(--effect-ai-cyan)]/20",
  warm: "from-[var(--state-warning)]/12 to-[var(--state-warning)]/4 border-[var(--state-warning)]/20",
};

function WorkspacePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute -top-40 -right-32 h-[420px] w-[420px] rounded-full bg-[var(--effect-ai-purple)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full bg-primary/10 blur-3xl" />

      {/* 顶部 */}
      <header className="relative px-10 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-brand-subtle text-primary font-semibold flex items-center justify-center">奇</div>
          <div className="leading-tight">
            <div className="text-card-title font-medium text-foreground">奇点智能管理平台</div>
            <div className="text-caption text-text-tertiary">Singularity · Workspace</div>
          </div>
        </div>
        <button
          onClick={() => navigate({ to: "/login" })}
          className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" /> 退出登录
        </button>
      </header>

      {/* 主内容 */}
      <main className="relative max-w-[1100px] mx-auto px-10 pt-14 pb-16">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption bg-brand-subtle text-primary mb-3">
          <Sparkles className="h-3 w-3" /> 欢迎回来，张磊
        </div>
        <h1 className="text-page-title text-foreground">请选择你要进入的业务模块</h1>
        <p className="text-body text-text-secondary mt-1.5">
          一个账号统管多业态，每个模块拥有独立的数据空间与权限体系。
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => (
            <button
              key={m.key}
              disabled={!m.enabled}
              onClick={() => m.enabled && navigate({ to: m.to })}
              className={`group relative text-left rounded-2xl border bg-gradient-to-br ${toneMap[m.tone]}
                p-5 transition-all
                ${m.enabled ? "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_var(--brand)] cursor-pointer" : "opacity-70 cursor-not-allowed"}`}
            >
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-card border border-border shrink-0">
                  <img src={m.image} alt={m.title} loading="lazy" width={56} height={56} className="h-full w-full object-cover" />
                </div>
                {!m.enabled && (
                  <span className="tag tag-muted">即将上线</span>
                )}
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-section-title text-foreground">{m.title}</h3>
                  {m.enabled && (
                    <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                  )}
                </div>
                <p className="text-body-sm text-text-secondary mt-1.5 leading-relaxed">{m.desc}</p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 pt-4 border-t border-border/60">
                {m.stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-caption text-text-tertiary">{s.label}</div>
                    <div className="text-card-title text-foreground tabular-nums mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <p className="mt-10 text-caption text-text-tertiary">
          需要新增业务模块？请联系平台管理员或前往
          <a className="text-primary hover:underline mx-1">配置中心</a>。
        </p>
      </main>
    </div>
  );
}
