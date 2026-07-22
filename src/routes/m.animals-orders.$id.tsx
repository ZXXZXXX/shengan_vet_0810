import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { Stethoscope, Footprints, Syringe, PlayCircle, ClipboardList, CheckCircle2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/m/animals-orders/$id")({
  head: () => ({ meta: [{ title: "全部工单 · 奇点智牧" }] }),
  component: AnimalOrdersPage,
});

type OrderStatus = "待诊断" | "执行中" | "已完成";
type Order = {
  id: string;
  kind: "健康" | "修蹄" | "免疫";
  type: string;
  desc: string;
  status: OrderStatus;
  reportDate: string;
  completeDate: string | null;
  person: string;
};

const ORDERS: Order[] = [
  { id: "WO-2026-0521", kind: "修蹄", type: "趾间皮炎处置", desc: "右后蹄红肿,需清创修蹄", status: "待诊断", reportDate: "2026-05-21", completeDate: null, person: "王巡栏" },
  { id: "WO-2026-0518", kind: "健康", type: "疾病治疗 · 疑似乳房炎", desc: "持续高烧 39.6℃,食欲下降", status: "执行中", reportDate: "2026-05-18", completeDate: null, person: "李雨晴" },
  { id: "WO-2026-0510", kind: "健康", type: "疾病治疗 · 消化不良", desc: "反刍减少,治疗结束", status: "已完成", reportDate: "2026-05-08", completeDate: "2026-05-12", person: "周凯" },
  { id: "WO-2026-0405", kind: "健康", type: "疾病治疗 · 蹄叶炎", desc: "康复出院", status: "已完成", reportDate: "2026-04-05", completeDate: "2026-04-10", person: "李雨晴" },
  { id: "IM-2026-0118", kind: "免疫", type: "口蹄疫年度加强", desc: "全群免疫", status: "已完成", reportDate: "2026-01-18", completeDate: "2026-01-18", person: "赵敏" },
  { id: "WO-2026-0125", kind: "健康", type: "产后子宫炎", desc: "已治愈", status: "已完成", reportDate: "2026-01-25", completeDate: "2026-02-02", person: "王场长" },
];

const kindIcon = { 健康: Stethoscope, 修蹄: Footprints, 免疫: Syringe };

function AnimalOrdersPage() {
  const { id } = useParams({ from: "/m/animals-orders/$id" });
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");

  const sorted = [...ORDERS].sort((a, b) => {
    if (a.status !== "已完成" && b.status !== "已完成") return a.reportDate < b.reportDate ? 1 : -1;
    if (a.status === "已完成" && b.status === "已完成") return (a.completeDate ?? "") < (b.completeDate ?? "") ? 1 : -1;
    return a.status === "已完成" ? 1 : -1;
  });
  const list = sorted.filter((o) =>
    filter === "all" ? true : filter === "open" ? o.status !== "已完成" : o.status === "已完成",
  );

  return (
    <MobileShell title={`#${id} · 全部工单`} back hideTabBar>
      <div className="px-4 pt-3 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          {(["all", "open", "done"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`h-8 px-3 rounded-full text-caption ${
                filter === k
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-text-secondary"
              }`}
            >
              {k === "all" ? `全部 ${ORDERS.length}` : k === "open" ? "进行中" : "已完成"}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-caption text-text-tertiary">
            暂无工单
          </div>
        ) : (
          <div className="space-y-2.5">
            {list.map((o) => {
              const KIcon = kindIcon[o.kind];
              const isWait = o.status === "待诊断";
              const isDone = o.status === "已完成";
              const StatusIcon = isDone ? CheckCircle2 : isWait ? ClipboardList : PlayCircle;
              const tagCls = isDone ? "tag tag-success" : isWait ? "tag tag-warning" : "tag tag-info";
              return (
                <Link
                  key={o.id}
                  to="/m/health/$id"
                  params={{ id: o.id }}
                  className="block rounded-xl bg-card border border-border p-3.5 active:bg-surface-subtle"
                >
                  <div className="flex items-center gap-1.5 h-5 mb-1.5">
                    <span className="font-mono text-caption text-text-tertiary">{o.id}</span>
                    <span className="text-text-tertiary">·</span>
                    <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                      <KIcon className="h-3 w-3" />
                      {o.kind}
                    </span>
                    <span className={`${tagCls} inline-flex items-center gap-1 ml-auto`}>
                      <StatusIcon className="h-3 w-3" />
                      {o.status}
                    </span>
                  </div>
                  <div className="text-body-sm text-foreground truncate">{o.type}</div>
                  <div className="text-caption text-text-tertiary truncate mt-0.5">{o.desc}</div>
                  <div className="flex items-center text-caption text-text-tertiary mt-2 pt-2 border-t border-border/60">
                    <span>
                      {isDone ? "完成" : "上报"}{" "}
                      <span className="text-text-secondary">
                        {isDone ? o.completeDate : o.reportDate}
                      </span>
                    </span>
                    <span className="mx-1.5 text-text-tertiary/60">·</span>
                    <span>
                      负责 <span className="text-text-secondary">{o.person}</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
