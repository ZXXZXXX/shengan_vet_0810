import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole, canApprove } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/health/")({
  head: () => ({ meta: [{ title: "任务 · 奇点智牧" }] }),
  component: TaskListPage,
});

type Status = "待审批" | "进行中" | "已驳回" | "已完成";
type Kind = "健康" | "损耗";

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
};

const tasks: Task[] = [
  { id: "WO-2381", target: "#A2381", barn: "3 号牛舍", kind: "健康", type: "疾病治疗", event: "持续高烧 2 小时", proposer: "陈晓东", who: "李雨晴", status: "待审批", createdAt: "今日 09:08" },
  { id: "WO-2298", target: "#A2298", barn: "3 号牛舍", kind: "健康", type: "疾病治疗", event: "乳房炎复诊", proposer: "李雨晴", who: "李雨晴", status: "进行中", createdAt: "昨日 14:20" },
  { id: "WO-2401", target: "犊牛舍 A", barn: "犊牛舍 A", kind: "健康", type: "免疫", event: "口蹄疫加强免疫", proposer: "周凯", who: "周凯", status: "进行中", createdAt: "昨日 10:00" },
  { id: "WO-2324", target: "#A2324", barn: "5 号牛舍", kind: "健康", type: "普修", event: "采食量持续下降", proposer: "张伟", who: "王建国", status: "已驳回", createdAt: "前日 18:42" },
  { id: "LS-1029", target: "#A2150", barn: "2 号牛舍", kind: "损耗", type: "疾病死亡", event: "产后子宫破裂", proposer: "孙明", who: "李雨晴", status: "待审批", createdAt: "今日 08:20" },
  { id: "LS-1011", target: "#A1988", barn: "5 号牛舍", kind: "损耗", type: "淘汰处置", event: "高龄无产能", proposer: "孙明", who: "孙明", status: "已完成", createdAt: "5 月 15 日" },
];

const tabs: { key: Status | "全部"; label: string }[] = [
  { key: "全部", label: "全部" },
  { key: "待审批", label: "待审批" },
  { key: "进行中", label: "进行中" },
  { key: "已完成", label: "已完成" },
  { key: "已驳回", label: "已驳回" },
];

const statusTone: Record<Status, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待审批: { tag: "tag tag-warning", icon: ClipboardList, color: "text-[var(--state-warning)]" },
  进行中: { tag: "tag tag-brand", icon: PlayCircle, color: "text-primary" },
  已驳回: { tag: "tag tag-danger", icon: AlertTriangle, color: "text-[var(--state-danger)]" },
  已完成: { tag: "tag tag-success", icon: CheckCircle2, color: "text-[var(--state-success)]" },
};

const kindIcon: Record<Kind, typeof Stethoscope> = {
  健康: Stethoscope,
  损耗: PackageMinus,
};

function TaskListPage() {
  const role = useRole();
  const isApprover = canApprove(role);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>(isApprover ? "待审批" : "全部");

  let list = tasks;
  if (tab !== "全部") list = list.filter((o) => o.status === tab);

  return (
    <MobileShell
      title={isApprover ? "任务审批" : "我的任务"}
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

      {/* 状态 Tabs */}
      <div className="px-4 mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
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
          }, {})
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
                  const KIcon = kindIcon[o.kind];
                  const canApproveThis = isApprover && o.status === "待审批";
                  const canExecuteThis = !isApprover && o.status === "进行中";
                  return (
                    <Link
                      key={o.id}
                      to="/m/health/$id"
                      params={{ id: o.id }}
                      className="block rounded-xl bg-card border border-border p-4 active:bg-surface-subtle"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                          <span className="font-mono text-body-sm text-foreground">{o.id}</span>
                          <span className="tag tag-muted inline-flex items-center gap-1">
                            <KIcon className="h-3 w-3" /> {o.kind}
                          </span>
                        </div>
                        <span className={s.tag}>{o.status}</span>
                      </div>
                      <div className="text-body text-foreground">
                        {o.target} · {o.event}
                      </div>
                      <div className="mt-2 flex items-start justify-between text-caption text-text-tertiary">
                        <span className="truncate">提出 {o.proposer} · 负责 {o.who}</span>
                        <div className="flex flex-col items-end gap-1 shrink-0 min-w-1 ml-3">
                          <span>{o.createdAt}</span>
                          {(canApproveThis || canExecuteThis) && (
                            <span className="text-text-tertiary">
                              {canApproveThis ? "请前往 PC 审批" : "请前往 PC 处理"}
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
