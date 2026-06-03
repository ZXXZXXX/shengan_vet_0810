import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { TransferBarnControl } from "@/components/m/transfer-barn-control";
import { ConfirmTransferDialog } from "@/components/m/confirm-transfer-dialog";
import { getOrderEarTagLabel } from "@/lib/work-order-cattle";
import { toast } from "sonner";

export const Route = createFileRoute("/m/health/$id_/confirm-cure")({
  head: () => ({ meta: [{ title: "已治愈 · 奇点智牧" }] }),
  component: ConfirmCurePage,
});

function ConfirmCurePage() {
  const { id } = useParams({ from: "/m/health/$id_/confirm-cure" });
  const navigate = useNavigate();

  const [needTransfer, setNeedTransfer] = useState(false);
  const [transferTo, setTransferTo] = useState("");

  const canSubmit = !needTransfer || Boolean(transferTo);

  const submit = () => {
    if (!canSubmit) return;
    toast.success(needTransfer ? `已已治愈，转至 ${transferTo}` : "已已治愈，工单完成");
    navigate({ to: "/m/health/$id", params: { id }, search: { tab: "execute" } });
  };

  return (
    <MobileShell title="已治愈" back hideTabBar>
      <div className="pb-28">
        <div className="px-4 pt-3 pb-2">
          <div className="text-caption text-text-tertiary inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            工单 <span className="font-mono text-text-secondary">{id}</span>
            <span className="mx-1">·</span>
            观察期满，请已治愈
          </div>
        </div>

        <div className="px-4 space-y-3">
          <div className="rounded-xl bg-brand-subtle border border-primary/20 p-4">
            <div className="text-body-sm font-medium text-primary mb-1">观察期已结束</div>
            <p className="text-caption text-text-secondary leading-relaxed">
              观察期内未发起复诊上报，系统判定为治愈。请确认是否需要转栏后，提交即可关闭工单。
            </p>
          </div>

          <TransferBarnControl
            enabled={needTransfer}
            onEnabledChange={setNeedTransfer}
            value={transferTo}
            onValueChange={setTransferTo}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={`w-full h-11 rounded-lg text-body inline-flex items-center justify-center gap-1.5 ${
            canSubmit ? "bg-primary text-primary-foreground" : "bg-border text-text-tertiary"
          }`}
        >
          <Send className="h-4 w-4" /> 已治愈并完成工单
        </button>
      </div>
    </MobileShell>
  );
}
