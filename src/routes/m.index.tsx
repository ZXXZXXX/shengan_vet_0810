import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Camera,
  ClipboardList,
  Beef,
  AlertTriangle,
  ChevronRight,
  Droplets,
  Stethoscope,
  Footprints,
  PackageMinus,
  TrendingUp,
  Users,
  Warehouse,
  Sun,
  CloudSun,
  Wind,
  Thermometer,
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

  return (
    <MobileShell>
      {/* 顶部欢迎 + 通知 + 现场上报快捷入口 */}
      <header className="px-4 pt-12 pb-6 bg-gradient-to-br from-primary via-primary to-[var(--brand-strong,var(--brand))] text-primary-foreground relative overflow-hidden">
        {/* 视觉装饰层 */}
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1.5px), radial-gradient(circle at 70% 60%, white 1px, transparent 1.5px), radial-gradient(circle at 40% 80%, white 1px, transparent 1.5px)",
            backgroundSize: "120px 120px, 160px 160px, 140px 140px",
          }}
        />
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute top-20 -left-12 h-32 w-32 rounded-full bg-[var(--effect-ai-cyan)]/25 blur-2xl" />
        <div className="absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        {/* 山形剪影 */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-12 opacity-25"
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
          fill="white"
        >
          <path d="M0,60 L0,40 L60,15 L120,35 L180,10 L240,30 L300,8 L360,28 L400,18 L400,60 Z" />
        </svg>

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 opacity-90" />
              <span className="text-caption opacity-90">{roleLabel[role]} · 早上好</span>
            </div>
            <div className="text-section-title mt-1.5">李师傅</div>
            <div className="text-caption opacity-80 mt-0.5">1 号牧场 · 工号 W-1024</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/m/report"
              className="h-9 px-3 rounded-full bg-white text-primary inline-flex items-center gap-1 text-caption font-medium shadow-[0_4px_14px_-4px_rgba(0,0,0,0.25)] active:scale-[.97] transition-transform"
            >
              <Camera className="h-4 w-4" />
              现场上报
            </Link>
            <Link
              to="/m/notifications"
              className="relative h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--state-danger)]" />
            </Link>

          </div>
        </div>

        {/* 天气 / 环境带 */}
        <div className="relative mt-4 flex items-center gap-3 text-caption opacity-90">
          <span className="inline-flex items-center gap-1"><CloudSun className="h-3.5 w-3.5" />晴转多云</span>
          <span className="inline-flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" />18 ~ 26℃</span>
          <span className="inline-flex items-center gap-1"><Wind className="h-3.5 w-3.5" />东南风 2 级</span>
        </div>

        {/* 今日概览 */}
        <div className="relative mt-4 grid grid-cols-3 gap-3 rounded-xl bg-white/12 backdrop-blur border border-white/20 p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.3)]">
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
