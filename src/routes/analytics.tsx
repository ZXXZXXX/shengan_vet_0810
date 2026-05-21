import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, Activity } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "统计分析 — 奇点智牧" }] }),
  component: AnalyticsPage,
});

const kpis = [
  { label: "本月入栏", value: "186", unit: "头", trend: "+12%", icon: TrendingUp, tone: "var(--brand)" },
  { label: "本月出栏", value: "92", unit: "头", trend: "+5%", icon: Activity, tone: "var(--effect-ai-cyan)" },
  { label: "健康率", value: "97.8", unit: "%", trend: "+0.6%", icon: PieChart, tone: "var(--state-success)" },
  { label: "药品消耗", value: "8.4", unit: "万元", trend: "-3%", icon: BarChart3, tone: "var(--effect-ai-purple)" },
];

function AnalyticsPage() {
  return (
    <>
      <AppHeader title="统计分析" breadcrumb={["首页", "统计分析"]} />
      <main className="flex-1 px-6 py-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.label} className="border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in oklab, ${k.tone} 14%, transparent)`, color: k.tone }}
                >
                  <k.icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span className="text-caption tabular-nums" style={{ color: k.tone }}>{k.trend}</span>
              </div>
              <div className="mt-5">
                <p className="text-body-sm text-text-tertiary">{k.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="tabular-nums font-semibold leading-none text-foreground" style={{ fontSize: "32px" }}>{k.value}</span>
                  <span className="text-caption text-text-tertiary">{k.unit}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border bg-card p-6">
            <h3 className="text-card-title text-foreground mb-4">存栏趋势</h3>
            <div className="h-56 flex items-end justify-between gap-2">
              {[62, 78, 85, 72, 90, 95, 88, 92, 100, 96, 88, 94].map((v, i) => (
                <div key={i} className="flex-1 rounded-t-md" style={{ height: `${v}%`, background: "linear-gradient(to top, var(--brand), color-mix(in oklab, var(--brand) 50%, var(--effect-ai-cyan)))" }} />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-caption text-text-tertiary">
              {["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"].map((m) => <span key={m}>{m}</span>)}
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <h3 className="text-card-title text-foreground mb-4">病种分布</h3>
            <div className="space-y-3">
              {[
                { name: "乳房炎", pct: 38, color: "var(--brand)" },
                { name: "蹄病", pct: 24, color: "var(--effect-ai-cyan)" },
                { name: "呼吸道疾病", pct: 18, color: "var(--state-warning)" },
                { name: "消化系统", pct: 12, color: "var(--effect-ai-purple)" },
                { name: "其他", pct: 8, color: "var(--text-tertiary)" },
              ].map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between text-body-sm mb-1">
                    <span className="text-foreground">{d.name}</span>
                    <span className="tabular-nums text-text-secondary">{d.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-subtle overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
