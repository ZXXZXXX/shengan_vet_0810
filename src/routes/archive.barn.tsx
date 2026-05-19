import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Plus, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/archive/barn")({
  head: () => ({ meta: [{ title: "牛舍信息 — 奇点智牧" }] }),
  component: BarnPage,
});

type Status = "正常" | "关注" | "处理中";
const barns: { id: string; name: string; farm: string; type: string; capacity: number; current: number; status: Status }[] = [
  { id: "B-101", name: "1 号牛舍", farm: "1 号牧场", type: "泌乳牛舍", capacity: 350, current: 320, status: "正常" },
  { id: "B-102", name: "2 号牛舍", farm: "1 号牧场", type: "泌乳牛舍", capacity: 350, current: 312, status: "正常" },
  { id: "B-103", name: "3 号牛舍", farm: "1 号牧场", type: "干奶牛舍", capacity: 320, current: 298, status: "关注" },
  { id: "B-104", name: "犊牛舍 A", farm: "1 号牧场", type: "犊牛舍", capacity: 100, current: 84, status: "正常" },
  { id: "B-105", name: "隔离区", farm: "1 号牧场", type: "隔离舍", capacity: 20, current: 6, status: "处理中" },
  { id: "B-201", name: "1 号牛舍", farm: "2 号牧场", type: "泌乳牛舍", capacity: 300, current: 256, status: "正常" },
];

function statusTag(s: Status) {
  if (s === "正常") return "tag tag-success";
  if (s === "关注") return "tag tag-warning";
  return "tag tag-danger";
}

function BarnPage() {
  return (
    <>
      <AppHeader title="牛舍信息" breadcrumb={["基础档案", "牛舍信息"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索牛舍名称 / 编号" className="h-9 w-64 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 所属牧场</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建牛舍
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">编号</div>
            <div className="col-span-2">牛舍名称</div>
            <div className="col-span-2">所属牧场</div>
            <div className="col-span-2">类型</div>
            <div className="col-span-2">容量 / 当前</div>
            <div className="col-span-1">状态</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {barns.map((b) => {
            const pct = Math.round((b.current / b.capacity) * 100);
            return (
              <div key={b.id} className="grid grid-cols-12 gap-3 px-6 h-14 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
                <div className="col-span-2 font-mono text-body text-foreground">{b.id}</div>
                <div className="col-span-2 flex items-center gap-2 text-body text-foreground"><Home className="h-3.5 w-3.5 text-primary" />{b.name}</div>
                <div className="col-span-2 text-body-sm text-text-secondary">{b.farm}</div>
                <div className="col-span-2"><span className="tag tag-muted">{b.type}</span></div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-subtle overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-caption tabular-nums text-text-secondary w-16 text-right">{b.current}/{b.capacity}</span>
                  </div>
                </div>
                <div className="col-span-1"><span className={statusTag(b.status)}>{b.status}</span></div>
                <div className="col-span-1 flex items-center justify-end">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary">查看</Button>
                </div>
              </div>
            );
          })}
        </Card>
      </main>
    </>
  );
}
