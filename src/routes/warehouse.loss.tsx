import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, AlertTriangle, FileWarning } from "lucide-react";

export const Route = createFileRoute("/warehouse/loss")({
  head: () => ({ meta: [{ title: "损耗管理 — 奇点智牧" }] }),
  component: LossPage,
});

type Status = "待审核" | "已确认" | "已驳回";
const losses: { id: string; drug: string; qty: string; reason: string; amount: string; reporter: string; status: Status; time: string }[] = [
  { id: "LS-1086", drug: "口蹄疫疫苗 A 型", qty: "8 支", reason: "冷链断电导致失效", amount: "¥ 480", reporter: "孙库管", status: "待审核", time: "2026-05-12 10:18" },
  { id: "LS-1085", drug: "营养补充剂", qty: "2 罐", reason: "运输破损", amount: "¥ 180", reporter: "王仓管", status: "已确认", time: "2026-05-11 15:30" },
  { id: "LS-1084", drug: "消毒液 戊二醛", qty: "5 L", reason: "过期销毁", amount: "¥ 220", reporter: "孙库管", status: "已确认", time: "2026-05-10 09:00" },
  { id: "LS-1083", drug: "乳房炎抗生素", qty: "1 盒", reason: "误开未使用", amount: "¥ 65", reporter: "李雨晴", status: "已驳回", time: "2026-05-09 14:42" },
];

function statusTag(s: Status) {
  if (s === "待审核") return "tag tag-warning";
  if (s === "已确认") return "tag tag-danger";
  return "tag tag-muted";
}

function LossPage() {
  return (
    <>
      <AppHeader title="损耗管理" breadcrumb={["药品管理", "损耗管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-card p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-[var(--state-warning)]/10 flex items-center justify-center">
              <FileWarning className="h-4 w-4 text-[var(--state-warning)]" />
            </div>
            <div>
              <div className="text-section-title tabular-nums text-foreground">3</div>
              <div className="text-caption text-text-tertiary">本月待审损耗</div>
            </div>
          </Card>
          <Card className="border-border bg-card p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-[var(--state-danger)]/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-[var(--state-danger)]" />
            </div>
            <div>
              <div className="text-section-title tabular-nums text-foreground">¥ 1,860</div>
              <div className="text-caption text-text-tertiary">本月已确认损失</div>
            </div>
          </Card>
          <Card className="border-border bg-card p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-md bg-brand-subtle flex items-center justify-center">
              <FileWarning className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-section-title tabular-nums text-foreground">0.6%</div>
              <div className="text-caption text-text-tertiary">月度损耗率</div>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索损耗单号" className="h-9 w-64 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 状态</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 登记损耗
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">单号</div>
            <div className="col-span-3">药品</div>
            <div className="col-span-1">数量</div>
            <div className="col-span-3">原因</div>
            <div className="col-span-1">金额</div>
            <div className="col-span-1">上报人</div>
            <div className="col-span-1 text-right">状态</div>
          </div>
          {losses.map((l) => (
            <div key={l.id} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="col-span-2 font-mono text-body text-foreground">{l.id}</div>
              <div className="col-span-3 text-body text-foreground">{l.drug}</div>
              <div className="col-span-1 text-body-sm tabular-nums text-text-secondary">{l.qty}</div>
              <div className="col-span-3 text-body-sm text-text-secondary truncate">{l.reason}</div>
              <div className="col-span-1 text-body-sm tabular-nums text-text-secondary">{l.amount}</div>
              <div className="col-span-1 text-body-sm text-text-secondary">{l.reporter}</div>
              <div className="col-span-1 flex justify-end"><span className={statusTag(l.status)}>{l.status}</span></div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
