import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, makeOrders } from "@/components/work-order-page";

const orders = makeOrders("WO", 6000, [
  { target: "#A2324", event: "采食量持续下降", desc: "#A2324 采食量持续下降，需复检并调整饲喂方案。" },
  { target: "#A2261", event: "体况评估异常", desc: "#A2261 体况评分偏低，跟踪补饲方案 3 天。" },
  { target: "#A2150", event: "普查复核", desc: "#A2150 普查理由不充分，已驳回，建议合并到批次普查工单。" },
  { target: "4 号牛舍", event: "月度体检", desc: "4 号牛舍月度体检完成，2 头标记为复查对象。" },
  { target: "#A2208", event: "BCS 评分复核", desc: "#A2208 体况评分复核。" },
  { target: "1 号牛舍", event: "环境清洁巡检", desc: "1 号牛舍环境清洁与饮水检查。" },
  { target: "#A2298", event: "运动评分跟踪", desc: "#A2298 运动评分跟踪。" },
  { target: "#A2099", event: "异常采食回访", desc: "#A2099 采食异常 24h 回访。" },
]);

export const Route = createFileRoute("/production/general")({
  head: () => ({ meta: [{ title: "普修工单 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="普修工单" orders={orders} />,
});
