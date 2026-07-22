import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { FileText, Download, Eye, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { MONTHLY_REPORTS } from "./m.monthly-reports";
import { toast } from "sonner";

export const Route = createFileRoute("/m/monthly-reports/$id")({
  head: () => ({ meta: [{ title: "月度报告详情 · 奇点智牧" }] }),
  component: MonthlyReportDetailPage,
});

function MonthlyReportDetailPage() {
  const { id } = useParams({ from: "/m/monthly-reports/$id" });
  const navigate = useNavigate();
  const report = MONTHLY_REPORTS.find((r) => r.id === id) ?? MONTHLY_REPORTS[0];
  const [feedback, setFeedback] = useState(report.feedback ?? "");
  const [submitted, setSubmitted] = useState(!!report.feedback);

  const submit = () => {
    if (!feedback.trim()) {
      toast.error("请输入反馈内容");
      return;
    }
    setSubmitted(true);
    toast.success("反馈已提交");
  };

  return (
    <MobileShell title="月度报告详情" back={{ to: "/m/monthly-reports" }}>
      <section className="px-4 pt-4">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-card-title text-foreground">{report.title}</div>
              <div className="text-caption text-text-tertiary mt-1">
                {report.sender} · {report.sentAt}
              </div>
              <div className="text-caption text-text-tertiary mt-0.5">
                PDF · {report.size}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => toast.info("正在打开预览…")}
              className="h-10 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1.5 active:opacity-90"
            >
              <Eye className="h-4 w-4" /> 在线预览
            </button>
            <button
              onClick={() => toast.success("已开始下载")}
              className="h-10 rounded-lg bg-surface-subtle text-body-sm text-foreground inline-flex items-center justify-center gap-1.5 active:bg-border"
            >
              <Download className="h-4 w-4" /> 下载 PDF
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 mt-4">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-card-title text-foreground">我的反馈</h3>
            {submitted && (
              <span className="inline-flex items-center gap-0.5 text-caption text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                已提交
              </span>
            )}
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="对本月报告的疑问、建议或后续跟进项…"
            rows={5}
            maxLength={500}
            className="w-full p-3 rounded-lg bg-surface-subtle text-body resize-none leading-relaxed border border-border focus:border-primary focus:outline-none"
          />
          <div className="text-right text-caption text-text-tertiary mt-1">
            {feedback.length} / 500
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate({ to: "/m/monthly-reports" })}
              className="flex-1 h-11 rounded-xl bg-surface-subtle text-body text-text-secondary active:bg-border"
            >
              取消
            </button>
            <button
              onClick={submit}
              className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-body active:opacity-90"
            >
              {submitted ? "更新反馈" : "提交反馈"}
            </button>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
