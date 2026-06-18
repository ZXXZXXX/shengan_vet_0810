import { useMemo } from "react";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import {
  CheckCircle2,
  Warehouse,
  ClipboardList,
  PackageCheck,
  AlertTriangle,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/mobile-shell";
import {
  PICKUPS,
  parseQty,
  claimPickup,
  useClaimed,
  useScannedCodes,
  type PickupItem,
  type StockSource,
  type ScannedEntry,
} from "@/lib/pickup-store";
import { PickupItemRow } from "./m.health.$id_.execute_.$pickupId";
import { homeTasks, type HomeTask } from "./m.homepage";

export const Route = createFileRoute("/m/health/today/pickup")({
  validateSearch: (s: Record<string, unknown>) => ({
    ids: typeof s.ids === "string" ? s.ids : "",
  }),
  head: () => ({ meta: [{ title: "批量领药 · 奇点智牧" }] }),
  component: BatchPickupPage,
});

function inferBarn(t: HomeTask): string {
  if (!t.target.startsWith("#")) return t.target.split(" · ")[0];
  const tail = t.target.slice(-1);
  const n = Number.isFinite(Number(tail)) ? Number(tail) : 1;
  return `${(n % 4) + 1} 号牛舍`;
}

type Allocation = {
  woId: string;
  pickupId: string;
  cattle: string;
  barn: string;
  qty: number;
  unit: string;
};

type AggregatedItem = {
  item: PickupItem;
  allocations: Allocation[];
  sourcePickupIds: string[];
};

function mergeStockSources(list: StockSource[][]): StockSource[] {
  const m = new Map<string, StockSource>();
  list.flat().forEach((s) => {
    const cur = m.get(s.manufacturer);
    if (cur) cur.qty = Math.max(cur.qty, s.qty);
    else m.set(s.manufacturer, { ...s });
  });
  return Array.from(m.values());
}

function entryQtySum(list: ScannedEntry[]) {
  return list.reduce((s, e) => s + (e.qty || 0), 0);
}

function BatchPickupPage() {
  const { ids } = useSearch({ from: "/m/health/today/pickup" });
  const navigate = useNavigate();
  const claimed = useClaimed();

  const woIds = useMemo(
    () => (ids ? ids.split(",").filter(Boolean) : []),
    [ids],
  );

  const batchId = useMemo(
    () => `BATCH-${[...woIds].sort().join("-")}`,
    [woIds],
  );

  const scannedMap = useScannedCodes(batchId);

  const { aggregated, pickupIds, warehouse, cattleCount } = useMemo(() => {
    const map = new Map<string, AggregatedItem>();
    const pids = new Set<string>();
    const cattleSet = new Set<string>();
    let wh = "";
    woIds.forEach((woId) => {
      const task = homeTasks.find((t) => t.id === woId);
      const pk = PICKUPS.find((p) => p.source === woId);
      if (!task || !pk) return;
      pids.add(pk.id);
      if (!wh) wh = pk.warehouse;
      const cattle = task.target.startsWith("#")
        ? task.target
        : task.target;
      cattleSet.add(cattle);
      const barn = inferBarn(task);
      pk.items.forEach((it) => {
        const { num, unit } = parseQty(it.qty);
        const key = `${it.name}|${it.spec ?? ""}`;
        const cur = map.get(key);
        const alloc: Allocation = {
          woId,
          pickupId: pk.id,
          cattle,
          barn,
          qty: num,
          unit,
        };
        if (cur) {
          const prev = parseQty(cur.item.qty);
          cur.item = {
            ...cur.item,
            qty: `${prev.num + num} ${unit || prev.unit}`.trim(),
            stockSources: mergeStockSources([
              cur.item.stockSources ?? [],
              it.stockSources ?? [],
            ]),
            allowMixManufacturer:
              (cur.item.allowMixManufacturer ?? true) &&
              (it.allowMixManufacturer ?? true),
            unitScannable:
              (cur.item.unitScannable ?? true) && (it.unitScannable ?? true),
          };
          cur.allocations.push(alloc);
          if (!cur.sourcePickupIds.includes(pk.id))
            cur.sourcePickupIds.push(pk.id);
        } else {
          map.set(key, {
            item: { ...it },
            allocations: [alloc],
            sourcePickupIds: [pk.id],
          });
        }
      });
    });
    return {
      aggregated: Array.from(map.values()),
      pickupIds: Array.from(pids),
      warehouse: wh || "中央药房",
      cattleCount: cattleSet.size,
    };
  }, [woIds]);

  const totalCount = aggregated.length;
  const doneCount = aggregated.filter((a) => {
    const need = parseQty(a.item.qty).num;
    return entryQtySum(scannedMap[a.item.name] ?? []) >= need;
  }).length;
  const allScanned = totalCount > 0 && doneCount === totalCount;

  const allAlreadyClaimed =
    pickupIds.length > 0 && pickupIds.every((id) => claimed.includes(id));

  const onConfirm = () => {
    if (!allScanned) return;
    pickupIds.forEach((id) => claimPickup(id));
    toast.success(`已完成 ${pickupIds.length} 项领药`);
    navigate({ to: "/m/health/today" });
  };

  return (
    <MobileShell title="批量领药" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-3">
        {/* 状态卡 */}
        <div
          className={`rounded-xl p-4 border ${
            allAlreadyClaimed
              ? "bg-surface-subtle border-border"
              : "bg-card border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck
                className={`h-4 w-4 ${allAlreadyClaimed ? "text-text-tertiary" : "text-primary"}`}
              />
              <span className="font-mono text-body text-foreground">
                {batchId.length > 18 ? batchId.slice(0, 18) + "…" : batchId}
              </span>
              <span className="tag tag-muted">合并领取单</span>
            </div>
            <span
              className={
                allAlreadyClaimed
                  ? "tag tag-success"
                  : allScanned
                    ? "tag tag-brand"
                    : "tag tag-muted"
              }
            >
              {allAlreadyClaimed
                ? "已领药"
                : allScanned
                  ? "可确认"
                  : `${doneCount}/${totalCount}`}
            </span>
          </div>
          <div className="mt-2 text-section-title text-foreground">
            合并领取 {pickupIds.length} 张领取单
          </div>
          <div className="mt-1 text-caption text-text-tertiary">
            覆盖 {cattleCount} 头牛 · {totalCount} 种药品
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-body text-foreground">
            <Warehouse className="h-3.5 w-3.5 text-primary" />
            {warehouse}
          </div>
        </div>

        {/* 药品清单 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-card-title text-foreground inline-flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-primary" />
              合并领取清单
            </div>
            <span className="text-caption text-text-tertiary">
              共 {totalCount} 种
            </span>
          </div>

          {aggregated.length === 0 ? (
            <div className="py-6 text-center text-body-sm text-text-tertiary">
              所选任务均无需领药
            </div>
          ) : (
            <div className="space-y-3">
              {aggregated.map((a) => (
                <div key={a.item.name + (a.item.spec ?? "")} className="space-y-1.5">
                  {/* 关联牛只明细 */}
                  <div className="rounded-lg bg-surface-subtle px-3 py-2">
                    <div className="flex items-center gap-1.5 text-caption text-text-tertiary mb-1">
                      <Users className="h-3 w-3" />
                      <span>关联牛只 ({a.allocations.length})</span>
                    </div>
                    <ul className="space-y-1">
                      {a.allocations.map((al, i) => (
                        <li
                          key={al.woId + i}
                          className="flex items-center justify-between text-caption"
                        >
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-text-secondary truncate">
                              {al.cattle}
                            </span>
                            <span className="text-text-tertiary shrink-0">
                              · {al.barn}
                            </span>
                          </span>
                          <span className="text-text-secondary tabular-nums shrink-0">
                            {al.qty}
                            <span className="text-text-tertiary ml-0.5">
                              {al.unit}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <PickupItemRow
                    item={a.item}
                    pickupId={batchId}
                    entries={scannedMap[a.item.name] ?? []}
                    disabled={allAlreadyClaimed}
                  />
                </div>
              ))}
            </div>
          )}

          {!allAlreadyClaimed && aggregated.length > 0 && (
            <div className="mt-3 rounded-lg bg-brand-subtle px-3 py-2 text-caption text-text-secondary inline-flex items-start gap-1.5 w-full">
              <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                按合并后的总数量扫描药品二维码，全部核验后确认领药，系统将自动按上方分配关联到对应牛只。
              </span>
            </div>
          )}
        </div>
      </div>

      {!allAlreadyClaimed && aggregated.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            type="button"
            disabled={!allScanned}
            onClick={onConfirm}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4" />
            完成领药 ({pickupIds.length} 项)
          </button>
        </div>
      )}
    </MobileShell>
  );
}
