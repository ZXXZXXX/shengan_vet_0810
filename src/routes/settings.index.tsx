import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, ChevronRight, Plus, Layers } from "lucide-react";

export const Route = createFileRoute("/settings/")({
  head: () => ({ meta: [{ title: "工单配置 — 奇点智牧" }] }),
  component: WorkOrderPage,
});

const types = [
  "疾病疑似工单", "免疫接种工单", "防疫消杀工单", "治疗执行工单",
  "复查确认工单", "饲料配送工单", "设备保养工单", "盘点工单",
];

function WorkOrderPage() {
  return (
    <>
      <AppHeader title="工单配置" breadcrumb={["首页", "配置中心", "工单配置"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="text-section-title text-foreground">工单类型</h2>
            <span className="text-body-sm text-text-tertiary">共 {types.length} 个</span>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建类型
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {types.map((t) => (
            <Card key={t} className="border-border bg-card p-6 hover:border-primary/40 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-md bg-brand-subtle flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-primary" strokeWidth={1.75} />
                </div>
                <span className="tag tag-success">已启用</span>
              </div>
              <div className="text-card-title text-foreground">{t}</div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-caption text-text-tertiary">字段 · 流程</span>
                <ChevronRight className="h-3.5 w-3.5 text-text-tertiary group-hover:text-primary" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
