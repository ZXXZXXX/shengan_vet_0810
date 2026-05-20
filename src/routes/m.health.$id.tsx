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

const statusMap: Record<string, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待审批: { tag: "tag tag-warning", icon: ClipboardList, color: "text-[var(--state-warning)]" },
  进行中: { tag: "tag tag-brand", icon: PlayCircle, color: "text-primary" },
  已驳回: { tag: "tag tag-danger", icon: AlertTriangle, color: "text-[var(--state-danger)]" },
  已完成: { tag: "tag tag-success", icon: CheckCircle2, color: "text-[var(--state-success)]" },
};

function TaskDetailPage() {
  const { id } = useParams({ from: "/m/health/$id" });
  const role = useRole();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<"approve" | "reject" | "finish" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showExec, setShowExec] = useState(false);

  // mock —— 修蹄工默认看到的是修蹄类，否则健康类
  const isHoof = role === "hoof_trimmer";
  const o = {
    id,
    target: "#A2381",
    barn: "3 号牛舍",
    kind: isHoof ? "修蹄" : "健康",
    type: isHoof ? "批次修蹄" : "疾病治疗",
    event: isHoof ? "右后蹄趾间皮炎" : "持续高烧 2 小时",
    proposer: "陈晓东",
    proposerPhone: "138 0000 0001",
    who: isHoof ? "外部·张师傅" : "李雨晴",
    status: (role === "hoof_trimmer" || role === "vet_assistant" ? "进行中" : "待审批") as
      | "待审批"
      | "进行中"
      | "已完成"
      | "已驳回",
    createdAt: "2026-05-20 09:08",
    desc: isHoof
      ? "巡检发现 #A2381 右后蹄趾间皮炎，需进行清创修蹄并涂抹药剂，建议进入隔离观察 3 天。"
      : "饲养员巡检发现该牛持续高烧 2 小时(39.6℃),同时表现出食欲下降、反刍减少。建议立即抗生素治疗并进入隔离观察。",
    photos: 2,
  };
  const s = statusMap[o.status];
  const Icon = s.icon;

  const showApproval = canApprove(role) && o.status === "待审批";
  const showExecBtn = canExecute(role) && o.status === "进行中";

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

        {/* 字段网格 */}
        <div className="rounded-xl bg-card border border-border divide-y divide-border">
          <Row label="任务类型" value={<span className="tag tag-muted">{o.type}</span>} />
          <Row label="处理对象" value={<span className="text-body text-foreground">{o.target}</span>} />
          <Row label="提出事件" value={<span className="text-body text-foreground">{o.event}</span>} />
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
          <Row label="负责人" value={<span className="text-body text-foreground">{o.who}</span>} />
        </div>

        {/* 任务说明 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="text-caption text-text-tertiary mb-1.5">任务说明</div>
          <p className="text-body-sm text-text-secondary leading-relaxed">{o.desc}</p>
        </div>

        {/* 现场照片 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="text-caption text-text-tertiary mb-2">现场照片 · {o.photos} 张</div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: o.photos }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border"
              />
            ))}
          </div>
        </div>

        {/* 执行 / 反馈面板 */}
        {showExec && (
          <div className="rounded-xl bg-card border border-primary/30 p-4 space-y-3">
            <div className="text-body-sm font-medium text-foreground">执行记录 / 现场反馈</div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="填写执行过程、用药/处置、现场观察等"
              rows={4}
              className="w-full p-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary resize-none"
            />
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
                disabled={!feedback.trim()}
                onClick={() => setConfirm("finish")}
                className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> 提交完成
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      {showApproval ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 flex gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            onClick={() => setConfirm("reject")}
            className="flex-1 h-12 rounded-lg border border-border text-body text-text-secondary inline-flex items-center justify-center gap-1.5"
          >
            <X className="h-4 w-4" /> 驳回
          </button>
          <button
            onClick={() => setConfirm("approve")}
            className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" /> 通过
          </button>
        </div>
      ) : showExecBtn ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            onClick={() => setShowExec((v) => !v)}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
          >
            <Send className="h-4 w-4" /> {showExec ? "收起执行面板" : "执行 / 反馈"}
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

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "approve"
                ? "确认通过该任务？"
                : confirm === "reject"
                ? "确认驳回该任务？"
                : "确认提交完成？"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              任务 {o.id} · {o.target} · {o.event}，操作后状态将更新。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={
                confirm === "reject"
                  ? "bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white"
                  : "bg-primary text-primary-foreground"
              }
              onClick={() => {
                setConfirm(null);
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
