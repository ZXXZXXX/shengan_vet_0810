import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, Plus, Search, Filter, MoreHorizontal, Trash2 } from "lucide-react";

export const Route = createFileRoute("/archive/barn")({
  head: () => ({ meta: [{ title: "牛舍信息 — 奇点智牧" }] }),
  component: BarnPage,
});

const barns: { id: string; name: string; farm: string; type: string; stock: number; desc: string }[] = [
  { id: "B-101", name: "1 号牛舍", farm: "1 号牧场", type: "泌乳牛舍", stock: 320, desc: "高产泌乳牛集中区，配置自动饲喂与卧床" },
  { id: "B-102", name: "2 号牛舍", farm: "1 号牧场", type: "泌乳牛舍", stock: 312, desc: "中产泌乳群，配套挤奶通道" },
  { id: "B-103", name: "3 号牛舍", farm: "1 号牧场", type: "干奶牛舍", stock: 298, desc: "干奶期及围产前期母牛" },
  { id: "B-104", name: "犊牛舍 A", farm: "1 号牧场", type: "犊牛舍", stock: 84, desc: "0-3 月龄犊牛单栏饲养" },
  { id: "B-105", name: "隔离区", farm: "1 号牧场", type: "隔离舍", stock: 6, desc: "新引进及疫病观察隔离" },
  { id: "B-201", name: "1 号牛舍", farm: "2 号牧场", type: "泌乳牛舍", stock: 256, desc: "标准泌乳群，散栏自由采食" },
];

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

        <Card className="border-border bg-card overflow-x-auto">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle min-w-[960px]">
            <div className="col-span-2">编号</div>
            <div className="col-span-2">牛舍名称</div>
            <div className="col-span-2">所属牧场</div>
            <div className="col-span-2">类型</div>
            <div className="col-span-1">存栏只数</div>
            <div className="col-span-2">牛舍描述</div>
            <div className="col-span-1 text-right sticky right-0 bg-surface-subtle border-l border-border -mr-6 pr-6 pl-3">功能</div>
          </div>
          {barns.map((b) => (
            <div key={b.id} className="group/row grid grid-cols-12 gap-3 px-6 h-14 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="col-span-2 font-mono text-body text-foreground">{b.id}</div>
              <div className="col-span-2 flex items-center gap-2 text-body text-foreground"><Home className="h-3.5 w-3.5 text-primary" />{b.name}</div>
              <div className="col-span-2 text-body-sm text-text-secondary">{b.farm}</div>
              <div className="col-span-2"><span className="tag tag-muted">{b.type}</span></div>
              <div className="col-span-1 tabular-nums text-body text-foreground">{b.stock} <span className="text-caption text-text-tertiary">头</span></div>
              <div className="col-span-2 text-body-sm text-text-secondary truncate" title={b.desc}>{b.desc}</div>
              <div className="col-span-1 flex items-center justify-end gap-0.5 sticky right-0 bg-card group-hover/row:bg-surface-subtle border-l border-border -mr-6 pr-6 pl-3">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground">查看</Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary">编辑</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-secondary hover:bg-surface-subtle hover:text-foreground" aria-label="更多">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-28">
                    <DropdownMenuItem className="text-[var(--state-danger)] focus:text-[var(--state-danger)]">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> 删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
