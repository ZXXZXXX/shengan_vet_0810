import { AlertTriangle, PackageCheck } from "lucide-react";

type Props = {
  open: boolean;
  comboCount?: number;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * M 端完成领药二次确认弹窗。
 * 确认提交后药品状态变更为“已领取”，并提醒退料/组合用药相关规则。
 */
export function ConfirmPickupDialog({
  open,
  comboCount,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[360px] rounded-2xl bg-card p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-full bg-brand-subtle inline-flex items-center justify-center">
            <PackageCheck className="h-4 w-4 text-primary" />
          </span>
          <h3 className="text-card-title text-foreground">完成领药确认</h3>
        </div>
        <div className="space-y-2 text-body-sm text-text-secondary leading-relaxed">
          <p>
            提交后药品状态将变更为“已领取”，如需退回，请自行登记退料。
          </p>
          <p className="inline-flex items-start gap-1.5">
            <AlertTriangle className="h-4 w-4 text-[#E5751A] shrink-0 mt-0.5" />
            <span>
              组合用药提交后不可解除，请确认后再提交
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-border bg-card text-body-sm text-text-secondary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm"
          >
            确认提交
          </button>
        </div>
      </div>
    </div>
  );
}
