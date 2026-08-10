import { useState } from "react";
import { Activity } from "lucide-react";
import { SectionCard, Donut, Legend, BarList, MiniStat, PeriodTabs } from "./charts";

const groupDist = [
  { name: "成母牛", value: 26, color: "var(--brand)" },
  { name: "青年牛", value: 11, color: "var(--effect-ai-cyan)" },
  { name: "犊牛", value: 8, color: "var(--effect-ai-purple)" },
];

const deathReasons = [
  { name: "消化系统疾病", value: 7 },
  { name: "呼吸道疾病", value: 5 },
  { name: "产科疾病", value: 4 },
  { name: "外伤/意外", value: 3 },
  { name: "其他", value: 2 },
];

const cullReasons = [
  { name: "产量低", value: 8 },
  { name: "繁殖障碍", value: 6 },
  { name: "肢蹄病", value: 5 },
  { name: "乳房炎", value: 3 },
  { name: "其他", value: 2 },
];

export function CullingSection() {
  const [view, setView] = useState("死亡原因");
  const total = groupDist.reduce((s, d) => s + d.value, 0);
  const deaths = deathReasons.reduce((s, d) => s + d.value, 0);
  const culls = cullReasons.reduce((s, d) => s + d.value, 0);
  const isDeath = view === "死亡原因";
  return (
    <SectionCard
      id="topic-culling"
      title="死淘专题"
      desc={`本月死淘 ${total} 头`}
      icon={<Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />}
      extra={<PeriodTabs value={view} onChange={setView} options={["死亡原因", "淘汰原因"]} />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <p className="text-body-sm text-text-secondary mb-3">（本月）实际死淘分布</p>
          <div className="flex flex-col items-center gap-4">
            <Donut data={groupDist} centerLabel="死淘合计" centerValue={String(total)} centerUnit="头" unit=" 头" />
            <Legend data={groupDist} unit=" 头" />
          </div>
        </div>
        <div>
          <p className="text-body-sm text-text-secondary mb-3">
            （本月）{isDeath ? "死亡原因占比" : "淘汰原因占比"}
          </p>
          <BarList data={isDeath ? deathReasons : cullReasons} unit=" 头" />
        </div>
      </div>
    </SectionCard>
  );
}

