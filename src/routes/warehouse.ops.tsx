import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/warehouse/ops")({
  head: () => ({ meta: [{ title: "出入库 — 奇点智牧" }] }),
  component: OpsPage,
});

const ops = [
  { type: "入库", who: "王建国", item: "泌乳期精饲料", qty: "+200 袋", time: "10:42", icon: ArrowDownToLine, tone: "success" },
  { type: "领用", who: "李雨晴", item: "乳房炎抗生素", qty: "-12 盒", time: "09:18", icon: ArrowUpFromLine, tone: "primary" },
  { type: "调拨", who: "周凯", item: "体温检测试纸", qty: "→ 2 号库", time: "昨日", icon: RefreshCw, tone: "primary" },
  { type: "报损", who: "刘倩", item: "犊牛代乳粉", qty: "-3 袋", time: "昨日", icon: AlertTriangle, tone: "danger" },
];

function tagFor(type: string) {
  if (type === "入库") return "tag tag-success";
  if (type === "报损") return "tag tag-danger";
  if (type === "调拨") return "tag tag-brand";
  return "tag tag-muted";
}

function OpsPage() {
  return (
    <>
      <AppHeader title="出入库" breadcrumb={["首页", "仓库管理", "出入库"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
            <ArrowDownToLine className="h-3.5 w-3.5" /> 新增入库
          </Button>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <ArrowUpFromLine className="h-3.5 w-3.5" /> 新增出库
          </Button>
        </div>
        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">类型</div>
            <div className="col-span-3">物资</div>
            <div className="col-span-2">数量</div>
            <div className="col-span-2">操作人</div>
            <div className="col-span-3 text-right">时间</div>
          </div>
          {ops.map((o, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="col-span-2"><span className={tagFor(o.type)}>{o.type}</span></div>
              <div className="col-span-3 text-body text-foreground">{o.item}</div>
              <div className="col-span-2 font-mono tabular-nums text-body text-foreground">{o.qty}</div>
              <div className="col-span-2 text-body-sm text-text-secondary">{o.who}</div>
              <div className="col-span-3 text-right text-body-sm text-text-tertiary">{o.time}</div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
