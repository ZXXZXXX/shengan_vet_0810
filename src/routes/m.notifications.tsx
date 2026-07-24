import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { setUnreadCount } from "@/lib/notify-store";
import {
  CheckCheck,
  ClipboardList,
  Settings2,
  Megaphone,
  Clock,
  FlaskConical,
  ImageIcon,
  MailQuestion,
  Stethoscope,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/m/notifications")({
  head: () => ({ meta: [{ title: "消息通知 · 奇点智牧" }] }),
  component: NotificationsPage,
});

/** 消息维度 */
type Cat = "system" | "workorder" | "platform" | "lab" | "exam";

type LabInfo = {
  earTag: string; // #nn-nn-nnnn
  project: string;
  result: "阴性" | "阳性" | "合格" | "不合格";
  conclusion: string;
  submitter: string;
  submittedAt: string; // yyyy-mm-dd hh:mm
  reportImages: number[]; // 可能为空
};

type Jump =
  | { kind: "cattle"; earTag: string }
  | { kind: "workorder"; id: string }
  | { kind: "orderList" };

type Msg = {
  id: string;
  cat: Cat;
  title: string;
  desc: string;
  time: string;
  /** minutes ago, used for sorting */
  ts: number;
  link?: string;
  jump?: Jump;
  unread?: boolean;
  lab?: LabInfo;
};

const MSGS: Msg[] = [
  // ===== 工单类：待执行的工单内任务、待诊断的工单 =====
  {
    id: "n1",
    cat: "workorder",
    title: "待诊断：处方申请 RX-2381",
    desc: "兽医助理 王芳 提交了 #01-24-2381 的退烧处方申请，已等待。",
    time: "5 分钟前",
    ts: 5,
    jump: { kind: "workorder", id: "RX-2381" },
    unread: true,
  },
  {
    id: "n2",
    cat: "workorder",
    title: "待执行：3 号牛舍体温复测",
    desc: "工单 T-1042 已逾期未开始执行，请尽快处理。",
    time: "12 分钟前",
    ts: 12,
    jump: { kind: "workorder", id: "T-1042" },
    unread: true,
  },
  {
    id: "n3",
    cat: "workorder",
    title: "待执行：疾病治疗 T-1056",
    desc: "「兽医」王医生为您指派 2 号舍 4 头牛只的疾病治疗工作，计划今日 15:00 开始执行。",
    time: "2 小时前",
    ts: 120,
    jump: { kind: "workorder", id: "T-1056" },
    unread: true,
  },

  // ===== 平台类：免疫工单下发、修蹄工单下发等 =====
  {
    id: "p1",
    cat: "platform",
    title: "免疫工单：口蹄疫春季加强",
    desc: "平台已下发 IMM-0529 免疫工单，覆盖 1/3/5 号舍共 128 头牛只，计划今日 14:00 执行。",
    time: "30 分钟前",
    ts: 30,
    jump: { kind: "orderList" },
    unread: true,
  },
  {
    id: "p2",
    cat: "platform",
    title: "修蹄工单：周度例行修蹄",
    desc: "平台已下发 HOOF-0528 修蹄工单，涉及 2 号舍 18 头泌乳牛，计划本周内完成。",
    time: "1 小时前",
    ts: 60,
    jump: { kind: "orderList" },
    unread: true,
  },
  {
    id: "p3",
    cat: "platform",
    title: "繁育工单：同期发情处理",
    desc: "平台已下发 BRE-0527 繁育工单，覆盖 4 号舍 22 头空怀牛只。",
    time: "昨天 09:10",
    ts: 60 * 14,
    jump: { kind: "orderList" },
  },

  // ===== 系统类：更新事项、权限变更、角色变更 =====
  {
    id: "s1",
    cat: "system",
    title: "角色变更通知",
    desc: "您的角色已由「兽医助理」调整为「兽医」，新权限即时生效。",
    time: "昨天 18:20",
    ts: 60 * 20,
    jump: { kind: "orderList" },
    unread: true,
  },
  {
    id: "s2",
    cat: "system",
    title: "权限变更通知",
    desc: "您在「1 号牧场」的数据权限范围已扩展至全部牛舍，原仅限 1/2 号舍。",
    time: "昨天 16:05",
    ts: 60 * 22,
    jump: { kind: "orderList" },
  },
  {
    id: "s3",
    cat: "system",
    title: "系统更新事项",
    desc: "奇点智牧 v2.4.0 已发布：新增 AI 辅助诊断、优化工单流转性能，建议尽快刷新使用。",
    time: "2 天前",
    ts: 60 * 48,
    jump: { kind: "orderList" },
  },
  // ===== 实验室类：检查结果已出 =====
  {
    id: "l1",
    cat: "lab",
    title: "牛只 #01-24-2381 检测结果已出",
    desc: "口蹄疫病毒A/O型ELISA抗体检测的最终结果为合格，点击查看附件，了解具体数据",
    time: "10 分钟前",
    ts: 10,
    unread: true,
    jump: { kind: "cattle", earTag: "#01-24-2381" },
    lab: {
      earTag: "#01-24-2381",
      project: "口蹄疫病毒A/O型ELISA抗体检测",
      result: "合格",
      conclusion: "合格",
      submitter: "李文静（牧场自有实验室）",
      submittedAt: "2026-07-22 09:42",
      reportImages: [1, 2, 3],
    },
  },
  {
    id: "l2",
    cat: "lab",
    title: "牛只 #01-24-2270 检测结果已出",
    desc: "牛结核病γ-干扰素ELISA检测（赛默飞）的最终结果为阳性，点击查看附件，了解具体数据",
    time: "昨天 15:30",
    ts: 60 * 20,
    jump: { kind: "cattle", earTag: "#01-24-2270" },
    lab: {
      earTag: "#01-24-2270",
      project: "牛结核病γ-干扰素ELISA检测（赛默飞）",
      result: "阳性",
      conclusion: "阳性",
      submitter: "第三方实验室 · 张伟",
      submittedAt: "2026-07-21 15:12",
      reportImages: [],
    },
  },

  // ===== 基础检查类：平台下发的基础检查任务 =====
  {
    id: "e1",
    cat: "exam",
    title: "基础检查：牛只 #01-24-2381 产后 7 天例检",
    desc: "请对该牛只完成以下基础检查：体温测量、子宫分泌物评分（1–5 分）、酮病血酮值检测。请在今日 18:00 前完成并在牛只档案中记录。",
    time: "8 分钟前",
    ts: 8,
    unread: true,
    jump: { kind: "cattle", earTag: "#01-24-2381" },
  },
  {
    id: "e2",
    cat: "exam",
    title: "基础检查：牛只 #01-24-2270 孕检",
    desc: "请对该牛只完成孕检与体温测量，如发现异常请同步上报兽医。",
    time: "1 小时前",
    ts: 60,
    unread: true,
    jump: { kind: "cattle", earTag: "#01-24-2270" },
  },
];

const JUMP_LABEL: Record<Jump["kind"], string> = {
  cattle: "查看牛只档案",
  workorder: "查看工单详情",
  orderList: "查看工单列表",
};

function jumpToPath(j: Jump): string {
  switch (j.kind) {
    case "cattle":
      return `/m/animals-${j.earTag.replace(/^#/, "")}`;
    case "workorder":
      return `/m/health/${j.id}`;
    case "orderList":
      return "/m/health";
  }
}

const META: Record<
  Cat,
  { icon: typeof ClipboardList; tone: string; label: string }
> = {
  system: {
    icon: Settings2,
    tone: "bg-[var(--effect-ai-purple)]/15 text-[var(--effect-ai-purple)]",
    label: "系统",
  },
  workorder: {
    icon: ClipboardList,
    tone: "bg-brand-subtle text-primary",
    label: "工单",
  },
  platform: {
    icon: Megaphone,
    tone: "bg-[#E6F7FE] text-[#22ACEB]",
    label: "平台",
  },
  lab: {
    icon: FlaskConical,
    tone: "bg-[#FFF3E0] text-[#F59E0B]",
    label: "实验室",
  },
  exam: {
    icon: Megaphone,
    tone: "bg-[#E6F7FE] text-[#22ACEB]",
    label: "基础检查",
  },
};

function NotificationsPage() {
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>(MSGS);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () => [...msgs].sort((a, b) => a.ts - b.ts),
    [msgs],
  );
  const unreadCount = msgs.filter((m) => m.unread).length;
  useEffect(() => {
    setUnreadCount(unreadCount);
  }, [unreadCount]);
  const current = openId ? msgs.find((m) => m.id === openId) ?? null : null;

  const markAllRead = () =>
    setMsgs(msgs.map((m) => ({ ...m, unread: false })));
  const markRead = (id: string) =>
    setMsgs((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m)),
    );

  const openMsg = (id: string) => {
    markRead(id);
    setOpenId(id);
  };

  const markUnread = (id: string) => {
    setMsgs((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: true } : m)),
    );
    setOpenId(null);
  };

  const goJump = () => {
    if (current?.jump) {
      const path = jumpToPath(current.jump);
      setOpenId(null);
      navigate({ to: path });
    }
  };

  return (
    <MobileShell>
      {/* 头部 */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="flex h-12 items-center px-3 pt-1">
          <div className="flex-1 text-body font-medium text-foreground">
            消息通知
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
                      {formatMsgTime(m.ts, m.time)}
                    </span>
                    <span
                      className={`ml-auto text-caption ${Meta.tone.split(" ")[1]}`}
                    >
                      {Meta.label}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* 详情抽屉（统一样式与高度） */}
      <Sheet open={!!current} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl p-0 h-[80vh] flex flex-col bg-white [&>button.absolute]:hidden"
        >
          {current && (
            <>
              <SheetHeader className="px-4 pt-4 pb-3 border-b border-border text-left">
                <div className="flex items-center justify-between gap-2">
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
                  </div>
                  <button
                    type="button"
                    onClick={() => markUnread(current.id)}
                    className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-caption text-text-secondary hover:bg-surface-subtle active:bg-surface-subtle"
                  >
                    <MailQuestion className="h-3.5 w-3.5" strokeWidth={1.75} />
                    标记为未读
                  </button>
                </div>
                <SheetTitle className="text-left text-base mt-2">
                  {current.title}
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {current.cat === "lab" && current.lab ? (
                  <>
                    <DetailRow label="检测项目" value={current.lab.project} />
                    <DetailRow
                      label="最终结论"
                      value={current.lab.result}
                    />

                    <DetailRow
                      label="结论提交人"
                      value={current.lab.submitter}
                    />
                    <DetailRow
                      label="结论提交时间"
                      value={current.lab.submittedAt}
                    />
                    <div>
                      <div className="text-caption text-text-tertiary mb-2">
                        检测详情
                      </div>
                      {current.lab.reportImages.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {current.lab.reportImages.map((id) => (
                            <div
                              key={id}
                              className="aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border flex items-center justify-center text-text-tertiary"
                            >
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-surface-subtle/40 py-6 text-center text-caption text-text-tertiary">
                          实验室未上传检查报告图片
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-body text-text-secondary leading-relaxed">
                    {current.desc}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-border bg-white flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpenId(null)}
                >
                  关闭
                </Button>
                {current.jump && (
                  <Button className="flex-1" onClick={goJump}>
                    {current.cat === "exam"
                      ? "去记录检查"
                      : JUMP_LABEL[current.jump.kind]}
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MobileShell>
  );
}

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <div className="text-caption text-text-tertiary mb-1">{label}</div>
      <div
        className={`text-body text-foreground ${multiline ? "leading-relaxed" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

// ts 为“多少分钟前”，超过 2 天以 yyyy-mm-dd 显示
function formatMsgTime(ts: number, fallback: string): string {
  const TWO_DAYS = 60 * 24 * 2;
  if (ts <= TWO_DAYS) return fallback;
  const d = new Date(Date.now() - ts * 60_000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


