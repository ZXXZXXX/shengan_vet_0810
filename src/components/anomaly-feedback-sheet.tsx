import { useState } from "react";
import { AlertTriangle, X, Stethoscope, Ban } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const TERMINATE_REASONS = [
  "牛只健康，无需治疗",
  "牛只已死亡",
  "牛只已淘汰",
  "已转交其他工单",
  "计划调整，暂不执行",
];

const REVISIT_REASONS = [
  "症状加重",
  "症状未缓解",
  "出现新症状",
  "用药反应异常",
  "需进一步检查",
];

type Action = "terminate" | "revisit";

export function AnomalyFeedbackSheet({
  open,
  onClose,
  workOrderId,
  barn,
  target,
}: {
  open: boolean;
  onClose: () => void;
  workOrderId?: string;
  barn?: string;
  target?: string;
}) {
  const navigate = useNavigate();
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState<string>("");
  const [reasonOther, setReasonOther] = useState("");

  if (!open) return null;

  const reset = () => {
    setAction(null);
    setReason("");
    setReasonOther("");
  };
  const close = () => {
    reset();
    onClose();
  };

  const presets = action === "terminate" ? TERMINATE_REASONS : REVISIT_REASONS;
  const finalReason = reason === "其他" ? reasonOther.trim() : reason;
  const canSubmit = action !== null && finalReason.length > 0;

  const submit = () => {
    if (!canSubmit) {
      toast.error("请选择或填写原因");
      return;
    }
    if (action === "terminate") {
      toast.success("工单已终止");
      close();
      navigate({ to: "/m/health", search: { tab: "已终止" } });
    } else {
      toast.success("已发起复诊，请填写上报信息");
      close();
      navigate({
        to: "/m/report",
        search: {
          ...(target ? { target } : {}),
          ...(barn ? { barn } : {}),
          lock: 1,
        },
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={close}
    >
      <div
        className="w-full max-w-[440px] bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 h-12 flex items-center justify-between border-b border-border">
          <div className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-[var(--state-danger)]" />
            异常处理{workOrderId ? ` · ${workOrderId}` : ""}
          </div>
          <button
            type="button"
            onClick={close}
            className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="text-caption text-text-tertiary mb-2">选择操作</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAction("revisit");
                  setReason("");
                }}
                className={`h-16 rounded-lg border flex flex-col items-center justify-center gap-1 text-body-sm ${
                  action === "revisit"
                    ? "border-primary/50 bg-brand-subtle text-primary"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                申请复诊
              </button>
              <button
                type="button"
                onClick={() => {
                  setAction("terminate");
                  setReason("");
                }}
                className={`h-16 rounded-lg border flex flex-col items-center justify-center gap-1 text-body-sm ${
                  action === "terminate"
                    ? "border-[var(--state-danger)]/50 bg-[var(--state-danger)]/10 text-[var(--state-danger)]"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <Ban className="h-4 w-4" />
                终止工单
              </button>
            </div>
          </div>

          {action && (
            <div>
              <div className="text-caption text-text-tertiary mb-2">
                {action === "terminate" ? "终止原因" : "复诊原因"}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...presets, "其他"].map((t) => {
                  const active = reason === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setReason(t)}
                      className={`h-8 px-3 rounded-full text-body-sm border ${
                        active
                          ? "bg-brand-subtle text-primary border-primary/40"
                          : "bg-card text-text-secondary border-border"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {reason === "其他" && (
                <textarea
                  value={reasonOther}
                  onChange={(e) => setReasonOther(e.target.value)}
                  placeholder="请输入原因"
                  className="mt-2 w-full min-h-[72px] rounded-lg border border-border bg-card px-3 py-2 text-body-sm placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary/40"
                />
              )}
            </div>
          )}
        </div>

        <div className="p-4 pt-0 pb-[calc(env(safe-area-inset-bottom)+16px)] flex gap-2">
          <button
            type="button"
            onClick={close}
            className="flex-1 h-11 rounded-lg border border-border text-body text-text-secondary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={`flex-1 h-11 rounded-lg text-body ${
              canSubmit
                ? action === "terminate"
                  ? "bg-[var(--state-danger)] text-white"
                  : "bg-primary text-primary-foreground"
                : "bg-border text-text-tertiary"
            }`}
          >
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
