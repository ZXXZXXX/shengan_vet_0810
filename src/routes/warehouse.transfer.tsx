import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, ArrowRight, Trash2, PackageCheck } from "lucide-react";

export const Route = createFileRoute("/warehouse/transfer")({
  head: () => ({ meta: [{ title: "调拨转库 — 奇点智牧" }] }),
  component: TransferPage,
});

type Status = "待入库" | "已入库";

type Line = { item: string; qty: string };

type Transfer = {
  id: string;
  lines: Line[];
  from: string;
  to: string;
  operator: string;
  transferTime: string;
  note: string;
  status: Status;
};

const initialData: Transfer[] = [
  {
    id: "TR-2026-0142",
    lines: [
      { item: "乳房炎抗生素 5mg", qty: "20 盒" },
      { item: "一次性注射器 10ml", qty: "200 支" },
    ],
    from: "1 号库（一级）",
    to: "2 号库（二级）",
    operator: "王建国",
    transferTime: "2026-05-19 10:24",
    note: "昨日用量超预期，紧急补一批。",
    status: "待入库",
  },
  {
    id: "TR-2026-0141",
    lines: [{ item: "免疫疫苗 A 型", qty: "60 支" }],
    from: "1 号库（一级）",
    to: "2 号库（二级）",
    operator: "王建国",
    transferTime: "2026-05-19 09:08",
    note: "5 月口蹄疫加强免疫备货。",
    status: "待入库",
  },
  {
    id: "TR-2026-0140",
    lines: [
      { item: "广谱驱虫药", qty: "15 盒" },
      { item: "驱虫滴剂", qty: "30 瓶" },
    ],
    from: "1 号库（一级）",
    to: "2 号库（二级）",
    operator: "王建国",
    transferTime: "2026-05-18 16:42",
    note: "季度体内驱虫批次。",
    status: "已入库",
  },
  {
    id: "TR-2026-0139",
    lines: [{ item: "修蹄耗材包", qty: "8 套" }],
    from: "1 号库（一级）",
    to: "2 号库（二级）",
    operator: "王建国",
    transferTime: "2026-05-18 11:30",
    note: "1 号牛舍集中修蹄。",
    status: "已入库",
  },
];

const statusTag: Record<Status, string> = {
  "待入库": "tag tag-warning",
  "已入库": "tag tag-success",
};

function TransferPage() {
  const [data, setData] = useState<Transfer[]>(initialData);
  const [tab, setTab] = useState<Status | "全部">("全部");
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<Transfer | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const counts: Record<Status | "全部", number> = {
    "全部": data.length,
    "待入库": data.filter((r) => r.status === "待入库").length,
    "已入库": data.filter((r) => r.status === "已入库").length,
  };

  const list = useMemo(() => {
    return data.filter((r) => {
      if (tab !== "全部" && r.status !== tab) return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        const hit =
          r.id.toLowerCase().includes(k) ||
          r.lines.some((l) => l.item.toLowerCase().includes(k));
        if (!hit) return false;
      }
      return true;
    });
  }, [data, tab, keyword]);

  const handleConfirmIn = (id: string) => {
    setData((d) => d.map((r) => (r.id === id ? { ...r, status: "已入库" } : r)));
    setDetail(null);
  };

  const handleCreate = (t: Transfer) => {
    setData((d) => [t, ...d]);
    setCreateOpen(false);
  };

  return (
    <>
      <AppHeader title="调拨转库" breadcrumb={["仓库管理", "调拨转库"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 rounded-md bg-surface-subtle p-1">
            {(["全部", "待入库", "已入库"] as const).map((s) => (
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
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="按调拨单号 / 物资搜索"
                className="h-9 w-72 pl-9 text-body-sm bg-card border-border"
              />
            </div>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> 新建调拨
            </Button>
          </div>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">调拨单号</div>
            <div className="col-span-4">物资 · 数量</div>
            <div className="col-span-2">流向</div>
            <div className="col-span-1">操作人</div>
            <div className="col-span-2">操作时间</div>
            <div className="col-span-1 text-right">状态</div>
          </div>
          {list.map((r) => (
            <button
              key={r.id}
              onClick={() => setDetail(r)}
              className="w-full grid grid-cols-12 gap-3 px-6 py-3 items-center text-left text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors"
            >
              <div className="col-span-2 font-mono text-body-sm text-foreground">{r.id}</div>
              <div className="col-span-4 leading-tight space-y-0.5">
                {r.lines.slice(0, 2).map((l, i) => (
                  <div key={i} className="flex items-baseline gap-2 text-body-sm">
                    <span className="text-foreground truncate">{l.item}</span>
                    <span className="text-caption text-text-tertiary tabular-nums shrink-0">{l.qty}</span>
                  </div>
                ))}
                {r.lines.length > 2 && (
                  <div className="text-caption text-text-tertiary">等 {r.lines.length} 项</div>
                )}
              </div>
              <div className="col-span-2 flex items-center gap-1.5 text-body-sm text-text-secondary">
                <span>{r.from}</span>
                <ArrowRight className="h-3 w-3 text-text-tertiary" />
                <span>{r.to}</span>
              </div>
              <div className="col-span-1 text-body-sm text-foreground truncate">{r.operator}</div>
              <div className="col-span-2 text-body-sm text-text-secondary tabular-nums">{r.transferTime}</div>
              <div className="col-span-1 flex justify-end">
                <span className={statusTag[r.status]}>{r.status}</span>
              </div>
            </button>
          ))}
          {list.length === 0 && (
            <div className="h-32 flex items-center justify-center text-caption text-text-tertiary">
              暂无数据
            </div>
          )}
          <div className="sticky bottom-0 z-10 flex h-10 items-center justify-end px-6 border-t border-border bg-card text-caption text-text-tertiary">
            共 {list.length} 条
          </div>
        </Card>
      </main>

      {/* 详情 */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-section-title">调拨单详情</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-body-sm text-foreground">{detail.id}</span>
                <span className={statusTag[detail.status]}>{detail.status}</span>
              </div>

              <div className="rounded-md border border-border bg-surface-subtle">
                <div className="grid grid-cols-2 gap-3 px-4 h-9 items-center text-table-header text-text-secondary border-b border-border">
                  <div>物资</div>
                  <div className="text-right">数量</div>
                </div>
                {detail.lines.map((l, i) => (
                  <div key={i} className="grid grid-cols-2 gap-3 px-4 h-10 items-center text-body-sm border-b border-border last:border-0">
                    <div className="text-foreground">{l.item}</div>
                    <div className="text-right text-text-secondary tabular-nums">{l.qty}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border p-4">
                <Field label="调拨流向" value={`${detail.from} → ${detail.to}`} />
                <Field label="操作人" value={detail.operator} />
                <Field label="操作时间" value={detail.transferTime} />
                <Field label="状态" value={detail.status} />
              </div>

              {detail.note && (
                <div className="rounded-md border border-border p-4">
                  <div className="text-caption text-text-tertiary mb-1">备注</div>
                  <p className="text-body-sm text-text-secondary leading-relaxed">{detail.note}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {detail?.status === "待入库" ? (
              <Button
                className="gap-1.5 bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
                onClick={() => detail && handleConfirmIn(detail.id)}
              >
                <PackageCheck className="h-3.5 w-3.5" /> 确认入库
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setDetail(null)}>关闭</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建 */}
      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        nextId={`TR-2026-${String(143 + (data.length - initialData.length)).padStart(4, "0")}`}
      />
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

function CreateDialog({
  open,
  onOpenChange,
  onSubmit,
  nextId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (t: Transfer) => void;
  nextId: string;
}) {
  const [lines, setLines] = useState<Line[]>([{ item: "", qty: "" }]);
  const [from, setFrom] = useState("1 号库（一级）");
  const [to, setTo] = useState("2 号库（二级）");
  const [transferTime, setTransferTime] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [note, setNote] = useState("");

  const reset = () => {
    setLines([{ item: "", qty: "" }]);
    setNote("");
  };

  const update = (i: number, k: keyof Line, v: string) => {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  };

  const canSubmit = lines.every((l) => l.item.trim() && l.qty.trim()) && from && to && from !== to;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-section-title">新建调拨</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-caption text-text-tertiary">来源库</Label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 号库（一级）">1 号库（一级）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-caption text-text-tertiary">目标库</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger className="h-9 bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2 号库（二级）">2 号库（二级）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-caption text-text-tertiary">操作时间</Label>
              <Input
                value={transferTime}
                onChange={(e) => setTransferTime(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm"
                className="h-9 bg-card"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-caption text-text-tertiary">物资明细</Label>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-body-sm text-primary hover:bg-brand-subtle hover:text-primary gap-1"
                onClick={() => setLines((ls) => [...ls, { item: "", qty: "" }])}
              >
                <Plus className="h-3.5 w-3.5" /> 增加一行
              </Button>
            </div>
            <div className="space-y-2">
              {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_32px] gap-2 items-center">
                  <Input
                    value={l.item}
                    onChange={(e) => update(i, "item", e.target.value)}
                    placeholder="物资名称"
                    className="h-9 bg-card"
                  />
                  <Input
                    value={l.qty}
                    onChange={(e) => update(i, "qty", e.target.value)}
                    placeholder="数量"
                    className="h-9 bg-card"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-8 text-text-tertiary hover:text-[var(--state-danger)]"
                    disabled={lines.length === 1}
                    onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-caption text-text-tertiary">备注</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可填写调拨原因、注意事项等"
              className="min-h-[72px] bg-card"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            disabled={!canSubmit}
            className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
            onClick={() =>
              onSubmit({
                id: nextId,
                lines,
                from,
                to,
                operator: "王建国",
                transferTime,
                note,
                status: "待入库",
              })
            }
          >
            生成调拨单
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
