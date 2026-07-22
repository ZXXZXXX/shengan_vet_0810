import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { PICKUPS } from "@/lib/pickup-store";
import {
  homeTasks,
  diseaseTaskMeta,
  taskChipStyle,
  typeMeta,
  
  type HomeTask,
  type TaskChip,
} from "@/routes/m.homepage";

export const Route = createFileRoute("/m/health/today")({
  validateSearch: (s: Record<string, unknown>) => ({
    capture: typeof s.capture === "string" ? s.capture : undefined,
  }),
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
// 来源：晟安标准处方 · 子宫炎类 / 产后护理 / 肢蹄病类
const TASK_ACTION: Record<string, string> = {
  "WO-2298": "5% 头孢噻呋 4.4ml/100kg IM + 氟尼辛 4ml/100kg IV，测温复查",
  "WO-2299": "青霉素钠 2.4g IM 早晚各 1 次 + 氟尼辛 4ml/100kg IV，测温记录",
  "WO-2300": "青霉素钠按体重区间 IM 早晚各 1 次 + 氟尼辛按体重区间 IV 1 天 1 次，直肠按压排脓",
  "WO-2301": "10% 头孢噻呋 20ml IM（3 天 1 次）+ 利福昔明 100ml 子宫灌注",
  "WO-2302": "碘甘油局部涂抹外阴，日 2 次；PGA 缝合线 5 天后拆线",
  "WO-2303": "利福昔明子宫灌注 100ml，2 天 1 次连用 2-3 次",
  "WO-2440": "测温 + 分泌物观察，评估产后子宫炎疗程结束情况",
  "PP-2501": "产后 3 天护理：测温 + 正前/正后照片采集 + 恶露评估",
};

// 待诊断任务展示主诉/症状概述（对应文档中子宫炎类诊断要点）
const DIAG_BRIEF: Record<string, string> = {
  "WO-2381": "助产后阴道黏膜层撕裂，出血 >5cm",
  "WO-2382": "产后 6 天体温 39.8℃，分泌物恶臭",
  "WO-2383": "产后 8 天体温正常，分泌物恶臭",
  "WO-2384": "产后 5 天分泌物含 >50% 脓",
  "WO-2385": "产后 24 天直肠检查子宫异常，脓性分泌物",
  "WO-2386": "产后 26 天中度子宫内膜炎",
  "WO-2387": "产后 12 天分泌物气味正常但含脓",
};

type StatusTab = "待诊断" | "待执行" | "待复查";

const ALL_TABS: StatusTab[] = ["待诊断", "待执行", "待复查"];

function tabHandledByRole(role: Role, tab: StatusTab): boolean {
  if (role === "vet" || role === "manager") return true;
  return tab === "待执行";
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
  const tabs = ALL_TABS;
  const allTasks = useMemo(() => getRoleAllTasks(role), [role]);

  const [activeTab, setActiveTab] = useState<StatusTab>("待执行");
  const [selectedBarns, setSelectedBarns] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [done, setDone] = useState<"batch" | null>(null);
  
  const { capture } = Route.useSearch();

  // 领药完成后回到此页：直接跳转到批量执行页
  useEffect(() => {
    if (!capture) return;
    navigate({
      to: "/m/health/today/batch",
      search: { ids: capture },
      replace: true,
    });
  }, [capture, navigate]);

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
    setSelected(new Set()); // 默认不选,由用户主动勾选范围
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
            {selectMode ? `已选 ${count} 项` : "今日任务"}
          </div>
        </div>

        {selectMode && tasks.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="h-8 px-3 rounded-full text-body-sm text-primary active:bg-brand-subtle"
          >
            {allSelected ? "取消全选" : "全选"}
          </button>
        )}
        {!selectMode && tasks.length > 0 && (
          <button
            type="button"
            onClick={enterSelect}
            className="h-8 px-3 rounded-full text-body-sm text-primary active:bg-brand-subtle"
          >
            批量执行
          </button>
        )}
      </header>



      {/* 状态 tab */}
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


      {/* 牛舍筛选 + 批量执行 入口 */}
      {allBarns.length > 1 && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-1.5 mb-2 text-caption text-text-tertiary">
            <Filter className="h-3 w-3" />
            <span>按牛舍筛选</span>
            {selectedBarns.size > 0 && (
              <button
                onClick={() => setSelectedBarns(new Set())}
                className="text-primary"
              >
                清除
              </button>
            )}
          </div>

          {allBarns.length > 1 && (
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
          )}
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
                !tabHandledByRole(role, activeTab)
                  ? `${activeTab}由兽医/场长处理`
                  : selectedBarns.size > 0
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
            const linkTo = "/m/health/$id/execute" as const;


            const cattleId = t.target.startsWith("#") ? t.target : null;
            const groupTarget = cattleId ? null : t.target;
            const pk = activeTab === "待执行" ? pickupForWO(t.id) : null;

            const actionLine =
              activeTab === "待诊断"
                ? DIAG_BRIEF[t.id] ?? "症状待评估"
                : TASK_ACTION[t.id] ??
                  (activeTab === "待复查" ? "测温 + 复查评估" : "执行处方");
            const timeAgo = `${((tasks.indexOf(t) + 1) * 2) % 59 || 2}分钟前`;

            const inner = (
              <div className="px-3.5 py-3">
                {/* 顶部:类型 + 编号 + 状态 + 时间 */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-5 w-5 rounded-full ${meta.bg} ${meta.text} inline-flex items-center justify-center shrink-0`}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2} />
                  </span>
                  <span className="text-body-sm text-text-secondary">{t.type}</span>
                  <span className="text-caption text-text-tertiary font-mono">{t.id}</span>
                  {chip && (
                    <span
                      className={`inline-flex items-center px-1.5 h-[18px] rounded-full text-caption leading-none ${taskChipStyle[chip]}`}
                    >
                      {chip}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-caption text-text-tertiary">{timeAgo}</span>
                    {selectMode && (
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
                    )}
                  </div>
                </div>

                {/* 主体 */}
                <div className="mt-2.5">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[17px] font-semibold text-foreground font-mono leading-tight truncate">
                      {cattleId ?? groupTarget}
                    </span>
                    <span className="text-body-sm text-text-tertiary shrink-0 truncate">
                      {barn}
                    </span>
                  </div>
                  <div className="mt-1.5 text-body-sm text-text-secondary truncate">
                    <span className="text-text-tertiary mr-1.5">具体内容</span>
                    {actionLine}
                  </div>
                </div>

                {/* 底部:领物 + 操作 */}
                <div className="mt-3 flex items-center justify-between">
                  {activeTab === "待执行" && pk ? (
                    <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                      <Package className="h-3.5 w-3.5" />
                      需要领物
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

      {/* 底部操作栏(多选态):按流程单一 CTA — 先取药,再拍照记录 */}
      {selectMode && tasks.length > 0 && (() => {
        const selectedTasks = tasks.filter((t) => selected.has(t.id));
        const subText = count === 0 ? "勾选要一次处理的任务" : "下一步：批量执行";
        const allIds = selectedTasks.map((t) => t.id).join(",");
        return (
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
                {subText}
              </div>
            </div>
            <button
              type="button"
              disabled={count === 0}
              onClick={() => {
                navigate({
                  to: "/m/health/today/batch",
                  search: { ids: allIds },
                });
              }}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground text-body-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-[.97] transition-transform"
            >
              <Camera className="h-4 w-4" />
              开始执行
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })()}



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
                已为 {count} 项任务上传执行照片
              </div>
              <div className="text-caption text-text-tertiary mt-1">
                结果已同步至对应工单
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
