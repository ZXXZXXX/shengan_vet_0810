import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Camera,
  ScanLine,
  ClipboardList,
  Beef,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Activity,
  Droplets,
  Stethoscope,
  Footprints,
  PackageMinus,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole, roleLabel, canApprove, canViewOperations } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/")({
  head: () => ({ meta: [{ title: "工作台 · 奇点智牧" }] }),
  component: MHomePage,
});

const colorMap: Record<string, string> = {
  brand: "bg-brand-subtle text-primary",
  warning: "bg-[var(--state-warning)]/15 text-[var(--state-warning)]",
  danger: "bg-[var(--state-danger)]/12 text-[var(--state-danger)]",
  info: "bg-[var(--effect-ai-cyan)]/15 text-[var(--effect-ai-cyan)]",
  purple: "bg-[var(--effect-ai-purple)]/15 text-[var(--effect-ai-purple)]",
  muted: "bg-surface-subtle text-text-secondary",
};

function MHomePage() {
  const role = useRole();
  const isApprover = canApprove(role);
  const isOps = canViewOperations(role);

  // 快捷入口（按角色）
  const actions =
    role === "manager" || role === "admin"
      ? [
          { to: "/m/health", label: "待审任务", icon: ClipboardList, color: "warning" },
          { to: "/m/animals", label: "异常监控", icon: Activity, color: "danger" },
          { to: "/m/animals", label: "牛只档案", icon: Beef, color: "brand" },
          { to: "/m/report", label: "现场上报", icon: Camera, color: "muted" },
        ]
      : role === "vet"
      ? [
          { to: "/m/health", label: "待审任务", icon: ClipboardList, color: "warning" },
          { to: "/m/report", label: "现场上报", icon: Camera, color: "info" },
          { to: "/m/animals", label: "扫耳标", icon: ScanLine, color: "brand" },
          { to: "/m/animals", label: "牛只档案", icon: Beef, color: "muted" },
        ]
      : role === "hoof_trimmer"
      ? [
          { to: "/m/health", label: "我的任务", icon: Footprints, color: "warning" },
          { to: "/m/animals", label: "扫耳标", icon: ScanLine, color: "brand" },
          { to: "/m/report", label: "现场反馈", icon: Camera, color: "info" },
          { to: "/m/animals", label: "牛只档案", icon: Beef, color: "muted" },
        ]
      : [
          { to: "/m/report", label: "现场上报", icon: Camera, color: "warning" },
          { to: "/m/animals", label: "扫耳标", icon: ScanLine, color: "brand" },
          { to: "/m/health", label: "我的任务", icon: ClipboardList, color: "info" },
          { to: "/m/animals", label: "牛只档案", icon: Beef, color: "muted" },
        ];

  return (
    <MobileShell>
      {/* 顶部欢迎 + 通知 */}
      <header className="px-4 pt-12 pb-6 bg-gradient-to-br from-primary to-[var(--brand-strong,var(--brand))] text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-caption opacity-80">{roleLabel[role]} · 早上好</div>
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
          {isApprover ? (
            <>
              <Stat label="待审任务" value="6" hi />
              <Stat label="进行中" value="12" />
              <Stat label="今日异常" value="2" hi />
            </>
          ) : (
            <>
              <Stat label="我的任务" value="4" />
              <Stat label="待执行" value="2" hi />
              <Stat label="今日完成" value="3" />
            </>
          )}
        </div>
      </header>

      {/* 快捷入口 */}
      <section className="px-4 mt-5">
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

      {/* 牧场数据快览（差异化展示） */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-card-title text-foreground">牧场数据快览</h3>
          <span className="text-caption text-text-tertiary">今日</span>
        </div>

        {isOps && (
          // 管理员 / 场长：经营级数据
          <div className="grid grid-cols-2 gap-2">
            <DataCard icon={Beef} tone="brand" label="存栏总数" value="1,284" sub="较昨日 +6" />
            <DataCard icon={Droplets} tone="info" label="今日产奶" value="32.6t" sub="均产 28.5kg" />
            <DataCard icon={TrendingUp} tone="purple" label="发情检出" value="14" sub="待配种 9" />
            <DataCard icon={AlertTriangle} tone="danger" label="健康预警" value="3" sub="高优先 1" />
            <DataCard icon={Warehouse} tone="warning" label="库存预警" value="2" sub="药品 1 · 饲料 1" />
            <DataCard icon={Users} tone="muted" label="在岗人员" value="18 / 22" sub="出勤 82%" />
          </div>
        )}

        {role === "vet" && (
          <div className="grid grid-cols-2 gap-2">
            <DataCard icon={ClipboardList} tone="warning" label="待审任务" value="6" sub="健康 4 · 损耗 2" />
            <DataCard icon={Stethoscope} tone="brand" label="治疗中" value="12" sub="今日复诊 5" />
            <DataCard icon={AlertTriangle} tone="danger" label="健康预警" value="3" sub="高优先 1" />
            <DataCard icon={Droplets} tone="info" label="休药期" value="8" sub="今日解禁 2" />
          </div>
        )}

        {role === "vet_assistant" && (
          <div className="grid grid-cols-2 gap-2">
            <DataCard icon={ClipboardList} tone="warning" label="今日任务" value="5" sub="待执行 2" />
            <DataCard icon={Stethoscope} tone="brand" label="本周完成" value="23" sub="按时率 96%" />
            <DataCard icon={PackageMinus} tone="purple" label="待领药" value="3" sub="去仓库领取" />
            <DataCard icon={Camera} tone="info" label="待反馈" value="1" sub="附照片 / 视频" />
          </div>
        )}

        {role === "hoof_trimmer" && (
          <div className="grid grid-cols-2 gap-2">
            <DataCard icon={Footprints} tone="warning" label="今日修蹄" value="8" sub="已完成 3" />
            <DataCard icon={Beef} tone="brand" label="待处理牛只" value="12" sub="2 / 3 / 4 号舍" />
            <DataCard icon={ClipboardList} tone="info" label="本周任务" value="34" sub="按时率 100%" />
            <DataCard icon={Camera} tone="muted" label="待反馈" value="2" sub="提交执行记录" />
          </div>
        )}
      </section>

      {/* AI 提醒 */}
      <section className="px-4 mt-5">
        <div className="rounded-xl p-4 border border-[var(--effect-ai-purple)]/20 bg-gradient-to-br from-[var(--effect-ai-purple)]/8 to-[var(--effect-ai-cyan)]/8">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-6 w-6 rounded-md bg-[var(--effect-ai-purple)]/15 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-[var(--effect-ai-purple)]" />
            </span>
            <span className="text-body-sm font-medium text-foreground">AI 智能提醒</span>
            <span className="ml-auto tag tag-muted">今日</span>
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            {isApprover
              ? "#A2381 体温连续 2 小时偏高，已生成待审任务，建议优先处理。"
              : "#A2381 体温连续 2 小时偏高，建议立即前往 3 号牛舍复检并上报健康事件。"}
          </p>
          <Link
            to={isApprover ? "/m/health" : "/m/report"}
            className="mt-2 inline-flex items-center text-body-sm text-primary"
          >
            {isApprover ? "前往审批" : "前往上报"} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* 异常预警 */}
      <section className="px-4 mt-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-card-title text-foreground">异常预警</h3>
          <Link to="/m/health" className="text-caption text-text-tertiary inline-flex items-center">
            全部 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {[
            { id: "A2381", desc: "体温异常 39.6℃", barn: "3 号牛舍", icon: AlertTriangle, tone: "danger" },
            { id: "A2324", desc: "采食量下降 18%", barn: "2 号牛舍", icon: AlertTriangle, tone: "warning" },
            { id: "库-中央", desc: "广谱驱虫药余量紧张", barn: "中央库", icon: PackageMinus, tone: "info" },
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

function DataCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: typeof Beef;
  tone: keyof typeof colorMap;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <div className="flex items-center gap-2">
        <span className={`h-7 w-7 rounded-md flex items-center justify-center ${colorMap[tone]}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <span className="text-caption text-text-secondary">{label}</span>
      </div>
      <div className="mt-2 text-section-title text-foreground tabular-nums">{value}</div>
      {sub && <div className="text-caption text-text-tertiary mt-0.5">{sub}</div>}
    </div>
  );
}
