import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Filter,
  Save,
  Download,
  ArrowLeft,
  Search,
  Star,
  Stethoscope,
  Syringe,
  Pill,
  Baby,
  Droplet,
  Bug,
  Scissors,
  BarChart3,
  X,
  Check,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const Route = createFileRoute("/stats")({
  head: () => ({ meta: [{ title: "统计分析 — 奇点智牧" }] }),
  component: StatsPage,
});

// ============ Types & helpers ============
type WorkOrderType =
  | "disease"
  | "vaccine"
  | "postpartum"
  | "hoof"
  | "drying"
  | "deworm"
  | "general";

const WO_TYPE_LABEL: Record<WorkOrderType, string> = {
  disease: "疾病治疗",
  vaccine: "疫苗免疫",
  postpartum: "产后护理",
  hoof: "修蹄",
  drying: "干奶",
  deworm: "驱虫",
  general: "普修",
};

const WO_TYPE_ICON: Record<WorkOrderType, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  disease: Stethoscope,
  vaccine: Syringe,
  postpartum: Baby,
  hoof: Scissors,
  drying: Droplet,
  deworm: Bug,
  general: Pill,
};

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "待诊断" },
  { value: "executing", label: "待执行" },
  { value: "done", label: "已完成" },
  { value: "aborted", label: "已终止" },
];

const FARM_OPTIONS = [
  { value: "all", label: "全部牧场" },
  { value: "f1", label: "内蒙古大牧场" },
  { value: "f2", label: "河北示范牧场" },
  { value: "f3", label: "山东华牧" },
];

const DATE_PRESETS = [
  { value: "today", label: "今日" },
  { value: "7d", label: "近 7 天" },
  { value: "30d", label: "近 30 天" },
  { value: "90d", label: "近 90 天" },
  { value: "month", label: "本月" },
  { value: "custom", label: "自定义" },
];

type Filters = {
  dateRange: string;
  dateStart?: string;
  dateEnd?: string;
  farm: string;
  woTypes: WorkOrderType[];
  status: string;
  keyword: string;
  onlyAbnormal: boolean;
};

const DEFAULT_FILTERS: Filters = {
  dateRange: "30d",
  farm: "all",
  woTypes: [],
  status: "all",
  keyword: "",
  onlyAbnormal: false,
};

// ============ Templates ============
type Template = {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone: string;
  filters: Filters;
  favorite?: boolean;
  usage?: number;
};

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "t-disease-30d",
    name: "近 30 天疾病治疗",
    desc: "全部牧场 · 疾病治疗工单汇总",
    icon: Stethoscope,
    tone: "var(--brand)",
    filters: { ...DEFAULT_FILTERS, dateRange: "30d", woTypes: ["disease"] },
    favorite: true,
    usage: 128,
  },
  {
    id: "t-vaccine-month",
    name: "本月疫苗执行",
    desc: "本月已完成的疫苗免疫工单",
    icon: Syringe,
    tone: "var(--effect-ai-cyan)",
    filters: { ...DEFAULT_FILTERS, dateRange: "month", woTypes: ["vaccine"], status: "done" },
    favorite: true,
    usage: 96,
  },
  {
    id: "t-postpartum-highrisk",
    name: "产后高危跟进",
    desc: "近 7 天产后护理 · 仅异常",
    icon: Baby,
    tone: "var(--effect-ai-purple)",
    filters: { ...DEFAULT_FILTERS, dateRange: "7d", woTypes: ["postpartum"], onlyAbnormal: true },
    usage: 62,
  },
  {
    id: "t-hoof-90d",
    name: "季度修蹄统计",
    desc: "近 90 天修蹄工单执行情况",
    icon: Scissors,
    tone: "var(--state-warning)",
    filters: { ...DEFAULT_FILTERS, dateRange: "90d", woTypes: ["hoof"] },
    usage: 41,
  },
  {
    id: "t-drying-month",
    name: "本月干奶执行",
    desc: "本月干奶工单 · 全部牧场",
    icon: Droplet,
    tone: "var(--state-success)",
    filters: { ...DEFAULT_FILTERS, dateRange: "month", woTypes: ["drying"] },
    usage: 35,
  },
  {
    id: "t-pending-7d",
    name: "近 7 天未处理",
    desc: "所有类型 · 待诊断 / 待执行",
    icon: BarChart3,
    tone: "var(--destructive)",
    filters: { ...DEFAULT_FILTERS, dateRange: "7d", status: "pending" },
    usage: 88,
  },
];

// ============ Mock result data ============
type Row = {
  id: string;
  earTag: string;
  farm: string;
  barn: string;
  type: WorkOrderType;
  status: string;
  reporter: string;
  createdAt: string;
  detail: string;
};

const ROWS: Row[] = Array.from({ length: 26 }).map((_, i) => {
  const types: WorkOrderType[] = ["disease", "vaccine", "postpartum", "hoof", "drying", "deworm", "general"];
  const type = types[i % types.length];
  const statusList = ["pending", "executing", "done", "done", "done", "aborted"];
  return {
    id: `WO-2026-${String(1000 + i)}`,
    earTag: `C${String(20241000 + i * 17)}`,
    farm: ["内蒙古大牧场", "河北示范牧场", "山东华牧"][i % 3],
    barn: `${["泌乳一", "泌乳二", "干奶", "犊牛"][i % 4]}舍`,
    type,
    status: statusList[i % statusList.length],
    reporter: ["王强", "李峰", "陈明", "赵霞"][i % 4],
    createdAt: `2026-07-${String(24 - (i % 24)).padStart(2, "0")}`,
    detail: {
      disease: "乳房炎 · 左前乳区红肿",
      vaccine: "口蹄疫疫苗 · 常规接种",
      postpartum: "产后 3 天例行检查",
      hoof: "蹄叶炎 · 二级修整",
      drying: "干奶封闭 · 4支/次",
      deworm: "伊维菌素驱虫",
      general: "普通例检",
    }[type],
  };
});

const STATUS_TAG: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "待诊断", bg: "#FFF7ED", color: "#C2410C" },
  executing: { label: "待执行", bg: "#EFF6FF", color: "#1D4ED8" },
  done: { label: "已完成", bg: "#EFFBF1", color: "#00A14F" },
  aborted: { label: "已终止", bg: "#F1F5F9", color: "#475569" },
};

// ============ Page ============
function StatsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [view, setView] = useState<"builder" | "result">("builder");
  const [resultFilters, setResultFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [resultTitle, setResultTitle] = useState("筛选结果");
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");

  const toggleWoType = (t: WorkOrderType) => {
    setFilters((f) => ({
      ...f,
      woTypes: f.woTypes.includes(t) ? f.woTypes.filter((x) => x !== t) : [...f.woTypes, t],
    }));
  };

  const runFilter = (f: Filters, title = "筛选结果") => {
    setResultFilters(f);
    setResultTitle(title);
    setView("result");
  };

  const handleSaveTemplate = () => {
    if (!saveName.trim()) {
      toast.error("请输入模板名称");
      return;
    }
    setTemplates((prev) => [
      {
        id: `t-${Date.now()}`,
        name: saveName.trim(),
        desc: saveDesc.trim() || describeFilters(filters),
        icon: BarChart3,
        tone: "var(--brand)",
        filters: { ...filters },
        usage: 0,
      },
      ...prev,
    ]);
    toast.success("模板已保存");
    setSaveOpen(false);
    setSaveName("");
    setSaveDesc("");
  };

  const toggleFav = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t)),
    );
  };

  const filteredRows = useMemo(() => filterRows(ROWS, resultFilters), [resultFilters]);

  if (view === "result") {
    return (
      <>
        <AppHeader title="统计分析" breadcrumb={["首页", "统计分析", resultTitle]} />
        <main className="flex-1 px-6 py-6 space-y-4 bg-white">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("builder")}
                className="h-9"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                返回筛选
              </Button>
              <div>
                <div className="text-card-title font-medium text-foreground">{resultTitle}</div>
                <div className="text-caption text-text-tertiary mt-0.5">
                  共 <span className="tabular-nums text-foreground font-medium">{filteredRows.length}</span> 条 · {describeFilters(resultFilters)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => {
                  setFilters(resultFilters);
                  setView("builder");
                }}
              >
                <Filter className="h-3.5 w-3.5 mr-1" />
                再筛选
              </Button>
              <Button
                size="sm"
                className="h-9 bg-primary hover:bg-[var(--brand-hover)]"
                onClick={() => {
                  downloadCsv(filteredRows, `${resultTitle}.csv`);
                  toast.success("已开始下载 CSV");
                }}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                下载报表
              </Button>
            </div>
          </div>

          <Card className="border-border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-subtle/60">
                  <TableHead>工单编号</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>牛只耳号</TableHead>
                  <TableHead>牧场 · 牛舍</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>上报人</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>说明</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((r) => {
                  const Icon = WO_TYPE_ICON[r.type];
                  const s = STATUS_TAG[r.status];
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-body-sm">{r.id}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-body-sm">
                          <Icon className="h-3.5 w-3.5 text-text-tertiary" strokeWidth={1.75} />
                          {WO_TYPE_LABEL[r.type]}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-body-sm">{r.earTag}</TableCell>
                      <TableCell className="text-body-sm text-text-secondary">{r.farm} · {r.barn}</TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-caption"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-body-sm">{r.reporter}</TableCell>
                      <TableCell className="text-body-sm text-text-secondary tabular-nums">{r.createdAt}</TableCell>
                      <TableCell className="text-body-sm text-text-secondary max-w-[280px] truncate">{r.detail}</TableCell>
                    </TableRow>
                  );
                })}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-text-tertiary">
                      当前筛选条件下暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="统计分析" breadcrumb={["首页", "统计分析"]} />
      <main className="flex-1 px-6 py-6 space-y-5 bg-white">
        {/* 高级筛选 */}
        <Card className="border-border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-card-title font-medium text-foreground">高级筛选</div>
              <div className="text-caption text-text-tertiary mt-0.5">
                选择时间、牧场、工单类型、状态等条件，可保存为模板复用
              </div>
            </div>
            {(filters.woTypes.length > 0 || filters.status !== "all" || filters.farm !== "all" || filters.onlyAbnormal || filters.keyword) && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-caption text-text-tertiary hover:text-foreground inline-flex items-center gap-1"
              >
                <X className="h-3 w-3" /> 清空条件
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FieldBlock label="时间范围">
              <Select
                value={filters.dateRange}
                onValueChange={(v) => setFilters((f) => ({ ...f, dateRange: v }))}
              >
                <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_PRESETS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="牧场">
              <Select
                value={filters.farm}
                onValueChange={(v) => setFilters((f) => ({ ...f, farm: v }))}
              >
                <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FARM_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="工单状态">
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label="关键词（耳号 / 编号）">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                <Input
                  value={filters.keyword}
                  onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
                  placeholder="输入关键词"
                  className="h-9 pl-8 bg-white"
                />
              </div>
            </FieldBlock>
          </div>

          <div className="mt-5">
            <div className="text-body-sm text-text-secondary mb-2">工单类型（可多选）</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(WO_TYPE_LABEL) as WorkOrderType[]).map((t) => {
                const active = filters.woTypes.includes(t);
                const Icon = WO_TYPE_ICON[t];
                return (
                  <button
                    key={t}
                    onClick={() => toggleWoType(t)}
                    className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-body-sm border transition-colors ${
                      active
                        ? "border-primary bg-brand-subtle text-primary"
                        : "border-border bg-white text-text-secondary hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {WO_TYPE_LABEL[t]}
                    {active && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 pt-5 border-t border-border">
            <Button
              className="h-10 px-5 bg-primary hover:bg-[var(--brand-hover)]"
              onClick={() => runFilter(filters, "自定义筛选结果")}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              开始筛选
            </Button>
            <Button
              variant="outline"
              className="h-10 px-5"
              onClick={() => setSaveOpen(true)}
            >
              <Save className="h-4 w-4 mr-1.5" />
              保存筛选模板
            </Button>
            <div className="ml-auto text-caption text-text-tertiary">
              当前条件：{describeFilters(filters)}
            </div>
          </div>
        </Card>

        {/* 常用报表模板 */}
        <div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-card-title font-medium text-foreground">常用报表模板</div>
              <div className="text-caption text-text-tertiary mt-0.5">
                点击模板直接进入已筛选的列表页，可再次调整并下载
              </div>
            </div>
            <div className="text-caption text-text-tertiary">共 {templates.length} 个模板</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => runFilter(t.filters, t.name)}
                className="group text-left border border-border rounded-xl bg-white p-5 hover:border-primary/50 hover:shadow-[0_8px_24px_-16px_var(--brand)] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: `color-mix(in oklab, ${t.tone} 14%, transparent)`,
                      color: t.tone,
                    }}
                  >
                    <t.icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav(t.id);
                    }}
                    className="h-7 w-7 -mr-1.5 inline-flex items-center justify-center rounded-md hover:bg-surface-subtle"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        t.favorite ? "fill-[var(--state-warning)] text-[var(--state-warning)]" : "text-text-tertiary"
                      }`}
                    />
                  </span>
                </div>
                <div className="mt-4">
                  <div className="text-body font-medium text-foreground group-hover:text-primary transition-colors">
                    {t.name}
                  </div>
                  <div className="text-caption text-text-tertiary mt-1 line-clamp-2 min-h-[36px]">
                    {t.desc}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {tagsFromFilters(t.filters).slice(0, 3).map((label) => (
                      <Badge
                        key={label}
                        variant="secondary"
                        className="rounded-md bg-surface-subtle text-text-secondary border-transparent font-normal"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                  {t.usage != null && (
                    <span className="text-caption text-text-tertiary tabular-nums">使用 {t.usage}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* 保存模板弹窗 */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>保存为筛选模板</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-body-sm">模板名称</Label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="如：近 30 天疾病治疗"
                className="mt-1.5 h-9 bg-white"
              />
            </div>
            <div>
              <Label className="text-body-sm">描述（可选）</Label>
              <Input
                value={saveDesc}
                onChange={(e) => setSaveDesc(e.target.value)}
                placeholder="简要说明模板用途"
                className="mt-1.5 h-9 bg-white"
              />
            </div>
            <div className="p-3 rounded-lg bg-surface-subtle border border-border">
              <div className="text-caption text-text-tertiary mb-1">当前筛选条件</div>
              <div className="text-body-sm text-foreground">{describeFilters(filters)}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>取消</Button>
            <Button className="bg-primary hover:bg-[var(--brand-hover)]" onClick={handleSaveTemplate}>
              保存模板
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ small components ============
function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-body-sm text-text-secondary mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

// ============ util ============
function describeFilters(f: Filters): string {
  const parts: string[] = [];
  parts.push(DATE_PRESETS.find((d) => d.value === f.dateRange)?.label || "");
  parts.push(FARM_OPTIONS.find((d) => d.value === f.farm)?.label || "");
  if (f.woTypes.length) {
    parts.push(f.woTypes.map((t) => WO_TYPE_LABEL[t]).join("、"));
  } else {
    parts.push("全部工单类型");
  }
  if (f.status !== "all") {
    parts.push(STATUS_OPTIONS.find((s) => s.value === f.status)?.label || "");
  }
  if (f.onlyAbnormal) parts.push("仅异常");
  if (f.keyword) parts.push(`关键词「${f.keyword}」`);
  return parts.filter(Boolean).join(" · ");
}

function tagsFromFilters(f: Filters): string[] {
  const tags: string[] = [];
  tags.push(DATE_PRESETS.find((d) => d.value === f.dateRange)?.label || "");
  if (f.farm !== "all") tags.push(FARM_OPTIONS.find((d) => d.value === f.farm)?.label || "");
  if (f.woTypes.length === 1) tags.push(WO_TYPE_LABEL[f.woTypes[0]]);
  else if (f.woTypes.length > 1) tags.push(`工单 ${f.woTypes.length} 类`);
  if (f.status !== "all") tags.push(STATUS_OPTIONS.find((s) => s.value === f.status)?.label || "");
  if (f.onlyAbnormal) tags.push("仅异常");
  return tags.filter(Boolean);
}

function filterRows(rows: Row[], f: Filters): Row[] {
  return rows.filter((r) => {
    if (f.woTypes.length && !f.woTypes.includes(r.type)) return false;
    if (f.status !== "all" && r.status !== f.status) return false;
    if (f.farm !== "all") {
      const map: Record<string, string> = {
        f1: "内蒙古大牧场",
        f2: "河北示范牧场",
        f3: "山东华牧",
      };
      if (r.farm !== map[f.farm]) return false;
    }
    if (f.keyword) {
      const k = f.keyword.toLowerCase();
      if (!r.id.toLowerCase().includes(k) && !r.earTag.toLowerCase().includes(k)) return false;
    }
    return true;
  });
}

function downloadCsv(rows: Row[], filename: string) {
  const header = ["工单编号", "类型", "耳号", "牧场", "牛舍", "状态", "上报人", "创建时间", "说明"];
  const body = rows.map((r) => [
    r.id,
    WO_TYPE_LABEL[r.type],
    r.earTag,
    r.farm,
    r.barn,
    STATUS_TAG[r.status]?.label || r.status,
    r.reporter,
    r.createdAt,
    r.detail.replace(/"/g, '""'),
  ]);
  const csv = [header, ...body]
    .map((row) => row.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
