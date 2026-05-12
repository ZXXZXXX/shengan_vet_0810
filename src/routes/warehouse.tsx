import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Warehouse,
  Search,
  Filter,
  Plus,
  Sparkles,
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
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/warehouse")({
  head: () => ({
    meta: [
      { title: "仓库管理 — 智牧 AI 平台" },
      { name: "description", content: "库存档案、出入库操作与 AI 预警建议" },
    ],
  }),
  component: WarehousePage,
});

const categories = [
  { name: "饲料", value: 4280, unit: "袋", icon: Wheat, tone: "warning", trend: -8 },
  { name: "兽药", value: 1320, unit: "盒", icon: Pill, tone: "ai", trend: 3 },
  { name: "试剂耗材", value: 860, unit: "件", icon: FlaskConical, tone: "primary", trend: 12 },
  { name: "通用物资", value: 2150, unit: "件", icon: Package, tone: "success", trend: 1 },
];

const inventory = [
  { sku: "FD-0021", name: "泌乳期精饲料", cat: "饲料", stock: 142, min: 200, unit: "袋", loc: "A-01", expiry: "2026-08", status: "低", alert: true },
  { sku: "MD-0108", name: "乳房炎抗生素 5mg", cat: "兽药", stock: 86, min: 50, unit: "盒", loc: "C-12", expiry: "2026-11", status: "正常", alert: false },
  { sku: "FD-0015", name: "犊牛代乳粉", cat: "饲料", stock: 28, min: 40, unit: "袋", loc: "A-04", expiry: "2026-07", status: "近效期", alert: true },
  { sku: "RG-0042", name: "体温检测试纸", cat: "试剂耗材", stock: 320, min: 100, unit: "盒", loc: "B-08", expiry: "2027-03", status: "正常", alert: false },
  { sku: "MD-0214", name: "免疫疫苗 A 型", cat: "兽药", stock: 12, min: 30, unit: "支", loc: "C-02", expiry: "2026-06", status: "低", alert: true },
  { sku: "GN-0073", name: "挤奶杯组配件", cat: "通用物资", stock: 56, min: 20, unit: "件", loc: "D-15", expiry: "—", status: "正常", alert: false },
];

const recentOps = [
  { type: "入库", who: "王建国", item: "泌乳期精饲料", qty: "+200 袋", time: "10:42", icon: ArrowDownToLine, tone: "success" },
  { type: "领用", who: "李雨晴", item: "乳房炎抗生素", qty: "-12 盒", time: "09:18", icon: ArrowUpFromLine, tone: "ai" },
  { type: "调拨", who: "周凯", item: "体温检测试纸", qty: "→ 2 号库", time: "昨日", icon: RefreshCw, tone: "primary" },
  { type: "报损", who: "刘倩", item: "犊牛代乳粉", qty: "-3 袋", time: "昨日", icon: AlertTriangle, tone: "destructive" },
];

function WarehousePage() {
  return (
    <>
      <AppHeader title="仓库管理" subtitle="库存档案 · 出入库操作 · 预警建议" />
      <main className="flex-1 p-6 space-y-5">
        {/* AI alert banner */}
        <div className="relative overflow-hidden rounded-2xl border border-ai/20 bg-gradient-mesh p-5">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-ai flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-ai-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">AI 预警建议</span>
                <Badge className="bg-ai/10 text-ai border-0 text-[10px]">3 项需处理</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                泌乳期精饲料库存预计 4 天内告罄，建议下单 300 袋；免疫疫苗 A 型已低于安全线
              </p>
            </div>
            <Button size="sm" className="bg-gradient-ai border-0 text-ai-foreground shadow-glow gap-1.5">
              查看建议 <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Card key={c.name} className="border-border/60 shadow-soft group hover:shadow-elegant transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                    c.tone === "primary" ? "bg-primary/10 text-primary" :
                    c.tone === "ai" ? "bg-ai/10 text-ai" :
                    c.tone === "success" ? "bg-success/10 text-success" :
                    "bg-warning/15 text-warning-foreground"
                  }`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] gap-0.5 font-mono ${
                    c.trend < 0 ? "text-destructive border-destructive/30" : "text-success border-success/30"
                  }`}>
                    {c.trend < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : <TrendingUp className="h-2.5 w-2.5" />}
                    {c.trend > 0 ? "+" : ""}{c.trend}%
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">{c.name}</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-semibold tabular-nums tracking-tight">{c.value.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{c.unit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Tabs defaultValue="all">
            <TabsList className="bg-muted/50 h-9">
              <TabsTrigger value="all" className="text-xs data-[state=active]:bg-card">全部库存</TabsTrigger>
              <TabsTrigger value="ops" className="text-xs data-[state=active]:bg-card">出入库操作</TabsTrigger>
              <TabsTrigger value="alert" className="text-xs data-[state=active]:bg-card">预警建议</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="按 SKU / 物资名称搜索" className="h-9 w-72 pl-9 text-xs bg-card" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <ArrowDownToLine className="h-3.5 w-3.5" /> 入库
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <ArrowUpFromLine className="h-3.5 w-3.5" /> 出库
            </Button>
            <Button size="sm" className="h-9 gap-1.5 text-xs bg-gradient-primary border-0 shadow-glow">
              <Plus className="h-3.5 w-3.5" /> 新增物资
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Inventory table */}
          <Card className="lg:col-span-2 border-border/60 shadow-soft">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-primary" /> 库存清单
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                <Filter className="h-3 w-3" /> 筛选
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 px-6 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider border-y border-border/60 bg-muted/20">
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
                    className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center text-sm border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-4">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{item.sku} · {item.cat}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-baseline gap-1">
                        <span className={`font-semibold tabular-nums ${item.alert ? "text-destructive" : ""}`}>
                          {item.stock}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/ {item.min} {item.unit}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                          className={item.stock < item.min ? "h-full bg-destructive" : "h-full bg-success"}
                          style={{ width: `${Math.min(100, (item.stock / item.min) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="col-span-2 font-mono text-xs text-muted-foreground">{item.loc}</div>
                    <div className="col-span-2 text-xs text-muted-foreground tabular-nums">{item.expiry}</div>
                    <div className="col-span-2 flex justify-end">
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ${
                          item.status === "正常" ? "border-success/30 text-success bg-success/5" :
                          item.status === "近效期" ? "border-warning/40 text-warning-foreground bg-warning/10" :
                          "border-destructive/30 text-destructive bg-destructive/5"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent ops */}
          <Card className="border-border/60 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" /> 最近操作
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentOps.map((op, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    op.tone === "success" ? "bg-success/10 text-success" :
                    op.tone === "ai" ? "bg-ai/10 text-ai" :
                    op.tone === "primary" ? "bg-primary/10 text-primary" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    <op.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">{op.type}</span>
                      <span className="text-[10px] text-muted-foreground">· {op.who}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{op.item}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono tabular-nums">{op.qty}</div>
                    <div className="text-[10px] text-muted-foreground">{op.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
