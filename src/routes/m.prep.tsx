import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ScanLine,
  Package,
  Pill,
  Check,
  X,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { MobileShell } from "@/components/mobile-shell";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import {
  PICKUPS,
  genScanCode,
  genBatch,
} from "@/lib/pickup-store";
import {
  homeTasks,
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
  combo?: boolean; // 用户主动开启的组合用药模式
};

type Requirement = {
  key: string;            // name + spec
  name: string;
  spec: string;
  unit: string;
  total: number;          // 所需总数
  mfrRequired: string;    // 厂商要求："不限" 或 具体厂商
  taskIds: string[];      // 来源任务
};

/** 从 "2 瓶" 解析数字 */
function parseQtyNum(qty: string): { n: number; unit: string } {
  const m = qty.match(/^\s*(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return { n: 0, unit: "" };
  return { n: Number(m[1]), unit: (m[2] ?? "").trim() };
}

function PrepPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [aggOpen, setAggOpen] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [checklistCollapsed, setChecklistCollapsed] = useState(false);

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
    // 演示合并：若已有单药品卡片，每隔一次扫描就再扫一次同一药品
    const singleDrugGroups = groups.filter(
      (g) => !g.combo && g.entries.length > 0 && new Set(g.entries.map((e) => e.drug.name)).size === 1,
    );
    let d: DrugDef;
    if (singleDrugGroups.length > 0 && scanIdx % 2 === 1) {
      const target = singleDrugGroups[singleDrugGroups.length - 1].entries[0].drug;
      d = target;
    } else {
      d = drugPool[scanIdx % drugPool.length];
    }
    setScanIdx((i) => i + 1);
    addScan(d);
  };

  const enableCombo = (gi: number) => {
    setGroups((prev) => {
      const next = [...prev];
      next[gi] = { ...next[gi], combo: true };
      return next;
    });
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

  // 当前已取（按药品名 + 规格聚合）
  const claimedMap = useMemo(() => {
    const m = new Map<string, number>();
    groups.forEach((g) =>
      g.entries.forEach((e) => {
        const k = `${e.drug.name}|${e.drug.spec}`;
        m.set(k, (m.get(k) ?? 0) + e.qty);
      }),
    );
    return m;
  }, [groups]);

  const handleAggregateConfirm = (ids: string[]) => {
    setAggOpen(false);
    // 聚合所选任务对应 pickup 的药品需求
    const map = new Map<string, Requirement>();
    ids.forEach((tid) => {
      const pk = PICKUPS.find((p) => p.source === tid);
      if (!pk) return;
      pk.items.forEach((it) => {
        const { n, unit } = parseQtyNum(it.qty);
        const key = `${it.name}|${it.spec ?? ""}`;
        const existing = map.get(key);
        const mfr =
          it.allowMixManufacturer === false
            ? it.stockSources?.[0]?.manufacturer ?? "指定厂商"
            : "不限";
        if (existing) {
          existing.total += n;
          if (!existing.taskIds.includes(tid)) existing.taskIds.push(tid);
        } else {
          map.set(key, {
            key,
            name: it.name,
            spec: it.spec ?? "",
            unit: unit || "",
            total: n,
            mfrRequired: mfr,
            taskIds: [tid],
          });
        }
      });
    });
    setRequirements(Array.from(map.values()));
    setChecklistCollapsed(false);
    toast.success(`已生成药品清单（${map.size} 种）`);
  };

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
        </div>
      </header>


      {/* 顶部 1/4 区域：药品清单 */}
      <div className="min-h-[25vh] border-b border-border bg-card flex flex-col">
        {requirements.length > 0 ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div
              className="w-full h-12 px-4 flex items-center gap-2 active:bg-surface-subtle shrink-0"
            >
              <div
                className="flex-1 flex items-center gap-2 min-w-0"
                onClick={() => setChecklistCollapsed((v) => !v)}
              >
                <ClipboardList className="h-4 w-4 text-primary shrink-0" />
                <span className="text-body font-medium text-foreground whitespace-nowrap">药品清单</span>
                <span className="text-caption text-text-tertiary whitespace-nowrap">
                  共 {requirements.length} 种
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-caption text-text-tertiary whitespace-nowrap">
                  {checklistCollapsed ? "展开" : "收起"}
                  {checklistCollapsed ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAggOpen(true);
                }}
                className="ml-3 inline-flex items-center gap-1 text-caption text-primary active:opacity-70 shrink-0"
              >
                选择任务
              </button>
            </div>
            <div className="px-4 pb-3 space-y-2">
              {requirements.map((r, idx) => {
                if (checklistCollapsed && idx > 0) return null;
                const got = claimedMap.get(r.key) ?? 0;
                const done = got >= r.total;
                return (
                  <div
                    key={r.key}
                    className="rounded-lg border border-border bg-surface-2 px-3 py-2"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-body-sm font-medium text-foreground truncate">
                        {r.name}
                      </span>
                      <span
                        className={`ml-auto text-caption tabular-nums shrink-0 ${
                          done ? "text-primary font-medium" : "text-[#E5751A] font-medium"
                        }`}
                      >
                        {got} / {r.total} {r.unit}
                      </span>
                    </div>
                    <div className="mt-1 text-caption text-text-tertiary flex items-center flex-wrap gap-x-2">
                      <span>
                        厂商
                        <span
                          className={`ml-1 ${r.mfrRequired === "不限" ? "text-text-secondary" : "text-[#E5751A]"}`}
                        >
                          {r.mfrRequired}
                        </span>
                      </span>
                      <span className="text-border">·</span>
                      <span>规格 <span className="text-text-secondary">{r.spec}</span></span>
                    </div>
                  </div>
                );
              })}
              {checklistCollapsed && requirements.length > 1 && (
                <div className="text-center text-caption text-text-tertiary py-2">
                  已折叠 {requirements.length - 1} 条
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col px-4 pt-3 pb-4 min-h-0">
            <div className="flex items-center gap-2 h-8 mb-2 shrink-0">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="text-body font-medium text-foreground">药品清单</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center min-h-0">
              <div className="text-body-sm text-text-tertiary mb-4">
                选择任务，快速统计药品清单
              </div>
              <button
                onClick={() => setAggOpen(true)}
                className="h-9 px-4 rounded-lg text-body-sm text-primary inline-flex items-center gap-1.5 border border-primary active:bg-brand-subtle"
              >
                <ClipboardList className="h-4 w-4" />
                选择任务
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-36 bg-card flex-1">
        {/* 已领药品 */}
        <div className="flex items-center justify-between h-8 mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-body font-medium text-foreground">已领药品</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-caption text-text-tertiary">共 {totalCount} 项</span>
            {groups.length > 0 && (
              <button
                onClick={() => setGroups([])}
                className="text-caption text-text-tertiary active:opacity-70"
              >
                清空
              </button>
            )}
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-2 p-8 flex flex-col items-center text-center">
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
                onEnableCombo={() => enableCombo(gi)}
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
              setRequirements([]);
            }}
            disabled={totalCount === 0}
            className="flex-1 h-11 rounded-lg bg-primary text-white text-body-sm font-semibold active:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            完成领药
            {totalCount > 0 && `（${totalCount} 项）`}
          </button>
        </div>
      </div>

      {aggOpen && (
        <AggregateDrawer
          onClose={() => setAggOpen(false)}
          onConfirm={handleAggregateConfirm}
        />
      )}
    </MobileShell>
  );
}


function DrugCard({
  group,
  onScanMore,
  onEnableCombo,
  onUpdateQty,
  onRemove,
}: {
  group: Group;
  onScanMore: () => void;
  onEnableCombo: () => void;
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
  const isCombo = !!group.combo || distinctDrugs.length > 1;
  const firstDrug = distinctDrugs[0];

  const comboTitle = useMemo(() => {
    const parts = distinctDrugs.slice(0, 3).map((d) => {
      const abbr = d.name.slice(0, 3);
      return d.name.length > 3 ? `${abbr}…` : abbr;
    });
    return `用药组合：${parts.join(" + ")}${distinctDrugs.length > 3 ? " + …" : ""}`;
  }, [distinctDrugs]);


  return (
    <>
      <div
        className="rounded-xl bg-card border p-3.5"
        style={{ borderColor: isCombo ? "#FFD2A8" : "#B8E0C2" }}
      >
        {/* 顶部：名称 + 卡片扫码入口 */}
        <div className="flex items-center gap-2">
          {isCombo ? (
            <span className="inline-flex -space-x-1 text-warning mt-0.5 shrink-0">
              <Pill className="h-4 w-4" />
              <Pill className="h-4 w-4" />
            </span>
          ) : (
            <Pill className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0 text-body font-semibold text-foreground truncate">
            {isCombo ? comboTitle : firstDrug.name}
          </div>
          {isCombo ? (
            <button
              onClick={onScanMore}
              className="h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0 active:opacity-80 bg-[#FFF1E6] text-[#E5751A]"
              aria-label="继续扫描"
            >
              <ScanLine className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setConfirmOpen(true)}
              className="text-caption text-primary active:opacity-70 shrink-0"
            >
              组合用药
            </button>
          )}
        </div>

        {/* 单药品专有信息 */}
        {!isCombo && firstDrug && (
          <>
            <div className="mt-2 text-caption text-text-tertiary">
              规格 <span className="text-text-secondary">{firstDrug.spec}</span>
              <span className="mx-2 text-border">·</span>
              扫码单位 <span className="text-text-secondary">{firstDrug.scanUnit}</span>
            </div>
          </>
        )}

        {/* 虚线分隔 */}
        <div className="my-3 border-t border-dashed border-border" />

        {/* 已领 总数 */}
        <div className={`text-caption text-right font-medium ${isCombo ? "text-[#E5751A]" : "text-primary"}`}>
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
                  <span className={isCombo ? "text-[#E5751A]" : "text-primary"}>{e.manufacturer}</span>
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

      {confirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-2xl bg-card p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-full bg-brand-subtle inline-flex items-center justify-center">
                <Pill className="h-4 w-4 text-primary" />
              </span>
              <h3 className="text-card-title text-foreground">组合用药确认</h3>
            </div>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              开启「组合用药」后，可继续扫描其他药品并合并到本卡片，用于需配药的场景。开启后无法恢复为单项药品卡片，请谨慎操作。
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 h-10 rounded-lg border border-border bg-card text-body-sm text-text-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onEnableCombo();
                  setConfirmOpen(false);
                }}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm"
              >
                确认开启
              </button>
            </div>
          </div>
        </div>
      )}


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
  const homeTaskMap = useMemo(() => {
    const m = new Map<string, HomeTask>();
    homeTasks.forEach((t) => m.set(t.id, t));
    return m;
  }, []);

  // 全部今日可备药任务：基于 PICKUPS 中存在的工单 + 当前角色可视
  const allTasks: HomeTask[] = useMemo(() => {
    const roleType: Record<string, string[]> = {
      vet: ["疾病治疗", "产后护理"],
      manager: ["疾病治疗", "产后护理"],
      vet_assistant: ["疾病治疗", "产后护理"],
      immunizer: ["疫苗免疫"],
      hoof_trimmer: ["修蹄"],
    };
    const types = roleType[role] ?? ["疾病治疗", "产后护理", "疫苗免疫", "修蹄"];
    const out: HomeTask[] = [];
    PICKUPS.forEach((p) => {
      const t = homeTaskMap.get(p.source);
      if (!t) return;
      if (t.status !== "进行中") return;
      if (!types.includes(t.type)) return;
      out.push(t);
    });
    return out;
  }, [role, homeTaskMap]);

  const barnOf = (t: HomeTask): string => {
    const pk = PICKUPS.find((p) => p.source === t.id);
    if (pk) return pk.barn;
    if (!t.target.startsWith("#")) return t.target.split(" · ")[0];
    return "未分配";
  };

  const allBarns = useMemo(() => {
    const s = new Set<string>();
    allTasks.forEach((t) => s.add(barnOf(t)));
    return Array.from(s).sort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTasks]);

  const [barnFilter, setBarnFilter] = useState<Set<string>>(new Set());
  const [barnOpen, setBarnOpen] = useState(false);
  const tasks = useMemo(
    () =>
      barnFilter.size === 0
        ? allTasks
        : allTasks.filter((t) => barnFilter.has(barnOf(t))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allTasks, barnFilter],
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allOn = tasks.length > 0 && tasks.every((t) => selected.has(t.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((s) => {
      const n = new Set(s);
      if (allOn) tasks.forEach((t) => n.delete(t.id));
      else tasks.forEach((t) => n.add(t.id));
      return n;
    });
  const toggleBarn = (b: string) =>
    setBarnFilter((s) => {
      const n = new Set(s);
      n.has(b) ? n.delete(b) : n.add(b);
      return n;
    });

  const barnLabel =
    barnFilter.size === 0
      ? `全部牛舍（${allBarns.length}）`
      : `已选 ${barnFilter.size} 个牛舍`;

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
            统计药品清单
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center text-text-secondary"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 牛舍筛选 —— 下拉式 */}
        {allBarns.length > 1 && (
          <div className="px-4 py-2 border-b border-border shrink-0">
            <button
              type="button"
              onClick={() => setBarnOpen((v) => !v)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-card flex items-center gap-2 active:bg-surface-subtle"
            >
              <span className="text-caption text-text-tertiary">按牛舍筛选</span>
              <span className="text-body-sm text-foreground truncate">
                {barnLabel}
              </span>
              {barnFilter.size > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBarnFilter(new Set());
                  }}
                  className="ml-1 text-caption text-primary"
                >
                  清除
                </span>
              )}
              {barnOpen ? (
                <ChevronUp className="ml-auto h-4 w-4 text-text-tertiary" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4 text-text-tertiary" />
              )}
            </button>
            {barnOpen && (
              <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border divide-y divide-border bg-card">
                {allBarns.map((b) => {
                  const on = barnFilter.has(b);
                  const cnt = allTasks.filter((t) => barnOf(t) === b).length;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleBarn(b)}
                      className={`w-full h-10 px-3 flex items-center gap-2 text-left active:bg-surface-subtle ${
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
                      <span className="text-body-sm text-foreground flex-1 truncate">
                        {b}
                      </span>
                      <span className="text-caption text-text-tertiary tabular-nums">
                        {cnt}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}



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
            {allOn ? "取消全选" : "全选"}
          </button>
          <span className="text-caption text-text-tertiary">
            已选 {selected.size} / {tasks.length}
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
          {tasks.length === 0 && (
            <div className="p-10 text-center text-caption text-text-tertiary">
              暂无今日待执行任务
            </div>
          )}
          {tasks.map((t) => {
            const on = selected.has(t.id);
            const meta = typeMeta[t.type];
            const Icon = meta?.icon ?? Pill;
            const barn = barnOf(t);
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
                    {barn}
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
            确认统计（{selected.size}）
          </button>
        </div>
      </div>
    </div>
  );
}

