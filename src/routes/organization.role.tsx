import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";

export const Route = createFileRoute("/organization/role")({
  head: () => ({ meta: [{ title: "角色权限 — 奇点智牧" }] }),
  component: RolePage,
});

const roles = [
  { name: "超级管理员", count: 2, scope: "全平台", perms: 128 },
  { name: "场长", count: 3, scope: "本牧场全部", perms: 86 },
  { name: "兽医", count: 8, scope: "健康相关数据", perms: 42 },
  { name: "饲养员", count: 24, scope: "本班组", perms: 18 },
  { name: "审计只读", count: 4, scope: "全平台只读", perms: 36 },
];

function RolePage() {
  return (
    <>
      <AppHeader title="角色权限" breadcrumb={["首页", "组织与人员", "角色权限"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-end">
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建角色
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => (
            <Card key={r.name} className="border-border bg-card p-6 hover:border-primary/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="h-9 w-9 rounded-md bg-brand-subtle flex items-center justify-center">
                  <Shield className="h-4 w-4 text-primary" strokeWidth={1.75} />
                </div>
                <span className="tag tag-outline">{r.count} 人</span>
              </div>
              <div className="text-card-title text-foreground">{r.name}</div>
              <div className="text-caption text-text-tertiary mt-1">数据范围 · {r.scope}</div>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-caption text-text-tertiary">权限项</span>
                <span className="text-body font-medium tabular-nums text-foreground">{r.perms}</span>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
