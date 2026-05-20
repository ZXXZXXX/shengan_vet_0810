import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Beef, Activity, Stethoscope, Syringe, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/animals/$id")({
  head: () => ({ meta: [{ title: "牛只详情 · 奇点智牧" }] }),
  component: AnimalDetailPage,
});

function AnimalDetailPage() {
  const { id } = useParams({ from: "/m/animals/$id" });

  // mock data
  const a = {
    id,
    breed: "荷斯坦",
    age: "3 岁 4 月",
    barn: "3 号牛舍",
    stage: "成母牛",
    status: "观察中",
    health: 3.6,
    weight: "612 kg",
    parity: "第 2 胎",
    inDate: "2023-08-12",
    sire: "HOL-2018-09",
    dam: "#A1875",
  };

  return (
    <MobileShell title={`#${a.id}`} back hideTabBar>
      <div className="pb-10">
        {/* 头图 */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Beef className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-section-title">#{a.id}</div>
                <div className="text-caption opacity-85 mt-0.5">
                  {a.breed} · {a.age} · {a.barn}
                </div>
              </div>
              <span className="ml-auto h-7 px-2.5 rounded-full bg-[var(--state-warning)]/30 backdrop-blur inline-flex items-center text-caption">
                {a.status}
              </span>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-3 text-center">
              <Brief label="健康指数" value={a.health.toFixed(1)} suffix="/5" />
              <Brief label="体重" value={a.weight} />
              <Brief label="胎次" value={a.parity.replace("第 ", "").replace(" 胎", "")} suffix="胎" />
            </div>
          </div>
        </div>

        {/* 基本信息 */}
        <section className="px-4 mt-4">
          <h3 className="text-card-title text-foreground mb-2">基本信息</h3>
          <div className="rounded-xl bg-card border border-border divide-y divide-border">
            <Row label="阶段" value={a.stage} />
            <Row label="入舍日期" value={a.inDate} />
            <Row label="父系" value={a.sire} />
            <Row label="母系" value={a.dam} />
          </div>
        </section>

        {/* 健康记录 */}
        <section className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground">健康记录</h3>
            <Link to="/m/health" className="text-caption text-text-tertiary inline-flex items-center">
              全部 <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            <Timeline icon={Activity} tone="warning" title="体温异常 39.6℃" sub="2026-05-12 09:08 · 陈晓东上报" />
            <Timeline icon={Stethoscope} tone="info" title="例行体检" sub="2026-05-09 · 健康指数 4.0" />
            <Timeline icon={Syringe} tone="brand" title="口蹄疫加强免疫" sub="2026-04-21 · 周凯执行" />
          </div>
        </section>

        {/* 操作按钮 */}
        <section className="px-4 mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/m/report"
            className="h-12 rounded-lg border border-border bg-card text-body text-text-secondary inline-flex items-center justify-center"
          >
            上报异常
          </Link>
          <Link
            to="/m/health"
            className="h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center"
          >
            查看工单
          </Link>
        </section>
      </div>
    </MobileShell>
  );
}

function Brief({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-lg bg-white/15 backdrop-blur border border-white/15 py-2">
      <div className="text-section-title tabular-nums">
        {value}
        {suffix && <span className="text-caption ml-0.5 opacity-80">{suffix}</span>}
      </div>
      <div className="text-caption opacity-85 mt-0.5">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 h-12 flex items-center justify-between">
      <span className="text-body-sm text-text-tertiary">{label}</span>
      <span className="text-body text-foreground">{value}</span>
    </div>
  );
}

const toneClass: Record<string, string> = {
  warning: "bg-[var(--state-warning)]/15 text-[var(--state-warning)]",
  info: "bg-[var(--effect-ai-cyan)]/15 text-[var(--effect-ai-cyan)]",
  brand: "bg-brand-subtle text-primary",
};

function Timeline({
  icon: Icon,
  tone,
  title,
  sub,
}: {
  icon: typeof Activity;
  tone: keyof typeof toneClass;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
      <span className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneClass[tone]}`}>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-body text-foreground truncate">{title}</div>
        <div className="text-caption text-text-tertiary mt-0.5">{sub}</div>
      </div>
    </div>
  );
}
