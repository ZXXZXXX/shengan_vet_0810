import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderPage, type WorkOrder } from "@/components/work-order-page";

const orders: WorkOrder[] = [
  {
    id: "WO-2381", target: "#A2381", event: "持续高烧 2 小时", proposer: "陈晓东",
    status: "待审核", desc: "3 号牛舍 #A2381 持续高烧 2 小时，需进行抗生素治疗与隔离观察。",
    createdAt: "2026-05-19 09:08",
  },
  {
    id: "WO-2298", target: "#A2298", event: "乳房炎复诊", proposer: "李雨晴",
    status: "执行中", desc: "1 号牛舍 #A2298 乳房炎复诊，按治疗方案完成第二轮处置。",
    createdAt: "2026-05-18 14:20",
    reviewer: "王建国", reviewedAt: "2026-05-18 15:00",
    executor: "李雨晴", executedAt: "2026-05-19 08:30",
  },
  {
    id: "WO-2270", target: "#A2270", event: "蹄叶炎复发治疗", proposer: "李娜",
    status: "已完成", desc: "#A2270 蹄叶炎复发，已完成包扎与外用药处置。",
    createdAt: "2026-05-12 09:00",
    reviewer: "王建国", reviewedAt: "2026-05-12 10:15",
    executor: "孙明", executedAt: "2026-05-13 16:40",
  },
  {
    id: "WO-2250", target: "#A2250", event: "腹泻治疗申请", proposer: "周凯",
    status: "已驳回", desc: "症状描述不充分，建议先复诊后再提报治疗工单。",
    createdAt: "2026-04-28 09:20",
    reviewer: "王建国", reviewedAt: "2026-04-28 10:00",
  },
];

export const Route = createFileRoute("/production/disease")({
  head: () => ({ meta: [{ title: "疾病治疗 — 奇点智牧" }] }),
  component: () => <WorkOrderPage title="疾病治疗" orders={orders} />,
});
