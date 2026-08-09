import { Baby } from "lucide-react";
import { SectionCard, Donut, Legend, BarList, MiniStat } from "./charts";

const survival = [
  { name: "单胎成活", value: 148, color: "var(--brand)" },
  { name: "双胎及以上成活", value: 22, color: "var(--effect-ai-cyan)" },
  { name: "死胎", value: 9, color: "var(--state-danger)" },
];

const sexRatio = [
  { name: "母犊", value: 96, color: "var(--effect-ai-purple)" },
  { name: "公犊", value: 83, color: "var(--effect-ai-cyan)" },
];

const birthWeight = [
  { name: "< 30 kg", value: 12 },
  { name: "30 - 35 kg", value: 41 },
  { name: "35 - 40 kg", value: 78 },
  { name: "40 - 45 kg", value: 33 },
  { name: "≥ 45 kg", value: 15 },
];

const difficulty = [
  { name: "顺产", value: 132, color: "var(--brand)" },
  { name: "轻度助产", value: 28, color: "var(--effect-ai-cyan)" },
  { name: "中度助产", value: 13, color: "var(--state-warning)" },
  { name: "难产/手术", value: 6, color: "var(--state-danger)" },
];

export function CalvingSection() {
  const total = survival.reduce((s, d) => s + d.value, 0);
  return (
    <SectionCard
      id="topic-calving"
      title="产犊专题"
      desc={`本月产犊 ${total} 头`}
      icon={<Baby className="h-4 w-4 text-primary" strokeWidth={1.75} />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <p className="text-body-sm text-text-secondary mb-3">（本月）产犊成活与死胎分布</p>
          <div className="flex items-center gap-6 flex-wrap">
            <Donut data={survival} centerLabel="产犊总数" centerValue={String(total)} centerUnit="头" />
            <Legend data={survival} unit=" 头" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {sexRatio.map((s) => (
              <MiniStat
                key={s.name}
                label={`${s.name}占比 ${((s.value / (sexRatio[0].value + sexRatio[1].value)) * 100).toFixed(1)}%`}
                value={String(s.value)}
                unit="头"
                tone={s.color}
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-body-sm text-text-secondary mb-3">（本月）初生牛犊体重分布</p>
            <BarList data={birthWeight} unit=" 头" />
          </div>
          <div>
            <p className="text-body-sm text-text-secondary mb-3">（本月）产犊难易度</p>
            <div className="flex items-center gap-6 flex-wrap">
              <Donut data={difficulty} size={136} centerLabel="顺产率" centerValue="74.6%" />
              <Legend data={difficulty} unit=" 例" />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
