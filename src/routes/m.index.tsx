import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Beef,
  ChevronRight,
  ChevronDown,
  MapPin,
  CloudSun,
  Wind,
  Thermometer,
  Inbox,
  Pill,
  Syringe,
  Footprints,
  Stethoscope,
  PackageX,
 ArrowUpRight,
  TrendingUp,
  Check,
  Baby,
} from "lucide-react";

import { MobileShell } from "@/components/mobile-shell";
import { EmptyState } from "@/components/empty-state";
import { RoleSwitchSheet } from "@/components/role-switch-sheet";
import { useRole, roleLabel, roleGroup, canVisit, type Role } from "@/lib/mobile-role";
import { ChevronsUpDown } from "lucide-react";

import { Activity, BookMarked } from "lucide-react";
import { PICKUPS, useClaimed } from "@/lib/pickup-store";
import { FARMS, useFarmId, setFarmId, useFarm } from "@/lib/farm-store";
import { QrCode } from "lucide-react";
import grasslandHero from "@/assets/grassland-hero.png";


export const Route = createFileRoute("/m/")({
  head: () => ({ meta: [{ title: "首页 · 奇点智牧" }] }),
  component: MHomePage,
});

const colorMap: Record<string, string> = {
  brand: "bg-brand-subtle text-primary",
  warning: "bg-[var(--state-warning)]/25 text-[var(--state-alert)]",
  alert: "bg-[var(--state-warning)]/25 text-[var(--state-alert)]",
  danger: "bg-[var(--state-danger)]/12 text-[var(--state-danger)]",
  info: "bg-[#E6F7FE] text-[#22ACEB]",
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
  const [roleOpen, setRoleOpen] = useState(false);




  return (
    <MobileShell>
      {/* 牧场切换（全局数据） */}
      <FarmSwitcher />

      {/* 顶部欢迎 —— 渐变信息面板 */}
      <header className="relative overflow-hidden text-white">
        <img
          src={grasslandHero}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-125 origin-top blur-[1px]"
        />
        {/* 暗色遮罩，保证文字可读 */}
        <div className="absolute inset-0 bg-black/5" />
        {/* 底部柔和过渡到页面背景 */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-b from-transparent to-[var(--bg-page)]" />



        <div className="relative px-4 pt-5 pb-6">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => setRoleOpen(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 active:scale-95 transition-transform"
              >
                <span className="text-[11px] text-white/95">{roleLabel[role]}</span>
                <ChevronsUpDown className="h-3 w-3 text-white/85" />
              </button>
              <div className="text-[18px] leading-tight font-semibold text-white mt-1.5 drop-shadow-sm">李师傅</div>
              <div className="text-caption text-white/85 mt-0.5 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {farm.name} · {farm.region}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setReportOpen(true)}
                className="h-8 px-3 rounded-full bg-white text-primary inline-flex items-center gap-1 text-caption font-medium shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)] active:scale-[.97] transition-transform"
              >
                <Camera className="h-3.5 w-3.5" />
                现场上报
              </button>
            </div>
          </div>

          {/* 个人工单摘要：当前牧场到目前为止 */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "全部工单", value: "128" },
              { label: "已完成", value: "96" },
              { label: "执行中", value: "14" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[11px] text-white/85 font-bold" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>{s.label}</div>
                <div className="text-[26px] leading-none font-black text-white tabular-nums mt-1" style={{ fontFamily: '"SF Pro Display", "Helvetica Neue", Arial, sans-serif', letterSpacing: "-0.02em", textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>{s.value}</div>
              </div>
            ))}
          </div>

        </div>

      </header>



      {/* ============ 金刚区:速查与近况 ============ */}
      {roleGroup[role] === "internal" && (
        <section className="px-4 mt-3">
          <SectionTitle title="速查与近况" />

          <div className="grid grid-cols-3 gap-2.5">
            <KBShortcut
              to="/m/kb_symptoms"
              icon={Activity}
              tone="info"
              label="症状库"
              trendName="持续高烧"
              trendValue="14"
            />
            <KBShortcut
              to="/m/kb_diseases"
              icon={BookMarked}
              tone="brand"
              label="疾病库"
              trendName="乳房炎"
              trendValue="9"
            />
            <KBShortcut
              to="/m/kb_drugs"
              icon={Pill}
              tone="purple"
              label="药品库"
              trendName="头孢噻呋钠"
              trendValue="24"
            />
          </div>

        </section>
      )}




      {/* ============ 工作任务 ============ */}
      <section className="px-4 mt-5 mb-4">
        <SectionTitle
          title="工作任务"
          hint={`共计 ${getTaskCount(role)} 项`}
          to="/m/health"
          search={{
            tab: (roleFilterMap[role]?.status ?? "待诊断") === "进行中" ? "执行中" : "待诊断",
            type: roleFilterMap[role]?.type ?? "疾病治疗",
          }}
        />
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
                <div className="mt-2 text-body font-medium text-foreground">疾病上报</div>
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
      <RoleSwitchSheet open={roleOpen} onClose={() => setRoleOpen(false)} />
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
  minutesAgo: number;
};

const homeTasks: HomeTask[] = [
  // 疾病治疗 · 待诊断
  { id: "WO-2381", target: "#A2381", conclusion: "疑似乳房炎急性发作", type: "疾病治疗", status: "待诊断", minutesAgo: 2 },
  { id: "WO-2382", target: "#A2270", conclusion: "持续高烧待诊", type: "疾病治疗", status: "待诊断", minutesAgo: 8 },
  { id: "WO-2383", target: "#A2156", conclusion: "酮病初筛阳性", type: "疾病治疗", status: "待诊断", minutesAgo: 15 },
  { id: "WO-2384", target: "#A2298", conclusion: "乳房炎复诊评估", type: "疾病治疗", status: "待诊断", minutesAgo: 23 },
  { id: "WO-2385", target: "#A2188", conclusion: "产后子宫炎跟进", type: "疾病治疗", status: "待诊断", minutesAgo: 31 },
  { id: "WO-2386", target: "#A2102", conclusion: "蹄部脓肿诊断", type: "疾病治疗", status: "待诊断", minutesAgo: 42 },
  { id: "WO-2387", target: "#A2250", conclusion: "腹泻 3 天待诊", type: "疾病治疗", status: "待诊断", minutesAgo: 56 },
  // 疾病治疗 · 进行中
  { id: "WO-2298", target: "#A2298", conclusion: "乳房炎复诊处置", type: "疾病治疗", status: "进行中", minutesAgo: 12 },
  { id: "WO-2299", target: "#A2270", conclusion: "蹄叶炎复发治疗", type: "疾病治疗", status: "进行中", minutesAgo: 25 },
  { id: "WO-2300", target: "#A2188", conclusion: "子宫炎第 2 日疗程", type: "疾病治疗", status: "进行中", minutesAgo: 38 },
  { id: "WO-2301", target: "#A2156", conclusion: "肺炎抗生素处置", type: "疾病治疗", status: "进行中", minutesAgo: 51 },
  { id: "WO-2302", target: "#A2102", conclusion: "蹄部脓肿排脓", type: "疾病治疗", status: "进行中", minutesAgo: 67 },
  { id: "WO-2303", target: "#A2233", conclusion: "酮病补液+葡萄糖", type: "疾病治疗", status: "进行中", minutesAgo: 82 },
  // 疫苗免疫 · 进行中
  { id: "YM-1041", target: "犊牛舍 A · 84 头", conclusion: "口蹄疫加强免疫", type: "疫苗免疫", status: "进行中", minutesAgo: 5 },
  { id: "YM-1042", target: "2 号牛舍 · 56 头", conclusion: "布病强免疫", type: "疫苗免疫", status: "进行中", minutesAgo: 18 },
  { id: "YM-1043", target: "1 号牛舍 · 48 头", conclusion: "牛流行热免疫", type: "疫苗免疫", status: "进行中", minutesAgo: 33 },
  { id: "YM-1044", target: "3 号牛舍 · 62 头", conclusion: "炭疽芽孢苗免疫", type: "疫苗免疫", status: "进行中", minutesAgo: 47 },
  { id: "YM-1045", target: "犊牛舍 B · 40 头", conclusion: "副伤寒免疫批次", type: "疫苗免疫", status: "进行中", minutesAgo: 62 },
  { id: "YM-1046", target: "#A2120", conclusion: "漏针补免", type: "疫苗免疫", status: "进行中", minutesAgo: 78 },
  { id: "YM-1047", target: "全场", conclusion: "结核检疫排查", type: "疫苗免疫", status: "进行中", minutesAgo: 95 },
  // 修蹄 · 进行中
  { id: "HF-0702", target: "#A2150", conclusion: "右后蹄趾间皮炎", type: "修蹄", status: "进行中", minutesAgo: 7 },
  { id: "HF-0703", target: "1 号牛舍 · 32 头", conclusion: "批次修蹄 第 1 日", type: "修蹄", status: "进行中", minutesAgo: 22 },
  { id: "HF-0704", target: "#A2188", conclusion: "异常步态修蹄", type: "修蹄", status: "进行中", minutesAgo: 36 },
  { id: "HF-0705", target: "#A2298", conclusion: "蹄底溃疡处置", type: "修蹄", status: "进行中", minutesAgo: 49 },
  { id: "HF-0706", target: "3 号牛舍 · 24 头", conclusion: "干奶前修蹄", type: "修蹄", status: "进行中", minutesAgo: 64 },
  { id: "HF-0707", target: "#A2210", conclusion: "复查修蹄效果", type: "修蹄", status: "进行中", minutesAgo: 80 },
  { id: "HF-0708", target: "犊牛舍 A", conclusion: "蹄部清洁与浴蹄", type: "修蹄", status: "进行中", minutesAgo: 99 },
];

type RoleFilter = { status: "待诊断" | "进行中"; type: string; label: string };
const roleFilterMap: Partial<Record<Role, RoleFilter>> = {
  manager: { status: "待诊断", type: "疾病治疗", label: "待诊断 · 疾病治疗" },
  vet: { status: "待诊断", type: "疾病治疗", label: "待诊断 · 疾病治疗" },
  vet_assistant: { status: "进行中", type: "疾病治疗", label: "执行中 · 疾病治疗" },
  immunizer: { status: "进行中", type: "疫苗免疫", label: "执行中 · 疫苗免疫" },
  hoof_trimmer: { status: "进行中", type: "修蹄", label: "执行中 · 修蹄" },
};

function getTaskCount(role: Role) {
  if (role === "admin") return 0;

  const filter: RoleFilter =
    roleFilterMap[role] ?? { status: "待诊断", type: "疾病治疗", label: "待诊断 · 疾病治疗" };
  return homeTasks.filter(
    (t) => t.status === filter.status && t.type === filter.type,
  ).length;
}

function formatTimeAgo(minutes: number) {
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

const typeMeta: Record<string, { icon: typeof Pill; bg: string; text: string }> = {
  "疾病治疗": { icon: Pill, bg: "bg-brand-subtle", text: "text-primary" },
  "疫苗免疫": { icon: Syringe, bg: "bg-[#E6F7FE]", text: "text-[#0EA5E9]" },
  "修蹄":     { icon: Footprints, bg: "bg-[#FFF5DF]", text: "text-[#F59E0B]" },
  "产后护理": { icon: Baby, bg: "bg-[#F3E8FF]", text: "text-[#9333EA]" },
};

function TodayTaskList({ role }: { role: Role }) {
  if (role === "admin") {
    return (
      <div className="mt-3 rounded-xl bg-card border border-border">
        <EmptyState
          icon={Inbox}
          size="sm"
          title="暂无任务"
        />
      </div>
    );
  }

  const filter: RoleFilter =
    roleFilterMap[role] ?? { status: "待诊断", type: "疾病治疗", label: "待诊断 · 疾病治疗" };
  const matched = homeTasks.filter(
    (t) => t.status === filter.status && t.type === filter.type,
  );
  const visible = matched.slice(0, 6);

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
      {visible.map((t) => {
        const meta = typeMeta[t.type] ?? typeMeta["疾病治疗"];
        const Icon = meta.icon;
        return (
          <Link
            key={t.id}
            to="/m/health/$id"
            params={{ id: t.id }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
          >
            <span className={`h-9 w-9 rounded-lg ${meta.bg} ${meta.text} inline-flex items-center justify-center shrink-0`}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
                <span className="font-mono">{t.id}</span>
                <span>·</span>
                <span>{t.type}</span>
                <span className="ml-auto">{formatTimeAgo(t.minutesAgo)}</span>
              </div>
              <div className="text-body text-foreground truncate mt-0.5">
                <span className="text-text-secondary">{t.target}</span>
                <span className="text-text-tertiary"> · </span>
                {t.conclusion}
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}










// ---------------- 子组件 ----------------
function SectionTitle({
  title,
  hint,
  to,
  search,
}: {
  title: string;
  hint?: string;
  to?: string;
  search?: Record<string, unknown>;
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-card-title text-foreground">{title}</h3>
      {hint &&
        (to ? (
          <Link
            to={to as never}
            search={search as never}
            className="inline-flex items-center gap-0.5 text-caption text-text-tertiary active:opacity-70"
          >
            {hint}
            <ChevronRight className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-caption text-text-tertiary">{hint}</span>
        ))}
    </div>
  );
}


const toneAccentMap: Record<string, string> = {
  brand: "var(--brand)",
  warning: "var(--state-warning)",
  danger: "var(--state-danger)",
  info: "#F6A11D",
  purple: "#15A6E9",
  success: "var(--state-success)",
  muted: "var(--text-secondary)",
};
function SummaryCard({
  icon: Icon,
  tone,
  label,
  value,
  trend,
  trendDir,
}: {
  icon: typeof Beef;
  tone: keyof typeof colorMap;
  label: string;
  value: string;
  trend?: string;
  trendDir?: "up" | "down";
}) {
  const trendTone =
    trendDir === "down"
      ? "bg-[color-mix(in_srgb,var(--state-danger)_12%,transparent)] text-[var(--state-danger)]"
      : colorMap[tone];
  return (
    <div className="rounded-2xl bg-card border border-border/70 p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-2">
        <span className="text-caption text-text-secondary leading-tight">{label}</span>
        <span className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${colorMap[tone]}`}>
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-3 text-[26px] leading-none font-semibold text-foreground tabular-nums tracking-tight">
        {value}
      </div>
      {trend && (
        <div className="mt-2.5">
          <span className={`inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md text-[11px] font-medium tabular-nums ${trendTone}`}>
            {trendDir === "down" ? "↘" : "↗"} {trend}
          </span>
        </div>
      )}
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

function KBShortcut({
  to,
  tone,
  label,
  trendName,
  trendValue,
}: {
  to: string;
  icon?: typeof Beef;
  tone: keyof typeof colorMap;
  label: string;
  trendName: string;
  trendValue: string;
}) {
  const accent = toneAccentMap[tone];
  return (
    <Link
      to={to}
      className="group relative block h-[124px] active:scale-[0.98] transition-transform"
      aria-label={label}
    >
      {/* 文件夹后片 */}
      <div
        className="absolute inset-x-0 bottom-0 top-2.5 rounded-tr-[14px] rounded-b-[14px]"

        style={{
          background: `linear-gradient(160deg, color-mix(in oklab, ${accent} 92%, #fff) 0%, ${accent} 55%, color-mix(in oklab, ${accent} 82%, #000) 100%)`,
          boxShadow: `0 10px 22px -12px color-mix(in oklab, ${accent} 70%, transparent)`,
        }}
      />
      {/* 顶部 tab */}
      <div
        className="absolute left-0 top-0 h-3.5 w-[42%] rounded-tl-[14px] rounded-tr-[8px]"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 88%, #fff) 0%, ${accent} 100%)`,
        }}
      />

      {/* 白色"纸张"露出 */}
      <div className="absolute left-2.5 right-2.5 top-[18px] h-[38px] overflow-hidden">
        <div className="absolute left-1 right-3 top-1 h-[34px] rounded-[5px] bg-white/95 shadow-sm rotate-[-2deg]">
          <div className="px-1.5 pt-1.5 space-y-[3px]">
            <div className="h-[3px] w-[60%] rounded-full bg-black/15" />
            <div className="h-[3px] w-[80%] rounded-full bg-black/10" />
            <div className="h-[3px] w-[45%] rounded-full bg-black/10" />
          </div>
        </div>
        <div className="absolute left-2 right-1 top-0 h-[34px] rounded-[5px] bg-white shadow-sm rotate-[1.5deg]">
          <div className="px-1.5 pt-1.5 space-y-[3px]">
            <div className="h-[3px] w-[55%] rounded-full bg-black/15" />
            <div className="h-[3px] w-[75%] rounded-full bg-black/10" />
            <div className="h-[3px] w-[40%] rounded-full bg-black/10" />
          </div>
        </div>
      </div>
      {/* 文件夹前袋 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[64px] rounded-[14px] rounded-tl-[6px] overflow-hidden"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklab, ${accent} 90%, #fff) 0%, ${accent} 100%)`,
          boxShadow: `inset 0 1px 0 color-mix(in oklab, #fff 35%, transparent), 0 6px 14px -8px color-mix(in oklab, ${accent} 80%, transparent)`,
        }}
      >
        {/* 高光 */}
        <span
          className="absolute -top-4 -left-4 h-12 w-20 rounded-full opacity-50 blur-xl"
          style={{ background: "rgba(255,255,255,0.55)" }}
        />
        <div className="relative h-full px-2.5 pt-1.5 pb-2 flex flex-col justify-between text-white">
          <div className="text-[13px] font-semibold leading-tight drop-shadow-sm">{label}</div>
          <div className="flex items-center justify-between text-[10px] text-white/90 leading-none">
            <span className="truncate max-w-[7em] font-medium">{trendName}</span>
            <span className="shrink-0 inline-flex items-center gap-0.5 tabular-nums font-semibold">
              <TrendingUp className="h-2 w-2" />
              {trendValue}
            </span>
          </div>
        </div>

      </div>
    </Link>
  );
}





// ---------------- 牧场切换 ----------------
function FarmSwitcher() {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
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
                  setOpen(false);
                  if (f.id === currentId) return;
                  setSwitching(true);
                  setFarmId(f.id);
                  window.setTimeout(() => setSwitching(false), 1000);
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
      {switching && (
        <>
          <div className="fixed inset-0 z-[99] bg-black/5 backdrop-blur-[1px]" />
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[25vh]">
            <div className="h-28 w-28 rounded-2xl bg-card shadow-2xl flex flex-col items-center justify-center gap-3">
              <span className="h-8 w-8 rounded-full border-[3px] border-primary/25 border-t-primary animate-spin" />
              <span className="text-caption text-text-secondary">切换牧场中…</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

