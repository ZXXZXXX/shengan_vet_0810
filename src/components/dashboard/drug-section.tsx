import { useState } from "react";
import { Pill, X } from "lucide-react";
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

// 各月存栏（头），用于计算头均用药费用
const herdByMonth: Record<string, number> = {
  "6月": 4180,
  "7月": 4210,
  "8月": 4260,
  "9月": 4230,
  "10月": 4190,
  "11月": 4220,
  "12月": 4310,
  "1月": 4350,
  "2月": 4330,
  "3月": 4290,
  "4月": 4340,
  "5月": 4368,
};

// 各类药品费用占比（按月份微调）
const COMP_WEIGHTS: { name: string; base: number }[] = [
  { name: "抗生素", base: 0.42 },
  { name: "激素类", base: 0.16 },
  { name: "消炎镇痛", base: 0.13 },
  { name: "促生殖", base: 0.11 },
  { name: "其他", base: 0.18 },
];

function compositionFor(label: string, total: number) {
  const seed = label.charCodeAt(0) + label.length;
  const raw = COMP_WEIGHTS.map((c, i) => ({
    name: c.name,
    w: Math.max(0.04, c.base + (((seed * (i + 3)) % 7) - 3) * 0.01),
  }));
  const sw = raw.reduce((s, r) => s + r.w, 0);
  return raw.map((r) => ({ name: r.name, value: Number(((r.w / sw) * total).toFixed(2)) }));
}

export function DrugSection() {
  const [period, setPeriod] = useState(PERIODS[2]);
  const [active, setActive] = useState<number | null>(trendData[PERIODS[2]].labels.length - 1);
  const t = trendData[period];
  const idx = active !== null && active < t.labels.length ? active : null;
  const label = idx !== null ? t.labels[idx] : null;
  const total = idx !== null ? t.points[idx] : 0;
  const herd = label ? (herdByMonth[label] ?? 4300) : 0;
  const perHead = label ? (total * 10000) / herd : 0;
  const comp = label ? compositionFor(label, total) : [];

  return (
    <SectionCard
      id="topic-drug"
      title="药品专题"
      desc="本月头均用药费用 42.6 元"
      icon={<Pill className="h-4 w-4 text-primary" strokeWidth={1.75} />}
      extra={
        <PeriodTabs
          value={period}
          onChange={(v) => {
            setPeriod(v);
            setActive(null);
          }}
          options={PERIODS}
        />
      }
    >
      <div className={`grid grid-cols-1 gap-6 ${label ? "xl:grid-cols-2" : ""}`}>
        <div>
          <p className="text-body-sm text-text-secondary mb-3">
            {period}用药总费用趋势
            <span className="text-text-tertiary">（点击月份查看明细）</span>
          </p>
          <LineTrend
            labels={t.labels}
            series={[{ name: "用药总费用", color: "var(--brand)", points: t.points }]}
            unit="万元"
            activeIndex={idx ?? undefined}
            onPointClick={(i) => setActive((prev) => (prev === i ? null : i))}
          />
        </div>

        {label && (
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <p className="text-body-sm text-foreground">{label}用药明细</p>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="inline-flex items-center gap-1 text-caption text-text-tertiary hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                关闭
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <MiniStat label="当月用药总费用" value={total.toFixed(1)} unit="万元" tone="var(--brand)" />
              <MiniStat label="当月头均用药费用" value={perHead.toFixed(1)} unit="元/头" />
            </div>
            <p className="text-body-sm text-text-secondary mb-3">各类药品费用占比</p>
            <div className="flex items-center gap-6 flex-wrap">
              <Donut data={comp} size={148} centerLabel="合计" centerValue={total.toFixed(1)} centerUnit="万元" />
              <Legend data={comp} unit=" 万元" />
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
