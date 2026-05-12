import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

export const Route = createFileRoute("/settings/knowledge")({
  head: () => ({ meta: [{ title: "知识库 — 奇点智牧" }] }),
  component: KnowledgePage,
});

function KnowledgePage() {
  return (
    <>
      <AppHeader title="知识库" breadcrumb={["配置中心", "知识库"]} />
      <main className="flex-1 px-6 py-6">
        <Card className="border-border bg-card p-12 text-center">
          <div className="h-12 w-12 rounded-md bg-brand-subtle flex items-center justify-center mx-auto mb-3">
            <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <div className="text-card-title text-foreground">知识库管理</div>
          <p className="text-body-sm text-text-tertiary mt-1 max-w-md mx-auto">
            沉淀疾病、症状、治疗方案、防疫规范、作业标准与设备维护知识 — 待扩展
          </p>
          <Button size="sm" className="mt-4 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新增条目
          </Button>
        </Card>
      </main>
    </>
  );
}
