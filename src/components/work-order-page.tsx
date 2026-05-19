import { useMemo, useState } from "react";
import { usePcRole, setPcRole, canReview, pcRoleLabel, type PcRole } from "@/lib/pc-role";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Settings2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

type WorkStatus = "待审核" | "执行中" | "已驳回" | "已完成";

export type WorkOrder = {
  id: string;
  target: string;
  who?: string;
  event?: string;
  proposer: string;
  status: WorkStatus;
  desc: string;
  createdAt: string;
  reviewer?: string;
  reviewedAt?: string;
  executor?: string;
  executedAt?: string;
};

type ColKey =
  | "id"
  | "target"
  | "desc"
  | "status"
  | "proposer"
  | "proposedAt"
  | "reviewer"
  | "reviewedAt"
  | "executor"
  | "executedAt"
  | "action";

type ColDef = {
  key: ColKey;
  label: string;
  width: number;
  locked?: boolean;
  isTime?: boolean;
};

const ALL_COLS: ColDef[] = [
  { key: "id", label: "工单编号", width: 120, locked: true },
  { key: "target", label: "牛只耳号", width: 110, locked: true },
  { key: "desc", label: "具体描述", width: 280, locked: true },
  { key: "status", label: "当前状态", width: 100 },
  { key: "proposer", label: "提出人", width: 100 },
  { key: "proposedAt", label: "提出时间", width: 160, isTime: true },
  { key: "reviewer", label: "审核人", width: 100 },
  { key: "reviewedAt", label: "审核时间", width: 160, isTime: true },
  { key: "executor", label: "执行人", width: 100 },
  { key: "executedAt", label: "执行时间", width: 160, isTime: true },
  { key: "action", label: "操作", width: 80, locked: true },
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

type DateRange = "all" | "today" | "7d" | "30d";

const dateRanges: { key: DateRange; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "today", label: "今天" },
  { key: "7d", label: "最近 7 天" },
  { key: "30d", label: "最近 30 天" },
];

// 解析 "YYYY-MM-DD HH:mm" / "YYYY-MM-DD" / 任何 Date.parse 可识别格式
function parseTime(s?: string): number {
  if (!s) return 0;
  const norm = s.replace(/\//g, "-").replace(" ", "T");
  const t = Date.parse(norm);
  return Number.isNaN(t) ? 0 : t;
}

function inRange(s: string, range: DateRange): boolean {
  if (range === "all") return true;
  const t = parseTime(s);
  if (!t) return false;
  const now = Date.now();
  const day = 86400000;
  if (range === "today") {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return t >= start && t < start + day;
  }
  if (range === "7d") return now - t <= 7 * day;
  if (range === "30d") return now - t <= 30 * day;
  return true;
}

export function WorkOrderPage({
  title,
  orders,
}: {
  title: string;
  orders: WorkOrder[];
}) {
  const [active, setActive] = useState<WorkStatus>("待审核");
  const [detail, setDetail] = useState<WorkOrder | null>(null);
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null);
  const [keyword, setKeyword] = useState("");
  const [range, setRange] = useState<DateRange>("all");
  const [advOpen, setAdvOpen] = useState(false);
  const [advProposer, setAdvProposer] = useState<string>("all");
  const [advExecutor, setAdvExecutor] = useState<string>("all");
  const [sortKey, setSortKey] = useState<"proposedAt" | "reviewedAt" | "executedAt">("proposedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [visible, setVisible] = useState<Record<ColKey, boolean>>(() =>
    Object.fromEntries(ALL_COLS.map((c) => [c.key, true])) as Record<ColKey, boolean>,
  );

  const counts = Object.fromEntries(
    statusList.map((s) => [s.key, orders.filter((o) => o.status === s.key).length]),
  ) as Record<WorkStatus, number>;

  const proposers = useMemo(
    () => Array.from(new Set(orders.map((o) => o.proposer).filter(Boolean))),
    [orders],
  );
  const executors = useMemo(
    () => Array.from(new Set(orders.map((o) => o.executor ?? o.who ?? "").filter(Boolean))),
    [orders],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const list = orders
      .filter((o) => o.status === active)
      .filter((o) => inRange(o.createdAt, range))
      .filter((o) =>
        kw
          ? [o.id, o.target, o.desc, o.event, o.proposer]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(kw))
          : true,
      )
      .filter((o) => (advProposer === "all" ? true : o.proposer === advProposer))
      .filter((o) =>
        advExecutor === "all" ? true : (o.executor ?? o.who) === advExecutor,
      );

    const key = sortKey;
    return [...list].sort((a, b) => {
      const va =
        key === "proposedAt"
          ? parseTime(a.createdAt)
          : key === "reviewedAt"
            ? parseTime(a.reviewedAt)
            : parseTime(a.executedAt);
      const vb =
        key === "proposedAt"
          ? parseTime(b.createdAt)
          : key === "reviewedAt"
            ? parseTime(b.reviewedAt)
            : parseTime(b.executedAt);
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [orders, active, range, keyword, advProposer, advExecutor, sortKey, sortDir]);

  const cols = ALL_COLS.filter((c) => visible[c.key]);
  const minW = cols.reduce((sum, c) => sum + c.width, 0);

  const toggleSort = (key: "proposedAt" | "reviewedAt" | "executedAt") => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortIcon = (key: ColKey) => {
    if (!["proposedAt", "reviewedAt", "executedAt"].includes(key))
      return null;
    const k = key as "proposedAt" | "reviewedAt" | "executedAt";
    if (sortKey !== k) return <ArrowUpDown className="h-3 w-3 ml-1 inline text-text-tertiary" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 inline text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 inline text-primary" />
    );
  };

  const renderCell = (o: WorkOrder, key: ColKey) => {
    switch (key) {
      case "id":
        return <span className="font-mono text-body text-foreground">{o.id}</span>;
      case "target":
        return <span className="text-body text-foreground">{o.target}</span>;
      case "desc":
        return (
          <span className="text-body-sm text-text-secondary truncate block">
            {o.event ?? o.desc}
          </span>
        );
      case "status":
        return (
          <span className={toneStyles[statusList.find((s) => s.key === o.status)!.tone].tag}>
            {o.status}
          </span>
        );
      case "proposer":
        return <span className="text-body-sm text-text-secondary">{o.proposer}</span>;
      case "proposedAt":
        return <span className="text-body-sm text-text-secondary tabular-nums">{o.createdAt}</span>;
      case "reviewer":
        return <span className="text-body-sm text-text-secondary">{o.reviewer ?? "—"}</span>;
      case "reviewedAt":
        return (
          <span className="text-body-sm text-text-secondary tabular-nums">
            {o.reviewedAt ?? "—"}
          </span>
        );
      case "executor":
        return (
          <span className="text-body-sm text-text-secondary">
            {o.executor ?? o.who ?? "—"}
          </span>
        );
      case "executedAt":
        return (
          <span className="text-body-sm text-text-secondary tabular-nums">
            {o.executedAt ?? "—"}
          </span>
        );
      case "action":
        if (canReview(role) && o.status === "待审核") {
          return (
            <div className="inline-flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary"
                onClick={() => { setDetail(o); setConfirm("approve"); }}
              >
                通过
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-body-sm font-normal text-[var(--state-danger)] hover:bg-[var(--state-danger)]/10 hover:text-[var(--state-danger)]"
                onClick={() => { setDetail(o); setConfirm("reject"); }}
              >
                驳回
              </Button>
            </div>
          );
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary"
            onClick={() => setDetail(o)}
          >
            查看
          </Button>
        );
    }
  };

  return (
    <>
      <AppHeader title={title} breadcrumb={["健康管理", title]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-section-title text-foreground">工单看板</h3>
          <Button
            size="sm"
            className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
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
                className={`text-left transition-all ${isActive ? "ring-2 ring-primary rounded-lg" : ""}`}
              >
                <Card
                  className={`border-border bg-card p-5 flex items-center gap-4 hover:border-primary/40 transition-colors ${isActive ? "border-primary/60" : ""}`}
                >
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
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-card-title text-foreground">{active}工单</h3>
              <p className="text-caption text-text-tertiary mt-0.5">共 {filtered.length} 条</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* 快捷时间筛选 */}
              <div className="flex items-center gap-1 p-0.5 rounded-md border border-border bg-surface-subtle">
                {dateRanges.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setRange(r.key)}
                    className={`h-7 px-3 rounded text-body-sm transition-colors ${
                      range === r.key
                        ? "bg-card text-primary shadow-sm"
                        : "text-text-secondary hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="按工单号 / 耳号 / 描述搜索"
                  className="h-9 w-64 pl-9 text-body-sm bg-card border-border"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-body-sm font-normal"
                onClick={() => setAdvOpen((v) => !v)}
              >
                <Filter className="h-3.5 w-3.5" /> 筛选
              </Button>
              {/* 列设置 */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
                    <Settings2 className="h-3.5 w-3.5" /> 列设置
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                  <div className="text-caption text-text-tertiary px-2 py-1.5">
                    选择展示的字段
                  </div>
                  <div className="space-y-0.5">
                    {ALL_COLS.map((c) => (
                      <label
                        key={c.key}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded text-body-sm ${
                          c.locked ? "opacity-60 cursor-not-allowed" : "hover:bg-surface-subtle cursor-pointer"
                        }`}
                      >
                        <Checkbox
                          checked={visible[c.key]}
                          disabled={c.locked}
                          onCheckedChange={(v) =>
                            setVisible((m) => ({ ...m, [c.key]: !!v }))
                          }
                        />
                        <span className="flex-1">{c.label}</span>
                        {c.locked && (
                          <span className="text-caption text-text-tertiary">必选</span>
                        )}
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 高级筛选面板 */}
          {advOpen && (
            <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <div className="text-caption text-text-tertiary mb-1.5">提出人</div>
                <Select value={advProposer} onValueChange={setAdvProposer}>
                  <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {proposers.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-caption text-text-tertiary mb-1.5">执行人</div>
                <Select value={advExecutor} onValueChange={setAdvExecutor}>
                  <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {executors.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-caption text-text-tertiary mb-1.5">排序字段</div>
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as typeof sortKey)}>
                  <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proposedAt">提出时间</SelectItem>
                    <SelectItem value="reviewedAt">审核时间</SelectItem>
                    <SelectItem value="executedAt">执行时间</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-caption text-text-tertiary mb-1.5">排序方向</div>
                <Select value={sortDir} onValueChange={(v) => setSortDir(v as "asc" | "desc")}>
                  <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">倒序（新 → 旧）</SelectItem>
                    <SelectItem value="asc">正序（旧 → 新）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* 表格（仅在该容器内部横向滚动） */}
          <div className="overflow-x-auto border-t border-border">
            <div style={{ minWidth: minW }}>
              <div className="flex h-12 items-center text-table-header text-text-secondary bg-surface-subtle border-b border-border">
                {cols.map((c, i) => (
                  <div
                    key={c.key}
                    style={{ width: c.width, flexShrink: 0 }}
                    className={`px-3 ${i === 0 ? "pl-6" : ""} ${i === cols.length - 1 ? "pr-6 text-right" : ""}`}
                  >
                    {c.isTime ? (
                      <button
                        onClick={() => toggleSort(c.key as "proposedAt" | "reviewedAt" | "executedAt")}
                        className="inline-flex items-center hover:text-foreground"
                      >
                        {c.label}
                        {sortIcon(c.key)}
                      </button>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </div>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">
                  暂无符合条件的{active}工单
                </div>
              ) : (
                filtered.map((o) => (
                  <div
                    key={o.id}
                    className="flex h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle"
                  >
                    {cols.map((c, i) => (
                      <div
                        key={c.key}
                        style={{ width: c.width, flexShrink: 0 }}
                        className={`px-3 ${i === 0 ? "pl-6" : ""} ${i === cols.length - 1 ? "pr-6 flex items-center justify-end" : ""} truncate`}
                      >
                        {renderCell(o, c.key)}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
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
                <Field label="工单类型" value={title} />
                <Field label="牛只耳号" value={detail.target} />
                <Field label="提出人" value={detail.proposer} />
                <Field label="提出时间" value={detail.createdAt} />
                <Field label="审核人" value={detail.reviewer ?? "—"} />
                <Field label="审核时间" value={detail.reviewedAt ?? "—"} />
                <Field label="执行人" value={detail.executor ?? detail.who ?? "—"} />
                <Field label="执行时间" value={detail.executedAt ?? "—"} />
              </div>

              <div className="rounded-md border border-border p-4">
                <div className="text-caption text-text-tertiary mb-1.5">具体描述</div>
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
              {detail ? `工单 ${detail.id} · ${detail.target}` : ""}
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
