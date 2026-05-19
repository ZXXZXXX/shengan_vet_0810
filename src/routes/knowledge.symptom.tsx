import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/knowledge/symptom")({
  head: () => ({ meta: [{ title: "症状知识库 — 奇点智牧" }] }),
  component: SymptomKBPage,
});

const symptoms = [
  { id: "SY-01", name: "持续高烧", related: ["呼吸道疾病", "乳房炎", "口蹄疫"], urgency: "高" },
  { id: "SY-02", name: "跛行", related: ["蹄叶炎", "关节炎"], urgency: "中" },
  { id: "SY-03", name: "食欲减退", related: ["瘤胃酸中毒", "酮病"], urgency: "中" },
  { id: "SY-04", name: "乳房红肿", related: ["乳房炎"], urgency: "高" },
  { id: "SY-05", name: "腹泻", related: ["瘤胃酸中毒", "犊牛腹泻症"], urgency: "中" },
  { id: "SY-06", name: "产奶量骤降", related: ["乳房炎", "酮病"], urgency: "高" },
  { id: "SY-07", name: "口腔水疱", related: ["口蹄疫"], urgency: "高" },
  { id: "SY-08", name: "体温偏低", related: ["产后瘫痪", "酮病"], urgency: "中" },
];

function SymptomKBPage() {
  return (
    <>
      <AppHeader title="症状知识库" breadcrumb={["诊疗知识库", "症状知识库"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input placeholder="搜索症状关键词" className="h-9 w-72 pl-9 text-body-sm" />
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建症状
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {symptoms.map((s) => (
            <Card key={s.id} className="border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <span className="text-card-title text-foreground">{s.name}</span>
                </div>
                <span className={`tag ${s.urgency === "高" ? "tag-danger" : "tag-warning"}`}>{s.urgency}</span>
              </div>
              <div className="text-caption text-text-tertiary mb-2">关联疾病</div>
              <div className="flex flex-wrap gap-1.5">
                {s.related.map((r) => (
                  <span key={r} className="tag tag-muted">{r}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
