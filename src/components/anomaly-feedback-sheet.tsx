import { useState } from "react";
import { AlertTriangle, X, Stethoscope, Ban } from "lucide-react";
import { toast } from "sonner";

const PRESET_TAGS = [
  "牛只不配合",
  "症状加重",
  "药品缺失",
  "对象错误",
  "设备故障",
  "环境异常",
  "牛只死亡",
  "其他",
];

export function AnomalyFeedbackSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: { tags: string[]; terminate: boolean; revisit: boolean; note: string }) => void;
}) {
  const [tags, setTags] = useState<string[]>([]);
  const [terminate, setTerminate] = useState(false);
  const [revisit, setRevisit] = useState(false);
  const [note, setNote] = useState("");

  if (!open) return null;

  const toggleTag = (t: string) =>
    setTags((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));

  const handleSubmit = () => {
    if (tags.length === 0) {
      toast.error("请至少选择一个异常标签");
      return;
    }
    onSubmit?.({ tags, terminate, revisit, note });
    toast.success(
      terminate ? "已提交并申请终止工单" : revisit ? "已提交并申请复诊" : "异常反馈已提交"
    );
    setTags([]);
    setTerminate(false);
    setRevisit(false);
    setNote("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] bg-card rounded-t-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 h-12 flex items-center justify-between border-b border-border">
          <div className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-[var(--state-danger)]" />
            异常反馈
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="text-caption text-text-tertiary mb-2">选择异常标签（可多选）</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((t) => {
                const active = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
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
            <div className="text-caption text-text-tertiary mb-2">后续处理</div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setRevisit((v) => !v);
                  if (!revisit) setTerminate(false);
                }}
                className={`w-full flex items-center justify-between px-3 h-11 rounded-lg border text-body-sm ${
                  revisit
                    ? "border-primary/40 bg-brand-subtle text-primary"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  申请复诊
                </span>
                <span className="text-caption">{revisit ? "已选择" : ""}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTerminate((v) => !v);
                  if (!terminate) setRevisit(false);
                }}
                className={`w-full flex items-center justify-between px-3 h-11 rounded-lg border text-body-sm ${
                  terminate
                    ? "border-[var(--state-danger)]/40 bg-[var(--state-danger)]/10 text-[var(--state-danger)]"
                    : "border-border bg-card text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Ban className="h-4 w-4" />
                  申请终止工单
                </span>
                <span className="text-caption">{terminate ? "已选择" : ""}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="text-caption text-text-tertiary mb-2">补充说明（选填）</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可补充现场情况、处理过程等"
              className="w-full min-h-[80px] rounded-lg border border-border bg-card px-3 py-2 text-body-sm placeholder:text-text-tertiary resize-none focus:outline-none focus:border-primary/40"
            />
          </div>
        </div>

        <div className="p-4 pt-0 pb-[calc(env(safe-area-inset-bottom)+16px)] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-lg border border-border text-body text-text-secondary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body"
          >
            提交反馈
          </button>
        </div>
      </div>
    </div>
  );
}
