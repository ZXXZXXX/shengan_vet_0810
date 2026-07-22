import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import {
  Stethoscope,
  Footprints,
  Syringe,
  PlayCircle,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/m/animals-orders/$id")({
  head: () => ({ meta: [{ title: "全部工单 · 奇点智牧" }] }),
  component: AnimalOrdersPage,
});

type OrderStatus = "待诊断" | "执行中" | "已完成";
type Order = {
  id: string;
  kind: "健康" | "修蹄" | "免疫";
  type: string; // 疾病治疗 / 修蹄 / 免疫
  target: string; // 耳号
  visit?: "初诊" | "复诊";
  disease: string; // 产后子宫炎
  desc: string;
  status: OrderStatus;
  reportDate: string;
  completeDate: string | null;
  person: string;
};

const ORDERS: Order[] = [
  { id: "WO-2382", kind: "健康", type: "疾病治疗", target: "#01-24-2270", visit: "初诊", disease: "产后子宫炎", desc: "产后 6 天体温 39.8℃，分泌物恶臭", status: "待诊断", reportDate: "2026-05-29", completeDate: null, person: "陈晓东" },
  { id: "WO-2521", kind: "修蹄", type: "修蹄", target: "#01-24-2270", disease: "趾间皮炎处置", desc: "右后蹄红肿，需清创修蹄", status: "待诊断", reportDate: "2026-05-21", completeDate: null, person: "王巡栏" },
  { id: "WO-2299", kind: "健康", type: "疾病治疗", target: "#01-24-2270", visit: "复诊", disease: "产后子宫炎", desc: "青霉素钠 + 氟尼辛，1 天 2 次连用 3 天", status: "执行中", reportDate: "2026-05-18", completeDate: null, person: "李雨晴" },
  { id: "WO-2510", kind: "健康", type: "疾病治疗", target: "#01-24-2270", visit: "初诊", disease: "消化不良", desc: "反刍减少，治疗结束", status: "已完成", reportDate: "2026-05-08", completeDate: "2026-05-12", person: "周凯" },
  { id: "WO-2405", kind: "健康", type: "疾病治疗", target: "#01-24-2270", visit: "复诊", disease: "蹄叶炎", desc: "康复出院", status: "已完成", reportDate: "2026-04-05", completeDate: "2026-04-10", person: "李雨晴" },
  { id: "IM-2118", kind: "免疫", type: "免疫", target: "#01-24-2270", disease: "口蹄疫年度加强", desc: "全群免疫", status: "已完成", reportDate: "2026-01-18", completeDate: "2026-01-18", person: "赵敏" },
  { id: "WO-2125", kind: "健康", type: "疾病治疗", target: "#01-24-2270", visit: "初诊", disease: "产后子宫炎", desc: "已治愈", status: "已完成", reportDate: "2026-01-25", completeDate: "2026-02-02", person: "王场长" },
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
              const isRunning = o.status === "执行中";
              const StatusIcon = isDone ? CheckCircle2 : isWait ? ClipboardList : PlayCircle;
              const tagCls = isDone ? "tag tag-success" : isWait ? "tag tag-warning" : "tag tag-info";
              const ctaText = isDone ? "查看" : isWait ? "诊断" : "执行";
              const metaLabel = isDone ? "完成" : "上报";
              const metaTime = isDone ? o.completeDate : o.reportDate;
              const personLabel = isDone ? "完成" : isRunning ? "执行" : "上报";
              return (
                <Link
                  key={o.id}
                  to="/m/health/$id"
                  params={{ id: o.id }}
                  className="block rounded-xl bg-card border border-border p-4 active:bg-surface-subtle"
                >
                  <div className="flex flex-col gap-2">
                    {/* Header：编号 · 类型 + 状态 */}
                    <div className="flex items-center gap-1.5 h-5">
                      <span className="font-mono text-caption text-text-tertiary">{o.id}</span>
                      <span className="text-text-tertiary">·</span>
                      <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                        <KIcon className="h-3 w-3" />
                        {o.type}
                      </span>
                      <span className={`${tagCls} inline-flex items-center gap-1 ml-auto`}>
                        <StatusIcon className="h-3 w-3" />
                        {o.status}
                      </span>
                    </div>

                    {/* Title：耳号 · 初诊/复诊 · 疾病 */}
                    <div className="text-card-title text-foreground truncate leading-[26px]">
                      {o.target}
                      {o.visit && (
                        <>
                          <span className="text-text-tertiary"> · </span>
                          {o.visit}
                        </>
                      )}
                      <span className="text-text-tertiary"> · </span>
                      {o.disease}
                    </div>

                    {/* Desc */}
                    <div className="text-body-sm text-text-secondary truncate leading-[22px]">
                      {o.desc || <span className="text-text-tertiary/0">·</span>}
                    </div>

                    {/* Footer：时间 · 人 + CTA */}
                    <div className="flex items-center text-caption text-text-tertiary pt-2 border-t border-border/60 h-9">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="shrink-0">
                          {metaLabel} <span className="text-text-secondary">{metaTime}</span>
                        </span>
                        <span className="text-text-tertiary/60">·</span>
                        <span className="flex items-center gap-1 min-w-0">
                          <span className="shrink-0">{personLabel}</span>
                          <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-caption inline-flex items-center justify-center shrink-0">
                            {o.person.charAt(0)}
                          </span>
                          <span className="text-text-secondary truncate">{o.person}</span>
                        </span>
                      </div>
                      <span
                        className={`ml-2 inline-flex items-center gap-0.5 shrink-0 ${
                          ctaText === "查看" ? "text-text-secondary" : "text-primary font-medium"
                        }`}
                      >
                        {ctaText}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
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
