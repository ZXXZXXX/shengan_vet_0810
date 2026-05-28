import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Camera,
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
import { EmptyState } from "@/components/empty-state";
import { useRole, roleLabel, canViewOperations, canVisit } from "@/lib/mobile-role";
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
  const [reportOpen, setReportOpen] = useState(false);




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
              <button
                onClick={() => setReportOpen(true)}
                className="h-9 px-3 rounded-full bg-white text-primary inline-flex items-center gap-1 text-caption font-medium shadow-[0_4px_14px_-4px_rgba(0,0,0,0.35)] active:scale-[.97] transition-transform"
              >
                <Camera className="h-4 w-4" />
                现场上报
              </button>
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
      <section className="px-4 mt-5 mb-4">
        <SectionTitle title="今日工作" />
        <div className="grid grid-cols-3 gap-2">
          <TaskOverviewCard to="/m/respond" icon={Inbox} tone="warning" label="待响应" value="6" />
          <TaskOverviewCard to="/m/pickup" icon={PackageCheck} tone="info" label="待领物" value={String(pendingPickups.length)} />
          <TaskOverviewCard to="/m/health" search={{ tab: "执行中" }} icon={PlayCircle} tone="brand" label="执行中" value="4" />
        </div>

        <TodayTaskList role={role} />
      </section>





      {/* 现场上报 类型选择 */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-card-title text-foreground mb-3">现场上报</div>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/m/report"
                onClick={() => setReportOpen(false)}
                className="rounded-xl border border-border bg-card p-3 active:bg-surface-subtle"
              >
                <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <div className="mt-2 text-body font-medium text-foreground">健康上报</div>
                <div className="text-caption text-text-tertiary mt-0.5">疾病、修蹄、产后等</div>
              </Link>
              <Link
                to="/m/loss-report"
                onClick={() => setReportOpen(false)}
                className="rounded-xl border border-border bg-card p-3 active:bg-surface-subtle"
              >
                <span className="h-9 w-9 rounded-lg bg-[var(--state-warning)]/15 text-[var(--state-alert)] inline-flex items-center justify-center">
                  <PackageX className="h-4 w-4" />
                </span>
                <div className="mt-2 text-body font-medium text-foreground">损耗上报</div>
                <div className="text-caption text-text-tertiary mt-0.5">物品/药品损耗登记</div>
              </Link>
            </div>
            <button
              onClick={() => setReportOpen(false)}
              className="mt-3 w-full h-10 rounded-lg text-body-sm text-text-secondary active:bg-surface-subtle"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </MobileShell>

  );
}

// ---------------- 数据 ----------------
type HomeTask = {
  id: string;
  target: string;
  conclusion: string;
  type: string; // 工单类型
  status: "待诊断" | "进行中";
};

const homeTasks: HomeTask[] = [
  // 疾病治疗 · 待诊断
  { id: "WO-2381", target: "#A2381", conclusion: "疑似乳房炎急性发作", type: "疾病治疗", status: "待诊断" },
  { id: "WO-2382", target: "#A2270", conclusion: "持续高烧待诊", type: "疾病治疗", status: "待诊断" },
  { id: "WO-2383", target: "#A2156", conclusion: "酮病初筛阳性", type: "疾病治疗", status: "待诊断" },
  { id: "WO-2384", target: "#A2298", conclusion: "乳房炎复诊评估", type: "疾病治疗", status: "待诊断" },
  { id: "WO-2385", target: "#A2188", conclusion: "产后子宫炎跟进", type: "疾病治疗", status: "待诊断" },
  { id: "WO-2386", target: "#A2102", conclusion: "蹄部脓肿诊断", type: "疾病治疗", status: "待诊断" },
  { id: "WO-2387", target: "#A2250", conclusion: "腹泻 3 天待诊", type: "疾病治疗", status: "待诊断" },
  // 疾病治疗 · 进行中
  { id: "WO-2298", target: "#A2298", conclusion: "乳房炎复诊处置", type: "疾病治疗", status: "进行中" },
  { id: "WO-2299", target: "#A2270", conclusion: "蹄叶炎复发治疗", type: "疾病治疗", status: "进行中" },
  { id: "WO-2300", target: "#A2188", conclusion: "子宫炎第 2 日疗程", type: "疾病治疗", status: "进行中" },
  { id: "WO-2301", target: "#A2156", conclusion: "肺炎抗生素处置", type: "疾病治疗", status: "进行中" },
  { id: "WO-2302", target: "#A2102", conclusion: "蹄部脓肿排脓", type: "疾病治疗", status: "进行中" },
  { id: "WO-2303", target: "#A2233", conclusion: "酮病补液+葡萄糖", type: "疾病治疗", status: "进行中" },
  // 疫苗免疫 · 进行中
  { id: "YM-1041", target: "犊牛舍 A · 84 头", conclusion: "口蹄疫加强免疫", type: "疫苗免疫", status: "进行中" },
  { id: "YM-1042", target: "2 号牛舍 · 56 头", conclusion: "布病强免疫", type: "疫苗免疫", status: "进行中" },
  { id: "YM-1043", target: "1 号牛舍 · 48 头", conclusion: "牛流行热免疫", type: "疫苗免疫", status: "进行中" },
  { id: "YM-1044", target: "3 号牛舍 · 62 头", conclusion: "炭疽芽孢苗免疫", type: "疫苗免疫", status: "进行中" },
  { id: "YM-1045", target: "犊牛舍 B · 40 头", conclusion: "副伤寒免疫批次", type: "疫苗免疫", status: "进行中" },
  { id: "YM-1046", target: "#A2120", conclusion: "漏针补免", type: "疫苗免疫", status: "进行中" },
  { id: "YM-1047", target: "全场", conclusion: "结核检疫排查", type: "疫苗免疫", status: "进行中" },
  // 修蹄 · 进行中
  { id: "HF-0702", target: "#A2150", conclusion: "右后蹄趾间皮炎", type: "修蹄", status: "进行中" },
  { id: "HF-0703", target: "1 号牛舍 · 32 头", conclusion: "批次修蹄 第 1 日", type: "修蹄", status: "进行中" },
  { id: "HF-0704", target: "#A2188", conclusion: "异常步态修蹄", type: "修蹄", status: "进行中" },
  { id: "HF-0705", target: "#A2298", conclusion: "蹄底溃疡处置", type: "修蹄", status: "进行中" },
  { id: "HF-0706", target: "3 号牛舍 · 24 头", conclusion: "干奶前修蹄", type: "修蹄", status: "进行中" },
  { id: "HF-0707", target: "#A2210", conclusion: "复查修蹄效果", type: "修蹄", status: "进行中" },
  { id: "HF-0708", target: "犊牛舍 A", conclusion: "蹄部清洁与浴蹄", type: "修蹄", status: "进行中" },
];

type RoleFilter = { status: "待诊断" | "进行中"; type: string; label: string };
const roleFilterMap: Partial<Record<Role, RoleFilter>> = {
  vet: { status: "待诊断", type: "疾病治疗", label: "待诊断 · 疾病治疗" },
  vet_assistant: { status: "进行中", type: "疾病治疗", label: "执行中 · 疾病治疗" },
  hoof_trimmer: { status: "进行中", type: "修蹄", label: "执行中 · 修蹄" },
};

function TodayTaskList({ role }: { role: Role }) {
  // admin / manager 默认看 待诊断 · 疾病治疗
  const filter: RoleFilter =
    roleFilterMap[role] ?? { status: "待诊断", type: "疾病治疗", label: "待诊断 · 疾病治疗" };
  const matched = homeTasks.filter(
    (t) => t.status === filter.status && t.type === filter.type,
  );
  const visible = matched.slice(0, 6);
  const remaining = Math.max(0, matched.length - visible.length);

  const tabParam = filter.status === "进行中" ? "执行中" : "待诊断";
  const typeIcon =
    filter.type === "修蹄" ? Footprints : filter.type === "疫苗免疫" ? Syringe : Pill;
  const TIcon = typeIcon;

  if (visible.length === 0) {
    return (
      <div className="mt-3 rounded-xl bg-card border border-border">
        <EmptyState
          icon={Inbox}
          size="sm"
          title="今日暂无工单"
          desc={`暂无${filter.label}相关工单`}
        />
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center text-caption text-text-tertiary">
        <span>{filter.label}</span>
        <span className="mx-1">·</span>
        <span className="text-text-secondary tabular-nums">{matched.length} 项</span>
      </div>
      {visible.map((t) => (
        <Link
          key={t.id}
          to="/m/health/$id"
          params={{ id: t.id }}
          className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
        >
          <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
            <TIcon className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
              <span className="font-mono">{t.id}</span>
              <span>·</span>
              <span>{t.type}</span>
            </div>
            <div className="text-body text-foreground truncate mt-0.5">
              <span className="text-text-secondary">{t.target}</span>
              <span className="text-text-tertiary"> · </span>
              {t.conclusion}
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
        </Link>
      ))}
      <Link
        to="/m/health"
        search={{ tab: tabParam, type: filter.type } as never}
        className="flex items-center justify-center gap-1 h-10 rounded-xl bg-card border border-border text-body-sm text-primary active:bg-surface-subtle"
      >
        查看更多{remaining > 0 ? ` (还有 ${remaining} 项)` : ""}
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}









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

function SummaryCard({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Beef;
  tone: keyof typeof colorMap;
  label: string;
  value: string;
}) {
  const accent = toneAccentMap[tone];
  return (
    <div className="relative rounded-xl bg-card border border-border p-3 overflow-hidden h-[92px]">
      <span
        className="pointer-events-none absolute -right-2 -bottom-2 opacity-[0.12]"
        style={{ color: accent }}
      >
        <Icon className="h-20 w-20" strokeWidth={1.25} />
      </span>
      <div className="relative text-caption text-text-secondary">{label}</div>
      <div className="relative mt-2 text-section-title text-foreground tabular-nums leading-none">
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

