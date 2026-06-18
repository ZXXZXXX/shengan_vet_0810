import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Check,
  Inbox,
  CheckCircle2,
  Package,
  X,
  ChevronRight,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { EmptyState } from "@/components/empty-state";
import { useRole, roleLabel } from "@/lib/mobile-role";
import { PICKUPS } from "@/lib/pickup-store";
import {
  getRoleTasks,
  roleFilterMap,
  diseaseTaskMeta,
  taskChipStyle,
  typeMeta,
  formatTimeAgo,
  truncateCJK,
  type HomeTask,
  type TaskChip,
} from "@/routes/m.homepage";

export const Route = createFileRoute("/m/health/today")({
  head: () => ({ meta: [{ title: "今日工作任务 · 奇点智牧" }] }),
  component: TodayTasksPage,
});

function inferBarn(t: HomeTask): string {
  if (!t.target.startsWith("#")) return t.target.split(" · ")[0];
  const tail = t.target.slice(-1);
  const n = Number.isFinite(Number(tail)) ? Number(tail) : 1;
  return `${(n % 4) + 1} 号牛舍`;
}

function pickupForWO(woId: string) {
  return PICKUPS.find((p) => p.source === woId);
}

function todayLabel() {
  const d = new Date();
  const w = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${w}`;
}

function TodayTasksPage() {
  const role = useRole();
  const navigate = useNavigate();
  const tasks = useMemo<HomeTask[]>(() => getRoleTasks(role), [role]);
  const filter = roleFilterMap[role];

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

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

  const count = selected.size;

  const summary = useMemo(() => {
    const barns = new Set<string>();
    let pickupCount = 0;
    tasks.forEach((t) => {
      barns.add(inferBarn(t));
      if (pickupForWO(t.id)) pickupCount += 1;
    });
    return { barnCount: barns.size, pickupCount };
  }, [tasks]);

  return (
    <MobileShell hideTabBar>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-3 h-12 flex items-center gap-2">
        <button
          type="button"
          onClick={() => (selectMode ? exitSelect() : navigate({ to: "/m/homepage" }))}
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
            {roleLabel[role]} · {filter?.label ?? "全部"} · 共 {tasks.length} 项
          </div>
        </div>
        {tasks.length > 0 &&
          (selectMode ? (
            <button
              type="button"
              onClick={toggleAll}
              className="h-8 px-3 rounded-full text-body-sm text-primary active:bg-brand-subtle"
            >
              {allSelected ? "取消全选" : "全选"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSelectMode(true)}
              className="h-8 px-3 rounded-full text-body-sm text-primary active:bg-brand-subtle"
            >
              批量操作
            </button>
          ))}
      </header>

      {/* 概览卡 */}
      {tasks.length > 0 && (
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-sm font-medium text-foreground">任务概览</span>
              <span className="text-caption text-text-tertiary">{todayLabel()}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-brand-subtle px-3 py-2.5">
                <div className="text-caption text-primary/80 mb-0.5">涉及牛舍</div>
                <div className="flex items-baseline gap-1 text-primary">
                  <span className="text-[22px] leading-none font-semibold tabular-nums">
                    {summary.barnCount}
                  </span>
                  <span className="text-caption text-text-tertiary">个</span>
                </div>
              </div>
              <div
                className={`rounded-xl px-3 py-2.5 ${
                  summary.pickupCount > 0
                    ? "bg-warning/10"
                    : "bg-surface-subtle"
                }`}
              >
                <div
                  className={`text-caption mb-0.5 flex items-center gap-1 ${
                    summary.pickupCount > 0 ? "text-warning" : "text-text-tertiary"
                  }`}
                >
                  <Package className="h-3 w-3" />
                  需取药
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-[22px] leading-none font-semibold tabular-nums ${
                      summary.pickupCount > 0 ? "text-warning" : "text-text-tertiary"
                    }`}
                  >
                    {summary.pickupCount}
                  </span>
                  <span className="text-caption text-text-tertiary">项</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分组标题 */}
      {tasks.length > 0 && (
        <div className="px-4 mt-4 mb-2 flex items-center gap-2">
          <span className="h-3 w-[3px] rounded-full bg-primary" aria-hidden />
          <span className="text-body-sm font-medium text-foreground">
            待处理 <span className="text-text-tertiary font-normal">({tasks.length})</span>
          </span>
        </div>
      )}

      {/* 列表 */}
      <div className={`px-4 ${selectMode ? "pb-[120px]" : "pb-6"} space-y-2.5`}>
        {tasks.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-card border border-border">
            <EmptyState icon={Inbox} size="sm" title="今日暂无工单" />
          </div>
        ) : (
          tasks.map((t) => {
            const meta = typeMeta[t.type] ?? typeMeta["疾病治疗"];
            const Icon = meta.icon;
            const checked = selected.has(t.id);
            const chip: TaskChip | null =
              t.type === "疾病治疗"
                ? diseaseTaskMeta[t.id]?.task ?? null
                : t.status === "进行中"
                  ? "待执行"
                  : t.status === "待诊断"
                    ? "待诊断"
                    : null;
            const barn = inferBarn(t);
            const needPickup = !!pickupForWO(t.id);
            const title =
              t.type === "疾病治疗" && diseaseTaskMeta[t.id]
                ? truncateCJK(diseaseTaskMeta[t.id].disease)
                : t.conclusion;

            const inner = (
              <div className="flex">
                {/* 左侧色条 */}
                <span
                  className={`w-[3px] shrink-0 rounded-l-2xl ${
                    needPickup ? "bg-warning" : "bg-primary"
                  }`}
                  aria-hidden
                />
                <div className="flex-1 p-3.5">
                  {/* 顶部：图标+标题 / 状态chip / 选择框 */}
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`h-9 w-9 rounded-lg ${meta.bg} ${meta.text} inline-flex items-center justify-center shrink-0`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
                        <span className="font-mono">{t.id}</span>
                        <span>·</span>
                        <span>{t.type}</span>
                      </div>
                      <div className="text-body font-medium text-foreground truncate mt-0.5">
                        {title}
                      </div>
                    </div>
                    {selectMode ? (
                      <span
                        className={`h-5 w-5 rounded-md inline-flex items-center justify-center shrink-0 border mt-1 ${
                          checked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-card"
                        }`}
                        aria-hidden
                      >
                        {checked && (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        )}
                      </span>
                    ) : chip ? (
                      <span
                        className={`inline-flex items-center px-1.5 h-[20px] rounded text-[11px] leading-none shrink-0 mt-1 ${taskChipStyle[chip]}`}
                      >
                        {chip}
                      </span>
                    ) : null}
                  </div>

                  {/* 二列网格信息 */}
                  <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-caption text-text-tertiary shrink-0">
                        目标
                      </span>
                      <span className="text-body-sm text-text-secondary truncate">
                        {t.target}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-caption text-text-tertiary shrink-0">
                        牛舍
                      </span>
                      <span className="text-body-sm text-text-secondary truncate">
                        {barn}
                      </span>
                    </div>
                  </div>

                  {/* 底部分隔 */}
                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {needPickup ? (
                        <span className="inline-flex items-center gap-1 text-caption text-warning">
                          <Package className="h-3 w-3" />
                          需先到药房取药
                        </span>
                      ) : (
                        <span className="text-caption text-text-tertiary">
                          {formatTimeAgo(t.minutesAgo)}
                        </span>
                      )}
                    </div>
                    {!selectMode && (
                      <span className="inline-flex items-center gap-0.5 text-caption text-primary">
                        详情
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
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
                to="/m/health/$id"
                params={{ id: t.id }}
                className={cls}
              >
                {inner}
              </Link>
            );
          })
        )}
      </div>

      {/* 底部操作栏（仅多选态） */}
      {selectMode && tasks.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] flex items-center gap-3 max-w-[440px] mx-auto">
          <div className="flex-1 min-w-0">
            <div className="text-body-sm text-foreground">
              已选 <span className="text-primary font-semibold tabular-nums">{count}</span>{" "}
              <span className="text-text-tertiary">/ {tasks.length}</span>
            </div>
            <div className="text-caption text-text-tertiary truncate">
              {count === 0 ? "选择需要批量处理的任务" : "确认后将批量执行所选任务"}
            </div>
          </div>
          <button
            type="button"
            disabled={count === 0}
            onClick={() => setDone(true)}
            className="h-11 px-5 rounded-full bg-primary text-primary-foreground text-body-sm font-medium disabled:opacity-40 disabled:pointer-events-none active:scale-[.97] transition-transform"
          >
            批量执行
          </button>
        </div>
      )}

      {/* 完成弹窗 */}
      {done && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setDone(false)}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl sm:rounded-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+20px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <span className="h-12 w-12 rounded-full bg-brand-subtle text-primary inline-flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div className="text-card-title text-foreground">已批量执行 {count} 项任务</div>
              <div className="text-caption text-text-tertiary mt-1">
                结果将同步至对应工单详情
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setDone(false);
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
