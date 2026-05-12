import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  ClipboardList,
  Workflow,
  BookOpen,
  Bot,
  ChevronRight,
  Plus,
  Lock,
  Bell,
  GitBranch,
  Layers,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "配置中心 — 奇点智牧" },
      { name: "description", content: "工单配置、规则配置、知识库与 AI 策略" },
    ],
  }),
  component: SettingsPage,
});

const modules = [
  { id: "workorder", name: "工单配置", desc: "工单类型、模板、字段、流程", icon: ClipboardList, count: "12 个类型" },
  { id: "rules", name: "规则配置", desc: "告警、派单、升级、审批、通知", icon: Workflow, count: "38 条规则" },
  { id: "knowledge", name: "知识库", desc: "疾病、症状、方案、规范、标准", icon: BookOpen, count: "1.2K 条目" },
  { id: "ai", name: "AI 策略", desc: "各场景 AI 启用与人工确认", icon: Bot, count: "8 个场景", ai: true },
];

const aiScenarios = [
  { name: "异常告警自动归类", desc: "基于历史数据对告警进行优先级排序", enabled: true, conf: "高", needsReview: false },
  { name: "工单智能派发", desc: "根据负责范围、技能与负载自动派单", enabled: true, conf: "高", needsReview: true },
  { name: "库存预测与补货建议", desc: "基于消耗速率预测告罄时间", enabled: true, conf: "中", needsReview: false },
  { name: "健康风险预警", desc: "结合体温、产奶量识别疑似病例", enabled: true, conf: "高", needsReview: true },
  { name: "饲料配比优化", desc: "基于产奶量与体况建议配比调整", enabled: false, conf: "中", needsReview: true },
  { name: "排班智能推荐", desc: "结合工作量与请假记录生成排班", enabled: false, conf: "低", needsReview: true },
];

const rules = [
  { name: "高级告警 5 分钟未接", action: "自动升级至场长", count: "近 30 日触发 12 次" },
  { name: "库存低于安全线", action: "通知采购员 + 创建采购建议", count: "近 30 日触发 8 次" },
  { name: "免疫工单逾期", action: "推送至现场端首页", count: "近 30 日触发 5 次" },
  { name: "兽医处理结果未复查", action: "T+2 自动派复查工单", count: "近 30 日触发 18 次" },
];

function confBadge(c: string) {
  if (c === "高") return "bg-[var(--state-success)]/15 text-[var(--core-brand)]";
  if (c === "中") return "bg-[var(--state-warning)]/30 text-foreground";
  return "bg-surface-subtle text-text-tertiary";
}

function SettingsPage() {
  return (
    <>
      <AppHeader title="配置中心" breadcrumb={["首页", "配置中心"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        {/* Module switcher cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <Card
              key={m.id}
              className="border-border bg-card hover:border-primary/30 transition-all cursor-pointer group p-6 relative overflow-hidden"
            >
              {m.ai && <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-ai" />}
              <div className={`h-10 w-10 rounded-md flex items-center justify-center mb-4 ${
                m.ai ? "bg-[var(--effect-ai-purple)]/10" : "bg-brand-subtle"
              }`}>
                <m.icon className={`h-4 w-4 ${m.ai ? "text-[var(--effect-ai-purple)]" : "text-primary"}`} strokeWidth={1.75} />
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

        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList className="bg-transparent h-auto p-0 gap-6 border-b border-border rounded-none w-full justify-start">
            {[
              { v: "ai", l: "AI 策略", icon: Sparkles },
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

          <TabsContent value="ai" className="space-y-4 mt-0">
            <Card className="border-border bg-card relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-ai" />
              <div className="p-6 pb-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--effect-ai-purple)]" strokeWidth={1.75} />
                    <h3 className="text-card-title text-foreground">AI 场景总开关</h3>
                  </div>
                  <p className="text-body-sm text-text-tertiary mt-1">控制各业务场景的 AI 启用状态与人工确认要求</p>
                </div>
                <Badge className="bg-[var(--effect-ai-purple)]/10 text-[var(--effect-ai-purple)] border-0 gap-1 font-normal">
                  <Bot className="h-3 w-3" /> 6 / 8 已启用
                </Badge>
              </div>
              <div className="border-t border-border">
                <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary bg-surface-subtle border-b border-border">
                  <div className="col-span-5">场景</div>
                  <div className="col-span-2">置信度</div>
                  <div className="col-span-3">人工确认</div>
                  <div className="col-span-2 text-right">启用</div>
                </div>
                {aiScenarios.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 px-6 py-3 items-center border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
                    <div className="col-span-5 leading-tight">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-caption text-text-tertiary tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-body text-foreground">{s.name}</span>
                      </div>
                      <p className="text-caption text-text-tertiary mt-0.5 ml-6">{s.desc}</p>
                    </div>
                    <div className="col-span-2">
                      <Badge className={`h-6 px-2 text-caption font-normal border-0 rounded ${confBadge(s.conf)}`}>
                        {s.conf}
                      </Badge>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <Switch checked={s.needsReview} className="data-[state=checked]:bg-primary" />
                      <span className="text-body-sm text-text-secondary">需人工确认</span>
                    </div>
                    <div className="col-span-2 flex justify-end items-center gap-2">
                      <span className={`text-body-sm ${s.enabled ? "text-[var(--core-brand)]" : "text-text-tertiary"}`}>
                        {s.enabled ? "已启用" : "已禁用"}
                      </span>
                      <Switch checked={s.enabled} className="data-[state=checked]:bg-primary" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Lock, title: "AI 决策审计", desc: "记录每次 AI 决策的输入与依据", on: true },
                { icon: Shield, title: "敏感数据脱敏", desc: "训练与推理前自动脱敏个人信息", on: true },
                { icon: Bell, title: "AI 异常熔断", desc: "置信度低于 60% 自动转人工", on: true },
              ].map((q) => (
                <Card key={q.title} className="border-border bg-card p-5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-[var(--effect-ai-purple)]/10 flex items-center justify-center">
                    <q.icon className="h-4 w-4 text-[var(--effect-ai-purple)]" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0 leading-tight">
                    <div className="text-body text-foreground font-medium">{q.title}</div>
                    <div className="text-caption text-text-tertiary mt-0.5">{q.desc}</div>
                  </div>
                  <Switch checked={q.on} className="data-[state=checked]:bg-primary" />
                </Card>
              ))}
            </div>
          </TabsContent>

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
                      <Badge variant="outline" className="text-caption font-normal border-border text-text-secondary">
                        {r.count}
                      </Badge>
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
                  <div key={t} className="rounded-md border border-border p-5 hover:border-primary/40 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-md bg-brand-subtle flex items-center justify-center">
                        <ClipboardList className="h-4 w-4 text-primary" strokeWidth={1.75} />
                      </div>
                      <Badge className="bg-[var(--state-success)]/15 text-[var(--core-brand)] border-0 text-caption font-normal">已启用</Badge>
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
