import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, makeOrders } from "@/components/work-order-page";

const orders = makeOrders("XT", [
  { target: "1 号牛舍", event: "修蹄计划", desc: "1 号牛舍 32 头泌乳牛批次修蹄，预计耗时 2 天。" },
  { target: "#A2150", event: "蹄部异常复查", desc: "#A2150 蹄部红肿，已安排复查并外用药处理。" },
  { target: "2 号牛舍", event: "季度修蹄", desc: "2 号牛舍季度修蹄完成，无异常反馈。" },
  { target: "#A2188", event: "修蹄申请", desc: "#A2188 异常步态，需要修蹄检查。" },
  { target: "3 号牛舍", event: "干奶前修蹄", desc: "3 号牛舍干奶前修蹄。" },
  { target: "#A2210", event: "复查修蹄", desc: "#A2210 1 周后复查修蹄效果。" },
  { target: "犊牛舍 A", event: "蹄部清洁批次", desc: "犊牛舍 A 蹄部清洁与浴蹄。" },
  { target: "#A2298", event: "蹄底溃疡处置", desc: "#A2298 蹄底溃疡，已切除腐蹄并包扎。" },
]);

export const Route = createFileRoute("/production/hoof")({
  head: () => ({ meta: [{ title: "修蹄工单 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="修蹄工单" orders={orders} />,
});
