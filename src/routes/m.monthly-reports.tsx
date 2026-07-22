import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ChevronRight, CheckCircle2, MessageSquare } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/monthly-reports")({
  head: () => ({ meta: [{ title: "月度报告 · 奇点智牧" }] }),
  component: MonthlyReportsPage,
});

export type MonthlyReport = {
  id: string;
  month: string; // e.g. 2026-06
  title: string;
  sender: string;
  sentAt: string;
  size: string;
  feedback?: string;
};

export const MONTHLY_REPORTS: MonthlyReport[] = [
  { id: "2026-06", month: "2026-06", title: "6 月牧场运营月度报告", sender: "管理组 · 王强", sentAt: "2026-07-03", size: "2.4 MB" },
  { id: "2026-05", month: "2026-05", title: "5 月牧场运营月度报告", sender: "管理组 · 王强", sentAt: "2026-06-04", size: "2.1 MB", feedback: "整体产奶波动已在群里跟进，下月复盘。" },
  { id: "2026-04", month: "2026-04", title: "4 月牧场运营月度报告", sender: "管理组 · 王强", sentAt: "2026-05-05", size: "2.0 MB" },
  { id: "2026-03", month: "2026-03", title: "3 月牧场运营月度报告", sender: "管理组 · 王强", sentAt: "2026-04-06", size: "1.9 MB", feedback: "干奶批次执行率偏低，已安排排查。" },
];

function MonthlyReportsPage() {
  return (
    <MobileShell title="月度报告" back>
      <section className="px-4 pt-4 space-y-2">
        {MONTHLY_REPORTS.map((r) => (
          <Link
            key={r.id}
            to="/m/monthly-reports/$id"
            params={{ id: r.id }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
          >
            <div className="h-10 w-10 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body text-foreground truncate">{r.title}</div>
              <div className="text-caption text-text-tertiary mt-0.5 truncate">
                {r.sender} · {r.sentAt} · {r.size}
              </div>
            </div>
            {r.feedback ? (
              <span className="inline-flex items-center gap-0.5 text-caption text-primary shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
                已反馈
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-caption text-text-tertiary shrink-0">
                <MessageSquare className="h-3.5 w-3.5" />
                待反馈
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
          </Link>
        ))}
      </section>
      <p className="text-center text-caption text-text-tertiary mt-6">仅显示最近 12 个月的报告</p>
    </MobileShell>
  );
}
