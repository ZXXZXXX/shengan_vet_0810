import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowUpRight,
  Beef,
  ClipboardList,
  Droplet,
  Sparkles,
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
      { name: "description", content: "运营驾驶舱：核心指标、异常告警、待办与 AI 建议" },
    ],
  }),
  component: HomePage,
});

const kpis = [
  { label: "存栏总数", value: "2,486", unit: "头", trend: "up", delta: "+1.2%", icon: Beef },
  { label: "今日产奶", value: "18,420", unit: "L", trend: "up", delta: "+3.8%", icon: Droplet },
  { label: "健康事件", value: "12", unit: "起", trend: "down", delta: "-22%", icon: Stethoscope },
  { label: "待办任务", value: "37", unit: "项", trend: "flat", delta: "+5", icon: ClipboardList },
];

const alerts = [
  { level: "高", title: "3 号牛舍体温异常", desc: "牛只 #A2381 持续 2 小时高于阈值", time: "8 分钟前", tone: "danger" },
  { level: "中", title: "饲料库存接近下限", desc: "精饲料库余量 12%，建议 24h 内补货", time: "32 分钟前", tone: "warning" },
  { level: "中", title: "免疫工单逾期", desc: "5 头待免疫牛只超出计划日期", time: "1 小时前", tone: "warning" },
  { level: "低", title: "5 号挤奶设备需保养", desc: "已运行 320 小时，建议安排维护", time: "今日 09:12", tone: "muted" },
];

const todos = [
  { title: "复查疑似乳房炎处理结果", owner: "李兽医", due: "今天 18:00" },
  { title: "审批 8 月饲料采购单", owner: "我", due: "明天" },
  { title: "确认新员工权限范围", owner: "我", due: "明天" },
  { title: "巡检 2 号牛舍水质", owner: "王巡检", due: "本周" },
];

const aiInsights = [
  { title: "建议优化 3 号牛舍通风", impact: "预计降低发病率 8%", confidence: 92 },
  { title: "调整东区饲料配比", impact: "预计提升产奶 2.4%", confidence: 87 },
  { title: "合并 2 个免疫工单", impact: "节省现场作业 1.5 小时", confidence: 95 },
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

function HomePage() {
  return (
    <>
      <AppHeader title="首页总览" breadcrumb={["首页", "运营驾驶舱"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        {/* AI greeting strip */}
        <Card className="border-border bg-card shadow-card overflow-hidden">
          <div className="p-6 flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-md bg-gradient-ai flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-caption text-text-tertiary">2026/05/12 周二 · 1 号牧场</span>
                </div>
                <h2 className="text-section-title text-foreground">
                  早上好，场长张磊
                </h2>
                <p className="text-body-sm text-text-secondary mt-1">
                  今日整体运行稳定，3 项异常需关注，AI 已预先排序处理优先级
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-9 text-body-sm font-normal">
                查看全部告警
              </Button>
              <Button className="h-9 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
                进入今日待办 <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.label} className="border-border bg-card shadow-card p-6">
              <div className="flex items-start justify-between">
                <div className="h-9 w-9 rounded-md bg-brand-subtle flex items-center justify-center">
                  <k.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                </div>
                <div className="flex items-center gap-1 text-caption text-text-tertiary">
                  <TrendIcon trend={k.trend} />
                  <span className="tabular-nums">{k.delta}</span>
                </div>
              </div>
              <div className="mt-5">
                <p className="text-body-sm text-text-tertiary">{k.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-page-title tabular-nums">{k.value}</span>
                  <span className="text-caption text-text-tertiary">{k.unit}</span>
                </div>
                <p className="text-caption text-text-tertiary mt-1">较昨日</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Alerts */}
          <Card className="lg:col-span-2 border-border bg-card shadow-card">
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--state-danger)]" strokeWidth={1.75} />
                <h3 className="text-card-title text-foreground">异常告警</h3>
                <Badge variant="outline" className="text-caption font-normal border-border text-text-secondary">
                  {alerts.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="text-body-sm font-normal text-text-tertiary hover:text-foreground h-8">
                查看全部 <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
            <div className="divide-y divide-border">
              {alerts.map((a, i) => (
                <div key={i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-surface-subtle transition-colors group">
                  <Badge
                    className={`h-6 px-2 text-caption font-medium border-0 rounded
                      ${a.tone === "danger" ? "bg-[var(--state-danger)]/10 text-[var(--state-danger)]" : ""}
                      ${a.tone === "warning" ? "bg-[var(--state-warning)]/30 text-foreground" : ""}
                      ${a.tone === "muted" ? "bg-surface-subtle text-text-tertiary" : ""}`}
                  >
                    {a.level}级
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-body text-foreground truncate">{a.title}</p>
                    <p className="text-caption text-text-tertiary truncate mt-0.5">{a.desc}</p>
                  </div>
                  <span className="text-caption text-text-tertiary tabular-nums whitespace-nowrap">{a.time}</span>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary">
                    指派
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* AI insights */}
          <Card className="border-border bg-card shadow-card relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-ai" />
            <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[var(--effect-ai-purple)]/10 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-[var(--effect-ai-purple)]" />
                </div>
                <h3 className="text-card-title text-foreground">AI 智能建议</h3>
              </div>
              <Badge className="bg-[var(--effect-ai-purple)]/10 text-[var(--effect-ai-purple)] border-0 text-caption font-normal">
                {aiInsights.length}
              </Badge>
            </div>
            <div className="px-6 pb-6 space-y-3">
              {aiInsights.map((ins, i) => (
                <div key={i} className="rounded-md border border-border p-4 hover:border-[var(--effect-ai-purple)]/40 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded bg-[var(--effect-ai-purple)]/10 text-[var(--effect-ai-purple)] text-caption font-medium">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-foreground font-medium leading-snug">{ins.title}</p>
                      <p className="text-caption text-text-tertiary mt-1">{ins.impact}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="flex-1 h-1 bg-surface-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-ai" style={{ width: `${ins.confidence}%` }} />
                        </div>
                        <span className="text-caption text-text-tertiary tabular-nums">{ins.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-border bg-card shadow-card">
            <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h3 className="text-card-title text-foreground">待办事项</h3>
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
                  <Badge variant="outline" className="text-caption font-normal tabular-nums border-border text-text-secondary">
                    {t.due}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-border bg-card shadow-card">
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
                  <Badge variant="outline" className="text-caption font-normal border-border text-text-secondary">
                    {u.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
