import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, Plus, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/warehouse/drug")({
  head: () => ({ meta: [{ title: "药品档案 — 奇点智牧" }] }),
  component: DrugArchivePage,
});

const drugs = [
  { id: "DR-0108", name: "乳房炎抗生素 5mg", spec: "5mg × 10 支/盒", cat: "抗生素", maker: "华牧药业", reg: "兽药字 2023021", withdraw: "7 天" },
  { id: "DR-0214", name: "口蹄疫疫苗 A 型", spec: "10ml/支", cat: "疫苗", maker: "国农生物", reg: "兽药字 2024008", withdraw: "21 天" },
  { id: "DR-0306", name: "驱虫剂 伊维菌素", spec: "100ml/瓶", cat: "驱虫药", maker: "瑞畜医药", reg: "兽药字 2022115", withdraw: "14 天" },
  { id: "DR-0412", name: "营养补充剂 复合维生素", spec: "500g/罐", cat: "营养剂", maker: "牧元生物", reg: "兽药字 2023089", withdraw: "无" },
  { id: "DR-0521", name: "消毒液 戊二醛", spec: "5L/桶", cat: "消毒剂", maker: "华牧药业", reg: "兽药字 2021045", withdraw: "—" },
];

function DrugArchivePage() {
  return (
    <>
      <AppHeader title="药品档案" breadcrumb={["药品管理", "药品档案"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索药品名称 / 编号" className="h-9 w-64 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 分类</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建药品
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-2">编号</div>
            <div className="col-span-3">药品名称</div>
            <div className="col-span-2">规格</div>
            <div className="col-span-1">分类</div>
            <div className="col-span-2">生产厂家</div>
            <div className="col-span-1">休药期</div>
            <div className="col-span-1 text-right">操作</div>
          </div>
          {drugs.map((d) => (
            <div key={d.id} className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="col-span-2 font-mono text-body text-foreground">{d.id}</div>
              <div className="col-span-3 flex items-center gap-1.5 text-body text-foreground"><Pill className="h-3.5 w-3.5 text-primary" />{d.name}</div>
              <div className="col-span-2 text-body-sm text-text-secondary">{d.spec}</div>
              <div className="col-span-1"><span className="tag tag-muted">{d.cat}</span></div>
              <div className="col-span-2 text-body-sm text-text-secondary truncate">{d.maker}</div>
              <div className="col-span-1 text-body-sm text-text-secondary">{d.withdraw}</div>
              <div className="col-span-1 flex justify-end"><Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary">编辑</Button></div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
