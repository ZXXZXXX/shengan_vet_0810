import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Search,
  ScanLine,
  Thermometer,
  Check,
  CheckCircle2,
  ChevronDown,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/mobile-shell";
import { EmptyState } from "@/components/empty-state";
import { homeTasks, typeMeta, type HomeTask } from "@/routes/m.homepage";

export const Route = createFileRoute("/m/health/today_/batch")({
  validateSearch: (s: Record<string, unknown>) => ({
    ids: typeof s.ids === "string" ? s.ids : "",
  }),
  head: () => ({ meta: [{ title: "批量执行 · 奇点智牧" }] }),
  component: BatchExecutePage,
});

function inferBarn(t: HomeTask): string {
  if (!t.target.startsWith("#")) return t.target.split(" · ")[0];
  const tail = t.target.slice(-1);
  const n = Number.isFinite(Number(tail)) ? Number(tail) : 1;
  return `${(n % 4) + 1} 号牛舍`;
}

function earSortKey(t: HomeTask): string {
  return t.target.startsWith("#") ? t.target.slice(1) : "\uffff" + t.target;
}

type CardState = {
  scanned: boolean;
  temp: string;
  note: string;
  done: boolean;
};

function cardProgress(s: CardState): { label: string; variant: "done" | "ready" | "doing" | "empty" } {
  if (s.done) return { label: "已完成", variant: "done" };
  if (s.scanned && s.temp) return { label: "待提交", variant: "ready" };
  if (s.scanned || s.temp || s.note) return { label: "填写中", variant: "doing" };
  return { label: "未填写", variant: "empty" };
}

function StatusBadge({ state }: { state: CardState }) {
  const { label, variant } = cardProgress(state);
  const styles = {
    done: "bg-[color-mix(in_oklab,var(--state-success)_15%,transparent)] text-[var(--state-success)]",
    ready: "bg-[color-mix(in_oklab,var(--state-warning)_15%,transparent)] text-[var(--state-warning)]",
    doing: "bg-[color-mix(in_oklab,var(--brand)_10%,transparent)] text-[var(--brand)]",
    empty: "bg-surface-subtle text-text-tertiary",
  }[variant];
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 h-[20px] rounded text-caption leading-none ${styles}`}
    >
      {variant === "done" && <Check className="h-3 w-3" strokeWidth={3} />}
      {label}
    </span>
  );
}

function BatchExecutePage() {
  const { ids } = useSearch({ from: "/m/health/today_/batch" });
  const navigate = useNavigate();

  const tasks = useMemo(() => {
    const idSet = new Set(ids.split(",").filter(Boolean));
    return homeTasks
      .filter((t) => idSet.has(t.id))
      .sort((a, b) => earSortKey(a).localeCompare(earSortKey(b)));
  }, [ids]);

  const [q, setQ] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(tasks[0]?.id ?? null);
  const [state, setState] = useState<Record<string, CardState>>(() =>
    Object.fromEntries(
      tasks.map((t) => [t.id, { scanned: false, temp: "", note: "", done: false }]),
    ),
  );

  const visibleTasks = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return tasks;
    return tasks.filter(
      (t) =>
        t.target.toLowerCase().includes(kw) ||
        t.id.toLowerCase().includes(kw),
    );
  }, [tasks, q]);

  const doneCount = Object.values(state).filter((s) => s.done).length;
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  const patch = (id: string, p: Partial<CardState>) =>
    setState((prev) => ({ ...prev, [id]: { ...prev[id], ...p } }));

  const advanceNext = (currentId: string) => {
    const idx = tasks.findIndex((t) => t.id === currentId);
    const next = tasks.slice(idx + 1).find((t) => !state[t.id]?.done);
    setExpandedId(next?.id ?? null);
  };

  const completeCard = (id: string) => {
    patch(id, { done: true });
    advanceNext(id);
  };

  const submitAll = () => {
    if (!allDone) return;
    toast.success(`已提交 ${tasks.length} 项执行记录`);
    navigate({ to: "/m/health/today" });
  };

  return (
    <MobileShell hideTabBar>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border px-3 h-12 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/m/health/today" })}
          className="h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-lg active:bg-surface-subtle"
          aria-label="返回"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-body font-medium text-foreground leading-tight truncate">
            批量执行
          </div>
          <div className="text-caption text-text-tertiary">
            共 {tasks.length} 项 · 已完成{" "}
            <span className="text-primary tabular-nums">{doneCount}</span>
          </div>
        </div>
      </header>

      {/* 搜索 */}
      <div className="sticky top-12 z-20 bg-card/95 backdrop-blur border-b border-border px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索耳号快速定位"
            className="h-9 w-full pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* 列表 */}
      <div className="px-4 pt-3 pb-[120px] space-y-2.5">
        {visibleTasks.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-card border border-border">
            <EmptyState icon={Inbox} size="sm" title="没有匹配的任务" />
          </div>
        ) : (
          visibleTasks.map((t) => {
            const meta = typeMeta[t.type] ?? typeMeta["疾病治疗"];
            const Icon = meta.icon;
            const s = state[t.id] ?? { scanned: false, temp: "", note: "", done: false };
            const expanded = expandedId === t.id;
            const barn = inferBarn(t);

            return (
              <article
                key={t.id}
                className={`rounded-2xl border bg-card overflow-hidden transition-colors ${
                  s.done
                    ? "border-[color-mix(in_oklab,var(--state-success)_40%,transparent)]"
                    : expanded
                      ? "border-primary ring-1 ring-primary/25"
                      : "border-border"
                }`}
              >
                {/* Header (可点击折叠/展开) */}
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : t.id)}
                  className="w-full text-left px-3.5 py-3 flex items-center gap-2 active:bg-surface-subtle"
                >
                  <span
                    className={`h-5 w-5 rounded-full ${meta.bg} ${meta.text} inline-flex items-center justify-center shrink-0`}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="text-[15px] font-semibold text-foreground font-mono truncate">
                        {t.target}
                      </span>
                      <span className="text-caption text-text-tertiary shrink-0 truncate">
                        {barn}
                      </span>
                    </div>
                    <div className="text-caption text-text-tertiary mt-0.5">
                      <span className="font-mono">{t.id}</span>
                      <span className="mx-1">·</span>
                      <span>{t.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge state={s} />
                    <ChevronDown
                      className={`h-4 w-4 text-text-tertiary transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* 展开：快捷录入 */}
                {expanded && (
                  <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-border/60">
                    {/* 扫码核验 */}
                    <div>
                      <div className="text-caption text-text-tertiary mb-1.5">
                        药品核验
                      </div>
                      <button
                        type="button"
                        onClick={() => patch(t.id, { scanned: true })}
                        className={`w-full h-11 rounded-lg inline-flex items-center justify-center gap-1.5 text-body-sm border transition-colors ${
                          s.scanned
                            ? "bg-[color-mix(in_oklab,var(--state-success)_10%,transparent)] border-[color-mix(in_oklab,var(--state-success)_40%,transparent)] text-[var(--state-success)]"
                            : "bg-surface-subtle border-border text-foreground"
                        }`}
                      >
                        {s.scanned ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            已扫码核验
                          </>
                        ) : (
                          <>
                            <ScanLine className="h-4 w-4" />
                            扫码核验药品
                          </>
                        )}
                      </button>
                    </div>

                    {/* 体温 */}
                    <div>
                      <div className="text-caption text-text-tertiary mb-1.5">
                        体温 (℃)
                      </div>
                      <div className="relative">
                        <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          value={s.temp}
                          onChange={(e) => patch(t.id, { temp: e.target.value })}
                          placeholder="例如 38.6"
                          className="h-11 w-full pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* 备注 */}
                    <div>
                      <div className="text-caption text-text-tertiary mb-1.5">
                        备注（可选）
                      </div>
                      <textarea
                        value={s.note}
                        onChange={(e) => patch(t.id, { note: e.target.value })}
                        rows={2}
                        placeholder="补充观察，如精神状态、采食情况"
                        className="w-full p-2.5 rounded-lg bg-surface-subtle border border-border text-body-sm focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!s.scanned || !s.temp}
                      onClick={() => completeCard(t.id)}
                      className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-body-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Check className="h-4 w-4" />
                      完成录入
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* 底部：一次性提交 */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-card/95 backdrop-blur border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] max-w-[440px] mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-body-sm text-foreground">
            已完成{" "}
            <span className="text-primary font-semibold tabular-nums">
              {doneCount}
            </span>{" "}
            <span className="text-text-tertiary">/ {tasks.length}</span>
          </div>
          <div className="text-caption text-text-tertiary">
            {allDone ? "全部录入完毕，可提交" : "完成所有卡片后可提交"}
          </div>
        </div>
        <button
          type="button"
          disabled={!allDone}
          onClick={submitAll}
          className="w-full h-11 rounded-full bg-primary text-primary-foreground text-body-sm font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-[.97] transition-transform"
        >
          <CheckCircle2 className="h-4 w-4" />
          一次性提交 {tasks.length} 项
        </button>
      </div>
    </MobileShell>
  );
}
