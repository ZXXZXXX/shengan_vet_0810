import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, ChevronRight, Users } from "lucide-react";

export const Route = createFileRoute("/organization/")({
  head: () => ({
    meta: [
      { title: "组织架构 — 奇点智牧" },
      { name: "description", content: "组织节点平铺列表" },
    ],
  }),
  component: OrgStructurePage,
});

type OrgRow = {
  code: string;
  name: string;
  level: string;
  parent: string;
  leader: string;
  people: number;
  status: "启用" | "停用";
};

const rows: OrgRow[] = [
  { code: "GRP-001", name: "奇点牧业集团", level: "集团（租户）", parent: "—", leader: "陈志远", people: 96, status: "启用" },
  { code: "ORG-101", name: "1 号牧场", level: "经营主体", parent: "奇点牧业集团", leader: "张磊", people: 48, status: "启用" },
  { code: "DEP-1011", name: "饲养部", level: "部门", parent: "1 号牧场", leader: "王建国", people: 18, status: "启用" },
  { code: "DEP-1012", name: "兽医部", level: "部门", parent: "1 号牧场", leader: "李雨晴", people: 9, status: "启用" },
  { code: "DEP-1013", name: "挤奶车间", level: "部门", parent: "1 号牧场", leader: "刘倩", people: 12, status: "启用" },
  { code: "DEP-1014", name: "运维支持", level: "部门", parent: "1 号牧场", leader: "周凯", people: 9, status: "启用" },
  { code: "ORG-102", name: "2 号牧场", level: "经营主体", parent: "奇点牧业集团", leader: "高建波", people: 32, status: "启用" },
  { code: "DEP-1021", name: "饲养部", level: "部门", parent: "2 号牧场", leader: "孙明", people: 14, status: "启用" },
  { code: "DEP-1022", name: "挤奶车间", level: "部门", parent: "2 号牧场", leader: "赵岩", people: 10, status: "启用" },
  { code: "ORG-201", name: "总部职能", level: "经营主体", parent: "奇点牧业集团", leader: "陈思琪", people: 16, status: "启用" },
  { code: "ORG-301", name: "试验性饲养基地", level: "经营主体", parent: "奇点牧业集团", leader: "—", people: 0, status: "停用" },
];

function OrgStructurePage() {
  return (
    <>
      <AppHeader title="组织架构" breadcrumb={["组织与人员", "组织架构"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索组织名称、编号、负责人" className="h-9 w-72 pl-9 text-body-sm bg-card border-border" />
            </div>
            <Button variant="outline" size="sm" className="h-9 text-body-sm font-normal">全部层级</Button>
            <Button variant="outline" size="sm" className="h-9 text-body-sm font-normal">全部状态</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新增组织
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">组织编号</div>
            <div className="col-span-3">组织名称</div>
            <div className="col-span-1">层级</div>
            <div className="col-span-2">上级组织</div>
            <div className="col-span-1">负责人</div>
            <div className="col-span-1 text-right">人数</div>
            <div className="col-span-1">状态</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.code}
              className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors"
            >
              <div className="col-span-2 font-mono text-body-sm text-text-tertiary">{r.code}</div>
              <div className="col-span-3 flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-brand-subtle flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                </div>
                <span className="text-body text-foreground">{r.name}</span>
              </div>
              <div className="col-span-1"><span className="tag tag-muted">{r.level}</span></div>
              <div className="col-span-2 text-body-sm text-text-secondary">{r.parent}</div>
              <div className="col-span-1 text-body-sm text-text-secondary">{r.leader}</div>
              <div className="col-span-1 text-right tabular-nums text-body text-foreground flex items-center justify-end gap-1">
                <Users className="h-3 w-3 text-text-tertiary" />{r.people}
              </div>
              <div className="col-span-1">
                <span className={`tag ${r.status === "启用" ? "tag-success" : "tag-muted"}`}>{r.status}</span>
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <Link to="/organization/people" className="inline-flex items-center gap-0.5 text-body-sm text-primary hover:underline">
                  详情 <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
