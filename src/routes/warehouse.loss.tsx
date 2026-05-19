import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import {
  WarehouseEventPage,
  type StatusConfig,
  type WarehouseEvent,
} from "@/components/warehouse-event-page";

export const Route = createFileRoute("/warehouse/loss")({
  head: () => ({ meta: [{ title: "损耗管理 — 奇点智牧" }] }),
  component: LossPage,
});

type LStatus = "待审核" | "已确认" | "已驳回";

const statuses: StatusConfig<LStatus>[] = [
  { key: "待审核", label: "待审核", icon: AlertTriangle, tone: "warning" },
  { key: "已确认", label: "已确认", icon: CheckCircle2, tone: "success" },
  { key: "已驳回", label: "已驳回", icon: XCircle, tone: "danger" },
];

const initial: WarehouseEvent<LStatus>[] = [
  {
    id: "LS-1086",
    lines: [{ item: "口蹄疫疫苗 A 型", qty: "8 支" }],
    desc: "冷链断电导致失效，估损 ¥ 480。",
    status: "待审核",
    operator: "孙库管",
    operatedAt: "2026-05-12 10:18",
  },
  {
    id: "LS-1085",
    lines: [{ item: "营养补充剂", qty: "2 罐" }],
    desc: "运输过程中外箱破损渗漏，估损 ¥ 180。",
    status: "已确认",
    operator: "王仓管",
    operatedAt: "2026-05-11 15:30",
  },
  {
    id: "LS-1084",
    lines: [{ item: "消毒液 戊二醛", qty: "5 L" }],
    desc: "过期销毁登记，估损 ¥ 220。",
    status: "已确认",
    operator: "孙库管",
    operatedAt: "2026-05-10 09:00",
  },
  {
    id: "LS-1083",
    lines: [{ item: "乳房炎抗生素", qty: "1 盒" }],
    desc: "误开未使用，已退回未通过，估损 ¥ 65。",
    status: "已驳回",
    operator: "李雨晴",
    operatedAt: "2026-05-09 14:42",
  },
];

function LossPage() {
  const [data, setData] = useState<WarehouseEvent<LStatus>[]>(initial);

  const advance = (id: string, next: LStatus) =>
    setData((d) => d.map((r) => (r.id === id ? { ...r, status: next } : r)));

  return (
    <WarehouseEventPage<LStatus>
      title="损耗管理"
      breadcrumb={["仓库管理", "损耗管理"]}
      statuses={statuses}
      events={data}
      searchPlaceholder="按损耗单号 / 物资 / 描述搜索"
      renderDetailActions={(detail, close) => {
        if (detail.status === "待审核") {
          return (
            <>
              <Button
                variant="outline"
                className="gap-1.5 text-[var(--state-danger)] hover:text-[var(--state-danger)] hover:bg-[var(--state-danger)]/10"
                onClick={() => { advance(detail.id, "已驳回"); close(); }}
              >
                <XCircle className="h-3.5 w-3.5" /> 驳回
              </Button>
              <Button
                className="gap-1.5 bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
                onClick={() => { advance(detail.id, "已确认"); close(); }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> 确认
              </Button>
            </>
          );
        }
        return <Button variant="outline" onClick={close}>关闭</Button>;
      }}
    />
  );
}
