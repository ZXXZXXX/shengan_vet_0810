import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

export type AddMediaAction = {
  key: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

export function MAddMediaSheet({
  open,
  title = "添加现场记录",
  actions,
  onClose,
}: {
  open: boolean;
  title?: string;
  actions: AddMediaAction[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="关闭"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative bg-card rounded-t-2xl pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-200">
        <div className="px-4 pt-4 pb-3">
          <div className="text-card-title text-foreground">{title}</div>
        </div>
        <div className="px-4 pb-3 grid grid-cols-3 gap-2">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => {
                  a.onClick();
                  onClose();
                }}
                className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl bg-surface-subtle active:bg-border transition-colors text-text-secondary"
              >
                <Icon className="h-6 w-6" />
                <span className="text-body-sm">{a.label}</span>
              </button>
            );
          })}
        </div>
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-card border border-border text-body text-foreground active:bg-surface-subtle"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
