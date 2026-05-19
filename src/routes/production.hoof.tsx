import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, type WorkOrder } from "@/components/work-order-page";

const orders: WorkOrder[] = [
  { id: "WO-3101", target: "1 号牛舍", who: "孙明", event: "批次修蹄计划", proposer: "孙明", status: "待审核", desc: "1 号牛舍 32 头泌乳牛批次修蹄，预计耗时 2 天。", createdAt: "2026-05-12 09:10" },
  { id: "WO-3098", target: "#A2150", who: "孙明", event: "蹄部异常复查", proposer: "李娜", status: "执行中", desc: "#A2150 蹄部红肿，已安排复查并外用药处理。", createdAt: "2026-05-11 14:30" },
  { id: "WO-3072", target: "2 号牛舍", who: "孙明", event: "季度修蹄", proposer: "孙明", status: "已完成", desc: "2 号牛舍季度修蹄完成，无异常反馈。", createdAt: "2026-05-09 17:20" },
];

export const Route = createFileRoute("/production/hoof")({
  head: () => ({ meta: [{ title: "修蹄工单 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="修蹄工单" orders={orders} />,
});
