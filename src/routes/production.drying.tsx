import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, type WorkOrder } from "@/components/work-order-page";

const orders: WorkOrder[] = [
  { id: "WO-4012", target: "#A2208", who: "周凯", event: "进入干奶期", proposer: "李娜", status: "待审核", desc: "#A2208 即将进入干奶期，需安排干奶处理及隔离。", createdAt: "2026-05-12 08:40" },
  { id: "WO-4007", target: "#A2185", who: "周凯", event: "干奶药输注", proposer: "周凯", status: "执行中", desc: "#A2185 干奶药输注中，预计 3 天后转入干奶舍。", createdAt: "2026-05-11 16:05" },
  { id: "WO-3990", target: "#A2099", who: "周凯", event: "干奶完成", proposer: "周凯", status: "已完成", desc: "#A2099 干奶流程结束，已转入产前观察舍。", createdAt: "2026-05-08 10:15" },
];

export const Route = createFileRoute("/production/drying")({
  head: () => ({ meta: [{ title: "干奶工单 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="干奶工单" orders={orders} />,
});
