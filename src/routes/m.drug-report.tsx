import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageX, Undo2, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/drug-report")({
  head: () => ({ meta: [{ title: "药品上报 · 奇点智牧" }] }),
  component: DrugReportHub,
});

function DrugReportHub() {
  return (
    <MobileShell title="药品上报" back hideTabBar>
      <div className="px-4 pt-3 pb-8 space-y-3">
        <div className="text-body-sm text-text-secondary px-1">
          请选择上报类型
        </div>

        <Link
          to="/m/loss-report"
          className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4 active:bg-surface-subtle"
        >
          <span className="h-10 w-10 rounded-lg bg-[var(--state-warning)]/15 text-[var(--state-alert)] inline-flex items-center justify-center shrink-0">
            <PackageX className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-body font-medium text-foreground">损耗上报</div>
            <div className="text-caption text-text-tertiary mt-0.5">
              过期、破损、误用等物品损耗登记
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
        </Link>

        <Link
          to="/m/return-report"
          className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4 active:bg-surface-subtle"
        >
          <span className="h-10 w-10 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
            <Undo2 className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-body font-medium text-foreground">退料上报</div>
            <div className="text-caption text-text-tertiary mt-0.5">
              工单取消、用料剩余等退料登记
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
        </Link>
      </div>
    </MobileShell>
  );
}
