import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  X,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Phone,
  MessageSquare,
  Camera,
  Send,
  Monitor,
  Copy,
  Inbox,
  Ban,
  MessageCircleWarning,
  Link2,
  PackageMinus,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole, canApprove, canExecute } from "@/lib/mobile-role";
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
  head: () => ({ meta: [{ title: "任务详情 · 奇点智牧" }] }),
  component: TaskDetailPage,
});

type Status = "待审批" | "待响应" | "进行中" | "已完成" | "已驳回" | "已终止";

const statusMap: Record<Status, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待审批: { tag: "tag tag-warning", icon: ClipboardList, color: "text-[var(--state-warning)]" },
  待响应: { tag: "tag tag-warning", icon: Inbox, color: "text-[var(--state-warning)]" },
  进行中: { tag: "tag tag-brand", icon: PlayCircle, color: "text-primary" },
  已驳回: { tag: "tag tag-danger", icon: AlertTriangle, color: "text-[var(--state-danger)]" },
  已完成: { tag: "tag tag-success", icon: CheckCircle2, color: "text-[var(--state-success)]" },
  已终止: { tag: "tag tag-muted", icon: Ban, color: "text-text-tertiary" },
};

// 根据 ID 前缀决定 mock 类型：LS- 损耗、HF- 修蹄(待响应)、其余 健康
function mockTask(id: string, role: string) {
  if (id.startsWith("LS-")) {
    return {
      id,
      kind: "损耗" as const,
      taskType: "取药" as const,
      target: "#A2150",
      barn: "2 号牛舍",
      type: "疾病死亡",
      event: "产后子宫破裂",
      proposer: "孙明",
      proposerPhone: "138 0000 0002",
      who: "李雨晴",
      status: "待审批" as Status,
      createdAt: "2026-05-20 08:20",
      desc: "#A2150 产后子宫破裂死亡，估损 ¥ 8,400，附现场照片与初步死因记录。",
      photos: 3,
      needSupply: true,
      lossItems: [{ item: "促宫缩注射液", qty: "3 支" }],
    };
  }
  if (id.startsWith("HF-")) {
    return {
      id,
      kind: "修蹄" as const,
      taskType: "修蹄" as const,
      target: "#A2150",
      barn: "2 号牛舍",
      type: "批次修蹄",
      event: "右后蹄趾间皮炎",
      proposer: "李雨晴",
      proposerPhone: "138 0000 0001",
      who: "外部·张师傅",
      status: (role === "hoof_trimmer" ? "待响应" : "进行中") as Status,
      createdAt: "2026-05-20 07:30",
      desc: "巡检发现 #A2150 右后蹄趾间皮炎，需进行清创修蹄并涂抹药剂。",
      photos: 2,
      needSupply: false,
      lossItems: [] as { item: string; qty: string }[],
    };
  }
  return {
    id,
    kind: "健康" as const,
    taskType: "用药" as const,
    target: "#A2381",
    barn: "3 号牛舍",
    type: "疾病治疗",
    event: "持续高烧 2 小时",
    proposer: "陈晓东",
    proposerPhone: "138 0000 0001",
    who: "李雨晴",
    status: (role === "vet_assistant" ? "进行中" : "待审批") as Status,
    createdAt: "2026-05-20 09:08",
    desc: "饲养员巡检发现该牛持续高烧 2 小时 (39.6℃)，同时表现出食欲下降、反刍减少。建议立即抗生素治疗并进入隔离观察。",
    photos: 2,
    needSupply: false,
    lossItems: [] as { item: string; qty: string }[],
  };
}

function TaskDetailPage() {
  const { id } = useParams({ from: "/m/health/$id" });
  const role = useRole();
  const navigate = useNavigate();
  const o = mockTask(id, role);

  const isLoss = o.kind === "损耗";
  const isExecKind = !isLoss; // 健康/执行类

  const [confirm, setConfirm] = useState<
    | "loss-approve"
    | "loss-reject"
    | "loss-supply-approve"
    | "loss-supply-reject"
    | "response-accept"
    | "response-reject"
    | "exec-finish"
    | "feedback-submit"
    | null
  >(null);
  const [execNote, setExecNote] = useState("");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [showExec, setShowExec] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  // 损耗审批 step：1 = 是否认可耗损；2 = (若认可且申请) 是否批准物资申请
  const [lossStep, setLossStep] = useState<1 | 2>(1);

  const s = statusMap[o.status];
  const Icon = s.icon;

  const isApprover = canApprove(role);
  const showHealthApproval = isExecKind && isApprover && o.status === "待审批";
  const showLossApproval = isLoss && isApprover && o.status === "待审批";
  const showResponse = isExecKind && canExecute(role) && o.status === "待响应";
  const showExecArea = isExecKind && canExecute(role) && o.status === "进行中";

  const copyPcLink = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/production/disease`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <MobileShell title="任务详情" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-3">
        {/* 状态卡 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${s.color}`} />
              <span className="font-mono text-body text-foreground">{o.id}</span>
              <span className="tag tag-muted">{o.kind}</span>
            </div>
            <span className={s.tag}>{o.status}</span>
          </div>
          <div className="mt-2 text-section-title text-foreground">
            {o.target} · {o.event}
          </div>
          <div className="text-caption text-text-tertiary mt-1">
            {o.barn} · 创建于 {o.createdAt}
          </div>
        </div>

        {/* 健康/执行类·待审批 PC 端提示 */}
        {showHealthApproval && (
          <div className="rounded-xl border border-[var(--state-warning)]/40 bg-[var(--state-warning)]/10 p-4">
            <div className="flex items-start gap-3">
              <Monitor className="h-5 w-5 text-[var(--state-warning)] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-body-sm font-medium text-foreground">
                  请前往 PC 端完成审批与派单
                </div>
                <div className="text-caption text-text-tertiary mt-1 leading-relaxed">
                  健康 / 执行类工单的正式审批、执行计划配置和派单仅在 PC 端进行。
                  小程序仅作待办提醒。
                </div>
                <button
                  onClick={copyPcLink}
                  className="mt-2 h-8 px-3 rounded-lg bg-card border border-border text-caption text-text-secondary inline-flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" /> 复制 PC 端审批链接
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 字段网格 */}
        <div className="rounded-xl bg-card border border-border divide-y divide-border">
          <Row label="任务类型" value={<span className="tag tag-muted">{o.type}</span>} />
          <Row
            label="处理对象"
            value={<span className="text-body text-foreground">{o.target}</span>}
          />
          <Row
            label="提出事件"
            value={<span className="text-body text-foreground">{o.event}</span>}
          />
          <Row
            label="提出者"
            value={
              <div className="flex items-center gap-2">
                <span className="text-body text-foreground">{o.proposer}</span>
                <a
                  href={`tel:${o.proposerPhone.replace(/\s/g, "")}`}
                  className="h-6 w-6 rounded-full bg-brand-subtle text-primary inline-flex items-center justify-center"
                >
                  <Phone className="h-3 w-3" />
                </a>
                <button className="h-6 w-6 rounded-full bg-brand-subtle text-primary inline-flex items-center justify-center">
                  <MessageSquare className="h-3 w-3" />
                </button>
              </div>
            }
          />
          <Row
            label="负责人"
            value={<span className="text-body text-foreground">{o.who}</span>}
          />
          {isLoss && (
            <Row
              label="是否申请补给"
              value={
                <span className={`tag ${o.needSupply ? "tag-warning" : "tag-muted"}`}>
                  {o.needSupply ? "申请补给" : "不申请"}
                </span>
              }
            />
          )}
        </div>

        {/* 损耗物资 */}
        {isLoss && o.lossItems.length > 0 && (
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
              <PackageMinus className="h-3 w-3" /> 损耗物资
            </div>
            <div className="space-y-1.5">
              {o.lossItems.map((l, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-body-sm text-foreground"
                >
                  <span>{l.item}</span>
                  <span className="text-text-secondary">{l.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 任务说明 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="text-caption text-text-tertiary mb-1.5">任务说明</div>
          <p className="text-body-sm text-text-secondary leading-relaxed">{o.desc}</p>
        </div>

        {/* 现场照片 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="text-caption text-text-tertiary mb-2">
            现场照片 · {o.photos} 张
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: o.photos }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border"
              />
            ))}
          </div>
        </div>

        {/* 执行记录（执行人可见，独立于反馈） */}
        {showExecArea && showExec && (
          <div className="rounded-xl bg-card border border-primary/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-body-sm font-medium text-foreground inline-flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 text-primary" /> 执行记录 · {o.taskType}
              </div>
              <span className="text-caption text-text-tertiary">现场作业回填</span>
            </div>
            <ExecFields taskType={o.taskType} value={execNote} onChange={setExecNote} />
            <button className="w-full h-10 rounded-lg border border-dashed border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1.5">
              <Camera className="h-4 w-4" /> 添加现场照片 / 视频
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExec(false)}
                className="flex-1 h-11 rounded-lg border border-border text-body-sm text-text-secondary"
              >
                暂存
              </button>
              <button
                disabled={!execNote.trim()}
                onClick={() => setConfirm("exec-finish")}
                className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> 提交完成
              </button>
            </div>
          </div>
        )}

        {/* 反馈标注（执行人可见，任意时刻可提交，与执行记录互不影响） */}
        {isExecKind && canExecute(role) &&
          (o.status === "进行中" || o.status === "待响应" || o.status === "已完成") &&
          showFeedback && (
            <div className="rounded-xl bg-card border border-[var(--state-warning)]/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-body-sm font-medium text-foreground inline-flex items-center gap-1.5">
                  <MessageCircleWarning className="h-4 w-4 text-[var(--state-warning)]" />
                  反馈标注
                </div>
                <span className="text-caption text-text-tertiary">异常 / 补充说明</span>
              </div>
              <div className="rounded-lg bg-[var(--state-warning)]/10 px-3 py-2 text-caption text-text-secondary leading-relaxed">
                反馈不会改变工单当前状态；提交后由原审批 / 派单责任人在 PC 端处理，
                处理结果将同步通知你并在工单上形成备注。
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["牛只状态异常", "用药不足", "环境 / 设施问题", "操作受阻", "其他"].map((t) => (
                  <button
                    key={t}
                    className="px-2.5 h-7 rounded-full bg-surface-subtle border border-border text-caption text-text-secondary"
                  >
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="描述异常现象、影响范围、当前处置建议等"
                rows={4}
                className="w-full p-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary resize-none"
              />
              <button className="w-full h-10 rounded-lg border border-dashed border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1.5">
                <Camera className="h-4 w-4" /> 上传反馈照片 / 视频
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 h-11 rounded-lg border border-border text-body-sm text-text-secondary"
                >
                  取消
                </button>
                <button
                  disabled={!feedbackNote.trim()}
                  onClick={() => setConfirm("feedback-submit")}
                  className="flex-1 h-11 rounded-lg bg-[var(--state-warning)] text-white text-body-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> 提交反馈
                </button>
              </div>
            </div>
          )}

        {/* 反馈历史 / 关联工单（mock 展示） */}
        {o.status === "已终止" && (
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
              <Link2 className="h-3 w-3" /> 反馈处理结果
            </div>
            <div className="text-body-sm text-foreground">
              终止后新建工单 · 关联 WO-2418
            </div>
            <div className="text-caption text-text-tertiary mt-1 leading-relaxed">
              原工单因牛只状态变化提前终止，已在 PC 端基于反馈新建后续处理工单。
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      {showLossApproval ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] space-y-2">
          {lossStep === 1 && (
            <>
              <div className="text-caption text-text-tertiary text-center">
                第 1 步 · 是否认可本次损耗
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirm("loss-reject")}
                  className="flex-1 h-12 rounded-lg border border-border text-body text-text-secondary inline-flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" /> 不认可
                </button>
                <button
                  onClick={() => {
                    if (o.needSupply) setLossStep(2);
                    else setConfirm("loss-approve");
                  }}
                  className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> 认可损耗
                </button>
              </div>
            </>
          )}
          {lossStep === 2 && (
            <>
              <div className="text-caption text-text-tertiary text-center">
                第 2 步 · 是否通过物资补给申请
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirm("loss-supply-reject")}
                  className="flex-1 h-12 rounded-lg border border-border text-body text-text-secondary inline-flex items-center justify-center gap-1.5"
                >
                  不通过申请
                </button>
                <button
                  onClick={() => setConfirm("loss-supply-approve")}
                  className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> 通过申请
                </button>
              </div>
            </>
          )}
        </div>
      ) : showHealthApproval ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            onClick={copyPcLink}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
          >
            <Monitor className="h-4 w-4" /> 复制 PC 端审批链接
          </button>
        </div>
      ) : showResponse ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 flex gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            onClick={() => setConfirm("response-reject")}
            className="flex-1 h-12 rounded-lg border border-border text-body text-text-secondary inline-flex items-center justify-center gap-1.5"
          >
            <X className="h-4 w-4" /> 拒绝
          </button>
          <button
            onClick={() => setConfirm("response-accept")}
            className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" /> 接单
          </button>
        </div>
      ) : showExecArea ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 flex gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            onClick={() => setShowFeedback((v) => !v)}
            className="flex-1 h-12 rounded-lg border border-[var(--state-warning)]/40 text-[var(--state-warning)] text-body inline-flex items-center justify-center gap-1.5"
          >
            <MessageCircleWarning className="h-4 w-4" />
            {showFeedback ? "收起反馈" : "反馈标注"}
          </button>
          <button
            onClick={() => setShowExec((v) => !v)}
            className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
          >
            <PlayCircle className="h-4 w-4" />
            {showExec ? "收起执行" : "执行记录"}
          </button>
        </div>
      ) : (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            onClick={() => navigate({ to: "/m/health" })}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body"
          >
            返回任务列表
          </button>
        </div>
      )}

      <AlertDialog open={!!confirm} onOpenChange={(v) => !v && setConfirm(null)}>
        <AlertDialogContent className="!max-w-[440px] !w-full !top-auto !bottom-0 !left-1/2 !-translate-x-1/2 !translate-y-0 !rounded-b-none !rounded-t-2xl !border-0 !p-0 data-[state=open]:!slide-in-from-bottom-4 data-[state=closed]:!slide-out-to-bottom-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <AlertDialogHeader className="px-6 pt-7 pb-2 sm:text-center">
            <AlertDialogTitle className="text-section-title">
              {confirm === "loss-approve" && "确认认可损耗?"}
              {confirm === "loss-reject" && "确认不认可该损耗?"}
              {confirm === "loss-supply-approve" && "确认通过物资补给申请?"}
              {confirm === "loss-supply-reject" && "确认驳回物资补给申请?"}
              {confirm === "response-accept" && "确认接单?"}
              {confirm === "response-reject" && "确认拒绝接单?"}
              {confirm === "exec-finish" && "确认提交执行完成?"}
              {confirm === "feedback-submit" && "提交反馈?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-sm text-text-tertiary mt-1 leading-relaxed">
              任务 {o.id} · {o.target}
              <br />
              {confirm === "loss-approve" && "认可后将记录库存损耗，流程结束。"}
              {confirm === "loss-reject" && "不认可后系统将提醒上报人，流程结束。"}
              {confirm === "loss-supply-approve" &&
                "通过后将自动生成补给任务流入上报人任务池。"}
              {confirm === "loss-supply-reject" &&
                "不通过物资申请，仅认可损耗，上报人将收到通知。"}
              {confirm === "response-accept" && "接单后该工单进入“进行中”状态。"}
              {confirm === "response-reject" &&
                "拒绝后将通知派单人重新分配执行人。"}
              {confirm === "exec-finish" && "提交后等待复核完成。"}
              {confirm === "feedback-submit" &&
                "反馈将同步给原审批 / 派单责任人，不会直接改变工单状态。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!flex-row gap-3 px-4 pt-5">
            <AlertDialogCancel className="flex-1 h-12 m-0 rounded-xl bg-surface-subtle border-0 text-body text-text-secondary">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className={`flex-1 h-12 rounded-xl text-body ${
                confirm === "loss-reject" ||
                confirm === "loss-supply-reject" ||
                confirm === "response-reject"
                  ? "bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white"
                  : confirm === "feedback-submit"
                  ? "bg-[var(--state-warning)] hover:bg-[var(--state-warning)]/90 text-white"
                  : "bg-primary text-primary-foreground"
              }`}
              onClick={() => {
                setConfirm(null);
                if (confirm === "feedback-submit") {
                  setShowFeedback(false);
                  setFeedbackNote("");
                  return;
                }
                if (confirm === "exec-finish") {
                  setShowExec(false);
                  setExecNote("");
                }
                navigate({ to: "/m/health" });
              }}
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-4 h-12 flex items-center justify-between">
      <span className="text-body-sm text-text-tertiary">{label}</span>
      <div>{value}</div>
    </div>
  );
}

// 按任务类型呈现差异化的执行记录字段（mock 简化版）
function ExecFields({
  taskType,
  value,
  onChange,
}: {
  taskType: "取药" | "用药" | "修蹄" | "干奶" | "免疫" | "产后护理" | "驱虫" | "普修" | "复查";
  value: string;
  onChange: (v: string) => void;
}) {
  const presetByType: Record<string, string[]> = {
    取药: ["药品名称", "数量", "经手人"],
    用药: ["药品", "剂量", "给药途径"],
    修蹄: ["蹄部位", "处理方式", "是否隔离"],
    干奶: ["干奶方式", "干奶日期", "用药"],
    免疫: ["疫苗", "批次", "免疫部位"],
    产后护理: ["护理项目", "BCS", "异常"],
    驱虫: ["驱虫剂", "剂量", "下次时间"],
    普修: ["处置项目", "材料", "复查时间"],
    复查: ["复查结论", "下一步处置", "是否结案"],
  };
  const fields = presetByType[taskType] ?? ["处置说明"];
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {fields.map((f) => (
          <div
            key={f}
            className="h-9 rounded-md bg-surface-subtle border border-border text-caption text-text-tertiary inline-flex items-center justify-center"
          >
            {f}
          </div>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`填写${taskType}执行过程、处置内容与结果`}
        rows={4}
        className="w-full p-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary resize-none"
      />
    </div>
  );
}
