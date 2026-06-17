import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  ScanLine,
  X,
  Repeat,
  History,
  Link2,
  Tag,
  AlertOctagon,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

import { useRole, canExecute, canDiagnose } from "@/lib/mobile-role";
import { useClaimed } from "@/lib/pickup-store";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/m/health/$id")({
  head: () => ({ meta: [{ title: "工单详情 · 奇点智牧" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    tab: (s.tab as "report" | "review" | "execute" | undefined) ?? undefined,
    obs: typeof s.obs === "number" ? s.obs : s.obs ? Number(s.obs) : undefined,
    obsExpired: s.obsExpired ? 1 : undefined,
  }),
  component: TaskDetailPage,
});

type StatusKey = "待诊断" | "进行中" | "已完成" | "已终止";

const statusMap: Record<StatusKey, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待诊断: { tag: "tag tag-warning", icon: ClipboardList, color: "" },
  进行中: { tag: "tag tag-info", icon: PlayCircle, color: "" },
  已完成: { tag: "tag tag-success", icon: CheckCircle2, color: "" },
  已终止: { tag: "tag tag-danger", icon: AlertTriangle, color: "" },
};


function cleanName(n: string) {
  return n.replace(/^(内部|外部)·/, "");
}

// 按工单号映射状态，确保每种状态都有详情页可看
const statusById: Record<string, StatusKey> = {
  "WO-2381": "待诊断",
  "WO-2298": "进行中",
  "WO-2401": "进行中",
  "WO-2420": "进行中",
  "WO-2430": "进行中",
  "WO-2440": "进行中",
  "WO-2324": "已终止",
  "WO-2199": "已完成",
  "HF-0702": "进行中",
  "HF-0688": "已完成",
  "LS-1029": "待诊断",
  "LS-1011": "已完成",
  "YM-2042": "已终止",
  "YM-2501": "进行中",
};

// 已触发复查任务（处方执行完成，待兽医复查验收）的工单
const reviewTaskOrders = new Set<string>(["WO-2420", "WO-2440"]);
// 已完成复查 → 继续观察中（静态 mock：剩余天数）
const observingOrdersMap: Record<string, number> = { "WO-2430": 5 };
// 观察期已满 → 待助理已治愈
const obsExpiredOrders = new Set<string>([]);
// 复查任务超时未操作 → 系统自动归档的工单（status 为 已完成 但无人工复查结论）
const autoArchivedOrders = new Set<string>(["HF-0688", "WO-2199"]);


function TaskDetailPage() {
  const { id } = useParams({ from: "/m/health/$id" });
  const role = useRole();

  const search = Route.useSearch();
  // 默认 tab：自动归档工单 → 执行任务（并滚到逾期那条）；进行中 → 执行任务；有诊断记录 → 复查；否则上报
  const currentStatus = statusById[id] ??
    (role === "hoof_trimmer" || role === "vet_assistant" || role === "immunizer" ? "进行中" : "待诊断");
  const hasDiagnosis = currentStatus !== "待诊断";
  const hasExecution = currentStatus === "进行中";
  const isAutoArchivedOrder = autoArchivedOrders.has(id);
  const defaultTab: "report" | "review" | "execute" = isAutoArchivedOrder
    ? "execute"
    : hasExecution
      ? "execute"
      : hasDiagnosis
        ? "review"
        : "report";
  const [tab, setTab] = useState<"report" | "review" | "execute">(search.tab ?? defaultTab);
  
  const [recordsOpen, setRecordsOpen] = useState(false);

  // 自动归档工单：进入详情后自动滚到「逾期归档」那条复查任务
  useEffect(() => {
    if (!isAutoArchivedOrder || tab !== "execute") return;
    const t = setTimeout(() => {
      const el = document.getElementById("auto-archived-review-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 80);
    return () => clearTimeout(t);
  }, [isAutoArchivedOrder, tab]);

  const navigate = useNavigate();
  // 复诊工单：开始诊断决策弹窗
  const [revisitOpen, setRevisitOpen] = useState(false);
  const [revisitStep, setRevisitStep] = useState<"choose" | "terminate-old">("choose");
  const [revisitReason, setRevisitReason] = useState<string>("");
  const [revisitReasonOther, setRevisitReasonOther] = useState<string>("");

  // 异常终止
  const [abortOpen, setAbortOpen] = useState(false);
  const [abortReason, setAbortReason] = useState<string>("");
  const [abortOther, setAbortOther] = useState<string>("");
  
  

  

  // mock data
  const isLoss = id.startsWith("LS");
  const isHoof = !isLoss && (role === "hoof_trimmer" || id.startsWith("HF"));
  const isPlatformImmune = id === "YM-2501";
  const isPlatformPostpartum = id.startsWith("PP");
  const platformAction: string | undefined = isPlatformImmune
    ? "注射免疫药物（口蹄疫疫苗）"
    : isPlatformPostpartum
      ? "产后修护：复查恶露与体温，补充营养"
      : isHoof
        ? "修蹄护理：削蹄、检查蹄底、必要时贴蹄垫"
        : undefined;
  const isPlatformIssued = Boolean(platformAction);
  const kind = isLoss ? "损耗" : isHoof ? "修蹄" : "健康";

  // 单对象工单（仅一只牛）：WO-2298、HF-* 等
  const singleEarMap: Record<string, string> = {
    "WO-2298": "#01-24-2298",
    "WO-2410": "#01-24-2410",
    "WO-2420": "#01-24-2420",
    "WO-2430": "#01-24-2430",
    "WO-2440": "#01-24-2440",
    "WO-2199": "#01-24-2199",
    "HF-0702": "#01-24-2150",
    "HF-0688": "#01-24-2270",
    "PP-2501": "#01-24-2710",
  };
  const singleEar = singleEarMap[id];
  const isSingle = isHoof || Boolean(singleEar);
  const earTag = singleEar ?? (isHoof ? "#01-24-2150" : "#01-24-2381");
  const execTags: string[] = isSingle ? [earTag] : ["#01-24-2381", "#01-24-2382", "#01-24-2383"];

  const fallbackStatus: StatusKey =
    role === "hoof_trimmer" || role === "vet_assistant" || role === "immunizer" ? "进行中" : "待诊断";
  const o = {
    id,
    farm: "奇点示范牧场",
    barn: isLoss ? "2 号牛舍" : isHoof ? "2 号牛舍" : isPlatformImmune ? "1 号牛舍" : isPlatformPostpartum ? "产房 1 号" : "3 号牛舍",
    target: isLoss ? "口蹄疫疫苗 A 型" : isSingle ? earTag : isPlatformImmune ? "24 头" : "3 只",
    type: isLoss ? "物资损耗" : isHoof ? "修蹄" : isPlatformImmune ? "免疫" : isPlatformPostpartum ? "产后护理" : "疾病治疗",
    status: ((search.obs && !search.obsExpired) || search.obsExpired
      ? "进行中"
      : (statusById[id] ?? fallbackStatus)) as StatusKey,
    who: isLoss ? "李雨晴" : isHoof ? "张师傅" : "李雨晴",
    plannedAt: "今日 13:00",
    needPickup: !isLoss,
    pickupCode: isLoss ? null : `PK-${id.replace(/^WO-?/i, "")}`,
    flow: isPlatformIssued ? "平台下发 → " + (isHoof ? "张师傅" : "李雨晴") + " 执行" : "陈晓东 上报 → 王医生 诊断 → 李雨晴 执行",
  };
  const s = statusMap[o.status];
  const Icon = s.icon;

  // 复诊与关联工单 mock
  const isDisease = o.type === "疾病治疗";
  const isRevisit = isDisease && (id === "WO-2298" || id === "WO-2410");
  const relatedOrderId: string | null = isRevisit ? "WO-2150" : null;
  // 诊疗信息摘要 mock —— 取自"关联原始工单"
  const showSummary = isDisease && isSingle && Boolean(relatedOrderId);
  const summary = relatedOrderId
    ? {
        id: relatedOrderId,
        date: "2026-04-22",
        conclusion: "乳房炎（亚临床）",
        prescription: "标准 3 日抗炎方案：头孢噻呋钠 + 氟尼辛葡甲胺，每日 1 次连续 3 天，配合每日测温与乳样复查。",
        medGroups: [
          {
            date: "2026-04-24",
            items: [
              { name: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g / 次 · 肌肉注射" },
            ],
          },
          {
            date: "2026-04-23",
            items: [
              { name: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g / 次 · 肌肉注射" },
              { name: "氟尼辛葡甲胺", manufacturer: "齐鲁动保", dose: "2ml / 次 · 肌肉注射" },
            ],
          },
          {
            date: "2026-04-22",
            items: [
              { name: "头孢噻呋钠", manufacturer: "瑞普生物", dose: "1g / 次 · 肌肉注射" },
              { name: "氟尼辛葡甲胺", manufacturer: "齐鲁动保", dose: "2ml / 次 · 肌肉注射" },
            ],
          },
        ],
        revisitReason: "停药 5 天后乳区再次出现红肿，体温回升至 39.4℃，疑似炎症复发，需复查并调整方案。",
      }
    : null;



  // 观察中状态（来自复查 → 继续观察）：支持 URL 参数 或 静态 mock 映射
  const staticObsDays = observingOrdersMap[id];
  const obsDays = search.obs ?? staticObsDays;
  const isObserving = isDisease && typeof obsDays === "number" && obsDays > 0 && !search.obsExpired;
  const isObsExpired = isDisease && (Boolean(search.obsExpired) || obsExpiredOrders.has(id));

  

  const canAbort =
    isDisease &&
    (role === "vet" || role === "manager") &&
    o.status === "进行中" &&
    !isObserving &&
    !isObsExpired;

  return (
    <MobileShell
      title="工单详情"
      back
      hideTabBar
      right={
        canAbort ? (
          <button
            type="button"
            onClick={() => {
              setAbortReason("");
              setAbortOther("");
              setAbortOpen(true);
            }}
            className="-mr-1 h-8 px-2 inline-flex items-center gap-1 rounded-md text-caption text-destructive active:bg-destructive/10"
            aria-label="异常终止"
          >
            <AlertOctagon className="h-4 w-4" />
            <span className="whitespace-nowrap">异常</span>
          </button>
        ) : undefined
      }
    >
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
          <div className="flex items-start gap-1.5 text-caption">
            <Tag className="h-3.5 w-3.5 text-text-tertiary mt-0.5 shrink-0" />
            <span className="text-text-tertiary shrink-0">牛只编号</span>
            {isPlatformImmune && !isSingle ? (
              <span className="text-body-sm text-foreground">{o.target}</span>
            ) : (
              <div className="flex flex-wrap gap-x-2 gap-y-1 min-w-0">
                {(isSingle ? [earTag] : execTags).map((t) => (
                  <Link
                    key={t}
                    to="/m/animals-{$id}"
                    params={{ id: t.replace(/^#/, "") }}
                    className="text-body-sm text-primary inline-flex items-center gap-0.5"
                  >
                    {t}
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 text-caption text-text-tertiary">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{o.farm}</span>
              </span>
              <span className="flex items-center gap-1">
                <Warehouse className="h-3.5 w-3.5" />
                <span>{o.barn}</span>
              </span>
            </div>
            {isDisease && (
              <span
                className={`flex items-center gap-1 shrink-0 px-2 h-6 rounded-md ${
                  isRevisit
                    ? "bg-brand-subtle text-primary font-medium"
                    : "text-text-tertiary"
                }`}
              >
                <Repeat className="h-3.5 w-3.5" />
                <span>是否复诊</span>
                <span className="text-body-sm">{isRevisit ? "是" : "否"}</span>
              </span>
            )}
          </div>

          {isDisease && (relatedOrderId || showSummary) && (
            <div
              className="mt-2 rounded-lg p-3 space-y-2.5 bg-brand-subtle"

            >
              <div className="flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                <span className="text-caption font-medium text-primary">复诊关联信息</span>
              </div>
              {showSummary && summary?.revisitReason && (
                <div>
                  <div className="text-caption text-text-tertiary mb-1">复诊原因</div>
                  <p className="text-body-sm text-foreground leading-relaxed">
                    {summary.revisitReason}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 text-caption pt-0.5">
                {relatedOrderId && (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Link2 className="h-3.5 w-3.5 text-text-tertiary" />
                    <span className="text-text-tertiary">关联原始工单</span>
                    <Link
                      to="/m/health/$id"
                      params={{ id: relatedOrderId }}
                      className="font-mono text-body-sm text-primary inline-flex items-center gap-0.5"
                    >
                      {relatedOrderId}
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
                {showSummary && (
                  <button
                    type="button"
                    onClick={() => setRecordsOpen(true)}
                    className="flex items-center gap-1.5 shrink-0"
                  >
                    <History className="h-3.5 w-3.5 text-text-tertiary" />
                    <span className="text-text-tertiary">诊疗信息摘要</span>
                    <span className="text-body-sm text-primary">查看</span>
                  </button>
                )}
              </div>
            </div>
          )}


          {(isObserving || isObsExpired) && (
            <div
              className={`mt-2 rounded-lg p-3 flex items-start gap-2 ${
                isObsExpired
                  ? "bg-[#22ACEB]/10 border border-[#22ACEB]/30"
                  : "bg-brand-subtle"
              }`}
            >
              <Repeat
                className={`h-4 w-4 mt-0.5 shrink-0 ${
                  isObsExpired ? "text-[#22ACEB]" : "text-primary"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`text-body-sm font-medium ${
                    isObsExpired ? "text-[#22ACEB]" : "text-primary"
                  }`}
                >
                  {isObsExpired
                    ? "观察期已结束，待已治愈"
                    : `继续观察中 · 剩余 ${obsDays} 天`}
                </div>
                <div className="text-caption text-text-tertiary mt-0.5 leading-relaxed">
                  {isObsExpired
                    ? "观察期内未发起复诊上报，请助理已治愈并关闭工单。"
                    : "观察期内若发现异常，可通过健康上报发起复诊。"}
                </div>
              </div>
            </div>
          )}

        </div>




        {/* === 2. Tab === */}
        <div className="sticky top-12 z-20 bg-card border-b border-border">
          <div className="px-4 flex gap-1">
            {[
              { key: "report", label: "上报记录" },
              { key: "review", label: "诊断记录" },
              { key: "execute", label: "执行任务" },
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
          {tab === "report" && (isPlatformIssued ? <EmptyTab label="平台下发工单，无上报记录" /> : <ReportTab isLoss={isLoss} />)}
          {tab === "review" && (isPlatformIssued ? <EmptyTab label="平台下发工单，无诊断记录" /> : <ReviewTab isLoss={isLoss} status={o.status} />)}
          {tab === "execute" && <ExecuteSummary id={id} status={o.status} pickupCode={o.pickupCode} tags={execTags} platformAction={platformAction} />}
        </div>
      </div>

      {/* === 3. 底部操作区 === */}
      {(() => {
        const showRespond = canDiagnose(role, o.type) && o.status === "待诊断" && !isObserving && !isObsExpired;
        // 复查任务已触发：按工单显式标记，而非所有疾病进行中工单
        const hasReviewTask =
          isDisease && o.status === "进行中" && !isObserving && !isObsExpired && reviewTaskOrders.has(id);
        // 兽医 / 场长视角：仅在触发复查任务时显示「开始执行」（进入复查页填写复查结论）
        // 助理/修蹄/免疫等执行角色：常规进行中工单显示「开始执行」，但若已触发复查任务则不显示
        const showExecVet = (role === "vet" || role === "manager") && hasReviewTask;
        const showExecOther =
          canExecute(role) && role !== "vet" && o.status === "进行中" && !isObserving && !isObsExpired && !hasReviewTask;
        const showExec = showExecVet || showExecOther;
        const showRevisitReport = isObserving && role === "vet_assistant";
        const showConfirmCure = isObsExpired && role === "vet_assistant";

        if (!showRespond && !showExec && !showRevisitReport && !showConfirmCure) return null;
        return (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] flex items-center gap-2">
            {showRespond && (
              isRevisit ? (
                <button
                  type="button"
                  onClick={() => {
                    setRevisitStep("choose");
                    setRevisitReason("");
                    setRevisitReasonOther("");
                    setRevisitOpen(true);
                  }}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
                >
                  <Stethoscope className="h-4 w-4" />
                  开始诊断
                </button>
              ) : (
                <Link
                  to="/m/health/$id/diagnose"
                  params={{ id: o.id }}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
                >
                  <Stethoscope className="h-4 w-4" />
                  开始诊断
                </Link>
              )
            )}
            {showExec && (
              showExecVet ? (
                <Link
                  to="/m/health/$id/review"
                  params={{ id: o.id }}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
                >
                  <PlayCircle className="h-4 w-4" />
                  开始复查
                </Link>
              ) : (
                <Link
                  to="/m/health/$id/execute"
                  params={{ id: o.id }}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
                >
                  <PlayCircle className="h-4 w-4" />
                  开始执行
                </Link>
              )
            )}
            {showRevisitReport && (
              <Link
                to="/m/report"
                search={{ target: earTag.replace(/^#/, ""), barn: o.barn, revisitFrom: o.id, lock: 1 }}
                className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
              >
                <Repeat className="h-4 w-4" />
                健康上报（复诊）
              </Link>
            )}
            {showConfirmCure && (
              <Link
                to="/m/health/$id_/confirm-cure"
                params={{ id: o.id }}
                className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                已治愈
              </Link>
            )}
          </div>
        );
      })()}


      {/* === 复诊工单：开始诊断决策弹窗 === */}
      <Dialog open={revisitOpen} onOpenChange={setRevisitOpen}>
        <DialogContent className="max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-title">
              {revisitStep === "choose" ? "关联工单处理" : "终止原工单"}
            </DialogTitle>
          </DialogHeader>

          {revisitStep === "choose" && (
            <div className="space-y-3">
              <p className="text-body-sm text-text-secondary leading-relaxed">
                本次上报为原工单
                <span className="font-mono text-foreground mx-1">{relatedOrderId}</span>
                的复诊上报。是否需要提前终止原工单？
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRevisitOpen(false);
                    navigate({ to: "/m/health/$id/diagnose", params: { id: o.id } });
                  }}
                  className="flex-1 h-10 rounded-lg border border-border bg-card text-body-sm text-text-secondary"
                >
                  暂不终止
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRevisitReason("");
                    setRevisitReasonOther("");
                    setRevisitStep("terminate-old");
                  }}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm"
                >
                  提前终止
                </button>
              </div>
            </div>
          )}

          {revisitStep === "terminate-old" && (
            <div className="space-y-3">
              <div className="text-caption text-text-tertiary">
                请选择原工单 <span className="font-mono text-text-secondary">{relatedOrderId}</span> 的终止原因
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["症状反复，方案失效", "出现新症状", "用药反应异常", "需更换方案", "其他"].map((r) => {
                  const active = revisitReason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRevisitReason(r)}
                      className={`h-9 rounded-lg border text-body-sm transition ${
                        active
                          ? "border-primary bg-brand-subtle text-primary"
                          : "border-border bg-card text-text-secondary"
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
              {revisitReason === "其他" && (
                <textarea
                  value={revisitReasonOther}
                  onChange={(e) => setRevisitReasonOther(e.target.value)}
                  placeholder="请输入其他终止原因"
                  rows={2}
                  className="w-full rounded-lg border border-border bg-card p-2 text-body-sm resize-none focus:outline-none focus:border-primary"
                />
              )}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRevisitStep("choose")}
                  className="h-10 px-4 rounded-lg border border-border text-body-sm text-text-secondary"
                >
                  返回
                </button>
                <button
                  type="button"
                  disabled={!revisitReason || (revisitReason === "其他" && !revisitReasonOther.trim())}
                  onClick={() => {
                    toast.success(`原工单 ${relatedOrderId} 已终止，进入本次复诊诊断`);
                    setRevisitOpen(false);
                    navigate({ to: "/m/health/$id/diagnose", params: { id: o.id } });
                  }}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-body-sm disabled:opacity-50"
                >
                  提交并继续诊断
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={recordsOpen} onOpenChange={setRecordsOpen}>
        <SheetContent
          side="bottom"
          className="p-0 rounded-t-2xl h-[75vh] max-h-[75vh] flex flex-col gap-0 mx-auto w-full max-w-[440px] bg-card"
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
            <SheetTitle className="text-card-title text-left">诊疗信息摘要</SheetTitle>
            {summary && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-caption text-text-tertiary">来源</span>
                <span className="font-mono text-caption text-foreground">{summary.id}</span>
                <span className="text-text-tertiary text-caption">·</span>
                <span className="text-caption text-text-tertiary">{summary.date}</span>
              </div>
            )}
          </SheetHeader>
          {summary && (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              <div className="space-y-1.5">
                <div className="text-caption text-text-tertiary">诊断结论</div>
                <div className="text-body-sm text-foreground">{summary.conclusion}</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-caption text-text-tertiary">处方信息</div>
                <p className="text-body-sm text-text-secondary leading-relaxed">{summary.prescription}</p>
              </div>

              <div className="space-y-3">
                <div className="text-caption text-text-tertiary">用药记录</div>
                <div className="relative pl-4">
                  <span className="absolute left-[3px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {summary.medGroups.map((g) => (
                      <div key={g.date} className="relative">
                        <span className="absolute -left-4 top-[7px] h-[7px] w-[7px] rounded-full bg-primary ring-2 ring-background" />
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-body-sm text-foreground">{g.date}</span>
                          <span className="text-caption text-text-tertiary">· {g.items.length} 条</span>
                        </div>
                        <div className="space-y-1.5">
                          {g.items.map((m) => (
                            <div
                              key={m.name}
                              className="grid grid-cols-[1fr_auto_auto] gap-4 items-center"
                            >
                              <div className="text-body-sm text-foreground truncate">{m.name}</div>
                              <div className="text-caption text-primary truncate">
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
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 异常终止 */}
      <Sheet open={abortOpen} onOpenChange={setAbortOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0 max-h-[80vh] overflow-y-auto">
          <SheetHeader className="px-4 pt-4 pb-2 text-left">
            <SheetTitle className="text-card-title">异常终止工单</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-2 text-caption text-text-tertiary">
            终止后工单将转为「已终止」，未完成的执行任务与复查任务一并关闭，操作不可撤销。
          </div>
          <div className="px-4 pt-3 pb-2 text-body-sm text-foreground">终止原因</div>
          <div className="px-4 space-y-2">
            {["牛只死亡", "牛只淘汰/转出", "误诊，需重新上报", "转外院治疗", "其他"].map((r) => {
              const active = abortReason === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setAbortReason(r)}
                  className={`w-full h-11 px-3 rounded-lg border text-body-sm text-left inline-flex items-center gap-2 ${
                    active ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card text-text-secondary"
                  }`}
                >
                  {active ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-text-tertiary" />
                  )}
                  {r}
                </button>
              );
            })}
            {abortReason === "其他" && (
              <textarea
                value={abortOther}
                onChange={(e) => setAbortOther(e.target.value.slice(0, 200))}
                placeholder="请填写终止原因（必填，最多 200 字）"
                rows={3}
                className="w-full rounded-lg border border-border bg-card p-3 text-body-sm placeholder:text-text-tertiary resize-none"
              />
            )}
          </div>
          <div className="px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)] flex gap-2">
            <button
              type="button"
              onClick={() => setAbortOpen(false)}
              className="flex-1 h-11 rounded-lg border border-border text-body text-text-secondary"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!abortReason || (abortReason === "其他" && !abortOther.trim())}
              onClick={() => {
                setAbortOpen(false);
                toast.success("工单已终止");
                navigate({ to: "/m/health" });
              }}
              className="flex-1 h-11 rounded-lg bg-destructive text-white text-body disabled:opacity-50"
            >
              确认终止
            </button>
          </div>
        </SheetContent>
      </Sheet>
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
function EmptyTab({ label }: { label: string }) {
  return (
    <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
      <ClipboardList className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
      <div className="text-body-sm text-text-tertiary">{label}</div>
    </div>
  );
}

// === 上报记录 ===
function ReportTab({ isLoss }: { isLoss: boolean }) {
  return (
    <>
      <Section title="基础信息">
        <Field label="上报人" value={<PersonChip name="陈晓东" />} />
        <Field label="上报时间" value="2026-05-20 09:08" />
      </Section>

      <Section title="疾病信息">
        <Field
          label="症状标签"
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
        {!isLoss && (
          <Field
            label="疑似疾病"
            value={
              <div className="flex flex-wrap gap-1 justify-end">
                <span className="tag tag-warning">呼吸道感染</span>
                <span className="tag tag-muted">符合症状 2 项</span>
              </div>
            }
          />
        )}
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

      <Section title="治疗方案">
        <p className="text-body-sm text-text-secondary leading-relaxed">
          {isLoss
            ? "系统推荐：登记损耗 8 支 → 触发库存补申请（口蹄疫疫苗 A 型 × 8 支）。"
            : "系统推荐：氟尼辛葡甲胺 2ml IM × 3 天 + 头孢噻呋钠 1g IM × 3 天，隔离观察并每日测温。"}
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
      <Section title="基础信息">
        <Field label="诊断人" value={<PersonChip name="王医生" />} />
        <Field label="诊断时间" value="2026-05-20 10:15" />
      </Section>

      <>

          <Section title="疾病信息">
            <Field
              label="症状标签"
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

          <Section title="治疗方案 / 执行方案">
            <ul className="divide-y divide-border -mx-1">
              {[
                { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", use: "肌肉注射", dose: "2ml / 次", days: "3 天" },
                { name: "头孢噻呋钠", spec: "1g / 支", use: "肌肉注射", dose: "1g / 次", days: "3 天" },
              ].map((m) => (
                <li key={m.name} className="px-1 py-3 space-y-1.5">
                  <div className="text-body-sm font-medium text-foreground">{m.name}</div>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-3">
                    <Field label="规格" value={m.spec} />
                    <Field label="给药方式" value={m.use} />
                    <Field label="单次剂量" value={m.dose} />
                    <Field label="疗程" value={m.days} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>


          <Section title="执行安排">
            <Field label="指定执行人" value={<PersonChip name="李雨晴" />} />
            <Field label="复查 / 验收" value="第 4 天复测体温与采食情况" />
            <Field label="备注" value="如出现严重过敏立即停药并上报。" />
          </Section>
        </>
    </>
  );
}

// === 执行任务 ===
type ItemStatus = "pending" | "done" | "blocked";
type ExecItem = {
  id: string;
  title: string;
  desc: string;
  status: ItemStatus;
  needMed: boolean;
  scanCode?: string;
  manufacturer?: string;
  batchNo?: string;
};

// 根据处方拆解每日任务：每种药品 = 一次任务，加上不需用药的常规任务（如测温）
function buildDayItems(day: number, _tags: string[], withTemp = false): ExecItem[] {
  const items: ExecItem[] = [];
  if (withTemp) {
    items.push({
      id: `d${day}-temp`,
      title: "每日测温",
      desc: "测量并记录当日直肠体温",
      status: "pending",
      needMed: false,
    });
  }
  items.push(
    {
      id: `d${day}-t1`,
      title: "氟尼辛葡甲胺注射液",
      desc: "2ml / 次 · 肌肉注射",
      status: "pending",
      needMed: true,
      manufacturer: "齐鲁动保",
      batchNo: "L20260418",
    },
    {
      id: `d${day}-t2`,
      title: "头孢噻呋钠",
      desc: "1g / 次 · 肌肉注射",
      status: "pending",
      needMed: true,
      manufacturer: "瑞普生物",
      batchNo: "B20260512",
    },
  );
  return items;
}

// === 执行任务（详情页只读摘要） ===
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
      { day: 1, date: "2026-05-12 13:08", action, pickup: true, phase: "done" },
      { day: 2, date: "2026-05-13 13:22", action, pickup: true, phase: "done" },
    ];
  }
  return [
    { day: 1, date: "2026-05-12 13:08", action, pickup: true, phase: "done" },
    { day: 2, date: "2026-05-13 13:22", action, pickup: true, phase: allDone ? "done" : "active" },
    { day: 3, date: "2026-05-14 13:15", action, pickup: true, phase: allDone ? "done" : "pending" },
  ];
}


export function ExecuteSummary({ id, status, pickupCode, tags, platformAction }: { id: string; status: StatusKey; pickupCode: string | null; tags: string[]; platformAction?: string }) {
  const [pickupOpen, setPickupOpen] = useState(false);
  if (status === "待诊断") {
    return (
      <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
        <PlayCircle className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
        <div className="text-body-sm text-text-tertiary">尚未开始执行</div>
      </div>
    );
  }
  void tags;
  const isPlatformIssued = Boolean(platformAction);
  const isTerminated = status === "已终止";
  const platformPhase: DayPhase = status === "已完成" ? "done" : "active";
  const platformDate = status === "已完成" ? "2026-05-12 10:00" : "2026-05-28 09:00";
  // 复查任务进行中（处方已全部完成，待兽医复查）/ 已完成观察中
  const reviewActive = id === "WO-2420";
  const reviewDone = id === "WO-2430";
  const allPrescriptionsDone = reviewActive || reviewDone;
  const days: DaySummary[] = isTerminated
    ? []
    : platformAction
      ? [{ day: 1, date: platformDate, action: platformAction, pickup: Boolean(pickupCode), phase: platformPhase }]
      : getExecSummary(allPrescriptionsDone ? "已完成" : status);
  const needPickup = Boolean(pickupCode);
  const hasUnpicked = needPickup && days.some((d) => d.phase !== "done");
  return (
    <>



      {days.map((d) => {
        const isDone = d.phase === "done";
        const isActive = d.phase === "active";
        const statusLabel = isDone ? "已完成" : isActive ? "进行中" : "未开始";
        const statusClass = isDone ? "tag-success" : isActive ? "tag-info" : "tag-muted";

        const pickupDone = needPickup && isDone;
        return (
          <div key={d.day} className={`rounded-2xl bg-card border border-border p-4 ${d.phase === "pending" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between mb-2 min-h-6">
              <div className="flex items-center gap-2 leading-6">
                <DayDot active={isActive} done={isDone} />
                <span className={`text-body font-medium leading-6 ${isDone || isActive ? "text-foreground" : "text-text-tertiary"}`}>
                  执行任务{String(d.day).padStart(2, "0")}
                </span>
                <span className="text-caption text-text-tertiary font-mono leading-6" suppressHydrationWarning>
                  {isDone ? d.date : d.date.split(' ')[0]}
                </span>
              </div>

              <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-caption font-medium leading-none ${statusClass}`}>
                {statusLabel}
              </span>
            </div>

            <div className="border-l-2 border-primary/40 pl-3 mb-2 ml-[7px]">
              <div className="text-caption text-text-tertiary mb-0.5">具体动作</div>
              <div className="text-body-sm leading-relaxed text-foreground">{d.action}</div>
            </div>
            <div className="flex items-center justify-between gap-2 text-caption text-text-tertiary">
              <div className="flex items-center gap-1.5">
                <PackagePlus className="h-3.5 w-3.5" />
                <span>领物</span>
                <span className={`ml-1 inline-flex items-center h-5 px-2 rounded-full text-caption font-medium ${pickupDone ? "tag-success" : "tag-muted"}`}>
                  {!needPickup ? "无需" : pickupDone ? "已领" : "未领"}
                </span>
              </div>
              {isDone && (
                <div className="flex items-center gap-1.5">
                  <span>执行人</span>
                  <PersonChip name={["李雨晴", "王建国", "张伟"][(d.day - 1) % 3]} />
                </div>
              )}
            </div>

          </div>
        );
      })}



      {status === "已终止" ? (
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-body-sm font-medium inline-flex items-center gap-1.5 text-foreground">
              <AlertTriangle className="h-4 w-4 text-[#EF4445]" />
              工单终止
            </div>
            <span className="tag tag-danger">已终止</span>

          </div>
          <div className="space-y-2">
            <Field label="终止原因" value="牛只死亡，停止后续治疗" />
            <Field label="是否转栏" value="否" />
            <Field label="终止时间" value="2026-05-13 18:24" />
            <Field label="操作人" value={<PersonChip name="李雨晴" />} />
          </div>
        </div>
      ) : isPlatformIssued ? null : (() => {
        const isAutoArchived = autoArchivedOrders.has(id);
        const reviewPhase: DayPhase = reviewDone || status === "已完成" ? "done" : reviewActive ? "active" : "pending";
        const isReviewDone = reviewPhase === "done";
        const isReviewActive = reviewPhase === "active";
        const reviewLabel = isAutoArchived
          ? "逾期归档"
          : isReviewDone
            ? "已完成"
            : isReviewActive
              ? "进行中"
              : "未开始";
        const reviewLabelClass = isAutoArchived
          ? "bg-[#FFF1F0] text-[#CF1322]"
          : isReviewDone
            ? "bg-brand-subtle text-primary"
            : isReviewActive
              ? "tag-info"
              : "bg-surface-subtle text-text-tertiary";
        return (
          <div id={isAutoArchived ? "auto-archived-review-card" : undefined} className={`rounded-2xl bg-card border border-border p-4 ${reviewPhase === "pending" ? "opacity-50" : ""} ${isAutoArchived ? "ring-2 ring-[#FFA39E] ring-offset-2 ring-offset-background" : ""}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DayDot active={isReviewActive} done={isReviewDone} />
                <span className={`text-body font-medium ${isReviewDone || isReviewActive ? "text-foreground" : "text-text-tertiary"}`}>
                  复查
                </span>
                <span className="text-caption text-text-tertiary font-mono" suppressHydrationWarning>
                  2026-05-16
                </span>
              </div>
              <span className={`inline-flex items-center h-6 px-2.5 rounded-full text-caption font-medium ${reviewLabelClass}`}>
                {reviewLabel}
              </span>
            </div>
            <div className="border-l-2 border-primary/40 pl-3 mb-2 ml-[7px]">
              <div className="text-caption text-text-tertiary mb-0.5">具体动作</div>
              <div className="text-body-sm leading-relaxed text-foreground">第 4 天复测体温（≤39.0℃）与采食情况，记录复查结果。</div>
            </div>
            {isAutoArchived ? (
              <div className="rounded-lg bg-[#FFF1F0] border border-[#FFA39E] px-3 py-2 mb-2 text-caption text-[#CF1322] leading-relaxed">
                复查逾期 48 小时，已自动归档
              </div>
            ) : isReviewActive ? (
              (() => {
                const d = new Date();
                d.setHours(23, 59, 0, 0);
                d.setDate(d.getDate() + 1);
                const pad = (n: number) => String(n).padStart(2, "0");
                const deadline = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                return (
                  <div className="rounded-lg bg-[#FFF7E6] border border-[#FFE1A8] px-3 py-2 mb-2 text-caption text-[#B8860B] leading-relaxed">
                    复查任务已开始，请在 <span className="font-medium">{deadline}</span> 前完成。
                  </div>
                );
              })()
            ) : null}
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
              <PackagePlus className="h-3.5 w-3.5" />
              <span>领物</span>
              <span className="ml-1 inline-flex items-center h-5 px-2 rounded-full bg-surface-subtle text-text-tertiary">无需</span>
            </div>

          </div>
        );
      })()}

      {pickupOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={() => setPickupOpen(false)}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 h-12 flex items-center justify-between border-b border-border">
              <div className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                <PackagePlus className="h-4 w-4 text-primary" />
                领物清单
              </div>
              <button
                type="button"
                onClick={() => setPickupOpen(false)}
                className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="rounded-xl bg-surface-subtle border border-border p-4 flex flex-col items-center">
                <div className="h-36 w-36 bg-white rounded-lg border border-border flex items-center justify-center mb-2">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <rect x="0" y="0" width="120" height="120" fill="white" />
                    {Array.from({ length: 144 }).map((_, i) => {
                      const x = (i % 12) * 10;
                      const y = Math.floor(i / 12) * 10;
                      const fill = (i * 7 + 3) % 3 === 0 ? "#0F172A" : "white";
                      return <rect key={i} x={x} y={y} width="10" height="10" fill={fill} />;
                    })}
                    <rect x="0" y="0" width="30" height="30" fill="white" />
                    <rect x="0" y="0" width="30" height="30" fill="none" stroke="#0F172A" strokeWidth="6" />
                    <rect x="90" y="0" width="30" height="30" fill="white" />
                    <rect x="90" y="0" width="30" height="30" fill="none" stroke="#0F172A" strokeWidth="6" />
                    <rect x="0" y="90" width="30" height="30" fill="white" />
                    <rect x="0" y="90" width="30" height="30" fill="none" stroke="#0F172A" strokeWidth="6" />
                  </svg>
                </div>
                <div className="font-mono text-body-sm text-foreground">{pickupCode}</div>
                <div className="text-caption text-text-tertiary mt-1">向库管出示二维码核销领药</div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="text-caption text-text-tertiary mb-2">药品</div>
                <ul className="divide-y divide-border -mx-1">
                  {[
                    { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", qty: "1 瓶" },
                    { name: "头孢噻呋钠", spec: "1g / 支", qty: "3 支" },
                  ].map((m) => (
                    <li key={m.name} className="px-1 py-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-body-sm text-foreground">{m.name}</div>
                        <div className="text-caption text-text-tertiary mt-0.5">{m.spec}</div>
                      </div>
                      <span className="font-mono text-body-sm text-text-secondary shrink-0">× {m.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </>

  );
}

// === 执行页：仅显示当前进行中的当天 checklist ===
export function ActiveDayExecute({ pickupCode, tags, day = 2, date = "05/13", workOrderId, onReadyChange }: { pickupCode: string | null; tags: string[]; day?: number; date?: string; workOrderId: string; onReadyChange?: (ready: boolean) => void }) {
  // 疾病治疗工单（WO 前缀，非 HF/LS）默认需要每日测温；可被诊断页开关覆盖
  let withTemp = workOrderId.startsWith("WO");
  if (typeof window !== "undefined") {
    const flag = window.localStorage.getItem(`health:dailyTemp:${workOrderId}`);
    if (flag === "1") withTemp = true;
    else if (flag === "0") withTemp = false;
  }
  return (
    <div>
      <ChecklistDay day={day} date={date} pickupCode={pickupCode} tags={tags} dayState="active" initialNote="" workOrderId={workOrderId} withTemp={withTemp} onReadyChange={onReadyChange} />
    </div>
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
  workOrderId,
  withTemp = false,
  onReadyChange,
}: {
  day: number;
  date: string;
  pickupCode: string | null;
  tags: string[];
  dayState: DayState;
  initialNote?: string;
  readOnly?: boolean;
  workOrderId?: string;
  withTemp?: boolean;
  onReadyChange?: (ready: boolean) => void;
}) {

  const isActive = dayState === "active";
  const isDone = dayState === "done";
  const isPending = dayState === "pending";
  const interactive = isActive && !readOnly;

  const claimed = useClaimed();
  const pickupClaimed = pickupCode ? claimed.includes(pickupCode) : true;

  const [items, setItems] = useState<ExecItem[]>(() => {
    const base = buildDayItems(day, tags, withTemp);
    if (isDone) return base.map((it) => ({ ...it, status: "done" as ItemStatus }));
    return base;
  });
  const [dayNote, setDayNote] = useState(initialNote);
  const [noteEditing, setNoteEditing] = useState(false);
  const [temps, setTemps] = useState<Record<string, string>>({});
  const [evidencePhotos, setEvidencePhotos] = useState<number[]>([]);

  // 领药完成后，用药任务自动标记完成（信息从领取单同步）
  useEffect(() => {
    if (!interactive || !pickupClaimed) return;
    setItems((arr) =>
      arr.map((it) =>
        it.needMed && it.status !== "done"
          ? { ...it, status: "done" as ItemStatus, scanCode: pickupCode ?? undefined }
          : it,
      ),
    );
  }, [pickupClaimed, interactive, pickupCode]);

  // 提交就绪：领药完成 + 测温（若需要）已填 + 至少一张治疗证据照片
  const tempItem = items.find((i) => i.title.includes("测温"));
  const tempReady = !withTemp || Boolean((temps[tempItem?.id ?? ""] ?? "").trim());
  const ready = interactive && pickupClaimed && tempReady && evidencePhotos.length > 0;
  useEffect(() => {
    onReadyChange?.(ready);
  }, [ready, onReadyChange]);

  const total = items.length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const allSettled = doneCount === total;
  const dayDone = isDone || (isActive && allSettled);

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

  const pickupDone = isDone || (isActive && dayDone);
  // 仍需领物：所有填写禁用
  const inputsLocked = interactive && Boolean(pickupCode) && !pickupClaimed;
  const medItems = items.filter((it) => it.needMed);

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      {/* Day header */}
      <div className="px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DayDot active={isActive} done={dayDone} />
          <span className={`text-body font-medium ${isPending ? "text-text-tertiary" : "text-foreground"}`}>
            执行任务{String(day).padStart(2, "0")}
          </span>
          <span className="text-caption text-text-tertiary font-mono">{date} 13:08</span>
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
              {pickupClaimed || pickupDone ? (
                <div className="flex items-center justify-between px-3 h-10 rounded-lg text-body-sm bg-surface-subtle text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <PackagePlus className="h-3.5 w-3.5" />
                    已领药 · {pickupCode}
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <Link
                  to="/m/health/$id_/execute/$pickupId"
                  params={{ id: workOrderId ?? pickupCode.replace(/^PK-?/i, "WO-"), pickupId: pickupCode }}
                  className="flex items-center justify-between px-3 h-10 rounded-lg text-body-sm"
                  style={{ backgroundColor: "color-mix(in oklab, #F59E0B 12%, transparent)", color: "#8A5A0A" }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <PackagePlus className="h-3.5 w-3.5" />
                    需领物 · 点击查看领物清单
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Link>
              )}
            </div>
          )}

          {/* 用药信息（只读，无勾选） */}
          {medItems.length > 0 && (
            <div className={`px-4 pb-3 space-y-2 ${inputsLocked ? "opacity-60" : ""}`}>
              <div className="text-caption text-text-tertiary">用药信息</div>
              {medItems.map((it) => (
                <div key={it.id} className="rounded-xl border border-border bg-card px-3 py-2.5">
                  <div className="text-body text-foreground">{it.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-caption">
                    <span className={pickupClaimed ? "text-primary font-medium" : "text-text-tertiary"}>
                      {pickupClaimed ? (it.manufacturer ?? "-") : "-"}
                    </span>
                    <span className="text-text-tertiary">·</span>
                    <span className={`font-mono ${pickupClaimed ? "text-text-secondary" : "text-text-tertiary"}`}>
                      {pickupClaimed ? (it.batchNo ?? "-") : "-"}
                    </span>
                  </div>
                  {it.desc && (
                    <div className="text-caption text-text-tertiary mt-1">{it.desc}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {interactive && withTemp && tempItem && (
            <div className="px-4 pb-3">
              <div className={`rounded-xl border border-border bg-card px-3 py-3 ${inputsLocked ? "opacity-60" : ""}`}>
                <div className="text-body-sm text-foreground mb-2">
                  每日测温 <span className="text-[var(--state-danger)]">*</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    disabled={inputsLocked}
                    value={temps[tempItem.id] ?? ""}
                    onChange={(e) => setTemps((m) => ({ ...m, [tempItem.id]: e.target.value }))}
                    placeholder="输入直肠温度"
                    className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-body-sm disabled:bg-surface-subtle disabled:cursor-not-allowed"
                  />
                  <span className="text-caption text-text-tertiary">℃</span>
                </div>
              </div>
            </div>
          )}

          {interactive && (
            <div className="px-4 pb-3">
              <div className={`rounded-xl border border-border bg-card px-3 py-3 ${inputsLocked ? "opacity-60" : ""}`}>
                <div className="text-body-sm text-foreground mb-2 flex items-center justify-between">
                  <span>
                    治疗证据照片 <span className="text-[var(--state-danger)]">*</span>
                  </span>
                  <span className="text-caption text-text-tertiary">{evidencePhotos.length} / 6</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {evidencePhotos.map((pid) => (
                    <div key={pid} className="relative aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border">
                      <button
                        type="button"
                        disabled={inputsLocked}
                        onClick={() => setEvidencePhotos((p) => p.filter((x) => x !== pid))}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/85 text-background inline-flex items-center justify-center shadow disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {evidencePhotos.length < 6 && (
                    <label
                      className={`aspect-square rounded-lg bg-surface-subtle flex flex-col items-center justify-center gap-1 text-text-tertiary transition-colors ${
                        inputsLocked ? "cursor-not-allowed" : "cursor-pointer active:bg-border"
                      }`}
                    >
                      <Camera className="h-5 w-5" />
                      <span className="text-caption">拍照</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        disabled={inputsLocked}
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          files.forEach(() => setEvidencePhotos((p) => [...p, Date.now() + Math.random()]));
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
                <div className="mt-2 text-caption text-text-tertiary">
                  请上传至少一张本次治疗的现场照片
                </div>
              </div>
            </div>
          )}

          <ul className="px-4 pb-3 space-y-2">



            {interactive ? (
              <li>
                {noteEditing || !dayNote ? (
                  <div
                    className={`rounded-xl border ${
                      dayNote ? "border-primary/40 bg-brand-subtle/20" : "border-border bg-card"
                    } px-3 py-3`}
                  >
                    <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mb-2">
                      <FileText className="h-3 w-3" /> 备注（选填）
                    </div>
                    <textarea
                      value={dayNote}
                      onChange={(e) => setDayNote(e.target.value)}
                      onBlur={() => setNoteEditing(false)}
                      autoFocus={noteEditing}
                      placeholder="填写本日执行备注"
                      className="w-full min-h-[72px] rounded-md bg-transparent text-body-sm text-foreground placeholder:text-text-tertiary resize-none focus:outline-none leading-relaxed px-3 py-2"
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
  // 统一虚线圆环，颜色与右侧标签对应：已完成=绿，进行中=蓝，待执行=灰
  const color = done ? "#23A969" : active ? "#22ACEB" : "var(--text-tertiary)";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <circle cx="8" cy="8" r="7" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}





