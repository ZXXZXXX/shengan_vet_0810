import { useEffect, useMemo, useState } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";


import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
  Mic,
  Video,
  FileText,
  Phone,
  MessageSquare,
  Camera,
  PackagePlus,
  Stethoscope,
} from "lucide-react";

type WorkStatus = "待审核" | "待响应" | "执行中" | "已驳回" | "已完成";

export type WorkOrderAttachment = {
  type: "audio" | "video" | "text";
  name: string;
  meta?: string;
};

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
  attachments?: WorkOrderAttachment[];
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
  { key: "id", label: "工作编号", width: 120, locked: true },
  { key: "target", label: "牛只耳号", width: 110, locked: true },
  { key: "desc", label: "具体描述", width: 280, locked: true },
  { key: "status", label: "当前状态", width: 100 },
  { key: "proposer", label: "提出人", width: 100 },
  { key: "proposedAt", label: "提出时间", width: 160, isTime: true },
  { key: "reviewer", label: "审核人", width: 100 },
  { key: "reviewedAt", label: "审核时间", width: 160, isTime: true },
  { key: "executor", label: "响应人", width: 100 },
  { key: "executedAt", label: "响应时间", width: 160, isTime: true },
  { key: "action", label: "功能", width: 140, locked: true },
];

const statusList: { key: WorkStatus; label: string; icon: typeof ClipboardList; tone: string }[] = [
  { key: "待审核", label: "待审核", icon: ClipboardList, tone: "warning" },
  { key: "待响应", label: "待响应", icon: PlayCircle, tone: "pending" },
  { key: "执行中", label: "执行中", icon: PlayCircle, tone: "info" },
  { key: "已驳回", label: "已驳回", icon: AlertTriangle, tone: "danger" },
  { key: "已完成", label: "已完成", icon: CheckCircle2, tone: "success" },
];

const toneStyles: Record<string, { bg: string; text: string; tag: string }> = {
  warning: { bg: "bg-[var(--state-warning)]/10", text: "text-[var(--state-warning)]", tag: "tag tag-warning" },
  pending: { bg: "bg-surface-subtle", text: "text-text-secondary", tag: "tag tag-muted" },
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
  const role = usePcRole();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [active, setActive] = useState<WorkStatus>("待审核");
  const [detail, setDetail] = useState<WorkOrder | null>(null);
  const [mode, setMode] = useState<"view" | "process">("view");
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [editingPlan, setEditingPlan] = useState(false);
  const [draftDiagnosis, setDraftDiagnosis] = useState("");
  const [draftTreatment, setDraftTreatment] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [assignExecutor, setAssignExecutor] = useState<string>("__none__");
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

  // 小程序所选内容作为默认诊断与方案；兽医可在 PC 端编辑覆盖
  const defaultDiagnosis = detail
    ? `${detail.event ?? detail.desc}。结合现场症状（体温升高、采食下降、反刍减少），初步判断为${title}相关问题，建议进一步检查确认。`
    : "";
  const defaultTreatment = detail
    ? `按${title}标准方案处置：抗生素 + 消炎对症治疗 3 天，转入隔离观察，期间每日监测体温、采食与反刍情况。`
    : "";
  useEffect(() => {
    if (detail) {
      setDiagnosis(defaultDiagnosis);
      setTreatment(defaultTreatment);
      setEditingPlan(false);
      setAssignExecutor("__none__");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.id]);

  const openReject = (o: WorkOrder) => {
    setDetail(o);
    setRejectReason("");
    setConfirm("reject");
  };
  const openApprove = (o: WorkOrder) => {
    setDetail(o);
    setAssignExecutor("__none__");
    setConfirm("approve");
  };

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

  const leftFrozenKeys: ColKey[] = ["id", "target"];
  const rightFrozenKeys: ColKey[] = ["action"];
  const middleCols = ALL_COLS.filter(
    (c) =>
      visible[c.key] &&
      !leftFrozenKeys.includes(c.key) &&
      !rightFrozenKeys.includes(c.key),
  );
  const leftCols = ALL_COLS.filter((c) => leftFrozenKeys.includes(c.key));
  const rightCols = ALL_COLS.filter((c) => rightFrozenKeys.includes(c.key));
  const leftWidth = leftCols.reduce((s, c) => s + c.width, 0);
  const rightWidth = rightCols.reduce((s, c) => s + c.width, 0);
  const middleWidth = middleCols.reduce((s, c) => s + c.width, 0);
  const minW = leftWidth + middleWidth + rightWidth;
  const rightOffset = (key: ColKey) => {
    const idx = rightCols.findIndex((c) => c.key === key);
    return rightCols.slice(idx + 1).reduce((s, c) => s + c.width, 0);
  };
  const leftOffset = (key: ColKey) => {
    const idx = leftCols.findIndex((c) => c.key === key);
    return leftCols.slice(0, idx).reduce((s, c) => s + c.width, 0);
  };

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
      case "desc": {
        const text = o.event ?? o.desc;
        const truncated = text.length > 15 ? text.slice(0, 15) + "…" : text;
        if (text.length > 15) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-body-sm text-text-secondary truncate block cursor-default">
                  {truncated}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm">
                {text}
              </TooltipContent>
            </Tooltip>
          );
        }
        return (
          <span className="text-body-sm text-text-secondary truncate block">
            {text}
          </span>
        );
      }
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
            <div className="inline-flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground"
                onClick={() => { setMode("view"); setDetail(o); }}
              >
                查看
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary"
                onClick={() => { setMode("process"); setDetail(o); }}
              >
                处理
              </Button>
            </div>
          );
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground"
            onClick={() => setDetail(o)}
          >
            查看
          </Button>
        );
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <AppHeader title={title} breadcrumb={["健康管理", title]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-section-title text-foreground">工作看板</h3>
          <div className="flex items-center gap-2">
            <Select value={role} onValueChange={(v) => setPcRole(v as PcRole)}>
              <SelectTrigger className="h-9 w-44 text-body-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">{pcRoleLabel.manager}</SelectItem>
                <SelectItem value="vet">{pcRoleLabel.vet}</SelectItem>
                <SelectItem value="assistant">{pcRoleLabel.assistant}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> 新建工作
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statusList.map((s) => {
            const tone = toneStyles[s.tone];
            const isActive = active === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className="text-left transition-all"
              >
                <Card
                  className={`p-5 flex items-center gap-4 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-elevated"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-card"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-md flex items-center justify-center ${
                      isActive ? "bg-white/15" : tone.bg
                    }`}
                  >
                    <s.icon
                      className={`h-4 w-4 ${isActive ? "text-primary-foreground" : tone.text}`}
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-section-title tabular-nums ${
                        isActive ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {counts[s.key]}
                    </div>
                    <div
                      className={`text-caption ${
                        isActive ? "text-primary-foreground/85" : "text-text-tertiary"
                      }`}
                    >
                      {s.label}
                    </div>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

        <Card className="border-border bg-card overflow-hidden">
          {/* 顶部工具栏 */}
          <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="按工作号 / 耳号 / 描述搜索"
                className="h-9 w-64 pl-9 text-body-sm bg-card border-border"
              />
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
                <div className="text-caption text-text-tertiary mb-1.5">响应人</div>
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

          {/* 表格（仅在该容器内部横向滚动，左/右两侧列冻结） */}
          <div className="overflow-x-auto border-t border-border">
            <div style={{ minWidth: minW }} className="relative">
              {/* 表头 */}
              <div className="flex h-12 items-center text-table-header text-text-secondary bg-surface-subtle border-b border-border">
                {/* 左冻结：工作编号、牛只耳号 */}
                {leftCols.map((c, i) => (
                  <div
                    key={c.key}
                    style={{ width: c.width, flexShrink: 0, left: leftOffset(c.key) }}
                    className={`sticky z-20 px-3 bg-surface-subtle ${i === 0 ? "pl-6" : ""} ${i === leftCols.length - 1 ? "border-r border-border" : ""}`}
                  >
                    <span>{c.label}</span>
                  </div>
                ))}
                {/* 中间可滚动 */}
                {middleCols.map((c) => (
                  <div
                    key={c.key}
                    style={{ width: c.width, flexShrink: 0 }}
                    className="px-3"
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
                {/* 右冻结：功能 */}
                {rightCols.map((c, i) => (
                  <div
                    key={c.key}
                    style={{ width: c.width, flexShrink: 0, right: rightOffset(c.key) }}
                    className={`sticky z-20 px-3 bg-surface-subtle ${i === 0 ? "border-l border-border" : ""} ${i === rightCols.length - 1 ? "pr-6" : ""}`}
                  >
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>

              {!mounted ? (
                <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">
                  加载中…
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">
                  暂无符合条件的{active}工作
                </div>
              ) : (
                filtered.map((o) => (
                  <div
                    key={o.id}
                    className="group/row flex h-12 items-center text-table-cell border-b border-border last:border-0"
                  >
                    {leftCols.map((c, i) => (
                      <div
                        key={c.key}
                        style={{ width: c.width, flexShrink: 0, left: leftOffset(c.key) }}
                        className={`sticky z-10 px-3 bg-card group-hover/row:bg-surface-subtle ${i === 0 ? "pl-6" : ""} ${i === leftCols.length - 1 ? "border-r border-border" : ""}`}
                      >
                        {renderCell(o, c.key)}
                      </div>
                    ))}
                    {middleCols.map((c) => (
                      <div
                        key={c.key}
                        style={{ width: c.width, flexShrink: 0 }}
                        className="px-3 truncate group-hover/row:bg-surface-subtle"
                      >
                        {renderCell(o, c.key)}
                      </div>
                    ))}
                    {rightCols.map((c, i) => (
                      <div
                        key={c.key}
                        style={{ width: c.width, flexShrink: 0, right: rightOffset(c.key) }}
                        className={`sticky z-10 px-3 bg-card group-hover/row:bg-surface-subtle ${i === 0 ? "border-l border-border" : ""} ${i === rightCols.length - 1 ? "pr-6" : ""}`}
                      >
                        {renderCell(o, c.key)}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
          {/* 吸底统计 */}
          <div className="sticky bottom-0 z-30 flex h-10 items-center justify-end px-6 border-t border-border bg-card text-caption text-text-tertiary">
            共 {filtered.length} 条
          </div>
        </Card>
      </main>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col gap-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="text-section-title text-left">工作详情</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
          {detail && (() => {
            const isLoss = detail.id.startsWith("LS");
            const symptoms = isLoss ? [] : ["体温升高", "采食下降", "反刍减少"];
            const photos = 2;
            const videos = isLoss ? 1 : 0;
            const voiceSecs = isLoss ? 42 : 28;
            const proposerPhone = "138 0000 0001";
            return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-body-sm text-foreground">{detail.id}</span>
                  <span className="tag tag-muted">{isLoss ? "损耗" : "健康"}</span>
                </div>
                <span className={toneStyles[statusList.find((s) => s.key === detail.status)!.tone].tag}>
                  {detail.status}
                </span>
              </div>

              {/* 字段网格 —— 与小程序保持一致 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border p-4 bg-surface-subtle">
                <Field label="工作类型" value={title} />
                <Field label={isLoss ? "关联牛舍" : "处理对象"} value={detail.target} />
                <Field label="提出事件" value={detail.event ?? "—"} />
                <FieldNode
                  label="提出人"
                  node={
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm text-foreground">{detail.proposer}</span>
                      <a
                        href={`tel:${proposerPhone.replace(/\s/g, "")}`}
                        className="h-5 w-5 rounded-full bg-brand-subtle text-primary inline-flex items-center justify-center"
                      >
                        <Phone className="h-3 w-3" />
                      </a>
                      <button className="h-5 w-5 rounded-full bg-brand-subtle text-primary inline-flex items-center justify-center">
                        <MessageSquare className="h-3 w-3" />
                      </button>
                    </div>
                  }
                />
                <Field label="提出时间" value={detail.createdAt} />
                <Field label="负责人" value={detail.executor ?? detail.who ?? "—"} />
                <Field label="审核人" value={detail.reviewer ?? "—"} />
                <Field label="审核时间" value={detail.reviewedAt ?? "—"} />
                <Field label="响应时间" value={detail.executedAt ?? "—"} />
              </div>

              {/* 症状说明 */}
              {symptoms.length > 0 && (
                <div className="rounded-md border border-border p-4">
                  <div className="text-caption text-text-tertiary mb-2">症状说明（小程序提报）</div>
                  <div className="flex flex-wrap gap-1.5">
                    {symptoms.map((sym) => (
                      <span key={sym} className="tag tag-brand">{sym}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* 损耗补申请 */}
              {isLoss && (
                <div className="rounded-md border border-border p-4">
                  <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1.5">
                    <PackagePlus className="h-3.5 w-3.5 text-primary" /> 补申请物资
                  </div>
                  <div className="flex items-center justify-between text-body-sm text-foreground">
                    <span>口蹄疫疫苗 A 型</span>
                    <span className="font-mono text-text-secondary">× 8 支</span>
                  </div>
                </div>
              )}

              {/* 工作说明 */}
              <div className="rounded-md border border-border p-4">
                <div className="text-caption text-text-tertiary mb-1.5">
                  {isLoss ? "文字备注" : "工作说明"}
                </div>
                <p className="text-body-sm text-text-secondary leading-relaxed">{detail.desc}</p>
              </div>

              {/* 证据材料 */}
              <div className="rounded-md border border-border p-4 space-y-3">
                <div className="text-caption text-text-tertiary">证据材料</div>
                {photos > 0 && (
                  <div>
                    <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
                      <Camera className="h-3 w-3" /> 照片 · {photos} 张
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: photos }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-md bg-gradient-to-br from-surface-subtle to-border border border-border"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {videos > 0 && (
                  <div>
                    <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
                      <Video className="h-3 w-3" /> 视频 · {videos} 段
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {Array.from({ length: videos }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-md bg-gradient-to-br from-surface-subtle to-border border border-border inline-flex items-center justify-center"
                        >
                          <PlayCircle className="h-5 w-5 text-text-tertiary" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {voiceSecs > 0 && (
                  <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-surface-subtle border border-border">
                    <Mic className="h-4 w-4 text-primary" />
                    <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full w-2/3 bg-primary/60" />
                    </div>
                    <span className="font-mono text-caption text-text-secondary">
                      00:{String(voiceSecs).padStart(2, "0")}
                    </span>
                  </div>
                )}
                {detail.attachments && detail.attachments.length > 0 && (
                  <div className="pt-2 border-t border-border space-y-1.5">
                    {detail.attachments.map((a, i) => {
                      const Icon = a.type === "audio" ? Mic : a.type === "video" ? Video : FileText;
                      const tone =
                        a.type === "audio"
                          ? "text-[var(--state-warning)] bg-[var(--state-warning)]/10"
                          : a.type === "video"
                            ? "text-primary bg-brand-subtle"
                            : "text-text-secondary bg-surface-subtle";
                      return (
                        <button
                          key={i}
                          className="w-full flex items-center gap-2 px-3 h-9 rounded-md border border-border hover:bg-surface-subtle text-left"
                        >
                          <span className={`h-6 w-6 rounded-md inline-flex items-center justify-center ${tone}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-body-sm text-foreground flex-1 truncate">{a.name}</span>
                          {a.meta && <span className="text-caption text-text-tertiary">{a.meta}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 兽医诊断与治疗方案 —— 默认只读，审批员可编辑 */}
              {!isLoss && (
                <div className="rounded-md border border-primary/30 bg-brand-subtle/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-body-sm font-medium text-foreground inline-flex items-center gap-1.5">
                      <Stethoscope className="h-4 w-4 text-primary" /> 兽医诊断与治疗方案
                    </div>
                    {canReview(role) && detail.status === "待审核" && !editingPlan && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-body-sm font-normal"
                        onClick={() => {
                          setDraftDiagnosis(diagnosis);
                          setDraftTreatment(treatment);
                          setEditingPlan(true);
                        }}
                      >
                        编辑
                      </Button>
                    )}
                  </div>
                  {editingPlan ? (
                    <>
                      <div>
                        <div className="text-caption text-text-tertiary mb-1.5">诊断结论</div>
                        <Textarea
                          value={draftDiagnosis}
                          onChange={(e) => setDraftDiagnosis(e.target.value)}
                          rows={3}
                          placeholder="请输入兽医诊断结论"
                          className="text-body-sm bg-card resize-none"
                        />
                      </div>
                      <div>
                        <div className="text-caption text-text-tertiary mb-1.5">治疗方案</div>
                        <Textarea
                          value={draftTreatment}
                          onChange={(e) => setDraftTreatment(e.target.value)}
                          rows={4}
                          placeholder="请输入用药、处置、观察要点等"
                          className="text-body-sm bg-card resize-none"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-body-sm font-normal"
                          onClick={() => setEditingPlan(false)}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
                          onClick={() => {
                            setDiagnosis(draftDiagnosis);
                            setTreatment(draftTreatment);
                            setEditingPlan(false);
                          }}
                        >
                          保存修改
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-caption text-text-tertiary mb-1.5">诊断结论</div>
                        <p className="text-body-sm text-foreground leading-relaxed whitespace-pre-wrap">{diagnosis}</p>
                      </div>
                      <div>
                        <div className="text-caption text-text-tertiary mb-1.5">治疗方案</div>
                        <p className="text-body-sm text-foreground leading-relaxed whitespace-pre-wrap">{treatment}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            );
          })()}
          </div>

          {detail && canReview(role) && detail.status === "待审核" && !editingPlan && (
            <SheetFooter className="px-6 py-3 border-t border-border bg-card gap-2">
              <Button variant="outline" className="gap-1.5" onClick={() => { setRejectReason(""); setConfirm("reject"); }}>
                <X className="h-3.5 w-3.5" /> 驳回
              </Button>
              <Button
                className="gap-1.5 bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
                onClick={() => { setAssignExecutor("__none__"); setConfirm("approve"); }}
              >
                <Check className="h-3.5 w-3.5" /> 通过
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* 驳回 —— 需填写理由 */}
      <Dialog
        open={confirm === "reject"}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-section-title">驳回该工作</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-body-sm text-text-secondary">
              {detail ? `工作 ${detail.id} · ${detail.target}` : ""}
            </div>
            <div>
              <div className="text-caption text-text-tertiary mb-1.5">
                驳回理由 <span className="text-[var(--state-danger)]">*</span>
              </div>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="请说明驳回原因，如证据不足、对象错误、重复上报或无需处理等"
                className="text-body-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>取消</Button>
            <Button
              disabled={!rejectReason.trim()}
              className="bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white disabled:opacity-50"
              onClick={() => {
                setConfirm(null);
                setDetail(null);
                setRejectReason("");
              }}
            >
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 通过 —— 二次确认诊疗方案 + 可选指派执行人 */}
      <Dialog
        open={confirm === "approve"}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-section-title">确认诊疗方案无误</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-body-sm text-text-secondary">
              {detail ? `工作 ${detail.id} · ${detail.target}` : ""}
            </div>
            <div className="rounded-md bg-surface-subtle border border-border p-3 space-y-2 max-h-40 overflow-y-auto">
              <div>
                <div className="text-caption text-text-tertiary">诊断结论</div>
                <p className="text-body-sm text-foreground leading-relaxed whitespace-pre-wrap">{diagnosis || "—"}</p>
              </div>
              <div>
                <div className="text-caption text-text-tertiary">治疗方案</div>
                <p className="text-body-sm text-foreground leading-relaxed whitespace-pre-wrap">{treatment || "—"}</p>
              </div>
            </div>
            <div>
              <div className="text-caption text-text-tertiary mb-1.5">
                指派执行人 <span className="text-text-tertiary">（非必选）</span>
              </div>
              <Select value={assignExecutor} onValueChange={setAssignExecutor}>
                <SelectTrigger className="h-9 text-body-sm">
                  <SelectValue placeholder="不指定，进入待响应池" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">不指定（进入待响应池）</SelectItem>
                  {executorsPool.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-caption text-text-tertiary mt-1.5">
                {assignExecutor === "__none__"
                  ? "未指定执行人时，工作将进入对应权限账号的待响应池，由首位响应者承接。"
                  : `提交后将直接派发至 ${assignExecutor}。`}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>取消</Button>
            <Button
              className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
              onClick={() => {
                setConfirm(null);
                setDetail(null);
              }}
            >
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

function FieldNode({ label, node }: { label: string; node: React.ReactNode }) {
  return (
    <div className="leading-tight">
      <div className="text-caption text-text-tertiary">{label}</div>
      <div className="mt-0.5">{node}</div>
    </div>
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

// ============== 工作 mock 数据生成器 ==============
const proposersPool = ["陈晓东", "李雨晴", "周凯", "李娜", "张伟", "孙明", "王建国", "赵璐"];
const reviewersPool = ["王建国", "李雨晴", "孙明"];
const executorsPool = ["李雨晴", "周凯", "孙明", "王建国", "李娜"];

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function fmt(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

/**
 * 生成 15 条 mock 工作：
 * - 状态按 [待审核, 执行中, 已完成, 已驳回] 循环
 * - 提出时间从今天起向前递推（覆盖今天 / 7天 / 30天 / 更早）
 * - 工作编号 = 类型拼音首字母 + 月日 + 当日该类下序号（两位数字）
 */
export function makeOrders(
  prefix: string,
  events: { target: string; event: string; desc: string }[],
): WorkOrder[] {
  const statuses: WorkStatus[] = ["待审核", "待响应", "执行中", "已完成", "已驳回"];
  const now = new Date();
  // 提出时间间隔（小时）：覆盖今天 / 7天 / 30天 / 更早
  const offsetsH = [2, 6, 20, 30, 52, 76, 100, 140, 200, 280, 360, 480, 600, 720, 840];
  // 按"日期"统计当日该类工作的序号
  const dailySeq = new Map<string, number>();
  // 注意：按提出时间倒序生成时，需保证同一日内的序号按时间先后稳定
  // 先按时间升序计算 seq，再返回原顺序
  const items = offsetsH.map((h, i) => ({
    i,
    proposedAt: new Date(now.getTime() - h * 3600 * 1000),
  }));
  const seqMap = new Map<number, string>();
  [...items]
    .sort((a, b) => a.proposedAt.getTime() - b.proposedAt.getTime())
    .forEach(({ i, proposedAt }) => {
      const mmdd = `${pad(proposedAt.getMonth() + 1)}${pad(proposedAt.getDate())}`;
      const seq = (dailySeq.get(mmdd) ?? 0) + 1;
      dailySeq.set(mmdd, seq);
      seqMap.set(i, `${prefix}${mmdd}${pad(seq)}`);
    });

  return items.map(({ i, proposedAt }) => {
    const ev = pick(events, i);
    const status = statuses[i % statuses.length];
    const reviewedAt = new Date(proposedAt.getTime() + 60 * 60 * 1000);
    const executedAt = new Date(proposedAt.getTime() + 8 * 60 * 60 * 1000);
    const proposer = pick(proposersPool, i);
    const reviewer = pick(reviewersPool, i);
    const executor = pick(executorsPool, i);
    // 媒体附件：每条工作按索引轮换三种媒体组合，保证演示多样性
    const attachmentSets: WorkOrderAttachment[][] = [
      [
        { type: "audio", name: "现场情况语音.m4a", meta: "00:38" },
        { type: "video", name: "现场拍摄视频.mp4", meta: "01:12" },
        { type: "text", name: "巡检记录.txt" },
      ],
      [
        { type: "audio", name: "口述说明.m4a", meta: "00:52" },
        { type: "text", name: "处理意见.docx" },
      ],
      [
        { type: "video", name: "病灶特写.mp4", meta: "00:46" },
        { type: "text", name: "诊疗建议.txt" },
      ],
    ];
    const order: WorkOrder = {
      id: seqMap.get(i)!,
      target: ev.target,
      event: ev.event,
      desc: ev.desc,
      proposer,
      status,
      createdAt: fmt(proposedAt),
      attachments: attachmentSets[i % attachmentSets.length],
    };

    if (status !== "待审核") {
      order.reviewer = reviewer;
      order.reviewedAt = fmt(reviewedAt);
    }
    if (status === "执行中" || status === "已完成") {
      order.executor = executor;
      order.executedAt = fmt(executedAt);
    }
    return order;
  });
}
