import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Syringe, Clock } from "lucide-react";
import { PeriodTabs } from "@/components/dashboard/charts";

type VaccinePlan = {
  id: string;
  name: string;
  planned: number;
  done: number;
  days: number; // 耗时天数
};

const PLANS: Record<string, VaccinePlan[]> = {
  "近1年": [
    { id: "fmd", name: "口蹄疫疫苗", planned: 6154, done: 6042, days: 26 },
    { id: "brd", name: "牛呼吸道多联疫苗", planned: 4820, done: 4531, days: 21 },
    { id: "ibr", name: "传染性鼻气管炎疫苗", planned: 3980, done: 3612, days: 18 },
    { id: "bvd", name: "牛病毒性腹泻疫苗", planned: 3760, done: 3208, days: 24 },
    { id: "cd", name: "梭菌病多联疫苗", planned: 2540, done: 2489, days: 12 },
    { id: "mast", name: "乳房炎疫苗", planned: 2180, done: 1742, days: 15 },
  ],
  "近6个月": [
    { id: "fmd", name: "口蹄疫疫苗", planned: 3120, done: 3044, days: 14 },
    { id: "brd", name: "牛呼吸道多联疫苗", planned: 2410, done: 2263, days: 11 },
    { id: "ibr", name: "传染性鼻气管炎疫苗", planned: 1985, done: 1786, days: 9 },
    { id: "bvd", name: "牛病毒性腹泻疫苗", planned: 1880, done: 1552, days: 13 },
    { id: "cd", name: "梭菌病多联疫苗", planned: 1260, done: 1238, days: 7 },
    { id: "mast", name: "乳房炎疫苗", planned: 1090, done: 826, days: 8 },
  ],
  "近3个月": [
    { id: "fmd", name: "口蹄疫疫苗", planned: 1580, done: 1561, days: 8 },
    { id: "brd", name: "牛呼吸道多联疫苗", planned: 1205, done: 1104, days: 6 },
    { id: "ibr", name: "传染性鼻气管炎疫苗", planned: 990, done: 862, days: 5 },
    { id: "bvd", name: "牛病毒性腹泻疫苗", planned: 940, done: 731, days: 7 },
    { id: "cd", name: "梭菌病多联疫苗", planned: 630, done: 628, days: 4 },
    { id: "mast", name: "乳房炎疫苗", planned: 545, done: 402, days: 5 },
  ],
};

function toneOf(pct: number) {
  if (pct >= 95) return "var(--state-success)";
  if (pct >= 85) return "var(--state-warning)";
  return "var(--state-danger)";
}

export function ImmunizationRateCard() {
  const [period, setPeriod] = useState("近1年");
  const plans = PLANS[period] ?? [];

  const planned = plans.reduce((s, p) => s + p.planned, 0);
  const done = plans.reduce((s, p) => s + p.done, 0);
  const pct = planned === 0 ? 0 : (done / planned) * 100;
  const tone = toneOf(pct);
  const avgDays =
    plans.length === 0 ? 0 : plans.reduce((s, p) => s + p.days, 0) / plans.length;

  return (
    <Card className="border-border bg-card rounded-2xl shadow-card p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand)" }}
          >
            <Syringe className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-card-title text-foreground">疫苗免疫专题</h3>
            <p className="text-caption text-text-tertiary mt-0.5">{period}各项疫苗计划完成情况</p>
          </div>
        </div>
        <PeriodTabs value={period} onChange={setPeriod} options={["近1年", "近6个月", "近3个月"]} />
      </div>

      {/* 汇总 */}
      <div className="mt-4 flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-baseline gap-1">
          <span className="tabular-nums font-semibold leading-none" style={{ fontSize: "32px", color: tone }}>
            {pct.toFixed(1)}
          </span>
          <span className="text-body-sm text-text-tertiary">% 总完成率</span>
        </div>
        <p className="text-caption text-text-tertiary tabular-nums">
          已接种 {done.toLocaleString()} / 计划 {planned.toLocaleString()} 头 · 平均耗时 {avgDays.toFixed(1)} 天
        </p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-surface-subtle overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tone }} />
      </div>

      {/* 各项疫苗计划 · 横向柱状图 */}
      <div className="mt-5 space-y-3">
        {plans.map((p) => {
          const r = p.planned === 0 ? 0 : (p.done / p.planned) * 100;
          const t = toneOf(r);
          return (
            <div key={p.id} className="flex items-center gap-3">
              <span className="text-body-sm text-foreground w-32 shrink-0 truncate" title={p.name}>
                {p.name}
              </span>
              <span
                className="relative flex-1 h-7 rounded-md bg-surface-subtle overflow-hidden"
                title={`${p.done.toLocaleString()}/${p.planned.toLocaleString()}`}
              >
                <span
                  className="absolute inset-y-0 left-0 rounded-md transition-all"
                  style={{ width: `${Math.max(r, 2)}%`, background: t }}
                />
              </span>
              <span className="shrink-0 flex items-center gap-3">
                <span className="text-caption text-text-tertiary tabular-nums inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {p.days} 天
                </span>
                <span className="text-caption text-text-tertiary tabular-nums">
                  {p.done.toLocaleString()}/{p.planned.toLocaleString()}
                </span>
                <span className="text-body-sm font-medium tabular-nums w-14 text-right" style={{ color: t }}>
                  {r.toFixed(1)}%
                </span>
              </span>
            </div>
          );
        })}
      </div>

    </Card>
  );
}
