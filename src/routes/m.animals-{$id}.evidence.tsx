import { createFileRoute, useParams, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { X, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { markAlertHandled } from "@/lib/alert-store";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/animals-{$id}/evidence")({
  validateSearch: (s: Record<string, unknown>): { reason?: string } => ({
    reason: typeof s.reason === "string" ? s.reason : undefined,
  }),
  head: () => ({ meta: [{ title: "异常排查留证 · 奇点智牧" }] }),
  component: EvidencePage,
});


type EvidenceRecord = {
  time: string;
  reason: string;
  note: string;
  photos: string[];
  operator: string;
};

function EvidencePage() {
  const { id } = useParams({ from: "/m/animals-{$id}/evidence" });
  const navigate = useNavigate();
  const { reason } = useSearch({ from: "/m/animals-{$id}/evidence" });

  const pendingReason = typeof reason === "string" ? reason : "";

  const [evPhotos, setEvPhotos] = useState<string[]>([]);
  const [evNote, setEvNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const evidenceKey = `cow-alert-evidence-${id}`;

  const saveAndObserve = () => {
    const trimmed = evNote.trim();
    if (evPhotos.length === 0 || trimmed.length < 5) return;

    const obsKey = `cow-observe-${id}`;
    const d = new Date();
    d.setHours(24, 0, 0, 0); // 次日 00:00
    window.localStorage.setItem(obsKey, String(d.getTime()));
    markAlertHandled(id); // 异常排查任务当天从今日任务列表清除

    const rec: EvidenceRecord = {
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
      reason: pendingReason,
      note: trimmed,
      photos: evPhotos,
      operator: "张兽医",
    };

    try {
      const raw = window.localStorage.getItem(evidenceKey);
      const prev = raw ? (JSON.parse(raw) as EvidenceRecord[]) : [];
      window.localStorage.setItem(evidenceKey, JSON.stringify([rec, ...prev]));
    } catch {
      /* ignore */
    }

    toast.success(`已留证并标记无需治疗 · ${pendingReason}`);
    navigate({ to: "/m/animals/$id", params: { id } });
  };

  return (
    <MobileShell title="留证材料" back hideTabBar headerTone="brand">
      <div className="px-4 pt-3 pb-28 space-y-4">
        <div className="space-y-1">
          <div className="text-section text-foreground">留证材料</div>
          <div className="text-caption text-text-tertiary">
            #{id} · {pendingReason || "无需治疗"} · 留证信息将作为回溯追责依据
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-caption text-text-secondary">现场照片（至少 1 张）</div>
          <div className="grid grid-cols-4 gap-2">
            {evPhotos.map((p, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-surface-subtle">
                <img src={p} alt={`留证照片 ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setEvPhotos(evPhotos.filter((_, k) => k !== i))}
                  className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white inline-flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {evPhotos.length < 4 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="aspect-square rounded-lg border border-dashed border-border text-text-tertiary inline-flex flex-col items-center justify-center gap-0.5 active:bg-surface-subtle"
              >
                <FilePlus2 className="h-4 w-4" />
                <span className="text-[11px]">添加</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              const urls = files.slice(0, 4 - evPhotos.length).map((f) => URL.createObjectURL(f));
              setEvPhotos([...evPhotos, ...urls]);
              e.target.value = "";
            }}
          />
        </div>

        <div className="space-y-1.5">
          <div className="text-caption text-text-secondary">现场说明（必填，不少于 5 字）</div>
          <textarea
            value={evNote}
            onChange={(e) => setEvNote(e.target.value)}
            rows={4}
            placeholder="如：现场查看采食反刍正常，颈环佩戴松动导致数据异常"
            className="w-full rounded-xl border border-border bg-card p-3 text-body-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="rounded-xl bg-surface-subtle px-3 py-2 text-caption text-text-tertiary">
          提交人：张兽医 · {new Date().toLocaleString("zh-CN", { hour12: false })}
        </div>
      </div>

      {/* 底部吸底提交 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="mx-auto max-w-[440px] grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/m/animals/$id", params: { id } })}
            className="h-11 rounded-xl border border-border text-body-sm text-text-secondary active:bg-surface-subtle"
          >
            取消
          </button>
          <button
            type="button"
            disabled={evPhotos.length === 0 || evNote.trim().length < 5}
            onClick={saveAndObserve}
            className="h-11 rounded-xl bg-primary text-primary-foreground text-body-sm font-medium disabled:opacity-40"
          >
            提交留证
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
