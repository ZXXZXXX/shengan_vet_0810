import { X } from "lucide-react";
import { Role, roleLabel, roleGroup, setRole, useRole } from "@/lib/mobile-role";

export function RoleSwitchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const role = useRole();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card rounded-t-2xl border-t border-border p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex justify-center mb-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-body font-medium text-foreground">切换角色</span>
          <span className="text-caption text-text-tertiary">演示用</span>
        </div>
        <div className="space-y-3">
          {(["internal", "external"] as const).map((g) => {
            const roles = (Object.keys(roleLabel) as Role[]).filter((r) => roleGroup[r] === g);
            return (
              <div key={g}>
                <div className="text-caption text-text-tertiary mb-1.5">
                  {g === "internal" ? "内部人员" : "外部人员"}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRole(r);
                        onClose();
                      }}
                      className={`h-10 rounded-lg text-body-sm transition-colors border ${
                        role === r
                          ? "bg-brand-subtle border-primary/40 text-primary"
                          : "bg-surface-subtle border-transparent text-text-secondary"
                      }`}
                    >
                      {roleLabel[r]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full h-11 rounded-xl bg-surface-subtle text-body text-text-secondary inline-flex items-center justify-center gap-1.5 active:bg-border transition-colors"
        >
          <X className="h-4 w-4" />
          收起
        </button>
      </div>
    </div>
  );
}
