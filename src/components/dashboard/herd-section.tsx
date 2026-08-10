import { useState } from "react";
import { Beef } from "lucide-react";
import { SectionCard, Donut, Legend, PeriodTabs } from "./charts";

const typeDist = [
  { name: "泌乳牛", value: 2180 },
  { name: "干奶牛", value: 386 },
  { name: "围产牛", value: 142 },
  { name: "青年牛", value: 640 },
  { name: "犊牛", value: 498 },
  { name: "后备牛", value: 214 },
];

const healthDist = [
  { name: "健康", value: 3720, color: "var(--brand)" },
  { name: "治疗中", value: 186, color: "var(--state-warning)" },
  { name: "观察中（休药/过抗期）", value: 108, color: "var(--effect-ai-cyan)" },
  { name: "数据异常", value: 46, color: "var(--state-danger)" },
];

const TAB_TYPE = "类型分布";
const TAB_HEALTH = "健康分布";

export function HerdSection() {
  const [tab, setTab] = useState(TAB_TYPE);
  const total = typeDist.reduce((s, d) => s + d.value, 0);
  const healthTotal = healthDist.reduce((s, d) => s + d.value, 0);
  return (
    <SectionCard
      id="topic-herd"
      title="牛群专题"
      desc={`存栏 ${total.toLocaleString()} 头`}
      icon={<Beef className="h-4 w-4 text-primary" strokeWidth={1.75} />}
      extra={<PeriodTabs value={tab} onChange={setTab} options={[TAB_TYPE, TAB_HEALTH]} />}
    >
      <div>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-body-sm text-text-secondary">
            {tab === TAB_TYPE ? "（至今日）类型分布" : "（本月）健康分布"}
          </p>
          <p className="text-caption text-text-tertiary">
            {tab === TAB_TYPE ? "存栏总数" : "在群总数"}{" "}
            <span className="text-section-title tabular-nums text-foreground">
              {(tab === TAB_TYPE ? total : healthTotal).toLocaleString()}
            </span>{" "}
            头
          </p>
        </div>
        <StackedBar data={tab === TAB_TYPE ? typeDist : healthDist} unit=" 头" />
      </div>
    </SectionCard>
  );
}


