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
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/health/")({
  head: () => ({ meta: [{ title: "工单 · 奇点智牧" }] }),
  component: HealthListPage,
});

type Status = "待审核" | "执行中" | "已驳回" | "已完成";

type Order = {
  id: string;
  target: string;
  type: string;
  event: string;
  proposer: string;
  who: string;
  status: Status;
  createdAt: string;
};

const orders: Order[] = [
  { id: "WO-2381", target: "#A2381", type: "疾病治疗", event: "持续高烧 2 小时", proposer: "陈晓东", who: "李雨晴", status: "待审核", createdAt: "今日 09:08" },
  { id: "WO-2298", target: "#A2298", type: "疾病治疗", event: "乳房炎复诊", proposer: "李雨晴", who: "李雨晴", status: "执行中", createdAt: "昨日 14:20" },
  { id: "WO-2401", target: "犊牛舍 A", type: "免疫", event: "口蹄疫加强免疫", proposer: "周凯", who: "周凯", status: "执行中", createdAt: "昨日 10:00" },
  { id: "WO-2324", target: "#A2324", type: "普修", event: "采食量持续下降", proposer: "张伟", who: "王建国", status: "已驳回", createdAt: "前日 18:42" },
  { id: "WO-2099", target: "1 号牛舍", type: "驱虫", event: "季度体内驱虫", proposer: "周凯", who: "周凯", status: "待审核", createdAt: "今日 08:20" },
  { id: "WO-2150", target: "#A2150", type: "修蹄", event: "批次修蹄", proposer: "孙明", who: "孙明", status: "已完成", createdAt: "5 月 9 日" },
];

const tabs: { key: Status | "全部"; label: string }[] = [
  { key: "全部", label: "全部" },
  { key: "待审核", label: "待审" },
  { key: "执行中", label: "进行" },
  { key: "已完成", label: "已完成" },
  { key: "已驳回", label: "已驳回" },
];

const statusTone: Record<Status, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待审核: { tag: "tag tag-warning", icon: ClipboardList, color: "text-[var(--state-warning)]" },
  执行中: { tag: "tag tag-brand", icon: PlayCircle, color: "text-primary" },
  已驳回: { tag: "tag tag-danger", icon: AlertTriangle, color: "text-[var(--state-danger)]" },
  已完成: { tag: "tag tag-success", icon: CheckCircle2, color: "text-[var(--state-success)]" },
};

function HealthListPage() {
  const role = useRole();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("全部");
  const list = tab === "全部" ? orders : orders.filter((o) => o.status === tab);

  return (
    <MobileShell
      title={role === "manager" ? "工单审核" : "我的工单"}
      right={
        <Link
          to="/m/health/report"
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
            placeholder="按工单号 / 对象搜索"
            className="h-10 w-full pl-9 pr-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary"
          />
        </div>
      </div>

      {/* Tabs */}
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

      {/* 列表 */}
      <div className="px-4 mt-3 space-y-2.5">
        {list.length === 0 && (
          <div className="py-16 text-center text-body-sm text-text-tertiary">
            暂无{tab === "全部" ? "" : tab}工单
          </div>
        )}
        {list.map((o) => {
          const s = statusTone[o.status];
          const Icon = s.icon;
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
                  <span className="tag tag-muted">{o.type}</span>
                </div>
                <span className={s.tag}>{o.status}</span>
              </div>
              <div className="text-body text-foreground">
                {o.target} · {o.event}
              </div>
              <div className="mt-2 flex items-center justify-between text-caption text-text-tertiary">
                <span>提出 {o.proposer} · 负责 {o.who}</span>
                <span className="inline-flex items-center">
                  {o.createdAt} <ChevronRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </MobileShell>
  );
}
