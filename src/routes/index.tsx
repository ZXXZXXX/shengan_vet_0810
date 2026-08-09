import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import grasslandHero from "@/assets/grassland-hero.png";
import { ImmunizationRateCard } from "@/components/immunization-rate-card";
import { DiseaseStatsSection } from "@/components/disease-stats-section";
import { HerdSection } from "@/components/dashboard/herd-section";
import { CalvingSection } from "@/components/dashboard/calving-section";
import { CullingSection } from "@/components/dashboard/culling-section";
import { DrugSection } from "@/components/dashboard/drug-section";
import { WorkOrderSection } from "@/components/dashboard/workorder-section";
import { AlertSection } from "@/components/dashboard/alert-section";
import { OpsSection } from "@/components/dashboard/ops-section";
import { DrillSheet } from "@/components/dashboard/drill-sheet";
import { Tile, Headline, Sparkline, SplitBar, Ring, RankRows, StatRow } from "@/components/dashboard/bento";

import {
  ArrowUpRight,
  Beef,
  Baby,
  Pill,
  Syringe,
  Stethoscope,
  Activity,
  ClipboardList,
  AlertTriangle,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "首页总览 — 奇点智牧" },
      { name: "description", content: "牧场运营驾驶舱：牛群、产犊、死淘、疾病、药品、免疫、工单与预警的一屏总览与下钻分析" },
      { property: "og:title", content: "首页总览 — 奇点智牧" },
      { property: "og:description", content: "牧场运营驾驶舱：一屏总览各专题核心指标，点击卡片下钻查看明细" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

type ReportScope = "farm-in" | "farm-out" | "region" | "group";

const scopeOptions: { key: ReportScope; label: string }[] = [
  { key: "farm-in", label: "牧场·内部" },
  { key: "farm-out", label: "牧场·外部" },
  { key: "region", label: "区域（中心）" },
  { key: "group", label: "集团高管" },
];

type TopicKey =
  | "herd"
  | "calving"
  | "culling"
  | "disease"
  | "drug"
  | "vaccine"
  | "workorder"
  | "alert"
  | "ops";

const topicMeta: Record<TopicKey, { title: string; desc: string }> = {
  herd: { title: "牛群专题", desc: "存栏类型分布与健康分布" },
  calving: { title: "产犊专题", desc: "犊牛成活、胎型、性别、体重与母牛难易度" },
  culling: { title: "死淘专题", desc: "死亡与淘汰构成及原因分析" },
  disease: { title: "疾病专题", desc: "发病率排名与疾病类别分布" },
  drug: { title: "药品专题", desc: "用药费用趋势与品类构成" },
  vaccine: { title: "疫苗免疫专题", desc: "各层级免疫完成率下钻" },
  workorder: { title: "兽医工单专题", desc: "全部工单与 UD 派工单完成情况" },
  alert: { title: "预警告警专题", desc: "库存、牛只与工单三类预警" },
  ops: { title: "运营统计", desc: "区域 / 集团口径运营概览" },
};

/* ---------------- 卡片快照数据 ---------------- */

const herdType = [
  { name: "泌乳牛", value: 2180 },
  { name: "干奶牛", value: 386 },
  { name: "青年牛", value: 640 },
  { name: "犊牛", value: 498 },
];

const calvingSplit = [
  { name: "成活", value: 170, color: "var(--brand)" },
  { name: "死亡", value: 9, color: "var(--state-danger)" },
];

const cullingTrend = [38, 44, 51, 47, 52, 45];

const diseaseTop = [
  { name: "乳房疾病", value: 132 },
  { name: "肢蹄疾病", value: 99 },
  { name: "繁殖疾病", value: 73 },
];

const drugTrend = [19.2, 20.4, 17.3, 16.1, 17.4, 18.6];

const workOrderSplit = [
  { name: "全部工单", total: 486, done: 431, overdue: 18, color: "var(--brand)" },
  { name: "UD 派工单", total: 214, done: 182, overdue: 11, color: "var(--effect-ai-cyan)" },
];

const alertItems = [
  { title: "疫苗 A 余量 12 支", tag: "紧急", tone: "var(--state-danger)" },
  { title: "#01-24-2381 诊疗期 18 天", tag: "诊疗期长", tone: "var(--state-warning)" },
  { title: "WO-2381 距离逾期 3 小时", tag: "即将逾期", tone: "var(--effect-ai-cyan)" },
];

function HeroStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="text-caption text-white/75">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-section-title tabular-nums text-white drop-shadow-sm">{value}</span>
        {unit && <span className="text-caption text-white/75">{unit}</span>}
      </div>
    </div>
  );
}

function HomePage() {
  const [scope, setScope] = useState<ReportScope>("farm-in");
  const [topic, setTopic] = useState<TopicKey | null>(null);
  const showInternal = scope !== "farm-out";
  const herdTotal = 4060;

  const open = (k: TopicKey) => () => setTopic(k);

  return (
    <>
      <AppHeader title="首页总览" breadcrumb={["首页"]} />
      <main className="flex-1 space-y-5 px-6 py-6">
        {/* Hero */}
        <Card className="relative overflow-hidden border-0 text-white shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--brand)_70%,transparent)]">
          <img src={grasslandHero} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          <div className="relative flex flex-wrap items-center justify-between gap-6 p-6">
            <div className="max-w-[640px]">
              <div className="mb-2 inline-flex items-center gap-2 text-caption text-white/85">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-2 py-0.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--state-success)] shadow-[0_0_8px_var(--state-success)]" />
                  系统正常
                </span>
                <span>2026/05/12 周二 · 1 号牧场</span>
              </div>
              <h2 className="text-page-title font-medium drop-shadow-sm">早上好，场长张磊</h2>
              <div className="mt-4 flex items-center gap-6 text-white/90">
                <HeroStat label="今日入栏" value="38" unit="头" />
                <span className="h-8 w-px bg-white/25" />
                <HeroStat label="健康预警" value="12" unit="起" />
                <span className="h-8 w-px bg-white/25" />
                <HeroStat label="完成工作" value="86%" />
              </div>
            </div>
            <Button className="h-10 bg-white px-4 text-body-sm font-normal text-primary shadow-lg hover:bg-white/90">
              今日待办 <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>

        {/* 口径切换 */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h3 className="text-section-title text-foreground">数据看板</h3>
            <p className="mt-0.5 text-caption text-text-tertiary">
              {scope === "farm-out"
                ? "外部口径：不展示药品、工单与预警专题"
                : scope === "region"
                ? "区域（中心）口径：牧场数据上卷至区域级"
                : scope === "group"
                ? "集团高管口径：牧场数据上卷至区域级、集团级"
                : "牧场级内部口径：全量专题 · 点击任意卡片下钻查看明细"}
            </p>
          </div>
          <div className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface-subtle p-0.5">
            {scopeOptions.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setScope(o.key)}
                className={`h-8 rounded-full px-3 text-caption transition-colors ${
                  scope === o.key ? "bg-card text-primary shadow-card" : "text-text-secondary"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* 核心指标卡 3 × 2 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.filter((k) => showInternal || !k.internal).map((k) => (
            <KpiCard key={k.key} {...k} onClick={open(k.topic)} />
          ))}
        </div>

        {/* 专题分析入口 */}
        <div>
          <h3 className="text-section-title text-foreground">专题分析</h3>
          <p className="mt-0.5 text-caption text-text-tertiary">点击进入对应专题查看明细与下钻</p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {topics
              .filter((t) => (showInternal || !t.internal) && (t.key !== "ops" || scope === "region" || scope === "group"))
              .map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={open(t.key)}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface-subtle"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `color-mix(in oklab, ${t.tone} 12%, transparent)`, color: t.tone }}
                  >
                    {t.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium text-foreground">{topicMeta[t.key].title}</span>
                    <span className="mt-0.5 block truncate text-caption text-text-tertiary">{topicMeta[t.key].desc}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-text-tertiary transition-colors group-hover:text-primary" />
                </button>
              ))}
          </div>
        </div>

      </main>

      <DrillSheet
        open={!!topic}
        onOpenChange={(v) => !v && setTopic(null)}
        title={topic ? topicMeta[topic].title : ""}
        desc={topic ? topicMeta[topic].desc : undefined}
      >
        {topic === "herd" && <HerdSection />}
        {topic === "calving" && <CalvingSection />}
        {topic === "culling" && <CullingSection />}
        {topic === "disease" && <DiseaseStatsSection />}
        {topic === "drug" && <DrugSection />}
        {topic === "vaccine" && <ImmunizationRateCard />}
        {topic === "workorder" && <WorkOrderSection />}
        {topic === "alert" && <AlertSection />}
        {topic === "ops" && <OpsSection level={scope === "group" ? "group" : "region"} />}
      </DrillSheet>
    </>
  );
}
