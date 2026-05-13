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
import {
  Inbox,
  ArrowUpRight,
  Beef,
  ClipboardList,
  Package,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  CheckCircle2,
  Activity,
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
  { label: "存栏总数", value: "2,486", unit: "头", trend: "up", delta: "+1.2%", icon: Beef, anchor: "stock" as const },
  { label: "仓库物资", value: "186", unit: "类", trend: "down", delta: "-3 类临期", icon: Package, anchor: "warehouse" as const },
  { label: "健康异常", value: "12", unit: "起", trend: "down", delta: "-22%", icon: Stethoscope, anchor: "alerts" as const },
  { label: "待办任务", value: "37", unit: "项", trend: "flat", delta: "+5", icon: ClipboardList, anchor: "todos" as const },
];

type RequestType = "transfer" | "health";
type PendingRequest = {
  id: string;
  type: RequestType;
  title: string;
  desc: string;
  applicant: string;
  time: string;
  detail: string;
};

const pendingRequests: PendingRequest[] = [
  {
    id: "REQ-2381",
    type: "health",
    title: "3 号牛舍体温异常处置申请",
    desc: "申请对牛只 #A2381 启动隔离观察并使用抗生素",
    applicant: "李兽医",
    time: "8 分钟前",
    detail: "牛只 #A2381 持续 2 小时体温高于 40℃，建议转入隔离区并安排血常规检测，预计耗材：抗生素 1 支、采血管 2 支。",
  },
  {
    id: "REQ-2380",
    type: "transfer",
    title: "精饲料跨场调拨申请",
    desc: "由 2 号牧场调拨精饲料 3 吨至 1 号牧场",
    applicant: "王仓管",
    time: "32 分钟前",
    detail: "1 号牧场精饲料库余量 12%，预计 24 小时内告罄。申请由 2 号牧场库存中调拨 3 吨,由调度车次 LK-07 承运。",
  },
  {
    id: "REQ-2379",
    type: "health",
    title: "免疫工单延期申请",
    desc: "5 头待免疫牛只因发情期申请延后 3 天",
    applicant: "赵兽医",
    time: "1 小时前",
    detail: "5 头待免疫牛只目前处于发情期，按规程不宜立即免疫。申请将本批免疫计划由 5/12 顺延至 5/15 执行。",
  },
  {
    id: "REQ-2378",
    type: "transfer",
    title: "兽药领用调拨申请",
    desc: "总仓向 5 号牛舍调拨 3 类兽药",
    applicant: "孙库管",
    time: "今日 09:12",
    detail: "5 号牛舍周保养所需消毒液 5 L、驱虫剂 2 盒、营养补充剂 1 箱，请审批后由总仓出库配送。",
  },
];

const requestTypeMeta: Record<RequestType, { label: string; tone: string }> = {
  transfer: { label: "调拨申请", tone: "info" },
  health: { label: "健康防护", tone: "warning" },
};

const todos = [
  { title: "复查疑似乳房炎处理结果", owner: "李兽医", due: "今天 18:00" },
  { title: "审批 8 月饲料采购单", owner: "我", due: "明天" },
  { title: "确认新员工权限范围", owner: "我", due: "明天" },
  { title: "巡检 2 号牛舍水质", owner: "王巡检", due: "本周" },
];

const units = [
  { name: "1 号牛舍", count: 320, status: "正常", tone: "success" },
  { name: "2 号牛舍", count: 312, status: "正常", tone: "success" },
  { name: "3 号牛舍", count: 298, status: "关注", tone: "warning" },
  { name: "犊牛舍 A", count: 84, status: "正常", tone: "success" },
  { name: "隔离区", count: 6, status: "处理中", tone: "danger" },
];

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
  const todosRef = useRef<HTMLDivElement | null>(null);

  const scrollToAnchor = (anchor?: "stock" | "warehouse" | "alerts" | "todos") => {
    const el =
      anchor === "stock" ? stockRef.current :
      anchor === "warehouse" ? warehouseRef.current :
      anchor === "alerts" ? alertsRef.current :
      anchor === "todos" ? todosRef.current : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApprove = () => {
    if (!activeRequest) return;
    toast.success(`已通过：${activeRequest.title}`);
    setActiveRequest(null);
    setRejectReason("");
  };
  const handleReject = () => {
    if (!activeRequest) return;
    if (!rejectReason.trim()) {
      toast.error("请填写不通过原因");
      return;
    }
    toast.success(`已驳回：${activeRequest.title}`);
    setActiveRequest(null);
    setRejectReason("");
  };

  return (
    <>
      <AppHeader title="首页总览" breadcrumb={["首页总览"]} />
      <main className="flex-1 px-6 py-6 space-y-5">
        {/* Hero greeting — 加强视觉冲击 */}
        <Card className="relative border-0 overflow-hidden text-white shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--brand)_70%,transparent)]">
          {/* 背景渐变 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, var(--brand) 0%, color-mix(in oklab, var(--brand) 75%, var(--effect-ai-cyan) 25%) 55%, color-mix(in oklab, var(--effect-ai-purple) 65%, var(--brand) 35%) 100%)",
            }}
          />
          {/* 网格纹理 */}
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.6) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse 70% 80% at 80% 30%, black 30%, transparent 80%)",
            }}
          />
          {/* 光晕 */}
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
          <div className="absolute -bottom-32 left-[20%] h-72 w-72 rounded-full bg-[var(--effect-ai-cyan)]/40 blur-3xl" />

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
                今日整体运行稳定，<span className="text-white font-medium">4 项</span> 申请待审批 ·
                <span className="text-white font-medium"> 37 项</span> 待办，请及时处理
              </p>

              {/* Hero 内嵌 KPI 缩略 */}
              <div className="mt-5 flex items-center gap-6 text-white/90">
                <HeroStat label="今日入栏" value="38" unit="头" />
                <span className="h-8 w-px bg-white/25" />
                <HeroStat label="健康预警" value="12" unit="起" />
                <span className="h-8 w-px bg-white/25" />
                <HeroStat label="完成工单" value="86%" />
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

        {/* KPI grid — 渐变描边 + 大数字 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => {
            const tones = [
              "var(--brand)",
              "var(--effect-ai-cyan)",
              "var(--state-warning)",
              "var(--effect-ai-purple)",
            ];
            const tone = tones[i % tones.length];
            return (
              <Card
                key={k.label}
                onClick={k.anchor ? () => scrollToAnchor(k.anchor) : undefined}
                role={k.anchor ? "button" : undefined}
                tabIndex={k.anchor ? 0 : undefined}
                onKeyDown={k.anchor ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); scrollToAnchor(k.anchor); } } : undefined}
                className={`relative border-border bg-card p-6 overflow-hidden group transition-all ${k.anchor ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_color-mix(in_oklab,var(--brand)_50%,transparent)]" : "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_color-mix(in_oklab,var(--brand)_50%,transparent)]"}`}
              >
                {/* 顶部彩条 */}
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: `linear-gradient(90deg, ${tone}, transparent)` }}
                />
                {/* 角落光晕 */}
                <div
                  className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"
                  style={{ background: `color-mix(in oklab, ${tone} 30%, transparent)` }}
                />
                <div className="relative flex items-start justify-between">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: `color-mix(in oklab, ${tone} 14%, transparent)`,
                      color: tone,
                    }}
                  >
                    <k.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </div>
                  <div className="flex items-center gap-1 text-caption text-text-tertiary">
                    <TrendIcon trend={k.trend} />
                    <span className="tabular-nums">{k.delta}</span>
                  </div>
                </div>
                <div className="relative mt-5">
                  <p className="text-body-sm text-text-tertiary">{k.label}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span
                      className="tabular-nums font-semibold leading-none"
                      style={{ fontSize: "32px", color: tone }}
                    >
                      {k.value}
                    </span>
                    <span className="text-caption text-text-tertiary">{k.unit}</span>
                  </div>
                  <p className="text-caption text-text-tertiary mt-2">较昨日</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Alerts + Units */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card ref={alertsRef} className="lg:col-span-2 border-border bg-card scroll-mt-20">
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h3 className="text-card-title text-foreground">待处理申请</h3>
                <span className="tag tag-muted">{pendingRequests.length} 条</span>
              </div>
              <Button variant="ghost" size="sm" className="text-body-sm font-normal text-text-tertiary hover:text-foreground h-8">
                查看全部 <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {pendingRequests.map((r) => {
                const meta = requestTypeMeta[r.type];
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRequest(r)}
                    className="w-full text-left px-6 py-3.5 flex items-center gap-4 hover:bg-surface-subtle transition-colors"
                  >
                    <span className={`tag ${r.type === "transfer" ? "tag-brand" : "tag-warning"}`}>
                      {meta.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body text-foreground truncate">{r.title}</p>
                      <p className="text-caption text-text-tertiary truncate mt-0.5">
                        提出者 · {r.applicant} · {r.desc}
                      </p>
                    </div>
                    <span className="text-caption text-text-tertiary tabular-nums whitespace-nowrap">{r.time}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="border-border bg-card">
            <div className="p-6 pb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <h3 className="text-card-title text-foreground">生产单元状态</h3>
            </div>
            <div className="px-6 pb-6 space-y-2.5">
              {units.map((u) => (
                <div key={u.name} className="flex items-center gap-3 py-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    u.tone === "success" ? "bg-[var(--state-success)]" :
                    u.tone === "warning" ? "bg-[var(--state-warning)]" :
                    "bg-[var(--state-danger)]"
                  }`} />
                  <span className="flex-1 text-body text-foreground">{u.name}</span>
                  <span className="text-body-sm text-text-tertiary tabular-nums">{u.count} 头</span>
                  <span className={`tag tag-${u.tone === "success" ? "success" : u.tone === "warning" ? "warning" : "danger"}`}>
                    {u.status}
                  </span>
                </div>
              ))}
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

        {/* Todos */}
        <Card className="border-border bg-card">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <h3 className="text-card-title text-foreground">待办事项</h3>
              <span className="tag tag-muted">{todos.length} 项</span>
            </div>
            <Button variant="ghost" size="sm" className="text-body-sm font-normal text-text-tertiary hover:text-foreground h-8">
              查看全部 <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {todos.map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                <div className="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-text-tertiary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body text-foreground">{t.title}</p>
                  <p className="text-caption text-text-tertiary mt-0.5">负责人 · {t.owner}</p>
                </div>
                <span className="tag tag-outline tabular-nums">{t.due}</span>
              </div>
            ))}
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
                  <span className={`tag ${activeRequest.type === "transfer" ? "tag-brand" : "tag-warning"}`}>
                    {requestTypeMeta[activeRequest.type].label}
                  </span>
                  <span className="text-caption text-text-tertiary tabular-nums">{activeRequest.id}</span>
                </div>
                <DialogTitle className="text-card-title">{activeRequest.title}</DialogTitle>
                <DialogDescription className="text-body-sm text-text-secondary">
                  提出者 {activeRequest.applicant} · {activeRequest.time}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-1">
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
                  onClick={handleApprove}
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
