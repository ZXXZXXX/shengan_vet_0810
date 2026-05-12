import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Heart, AlertCircle, Calendar } from "lucide-react";

export const Route = createFileRoute("/production/health")({
  head: () => ({ meta: [{ title: "健康防护 — 奇点智牧" }] }),
  component: HealthPage,
});

const stats = [
  { label: "今日新增档案", value: "12", icon: Heart },
  { label: "健康预警", value: "7", icon: AlertCircle, danger: true },
  { label: "免疫待办", value: "23", icon: Calendar },
];

const tasks = [
  { name: "#A2381 体温复查", who: "李雨晴", due: "今日 14:00", level: "高" },
  { name: "#A2298 乳房炎用药复查", who: "李雨晴", due: "今日 16:30", level: "高" },
  { name: "犊牛舍 A 防疫消杀", who: "周凯", due: "明日", level: "中" },
  { name: "#A2324 采食量监测", who: "王建国", due: "今日", level: "中" },
];

function HealthPage() {
  return (
    <>
      <AppHeader title="健康防护" breadcrumb={["生产对象", "健康防护"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border bg-card p-6 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-md flex items-center justify-center ${
                s.danger ? "bg-[var(--state-danger)]/10" : "bg-brand-subtle"
              }`}>
                <s.icon className={`h-4 w-4 ${s.danger ? "text-[var(--state-danger)]" : "text-primary"}`} strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-section-title tabular-nums text-foreground">{s.value}</div>
                <div className="text-caption text-text-tertiary">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-card-title text-foreground">健康待办</h3>
            <p className="text-caption text-text-tertiary mt-0.5">今日及未来 24 小时内需处理的健康任务</p>
          </div>
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-y border-border bg-surface-subtle">
            <div className="col-span-5">任务</div>
            <div className="col-span-3">负责人</div>
            <div className="col-span-2">截止</div>
            <div className="col-span-2">优先级</div>
          </div>
          {tasks.map((t) => (
            <div key={t.name} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="col-span-5 text-body text-foreground">{t.name}</div>
              <div className="col-span-3 text-body-sm text-text-secondary">{t.who}</div>
              <div className="col-span-2 text-body-sm text-text-tertiary">{t.due}</div>
              <div className="col-span-2">
                <span className={`tag ${t.level === "高" ? "tag-danger" : "tag-warning"}`}>{t.level === "高" ? "高优先" : "中优先"}</span>
              </div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
