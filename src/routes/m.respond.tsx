import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Clock,
  PackageCheck,
  CheckCircle2,
  EyeOff,
  Search,
  Inbox,
  ShieldCheck,
  ArrowUpDown,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole } from "@/lib/mobile-role";
import { toast } from "sonner";

export const Route = createFileRoute("/m/respond")({
  head: () => ({ meta: [{ title: "待响应 · 奇点智牧" }] }),
  component: RespondListPage,
});

type RespondCard = {
  id: string;
  kind: "疾病治疗" | "免疫" | "修蹄" | "普修" | "物资损耗";
  ear: string;
  barn: string;
  conclusion: string;
  /** ISO 时间字符串，用于排序 */
  execAt: string;
  execLabel: string;
  needPickup: boolean;
  pickupNote?: string;
  approver: string;
  approvedAt: string;
  /** ISO 时间字符串，用于发布时间排序 */
  approvedAtISO: string;
};

const initialCards: RespondCard[] = [
  {
    id: "WO-2381",
    kind: "疾病治疗",
    ear: "#A2381",
    barn: "3 号牛舍",
    conclusion: "持续高烧 2 小时，疑似乳房炎急性发作",
    execAt: "2026-05-25T10:30:00",
    execLabel: "今日 10:30",
    needPickup: true,
    pickupNote: "需领取：头孢噻呋钠 × 4 支",
    approver: "陈晓东",
    approvedAt: "今日 09:12",
    approvedAtISO: "2026-05-25T09:12:00",
  },
  {
    id: "WO-2502",
    kind: "疾病治疗",
    ear: "#A2502",
    barn: "1 号牛舍",
    conclusion: "乳房炎复诊，需复查体温与乳样",
    execAt: "2026-05-25T11:00:00",
    execLabel: "今日 11:00",
    needPickup: false,
    approver: "李雨晴",
    approvedAt: "今日 09:40",
    approvedAtISO: "2026-05-25T09:40:00",
  },
  {
    id: "LS-1029",
    kind: "物资损耗",
    ear: "—",
    barn: "2 号牛舍",
    conclusion: "口蹄疫疫苗 A 型 8 支冷链断电失效，需补领",
    execAt: "2026-05-25T13:30:00",
    execLabel: "今日 13:30",
    needPickup: true,
    pickupNote: "需领取：免疫器械包 × 1",
    approver: "孙明",
    approvedAt: "今日 08:45",
    approvedAtISO: "2026-05-25T08:45:00",
  },
  {
    id: "WO-2401",
    kind: "免疫",
    ear: "犊牛批次 B-07",
    barn: "犊牛舍 A",
    conclusion: "口蹄疫加强免疫，批次共 32 头",
    execAt: "2026-05-26T09:00:00",
    execLabel: "明日 09:00",
    needPickup: true,
    pickupNote: "需领取：免疫器械包 × 1",
    approver: "周凯",
    approvedAt: "昨日 17:20",
    approvedAtISO: "2026-05-24T17:20:00",
  },
  {
    id: "HF-0815",
    kind: "修蹄",
    ear: "#A2615",
    barn: "3 号牛舍",
    conclusion: "蹄底溃疡，需削蹄并贴蹄垫",
    execAt: "2026-05-26T14:00:00",
    execLabel: "明日 14:00",
    needPickup: false,
    approver: "周凯",
    approvedAt: "今日 08:10",
    approvedAtISO: "2026-05-25T08:10:00",
  },
];

function RespondListPage() {
  const role = useRole();
  // 按角色过滤可响应的工单类型
  const canSee = (id: string) => {
    if (role === "hoof_trimmer") return id.startsWith("HF-");
    if (role === "vet_assistant") return id.startsWith("WO-") || id.startsWith("LS-");
    return true;
  };

  const [cards, setCards] = useState<RespondCard[]>(initialCards);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<"exec" | "approved">("exec");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const filtered = cards
      .filter((c) => canSee(c.id))
      .filter((c) => {
        if (!kw) return true;
        return (
          c.id.toLowerCase().includes(kw) ||
          c.ear.toLowerCase().includes(kw) ||
          c.barn.toLowerCase().includes(kw) ||
          c.conclusion.toLowerCase().includes(kw) ||
          c.kind.toLowerCase().includes(kw)
        );
      });

    const sortKey = sortBy === "exec" ? "execAt" : "approvedAtISO";
    const dir = sortDir === "asc" ? 1 : -1;
    return filtered.sort((a, b) => {
      const aTime = +new Date(a[sortKey as keyof RespondCard] as string);
      const bTime = +new Date(b[sortKey as keyof RespondCard] as string);
      return (aTime - bTime) * dir;
    });
  }, [cards, q, role, sortBy, sortDir]);

  const handleIgnore = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.success(`已忽视 ${id}`);
  };
  const handleRespond = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.success("已成功加入工作列表");
  };

  return (
    <MobileShell title="待响应" back={{ to: "/m/" }}>
      {/* 搜索 */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索工单号 / 耳号 / 牛舍 / 症状"
            className="h-10 w-full pl-9 pr-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary"
          />
        </div>

        {/* 排序筛选器 */}
        <div className="mt-2.5 flex items-center gap-2">
          <button
            onClick={() => setSortBy((prev) => (prev === "exec" ? "approved" : "exec"))}
            className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-caption transition-colors ${
              sortBy === "exec"
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-text-secondary"
            }`}
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortBy === "exec" ? "执行时间" : "发布时间"}
          </button>
          <button
            onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
            className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-caption transition-colors ${
              sortDir === "desc"
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-text-secondary"
            }`}
          >
            {sortDir === "desc" ? "最近优先" : "最早优先"}
          </button>
          <span className="ml-auto text-caption text-text-tertiary">共 {list.length} 项</span>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="px-4 mt-3 pb-6 space-y-2.5">
        {list.length === 0 && (
          <div className="py-16 text-center">
            <Inbox className="h-8 w-8 mx-auto text-text-tertiary" />
            <div className="mt-2 text-body-sm text-text-tertiary">暂无待响应工作</div>
          </div>
        )}
        {list.map((c) => (
          <article
            key={c.id}
            className="rounded-xl bg-card border border-border p-4 space-y-2"
          >
            {/* 头部：工单编号｜类型｜状态 */}
            <div className="flex items-center gap-1.5 text-body-sm">
              <span className="font-mono text-foreground">{c.id}</span>
              <span className="text-text-tertiary">｜</span>
              <span className="text-text-secondary">{c.kind}</span>
              <span className="text-text-tertiary">｜</span>
              <span className="tag tag-warning">待响应</span>
            </div>

            {/* 耳号 · 牛舍 */}
            <div className="text-card-title text-foreground">
              {c.ear} <span className="text-text-tertiary">·</span> {c.barn}
            </div>

            {/* 症状结论 */}
            <div className="text-body-sm text-text-secondary leading-relaxed">
              {c.conclusion}
            </div>

            {/* 执行时间 */}
            <div className="flex items-center gap-1.5 text-body-sm text-text-secondary">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>执行时间：</span>
              <span className="text-foreground">{c.execLabel}</span>
            </div>

            {/* 是否需要领药/领物 */}
            <div className="flex items-center gap-1.5 text-body-sm">
              <PackageCheck
                className={`h-3.5 w-3.5 ${
                  c.needPickup ? "text-primary" : "text-text-tertiary"
                }`}
              />
              {c.needPickup ? (
                <span className="text-foreground">
                  {c.pickupNote ?? "需领药 / 领物"}
                </span>
              ) : (
                <span className="text-text-tertiary">无需领药 / 领物</span>
              )}
            </div>

            {/* 审核信息 */}
            <div className="flex items-center gap-1.5 text-caption text-text-tertiary pt-1 border-t border-border/60">
              <ShieldCheck className="h-3 w-3" />
              <span>
                审核 <span className="text-text-secondary">{c.approver}</span> ·{" "}
                {c.approvedAt}
              </span>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleIgnore(c.id)}
                className="flex-1 h-9 rounded-lg border border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1 active:bg-surface-subtle"
              >
                <EyeOff className="h-3.5 w-3.5" /> 忽视
              </button>
              <button
                onClick={() => handleRespond(c.id)}
                className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1 active:opacity-90"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> 响应
              </button>
            </div>
          </article>
        ))}
      </div>
    </MobileShell>
  );
}
