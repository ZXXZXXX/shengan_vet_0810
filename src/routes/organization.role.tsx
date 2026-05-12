import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck, Briefcase, Stethoscope, HeartPulse } from "lucide-react";

export const Route = createFileRoute("/organization/role")({
  head: () => ({ meta: [{ title: "角色权限 — 奇点智牧" }] }),
  component: RolePage,
});

const roles = [
  { name: "超级管理员", count: 2, scope: "全平台", perms: 8, icon: ShieldCheck },
  { name: "场长", count: 3, scope: "本牧场全部", perms: 7, icon: Briefcase },
  { name: "兽医", count: 8, scope: "健康相关数据", perms: 5, icon: Stethoscope },
  { name: "兽医助理", count: 6, scope: "健康执行 / 录入", perms: 3, icon: HeartPulse },
];

function RolePage() {
  return (
    <>
      <AppHeader title="角色权限" breadcrumb={["组织与人员", "角色权限"]} />
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
                  <r.icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
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
