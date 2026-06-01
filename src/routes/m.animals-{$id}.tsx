import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Beef,
  PlayCircle,
  ClipboardPlus,
  ChevronDown,
  Activity,
  Pill,
  Clock,
  MapPin,
  ArrowRight,
  ClipboardList,
  Stethoscope,
  Footprints,
  ChevronRight,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/animals-{$id}")({
  head: () => ({ meta: [{ title: "牛只详情 · 奇点智牧" }] }),
  component: AnimalDetailPage,
});

function AnimalDetailPage() {
  const { id } = useParams({ from: "/m/animals-{$id}" });

  // mock 牛只摘要
  const a = {
    id,
    farm: "金穗一牧场",
    barn: "3 号牛舍",
    pen: "B 区 · 12 栏",
    breed: "荷斯坦",
    sex: "母",
    ageDays: 1218,
    health: "观察中" as "健康" | "观察中" | "异常" | "治疗中",
    treating: true,
    withdrawalDays: 3,
    withdrawalUntil: "2026-05-28",
  };

  // mock 当前相关工单（仅展示 待诊断 / 执行中）
  const orders = [
    {
      id: "WO-2026-0518",
      kind: "健康" as "健康" | "修蹄",
      type: "疾病治疗",
      conclusion: "疑似乳房炎",
      desc: "持续高烧 39.6℃，食欲明显下降",
      status: "执行中" as "待诊断" | "执行中",
      time: "2026-05-18 09:20",
      person: "李雨晴",
      needPickup: true,
    },
    {
      id: "WO-2026-0521",
      kind: "修蹄" as "健康" | "修蹄",
      type: "趾间皮炎处置",
      conclusion: "待诊断",
      desc: "右后蹄红肿，需清创修蹄",
      status: "待诊断" as "待诊断" | "执行中",
      time: "2026-05-21 14:05",
      person: "王巡栏",
      needPickup: false,
    },
  ];
  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const visibleOrders = ordersExpanded ? orders : orders.slice(0, 1);

  const [tab, setTab] = useState<"meds" | "moves">("meds");

  return (
    <MobileShell title={`#${a.id}`} back hideTabBar>
      <div className="pb-28">
        {/* 头部：耳号 + 摘要 */}
        <div className="px-4 pt-4">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-[#00823F] p-5 text-primary-foreground relative overflow-hidden shadow-lg shadow-primary/20">
            <Beef className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" strokeWidth={1} />

            <div className="relative flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/15">
                <Beef className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] opacity-75 font-medium">耳号</div>
                <div className="text-section-title font-mono leading-tight">#{a.id}</div>
              </div>
              <span
                className={`ml-auto h-7 px-2.5 rounded-full inline-flex items-center gap-1.5 text-caption font-semibold shadow-sm ${
                  a.health === "异常"
                    ? "bg-[#FFE4E1] text-[#D9534F]"
                    : a.health === "观察中"
                    ? "bg-[#FFF7E6] text-[#B8860B]"
                    : a.health === "治疗中"
                    ? "bg-[#FFE8CC] text-[#C9621F]"
                    : "bg-[#E8F5E9] text-[#2E7D32]"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {a.health}
              </span>
            </div>

            <div className="relative mt-5 space-y-2">
              <Brief
                icon={<MapPin className="h-3 w-3 opacity-85" />}
                label="所在位置"
                value={`${a.farm} · ${a.barn} · ${a.pen}`}
              />
              <Brief
                icon={<Beef className="h-3 w-3 opacity-85" />}
                label="品种 / 性别 / 日龄"
                value={`${a.breed} · ${a.sex} · ${a.ageDays} 日龄`}
              />
            </div>
          </div>
        </div>

        {/* 状态标签 */}
        <section className="px-4 mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-body-sm font-medium border ${
              a.treating
                ? "bg-[#FFF7D6] text-[#B8860B] border-[#F5D76E]"
                : "bg-surface-subtle text-text-tertiary border-border"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            {a.treating ? "治疗中" : "未治疗"}
          </span>
          {a.withdrawalDays > 0 && (
            <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-body-sm font-medium border bg-[#FFE4E1] text-[#D9534F] border-[#F5B7B1]">
              <Clock className="h-3.5 w-3.5" />
              休药期至 {a.withdrawalUntil}（剩 {a.withdrawalDays} 天）
            </span>
          )}
        </section>

        {/* 当前相关工单 */}
        <section className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground">当前相关工单</h3>
            <span className="text-caption text-text-tertiary">
              共 {orders.length} 个
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
              <div className="text-body-sm text-text-tertiary">暂无相关工单</div>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {visibleOrders.map((o) => {
                  const KIcon = o.kind === "修蹄" ? Footprints : Stethoscope;
                  const isWait = o.status === "待诊断";
                  const StatusIcon = isWait ? ClipboardList : PlayCircle;
                  const tagCls = isWait ? "tag tag-warning" : "tag tag-info";
                  const timeLabel = isWait ? "上报" : "执行";
                  const personLabel = isWait ? "上报" : "执行";
                  const ctaText = isWait ? "诊断" : "执行";
                  const ctaActive = !isWait;
                  return (
                    <Link
                      key={o.id}
                      to="/m/health/$id"
                      params={{ id: o.id }}
                      className="block rounded-xl bg-card border border-border p-4 active:bg-surface-subtle"
                    >
                      <div className="flex flex-col gap-2">
                        {/* Header：编号·类型 + 状态 */}
                        <div className="flex items-center gap-1.5 text-body-sm h-5">
                          <span className="font-mono text-text-tertiary text-caption">{o.id}</span>
                          <span className="text-text-tertiary">·</span>
                          <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                            <KIcon className="h-3 w-3" />{o.type}
                          </span>
                          {!isWait && (
                            <span className="text-caption text-text-tertiary">
                              · {o.needPickup ? "需领物" : "无需领物"}
                            </span>
                          )}
                          <span className={`${tagCls} inline-flex items-center gap-1 ml-auto`}>
                            <StatusIcon className="h-3 w-3" />
                            {o.status}
                          </span>
                        </div>

                        {/* Title：对象 · 结论 */}
                        <div className="text-card-title text-foreground truncate h-[26px] leading-[26px]">
                          {`单只 ${a.id}`}
                          <span className="text-text-tertiary"> · </span>
                          {o.conclusion}
                        </div>

                        {/* Desc */}
                        <div className="text-body-sm text-text-secondary truncate h-[22px] leading-[22px]">
                          {o.desc || <span className="text-text-tertiary/0">·</span>}
                        </div>

                        {/* Footer：时间·人员 + 操作 */}
                        <div className="flex items-center text-caption text-text-tertiary pt-2 border-t border-border/60 h-9">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="shrink-0">
                              {timeLabel} <span className="text-text-secondary">{o.time}</span>
                            </span>
                            <span className="text-text-tertiary/60">·</span>
                            <span className="flex items-center gap-1 min-w-0">
                              <span className="shrink-0">{personLabel}</span>
                              <span className="h-4 w-4 rounded-full bg-primary/10 text-primary text-[9px] inline-flex items-center justify-center shrink-0">
                                {o.person.charAt(0)}
                              </span>
                              <span className="text-text-secondary truncate">{o.person}</span>
                            </span>
                          </div>
                          <span className={`ml-2 inline-flex items-center gap-0.5 shrink-0 ${
                            ctaActive ? "text-primary font-medium" : "text-text-secondary"
                          }`}>
                            {ctaText}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {orders.length > 1 && (
                <button
                  onClick={() => setOrdersExpanded((v) => !v)}
                  className="mt-2 w-full h-9 rounded-lg border border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1"
                >
                  {ordersExpanded ? "收起" : `展开全部 ${orders.length} 个`}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${ordersExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </>
          )}
        </section>

        {/* Tabs：用药与执行 / 转栏 */}
        <section className="px-4 mt-5">
          <div className="flex gap-1 p-1 rounded-lg bg-surface-subtle border border-border">
            <button
              onClick={() => setTab("meds")}
              className={`flex-1 h-9 rounded-md text-body-sm font-medium transition-colors ${
                tab === "meds"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-text-tertiary"
              }`}
            >
              用药与执行记录
            </button>
            <button
              onClick={() => setTab("moves")}
              className={`flex-1 h-9 rounded-md text-body-sm font-medium transition-colors ${
                tab === "moves"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-text-tertiary"
              }`}
            >
              转栏记录
            </button>
          </div>

          <div className="mt-3">
            {tab === "meds" ? <MedicationHistory /> : <MoveHistory />}
          </div>
        </section>
      </div>

      {/* 底部固定：疾病上报入口 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Link
          to="/m/report"
          search={{ target: a.id, barn: a.barn, lock: 1 } as never}
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
        >
          <ClipboardPlus className="h-4 w-4" /> 疾病上报
        </Link>
      </div>
    </MobileShell>
  );
}

function Brief({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white/15 backdrop-blur border border-white/15 px-3 py-2">
      <div className="text-caption opacity-85 inline-flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="text-body-sm mt-0.5 truncate">{value}</div>
    </div>
  );
}

type MedRecord = {
  id: string;
  date: string;
  drug: string;
  manufacturer: string;
  dose: string;
  operator: string;
  orderId: string;
};

const ALL_MEDS: MedRecord[] = [
  { id: "M-0518-1", date: "2026-05-18", drug: "氟尼辛葡甲胺注射液", manufacturer: "齐鲁动保", dose: "2ml / 次 · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0518" },
  { id: "M-0518-2", date: "2026-05-18", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g / 次 · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0518" },
  { id: "M-0519-1", date: "2026-05-19", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g / 次 · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0518" },
  { id: "M-0520-1", date: "2026-05-20", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g / 次 · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0518" },
  { id: "M-0510-1", date: "2026-05-10", drug: "维生素 B 复合注射液", manufacturer: "上海同仁", dose: "10ml · 肌肉注射", operator: "周凯", orderId: "WO-2026-0510" },
  { id: "M-0421", date: "2026-04-21", drug: "伊维菌素注射液", manufacturer: "中牧股份", dose: "1ml / 50kg · 皮下注射", operator: "周凯", orderId: "DW-2026-0421" },
  { id: "M-0315", date: "2026-03-15", drug: "青霉素 G 钾", manufacturer: "华北制药", dose: "400 万 IU · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0315" },
  { id: "M-0118", date: "2026-01-18", drug: "口蹄疫疫苗", manufacturer: "中农威特", dose: "2ml · 颈部皮下", operator: "赵敏", orderId: "IM-2026-0118" },
];

const TODAY = new Date("2026-05-29");

function MedicationHistory() {
  const [expanded, setExpanded] = useState(false);

  const { visible, recentCount, totalCount } = useMemo(() => {
    const cutoff = new Date(TODAY);
    cutoff.setDate(cutoff.getDate() - 30);
    const sorted = [...ALL_MEDS].sort((a, b) => (a.date < b.date ? 1 : -1));
    const recent = sorted.filter((m) => new Date(m.date) >= cutoff);
    return {
      visible: expanded ? sorted : recent,
      recentCount: recent.length,
      totalCount: sorted.length,
    };
  }, [expanded]);

  const groups = useMemo(() => {
    const map = new Map<string, MedRecord[]>();
    for (const m of visible) {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date)!.push(m);
    }
    return Array.from(map.entries());
  }, [visible]);

  const hasMore = totalCount > recentCount;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption text-text-tertiary">
          {expanded ? `全部 ${totalCount} 条` : `近 30 天 ${recentCount} 条`}
        </span>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-caption text-text-tertiary">
          近 30 天无用药记录
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-caption text-text-secondary">{date}</span>
                <span className="text-caption text-text-tertiary">· {items.length} 条</span>
                <span className="flex-1 h-px bg-border" />
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                {items.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`flex items-center px-3 py-2.5 ${
                      idx !== items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                      <div className="text-body-sm text-foreground truncate">{m.drug}</div>
                      <div className="text-caption text-text-tertiary truncate text-center">
                        {m.manufacturer}
                      </div>
                      <div className="text-caption text-text-secondary truncate text-right">
                        {m.dose}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full h-10 rounded-lg border border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1"
        >
          {expanded ? "收起" : `展开查看全部 ${totalCount} 条`}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

type MoveRecord = {
  id: string;
  date: string;
  from: string;
  to: string;
  reason: string;
  operator: string;
};

const ALL_MOVES: MoveRecord[] = [
  { id: "MV-0518", date: "2026-05-18", from: "1 号牛舍 · A 区 05 栏", to: "3 号牛舍 · B 区 12 栏", reason: "转入隔离观察栏", operator: "李雨晴" },
  { id: "MV-0301", date: "2026-03-01", from: "犊牛舍 · 03 栏", to: "1 号牛舍 · A 区 05 栏", reason: "体重达标，转育成", operator: "王场长" },
  { id: "MV-0101", date: "2026-01-10", from: "产房 · 02 栏", to: "犊牛舍 · 03 栏", reason: "产后断奶转栏", operator: "周凯" },
];

function MoveHistory() {
  if (ALL_MOVES.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-caption text-text-tertiary">
        暂无转栏记录
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="text-caption text-text-tertiary mb-1">共 {ALL_MOVES.length} 条</div>
      {ALL_MOVES.map((m) => (
        <div
          key={m.id}
          className="rounded-xl border border-border bg-card p-3"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-caption text-text-secondary">{m.date}</span>
            <span className="text-caption text-text-tertiary">· 操作人 {m.operator}</span>
          </div>
          <div className="flex items-center gap-2 text-body-sm text-foreground">
            <span className="flex-1 min-w-0 truncate">{m.from}</span>
            <ArrowRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
            <span className="flex-1 min-w-0 truncate text-right">{m.to}</span>
          </div>
          <div className="text-caption text-text-tertiary mt-1">原因：{m.reason}</div>
        </div>
      ))}
    </div>
  );
}
