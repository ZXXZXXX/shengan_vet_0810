import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Ban,
  Stethoscope as StethoscopeIcon,
  Send,
  Stethoscope,
  Lock,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { TransferBarnControl } from "@/components/m/transfer-barn-control";
import { ConfirmTransferDialog } from "@/components/m/confirm-transfer-dialog";
import { getOrderEarTagLabel } from "@/lib/work-order-cattle";
import { useRole } from "@/lib/mobile-role";
import { toast } from "sonner";

export const Route = createFileRoute("/m/health/$id_/review")({
  head: () => ({ meta: [{ title: "复查 · 奇点智牧" }] }),
  component: ReviewPage,
});

type Verdict = "cure" | "abandon" | "revisit";

const ABANDON_REASONS = [
  "治疗无效",
  "牛只死亡",
  "经济性放弃",
  "牛只淘汰",
  "其他",
];

const OBSERVE_DAYS = [3, 5, 7];


function ReviewPage() {
  const { id } = useParams({ from: "/m/health/$id_/review" });
  const role = useRole();
  const navigate = useNavigate();

  const isVet = role === "vet" || role === "manager";

  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [abandonReason, setAbandonReason] = useState("");
  const [abandonOther, setAbandonOther] = useState("");
  const [observeDays, setObserveDays] = useState<number>(3);
  const [observeCustom, setObserveCustom] = useState("");
  const [needTransfer, setNeedTransfer] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
  const earTagLabel = getOrderEarTagLabel(id);

  const finalAbandonReason = abandonReason === "其他" ? abandonOther.trim() : abandonReason;
  const finalObserveDays = useMemo(() => {
    if (observeCustom.trim()) {
      const n = parseInt(observeCustom, 10);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }
    return observeDays;
  }, [observeDays, observeCustom]);

  const canSubmit = (() => {
    if (!verdict) return false;
    if (needTransfer && !transferTo) return false;
    if (verdict === "abandon" && !finalAbandonReason) return false;
    if (verdict === "observe" && finalObserveDays <= 0) return false;
    return true;
  })();

  if (!isVet) {
    return (
      <MobileShell title="复查" back hideTabBar>
        <div className="px-4 pt-16 flex flex-col items-center text-center">
          <span className="h-12 w-12 rounded-full bg-surface-subtle inline-flex items-center justify-center mb-3">
            <Lock className="h-5 w-5 text-text-tertiary" />
          </span>
          <div className="text-body font-medium text-foreground">仅兽医可执行复查</div>
          <p className="text-body-sm text-text-tertiary mt-2 max-w-[260px]">
            处方执行完毕后，本工单需由兽医进行复查验收。当前角色无权限。
          </p>
        </div>
      </MobileShell>
    );
  }

  const doSubmit = () => {
    if (verdict === "cure") {
      toast.success(needTransfer ? `已确认治愈，转至 ${transferTo}` : "已确认治愈");
      navigate({ to: "/m/health/$id", params: { id }, search: { tab: "execute" } });
    } else if (verdict === "abandon") {
      toast.success(needTransfer ? `已放弃治疗，已转至 ${transferTo}` : "已放弃治疗，工单已终止");
      navigate({ to: "/m/health/$id", params: { id }, search: { tab: "execute" } });
    } else {
      toast.success(`已设为继续观察 ${finalObserveDays} 天`);
      navigate({
        to: "/m/health/$id",
        params: { id },
        search: { tab: "execute", obs: finalObserveDays },
      });
    }
  };

  const submit = () => {
    if (!canSubmit) {
      toast.error("请完成必填项");
      return;
    }
    if (needTransfer && transferTo) {
      setTransferConfirmOpen(true);
      return;
    }
    doSubmit();
  };

  return (
    <MobileShell title="复查验收" back hideTabBar>
      <div className="pb-28">
        <div className="px-4 pt-3 pb-2">
          <div className="text-caption text-text-tertiary inline-flex items-center gap-1">
            <Stethoscope className="h-3.5 w-3.5" />
            工单 <span className="font-mono text-text-secondary">{id}</span>
            <span className="mx-1">·</span>
            复查须由兽医完成
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* 三选一 */}
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-caption text-text-tertiary mb-2">复查结论</div>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: "cure", icon: CheckCircle2, label: "治愈", tone: "primary" },
                { v: "observe", icon: Eye, label: "继续观察", tone: "info" },
                { v: "abandon", icon: Ban, label: "放弃", tone: "danger" },
              ] as { v: Verdict; icon: typeof CheckCircle2; label: string; tone: string }[]).map(
                ({ v, icon: Icon, label, tone }) => {
                  const active = verdict === v;
                  const activeCls =
                    tone === "primary"
                      ? "border-primary/50 bg-brand-subtle text-primary"
                      : tone === "danger"
                        ? "border-[var(--state-danger)]/50 bg-[var(--state-danger)]/10 text-[var(--state-danger)]"
                        : "border-[#22ACEB]/50 bg-[#22ACEB]/10 text-[#22ACEB]";
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVerdict(v)}
                      className={`h-20 rounded-lg border flex flex-col items-center justify-center gap-1 text-body-sm ${
                        active ? activeCls : "border-border bg-card text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* 放弃原因 */}
          {verdict === "abandon" && (
            <div className="rounded-xl bg-card border border-border p-4">
              <div className="text-caption text-text-tertiary mb-2">
                放弃原因 <span className="text-[var(--state-danger)]">*</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ABANDON_REASONS.map((r) => {
                  const active = abandonReason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAbandonReason(r)}
                      className={`h-8 px-3 rounded-full text-body-sm border ${
                        active
                          ? "bg-brand-subtle text-primary border-primary/40"
                          : "bg-card text-text-secondary border-border"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              {abandonReason === "其他" && (
                <textarea
                  value={abandonOther}
                  onChange={(e) => setAbandonOther(e.target.value)}
                  placeholder="请输入放弃原因"
                  className="mt-2 w-full min-h-[72px] rounded-lg border border-border bg-card px-3 py-2 text-body-sm placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary/40"
                />
              )}
            </div>
          )}

          {/* 观察天数 */}
          {verdict === "observe" && (
            <div className="rounded-xl bg-card border border-border p-4">
              <div className="text-caption text-text-tertiary mb-2">
                观察天数 <span className="text-[var(--state-danger)]">*</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {OBSERVE_DAYS.map((d) => {
                  const active = !observeCustom && observeDays === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setObserveDays(d);
                        setObserveCustom("");
                      }}
                      className={`h-8 px-3 rounded-full text-body-sm border ${
                        active
                          ? "bg-brand-subtle text-primary border-primary/40"
                          : "bg-card text-text-secondary border-border"
                      }`}
                    >
                      {d} 天
                    </button>
                  );
                })}
                <div className="inline-flex items-center gap-1.5 ml-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={observeCustom}
                    onChange={(e) => setObserveCustom(e.target.value)}
                    placeholder="自定义"
                    className="w-16 h-8 rounded-full border border-border bg-card px-3 text-body-sm text-foreground placeholder:text-text-tertiary text-center focus:outline-none focus:border-primary/40"
                  />
                  <span className="text-caption text-text-tertiary">天</span>
                </div>
              </div>
              <p className="text-caption text-text-tertiary mt-2 leading-relaxed">
                观察期内可由助理发起复诊上报；若期满无复诊，将自动生成"确认治愈"任务。
              </p>
            </div>
          )}

          {/* 转栏 */}
          {verdict && (
            <TransferBarnControl
              enabled={needTransfer}
              onEnabledChange={setNeedTransfer}
              value={transferTo}
              onValueChange={setTransferTo}
            />
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={`w-full h-11 rounded-lg text-body inline-flex items-center justify-center gap-1.5 ${
            canSubmit
              ? verdict === "abandon"
                ? "bg-[var(--state-danger)] text-white"
                : "bg-primary text-primary-foreground"
              : "bg-border text-text-tertiary"
          }`}
        >
          <Send className="h-4 w-4" /> 提交复查结论
        </button>
      </div>

      <ConfirmTransferDialog
        open={transferConfirmOpen}
        earTag={earTagLabel}
        barn={transferTo}
        onCancel={() => setTransferConfirmOpen(false)}
        onConfirm={() => {
          setTransferConfirmOpen(false);
          doSubmit();
        }}
      />
    </MobileShell>
  );
}
