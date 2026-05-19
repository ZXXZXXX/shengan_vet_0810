import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, type WorkOrder } from "@/components/work-order-page";

const orders: WorkOrder[] = [
  {
    id: "WO-2401", target: "犊牛舍 A", event: "口蹄疫加强免疫", proposer: "周凯",
    status: "执行中", desc: "犊牛舍 A 5 月口蹄疫加强免疫，覆盖 84 头犊牛。",
    createdAt: "2026-05-18 10:00",
    reviewer: "王建国", reviewedAt: "2026-05-18 11:00",
    executor: "周凯", executedAt: "2026-05-19 09:00",
  },
  {
    id: "WO-2078", target: "#A2078", event: "免疫后体温异常", proposer: "陈晓东",
    status: "已驳回", desc: "#A2078 免疫后体温异常升高,需复查并评估处置方案。",
    createdAt: "2026-05-11 16:55",
    reviewer: "李雨晴", reviewedAt: "2026-05-11 17:20",
  },
  {
    id: "WO-2045", target: "2 号牛舍", event: "布病强免疫", proposer: "周凯",
    status: "已完成", desc: "2 号牛舍 4 月布病强免疫，全部完成。",
    createdAt: "2026-04-20 09:30",
    reviewer: "王建国", reviewedAt: "2026-04-20 10:00",
    executor: "周凯", executedAt: "2026-04-22 17:00",
  },
];

export const Route = createFileRoute("/production/vaccine")({
  head: () => ({ meta: [{ title: "疫苗免疫 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="疫苗免疫" orders={orders} />,
});
