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

        {/* Bento grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* 牛群 */}
          <Tile
            span="col-span-12 md:col-span-6 xl:col-span-5"
            tone="var(--brand)"
            title="牛群存栏"
            caption="至今日 · 类型与健康分布"
            icon={<Beef className="h-4 w-4" strokeWidth={1.75} />}
            onClick={open("herd")}
          >
            <Headline value={herdTotal.toLocaleString()} unit="头" delta="+38 头" good note="较上月" size={38} />
            <div className="mt-4">
              <RankRows data={herdType} unit=" 头" />
            </div>
          </Tile>

          {/* 产犊 */}
          <Tile
            span="col-span-12 md:col-span-6 xl:col-span-4"
            tone="var(--effect-ai-cyan)"
            title="产犊"
            caption="本月 · 成活与死亡"
            icon={<Baby className="h-4 w-4" strokeWidth={1.75} />}
            onClick={open("calving")}
          >
            <Headline value="179" unit="头" delta="+12 头" good note="较上月" />
            <div className="mt-4">
              <SplitBar segments={calvingSplit} />
            </div>
            <div className="mt-4">
              <StatRow
                items={[
                  { label: "成活率", value: "95.0%", tone: "var(--brand)" },
                  { label: "双胎及以上", value: "22", unit: "头" },
                ]}
              />
            </div>
          </Tile>

          {/* 死淘 */}
          <Tile
            span="col-span-12 md:col-span-6 xl:col-span-3"
            tone="var(--state-danger)"
            title="死淘"
            caption="本月 · 近 6 个月趋势"
            icon={<Activity className="h-4 w-4" strokeWidth={1.75} />}
            onClick={open("culling")}
          >
            <Headline value="45" unit="头" delta="-6 头" good note="较上月" />
            <div className="mt-3">
              <Sparkline points={cullingTrend} color="var(--state-danger)" />
            </div>
            <div className="mt-3">
              <StatRow
                items={[
                  { label: "死亡", value: "21", unit: "头", tone: "var(--state-danger)" },
                  { label: "淘汰", value: "24", unit: "头", tone: "var(--state-warning)" },
                ]}
              />
            </div>
          </Tile>

          {/* 疾病 */}
          <Tile
            span="col-span-12 md:col-span-6 xl:col-span-5"
            tone="var(--effect-ai-purple)"
            title="疾病"
            caption="本月 · 发病 / 治愈头次"
            icon={<Stethoscope className="h-4 w-4" strokeWidth={1.75} />}
            onClick={open("disease")}
          >
            <Headline value="365 / 337" unit="头次" delta="-4.2%" good note="发病率较上月" />
            <div className="mt-4">
              <RankRows
                data={diseaseTop}
                unit=" 例"
                color="var(--effect-ai-purple)"
              />
            </div>
          </Tile>

          {/* 药品 */}
          {showInternal && (
            <Tile
              span="col-span-12 md:col-span-6 xl:col-span-4"
              tone="var(--state-warning)"
              title="药品费用"
              caption="本月 · 头均用药费用"
              icon={<Pill className="h-4 w-4" strokeWidth={1.75} />}
              onClick={open("drug")}
            >
              <Headline value="42.6" unit="元/头" delta="+6.9%" good={false} note="较上月" />
              <div className="mt-3">
                <Sparkline points={drugTrend} color="var(--state-warning)" />
              </div>
              <div className="mt-3">
                <StatRow
                  items={[
                    { label: "近 6 月总费用", value: "109.0", unit: "万元" },
                    { label: "抗生素占比", value: "42.4%", tone: "var(--state-warning)" },
                  ]}
                />
              </div>
            </Tile>
          )}

          {/* 免疫 */}
          <Tile
            span={`col-span-12 md:col-span-6 ${showInternal ? "xl:col-span-3" : "xl:col-span-7"}`}
            tone="var(--brand)"
            title="疫苗免疫"
            caption="本期 · 完成率"
            icon={<Syringe className="h-4 w-4" strokeWidth={1.75} />}
            onClick={open("vaccine")}
          >
            <div className="flex items-center gap-4">
              <Ring value={91.6} label="完成率" />
              <div className="min-w-0 space-y-1">
                <p className="text-body-sm text-text-secondary tabular-nums">已免疫 5,634 头</p>
                <p className="text-body-sm text-text-secondary tabular-nums">应免疫 6,154 头</p>
                <p className="text-caption text-text-tertiary">较上期 +2.3%</p>
              </div>
            </div>
          </Tile>

          {/* 工单 */}
          {showInternal && (
            <Tile
              span="col-span-12 xl:col-span-7"
              tone="var(--effect-ai-cyan)"
              title="兽医工单"
              caption="本月 · 全部工单 / UD 派工单"
              icon={<ClipboardList className="h-4 w-4" strokeWidth={1.75} />}
              onClick={open("workorder")}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {workOrderSplit.map((s) => {
                  const rate = Math.round((s.done / s.total) * 100);
                  return (
                    <div key={s.name} className="rounded-xl bg-surface-subtle p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-body-sm text-foreground">{s.name}</span>
                        <span className="text-caption tabular-nums text-text-tertiary">完成率 {rate}%</span>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-card">
                        <div className="h-full rounded-full" style={{ width: `${rate}%`, background: s.color }} />
                      </div>
                      <div className="mt-3">
                        <StatRow
                          items={[
                            { label: "总量", value: String(s.total), unit: "单" },
                            { label: "已完成", value: String(s.done), unit: "单", tone: s.color },
                            { label: "逾期", value: String(s.overdue), unit: "单", tone: "var(--state-danger)" },
                          ]}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tile>
          )}

          {/* 预警 */}
          {showInternal && (
            <Tile
              span="col-span-12 xl:col-span-5"
              tone="var(--state-danger)"
              title="预警告警"
              caption="库存 / 牛只 / 工单"
              icon={<AlertTriangle className="h-4 w-4" strokeWidth={1.75} />}
              onClick={open("alert")}
            >
              <Headline value="9" unit="条待关注" size={30} />
              <ul className="mt-3 space-y-2">
                {alertItems.map((a) => (
                  <li key={a.title} className="flex items-center gap-2 rounded-lg bg-surface-subtle px-3 py-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: a.tone }} />
                    <span className="min-w-0 flex-1 truncate text-body-sm text-foreground">{a.title}</span>
                    <span
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-caption"
                      style={{ background: `color-mix(in oklab, ${a.tone} 14%, transparent)`, color: a.tone }}
                    >
                      {a.tag}
                    </span>
                  </li>
                ))}
              </ul>
            </Tile>
          )}

          {/* 运营统计 */}
          {(scope === "region" || scope === "group") && (
            <Tile
              span="col-span-12"
              tone="var(--effect-ai-purple)"
              title={scope === "group" ? "集团运营统计" : "区域运营统计"}
              caption="牧场数量 / 牛群规模 / 人员"
              icon={<Building2 className="h-4 w-4" strokeWidth={1.75} />}
              onClick={open("ops")}
            >
              <StatRow
                items={[
                  { label: "牧场数量", value: scope === "group" ? "6" : "2", unit: "个", tone: "var(--brand)" },
                  { label: "牛群规模", value: scope === "group" ? "7,044" : "2,252", unit: "头" },
                  { label: "兽医及助理", value: scope === "group" ? "48" : "16", unit: "人", tone: "var(--effect-ai-cyan)" },
                  { label: "覆盖区域", value: scope === "group" ? "3" : "1", unit: "个", tone: "var(--effect-ai-purple)" },
                ]}
              />
            </Tile>
          )}
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
