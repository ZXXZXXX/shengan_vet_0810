import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Check,
  Inbox,
  CheckCircle2,
  Package,
  X,
  Camera,
  Filter,
  ChevronRight,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { EmptyState } from "@/components/empty-state";
import { useRole, roleLabel, type Role } from "@/lib/mobile-role";
import { PICKUPS, parseQty, useClaimed } from "@/lib/pickup-store";
import {
  homeTasks,
  diseaseTaskMeta,
  taskChipStyle,
  typeMeta,
  
  type HomeTask,
  type TaskChip,
} from "@/routes/m.homepage";

export const Route = createFileRoute("/m/health/today")({
  head: () => ({ meta: [{ title: "今日工作任务 · 奇点智牧" }] }),
  component: TodayTasksPage,
});

/* ============================================================
 * 工作任务页 —— 业务版
 * 1. 按角色 + 状态分流：兽医/场长 = 待诊断 / 待执行 / 待复查
 *    执行类角色（助理、免疫员、修蹄工）= 待执行
 * 2. 牛舍筛选（多选 chip）—— 集中处理某几个牛舍的任务
 * 3. 顶部聚合工具栏：选中范围内的「需领药品清单」+「批量记录执行」
 * ============================================================ */

function inferBarn(t: HomeTask): string {
  if (!t.target.startsWith("#")) return t.target.split(" · ")[0];
  const tail = t.target.slice(-1);
  const n = Number.isFinite(Number(tail)) ? Number(tail) : 1;
  return `${(n % 4) + 1} 号牛舍`;
}

function pickupForWO(woId: string) {
  return PICKUPS.find((p) => p.source === woId);
}

// 任务的具体动作描述（执行类任务展示在卡片副信息位）
const TASK_ACTION: Record<string, string> = {
  "WO-2299": "氟尼辛葡甲胺 2ml IM + 头孢噻呋钠 1g IM，测温并记录",
  "WO-2300": "氯前列烯醇 2ml IM + 子宫冲洗",
  "WO-2301": "氟苯尼考 15ml IM + 测温记录",
  "WO-2302": "削蹄 + 碘酊涂擦 + 绷带包扎",
  "WO-2303": "丙二醇 300ml 灌服 + 葡萄糖 500ml IV",
  "WO-2298": "测温 + 乳样采集复查",
  "WO-2440": "测温 + 乳房触诊复查",
  "PP-2501": "产后 3 天护理：测温 + 恶露检查 + 灌服补液",
};

// 待诊断任务展示主诉/症状概述
const DIAG_BRIEF: Record<string, string> = {
  "WO-2381": "乳房红肿、产奶量下降",
  "WO-2382": "采食量骤降、精神沉郁",
  "WO-2383": "呼气有丙酮味、产奶量下降",
  "WO-2384": "乳区硬块、乳汁絮状",
  "WO-2385": "阴道排出脓性分泌物",
  "WO-2386": "跛行、蹄部红肿",
  "WO-2387": "水样腹泻、脱水",
};

type StatusTab = "待诊断" | "待执行" | "待复查";

function getRoleTabs(role: Role): StatusTab[] {
  if (role === "vet" || role === "manager") return ["待诊断", "待执行", "待复查"];
  return ["待执行"];
}

// 按角色获取候选任务全集（不区分状态 tab）
// 兽医/场长：疾病治疗 待诊断/待复查 + 疾病治疗/产后护理 的待执行
// 助理：疾病治疗/产后护理 的待执行
// 免疫员：疫苗免疫；修蹄工：修蹄
const EXEC_TYPES_VET = ["疾病治疗", "产后护理"];

function getRoleAllTasks(role: Role): HomeTask[] {
  if (role === "vet" || role === "manager") {
    return homeTasks.filter(
      (t) =>
        (t.type === "疾病治疗" && t.status === "待诊断") ||
        (EXEC_TYPES_VET.includes(t.type) && t.status === "进行中"),
    );
  }
  if (role === "vet_assistant")
    return homeTasks.filter(
      (t) =>
        EXEC_TYPES_VET.includes(t.type) &&
        t.status === "进行中" &&
        diseaseTaskMeta[t.id]?.task !== "待复查",
    );
  if (role === "immunizer")
    return homeTasks.filter((t) => t.type === "疫苗免疫" && t.status === "进行中");
  if (role === "hoof_trimmer")
    return homeTasks.filter((t) => t.type === "修蹄" && t.status === "进行中");
  return [];
}

function statusOf(t: HomeTask): StatusTab {
  if (t.type === "疾病治疗") {
    const meta = diseaseTaskMeta[t.id]?.task;
    if (meta === "待诊断") return "待诊断";
    if (meta === "待复查") return "待复查";
    return "待执行";
  }
  return "待执行";
}

function TodayTasksPage() {
  const role = useRole();
  const navigate = useNavigate();
  const tabs = useMemo(() => getRoleTabs(role), [role]);
  const allTasks = useMemo(() => getRoleAllTasks(role), [role]);

  const [activeTab, setActiveTab] = useState<StatusTab>(tabs[0]);
  const [selectedBarns, setSelectedBarns] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drugSheet, setDrugSheet] = useState(false);
  const [done, setDone] = useState<"claim" | "batch" | null>(null);
  const claimed = useClaimed();

  // 当前 tab 下的任务，叠加牛舍筛选
  const tabTasks = useMemo(
    () => allTasks.filter((t) => statusOf(t) === activeTab),
    [allTasks, activeTab],
  );

  const allBarns = useMemo(() => {
    const s = new Set<string>();
    tabTasks.forEach((t) => s.add(inferBarn(t)));
    return Array.from(s);
  }, [tabTasks]);

  const tasks = useMemo(
    () =>
      selectedBarns.size === 0
        ? tabTasks
        : tabTasks.filter((t) => selectedBarns.has(inferBarn(t))),
    [tabTasks, selectedBarns],
  );

  // 当前范围内 需领药任务 & 聚合药品清单（仅"待执行"才涉及取药）
  const pickupTasks = useMemo(
    () => (activeTab === "待执行" ? tasks.filter((t) => pickupForWO(t.id)) : []),
    [tasks, activeTab],
  );

  // 选中(批量执行)态下,基于已选任务汇总;否则按全部 pickupTasks 预览
  const aggregationTasks = useMemo(() => {
    if (selectMode) {
      return pickupTasks.filter((t) => selected.has(t.id));
    }
    return pickupTasks;
  }, [pickupTasks, selectMode, selected]);

  type DrugBreakdown = {
    cattle: string;
    barn: string;
    woId: string;
    qty: number;
    unit: string;
  };
  const aggregatedDrugs = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        spec?: string;
        unit: string;
        qty: number;
        from: Set<string>;
        breakdown: DrugBreakdown[];
      }
    >();
    aggregationTasks.forEach((t) => {
      const pk = pickupForWO(t.id);
      const barn = inferBarn(t);
      const cattle = t.target.startsWith("#") ? t.target : t.target;
      pk?.items.forEach((it) => {
        const { num, unit } = parseQty(it.qty);
        const key = it.name + "|" + (it.spec ?? "");
        const cur = map.get(key);
        const row: DrugBreakdown = { cattle, barn, woId: t.id, qty: num, unit };
        if (cur) {
          cur.qty += num;
          cur.from.add(barn);
          cur.breakdown.push(row);
        } else {
          map.set(key, {
            name: it.name,
            spec: it.spec,
            unit,
            qty: num,
            from: new Set([barn]),
            breakdown: [row],
          });
        }
      });
    });
    return Array.from(map.values());
  }, [aggregationTasks]);

  const toggleBarn = (b: string) =>
    setSelectedBarns((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allSelected = tasks.length > 0 && selected.size === tasks.length;
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(tasks.map((t) => t.id)));
  };

  const exitSelect = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const enterSelect = () => {
    setSelectMode(true);
    setSelected(new Set(tasks.map((t) => t.id))); // 默认全选当前筛选范围
  };

  const count = selected.size;
  const barnLabel =
    selectedBarns.size === 0
      ? `全部 ${allBarns.length} 个牛舍`
      : `${selectedBarns.size} 个牛舍`;

  return (
    <MobileShell hideTabBar>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-3 h-12 flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            selectMode ? exitSelect() : navigate({ to: "/m/homepage" })
          }
          className="h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-lg active:bg-surface-subtle"
          aria-label={selectMode ? "退出多选" : "返回"}
        >
          {selectMode ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-foreground" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-body font-medium text-foreground leading-tight truncate">
            {selectMode ? `已选 ${count} 项` : "今日工作任务"}
          </div>
          <div className="text-caption text-text-tertiary leading-tight truncate">
            {roleLabel[role]} · {barnLabel} · {tasks.length} 项
          </div>
        </div>
        {!selectMode && tasks.length > 0 && (
          <button
            type="button"
            onClick={enterSelect}
            className="h-8 px-3 rounded-full text-body-sm text-primary active:bg-brand-subtle"
          >
            批量执行
          </button>
        )}
        {selectMode && tasks.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="h-8 px-3 rounded-full text-body-sm text-primary active:bg-brand-subtle"
          >
            {allSelected ? "取消全选" : "全选"}
          </button>
        )}
      </header>

      {/* 状态 tab */}
      {tabs.length > 1 && (
        <div className="sticky top-12 z-20 bg-card/95 backdrop-blur border-b border-border px-2">
          <div className="flex">
            {tabs.map((tb) => {
              const tabCount = allTasks.filter((t) => statusOf(t) === tb).length;
              const active = activeTab === tb;
              return (
                <button
                  key={tb}
                  type="button"
                  onClick={() => {
                    setActiveTab(tb);
                    setSelectedBarns(new Set());
                    exitSelect();
                  }}
                  className={`relative flex-1 h-11 inline-flex items-center justify-center gap-1 text-body-sm ${
                    active
                      ? "text-primary font-medium"
                      : "text-text-secondary"
                  }`}
                >
                  <span>{tb}</span>
                  <span
                    className={`text-caption tabular-nums ${
                      active ? "text-primary" : "text-text-tertiary"
                    }`}
                  >
                    {tabCount}
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 牛舍筛选 chip 横向滚动 */}
      {allBarns.length > 1 && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-1.5 mb-2 text-caption text-text-tertiary">
            <Filter className="h-3 w-3" />
            <span>按牛舍筛选</span>
            {selectedBarns.size > 0 && (
              <button
                onClick={() => setSelectedBarns(new Set())}
                className="ml-auto text-primary"
              >
                清除
              </button>
            )}
          </div>
          <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-1.5 w-max pr-4">
              {allBarns.map((b) => {
                const sel = selectedBarns.has(b);
                const cnt = tabTasks.filter((t) => inferBarn(t) === b).length;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBarn(b)}
                    className={`shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full border text-body-sm transition-colors ${
                      sel
                        ? "border-primary bg-brand-subtle text-primary"
                        : "border-border bg-card text-text-secondary"
                    }`}
                  >
                    <span>{b}</span>
                    <span
                      className={`text-caption tabular-nums ${
                        sel ? "text-primary/80" : "text-text-tertiary"
                      }`}
                    >
                      {cnt}
                    </span>
                    {sel && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 聚合操作卡：引导批量执行 + 一次领药 */}
      {tasks.length > 0 && pickupTasks.length > 0 && !selectMode && (
        <div className="px-4 pt-3">
          <div className="w-full rounded-2xl bg-warning/10 border border-warning/30 p-3.5">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-lg bg-warning/20 text-warning inline-flex items-center justify-center shrink-0">
                <Package className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-body-sm font-medium text-foreground">
                  共 {pickupTasks.length} 项任务需领药 ·{" "}
                  {aggregatedDrugs.length} 种药品
                </div>
                <div className="text-caption text-text-tertiary mt-0.5">
                  建议「批量执行」合并取药，避免多次往返药房
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-warning/20">
              <button
                type="button"
                onClick={enterSelect}
                className="w-full h-9 rounded-lg text-body-sm font-medium text-white bg-warning active:opacity-90 inline-flex items-center justify-center gap-1"
              >
                批量执行
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className={`px-4 pt-3 ${selectMode ? "pb-[120px]" : "pb-6"} space-y-2.5`}>
        {tasks.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-card border border-border">
            <EmptyState
              icon={Inbox}
              size="sm"
              title={
                selectedBarns.size > 0
                  ? "所选牛舍暂无该状态任务"
                  : "今日暂无该状态任务"
              }
            />
          </div>
        ) : (
          tasks.map((t) => {
            const meta = typeMeta[t.type] ?? typeMeta["疾病治疗"];
            const Icon = meta.icon;
            const checked = selected.has(t.id);
            const chip: TaskChip | null =
              t.type === "疾病治疗"
                ? diseaseTaskMeta[t.id]?.task ?? null
                : "待执行";
            const barn = inferBarn(t);
            const actionText = activeTab === "待执行" ? "执行" : activeTab === "待复查" ? "复查" : "诊断";
            const linkTo = activeTab === "待执行"
              ? "/m/health/$id/execute"
              : activeTab === "待复查"
                ? "/m/health/$id/review"
                : "/m/health/$id";

            const cattleId = t.target.startsWith("#") ? t.target : null;
            const groupTarget = cattleId ? null : t.target;
            const pk = activeTab === "待执行" ? pickupForWO(t.id) : null;
            const pickupClaimed = pk ? claimed.includes(pk.id) : false;

            const actionLine =
              activeTab === "待诊断"
                ? DIAG_BRIEF[t.id] ?? "症状待评估"
                : TASK_ACTION[t.id] ??
                  (activeTab === "待复查" ? "测温 + 复查评估" : "执行处方");
            const actionLabel =
              activeTab === "待诊断" ? "主诉" : activeTab === "待复查" ? "复查" : "动作";

            const inner = (
              <div className="px-3.5 py-3">
                {/* 顶部:类型 + 编号 + 状态 */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-5 w-5 rounded-full ${meta.bg} ${meta.text} inline-flex items-center justify-center shrink-0`}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2} />
                  </span>
                  <span className="text-body-sm text-text-secondary">{t.type}</span>
                  <span className="text-caption text-text-tertiary font-mono">{t.id}</span>
                  <div className="ml-auto">
                    {selectMode ? (
                      <span
                        className={`h-[18px] w-[18px] rounded inline-flex items-center justify-center shrink-0 border ${
                          checked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-card"
                        }`}
                        aria-hidden
                      >
                        {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                    ) : chip ? (
                      <span
                        className={`inline-flex items-center px-1.5 h-[18px] rounded text-[11px] leading-none ${taskChipStyle[chip]}`}
                      >
                        {chip}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* 主体 */}
                <div className="mt-2 pl-2.5 border-l border-primary">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[15px] font-semibold text-foreground font-mono leading-tight truncate">
                      {cattleId ?? groupTarget}
                    </span>
                    <span className="text-caption text-text-tertiary shrink-0 truncate">
                      {barn}
                    </span>
                  </div>
                  <div className="mt-1 text-body-sm text-text-secondary truncate">
                    <span className="text-text-tertiary mr-1">{actionLabel}</span>
                    {actionLine}
                  </div>
                </div>

                {/* 底部:领物 + 操作 */}
                <div className="mt-2.5 flex items-center justify-between">
                  {activeTab === "待执行" ? (
                    <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                      <Package className="h-3 w-3" />
                      <span>领物</span>
                      {!pk ? (
                        <span className="ml-0.5 inline-flex items-center px-1.5 h-[18px] rounded text-[11px] leading-none bg-surface-subtle text-text-tertiary">
                          无需
                        </span>
                      ) : pickupClaimed ? (
                        <span className="ml-0.5 inline-flex items-center px-1.5 h-[18px] rounded text-[11px] leading-none bg-[color-mix(in_oklab,var(--state-success)_15%,transparent)] text-[var(--state-success)]">
                          已领
                        </span>
                      ) : (
                        <span className="ml-0.5 inline-flex items-center px-1.5 h-[18px] rounded text-[11px] leading-none bg-[#FFF1E0] text-[#E07B1F]">
                          未领
                        </span>
                      )}
                    </span>
                  ) : (
                    <span />
                  )}
                  {!selectMode && (
                    <span className="inline-flex items-center gap-0.5 text-body-sm text-primary">
                      {actionText}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );

            const cls = `block rounded-2xl border bg-card overflow-hidden active:bg-surface-subtle ${
              checked
                ? "border-primary ring-1 ring-primary/30"
                : "border-border"
            }`;

            return selectMode ? (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={cls + " w-full text-left"}
              >
                {inner}
              </button>
            ) : (
              <Link
                key={t.id}
                to={linkTo}
                params={{ id: t.id }}
                className={cls}
              >
                {inner}
              </Link>
            );
          })
        )}
      </div>

      {/* 底部操作栏（多选态）：批量记录执行 */}
      {selectMode && tasks.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] max-w-[440px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-body-sm text-foreground">
              已选{" "}
              <span className="text-primary font-semibold tabular-nums">
                {count}
              </span>{" "}
              <span className="text-text-tertiary">/ {tasks.length}</span>
            </div>
            <div className="text-caption text-text-tertiary truncate ml-2">
              {aggregatedDrugs.length > 0
                ? `需领 ${aggregatedDrugs.length} 种药品`
                : "无需取药"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={count === 0 || aggregatedDrugs.length === 0}
              onClick={() => setDrugSheet(true)}
              className="flex-1 h-11 rounded-full border border-warning/40 text-warning text-body-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:bg-warning/10"
            >
              <Package className="h-4 w-4" />
              汇总取药清单
            </button>
            <button
              type="button"
              disabled={count === 0}
              onClick={() => setDone("batch")}
              className="flex-1 h-11 rounded-full bg-primary text-primary-foreground text-body-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-[.97] transition-transform"
            >
              <Camera className="h-4 w-4" />
              拍照记录
            </button>
          </div>
        </div>
      )}

      {/* 药品合并清单 sheet */}
      {drugSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={() => setDrugSheet(false)}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-card-title text-foreground">
                    合并领药清单
                  </div>
                  <div className="text-caption text-text-tertiary mt-0.5">
                    覆盖 {pickupTasks.length} 项任务 ·{" "}
                    {selectedBarns.size === 0
                      ? `全部 ${allBarns.length} 个牛舍`
                      : Array.from(selectedBarns).join("、")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrugSheet(false)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-lg active:bg-surface-subtle"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4 text-text-secondary" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-4 py-3 space-y-2 flex-1">
              {aggregatedDrugs.length === 0 ? (
                <div className="py-8 text-center text-body-sm text-text-tertiary">
                  当前范围无需领药
                </div>
              ) : (
                aggregatedDrugs.map((d) => (
                  <div
                    key={d.name + (d.spec ?? "")}
                    className="rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-body font-medium text-foreground truncate">
                          {d.name}
                        </div>
                        {d.spec && (
                          <div className="text-caption text-text-tertiary mt-0.5 truncate">
                            {d.spec}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-body font-semibold text-primary tabular-nums">
                          {d.qty}
                          <span className="text-caption text-text-tertiary font-normal ml-0.5">
                            {d.unit}
                          </span>
                        </div>
                        <div className="text-caption text-text-tertiary">
                          共 {d.breakdown.length} 头
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/60 space-y-1">
                      {d.breakdown.map((row, i) => (
                        <div
                          key={row.woId + i}
                          className="flex items-center justify-between text-caption"
                        >
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-text-secondary truncate">
                              {row.cattle}
                            </span>
                            <span className="text-text-tertiary shrink-0">
                              · {row.barn}
                            </span>
                          </span>
                          <span className="text-text-secondary tabular-nums shrink-0">
                            {row.qty}
                            <span className="text-text-tertiary ml-0.5">
                              {row.unit}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setDrugSheet(false);
                  setDone("claim");
                }}
                disabled={aggregatedDrugs.length === 0}
                className="w-full h-11 rounded-full bg-primary text-primary-foreground text-body-sm font-medium disabled:opacity-40 disabled:pointer-events-none active:scale-[.97] transition-transform"
              >
                前往药房统一领取
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完成弹窗 */}
      {done && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setDone(null)}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl sm:rounded-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <span className="h-12 w-12 rounded-full bg-brand-subtle text-primary inline-flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div className="text-card-title text-foreground">
                {done === "claim"
                  ? `已生成 ${aggregatedDrugs.length} 种药品领取单`
                  : `已为 ${count} 项任务上传执行照片`}
              </div>
              <div className="text-caption text-text-tertiary mt-1">
                {done === "claim"
                  ? "请前往中央药房一次性领取"
                  : "结果已同步至对应工单"}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setDone(null);
                  exitSelect();
                }}
                className="h-10 rounded-lg border border-border text-body-sm text-text-secondary active:bg-surface-subtle"
              >
                继续浏览
              </button>
              <Link
                to="/m/homepage"
                className="h-10 rounded-lg bg-primary text-primary-foreground text-body-sm font-medium inline-flex items-center justify-center"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
