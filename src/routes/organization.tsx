import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Shield,
  UserPlus,
  Users,
  Sparkles,
  MoreHorizontal,
  Briefcase,
} from "lucide-react";

export const Route = createFileRoute("/organization")({
  head: () => ({
    meta: [
      { title: "组织与人员管理 — 智牧 AI 平台" },
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
  { name: "张磊", role: "场长", dept: "兽医部", phone: "138****2381", status: "在岗", color: "from-blue-500 to-cyan-500" },
  { name: "李雨晴", role: "首席兽医", dept: "兽医部", phone: "139****9210", status: "在岗", color: "from-violet-500 to-fuchsia-500" },
  { name: "王建国", role: "饲养主管", dept: "饲养部", phone: "137****1102", status: "在岗", color: "from-emerald-500 to-teal-500" },
  { name: "陈思琪", role: "数据分析师", dept: "总部职能", phone: "186****4421", status: "请假", color: "from-amber-500 to-orange-500" },
  { name: "周凯", role: "巡检员", dept: "兽医部", phone: "135****8821", status: "在岗", color: "from-pink-500 to-rose-500" },
  { name: "刘倩", role: "挤奶班长", dept: "挤奶车间", phone: "186****3344", status: "在岗", color: "from-sky-500 to-indigo-500" },
];

const roles = [
  { name: "超级管理员", count: 2, scope: "全平台", perms: 128 },
  { name: "场长", count: 3, scope: "本牧场全部", perms: 86 },
  { name: "兽医", count: 8, scope: "健康相关数据", perms: 42 },
  { name: "饲养员", count: 24, scope: "本班组", perms: 18 },
  { name: "审计只读", count: 4, scope: "全平台只读", perms: 36 },
];

function OrganizationPage() {
  return (
    <>
      <AppHeader title="组织与人员管理" subtitle="人员账号 · 组织架构 · 角色权限 · 分组作业" />
      <main className="flex-1 p-6 space-y-5">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "在册人员", value: "96", sub: "本月 +4", icon: Users, tone: "primary" },
            { label: "组织节点", value: "12", sub: "3 经营主体", icon: Building2, tone: "ai" },
            { label: "活跃角色", value: "8", sub: "权限项 218", icon: Shield, tone: "success" },
            { label: "在岗班组", value: "14", sub: "今日值守 32 人", icon: Briefcase, tone: "warning" },
          ].map((s) => (
            <Card key={s.label} className="border-border/60 shadow-soft">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                  s.tone === "primary" ? "bg-primary/10 text-primary" :
                  s.tone === "ai" ? "bg-ai/10 text-ai" :
                  s.tone === "success" ? "bg-success/10 text-success" :
                  "bg-warning/15 text-warning-foreground"
                }`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label} · {s.sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="people" className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList className="bg-muted/50 h-9">
              <TabsTrigger value="people" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft">人员账号</TabsTrigger>
              <TabsTrigger value="org" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft">组织架构</TabsTrigger>
              <TabsTrigger value="role" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft">角色权限</TabsTrigger>
              <TabsTrigger value="team" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-soft">分组与作业</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="搜索人员、岗位、手机号" className="h-9 w-64 pl-9 text-xs bg-card" />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                <Filter className="h-3.5 w-3.5" /> 筛选
              </Button>
              <Button size="sm" className="h-9 gap-1.5 text-xs bg-gradient-primary border-0 shadow-glow">
                <UserPlus className="h-3.5 w-3.5" /> 新增人员
              </Button>
            </div>
          </div>

          <TabsContent value="people" className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-0">
            {/* Org tree */}
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  组织树
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {orgTree.map((node) => (
                  <div key={node.name}>
                    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted cursor-pointer">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span className="flex-1 font-medium">{node.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{node.count}</span>
                    </div>
                    {node.children.map((c) => (
                      <div
                        key={c.name}
                        className={`ml-6 flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer ${
                          c.active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                        }`}
                      >
                        <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                        <span className="flex-1">{c.name}</span>
                        <span className="text-xs opacity-70 tabular-nums">{c.count}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* People table */}
            <Card className="lg:col-span-3 border-border/60 shadow-soft">
              <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm">兽医部 · 人员列表</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">共 9 人 · 在岗 8 人</p>
                </div>
                <Badge className="bg-ai/10 text-ai border-0 gap-1">
                  <Sparkles className="h-3 w-3" /> AI 推荐 2 项岗位调整
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 gap-3 px-6 py-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider border-y border-border/60 bg-muted/20">
                  <div className="col-span-3">姓名 / 岗位</div>
                  <div className="col-span-2">部门</div>
                  <div className="col-span-3">联系方式</div>
                  <div className="col-span-2">状态</div>
                  <div className="col-span-2 text-right">操作</div>
                </div>
                {people.map((p) => (
                  <div
                    key={p.name}
                    className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center text-sm border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className={`bg-gradient-to-br ${p.color} text-white text-xs`}>
                          {p.name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.role}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-muted-foreground">{p.dept}</div>
                    <div className="col-span-3 font-mono text-xs text-muted-foreground">{p.phone}</div>
                    <div className="col-span-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ${
                          p.status === "在岗"
                            ? "border-success/30 text-success bg-success/5"
                            : "border-warning/30 text-warning-foreground bg-warning/10"
                        }`}
                      >
                        <span className={`h-1 w-1 rounded-full mr-1 ${p.status === "在岗" ? "bg-success" : "bg-warning"}`} />
                        {p.status}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">权限</Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role" className="mt-0">
            <Card className="border-border/60 shadow-soft">
              <CardHeader>
                <CardTitle className="text-sm">角色定义</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map((r) => (
                  <div key={r.name} className="rounded-xl border border-border/60 p-4 hover:border-primary/30 hover:shadow-soft transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Shield className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">{r.count} 人</Badge>
                    </div>
                    <div className="font-medium text-sm">{r.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">数据范围 · {r.scope}</div>
                    <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">权限项</span>
                      <span className="text-sm font-mono font-semibold tabular-nums">{r.perms}</span>
                    </div>
                  </div>
                ))}
                <button className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center justify-center gap-2 min-h-[140px]">
                  <Plus className="h-5 w-5" />
                  新增角色
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="org" className="mt-0">
            <Card className="border-border/60 shadow-soft">
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                选择上方人员账号 Tab 查看组织树详情，或扩展此处的可视化组织架构图。
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-0">
            <Card className="border-border/60 shadow-soft">
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                班组、排班与责任范围管理界面 — 待扩展。
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
