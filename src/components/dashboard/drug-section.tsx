import { useState } from "react";
import { Pill } from "lucide-react";
import { SectionCard, Donut, Legend, LineTrend, MiniStat, PeriodTabs } from "./charts";

const PERIODS = ["近 1 年", "近 6 个月", "近 3 个月"];

const trendData: Record<string, { labels: string[]; points: number[] }> = {
  "近 1 年": {
    labels: ["6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月"],
    points: [16.2, 17.4, 18.1, 15.8, 14.9, 16.6, 19.2, 20.4, 17.3, 16.1, 17.4, 18.6],
  },
  "近 6 个月": {
    labels: ["12月", "1月", "2月", "3月", "4月", "5月"],
    points: [19.2, 20.4, 17.3, 16.1, 17.4, 18.6],
  },
  "近 3 个月": {
    labels: ["3月", "4月", "5月"],
    points: [16.1, 17.4, 18.6],
  },
};

const composition: Record<string, { name: string; value: number; color?: string }[]> = {
  "近 1 年": [
    { name: "抗生素", value: 88.4 },
    { name: "激素类", value: 32.1 },
    { name: "消炎镇痛", value: 27.6 },
    { name: "促生殖", value: 21.4 },
    { name: "其他", value: 38.5 },
  ],
  "近 6 个月": [
    { name: "抗生素", value: 46.2 },
    { name: "激素类", value: 16.8 },
    { name: "消炎镇痛", value: 14.1 },
    { name: "促生殖", value: 10.9 },
    { name: "其他", value: 21.0 },
  ],
  "近 3 个月": [
    { name: "抗生素", value: 23.4 },
    { name: "激素类", value: 8.2 },
    { name: "消炎镇痛", value: 7.3 },
    { name: "促生殖", value: 5.4 },
    { name: "其他", value: 8.3 },
  ],
};

export function DrugSection() {
  const [period, setPeriod] = useState(PERIODS[1]);
  const t = trendData[period];
  const comp = composition[period];
  const sum = comp.reduce((s, d) => s + d.value, 0);
  return (
    <SectionCard
      id="topic-drug"
      title="药品专题"
      desc="本月头均用药费用 42.6 元"
      icon={<Pill className="h-4 w-4 text-primary" strokeWidth={1.75} />}
      extra={<PeriodTabs value={period} onChange={setPeriod} options={PERIODS} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <MiniStat label="（本月）头均用药费用" value="42.6" unit="元/头" tone="var(--brand)" />
        <MiniStat label={`${period}用药总费用`} value={sum.toFixed(1)} unit="万元" />
        <MiniStat label="抗生素费用占比" value={`${((comp[0].value / sum) * 100).toFixed(1)}%`} tone="var(--state-warning)" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <p className="text-body-sm text-text-secondary mb-3">{period}用药总费用趋势</p>
          <LineTrend
            labels={t.labels}
            series={[{ name: "用药总费用", color: "var(--brand)", points: t.points }]}
            unit="万元"
          />
        </div>
        <div>
          <p className="text-body-sm text-text-secondary mb-3">{period}各类药品费用构成</p>
          <div className="flex items-center gap-6 flex-wrap">
            <Donut data={comp} centerLabel="合计" centerValue={sum.toFixed(1)} centerUnit="万元" />
            <Legend data={comp} unit=" 万元" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
