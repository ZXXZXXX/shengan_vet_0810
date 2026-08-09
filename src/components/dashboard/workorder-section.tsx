import { ClipboardList } from "lucide-react";
import { SectionCard, BarList, MiniStat } from "./charts";

const scopes = [
  {
    key: "全部工单",
    total: 486,
    done: 431,
    overdue: 18,
    color: "var(--brand)",
  },
  {
    key: "派工单（UD）",
    total: 214,
    done: 182,
    overdue: 11,
    color: "var(--effect-ai-cyan)",
  },
];

const overdueByType = [
  { name: "疾病诊疗", value: 7 },
  { name: "免疫接种", value: 4 },
  { name: "产后护理", value: 3 },
  { name: "修蹄", value: 2 },
  { name: "其他", value: 2 },
];

export function WorkOrderSection() {
  return (
    <SectionCard
      id="topic-workorder"
      title="兽医工单专题"
      desc="本月统计"
      icon={<ClipboardList className="h-4 w-4 text-primary" strokeWidth={1.75} />}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          {scopes.map((s) => {
            const rate = Math.round((s.done / s.total) * 100);
            return (
              <div key={s.key} className="rounded-xl border border-border p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <span className="truncate text-body text-foreground">{s.key}</span>
                  <span className="text-caption text-text-tertiary tabular-nums shrink-0">
                    完成率 {rate}%
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <MiniStat label="工单总量" value={String(s.total)} unit="单" tone={s.color} />
                  <MiniStat label="已完成" value={String(s.done)} unit="单" />
                  <MiniStat label="逾期" value={String(s.overdue)} unit="单" tone="var(--state-danger)" />
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-surface-subtle overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${rate}%`, background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <p className="text-body-sm text-text-secondary mb-3">（本月）逾期工单分布</p>
          <BarList data={overdueByType} unit=" 单" />
        </div>
      </div>
    </SectionCard>
  );
}
