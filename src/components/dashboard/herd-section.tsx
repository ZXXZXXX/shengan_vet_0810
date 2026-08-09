import { useState } from "react";
import { Beef } from "lucide-react";
import { SectionCard, Donut, Legend, MiniStat, PeriodTabs, PALETTE } from "./charts";

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
      {tab === TAB_TYPE ? (
        <div>
          <p className="text-body-sm text-text-secondary mb-3">（至今日）类型分布</p>
          <div className="flex items-center gap-8 flex-wrap">
            <Donut data={typeDist} centerLabel="存栏总数" centerValue={total.toLocaleString()} centerUnit="头" />
            <Legend data={typeDist} unit=" 头" />
          </div>
        </div>
      ) : (
        <div>
          <p className="text-body-sm text-text-secondary mb-3">（本月）健康分布</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {healthDist.map((h) => (
              <MiniStat
                key={h.name}
                label={`${h.name} · ${((h.value / healthTotal) * 100).toFixed(1)}%`}
                value={h.value.toLocaleString()}
                unit="头"
                tone={h.color}
              />
            ))}
          </div>
          <div className="mt-4 h-2.5 w-full rounded-full overflow-hidden flex">
            {healthDist.map((h, i) => (
              <div
                key={h.name}
                style={{
                  width: `${(h.value / healthTotal) * 100}%`,
                  background: h.color ?? PALETTE[i],
                }}
              />
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

