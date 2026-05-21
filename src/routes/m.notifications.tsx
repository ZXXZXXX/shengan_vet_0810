import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  CheckCheck,
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  UserCog,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/notifications")({
  head: () => ({ meta: [{ title: "消息通知 · 奇点智牧" }] }),
  component: NotificationsPage,
});

type Cat = "all" | "approval" | "task" | "result" | "permission";

type Msg = {
  id: string;
  cat: Exclude<Cat, "all">;
  title: string;
  desc: string;
  time: string;
  link?: string;
  unread?: boolean;
  urgent?: boolean;
};

const MSGS: Msg[] = [
  {
    id: "n1",
    cat: "approval",
    title: "待您审批：处方申请 RX-2381",
    desc: "兽医助理 王芳 提交了 #A2381 的退烧处方申请，已等待 35 分钟。",
    time: "5 分钟前",
    link: "/m/health/A2381",
    unread: true,
    urgent: true,
  },
  {
    id: "n2",
    cat: "task",
    title: "工单催办：3 号牛舍体温复测",
    desc: "工单 T-1042 已超期 20 分钟未开始执行，请尽快处理。",
    time: "12 分钟前",
    link: "/m/workspace",
    unread: true,
    urgent: true,
  },
  {
    id: "n3",
    cat: "result",
    title: "审批通过：损耗申请 LS-0908",
    desc: "您提交的 #A2188 损耗申请已被场长 张磊 通过。",
    time: "1 小时前",
    link: "/m/workspace",
    unread: true,
  },
  {
    id: "n4",
    cat: "task",
    title: "新工单：修蹄任务 T-1056",
    desc: "为您指派 2 号舍 4 头牛只的修蹄任务，计划今日 15:00 前完成。",
    time: "2 小时前",
    link: "/m/workspace",
    unread: true,
  },
  {
    id: "n5",
    cat: "result",
    title: "审批驳回：药品领用 DS-0421",
    desc: "您的领药申请被驳回，原因：库存紧张，请改用替代药品。",
    time: "3 小时前",
    link: "/m/workspace",
  },
  {
    id: "n6",
    cat: "permission",
    title: "角色权限变更",
    desc: "您的角色已由「兽医助理」调整为「兽医」，新权限即时生效。",
    time: "昨天 18:20",
    link: "/m/me",
  },
  {
    id: "n7",
    cat: "approval",
    title: "待您审批：免疫计划调整",
    desc: "兽医 刘洋 提交了 3 号舍口蹄疫加强免疫计划，等待您批准。",
    time: "昨天 16:05",
    link: "/m/workspace",
  },
  {
    id: "n8",
    cat: "permission",
    title: "牧场关联变更",
    desc: "您已被加入「2 号牧场（生产域）」，可在切换牧场中查看。",
    time: "2 天前",
    link: "/m/me",
  },
];

const TABS: { key: Cat; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "approval", label: "待审批" },
  { key: "task", label: "工单" },
  { key: "result", label: "审批结果" },
  { key: "permission", label: "权限" },
];

const META: Record<
  Msg["cat"],
  { icon: typeof ClipboardList; tone: string; label: string }
> = {
  approval: {
    icon: ShieldCheck,
    tone: "bg-[var(--state-warning)]/15 text-[var(--state-warning)]",
    label: "待审批",
  },
  task: {
    icon: ClipboardList,
    tone: "bg-brand-subtle text-primary",
    label: "工单",
  },
  result: {
    icon: CheckCircle2,
    tone: "bg-[var(--effect-ai-cyan)]/15 text-[var(--effect-ai-cyan)]",
    label: "结果",
  },
  permission: {
    icon: UserCog,
    tone: "bg-[var(--effect-ai-purple)]/15 text-[var(--effect-ai-purple)]",
    label: "权限",
  },
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Cat>("all");
  const [msgs, setMsgs] = useState<Msg[]>(MSGS);

  const filtered = tab === "all" ? msgs : msgs.filter((m) => m.cat === tab);
  const unreadCount = msgs.filter((m) => m.unread).length;

  const markAllRead = () => setMsgs(msgs.map((m) => ({ ...m, unread: false })));
  const markRead = (id: string) =>
    setMsgs(msgs.map((m) => (m.id === id ? { ...m, unread: false } : m)));

  return (
    <MobileShell hideTabBar>
      {/* 头部 */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="flex h-12 items-center px-2 pt-1">
          <button
            onClick={() => navigate({ to: "/m" })}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md text-text-secondary active:bg-surface-subtle"
            aria-label="返回"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-body font-medium text-foreground">
            消息通知
            {unreadCount > 0 && (
              <span className="ml-2 text-caption text-text-tertiary font-normal">
                {unreadCount} 条未读
              </span>
            )}
          </div>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="h-9 px-2.5 inline-flex items-center gap-1 text-caption text-text-secondary disabled:text-text-tertiary/60 active:bg-surface-subtle rounded-md"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            全部已读
          </button>
        </div>

        {/* 分类 tab */}
        <div className="px-3 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5">
            {TABS.map((t) => {
              const active = tab === t.key;
              const cnt =
                t.key === "all"
                  ? msgs.filter((m) => m.unread).length
                  : msgs.filter((m) => m.cat === t.key && m.unread).length;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`h-7 px-3 rounded-full text-caption whitespace-nowrap transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-subtle text-text-secondary"
                  }`}
                >
                  {t.label}
                  {cnt > 0 && (
                    <span
                      className={`ml-1 ${
                        active ? "opacity-90" : "text-[var(--state-danger)]"
                      }`}
                    >
                      {cnt}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* 消息列表 */}
      <section className="px-3 py-3 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-caption text-text-tertiary">
            暂无消息
          </div>
        )}

        {filtered.map((m) => {
          const Meta = META[m.cat];
          const Icon = Meta.icon;
          const card = (
            <div
              className={`relative flex gap-3 p-3 rounded-xl border transition-colors ${
                m.unread
                  ? "bg-card border-border"
                  : "bg-surface-subtle/40 border-border/60"
              } active:bg-surface-subtle`}
            >
              <span
                className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${Meta.tone}`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div
                    className={`flex-1 text-body leading-snug ${
                      m.unread
                        ? "text-foreground font-medium"
                        : "text-text-secondary"
                    }`}
                  >
                    {m.title}
                  </div>
                  {m.unread && (
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--state-danger)] shrink-0" />
                  )}
                </div>
                <div className="mt-1 text-caption text-text-tertiary leading-relaxed line-clamp-2">
                  {m.desc}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    {m.time}
                  </span>
                  {m.urgent && (
                    <span className="inline-flex items-center gap-1 text-caption text-[var(--state-danger)]">
                      <AlertTriangle className="h-3 w-3" />
                      催办
                    </span>
                  )}
                  <span
                    className={`ml-auto text-caption ${Meta.tone.split(" ")[1]}`}
                  >
                    {Meta.label}
                  </span>
                </div>
              </div>
            </div>
          );

          if (m.link) {
            return (
              <Link
                key={m.id}
                to={m.link}
                onClick={() => markRead(m.id)}
                className="block"
              >
                {card}
              </Link>
            );
          }
          return (
            <button
              key={m.id}
              onClick={() => markRead(m.id)}
              className="block w-full text-left"
            >
              {card}
            </button>
          );
        })}
      </section>
    </MobileShell>
  );
}
