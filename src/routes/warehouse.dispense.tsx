import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, HandCoins } from "lucide-react";

export const Route = createFileRoute("/warehouse/dispense")({
  head: () => ({ meta: [{ title: "取药记录 — 奇点智牧" }] }),
  component: DispensePage,
});

const records = [
  { id: "DP-3201", drug: "乳房炎抗生素 5mg", qty: "2 支", target: "#A2381", operator: "李雨晴", reason: "疾病治疗工单 WO-2381", time: "2026-05-12 09:42" },
  { id: "DP-3200", drug: "口蹄疫疫苗 A 型", qty: "5 ml", target: "B-102 批次", operator: "陈晓东", reason: "疫苗免疫批次", time: "2026-05-12 08:15" },
  { id: "DP-3199", drug: "驱虫剂 伊维菌素", qty: "10 ml", target: "#A2376", operator: "李雨晴", reason: "日常护理-驱虫", time: "2026-05-11 16:38" },
  { id: "DP-3198", drug: "消毒液 戊二醛", qty: "2 L", target: "3 号牛舍", operator: "孙库管", reason: "环境消毒", time: "2026-05-11 14:02" },
  { id: "DP-3197", drug: "营养补充剂", qty: "1 罐", target: "#A2298", operator: "李雨晴", reason: "产后护理", time: "2026-05-11 10:20" },
];

function DispensePage() {
  return (
    <>
      <AppHeader title="取药记录" breadcrumb={["药品管理", "取药记录"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="按记录号 / 药品 / 对象搜索" className="h-9 w-72 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 时间范围</Button>
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Download className="h-3.5 w-3.5" /> 导出</Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">记录号</div>
            <div className="col-span-3">药品</div>
            <div className="col-span-1">数量</div>
            <div className="col-span-2">作用对象</div>
            <div className="col-span-1">取药人</div>
            <div className="col-span-2">关联事由</div>
            <div className="col-span-1 text-right">时间</div>
          </div>
          {records.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="col-span-2 font-mono text-body text-foreground">{r.id}</div>
              <div className="col-span-3 flex items-center gap-1.5 text-body text-foreground"><HandCoins className="h-3.5 w-3.5 text-primary" />{r.drug}</div>
              <div className="col-span-1 text-body-sm tabular-nums text-text-secondary">{r.qty}</div>
              <div className="col-span-2 text-body-sm text-text-secondary">{r.target}</div>
              <div className="col-span-1 text-body-sm text-text-secondary">{r.operator}</div>
              <div className="col-span-2 text-body-sm text-text-secondary truncate">{r.reason}</div>
              <div className="col-span-1 text-body-sm text-text-tertiary tabular-nums text-right">{r.time.split(" ")[1]}</div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
