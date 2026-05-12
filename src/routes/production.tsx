import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Beef,
  Search,
  Filter,
  Plus,
  Heart,
  Calendar,
  MapPin,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/production")({
  head: () => ({
    meta: [
      { title: "生产对象管理 — 奇点智牧" },
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
  { stage: "犊牛", count: 84 },
  { stage: "育成", count: 312 },
  { stage: "青年", count: 286 },
  { stage: "成母牛", count: 1620 },
  { stage: "干奶", count: 184 },
];

const stageTones = [
  "bg-[var(--effect-ai-cyan)]",
  "bg-[var(--state-success)]",
  "bg-[var(--effect-ai-purple)]",
  "bg-primary",
  "bg-[var(--state-warning)]",
];

const stats = [
  { label: "今日新增档案", value: "12", icon: Plus },
  { label: "健康预警", value: "7", icon: AlertCircle, danger: true },
  { label: "免疫待办", value: "23", icon: Heart },
  { label: "近 30 日产奶", value: "548K L", icon: TrendingUp },
];

function statusBadge(status: string) {
  if (status === "健康") return "bg-[var(--state-success)]/15 text-[var(--core-brand)]";
  if (status === "关注") return "bg-[var(--state-warning)]/30 text-foreground";
  return "bg-[var(--state-danger)]/10 text-[var(--state-danger)]";
}

function ProductionPage() {
  return (
    <>
      <AppHeader title="生产对象管理" breadcrumb={["首页", "生产对象"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        {/* Lifecycle distribution */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Beef className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <span className="text-card-title text-foreground">存栏分布</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-page-title tabular-nums text-foreground">2,486</span>
                <span className="text-body-sm text-text-tertiary">头</span>
              </div>
            </div>
            <span className="tag tag-muted">共 5 阶段</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-surface-subtle">
            {lifecycle.map((l, i) => (
              <div key={l.stage} className={stageTones[i]} style={{ width: `${(l.count / 2486) * 100}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            {lifecycle.map((l, i) => (
              <div key={l.stage} className="flex items-center gap-2.5">
                <div className={`h-2.5 w-2.5 rounded-sm ${stageTones[i]}`} />
                <div>
                  <div className="text-caption text-text-tertiary">{l.stage}</div>
                  <div className="text-body font-medium tabular-nums text-foreground">{l.count.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border bg-card p-5 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-md flex items-center justify-center ${
                s.danger ? "bg-[var(--state-danger)]/10" : "bg-brand-subtle"
              }`}>
                <s.icon className={`h-4 w-4 ${s.danger ? "text-[var(--state-danger)]" : "text-primary"}`} strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-section-title tabular-nums text-foreground">{s.value}</div>
                <div className="text-caption text-text-tertiary">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Tabs defaultValue="all">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b-0 rounded-none">
              {[
                { v: "all", l: "全部对象" },
                { v: "health", l: "健康防护" },
                { v: "lineage", l: "谱系记录" },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="px-0 pb-3 pt-2 rounded-none text-body text-text-secondary data-[state=active]:text-primary data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_var(--brand)] hover:text-foreground"
                >
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="按编号 / 品种 / 牛舍搜索" className="h-9 w-72 pl-9 text-body-sm bg-card border-border" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <Filter className="h-3.5 w-3.5" /> 筛选
            </Button>
            <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> 新建档案
            </Button>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {animals.map((a) => (
            <Card
              key={a.id}
              className="border-border bg-card hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              {a.alert && <div className="absolute top-0 inset-x-0 h-[2px] bg-[var(--state-danger)]" />}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-md bg-brand-subtle flex items-center justify-center">
                      <Beef className="h-5 w-5 text-primary" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="font-mono text-card-title text-foreground">#{a.id}</div>
                      <div className="text-caption text-text-tertiary">{a.breed} · {a.age}</div>
                    </div>
                  </div>
                  <Badge className={`h-6 px-2 text-caption font-normal border-0 rounded ${statusBadge(a.status)}`}>
                    {a.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
                  <MapPin className="h-3 w-3" />
                  {a.barn}
                </div>

                {a.alert && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--state-danger)]/8 border border-[var(--state-danger)]/20 text-[var(--state-danger)] text-body-sm">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{a.alert}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div>
                    <div className="flex items-center gap-1 text-caption text-text-tertiary mb-1">
                      <Activity className="h-3 w-3" /> 健康指数
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-section-title tabular-nums text-foreground">{a.health}</span>
                      <div className="flex-1 h-1 bg-surface-subtle rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            a.health > 85 ? "bg-[var(--state-success)]" :
                            a.health > 70 ? "bg-[var(--state-warning)]" :
                            "bg-[var(--state-danger)]"
                          }`}
                          style={{ width: `${a.health}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-caption text-text-tertiary mb-1">
                      <Calendar className="h-3 w-3" /> 日产奶
                    </div>
                    <div className="text-section-title tabular-nums text-foreground">
                      {a.milk > 0 ? <>{a.milk} <span className="text-body-sm text-text-tertiary font-normal">L</span></> : <span className="text-text-tertiary">—</span>}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-body-sm font-normal justify-between text-text-secondary hover:bg-brand-subtle hover:text-primary"
                >
                  查看完整档案 <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
