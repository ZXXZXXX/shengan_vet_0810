import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  Workflow,
  BookOpen,
  ChevronRight,
  Plus,
  GitBranch,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "配置中心 — 奇点智牧" },
      { name: "description", content: "工单配置、规则配置与知识库" },
    ],
  }),
  component: SettingsPage,
});

const modules = [
  { id: "workorder", name: "工单配置", desc: "工单类型、模板、字段、流程", icon: ClipboardList, count: "12 个类型" },
  { id: "rules", name: "规则配置", desc: "告警、派单、升级、审批、通知", icon: Workflow, count: "38 条规则" },
  { id: "knowledge", name: "知识库", desc: "疾病、症状、方案、规范、标准", icon: BookOpen, count: "1.2K 条目" },
];

const rules = [
  { name: "高级告警 5 分钟未接", action: "自动升级至场长", count: "近 30 日触发 12 次" },
  { name: "库存低于安全线", action: "通知采购员 + 创建采购建议", count: "近 30 日触发 8 次" },
  { name: "免疫工单逾期", action: "推送至现场端首页", count: "近 30 日触发 5 次" },
  { name: "兽医处理结果未复查", action: "T+2 自动派复查工单", count: "近 30 日触发 18 次" },
];

function SettingsPage() {
  return (
    <>
      <AppHeader title="配置中心" breadcrumb={["首页", "配置中心"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        {/* Module switcher cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map((m) => (
            <Card
              key={m.id}
              className="border-border bg-card hover:border-primary/30 transition-colors cursor-pointer group p-6"
            >
              <div className="h-10 w-10 rounded-md bg-brand-subtle flex items-center justify-center mb-4">
                <m.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
              </div>
              <div className="text-card-title text-foreground">{m.name}</div>
              <div className="text-caption text-text-tertiary mt-1 leading-relaxed">{m.desc}</div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-caption text-text-tertiary tabular-nums">{m.count}</span>
                <ChevronRight className="h-3.5 w-3.5 text-text-tertiary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList className="bg-transparent h-auto p-0 gap-6 border-b border-border rounded-none w-full justify-start">
            {[
              { v: "rules", l: "规则配置", icon: Workflow },
              { v: "workorder", l: "工单配置", icon: ClipboardList },
              { v: "knowledge", l: "知识库", icon: BookOpen },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="px-0 pb-3 pt-2 rounded-none text-body text-text-secondary gap-1.5 data-[state=active]:text-primary data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_var(--brand)] hover:text-foreground"
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.l}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="rules" className="mt-0">
            <Card className="border-border bg-card overflow-hidden">
              <div className="p-6 pb-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    <h3 className="text-card-title text-foreground">规则列表</h3>
                  </div>
                  <p className="text-body-sm text-text-tertiary mt-1">告警、派单、升级、审批、通知规则</p>
                </div>
                <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
                  <Plus className="h-3.5 w-3.5" /> 新建规则
                </Button>
              </div>
              <div className="border-t border-border">
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
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="workorder" className="mt-0">
            <Card className="border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Layers className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <h3 className="text-card-title text-foreground">工单类型</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "疾病疑似工单", "免疫接种工单", "防疫消杀工单", "治疗执行工单",
                  "复查确认工单", "饲料配送工单", "设备保养工单", "盘点工单",
                ].map((t) => (
                  <div key={t} className="rounded-md border border-border p-5 hover:border-primary/40 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-md bg-brand-subtle flex items-center justify-center">
                        <ClipboardList className="h-4 w-4 text-primary" strokeWidth={1.75} />
                      </div>
                      <span className="tag tag-success">已启用</span>
                    </div>
                    <div className="text-body text-foreground font-medium">{t}</div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-caption text-text-tertiary">字段 · 流程</span>
                      <ChevronRight className="h-3.5 w-3.5 text-text-tertiary group-hover:text-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="mt-0">
            <Card className="border-border bg-card p-12 text-center">
              <div className="h-12 w-12 rounded-md bg-brand-subtle flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <div className="text-card-title text-foreground">知识库管理</div>
              <p className="text-body-sm text-text-tertiary mt-1 max-w-md mx-auto">
                沉淀疾病、症状、治疗方案、防疫规范、作业标准与设备维护知识 — 待扩展
              </p>
              <Button size="sm" className="mt-4 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> 新增条目
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
