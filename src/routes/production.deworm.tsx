import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, type WorkOrder } from "@/components/work-order-page";

const orders: WorkOrder[] = [
  { id: "WO-5021", target: "1 号牛舍", who: "周凯", event: "季度体内驱虫", proposer: "周凯", status: "待审核", desc: "1 号牛舍季度体内驱虫，需调拨广谱驱虫药 15 盒。", createdAt: "2026-05-12 08:20" },
  { id: "WO-5015", target: "3 号牛舍", who: "周凯", event: "体外驱虫喷淋", proposer: "李娜", status: "执行中", desc: "3 号牛舍体外驱虫喷淋作业中。", createdAt: "2026-05-11 09:30" },
  { id: "WO-4998", target: "2 号牛舍", who: "周凯", event: "驱虫批次", proposer: "周凯", status: "已完成", desc: "2 号牛舍驱虫批次完成，已记录用药明细。", createdAt: "2026-05-07 15:40" },
];

export const Route = createFileRoute("/production/deworm")({
  head: () => ({ meta: [{ title: "驱虫工单 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="驱虫工单" orders={orders} />,
});
