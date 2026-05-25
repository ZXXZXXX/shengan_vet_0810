import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Camera,
  Send,
  Mic,
  Video,
  FileText,
  PackagePlus,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Stethoscope,
  CheckSquare,
  Square,
  
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

function cleanName(n: string) {
  return n.replace(/^(内部|外部)·/, "");
}

function TaskDetailPage() {
  const { id } = useParams({ from: "/m/health/$id" });
  const role = useRole();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"report" | "review" | "execute">("report");
  

  // mock data
  const isLoss = id.startsWith("LS");
  const isHoof = !isLoss && (role === "hoof_trimmer" || id.startsWith("HF"));
  const kind = isLoss ? "损耗" : isHoof ? "修蹄" : "健康";

  const o = {
    id,
    farm: "奇点示范牧场",
    barn: isLoss ? "2 号牛舍" : "3 号牛舍",
    target: isLoss ? "口蹄疫疫苗 A 型" : "#A2381",
    type: isLoss ? "物资损耗" : "疾病治疗",
    status: (role === "hoof_trimmer" || role === "vet_assistant" ? "进行中" : "待审批") as StatusKey,
    who: isLoss ? "李雨晴" : isHoof ? "张师傅" : "李雨晴",
    plannedAt: "今日 13:00",
    needPickup: !isLoss,
    pickupCode: isLoss ? null : `PK-${id.replace(/^WO-?/i, "")}`,
    flow: "陈晓东 上报 → 王医生 审核 → 李雨晴 执行",
  };
  const s = statusMap[o.status];
  const Icon = s.icon;

  // 进行中 的编辑/查看 + 是否曾填写过
  const [editing, setEditing] = useState(false);
  const [hasFilled, setHasFilled] = useState(false);
  const [recordComplete, setRecordComplete] = useState(false);



  return (
    <MobileShell title="工单详情" back hideTabBar>
      <div className="pb-28">
        {/* === 1. 顶部工单摘要 === */}
        <div className="px-4 pt-3 pb-3 bg-card border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${s.color}`} />
              <span className="font-mono text-body text-foreground">{o.id}</span>
              <span className="tag tag-muted">{o.type}</span>
            </div>
            <span className={s.tag}>{o.status}</span>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-caption">
            <SumRow icon={MapPin} label="牧场" value={o.farm} />
            <SumRow icon={MapPin} label="牛舍" value={o.barn} />
            <SumRow icon={Stethoscope} label="执行对象" value={o.target} />
            <SumRow icon={User} label="执行人" value={cleanName(o.who)} />
            <SumRow icon={Clock} label="计划开始时间" value={o.plannedAt} />
            <SumRow
              icon={PackagePlus}
              label="领物需求"
              value={o.needPickup ? "需要" : "不需要"}
            />
          </div>

          <div className="rounded-lg bg-surface-subtle px-3 py-2 text-caption text-text-secondary">
            <span className="text-text-tertiary">流转：</span>
            {o.flow}
          </div>
        </div>

        {/* === 2. Tab === */}
        <div className="sticky top-0 z-10 bg-bg border-b border-border">
          <div className="px-4 flex gap-1">
            {[
              { key: "report", label: "上报记录" },
              { key: "review", label: "审核记录" },
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
          {tab === "execute" && <ExecuteTab status={o.status} pickupCode={o.pickupCode} />}
        </div>
      </div>

      {/* === 3. 底部操作区 === */}
      {(() => {
        const isResponder = canApprove(role) || canExecute(role);
        const showRespond = isResponder && o.status === "待审批";
        const showExec = canExecute(role) && o.status === "进行中";
        if (!showRespond && !showExec) return null;
        return (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
            {showRespond ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast("已忽视该工单");
                    navigate({ to: "/m/health" });
                  }}
                  className="flex-1 h-11 rounded-lg border border-border text-body text-text-secondary"
                >
                  忽视
                </button>
                <button
                  onClick={() => navigate({ to: "/m/respond" })}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body"
                >
                  响应
                </button>
              </div>
            ) : editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setHasFilled(true);
                    setRecordComplete(true);
                    setEditing(false);
                    toast.success("已保存");
                  }}
                  className="flex-1 h-11 rounded-lg border border-border text-body text-text-secondary"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    if (!recordComplete) {
                      toast.error("提交失败，记录不完整");
                      return;
                    }
                    toast.success("提交成功");
                    navigate({ to: "/m/health" });
                  }}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
                >
                  <Send className="h-4 w-4" /> 提交记录
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
              >
                <PlayCircle className="h-4 w-4" />
                {hasFilled ? "继续执行" : "开始执行"}
              </button>
            )}
          </div>
        );
      })()}

    </MobileShell>
  );
}

function SumRow({
  icon: I,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-1.5 min-w-0">
      <I className="h-3.5 w-3.5 text-text-tertiary shrink-0 mt-0.5" />
      <div className="min-w-0">
        <div className="text-text-tertiary">{label}</div>
        <div className="text-body-sm text-foreground truncate">{value}</div>
      </div>
    </div>
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

// === 审核记录 ===
function ReviewTab({ isLoss, status }: { isLoss: boolean; status: StatusKey }) {
  if (status === "待审批") {
    return (
      <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
        <ClipboardList className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
        <div className="text-body-sm text-text-tertiary">尚未审核</div>
      </div>
    );
  }
  return (
    <>
      <Section title="审核基础信息">
        <Field label="审核人" value={<PersonChip name="王医生" />} />
        <Field label="审核时间" value="2026-05-20 10:15" />
        <Field
          label="审核结果"
          value={
            status === "已驳回" ? (
              <span className="tag tag-danger">已驳回</span>
            ) : status === "已终止" ? (
              <span className="tag tag-muted">已终止</span>
            ) : (
              <span className="tag tag-success">通过</span>
            )
          }
        />
        {status === "已驳回" && (
          <Field label="驳回理由" value="证据不充分，请补充体温记录与历史病历。" />
        )}
      </Section>

      {status !== "已驳回" && (
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
      )}
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
  photos: number;
  audio: boolean;
  note: string;
  reason: string;
};

function buildDayItems(day: number): ExecItem[] {
  const base: Omit<ExecItem, "status" | "photos" | "audio" | "note" | "reason">[] = [
    { id: `d${day}-1`, title: "#A2381 · 氟尼辛葡甲胺", desc: "肌肉注射 2ml" },
    { id: `d${day}-2`, title: "#A2381 · 头孢噻呋钠", desc: "肌肉注射 1g" },
    { id: `d${day}-3`, title: "#A2381 · 体温记录", desc: "测温并记录" },
  ];
  return base.map((b) => ({
    ...b,
    status: "pending",
    photos: 0,
    audio: false,
    note: "",
    reason: "",
  }));
}

function ExecuteTab({ status, pickupCode }: { status: StatusKey; pickupCode: string | null }) {
  if (status === "待审批" || status === "已驳回") {
    return (
      <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
        <PlayCircle className="h-6 w-6 text-text-tertiary mx-auto mb-2" />
        <div className="text-body-sm text-text-tertiary">尚未开始执行</div>
      </div>
    );
  }
  return (
    <>
      <Section title="执行基础信息">
        <Field label="执行人" value={<PersonChip name="李雨晴" />} />
        <Field label="开始执行时间" value="今日 13:08" />
      </Section>

      <div className="text-caption text-text-tertiary px-1">执行 Checklist · 勾选执行对象并上传现场材料</div>

      <ChecklistDay day={1} pickupCode={pickupCode} initialAllDone />
      <ChecklistDay day={2} pickupCode={pickupCode} initialAllDone={status === "已完成"} />
      <ChecklistDay day={3} pickupCode={pickupCode} initialAllDone={status === "已完成"} />

      <div className="rounded-xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-body-sm font-medium text-foreground inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-primary" /> 复查 / 验收
          </div>
          <span className={status === "已完成" ? "tag tag-success" : "tag tag-muted"}>
            {status === "已完成" ? "已完成" : "待执行"}
          </span>
        </div>
        <div className="text-caption text-text-tertiary">第 4 天复测体温（≤39.0℃）与采食情况，记录复查结果。</div>
      </div>
    </>
  );
}

function ChecklistDay({
  day,
  pickupCode,
  initialAllDone = false,
}: {
  day: number;
  pickupCode: string | null;
  initialAllDone?: boolean;
}) {
  const [items, setItems] = useState<ExecItem[]>(() => {
    const base = buildDayItems(day);
    if (initialAllDone) {
      return base.map((it) => ({
        ...it,
        status: "done",
        photos: 2,
        audio: true,
        note: "体温 39.2℃，采食略增。",
      }));
    }
    return base;
  });
  const [openId, setOpenId] = useState<string | null>(null);

  const total = items.length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const blockedCount = items.filter((i) => i.status === "blocked").length;
  const settled = doneCount + blockedCount;
  const allSettled = settled === total;
  const dayDone = allSettled && blockedCount === 0;
  const dayStatusTag = dayDone
    ? "tag tag-success"
    : allSettled
      ? "tag tag-warning"
      : settled > 0
        ? "tag tag-brand"
        : "tag tag-muted";
  const dayStatusText = dayDone
    ? "已完成"
    : allSettled
      ? "部分无法执行"
      : settled > 0
        ? "进行中"
        : "待执行";

  const update = (id: string, patch: Partial<ExecItem>) =>
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="px-4 h-11 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          {dayDone ? (
            <CheckSquare className="h-4 w-4 text-primary" />
          ) : (
            <Square className="h-4 w-4 text-text-tertiary" />
          )}
          <span className="text-body-sm font-medium text-foreground">第 {day} 天执行</span>
          <span className="text-caption text-text-tertiary">
            {doneCount}/{total} 已执行{blockedCount > 0 ? ` · ${blockedCount} 无法执行` : ""}
          </span>
        </div>
        <span className={dayStatusTag}>{dayStatusText}</span>
      </div>

      {pickupCode && (
        <div className="px-4 pt-3">
          <Link
            to="/m/pickup/$id"
            params={{ id: pickupCode }}
            className="flex items-center justify-between px-3 h-10 rounded-lg bg-brand-subtle text-primary text-body-sm"
          >
            <span className="inline-flex items-center gap-1.5">
              <PackagePlus className="h-3.5 w-3.5" /> 领物检查 · {pickupCode}
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <ul className="px-4 py-3 space-y-2">
        {items.map((it) => {
          const open = openId === it.id;
          return (
            <li
              key={it.id}
              className={`rounded-lg border ${
                it.status === "done"
                  ? "border-primary/30 bg-brand-subtle/40"
                  : it.status === "blocked"
                    ? "border-[var(--state-danger)]/30 bg-[var(--state-danger)]/5"
                    : "border-border bg-bg"
              }`}
            >
              <div className="flex items-start gap-2 px-3 py-2.5">
                <div className="mt-0.5">
                  {it.status === "done" ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : it.status === "blocked" ? (
                    <AlertTriangle className="h-4 w-4 text-[var(--state-danger)]" />
                  ) : (
                    <Square className="h-4 w-4 text-text-tertiary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm text-foreground truncate">{it.title}</div>
                  <div className="text-caption text-text-tertiary">{it.desc}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      update(it.id, { status: "done", reason: "" });
                      setOpenId(it.id);
                    }}
                    className={`h-7 px-2 rounded-md text-caption inline-flex items-center gap-1 ${
                      it.status === "done"
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-text-secondary"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" /> 已执行
                  </button>
                  <button
                    onClick={() => {
                      update(it.id, { status: "blocked", photos: 0, audio: false, note: "" });
                      setOpenId(it.id);
                    }}
                    className={`h-7 px-2 rounded-md text-caption inline-flex items-center gap-1 ${
                      it.status === "blocked"
                        ? "bg-[var(--state-danger)] text-white"
                        : "border border-border text-text-secondary"
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" /> 无法执行
                  </button>
                </div>
              </div>

              {it.status !== "pending" && (
                <div className="px-3 pb-3">
                  {it.status === "done" ? (
                    <div className="rounded-md bg-card border border-border p-2.5 space-y-2">
                      <div className="text-caption text-text-tertiary">现场材料</div>
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: it.photos }).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-md bg-gradient-to-br from-surface-subtle to-border border border-border"
                          />
                        ))}
                        <button
                          onClick={() => update(it.id, { photos: it.photos + 1 })}
                          className="aspect-square rounded-md border border-dashed border-border inline-flex flex-col items-center justify-center text-text-tertiary"
                        >
                          <Camera className="h-4 w-4" />
                          <span className="text-[10px] mt-0.5">拍照</span>
                        </button>
                      </div>
                      <button
                        onClick={() => update(it.id, { audio: !it.audio })}
                        className={`w-full h-9 rounded-md inline-flex items-center justify-center gap-1.5 text-caption ${
                          it.audio
                            ? "bg-brand-subtle text-primary"
                            : "border border-dashed border-border text-text-tertiary"
                        }`}
                      >
                        <Mic className="h-3.5 w-3.5" />
                        {it.audio ? "已录音 00:18 · 点击重录" : "录音说明"}
                      </button>
                      {open ? (
                        <textarea
                          value={it.note}
                          onChange={(e) => update(it.id, { note: e.target.value })}
                          placeholder="补充备注（可选）"
                          className="w-full min-h-[60px] rounded-md border border-border bg-bg px-2 py-1.5 text-body-sm text-foreground placeholder:text-text-tertiary"
                        />
                      ) : it.note ? (
                        <div className="text-caption text-text-secondary">{it.note}</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-md bg-card border border-border p-2.5 space-y-2">
                      <div className="text-caption text-text-tertiary inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" /> 无法执行说明（必填）
                      </div>
                      <textarea
                        value={it.reason}
                        onChange={(e) => update(it.id, { reason: e.target.value })}
                        placeholder="如：对象不在指定位置 / 拒绝接近 / 物资不足"
                        className="w-full min-h-[60px] rounded-md border border-border bg-bg px-2 py-1.5 text-body-sm text-foreground placeholder:text-text-tertiary"
                      />
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

