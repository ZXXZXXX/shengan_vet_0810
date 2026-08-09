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
        <p className="text-body-sm text-text-secondary mb-3">
          {tab === TAB_TYPE ? "（至今日）类型分布" : "（本月）健康分布"}
        </p>
        <div className="flex items-center gap-8 flex-wrap">
          <Donut
            data={tab === TAB_TYPE ? typeDist : healthDist}
            centerLabel={tab === TAB_TYPE ? "存栏总数" : "在群总数"}
            centerValue={(tab === TAB_TYPE ? total : healthTotal).toLocaleString()}
            centerUnit="头"
          />
          <Legend data={tab === TAB_TYPE ? typeDist : healthDist} unit=" 头" />
        </div>
      </div>
    </SectionCard>
  );
}


