import { createFileRoute } from "@tanstack/react-router";
import { Clock, HandCoins, XCircle } from "lucide-react";
import {
  WarehouseEventPage,
  type StatusConfig,
  type WarehouseEvent,
} from "@/components/warehouse-event-page";

export const Route = createFileRoute("/warehouse/dispense")({
  head: () => ({ meta: [{ title: "取药记录 — 奇点智牧" }] }),
  component: DispensePage,
});

type DStatus = "待取药" | "已领" | "已失效";

const statuses: StatusConfig<DStatus>[] = [
  { key: "待取药", label: "待取药", icon: Clock, tone: "warning" },
  { key: "已领", label: "已领", icon: HandCoins, tone: "success" },
  { key: "已失效", label: "已失效", icon: XCircle, tone: "danger" },
];

const records: WarehouseEvent<DStatus>[] = [
  {
    id: "DP-3202",
    lines: [{ item: "乳房炎抗生素 5mg", qty: "3 支" }],
    desc: "疾病治疗工作 WO-2392，#01-24-2412 持续高烧待取药。",
    status: "待取药",
    operator: "李雨晴",
    operatedAt: "-",
  },
  {
    id: "DP-3196",
    lines: [{ item: "头孢噻呋钠", qty: "2 支" }],
    desc: "工作 WO-2350 已终止，对应取药单失效。",
    status: "已失效",
    operator: "系统",
    operatedAt: "2026-05-12 11:05",
  },

  {
    id: "DP-3201",
    lines: [{ item: "乳房炎抗生素 5mg", qty: "2 支" }],
    desc: "疾病治疗工作 WO-2381，#01-24-2381 用药。",
    status: "已领",
    operator: "李雨晴",
    operatedAt: "2026-05-12 09:42",
  },
  {
    id: "DP-3200",
    lines: [{ item: "口蹄疫疫苗 A 型", qty: "5 ml" }],
    desc: "B-102 批次免疫疫苗领用。",
    status: "已领",
    operator: "陈晓东",
    operatedAt: "2026-05-12 08:15",
  },
  {
    id: "DP-3199",
    lines: [{ item: "驱虫剂 伊维菌素", qty: "10 ml" }],
    desc: "日常护理-驱虫，作用对象 #01-24-2376。",
    status: "已领",
    operator: "李雨晴",
    operatedAt: "2026-05-11 16:38",
  },
  {
    id: "DP-3198",
    lines: [{ item: "消毒液 戊二醛", qty: "2 L" }],
    desc: "3 号牛舍环境消毒领用。",
    status: "已领",
    operator: "孙库管",
    operatedAt: "2026-05-11 14:02",
  },
  {
    id: "DP-3197",
    lines: [{ item: "营养补充剂", qty: "1 罐" }],
    desc: "#01-24-2298 产后护理。",
    status: "已领",
    operator: "李雨晴",
    operatedAt: "2026-05-11 10:20",
  },
];

function DispensePage() {
  return (
    <WarehouseEventPage<DStatus>
      title="取药记录"
      breadcrumb={["仓库管理", "取药记录"]}
      statuses={statuses}
      hideTabs
      events={records}
      searchPlaceholder="按记录号 / 药品 / 描述搜索"
    />
  );
}
