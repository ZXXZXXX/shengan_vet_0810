import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, Users, Beef, Calendar } from "lucide-react";

export const Route = createFileRoute("/organization/tenant")({
  head: () => ({ meta: [{ title: "租户管理 — 奇点智牧" }] }),
  component: TenantPage,
});

type Plan = "旗舰版" | "专业版" | "标准版";
const tenants: { id: string; name: string; code: string; plan: Plan; users: number; cattle: number; expiry: string; status: "正常" | "即将到期" }[] = [
  { id: "T001", name: "奇点牧业集团", code: "qd-mu", plan: "旗舰版", users: 156, cattle: 2486, expiry: "2027-12-31", status: "正常" },
  { id: "T002", name: "绿源乳业", code: "ly-dairy", plan: "专业版", users: 42, cattle: 860, expiry: "2026-08-15", status: "即将到期" },
  { id: "T003", name: "北疆牧场合作社", code: "bj-coop", plan: "标准版", users: 18, cattle: 320, expiry: "2026-11-20", status: "正常" },
];

function planTag(p: Plan) {
  return p === "旗舰版" ? "tag tag-brand" : p === "专业版" ? "tag tag-brand" : "tag tag-muted";
}

function TenantPage() {
  return (
    <>
      <AppHeader title="租户管理" breadcrumb={["组织管理", "租户管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input placeholder="搜索租户名称 / 编码" className="h-9 w-72 pl-9 text-body-sm" />
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建租户
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((t) => (
            <Card key={t.id} className="border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-card-title text-foreground">{t.name}</div>
                    <div className="text-caption text-text-tertiary font-mono">{t.code}</div>
                  </div>
                </div>
                <span className={planTag(t.plan)}>{t.plan}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border">
                <div>
                  <div className="flex items-center gap-1.5 text-caption text-text-tertiary"><Users className="h-3 w-3" /> 用户</div>
                  <div className="tabular-nums text-section-title text-foreground mt-0.5">{t.users}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-caption text-text-tertiary"><Beef className="h-3 w-3" /> 存栏</div>
                  <div className="tabular-nums text-section-title text-foreground mt-0.5">{t.cattle.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-caption text-text-tertiary"><Calendar className="h-3 w-3" /> 到期 {t.expiry}</div>
                <span className={`tag ${t.status === "正常" ? "tag-success" : "tag-warning"}`}>{t.status}</span>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
