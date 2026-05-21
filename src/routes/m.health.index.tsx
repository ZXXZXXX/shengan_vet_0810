import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  Stethoscope,
  PackageMinus,
  Footprints,
  Home,
  Inbox,
  MessageCircleWarning,
  Ban,
  Monitor,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole, canApprove } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/health/")({
  head: () => ({ meta: [{ title: "任务 · 奇点智牧" }] }),
  component: TaskListPage,
});

type Status =
  | "待审批"
  | "待响应"
  | "进行中"
  | "已完成"
  | "已驳回"
  | "已终止";
type Kind = "健康" | "损耗" | "修蹄" | "免疫" | "干奶" | "产后" | "驱虫" | "普修" | "复查";
type Task = {
  id: string;
  target: string;
  barn: string;
  kind: Kind;
  type: string;
  event: string;
  proposer: string;
  who: string;
  status: Status;
  createdAt: string;
  relation: ("我建单" | "我审批" | "我执行")[];
  hasFeedback?: boolean;
  needSupply?: boolean;
  linkedTaskId?: string;
};

// 当前登录用户名（mock，按角色映射，与卡片中 proposer / who 比对生成 relation）
const meName: Record<string, string> = {
  admin: "管理员·王伟",
  vet: "李雨晴",
  manager: "场长·赵磊",
  vet_assistant: "陈晓东",
  hoof_trimmer: "外部·张师傅",
};

const tasks: Task[] = [
  { id: "WO-2381", target: "#A2381", barn: "3 号牛舍", kind: "健康", type: "疾病治疗", event: "持续高烧 2 小时", proposer: "陈晓东", who: "李雨晴", status: "待审批", createdAt: "今日 09:08", relation: ["我建单", "我审批"] },
  { id: "WO-2298", target: "#A2298", barn: "3 号牛舍", kind: "健康", type: "疾病治疗", event: "乳房炎复诊", proposer: "李雨晴", who: "李雨晴", status: "进行中", createdAt: "昨日 14:20", relation: ["我审批", "我执行"], hasFeedback: true },
  { id: "WO-2401", target: "犊牛舍 A", barn: "犊牛舍 A", kind: "免疫", type: "口蹄疫加强免疫", event: "批次免疫执行", proposer: "李雨晴", who: "陈晓东", status: "进行中", createdAt: "昨日 10:00", relation: ["我审批", "我执行"] },
  { id: "WO-2324", target: "#A2324", barn: "5 号牛舍", kind: "普修", type: "普修", event: "采食量持续下降", proposer: "陈晓东", who: "李雨晴", status: "已驳回", createdAt: "前日 18:42", relation: ["我建单", "我审批"] },
  { id: "WO-2410", target: "#A2410", barn: "2 号牛舍", kind: "复查", type: "复查", event: "乳房炎复查", proposer: "李雨晴", who: "李雨晴", status: "已完成", createdAt: "5 月 18 日", relation: ["我审批", "我执行"] },
  { id: "WO-2415", target: "#A2415", barn: "1 号牛舍", kind: "健康", type: "疾病治疗", event: "蹄叶炎前置处置", proposer: "陈晓东", who: "李雨晴", status: "已终止", createdAt: "5 月 17 日", relation: ["我建单", "我审批"], linkedTaskId: "WO-2418" },
  { id: "LS-1029", target: "#A2150", barn: "2 号牛舍", kind: "损耗", type: "疾病死亡", event: "产后子宫破裂", proposer: "孙明", who: "李雨晴", status: "待审批", createdAt: "今日 08:20", relation: ["我审批"], needSupply: true },
  { id: "LS-1011", target: "#A1988", barn: "5 号牛舍", kind: "损耗", type: "淘汰处置", event: "高龄无产能", proposer: "孙明", who: "孙明", status: "已完成", createdAt: "5 月 15 日", relation: ["我审批"] },
  { id: "HF-0702", target: "#A2150", barn: "2 号牛舍", kind: "修蹄", type: "批次修蹄", event: "右后蹄趾间皮炎", proposer: "李雨晴", who: "外部·张师傅", status: "待响应", createdAt: "今日 07:30", relation: ["我审批", "我执行"] },
  { id: "HF-0688", target: "#A2270", barn: "3 号牛舍", kind: "修蹄", type: "批次修蹄", event: "蹄底溃疡处理", proposer: "李雨晴", who: "外部·张师傅", status: "进行中", createdAt: "5 月 12 日", relation: ["我审批", "我执行"] },
];

const tabs: { key: Status | "全部"; label: string }[] = [
  { key: "全部", label: "全部" },
  { key: "待审批", label: "待审批" },
  { key: "待响应", label: "待响应" },
  { key: "进行中", label: "进行中" },
  { key: "已完成", label: "已完成" },
  { key: "已驳回", label: "已驳回" },
  { key: "已终止", label: "已终止" },
];

const statusTone: Record<Status, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待审批: { tag: "tag tag-warning", icon: ClipboardList, color: "text-[var(--state-warning)]" },
  待响应: { tag: "tag tag-warning", icon: Inbox, color: "text-[var(--state-warning)]" },
  进行中: { tag: "tag tag-brand", icon: PlayCircle, color: "text-primary" },
  已驳回: { tag: "tag tag-danger", icon: AlertTriangle, color: "text-[var(--state-danger)]" },
  已完成: { tag: "tag tag-success", icon: CheckCircle2, color: "text-[var(--state-success)]" },
  已终止: { tag: "tag tag-muted", icon: Ban, color: "text-text-tertiary" },
};

const kindIcon: Partial<Record<Kind, typeof Stethoscope>> = {
  健康: Stethoscope,
  损耗: PackageMinus,
  修蹄: Footprints,
};

// 健康/执行类（需 PC 端审批派单）
const isExecKind = (k: Kind) => k !== "损耗";

function TaskListPage() {
  const role = useRole();
  const isApprover = canApprove(role);
  const me = meName[role] ?? "";

  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>(
    isApprover ? "待审批" : "全部",
  );
  const [rel, setRel] = useState<(typeof relationTabs)[number]["key"]>("全部");

  // 修蹄工只看到自己的修蹄任务
  const list = useMemo(() => {
    let l = tasks;
    if (role === "hoof_trimmer") l = l.filter((t) => t.kind === "修蹄");
    // 仅展示与本人有关系的任务（mock：按 proposer/who 命中或既定 relation）
    l = l.filter((t) =>
      t.relation.some((r) => {
        if (r === "我建单") return t.proposer === me;
        if (r === "我执行") return t.who === me;
        if (r === "我审批") return isApprover;
        return false;
      }),
    );
    if (rel !== "全部") {
      l = l.filter((t) =>
        t.relation.includes(rel) &&
        (rel === "我审批"
          ? isApprover
          : rel === "我建单"
          ? t.proposer === me
          : t.who === me),
      );
    }
    if (tab !== "全部") l = l.filter((o) => o.status === tab);
    return l;
  }, [role, isApprover, me, rel, tab]);

  return (
    <MobileShell
      title={isApprover ? "任务中心" : "我的任务"}
      right={
        <Link
          to="/m/report"
          className="h-7 w-7 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </Link>
      }
    >
      {/* 搜索 */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            placeholder="按任务号 / 对象搜索"
            className="h-10 w-full pl-9 pr-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary"
          />
        </div>
      </div>

      {/* 角色关系筛选 */}
      <div className="px-4 mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {relationTabs.map((t) => {
          // 非审批者隐藏“我审批”
          if (t.key === "我审批" && !isApprover) return null;
          return (
            <button
              key={t.key}
              onClick={() => setRel(t.key)}
              className={`shrink-0 h-7 px-3 rounded-full text-caption transition-colors ${
                rel === t.key
                  ? "bg-brand-subtle text-primary border border-primary/30"
                  : "bg-card border border-border text-text-secondary"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 状态 Tabs */}
      <div className="px-4 mt-2.5 flex gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 h-8 px-3 rounded-full text-body-sm transition-colors ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-text-secondary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 列表 —— 按牛舍分组 */}
      <div className="px-4 mt-3 pb-4 space-y-4">
        {list.length === 0 && (
          <div className="py-16 text-center text-body-sm text-text-tertiary">
            暂无{tab === "全部" ? "" : tab}任务
          </div>
        )}
        {Object.entries(
          list.reduce<Record<string, Task[]>>((acc, t) => {
            (acc[t.barn] ||= []).push(t);
            return acc;
          }, {}),
        )
          .sort(([a], [b]) => a.localeCompare(b, "zh"))
          .map(([barn, items]) => (
            <section key={barn}>
              <div className="sticky top-0 z-[1] -mx-4 px-4 py-2 bg-background/85 backdrop-blur flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-brand-subtle text-primary inline-flex items-center justify-center">
                  <Home className="h-3.5 w-3.5" />
                </span>
                <span className="text-body-sm font-medium text-foreground">{barn}</span>
                <span className="text-caption text-text-tertiary">共 {items.length} 项</span>
              </div>
              <div className="space-y-2.5 mt-1">
                {items.map((o) => {
                  const s = statusTone[o.status];
                  const Icon = s.icon;
                  const KIcon = kindIcon[o.kind] ?? Stethoscope;
                  const myRel = o.relation.filter((r) =>
                    r === "我审批"
                      ? isApprover
                      : r === "我建单"
                      ? o.proposer === me
                      : o.who === me,
                  );
                  const iApprove = myRel.includes("我审批");
                  const iExecute = myRel.includes("我执行");

                  // 右下角操作文案
                  let action: { text: string; tone: "brand" | "warning" | "muted" } | null = null;
                  if (o.status === "待审批" && iApprove) {
                    action = isExecKind(o.kind)
                      ? { text: "前往 PC 端审批", tone: "muted" }
                      : { text: "去审批", tone: "warning" };
                  } else if (o.status === "待响应" && iExecute) {
                    action = { text: "去接单 / 拒绝", tone: "warning" };
                  } else if (o.status === "进行中" && iExecute) {
                    action = { text: "去填执行记录", tone: "brand" };
                  }

                  const toneCls =
                    action?.tone === "brand"
                      ? "text-primary"
                      : action?.tone === "warning"
                      ? "text-[var(--state-warning)]"
                      : "text-text-tertiary";

                  return (
                    <Link
                      key={o.id}
                      to="/m/health/$id"
                      params={{ id: o.id }}
                      className="block rounded-xl bg-card border border-border p-4 active:bg-surface-subtle"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${s.color}`} />
                          <span className="font-mono text-body-sm text-foreground">{o.id}</span>
                          <span className="tag tag-muted inline-flex items-center gap-1">
                            <KIcon className="h-3 w-3" /> {o.kind}
                          </span>
                          {o.hasFeedback && (
                            <span className="tag tag-danger inline-flex items-center gap-1">
                              <MessageCircleWarning className="h-3 w-3" /> 反馈待处理
                            </span>
                          )}
                        </div>
                        <span className={s.tag}>{o.status}</span>
                      </div>
                      <div className="text-body text-foreground">
                        {o.target} · {o.event}
                      </div>
                      {o.linkedTaskId && (
                        <div className="mt-1 text-caption text-text-tertiary">
                          关联工单 {o.linkedTaskId}
                        </div>
                      )}
                      <div className="mt-2 flex items-start justify-between text-caption text-text-tertiary">
                        <span className="truncate">
                          提出 {o.proposer} · 负责 {o.who}
                        </span>
                        <div className="flex flex-col items-end gap-1 shrink-0 min-w-1 ml-3">
                          <span>{o.createdAt}</span>
                          {action && (
                            <span className={`inline-flex items-center gap-0.5 ${toneCls}`}>
                              {action.tone === "muted" && (
                                <Monitor className="h-3 w-3 mr-0.5" />
                              )}
                              {action.text}
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </MobileShell>
  );
}
