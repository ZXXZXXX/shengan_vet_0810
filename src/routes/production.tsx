import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Beef,
  Search,
  Filter,
  Plus,
  Sparkles,
  Heart,
  Activity,
  Calendar,
  MapPin,
  TrendingUp,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/production")({
  head: () => ({
    meta: [
      { title: "生产对象管理 — 智牧 AI 平台" },
      { name: "description", content: "生产对象档案、健康防护与谱系记录" },
    ],
  }),
  component: ProductionPage,
});

const animals = [
  { id: "A2381", breed: "荷斯坦", age: "3 岁 4 月", barn: "3 号牛舍", status: "关注", health: 72, milk: 28.4, alert: "体温异常" },
  { id: "A2105", breed: "荷斯坦", age: "4 岁 1 月", barn: "1 号牛舍", status: "健康", health: 96, milk: 32.1, alert: null },
  { id: "A2456", breed: "西门塔尔", age: "2 岁 9 月", barn: "2 号牛舍", status: "健康", health: 91, milk: 26.8, alert: null },
  { id: "A2298", breed: "荷斯坦", age: "5 岁 2 月", barn: "1 号牛舍", status: "治疗中", health: 58, milk: 18.2, alert: "乳房炎复查" },
  { id: "A2502", breed: "西门塔尔", age: "1 岁 8 月", barn: "犊牛舍 A", status: "健康", health: 94, milk: 0, alert: null },
  { id: "A2178", breed: "荷斯坦", age: "3 岁 11 月", barn: "2 号牛舍", status: "健康", health: 89, milk: 30.5, alert: null },
];

const lifecycle = [
  { stage: "犊牛", count: 84, color: "from-sky-400 to-blue-500" },
  { stage: "育成", count: 312, color: "from-emerald-400 to-teal-500" },
  { stage: "青年", count: 286, color: "from-violet-400 to-purple-500" },
  { stage: "成母牛", count: 1620, color: "from-blue-500 to-indigo-600" },
  { stage: "干奶", count: 184, color: "from-amber-400 to-orange-500" },
];

function ProductionPage() {
  return (
    <>
      <AppHeader title="生产对象管理" subtitle="档案信息 · 健康防护 · 谱系记录" />
      <main className="flex-1 p-6 space-y-5">
        {/* Hero with lifecycle */}
        <Card className="border-border/60 shadow-soft overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Beef className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">存栏分布</span>
                </div>
                <div className="text-3xl font-semibold tabular-nums tracking-tight">2,486 <span className="text-sm font-normal text-muted-foreground">头</span></div>
              </div>
              <Badge className="bg-ai/10 text-ai border-0 gap-1.5">
                <Sparkles className="h-3 w-3" /> AI 谱系优化建议 3 条
              </Badge>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              {lifecycle.map((l) => (
                <div
                  key={l.stage}
                  className={`bg-gradient-to-r ${l.color}`}
                  style={{ width: `${(l.count / 2486) * 100}%` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              {lifecycle.map((l) => (
                <div key={l.stage} className="flex items-center gap-2.5">
                  <div className={`h-2.5 w-2.5 rounded-sm bg-gradient-to-br ${l.color}`} />
                  <div>
                    <div className="text-xs text-muted-foreground">{l.stage}</div>
                    <div className="text-sm font-semibold tabular-nums">{l.count.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "今日新增档案", value: "12", icon: Plus, tone: "primary" },
            { label: "健康预警", value: "7", icon: AlertCircle, tone: "destructive" },
            { label: "免疫待办", value: "23", icon: Heart, tone: "ai" },
            { label: "近 30 日产奶", value: "548K L", icon: TrendingUp, tone: "success" },
          ].map((s) => (
            <Card key={s.label} className="border-border/60 shadow-soft">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  s.tone === "primary" ? "bg-primary/10 text-primary" :
                  s.tone === "ai" ? "bg-ai/10 text-ai" :
                  s.tone === "success" ? "bg-success/10 text-success" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-semibold tabular-nums">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Tabs defaultValue="all">
            <TabsList className="bg-muted/50 h-9">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-card">全部对象</TabsTrigger>
              <TabsTrigger value="health" className="text-xs data-[state=active]:bg-card">健康防护</TabsTrigger>
              <TabsTrigger value="lineage" className="text-xs data-[state=active]:bg-card">谱系记录</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="按编号 / 品种 / 牛舍搜索" className="h-9 w-72 pl-9 text-xs bg-card" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5" /> 筛选
            </Button>
            <Button size="sm" className="h-9 gap-1.5 text-xs bg-gradient-primary border-0 shadow-glow">
              <Plus className="h-3.5 w-3.5" /> 新建档案
            </Button>
          </div>
        </div>

        {/* Cards grid — animal cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {animals.map((a) => (
            <Card
              key={a.id}
              className="border-border/60 shadow-soft hover:shadow-elegant hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              {a.alert && (
                <div className="absolute top-0 right-0 left-0 h-0.5 bg-destructive" />
              )}
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <Beef className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-mono font-semibold text-sm">#{a.id}</div>
                      <div className="text-[11px] text-muted-foreground">{a.breed} · {a.age}</div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 ${
                      a.status === "健康" ? "border-success/30 text-success bg-success/5" :
                      a.status === "关注" ? "border-warning/40 text-warning-foreground bg-warning/10" :
                      "border-destructive/30 text-destructive bg-destructive/5"
                    }`}
                  >
                    {a.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {a.barn}
                </div>

                {a.alert && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-destructive/5 border border-destructive/20 text-destructive text-xs">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{a.alert}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      <Activity className="h-2.5 w-2.5" /> 健康指数
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-semibold tabular-nums">{a.health}</span>
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden ml-1">
                        <div
                          className={`h-full ${
                            a.health > 85 ? "bg-success" :
                            a.health > 70 ? "bg-warning" : "bg-destructive"
                          }`}
                          style={{ width: `${a.health}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                      <Calendar className="h-2.5 w-2.5" /> 日产奶
                    </div>
                    <div className="text-lg font-semibold tabular-nums">
                      {a.milk > 0 ? `${a.milk} L` : <span className="text-muted-foreground text-sm">—</span>}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs justify-between group-hover:bg-primary/5 group-hover:text-primary"
                >
                  查看完整档案 <ChevronRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
