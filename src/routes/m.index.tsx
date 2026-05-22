import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Camera,
  ClipboardList,
  Beef,
  AlertTriangle,
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
  Inbox,
  PlayCircle,
  TimerReset,
  PackageX,
  CalendarClock,
  Hourglass,
  Pill,
  Syringe,
  Footprints,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  AlertCircle,
  Droplets,
  Baby,
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
  warning: "bg-[var(--state-warning)]/15 text-[var(--state-warning)]",
  danger: "bg-[var(--state-danger)]/12 text-[var(--state-danger)]",
  info: "bg-[var(--effect-ai-cyan)]/15 text-[var(--effect-ai-cyan)]",
  purple: "bg-[var(--effect-ai-purple)]/15 text-[var(--effect-ai-purple)]",
  success: "bg-[var(--state-success)]/15 text-[var(--state-success)]",
  muted: "bg-surface-subtle text-text-secondary",
};

const toneTextMap: Record<string, string> = {
  brand: "text-primary",
  warning: "text-[var(--state-warning)]",
  danger: "text-[var(--state-danger)]",
  info: "text-[var(--effect-ai-cyan)]",
  purple: "text-[var(--effect-ai-purple)]",
  success: "text-[var(--state-success)]",
  muted: "text-text-secondary",
};

function MHomePage() {
  const role = useRole();
  const canInventory = canViewOperations(role); // 仅具备权限的账号可见库存概况
  const isApprover = canApprove(role);
  // 所有角色都能响应/处理其权限范围内的工单；审批人显示"待审批"，其他角色显示"待响应"
  const showFirstBucket = true;
  const firstBucketLabel = isApprover ? "待审批" : "待响应";
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


      {/* ============ 数据看板 ============ */}
      <section className="px-4 mt-5">
        <SectionTitle title="农场概况" hint="数据实时同步" />
        {/* 头部大卡：牛只总数 + 结构占比 + 7日趋势 */}
        <div className="rounded-xl bg-card border border-border p-3 mb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`h-7 w-7 rounded-md flex items-center justify-center ${colorMap.brand}`}>
                  <Beef className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                <span className="text-caption text-text-secondary">存栏总数</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] leading-none font-semibold text-foreground tabular-nums">1,284</span>
                <span className="text-caption text-text-tertiary">头</span>
                <span className="ml-1 inline-flex items-center gap-0.5 text-caption text-[var(--state-success)]">
                  <TrendingUp className="h-3 w-3" />本月 +6
                </span>
              </div>
            </div>
            <Sparkline points={[18, 22, 19, 25, 24, 28, 30]} className="text-primary shrink-0" />
          </div>
          {/* 结构占比条 */}
          <div className="mt-3">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
              <span className="bg-[var(--state-success)]" style={{ width: "62%" }} />
              <span className="bg-primary/70" style={{ width: "22%" }} />
              <span className="bg-[var(--effect-ai-purple)]/70" style={{ width: "10%" }} />
              <span className="bg-[var(--state-warning)]" style={{ width: "6%" }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-tertiary">
              <LegendDot color="var(--state-success)" label="泌乳 796" />
              <LegendDot color="oklch(from var(--color-primary) l c h / 0.7)" label="干奶 282" />
              <LegendDot color="oklch(from var(--effect-ai-purple) l c h / 0.7)" label="后备 128" />
              <LegendDot color="var(--state-warning)" label="犊牛 78" />
            </div>
          </div>
        </div>
        {/* 关键指标 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          <DataCard icon={HeartPulse} tone="success" label="健康率" value="96.8%" delta="+0.4%" deltaTone="up" bar={96.8} />
          <DataCard icon={Droplets} tone="info" label="日均产奶" value="32.4" unit="kg/头" delta="+0.6" deltaTone="up" />
          <DataCard icon={Eye} tone="warning" label="观察中" value="18" delta="今日 +3" deltaTone="up" />
          <DataCard icon={Stethoscope} tone="danger" label="治疗中" value="12" delta="今日 +2" deltaTone="up" />
          <DataCard icon={Baby} tone="purple" label="本月新生" value="24" delta="计划 30" deltaTone="flat" bar={80} />
          <DataCard icon={Activity} tone="brand" label="采食量达标" value="92%" delta="-1.2%" deltaTone="down" bar={92} />
        </div>
      </section>


      {canInventory && (
        <section className="px-4 mt-4">
          <SectionTitle title="库存概况" hint="今日" />
          <div className="grid grid-cols-3 gap-2">
            <DataCard icon={Warehouse} tone="info" label="物资品类" value="86" sub="" compact />
            <DataCard icon={PackageMinus} tone="brand" label="今日入库" value="12" sub="批次" compact />
            <DataCard icon={PackageX} tone="purple" label="今日出库" value="9" sub="批次" compact />
          </div>
        </section>
      )}

      {/* ============ 工作台：工作概况 ============ */}
      <section className="px-4 mt-5">
        <SectionTitle title="工作概况" hint="与“我”相关" />
        <div className={`grid gap-2 ${showFirstBucket ? "grid-cols-3" : "grid-cols-2"}`}>
          {showFirstBucket && (
            <TaskOverviewCard
              to="/m/health"
              icon={isApprover ? ClipboardList : Inbox}
              tone="warning"
              label={firstBucketLabel}
              value="6"
            />
          )}
          <TaskOverviewCard to="/m/health" icon={PlayCircle} tone="brand" label="待执行" value="4" />
          <TaskOverviewCard to="/m/health" icon={TimerReset} tone="danger" label="已逾期" value="2" />
        </div>
      </section>

      {/* ============ 工作台：待处理事项 ============ */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-card-title text-foreground">待处理事项</h3>
          <Link to="/m/health" className="text-caption text-text-tertiary inline-flex items-center">
            全部 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {/* 跨牧场说明 —— 仅显示当前牧场，消息中心则全量接收 */}
        <div className="mb-2 rounded-lg bg-surface-subtle border border-border px-3 py-2 text-caption text-text-tertiary inline-flex items-start gap-1.5 w-full">
          <MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
          <span>
            仅显示 <span className="text-foreground">{farm.name}</span> 的工作；其它牧场的提醒可在
            <Link to="/m/notifications" className="text-primary mx-1">消息中心</Link>查看。
          </span>
        </div>
        <div className="space-y-2">
          {pendingPickups.map((p) => (
            <Link
              key={p.id}
              to="/m/pickup/$id"
              params={{ id: p.id }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-primary/30 active:bg-surface-subtle relative overflow-hidden"
            >
              {/* 放大版二维码暗纹 —— 同色系，右上角溢出 */}
              <span className="pointer-events-none absolute -right-4 -top-4 text-primary opacity-[0.12]">
                <QrCode className="h-24 w-24" strokeWidth={1} />
              </span>
              <span className="relative h-9 w-9 rounded-lg flex items-center justify-center bg-brand-subtle text-primary shrink-0">
                <PackageCheck className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="tag tag-brand text-[11px] px-1.5 py-0">待领取</span>
                  <span className="text-body text-foreground truncate">{p.title}</span>
                </div>
                <div className="text-caption text-text-tertiary mt-1 truncate">
                  {p.id} · {p.warehouse} · 共 {p.items.length} 项
                </div>
              </div>
              <ChevronRight className="relative h-4 w-4 text-text-tertiary shrink-0" />
            </Link>
          ))}
          {pendingItems
            .filter((it) => it.farmId === farm.id)
            .map((it) => (
            <Link
              key={it.id}
              to="/m/health/$id"
              params={{ id: it.id }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle relative overflow-hidden"
            >
              {/* 同色系相关 icon 暗纹 —— 右上角溢出 */}
              <span className={`pointer-events-none absolute -right-4 -top-4 ${toneTextMap[it.tone]} opacity-[0.12]`}>
                <it.watermark className="h-24 w-24" strokeWidth={1} />
              </span>
              <span className={`relative h-9 w-9 rounded-lg flex items-center justify-center ${colorMap[it.tone]}`}>
                <it.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`tag ${it.tagClass} text-[11px] px-1.5 py-0`}>{it.bucket}</span>
                  <span className="text-body text-foreground truncate">{it.title}</span>
                </div>
                <div className="text-caption text-text-tertiary mt-1 truncate">
                  {it.id} · {it.barn} · {it.time}
                </div>
              </div>
              <ChevronRight className="relative h-4 w-4 text-text-tertiary shrink-0" />
            </Link>
          ))}
          {pendingItems.filter((it) => it.farmId === farm.id).length === 0 && pendingPickups.length === 0 && (
            <div className="py-8 text-center text-caption text-text-tertiary">
              当前牧场暂无待处理事项
            </div>
          )}
        </div>
      </section>


      {/* ============ 风险提醒 ============ */}
      <section className="px-4 mt-5 mb-4">
        <SectionTitle title="风险提醒" hint={`共 ${risks.length} 项`} />
        <div className="space-y-2">
          {risks.map((r) => (
            <div
              key={r.title + r.detail}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <span className={`h-9 w-9 rounded-lg flex items-center justify-center ${colorMap[r.tone]}`}>
                <r.icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-body text-foreground truncate">{r.title}</div>
                <div className="text-caption text-text-tertiary mt-0.5 truncate">{r.detail}</div>
              </div>
              <span className={`text-caption ${r.tone === "danger" ? "text-[var(--state-danger)]" : r.tone === "warning" ? "text-[var(--state-warning)]" : "text-text-tertiary"}`}>
                {r.level}
              </span>
            </div>
          ))}
        </div>
      </section>

    </MobileShell>

  );
}

// ---------------- 数据 ----------------
const pendingItems: Array<{
  id: string;
  title: string;
  barn: string;
  time: string;
  bucket: "待响应" | "待执行" | "已逾期";
  tagClass: string;
  icon: typeof Stethoscope;
  watermark: typeof Stethoscope;
  tone: keyof typeof colorMap;
  farmId: string;
}> = [
  { id: "WO-2381", title: "持续高烧 2 小时 #A2381", barn: "3 号牛舍", time: "今日 09:08", bucket: "待响应", tagClass: "tag-warning", icon: Stethoscope, watermark: Pill, tone: "warning", farmId: "f1" },
  { id: "LS-1029", title: "产后子宫破裂损耗确认", barn: "2 号牛舍", time: "今日 08:20", bucket: "待响应", tagClass: "tag-warning", icon: PackageMinus, watermark: PackageMinus, tone: "warning", farmId: "f1" },
  { id: "WO-2401", title: "口蹄疫加强免疫", barn: "犊牛舍 A", time: "昨日 10:00", bucket: "待执行", tagClass: "tag-brand", icon: PlayCircle, watermark: Syringe, tone: "brand", farmId: "f1" },
  { id: "HF-0702", title: "右后蹄趾间皮炎修蹄", barn: "2 号牛舍", time: "已逾期 4h", bucket: "已逾期", tagClass: "tag-danger", icon: TimerReset, watermark: Footprints, tone: "danger", farmId: "f1" },
  { id: "HF-0815", title: "蹄底溃疡修蹄", barn: "3 号牛舍", time: "今日 10:20", bucket: "待响应", tagClass: "tag-warning", icon: TimerReset, watermark: Footprints, tone: "warning", farmId: "f2" },
  { id: "WO-2502", title: "乳房炎复诊", barn: "1 号牛舍", time: "今日 11:00", bucket: "待响应", tagClass: "tag-warning", icon: Stethoscope, watermark: Pill, tone: "warning", farmId: "f3" },
];

const risks: Array<{
  title: string;
  detail: string;
  level: string;
  tone: keyof typeof colorMap;
  icon: typeof AlertTriangle;
}> = [
  { title: "库存不足：广谱驱虫药", detail: "中央库余量 8% · 建议补货", level: "紧急", tone: "danger", icon: PackageX },
  { title: "物资即将过期：青霉素 80 万单位", detail: "12 支 · 7 日内到期", level: "提醒", tone: "warning", icon: Hourglass },
  { title: "工作即将超时：WO-2298 乳房炎复诊", detail: "剩余 1h 30m", level: "提醒", tone: "warning", icon: TimerReset },
  { title: "重点牛只异常：#A2324", detail: "采食量下降 18% · 已连续 2 日", level: "关注", tone: "info", icon: Activity },
  { title: "复查临近：#A2150", detail: "明日复查 · 产后护理", level: "明日", tone: "purple", icon: CalendarClock },
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

function DataCard({
  icon: Icon,
  tone,
  label,
  value,
  unit,
  sub,
  delta,
  deltaTone,
  bar,
  compact,
}: {
  icon: typeof Beef;
  tone: keyof typeof colorMap;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  bar?: number;
  compact?: boolean;
}) {
  const deltaColor =
    deltaTone === "up"
      ? "text-[var(--state-success)]"
      : deltaTone === "down"
      ? "text-[var(--state-danger)]"
      : "text-text-tertiary";
  const DeltaIcon = deltaTone === "up" ? TrendingUp : deltaTone === "down" ? TrendingDown : ArrowUpRight;
  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <div className="flex items-center gap-2">
        <span className={`h-7 w-7 rounded-md flex items-center justify-center ${colorMap[tone]}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <span className="text-caption text-text-secondary truncate">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`${compact ? "text-card-title" : "text-section-title"} text-foreground tabular-nums`}>{value}</span>
        {unit && <span className="text-[11px] text-text-tertiary">{unit}</span>}
      </div>
      {delta && (
        <div className={`mt-0.5 inline-flex items-center gap-0.5 text-[11px] ${deltaColor}`}>
          <DeltaIcon className="h-3 w-3" />
          {delta}
        </div>
      )}
      {sub && <div className="text-caption text-text-tertiary mt-0.5 truncate">{sub}</div>}
      {typeof bar === "number" && (
        <div className="mt-2 h-1 w-full rounded-full bg-surface-subtle overflow-hidden">
          <span
            className={`block h-full rounded-full ${
              tone === "danger"
                ? "bg-[var(--state-danger)]"
                : tone === "warning"
                ? "bg-[var(--state-warning)]"
                : tone === "success"
                ? "bg-[var(--state-success)]"
                : tone === "purple"
                ? "bg-[var(--effect-ai-purple)]"
                : tone === "info"
                ? "bg-[var(--effect-ai-cyan)]"
                : "bg-primary"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, bar))}%` }}
          />
        </div>
      )}
    </div>
  );
}

function Sparkline({ points, className }: { points: number[]; className?: string }) {
  const w = 84;
  const h = 36;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2] as const);
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={className} aria-hidden>
      <path d={area} fill="currentColor" opacity="0.12" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.slice(-1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="currentColor" />
      ))}
    </svg>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}


function TaskOverviewCard({
  to,
  icon: Icon,
  tone,
  label,
  value,
}: {
  to: string;
  icon: typeof Inbox;
  tone: keyof typeof colorMap;
  label: string;
  value: string;
}) {
  return (
    <Link
      to={to}
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
