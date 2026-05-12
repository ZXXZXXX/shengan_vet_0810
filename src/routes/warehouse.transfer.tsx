import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/warehouse/transfer")({
  head: () => ({ meta: [{ title: "调拨盘点 — 奇点智牧" }] }),
  component: TransferPage,
});

function TransferPage() {
  return (
    <>
      <AppHeader title="调拨盘点" breadcrumb={["首页", "仓库管理", "调拨盘点"]} />
      <main className="flex-1 px-6 py-6">
        <Card className="border-border bg-card p-12 text-center">
          <p className="text-body text-text-tertiary">仓库间调拨与定期盘点界面 — 待扩展。</p>
        </Card>
      </main>
    </>
  );
}
