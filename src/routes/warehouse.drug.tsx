import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Pill, Plus, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/warehouse/drug")({
  head: () => ({ meta: [{ title: "药品档案 — 奇点智牧" }] }),
  component: DrugArchivePage,
});

type Drug = { id: string; name: string; spec: string; cat: string; maker: string; reg: string; withdraw: string };

const drugs: Drug[] = [
  { id: "DR-0108", name: "乳房炎抗生素 5mg", spec: "5mg × 10 支/盒", cat: "抗生素", maker: "华牧药业", reg: "兽药字 2023021", withdraw: "7 天" },
  { id: "DR-0214", name: "口蹄疫疫苗 A 型", spec: "10ml/支", cat: "疫苗", maker: "国农生物", reg: "兽药字 2024008", withdraw: "21 天" },
  { id: "DR-0306", name: "驱虫剂 伊维菌素", spec: "100ml/瓶", cat: "驱虫药", maker: "瑞畜医药", reg: "兽药字 2022115", withdraw: "14 天" },
  { id: "DR-0412", name: "营养补充剂 复合维生素", spec: "500g/罐", cat: "营养剂", maker: "牧元生物", reg: "兽药字 2023089", withdraw: "无" },
  { id: "DR-0521", name: "消毒液 戊二醛", spec: "5L/桶", cat: "消毒剂", maker: "华牧药业", reg: "兽药字 2021045", withdraw: "—" },
];

function DrugArchivePage() {
  const [detail, setDetail] = useState<Drug | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");

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
          <div className="flex items-center gap-4 px-6 h-12 text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="grid grid-cols-6 gap-4 flex-1 min-w-0">
              <div>编号</div>
              <div>药品名称</div>
              <div>规格</div>
              <div>分类</div>
              <div>生产厂家</div>
              <div>休药期</div>
            </div>
            <div className="w-[140px] text-right shrink-0">功能</div>
          </div>
          {drugs.map((d) => (
            <div key={d.id} className="flex items-center gap-4 px-6 h-12 text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="grid grid-cols-6 gap-4 flex-1 min-w-0">
                <div className="font-mono text-body text-foreground truncate">{d.id}</div>
                <div className="flex items-center gap-1.5 text-body text-foreground truncate"><Pill className="h-3.5 w-3.5 text-primary shrink-0" /><span className="truncate">{d.name}</span></div>
                <div className="text-body-sm text-text-secondary truncate">{d.spec}</div>
                <div className="truncate"><span className="tag tag-muted">{d.cat}</span></div>
                <div className="text-body-sm text-text-secondary truncate">{d.maker}</div>
                <div className="text-body-sm text-text-secondary truncate">{d.withdraw}</div>
              </div>
              <div className="w-[140px] shrink-0 flex justify-end items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground" onClick={() => { setMode("view"); setDetail(d); }}>查看</Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary" onClick={() => { setMode("edit"); setDetail(d); }}>编辑</Button>
              </div>
            </div>
          ))}
        </Card>
      </main>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-section-title">{mode === "edit" ? "编辑药品" : "药品详情"}</SheetTitle>
          </SheetHeader>
          {detail && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-body-sm text-foreground">{detail.id}</span>
                <span className="tag tag-muted">{detail.cat}</span>
              </div>
              {mode === "view" ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border p-4">
                  <Field label="药品名称" value={detail.name} />
                  <Field label="规格" value={detail.spec} />
                  <Field label="分类" value={detail.cat} />
                  <Field label="生产厂家" value={detail.maker} />
                  <Field label="注册证号" value={detail.reg} />
                  <Field label="休药期" value={detail.withdraw} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <FieldEdit label="药品名称" defaultValue={detail.name} className="col-span-2" />
                  <FieldEdit label="规格" defaultValue={detail.spec} />
                  <FieldEdit label="分类" defaultValue={detail.cat} />
                  <FieldEdit label="生产厂家" defaultValue={detail.maker} />
                  <FieldEdit label="注册证号" defaultValue={detail.reg} />
                  <FieldEdit label="休药期" defaultValue={detail.withdraw} />
                </div>
              )}
            </div>
          )}
          {mode === "edit" && (
            <SheetFooter className="gap-2 mt-6">
              <Button variant="outline" onClick={() => setDetail(null)}>取消</Button>
              <Button className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground" onClick={() => setDetail(null)}>保存</Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="leading-tight">
      <div className="text-caption text-text-tertiary">{label}</div>
      <div className="text-body-sm text-foreground mt-0.5">{value}</div>
    </div>
  );
}

function FieldEdit({ label, defaultValue, className }: { label: string; defaultValue: string; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-caption text-text-tertiary">{label}</Label>
      <Input defaultValue={defaultValue} className="h-9 mt-1 text-body-sm" />
    </div>
  );
}
