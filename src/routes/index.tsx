import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import grasslandHero from "@/assets/grassland-hero.png";
import { ImmunizationRateCard } from "@/components/immunization-rate-card";


import {
  Inbox,
  ArrowUpRight,
  Beef,
  
  Package,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Bell,
  UserPlus,
  ArrowDownToLine,
  ArrowUpFromLine,
  PackageMinus,
  HeartPulse,
  Activity,
  Wallet,
} from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "首页总览 — 奇点智牧" },
      { name: "description", content: "运营驾驶舱：核心指标、待处理申请与待办" },
    ],
  }),
  component: HomePage,
});

const kpis = [
  { label: "发病率", value: "4.8", unit: "%", trend: "down", delta: "-0.6 %", icon: Stethoscope, anchor: "alerts" as const, good: true },
  { label: "治愈率", value: "92.3", unit: "%", trend: "up", delta: "+1.4 %", icon: HeartPulse, anchor: "alerts" as const, good: true },
  { label: "死淘率", value: "1.6", unit: "%", trend: "down", delta: "-0.3 %", icon: Activity, anchor: "stock" as const, good: true },
  { label: "总药费", value: "18.6", unit: "万元", trend: "up", delta: "+6.9 %", icon: Wallet, anchor: "warehouse" as const, good: false },
];


type WorkOrderType = "disease" | "vaccine" | "deworm" | "hoof" | "postpartum" | "drying" | "general";
type PendingRequest = {
  id: string;
  type: WorkOrderType;
  target: string;
  targetKind: "cattle" | "barn" | "batch";
  applicant: string;
  applicantRole: string;
  time: string;
  symptoms: string[];
  detail: string;
};

const workOrderTypeMeta: Record<WorkOrderType, { label: string; tone: "warning" | "danger" | "info" | "success" | "muted" }> = {
  disease: { label: "疾病诊疗", tone: "danger" },
  vaccine: { label: "免疫接种", tone: "info" },
  deworm: { label: "驱虫", tone: "warning" },
  hoof: { label: "修蹄", tone: "muted" },
  postpartum: { label: "产后护理", tone: "success" },
  drying: { label: "干奶", tone: "info" },
  general: { label: "常规处置", tone: "muted" },
};

const pendingRequests: PendingRequest[] = [
  {
    id: "WO-2381",
    type: "disease",
    target: "#01-24-2381",
    targetKind: "cattle",
    applicant: "李兽医",
    applicantRole: "兽医",
    time: "8 分钟前",
    symptoms: ["高热", "食欲不振", "呼吸急促"],
    detail: "牛只 #01-24-2381 持续 2 小时体温高于 40℃，建议转入隔离区并安排血常规检测，预计耗材：抗生素 1 支、采血管 2 支。",
  },
  {
    id: "WO-2380",
    type: "disease",
    target: "3 号牛舍",
    targetKind: "barn",
    applicant: "王巡检",
    applicantRole: "巡检员",
    time: "32 分钟前",
    symptoms: ["乳房肿胀", "产奶下降"],
    detail: "3 号牛舍 4 头泌乳牛出现疑似乳房炎症状，申请兽医介入并启动抗生素治疗流程。",
  },
  {
    id: "WO-2379",
    type: "vaccine",
    target: "B-免疫批次 0512",
    targetKind: "batch",
    applicant: "赵兽医",
    applicantRole: "兽医",
    time: "1 小时前",
    symptoms: ["发情期"],
    detail: "5 头待免疫牛只目前处于发情期，按规程不宜立即免疫。申请将本批免疫计划由 5/12 顺延至 5/15 执行。",
  },
  {
    id: "WO-2376",
    type: "hoof",
    target: "#01-24-2105",
    targetKind: "cattle",
    applicant: "孙助理",
    applicantRole: "兽医助理",
    time: "今日 09:12",
    symptoms: ["跛行", "蹄底溃疡"],
    detail: "牛只 #01-24-2105 出现明显跛行，蹄部肉眼可见溃疡，申请安排修蹄并外敷消炎药。",
  },
  {
    id: "WO-2374",
    type: "postpartum",
    target: "#01-24-2418",
    targetKind: "cattle",
    applicant: "周饲养",
    applicantRole: "饲养员",
    time: "今日 08:30",
    symptoms: ["产后无力", "体温偏低"],
    detail: "产后母牛 #01-24-2418 站立困难，体温 37.8℃，申请兽医到场评估并补充能量制剂。",
  },
];


type NotifTone = "info" | "success" | "warning" | "danger";
type Notif = {
  icon: typeof Bell;
  title: string;
  desc: string;
  time: string;
  tone: NotifTone;
};

const notifications: Notif[] = [
  { icon: UserPlus, title: "3 位新账户已加入", desc: "李巡检、周饲养、王兽医已完成入职诊断", time: "10 分钟前", tone: "info" },
  { icon: ArrowDownToLine, title: "仓库入库登记", desc: "驱虫剂 120 盒、采血管 500 支已入库", time: "32 分钟前", tone: "success" },
  { icon: ArrowUpFromLine, title: "仓库出库登记", desc: "3 号牛舍领用抗生素 8 支、生理盐水 4 瓶", time: "1 小时前", tone: "info" },
  { icon: PackageMinus, title: "库存变更提醒", desc: "疫苗 A 余量降至安全库存以下（剩 12 支）", time: "今日 09:40", tone: "warning" },
  { icon: PackageMinus, title: "库存盘点差异", desc: "5 号牛舍消毒液盘点差异 -2 桶，待复核", time: "今日 08:55", tone: "danger" },
];

const notifToneColor: Record<NotifTone, string> = {
  info: "var(--effect-ai-cyan)",
  success: "var(--state-success)",
  warning: "var(--state-warning)",
  danger: "var(--state-danger)",
};


function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-[var(--state-success)]" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-[var(--state-danger)]" />;
  return <Minus className="h-3 w-3 text-text-tertiary" />;
}

function HeroStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="text-caption text-white/75">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-section-title tabular-nums text-white drop-shadow-sm">{value}</span>
        {unit && <span className="text-caption text-white/75">{unit}</span>}
      </div>
    </div>
  );
}

const stockComposition = [
  { name: "1 号牛舍", count: 320, color: "var(--brand)" },
  { name: "2 号牛舍", count: 312, color: "var(--effect-ai-cyan)" },
  { name: "3 号牛舍", count: 298, color: "var(--state-warning)" },
  { name: "犊牛舍 A", count: 84, color: "var(--effect-ai-purple)" },
  { name: "隔离区", count: 6, color: "var(--state-danger)" },
  { name: "其他单元", count: 1466, color: "color-mix(in oklab, var(--brand) 30%, var(--bg-surface-subtle))" },
];

const StockCompositionCard = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => {
  const total = stockComposition.reduce((s, x) => s + x.count, 0);
  const radius = 70;
  const inner = 44;
  const cx = 90;
  const cy = 90;
  let acc = 0;
  const arcs = stockComposition.map((seg) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += seg.count;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const xi2 = cx + inner * Math.cos(end);
    const yi2 = cy + inner * Math.sin(end);
    const xi1 = cx + inner * Math.cos(start);
    const yi1 = cy + inner * Math.sin(start);
    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`;
    return { d, color: seg.color, name: seg.name, count: seg.count };
  });

  return (
    <Card ref={ref} className="border-border bg-card scroll-mt-20">
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Beef className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <h3 className="text-card-title text-foreground">存栏构成</h3>
          <span className="tag tag-muted">共 {total.toLocaleString()} 头</span>
        </div>
      </div>
      <div className="px-6 pb-6 flex items-center gap-8 flex-wrap">
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {arcs.map((a, i) => (
              <path key={i} d={a.d} fill={a.color} stroke="var(--bg-surface)" strokeWidth="1.5" />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-caption text-text-tertiary">存栏总数</span>
            <span className="text-section-title tabular-nums text-foreground">{total.toLocaleString()}</span>
            <span className="text-caption text-text-tertiary">头</span>
          </div>
        </div>
        <div className="flex-1 min-w-[240px] grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stockComposition.map((s) => {
            const pct = ((s.count / total) * 100).toFixed(1);
            return (
              <div key={s.name} className="flex items-center gap-2 py-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-body-sm text-foreground flex-1">{s.name}</span>
                <span className="text-body-sm text-text-secondary tabular-nums">{s.count.toLocaleString()}</span>
                <span className="text-caption text-text-tertiary tabular-nums w-12 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

function HomePage() {
  const [activeRequest, setActiveRequest] = useState<PendingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const stockRef = useRef<HTMLDivElement | null>(null);
  const warehouseRef = useRef<HTMLDivElement | null>(null);
  const alertsRef = useRef<HTMLDivElement | null>(null);

  const scrollToAnchor = (anchor?: "stock" | "warehouse" | "alerts") => {
    const el =
      anchor === "stock" ? stockRef.current :
      anchor === "warehouse" ? warehouseRef.current :
      anchor === "alerts" ? alertsRef.current : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  const handleVisit = () => {
    if (!activeRequest) return;
    toast.success(`已通过：${workOrderTypeMeta[activeRequest.type].label} · ${activeRequest.target}`);
    setActiveRequest(null);
    setRejectReason("");
  };
  const handleReject = () => {
    if (!activeRequest) return;
    if (!rejectReason.trim()) {
      toast.error("请填写不通过原因");
      return;
    }
    toast.success(`已驳回：${workOrderTypeMeta[activeRequest.type].label} · ${activeRequest.target}`);
    setActiveRequest(null);
    setRejectReason("");
  };

  return (
    <>
      <AppHeader title="首页总览" breadcrumb={["首页"]} />
      <main className="flex-1 px-6 py-6 space-y-5">
        {/* Hero greeting — 加强视觉冲击 */}
        <Card className="relative border-0 overflow-hidden text-white shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--brand)_70%,transparent)]">
          {/* 背景图 */}
          <img
            src={grasslandHero}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
          />


          <div className="relative p-7 flex items-center justify-between gap-6 flex-wrap">
            <div className="max-w-[640px]">
              <div className="inline-flex items-center gap-2 text-caption text-white/85 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--state-success)] shadow-[0_0_8px_var(--state-success)]" />
                  系统正常
                </span>
                <span>2026/05/12 周二 · 1 号牧场</span>
              </div>
              <h2 className="text-page-title font-medium drop-shadow-sm">
                早上好，场长张磊
              </h2>
              <p className="text-body text-white/85 mt-1.5">
                今日整体运行稳定，<span className="text-white font-medium">4 项</span> 申请待诊断 ·
                <span className="text-white font-medium"> 37 项</span> 待办，请及时处理
              </p>

              {/* Hero 内嵌 KPI 缩略 */}
              <div className="mt-5 flex items-center gap-6 text-white/90">
                <HeroStat label="今日入栏" value="38" unit="头" />
                <span className="h-8 w-px bg-white/25" />
                <HeroStat label="健康预警" value="12" unit="起" />
                <span className="h-8 w-px bg-white/25" />
                <HeroStat label="完成工作" value="86%" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-10 px-4 text-body-sm font-normal bg-white/10 hover:bg-white/20 border-white/25 text-white backdrop-blur-sm">
                待处理申请
              </Button>
              <Button className="h-10 px-4 text-body-sm font-normal bg-white text-primary hover:bg-white/90 shadow-lg">
                今日待办 <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        {/* KPI grid — 简洁卡片样式 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => {
            const tones = [
              "var(--brand)",
              "var(--effect-ai-cyan)",
              "var(--state-danger)",
              "var(--effect-ai-purple)",
            ];
            const tone = tones[i % tones.length];
            const isUp = k.trend === "up";
            const isDown = k.trend === "down";
            const isGood = k.good;
            const chipBg = !isUp && !isDown
              ? "var(--bg-surface-subtle)"
              : isGood
              ? "color-mix(in oklab, var(--state-success) 18%, transparent)"
              : "color-mix(in oklab, var(--state-danger) 14%, transparent)";
            const chipColor = !isUp && !isDown
              ? "var(--text-secondary)"
              : isGood
              ? "#2F7A3A"
              : "#B23A3A";
            return (
              <Card
                key={k.label}
                onClick={k.anchor ? () => scrollToAnchor(k.anchor) : undefined}
                role={k.anchor ? "button" : undefined}
                tabIndex={k.anchor ? 0 : undefined}
                onKeyDown={k.anchor ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); scrollToAnchor(k.anchor); } } : undefined}
                className={`relative border-border bg-card p-5 rounded-2xl shadow-card transition-all ${k.anchor ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-elevated" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-body-sm text-text-tertiary">{k.label}</p>
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `color-mix(in oklab, ${tone} 14%, transparent)`,
                      color: tone,
                    }}
                  >
                    <k.icon className="h-4 w-4" strokeWidth={2} />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="tabular-nums font-semibold leading-none text-foreground" style={{ fontSize: "28px" }}>
                    {k.value}
                  </span>
                  <span className="text-body-sm text-text-tertiary">{k.unit}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-0.5 h-[22px] px-1.5 rounded-md text-caption font-medium tabular-nums"
                    style={{ background: chipBg, color: chipColor }}
                  >
                    <TrendIcon trend={k.trend} />
                    {k.delta}
                  </span>
                  <span className="text-caption text-text-tertiary">较上月</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 本期免疫完成率 — 支持下钻 */}
        <ImmunizationRateCard />



        {/* 待办工作 + 消息提醒 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card ref={alertsRef} className="lg:col-span-2 border-border bg-card scroll-mt-20">
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h3 className="text-card-title text-foreground">待办工作</h3>
                <span className="tag tag-muted">{pendingRequests.length} 条待审工单</span>
              </div>
              <Button variant="ghost" size="sm" className="text-body-sm font-normal text-text-tertiary hover:text-foreground h-8">
                查看全部 <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {pendingRequests.map((r) => {
                const meta = workOrderTypeMeta[r.type];
                const targetIcon = r.targetKind === "cattle" ? "牛只" : r.targetKind === "barn" ? "牛舍" : "批次";
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRequest(r)}
                    className="w-full text-left px-6 py-3.5 hover:bg-surface-subtle transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`tag tag-${meta.tone}`}>{meta.label}</span>
                      <span className="text-body text-foreground font-medium tabular-nums">{r.target}</span>
                      <span className="text-caption text-text-tertiary">· {targetIcon}</span>
                      <span className="ml-auto text-caption text-text-tertiary tabular-nums whitespace-nowrap">{r.time}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-caption text-text-tertiary">
                      <span>工单 {r.id}</span>
                      <span>·</span>
                      <span>{r.applicantRole} {r.applicant}</span>
                    </div>
                    {r.symptoms.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.symptoms.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center h-[22px] px-2 rounded-md text-caption tabular-nums"
                            style={{
                              background: "color-mix(in oklab, var(--state-warning) 12%, transparent)",
                              color: "#A35A00",
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>


          <Card className="border-border bg-card">
            <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h3 className="text-card-title text-foreground">消息提醒</h3>
                <span className="tag tag-muted">{notifications.length} 条</span>
              </div>
              <Button variant="ghost" size="sm" className="text-body-sm font-normal text-text-tertiary hover:text-foreground h-8">
                全部 <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {notifications.map((n, i) => {
                const c = notifToneColor[n.tone];
                return (
                  <div key={i} className="flex items-start gap-3 px-6 py-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `color-mix(in oklab, ${c} 14%, transparent)`, color: c }}
                    >
                      <n.icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-foreground truncate">{n.title}</p>
                      <p className="text-caption text-text-tertiary truncate mt-0.5">{n.desc}</p>
                    </div>
                    <span className="text-caption text-text-tertiary tabular-nums whitespace-nowrap mt-0.5">{n.time}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>


        {/* 存栏构成 */}
        <StockCompositionCard ref={stockRef} />

        {/* 仓库物资概览 */}
        <Card ref={warehouseRef} className="border-border bg-card scroll-mt-20">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <h3 className="text-card-title text-foreground">仓库物资概览</h3>
              <span className="tag tag-muted">共 186 类</span>
            </div>
            <Link to="/warehouse">
              <Button variant="ghost" size="sm" className="text-body-sm font-normal text-text-tertiary hover:text-foreground h-8">
                进入库存管理 <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </Link>
          </div>
          <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "物资正常", count: 158, total: 186, tone: "success", dot: "bg-[var(--state-success)]" },
              { label: "物资临期", count: 18, total: 186, tone: "warning", dot: "bg-[var(--state-warning)]" },
              { label: "余量紧张", count: 10, total: 186, tone: "danger", dot: "bg-[var(--state-danger)]" },
            ].map((s) => {
              const pct = Math.round((s.count / s.total) * 100);
              return (
                <div key={s.label} className="rounded-md border border-border p-4 bg-surface-subtle">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    <span className="text-body-sm text-text-secondary">{s.label}</span>
                    <span className="ml-auto text-caption text-text-tertiary tabular-nums">占比 {pct}%</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-page-title tabular-nums text-foreground">{s.count}</span>
                    <span className="text-caption text-text-tertiary">类 / {s.total}</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-card overflow-hidden">
                    <div
                      className={`h-full ${
                        s.tone === "success" ? "bg-[var(--state-success)]" :
                        s.tone === "warning" ? "bg-[var(--state-warning)]" :
                        "bg-[var(--state-danger)]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>

      <Dialog
        open={!!activeRequest}
        onOpenChange={(open) => {
          if (!open) {
            setActiveRequest(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          {activeRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`tag tag-${workOrderTypeMeta[activeRequest.type].tone}`}>
                    {workOrderTypeMeta[activeRequest.type].label}
                  </span>
                  <span className="text-caption text-text-tertiary tabular-nums">{activeRequest.id}</span>
                </div>
                <DialogTitle className="text-card-title">
                  {workOrderTypeMeta[activeRequest.type].label} · {activeRequest.target}
                </DialogTitle>
                <DialogDescription className="text-body-sm text-text-secondary">
                  提出者 {activeRequest.applicantRole} {activeRequest.applicant} · {activeRequest.time}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-1">
                {activeRequest.symptoms.length > 0 && (
                  <div>
                    <p className="text-caption text-text-tertiary mb-1.5">症状标签</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeRequest.symptoms.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center h-[24px] px-2 rounded-md text-caption"
                          style={{
                            background: "color-mix(in oklab, var(--state-warning) 12%, transparent)",
                            color: "#A35A00",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-md bg-surface-subtle border border-border p-3">
                  <p className="text-caption text-text-tertiary mb-1">申请详情</p>
                  <p className="text-body-sm text-foreground leading-relaxed">{activeRequest.detail}</p>
                </div>

                <div>
                  <label className="text-caption text-text-tertiary">不通过原因（驳回时必填）</label>
                  <Textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="如需驳回，请简要说明原因…"
                    className="mt-1.5 min-h-[72px] text-body-sm"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" className="h-9 text-body-sm font-normal" onClick={handleReject}>
                  不通过
                </Button>
                <Button
                  className="h-9 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
                  onClick={handleVisit}
                >
                  通过
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
