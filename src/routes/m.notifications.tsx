import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCheck,
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  UserCog,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/m/notifications")({
  head: () => ({ meta: [{ title: "消息通知 · 奇点智牧" }] }),
  component: NotificationsPage,
});

type Cat = "approval" | "task" | "result" | "permission";

type Msg = {
  id: string;
  cat: Cat;
  title: string;
  desc: string;
  time: string;
  /** minutes ago, used for sorting */
  ts: number;
  link?: string;
  unread?: boolean;
  urgent?: boolean;
  /** 自定义右下角文本，覆盖默认分类标签 */
  rightText?: string;
  /** 自定义右下角文本色调 */
  rightTone?: "default" | "danger";
};

const MSGS: Msg[] = [
  {
    id: "n1",
    cat: "approval",
    title: "待出诊：处方申请 RX-2381",
    desc: "兽医助理 王芳 提交了 #A2381 的退烧处方申请，已等待 35 分钟。",
    time: "5 分钟前",
    ts: 5,
    link: "/m/health/A2381",
    unread: true,
    rightText: "！请前往PC端出诊",
    rightTone: "danger",
  },
  {
    id: "n2",
    cat: "task",
    title: "待执行：3 号牛舍体温复测",
    desc: "工作 T-1042 已逾期 20 分钟未开始执行，请尽快处理。",
    time: "12 分钟前",
    ts: 12,
    link: "/m/",
    unread: true,
  },
  {
    id: "n3",
    cat: "task",
    title: "待执行：疾病治疗 T-1056",
    desc: "「兽医」王医生为您指派 2 号舍 4 头牛只的疾病治疗工作，计划今日 15:00 开始执行。",
    time: "2 小时前",
    ts: 120,
    link: "/m/",
    unread: true,
  },
  {
    id: "n4",
    cat: "permission",
    title: "角色权限变更",
    desc: "您的角色已由「兽医助理」调整为「兽医」，新权限即时生效。",
    time: "昨天 18:20",
    ts: 60 * 20,
    link: "/m/me",
  },
  {
    id: "n5",
    cat: "permission",
    title: "牧场关联变更",
    desc: "您已被加入「2 号牧场（生产域）」，可在切换牧场中查看。",
    time: "2 天前",
    ts: 60 * 48,
    link: "/m/me",
  },
];

const META: Record<
  Cat,
  { icon: typeof ClipboardList; tone: string; label: string }
> = {
  approval: {
    icon: ShieldCheck,
    tone: "bg-[var(--state-warning)]/15 text-[var(--state-warning)]",
    label: "待出诊",
  },
  task: {
    icon: ClipboardList,
    tone: "bg-brand-subtle text-primary",
    label: "工作",
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
  const [msgs, setMsgs] = useState<Msg[]>(MSGS);
  const [openId, setOpenId] = useState<string | null>(null);

  const sorted = useMemo(() => [...msgs].sort((a, b) => a.ts - b.ts), [msgs]);
  const unreadCount = msgs.filter((m) => m.unread).length;
  const current = openId ? msgs.find((m) => m.id === openId) ?? null : null;

  const markAllRead = () => setMsgs(msgs.map((m) => ({ ...m, unread: false })));
  const markRead = (id: string) =>
    setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));

  const openMsg = (id: string) => {
    markRead(id);
    setOpenId(id);
  };

  const goDetail = () => {
    if (current?.link) {
      const link = current.link;
      setOpenId(null);
      navigate({ to: link });
    }
  };

  return (
    <MobileShell>
      {/* 头部 */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="flex h-12 items-center px-3 pt-1">
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
      </header>

      {/* 消息列表 */}
      <section className="px-3 py-3 space-y-2">
        {sorted.length === 0 && (
          <div className="text-center py-16 text-caption text-text-tertiary">
            暂无消息
          </div>
        )}

        {sorted.map((m) => {
          const Meta = META[m.cat];
          const Icon = Meta.icon;
          return (
            <button
              key={m.id}
              onClick={() => openMsg(m.id)}
              className="block w-full text-left"
            >
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
                    {m.rightText ? (
                      <span
                        className={`ml-auto text-caption ${
                          m.rightTone === "danger"
                            ? "text-[var(--state-danger)]"
                            : "text-text-tertiary"
                        }`}
                      >
                        {m.rightText}
                      </span>
                    ) : (
                      <span
                        className={`ml-auto text-caption ${Meta.tone.split(" ")[1]}`}
                      >
                        {Meta.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* 详情弹窗 */}
      <Dialog open={!!current} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-[360px] rounded-2xl">
          {current && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${META[current.cat].tone}`}
                  >
                    {(() => {
                      const I = META[current.cat].icon;
                      return <I className="h-4 w-4" strokeWidth={1.75} />;
                    })()}
                  </span>
                  <span
                    className={`text-caption ${META[current.cat].tone.split(" ")[1]}`}
                  >
                    {META[current.cat].label}
                  </span>
                  {current.urgent && (
                    <span className="inline-flex items-center gap-1 text-caption text-[var(--state-danger)]">
                      <AlertTriangle className="h-3 w-3" />
                      催办
                    </span>
                  )}
                </div>
                <DialogTitle className="text-left text-base mt-2">
                  {current.title}
                </DialogTitle>
                <DialogDescription className="text-left text-body text-text-secondary leading-relaxed">
                  {current.desc}
                </DialogDescription>
              </DialogHeader>
              <div className="text-caption text-text-tertiary inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {current.time}
              </div>
              <DialogFooter className="flex-row gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpenId(null)}
                >
                  确认
                </Button>
                {current.link && (
                  <Button className="flex-1" onClick={goDetail}>
                    查看详情
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}
