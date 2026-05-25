import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
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
  Clock,
  MapPin,
  User,
  Send,
  Edit3,
  XCircle,
  ArrowRight,
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

type StatusKey = "待审批" | "进行中" | "已完成" | "已驳回" | "已终止";

const statusMap: Record<StatusKey, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待审批: { tag: "tag tag-warning", icon: ClipboardList, color: "text-[#8A5A0A]" },
  进行中: { tag: "tag tag-success", icon: PlayCircle, color: "text-[#2F7A3A]" },
  已驳回: { tag: "tag tag-danger", icon: AlertTriangle, color: "text-[var(--state-danger)]" },
  已完成: { tag: "tag tag-muted", icon: CheckCircle2, color: "text-text-secondary" },
  已终止: { tag: "tag tag-muted", icon: AlertTriangle, color: "text-text-secondary" },
};

function cleanName(name: string) {
  return name.replace(/^(内部|外部)·/, "");
}

function Avatar({ name, size = 6 }: { name: string; size?: number }) {
  const n = cleanName(name);
  const px = size * 4;
  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className="rounded-full bg-primary/10 text-primary inline-flex items-center justify-center text-caption shrink-0"
        style={{ width: px, height: px }}
      >
        {n.charAt(0)}
      </div>
      <span className="text-body-sm text-foreground">{n}</span>
    </div>
  );
}

type TabKey = "plan" | "report" | "handle";

function TaskDetailPage() {
  const { id } = useParams({ from: "/m/health/$id" });
  const role = useRole();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("plan");
  const [confirm, setConfirm] = useState<"approve" | "reject" | "respond" | "finish" | "terminate" | null>(null);

  // mock —— 修蹄工默认看到的是修蹄类，否则健康类
  const isLoss = id.startsWith("LS");
  const isHoof = !isLoss && (role === "hoof_trimmer" || id.startsWith("HF"));
  const kind = isLoss ? "损耗" : isHoof ? "修蹄" : "健康";
  const o = {
    id,
    type: isLoss ? "物资损耗" : isHoof ? "批次修蹄" : "疾病治疗",
    status: (role === "hoof_trimmer" || role === "vet_assistant" ? "进行中" : "待审批") as StatusKey,
    farm: "示范牧场",
    barn: isLoss ? "2 号牛舍" : "3 号牛舍",
    target: isLoss ? "口蹄疫疫苗 A 型 · 8 支" : "#A2381",
    executor: isLoss ? "李雨晴" : isHoof ? "外部·张师傅" : "李雨晴",
    plannedAt: "今日 13:00",
    proposer: isLoss ? "孙明" : "陈晓东",
    approver: "王主管",
    conclusion: isLoss ? "冷链断电导致失效" : isHoof ? "右后蹄趾间皮炎" : "疑似乳房炎急性发作",
    event: isLoss ? "冷链断电导致失效" : isHoof ? "右后蹄趾间皮炎" : "持续高烧 2 小时",
    desc: isLoss
      ? "冷链监测发现 #2 冷柜断电 4 小时,该批疫苗已失效,需作损耗登记并补充申请。"
      : isHoof
      ? "巡检发现 #A2381 右后蹄趾间皮炎,需进行清创修蹄并涂抹药剂,建议进入隔离观察 3 天。"
      : "饲养员巡检发现该牛持续高烧 2 小时(39.6℃),同时表现出食欲下降、反刍减少。建议立即抗生素治疗并进入隔离观察。",
    reportedAt: "今日 09:20",
    createdAt: "2026-05-20 09:08",
    photos: 2,
    videos: isLoss ? 1 : 0,
    voiceSecs: isLoss ? 42 : 28,
    symptoms: ["体温升高", "采食下降", "反刍减少"],
    materials: isLoss
      ? ([] as { name: string; spec?: string; qty: string }[])
      : isHoof
      ? [
          { name: "蹄部消毒喷雾", spec: "500ml / 瓶", qty: "1 瓶" },
          { name: "蹄部包扎绷带", spec: "5cm × 4.5m", qty: "2 卷" },
        ]
      : [
          { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", qty: "2 瓶" },
          { name: "头孢噻呋钠", spec: "1g / 支", qty: "6 支" },
          { name: "一次性注射器", spec: "20ml", qty: "8 支" },
        ],
    pickupCode: isLoss ? null : `PK-${id.replace(/^WO-?/i, "")}`,
    pickupStatus: isLoss
      ? "无需领物"
      : role === "vet_assistant" || role === "hoof_trimmer"
      ? "已生成 · 待领取"
      : "审批后生成",
    timeline: [
      { time: "今日 09:20", who: "陈晓东", action: "提交工单" },
      { time: "今日 09:35", who: "王主管", action: "审核通过" },
      { time: "今日 10:10", who: "李雨晴", action: "响应工单" },
    ] as { time: string; who: string; action: string }[],
    handling: [
      { time: "今日 10:30", who: "李雨晴", note: "已到达现场，开始测温与检查" },
    ] as { time: string; who: string; note: string }[],
  };

  const s = statusMap[o.status];
  const Icon = s.icon;

  const showApproval = canApprove(role) && o.status === "待审批";
  const showExecBtn = canExecute(role) && o.status === "进行中";
  const showRespond = canExecute(role) && o.status === "待审批" && role !== "vet" && role !== "manager";
  const showReEdit = (role === "admin" || o.proposer === "陈晓东") && (o.status === "已驳回" || o.status === "已终止");

  return (
    <MobileShell title="工单详情" back hideTabBar>
      <div className="pb-28">
        {/* ============ 顶部工单摘要 ============ */}
        <div className="bg-card border-b border-border">
          {/* 编号 / 类型 / 状态 */}
          <div className="px-4 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Icon className={`h-4 w-4 ${s.color} shrink-0`} />
              <span className="font-mono text-body text-foreground">{o.id}</span>
              <span className="tag tag-muted">{o.type}</span>
            </div>
            <span className={s.tag}>{o.status}</span>
          </div>

          {/* 结论/对象 */}
          <div className="px-4 mt-2 text-section-title text-foreground">
            {o.target} · {o.conclusion}
          </div>

          {/* 牧场 / 牛舍 / 服务对象 */}
          <div className="px-4 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-text-tertiary">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {o.farm} · {o.barn}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {kind} · {isLoss ? "物资" : "牛只"}
            </span>
          </div>

          {/* 当前执行人 / 计划时间 / 领物状态 */}
          <div className="mx-4 mt-3 rounded-xl bg-surface-subtle border border-border p-3 grid grid-cols-3 gap-2">
            <SummaryCell label="执行人" value={cleanName(o.executor)} avatar />
            <SummaryCell label="计划时间" value={o.plannedAt} icon={<Clock className="h-3 w-3" />} />
            <SummaryCell label="领物状态" value={o.pickupStatus} icon={<PackagePlus className="h-3 w-3" />} />
          </div>

          {/* 流转摘要 */}
          <div className="px-4 mt-3 pb-3 flex items-center gap-1.5 text-caption text-text-secondary overflow-x-auto">
            {o.timeline.map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 shrink-0">
                <span className="text-text-tertiary">{cleanName(t.who)}</span>
                <span className="text-foreground">{t.action}</span>
                {i < o.timeline.length - 1 && <ArrowRight className="h-3 w-3 text-text-tertiary" />}
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="px-4 flex items-center gap-4 border-t border-border">
            {(
              [
                { k: "plan", label: "执行方案" },
                { k: "report", label: "上报记录" },
                { k: "handle", label: "处理记录" },
              ] as { k: TabKey; label: string }[]
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`relative h-11 text-body-sm ${
                  tab === t.k ? "text-foreground font-medium" : "text-text-tertiary"
                }`}
              >
                {t.label}
                {tab === t.k && (
                  <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ============ Tab 内容区 ============ */}
        <div className="px-4 pt-3 space-y-3">
          {tab === "plan" && (
            <>
              {/* 执行方案 */}
              <div className="rounded-xl bg-card border border-border p-4 space-y-3">
                <div className="text-caption text-text-tertiary">方案说明</div>
                <p className="text-body-sm text-text-secondary leading-relaxed">{o.desc}</p>
                {kind === "健康" && o.symptoms.length > 0 && (
                  <div>
                    <div className="text-caption text-text-tertiary mb-1.5">症状标签</div>
                    <div className="flex flex-wrap gap-1.5">
                      {o.symptoms.map((sym) => (
                        <span key={sym} className="tag tag-brand">{sym}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!isLoss && o.materials.length > 0 && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-caption text-text-tertiary inline-flex items-center gap-1.5">
                      <PackagePlus className="h-3.5 w-3.5 text-primary" /> 所需药品 / 器材
                    </div>
                    <span className="text-caption text-text-tertiary">共 {o.materials.length} 项</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {o.materials.map((m) => (
                      <li key={m.name} className="py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-body-sm text-foreground truncate">{m.name}</div>
                          {m.spec && (
                            <div className="text-caption text-text-tertiary truncate">{m.spec}</div>
                          )}
                        </div>
                        <span className="font-mono text-body-sm text-text-secondary shrink-0">× {m.qty}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 rounded-lg bg-brand-subtle px-3 py-2 text-caption text-primary inline-flex items-start gap-1.5 w-full">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      {o.status === "进行中" || o.status === "已完成"
                        ? `领物码已生成：${o.pickupCode}，请前往仓库扫码核销领取。`
                        : `本工单含药品 / 器材需求，响应后将自动生成领物码（${o.pickupCode}）供执行者到仓库核销领取。`}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "report" && (
            <>
              {/* 上报记录 */}
              <div className="rounded-xl bg-card border border-border divide-y divide-border">
                <Row label="上报时间" value={<span className="text-body-sm text-foreground">{o.reportedAt}</span>} />
                <Row label="上报人" value={<Avatar name={o.proposer} />} />
                <Row label="审核人" value={<Avatar name={o.approver} />} />
                <Row label="上报事件" value={<span className="text-body-sm text-foreground">{o.event}</span>} />
              </div>

              <div className="rounded-xl bg-card border border-border p-4 space-y-3">
                <div className="text-caption text-text-tertiary">现场描述</div>
                <p className="text-body-sm text-text-secondary leading-relaxed">{o.desc}</p>
              </div>

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
            </>
          )}

          {tab === "handle" && (
            <>
              {/* 处理记录 */}
              {o.handling.length === 0 ? (
                <div className="rounded-xl bg-card border border-border p-6 text-center text-body-sm text-text-tertiary">
                  暂无处理记录
                </div>
              ) : (
                <div className="rounded-xl bg-card border border-border p-4 space-y-4">
                  {o.handling.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                        {i < o.handling.length - 1 && <div className="flex-1 w-px bg-border my-1" />}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between">
                          <Avatar name={h.who} size={5} />
                          <span className="text-caption text-text-tertiary">{h.time}</span>
                        </div>
                        <p className="mt-1.5 text-body-sm text-text-secondary leading-relaxed">{h.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============ 底部操作区 ============ */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {showApproval ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm("reject")}
              className="flex-1 h-11 rounded-lg border border-border text-body-sm text-[var(--state-danger)]"
            >
              驳回
            </button>
            <button
              onClick={() => setConfirm("approve")}
              className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body-sm"
            >
              通过审批
            </button>
          </div>
        ) : showRespond ? (
          <button
            onClick={() => setConfirm("respond")}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
          >
            <Send className="h-4 w-4" /> 响应并领物
          </button>
        ) : showExecBtn ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm("terminate")}
              className="h-11 px-4 rounded-lg border border-border text-body-sm text-text-secondary inline-flex items-center gap-1.5"
            >
              <XCircle className="h-4 w-4" /> 终止
            </button>
            {o.pickupCode && (
              <button
                onClick={() => navigate({ to: "/m/pickup/$id", params: { id: o.pickupCode! } })}
                className="h-11 px-4 rounded-lg border border-border text-body-sm text-text-secondary inline-flex items-center gap-1.5"
              >
                <PackagePlus className="h-4 w-4" /> 领物
              </button>
            )}
            <button
              onClick={() => setConfirm("finish")}
              className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" /> 执行记录
            </button>
          </div>
        ) : showReEdit ? (
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: "/m/health" })}
              className="flex-1 h-11 rounded-lg border border-border text-body-sm text-text-secondary"
            >
              返回列表
            </button>
            <button
              onClick={() => navigate({ to: "/m/report" })}
              className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1.5"
            >
              <Edit3 className="h-4 w-4" /> 重新编辑
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate({ to: "/m/health" })}
            className="w-full h-11 rounded-lg border border-border text-body text-text-secondary"
          >
            返回工单列表
          </button>
        )}
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent className="!max-w-[440px] !w-full !top-auto !bottom-0 !left-1/2 !-translate-x-1/2 !translate-y-0 !rounded-b-none !rounded-t-2xl !border-0 !p-0 data-[state=open]:!slide-in-from-bottom-4 data-[state=closed]:!slide-out-to-bottom-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <AlertDialogHeader className="px-6 pt-7 pb-2 sm:text-center">
            <AlertDialogTitle className="text-section-title">
              {confirm === "approve"
                ? "确认通过该工单?"
                : confirm === "reject"
                ? "确认驳回该工单?"
                : confirm === "respond"
                ? "响应工单并生成领物码?"
                : confirm === "terminate"
                ? "确认终止该工单?"
                : "确认提交执行记录?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-sm text-text-tertiary mt-1">
              工单 {o.id} · {o.target}
              <br />
              {o.conclusion}，操作后状态将更新
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!flex-row gap-3 px-4 pt-5">
            <AlertDialogCancel className="flex-1 h-12 m-0 rounded-xl bg-surface-subtle border-0 text-body text-text-secondary">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className={`flex-1 h-12 rounded-xl text-body ${
                confirm === "reject" || confirm === "terminate"
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

function SummaryCell({
  label,
  value,
  icon,
  avatar,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  avatar?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="text-caption text-text-tertiary">{label}</div>
      <div className="mt-1 flex items-center gap-1.5 min-w-0">
        {avatar ? (
          <div className="h-5 w-5 rounded-full bg-primary/10 text-primary text-caption inline-flex items-center justify-center shrink-0">
            {value.charAt(0)}
          </div>
        ) : (
          icon && <span className="text-text-tertiary shrink-0">{icon}</span>
        )}
        <span className="text-body-sm text-foreground truncate">{value}</span>
      </div>
    </div>
  );
}
