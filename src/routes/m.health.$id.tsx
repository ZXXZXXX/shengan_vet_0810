import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Camera,
  
  Mic,
  Video,
  FileText,
  PackagePlus,
  ChevronRight,
  Stethoscope,
  CheckSquare,
  Square,
  MapPin,
  Warehouse,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole, canVisit, canExecute } from "@/lib/mobile-role";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/m/health/$id")({
  head: () => ({ meta: [{ title: "工单详情 · 奇点智牧" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as "report" | "review" | "execute" | undefined) ?? undefined,
  }),
  component: TaskDetailPage,
});

type StatusKey = "待诊断" | "进行中" | "已完成" | "已终止";

const statusMap: Record<StatusKey, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待诊断: { tag: "tag tag-warning", icon: ClipboardList, color: "text-[#8A5A0A]" },
  进行中: { tag: "tag tag-success", icon: PlayCircle, color: "text-[#2F7A3A]" },
  已完成: { tag: "tag tag-muted", icon: CheckCircle2, color: "text-text-secondary" },
  已终止: { tag: "tag tag-muted", icon: AlertTriangle, color: "text-text-secondary" },
};

function cleanName(n: string) {
  return n.replace(/^(内部|外部)·/, "");
}

// 按工单号映射状态，确保每种状态都有详情页可看
const statusById: Record<string, StatusKey> = {
  "WO-2381": "待诊断",
  "WO-2298": "进行中",
  "WO-2401": "进行中",
  "WO-2324": "已终止",
  "HF-0702": "进行中",
  "HF-0688": "已完成",
  "LS-1029": "待诊断",
  "LS-1011": "已完成",
  "YM-2042": "已终止",
};

function TaskDetailPage() {
  const { id } = useParams({ from: "/m/health/$id" });
  const role = useRole();

  const search = Route.useSearch();
  // 根据工单状态判断默认 tab：有诊断记录优先展示诊断记录，否则展示上报记录
  const hasDiagnosis = (statusById[id] ??
    (role === "hoof_trimmer" || role === "vet_assistant" ? "进行中" : "待诊断")) !== "待诊断";
  const defaultTab: "report" | "review" | "execute" = hasDiagnosis ? "review" : "report";
  const [tab, setTab] = useState<"report" | "review" | "execute">(search.tab ?? defaultTab);
  

  

  // mock data
  const isLoss = id.startsWith("LS");
  const isHoof = !isLoss && (role === "hoof_trimmer" || id.startsWith("HF"));
  const kind = isLoss ? "损耗" : isHoof ? "修蹄" : "健康";

  // 单对象工单（仅一只牛）：WO-2298、HF-* 等
  const singleEarMap: Record<string, string> = {
    "WO-2298": "#A2298",
    "HF-0702": "#A2150",
    "HF-0688": "#A2270",
  };
  const singleEar = singleEarMap[id];
  const isSingle = isHoof || Boolean(singleEar);
  const earTag = singleEar ?? (isHoof ? "#A2150" : "#A2381");
  const execTags: string[] = isSingle ? [earTag] : ["#A2381", "#A2382", "#A2383"];

  const fallbackStatus: StatusKey =
    role === "hoof_trimmer" || role === "vet_assistant" ? "进行中" : "待诊断";
  const o = {
    id,
    farm: "奇点示范牧场",
    barn: isLoss ? "2 号牛舍" : isHoof ? "2 号牛舍" : "3 号牛舍",
    target: isLoss ? "口蹄疫疫苗 A 型" : isSingle ? earTag : "3 只",
    type: isLoss ? "物资损耗" : isHoof ? "修蹄" : "疾病治疗",
    status: (statusById[id] ?? fallbackStatus) as StatusKey,
    who: isLoss ? "李雨晴" : isHoof ? "张师傅" : "李雨晴",
    plannedAt: "今日 13:00",
    needPickup: !isLoss,
    pickupCode: isLoss ? null : `PK-${id.replace(/^WO-?/i, "")}`,
    flow: "陈晓东 上报 → 王医生 诊断 → 李雨晴 执行",
  };
  const s = statusMap[o.status];
  const Icon = s.icon;






  return (
    <MobileShell title="工单详情" back hideTabBar>
      <div className="pb-28">
        {/* === 1. 顶部工单摘要 === */}
        <div className="px-4 pt-3 pb-3 bg-card border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${s.color}`} />
              <span className="font-mono text-body text-foreground">{o.id}</span>
              <span className="tag tag-muted">{o.type}</span>
            </div>
            <span className={s.tag}>{o.status}</span>
          </div>
          <div className="flex items-center gap-1.5 text-caption">
            <Stethoscope className="h-3.5 w-3.5 text-text-tertiary" />
            <span className="text-text-tertiary">执行对象</span>
            <span className="text-body-sm text-foreground">{isSingle ? earTag : `${execTags.length} 只`}</span>
          </div>
          <div className="flex items-center gap-3 text-caption text-text-tertiary">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{o.farm}</span>
            </span>
            <span className="flex items-center gap-1">
              <Warehouse className="h-3.5 w-3.5" />
              <span>{o.barn}</span>
            </span>
          </div>
        </div>

        {/* === 2. Tab === */}
        <div className="sticky top-0 z-10 bg-bg border-b border-border">
          <div className="px-4 flex gap-1">
            {[
              { key: "report", label: "上报记录" },
              { key: "review", label: "诊断记录" },
              { key: "execute", label: "执行记录" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`relative h-11 px-3 text-body-sm ${
                  tab === t.key ? "text-foreground font-medium" : "text-text-tertiary"
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <span className="absolute left-3 right-3 bottom-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3 space-y-3">
          {tab === "report" && <ReportTab isLoss={isLoss} />}
          {tab === "review" && <ReviewTab isLoss={isLoss} status={o.status} />}
          {tab === "execute" && <ExecuteSummary status={o.status} pickupCode={o.pickupCode} tags={execTags} />}
        </div>
      </div>

      {/* === 3. 底部操作区 === */}
      {(() => {
        const isResponder = canVisit(role) || canExecute(role);
        const showRespond = isResponder && o.status === "待诊断";
        const showExec = canExecute(role) && o.status === "进行中";
        if (!showRespond && !showExec) return null;
        return (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            {showRespond ? (
              <Link
                to="/m/health/$id/diagnose"
                params={{ id: o.id }}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
              >
                <Stethoscope className="h-4 w-4" />
                开始诊断
              </Link>
            ) : (
              <Link
                to="/m/health/$id/execute"
                params={{ id: o.id }}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
              >
                <PlayCircle className="h-4 w-4" />
                开始执行

              </Link>

            )}
          </div>
        );
      })()}

    </MobileShell>
  );
}

function Section({ title, children, extra }: { title: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-caption text-text-tertiary">{title}</div>
        {extra}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-body-sm text-text-tertiary shrink-0">{label}</span>
      <div className="text-body-sm text-foreground text-right min-w-0">{value}</div>
    </div>
  );
}

function PersonChip({ name }: { name: string }) {
  const n = cleanName(name);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] inline-flex items-center justify-center">
        {n.charAt(0)}
      </span>
      <span className="text-body-sm text-foreground">{n}</span>
    </span>
  );
}

// === 上报记录 ===
function ReportTab({ isLoss }: { isLoss: boolean }) {
  return (
    <>
      <Section title="上报基础信息">
        <Field label="上报人" value={<PersonChip name="陈晓东" />} />
        <Field label="上报时间" value="2026-05-20 09:08" />
        <Field label="原始工单类型" value={<span className="tag tag-muted">{isLoss ? "物资损耗" : "疾病治疗"}</span>} />
        <Field
          label="原始标签"
          value={
            <div className="flex flex-wrap gap-1 justify-end">
              {(isLoss ? ["冷链异常", "疫苗"] : ["高烧", "食欲下降", "反刍减少"]).map((t) => (
                <span key={t} className="tag tag-brand">
                  {t}
                </span>
              ))}
            </div>
          }
        />
      </Section>

      <Section title="具体描述">
        <p className="text-body-sm text-text-secondary leading-relaxed">
          {isLoss
            ? "冷链监测发现 #2 冷柜断电 4 小时，该批疫苗已失效，需作损耗登记并补充申请。"
            : "饲养员巡检发现该牛持续高烧 2 小时(39.6℃)，同时表现出食欲下降、反刍减少。建议立即抗生素治疗并进入隔离观察。"}
        </p>
      </Section>

      <Section title="证据材料">
        <div>
          <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
            <Camera className="h-3 w-3" /> 照片 · 2 张
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border"
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
            <Video className="h-3 w-3" /> 视频 · 1 段
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border inline-flex items-center justify-center">
              <PlayCircle className="h-6 w-6 text-text-tertiary" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-surface-subtle border border-border">
          <Mic className="h-4 w-4 text-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full w-2/3 bg-primary/60" />
          </div>
          <span className="font-mono text-caption text-text-secondary">00:28</span>
        </div>
      </Section>

      {!isLoss && (
        <Section title="上报疑似疾病">
          <div className="flex flex-wrap gap-1">
            <span className="tag tag-warning">疑似 呼吸道感染</span>
            <span className="tag tag-muted">符合症状 2项</span>
          </div>
        </Section>
      )}

      <Section title="系统推荐 · 治疗方案">
        <p className="text-body-sm text-text-secondary leading-relaxed">
          {isLoss
            ? "建议：登记损耗 8 支 → 触发库存补申请（口蹄疫疫苗 A 型 × 8 支）。"
            : "建议方案：氟尼辛葡甲胺 2ml IM × 3 天 + 头孢噻呋钠 1g IM × 3 天，隔离观察并每日测温。"}
        </p>
      </Section>
    </>
  );
}

// === 诊断记录 ===
function ReviewTab({ isLoss, status }: { isLoss: boolean; status: StatusKey }) {
  if (status === "待诊断") {
    return (
      <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
        <ClipboardList className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
        <div className="text-body-sm text-text-tertiary">尚未诊断</div>
      </div>
    );
  }
  return (
    <>
      <Section title="诊断基础信息">
        <Field label="诊断人" value={<PersonChip name="王医生" />} />
        <Field label="诊断时间" value="2026-05-20 10:15" />
        <Field
          label="诊断结果"
          value={
            status === "已终止" ? (
              <span className="tag tag-muted">已终止</span>
            ) : (
              <span className="tag tag-success">通过</span>
            )
          }
        />
      </Section>

      <>

          <Section title="确认信息">
            <Field label="工单类型" value={<span className="tag tag-muted">{isLoss ? "物资损耗" : "疾病治疗"}</span>} />
            <Field
              label="确认标签"
              value={
                <div className="flex flex-wrap gap-1 justify-end">
                  {(isLoss ? ["冷链异常"] : ["呼吸道感染", "需隔离"]).map((t) => (
                    <span key={t} className="tag tag-brand">
                      {t}
                    </span>
                  ))}
                </div>
              }
            />
            <Field label="诊断结论" value={isLoss ? "疫苗失效，作损耗处理" : "支气管肺炎（早期）"} />
          </Section>

          <Section title="具体描述">
            <p className="text-body-sm text-text-secondary leading-relaxed">
              结合症状与现场视频，判定为支气管肺炎早期，采用标准 3 日方案治疗，隔离至症状消退后 48 小时。
            </p>
          </Section>

          <Section title="治疗方案 / 执行方案">
            <ul className="divide-y divide-border -mx-1">
              {[
                { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", use: "肌肉注射", dose: "2ml / 次", days: "3 天" },
                { name: "头孢噻呋钠", spec: "1g / 支", use: "肌肉注射", dose: "1g / 次", days: "3 天" },
              ].map((m) => (
                <li key={m.name} className="px-1 py-2">
                  <div className="flex items-center justify-between">
                    <div className="text-body-sm text-foreground">{m.name}</div>
                    <span className="text-caption text-text-tertiary">{m.days}</span>
                  </div>
                  <div className="text-caption text-text-tertiary mt-0.5">
                    {m.spec} · {m.use} · {m.dose}
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="物资 / 药品需求">
            <ul className="divide-y divide-border -mx-1">
              {[
                { name: "一次性注射器", qty: "8 支" },
                { name: "消毒酒精棉", qty: "1 盒" },
              ].map((m) => (
                <li key={m.name} className="px-1 py-2 flex items-center justify-between">
                  <span className="text-body-sm text-foreground">{m.name}</span>
                  <span className="font-mono text-body-sm text-text-secondary">× {m.qty}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="执行安排">
            <Field label="计划开始时间" value="今日 13:00 起，共 3 天" />
            <Field label="指定执行人" value={<PersonChip name="李雨晴" />} />
            <Field label="复查 / 验收" value="第 4 天复测体温与采食情况" />
            <Field label="备注" value="如出现严重过敏立即停药并上报。" />
          </Section>
        </>
    </>
  );
}

// === 执行记录 ===
type ItemStatus = "pending" | "done" | "blocked";
type ExecItem = {
  id: string;
  title: string;
  desc: string;
  status: ItemStatus;
};

function buildDayItems(day: number, tags: string[]): ExecItem[] {
  return tags.map((tag, i) => ({
    id: `d${day}-${i + 1}`,
    title: tag,
    desc: "",
    status: "pending" as ItemStatus,
  }));
}

// === 执行记录（详情页只读摘要） ===
type DayPhase = "done" | "active" | "pending";
type DaySummary = {
  day: number;
  date: string;
  action: string;
  pickup: boolean;
  phase: DayPhase;
};

function getExecSummary(status: StatusKey): DaySummary[] {
  const allDone = status === "已完成";
  const terminated = status === "已终止";
  const action = "氟尼辛葡甲胺 2ml IM + 头孢噻呋钠 1g IM，测温并记录";
  if (terminated) {
    return [
      { day: 1, date: "05/12", action, pickup: true, phase: "done" },
      { day: 2, date: "05/13", action, pickup: true, phase: "done" },
    ];
  }
  return [
    { day: 1, date: "05/12", action, pickup: true, phase: "done" },
    { day: 2, date: "05/13", action, pickup: true, phase: allDone ? "done" : "active" },
    { day: 3, date: "05/14", action, pickup: true, phase: allDone ? "done" : "pending" },
  ];
}

export function ExecuteSummary({ status, pickupCode, tags }: { status: StatusKey; pickupCode: string | null; tags: string[] }) {
  if (status === "待诊断") {
    return (
      <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
        <PlayCircle className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
        <div className="text-body-sm text-text-tertiary">尚未开始执行</div>
      </div>
    );
  }
  void tags;
  const days = getExecSummary(status);
  const needPickup = Boolean(pickupCode);
  return (
    <>
      {days.map((d) => {
        const isDone = d.phase === "done";
        const isActive = d.phase === "active";
        const statusLabel = isDone ? "已完成" : isActive ? "进行中" : "未开始";
        const statusClass = isDone || isActive ? "bg-brand-subtle text-primary" : "bg-surface-subtle text-text-tertiary";
        const pickupDone = needPickup && isDone;
        return (
          <div key={d.day} className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DayDot active={isActive} done={isDone} />
                <span className={`text-body font-medium ${isDone || isActive ? "text-foreground" : "text-text-tertiary"}`}>
                  第 {d.day} 天
                </span>
                <span className="text-caption text-text-tertiary font-mono">{d.date}</span>
              </div>
              <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-caption font-medium ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            <div className="rounded-lg bg-surface-subtle px-3 py-2.5 mb-2">
              <div className="text-caption text-text-tertiary mb-0.5">具体动作</div>
              <div className="text-body-sm leading-relaxed text-foreground">{d.action}</div>
            </div>
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
              <PackagePlus className="h-3.5 w-3.5" />
              <span>领物</span>
              <span className={`ml-1 inline-flex items-center h-5 px-2 rounded-full ${pickupDone ? "bg-brand-subtle text-primary" : "bg-surface-subtle text-text-tertiary"}`}>
                {!needPickup ? "无需" : pickupDone ? "已领" : "未领"}
              </span>
            </div>
          </div>
        );
      })}


      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`text-body-sm font-medium inline-flex items-center gap-1.5 ${status === "已完成" ? "text-foreground" : "text-text-tertiary"}`}>
            {status === "已完成" ? (
              <CheckCircle2 className="h-4 w-4 text-primary" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
                <circle cx="8" cy="8" r="7" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeDasharray="2 2" />
              </svg>
            )}
            复查 / 验收
          </div>
          <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-caption font-medium ${status === "已完成" ? "bg-brand-subtle text-primary" : "bg-surface-subtle text-text-tertiary"}`}>
            {status === "已完成" ? "已完成" : "未开始"}
          </span>
        </div>
        <div className="text-caption text-text-tertiary">第 4 天复测体温（≤39.0℃）与采食情况，记录复查结果。</div>
      </div>
    </>
  );
}

// === 执行页：仅显示当前进行中的当天 checklist ===
export function ActiveDayExecute({ pickupCode, tags, day = 2, date = "05/13" }: { pickupCode: string | null; tags: string[]; day?: number; date?: string }) {
  return (
    <>
      <Section title="执行基础信息">
        <Field label="执行人" value={<PersonChip name="李雨晴" />} />
        <Field label="开始执行时间" value="今日 13:08" />
        <Field label="执行对象" value={tags.length === 1 ? tags[0] : `${tags.length} 只`} />
      </Section>

      <div className="text-caption text-text-tertiary px-1">
        勾选完成本日动作，可选填执行纪要
      </div>

      <ChecklistDay day={day} date={date} pickupCode={pickupCode} tags={tags} dayState="active" initialNote="" />
    </>
  );
}


type DayState = "done" | "active" | "pending";

function ChecklistDay({
  day,
  date,
  pickupCode,
  tags,
  dayState,
  initialNote = "",
  readOnly = false,
}: {
  day: number;
  date: string;
  pickupCode: string | null;
  tags: string[];
  dayState: DayState;
  initialNote?: string;
  readOnly?: boolean;
}) {
  const isActive = dayState === "active";
  const isDone = dayState === "done";
  const isPending = dayState === "pending";
  const interactive = isActive && !readOnly;

  const [items, setItems] = useState<ExecItem[]>(() => {
    const base = buildDayItems(day, tags);
    if (isDone) return base.map((it) => ({ ...it, status: "done" as ItemStatus }));
    return base;
  });
  const [dayNote, setDayNote] = useState(initialNote);
  const [noteEditing, setNoteEditing] = useState(false);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const total = items.length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const blockedCount = items.filter((i) => i.status === "blocked").length;
  const settled = doneCount + blockedCount;
  const allSettled = settled === total;
  const dayDone = isDone || (isActive && allSettled && blockedCount === 0);

  // 状态标签
  let dayStatusTag: string;
  let dayStatusText: string;
  if (isDone || dayDone) {
    dayStatusTag = "bg-brand-subtle text-primary";
    dayStatusText = "已完成";
  } else if (isActive) {
    dayStatusTag = "bg-brand-subtle text-primary";
    dayStatusText = "进行中";
  } else {
    dayStatusTag = "bg-surface-subtle text-text-tertiary";
    dayStatusText = "未开始";
  }

  const update = (id: string, patch: Partial<ExecItem>) =>
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const toggleDone = (id: string, current: ItemStatus) => {
    if (!interactive) return;
    update(id, { status: current === "done" ? "pending" : "done" });
  };

  const pickupDone = isDone || (isActive && dayDone);


  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Day header */}
      <div className="px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DayDot active={isActive} done={dayDone} />
          <span className={`text-body font-medium ${isPending ? "text-text-tertiary" : "text-foreground"}`}>
            第 {day} 天执行
          </span>
          <span className="text-caption text-text-tertiary font-mono">{date}</span>
        </div>
        <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-caption font-medium ${dayStatusTag}`}>
          {dayStatusText}
        </span>
      </div>

      {isPending ? (
        <div className="px-4 pb-4 text-caption text-text-tertiary">尚未开始，到时间后开放填写</div>
      ) : (
        <>
          {pickupCode && (
            <div className="px-4 pb-2">
              {pickupDone ? (
                <div className="flex items-center justify-between px-3 h-10 rounded-lg text-body-sm bg-surface-subtle text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <PackagePlus className="h-3.5 w-3.5" />
                    已领物 · {pickupCode}
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <Link
                  to="/m/pickup/$id"
                  params={{ id: pickupCode }}
                  className="flex items-center justify-between px-3 h-10 rounded-lg text-body-sm"
                  style={{ backgroundColor: "color-mix(in oklab, #F59E0B 12%, transparent)", color: "#8A5A0A" }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <PackagePlus className="h-3.5 w-3.5" />
                    需领物 · 点击前往领物码 {pickupCode}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Link>
              )}
            </div>
          )}


          <div className="px-4 pb-3">
            <div className="rounded-lg bg-surface-subtle px-3 py-2.5">
              <div className="text-caption text-text-tertiary mb-0.5">本日统一执行动作</div>
              <div className="text-body-sm leading-relaxed text-foreground">
                氟尼辛葡甲胺 2ml IM + 头孢噻呋钠 1g IM，测温并记录
              </div>
            </div>
          </div>

          <ul className="px-4 pb-3 space-y-2">
            {items.map((it) => {
              const done = it.status === "done";
              const blocked = it.status === "blocked";
              return (
                <li key={it.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleDone(it.id, it.status)}
                    disabled={!interactive}
                    className={`w-full flex items-center gap-2.5 h-12 px-3 rounded-xl border text-left transition-all active:scale-[0.99] ${
                      done
                        ? "border-primary/40 bg-brand-subtle/30"
                        : blocked
                          ? "border-[var(--state-danger)]/40 bg-[var(--state-danger)]/5"
                          : isActive
                            ? "border-border bg-card"
                            : "border-border bg-card opacity-80"
                    } ${!interactive ? "cursor-default" : ""}`}
                  >
                    {done ? (
                      <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                    ) : blocked ? (
                      <AlertTriangle className="h-4 w-4 text-[var(--state-danger)] shrink-0" />
                    ) : isActive ? (
                      <Square className="h-4 w-4 text-text-tertiary shrink-0" />
                    ) : null}
                    <span
                      className={`flex-1 min-w-0 truncate font-mono text-body ${
                        done ? "text-foreground" : isActive ? "text-foreground" : "text-text-tertiary"
                      }`}
                    >
                      {it.title}
                    </span>
                    {interactive && !done && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          update(it.id, { status: blocked ? "pending" : "blocked" });
                        }}
                        className={`text-caption px-2 py-1 rounded-md ${
                          blocked
                            ? "text-[var(--state-danger)] font-medium"
                            : "text-text-tertiary active:bg-surface-subtle"
                        }`}
                      >
                        {blocked ? "已标记无法执行" : "无法执行"}
                      </span>
                    )}
                  </button>
                  {blocked && (interactive ? (
                    <div className="rounded-xl border border-[var(--state-danger)]/40 bg-[var(--state-danger)]/5 px-3 py-2.5">
                      <div className="text-caption text-[var(--state-danger)] inline-flex items-center gap-1 mb-1">
                        <AlertTriangle className="h-3 w-3" /> 无法执行原因（必填）
                      </div>
                      <textarea
                        value={reasons[it.id] ?? ""}
                        onChange={(e) => setReasons((r) => ({ ...r, [it.id]: e.target.value }))}
                        placeholder="请说明无法执行的具体原因"
                        required
                        className="w-full min-h-[44px] rounded-md bg-transparent text-body-sm text-foreground placeholder:text-text-tertiary resize-none focus:outline-none"
                      />
                    </div>
                  ) : reasons[it.id] ? (
                    <div className="rounded-xl border border-border bg-surface-subtle px-3 py-2.5">
                      <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mb-0.5">
                        <AlertTriangle className="h-3 w-3" /> 无法执行原因
                      </div>
                      <div className="text-body-sm text-foreground">{reasons[it.id]}</div>
                    </div>
                  ) : null)}
                </li>
              );
            })}

            {interactive ? (
              <li>
                {noteEditing || !dayNote ? (
                  <div
                    className={`rounded-xl border ${
                      dayNote ? "border-primary/40 bg-brand-subtle/20" : "border-border bg-card"
                    } px-3 py-2.5`}
                  >
                    <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mb-1">
                      <FileText className="h-3 w-3" /> 备注（选填）
                    </div>
                    <textarea
                      value={dayNote}
                      onChange={(e) => setDayNote(e.target.value)}
                      onBlur={() => setNoteEditing(false)}
                      autoFocus={noteEditing}
                      placeholder="填写本日执行备注"
                      className="w-full min-h-[44px] rounded-md bg-transparent text-body-sm text-foreground placeholder:text-text-tertiary resize-none focus:outline-none"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setNoteEditing(true)}
                    className="w-full text-left rounded-xl border border-primary/40 bg-brand-subtle/20 px-3 py-2.5"
                  >
                    <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mb-0.5">
                      <FileText className="h-3 w-3" /> 备注（选填）
                    </div>
                    <div className="text-body-sm text-foreground">{dayNote}</div>
                  </button>
                )}
              </li>
            ) : (isDone || (isActive && readOnly)) && dayNote ? (
              <li>
                <div className="rounded-xl border border-border bg-surface-subtle px-3 py-2.5">
                  <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mb-0.5">
                    <FileText className="h-3 w-3" /> 备注
                  </div>
                  <div className="text-body-sm text-foreground">{dayNote}</div>
                </div>
              </li>
            ) : null}
          </ul>

        </>
      )}
    </div>
  );
}

function DayDot({ active, done }: { active: boolean; done: boolean }) {
  // 已完成：绿色实心带勾；进行中：绿色实心圆；待执行：虚线空心圆
  if (done) {
    return (
      <span className="h-4 w-4 rounded-full bg-primary inline-flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5.2L4 7.2L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (active) {
    return <span className="h-4 w-4 rounded-full bg-primary inline-block" />;
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <circle cx="8" cy="8" r="7" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}




