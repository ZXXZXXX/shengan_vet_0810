import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Camera,
  ScanLine,
  ClipboardList,
  Beef,
  AlertTriangle,
  ShoppingCart,
  Sparkles,
  ChevronRight,
  Activity,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/")({
  head: () => ({ meta: [{ title: "工作台 · 奇点智牧" }] }),
  component: MHomePage,
});

const workerActions = [
  { to: "/m/health/report", label: "异常上报", icon: Camera, color: "warning" },
  { to: "/m/animals", label: "扫耳标", icon: ScanLine, color: "brand" },
  { to: "/m/health", label: "我的工单", icon: ClipboardList, color: "info" },
  { to: "/m/animals", label: "牛只档案", icon: Beef, color: "muted" },
];

const managerActions = [
  { to: "/m/health", label: "待审工单", icon: ClipboardList, color: "warning" },
  { to: "/m/animals", label: "异常监控", icon: Activity, color: "danger" },
  { to: "/m/animals", label: "牛只档案", icon: Beef, color: "brand" },
  { to: "/m/health/report", label: "登记事件", icon: Camera, color: "muted" },
];

const colorMap: Record<string, string> = {
  brand: "bg-brand-subtle text-primary",
  warning: "bg-[var(--state-warning)]/15 text-[var(--state-warning)]",
  danger: "bg-[var(--state-danger)]/12 text-[var(--state-danger)]",
  info: "bg-[var(--effect-ai-cyan)]/15 text-[var(--effect-ai-cyan)]",
  muted: "bg-surface-subtle text-text-secondary",
};

function MHomePage() {
  const role = useRole();
  const isManager = role === "manager";
  const actions = isManager ? managerActions : workerActions;

  return (
    <MobileShell>
      {/* 顶部欢迎 + 通知 */}
      <header className="px-5 pt-12 pb-6 bg-gradient-to-br from-primary to-[var(--brand-strong,var(--brand))] text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-caption opacity-80">{isManager ? "牧场管理者" : "饲养员"} · 早上好</div>
            <div className="text-section-title mt-1">李师傅</div>
            <div className="text-caption opacity-80 mt-0.5">1 号牧场 · 工号 W-1024</div>
          </div>
          <Link
            to="/m/me"
            className="relative h-9 w-9 rounded-full bg-white/15 flex items-center justify-center"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--state-danger)]" />
          </Link>
        </div>

        {/* 今日概览 */}
        <div className="relative mt-5 grid grid-cols-3 gap-3 rounded-xl bg-white/12 backdrop-blur border border-white/15 p-3">
          <Stat label="今日工单" value="6" />
          <Stat label="待处理" value="2" hi />
          <Stat label="异常" value="1" hi />
        </div>
      </header>

      {/* 快捷入口 */}
      <section className="px-5 mt-5">
        <div className="grid grid-cols-4 gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-card border border-border active:scale-[.97] transition-transform"
              >
                <span className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorMap[a.color]}`}>
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <span className="text-caption text-text-secondary">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI 提醒 */}
      <section className="px-5 mt-5">
        <div className="rounded-xl p-3.5 border border-[var(--effect-ai-purple)]/20 bg-gradient-to-br from-[var(--effect-ai-purple)]/8 to-[var(--effect-ai-cyan)]/8">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-6 w-6 rounded-md bg-[var(--effect-ai-purple)]/15 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[var(--effect-ai-purple)]" />
            </span>
            <span className="text-body-sm font-medium text-foreground">AI 智能提醒</span>
            <span className="ml-auto tag tag-muted">今日</span>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            #A2381 体温连续 2 小时偏高，建议立即前往 3 号牛舍复检并发起健康事件。
          </p>
          <Link
            to="/m/health/report"
            className="mt-2 inline-flex items-center text-body-sm text-primary"
          >
            前往上报 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* 异常预警 */}
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-card-title text-foreground">异常预警</h3>
          <Link to="/m/health" className="text-caption text-text-tertiary inline-flex items-center">
            全部 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {[
            { id: "A2381", desc: "体温异常 39.6℃", barn: "3 号牛舍", level: "高", icon: AlertTriangle, tone: "danger" },
            { id: "A2324", desc: "采食量下降 18%", barn: "2 号牛舍", level: "中", icon: AlertTriangle, tone: "warning" },
            { id: "库-中央", desc: "广谱驱虫药余量紧张", barn: "中央库", level: "低", icon: ShoppingCart, tone: "info" },
          ].map((it) => {
            const Icon = it.icon;
            return (
              <Link
                key={it.id + it.desc}
                to="/m/health"
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
              >
                <span className={`h-9 w-9 rounded-lg flex items-center justify-center ${colorMap[it.tone]}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-body text-foreground truncate">
                    #{it.id} · {it.desc}
                  </div>
                  <div className="text-caption text-text-tertiary mt-0.5">{it.barn}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-text-tertiary" />
              </Link>
            );
          })}
        </div>
      </section>
    </MobileShell>
  );
}

function Stat({ label, value, hi }: { label: string; value: string; hi?: boolean }) {
  return (
    <div>
      <div className="text-caption opacity-80">{label}</div>
      <div className={`mt-0.5 text-section-title tabular-nums ${hi ? "text-white" : "text-white/95"}`}>
        {value}
      </div>
    </div>
  );
}
