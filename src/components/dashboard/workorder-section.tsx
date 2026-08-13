import { useState } from "react";
import { ClipboardList, ChevronLeft } from "lucide-react";
import { SectionCard, Columns, Gauge, ProgressRows, PeriodTabs } from "./charts";
import { scaleValue, useDataLevel } from "@/lib/dashboard-view";

const TAB_ALL = "全部工单";
const TAB_UD = "派工单";

type StatusKey = "done" | "overdue" | "doing";

type ScopeData = {
  total: number;
  color: string;
  status: Record<StatusKey, { name: string; value: number; color: string; byType: { name: string; value: number }[] }>;
};

const scopes: Record<string, ScopeData> = {
  [TAB_ALL]: {
    total: 486,
    color: "var(--brand)",
    status: {
      done: {
        name: "已完成",
        value: 431,
        color: "var(--brand)",
        byType: [
          { name: "疾病诊疗", value: 168 },
          { name: "免疫接种", value: 96 },
          { name: "产后护理", value: 74 },
          { name: "修蹄", value: 55 },
          { name: "其他", value: 38 },
        ],
      },
      doing: {
        name: "进行中",
        value: 37,
        color: "var(--effect-ai-cyan)",
        byType: [
          { name: "疾病诊疗", value: 14 },
          { name: "免疫接种", value: 9 },
          { name: "产后护理", value: 6 },
          { name: "修蹄", value: 5 },
          { name: "其他", value: 3 },
        ],
      },
      overdue: {
        name: "逾期",
        value: 18,
        color: "var(--state-danger)",
        byType: [
          { name: "疾病诊疗", value: 7 },
          { name: "免疫接种", value: 4 },
          { name: "产后护理", value: 3 },
          { name: "修蹄", value: 2 },
          { name: "其他", value: 2 },
        ],
      },
    },
  },
  [TAB_UD]: {
    total: 214,
    color: "var(--effect-ai-cyan)",
    status: {
      done: {
        name: "已完成",
        value: 182,
        color: "var(--brand)",
        byType: [
          { name: "疾病诊疗", value: 71 },
          { name: "免疫接种", value: 42 },
          { name: "产后护理", value: 30 },
          { name: "修蹄", value: 23 },
          { name: "其他", value: 16 },
        ],
      },
      doing: {
        name: "进行中",
        value: 21,
        color: "var(--effect-ai-cyan)",
        byType: [
          { name: "疾病诊疗", value: 8 },
          { name: "免疫接种", value: 5 },
          { name: "产后护理", value: 4 },
          { name: "修蹄", value: 2 },
          { name: "其他", value: 2 },
        ],
      },
      overdue: {
        name: "逾期",
        value: 11,
        color: "var(--state-danger)",
        byType: [
          { name: "疾病诊疗", value: 4 },
          { name: "免疫接种", value: 3 },
          { name: "产后护理", value: 2 },
          { name: "修蹄", value: 1 },
          { name: "其他", value: 1 },
        ],
      },
    },
  },
};

const ORDER: StatusKey[] = ["done", "doing", "overdue"];

export function WorkOrderSection() {
  const [tab, setTab] = useState(TAB_ALL);
  const [active, setActive] = useState<StatusKey | null>(null);
  const { factor } = useDataLevel();
  const base = scopes[tab]!;
  const s = {
    ...base,
    total: scaleValue(base.total, factor),
    status: Object.fromEntries(
      ORDER.map((k) => [
        k,
        {
          ...base.status[k],
          value: scaleValue(base.status[k].value, factor),
          byType: base.status[k].byType.map((d) => ({ ...d, value: scaleValue(d.value, factor) })),
        },
      ]),
    ) as typeof base.status,
  };

  const slices = ORDER.map((k) => ({ name: s.status[k].name, value: s.status[k].value, color: s.status[k].color }));
  const cur = active ? s.status[active] : null;

  return (
    <SectionCard
      id="topic-workorder"
      title="兽医工单专题"
      desc="本月统计"
      icon={<ClipboardList className="h-4 w-4 text-primary" strokeWidth={1.75} />}
      extra={
        <PeriodTabs
          value={tab}
          onChange={(v) => {
            setTab(v);
            setActive(null);
          }}
          options={[TAB_ALL, TAB_UD]}
        />
      }
    >
      <div className="h-full flex flex-col">




        <div className="mt-4 flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col items-center gap-4">
            <Gauge
              value={s.status.done.value}
              max={s.total}
              valueText={`${((s.status.done.value / (s.total || 1)) * 100).toFixed(1)}%`}
              label={`工单完成率 · 总量 ${s.total.toLocaleString()} 单`}
              size={200}
            />
            <div className="w-full">
              <ProgressRows data={slices} unit=" 单" />
              <div className="mt-3 flex flex-wrap gap-2">
                {ORDER.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActive(k)}
                    className={`h-7 rounded-full border px-3 text-caption transition-colors ${
                      active === k
                        ? "border-primary text-primary bg-brand-subtle/40"
                        : "border-border text-text-secondary hover:text-foreground"
                    }`}
                  >
                    查看{s.status[k].name}明细
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            {cur ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setActive(null)}
                    className="inline-flex items-center gap-1 text-caption text-text-tertiary hover:text-foreground"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    返回
                  </button>
                  <span className="text-body-sm text-text-secondary">
                    {cur.name}工单分布 · {cur.value} 单
                  </span>
                </div>
                <Columns data={cur.byType.map((d) => ({ ...d, color: cur.color }))} unit=" 单" height={200} />
              </>
            ) : (
              <>
                <p className="text-body-sm text-text-secondary mb-3">逾期工单分布</p>
                <Columns
                  data={s.status.overdue.byType.map((d) => ({ ...d, color: "var(--state-danger)" }))}
                  unit=" 单"
                  height={200}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
