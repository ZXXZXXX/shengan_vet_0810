import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Phone,
  MessageSquare,
  Camera,
  Send,
  Mic,
  Video,
  FileText,
  PackagePlus,
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
  head: () => ({ meta: [{ title: "工单详情 · 奇点智牧" }] }),
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
  const [confirm, setConfirm] = useState<"approve" | "reject" | "finish" | "issue" | null>(null);
  const [execNote, setExecNote] = useState("");
  const [issueNote, setIssueNote] = useState("");
  const [showExec, setShowExec] = useState(false);
  const [showIssue, setShowIssue] = useState(false);

  // mock —— 修蹄工默认看到的是修蹄类，否则健康类
  const isLoss = id.startsWith("LS");
  const isHoof = !isLoss && (role === "hoof_trimmer" || id.startsWith("HF"));
  const kind = isLoss ? "损耗" : isHoof ? "修蹄" : "健康";
  const o = {
    id,
    target: isLoss ? "口蹄疫疫苗 A 型" : "#A2381",
    barn: isLoss ? "2 号牛舍" : "3 号牛舍",
    kind,
    type: isLoss ? "物资损耗" : isHoof ? "批次修蹄" : "疾病治疗",
    event: isLoss
      ? "冷链断电导致失效"
      : isHoof
      ? "右后蹄趾间皮炎"
      : "持续高烧 2 小时",
    proposer: isLoss ? "孙明" : "陈晓东",
    proposerPhone: "138 0000 0001",
    who: isLoss ? "李雨晴" : isHoof ? "外部·张师傅" : "李雨晴",
    status: (role === "hoof_trimmer" || role === "vet_assistant" ? "进行中" : "待审批") as
      | "待审批"
      | "进行中"
      | "已完成"
      | "已驳回",
    createdAt: "2026-05-20 09:08",
    desc: isLoss
      ? "冷链监测发现 #2 冷柜断电 4 小时,该批疫苗已失效,需作损耗登记并补充申请。"
      : isHoof
      ? "巡检发现 #A2381 右后蹄趾间皮炎,需进行清创修蹄并涂抹药剂,建议进入隔离观察 3 天。"
      : "饲养员巡检发现该牛持续高烧 2 小时(39.6℃),同时表现出食欲下降、反刍减少。建议立即抗生素治疗并进入隔离观察。",
    photos: 2,
    videos: isLoss ? 1 : 0,
    voiceSecs: isLoss ? 42 : 28,
    item: "口蹄疫疫苗 A 型",
    qty: "8 支",
    reapply: { name: "口蹄疫疫苗 A 型", qty: "8 支" } as { name: string; qty: string } | null,
    symptoms: ["体温升高", "采食下降", "反刍减少"],
  };
  const s = statusMap[o.status];
  const Icon = s.icon;

  const showApproval = canApprove(role) && o.status === "待审批";
  const showExecBtn = canExecute(role) && o.status === "进行中";

  return (
    <MobileShell title="工单详情" back hideTabBar>
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
            {isLoss ? `${o.item} · 损耗 ${o.qty}` : `${o.target} · ${o.event}`}
          </div>
          <div className="text-caption text-text-tertiary mt-1">
            {isLoss ? "物资" : o.barn} · 创建于 {o.createdAt}
          </div>
        </div>

        {/* 字段网格 */}
        <div className="rounded-xl bg-card border border-border divide-y divide-border">
          <Row label="工单类型" value={<span className="tag tag-muted">{o.type}</span>} />
          {isLoss ? (
            <>
              <Row label="物品名称" value={<span className="text-body text-foreground">{o.item}</span>} />
              <Row label="损耗量" value={<span className="text-body text-foreground">{o.qty}</span>} />
              <Row label="关联牛舍" value={<span className="text-body text-foreground">{o.barn}</span>} />
            </>
          ) : (
            <>
              <Row label="处理对象" value={<span className="text-body text-foreground">{o.target}</span>} />
              <Row label="提出事件" value={<span className="text-body text-foreground">{o.event}</span>} />
            </>
          )}
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

        {/* 健康：症状标签 */}
        {kind === "健康" && o.symptoms.length > 0 && (
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-caption text-text-tertiary mb-2">症状说明</div>
            <div className="flex flex-wrap gap-1.5">
              {o.symptoms.map((sym) => (
                <span key={sym} className="tag tag-brand">{sym}</span>
              ))}
            </div>
          </div>
        )}

        {/* 损耗：补申请 */}
        {isLoss && (
          <div className="rounded-xl bg-card border border-border p-4">
            <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1.5">
              <PackagePlus className="h-3.5 w-3.5 text-primary" /> 补申请物资
            </div>
            {o.reapply ? (
              <div className="flex items-center justify-between text-body text-foreground">
                <span>{o.reapply.name}</span>
                <span className="font-mono text-text-secondary">× {o.reapply.qty}</span>
              </div>
            ) : (
              <div className="text-body-sm text-text-tertiary">无需补申请</div>
            )}
          </div>
        )}

        {/* 工单说明 / 文字备注 */}
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="text-caption text-text-tertiary mb-1.5">
            {isLoss ? "文字备注" : "工单说明"}
          </div>
          <p className="text-body-sm text-text-secondary leading-relaxed">{o.desc}</p>
        </div>

        {/* 证据材料 */}
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          <div className="text-caption text-text-tertiary">证据材料</div>
          {o.photos > 0 && (
            <div>
              <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
                <Camera className="h-3 w-3" /> 照片 · {o.photos} 张
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
          )}
          {o.videos > 0 && (
            <div>
              <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
                <Video className="h-3 w-3" /> 视频 · {o.videos} 段
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: o.videos }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border inline-flex items-center justify-center"
                  >
                    <PlayCircle className="h-6 w-6 text-text-tertiary" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {o.voiceSecs > 0 && (
            <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-surface-subtle border border-border">
              <Mic className="h-4 w-4 text-primary" />
              <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full w-2/3 bg-primary/60" />
              </div>
              <span className="font-mono text-caption text-text-secondary">
                00:{String(o.voiceSecs).padStart(2, "0")}
              </span>
            </div>
          )}
          {o.photos === 0 && o.videos === 0 && o.voiceSecs === 0 && (
            <div className="text-body-sm text-text-tertiary inline-flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> 仅文字描述,无附件
            </div>
          )}
        </div>

        {/* 执行记录面板（流程性） */}
        {showExec && (
          <div className="rounded-xl bg-card border border-primary/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-body-sm font-medium text-foreground inline-flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 text-primary" /> 执行记录
              </div>
              <span className="text-caption text-text-tertiary">按流程填写处置内容</span>
            </div>
            <textarea
              value={execNote}
              onChange={(e) => setExecNote(e.target.value)}
              placeholder="填写执行过程、用药 / 处置、操作要点等"
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
                disabled={!execNote.trim()}
                onClick={() => setConfirm("finish")}
                className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> 提交完成
              </button>
            </div>
          </div>
        )}

        {/* 异常反馈面板（异常分支） */}
        {showIssue && (
          <div className="rounded-xl bg-card border border-[var(--state-danger)]/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-body-sm font-medium text-foreground inline-flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-[var(--state-danger)]" /> 异常反馈
              </div>
              <span className="text-caption text-text-tertiary">执行中发现的异常情况</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["牛只状态异常", "用药不足", "环境/设施问题", "操作受阻", "其他"].map((t) => (
                <button
                  key={t}
                  className="px-2.5 h-7 rounded-full bg-surface-subtle border border-border text-caption text-text-secondary"
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="描述异常现象、影响范围、当前处置建议等"
              rows={4}
              className="w-full p-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary resize-none"
            />
            <button className="w-full h-10 rounded-lg border border-dashed border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1.5">
              <Camera className="h-4 w-4" /> 上传异常照片 / 视频
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowIssue(false)}
                className="flex-1 h-11 rounded-lg border border-border text-body-sm text-text-secondary"
              >
                取消
              </button>
              <button
                disabled={!issueNote.trim()}
                onClick={() => setConfirm("issue")}
                className="flex-1 h-11 rounded-lg bg-[var(--state-danger)] text-white text-body-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="h-4 w-4" /> 提交反馈
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作栏 —— 小程序仅查看，审批 / 执行需前往 PC */}
      {(showApproval || showExecBtn) ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] space-y-2">
          <div className="rounded-lg bg-surface-subtle px-3 py-2 text-caption text-text-secondary inline-flex items-start gap-1.5 w-full">
            <AlertTriangle className="h-3.5 w-3.5 text-[var(--state-warning)] shrink-0 mt-0.5" />
            <span>
              小程序暂不支持{showApproval ? "审批操作" : "执行 / 反馈操作"}，请前往 PC 端处理。
            </span>
          </div>
          <button
            onClick={() => navigate({ to: "/m/health" })}
            className="w-full h-11 rounded-lg border border-border text-body text-text-secondary"
          >
            返回工单列表
          </button>
        </div>
      ) : (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <button
            onClick={() => navigate({ to: "/m/health" })}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body"
          >
            返回工单列表
          </button>
        </div>
      )}


      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="!max-w-[440px] !w-full !top-auto !bottom-0 !left-1/2 !-translate-x-1/2 !translate-y-0 !rounded-b-none !rounded-t-2xl !border-0 !p-0 data-[state=open]:!slide-in-from-bottom-4 data-[state=closed]:!slide-out-to-bottom-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <AlertDialogHeader className="px-6 pt-7 pb-2 sm:text-center">
            <AlertDialogTitle className="text-section-title">
              {confirm === "approve"
                ? "确认通过该工单?"
                : confirm === "reject"
                ? "确认驳回该工单?"
                : confirm === "issue"
                ? "提交异常反馈?"
                : "确认提交完成?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-sm text-text-tertiary mt-1">
              工单 {o.id} · {o.target}
              <br />
              {o.event},操作后状态将更新
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!flex-row gap-3 px-4 pt-5">
            <AlertDialogCancel className="flex-1 h-12 m-0 rounded-xl bg-surface-subtle border-0 text-body text-text-secondary">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className={`flex-1 h-12 rounded-xl text-body ${
                confirm === "reject" || confirm === "issue"
                  ? "bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white"
                  : "bg-primary text-primary-foreground"
              }`}
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
