import { Building2, Users, Beef, MapPin } from "lucide-react";
import { SectionCard, ProgressRows, MiniStat } from "./charts";

const regionHerd = [
  { name: "东北大区", value: 2252 },
  { name: "华北大区", value: 3182 },
  { name: "华东大区", value: 1610 },
];

export function OpsSection({ level }: { level: "region" | "group" }) {
  const isGroup = level === "group";
  const herd = regionHerd.reduce((s, d) => s + d.value, 0);
  return (
    <SectionCard
      id="topic-ops"
      title={isGroup ? "集团运营统计" : "区域运营统计"}
      desc={isGroup ? "集团 / 区域口径" : "区域口径"}
      icon={<Building2 className="h-4 w-4 text-primary" strokeWidth={1.75} />}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label={isGroup ? "集团牧场数量" : "区域牧场数量"} value={isGroup ? "6" : "2"} unit="个" tone="var(--brand)" />
        <MiniStat label="牛群规模" value={(isGroup ? herd : 2252).toLocaleString()} unit="头" />
        <MiniStat label="兽医及助理人员" value={isGroup ? "48" : "16"} unit="人" tone="var(--effect-ai-cyan)" />
        <MiniStat label="覆盖区域数" value={isGroup ? "3" : "1"} unit="个" tone="var(--effect-ai-purple)" />
      </div>
      {isGroup && (
        <div className="mt-6">
          <p className="text-body-sm text-text-secondary mb-3">各区域牛群规模</p>
          <ProgressRows data={regionHerd} unit=" 头" />
        </div>
      )}
      <div className="mt-4 flex items-center gap-4 text-caption text-text-tertiary">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> 统计口径已上卷至{isGroup ? "集团级" : "区域级"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> 人员含在岗兽医、助理、巡检
        </span>
        <span className="inline-flex items-center gap-1">
          <Beef className="h-3.5 w-3.5" /> 牛群规模为实时存栏
        </span>
      </div>
    </SectionCard>
  );
}
