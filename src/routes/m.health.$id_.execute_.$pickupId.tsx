import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  CheckCircle2,
  Warehouse,
  ClipboardList,
  PackageCheck,
  ScanLine,
  AlertTriangle,
  Package,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/mobile-shell";
import {
  addScannedEntry,
  claimPickup,
  genBatch,
  genScanCode,
  getPickup,
  parseQty,
  pickManufacturer,
  removeScannedEntry,
  updateScannedEntryQty,
  useClaimed,
  useScannedCodes,
  type ScannedEntry,
} from "@/lib/pickup-store";

export const Route = createFileRoute("/m/health/$id_/execute_/$pickupId")({
  head: () => ({ meta: [{ title: "药品领取 · 奇点智牧" }] }),
  component: PickupDetailPage,
});

function scanUnitOf(item: import("@/lib/pickup-store").PickupItem) {
  const { unit } = parseQty(item.qty);
  return item.unitScannable === false ? "包装" : unit || "最小单位";
}

function entryQtySum(list: ScannedEntry[]) {
  return list.reduce((s, e) => s + (e.qty || 0), 0);
}

function PickupDetailPage() {
  const { id: workOrderId, pickupId } = useParams({
    from: "/m/health/$id_/execute_/$pickupId",
  });
  const navigate = useNavigate();
  const claimed = useClaimed();
  const scannedMap = useScannedCodes(pickupId);
  const pickup = getPickup(pickupId);

  const isClaimed = claimed.includes(pickupId);

  if (!pickup) {
    return (
      <MobileShell title="领取单" back hideTabBar>
        <div className="px-4 pt-10 text-center text-body-sm text-text-tertiary">
          未找到该领取单
        </div>
      </MobileShell>
    );
  }

  const totalCount = pickup.items.length;
  const doneCount = pickup.items.filter(
    (it) => entryQtySum(scannedMap[it.name] ?? []) >= parseQty(it.qty).num,
  ).length;
  const allScanned = doneCount === totalCount;

  const onConfirm = () => {
    if (!allScanned) return;
    claimPickup(pickupId);
    toast.success("已完成领药");
    navigate({
      to: "/m/health/$id/execute",
      params: { id: workOrderId },
    });
  };

  return (
    <MobileShell title="药品领取" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-3">
        {/* 状态卡 */}
        <div
          className={`rounded-xl p-4 border ${
            isClaimed ? "bg-surface-subtle border-border" : "bg-card border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck
                className={`h-4 w-4 ${isClaimed ? "text-text-tertiary" : "text-primary"}`}
              />
              <span className="font-mono text-body text-foreground">{pickup.id}</span>
              <span className="tag tag-muted">领取单</span>
            </div>
            <span className={isClaimed ? "tag tag-success" : "tag tag-brand"}>
              {isClaimed ? "已领药" : allScanned ? "可确认" : `${doneCount}/${totalCount}`}
            </span>
          </div>
          <div className="mt-2 text-section-title text-foreground">{pickup.title}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-body text-foreground">
            <Warehouse className="h-3.5 w-3.5 text-primary" />
            {pickup.warehouse}
          </div>
        </div>

        {/* 物品清单 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-card-title text-foreground inline-flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-primary" />
              领取清单
            </div>
            <span className="text-caption text-text-tertiary">共 {totalCount} 项</span>
          </div>

          <div className="space-y-2.5">
            {pickup.items.map((it) => (
              <PickupItemRow
                key={it.name}
                item={it}
                pickupId={pickupId}
                entries={scannedMap[it.name] ?? []}
                disabled={isClaimed}
              />
            ))}
          </div>

          {!isClaimed && (
            <div className="mt-3 rounded-lg bg-brand-subtle px-3 py-2 text-caption text-text-secondary inline-flex items-start gap-1.5 w-full">
              <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>按所需数量扫描药品二维码完成取药记录，全部核验后点击下方按钮确认领药。</span>
            </div>
          )}
        </div>
      </div>

      {!isClaimed && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            type="button"
            disabled={!allScanned}
            onClick={onConfirm}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4" />
            完成领药
          </button>
        </div>
      )}
    </MobileShell>
  );
}

function PickupItemRow({
  item,
  pickupId,
  entries,
  disabled,
}: {
  item: import("@/lib/pickup-store").PickupItem;
  pickupId: string;
  entries: ScannedEntry[];
  disabled: boolean;
}) {
  const { num: needNum, unit } = parseQty(item.qty);
  const unitScannable = item.unitScannable !== false;
  const taken = entryQtySum(entries);
  const remainingNeed = Math.max(0, needNum - taken);
  const done = taken >= needNum;
  const scanUnit = scanUnitOf(item);

  const sources = item.stockSources ?? [];
  const allowMix = item.allowMixManufacturer !== false;
  const existingMfrs = Array.from(
    new Set(entries.map((e) => e.manufacturer).filter(Boolean) as string[]),
  );

  const attemptsRef = useRef(0);
  const [scanner, setScanner] = useState<null | {
    manufacturer: string;
    batch: string;
    code: string;
    packRemain?: number;
    blocked?: string;
  }>(null);

  const openScanner = () => {
    if (disabled || remainingNeed <= 0) return;
    const attempt = attemptsRef.current;
    const picked =
      sources.length > 0
        ? sources[attempt % sources.length]
        : { manufacturer: pickManufacturer(item.name, attempt), qty: 0 };
    const manufacturer = picked.manufacturer;
    const batch = genBatch();
    attemptsRef.current = attempt + 1;

    const blocked =
      !allowMix && existingMfrs.length > 0 && !existingMfrs.includes(manufacturer)
        ? existingMfrs[0]
        : undefined;

    if (unitScannable) {
      setScanner({ manufacturer, batch, code: genScanCode("UNIT"), blocked });
    } else {
      const remainPool = [4, 16, 8];
      const packRemain = remainPool[entries.length % remainPool.length];
      setScanner({
        manufacturer,
        batch,
        code: genScanCode("PACK"),
        packRemain,
        blocked,
      });
    }
  };

  const commitScan = () => {
    if (!scanner) return;
    const { manufacturer, batch, code, packRemain, blocked } = scanner;
    setScanner(null);

    if (blocked) {
      toast.warning(
        `该药品不允许多厂商混用，已使用「${blocked}」，请勿扫描「${manufacturer}」`,
        {
          style: {
            background: "#FFF7E6",
            border: "1px solid #FFD591",
            color: "#AD4E00",
          },
        },
      );
      return;
    }

    if (unitScannable) {
      addScannedEntry(pickupId, item.name, { code, qty: 1, manufacturer, batch });
      if (taken + 1 === needNum) toast.success(`已扫齐 · ${item.name}`);
    } else {
      addScannedEntry(pickupId, item.name, {
        code,
        qty: 1,
        packRemain,
        manufacturer,
        batch,
      });
      if ((packRemain ?? 0) < remainingNeed) {
        toast.warning(`包内仅余 ${packRemain} ${unit}，请继续扫描其他包装`, {
          style: {
            background: "#FFF7E6",
            border: "1px solid #FFD591",
            color: "#AD4E00",
          },
        });
      } else {
        toast.success(`已识别包装 · ${item.name}`);
      }
    }
  };


  const maxForEntry = (idx: number) => {
    if (unitScannable) return 1;
    const entry = entries[idx];
    const others = entries.reduce((s, e, i) => (i === idx ? s : s + (e.qty || 0)), 0);
    const remainByNeed = Math.max(1, needNum - others);
    const packCap = entry?.packRemain ?? remainByNeed;
    return Math.min(remainByNeed, packCap);
  };

  return (
    <div
      className={`rounded-xl border ${
        done ? "border-primary/50 bg-brand-subtle/40" : "border-primary/20 bg-brand-subtle/20"
      }`}
    >
      {/* 顶部：药品标题区（绿色调） */}
      <div className="px-3.5 pt-3 pb-2.5 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-card-title text-foreground inline-flex items-center gap-1.5">
            <Package className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">{item.name}</span>
          </div>
          <div className="mt-1.5 text-caption text-text-tertiary">
            规格 <span className="text-text-secondary">{item.spec ?? "—"}</span>
            <span className="mx-1.5 text-border">·</span>
            扫码单位 <span className="text-text-secondary">{scanUnit}</span>
          </div>
          <div className="mt-0.5 text-caption text-text-tertiary">
            所需 <span className="font-mono text-foreground">{item.qty}</span>
            <span className="mx-1.5 text-border">·</span>
            库存 <span className="font-mono">{item.stock ?? "—"}</span>
          </div>
          {sources.length > 0 && (
            <div className="mt-1 text-caption text-text-tertiary flex items-start gap-1 flex-wrap">
              <span className="shrink-0">厂商</span>
              <span className="inline-flex items-center gap-1 flex-wrap">
                {sources.map((s, i) => (
                  <span key={s.manufacturer} className="inline-flex items-center gap-1">
                    {i > 0 && <span className="text-border">·</span>}
                    <span className="text-text-secondary">{s.manufacturer}</span>
                    <span className="font-mono text-text-tertiary">
                      {s.qty}
                      {s.unit ?? ""}
                    </span>
                  </span>
                ))}
                <span
                  className={`ml-1 px-1.5 rounded text-[10px] leading-4 border ${
                    allowMix
                      ? "border-border text-text-tertiary"
                      : "border-[#FFD591] text-[#AD4E00] bg-[#FFF7E6]"
                  }`}
                >
                  {allowMix ? "允许混用" : "不可混用"}
                </span>
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onScan}
          disabled={disabled || done}
          aria-label="扫描"
          className="shrink-0 h-10 w-10 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ScanLine className="h-5 w-5" />
        </button>
      </div>

      {/* 分隔 + 已取统计 + 扫描结果 */}
      <div className="border-t border-dashed border-primary/20 px-3.5 pt-2 pb-3">
        <div className="flex items-center justify-end text-caption">
          <span className="text-text-tertiary">
            已取{" "}
            <span className={`font-mono ${done ? "text-primary" : "text-foreground"}`}>
              {taken}
            </span>
            <span className="text-text-tertiary">/{needNum}</span>{" "}
            <span className="text-text-tertiary">{unit}</span>
          </span>
        </div>

        {entries.length > 0 && (
          <ul className="mt-2 space-y-2">
            {entries.map((e, idx) => {
              const max = maxForEntry(idx);
              return (
                <li
                  key={`${e.code}-${idx}`}
                  className="flex items-start gap-2 text-caption"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-text-secondary truncate">{e.code}</div>
                    <div className="mt-0.5 text-text-tertiary inline-flex items-center gap-1.5 flex-wrap">
                      {e.manufacturer && (
                        <span className="text-primary">{e.manufacturer}</span>
                      )}
                      {e.batch && (
                        <>
                          <span className="text-border">·</span>
                          <span className="font-mono">{e.batch}</span>
                        </>
                      )}
                    </div>
                    {!unitScannable && (
                      <div className="text-text-tertiary mt-0.5">
                        包内剩余{" "}
                        <span className="font-mono text-text-secondary">
                          {Math.max(0, (e.packRemain ?? 0) - e.qty)}
                        </span>{" "}
                        / {e.packRemain ?? "—"} {unit}
                      </div>
                    )}
                  </div>
                  {unitScannable ? (
                    <span className="font-mono text-foreground shrink-0 pt-0.5">
                      ×1 {unit}
                    </span>
                  ) : (
                    <div className="inline-flex items-center rounded-md border border-border overflow-hidden shrink-0">
                      <button
                        type="button"
                        disabled={disabled || e.qty <= 1}
                        onClick={() =>
                          updateScannedEntryQty(
                            pickupId,
                            item.name,
                            idx,
                            Math.max(1, e.qty - 1),
                          )
                        }
                        className="h-7 w-7 inline-flex items-center justify-center text-text-secondary disabled:opacity-40"
                        aria-label="减少"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[2.25rem] text-center font-mono text-body-sm">
                        {e.qty}
                      </span>
                      <button
                        type="button"
                        disabled={disabled || e.qty >= max}
                        onClick={() =>
                          updateScannedEntryQty(
                            pickupId,
                            item.name,
                            idx,
                            Math.min(max, e.qty + 1),
                          )
                        }
                        className="h-7 w-7 inline-flex items-center justify-center text-text-secondary disabled:opacity-40"
                        aria-label="增加"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeScannedEntry(pickupId, item.name, idx)}
                      aria-label="删除"
                      className="h-7 w-7 inline-flex items-center justify-center text-text-tertiary hover:text-foreground shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
