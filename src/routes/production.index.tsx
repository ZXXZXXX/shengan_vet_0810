import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Beef,
  Search,
  Filter,
  Plus,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/production/")({
  head: () => ({
    meta: [
      { title: "对象档案 — 奇点智牧" },
      { name: "description", content: "生产对象档案列表" },
    ],
  }),
  component: ObjectListPage,
});

const animals = [
  { id: "A2381", breed: "荷斯坦", age: "3 岁 4 月", barn: "3 号牛舍", stage: "成母牛", status: "关注", health: 72, milk: 28.4, lastCheck: "2026-05-09", alert: "体温异常" },
  { id: "A2105", breed: "荷斯坦", age: "4 岁 1 月", barn: "1 号牛舍", stage: "成母牛", status: "健康", health: 96, milk: 32.1, lastCheck: "2026-05-10", alert: null },
  { id: "A2456", breed: "西门塔尔", age: "2 岁 9 月", barn: "2 号牛舍", stage: "青年", status: "健康", health: 91, milk: 26.8, lastCheck: "2026-05-11", alert: null },
  { id: "A2298", breed: "荷斯坦", age: "5 岁 2 月", barn: "1 号牛舍", stage: "成母牛", status: "异常", health: 58, milk: 18.2, lastCheck: "2026-05-08", alert: "乳房炎复查" },
  { id: "A2502", breed: "西门塔尔", age: "1 岁 8 月", barn: "犊牛舍 A", stage: "犊牛", status: "健康", health: 94, milk: 0, lastCheck: "2026-05-11", alert: null },
  { id: "A2178", breed: "荷斯坦", age: "3 岁 11 月", barn: "2 号牛舍", stage: "成母牛", status: "健康", health: 89, milk: 30.5, lastCheck: "2026-05-10", alert: null },
  { id: "A2611", breed: "荷斯坦", age: "干奶期 32 天", barn: "干奶舍", stage: "干奶", status: "健康", health: 88, milk: 0, lastCheck: "2026-05-09", alert: null },
  { id: "A2324", breed: "荷斯坦", age: "2 岁 1 月", barn: "2 号牛舍", stage: "青年", status: "关注", health: 76, milk: 0, lastCheck: "2026-05-09", alert: "采食量下降" },
  { id: "A2087", breed: "西门塔尔", age: "6 岁", barn: "1 号牛舍", stage: "成母牛", status: "健康", health: 92, milk: 27.0, lastCheck: "2026-05-11", alert: null },
];

function statusTag(s: string) {
  if (s === "健康") return "tag tag-success";
  if (s === "关注") return "tag tag-warning";
  return "tag tag-danger";
}

function healthBar(h: number) {
  return h > 85
    ? "bg-[var(--state-success)]"
    : h > 70
    ? "bg-[var(--state-warning)]"
    : "bg-[var(--state-danger)]";
}

function ObjectListPage() {
  return (
    <>
      <AppHeader title="对象档案" breadcrumb={["生产对象", "对象档案"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="按编号 / 品种 / 牛舍搜索" className="h-9 w-72 pl-9 text-body-sm bg-card border-border" />
            </div>
            <Button variant="outline" size="sm" className="h-9 text-body-sm font-normal">全部品种</Button>
            <Button variant="outline" size="sm" className="h-9 text-body-sm font-normal">全部阶段</Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <Filter className="h-3.5 w-3.5" /> 高级筛选
            </Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建档案
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">编号</div>
            <div className="col-span-2">品种 / 月龄</div>
            <div className="col-span-1">阶段</div>
            <div className="col-span-2">所在位置</div>
            <div className="col-span-1">状态</div>
            <div className="col-span-2">健康指数</div>
            <div className="col-span-1 text-right">日产奶 (L)</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {animals.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors relative"
            >
              {a.alert && <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[var(--state-danger)]" />}
              <div className="col-span-2 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-brand-subtle flex items-center justify-center">
                  <Beef className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                </div>
                <div className="leading-tight">
                  <div className="font-mono text-body text-foreground">#{a.id}</div>
                  <div className="text-caption text-text-tertiary">{a.barn}</div>
                </div>
              </div>
              <div className="col-span-2 leading-tight">
                <div className="text-body text-foreground">{a.breed}</div>
                <div className="text-caption text-text-tertiary">{a.age}</div>
              </div>
              <div className="col-span-1"><span className="tag tag-muted">{a.stage}</span></div>
              <div className="col-span-2 text-body-sm text-text-secondary">
                {a.alert ? (
                  <span className="inline-flex items-center gap-1 text-[var(--state-danger)]">
                    <AlertCircle className="h-3 w-3" /> {a.alert}
                  </span>
                ) : (
                  <span className="text-text-tertiary">最近巡检 {a.lastCheck}</span>
                )}
              </div>
              <div className="col-span-1"><span className={statusTag(a.status)}>{a.status}</span></div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-body font-medium tabular-nums text-foreground w-7">{a.health}</span>
                <div className="flex-1 h-1 bg-surface-subtle rounded-full overflow-hidden">
                  <div className={`h-full ${healthBar(a.health)}`} style={{ width: `${a.health}%` }} />
                </div>
              </div>
              <div className="col-span-1 text-right tabular-nums text-body text-foreground">
                {a.milk > 0 ? a.milk.toFixed(1) : <span className="text-text-tertiary">—</span>}
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary gap-0.5">
                  详情 <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </Card>

        <div className="flex items-center justify-between text-body-sm text-text-tertiary">
          <span>共 2,486 条 · 当前显示 9 条</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 text-body-sm font-normal">上一页</Button>
            <span className="px-3 text-body-sm">1 / 277</span>
            <Button variant="outline" size="sm" className="h-8 text-body-sm font-normal">下一页</Button>
          </div>
        </div>
      </main>
    </>
  );
}
