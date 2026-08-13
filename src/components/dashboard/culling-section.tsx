import { useState } from "react";
import { Activity } from "lucide-react";
import { SectionCard, Columns, Radar, PeriodTabs, PALETTE } from "./charts";
import { scaleList, useDataLevel } from "@/lib/dashboard-view";

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
  const { factor } = useDataLevel();
  const dist = scaleList(groupDist, factor);
  const reasons = scaleList(view === "死亡原因" ? deathReasons : cullReasons, factor);
  const total = dist.reduce((s, d) => s + d.value, 0);
  const isDeath = view === "死亡原因";
  return (
    <SectionCard
      id="topic-culling"
      title="死淘专题"
      desc={"\n"}
      icon={<Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />}
      extra={<PeriodTabs value={view} onChange={setView} options={["死亡原因", "淘汰原因"]} />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-body-sm text-text-secondary">（本月）实际死淘分布</p>
            <p className="text-caption text-text-tertiary">
              死淘合计 <span className="text-section-title tabular-nums text-foreground">{total}</span> 头
            </p>
          </div>
          <div className="flex-1 flex items-end">
            <Columns data={dist} unit=" 头" height={200} />
          </div>
        </div>
        <div>
          <p className="text-body-sm text-text-secondary mb-3">
            （本月）{isDeath ? "死亡原因构成" : "淘汰原因构成"}
          </p>
          <div className="flex justify-center">
            <Radar
              data={reasons}
              size={330}
              unit=" 头"
              color={isDeath ? "var(--state-danger)" : PALETTE[3]}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
