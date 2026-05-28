import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Beef, Plus, Search, SlidersHorizontal, MoreHorizontal, Trash2, TrendingUp, TrendingDown, Syringe, CalendarClock } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";

export const Route = createFileRoute("/archive/cattle")({
  head: () => ({ meta: [{ title: "牛只信息 — 奇点智牧" }] }),
  component: CattlePage,
});

type Health = "健康" | "观察中" | "治疗中";
const cattle: { id: string; ear: string; breed: string; sex: string; birth: string; farm: string; barn: string; health: Health }[] = [
  { id: "C-2381", ear: "A2381", breed: "荷斯坦", sex: "♀", birth: "2022-03-15", farm: "1 号牧场", barn: "3 号牛舍", health: "治疗中" },
  { id: "C-2380", ear: "A2380", breed: "荷斯坦", sex: "♀", birth: "2021-11-08", farm: "1 号牧场", barn: "1 号牛舍", health: "健康" },
  { id: "C-2379", ear: "A2379", breed: "荷斯坦", sex: "♀", birth: "2023-06-20", farm: "1 号牧场", barn: "犊牛舍 A", health: "健康" },
  { id: "C-2378", ear: "A2378", breed: "西门塔尔", sex: "♂", birth: "2022-09-10", farm: "2 号牧场", barn: "2 号牛舍", health: "观察中" },
  { id: "C-2377", ear: "A2377", breed: "荷斯坦", sex: "♀", birth: "2020-05-12", farm: "1 号牧场", barn: "3 号牛舍", health: "健康" },
];

function healthTag(h: Health) {
  return h === "健康" ? "tag tag-success" : h === "观察中" ? "tag tag-warning" : "tag tag-danger";
}

/* ============ Chart data ============ */
const TOTAL = 3286;

const healthData = [
  { name: "健康", value: 3102, color: "#00A14F" },
  { name: "观察", value: 142, color: "#3B9BE5" },
  { name: "异常", value: 32, color: "#EBBF6B" },
  { name: "隔离", value: 10, color: "#F46A6A" },
];

const withdrawalData = [
  { name: "可上市", value: 3168, color: "#00A14F" },
  { name: "休药期", value: 86, color: "#EBBF6B" },
  { name: "禁宰期", value: 32, color: "#F46A6A" },
];

const ageData = [
  { range: "0-6月", value: 312, label: "犊牛" },
  { range: "6-12月", value: 408, label: "育成" },
  { range: "1-2岁", value: 624, label: "青年" },
  { range: "2-4岁", value: 1086, label: "壮年" },
  { range: "4-6岁", value: 612, label: "成年" },
  { range: ">6岁", value: 244, label: "老年" },
];

const breedData = [
  { name: "荷斯坦", value: 2486 },
  { name: "西门塔尔", value: 498 },
  { name: "娟姗", value: 186 },
  { name: "安格斯", value: 116 },
];

const stageData = [
  { name: "泌乳期", value: 1842, color: "#00A14F" },
  { name: "干奶期", value: 386, color: "#47DFC7" },
  { name: "围产期", value: 168, color: "#7B61FF" },
  { name: "后备牛", value: 720, color: "#3B9BE5" },
  { name: "犊牛", value: 170, color: "#EBBF6B" },
];

/* ============ Reusable bits ============ */
function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={`border-border bg-card p-5 ${className}`}>
      <div className="mb-4">
        <div className="text-card-title font-medium text-foreground">{title}</div>
        {subtitle && <div className="mt-1 text-caption text-text-tertiary">{subtitle}</div>}
      </div>
      {children}
    </Card>
  );
}

function chartTooltip() {
  return (
    <Tooltip
      cursor={{ fill: "var(--bg-surface-subtle)" }}
      contentStyle={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: 8,
        boxShadow: "var(--shadow-elevated)",
        fontSize: 12,
        padding: "6px 10px",
      }}
      labelStyle={{ color: "var(--text-secondary)", fontSize: 12 }}
      itemStyle={{ color: "var(--text-primary)", fontSize: 12 }}
    />
  );
}

/* ============ Charts ============ */
function HealthDonut() {
  const pct = ((healthData[0].value / TOTAL) * 100).toFixed(1);
  return (
    <div className="grid grid-cols-[1fr_1.1fr] gap-4 items-center">
      <div className="relative h-[200px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={healthData} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={2} stroke="none">
              {healthData.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            {chartTooltip()}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-caption text-text-tertiary">健康率</div>
          <div className="text-[28px] leading-none font-semibold text-foreground tabular-nums mt-1">{pct}%</div>
          <div className="mt-1 flex items-center gap-0.5 text-caption" style={{ color: "var(--state-success, #00A14F)" }}>
            <TrendingUp className="h-3 w-3" /> 0.4%
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {healthData.map((d) => (
          <div key={d.name} className="flex items-center gap-3 text-body-sm">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-text-secondary w-12">{d.name}</span>
            <span className="text-foreground tabular-nums w-14 text-right">{d.value.toLocaleString()}</span>
            <span className="text-text-tertiary tabular-nums ml-auto">{((d.value / TOTAL) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WithdrawalDonut() {
  const safe = withdrawalData[0].value;
  const pct = ((safe / TOTAL) * 100).toFixed(1);
  return (
    <div className="grid grid-cols-[1fr_1.1fr] gap-4 items-center">
      <div className="relative h-[200px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={withdrawalData} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={2} stroke="none">
              {withdrawalData.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            {chartTooltip()}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-caption text-text-tertiary">可上市率</div>
          <div className="text-[28px] leading-none font-semibold text-foreground tabular-nums mt-1">{pct}%</div>
          <div className="mt-1 flex items-center gap-0.5 text-caption text-text-tertiary">
            <Syringe className="h-3 w-3" /> 118 头用药中
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {withdrawalData.map((d) => (
          <div key={d.name} className="flex items-center gap-3 text-body-sm">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-text-secondary w-16">{d.name}</span>
            <span className="text-foreground tabular-nums w-14 text-right">{d.value.toLocaleString()}</span>
            <span className="text-text-tertiary tabular-nums ml-auto">{((d.value / TOTAL) * 100).toFixed(1)}%</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-caption text-text-tertiary">
          <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" /> 最近 7 日解除</span>
          <span className="text-foreground tabular-nums">24 头</span>
        </div>
      </div>
    </div>
  );
}

function AgeBars() {
  const max = Math.max(...ageData.map((d) => d.value));
  return (
    <div className="h-[220px]">
      <ResponsiveContainer>
        <BarChart data={ageData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-default)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} width={40} />
          {chartTooltip()}
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {ageData.map((d) => (
              <Cell key={d.range} fill={d.value === max ? "#00A14F" : "#B7E5C5"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BreedBars() {
  const max = breedData.reduce((s, d) => s + d.value, 0);
  return (
    <div className="space-y-3">
      {breedData.map((d, i) => {
        const pct = (d.value / max) * 100;
        const colors = ["#00A14F", "#47DFC7", "#7B61FF", "#EBBF6B"];
        return (
          <div key={d.name}>
            <div className="flex items-center justify-between text-body-sm mb-1.5">
              <span className="text-text-secondary">{d.name}</span>
              <span className="text-text-tertiary tabular-nums">
                <span className="text-foreground">{d.value.toLocaleString()}</span> · {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-surface-subtle)] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors[i] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StageRadial() {
  const data = stageData.map((d) => ({ ...d, fill: d.color, pct: Math.round((d.value / TOTAL) * 100) }));
  return (
    <div className="grid grid-cols-[1fr_1.1fr] gap-4 items-center">
      <div className="h-[200px]">
        <ResponsiveContainer>
          <RadialBarChart innerRadius="35%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: "var(--bg-surface-subtle)" }} dataKey="pct" cornerRadius={6} />
            {chartTooltip()}
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-3 text-body-sm">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-text-secondary w-16">{d.name}</span>
            <span className="text-foreground tabular-nums w-14 text-right">{d.value.toLocaleString()}</span>
            <span className="text-text-tertiary tabular-nums ml-auto">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ KPI strip ============ */
function KpiStrip() {
  const kpis = [
    { label: "在群总数", value: "3,286", unit: "头", delta: "+24", up: true },
    { label: "本月新增", value: "62", unit: "头", delta: "+18%", up: true },
    { label: "本月淘汰", value: "14", unit: "头", delta: "-6%", up: false },
    { label: "平均胎次", value: "2.4", unit: "胎", delta: "持平", up: true },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((k) => (
        <Card key={k.label} className="border-border bg-card p-4">
          <div className="text-caption text-text-tertiary">{k.label}</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[24px] leading-none font-semibold text-foreground tabular-nums">{k.value}</span>
            <span className="text-caption text-text-tertiary">{k.unit}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-caption" style={{ color: k.up ? "#00A14F" : "var(--state-danger)" }}>
            {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {k.delta}
            <span className="text-text-tertiary ml-1">较上月</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CattlePage() {
  return (
    <>
      <AppHeader title="牛只信息" breadcrumb={["基础档案", "牛只信息"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <KpiStrip />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="牛群健康状态概览" subtitle={`实时同步 · 共 ${TOTAL.toLocaleString()} 头`}>
            <HealthDonut />
          </ChartCard>
          <ChartCard title="休药期 / 用药状态" subtitle="包含休药期、禁宰期与可上市分布">
            <WithdrawalDonut />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="年龄分布" subtitle="按月龄/年龄段分组" className="lg:col-span-2">
            <AgeBars />
          </ChartCard>
          <ChartCard title="品种构成" subtitle="按主要品种">
            <BreedBars />
          </ChartCard>
        </div>

        <ChartCard title="泌乳阶段分布" subtitle="按生产阶段统计">
          <StageRadial />
        </ChartCard>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索耳号 / 编号" className="h-9 w-56 pl-9 text-body-sm" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索所属牧场" className="h-9 w-48 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><SlidersHorizontal className="h-3.5 w-3.5" /> 精细筛选</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新增牛只
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-6 h-12 text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="grid grid-cols-8 gap-4 flex-1 min-w-0">
              <div>编号</div>
              <div>耳号</div>
              <div>品种</div>
              <div>性别</div>
              <div>出生日期</div>
              <div>所属牧场</div>
              <div>所在牛舍</div>
              <div>健康</div>
            </div>
            <div className="w-[140px] text-right shrink-0">功能</div>
          </div>
          {cattle.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-6 h-12 text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="grid grid-cols-8 gap-4 flex-1 min-w-0">
                <div className="font-mono text-body text-foreground truncate">{c.id}</div>
                <div className="flex items-center gap-1.5 text-body text-foreground truncate"><Beef className="h-3.5 w-3.5 text-primary shrink-0" />{c.ear}</div>
                <div className="text-body-sm text-text-secondary truncate">{c.breed}</div>
                <div className="text-body-sm text-text-secondary">{c.sex}</div>
                <div className="text-body-sm text-text-secondary tabular-nums truncate">{c.birth}</div>
                <div className="text-body-sm text-text-secondary truncate">{c.farm}</div>
                <div className="text-body-sm text-text-secondary truncate">{c.barn}</div>
                <div><span className={healthTag(c.health)}>{c.health}</span></div>
              </div>
              <div className="w-[140px] shrink-0 flex items-center justify-end gap-0.5">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground">查看</Button>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary">编辑</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-text-secondary hover:bg-surface-subtle hover:text-foreground" aria-label="更多">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-28">
                    <DropdownMenuItem className="text-[var(--state-danger)] focus:text-[var(--state-danger)]">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> 删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
