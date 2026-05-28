import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  PackageCheck,
  PackageX,
  ChevronRight,
  QrCode,
  Inbox,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import {
  PICKUPS,
  useClaimed,
  usePickupHistory,
  invalidatePickup,
} from "@/lib/pickup-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/m/pickup/")({
  head: () => ({ meta: [{ title: "待领物 · 奇点智牧" }] }),
  component: PickupListPage,
});

const REASONS = [
  "现场已有备用物资",
  "工单临时取消 / 暂缓",
  "由其他人代为领取",
  "调整为替代物资",
  "其它",
];

function PickupListPage() {
  const claimed = useClaimed();
  const history = usePickupHistory();
  const list = PICKUPS.filter((p) => !claimed.includes(p.id) && !history.some((h) => h.id === p.id));
  const [skipId, setSkipId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [other, setOther] = useState("");
  const navigate = useNavigate();

  const skipping = skipId ? PICKUPS.find((p) => p.id === skipId) ?? null : null;

  const openSkip = (id: string) => {
    setSkipId(id);
    setReason("");
    setOther("");
  };

  const submitSkip = () => {
    if (!skipping) return;
    const final = reason === "其它" ? other.trim() : reason;
    if (!final) {
      toast.error("请选择或填写原因");
      return;
    }
    invalidatePickup(skipping.id, final);
    toast.success(`已提交「无需领物」· ${final}`);
    setSkipId(null);
  };

  return (
    <MobileShell title="待领物" back>
      <div className="px-4 pt-3">
        <div className="rounded-lg bg-surface-subtle border border-border px-3 py-2 text-caption text-text-tertiary inline-flex items-start gap-1.5 w-full">
          <MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" />
          <span>当前牧场共 {list.length} 项待领取，逾期未领将自动转交回库管。</span>
        </div>
      </div>

      <div className="px-4 mt-3 pb-6 space-y-2.5">
        {list.length === 0 && (
          <div className="py-16 text-center">
            <Inbox className="h-8 w-8 mx-auto text-text-tertiary" />
            <div className="mt-2 text-body-sm text-text-tertiary">暂无待领物</div>
          </div>
        )}

        {list.map((p) => (
          <article
            key={p.id}
            className="relative rounded-xl bg-card border border-primary/30 overflow-hidden"
          >
            <span className="pointer-events-none absolute -right-4 -top-4 text-primary opacity-[0.10]">
              <QrCode className="h-24 w-24" strokeWidth={1} />
            </span>
            <Link
              to="/m/pickup/$id"
              params={{ id: p.id }}
              className="relative block p-4 active:bg-surface-subtle"
            >
              {/* Header */}
              <div className="flex items-center gap-1.5 text-body-sm">
                <span className="tag tag-brand">待领取</span>
                <span className="font-mono text-text-tertiary text-caption ml-auto">{p.id}</span>
                <span className="text-text-tertiary">·</span>
                <span className="text-caption text-text-tertiary">关联 {p.source}</span>
              </div>
              {/* Title */}
              <div className="mt-2 text-card-title text-foreground truncate">{p.title}</div>
              {/* Desc */}
              <div className="mt-1 text-body-sm text-text-secondary truncate">
                {p.warehouse} · 共 {p.items.length} 项
              </div>
              {/* Footer meta */}
              <div className="mt-2 pt-2 border-t border-border/60 flex items-center text-caption text-text-tertiary">
                <Clock className="h-3 w-3 mr-1" />
                <span>批准 <span className="text-text-secondary">{p.approvedAt}</span></span>
                <span className="mx-1.5">·</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-4 w-4 rounded-full bg-primary/10 text-primary text-[9px] inline-flex items-center justify-center">
                    {p.visitor.charAt(0)}
                  </span>
                  <span className="text-text-secondary">{p.visitor}</span>
                </span>
                <span className="ml-auto inline-flex items-center gap-0.5 text-text-secondary">
                  详情 <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
            {/* 操作区 */}
            <div className="relative px-4 pb-3 flex items-center gap-2">
              <button
                onClick={() => openSkip(p.id)}
                className="flex-1 h-9 rounded-lg border border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1 active:bg-surface-subtle"
              >
                <PackageX className="h-3.5 w-3.5" /> 无需领物
              </button>
              <button
                onClick={() => navigate({ to: "/m/pickup/$id", params: { id: p.id } })}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1 active:opacity-90"
              >
                <PackageCheck className="h-3.5 w-3.5" /> 领物
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* 既往记录 */}
      {history.length > 0 && (
        <div className="px-4 mt-2 pb-8">
          <div className="flex items-center gap-1.5 mb-3">
            <Archive className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="text-caption font-medium text-text-tertiary">既往记录</span>
            <span className="text-caption text-text-tertiary">({history.length})</span>
          </div>
          <div className="space-y-2">
            {history.map((h) => {
              const isClaimed = h.result === "claimed";
              return (
                <Link
                  key={h.id}
                  to="/m/pickup/$id"
                  params={{ id: h.id }}
                  className="block rounded-xl bg-card border border-border overflow-hidden active:bg-surface-subtle"
                >
                  <div className="relative p-4">
                    {/* Header */}
                    <div className="flex items-center gap-1.5 text-body-sm">
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-success/10 text-success text-caption">
                          <CheckCircle2 className="h-3 w-3" /> 已领取
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-muted text-text-tertiary text-caption">
                          <XCircle className="h-3 w-3" /> 已失效
                        </span>
                      )}
                      <span className="font-mono text-text-tertiary text-caption ml-auto">{h.id}</span>
                    </div>
                    {/* Title */}
                    <div className="mt-2 text-card-title text-foreground truncate">{h.title}</div>
                    {/* Desc */}
                    <div className="mt-1 text-body-sm text-text-secondary truncate">
                      {h.warehouse} · 共 {h.items.length} 项
                    </div>
                    {/* Footer */}
                    <div className="mt-2 pt-2 border-t border-border/60 flex items-center text-caption text-text-tertiary">
                      {isClaimed ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1 text-success" />
                          <span>已领取 <span className="text-text-secondary">{h.handledAt}</span></span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1 text-text-tertiary" />
                          <span>无需领物 <span className="text-text-secondary">{h.invalidReason}</span></span>
                        </>
                      )}
                      <span className="ml-auto inline-flex items-center gap-0.5 text-text-secondary">
                        详情 <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 无需领物原因弹窗 */}
      <Dialog open={!!skipping} onOpenChange={(o) => !o && setSkipId(null)}>
        <DialogContent className="max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-left text-base">选择无需领物原因</DialogTitle>
            <DialogDescription className="text-left text-body-sm text-text-secondary">
              {skipping?.id} · {skipping?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            {REASONS.map((r) => (
              <label
                key={r}
                className={`flex items-center gap-2 px-3 h-10 rounded-lg border cursor-pointer ${
                  reason === r
                    ? "border-primary bg-brand-subtle/60"
                    : "border-border bg-card"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-primary"
                />
                <span className="text-body-sm text-foreground">{r}</span>
              </label>
            ))}
            {reason === "其它" && (
              <textarea
                value={other}
                onChange={(e) => setOther(e.target.value)}
                placeholder="请填写具体原因"
                rows={2}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-card text-body-sm placeholder:text-text-tertiary resize-none"
              />
            )}
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button variant="outline" className="flex-1" onClick={() => setSkipId(null)}>
              取消
            </Button>
            <Button className="flex-1" onClick={submitSkip}>
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}
