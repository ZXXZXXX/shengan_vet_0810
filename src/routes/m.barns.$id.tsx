import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  Home,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  ClipboardPlus,
  ClipboardList,
  Stethoscope,
  Footprints,
  Syringe,
} from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/barns/$id")({
  head: () => ({ meta: [{ title: "牛舍详情 · 奇点智牧" }] }),
  component: BarnDetailPage,
});

const roleToName: Record<string, string> = {
  admin: "管理员",
  vet: "李雨晴",
  manager: "王场长",
  vet_assistant: "周凯",
  immunizer: "赵敏",
  hoof_trimmer: "张师傅",
};

type WO = {
  id: string;
  target: string;
  kind: "健康" | "修蹄" | "免疫";
  type: string;
  conclusion: string;
  desc: string;
  status: "待诊断" | "执行中";
  time: string;
  person: string;
  needPickup: boolean;
};

const kindIcon = {
  健康: Stethoscope,
  修蹄: Footprints,
  免疫: Syringe,
} as const;

function BarnDetailPage() {
  const { id } = useParams({ from: "/m/barns/$id" });

  // mock 牛舍基础信息
  const barn = {
    code: id,
    name: "3 号牛舍",
    farm: "华北一牧场",
    type: "成母牛舍",
    stock: 186,
  };

  // mock 该牛舍内全部相关工单
  const orders: WO[] = [
    { id: "WO-2026-0518", target: "#01-24-2381", kind: "健康", type: "疾病治疗", conclusion: "疑似乳房炎", desc: "持续高烧 39.6℃，食欲明显下降", status: "执行中", time: "2026-05-18 09:20", person: "李雨晴", needPickup: true },
    { id: "WO-2026-0521", target: "#01-24-2298", kind: "健康", type: "疾病治疗", conclusion: "乳房炎复诊", desc: "复诊评估恢复情况", status: "执行中", time: "2026-05-21 10:15", person: "李雨晴", needPickup: false },
    { id: "HF-2026-0702", target: "#01-24-2150", kind: "修蹄", type: "趾间皮炎处置", conclusion: "待诊断", desc: "右后蹄红肿，需清创修蹄", status: "待诊断", time: "2026-05-21 14:05", person: "王巡栏", needPickup: false },
    { id: "HF-2026-0688", target: "#01-24-2270", kind: "修蹄", type: "蹄底溃疡", conclusion: "蹄底溃疡 II 度", desc: "处置 + 包蹄", status: "执行中", time: "2026-05-20 16:30", person: "张师傅", needPickup: true },
    { id: "IM-2026-0401", target: "犊牛舍 A", kind: "免疫", type: "口蹄疫加强", conclusion: "批次免疫", desc: "口蹄疫疫苗加强针批次免疫", status: "执行中", time: "2026-05-22 08:00", person: "周凯", needPickup: true },
  ];

  const [ordersExpanded, setOrdersExpanded] = useState(false);
  const visibleOrders = ordersExpanded ? orders : orders.slice(0, 2);

  return (
    <MobileShell title={`牛舍 · ${barn.name}`} back hideTabBar>
      <div className="pb-28">
        {/* 头图 + 基础信息 */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Home className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-caption opacity-85">牛舍编码 · {barn.code}</div>
                <div className="text-section-title">{barn.name}</div>
              </div>
              <span className="ml-auto h-7 px-2.5 rounded-full bg-white/15 backdrop-blur inline-flex items-center text-caption">
                {barn.type}
              </span>
            </div>
            <div className="relative mt-4 grid grid-cols-3 gap-2">
              <Stat label="所属牧场" value={barn.farm} />
              <Stat label="牛舍类型" value={barn.type} />
              <Stat label="当前存栏" value={`${barn.stock} 头`} highlight />
            </div>
          </div>
        </div>

        {/* 相关工单 */}
        <section className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground">相关工单</h3>
            <span className="text-caption text-text-tertiary">共 {orders.length} 个</span>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
              <div className="text-body-sm text-text-tertiary">暂无相关工单</div>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {visibleOrders.map((o) => {
                  const KIcon = kindIcon[o.kind];
                  const isWait = o.status === "待诊断";
                  const StatusIcon = isWait ? ClipboardList : PlayCircle;
                  const tagCls = isWait ? "tag tag-warning" : "tag tag-info";
                  const timeLabel = isWait ? "上报" : "执行";
                  const personLabel = isWait ? "上报" : "执行";
                  const ctaText = isWait ? "诊断" : "执行";
                  const ctaActive = !isWait;
                  return (
                    <Link
                      key={o.id}
                      to="/m/health/$id"
                      params={{ id: o.id }}
                      className="block rounded-xl bg-card border border-border p-4 active:bg-surface-subtle"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-body-sm h-5">
                          <span className="font-mono text-text-tertiary text-caption">{o.id}</span>
                          <span className="text-text-tertiary">·</span>
                          <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                            <KIcon className="h-3 w-3" />{o.type}
                          </span>
                          {!isWait && (
                            <span className="text-caption text-text-tertiary">
                              · {o.needPickup ? "需领物" : "无需领物"}
                            </span>
                          )}
                          <span className={`${tagCls} inline-flex items-center gap-1 ml-auto`}>
                            <StatusIcon className="h-3 w-3" />
                            {o.status}
                          </span>
                        </div>

                        <div className="text-card-title text-foreground truncate h-[26px] leading-[26px]">
                          {`单只 ${o.target.replace(/^#/, "")}`}
                          <span className="text-text-tertiary"> · </span>
                          {o.conclusion}
                        </div>

                        <div className="text-body-sm text-text-secondary truncate h-[22px] leading-[22px]">
                          {o.desc || <span className="text-text-tertiary/0">·</span>}
                        </div>

                        <div className="flex items-center text-caption text-text-tertiary pt-2 border-t border-border/60 h-9">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="shrink-0">
                              {timeLabel} <span className="text-text-secondary">{o.time}</span>
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
                          <span className={`ml-2 inline-flex items-center gap-0.5 shrink-0 ${
                            ctaActive ? "text-primary font-medium" : "text-text-secondary"
                          }`}>
                            {ctaText}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {orders.length > 2 && (
                <div className="mt-3 flex justify-center">
                  <button
                    onClick={() => setOrdersExpanded((v) => !v)}
                    className="h-8 px-4 rounded-full bg-primary/8 text-primary text-caption font-medium inline-flex items-center gap-1 active:bg-primary/15 transition-colors"
                  >
                    {ordersExpanded ? "收起" : `展开全部 ${orders.length} 个`}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${ordersExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* 底部固定：健康上报入口（带牛舍） */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Link
          to="/m/report"
          search={{ barn: barn.name, lock: 1 } as never}
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
        >
          <ClipboardPlus className="h-4 w-4" /> 健康上报
        </Link>
      </div>
    </MobileShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-white/15 backdrop-blur border border-white/15 px-3 py-2">
      <div className="text-caption opacity-85">{label}</div>
      <div className={`mt-0.5 truncate ${highlight ? "text-card-title tabular-nums" : "text-body-sm"}`}>
        {value}
      </div>
    </div>
  );
}
