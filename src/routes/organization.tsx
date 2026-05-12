import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Filter,
  Plus,
  Search,
  Shield,
  UserPlus,
  Users,
  MoreHorizontal,
  Briefcase,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/organization")({
  head: () => ({
    meta: [
      { title: "组织与人员管理 — 奇点智牧" },
      { name: "description", content: "管理人员、组织架构、角色权限与班组作业" },
    ],
  }),
  component: OrganizationPage,
});

const orgTree = [
  {
    name: "1 号牧场",
    count: 48,
    children: [
      { name: "饲养部", count: 18, active: false },
      { name: "兽医部", count: 9, active: true },
      { name: "挤奶车间", count: 12, active: false },
      { name: "运维支持", count: 9, active: false },
    ],
  },
  { name: "2 号牧场", count: 32, children: [] },
  { name: "总部职能", count: 16, children: [] },
];

const people = [
  { name: "张磊", role: "场长", dept: "兽医部", phone: "138****2381", status: "在岗" },
  { name: "李雨晴", role: "首席兽医", dept: "兽医部", phone: "139****9210", status: "在岗" },
  { name: "王建国", role: "饲养主管", dept: "饲养部", phone: "137****1102", status: "在岗" },
  { name: "陈思琪", role: "数据分析师", dept: "总部职能", phone: "186****4421", status: "请假" },
  { name: "周凯", role: "巡检员", dept: "兽医部", phone: "135****8821", status: "在岗" },
  { name: "刘倩", role: "挤奶班长", dept: "挤奶车间", phone: "186****3344", status: "在岗" },
];

const roles = [
  { name: "超级管理员", count: 2, scope: "全平台", perms: 128 },
  { name: "场长", count: 3, scope: "本牧场全部", perms: 86 },
  { name: "兽医", count: 8, scope: "健康相关数据", perms: 42 },
  { name: "饲养员", count: 24, scope: "本班组", perms: 18 },
  { name: "审计只读", count: 4, scope: "全平台只读", perms: 36 },
];

const stats = [
  { label: "在册人员", value: "96", sub: "本月 +4", icon: Users },
  { label: "组织节点", value: "12", sub: "3 经营主体", icon: Building2 },
  { label: "活跃角色", value: "8", sub: "权限项 218", icon: Shield },
  { label: "在岗班组", value: "14", sub: "今日值守 32 人", icon: Briefcase },
];

function OrganizationPage() {
  return (
    <>
      <AppHeader title="组织与人员管理" breadcrumb={["首页", "组织与人员"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border-border bg-card shadow-card p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-md bg-brand-subtle flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-section-title tabular-nums text-foreground">{s.value}</div>
                <div className="text-caption text-text-tertiary">{s.label} · {s.sub}</div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="people" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b border-border rounded-none w-full justify-start">
              {[
                { v: "people", l: "人员账号" },
                { v: "org", l: "组织架构" },
                { v: "role", l: "角色权限" },
                { v: "team", l: "分组与作业" },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="px-0 pb-3 pt-2 rounded-none text-body text-text-secondary data-[state=active]:text-primary data-[state=active]:font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-[inset_0_-2px_0_var(--brand)] hover:text-foreground"
                >
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="people" className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-0">
            {/* Org tree */}
            <Card className="border-border bg-card shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-card-title text-foreground">组织树</h3>
                <button className="h-7 w-7 inline-flex items-center justify-center rounded-md text-text-tertiary hover:bg-surface-subtle hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-0.5">
                {orgTree.map((node) => (
                  <div key={node.name}>
                    <div className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-surface-subtle cursor-pointer">
                      <ChevronDown className="h-3 w-3 text-text-tertiary" />
                      <Building2 className="h-3.5 w-3.5 text-text-secondary" strokeWidth={1.75} />
                      <span className="flex-1 text-body text-foreground">{node.name}</span>
                      <span className="text-caption text-text-tertiary tabular-nums">{node.count}</span>
                    </div>
                    {node.children.map((c) => (
                      <div
                        key={c.name}
                        className={`ml-5 flex items-center gap-2 py-2 pl-3 pr-2 rounded-md cursor-pointer relative ${
                          c.active
                            ? "bg-brand-subtle text-primary font-medium before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-primary before:rounded-r"
                            : "hover:bg-surface-subtle text-text-secondary"
                        }`}
                      >
                        <span className="flex-1 text-body-sm">{c.name}</span>
                        <span className="text-caption opacity-70 tabular-nums">{c.count}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            {/* People table */}
            <Card className="lg:col-span-3 border-border bg-card shadow-card overflow-hidden">
              <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-card-title text-foreground">兽医部 · 人员列表</h3>
                  <p className="text-caption text-text-tertiary mt-0.5">共 9 人 · 在岗 8 人</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                    <Input placeholder="搜索人员、岗位、手机号" className="h-9 w-64 pl-9 text-body-sm bg-card border-border" />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
                    <Filter className="h-3.5 w-3.5" /> 筛选
                  </Button>
                  <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
                    <UserPlus className="h-3.5 w-3.5" /> 新增人员
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-y border-border bg-surface-subtle">
                <div className="col-span-3">姓名 / 岗位</div>
                <div className="col-span-2">部门</div>
                <div className="col-span-3">联系方式</div>
                <div className="col-span-2">状态</div>
                <div className="col-span-2 text-right">操作</div>
              </div>
              {people.map((p) => (
                <div
                  key={p.name}
                  className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors"
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-subtle text-primary text-body-sm font-medium">
                        {p.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="text-body text-foreground">{p.name}</div>
                      <div className="text-caption text-text-tertiary">{p.role}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-body-sm text-text-secondary">{p.dept}</div>
                  <div className="col-span-3 font-mono text-body-sm text-text-tertiary">{p.phone}</div>
                  <div className="col-span-2">
                    <Badge
                      className={`h-6 px-2 text-caption font-normal border-0 rounded ${
                        p.status === "在岗"
                          ? "bg-[var(--state-success)]/15 text-[var(--core-brand)]"
                          : "bg-[var(--state-warning)]/30 text-foreground"
                      }`}
                    >
                      <span className={`h-1 w-1 rounded-full mr-1.5 ${
                        p.status === "在岗" ? "bg-[var(--state-success)]" : "bg-[var(--state-warning)]"
                      }`} />
                      {p.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary">权限</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-text-tertiary">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          </TabsContent>

          <TabsContent value="role" className="mt-0">
            <Card className="border-border bg-card shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-card-title text-foreground">角色定义</h3>
                <Badge className="bg-[var(--effect-ai-purple)]/10 text-[var(--effect-ai-purple)] border-0 gap-1 font-normal">
                  <Sparkles className="h-3 w-3" /> AI 推荐 2 项岗位调整
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map((r) => (
                  <div key={r.name} className="rounded-md border border-border p-5 hover:border-primary/40 hover:shadow-card transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-9 w-9 rounded-md bg-brand-subtle flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} />
                      </div>
                      <Badge variant="outline" className="text-caption font-normal border-border">{r.count} 人</Badge>
                    </div>
                    <div className="text-card-title text-foreground">{r.name}</div>
                    <div className="text-caption text-text-tertiary mt-1">数据范围 · {r.scope}</div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-caption text-text-tertiary">权限项</span>
                      <span className="text-body font-medium tabular-nums text-foreground">{r.perms}</span>
                    </div>
                  </div>
                ))}
                <button className="rounded-md border border-dashed border-border p-5 text-body text-text-tertiary hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2 min-h-[148px]">
                  <Plus className="h-5 w-5" />
                  新增角色
                </button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="org" className="mt-0">
            <Card className="border-border bg-card shadow-card p-12 text-center">
              <p className="text-body text-text-tertiary">选择上方人员账号 Tab 查看组织树详情，或扩展此处的可视化组织架构图。</p>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-0">
            <Card className="border-border bg-card shadow-card p-12 text-center">
              <p className="text-body text-text-tertiary">班组、排班与责任范围管理界面 — 待扩展。</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
