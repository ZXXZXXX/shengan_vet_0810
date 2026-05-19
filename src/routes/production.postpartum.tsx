import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, type WorkOrder } from "@/components/work-order-page";

const orders: WorkOrder[] = [
  {
    id: "WO-2120", target: "#A2120", event: "产后子宫复旧观察", proposer: "李雨晴",
    status: "已完成", desc: "产后第 7 天复旧良好，进入正常泌乳期。",
    createdAt: "2026-05-08 11:15",
    reviewer: "王建国", reviewedAt: "2026-05-08 12:00",
    executor: "李雨晴", executedAt: "2026-05-15 09:00",
  },
  {
    id: "WO-2135", target: "#A2135", event: "胎衣不下处理", proposer: "周凯",
    status: "执行中", desc: "胎衣不下 24h 以上，已介入治疗。",
    createdAt: "2026-05-19 07:40",
    reviewer: "王建国", reviewedAt: "2026-05-19 08:00",
    executor: "李雨晴", executedAt: "2026-05-19 09:20",
  },
];

export const Route = createFileRoute("/production/postpartum")({
  head: () => ({ meta: [{ title: "产后护理 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="产后护理" orders={orders} />,
});
