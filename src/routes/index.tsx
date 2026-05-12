import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowUpRight,
  Beef,
  CheckCircle2,
  ClipboardList,
  Droplet,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Activity,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "首页总览 — 智牧 AI 平台" },
      { name: "description", content: "运营驾驶舱：核心指标、异常告警、待办与 AI 建议" },
    ],
  }),
  component: HomePage,
});

const kpis = [
  { label: "存栏总数", value: "2,486", unit: "头", trend: "+1.2%", icon: Beef, tone: "primary" },
  { label: "今日产奶", value: "18,420", unit: "L", trend: "+3.8%", icon: Droplet, tone: "ai" },
  { label: "健康事件", value: "12", unit: "起", trend: "-22%", icon: Stethoscope, tone: "success" },
  { label: "待办任务", value: "37", unit: "项", trend: "+5", icon: ClipboardList, tone: "warning" },
];

const alerts = [
  { level: "高", title: "3 号牛舍体温异常", desc: "牛只 #A2381 持续 2 小时高于阈值", time: "8 分钟前", tone: "destructive" },
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

function HomePage() {
  return (
    <>
      <AppHeader title="首页总览" subtitle="运营驾驶舱 · 1 号牧场" />
      <main className="flex-1 space-y-6 p-6 bg-gradient-mesh">
        {/* Hero strip */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-ai/10 text-ai hover:bg-ai/10 border-0 gap-1">
                  <Sparkles className="h-3 w-3" /> AI 实时分析
                </Badge>
                <Badge variant="outline" className="text-[11px]">2026/05/12 周二</Badge>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">
                早上好，<span className="text-gradient-ai">场长张磊</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                今日整体运行稳定，3 项异常需关注，AI 已预先排序处理优先级
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-9">查看全部告警</Button>
              <Button size="sm" className="h-9 bg-gradient-primary text-primary-foreground border-0 shadow-glow">
                进入今日待办 <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.label} className="relative overflow-hidden border-border/60 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    k.tone === "primary" ? "bg-primary/10 text-primary" :
                    k.tone === "ai" ? "bg-ai/10 text-ai" :
                    k.tone === "success" ? "bg-success/10 text-success" :
                    "bg-warning/15 text-warning-foreground"
                  }`}>
                    <k.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] gap-0.5 font-mono border-border/60">
                    <TrendingUp className="h-2.5 w-2.5" /> {k.trend}
                  </Badge>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold tracking-tight tabular-nums">{k.value}</span>
                  <span className="text-xs text-muted-foreground">{k.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Alerts */}
          <Card className="lg:col-span-2 border-border/60 shadow-soft">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  异常告警
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">按等级与时间排序，AI 自动归类</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-8">
                全部 <ChevronRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((a, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-4 rounded-xl border border-transparent bg-muted/30 p-3 transition-all hover:border-border hover:bg-card hover:shadow-soft"
                >
                  <div className={`flex h-9 w-1 rounded-full ${
                    a.tone === "destructive" ? "bg-destructive" :
                    a.tone === "warning" ? "bg-warning" : "bg-muted-foreground/40"
                  }`} />
                  <Badge variant="outline" className={`h-6 text-[10px] font-medium ${
                    a.tone === "destructive" ? "border-destructive/30 text-destructive bg-destructive/5" :
                    a.tone === "warning" ? "border-warning/40 text-warning-foreground bg-warning/10" :
                    "text-muted-foreground"
                  }`}>
                    {a.level}级
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{a.desc}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">{a.time}</span>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs">
                    指派
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI insights */}
          <Card className="border-border/60 shadow-soft relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-ai" />
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ai" />
                AI 智能建议
              </CardTitle>
              <p className="text-xs text-muted-foreground">基于近 7 日数据生成</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiInsights.map((ins, i) => (
                <div key={i} className="rounded-xl border border-border/60 p-3 hover:border-ai/30 hover:bg-ai/[0.02] transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-ai/10 text-ai text-[10px] font-mono font-semibold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{ins.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ins.impact}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-ai" style={{ width: `${ins.confidence}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{ins.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 border-border/60 shadow-soft">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                待办事项
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-8">查看全部</Button>
            </CardHeader>
            <CardContent className="divide-y divide-border/60">
              {todos.map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card">
                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      负责人 · {t.owner}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] tabular-nums">{t.due}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                生产单元状态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { name: "1 号牛舍", status: "正常", count: 320, tone: "success" },
                { name: "2 号牛舍", status: "正常", count: 312, tone: "success" },
                { name: "3 号牛舍", status: "关注", count: 298, tone: "warning" },
                { name: "犊牛舍 A", status: "正常", count: 84, tone: "success" },
                { name: "隔离区", status: "处理中", count: 6, tone: "destructive" },
              ].map((u) => (
                <div key={u.name} className="flex items-center gap-3 text-sm">
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    u.tone === "success" ? "bg-success" :
                    u.tone === "warning" ? "bg-warning" : "bg-destructive"
                  }`} />
                  <span className="flex-1 font-medium">{u.name}</span>
                  <span className="text-muted-foreground tabular-nums text-xs">{u.count} 头</span>
                  <Badge variant="outline" className="text-[10px] h-5">{u.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
