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

export const Route = createFileRoute("/production/health")({
  head: () => ({ meta: [{ title: "健康防护 — 奇点智牧" }] }),
  component: HealthPage,
});

type WorkStatus = "待审核" | "执行中" | "已驳回" | "已完成";
type WorkType = "修蹄" | "干奶" | "疾病治疗" | "免疫" | "驱虫" | "普修";

type WorkOrder = {
  id: string;
  target: string;
  type: WorkType;
  who: string;
  due: string;
  level: "高" | "中" | "低";
  status: WorkStatus;
  desc: string;
  createdAt: string;
};

const orders: WorkOrder[] = [
  { id: "WO-2381", target: "#A2381", type: "疾病治疗", who: "李雨晴", due: "今日 14:00", level: "高", status: "待审核", desc: "3 号牛舍 #A2381 持续高烧 2 小时，需进行抗生素治疗与隔离观察。", createdAt: "2026-05-12 09:08" },
  { id: "WO-2298", target: "#A2298", type: "疾病治疗", who: "李雨晴", due: "今日 16:30", level: "高", status: "执行中", desc: "1 号牛舍 #A2298 乳房炎复诊，按治疗方案完成第二轮处置。", createdAt: "2026-05-11 14:20" },
  { id: "WO-2401", target: "犊牛舍 A", type: "免疫", who: "周凯", due: "明日", level: "中", status: "执行中", desc: "犊牛舍 A 5 月口蹄疫加强免疫，覆盖 84 头犊牛。", createdAt: "2026-05-11 10:00" },
  { id: "WO-2324", target: "#A2324", type: "普修", who: "王建国", due: "今日", level: "中", status: "已驳回", desc: "#A2324 采食量持续下降，需复检并调整饲喂方案。", createdAt: "2026-05-10 18:42" },
  { id: "WO-2150", target: "#A2150", type: "修蹄", who: "孙明", due: "昨日", level: "中", status: "已完成", desc: "1 号牛舍批次修蹄已完成，无异常反馈。", createdAt: "2026-05-09 09:30" },
  { id: "WO-2120", target: "#A2120", type: "干奶", who: "李雨晴", due: "前日", level: "低", status: "已完成", desc: "干奶处置完成，进入干奶舍管理。", createdAt: "2026-05-08 11:15" },
  { id: "WO-2099", target: "1 号牛舍", type: "驱虫", who: "周凯", due: "今日", level: "中", status: "待审核", desc: "1 号牛舍季度体内驱虫批次，需调拨广谱驱虫药 15 盒。", createdAt: "2026-05-12 08:20" },
  { id: "WO-2078", target: "#A2078", type: "免疫", who: "李雨晴", due: "今日", level: "高", status: "已驳回", desc: "#A2078 免疫后体温异常升高，需复查并评估处置方案。", createdAt: "2026-05-11 16:55" },
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

function HealthPage() {
  const [active, setActive] = useState<WorkStatus>("待审核");
  const [detail, setDetail] = useState<WorkOrder | null>(null);
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null);
  const counts = Object.fromEntries(statusList.map((s) => [s.key, orders.filter((o) => o.status === s.key).length])) as Record<WorkStatus, number>;
  const filtered = orders.filter((o) => o.status === active);

  return (
    <>
      <AppHeader title="健康防护" breadcrumb={["生产对象", "健康防护"]} />
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
            <div className="col-span-2">类型</div>
            <div className="col-span-2">负责人</div>
            <div className="col-span-2">截止</div>
            <div className="col-span-1">优先级</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">暂无{active}工单</div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
                <div className="col-span-2 font-mono text-body text-foreground">{t.id}</div>
                <div className="col-span-2 text-body text-foreground">{t.target}</div>
                <div className="col-span-2"><span className="tag tag-muted">{t.type}</span></div>
                <div className="col-span-2 text-body-sm text-text-secondary">{t.who}</div>
                <div className="col-span-2 text-body-sm text-text-tertiary">{t.due}</div>
                <div className="col-span-1">
                  <span className={`tag ${t.level === "高" ? "tag-danger" : t.level === "中" ? "tag-warning" : "tag-muted"}`}>
                    {t.level === "高" ? "高优先" : t.level === "中" ? "中优先" : "低优先"}
                  </span>
                </div>
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
                <Field
                  label="优先级"
                  value={detail.level === "高" ? "高优先" : detail.level === "中" ? "中优先" : "低优先"}
                />
                <Field label="处理对象" value={detail.target} />
                <Field label="负责人" value={detail.who} />
                <Field label="创建时间" value={detail.createdAt} />
                <Field label="截止时间" value={detail.due} />
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
