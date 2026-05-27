import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Beef, Plus, Search, SlidersHorizontal, MoreHorizontal, Trash2 } from "lucide-react";

export const Route = createFileRoute("/archive/cattle")({
  head: () => ({ meta: [{ title: "牛只信息 — 奇点智牧" }] }),
  component: CattlePage,
});

type Health = "健康" | "观察中" | "治疗中";
const cattle: { id: string; ear: string; breed: string; sex: string; birth: string; farm: string; barn: string; health: Health }[] = [
  { id: "C-2381", ear: "A2381", breed: "荷斯坦", sex: "♀", birth: "2022-03-15", farm: "1 号牧场", barn: "3 号牛舍", health: "治疗中" },
  { id: "C-2380", ear: "A2380", breed: "荷斯坦", sex: "♀", birth: "2021-11-08", farm: "1 号牧场", barn: "1 号牛舍", health: "健康" },
  { id: "C-2379", ear: "A2379", breed: "荷斯坦", sex: "♀", birth: "2023-06-20", farm: "1 号牧场", barn: "犊牛舍 A", health: "健康" },
  { id: "C-2378", ear: "A2378", breed: "西门塔尔", sex: "♂", birth: "2022-09-10", farm: "2 号牧场", barn: "2 号牛舍", health: "观察中" },
  { id: "C-2377", ear: "A2377", breed: "荷斯坦", sex: "♀", birth: "2020-05-12", farm: "1 号牧场", barn: "3 号牛舍", health: "健康" },
];

function healthTag(h: Health) {
  return h === "健康" ? "tag tag-success" : h === "观察中" ? "tag tag-warning" : "tag tag-danger";
}

function CattlePage() {
  return (
    <>
      <AppHeader title="牛只信息" breadcrumb={["基础档案", "牛只信息"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索耳号 / 编号" className="h-9 w-56 pl-9 text-body-sm" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索所属牧场" className="h-9 w-48 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><SlidersHorizontal className="h-3.5 w-3.5" /> 精细筛选</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新增牛只
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">编号</div>
            <div className="col-span-1">耳号</div>
            <div className="col-span-2">品种</div>
            <div className="col-span-1">性别</div>
            <div className="col-span-2">出生日期</div>
            <div className="col-span-1">所属牧场</div>
            <div className="col-span-1">所在牛舍</div>
            <div className="col-span-1">健康</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {cattle.map((c) => (
            <div key={c.id} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="col-span-2 font-mono text-body text-foreground">{c.id}</div>
              <div className="col-span-1 flex items-center gap-1.5 text-body text-foreground"><Beef className="h-3.5 w-3.5 text-primary" />{c.ear}</div>
              <div className="col-span-2 text-body-sm text-text-secondary">{c.breed}</div>
              <div className="col-span-1 text-body-sm text-text-secondary">{c.sex}</div>
              <div className="col-span-2 text-body-sm text-text-secondary tabular-nums">{c.birth}</div>
              <div className="col-span-1 text-body-sm text-text-secondary truncate">{c.farm}</div>
              <div className="col-span-1 text-body-sm text-text-secondary truncate">{c.barn}</div>
              <div className="col-span-1"><span className={healthTag(c.health)}>{c.health}</span></div>
              <div className="col-span-1 flex items-center justify-end gap-0.5">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-danger"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
