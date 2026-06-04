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
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

import { useRole, canExecute, canDiagnose } from "@/lib/mobile-role";

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
    "WO-2298": "#A2298",
    "WO-2410": "#A2410",
    "WO-2420": "#A2420",
    "WO-2430": "#A2430",
    "WO-2440": "#A2440",
    "WO-2199": "#A2199",
    "HF-0702": "#A2150",
    "HF-0688": "#A2270",
    "PP-2501": "#A2710",
  };
  const singleEar = singleEarMap[id];
  const isSingle = isHoof || Boolean(singleEar);
  const earTag = singleEar ?? (isHoof ? "#A2150" : "#A2381");
  const execTags: string[] = isSingle ? [earTag] : ["#A2381", "#A2382", "#A2383"];

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

  

  return (
    <MobileShell
      title="工单详情"
      back
      hideTabBar
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

      <Dialog open={recordsOpen} onOpenChange={setRecordsOpen}>
        <DialogContent className="max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-title">诊疗信息摘要</DialogTitle>
          </DialogHeader>
          {summary && (
            <div className="space-y-3 max-h-[65vh] overflow-y-auto -mx-1 px-1">
              <div className="flex items-center gap-2">
                <span className="text-caption text-text-tertiary">来源</span>
                <span className="font-mono text-caption text-foreground">{summary.id}</span>
                <span className="text-text-tertiary text-caption">·</span>
                <span className="text-caption text-text-tertiary">{summary.date}</span>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                <div className="text-caption text-text-tertiary">诊断结论</div>
                <div className="text-body-sm text-foreground">{summary.conclusion}</div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
                <div className="text-caption text-text-tertiary">处方信息</div>
                <p className="text-body-sm text-text-secondary leading-relaxed">{summary.prescription}</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-3 space-y-3">
                <div className="text-caption text-text-tertiary">用药记录</div>
                <div className="relative pl-4">
                  <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border" />
                  <div className="space-y-4">
                    {summary.medGroups.map((g) => (
                      <div key={g.date} className="relative">
                        <span className="absolute -left-4 top-1.5 h-[7px] w-[7px] rounded-full bg-primary ring-2 ring-background" />
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-caption text-text-secondary">{g.date}</span>
                          <span className="text-caption text-text-tertiary">· {g.items.length} 条</span>
                        </div>
                        <div className="space-y-1.5">
                          {g.items.map((m) => (
                            <div
                              key={m.name}
                              className="grid grid-cols-[1fr_auto_auto] gap-3 items-center"
                            >
                              <div className="text-body-sm text-foreground truncate">{m.name}</div>
                              <div className="text-caption text-primary truncate text-center">
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
        </DialogContent>
      </Dialog>
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
};

// 根据处方拆解每日任务：每种药品 = 一次任务（需扫码核验），加上不需用药的常规任务（如测温）
function buildDayItems(day: number, _tags: string[]): ExecItem[] {
  return [
    {
      id: `d${day}-t1`,
      title: "氟尼辛葡甲胺注射液",
      desc: "2ml / 次 · 肌肉注射",
      status: "pending",
      needMed: true,
    },
    {
      id: `d${day}-t2`,
      title: "头孢噻呋钠",
      desc: "1g / 次 · 肌肉注射",
      status: "pending",
      needMed: true,
    },
  ];
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
              <div className="rounded-lg bg-[#FFF7E6] border border-[#FFE1A8] px-3 py-2 mb-2 text-caption text-[#B8860B] leading-relaxed">
                复查任务于执行完成后第 1 个自然日 00:00 自动触发；触发后 48 小时内未操作，将自动标记为<span className="font-medium">「逾期未完成」</span>，工单转为已完成。
              </div>
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

              <div className="rounded-xl border border-border p-4">
                <div className="text-caption text-text-tertiary mb-2">物品</div>
                <ul className="divide-y divide-border -mx-1">
                  {[
                    { name: "一次性注射器", qty: "8 支" },
                    { name: "消毒酒精棉", qty: "1 盒" },
                  ].map((m) => (
                    <li key={m.name} className="px-1 py-2.5 flex items-center justify-between">
                      <span className="text-body-sm text-foreground">{m.name}</span>
                      <span className="font-mono text-body-sm text-text-secondary">× {m.qty}</span>
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
export function ActiveDayExecute({ pickupCode, tags, day = 2, date = "05/13", workOrderId }: { pickupCode: string | null; tags: string[]; day?: number; date?: string; workOrderId: string }) {
  return (
    <div>
      <ChecklistDay day={day} date={date} pickupCode={pickupCode} tags={tags} dayState="active" initialNote="" workOrderId={workOrderId} />
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
}: {
  day: number;
  date: string;
  pickupCode: string | null;
  tags: string[];
  dayState: DayState;
  initialNote?: string;
  readOnly?: boolean;
  workOrderId?: string;
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
  const [temps, setTemps] = useState<Record<string, string>>({});
  const [scanFor, setScanFor] = useState<string | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [dayVerified, setDayVerified] = useState<boolean>(isDone);
  const [mismatchOpen, setMismatchOpen] = useState(false);
  const expectedTag = tags[0] ?? "#A0000";


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
                  to="/m/health/$id_/execute/$pickupId"
                  params={{ id: workOrderId ?? pickupCode.replace(/^PK-?/i, "WO-"), pickupId: pickupCode }}

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


          <div className="px-4 pb-2 text-caption text-text-tertiary">
            处方拆解的本日任务
          </div>

          <div className="px-4 pb-3">
            {interactive && (
              dayVerified ? (
                <div className="rounded-xl border border-primary/30 bg-brand-subtle/20 px-3 py-2.5">
                  <div className="text-body-sm text-primary inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    本次执行已完成牛只核验 · <span className="font-mono">{expectedTag}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card px-3 py-3 space-y-2">
                  <div className="text-caption text-text-tertiary">执行本次记录前，请先扫描耳码核验牛只</div>
                  <button
                    type="button"
                    onClick={() => setVerifyOpen(true)}
                    className="w-full h-9 rounded-lg border border-primary/40 text-primary text-body-sm inline-flex items-center justify-center gap-1.5"
                  >
                    <ScanLine className="h-4 w-4" /> 扫描耳码核验牛只
                  </button>
                </div>
              )
            )}
          </div>

          <ul className="px-4 pb-3 space-y-2">
            {items.map((it) => {
              const done = it.status === "done";
              const blocked = it.status === "blocked";
              const needMed = it.needMed;
              const isVerified = dayVerified;
              return (
                <li key={it.id} className="space-y-2">
                  <div
                    className={`w-full rounded-xl border px-3 py-2.5 transition-all ${
                      done
                        ? "border-primary/40 bg-brand-subtle/30"
                        : blocked
                          ? "border-[var(--state-danger)]/40 bg-[var(--state-danger)]/5"
                          : isActive
                            ? `border-border bg-card ${interactive && !isVerified ? "opacity-40 grayscale bg-muted/40 pointer-events-none select-none" : ""}`
                            : "border-border bg-card opacity-80"
                    }`}
                  
                  >
                    <div className="flex items-start gap-2.5">
                      {done ? (
                        <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      ) : blocked ? (
                        <AlertTriangle className="h-4 w-4 text-[var(--state-danger)] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={`text-body ${done || isActive ? "text-foreground" : "text-text-tertiary"}`}>
                          {it.title}
                        </div>
                        {it.desc && (
                          <div className="text-caption text-text-tertiary mt-0.5">{it.desc}</div>
                        )}
                        {done && needMed && it.scanCode && (
                          <div className="text-caption text-primary mt-1 inline-flex items-center gap-1">
                            <ScanLine className="h-3 w-3" /> 已扫码核验 · <span className="font-mono">{it.scanCode}</span>
                          </div>
                        )}
                        {done && !needMed && it.title.includes("测温") && temps[it.id] && (
                          <div className="text-caption text-primary mt-1">
                            体温：<span className="font-mono">{temps[it.id]} ℃</span>
                          </div>
                        )}
                      </div>
                      {interactive && needMed && !done && isVerified && (
                        <button
                          type="button"
                          onClick={() => setScanFor(it.id)}
                          className="shrink-0 h-8 w-8 -mt-0.5 -mr-1 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center"
                          aria-label="扫码核验用药"
                        >
                          <ScanLine className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {interactive && isVerified && !needMed && !done && it.title.includes("测温") && (
                      <div className="mt-2.5 pl-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            value={temps[it.id] ?? ""}
                            onChange={(e) => setTemps((m) => ({ ...m, [it.id]: e.target.value }))}
                            placeholder="输入直肠温度"
                            className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-body-sm"
                          />
                          <span className="text-caption text-text-tertiary">℃</span>
                        </div>
                        <button
                          type="button"
                          disabled={!(temps[it.id] ?? "").trim()}
                          onClick={() => toggleDone(it.id, it.status)}
                          className="w-full h-9 rounded-lg border border-primary/40 text-primary text-body-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckSquare className="h-4 w-4" /> 标记完成
                        </button>
                      </div>
                    )}
                    {interactive && done && (
                      <div className="pl-6 mt-2">
                        <button
                          type="button"
                          onClick={() => update(it.id, { status: "pending", scanCode: undefined })}
                          className="text-caption text-text-tertiary active:text-foreground"
                        >
                          撤销
                        </button>
                      </div>
                    )}
                  </div>
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
                        className="w-full min-h-[72px] rounded-md bg-transparent text-body-sm text-foreground placeholder:text-text-tertiary resize-none focus:outline-none px-3 py-2 leading-relaxed"
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

      {scanFor && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setScanFor(null)}>
          <div className="flex items-center justify-between px-4 h-14 text-white">
            <span className="text-body font-medium">扫描药品包装二维码</span>
            <button onClick={() => setScanFor(null)} className="h-9 w-9 inline-flex items-center justify-center">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-8" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full aspect-square max-w-[280px] rounded-2xl border-2 border-white/60">
              <ScanLine className="absolute inset-0 m-auto h-16 w-16 text-white/40" />
              <div className="absolute -top-px left-0 right-0 h-0.5 bg-primary animate-pulse" />
            </div>
          </div>
          <div className="px-6 pb-10 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-center text-caption text-white/70">
              将二维码放入框内，识别后自动完成核验
            </div>
            <button
              type="button"
              onClick={() => {
                const code = `MED-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
                update(scanFor, { status: "done", scanCode: code });
                setScanFor(null);
              }}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
            >
              <ScanLine className="h-4 w-4" /> 模拟扫码成功
            </button>
          </div>
        </div>
      )}

      {verifyOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col" onClick={() => setVerifyOpen(false)}>
          <div className="flex items-center justify-between px-4 h-14 text-white">
            <span className="text-body font-medium">扫描牛只耳码</span>
            <button onClick={() => setVerifyOpen(false)} className="h-9 w-9 inline-flex items-center justify-center">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-8" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full aspect-square max-w-[280px] rounded-2xl border-2 border-white/60">
              <ScanLine className="absolute inset-0 m-auto h-16 w-16 text-white/40" />
              <div className="absolute -top-px left-0 right-0 h-0.5 bg-primary animate-pulse" />
            </div>
          </div>
          <div className="px-6 pb-10 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-center text-caption text-white/70">
              请扫描牛只耳码，核验成功后方可执行任务<br />
              当前任务对应牛只：<span className="font-mono text-white/90">{expectedTag}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setDayVerified(true);
                setVerifyOpen(false);
              }}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" /> 模拟核验成功
            </button>
            <button
              type="button"
              onClick={() => {
                setVerifyOpen(false);
                setMismatchOpen(true);
              }}
              className="w-full h-11 rounded-lg border border-white/30 text-white/90 text-body inline-flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="h-4 w-4" /> 模拟扫到其他牛只
            </button>
          </div>
        </div>
      )}

      {mismatchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setMismatchOpen(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-2xl bg-card p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-full bg-[var(--state-danger)]/15 inline-flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-[var(--state-danger)]" />
              </span>
              <h3 className="text-card-title text-foreground">牛只不匹配</h3>
            </div>
            <p className="text-body-sm text-text-secondary leading-relaxed">
              请确认牛只是否为
              <span className="font-mono text-foreground"> {expectedTag}</span>
              ，确认后请重新扫描耳码。
            </p>
            <button
              type="button"
              onClick={() => setMismatchOpen(false)}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-body-sm"
            >
              我知道了
            </button>
          </div>
        </div>
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





