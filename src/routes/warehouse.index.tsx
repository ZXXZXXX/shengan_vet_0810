import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Filter, Plus, ArrowDownToLine, ArrowUpFromLine,
  Package, Pill, Wheat, FlaskConical, TrendingDown, TrendingUp,
  ShoppingCart, FileText, Trash2, MoreHorizontal, Pencil,
  CheckSquare2, Square,
} from "lucide-react";

export const Route = createFileRoute("/warehouse/")({
  head: () => ({ meta: [{ title: "库存管理 — 奇点智牧" }] }),
  component: InventoryPage,
});

const categories = [
  { name: "饲料", value: 4280, unit: "袋", icon: Wheat, trend: -8, outbound: 1240 },
  { name: "兽药", value: 1320, unit: "盒", icon: Pill, trend: 3, outbound: 386 },
  { name: "试剂耗材", value: 860, unit: "件", icon: FlaskConical, trend: 12, outbound: 152 },
  { name: "通用物资", value: 2150, unit: "件", icon: Package, trend: 1, outbound: 408 },
];

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
  const [cart, setCart] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    inventory.forEach((i) => {
      if (i.stock < i.min) init[i.sku] = Math.max(i.min - i.stock, 0);
    });
    return init;
  });
  const [showCart, setShowCart] = useState(false);

  const toggleCart = (item: Item) => {
    setCart((p) => {
      const n = { ...p };
      if (n[item.sku]) delete n[item.sku];
      else n[item.sku] = Math.max(item.min - item.stock, 10);
      return n;
    });
  };
  const removeFromCart = (sku: string) =>
    setCart((p) => {
      const n = { ...p };
      delete n[sku];
      return n;
    });
  const setQty = (sku: string, qty: number) =>
    setCart((p) => ({ ...p, [sku]: Math.max(qty, 1) }));

  const cartItems = inventory.filter((i) => cart[i.sku]);
  const cartCount = cartItems.length;

  return (
    <>
      <AppHeader title="库存管理" breadcrumb={["仓库管理", "库存管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
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
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-caption text-text-tertiary">本月累计出库</span>
                <span className="text-body-sm font-medium tabular-nums text-foreground">
                  {c.outbound.toLocaleString()} <span className="text-caption text-text-tertiary font-normal">{c.unit}</span>
                </span>
              </div>
            </Card>
          ))}
        </div>

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-body-sm font-normal relative"
              onClick={() => setShowCart((s) => !s)}
            >
              <ShoppingCart className="h-3.5 w-3.5" /> 采购清单
              {cartCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-caption text-primary-foreground tabular-nums">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <ArrowDownToLine className="h-3.5 w-3.5" /> 入库
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <ArrowUpFromLine className="h-3.5 w-3.5" /> 出库
            </Button>
            <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> 新增类别
            </Button>
          </div>
        </div>

        {showCart && (
          <Card className="border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-6 h-12 border-b border-border bg-brand-subtle/40">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <span className="text-card-title text-foreground">采购清单</span>
                <span className="text-body-sm text-text-tertiary">共 {cartItems.length} 项</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-body-sm font-normal">
                  <FileText className="h-3.5 w-3.5" /> 导出清单
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
                  生成采购单
                </Button>
              </div>
            </div>
            {cartItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-body-sm text-text-tertiary">
                暂未加入物资,可在下方列表点击采购图标加入。
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-3 px-6 h-10 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
                  <div className="col-span-4">物资</div>
                  <div className="col-span-2">当前库存</div>
                  <div className="col-span-2">安全库存</div>
                  <div className="col-span-2">建议采购</div>
                  <div className="col-span-2 text-right">操作</div>
                </div>
                {cartItems.map((item) => (
                  <div key={item.sku} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0">
                    <div className="col-span-4 leading-tight">
                      <div className="text-body text-foreground">{item.name}</div>
                      <div className="text-caption text-text-tertiary font-mono">{item.sku} · {item.cat}</div>
                    </div>
                    <div className="col-span-2 text-body-sm text-text-secondary tabular-nums">{item.stock} {item.unit}</div>
                    <div className="col-span-2 text-body-sm text-text-secondary tabular-nums">{item.min} {item.unit}</div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={cart[item.sku]}
                        onChange={(e) => setQty(item.sku, Number(e.target.value))}
                        className="h-8 w-24 text-body-sm tabular-nums"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-body-sm text-[var(--state-danger)] hover:text-[var(--state-danger)]"
                        onClick={() => removeFromCart(item.sku)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> 移除
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </Card>
        )}

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-3">物资</div>
            <div className="col-span-2">库存</div>
            <div className="col-span-1">库位</div>
            <div className="col-span-2">效期</div>
            <div className="col-span-2">状态</div>
            <div className="col-span-2 text-right">操作</div>
          </div>
          {inventory.map((item) => {
            const inCart = !!cart[item.sku];
            return (
              <div key={item.sku} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                <div className="col-span-3 leading-tight">
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
                <div className="col-span-1 font-mono text-body-sm text-text-tertiary">{item.loc}</div>
                <div className="col-span-2 text-body-sm text-text-secondary tabular-nums">{item.expiry}</div>
                <div className="col-span-2">
                  <span className={statusTag(item.status)}>{item.status}</span>
                </div>
                <div className="col-span-2 flex justify-end items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleCart(item)}
                    title={inCart ? "已加入采购清单" : "加入采购清单"}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      inCart
                        ? "text-primary bg-brand-subtle hover:bg-brand-subtle/70"
                        : "text-text-tertiary hover:text-primary hover:bg-brand-subtle/60"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
                  </button>
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
                        <ArrowDownToLine className="h-3.5 w-3.5 mr-2" /> 入库
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowUpFromLine className="h-3.5 w-3.5 mr-2" /> 出库
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
            );
          })}
        </Card>
      </main>
    </>
  );
}
