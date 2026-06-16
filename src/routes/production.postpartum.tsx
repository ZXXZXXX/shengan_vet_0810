import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, makeOrders } from "@/components/work-order-page";

const orders = makeOrders("CH", [
  { target: "#01-24-2120", event: "产后子宫复旧观察", desc: "产后第 7 天复旧良好，进入正常泌乳期。" },
  { target: "#01-24-2135", event: "胎衣不下处理", desc: "胎衣不下 24h 以上，已介入治疗。" },
  { target: "#01-24-2188", event: "产后低血钙", desc: "#01-24-2188 产后低血钙，已补钙处理。" },
  { target: "#01-24-2208", event: "产后体温监测", desc: "#01-24-2208 产后 3 日体温监测。" },
  { target: "#01-24-2233", event: "产道损伤评估", desc: "#01-24-2233 产道轻度撕裂，需缝合。" },
  { target: "#01-24-2298", event: "围产期 BCS 跟踪", desc: "#01-24-2298 围产期 BCS 跟踪记录。" },
  { target: "#01-24-2270", event: "酮病筛查", desc: "#01-24-2270 产后酮病初筛。" },
  { target: "产房", event: "产房消毒巡检", desc: "产房日常消毒巡检。" },
]);

export const Route = createFileRoute("/production/postpartum")({
  head: () => ({ meta: [{ title: "产后护理 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="产后护理" orders={orders} />,
});
