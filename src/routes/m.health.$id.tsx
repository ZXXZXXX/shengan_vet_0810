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
  Home,
  User,
  Clock,
  ChevronRight,
  CheckSquare,
  Square,
  Pencil,
  XCircle,
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

type Status = "待审批" | "进行中" | "已完成" | "已驳回" | "已终止";

const statusMap: Record<Status, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待审批: { tag: "tag tag-warning", icon: ClipboardList, color: "text-[#8A5A0A]" },
  进行中: { tag: "tag tag-success", icon: PlayCircle, color: "text-[#2F7A3A]" },
  已驳回: { tag: "tag tag-danger", icon: AlertTriangle, color: "text-[var(--state-danger)]" },
  已完成: { tag: "tag tag-muted", icon: CheckCircle2, color: "text-text-secondary" },
  已终止: { tag: "tag tag-muted", icon: XCircle, color: "text-text-secondary" },
};

function cleanName(name: string) {
  return name.replace(/^(内部|外部)·/, "");
}

function Avatar({ name, size = 6 }: { name: string; size?: number }) {
  const display = cleanName(name);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`rounded-full bg-primary/10 text-primary text-caption inline-flex items-center justify-center`}
        style={{ height: size * 4, width: size * 4 }}
      >
        {display.charAt(0)}
      </span>
      <span className="text-body-sm text-foreground">{display}</span>
    </span>
  );
}

function TaskDetailPage() {
  const { id } = useParams({ from: "/m/health/$id" });
  const role = useRole();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"report" | "review" | "exec">("report");
  const [confirm, setConfirm] = useState<"approve" | "reject" | "finish" | "issue" | "terminate" | null>(null);

  // mock —— 修蹄工默认看到的是修蹄类，否则健康类
  const isLoss = id.startsWith("LS");
  const isHoof = !isLoss && (role === "hoof_trimmer" || id.startsWith("HF"));
  const kind = isLoss ? "损耗" : isHoof ? "修蹄" : "健康";
  const status: Status =
    role === "hoof_trimmer" || role === "vet_assistant" ? "进行中" : "待审批";

  const o = {
    id,
    farm: "示范牧场 · 总部",
    barn: isLoss ? "2 号牛舍" : "3 号牛舍",
    target: isLoss ? "口蹄疫疫苗 A 型" : "#A2381",
    kind,
    type: isLoss ? "物资损耗" : isHoof ? "批次修蹄" : "疾病治疗",
    confirmedType: isLoss ? "物资损耗" : isHoof ? "批次修蹄" : "乳房炎治疗",
    originTags: isLoss ? ["冷链", "失效"] : ["高烧", "乳房红肿", "采食下降"],
    confirmedTags: isLoss ? ["冷链", "失效"] : ["急性乳房炎", "需抗生素治疗"],
    event: isLoss ? "冷链断电导致失效" : "持续高烧 2 小时",
    suspected: isLoss ? "" : "疑似急性乳房炎",
    conclusion: isLoss ? "8 支疫苗冷链失效，整批报废" : "急性乳房炎，需立即抗生素治疗",
    initialPlan: isLoss ? "" : "建议头孢类抗生素 + 抗炎，隔离 3 天",
    proposer: "陈晓东",
    reportedAt: "今日 09:08",
    approver: "王主管",
    reviewedAt: "今日 09:35",
    executor: isHoof ? "外部·张师傅" : "李雨晴",
    executedAt: "今日 10:20",
    planTime: "今日 14:00",
    status,
    needPickup: !isLoss,
    pickupCode: isLoss ? null : `PK-${id.replace(/^WO-?/i, "")}`,
    pickupStatus: "待领取",
    desc: isLoss
      ? "冷链监测发现 #2 冷柜断电 4 小时，该批疫苗已失效，需作损耗登记并补充申请。"
      : "饲养员巡检发现该牛持续高烧 2 小时（39.6℃），同时表现出食欲下降、反刍减少。",
    reviewDesc: isLoss
      ? "已现场确认冷链记录与剩余批次，同意作损耗处理。"
      : "已现场复核，确诊为急性乳房炎，按治疗方案执行。",
    photos: 2,
    videos: isLoss ? 1 : 0,
    voiceSecs: isLoss ? 42 : 28,
    materials: isLoss
      ? []
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
    treatments: isLoss
      ? []
      : [
          {
            name: "头孢噻呋钠",
            usage: "肌注",
            dose: "2.2 mg/kg",
            duration: "连续 3 天，每日 1 次",
          },
          {
            name: "氟尼辛葡甲胺注射液",
            usage: "静注",
            dose: "2.2 mg/kg",
            duration: "首日 1 次",
          },
        ],
    arrangement: isLoss ? "登记后报废" : "今日 14:00 执行第 1 天治疗，连续 3 天",
    review: isLoss ? "" : "第 4 天复查乳样与体温",
    remark: isLoss ? "已通知仓库与采购" : "如出现严重反应立即上报",
    flow: [
      { label: "上报", time: "今日 09:08", who: "陈晓东" },
      { label: "审核", time: "今日 09:35", who: "王主管" },
      ...(status === "进行中" || status === "已完成"
        ? [{ label: "执行", time: "今日 10:20", who: isHoof ? "张师傅" : "李雨晴" }]
        : []),
    ],
    checklist: isLoss
      ? []
      : [
          {
            day: "第 1 天",
            date: "今日",
            done: status === "已完成",
            items: [
              { type: "pickup", text: "领物：头孢噻呋钠 × 6 支、注射器 × 8 支", linkPickup: true },
              { type: "action", text: "肌注头孢噻呋钠 2.2 mg/kg" },
              { type: "action", text: "静注氟尼辛葡甲胺 2.2 mg/kg" },
              { type: "target", text: "执行对象：#A2381" },
              { type: "evidence", text: "现场材料：注射照片 / 体温记录" },
              { type: "note", text: "备注：注意监测体温变化" },
            ],
          },
          {
            day: "第 2 天",
            date: "明日",
            done: false,
            items: [
              { type: "action", text: "肌注头孢噻呋钠 2.2 mg/kg" },
              { type: "target", text: "执行对象：#A2381" },
              { type: "evidence", text: "现场材料：注射照片" },
            ],
          },
          {
            day: "第 3 天",
            date: "后天",
            done: false,
            items: [
              { type: "action", text: "肌注头孢噻呋钠 2.2 mg/kg" },
              { type: "target", text: "执行对象：#A2381" },
            ],
          },
          {
            day: "复查",
            date: "第 4 天",
            done: false,
            items: [
              { type: "action", text: "采样乳样、测体温" },
              { type: "evidence", text: "现场材料：乳样照片、体温读数" },
              { type: "note", text: "复查通过后关闭工单" },
            ],
          },
        ],
  };
  const s = statusMap[o.status];
  const Icon = s.icon;

  const showApproval = canApprove(role) && o.status === "待审批";
  const showExecBtn = canExecute(role) && o.status === "进行中";

  return (
    <MobileShell title="工单详情" back hideTabBar>
      <div className="px-4 pt-3 pb-32 space-y-3">
        {/* 1. 顶部工单摘要 */}
        <div className="rounded-xl bg-card border border-border p-4 space-y-3">
          {/* 编号 / 类型 / 状态 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Icon className={`h-4 w-4 ${s.color} shrink-0`} />
              <span className="font-mono text-body text-foreground">{o.id}</span>
              <span className="tag tag-muted">{o.type}</span>
            </div>
            <span className={s.tag}>{o.status}</span>
          </div>

          {/* 牧场 / 牛舍 / 对象 */}
          <div className="text-body-sm text-text-secondary flex items-center gap-1.5 flex-wrap">
            <Home className="h-3.5 w-3.5 text-text-tertiary" />
            <span>{o.farm}</span>
            <span className="text-text-tertiary">·</span>
            <span>{o.barn}</span>
            <span className="text-text-tertiary">·</span>
            <span className="text-foreground font-medium">{o.target}</span>
          </div>

          {/* 当前执行人 / 计划时间 / 领物状态 */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            <Field label="执行人" value={<Avatar name={o.executor} size={5} />} />
            <Field
              label="计划时间"
              value={<span className="text-body-sm text-foreground">{o.planTime}</span>}
            />
            <Field
              label="领物状态"
              value={
                o.needPickup ? (
                  <span className="text-body-sm text-primary font-medium">{o.pickupStatus}</span>
                ) : (
                  <span className="text-body-sm text-text-tertiary">无需</span>
                )
              }
            />
          </div>

          {/* 流转摘要 */}
          <div className="pt-2 border-t border-border">
            <div className="text-caption text-text-tertiary mb-2">流转摘要</div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {o.flow.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-surface-subtle text-caption text-text-secondary">
                    <span className="text-text-tertiary">{f.label}</span>
                    <span className="font-mono">{f.time}</span>
                    <span className="text-text-tertiary">·</span>
                    <span>{cleanName(f.who)}</span>
                  </span>
                  {i < o.flow.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-text-tertiary shrink-0" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Tab */}
        <div className="sticky top-0 z-[2] -mx-4 px-4 py-2 bg-background/85 backdrop-blur">
          <div className="flex gap-1.5">
            {[
              { key: "report", label: "上报记录" },
              { key: "review", label: "审核记录" },
              { key: "exec", label: "执行记录" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`flex-1 h-9 rounded-lg text-body-sm transition-colors ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-text-secondary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 内容 */}
        {tab === "report" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-card border border-border divide-y divide-border">
              <Row label="上报人" value={<Avatar name={o.proposer} size={5} />} />
              <Row
                label="上报时间"
                value={<span className="text-body-sm text-foreground">{o.reportedAt}</span>}
              />
              <Row
                label="原始工单类型"
                value={<span className="tag tag-muted">{o.type}</span>}
              />
              <Row
                label="原始标签"
                value={
                  <div className="flex flex-wrap gap-1 justify-end">
                    {o.originTags.map((t) => (
                      <span key={t} className="tag tag-brand">{t}</span>
                    ))}
                  </div>
                }
              />
              {o.suspected && (
                <Row
                  label="上报疑似"
                  value={<span className="text-body-sm text-foreground">{o.suspected}</span>}
                />
              )}
            </div>

            <Card title="具体描述">
              <p className="text-body-sm text-text-secondary leading-relaxed">{o.desc}</p>
            </Card>

            <EvidenceCard
              photos={o.photos}
              videos={o.videos}
              voiceSecs={o.voiceSecs}
            />

            {o.initialPlan && (
              <Card title="系统初始带出方案">
                <p className="text-body-sm text-text-secondary leading-relaxed">{o.initialPlan}</p>
              </Card>
            )}
          </div>
        )}

        {tab === "review" &&
          (o.status === "待审批" ? (
            <div className="rounded-xl bg-card border border-border p-6 text-center text-body-sm text-text-tertiary">
              <ClipboardList className="h-6 w-6 mx-auto mb-2 text-text-tertiary" />
              工单待审批，暂无审核记录
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-card border border-border divide-y divide-border">
                <Row label="审核人" value={<Avatar name={o.approver} size={5} />} />
                <Row
                  label="审核时间"
                  value={<span className="text-body-sm text-foreground">{o.reviewedAt}</span>}
                />
                <Row
                  label="审核结果"
                  value={
                    o.status === "已驳回" ? (
                      <span className="tag tag-danger">已驳回</span>
                    ) : o.status === "已终止" ? (
                      <span className="tag tag-muted">已终止</span>
                    ) : (
                      <span className="tag tag-success">通过</span>
                    )
                  }
                />
                {o.status === "已驳回" && (
                  <Row
                    label="驳回理由"
                    value={
                      <span className="text-body-sm text-foreground">证据不足，请补充</span>
                    }
                  />
                )}
                <Row
                  label="确认工单类型"
                  value={<span className="tag tag-muted">{o.confirmedType}</span>}
                />
                <Row
                  label="确认标签"
                  value={
                    <div className="flex flex-wrap gap-1 justify-end">
                      {o.confirmedTags.map((t) => (
                        <span key={t} className="tag tag-brand">{t}</span>
                      ))}
                    </div>
                  }
                />
              </div>

              <Card title={isLoss ? "事项结论" : "诊断结论"}>
                <p className="text-body-sm text-foreground leading-relaxed">{o.conclusion}</p>
              </Card>

              <Card title="具体描述">
                <p className="text-body-sm text-text-secondary leading-relaxed">{o.reviewDesc}</p>
              </Card>

              {o.treatments.length > 0 && (
                <Card title={isHoof ? "执行方案" : "治疗方案"}>
                  <ul className="divide-y divide-border -mx-1">
                    {o.treatments.map((t) => (
                      <li key={t.name} className="px-1 py-2 space-y-1">
                        <div className="text-body-sm font-medium text-foreground">{t.name}</div>
                        <div className="text-caption text-text-tertiary flex flex-wrap gap-x-3 gap-y-0.5">
                          <span>用法：<span className="text-text-secondary">{t.usage}</span></span>
                          <span>用量：<span className="text-text-secondary">{t.dose}</span></span>
                          <span>时长：<span className="text-text-secondary">{t.duration}</span></span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {o.materials.length > 0 && (
                <Card
                  title="物资/药品需求"
                  right={<span className="text-caption text-text-tertiary">共 {o.materials.length} 项</span>}
                >
                  <ul className="divide-y divide-border -mx-1">
                    {o.materials.map((m) => (
                      <li key={m.name} className="px-1 py-2 flex items-center justify-between gap-3">
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
                  {o.pickupCode && (
                    <div className="mt-2 rounded-lg bg-brand-subtle px-3 py-2 text-caption text-primary inline-flex items-start gap-1.5 w-full">
                      <PackagePlus className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>领物码：{o.pickupCode}，执行者到仓库核销领取。</span>
                    </div>
                  )}
                </Card>
              )}

              <div className="rounded-xl bg-card border border-border divide-y divide-border">
                <Row
                  label="执行安排"
                  value={<span className="text-body-sm text-foreground text-right">{o.arrangement}</span>}
                />
                {o.review && (
                  <Row
                    label="复查/验收"
                    value={<span className="text-body-sm text-foreground text-right">{o.review}</span>}
                  />
                )}
                <Row label="指定执行人" value={<Avatar name={o.executor} size={5} />} />
                {o.remark && (
                  <Row
                    label="备注"
                    value={<span className="text-body-sm text-text-secondary text-right">{o.remark}</span>}
                  />
                )}
              </div>
            </div>
          ))}

        {tab === "exec" &&
          (o.status === "待审批" || o.status === "已驳回" || o.status === "已终止" ? (
            <div className="rounded-xl bg-card border border-border p-6 text-center text-body-sm text-text-tertiary">
              <PlayCircle className="h-6 w-6 mx-auto mb-2 text-text-tertiary" />
              {o.status === "待审批" ? "工单尚未开始执行" : `工单${o.status}，无执行记录`}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-card border border-border divide-y divide-border">
                <Row label="执行人" value={<Avatar name={o.executor} size={5} />} />
                <Row
                  label="开始执行时间"
                  value={<span className="text-body-sm text-foreground">{o.executedAt}</span>}
                />
              </div>

              {/* Checklist */}
              {o.checklist.map((day, idx) => (
                <div key={idx} className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between bg-surface-subtle/50">
                    <div className="flex items-center gap-2">
                      {day.done ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-text-tertiary" />
                      )}
                      <span className="text-body-sm font-medium text-foreground">{day.day}</span>
                      <span className="text-caption text-text-tertiary">{day.date}</span>
                    </div>
                    <span
                      className={
                        day.done
                          ? "tag tag-success"
                          : idx === 0
                          ? "tag tag-warning"
                          : "tag tag-muted"
                      }
                    >
                      {day.done ? "已完成" : idx === 0 ? "进行中" : "待执行"}
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {day.items.map((it, i) => (
                      <li key={i} className="px-4 py-2.5 flex items-start gap-2">
                        <span
                          className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                            it.type === "pickup"
                              ? "bg-primary"
                              : it.type === "action"
                              ? "bg-[var(--state-success)]"
                              : it.type === "target"
                              ? "bg-[var(--state-warning)]"
                              : it.type === "evidence"
                              ? "bg-text-tertiary"
                              : "bg-text-tertiary"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-body-sm text-foreground">{it.text}</div>
                        </div>
                        {it.type === "pickup" && o.pickupCode && (
                          <button
                            onClick={() => navigate({ to: "/m/pickup/$id", params: { id: o.id } })}
                            className="inline-flex items-center text-caption text-primary"
                          >
                            领物
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
      </div>

      {/* 3. 底部操作区 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        {o.status === "待审批" && (
          showApproval ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-surface-subtle px-3 py-2 text-caption text-text-secondary inline-flex items-start gap-1.5 w-full">
                <AlertTriangle className="h-3.5 w-3.5 text-[var(--state-warning)] shrink-0 mt-0.5" />
                <span>小程序暂不支持审批操作，请前往 PC 端处理。</span>
              </div>
              <button
                onClick={() => navigate({ to: "/m/health" })}
                className="w-full h-11 rounded-lg border border-border text-body text-text-secondary"
              >
                返回工单列表
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate({ to: "/m/health" })}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body"
            >
              返回工单列表
            </button>
          )
        )}

        {o.status === "进行中" && (
          showExecBtn ? (
            <div className="flex gap-2">
              {o.needPickup && (
                <button
                  onClick={() => navigate({ to: "/m/pickup/$id", params: { id: o.id } })}
                  className="flex-1 h-12 rounded-lg border border-border text-body text-text-secondary inline-flex items-center justify-center gap-1.5"
                >
                  <PackagePlus className="h-4 w-4" />
                  领物
                </button>
              )}
              <button
                onClick={() => setConfirm("issue")}
                className="flex-1 h-12 rounded-lg border border-border text-body text-text-secondary inline-flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="h-4 w-4" />
                反馈
              </button>
              <button
                onClick={() => setConfirm("finish")}
                className="flex-[1.2] h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
              >
                <PlayCircle className="h-4 w-4" />
                执行记录
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate({ to: "/m/health" })}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body"
            >
              返回工单列表
            </button>
          )
        )}

        {o.status === "已驳回" && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate({ to: "/m/health" })}
              className="flex-1 h-12 rounded-lg border border-border text-body text-text-secondary"
            >
              返回
            </button>
            <button
              onClick={() => navigate({ to: "/m/report" })}
              className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
            >
              <Pencil className="h-4 w-4" />
              重新编辑
            </button>
          </div>
        )}

        {(o.status === "已完成" || o.status === "已终止") && (
          <button
            onClick={() => navigate({ to: "/m/health" })}
            className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body"
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
                : confirm === "issue"
                ? "提交异常反馈?"
                : confirm === "terminate"
                ? "确认终止该工单?"
                : "确认提交完成?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-sm text-text-tertiary mt-1">
              工单 {o.id} · {o.target}
              <br />
              操作后状态将更新
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!flex-row gap-3 px-4 pt-5">
            <AlertDialogCancel className="flex-1 h-12 m-0 rounded-xl bg-surface-subtle border-0 text-body text-text-secondary">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              className={`flex-1 h-12 rounded-xl text-body ${
                confirm === "reject" || confirm === "issue" || confirm === "terminate"
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
    <div className="px-4 min-h-12 py-2.5 flex items-center justify-between gap-3">
      <span className="text-body-sm text-text-tertiary shrink-0">{label}</span>
      <div className="text-right min-w-0">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-caption text-text-tertiary">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function Card({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-caption text-text-tertiary">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function EvidenceCard({
  photos,
  videos,
  voiceSecs,
}: {
  photos: number;
  videos: number;
  voiceSecs: number;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-4 space-y-3">
      <div className="text-caption text-text-tertiary">证据材料</div>
      {photos > 0 && (
        <div>
          <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
            <Camera className="h-3 w-3" /> 照片 · {photos} 张
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: photos }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border"
              />
            ))}
          </div>
        </div>
      )}
      {videos > 0 && (
        <div>
          <div className="text-caption text-text-tertiary mb-2 inline-flex items-center gap-1">
            <Video className="h-3 w-3" /> 视频 · {videos} 段
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: videos }).map((_, i) => (
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
      {voiceSecs > 0 && (
        <div className="flex items-center gap-2 px-3 h-10 rounded-lg bg-surface-subtle border border-border">
          <Mic className="h-4 w-4 text-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full w-2/3 bg-primary/60" />
          </div>
          <span className="font-mono text-caption text-text-secondary">
            00:{String(voiceSecs).padStart(2, "0")}
          </span>
        </div>
      )}
      {photos === 0 && videos === 0 && voiceSecs === 0 && (
        <div className="text-body-sm text-text-tertiary inline-flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> 仅文字描述，无附件
        </div>
      )}
    </div>
  );
}
