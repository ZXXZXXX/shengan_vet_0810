import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Warehouse,
  ClipboardList,
  Home,
  PackageCheck,
  QrCode,
  AlertTriangle,
  ScanLine,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import {
  claimPickup,
  getPickup,
  qrMatrix,
  useClaimed,
} from "@/lib/pickup-store";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/m/pickup/$id")({
  head: () => ({ meta: [{ title: "药品器材领取 · 奇点智牧" }] }),
  component: PickupDetailPage,
});

function PickupDetailPage() {
  const { id } = useParams({ from: "/m/pickup/$id" });
  const navigate = useNavigate();
  const claimed = useClaimed();
  const [confirm, setConfirm] = useState(false);
  const pickup = getPickup(id);
  const isClaimed = claimed.includes(id);

  if (!pickup) {
    return (
      <MobileShell title="领取单" back hideTabBar>
        <div className="px-4 pt-10 text-center text-body-sm text-text-tertiary">
          未找到该领取单
        </div>
      </MobileShell>
    );
  }

  const matrix = qrMatrix(pickup.id);

  return (
    <MobileShell title="药品器材领取" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-3">
        {/* 状态卡 */}
        <div
          className={`rounded-xl p-4 border ${
            isClaimed
              ? "bg-surface-subtle border-border"
              : "bg-card border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck
                className={`h-4 w-4 ${
                  isClaimed ? "text-text-tertiary" : "text-primary"
                }`}
              />
              <span className="font-mono text-body text-foreground">
                {pickup.id}
              </span>
              <span className="tag tag-muted">领取单</span>
            </div>
            <span
              className={
                isClaimed
                  ? "tag tag-success"
                  : "tag tag-brand"
              }
            >
              {isClaimed ? "已核销" : "待领取"}
            </span>
          </div>
          <div className="mt-2 text-section-title text-foreground">
            {pickup.title}
          </div>
          <div className="text-caption text-text-tertiary mt-1">
            关联 {pickup.source} · {pickup.barn} · 出诊通过 {pickup.approvedAt}
          </div>
        </div>

        {/* 领取信息 */}
        <div className="rounded-xl bg-card border border-border divide-y divide-border">
          <Row
            label="领取地点"
            value={
              <span className="text-body text-foreground inline-flex items-center gap-1.5">
                <Warehouse className="h-3.5 w-3.5 text-primary" />
                {pickup.warehouse}
              </span>
            }
          />
          <Row
            label="出诊人"
            value={<span className="text-body text-foreground">{pickup.visitor}</span>}
          />
          <Row
            label="使用牛舍"
            value={
              <span className="text-body text-foreground inline-flex items-center gap-1">
                <Home className="h-3.5 w-3.5 text-text-tertiary" />
                {pickup.barn}
              </span>
            }
          />
        </div>

        {/* 物品清单 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-card-title text-foreground inline-flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-primary" />
              物品清单
            </div>
            <span className="text-caption text-text-tertiary">
              共 {pickup.items.length} 项
            </span>
          </div>
          <div className="space-y-2">
            {pickup.items.map((it) => (
              <div
                key={it.name}
                className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg bg-surface-subtle"
              >
                <div className="min-w-0">
                  <div className="text-body text-foreground truncate">
                    {it.name}
                  </div>
                  {it.spec && (
                    <div className="text-caption text-text-tertiary mt-0.5">
                      规格 {it.spec}
                    </div>
                  )}
                </div>
                <span className="font-mono text-body text-primary shrink-0">
                  × {it.qty}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 二维码 */}
        <div
          className={`rounded-xl border p-4 ${
            isClaimed
              ? "bg-surface-subtle border-border"
              : "bg-card border-border"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-card-title text-foreground inline-flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-primary" />
              领取二维码
            </div>
            <span className="text-caption text-text-tertiary">
              {isClaimed ? "已核销" : "出示给库管扫码"}
            </span>
          </div>

          <div className="relative mx-auto w-[220px] aspect-square rounded-xl bg-white border border-border p-3 overflow-hidden">
            <div
              className="grid w-full h-full"
              style={{
                gridTemplateColumns: `repeat(${matrix.length}, 1fr)`,
                gridTemplateRows: `repeat(${matrix.length}, 1fr)`,
                filter: isClaimed ? "grayscale(1) opacity(0.35)" : undefined,
              }}
            >
              {matrix.flatMap((row, ri) =>
                row.map((on, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className={on ? "bg-foreground" : "bg-white"}
                  />
                ))
              )}
            </div>
            {isClaimed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-3 py-1 rounded-md bg-[var(--state-success)] text-white text-caption inline-flex items-center gap-1 rotate-[-12deg]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  已核销
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 text-center font-mono text-caption text-text-tertiary">
            {pickup.id}
          </div>

          {!isClaimed && (
            <div className="mt-3 rounded-lg bg-brand-subtle px-3 py-2 text-caption text-text-secondary inline-flex items-start gap-1.5 w-full">
              <AlertTriangle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                到达 {pickup.warehouse} 后，向库管出示此二维码完成核销，核销后工作自动转为「已完成」。
              </span>
            </div>
          )}

          {isClaimed && (
            <div className="mt-3 text-caption text-text-tertiary text-center">
              核销完成，物品已签收。本二维码不可再次使用。
            </div>
          )}
        </div>

        <Link
          to="/m/health/$id"
          params={{ id: pickup.source }}
          className="block text-center text-caption text-primary"
        >
          查看关联工作 {pickup.source} →
        </Link>
      </div>

      {/* 底部操作 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {isClaimed ? (
          <button
            onClick={() => navigate({ to: "/m" })}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body"
          >
            返回工作台
          </button>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
          >
            <ScanLine className="h-4 w-4" /> 模拟核销（演示）
          </button>
        )}
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="!max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>确认核销该领取单?</AlertDialogTitle>
            <AlertDialogDescription>
              核销后二维码将失效，本领取单将从待办列表移除并转为「已完成」。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                claimPickup(pickup.id);
                setConfirm(false);
              }}
            >
              确认核销
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <span className="text-caption text-text-tertiary shrink-0">{label}</span>
      <div className="min-w-0 text-right">{value}</div>
    </div>
  );
}
