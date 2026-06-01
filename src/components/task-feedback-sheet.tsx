import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

const PRESET_REASONS = [
  "牛只不配合",
  "药品缺失",
  "设备故障",
  "对象错误",
  "环境异常",
  "牛只死亡",
  "其他",
];

export function TaskFeedbackSheet({
  open,
  onClose,
  taskLabel,
}: {
  open: boolean;
  onClose: () => void;
  taskLabel?: string;
}) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState("");

  if (!open) return null;

  const toggle = (r: string) =>
    setReasons((arr) => (arr.includes(r) ? arr.filter((x) => x !== r) : [...arr, r]));

  const reset = () => {
    setReasons([]);
    setNote("");
  };
  const close = () => {
    reset();
    onClose();
  };

  const canSubmit = reasons.length > 0;

  const submit = () => {
    if (!canSubmit) {
      toast.error("请选择未完成原因");
      return;
    }
    toast.success("已标记为未完成并提交反馈");
    close();
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
            标记为未完成{taskLabel ? ` · ${taskLabel}` : ""}
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
            <div className="text-caption text-text-tertiary mb-2">
              未完成原因 <span className="text-[var(--state-danger)]">*</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((t) => {
                const active = reasons.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggle(t)}
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
          </div>

          <div>
            <div className="text-caption text-text-tertiary mb-2">任务反馈说明</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可补充现场情况、处理过程等"
              rows={4}
              maxLength={200}
              className="w-full p-3 rounded-lg border border-border bg-card text-body-sm placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary/40"
            />
            <div className="text-right text-caption text-text-tertiary mt-1">
              {note.length} / 200
            </div>
          </div>
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
                ? "bg-primary text-primary-foreground"
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
