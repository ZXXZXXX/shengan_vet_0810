import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Beef,
  ClipboardPlus,
  ChevronDown,
  Clock,
  MapPin,
  ArrowRight,
  ArrowRightLeft,
  ChevronRight,
  X,
  Activity,
  Radio,
  Watch,
  AlertTriangle,
  FilePlus2,
  Baby,
  LogOut,
  ListChecks,
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

type Device = {
  kind: "collar" | "ear";
  id: string;
  name: string;
  status: "正常" | "异常" | "离线";
  alertText?: string;
};

function AnimalDetailPage() {
  const { id } = useParams({ from: "/m/animals-{$id}" });
  const navigate = useNavigate();

  const a = {
    id,
    farm: "1 号牧场",
    barn: "3 号牛舍",
    
    breed: "荷斯坦",
    sex: "母",
    type: "哺乳牛",
    ageDays: 1218,
    health: "健康" as "健康" | "观察中" | "异常" | "治疗中",
    withdrawalDays: 3,
    withdrawalUntil: "2026-05-28",
    lactationDays: 168,
    pregnancyDays: 92,
    parity: 3,
  };

  const devices: Device[] = [
    { kind: "collar", id: "D-COL-012", name: "颈环项圈 · Nedap", status: "正常" },
    { kind: "ear", id: "D-EAR-088", name: "耳温设备 · smaXtec", status: "异常", alertText: "耳部温度偏高 39.8℃" },
  ];


  // 外接设备异常 → 牛只状态为"异常"
  if (devices.some((d) => d.status === "异常")) {
    a.health = "异常";
  }

  // 记录 sheet
  const [recordOpen, setRecordOpen] = useState(false);

  // 转栏
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferEnabled, setTransferEnabled] = useState(true);
  const [transferTo, setTransferTo] = useState("");
  const [transferPickerOpen, setTransferPickerOpen] = useState(false);
  const [transferReasons, setTransferReasons] = useState<string[]>([]);
  const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);

  const handleTransferSubmit = () => {
    if (!transferTo) return toast.error("请选择转入栏舍");
    if (transferReasons.length === 0) return toast.error("请选择或输入转栏原因");
    setTransferConfirmOpen(true);
  };
  const handleTransferConfirm = () => {
    setTransferConfirmOpen(false);
    setTransferOpen(false);
    toast.success(`已转至 ${transferTo}`);
    setTransferTo("");
    setTransferReasons([]);
  };

  const [tab, setTab] = useState<"diagnoses" | "meds" | "moves" | "tests">("diagnoses");

  const ageLabel = a.ageDays > 90 ? `${Math.floor(a.ageDays / 30)} 月龄` : `${a.ageDays} 日龄`;

  return (
    <MobileShell title="" back hideTabBar headerTone="brand">
      <div className="pb-28">
        {/* 头部 */}
        <div className="-mt-px">
          <div className="rounded-b-3xl bg-gradient-to-b from-primary to-[#00823F] px-5 pt-5 pb-5 text-primary-foreground relative overflow-hidden shadow-lg shadow-primary/20">
            <Beef className="absolute -right-6 -bottom-6 h-36 w-36 opacity-[0.08]" strokeWidth={1} />

            {/* 标题行 */}
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[26px] font-mono font-semibold leading-none tracking-tight">
                  #{a.id}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-caption opacity-90">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{a.farm} · {a.barn}</span>
                </div>
              </div>
              <span
                className={`shrink-0 h-6 px-2 rounded-full inline-flex items-center gap-1 text-[11px] font-semibold ${
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

            {/* 基础信息 */}
            <div className="relative mt-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 divide-y divide-white/10">
              <div className="grid grid-cols-3 divide-x divide-white/10">
                <HeaderInfo label="品种" value={a.breed} />
                <HeaderInfo label="类别" value={a.type} />
                <HeaderInfo label={a.ageDays > 90 ? "月龄" : "日龄"} value={ageLabel} />
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10">
                <HeaderInfo label="泌乳天数" value={`${a.lactationDays} 天`} />
                <HeaderInfo label="怀孕天数" value={a.pregnancyDays > 0 ? `${a.pregnancyDays} 天` : "—"} />
                <HeaderInfo label="胎次" value={`${a.parity} 胎`} />
              </div>
            </div>

            {/* 全部工单 */}
            <Link
              to="/m/animals-orders/$id"
              params={{ id: a.id }}
              className="relative mt-3 flex items-center justify-center gap-1 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-body-sm font-medium text-primary-foreground active:bg-white/25"
            >
              查看全部工单
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>





        {/* 休药期 */}
        {a.withdrawalDays > 0 && (
          <section className="px-4 mt-3">
            <div className="bg-[#FFF1F0] border border-[#FFA39E] rounded-lg px-3 py-2 inline-flex items-center justify-between w-full">
              <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-[#CF1322] min-w-0">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">休药期至 {a.withdrawalUntil}</span>
              </span>
              <span className="ml-2 shrink-0 bg-[#FF4D4F] text-white text-caption px-1.5 py-0.5 rounded-full font-bold">
                剩 {a.withdrawalDays} 天
              </span>
            </div>
          </section>
        )}



        {/* 外接设备 */}
        <section className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground inline-flex items-center gap-1.5">
              <Watch className="h-4 w-4 text-primary" />
              外接设备
            </h3>
            {devices.length > 0 && (
              <Link
                to="/m/animals-device/$id"
                params={{ id: a.id }}
                className="text-caption text-primary inline-flex items-center gap-0.5 active:opacity-70"
              >
                查看全部
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {devices.length === 0 ? (
            <div className="rounded-xl bg-card border border-dashed border-border p-5 text-center text-caption text-text-tertiary">
              暂无外接设备
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((d) => (
                <Link
                  key={d.id}
                  to="/m/animals-device/$id"
                  params={{ id: a.id }}
                  search={{ kind: d.kind }}
                  className="block rounded-xl bg-card border border-border p-3 active:bg-surface-subtle"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-9 w-9 rounded-lg inline-flex items-center justify-center shrink-0 ${
                        d.status === "异常" ? "bg-[#FFF1F0] text-[#CF1322]" : "bg-brand-subtle text-primary"
                      }`}
                    >
                      <Radio className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-body-sm text-foreground truncate">{d.name}</div>
                      <div className="text-caption text-text-tertiary font-mono">{d.id}</div>
                    </div>
                    <span
                      className={
                        d.status === "异常"
                          ? "tag tag-danger"
                          : d.status === "离线"
                          ? "tag tag-warning"
                          : "tag tag-success"
                      }
                    >
                      {d.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}

        </section>

        {/* 近7日产奶数据 */}
        <section className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground inline-flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-primary" />
              产奶数据
            </h3>
            <span className="text-caption text-text-tertiary">最近7天</span>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4">
            <MilkChart />
          </div>
        </section>


        {/* Tabs */}
        <section className="px-4 mt-5">
          <div className="flex items-center gap-6 border-b border-border">
            {[
              { key: "diagnoses" as const, label: "诊断记录" },
              { key: "meds" as const, label: "用药记录" },
              { key: "tests" as const, label: "检测记录" },
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
            {tab === "meds" ? <MedicationHistory /> : tab === "diagnoses" ? <DiagnosisHistory /> : tab === "tests" ? <TestHistory /> : <MoveHistory />}
          </div>
        </section>
      </div>

      {/* 底部：记录 + 疾病上报 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card/85 backdrop-blur-lg border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRecordOpen(true)}
            className="h-12 px-4 rounded-2xl bg-brand-subtle text-primary text-body font-semibold inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <FilePlus2 className="h-4 w-4" /> 记录
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

      {/* 记录选择 Sheet */}
      {recordOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => setRecordOpen(false)}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+16px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 h-12 flex items-center justify-between border-b border-border">
              <div className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                <FilePlus2 className="h-4 w-4 text-primary" />
                记录事件
              </div>
              <button
                type="button"
                onClick={() => setRecordOpen(false)}
                className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 space-y-2">
              <RecordOption
                icon={<Baby className="h-5 w-5" />}
                title="产犊"
                desc="记录本次分娩情况：犊牛、难产、产后处置"
                onClick={() => {
                  setRecordOpen(false);
                  navigate({ to: "/m/events/$type/$id", params: { type: "calving", id: a.id } });
                }}
              />
              <RecordOption
                icon={<ArrowRightLeft className="h-5 w-5" />}
                title="转栏"
                desc="调整所在牛舍 / 栏位"
                onClick={() => {
                  setRecordOpen(false);
                  setTransferEnabled(true);
                  setTransferTo("");
                  setTransferOpen(true);
                }}
              />
              <RecordOption
                icon={<LogOut className="h-5 w-5" />}
                title="离场"
                desc="淘汰、死亡、出售等离场事件"
                onClick={() => {
                  setRecordOpen(false);
                  navigate({ to: "/m/events/$type/$id", params: { type: "leave", id: a.id } });
                }}
              />
            </div>
          </div>
        </div>
      )}

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
                <div className="flex-1 min-w-0 rounded-xl border border-primary/40 bg-brand-subtle px-3 py-2.5">
                  <div className="flex items-center gap-1 text-caption text-primary mb-1">
                    <MapPin className="h-3 w-3" />
                    当前位置
                  </div>
                  <div className="text-body-sm text-foreground font-medium truncate">
                    {a.barn}
                  </div>
                </div>
                <div className={`shrink-0 flex items-center justify-center w-7 ${transferTo ? "text-primary" : "text-text-tertiary"}`}>
                  <ArrowRight className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setTransferPickerOpen(true)}
                  className={`flex-1 min-w-0 rounded-xl bg-card px-3 py-2.5 text-left transition-colors ${
                    transferTo ? "border border-primary" : "border border-dashed border-border active:border-primary/60"
                  }`}
                >
                  <div className={`flex items-center justify-between gap-1 text-caption mb-1 ${transferTo ? "text-primary" : "text-text-tertiary"}`}>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      转入位置
                    </span>
                    <span className="text-caption text-text-tertiary">{transferTo ? "更换" : "选择"}</span>
                  </div>
                  <div className={`text-body-sm truncate ${transferTo ? "text-foreground font-medium" : "text-text-tertiary"}`}>
                    {transferTo || "点击选择牛舍"}
                  </div>
                </button>
              </div>
              <TransferBarnControl
                enabled={transferEnabled}
                onEnabledChange={setTransferEnabled}
                value={transferTo}
                onValueChange={setTransferTo}
                exclude={[a.barn]}
                label="转入栏舍"
                hideToggle
                triggerless
                open={transferPickerOpen}
                onOpenChange={setTransferPickerOpen}
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
                  placeholder="输入关键词搜索,未命中可直接新建"
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] leading-tight text-text-tertiary">{label}</div>
      <div className="text-body-sm text-foreground truncate mt-0.5">{value}</div>
    </div>
  );
}

function HeaderInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <div className="text-[11px] leading-none opacity-75">{label}</div>
      <div className="text-body-sm font-semibold truncate mt-1.5">{value}</div>
    </div>
  );
}


function RecordOption({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 w-full rounded-xl p-3 active:bg-surface-subtle text-left"
    >
      <span className="h-10 w-10 rounded-xl bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-body-sm font-medium text-foreground">{title}</div>
        <div className="text-caption text-text-tertiary truncate">{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
    </button>
  );
}

/* 产奶趋势图 */
function MilkChart() {
  // 7 天 * 3 班次，每个班次一条线
  const days = ["05-23", "05-24", "05-25", "05-26", "05-27", "05-28", "05-29"];
  const shiftMeta = [
    { name: "早班", color: "var(--primary)" },
    { name: "中班", color: "#FFB020" },
    { name: "晚班", color: "#5B8FF9" },
  ];
  const raw = [
    [12.1, 10.8, 9.5],
    [12.4, 11.0, 9.7],
    [12.0, 10.5, 9.2],
    [12.5, 10.9, 9.6],
    [12.8, 11.2, 9.9],
    [12.3, 10.7, 9.4],
    [12.6, 11.1, 9.8],
  ];
  // 按班次分组
  const series = shiftMeta.map((_, si) => raw.map((day) => day[si]));

  const W = 320;
  const H = 140;
  const PAD_L = 24;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 22;
  const all = raw.flat();
  const min = Math.floor(Math.min(...all) - 1);
  const max = Math.ceil(Math.max(...all) + 1);
  const xStep = (W - PAD_L - PAD_R) / (days.length - 1);
  const yFor = (v: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - (v - min) / (max - min));
  const xFor = (i: number) => PAD_L + i * xStep;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px]">
        {/* Y grid */}
        {[0, 0.5, 1].map((t) => {
          const y = PAD_T + (H - PAD_T - PAD_B) * t;
          const v = (max - (max - min) * t).toFixed(0);
          return (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="var(--border)" strokeDasharray="2 3" />
              <text x={0} y={y + 3} fontSize="9" fill="var(--text-tertiary)">{v}</text>
            </g>
          );
        })}
        {/* 三条班次折线 */}
        {series.map((vals, si) => {
          const d = vals.map((v, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(v)}`).join(" ");
          return (
            <g key={si}>
              <path d={d} fill="none" stroke={shiftMeta[si].color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
              {vals.map((v, i) => (
                <circle key={i} cx={xFor(i)} cy={yFor(v)} r="2.2" fill={shiftMeta[si].color} />
              ))}
            </g>
          );
        })}
        {/* X labels */}
        {days.map((d, di) => (
          <text
            key={d}
            x={xFor(di)}
            y={H - 6}
            fontSize="9"
            fill="var(--text-tertiary)"
            textAnchor="middle"
          >
            {d.slice(3)}
          </text>
        ))}
      </svg>
      <div className="flex items-center justify-center gap-4 mt-1">
        {shiftMeta.map((s) => (
          <div key={s.name} className="inline-flex items-center gap-1 text-caption text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
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
  { id: "M-0518-1", date: "2026-05-18", drug: "氟尼辛葡甲胺注射液", manufacturer: "齐鲁动保", dose: "2ml · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0518" },
  { id: "M-0518-2", date: "2026-05-18", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0518" },
  { id: "M-0519-1", date: "2026-05-19", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0518" },
  { id: "M-0520-1", date: "2026-05-20", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g · 肌肉注射", operator: "李雨晴", orderId: "WO-2026-0518" },
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
    cutoff.setDate(cutoff.getDate() - 20);
    const sorted = [...ALL_MEDS].sort((a, b) => (a.date < b.date ? 1 : -1));
    const recent = sorted.filter((m) => new Date(m.date) >= cutoff);
    return { visible: expanded ? sorted : recent, recentCount: recent.length, totalCount: sorted.length };
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
          {expanded ? `全部 ${totalCount} 条` : `近 20 天 ${recentCount} 条`}
        </span>
      </div>
      {groups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center text-caption text-text-tertiary">
          近 20 天无用药记录
        </div>
      ) : (
        <div className="relative pl-4">
          <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border" />
          <div className="space-y-4">
            {groups.map(([date, items]) => (
              <div key={date} className="relative">
                <span className="absolute -left-4 top-1.5 h-[7px] w-[7px] rounded-full bg-primary ring-2 ring-background" />
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-caption text-text-secondary">{date}</span>
                  <span className="text-caption text-text-tertiary">· {items.length} 条</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((m) => (
                    <div key={m.id} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                      <div className="text-body-sm text-foreground truncate">{m.drug}</div>
                      <div className="text-caption text-text-tertiary truncate text-center">{m.manufacturer}</div>
                      <div className="text-caption text-text-secondary truncate text-right">{m.dose}</div>
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
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
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
  orderId: string | null;
  reason: string;
  operator: string;
};

const ALL_MOVES: MoveRecord[] = [
  { id: "MV-0518", date: "2026-05-18", from: "1 号牛舍", to: "3 号牛舍", orderId: "WO-2026-0518", reason: "疾病治疗", operator: "李雨晴" },
  { id: "MV-0410", date: "2026-04-10", from: "隔离舍", to: "1 号牛舍", orderId: "WO-2026-0405", reason: "治愈", operator: "李雨晴" },
  { id: "MV-0320", date: "2026-03-20", from: "1 号牛舍", to: "隔离舍", orderId: "WO-2026-0318", reason: "继续观察", operator: "李雨晴" },
  { id: "MV-0301", date: "2026-03-01", from: "犊牛舍", to: "1 号牛舍", orderId: null, reason: "调群", operator: "王场长" },
  { id: "MV-0101", date: "2026-01-10", from: "产房", to: "犊牛舍", orderId: null, reason: "断奶分群", operator: "周凯" },
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
        <div key={m.id} className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-caption text-text-secondary">{m.date}</span>
            <span className="text-caption text-text-tertiary">· 操作人 {m.operator}</span>
          </div>
          <div className="flex items-center gap-2 text-body-sm text-foreground">
            <span className="flex-1 min-w-0 truncate">{m.from}</span>
            <ArrowRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
            <span className="flex-1 min-w-0 truncate text-right">{m.to}</span>
          </div>
          <div className="text-caption text-text-tertiary mt-1 flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="text-text-tertiary">原因</span>
              <span className="text-foreground">{m.reason}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="text-text-tertiary">工单</span>
              {m.orderId ? (
                <Link
                  to="/m/health/$id"
                  params={{ id: m.orderId }}
                  className="font-mono text-primary inline-flex items-center gap-0.5"
                >
                  {m.orderId}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="font-mono text-text-tertiary">-</span>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

type DiagnosisRecord = { id: string; date: string; disease: string; doctor: string };
const ALL_DIAGNOSES: DiagnosisRecord[] = [
  { id: "DX-0518", date: "2026-05-18", disease: "急性乳房炎", doctor: "李雨晴" },
  { id: "DX-0405", date: "2026-04-05", disease: "蹄叶炎", doctor: "李雨晴" },
  { id: "DX-0312", date: "2026-03-12", disease: "瘤胃酸中毒", doctor: "周凯" },
  { id: "DX-0125", date: "2026-01-25", disease: "产后子宫炎", doctor: "王场长" },
];

function DiagnosisHistory() {
  if (ALL_DIAGNOSES.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-caption text-text-tertiary">
        暂无诊断记录
      </div>
    );
  }
  return (
    <div>
      <div className="text-caption text-text-tertiary mb-1">共 {ALL_DIAGNOSES.length} 条</div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {ALL_DIAGNOSES.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="shrink-0 font-mono text-caption text-text-secondary">{d.date}</span>
              <span className="truncate text-body-sm text-foreground">{d.disease}</span>
            </div>
            <span className="shrink-0 text-caption text-text-secondary">{d.doctor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type TestRecord = { id: string; date: string; item: string; conclusion: "阴性" | "阳性" | "合格" | "不合格"; submitter: string };
const ALL_TESTS: TestRecord[] = [
  { id: "T-0620", date: "2026-06-20", item: "生鲜乳体细胞检测", conclusion: "合格", submitter: "李雨晴" },
  { id: "T-0605", date: "2026-06-05", item: "布病抗体筛查", conclusion: "阴性", submitter: "周凯" },
  { id: "T-0512", date: "2026-05-12", item: "结核病检测", conclusion: "阴性", submitter: "王场长" },
  { id: "T-0418", date: "2026-04-18", item: "乳房炎病原培养", conclusion: "阳性", submitter: "李雨晴" },
];

function TestHistory() {
  if (ALL_TESTS.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-caption text-text-tertiary">
        暂无检测记录
      </div>
    );
  }
  const tone = (c: TestRecord["conclusion"]) =>
    c === "阳性" || c === "不合格"
      ? "bg-red-50 text-red-600"
      : "bg-emerald-50 text-emerald-600";
  return (
    <div>
      <div className="text-caption text-text-tertiary mb-1">共 {ALL_TESTS.length} 条</div>
      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {ALL_TESTS.map((t) => (
          <div key={t.id} className="px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="shrink-0 font-mono text-caption text-text-secondary">{t.date}</span>
                <span className="truncate text-body-sm text-foreground">{t.item}</span>
              </div>
              <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-caption ${tone(t.conclusion)}`}>
                {t.conclusion}
              </span>
            </div>
            <div className="mt-1 text-caption text-text-tertiary">提交人 {t.submitter}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
