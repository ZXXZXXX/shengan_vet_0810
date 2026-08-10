import { useState } from "react";

type Scope = "month" | "all";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export type ScopeMetric = {
  label: string;
  /** 数值文案，按维度取值 */
  value: Record<Scope, string>;
};

/** 轻量统计行：两个字段 +「本月 / 全部」切换 */
export function StatScopeCard({ metrics }: { metrics: ScopeMetric[] }) {
  const [scope, setScope] = useState<Scope>("month");
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-small">
      <div className="inline-flex items-center rounded-md border border-border bg-surface-subtle p-0.5 text-caption">
        {(["month", "all"] as Scope[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setScope(k)}
            className={`h-6 px-2.5 rounded-[5px] transition-colors ${
              scope === k
                ? "bg-card text-primary font-medium shadow-sm"
                : "text-text-tertiary hover:text-foreground"
            }`}
          >
            {k === "month" ? "本月" : "全部"}
          </button>
        ))}
      </div>
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center gap-1.5">
          <span className="text-text-tertiary">{m.label}</span>
          <span className="tabular-nums font-medium text-foreground">{m.value[scope]}</span>
        </div>
      ))}
    </div>
  );
}

/** 疾病：发病头数 / 发病率（演示数据，按编码稳定生成） */
export function diseaseStats(seed: string): ScopeMetric[] {
  const h = hash(seed);
  const month = 3 + (h % 28);
  const all = month * (4 + (h % 7));
  const herd = 1200 + (h % 800);
  const rate = (n: number) => `${((n / herd) * 100).toFixed(2)}%`;
  return [
    { label: "发病头数", value: { month: `${month} 头`, all: `${all} 头` } },
    { label: "发病率", value: { month: rate(month), all: rate(all) } },
  ];
}

/** 处方：使用头数 / 治愈率（演示数据，按编码稳定生成） */
export function prescriptionStats(seed: string): ScopeMetric[] {
  const h = hash(seed);
  const month = 5 + (h % 40);
  const all = month * (3 + (h % 6));
  const cureMonth = 78 + (h % 20);
  const cureAll = 75 + ((h >> 3) % 22);
  return [
    { label: "使用头数", value: { month: `${month} 头`, all: `${all} 头` } },
    { label: "治愈率", value: { month: `${cureMonth}%`, all: `${cureAll}%` } },
  ];
}
