import { useMemo, useState } from "react";
import {
  Beef,
  MapPin,
  Clock,
  Watch,
  Radio,
  Activity,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  FilePlus2,
  MessageSquareWarning,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { markAlertHandled } from "@/lib/alert-store";

/**
 * PC「牛只信息」档案详情抽屉。
 * 字段与操作与小程序端 /m/animals-{id} 保持一致：
 * 基础信息（耳号/牧场/牛舍/品种/类别/月龄/泌乳天数/怀孕天数/胎次）、
 * 休药期、外接设备、近 7 日产奶趋势、诊断 / 用药 / 检测 / 转栏记录，
 * 操作：查看全部工单、异常反馈、记录（产犊 / 基础检查 / 转栏 / 离场）、疾病上报。
 */

export type CattleProfile = {
  ear: string;
  farm: string;
  barn: string;
  breed: string;
  sex: string;
  type: string;
  ageDays: number;
  health: "健康" | "观察中" | "异常" | "治疗中";
  withdrawalDays: number;
  withdrawalUntil: string;
  lactationDays: number;
  pregnancyDays: number;
  parity: number;
};

type Device = {
  kind: "collar" | "ear";
  id: string;
  name: string;
  status: "正常" | "异常" | "-";
};

const DEVICES: Device[] = [
  { kind: "collar", id: "D-COL-012", name: "颈环项圈 · Nedap", status: "正常" },
  { kind: "ear", id: "D-EAR-088", name: "耳温设备 · smaXtec", status: "异常" },
];

export function CattleProfileDrawer({
  open,
  onOpenChange,
  cow,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cow: CattleProfile | null;
}) {
  const [tab, setTab] = useState<"diagnoses" | "meds" | "tests" | "moves" | "events" | "orders">("diagnoses");
  const [observed, setObserved] = useState(false);

  if (!cow) return null;

  const health = observed ? "观察中" : cow.health;
  const abnormal = cow.health === "异常" || cow.health === "观察中" || observed;
  const ageLabel = cow.ageDays > 90 ? `${Math.floor(cow.ageDays / 30)} 月龄` : `${cow.ageDays} 日龄`;

  const healthCls =
    health === "异常"
      ? "bg-[#FFE4E1] text-[#D9534F]"
      : health === "观察中"
        ? "bg-[#FFF7E6] text-[#B8860B]"
        : health === "治疗中"
          ? "bg-[#FFE8CC] text-[#C9621F]"
          : "bg-[#E8F5E9] text-[#2E7D32]";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[920px] sm:max-w-[920px] p-0 flex flex-col gap-0 bg-[var(--bg-page,var(--background))]"
      >
        {/* 头部：Web 风格标题栏 —— 白底、左标题右操作 */}
        <header className="shrink-0 bg-card border-b border-border px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
                  <Beef className="h-[18px] w-[18px]" />
                </span>
                <h2 className="text-page-title text-foreground font-mono">#{cow.ear}</h2>
                <span className={`h-6 px-2 rounded-md inline-flex items-center gap-1 text-caption font-medium ${healthCls}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {health}
                </span>
                {abnormal && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 px-2 text-caption font-normal gap-1">
                        <MessageSquareWarning className="h-3.5 w-3.5" />
                        异常反馈
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36">
                      <DropdownMenuItem
                        onClick={() => {
                          setObserved(true);
                          markAlertHandled(cow.ear);
                          toast.success("已转为观察中，次日 00:00 自动解除");
                        }}
                      >
                        继续观察
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="mt-1.5 pl-[46px] inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                <span className="truncate">
                  {cow.farm} / {cow.barn}
                </span>
              </div>
            </div>


          </div>

          {/* 基础信息：规格表式栅格 */}
          <dl className="mt-4 grid grid-cols-4 rounded-lg border-t border-l border-border bg-card overflow-hidden">
            <Field label="品种" value={cow.breed} />
            <Field label="性别" value={cow.sex} />
            <Field label="类别" value={cow.type} />
            <Field label={cow.ageDays > 90 ? "月龄" : "日龄"} value={ageLabel} />
            <Field label="泌乳天数" value={`${cow.lactationDays} 天`} />
            <Field label="怀孕天数" value={cow.pregnancyDays > 0 ? `${cow.pregnancyDays} 天` : "—"} />
            <Field label="胎次" value={`${cow.parity} 胎`} />
            <Field
              label="休药期"
              value={cow.withdrawalDays > 0 ? `剩 ${cow.withdrawalDays} 天` : "无"}
              tone={cow.withdrawalDays > 0 ? "danger" : "default"}
            />
          </dl>

        </header>

        {/* 内容：左右分栏 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cow.withdrawalDays > 0 && (
            <div className="mb-4 rounded-lg border border-[#FFA39E] bg-[#FFF1F0] px-3 py-2 flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-[#CF1322]" />
              <span className="text-body-sm text-[#CF1322]">
                该牛只处于休药期，至 {cow.withdrawalUntil} 结束（剩 {cow.withdrawalDays} 天），期间产奶不可上市。
              </span>
            </div>
          )}

          <div className="grid grid-cols-[1fr_300px] gap-5 items-start">
            {/* 左：产奶数据 */}
            <div className="min-w-0">
              <Panel
                title="近 7 日产奶数据"
                icon={<Activity className="h-4 w-4 text-primary" />}
                extra={<span className="text-caption text-text-tertiary">单位：kg / 班次</span>}
              >
                <MilkChart />
              </Panel>
            </div>

            {/* 右：外接设备 */}
            <div className="space-y-5">
              <Panel title="外接设备" icon={<Watch className="h-4 w-4 text-primary" />}>
                <div className="space-y-2">
                  {DEVICES.map((d) => (
                    <div key={d.id} className="rounded-lg border border-border px-3 py-2.5 flex items-center gap-2.5">
                      <span
                        className={`h-8 w-8 rounded-md inline-flex items-center justify-center shrink-0 ${
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
                          d.status === "异常" ? "tag tag-danger" : d.status === "正常" ? "tag tag-success" : "text-body-sm text-text-tertiary"
                        }
                      >
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          {/* 历史记录：整宽贯穿 */}
          <div className="mt-5">
            <Panel
              title="历史记录"
              icon={<ListChecks className="h-4 w-4 text-primary" />}
              bodyClassName="pt-0"
            >
              <div className="flex items-center gap-6 border-b border-border -mx-4 px-4 overflow-x-auto">
                {[
                  { key: "diagnoses" as const, label: "诊断记录" },
                  { key: "meds" as const, label: "用药记录" },
                  { key: "tests" as const, label: "检测记录" },
                  { key: "moves" as const, label: "转栏记录" },
                  { key: "events" as const, label: "事件记录" },
                  { key: "orders" as const, label: "全部工单" },
                ].map((t) => {
                  const active = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`relative h-10 shrink-0 text-body-sm transition-colors ${
                        active ? "text-primary font-medium" : "text-text-secondary hover:text-foreground"
                      }`}
                    >
                      {t.label}
                      {active && <span className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4">
                {tab === "meds" ? (
                  <MedicationHistory />
                ) : tab === "diagnoses" ? (
                  <DiagnosisHistory />
                ) : tab === "tests" ? (
                  <TestHistory />
                ) : tab === "events" ? (
                  <EventHistory />
                ) : tab === "orders" ? (
                  <OrderHistory />
                ) : (
                  <MoveHistory />
                )}
              </div>
            </Panel>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" }) {
  return (
    <div className="min-w-0 flex items-baseline gap-2 border-r border-b border-border px-4 py-2.5">
      <dt className="text-caption text-text-tertiary shrink-0 w-[4.5em]">{label}</dt>
      <dd
        className={`text-body-sm truncate tabular-nums ${
          tone === "danger" ? "text-[#CF1322] font-medium" : "text-foreground font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}


function Panel({
  title,
  icon,
  extra,
  children,
  bodyClassName = "",
}: {
  title: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 h-11 border-b border-border">
        <h3 className="text-card-title text-foreground inline-flex items-center gap-1.5">
          {icon}
          {title}
        </h3>
        {extra}
      </div>
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}


/* ---------------- 产奶趋势 ---------------- */
function MilkChart() {
  const days = ["05-23", "05-24", "05-25", "05-26", "05-27", "05-28", "05-29"];
  const shiftMeta = ["早班", "中班", "晚班"];
  const raw = [
    [12.1, 10.8, 9.5],
    [12.4, 11.0, 9.7],
    [12.0, 10.5, 9.2],
    [12.5, 10.9, 9.6],
    [12.8, 11.2, 9.9],
    [12.3, 10.7, 9.4],
    [12.6, 11.1, 9.8],
  ];
  const totals = raw.map((d) => d.reduce((a, b) => a + b, 0));
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="text-text-tertiary text-caption">
            <th className="text-left font-normal py-2 pr-3">日期</th>
            {shiftMeta.map((s) => (
              <th key={s} className="text-right font-normal py-2 px-3">
                {s}
              </th>
            ))}
            <th className="text-right font-normal py-2 pl-3">日合计</th>
            <th className="text-right font-normal py-2 pl-3">较均值</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d, i) => {
            const diff = totals[i] - avg;
            return (
              <tr key={d} className="border-t border-border">
                <td className="py-2 pr-3 text-foreground">{d}</td>
                {raw[i].map((v, si) => (
                  <td key={si} className="py-2 px-3 text-right tabular-nums text-text-secondary">
                    {v.toFixed(1)}
                  </td>
                ))}
                <td className="py-2 pl-3 text-right tabular-nums font-medium text-foreground">
                  {totals[i].toFixed(1)}
                </td>
                <td
                  className={`py-2 pl-3 text-right tabular-nums ${
                    diff >= 0 ? "text-primary" : "text-[#CF1322]"
                  }`}
                >
                  {diff >= 0 ? "+" : ""}
                  {diff.toFixed(1)}
                </td>
              </tr>
            );
          })}
          <tr className="border-t border-border bg-muted/40">
            <td className="py-2 pr-3 text-text-secondary">7 日均值</td>
            {shiftMeta.map((_, si) => (
              <td key={si} className="py-2 px-3 text-right tabular-nums text-text-secondary">
                {(raw.reduce((a, d) => a + d[si], 0) / raw.length).toFixed(1)}
              </td>
            ))}
            <td className="py-2 pl-3 text-right tabular-nums font-medium text-foreground">{avg.toFixed(1)}</td>
            <td className="py-2 pl-3" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- 记录列表（与小程序一致的 mock） ---------------- */
type MedRecord = { id: string; date: string; drug: string; manufacturer: string; dose: string };
const ALL_MEDS: MedRecord[] = [
  { id: "M-0518-1", date: "2026-05-18", drug: "氟尼辛葡甲胺注射液", manufacturer: "齐鲁动保", dose: "2ml · 肌肉注射" },
  { id: "M-0518-2", date: "2026-05-18", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g · 肌肉注射" },
  { id: "M-0519-1", date: "2026-05-19", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g · 肌肉注射" },
  { id: "M-0520-1", date: "2026-05-20", drug: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g · 肌肉注射" },
  { id: "M-0510-1", date: "2026-05-10", drug: "维生素 B 复合注射液", manufacturer: "上海同仁", dose: "10ml · 肌肉注射" },
  { id: "M-0421", date: "2026-04-21", drug: "伊维菌素注射液", manufacturer: "中牧股份", dose: "1ml / 50kg · 皮下注射" },
  { id: "M-0315", date: "2026-03-15", drug: "青霉素 G 钾", manufacturer: "华北制药", dose: "400 万 IU · 肌肉注射" },
  { id: "M-0118", date: "2026-01-18", drug: "口蹄疫疫苗", manufacturer: "中农威特", dose: "2ml · 颈部皮下" },
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

  return (
    <div>
      <div className="text-caption text-text-tertiary mb-2">
        {expanded ? `全部 ${totalCount} 条` : `近 20 天 ${recentCount} 条`}
      </div>
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
      {totalCount > recentCount && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="h-8 px-4 rounded-full bg-primary/8 text-primary text-caption font-medium inline-flex items-center gap-1"
          >
            {expanded ? "收起" : `展开全部 ${totalCount} 条`}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
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
  const tone = (c: TestRecord["conclusion"]) =>
    c === "阳性" || c === "不合格" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600";
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
              <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-caption ${tone(t.conclusion)}`}>{t.conclusion}</span>
            </div>
            <div className="mt-1 text-caption text-text-tertiary">提交人 {t.submitter}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type MoveRecord = { id: string; date: string; from: string; to: string; orderId: string | null; reason: string; operator: string };
const ALL_MOVES: MoveRecord[] = [
  { id: "MV-0518", date: "2026-05-18", from: "1 号牛舍", to: "3 号牛舍", orderId: "WO-2026-0518", reason: "疾病治疗", operator: "李雨晴" },
  { id: "MV-0410", date: "2026-04-10", from: "隔离舍", to: "1 号牛舍", orderId: "WO-2026-0405", reason: "治愈", operator: "李雨晴" },
  { id: "MV-0320", date: "2026-03-20", from: "1 号牛舍", to: "隔离舍", orderId: "WO-2026-0318", reason: "继续观察", operator: "李雨晴" },
  { id: "MV-0301", date: "2026-03-01", from: "犊牛舍", to: "1 号牛舍", orderId: null, reason: "调群", operator: "王场长" },
  { id: "MV-0101", date: "2026-01-10", from: "产房", to: "犊牛舍", orderId: null, reason: "断奶分群", operator: "周凯" },
];

function MoveHistory() {
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
              <span>原因</span>
              <span className="text-foreground">{m.reason}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span>工单</span>
              <span className="font-mono text-primary">{m.orderId ?? "-"}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const ALL_EVENTS: {
  id: string;
  date: string;
  type: "产犊记录" | "基础检查" | "转栏/转群" | "离场记录";
  summary: string;
  operator: string;
  orderId?: string;
}[] = [
  { id: "EV-1041", date: "2026-08-08 09:20", type: "基础检查", summary: "体温 38.6℃ · 瘤胃蠕动正常 · 无异常", operator: "王兽医" },
  { id: "EV-1032", date: "2026-07-30 06:10", type: "产犊记录", summary: "顺产母犊 1 头 · 初乳采集 5.2L（优质）", operator: "李技术员", orderId: "WO-20260730-018" },
  { id: "EV-1019", date: "2026-07-12 15:40", type: "转栏/转群", summary: "A 区 3 舍 → B 区 1 舍 · 原因：产后转群", operator: "张场长", orderId: "WO-20260712-006" },
  { id: "EV-0998", date: "2026-06-21 10:05", type: "基础检查", summary: "蹄部检查 · 左后蹄轻度磨损，建议观察", operator: "王兽医" },
];

function EventHistory() {
  return (
    <div className="space-y-2">
      <div className="text-caption text-text-tertiary mb-1">共 {ALL_EVENTS.length} 条</div>
      {ALL_EVENTS.map((e) => (
        <div key={e.id} className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="tag tag-brand">{e.type}</span>
            <span className="font-mono text-caption text-text-secondary">{e.date}</span>
            <span className="text-caption text-text-tertiary">· {e.operator}</span>
          </div>
          <div className="text-body-sm text-foreground">{e.summary}</div>
          <div className="text-caption text-text-tertiary mt-1 flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span>编号</span>
              <span className="font-mono text-foreground">{e.id}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span>工单</span>
              <span className="font-mono text-primary">{e.orderId ?? "-"}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
