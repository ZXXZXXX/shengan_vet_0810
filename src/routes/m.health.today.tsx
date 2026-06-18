import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, Check, Inbox, CheckCircle2 } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { EmptyState } from "@/components/empty-state";
import { useRole, roleLabel } from "@/lib/mobile-role";
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

function TodayTasksPage() {
  const role = useRole();
  const navigate = useNavigate();
  const tasks = useMemo<HomeTask[]>(() => getRoleTasks(role), [role]);
  const filter = roleFilterMap[role];

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

  const count = selected.size;

  return (
    <MobileShell hideTabBar>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-3 h-12 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/m/homepage" })}
          className="h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-lg active:bg-surface-subtle"
          aria-label="返回"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-body font-medium text-foreground leading-tight truncate">
            今日工作任务
          </div>
          <div className="text-caption text-text-tertiary leading-tight truncate">
            {roleLabel[role]} · {filter?.label ?? "全部"} · 共 {tasks.length} 项
          </div>
        </div>
        {tasks.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="h-8 px-3 rounded-full text-body-sm text-primary active:bg-brand-subtle"
          >
            {allSelected ? "取消全选" : "全选"}
          </button>
        )}
      </header>

      {/* 列表 */}
      <div className="px-4 pt-3 pb-[120px] space-y-2">
        {tasks.length === 0 ? (
          <div className="mt-6 rounded-xl bg-card border border-border">
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
            return (
              <label
                key={t.id}
                className={`flex items-center gap-3 p-3 rounded-xl border bg-card active:bg-surface-subtle ${
                  checked ? "border-primary ring-1 ring-primary/40" : "border-border"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(t.id)}
                  className="sr-only"
                />
                <span
                  className={`h-5 w-5 rounded-md inline-flex items-center justify-center shrink-0 border ${
                    checked
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                  aria-hidden
                >
                  {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
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
                    {chip && (
                      <span
                        className={`ml-1 inline-flex items-center px-1.5 h-[18px] rounded text-[11px] leading-none ${taskChipStyle[chip]}`}
                      >
                        {chip}
                      </span>
                    )}
                    <span className="ml-auto">{formatTimeAgo(t.minutesAgo)}</span>
                  </div>
                  <div className="text-body text-foreground truncate mt-0.5">
                    <span className="text-text-secondary">{t.target}</span>
                    <span className="text-text-tertiary"> · </span>
                    {t.type === "疾病治疗" && diseaseTaskMeta[t.id]
                      ? truncateCJK(diseaseTaskMeta[t.id].disease)
                      : t.conclusion}
                  </div>
                </div>
              </label>
            );
          })
        )}

        {tasks.length > 0 && (
          <div className="pt-2 text-center text-caption text-text-tertiary">
            勾选任务后可批量执行
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      {tasks.length > 0 && (
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
                  setSelected(new Set());
                }}
                className="h-10 rounded-lg border border-border text-body-sm text-text-secondary active:bg-surface-subtle"
              >
                继续选择
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
