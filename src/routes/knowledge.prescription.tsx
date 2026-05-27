import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/knowledge/prescription")({
  head: () => ({ meta: [{ title: "处方管理 — 奇点智牧" }] }),
  component: PrescriptionPage,
});

const rxs = [
  { id: "RX-001", name: "乳房炎标准处方 A", disease: "乳房炎", drugs: ["乳房炎抗生素 5mg ×2", "消炎药 ×1"], duration: "5 天", author: "李雨晴", updated: "2026-04-20" },
  { id: "RX-002", name: "口蹄疫紧急处方", disease: "口蹄疫", drugs: ["口蹄疫疫苗 A 型 ×1", "消毒液 ×5L"], duration: "立即", author: "陈晓东", updated: "2026-04-12" },
  { id: "RX-003", name: "蹄叶炎康复处方", disease: "蹄叶炎", drugs: ["消炎止痛剂 ×1", "蹄部护理液 ×1"], duration: "7 天", author: "李雨晴", updated: "2026-03-28" },
  { id: "RX-004", name: "酮病调理处方", disease: "酮病", drugs: ["丙二醇 500ml ×1", "葡萄糖注射液"], duration: "3 天", author: "赵兽医", updated: "2026-03-15" },
];

function PrescriptionPage() {
  return (
    <>
      <AppHeader title="处方管理" breadcrumb={["诊疗知识库", "处方管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索处方 / 疾病" className="h-9 w-72 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 适用疾病</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建处方
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-6 h-12 text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="grid grid-cols-5 gap-4 flex-1 min-w-0">
              <div>编号</div>
              <div>处方名称</div>
              <div>适用疾病</div>
              <div>用药组成</div>
              <div>疗程</div>
            </div>
            <div className="w-[140px] text-right shrink-0">功能</div>
          </div>
          {rxs.map((r) => (
            <div key={r.id} className="flex items-center gap-4 px-6 py-3 text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="grid grid-cols-5 gap-4 flex-1 min-w-0">
                <div className="font-mono text-body text-foreground truncate">{r.id}</div>
                <div className="flex items-center gap-1.5 text-body text-foreground truncate"><FileText className="h-3.5 w-3.5 text-primary shrink-0" /><span className="truncate">{r.name}</span></div>
                <div className="truncate"><span className="tag tag-brand">{r.disease}</span></div>
                <div className="text-body-sm text-text-secondary truncate">{r.drugs.join("、")}</div>
                <div className="text-body-sm text-text-secondary truncate">{r.duration}</div>
              </div>
              <div className="w-[140px] shrink-0 flex justify-end"><Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground">查看</Button></div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
