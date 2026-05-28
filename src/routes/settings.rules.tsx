import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Workflow, GitBranch, Plus, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/settings/rules")({
  head: () => ({ meta: [{ title: "规则配置 — 奇点智牧" }] }),
  component: RulesPage,
});

const rules = [
  { name: "高级告警 5 分钟未接", action: "自动升级至场长", count: "近 30 日触发 12 次" },
  { name: "库存低于安全线", action: "通知采购员 + 创建采购建议", count: "近 30 日触发 8 次" },
  { name: "免疫工作逾期", action: "推送至现场端首页", count: "近 30 日触发 5 次" },
  { name: "兽医处理结果未复查", action: "T+2 自动派复查工作", count: "近 30 日触发 18 次" },
];

function RulesPage() {
  return (
    <>
      <AppHeader title="规则配置" breadcrumb={["配置中心", "规则配置"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="text-section-title text-foreground">规则列表</h2>
            <span className="text-body-sm text-text-tertiary">告警、派单、升级、出诊、通知</span>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建规则
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          {rules.map((r, i) => (
            <div key={i} className="px-6 py-4 hover:bg-surface-subtle transition-colors border-b border-border last:border-0">
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-md bg-surface-subtle flex items-center justify-center">
                  <GitBranch className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <div className="text-body text-foreground font-medium">{r.name}</div>
                  <div className="text-caption text-text-tertiary mt-0.5 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    {r.action}
                  </div>
                </div>
                <span className="tag tag-outline">{r.count}</span>
                <Switch checked className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
