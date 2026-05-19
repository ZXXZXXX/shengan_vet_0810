import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
import { Plus, Trash2, Truck, PackageCheck, Clock } from "lucide-react";
import {
  WarehouseEventPage,
  type StatusConfig,
  type WarehouseEvent,
} from "@/components/warehouse-event-page";

export const Route = createFileRoute("/warehouse/transfer")({
  head: () => ({ meta: [{ title: "调拨转库 — 奇点智牧" }] }),
  component: TransferPage,
});

type TStatus = "待出库" | "运输中" | "已入库";

const statuses: StatusConfig<TStatus>[] = [
  { key: "待出库", label: "待出库", icon: Clock, tone: "warning" },
  { key: "运输中", label: "运输中", icon: Truck, tone: "info" },
  { key: "已入库", label: "已入库", icon: PackageCheck, tone: "success" },
];

const initialData: WarehouseEvent<TStatus>[] = [
  {
    id: "TR-2026-0142",
    lines: [
      { item: "乳房炎抗生素 5mg", qty: "20 盒" },
      { item: "一次性注射器 10ml", qty: "200 支" },
    ],
    desc: "昨日用量超预期，从 1 号库紧急补一批至 2 号库。",
    status: "待出库",
    operator: "王建国",
    operatedAt: "2026-05-19 10:24",
    from: "1 号库（一级）",
    to: "2 号库（二级）",
  },
  {
    id: "TR-2026-0141",
    lines: [{ item: "免疫疫苗 A 型", qty: "60 支" }],
    desc: "5 月口蹄疫加强免疫备货，1 号库 → 2 号库。",
    status: "运输中",
    operator: "王建国",
    operatedAt: "2026-05-19 09:08",
    from: "1 号库（一级）",
    to: "2 号库（二级）",
  },
  {
    id: "TR-2026-0140",
    lines: [
      { item: "广谱驱虫药", qty: "15 盒" },
      { item: "驱虫滴剂", qty: "30 瓶" },
    ],
    desc: "季度体内驱虫批次，1 号库 → 2 号库。",
    status: "已入库",
    operator: "王建国",
    operatedAt: "2026-05-18 16:42",
    from: "1 号库（一级）",
    to: "2 号库（二级）",
  },
  {
    id: "TR-2026-0139",
    lines: [{ item: "修蹄耗材包", qty: "8 套" }],
    desc: "1 号牛舍集中修蹄，物资 1 号库 → 2 号库。",
    status: "已入库",
    operator: "王建国",
    operatedAt: "2026-05-18 11:30",
    from: "1 号库（一级）",
    to: "2 号库（二级）",
  },
];

type Line = { item: string; qty: string };

function TransferPage() {
  const [data, setData] = useState<WarehouseEvent<TStatus>[]>(initialData);
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreate = (e: WarehouseEvent<TStatus>) => {
    setData((d) => [e, ...d]);
    setCreateOpen(false);
  };

  return (
    <>
      <WarehouseEventPage<TStatus>
        title="调拨转库"
        breadcrumb={["仓库管理", "调拨转库"]}
        statuses={statuses}
        events={data}
        searchPlaceholder="按调拨单号 / 物资 / 描述搜索"
        createLabel="新建调拨"
        onCreate={() => setCreateOpen(true)}
        detailNote="出库与入库状态由第三方仓储系统自动同步，无需手动确认。"
      />

      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        nextId={`TR-2026-${String(143 + (data.length - initialData.length)).padStart(4, "0")}`}
      />
    </>
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
  onSubmit: (t: WarehouseEvent<TStatus>) => void;
  nextId: string;
}) {
  const [lines, setLines] = useState<Line[]>([{ item: "", qty: "" }]);
  const [from, setFrom] = useState("1 号库（一级）");
  const [to, setTo] = useState("2 号库（二级）");
  const [operatedAt, setOperatedAt] = useState(() => {
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
                value={operatedAt}
                onChange={(e) => setOperatedAt(e.target.value)}
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
                desc: `${from} → ${to}${note ? "。" + note : ""}`,
                operator: "王建国",
                operatedAt,
                status: "待出库",
                from,
                to,
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
