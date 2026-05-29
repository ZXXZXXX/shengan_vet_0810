import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
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
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { EmptyState } from "@/components/empty-state";
import { useRole, canVisit, canDiagnose, canExecute } from "@/lib/mobile-role";

import { PICKUPS, useClaimed } from "@/lib/pickup-store";

type HealthSearch = { tab?: string; type?: string };
export const Route = createFileRoute("/m/health/")({
  head: () => ({ meta: [{ title: "工单列表 · 奇点智牧" }] }),
  validateSearch: (s: Record<string, unknown>): HealthSearch => ({
    ...(typeof s.tab === "string" ? { tab: s.tab } : {}),
    ...(typeof s.type === "string" ? { type: s.type } : {}),
  }),
  component: TaskListPage,
});



type Status = "待诊断" | "进行中" | "已完成" | "已终止";
type Kind = "健康" | "损耗" | "修蹄" | "领取";

type Scope = { type: "single"; ear: string } | { type: "batch"; label: string };
type Task = {
  id: string;
  target: string;
  barn: string;
  kind: Kind;
  type: string;
  event: string;
  proposer: string;
  who: string;
  visitor?: string;
  status: Status;
  createdAt: string;
  reportedAt?: string;
  executedAt?: string;
  reviewedAt?: string;
  terminatedAt?: string;
  /** 单只 or 批量 */
  scope: Scope;
  /** 结论 / 疑似结论 */
  conclusion: string;
  /** 具体描述（执行/动作/上下文） */
  desc?: string;
  needPickup: boolean;
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
  { id: "WO-2381", target: "#A2381", barn: "3 号牛舍", kind: "健康", type: "疾病治疗", event: "持续高烧 2 小时", proposer: "陈晓东", who: "李雨晴", visitor: "王主管", status: "待诊断", createdAt: "2025-05-28", reportedAt: "2025-05-28", scope: { type: "single", ear: "#A2381" }, conclusion: "疑似乳房炎急性发作", desc: "持续高烧 2 小时，需复查体温与乳样", needPickup: true, symptoms: ["体温升高", "采食下降", "反刍减少"] },
  { id: "WO-2298", target: "#A2298", barn: "3 号牛舍", kind: "健康", type: "疾病治疗", event: "乳房炎复诊", proposer: "李雨晴", who: "李雨晴", visitor: "王主管", status: "进行中", createdAt: "2025-05-28", executedAt: "2025-05-28", scope: { type: "single", ear: "#A2298" }, conclusion: "乳房炎复诊", desc: "复查体温与乳样", needPickup: true, symptoms: ["乳房红肿"] },
  { id: "WO-2401", target: "犊牛舍 A", barn: "犊牛舍 A", kind: "健康", type: "免疫", event: "口蹄疫加强免疫", proposer: "周凯", who: "周凯", visitor: "王主管", status: "进行中", createdAt: "2025-05-29", executedAt: "2025-05-29", scope: { type: "batch", label: "32 头" }, conclusion: "口蹄疫加强免疫", desc: "犊牛批次 B-07", needPickup: true, symptoms: [] },
  { id: "YM-2501", target: "成母牛群", barn: "1 号牛舍", kind: "健康", type: "免疫", event: "口蹄疫常规免疫（平台下发）", proposer: "平台下发", who: "李雨晴", visitor: "—", status: "进行中", createdAt: "2025-05-28", executedAt: "2025-05-28", scope: { type: "batch", label: "24 头" }, conclusion: "口蹄疫常规免疫", desc: "平台统一下发的免疫计划，按批次注射免疫药物", needPickup: true, symptoms: [] },
  { id: "PP-2501", target: "#A2710", barn: "产房 1 号", kind: "健康", type: "产后护理", event: "产后 3 天复查（平台下发）", proposer: "平台下发", who: "周凯", visitor: "—", status: "进行中", createdAt: "2025-05-28", executedAt: "2025-05-28", scope: { type: "single", ear: "#A2710" }, conclusion: "产后复查", desc: "平台下发的产后修护计划，复查恶露与体温并补充营养", needPickup: true, symptoms: [] },
  { id: "WO-2324", target: "#A2324", barn: "5 号牛舍", kind: "健康", type: "普修", event: "采食量持续下降", proposer: "张伟", who: "王建国", visitor: "王主管", status: "已终止", createdAt: "2025-05-26", terminatedAt: "2025-05-26", scope: { type: "single", ear: "#A2324" }, conclusion: "采食量持续下降", desc: "精神沉郁，需复查", needPickup: false, symptoms: ["采食下降", "精神沉郁"] },
  { id: "HF-0702", target: "#A2150", barn: "2 号牛舍", kind: "修蹄", type: "修蹄", event: "右后蹄趾间皮炎", proposer: "周凯", who: "外部·张师傅", visitor: "王主管", status: "进行中", createdAt: "2025-05-28", executedAt: "2025-05-28", scope: { type: "single", ear: "#A2150" }, conclusion: "右后蹄趾间皮炎", desc: "削蹄并贴蹄垫", needPickup: false },
  { id: "HF-0688", target: "#A2270", barn: "3 号牛舍", kind: "修蹄", type: "修蹄", event: "蹄底溃疡处理", proposer: "周凯", who: "外部·张师傅", visitor: "王主管", status: "已完成", createdAt: "2025-05-12", executedAt: "2025-05-12", scope: { type: "single", ear: "#A2270" }, conclusion: "蹄底溃疡", desc: "削蹄并贴蹄垫", needPickup: false },
  { id: "LS-1029", target: "口蹄疫疫苗 A 型", barn: "2 号牛舍", kind: "损耗", type: "物资损耗", event: "冷链断电", proposer: "孙明", who: "李雨晴", visitor: "王主管", status: "待诊断", createdAt: "2025-05-28", reportedAt: "2025-05-28", scope: { type: "batch", label: "8 支" }, conclusion: "冷链断电导致失效", needPickup: false, item: "口蹄疫疫苗 A 型", qty: "8 支", reapply: { name: "口蹄疫疫苗 A 型", qty: "8 支" } },
  { id: "LS-1011", target: "营养补充剂", barn: "5 号牛舍", kind: "损耗", type: "物资损耗", event: "外箱破损渗漏", proposer: "孙明", who: "孙明", visitor: "王主管", status: "已完成", createdAt: "2025-05-15", executedAt: "2025-05-15", scope: { type: "batch", label: "2 罐" }, conclusion: "外箱破损渗漏", needPickup: false, item: "营养补充剂", qty: "2 罐" },
  // 已终止示例
  { id: "YM-2042", target: "24 头牛", barn: "1 号牛舍", kind: "健康", type: "疫苗", event: "疫苗补免", proposer: "周凯", who: "周凯", visitor: "王医生", status: "已终止", createdAt: "2025-05-28", terminatedAt: "2025-05-28", scope: { type: "batch", label: "24 头牛" }, conclusion: "疫苗补免", desc: "计划调整，暂不执行", needPickup: false },
];

// 进行中对执行人即“执行中”
const tabs: { key: Status | "全部" | "执行中"; label: string }[] = [
  { key: "全部", label: "全部" },
  { key: "待诊断", label: "待诊断" },
  { key: "执行中", label: "执行中" },
  { key: "已完成", label: "已完成" },
  
  { key: "已终止", label: "已终止" },
];


const statusTone: Record<Status, { tag: string; icon: typeof PlayCircle; color: string }> = {
  待诊断: { tag: "tag tag-warning", icon: ClipboardList, color: "" },
  进行中: { tag: "tag tag-info", icon: PlayCircle, color: "" },
  已完成: { tag: "tag tag-success", icon: CheckCircle2, color: "" },
  已终止: { tag: "tag tag-danger", icon: AlertTriangle, color: "" },
};



const kindIcon: Record<Kind, typeof Stethoscope> = {
  健康: Stethoscope,
  损耗: PackageMinus,
  修蹄: Footprints,
  领取: PackageCheck,
};

function cleanName(name: string) {
  return name.replace(/^(内部|外部)·/, "");
}




function TaskListPage() {
  const role = useRole();
  const isVisitor = canVisit(role);
  const claimed = useClaimed();
  const search = Route.useSearch();
  const initialTab: (typeof tabs)[number]["key"] = search.tab === "执行中"
    ? "执行中"
    : isVisitor
      ? "待诊断"
      : "全部";
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>(initialTab);
  const [q, setQ] = useState("");
  const typeFilter = search.type;

  // 列表仅展示工单卡片：排除领取（取物）和损耗（物资）
  let list: Task[] = tasks.filter((t) => t.kind !== "损耗");
  void claimed;
  void PICKUPS;
  if (role === "hoof_trimmer") list = list.filter((t) => t.kind === "修蹄");
  if (role === "immunizer") list = list.filter((t) => t.type === "免疫");
  if (role === "vet_assistant") list = list.filter((t) => t.type === "疾病治疗" || t.type === "产后护理");
  if (role === "vet") list = list.filter((t) => t.type === "疾病治疗");

  if (typeFilter) {
    list = list.filter((o) => o.type === typeFilter || (typeFilter === "疫苗免疫" && o.type === "免疫"));
  }
  if (tab === "执行中") list = list.filter((o) => o.status === "进行中");
  else if (tab !== "全部") list = list.filter((o) => o.status === tab);

  const kw = q.trim().toLowerCase();
  if (kw) {
    list = list.filter((o) => {
      return (
        o.id.toLowerCase().includes(kw) ||
        o.target.toLowerCase().includes(kw) ||
        o.event.toLowerCase().includes(kw) ||
        o.kind.toLowerCase().includes(kw) ||
        o.type.toLowerCase().includes(kw) ||
        o.barn.toLowerCase().includes(kw)
      );
    });
  }

  return (
    <MobileShell title="工单列表">
      {/* 搜索 */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索工单号 / 执行对象 / 工单类型 / 牛舍"
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
          <EmptyState
            icon={ClipboardList}
            title={`暂无${tab === "全部" ? "" : tab}工单`}
            desc={q ? "试试更换关键词或切换状态筛选" : "新工单将在这里显示，可下拉刷新"}
          />
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
                  const isPickup = o.kind === "领取";
                  const canVisitThis = isVisitor && o.status === "待诊断";
                  const canExecuteThis = !isVisitor && o.status === "进行中";

                  // 统一 Footer 元信息：左侧时间·人员
                  let metaTimeLabel = "";
                  let metaTime = "";
                  let metaPersonLabel = "";
                  let metaPersonName = "";
                  if (o.status === "待诊断") {
                    metaTimeLabel = "上报";
                    metaTime = o.reportedAt ?? o.createdAt;
                    metaPersonLabel = "上报";
                    metaPersonName = o.proposer ?? "—";
                  } else if (o.status === "进行中" || o.status === "已完成") {
                    metaTimeLabel = "执行";
                    metaTime = o.executedAt ?? o.createdAt;
                    metaPersonLabel = "执行";
                    metaPersonName = o.who;
                  } else if (o.status === "已终止") {
                    metaTimeLabel = "终止";
                    metaTime = o.terminatedAt ?? o.createdAt;
                    metaPersonLabel = "诊断";
                    metaPersonName = o.visitor ?? "—";
                  }

                  const ctaText = isPickup
                    ? (o.status === "已完成" ? "查看清单" : "领取")
                    : canVisitThis
                      ? "诊断"
                      : canExecuteThis
                        ? "执行"
                        : "查看";

                  const commonInner = (
                    <div className="flex flex-col gap-2">
                      {/* Header 区：编号·类型 + 状态 */}
                      <div className="flex items-center gap-1.5 text-body-sm h-5">
                        <span className="font-mono text-text-tertiary text-caption">{o.id}</span>
                        <span className="text-text-tertiary">·</span>
                        <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                          <KIcon className="h-3 w-3" />{o.type}
                        </span>
                        {o.status === "进行中" && !isPickup && (
                          <span className="text-caption text-text-tertiary">
                            · {o.needPickup ? "需领物" : "无需领物"}
                          </span>
                        )}
                        <span className={`${s.tag} inline-flex items-center gap-1 ml-auto`}>
                          <Icon className="h-3 w-3" />
                          {isPickup && o.status === "进行中" ? "待领取" : o.status === "进行中" ? "执行中" : o.status}
                        </span>
                      </div>

                      {/* Title 区：对象 · 结论 —— 单行 truncate */}
                      <div className="text-card-title text-foreground truncate h-[26px] leading-[26px]">
                        {o.scope.type === "single" ? `单只 ${o.scope.ear}` : `${o.scope.label}`}
                        <span className="text-text-tertiary"> · </span>
                        {o.conclusion}
                      </div>

                      {/* Desc 区：描述 —— 单行 line-clamp-1，无内容占位保持高度 */}
                      <div className="text-body-sm text-text-secondary truncate h-[22px] leading-[22px]">
                        {o.desc || <span className="text-text-tertiary/0">·</span>}
                      </div>

                      {/* Footer 区：时间·人员 + 操作 */}
                      <div className="flex items-center text-caption text-text-tertiary pt-2 border-t border-border/60 h-9">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <span className="shrink-0">
                            {metaTimeLabel} <span className="text-text-secondary">{metaTime}</span>
                          </span>
                          <span className="text-text-tertiary/60">·</span>
                          <span className="flex items-center gap-1 min-w-0">
                            <span className="shrink-0">{metaPersonLabel}</span>
                            <span className="h-4 w-4 rounded-full bg-primary/10 text-primary text-[9px] inline-flex items-center justify-center shrink-0">
                              {cleanName(metaPersonName).charAt(0)}
                            </span>
                            <span className="text-text-secondary truncate">{cleanName(metaPersonName)}</span>
                          </span>
                        </div>
                        <span className={`ml-2 inline-flex items-center gap-0.5 shrink-0 ${
                          canExecuteThis || (isPickup && o.status === "进行中") ? "text-primary font-medium" : "text-text-secondary"
                        }`}>
                          {ctaText}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>

                    </div>
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
