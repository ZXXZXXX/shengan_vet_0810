import { ArrowRightLeft } from "lucide-react";

type Props = {
  open: boolean;
  earTag: string;
  barn: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
};

/**
 * M 端转栏二次确认弹窗。
 * 提交涉及转栏的工单前调用，确认操作员已实际完成物理转栏。
 */
export function ConfirmTransferDialog({
  open,
  earTag,
  barn,
  onCancel,
  onConfirm,
  confirmText = "已转栏，确认提交",
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
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </span>
          <h3 className="text-card-title text-foreground">转栏确认</h3>
        </div>
        <p className="text-body-sm text-text-secondary leading-relaxed">
          请确认已将牛只
          <span className="font-mono text-foreground"> {earTag} </span>
          转至
          <span className="text-foreground font-medium"> {barn}</span>
          。
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-lg border border-border bg-card text-body-sm text-text-secondary"
          >
            返回检查
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
