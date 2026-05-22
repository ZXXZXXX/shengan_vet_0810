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
  PackageCheck,
  QrCode,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole, canApprove } from "@/lib/mobile-role";
import { PICKUPS, useClaimed } from "@/lib/pickup-store";

export const Route = createFileRoute("/m/health/")({
  head: () => ({ meta: [{ title: "工作列表 · 奇点智牧" }] }),
  component: TaskListPage,
});

type Status = "待审批" | "进行中" | "已驳回" | "已完成";
type Kind = "健康" | "损耗" | "修蹄" | "领取";

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
  // 损耗专属
  item?: string;
  qty?: string;
  reapply?: { name: string; qty: string };
  // 健康专属
  symptoms?: string[];
  // 领取专属：来源工单号
  source?: string;
};

const tasks: Task[] = [
  { id: "WO-2381", target: "#A2381", barn: "3 号牛舍", kind: "健康", type: "疾病治疗", event: "持续高烧 2 小时", proposer: "陈晓东", who: "李雨晴", status: "待审批", createdAt: "今日 09:08", symptoms: ["体温升高", "采食下降", "反刍减少"] },
  { id: "WO-2298", target: "#A2298", barn: "3 号牛舍", kind: "健康", type: "疾病治疗", event: "乳房炎复诊", proposer: "李雨晴", who: "李雨晴", status: "进行中", createdAt: "昨日 14:20", symptoms: ["乳房红肿"] },
  { id: "WO-2401", target: "犊牛舍 A", barn: "犊牛舍 A", kind: "健康", type: "免疫", event: "口蹄疫加强免疫", proposer: "周凯", who: "周凯", status: "进行中", createdAt: "昨日 10:00", symptoms: [] },
  { id: "WO-2324", target: "#A2324", barn: "5 号牛舍", kind: "健康", type: "普修", event: "采食量持续下降", proposer: "张伟", who: "王建国", status: "已驳回", createdAt: "前日 18:42", symptoms: ["采食下降", "精神沉郁"] },
  { id: "LS-1029", target: "口蹄疫疫苗 A 型", barn: "2 号牛舍", kind: "损耗", type: "物资损耗", event: "冷链断电导致失效", proposer: "孙明", who: "李雨晴", status: "待审批", createdAt: "今日 08:20", item: "口蹄疫疫苗 A 型", qty: "8 支", reapply: { name: "口蹄疫疫苗 A 型", qty: "8 支" } },
  { id: "LS-1011", target: "营养补充剂", barn: "5 号牛舍", kind: "损耗", type: "物资损耗", event: "外箱破损渗漏", proposer: "孙明", who: "孙明", status: "已完成", createdAt: "5 月 15 日", item: "营养补充剂", qty: "2 罐" },
  { id: "HF-0702", target: "#A2150", barn: "2 号牛舍", kind: "修蹄", type: "批次修蹄", event: "右后蹄趾间皮炎", proposer: "周凯", who: "外部·张师傅", status: "进行中", createdAt: "今日 07:30" },
  { id: "HF-0688", target: "#A2270", barn: "3 号牛舍", kind: "修蹄", type: "批次修蹄", event: "蹄底溃疡处理", proposer: "周凯", who: "外部·张师傅", status: "已完成", createdAt: "5 月 12 日" },
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
  修蹄: Footprints,
  领取: PackageCheck,
};

function TaskListPage() {
  const role = useRole();
  const isApprover = canApprove(role);
  const claimed = useClaimed();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>(isApprover ? "待审批" : "全部");
  const [q, setQ] = useState("");

  // 注入"领取"工作（来自审批通过的处方/补领申请）
  const pickupTasks: Task[] = PICKUPS.map((p) => {
    const done = claimed.includes(p.id);
    return {
      id: p.id,
      target: p.title,
      barn: p.barn,
      kind: "领取",
      type: "药品/器材领取",
      event: `${p.warehouse} · ${p.items.length} 项`,
      proposer: p.approver.split("（")[0],
      who: "李雨晴",
      status: done ? "已完成" : "进行中",
      createdAt: p.approvedAt,
      source: p.source,
    };
  });

  // 修蹄工只看到自己的修蹄工作
  let list: Task[] = [...pickupTasks, ...tasks];
  if (role === "hoof_trimmer") list = list.filter((t) => t.kind === "修蹄");
  if (tab !== "全部") list = list.filter((o) => o.status === tab);
  const kw = q.trim().toLowerCase();
  if (kw) {
    list = list.filter((o) => {
      const group = o.kind === "损耗" ? "物资" : o.barn;
      return (
        o.id.toLowerCase().includes(kw) ||
        o.target.toLowerCase().includes(kw) ||
        o.event.toLowerCase().includes(kw) ||
        o.kind.toLowerCase().includes(kw) ||
        o.type.toLowerCase().includes(kw) ||
        group.toLowerCase().includes(kw)
      );
    });
  }

  return (
    <MobileShell
      title="工作列表"
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
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索工作号 / 对象 / 工作类型 / 牛舍 / 物资"
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
            暂无{tab === "全部" ? "" : tab}工作
          </div>
        )}
        {Object.entries(
          list.reduce<Record<string, Task[]>>((acc, t) => {
            const group = t.kind === "损耗" ? "物资" : t.barn;
            (acc[group] ||= []).push(t);
            return acc;
          }, {})
        )
          .sort(([a], [b]) => {
            if (a === "物资") return 1;
            if (b === "物资") return -1;
            return a.localeCompare(b, "zh");
          })
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
                  const isPickup = o.kind === "领取";
                  const canApproveThis = isApprover && o.status === "待审批";
                  const canExecuteThis = !isApprover && o.status === "进行中";
                  const commonInner = (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                          <span className="font-mono text-body-sm text-foreground">{o.id}</span>
                          <span className={`tag inline-flex items-center gap-1 ${isPickup ? "tag-brand" : "tag-muted"}`}>
                            <KIcon className="h-3 w-3" /> {o.kind}
                          </span>
                        </div>
                        <span className={s.tag}>{isPickup && o.status === "进行中" ? "待领取" : o.status}</span>
                      </div>
                      <div className="text-body text-foreground">
                        {o.kind === "损耗"
                          ? `${o.item ?? o.target} · ${o.qty ?? "—"}`
                          : isPickup
                          ? o.target
                          : `${o.target} · ${o.event}`}
                      </div>
                      {isPickup && (
                        <div className="mt-1.5 text-caption text-text-secondary inline-flex items-center gap-1">
                          <QrCode className="h-3 w-3 text-primary" />
                          {o.event}
                        </div>
                      )}
                      {o.kind === "健康" && o.symptoms && o.symptoms.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {o.symptoms.slice(0, 4).map((sym) => (
                            <span key={sym} className="tag tag-muted">{sym}</span>
                          ))}
                        </div>
                      )}
                      {o.kind === "损耗" && o.reapply && (
                        <div className="mt-1.5 text-caption text-text-secondary">
                          需补申请：{o.reapply.name} × {o.reapply.qty}
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between text-caption text-text-tertiary">
                        <span className="truncate">提出 {o.proposer} · 负责 {o.who}</span>
                        <span className="shrink-0 ml-3">{o.createdAt}</span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-caption">
                        <span className="text-text-tertiary truncate">
                          {canApproveThis ? "请前往 PC 审批" : ""}
                        </span>
                        <span className="shrink-0 ml-3 inline-flex items-center gap-1 text-primary font-medium">
                          {isPickup
                            ? o.status === "已完成"
                              ? "查看清单"
                              : "领取"
                            : canExecuteThis
                            ? "执行"
                            : "查看"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </>
                  );
                  const cls = `block rounded-xl bg-card border p-4 active:bg-surface-subtle ${
                    isPickup && o.status === "进行中" ? "border-primary/30" : "border-border"
                  }`;
                  return isPickup ? (
                    <Link key={o.id} to="/m/pickup/$id" params={{ id: o.id }} className={cls}>
                      {commonInner}
                    </Link>
                  ) : (
                    <Link key={o.id} to="/m/health/$id" params={{ id: o.id }} className={cls}>
                      {commonInner}
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
