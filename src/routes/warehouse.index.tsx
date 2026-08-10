import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Filter, Plus, MoreHorizontal, Pencil, Trash2,
} from "lucide-react";

export const Route = createFileRoute("/warehouse/")({
  head: () => ({ meta: [{ title: "库存管理 — 奇点智牧" }] }),
  component: InventoryPage,
});

type Status = "物资正常" | "物资临期" | "余量紧张";
type Item = {
  sku: string; name: string; cat: string; stock: number; min: number;
  unit: string; loc: string; expiry: string; status: Status;
};

const inventory: Item[] = [
  { sku: "FD-0021", name: "泌乳期精饲料", cat: "饲料", stock: 142, min: 200, unit: "袋", loc: "A-01", expiry: "2026-08", status: "余量紧张" },
  { sku: "MD-0108", name: "乳房炎抗生素 5mg", cat: "兽药", stock: 86, min: 50, unit: "盒", loc: "C-12", expiry: "2026-11", status: "物资正常" },
  { sku: "FD-0015", name: "犊牛代乳粉", cat: "饲料", stock: 28, min: 40, unit: "袋", loc: "A-04", expiry: "2026-07", status: "物资临期" },
  { sku: "RG-0042", name: "体温检测试纸", cat: "试剂耗材", stock: 320, min: 100, unit: "盒", loc: "B-08", expiry: "2027-03", status: "物资正常" },
  { sku: "MD-0214", name: "免疫疫苗 A 型", cat: "兽药", stock: 12, min: 30, unit: "支", loc: "C-02", expiry: "2026-06", status: "余量紧张" },
  { sku: "GN-0073", name: "挤奶杯组配件", cat: "通用物资", stock: 56, min: 20, unit: "件", loc: "D-15", expiry: "—", status: "物资正常" },
];

function statusTag(s: Status) {
  if (s === "物资正常") return "tag tag-success";
  if (s === "物资临期") return "tag tag-warning";
  return "tag tag-danger";
}

function InventoryPage() {
  return (
    <>
      <AppHeader title="库存管理" breadcrumb={["仓库管理", "库存管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="按 SKU / 物资名称搜索" className="h-9 w-72 pl-9 text-body-sm bg-card border-border" />
            </div>
            <Button variant="outline" size="sm" className="h-9 text-body-sm font-normal">全部分类</Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <Filter className="h-3.5 w-3.5" /> 筛选
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> 新增类别
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-6 h-12 text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="grid grid-cols-5 gap-4 flex-1 min-w-0">
              <div>物资</div>
              <div>库存</div>
              <div>库位</div>
              <div>效期</div>
              <div>状态</div>
            </div>
            <div className="w-[140px] text-right shrink-0">操作</div>
          </div>
          {inventory.map((item) => (
            <div key={item.sku} className="flex items-center gap-4 px-6 h-12 text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
              <div className="grid grid-cols-5 gap-4 flex-1 min-w-0">
                <div className="leading-tight min-w-0">
                  <div className="text-body text-foreground truncate">{item.name}</div>
                  <div className="text-caption text-text-tertiary font-mono truncate">{item.sku} · {item.cat}</div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-body font-medium tabular-nums ${item.stock < item.min ? "text-[var(--state-danger)]" : "text-foreground"}`}>
                      {item.stock}
                    </span>
                    <span className="text-caption text-text-tertiary truncate">/ {item.min} {item.unit}</span>
                  </div>
                </div>
                <div className="font-mono text-body-sm text-text-tertiary truncate">{item.loc}</div>
                <div className="text-body-sm text-text-secondary tabular-nums truncate">{item.expiry}</div>
                <div className="truncate">
                  <span className={statusTag(item.status)}>{item.status}</span>
                </div>
              </div>
              <div className="w-[140px] shrink-0 flex justify-end items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground">查看</Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:text-foreground hover:bg-surface-subtle transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> 编辑信息
                    </DropdownMenuItem>
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
