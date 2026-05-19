import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, makeOrders } from "@/components/work-order-page";

const orders = makeOrders("JB", [
  { target: "#A2381", event: "持续高烧 2 小时", desc: "3 号牛舍 #A2381 持续高烧 2 小时，需进行抗生素治疗与隔离观察。" },
  { target: "#A2298", event: "乳房炎复诊", desc: "1 号牛舍 #A2298 乳房炎复诊，按治疗方案完成第二轮处置。" },
  { target: "#A2270", event: "蹄叶炎复发治疗", desc: "#A2270 蹄叶炎复发，已完成包扎与外用药处置。" },
  { target: "#A2250", event: "腹泻治疗申请", desc: "#A2250 腹泻症状 3 天，需复诊后再提报治疗工单。" },
  { target: "#A2233", event: "酮病初筛阳性", desc: "#A2233 BHBA 偏高，建议补液+葡萄糖处置。" },
  { target: "#A2188", event: "子宫炎治疗", desc: "#A2188 产后子宫炎，按方案 3 天疗程。" },
  { target: "#A2156", event: "肺炎症状跟进", desc: "#A2156 咳嗽+鼻液，建议抗生素+消炎处置。" },
  { target: "#A2102", event: "蹄部脓肿处置", desc: "#A2102 后蹄脓肿，已切开排脓。" },
]);

export const Route = createFileRoute("/production/disease")({
  head: () => ({ meta: [{ title: "疾病治疗 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="疾病治疗" orders={orders} />,
});
