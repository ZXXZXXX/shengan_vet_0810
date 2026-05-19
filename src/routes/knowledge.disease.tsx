import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Search, Filter } from "lucide-react";

export const Route = createFileRoute("/knowledge/disease")({
  head: () => ({ meta: [{ title: "疾病知识库 — 奇点智牧" }] }),
  component: DiseaseKBPage,
});

const diseases = [
  { id: "DZ-001", name: "乳房炎", cat: "繁殖系统", severity: "中-高", symptoms: "乳房红肿、热痛，乳汁异常", prevent: "挤奶卫生、乳头药浴" },
  { id: "DZ-002", name: "蹄叶炎", cat: "蹄部疾病", severity: "中", symptoms: "跛行、蹄部发热、行走困难", prevent: "定期修蹄、地面保持干燥" },
  { id: "DZ-003", name: "瘤胃酸中毒", cat: "消化系统", severity: "高", symptoms: "食欲减退、腹泻、瘤胃运动减弱", prevent: "饲料过渡渐进、平衡精粗比" },
  { id: "DZ-004", name: "口蹄疫", cat: "传染病", severity: "高", symptoms: "口腔、蹄部、乳房水疱、溃烂", prevent: "强制免疫、隔离消毒" },
  { id: "DZ-005", name: "酮病", cat: "代谢疾病", severity: "中", symptoms: "食欲下降、产奶量骤减、酮味", prevent: "围产期能量平衡、监测血酮" },
];

function DiseaseKBPage() {
  return (
    <>
      <AppHeader title="疾病知识库" breadcrumb={["诊疗知识库", "疾病知识库"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索疾病名称 / 症状" className="h-9 w-72 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 分类</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建词条
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {diseases.map((d) => (
            <Card key={d.id} className="border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-card-title text-foreground">{d.name}</div>
                    <div className="text-caption text-text-tertiary font-mono">{d.id} · {d.cat}</div>
                  </div>
                </div>
                <span className={`tag ${d.severity === "高" ? "tag-danger" : d.severity === "中" ? "tag-warning" : "tag-muted"}`}>{d.severity}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-caption text-text-tertiary mb-1">典型症状</div>
                  <p className="text-body-sm text-text-secondary leading-relaxed">{d.symptoms}</p>
                </div>
                <div>
                  <div className="text-caption text-text-tertiary mb-1">防控要点</div>
                  <p className="text-body-sm text-text-secondary leading-relaxed">{d.prevent}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
