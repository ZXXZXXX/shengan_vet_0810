import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileEdit, Stethoscope, ChevronRight, Trash2, Home } from "lucide-react";
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

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    if (sameDay) return `今日 ${hh}:${mm}`;
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日 ${hh}:${mm}`;
  } catch {
    return iso;
  }
}

function DraftsPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("report:drafts");
      setDrafts(raw ? JSON.parse(raw) : []);
    } catch {
      setDrafts([]);
    }
  }, []);

  const remove = (id: string) => {
    const next = drafts.filter((d) => d.id !== id);
    setDrafts(next);
    localStorage.setItem("report:drafts", JSON.stringify(next));
  };

  // 按"目标 / 牛舍"分组，与工单列表保持一致
  const grouped = drafts.reduce<Record<string, Draft[]>>((acc, d) => {
    const key = d.target?.trim() || "未指定对象";
    (acc[key] ||= []).push(d);
    return acc;
  }, {});

  return (
    <MobileShell title="草稿箱" back>
      {drafts.length === 0 ? (
        <EmptyState
          icon={FileEdit}
          title="暂无草稿"
          desc="在现场上报中点击「存草稿」即可保存未完成的工单"
          action={
            <Link
              to="/m/report"
              className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-body-sm inline-flex items-center"
            >
              去现场上报
            </Link>
          }
        />
      ) : (
        <div className="px-4 pt-3 pb-4 space-y-4">
          <div className="text-caption text-text-tertiary">
            共 {drafts.length} 条未完成上报
          </div>
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b, "zh"))
            .map(([group, items]) => (
              <section key={group}>
                <div className="sticky top-12 z-[1] -mx-4 px-4 py-2 bg-background/85 backdrop-blur flex items-center gap-2">
                  <span className="h-6 w-6 rounded-md bg-brand-subtle text-primary inline-flex items-center justify-center">
                    <Home className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-body-sm font-medium text-foreground">{group}</span>
                  <span className="text-caption text-text-tertiary">共 {items.length} 项</span>
                </div>

                <div className="space-y-2.5 mt-1">
                  {items.map((d) => {
                    const conclusion =
                      d.suspectedDisease ||
                      (d.symptoms && d.symptoms.length > 0 ? d.symptoms.join("、") : null) ||
                      d.note ||
                      "未填写结论";
                    return (
                      <div
                        key={d.id}
                        className="block rounded-xl bg-card border border-dashed border-border p-4"
                      >
                        <div className="flex flex-col gap-2">
                          {/* Header */}
                          <div className="flex items-center gap-1.5 text-body-sm h-5">
                            <span className="tag tag-muted inline-flex items-center gap-1">
                              <FileEdit className="h-3 w-3" />
                              草稿
                            </span>
                            <span className="font-mono text-text-tertiary text-caption ml-auto">{d.id}</span>
                            {d.workType && (
                              <>
                                <span className="text-text-tertiary">·</span>
                                <span className="inline-flex items-center gap-1 text-caption text-text-tertiary">
                                  <Stethoscope className="h-3 w-3" />
                                  {d.workType}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Title */}
                          <div className="text-card-title text-foreground truncate h-[26px] leading-[26px]">
                            {d.target ? `单只 ${d.target}` : "未指定对象"}
                            <span className="text-text-tertiary"> · </span>
                            {conclusion}
                          </div>

                          {/* Desc */}
                          <div className="text-body-sm text-text-secondary truncate h-[22px] leading-[22px]">
                            {d.desc || <span className="text-text-tertiary/0">·</span>}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center text-caption text-text-tertiary pt-2 border-t border-border/60 h-9">
                            <span className="truncate">
                              保存 <span className="text-text-secondary">{formatTime(d.savedAt)}</span>
                              {(d.photos?.length || d.videos?.length || d.voiceSecs) && (
                                <>
                                  <span className="mx-1.5">·</span>
                                  <span className="text-text-secondary">
                                    {d.photos?.length ? `${d.photos.length} 图` : ""}
                                    {d.videos?.length ? ` ${d.videos.length} 视频` : ""}
                                    {d.voiceSecs ? ` 录音 ${d.voiceSecs}s` : ""}
                                  </span>
                                </>
                              )}
                            </span>
                            <button
                              onClick={() => remove(d.id)}
                              className="ml-auto inline-flex items-center gap-1 text-text-tertiary shrink-0 pl-2 hover:text-[var(--state-danger)]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              删除
                            </button>
                            <button
                              onClick={() =>
                                navigate({
                                  to: "/m/report",
                                  search: d.target ? { target: d.target } : {},
                                })
                              }
                              className="ml-2 inline-flex items-center gap-0.5 text-primary shrink-0"
                            >
                              继续编辑
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}
    </MobileShell>
  );
}
