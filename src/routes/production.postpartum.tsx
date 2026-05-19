import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, makeOrders } from "@/components/work-order-page";

const orders = makeOrders("WO", 2100, [
  { target: "#A2120", event: "产后子宫复旧观察", desc: "产后第 7 天复旧良好，进入正常泌乳期。" },
  { target: "#A2135", event: "胎衣不下处理", desc: "胎衣不下 24h 以上，已介入治疗。" },
  { target: "#A2188", event: "产后低血钙", desc: "#A2188 产后低血钙，已补钙处理。" },
  { target: "#A2208", event: "产后体温监测", desc: "#A2208 产后 3 日体温监测。" },
  { target: "#A2233", event: "产道损伤评估", desc: "#A2233 产道轻度撕裂，需缝合。" },
  { target: "#A2298", event: "围产期 BCS 跟踪", desc: "#A2298 围产期 BCS 跟踪记录。" },
  { target: "#A2270", event: "酮病筛查", desc: "#A2270 产后酮病初筛。" },
  { target: "产房", event: "产房消毒巡检", desc: "产房日常消毒巡检。" },
]);

export const Route = createFileRoute("/production/postpartum")({
  head: () => ({ meta: [{ title: "产后护理 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="产后护理" orders={orders} />,
});
