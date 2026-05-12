import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, Plus, ArrowRight, ClipboardList, Check, X } from "lucide-react";

export const Route = createFileRoute("/warehouse/transfer")({
  head: () => ({ meta: [{ title: "调拨申请 — 奇点智牧" }] }),
  component: TransferPage,
});

type Req = {
  id: string;
  workOrder: string;
  workOrderType: string;
  workOrderDesc: string;
  item: string;
  qty: string;
  from: string;
  to: string;
  applicant: string;
  time: string;
  status: Status;
};

type Status = "待审核" | "执行中" | "已驳回" | "已完成";

const requests: Req[] = [
  { id: "TR-2026-0142", workOrder: "WO-2026-0581", workOrderType: "疾病治疗", workOrderDesc: "3 号牛舍 #A2381 乳房炎复诊处置", item: "乳房炎抗生素 5mg", qty: "20 盒", from: "1 号库", to: "2 号库", applicant: "李雨晴", time: "今日 10:24", status: "待审核" },
  { id: "TR-2026-0141", workOrder: "WO-2026-0577", workOrderType: "免疫", workOrderDesc: "1 号牧场 5 月口蹄疫加强免疫", item: "免疫疫苗 A 型", qty: "60 支", from: "中央库", to: "1 号库", applicant: "周凯", time: "今日 09:08", status: "执行中" },
  { id: "TR-2026-0140", workOrder: "WO-2026-0570", workOrderType: "驱虫", workOrderDesc: "3 号牛舍季度体内驱虫批次", item: "广谱驱虫药", qty: "15 盒", from: "中央库", to: "3 号库", applicant: "刘倩", time: "昨日 16:42", status: "已完成" },
  { id: "TR-2026-0139", workOrder: "WO-2026-0563", workOrderType: "修蹄", workOrderDesc: "1 号牛舍 8 头牛集中修蹄", item: "修蹄耗材包", qty: "8 套", from: "1 号库", to: "现场", applicant: "王建国", time: "昨日 11:30", status: "已驳回" },
];

const statusTag: Record<Status, string> = {
  "待审核": "tag tag-warning",
  "执行中": "tag tag-brand",
  "已驳回": "tag tag-danger",
  "已完成": "tag tag-success",
};

function TransferPage() {
  const [tab, setTab] = useState<Status | "全部">("全部");
  const [detail, setDetail] = useState<Req | null>(null);

  const counts: Record<Status | "全部", number> = {
    "全部": requests.length,
    "待审核": requests.filter((r) => r.status === "待审核").length,
    "执行中": requests.filter((r) => r.status === "执行中").length,
    "已驳回": requests.filter((r) => r.status === "已驳回").length,
    "已完成": requests.filter((r) => r.status === "已完成").length,
  };
  const list = tab === "全部" ? requests : requests.filter((r) => r.status === tab);

  return (
    <>
      <AppHeader title="调拨申请" breadcrumb={["仓库管理", "调拨申请"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 rounded-md bg-surface-subtle p-1">
            {(["全部", "待审核", "审核通过", "已驳回", "已完成"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={`h-7 px-3 rounded text-body-sm transition-colors ${
                  tab === s ? "bg-card text-foreground shadow-sm" : "text-text-secondary hover:text-foreground"
                }`}
              >
                {s} <span className="text-text-tertiary tabular-nums">{counts[s]}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="按工单号 / 物资搜索" className="h-9 w-72 pl-9 text-body-sm bg-card border-border" />
            </div>
            <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> 新建调拨
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">调拨单号</div>
            <div className="col-span-2">关联工单</div>
            <div className="col-span-3">物资 · 数量</div>
            <div className="col-span-2">流向</div>
            <div className="col-span-1">申请人 / 时间</div>
            <div className="col-span-1 text-right">状态</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {list.map((r) => (
            <div key={r.id} className="grid grid-cols-12 gap-3 px-6 h-14 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
              <div className="col-span-2 font-mono text-body-sm text-foreground">{r.id}</div>
              <div className="col-span-2 leading-tight">
                <div className="flex items-center gap-1 text-body-sm text-primary">
                  <ClipboardList className="h-3 w-3" />
                  {r.workOrder}
                </div>
                <div className="text-caption text-text-tertiary">{r.workOrderType}</div>
              </div>
              <div className="col-span-3 leading-tight">
                <div className="text-body text-foreground">{r.item}</div>
                <div className="text-caption text-text-tertiary tabular-nums">{r.qty}</div>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 text-body-sm text-text-secondary">
                <span>{r.from}</span>
                <ArrowRight className="h-3 w-3 text-text-tertiary" />
                <span>{r.to}</span>
              </div>
              <div className="col-span-1 leading-tight min-w-0">
                <div className="text-body-sm text-foreground truncate">{r.applicant}</div>
                <div className="text-caption text-text-tertiary truncate">{r.time}</div>
              </div>
              <div className="col-span-1 flex justify-end">
                <span className={statusTag[r.status]}>{r.status}</span>
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary"
                  onClick={() => setDetail(r)}
                >
                  查看
                </Button>
              </div>
            </div>
          ))}
        </Card>
      </main>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-section-title">调拨申请详情</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-body-sm text-foreground">{detail.id}</span>
                <span className={statusTag[detail.status]}>{detail.status}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border p-4 bg-surface-subtle">
                <Field label="物资名称" value={detail.item} />
                <Field label="数量" value={detail.qty} />
                <Field label="调拨流向" value={`${detail.from} → ${detail.to}`} />
                <Field label="申请人" value={detail.applicant} />
                <Field label="申请日期" value={detail.time} />
              </div>

              <div className="rounded-md border border-border p-4 space-y-2">
                <div className="flex items-center gap-2 text-body-sm">
                  <ClipboardList className="h-3.5 w-3.5 text-primary" />
                  <span className="text-text-tertiary">关联工单</span>
                  <span className="font-mono text-foreground">{detail.workOrder}</span>
                  <span className="tag tag-muted">{detail.workOrderType}</span>
                </div>
                <p className="text-body-sm text-text-secondary leading-relaxed">
                  {detail.workOrderDesc}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => setDetail(null)}
            >
              <X className="h-3.5 w-3.5" /> 不通过
            </Button>
            <Button
              className="gap-1.5 bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
              onClick={() => setDetail(null)}
            >
              <Check className="h-3.5 w-3.5" /> 通过
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="leading-tight">
      <div className="text-caption text-text-tertiary">{label}</div>
      <div className="text-body-sm text-foreground mt-0.5">{value}</div>
    </div>
  );
}
