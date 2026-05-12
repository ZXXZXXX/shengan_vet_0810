import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Warehouse,
  Search,
  Filter,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  AlertTriangle,
  Package,
  Pill,
  Wheat,
  FlaskConical,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/warehouse")({
  head: () => ({
    meta: [
      { title: "仓库管理 — 奇点智牧" },
      { name: "description", content: "库存档案、出入库与调拨盘点" },
    ],
  }),
  component: WarehousePage,
});

const categories = [
  { name: "饲料", value: 4280, unit: "袋", icon: Wheat, trend: -8 },
  { name: "兽药", value: 1320, unit: "盒", icon: Pill, trend: 3 },
  { name: "试剂耗材", value: 860, unit: "件", icon: FlaskConical, trend: 12 },
  { name: "通用物资", value: 2150, unit: "件", icon: Package, trend: 1 },
];

const inventory = [
  { sku: "FD-0021", name: "泌乳期精饲料", cat: "饲料", stock: 142, min: 200, unit: "袋", loc: "A-01", expiry: "2026-08", status: "库存偏低" },
  { sku: "MD-0108", name: "乳房炎抗生素 5mg", cat: "兽药", stock: 86, min: 50, unit: "盒", loc: "C-12", expiry: "2026-11", status: "正常" },
  { sku: "FD-0015", name: "犊牛代乳粉", cat: "饲料", stock: 28, min: 40, unit: "袋", loc: "A-04", expiry: "2026-07", status: "近效期" },
  { sku: "RG-0042", name: "体温检测试纸", cat: "试剂耗材", stock: 320, min: 100, unit: "盒", loc: "B-08", expiry: "2027-03", status: "正常" },
  { sku: "MD-0214", name: "免疫疫苗 A 型", cat: "兽药", stock: 12, min: 30, unit: "支", loc: "C-02", expiry: "2026-06", status: "库存偏低" },
  { sku: "GN-0073", name: "挤奶杯组配件", cat: "通用物资", stock: 56, min: 20, unit: "件", loc: "D-15", expiry: "—", status: "正常" },
];

const recentOps = [
  { type: "入库", who: "王建国", item: "泌乳期精饲料", qty: "+200 袋", time: "10:42", icon: ArrowDownToLine, tone: "success" },
  { type: "领用", who: "李雨晴", item: "乳房炎抗生素", qty: "-12 盒", time: "09:18", icon: ArrowUpFromLine, tone: "primary" },
  { type: "调拨", who: "周凯", item: "体温检测试纸", qty: "→ 2 号库", time: "昨日", icon: RefreshCw, tone: "primary" },
  { type: "报损", who: "刘倩", item: "犊牛代乳粉", qty: "-3 袋", time: "昨日", icon: AlertTriangle, tone: "danger" },
];

function statusTag(s: string) {
  if (s === "正常") return "tag tag-success";
  if (s === "近效期") return "tag tag-warning";
  return "tag tag-danger";
}

function WarehousePage() {
  return (
    <>
      <AppHeader title="仓库管理" breadcrumb={["首页", "仓库管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Card key={c.name} className="border-border bg-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-md bg-brand-subtle flex items-center justify-center">
                  <c.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                </div>
                <div className={`flex items-center gap-1 text-caption ${
                  c.trend < 0 ? "text-[var(--state-danger)]" : "text-[var(--core-brand)]"
                }`}>
                  {c.trend < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  <span className="tabular-nums">{c.trend > 0 ? "+" : ""}{c.trend}%</span>
                </div>
              </div>
              <div className="text-body-sm text-text-tertiary">{c.name}</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-page-title tabular-nums text-foreground">{c.value.toLocaleString()}</span>
                <span className="text-caption text-text-tertiary">{c.unit}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Tabs defaultValue="all">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b-0 rounded-none">
              {[
                { v: "all", l: "全部库存" },
                { v: "ops", l: "出入库" },
                { v: "transfer", l: "调拨盘点" },
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
              <Input placeholder="按 SKU / 物资名称搜索" className="h-9 w-72 pl-9 text-body-sm bg-card border-border" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <ArrowDownToLine className="h-3.5 w-3.5" /> 入库
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <ArrowUpFromLine className="h-3.5 w-3.5" /> 出库
            </Button>
            <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> 新增物资
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inventory table */}
          <Card className="lg:col-span-2 border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between p-6 pb-4">
              <div className="flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h3 className="text-card-title text-foreground">库存清单</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-body-sm font-normal text-text-tertiary">
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-y border-border bg-surface-subtle">
              <div className="col-span-4">物资</div>
              <div className="col-span-2">库存</div>
              <div className="col-span-2">库位</div>
              <div className="col-span-2">效期</div>
              <div className="col-span-2 text-right">状态</div>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {inventory.map((item) => (
                <div
                  key={item.sku}
                  className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors"
                >
                  <div className="col-span-4 leading-tight">
                    <div className="text-body text-foreground">{item.name}</div>
                    <div className="text-caption text-text-tertiary font-mono">{item.sku} · {item.cat}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-body font-medium tabular-nums ${item.stock < item.min ? "text-[var(--state-danger)]" : "text-foreground"}`}>
                        {item.stock}
                      </span>
                      <span className="text-caption text-text-tertiary">/ {item.min} {item.unit}</span>
                    </div>
                  </div>
                  <div className="col-span-2 font-mono text-body-sm text-text-tertiary">{item.loc}</div>
                  <div className="col-span-2 text-body-sm text-text-secondary tabular-nums">{item.expiry}</div>
                  <div className="col-span-2 flex justify-end">
                    <span className={statusTag(item.status)}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent ops */}
          <Card className="border-border bg-card">
            <div className="p-6 pb-4 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <h3 className="text-card-title text-foreground">最近操作</h3>
            </div>
            <div className="px-6 pb-6 divide-y divide-border">
              {recentOps.map((op, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`h-8 w-8 rounded-md flex items-center justify-center ${
                    op.tone === "success" ? "bg-[var(--state-success)]/15 text-[var(--core-brand)]" :
                    op.tone === "danger" ? "bg-[var(--state-danger)]/10 text-[var(--state-danger)]" :
                    "bg-brand-subtle text-primary"
                  }`}>
                    <op.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-body-sm text-foreground font-medium">{op.type}</span>
                      <span className="text-caption text-text-tertiary">· {op.who}</span>
                    </div>
                    <div className="text-caption text-text-tertiary truncate">{op.item}</div>
                  </div>
                  <div className="text-right leading-tight">
                    <div className="text-body-sm font-mono tabular-nums text-foreground">{op.qty}</div>
                    <div className="text-caption text-text-tertiary">{op.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
