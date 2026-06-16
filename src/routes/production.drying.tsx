import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, makeOrders } from "@/components/work-order-page";

const orders = makeOrders("GN", [
  { target: "#01-24-2208", event: "进入干奶期", desc: "#01-24-2208 即将进入干奶期，需安排干奶处理及隔离。" },
  { target: "#01-24-2185", event: "干奶药输注", desc: "#01-24-2185 干奶药输注中，预计 3 天后转入干奶舍。" },
  { target: "#01-24-2099", event: "干奶完成", desc: "#01-24-2099 干奶流程结束，已转入产前观察舍。" },
  { target: "#01-24-2120", event: "干奶申请", desc: "#01-24-2120 干奶申请，按 60 天标准执行。" },
  { target: "#01-24-2233", event: "干奶失败复查", desc: "#01-24-2233 干奶后乳房肿胀，需复查处理。" },
  { target: "#01-24-2150", event: "干奶舍转栏", desc: "#01-24-2150 转入干奶舍。" },
  { target: "#01-24-2102", event: "短期干奶", desc: "#01-24-2102 申请 45 天短期干奶。" },
  { target: "#01-24-2270", event: "提前干奶申请", desc: "#01-24-2270 产量过低，申请提前干奶。" },
]);

export const Route = createFileRoute("/production/drying")({
  head: () => ({ meta: [{ title: "干奶工单 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="干奶工单" orders={orders} />,
});
