import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/organization/team")({
  head: () => ({ meta: [{ title: "分组作业 — 奇点智牧" }] }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <>
      <AppHeader title="分组作业" breadcrumb={["首页", "组织与人员", "分组作业"]} />
      <main className="flex-1 px-6 py-6">
        <Card className="border-border bg-card p-12 text-center">
          <p className="text-body text-text-tertiary">班组、排班与责任范围管理界面 — 待扩展。</p>
        </Card>
      </main>
    </>
  );
}
