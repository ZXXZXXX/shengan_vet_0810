import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, makeOrders } from "@/components/work-order-page";

const orders = makeOrders("GN", [
  { target: "#A2208", event: "进入干奶期", desc: "#A2208 即将进入干奶期，需安排干奶处理及隔离。" },
  { target: "#A2185", event: "干奶药输注", desc: "#A2185 干奶药输注中，预计 3 天后转入干奶舍。" },
  { target: "#A2099", event: "干奶完成", desc: "#A2099 干奶流程结束，已转入产前观察舍。" },
  { target: "#A2120", event: "干奶申请", desc: "#A2120 干奶申请，按 60 天标准执行。" },
  { target: "#A2233", event: "干奶失败复查", desc: "#A2233 干奶后乳房肿胀，需复查处理。" },
  { target: "#A2150", event: "干奶舍转栏", desc: "#A2150 转入干奶舍。" },
  { target: "#A2102", event: "短期干奶", desc: "#A2102 申请 45 天短期干奶。" },
  { target: "#A2270", event: "提前干奶申请", desc: "#A2270 产量过低，申请提前干奶。" },
]);

export const Route = createFileRoute("/production/drying")({
  head: () => ({ meta: [{ title: "干奶工作 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="干奶工作" orders={orders} />,
});
