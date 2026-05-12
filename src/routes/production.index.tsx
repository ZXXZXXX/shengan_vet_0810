import { useState } from "react";
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
  Star,
  Home,
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

const barns = [
  { name: "1 号牛舍", count: 320 },
  { name: "2 号牛舍", count: 312 },
  { name: "3 号牛舍", count: 298 },
  { name: "犊牛舍 A", count: 84 },
  { name: "干奶舍", count: 56 },
  { name: "隔离区", count: 6 },
];

type Animal = {
  id: string;
  breed: string;
  age: string;
  barn: string;
  stage: string;
  status: string;
  health: number; // 0-5
  lastCheck: string;
  alert: string | null;
};

const animals: Animal[] = [
  { id: "A2381", breed: "荷斯坦", age: "3 岁 4 月", barn: "3 号牛舍", stage: "成母牛", status: "关注", health: 3.6, lastCheck: "2026-05-09", alert: "体温异常" },
  { id: "A2105", breed: "荷斯坦", age: "4 岁 1 月", barn: "1 号牛舍", stage: "成母牛", status: "健康", health: 4.8, lastCheck: "2026-05-10", alert: null },
  { id: "A2456", breed: "西门塔尔", age: "2 岁 9 月", barn: "2 号牛舍", stage: "青年", status: "健康", health: 4.6, lastCheck: "2026-05-11", alert: null },
  { id: "A2298", breed: "荷斯坦", age: "5 岁 2 月", barn: "1 号牛舍", stage: "成母牛", status: "异常", health: 2.9, lastCheck: "2026-05-08", alert: "乳房炎复查" },
  { id: "A2502", breed: "西门塔尔", age: "1 岁 8 月", barn: "犊牛舍 A", stage: "犊牛", status: "健康", health: 4.7, lastCheck: "2026-05-11", alert: null },
  { id: "A2178", breed: "荷斯坦", age: "3 岁 11 月", barn: "2 号牛舍", stage: "成母牛", status: "健康", health: 4.5, lastCheck: "2026-05-10", alert: null },
  { id: "A2611", breed: "荷斯坦", age: "干奶期 32 天", barn: "干奶舍", stage: "干奶", status: "健康", health: 4.4, lastCheck: "2026-05-09", alert: null },
  { id: "A2324", breed: "荷斯坦", age: "2 岁 1 月", barn: "2 号牛舍", stage: "青年", status: "关注", health: 3.8, lastCheck: "2026-05-09", alert: "采食量下降" },
  { id: "A2087", breed: "西门塔尔", age: "6 岁", barn: "1 号牛舍", stage: "成母牛", status: "健康", health: 4.6, lastCheck: "2026-05-11", alert: null },
  { id: "A2733", breed: "荷斯坦", age: "3 岁", barn: "3 号牛舍", stage: "成母牛", status: "健康", health: 4.3, lastCheck: "2026-05-10", alert: null },
];

function statusTag(s: string) {
  if (s === "健康") return "tag tag-success";
  if (s === "关注") return "tag tag-warning";
  return "tag tag-danger";
}

function HealthStars({ score }: { score: number }) {
  const rounded = Math.round(score * 2) / 2;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = i <= Math.floor(rounded);
          const half = !filled && i - 0.5 <= rounded;
          return (
            <span key={i} className="relative inline-flex">
              <Star className="h-3.5 w-3.5 text-border" strokeWidth={1.5} />
              {(filled || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? "100%" : "50%" }}
                >
                  <Star
                    className="h-3.5 w-3.5 text-[var(--state-warning)] fill-[var(--state-warning)]"
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className="text-body-sm tabular-nums text-foreground">{score.toFixed(1)}</span>
    </div>
  );
}

function ObjectListPage() {
  const [activeBarn, setActiveBarn] = useState(barns[0].name);
  const list = animals.filter((a) => a.barn === activeBarn);

  return (
    <>
      <AppHeader title="对象档案" breadcrumb={["生产对象", "对象档案"]} />
      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* 左：牛舍列表 */}
          <Card className="col-span-3 border-border bg-card overflow-hidden h-fit">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <h3 className="text-card-title text-foreground">牛舍</h3>
              <span className="ml-auto tag tag-muted">{barns.length}</span>
            </div>
            <div className="py-2">
              {barns.map((b) => {
                const active = b.name === activeBarn;
                return (
                  <button
                    key={b.name}
                    onClick={() => setActiveBarn(b.name)}
                    className={`relative w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                      active
                        ? "bg-brand-subtle text-primary"
                        : "text-text-secondary hover:bg-[var(--sidebar-hover,var(--bg-surface-subtle))]"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-primary" />
                    )}
                    <span className="text-body flex-1">{b.name}</span>
                    <span className="text-caption text-text-tertiary tabular-nums">{b.count}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* 右：牛只列表 */}
          <div className="col-span-9 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                  <Input
                    placeholder="按编号 / 品种搜索"
                    className="h-9 w-64 pl-9 text-body-sm bg-card border-border"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-9 text-body-sm font-normal">
                  全部品种
                </Button>
                <Button variant="outline" size="sm" className="h-9 text-body-sm font-normal">
                  全部阶段
                </Button>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
                  <Filter className="h-3.5 w-3.5" /> 高级筛选
                </Button>
              </div>
              <Button
                size="sm"
                className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5" /> 新建档案
              </Button>
            </div>

            <Card className="border-border bg-card overflow-hidden">
              <div className="px-6 h-12 flex items-center justify-between border-b border-border bg-surface-subtle">
                <div className="text-body text-foreground">
                  {activeBarn}
                  <span className="ml-2 text-caption text-text-tertiary tabular-nums">
                    共 {list.length} 头
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border">
                <div className="col-span-2">编号</div>
                <div className="col-span-2">品种 / 月龄</div>
                <div className="col-span-2">阶段</div>
                <div className="col-span-2">状态</div>
                <div className="col-span-3">健康指数</div>
                <div className="col-span-1 text-right">操作</div>
              </div>
              {list.length === 0 && (
                <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">
                  当前牛舍暂无档案
                </div>
              )}
              {list.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors relative"
                >
                  {a.alert && (
                    <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[var(--state-danger)]" />
                  )}
                  <div className="col-span-2 flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-brand-subtle flex items-center justify-center">
                      <Beef className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                    </div>
                    <div className="font-mono text-body text-foreground">#{a.id}</div>
                  </div>
                  <div className="col-span-2 leading-tight">
                    <div className="text-body text-foreground">{a.breed}</div>
                    <div className="text-caption text-text-tertiary">{a.age}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="tag tag-muted">{a.stage}</span>
                  </div>
                  <div className="col-span-2">
                    {a.alert ? (
                      <span className="inline-flex items-center gap-1 text-body-sm text-[var(--state-danger)]">
                        <AlertCircle className="h-3 w-3" /> {a.alert}
                      </span>
                    ) : (
                      <span className={statusTag(a.status)}>{a.status}</span>
                    )}
                  </div>
                  <div className="col-span-3">
                    <HealthStars score={a.health} />
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary gap-0.5"
                    >
                      详情 <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
