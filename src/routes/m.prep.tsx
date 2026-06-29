import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ClipboardList,
  ScanLine,
  Package,
  Pill,
  Check,
  X,
  Minus,
  Plus,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { MobileShell } from "@/components/mobile-shell";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  PICKUPS,
  useClaimed,
  genScanCode,
  genBatch,
} from "@/lib/pickup-store";
import {
  getRoleTasks,
  diseaseTaskMeta,
  typeMeta,
  type HomeTask,
} from "./m.homepage";
import { useRole } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/prep")({
  head: () => ({ meta: [{ title: "备药 · 奇点智牧" }] }),
  component: PrepPage,
});

let groupIdCounter = 0;
const genGroupId = () => `group-${++groupIdCounter}`;

// 演示药品池：包含三类典型场景
type DrugDef = {
  name: string;
  spec: string;
  scanUnit: "瓶" | "支" | "包装";
  countUnit: "瓶" | "支";
  unitScannable: boolean; // false 表示仅外包装可扫码（情况三）
  packSize?: number; // 情况三：每个外包装容量
  allowMix: boolean;
  stockSources: { manufacturer: string; qty: number }[];
};

const drugPool: DrugDef[] = [
  {
    name: "氟尼辛葡甲胺注射液",
    spec: "100ml / 瓶",
    scanUnit: "瓶",
    countUnit: "瓶",
    unitScannable: true,
    allowMix: false,
    stockSources: [
      { manufacturer: "齐鲁动保", qty: 8 },
      { manufacturer: "瑞普生物", qty: 4 },
    ],
  },
  {
    name: "头孢噻呋钠",
    spec: "1g / 支",
    scanUnit: "包装",
    countUnit: "支",
    unitScannable: false,
    packSize: 4,
    allowMix: true,
    stockSources: [
      { manufacturer: "中牧股份", qty: 30 },
      { manufacturer: "辉瑞动保", qty: 18 },
    ],
  },
  {
    name: "青霉素钠",
    spec: "80 万 IU / 支",
    scanUnit: "包装",
    countUnit: "支",
    unitScannable: false,
    packSize: 10,
    allowMix: true,
    stockSources: [{ manufacturer: "勃林格", qty: 60 }],
  },
  {
    name: "钙注射液",
    spec: "500ml / 瓶",
    scanUnit: "瓶",
    countUnit: "瓶",
    unitScannable: true,
    allowMix: true,
    stockSources: [{ manufacturer: "中牧股份", qty: 22 }],
  },
  {
    name: "维生素 C 注射液",
    spec: "10ml / 支",
    scanUnit: "支",
    countUnit: "支",
    unitScannable: true,
    allowMix: true,
    stockSources: [
      { manufacturer: "齐鲁动保", qty: 40 },
      { manufacturer: "瑞普生物", qty: 25 },
    ],
  },
];

type Entry = {
  code: string;
  drug: DrugDef;
  manufacturer: string;
  batch: string;
  qty: number;       // 取数（按 countUnit 计）
  packSize?: number; // PACK 时该包装总容量
};

type Group = {
  id: string;
  entries: Entry[];
};

function PrepPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [aggOpen, setAggOpen] = useState(false);

  // 模拟扫描：循环演示药品池
  const [scanIdx, setScanIdx] = useState(0);

  const makeEntry = (d: DrugDef, existing?: Group): Entry => {
    const sameDrugEntries = existing?.entries.filter((e) => e.drug.name === d.name) ?? [];
    let mfr = d.stockSources[0].manufacturer;
    if (sameDrugEntries.length > 0) {
      const used = sameDrugEntries[0].manufacturer;
      if (!d.allowMix) {
        mfr = used; // 锁定首个厂商
      } else {
        // 允许混用：交替选取已有的厂商以演示情况二
        const opts = d.stockSources.map((s) => s.manufacturer);
        mfr = opts[sameDrugEntries.length % opts.length];
      }
    }
    return {
      code: genScanCode(d.unitScannable ? "UNIT" : "PACK"),
      drug: d,
      manufacturer: mfr,
      batch: genBatch(),
      qty: d.unitScannable ? 1 : (d.packSize ?? 1),
      packSize: d.unitScannable ? undefined : d.packSize,
    };
  };

  const addScan = (d: DrugDef, groupId?: string) => {
    setGroups((prev) => {
      if (groupId !== undefined) {
        const idx = prev.findIndex((g) => g.id === groupId);
        if (idx < 0) return prev;
        const existing = prev[idx];
        const entry = makeEntry(d, existing);
        const next = [...prev];
        next[idx] = { ...existing, entries: [...existing.entries, entry] };
        toast.success(`已追加 · ${d.name}`);
        return next;
      }

      // 未指定分组：同类单药品自动聚合到已有卡片
      const sameDrugIdx = prev.findIndex(
        (g) => g.entries.length > 0 && g.entries.every((e) => e.drug.name === d.name),
      );
      if (sameDrugIdx >= 0) {
        const existing = prev[sameDrugIdx];
        const entry = makeEntry(d, existing);
        const next = [...prev];
        next[sameDrugIdx] = { ...existing, entries: [...existing.entries, entry] };
        toast.success(`已追加 · ${d.name}`);
        return next;
      }

      const entry = makeEntry(d);
      toast.success(`已识别 · ${d.name}`);
      return [{ id: genGroupId(), entries: [entry] }, ...prev];
    });
  };

  const handleScan = () => {
    const d = drugPool[scanIdx % drugPool.length];
    setScanIdx((i) => i + 1);
    addScan(d);
  };

  const addComboScan = (gi: number) => {
    const group = groups[gi];
    const existingNames = new Set(group.entries.map((e) => e.drug.name));
    const candidates = drugPool.filter((d) => !existingNames.has(d.name));
    const d =
      candidates.length > 0
        ? candidates[scanIdx % candidates.length]
        : drugPool[scanIdx % drugPool.length];
    setScanIdx((i) => i + 1);
    addScan(d, group.id);
  };

  const updateQty = (gi: number, ei: number, qty: number) => {
    setGroups((prev) => {
      const next = [...prev];
      const g = next[gi];
      const max = g.entries[ei].packSize ?? 1;
      const v = Math.max(1, Math.min(max, qty));
      const entries = [...g.entries];
      entries[ei] = { ...entries[ei], qty: v };
      next[gi] = { ...g, entries };
      return next;
    });
  };

  const removeEntry = (gi: number, ei: number) => {
    setGroups((prev) => {
      const next = [...prev];
      const g = next[gi];
      const entries = g.entries.filter((_, i) => i !== ei);
      if (entries.length === 0) return next.filter((_, i) => i !== gi);
      next[gi] = { ...g, entries };
      return next;
    });
  };

  const totalCount = groups.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <MobileShell hideTabBar>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="h-12 px-2 flex items-center gap-1">
          <button
            onClick={() => navigate({ to: "/m/homepage" })}
            className="h-9 w-9 inline-flex items-center justify-center text-text-secondary active:bg-surface-subtle rounded-lg"
            aria-label="返回"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-body font-semibold text-foreground">备药</div>
          <button
            onClick={() => setAggOpen(true)}
            className="h-8 px-2.5 rounded-md text-caption text-primary inline-flex items-center gap-1 active:bg-brand-subtle"
          >
            <ClipboardList className="h-4 w-4" />
            统计药品清单
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 pb-36">
        {/* 已扫描列表 */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-body-sm font-medium text-foreground inline-flex items-baseline gap-1.5">
              本次已扫描
              <span className="text-caption text-text-tertiary font-normal">
                共 {totalCount} 项
              </span>
            </div>
            {groups.length > 0 && (
              <button
                onClick={() => setGroups([])}
                className="text-caption text-text-tertiary active:opacity-70"
              >
                清空
              </button>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="rounded-xl bg-card border border-dashed border-border p-8 flex flex-col items-center text-center">
              <Inbox className="h-8 w-8 text-text-tertiary/60 mb-2" />
              <div className="text-caption text-text-tertiary">
                点击下方按钮扫描药品二维码
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {groups.map((g, gi) => (
                <DrugCard
                  key={g.id}
                  group={g}
                  onScanMore={() => addComboScan(gi)}
                  onUpdateQty={(ei, qty) => updateQty(gi, ei, qty)}
                  onRemove={(ei) => removeEntry(gi, ei)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 底部吸底操作栏 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-40">
          <div className="flex gap-3">
            <button
              onClick={handleScan}
              className="flex-1 h-11 rounded-lg border border-primary text-primary text-body-sm font-semibold inline-flex items-center justify-center gap-1.5 active:bg-brand-subtle"
            >
              <ScanLine className="h-4 w-4" />
              扫码领药
            </button>
            <button
              onClick={() => {
                toast.success(`已生成领药记录（${totalCount} 项）`);
                setGroups([]);
              }}
              disabled={totalCount === 0}
              className="flex-1 h-11 rounded-lg bg-primary text-white text-body-sm font-semibold active:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              完成领药
              {totalCount > 0 && `（${totalCount} 项）`}
            </button>
          </div>
        </div>
      </div>

      {aggOpen && (
        <AggregateDrawer
          onClose={() => setAggOpen(false)}
          onConfirm={(ids) => {
            setAggOpen(false);
            navigate({
              to: "/m/health/today_/pickup",
              search: { ids: ids.join(",") },
            });
          }}
        />
      )}
    </MobileShell>
  );
}

function DrugCard({
  group,
  onScanMore,
  onUpdateQty,
  onRemove,
}: {
  group: Group;
  onScanMore: () => void;
  onUpdateQty: (ei: number, qty: number) => void;
  onRemove: (ei: number) => void;
}) {
  const { entries } = group;
  const totalQty = entries.reduce((s, e) => s + e.qty, 0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const distinctDrugs = useMemo(
    () => Array.from(new Map(entries.map((e) => [e.drug.name, e.drug])).values()),
    [entries],
  );
  const isCombo = distinctDrugs.length > 1;
  const firstDrug = distinctDrugs[0];

  const comboTitle = useMemo(() => {
    const parts = distinctDrugs.slice(0, 3).map((d) => {
      const abbr = d.name.slice(0, 3);
      return d.name.length > 3 ? `${abbr}…` : abbr;
    });
    return `用药组合：${parts.join(" + ")}${distinctDrugs.length > 3 ? " + …" : ""}`;
  }, [distinctDrugs]);

  // 按厂商汇总已扫数量（仅单药品卡片展示）
  const byMfr = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => map.set(e.manufacturer, (map.get(e.manufacturer) ?? 0) + e.qty));
    return map;
  }, [entries]);

  return (
    <>
      <div
        className="rounded-xl bg-card border p-3.5"
        style={{ borderColor: "#B8E0C2" }}
      >
        {/* 顶部：名称 + 卡片扫码入口 */}
        <div className="flex items-center gap-2">
          {isCombo ? (
            <span className="inline-flex -space-x-1 text-warning mt-0.5 shrink-0">
              <Pill className="h-4 w-4" />
              <Pill className="h-4 w-4" />
            </span>
          ) : (
            <Package className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0 text-body font-semibold text-foreground truncate">
            {isCombo ? comboTitle : firstDrug.name}
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0 active:opacity-80"
            aria-label="继续扫描"
          >
            <ScanLine className="h-4 w-4" />
          </button>
        </div>

        {/* 单药品专有信息 */}
        {!isCombo && firstDrug && (
          <>
            <div className="mt-2 text-caption text-text-tertiary">
              规格 <span className="text-text-secondary">{firstDrug.spec}</span>
              <span className="mx-2 text-border">·</span>
              扫码单位 <span className="text-text-secondary">{firstDrug.scanUnit}</span>
            </div>

            <div className="mt-1 text-caption text-text-tertiary">
              已扫 <span className="text-foreground font-medium">{totalQty}</span>{" "}
              {firstDrug.countUnit}
            </div>

            <div className="mt-1 text-caption text-text-tertiary flex items-center flex-wrap gap-x-2 gap-y-1">
              <span>厂商</span>
              {Array.from(byMfr.entries()).map(([mfr, qty], i) => (
                <span key={mfr} className="text-text-secondary">
                  {mfr} {qty}
                  {firstDrug.countUnit}
                  {i < byMfr.size - 1 && (
                    <span className="mx-1 text-border">·</span>
                  )}
                </span>
              ))}
              {firstDrug.allowMix ? (
                <span className="ml-1 px-1.5 py-0.5 rounded text-caption bg-surface-subtle text-text-secondary border border-border">
                  允许混用
                </span>
              ) : (
                <span className="ml-1 px-1.5 py-0.5 rounded text-caption bg-[#FFF1E6] text-[#E5751A] border border-[#FFD2A8]">
                  不可混用
                </span>
              )}
            </div>
          </>
        )}

        {/* 虚线分隔 */}
        <div className="my-3 border-t border-dashed border-border" />

        {/* 已领 总数 */}
        <div className="text-caption text-primary text-right font-medium">
          已领 {totalQty} 项
        </div>

        {/* 扫描明细 */}
        <div className="mt-2 space-y-2.5">
          {entries.map((e, ei) => (
            <div key={`${e.code}-${ei}`} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                {isCombo && (
                  <div className="text-caption text-foreground font-medium truncate">
                    {e.drug.name}
                  </div>
                )}
                <div className="text-caption text-text-secondary font-mono truncate">
                  {e.code}
                </div>
                <div className="text-caption mt-0.5">
                  <span className="text-primary">{e.manufacturer}</span>
                  <span className="mx-2 text-border">·</span>
                  <span className="text-text-tertiary font-mono">{e.batch}</span>
                </div>
                {!e.drug.unitScannable && e.packSize && (
                  <div className="text-caption text-text-tertiary mt-0.5">
                    包内剩余 <span className="text-text-secondary">{e.packSize - e.qty}</span>
                    {" / "}
                    <span className="text-text-secondary">{e.packSize}</span>{" "}
                    {e.drug.countUnit}
                  </div>
                )}
              </div>

              {e.drug.unitScannable ? (
                <div className="text-caption text-text-secondary shrink-0">
                  ×{e.qty} {e.drug.countUnit}
                </div>
              ) : (
                <div className="inline-flex items-center border border-border rounded-md shrink-0 h-8">
                  <button
                    onClick={() => onUpdateQty(ei, e.qty - 1)}
                    disabled={e.qty <= 1}
                    className="h-8 w-8 inline-flex items-center justify-center text-text-secondary disabled:opacity-30 active:bg-surface-subtle"
                    aria-label="减少"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-8 text-center text-body-sm tabular-nums">{e.qty}</div>
                  <button
                    onClick={() => onUpdateQty(ei, e.qty + 1)}
                    disabled={e.packSize ? e.qty >= e.packSize : false}
                    className="h-8 w-8 inline-flex items-center justify-center text-text-secondary disabled:opacity-30 active:bg-surface-subtle"
                    aria-label="增加"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <button
                onClick={() => onRemove(ei)}
                className="h-8 w-6 inline-flex items-center justify-center text-text-tertiary active:text-foreground shrink-0"
                aria-label="移除"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>组合用药确认</AlertDialogTitle>
            <AlertDialogDescription>
              是否关联其他药品组合用药？该功能仅适用于需配药的场景，请确认后再扫描。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmOpen(false)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onScanMore();
                setConfirmOpen(false);
              }}
            >
              确认扫描
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AggregateDrawer({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const role = useRole();
  const claimed = useClaimed();
  const tasks: HomeTask[] = useMemo(() => {
    const roleTasks = getRoleTasks(role);
    return roleTasks.filter((t) =>
      PICKUPS.some((p) => p.source === t.id && !claimed.includes(p.id)),
    );
  }, [role, claimed]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allOn = tasks.length > 0 && selected.size === tasks.length;
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected(allOn ? new Set() : new Set(tasks.map((t) => t.id)));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl h-[75vh] max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
          <div className="text-body font-medium text-foreground">
            选择任务统计药品
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center text-text-secondary"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
          <button
            onClick={toggleAll}
            disabled={tasks.length === 0}
            className="text-caption text-primary inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <span
              className={`h-4 w-4 rounded border inline-flex items-center justify-center ${
                allOn ? "bg-primary border-primary" : "border-border bg-card"
              }`}
            >
              {allOn && <Check className="h-3 w-3 text-white" />}
            </span>
            全选
          </button>
          <span className="text-caption text-text-tertiary">
            已选 {selected.size} / {tasks.length}
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
          {tasks.length === 0 && (
            <div className="p-10 text-center text-caption text-text-tertiary">
              暂无待领药的今日任务
            </div>
          )}
          {tasks.map((t) => {
            const on = selected.has(t.id);
            const meta = typeMeta[t.type];
            const Icon = meta?.icon ?? Pill;
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`w-full p-3 flex items-center gap-3 text-left active:bg-surface-subtle ${
                  on ? "bg-brand-subtle/50" : ""
                }`}
              >
                <span
                  className={`h-4 w-4 rounded border shrink-0 inline-flex items-center justify-center ${
                    on ? "bg-primary border-primary" : "border-border bg-card"
                  }`}
                >
                  {on && <Check className="h-3 w-3 text-white" />}
                </span>
                <span
                  className={`h-8 w-8 rounded-lg ${meta?.bg ?? "bg-brand-subtle"} ${meta?.text ?? "text-primary"} inline-flex items-center justify-center shrink-0`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-caption text-text-tertiary">
                    <span className="font-mono">{t.id}</span>
                    <span className="mx-1.5 text-border">·</span>
                    {diseaseTaskMeta[t.id]?.disease ?? t.type}
                  </div>
                  <div className="text-body-sm text-foreground truncate mt-0.5">
                    {t.target} · {t.conclusion}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] border-t border-border shrink-0">
          <button
            disabled={selected.size === 0}
            onClick={() => onConfirm(Array.from(selected))}
            className="w-full h-11 rounded-lg bg-primary text-white text-body-sm font-semibold disabled:opacity-40 active:opacity-90"
          >
            生成领药清单（{selected.size}）
          </button>
        </div>
      </div>
    </div>
  );
}
