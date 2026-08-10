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

/** 统计卡片：支持「本月 / 全部」维度切换 */
export function StatScopeCard({ metrics }: { metrics: ScopeMetric[] }) {
  const [scope, setScope] = useState<Scope>("month");
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-body font-medium text-foreground">统计</div>
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-surface-subtle p-0.5">
          {(["month", "all"] as Scope[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setScope(k)}
              className={`h-6 px-2.5 rounded text-caption transition-colors ${
                scope === k
                  ? "bg-card text-primary shadow-sm"
                  : "text-text-secondary hover:text-foreground"
              }`}
            >
              {k === "month" ? "本月" : "全部"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-md bg-surface-subtle px-3 py-2.5">
            <div className="text-caption text-text-tertiary">{m.label}</div>
            <div className="mt-0.5 text-section-title tabular-nums text-foreground">
              {m.value[scope]}
            </div>
          </div>
        ))}
      </div>
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
