import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Building2, Plus, Search, MoreHorizontal, Trash2 } from "lucide-react";

export const Route = createFileRoute("/archive/farm")({
  head: () => ({ meta: [{ title: "牛场信息 — 奇点智牧" }] }),
  component: FarmPage,
});

const farms = [
  { id: "F001", name: "1 号牧场", region: "内蒙古·呼伦贝尔", area: "1280 亩", manager: "张磊", stock: 1240, barns: 12, status: "运营中" },
  { id: "F002", name: "2 号牧场", region: "内蒙古·锡林郭勒", area: "960 亩", manager: "李建国", stock: 856, barns: 8, status: "运营中" },
  { id: "F003", name: "3 号牧场", region: "黑龙江·齐齐哈尔", area: "1450 亩", manager: "王志强", stock: 390, barns: 5, status: "筹建中" },
];

function FarmPage() {
  return (
    <>
      <AppHeader title="牛场信息" breadcrumb={["基础档案", "牛场信息"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input placeholder="搜索牛场名称 / 编号" className="h-9 w-72 pl-9 text-body-sm" />
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建牛场
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-6 h-12 text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="grid grid-cols-7 gap-4 flex-1 min-w-0">
              <div>编号</div>
              <div>牛场名称</div>
              <div>所在地区</div>
              <div>面积</div>
              <div>负责人</div>
              <div>存栏 / 牛舍</div>
              <div>状态</div>
            </div>
            <div className="w-[140px] text-right shrink-0">功能</div>
          </div>
          {farms.map((f) => (
            <div key={f.id} className="flex items-center gap-4 px-6 h-12 text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="grid grid-cols-7 gap-4 flex-1 min-w-0">
                <div className="font-mono text-body text-foreground truncate">{f.id}</div>
                <div className="flex items-center gap-2 text-body text-foreground truncate">
                  <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{f.name}</span>
                </div>
                <div className="text-body-sm text-text-secondary truncate">{f.region}</div>
                <div className="text-body-sm text-text-secondary truncate">{f.area}</div>
                <div className="text-body-sm text-text-secondary truncate">{f.manager}</div>
                <div className="text-body-sm text-text-secondary truncate">{f.stock} 头 / {f.barns} 个</div>
                <div className="truncate">
                  <span className={`tag ${f.status === "运营中" ? "tag-success" : "tag-warning"}`}>{f.status}</span>
                </div>
              </div>
              <div className="w-[140px] shrink-0 flex items-center justify-end gap-0.5">
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
