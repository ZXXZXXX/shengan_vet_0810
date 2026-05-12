import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Sparkles,
  ClipboardList,
  Workflow,
  BookOpen,
  Bot,
  ChevronRight,
  Plus,
  CheckCircle2,
  Lock,
  ToggleRight,
  Bell,
  GitBranch,
  Layers,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "配置中心 — 智牧 AI 平台" },
      { name: "description", content: "工单配置、规则配置、知识库与 AI 策略" },
    ],
  }),
  component: SettingsPage,
});

const modules = [
  { id: "workorder", name: "工单配置", desc: "工单类型、模板、字段、流程", icon: ClipboardList, count: "12 个类型", tone: "primary" },
  { id: "rules", name: "规则配置", desc: "告警、派单、升级、审批、通知", icon: Workflow, count: "38 条规则", tone: "ai" },
  { id: "knowledge", name: "知识库", desc: "疾病、症状、方案、规范、标准", icon: BookOpen, count: "1.2K 条目", tone: "success" },
  { id: "ai", name: "AI 策略", desc: "各场景 AI 启用与人工确认", icon: Bot, count: "8 个场景", tone: "ai" },
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

function SettingsPage() {
  return (
    <>
      <AppHeader title="配置中心" subtitle="工单 · 规则 · 知识库 · AI 策略" />
      <main className="flex-1 p-6 space-y-5">
        {/* Module switcher cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <Card
              key={m.id}
              className="border-border/60 shadow-soft hover:shadow-elegant hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-mesh opacity-0 group-hover:opacity-60 transition-opacity" />
              <CardContent className="relative p-5">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${
                  m.tone === "primary" ? "bg-primary/10 text-primary" :
                  m.tone === "ai" ? "bg-ai/10 text-ai" :
                  "bg-success/10 text-success"
                }`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.desc}</div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground tabular-nums">{m.count}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="ai" className="space-y-4">
          <TabsList className="bg-muted/50 h-9">
            <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-card gap-1.5">
              <Sparkles className="h-3 w-3" /> AI 策略
            </TabsTrigger>
            <TabsTrigger value="rules" className="text-xs data-[state=active]:bg-card gap-1.5">
              <Workflow className="h-3 w-3" /> 规则配置
            </TabsTrigger>
            <TabsTrigger value="workorder" className="text-xs data-[state=active]:bg-card gap-1.5">
              <ClipboardList className="h-3 w-3" /> 工单配置
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs data-[state=active]:bg-card gap-1.5">
              <BookOpen className="h-3 w-3" /> 知识库
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-0">
            <Card className="border-ai/20 shadow-soft relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-ai" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-ai" />
                      AI 场景总开关
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">控制各业务场景的 AI 启用状态与人工确认要求</p>
                  </div>
                  <Badge className="bg-ai/10 text-ai border-0 gap-1">
                    <Bot className="h-3 w-3" /> 6 / 8 已启用
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-border/60 p-0">
                {aiScenarios.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-medium">{s.name}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 ml-6">{s.desc}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">置信度</div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ${
                          s.conf === "高" ? "border-success/30 text-success bg-success/5" :
                          s.conf === "中" ? "border-warning/40 text-warning-foreground bg-warning/10" :
                          "text-muted-foreground"
                        }`}
                      >
                        {s.conf}
                      </Badge>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <Switch checked={s.needsReview} />
                      <span className="text-xs text-muted-foreground">需人工确认</span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${s.enabled ? "text-success" : "text-muted-foreground"}`}>
                          {s.enabled ? "已启用" : "已禁用"}
                        </span>
                        <Switch checked={s.enabled} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick toggles row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Lock, title: "AI 决策审计", desc: "记录每次 AI 决策的输入与依据", on: true },
                { icon: Shield, title: "敏感数据脱敏", desc: "训练与推理前自动脱敏个人信息", on: true },
                { icon: Bell, title: "AI 异常熔断", desc: "置信度低于 60% 自动转人工", on: true },
              ].map((q) => (
                <Card key={q.title} className="border-border/60 shadow-soft">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-ai/10 text-ai flex items-center justify-center">
                      <q.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{q.title}</div>
                      <div className="text-[11px] text-muted-foreground">{q.desc}</div>
                    </div>
                    <Switch checked={q.on} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-0">
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" /> 规则列表
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">告警、派单、升级、审批、通知规则</p>
                </div>
                <Button size="sm" className="h-8 gap-1.5 text-xs bg-gradient-primary border-0 shadow-glow">
                  <Plus className="h-3.5 w-3.5" /> 新建规则
                </Button>
              </CardHeader>
              <CardContent className="divide-y divide-border/60 p-0">
                {rules.map((r, i) => (
                  <div key={i} className="px-6 py-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                          <ChevronRight className="h-3 w-3" />
                          {r.action}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-[10px]">{r.count}</Badge>
                      </div>
                      <Switch checked />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workorder" className="mt-0">
            <Card className="border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> 工单类型
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "疾病疑似工单", "免疫接种工单", "防疫消杀工单", "治疗执行工单",
                  "复查确认工单", "饲料配送工单", "设备保养工单", "盘点工单",
                ].map((t) => (
                  <div key={t} className="rounded-xl border border-border/60 p-4 hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">已启用</Badge>
                    </div>
                    <div className="text-sm font-medium">{t}</div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                      <span className="text-[11px] text-muted-foreground">字段 · 流程</span>
                      <ToggleRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="mt-0">
            <Card className="border-border/60 shadow-soft">
              <CardContent className="p-12 text-center">
                <div className="h-12 w-12 rounded-xl bg-success/10 text-success flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium">知识库管理</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  沉淀疾病、症状、治疗方案、防疫规范、作业标准与设备维护知识 — 待扩展
                </p>
                <Button size="sm" className="mt-4 gap-1.5 text-xs bg-gradient-primary border-0 shadow-glow">
                  <Plus className="h-3.5 w-3.5" /> 新增条目
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
