import { useState } from "react";
import { Settings2, Check, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  scopeOptions,
  topicMeta,
  setScope,
  setTopicVisible,
  resetScopeConfig,
  useDashboardView,
  type ReportScope,
} from "@/lib/dashboard-view";

export function ViewSettingsSheet() {
  const { scope, config } = useDashboardView();
  const [open, setOpen] = useState(false);
  const [editScope, setEditScope] = useState<ReportScope>(scope);

  const current = config[editScope];
  const visibleCount = topicMeta.filter((t) => current[t.key]).length;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setEditScope(scope);
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="看板视角设置"
          title="看板视角设置"
          className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg border border-border bg-card text-text-secondary transition-colors hover:text-primary hover:border-primary/40"
        >
          <Settings2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[380px] sm:max-w-[380px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-section-title">看板视角设置</SheetTitle>
          <SheetDescription className="text-caption">
            选择当前视角，并配置该视角下各类专题的显隐
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <p className="text-body-sm font-medium text-foreground mb-2">当前视角</p>
            <div className="space-y-2">
              {scopeOptions.map((o) => {
                const active = editScope === o.key;
                const isCurrent = scope === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => {
                      setEditScope(o.key);
                      setScope(o.key);
                    }}
                    className={`w-full text-left rounded-xl border px-3.5 py-2.5 transition-colors ${
                      active
                        ? "border-primary/40 bg-brand-subtle"
                        : "border-border bg-card hover:bg-surface-subtle"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`text-body-sm ${active ? "text-primary font-medium" : "text-foreground"}`}
                      >
                        {o.label}
                      </span>
                      {isCurrent && <Check className="h-4 w-4 text-primary" />}
                    </span>
                    <span className="mt-0.5 block text-caption text-text-tertiary">{o.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-body-sm font-medium text-foreground">
                专题显隐
                <span className="ml-1.5 text-caption text-text-tertiary">
                  已开启 {visibleCount}/{topicMeta.length}
                </span>
              </p>
              <button
                type="button"
                onClick={() => resetScopeConfig(editScope)}
                className="inline-flex items-center gap-1 text-caption text-text-secondary hover:text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                恢复默认
              </button>
            </div>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {topicMeta.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="text-body-sm text-foreground">{t.label}</span>
                  <Switch
                    checked={current[t.key]}
                    onCheckedChange={(v) => setTopicVisible(editScope, t.key, v)}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-caption text-text-tertiary">
              配置仅作用于「{scopeOptions.find((s) => s.key === editScope)?.label}」视角。
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
