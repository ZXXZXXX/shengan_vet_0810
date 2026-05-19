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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ClipboardList,
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Check,
  X,
} from "lucide-react";

export const Route = createFileRoute("/production/postpartum")({
  head: () => ({ meta: [{ title: "产后护理 — 奇点智牧" }] }),
  component: PostpartumPage,
});

type WorkStatus = "待审核" | "执行中" | "已驳回" | "已完成";
type WorkType = "干奶";

type WorkOrder = {
  id: string;
  target: string;
  type: WorkType;
  who: string;
  event: string;
  proposer: string;
  status: WorkStatus;
  desc: string;
  createdAt: string;
};

const orders: WorkOrder[] = [
  { id: "WO-2120", target: "#A2120", type: "干奶", who: "李雨晴", event: "进入干奶期", proposer: "李雨晴", status: "已完成", desc: "干奶处置完成，进入干奶舍管理。", createdAt: "2026-05-08 11:15" },
];

const statusList: { key: WorkStatus; label: string; icon: typeof ClipboardList; tone: string }[] = [
  { key: "待审核", label: "待审核", icon: ClipboardList, tone: "warning" },
  { key: "执行中", label: "执行中", icon: PlayCircle, tone: "info" },
  { key: "已驳回", label: "已驳回", icon: AlertTriangle, tone: "danger" },
  { key: "已完成", label: "已完成", icon: CheckCircle2, tone: "success" },
];

const toneStyles: Record<string, { bg: string; text: string; tag: string }> = {
  warning: { bg: "bg-[var(--state-warning)]/10", text: "text-[var(--state-warning)]", tag: "tag tag-warning" },
  info: { bg: "bg-brand-subtle", text: "text-primary", tag: "tag tag-brand" },
  danger: { bg: "bg-[var(--state-danger)]/10", text: "text-[var(--state-danger)]", tag: "tag tag-danger" },
  success: { bg: "bg-[var(--state-success)]/10", text: "text-[var(--state-success)]", tag: "tag tag-success" },
};

function PostpartumPage() {
  const [active, setActive] = useState<WorkStatus>("待审核");
  const [detail, setDetail] = useState<WorkOrder | null>(null);
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null);
  const counts = Object.fromEntries(statusList.map((s) => [s.key, orders.filter((o) => o.status === s.key).length])) as Record<WorkStatus, number>;
  const filtered = orders.filter((o) => o.status === active);

  return (
    <>
      <AppHeader title="产后护理" breadcrumb={["生产管理", "产后护理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-section-title text-foreground">工单看板</h3>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建工单
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusList.map((s) => {
            const tone = toneStyles[s.tone];
            const isActive = active === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`text-left transition-all ${isActive ? "ring-2 ring-primary" : ""}`}
              >
                <Card className={`border-border bg-card p-5 flex items-center gap-4 hover:border-primary/40 transition-colors ${isActive ? "border-primary/60" : ""}`}>
                  <div className={`h-10 w-10 rounded-md flex items-center justify-center ${tone.bg}`}>
                    <s.icon className={`h-4 w-4 ${tone.text}`} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-section-title tabular-nums text-foreground">{counts[s.key]}</div>
                    <div className="text-caption text-text-tertiary">{s.label}</div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-card-title text-foreground">{active}工单</h3>
              <p className="text-caption text-text-tertiary mt-0.5">共 {filtered.length} 条</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <Input placeholder="按工单号 / 对象搜索" className="h-9 w-64 pl-9 text-body-sm bg-card border-border" />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
                <Filter className="h-3.5 w-3.5" /> 工单类型
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-y border-border bg-surface-subtle">
            <div className="col-span-2">工单号</div>
            <div className="col-span-2">对象</div>
            <div className="col-span-1">类型</div>
            <div className="col-span-3">提出事件</div>
            <div className="col-span-1">负责人</div>
            <div className="col-span-2">提出者</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">暂无{active}工单</div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
                <div className="col-span-2 font-mono text-body text-foreground">{t.id}</div>
                <div className="col-span-2 text-body text-foreground">{t.target}</div>
                <div className="col-span-1"><span className="tag tag-muted">{t.type}</span></div>
                <div className="col-span-3 text-body-sm text-text-secondary truncate">{t.event}</div>
                <div className="col-span-1 text-body-sm text-text-secondary truncate">{t.who}</div>
                <div className="col-span-2 text-body-sm text-text-secondary truncate">{t.proposer}</div>
                <div className="col-span-1 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary"
                    onClick={() => setDetail(t)}
                  >
                    查看
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>
      </main>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-section-title">工单详情</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-body-sm text-foreground">{detail.id}</span>
                <span className={toneStyles[statusList.find((s) => s.key === detail.status)!.tone].tag}>
                  {detail.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border p-4 bg-surface-subtle">
                <Field label="工单类型" value={detail.type} />
                <Field label="处理对象" value={detail.target} />
                <Field label="提出事件" value={detail.event} />
                <Field label="提出者" value={detail.proposer} />
                <Field label="负责人" value={detail.who} />
                <Field label="创建时间" value={detail.createdAt} />
              </div>

              <div className="rounded-md border border-border p-4">
                <div className="text-caption text-text-tertiary mb-1.5">工单说明</div>
                <p className="text-body-sm text-text-secondary leading-relaxed">{detail.desc}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => setConfirm("reject")}>
              <X className="h-3.5 w-3.5" /> 不通过
            </Button>
            <Button
              className="gap-1.5 bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
              onClick={() => setConfirm("approve")}
            >
              <Check className="h-3.5 w-3.5" /> 通过
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认{confirm === "approve" ? "通过" : "驳回"}该工单？
            </AlertDialogTitle>
            <AlertDialogDescription>
              {detail ? `工单 ${detail.id} · ${detail.target} · ${detail.type}` : ""}
              ，操作后状态将更新,无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirm === "approve"
                  ? "bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
                  : "bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white"
              }
              onClick={() => {
                setConfirm(null);
                setDetail(null);
              }}
            >
              确认{confirm === "approve" ? "通过" : "驳回"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
