import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Filter, Search, UserPlus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/organization/people")({
  head: () => ({ meta: [{ title: "人员账号 — 奇点智牧" }] }),
  component: PeoplePage,
});

const people = [
  { name: "张磊", role: "场长", dept: "兽医部", phone: "138****2381", status: "在岗" },
  { name: "李雨晴", role: "首席兽医", dept: "兽医部", phone: "139****9210", status: "在岗" },
  { name: "王建国", role: "饲养主管", dept: "饲养部", phone: "137****1102", status: "在岗" },
  { name: "陈思琪", role: "数据分析师", dept: "总部职能", phone: "186****4421", status: "请假" },
  { name: "周凯", role: "巡检员", dept: "兽医部", phone: "135****8821", status: "在岗" },
  { name: "刘倩", role: "挤奶班长", dept: "挤奶车间", phone: "186****3344", status: "在岗" },
  { name: "孙明", role: "饲养主管", dept: "2 号饲养部", phone: "135****1923", status: "在岗" },
  { name: "赵岩", role: "挤奶班长", dept: "2 号挤奶车间", phone: "139****7710", status: "在岗" },
];

function PeoplePage() {
  return (
    <>
      <AppHeader title="人员账号" breadcrumb={["首页", "组织与人员", "人员账号"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索人员、岗位、手机号" className="h-9 w-72 pl-9 text-body-sm bg-card border-border" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <Filter className="h-3.5 w-3.5" /> 筛选
            </Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <UserPlus className="h-3.5 w-3.5" /> 新增人员
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-3">姓名 / 岗位</div>
            <div className="col-span-3">部门</div>
            <div className="col-span-3">联系方式</div>
            <div className="col-span-1">状态</div>
            <div className="col-span-2 text-right">操作</div>
          </div>
          {people.map((p) => (
            <div key={p.name} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
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
              <div className="col-span-3 text-body-sm text-text-secondary">{p.dept}</div>
              <div className="col-span-3 font-mono text-body-sm text-text-tertiary">{p.phone}</div>
              <div className="col-span-1">
                <span className={`tag ${p.status === "在岗" ? "tag-success" : "tag-warning"}`}>{p.status}</span>
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
      </main>
    </>
  );
}
