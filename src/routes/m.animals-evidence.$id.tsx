import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { X, FilePlus2, Check } from "lucide-react";
import { toast } from "sonner";
import { markAlertHandled } from "@/lib/alert-store";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/animals-evidence/$id")({
  head: () => ({ meta: [{ title: "无需治疗留证 · 奇点智牧" }] }),
  component: EvidencePage,
});

const REASON_OPTIONS = [
  "设备问题，数据有误",
  "牛只正常，无病症",
  "继续观察，暂不治疗",
];

type EvidenceRecord = {
  time: string;
  reason: string;
  note: string;
  photos: string[];
};

function EvidencePage() {
  const { id } = useParams({ from: "/m/animals-evidence/$id" });
  const navigate = useNavigate();

  const [selectedReason, setSelectedReason] = useState<string>("");
  const [evPhotos, setEvPhotos] = useState<string[]>([]);
  const [evNote, setEvNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const evidenceKey = `cow-alert-evidence-${id}`;

  const saveAndObserve = () => {
    const trimmed = evNote.trim();
    if (!selectedReason || evPhotos.length === 0 || trimmed.length < 5) return;

    const obsKey = `cow-observe-${id}`;
    const d = new Date();
    d.setHours(24, 0, 0, 0); // 次日 00:00
    window.localStorage.setItem(obsKey, String(d.getTime()));
    markAlertHandled(id); // 异常排查任务当天从今日任务列表清除

    const rec: EvidenceRecord = {
      time: new Date().toLocaleString("zh-CN", { hour12: false }),
      reason: selectedReason,
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

    toast.success(`已留证并标记无需治疗 · ${selectedReason}`);
    navigate({ to: "/m/animals-{$id}", params: { id } });
  };

  return (
    <MobileShell title="无需治疗留证" back hideTabBar headerTone="brand">
      <div className="px-4 pt-3 pb-28 space-y-5">
        <div className="space-y-1">
          <div className="text-section text-foreground">#{id} 无需治疗</div>
          <div className="text-caption text-text-tertiary">
            选择原因并拍照留证，信息将作为回溯追责依据
          </div>
        </div>

        {/* 原因选择 */}
        <div className="space-y-2">
          <div className="text-caption text-text-secondary">请选择无需治疗的原因</div>
          <div className="space-y-2">
            {REASON_OPTIONS.map((r) => {
              const active = selectedReason === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedReason(r)}
                  className={`w-full flex items-center justify-between rounded-xl border px-3 py-3 text-left transition-colors ${
                    active
                      ? "border-primary bg-brand-subtle text-primary"
                      : "border-border bg-card text-foreground active:bg-surface-subtle"
                  }`}
                >
                  <span className="text-body text-foreground">{r}</span>
                  {active && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 现场照片 */}
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

        {/* 现场说明 */}
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
            onClick={() => navigate({ to: "/m/animals-{$id}", params: { id } })}
            className="h-11 rounded-xl border border-border text-body-sm text-text-secondary active:bg-surface-subtle"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!selectedReason || evPhotos.length === 0 || evNote.trim().length < 5}
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
