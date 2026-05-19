import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, type WorkOrder } from "@/components/work-order-page";

const orders: WorkOrder[] = [
  { id: "WO-6034", target: "#A2324", who: "王建国", event: "采食量持续下降", proposer: "张伟", status: "待审核", desc: "#A2324 采食量持续下降，需复检并调整饲喂方案。", createdAt: "2026-05-12 11:00" },
  { id: "WO-6029", target: "#A2261", who: "王建国", event: "体况评估异常", proposer: "李娜", status: "执行中", desc: "#A2261 体况评分偏低，跟踪补饲方案 3 天。", createdAt: "2026-05-11 10:20" },
  { id: "WO-6010", target: "#A2150", who: "王建国", event: "普查复核", proposer: "王建国", status: "已驳回", desc: "普查理由不充分，已驳回，建议合并到批次普查工单。", createdAt: "2026-05-10 18:42" },
  { id: "WO-5995", target: "4 号牛舍", who: "王建国", event: "月度体检", proposer: "王建国", status: "已完成", desc: "4 号牛舍月度体检完成，2 头标记为复查对象。", createdAt: "2026-05-06 16:00" },
];

export const Route = createFileRoute("/production/general")({
  head: () => ({ meta: [{ title: "普修工单 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="普修工单" orders={orders} />,
});
