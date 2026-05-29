import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  FileEdit,
  Stethoscope,
  ChevronRight,
  Trash2,
  Home,
  ClipboardList,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/m/drafts")({
  head: () => ({ meta: [{ title: "草稿箱 · 奇点智牧" }] }),
  component: DraftsPage,
});

type Draft = {
  id: string;
  target?: string;
  workType?: string;
  symptoms?: string[];
  note?: string;
  suspectedDisease?: string;
  desc?: string;
  photos?: number[];
  videos?: number[];
  voiceSecs?: number | null;
  handlerId?: string;
  savedAt: string;
};

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return iso;
  }
}

function DraftsPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("report:drafts");
      setDrafts(raw ? JSON.parse(raw) : []);
    } catch {
      setDrafts([]);
    }
  }, []);

  const persist = (next: Draft[]) => {
    setDrafts(next);
    localStorage.setItem("report:drafts", JSON.stringify(next));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === drafts.length) setSelected(new Set());
    else setSelected(new Set(drafts.map((d) => d.id)));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const doDelete = () => {
    persist(drafts.filter((d) => !selected.has(d.id)));
    setConfirmDelete(false);
    exitSelectMode();
  };

  // 按"目标 / 牛舍"分组，与工单列表保持一致
  const grouped = useMemo(
    () =>
      drafts.reduce<Record<string, Draft[]>>((acc, d) => {
        const key = d.target?.trim() || "未指定对象";
        (acc[key] ||= []).push(d);
        return acc;
      }, {}),
    [drafts]
  );

  const right = drafts.length > 0 ? (
    selectMode ? (
      <button
        onClick={exitSelectMode}
        className="text-body-sm text-text-secondary px-2 h-7 inline-flex items-center"
      >
        取消
      </button>
    ) : (
      <button
        onClick={() => setSelectMode(true)}
        className="text-body-sm text-primary px-2 h-7 inline-flex items-center"
      >
        管理
      </button>
    )
  ) : undefined;

  return (
    <MobileShell title="草稿箱" back right={right} hideTabBar>
      {drafts.length === 0 ? (
        <EmptyState
          icon={FileEdit}
          title="暂无草稿"
          desc="在现场上报中点击「存草稿」即可保存未完成的工单"
        />
      ) : (
        <div className={`px-4 pt-3 space-y-4 ${selectMode ? "pb-24" : "pb-4"}`}>
          <div className="flex items-center text-caption text-text-tertiary">
            <span>共 {drafts.length} 条未完成上报</span>
            {selectMode && (
              <button
                onClick={toggleAll}
                className="ml-auto inline-flex items-center gap-1 text-primary"
              >
                {selected.size === drafts.length ? (
                  <CheckSquare className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                全选
              </button>
            )}
          </div>
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b, "zh"))
            .map(([group, items]) => (
              <section key={group}>
                <div className="sticky top-0 z-[1] -mx-4 px-4 py-2 bg-background/85 backdrop-blur flex items-center gap-2">
                  <span className="h-6 w-6 rounded-md bg-brand-subtle text-primary inline-flex items-center justify-center">
                    <Home className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-body-sm font-medium text-foreground">{group}</span>
                  <span className="text-caption text-text-tertiary">共 {items.length} 项</span>
                </div>

                <div className="space-y-2.5 mt-1">
                  {items.map((d) => {
                    const isChecked = selected.has(d.id);

                    const inner = (
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-1.5 text-body-sm h-5">
                          <span className="font-mono text-text-tertiary text-caption">{d.id}</span>
                          <span className="text-text-tertiary">·</span>
                          <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                            <Stethoscope className="h-3 w-3" />
                            {d.workType || "未指定类型"}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="text-card-title text-foreground truncate h-[26px] leading-[26px]">
                          {d.target ? `单只 ${d.target}` : "未指定对象"}
                        </div>

                        {/* Desc */}
                        <div className="text-body-sm text-text-secondary truncate h-[22px] leading-[22px]">
                          {d.desc || d.suspectedDisease || (d.symptoms?.length ? d.symptoms.join("、") : null) || "-"}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center text-caption text-text-tertiary pt-2 border-t border-border/60 h-9">
                          <span>{formatDate(d.savedAt)}</span>
                          <span className="ml-auto inline-flex items-center gap-0.5 text-text-secondary shrink-0 pl-2">
                            {selectMode ? (isChecked ? "已选" : "选择") : "继续编辑"}
                            {!selectMode && <ChevronRight className="h-3.5 w-3.5" />}
                          </span>
                        </div>
                      </div>
                    );

                    const cls = `${selectMode ? "flex items-start gap-3" : "block"} rounded-xl bg-card border p-4 active:bg-surface-subtle ${
                      selectMode && isChecked ? "border-primary/60 bg-brand-subtle/40" : "border-border"
                    }`;
                    if (selectMode) {
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => toggleSelect(d.id)}
                          className={cls + " w-full text-left"}
                        >
                          <span
                            className={`mt-1 h-5 w-5 rounded-md border inline-flex items-center justify-center shrink-0 ${
                              isChecked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border bg-card"
                            }`}
                          >
                            {isChecked && <CheckSquare className="h-3.5 w-3.5" />}
                          </span>
                          {inner}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/m/report",
                            search: d.target ? { target: d.target } : {},
                          })
                        }
                        className={cls + " w-full text-left"}
                      >
                        {inner}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}

      {/* 批量操作底栏 */}
      {selectMode && drafts.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 bg-card border-t border-border px-4 py-3 flex items-center gap-3">
          <span className="text-body-sm text-text-secondary">
            已选 <span className="text-foreground font-medium">{selected.size}</span> 项
          </span>
          <button
            onClick={() => selected.size > 0 && setConfirmDelete(true)}
            disabled={selected.size === 0}
            className="ml-auto h-10 px-4 rounded-lg bg-[var(--state-danger)] text-white text-body-sm inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </button>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-6"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[320px] rounded-2xl bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="h-8 w-8 rounded-full bg-[var(--state-danger)]/10 text-[var(--state-danger)] inline-flex items-center justify-center">
                <Trash2 className="h-4 w-4" />
              </span>
              <div className="text-card-title text-foreground">删除草稿</div>
              <button
                onClick={() => setConfirmDelete(false)}
                className="ml-auto h-7 w-7 inline-flex items-center justify-center text-text-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-body-sm text-text-secondary mb-4">
              确认删除选中的 {selected.size} 条草稿？删除后无法恢复。
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 h-10 rounded-lg border border-border text-body-sm text-text-secondary"
              >
                取消
              </button>
              <button
                onClick={doDelete}
                className="flex-1 h-10 rounded-lg bg-[var(--state-danger)] text-white text-body-sm"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 兜底引用，避免未使用警告 */}
      <span className="hidden">
        <ClipboardList />
      </span>
    </MobileShell>
  );
}
