import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import {
  CheckCircle2,
  Warehouse,
  ClipboardList,
  PackageCheck,
  ScanLine,
  AlertTriangle,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/mobile-shell";
import {
  claimPickup,
  getPickup,
  scanPickupItem,
  unscanPickupItem,
  useClaimed,
  useScannedItems,
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
  const scanned = useScannedItems(pickupId);
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
  const scannedCount = pickup.items.filter((it) => scanned.includes(it.name)).length;
  const allScanned = scannedCount === totalCount;

  const onScan = (name: string) => {
    if (isClaimed) return;
    scanPickupItem(pickupId, name);
    toast.success(`已核验：${name}`);
  };

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
              {isClaimed ? "已领药" : allScanned ? "可确认" : `${scannedCount}/${totalCount}`}
            </span>
          </div>
          <div className="mt-2 text-section-title text-foreground">{pickup.title}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-body text-foreground">
            <Warehouse className="h-3.5 w-3.5 text-primary" />
            {pickup.warehouse}
          </div>
        </div>

        {/* 物品清单：每项需扫码核验 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-card-title text-foreground inline-flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-primary" />
              领取清单
            </div>
            <span className="text-caption text-text-tertiary">共 {totalCount} 项</span>
          </div>

          <div className="space-y-2">
            {pickup.items.map((it) => {
              const done = scanned.includes(it.name);
              return (
                <div
                  key={it.name}
                  className={`rounded-lg border px-3 py-2.5 ${
                    done
                      ? "border-primary/40 bg-brand-subtle/30"
                      : "border-border bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-body text-foreground inline-flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                        <span className="truncate">{it.name}</span>
                      </div>
                      {it.spec && (
                        <div className="text-caption text-text-tertiary mt-1">
                          规格 {it.spec}
                        </div>
                      )}
                      <div className="mt-1.5 flex items-center gap-3 text-caption">
                        <span className="text-text-secondary">
                          需领 <span className="font-mono text-foreground">{it.qty}</span>
                        </span>
                        <span className="text-text-tertiary">
                          库存 <span className="font-mono">{it.stock ?? "—"}</span>
                        </span>
                      </div>
                    </div>
                    {done ? (
                      <button
                        type="button"
                        onClick={() => unscanPickupItem(pickupId, it.name)}
                        disabled={isClaimed}
                        className="shrink-0 inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-caption text-primary disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" /> 已核验
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onScan(it.name)}
                        className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-caption"
                      >
                        <ScanLine className="h-4 w-4" /> 扫码核验
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isClaimed && (
            <div className="mt-3 rounded-lg bg-brand-subtle px-3 py-2 text-caption text-text-secondary inline-flex items-start gap-1.5 w-full">
              <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                逐一扫描每个药品/器材上的二维码完成取药记录，全部核验后点击下方按钮确认领药。
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
            {allScanned ? "确认完成领药" : `还需核验 ${totalCount - scannedCount} 项`}
          </button>
        </div>
      )}
    </MobileShell>
  );
}
