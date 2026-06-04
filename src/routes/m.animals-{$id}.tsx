import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Beef,
  PlayCircle,
  ClipboardPlus,
  ChevronDown,
  Pill,
  Clock,
  MapPin,
  ArrowRight,
  ArrowRightLeft,
  ClipboardList,
  Stethoscope,
  Footprints,
  ChevronRight,
  X,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { TransferBarnControl } from "@/components/m/transfer-barn-control";
import { ConfirmTransferDialog } from "@/components/m/confirm-transfer-dialog";
import { TagPicker } from "@/components/m/tag-picker";
import { toast } from "sonner";

const TRANSFER_REASONS = [
  "泌乳阶段调整",
  "干奶转入",
  "产前转入产房",
  "产后转出",
  "并群优化",
  "隔离治疗",
  "康复转出",
  "淘汰待售",
  "栏舍维修",
  "饲养密度调整",
];

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

  // 转栏弹窗状态
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferEnabled, setTransferEnabled] = useState(true);
  const [transferTo, setTransferTo] = useState("");
  const [transferReasons, setTransferReasons] = useState<string[]>([]);
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);

  const handleTransferSubmit = () => {
    if (!transferTo) {
      toast.error("请选择转入栏舍");
      return;
    }
    if (transferReasons.length === 0) {
      toast.error("请选择或输入转栏原因");
      return;
    }
    setTransferConfirmOpen(true);
  };
  const handleTransferConfirm = () => {
    setTransferConfirmOpen(false);
    setTransferOpen(false);
    toast.success(`已转至 ${transferTo}`);
    setTransferTo("");
    setTransferReasons([]);
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

        {a.withdrawalDays > 0 && (
          <section className="px-4 mt-3">
            <div className="bg-[#FFF1F0] border border-[#FFA39E] rounded-lg px-3 py-2 inline-flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-[#CF1322] min-w-0">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">休药期至 {a.withdrawalUntil}</span>
              </span>
              <span className="ml-2 shrink-0 bg-[#FF4D4F] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                剩 {a.withdrawalDays} 天
              </span>
            </div>
          </section>
        )}

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
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => setOrdersExpanded((v) => !v)}
                    className="h-8 px-4 rounded-full bg-primary/8 text-primary text-caption font-medium inline-flex items-center gap-1 active:bg-primary/15 transition-colors"
                  >
                    {ordersExpanded ? "收起" : `展开全部 ${orders.length} 个`}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${ordersExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Tabs：用药与执行 / 转栏 */}
        <section className="px-4 mt-5">
          <div className="flex items-center gap-6 border-b border-border">
            {[
              { key: "meds" as const, label: "用药记录" },
              { key: "moves" as const, label: "转栏记录" },
            ].map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative h-10 text-body-sm font-medium transition-colors ${
                    active ? "text-foreground" : "text-text-tertiary"
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] w-6 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            {tab === "meds" ? <MedicationHistory /> : <MoveHistory />}
          </div>
        </section>
      </div>

      {/* 底部固定：转栏 + 疾病上报 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card/85 backdrop-blur-lg border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTransferEnabled(true);
              setTransferTo("");
              setTransferOpen(true);
            }}
            className="h-12 px-4 rounded-2xl bg-brand-subtle text-primary text-body font-semibold inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <ArrowRightLeft className="h-4 w-4" /> 转栏
          </button>
          <Link
            to="/m/report"
            search={{ target: a.id, barn: a.barn, lock: 1 } as never}
            className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground text-body font-semibold inline-flex items-center justify-center gap-1.5 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
          >
            <ClipboardPlus className="h-4 w-4" /> 疾病上报
          </Link>
        </div>
      </div>

      {/* 转栏 Sheet */}
      {transferOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => setTransferOpen(false)}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+16px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 h-12 flex items-center justify-between border-b border-border">
              <div className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                转栏操作
              </div>
              <button
                type="button"
                onClick={() => setTransferOpen(false)}
                className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-stretch gap-2">
                <div className="flex-1 min-w-0 rounded-xl border border-border bg-surface-subtle px-3 py-2.5">
                  <div className="flex items-center gap-1 text-caption text-text-tertiary mb-1">
                    <MapPin className="h-3 w-3" />
                    当前位置
                  </div>
                  <div className="text-body-sm text-text-secondary truncate">
                    {a.barn} · {a.pen}
                  </div>
                </div>
                <div className={`shrink-0 flex items-center justify-center w-7 ${transferTo ? "text-primary" : "text-text-tertiary"}`}>
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div
                  className={`flex-1 min-w-0 rounded-xl px-3 py-2.5 transition-colors ${
                    transferTo
                      ? "bg-primary text-primary-foreground border border-primary shadow-[0_4px_12px_-4px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
                      : "border border-dashed border-primary/40 bg-brand-subtle/40"
                  }`}
                >
                  <div className={`flex items-center gap-1 text-caption mb-1 ${transferTo ? "text-primary-foreground/85" : "text-primary"}`}>
                    <MapPin className="h-3 w-3" />
                    转入位置
                  </div>
                  <div className={`text-body font-medium truncate ${transferTo ? "text-primary-foreground" : "text-primary/70"}`}>
                    {transferTo || "请选择牛舍"}
                  </div>
                </div>
              </div>
              <TransferBarnControl
                enabled={transferEnabled}
                onEnabledChange={setTransferEnabled}
                value={transferTo}
                onValueChange={setTransferTo}
                exclude={[a.barn]}
                label="转入栏舍"
                hideToggle
              />

              <div className="rounded-xl bg-card border border-border p-3">
                <div className="text-body-sm text-foreground mb-2 inline-flex items-center gap-1">
                  转栏原因
                  <span className="text-[var(--state-danger)]">*</span>
                </div>
                <TagPicker
                  selected={transferReasons}
                  onChange={setTransferReasons}
                  presets={TRANSFER_REASONS}
                  singleSelect
                  placeholder="输入关键词搜索，未命中可直接新建"
                />
              </div>

              <button
                type="button"
                onClick={handleTransferSubmit}
                disabled={!transferTo || transferReasons.length === 0}
                className={`w-full h-11 rounded-lg text-body inline-flex items-center justify-center gap-1.5 ${
                  transferTo && transferReasons.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-border text-text-tertiary"
                }`}
              >
                <ArrowRightLeft className="h-4 w-4" /> 提交转栏
              </button>

            </div>
          </div>
        </div>
      )}

      <ConfirmTransferDialog
        open={transferConfirmOpen}
        earTag={`#${a.id}`}
        barn={transferTo}
        onCancel={() => setTransferConfirmOpen(false)}
        onConfirm={handleTransferConfirm}
      />
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
    <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2">
      <div className="text-[10px] opacity-75 inline-flex items-center gap-1 font-medium">
        {icon}
        {label}
      </div>
      <div className="text-body-sm mt-0.5 truncate font-medium">{value}</div>
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
        <div className="relative pl-4">
          {/* 垂直时间线 */}
          <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border" />
          <div className="space-y-4">
            {groups.map(([date, items]) => (
              <div key={date} className="relative">
                {/* 小圆点 */}
                <span className="absolute -left-4 top-1.5 h-[7px] w-[7px] rounded-full bg-primary ring-2 ring-background" />
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-caption text-text-secondary">{date}</span>
                  <span className="text-caption text-text-tertiary">· {items.length} 条</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((m) => (
                    <div
                      key={m.id}
                      className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center"
                    >
                      <div className="text-body-sm text-foreground truncate">{m.drug}</div>
                      <div className="text-caption text-text-tertiary truncate text-center">
                        {m.manufacturer}
                      </div>
                      <div className="text-caption text-text-secondary truncate text-right">
                        {m.dose}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasMore && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="h-8 px-4 rounded-full bg-primary/8 text-primary text-caption font-medium inline-flex items-center gap-1 active:bg-primary/15 transition-colors"
          >
            {expanded ? "收起" : `展开全部 ${totalCount} 条`}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}
    </div>
  );
}

type MoveRecord = {
  id: string;
  date: string;
  from: string;
  to: string;
  orderId: string;
  operator: string;
};

const ALL_MOVES: MoveRecord[] = [
  { id: "MV-0518", date: "2026-05-18", from: "1 号牛舍 · A 区 05 栏", to: "3 号牛舍 · B 区 12 栏", orderId: "WO-2026-0518", operator: "李雨晴" },
  { id: "MV-0301", date: "2026-03-01", from: "犊牛舍 · 03 栏", to: "1 号牛舍 · A 区 05 栏", orderId: "TR-2026-0301", operator: "王场长" },
  { id: "MV-0101", date: "2026-01-10", from: "产房 · 02 栏", to: "犊牛舍 · 03 栏", orderId: "TR-2026-0101", operator: "周凯" },
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
          <div className="text-caption text-text-tertiary mt-1 inline-flex items-center gap-1">
            关联工单
            <Link
              to="/m/health/$id"
              params={{ id: m.orderId }}
              className="font-mono text-primary inline-flex items-center gap-0.5"
            >
              {m.orderId}
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
