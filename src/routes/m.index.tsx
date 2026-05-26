import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Camera,
  ClipboardList,
  Beef,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Check,
  Stethoscope,
  PackageMinus,
  Warehouse,
  CloudSun,
  Wind,
  Thermometer,
  MapPin,
  Activity,
  HeartPulse,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Inbox,
  PlayCircle,
  TimerReset,
  PackageX,
  CalendarClock,
  Hourglass,
  Pill,
  Syringe,
  Footprints,
} from "lucide-react";

import { MobileShell } from "@/components/mobile-shell";
import { useRole, roleLabel, canViewOperations, canApprove } from "@/lib/mobile-role";
import { PICKUPS, useClaimed } from "@/lib/pickup-store";
import { FARMS, useFarmId, setFarmId, useFarm } from "@/lib/farm-store";
import { PackageCheck, QrCode } from "lucide-react";
import grasslandHero from "@/assets/grassland-hero.jpg";


export const Route = createFileRoute("/m/")({
  head: () => ({ meta: [{ title: "首页 · 奇点智牧" }] }),
  component: MHomePage,
});

const colorMap: Record<string, string> = {
  brand: "bg-brand-subtle text-primary",
  warning: "bg-[var(--state-warning)]/25 text-[var(--state-alert)]",
  alert: "bg-[var(--state-warning)]/25 text-[var(--state-alert)]",
  danger: "bg-[var(--state-danger)]/12 text-[var(--state-danger)]",
  info: "bg-[var(--effect-ai-cyan)]/15 text-[var(--effect-ai-cyan)]",
  purple: "bg-[var(--effect-ai-purple)]/15 text-[var(--effect-ai-purple)]",
  success: "bg-[var(--state-success)]/15 text-[var(--state-success)]",
  muted: "bg-surface-subtle text-text-secondary",
};

const toneTextMap: Record<string, string> = {
  brand: "text-primary",
  warning: "text-[var(--state-alert)]",
  alert: "text-[var(--state-alert)]",
  danger: "text-[var(--state-danger)]",
  info: "text-[var(--effect-ai-cyan)]",
  purple: "text-[var(--effect-ai-purple)]",
  success: "text-[var(--state-success)]",
  muted: "text-text-secondary",
};


function MHomePage() {
  const role = useRole();
  void role;
  const claimed = useClaimed();
  const pendingPickups = PICKUPS.filter((p) => !claimed.includes(p.id));
  const farm = useFarm();




  return (
    <MobileShell>
      {/* 牧场切换（全局数据） */}
      <FarmSwitcher />

      {/* 顶部欢迎 —— 草原图文样式 */}
      <header className="relative overflow-hidden text-white">
        <img
          src={grasslandHero}
          alt="牧场草原清晨景色"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* 渐变蒙层：上轻下重，保证文字可读 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-black/70" />
        {/* 底部柔和过渡到页面背景 */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[var(--bg-page)]" />

        <div className="relative px-4 pt-4 pb-7">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <span className="text-[11px] text-white/90">{roleLabel[role]}</span>
              </div>
              <div className="text-section-title mt-2 drop-shadow-sm">李师傅</div>
              <div className="text-caption text-white/85 mt-0.5 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {farm.name} · {farm.region}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/m/report"
                className="h-9 px-3 rounded-full bg-white text-primary inline-flex items-center gap-1 text-caption font-medium shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)] active:scale-[.97] transition-transform"
              >
                <Camera className="h-4 w-4" />
                现场上报
              </Link>
              <Link
                to="/m/notifications"
                className="relative h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/20"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--state-danger)]" />
              </Link>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 text-caption text-white/90">
            <span className="inline-flex items-center gap-1"><CloudSun className="h-3.5 w-3.5" />晴转多云</span>
            <span className="h-3 w-px bg-white/30" />
            <span className="inline-flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" />18 ~ 26℃</span>
            <span className="h-3 w-px bg-white/30" />
            <span className="inline-flex items-center gap-1"><Wind className="h-3.5 w-3.5" />东南风 2 级</span>
          </div>
        </div>
      </header>


      {/* ============ 牧场摘要 ============ */}
      <section className="px-4 mt-5">
        <SectionTitle title="牧场摘要" />
        <div className="grid grid-cols-3 gap-2">
          <SummaryCard icon={Beef} tone="brand" label="牛只总数" value="1,284" />
          <SummaryCard icon={HeartPulse} tone="success" label="健康率" value="96.8%" />
          <SummaryCard icon={Stethoscope} tone="warning" label="异常数" value="18" />
        </div>
      </section>

      {/* ============ 今日工作 ============ */}
      <section className="px-4 mt-5">
        <SectionTitle title="今日工作" />
        <div className="grid grid-cols-3 gap-2">
          <TaskOverviewCard to="/m/respond" icon={Inbox} tone="warning" label="待响应" value="6" />
          <TaskOverviewCard to="/m/pickup" icon={PackageCheck} tone="info" label="待领物" value={String(pendingPickups.length)} />
          <TaskOverviewCard to="/m/health" search={{ tab: "待执行" }} icon={PlayCircle} tone="brand" label="待执行" value="4" />
        </div>
      </section>

      {/* ============ 风险提醒 ============ */}
      <section className="px-4 mt-5 mb-4">
        <SectionTitle title="风险提醒" />
        <div className="space-y-2">
          {risks.map((r) => (
            <Link
              key={r.title}
              to={r.to}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
            >
              <span className={`h-9 w-9 rounded-lg flex items-center justify-center ${colorMap[r.tone]}`}>
                <r.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-body text-foreground truncate">{r.title}</div>
                <div className="text-caption text-text-tertiary mt-0.5 truncate">{r.detail}</div>
              </div>
              <span className={`text-caption ${toneTextMap[r.tone] ?? "text-text-tertiary"} shrink-0`}>
                {r.count}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
            </Link>
          ))}
        </div>
      </section>


    </MobileShell>

  );
}

// ---------------- 数据 ----------------
const risks: Array<{
  title: string;
  detail: string;
  count: string;
  tone: keyof typeof colorMap;
  icon: typeof AlertTriangle;
  to: string;
}> = [
  { title: "工单逾期提醒", detail: "WO-2298 乳房炎复诊 · 已超 1h", count: "2 项", tone: "danger", icon: TimerReset, to: "/m/health/HF-0702" },
  { title: "牛只异常风险", detail: "#A2324 采食量下降 18% · 已连续 2 日", count: "3 项", tone: "warning", icon: AlertCircle, to: "/m/animals" },
  { title: "库存风险", detail: "广谱驱虫药余量 8% · 建议补货", count: "5 项", tone: "alert", icon: AlertTriangle, to: "/m/" },
];




// ---------------- 子组件 ----------------
function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-card-title text-foreground">{title}</h3>
      {hint && <span className="text-caption text-text-tertiary">{hint}</span>}
    </div>
  );
}

const toneAccentMap: Record<string, string> = {
  brand: "var(--brand)",
  warning: "var(--state-warning)",
  danger: "var(--state-danger)",
  info: "var(--effect-ai-cyan)",
  purple: "var(--effect-ai-purple)",
  success: "var(--state-success)",
  muted: "var(--text-secondary)",
};

function DataCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  compact,
  trend,
  trendDir,
}: {
  icon: typeof Beef;
  tone: keyof typeof colorMap;
  label: string;
  value: string;
  sub?: string;
  compact?: boolean;
  trend?: string;
  trendDir?: "up" | "down";
}) {
  if (compact) {
    return (
      <div className="rounded-xl bg-card border border-border p-3">
        <div className="flex items-center gap-2">
          <span className={`h-7 w-7 rounded-md flex items-center justify-center ${colorMap[tone]}`}>
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          </span>
          <span className="text-caption text-text-secondary truncate">{label}</span>
        </div>
        <div className="mt-2 text-card-title text-foreground tabular-nums">{value}</div>
        {sub && <div className="text-caption text-text-tertiary mt-0.5 truncate">{sub}</div>}
      </div>
    );
  }
  const accent = toneAccentMap[tone];
  return (
    <div
      className="relative rounded-2xl bg-card border border-border p-3.5 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${accent} 8%, transparent) 0%, color-mix(in oklab, ${accent} 0%, transparent) 60%)`,
      }}
    >
      {/* 角落水印图标 */}
      <span
        className="pointer-events-none absolute -right-3 -bottom-3 opacity-[0.08]"
        style={{ color: accent }}
      >
        <Icon className="h-20 w-20" strokeWidth={1.25} />
      </span>
      {/* 顶部：图标 + 标签 + 趋势 */}
      <div className="relative flex items-center justify-between">
        <span
          className={`h-9 w-9 rounded-xl flex items-center justify-center ${colorMap[tone]} shadow-[0_4px_12px_-6px]`}
          style={{ boxShadow: `0 6px 14px -8px ${accent}` }}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        {trend && (
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium tabular-nums"
            style={{
              backgroundColor: `color-mix(in oklab, ${accent} 14%, transparent)`,
              color: accent,
            }}
          >
            {trendDir === "down" ? (
              <ArrowUpRight className="h-2.5 w-2.5 rotate-90" />
            ) : (
              <TrendingUp className="h-2.5 w-2.5" />
            )}
            {trend}
          </span>
        )}
      </div>
      {/* 数值 */}
      <div className="relative mt-3 text-section-title text-foreground tabular-nums leading-none">
        {value}
      </div>
      {/* 标签 + 子说明 */}
      <div className="relative mt-1.5 flex items-center justify-between">
        <span className="text-caption text-text-secondary truncate">{label}</span>
        {sub && <span className="text-[11px] text-text-tertiary shrink-0 ml-2">{sub}</span>}
      </div>
    </div>
  );
}

function TaskOverviewCard({
  to,
  search,
  icon: Icon,
  tone,
  label,
  value,
}: {
  to: string;
  search?: Record<string, string>;
  icon: typeof Inbox;
  tone: keyof typeof colorMap;
  label: string;
  value: string;
}) {
  return (
    <Link
      to={to}
      search={search as never}
      className="rounded-xl bg-card border border-border p-3 flex flex-col gap-2 active:bg-surface-subtle"
    >
      <div className="flex items-center justify-between">
        <span className={`h-7 w-7 rounded-md flex items-center justify-center ${colorMap[tone]}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
      </div>
      <div>
        <div className="text-caption text-text-secondary">{label}</div>
        <div className="text-section-title text-foreground tabular-nums mt-0.5">{value}</div>
      </div>
    </Link>
  );
}


// ---------------- 牧场切换 ----------------
function FarmSwitcher() {
  const [open, setOpen] = useState(false);
  const currentId = useFarmId();
  const ref = useRef<HTMLDivElement>(null);
  const current = FARMS.find((f) => f.id === currentId) ?? FARMS[0];
  const single = FARMS.length === 1;


  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div
      ref={ref}
      className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border px-4 py-2"
    >

      <button
        type="button"
        onClick={() => !single && setOpen((v) => !v)}
        className="w-full h-11 flex items-center gap-2 active:bg-surface-subtle"
      >
        <span className="h-6 w-6 rounded-md bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
          <MapPin className="h-3.5 w-3.5" />
        </span>
        <span className="text-body font-medium text-foreground truncate">{current.name}</span>
        <span className="text-caption text-text-tertiary truncate">· {current.region}</span>
        <span className="flex-1" />
        {single ? (
          <span className="text-caption text-text-tertiary">仅 1 个牧场</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-caption text-primary">
            切换
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </span>
        )}
      </button>

      {open && !single && (
        <div className="absolute left-0 right-0 top-full bg-card border border-border shadow-lg rounded-xl mt-1 max-h-[60vh] overflow-y-auto">
          <div className="px-4 py-2 text-caption text-text-tertiary border-b border-border">
            共 {FARMS.length} 个牧场 · 切换后全局数据将同步更新
          </div>
          {FARMS.map((f) => {
            const active = f.id === currentId;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setFarmId(f.id);
                  setOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left active:bg-surface-subtle ${
                  active ? "bg-brand-subtle/40" : ""
                }`}
              >
                <span
                  className={`h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ${
                    active ? "bg-primary text-primary-foreground" : "bg-surface-subtle text-text-secondary"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-body text-foreground">{f.name}</div>
                  <div className="text-caption text-text-tertiary truncate">
                    {f.region} · {f.scale}
                  </div>
                </div>
                {active && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Suppress unused imports kept for readability
void ClipboardList;
