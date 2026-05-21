import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CalendarClock,
  Repeat,
  Syringe,
  Droplets,
  Bug,
  Footprints,
  Plus,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/production/plans")({
  head: () => ({ meta: [{ title: "计划性事项 — 奇点智牧" }] }),
  component: PlansPage,
});

type Plan = {
  id: string;
  name: string;
  category: "疫苗免疫" | "干奶" | "驱虫" | "修蹄" | "复查";
  scope: string;
  cycle: string;
  nextRun: string;
  enabled: boolean;
  owner: string;
  lastBatch?: { date: string; count: number };
};

const icon: Record<Plan["category"], typeof Syringe> = {
  疫苗免疫: Syringe,
  干奶: Droplets,
  驱虫: Bug,
  修蹄: Footprints,
  复查: Repeat,
};

const initial: Plan[] = [
  {
    id: "PL-021",
    name: "犊牛舍 A · 口蹄疫加强免疫",
    category: "疫苗免疫",
    scope: "犊牛舍 A · 全部犊牛",
    cycle: "每 6 个月",
    nextRun: "2026-05-25",
    enabled: true,
    owner: "兽医·李雨晴",
    lastBatch: { date: "2025-11-25", count: 84 },
  },
  {
    id: "PL-019",
    name: "泌乳后期 · 干奶批次",
    category: "干奶",
    scope: "泌乳天数 ≥ 305 天 自动入池",
    cycle: "每周一 09:00 生成",
    nextRun: "2026-05-25 09:00",
    enabled: true,
    owner: "场长·赵磊",
    lastBatch: { date: "2026-05-18", count: 12 },
  },
  {
    id: "PL-014",
    name: "全场 · 体内外驱虫",
    category: "驱虫",
    scope: "全场成母牛 + 后备牛",
    cycle: "每 3 个月",
    nextRun: "2026-07-01",
    enabled: true,
    owner: "兽医·李雨晴",
    lastBatch: { date: "2026-04-01", count: 320 },
  },
  {
    id: "PL-011",
    name: "批次修蹄 · 蹄部评分触发",
    category: "修蹄",
    scope: "蹄部评分 ≥ 3 自动派单外部修蹄工",
    cycle: "事件触发",
    nextRun: "实时",
    enabled: false,
    owner: "场长·赵磊",
  },
  {
    id: "PL-008",
    name: "乳房炎 · T+7 自动复查",
    category: "复查",
    scope: "乳房炎治疗工单完成后 7 天",
    cycle: "事件触发",
    nextRun: "实时",
    enabled: true,
    owner: "兽医·李雨晴",
    lastBatch: { date: "2026-05-15", count: 6 },
  },
];

function PlansPage() {
  const [data, setData] = useState(initial);

  return (
    <>
      <AppHeader title="计划性事项" breadcrumb={["健康管理", "计划性事项"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="text-section-title text-foreground">周期 / 批次计划</h2>
            <span className="text-body-sm text-text-tertiary">
              规则在 PC 端配置，系统按规则生成对应任务并同步至小程序
            </span>
          </div>
          <Button
            size="sm"
            className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 新建计划
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((p) => {
            const Icon = icon[p.category];
            return (
              <Card key={p.id} className="border-border bg-card p-6 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-card-title text-foreground font-medium">
                        {p.name}
                      </span>
                      <span className="tag tag-muted">{p.category}</span>
                    </div>
                    <div className="mt-1 text-caption text-text-tertiary font-mono">
                      {p.id} · 负责人 {p.owner}
                    </div>
                  </div>
                  <Switch
                    checked={p.enabled}
                    onCheckedChange={(v) =>
                      setData((d) => d.map((x) => (x.id === p.id ? { ...x, enabled: v } : x)))
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-body-sm">
                  <Field label="适用范围" value={p.scope} />
                  <Field label="生成规则" value={p.cycle} />
                  <Field label="下一次生成" value={p.nextRun} highlight />
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-caption text-text-tertiary">
                    {p.lastBatch
                      ? `上批 ${p.lastBatch.date} · 生成 ${p.lastBatch.count} 个任务`
                      : "尚未生成任务"}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-body-sm font-normal text-primary hover:text-primary hover:bg-brand-subtle"
                  >
                    查看历史批次 <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 小程序线索说明 */}
        <Card className="border-border bg-card p-6">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-md bg-[var(--ai-purple)]/15 text-[var(--ai-purple)] inline-flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <div className="text-card-title text-foreground font-medium">
                现场线索 → 单次健康事项
              </div>
              <p className="mt-1 text-body-sm text-text-secondary leading-relaxed">
                小程序端现场人员可发起单次健康事项线索，由 PC 端审批人确认后转入正式工单流转。
                批量 / 周期性事项（干奶、疫苗、驱虫、复查等）统一在本页配置。
              </p>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-caption text-text-tertiary">{label}</div>
      <div className={`mt-0.5 text-body-sm ${highlight ? "text-primary font-medium" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
