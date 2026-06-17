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
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/mobile-shell";
import {
  claimPickup,
  getPickup,
  parseQty,
  setScanQty,
  useClaimed,
  useScannedQty,
} from "@/lib/pickup-store";

export const Route = createFileRoute("/m/health/$id_/execute_/$pickupId")({
  head: () => ({ meta: [{ title: "药品器材领取 · 奇点智牧" }] }),
  component: PickupDetailPage,
});

function PickupDetailPage() {
  const { id: workOrderId, pickupId } = useParams({
    from: "/m/health/$id_/execute_/$pickupId",
  });
  const navigate = useNavigate();
  const claimed = useClaimed();
  const scannedQty = useScannedQty(pickupId);
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
    (it) => (scannedQty[it.name] ?? 0) >= parseQty(it.qty).num,
  ).length;
  const allScanned = doneCount === totalCount;

  const onConfirm = () => {
    if (!allScanned) return;
    claimPickup(pickupId);
    toast.success("已完成领药");
    navigate({
      to: "/m/health/$id",
      params: { id: workOrderId },
      search: { tab: "execute" },
    });
  };

  return (
    <MobileShell title="药品器材领取" back hideTabBar>
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

          <div className="space-y-2">
            {pickup.items.map((it) => (
              <PickupItemRow
                key={it.name}
                item={it}
                pickupId={pickupId}
                currentQty={scannedQty[it.name] ?? 0}
                disabled={isClaimed}
              />
            ))}
          </div>

          {!isClaimed && (
            <div className="mt-3 rounded-lg bg-brand-subtle px-3 py-2 text-caption text-text-secondary inline-flex items-start gap-1.5 w-full">
              <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                按所需数量逐一扫描药品二维码完成取药记录，全部核验后点击下方按钮确认领药。
              </span>
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
  currentQty,
  disabled,
}: {
  item: import("@/lib/pickup-store").PickupItem;
  pickupId: string;
  currentQty: number;
  disabled: boolean;
}) {
  const { num: needNum, unit } = parseQty(item.qty);
  const unitScannable = item.unitScannable !== false; // 默认情况一
  const maxForCase2 = Math.min(needNum, item.packRemain ?? needNum);
  const done = currentQty >= needNum;

  const onScanOne = () => {
    if (disabled || done) return;
    const next = Math.min(currentQty + 1, needNum);
    setScanQty(pickupId, item.name, next);
    if (next === needNum) toast.success(`已扫齐 · ${item.name}`);
  };

  const onScanPack = () => {
    if (disabled || currentQty > 0) return;
    setScanQty(pickupId, item.name, 1);
    toast.success(`已识别包装 · ${item.name}`);
  };

  const onDelta = (delta: number) => {
    if (disabled) return;
    const next = Math.max(0, Math.min(currentQty + delta, maxForCase2));
    setScanQty(pickupId, item.name, next);
  };

  const onInput = (v: string) => {
    if (disabled) return;
    const n = Number(v.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n)) return;
    const next = Math.max(0, Math.min(n, maxForCase2));
    setScanQty(pickupId, item.name, next);
  };

  const onReset = () => {
    if (disabled) return;
    setScanQty(pickupId, item.name, 0);
  };

  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        done ? "border-primary/40 bg-brand-subtle/30" : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-body text-foreground inline-flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
            <span className="truncate">{item.name}</span>
          </div>
          {item.spec && (
            <div className="text-caption text-text-tertiary mt-1">规格 {item.spec}</div>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-caption">
            <span className="text-text-secondary">
              需领 <span className="font-mono text-foreground">{item.qty}</span>
            </span>
            <span className="text-text-tertiary">
              库存 <span className="font-mono">{item.stock ?? "—"}</span>
            </span>
          </div>
        </div>
        {done && (
          <span className="shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-md bg-brand-subtle text-caption text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" /> 已扫齐
          </span>
        )}
      </div>

      {/* 进度 + 操作 */}
      <div className="mt-2.5 pt-2.5 border-t border-dashed border-border">
        <div className="flex items-center justify-between text-caption">
          <span className="text-text-tertiary">
            已扫{" "}
            <span className="font-mono text-foreground">
              {currentQty}
            </span>{" "}
            / <span className="font-mono">{needNum}</span> {unit}
          </span>
          {unitScannable ? (
            <span className="text-text-tertiary">单支可扫</span>
          ) : (
            <span className="text-text-tertiary">
              包装扫描 · 本包可取 {maxForCase2} {unit}
            </span>
          )}
        </div>

        {!disabled && (
          <div className="mt-2">
            {unitScannable ? (
              // 情况一：单支码，逐一扫描
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onScanOne}
                  disabled={done}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <ScanLine className="h-4 w-4" /> 扫码 +1
                </button>
                {currentQty > 0 && (
                  <button
                    type="button"
                    onClick={onReset}
                    className="h-9 px-3 rounded-lg border border-border text-body-sm text-text-secondary inline-flex items-center gap-1"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> 重置
                  </button>
                )}
              </div>
            ) : currentQty === 0 ? (
              // 情况二未扫包装
              <button
                type="button"
                onClick={onScanPack}
                className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1"
              >
                <ScanLine className="h-4 w-4" /> 扫描包装二维码
              </button>
            ) : (
              // 情况二：包装已扫，输入数量
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onDelta(-1)}
                    disabled={currentQty <= 1}
                    className="h-9 w-9 inline-flex items-center justify-center text-text-secondary disabled:opacity-40"
                    aria-label="减少"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={currentQty}
                    onChange={(e) => onInput(e.target.value)}
                    className="w-12 h-9 text-center font-mono text-body-sm bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onDelta(1)}
                    disabled={currentQty >= maxForCase2}
                    className="h-9 w-9 inline-flex items-center justify-center text-text-secondary disabled:opacity-40"
                    aria-label="增加"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-caption text-text-tertiary flex-1">
                  {unit}（1 – {maxForCase2}）
                </span>
                <button
                  type="button"
                  onClick={onReset}
                  className="h-9 px-2.5 rounded-lg border border-border text-caption text-text-secondary inline-flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
