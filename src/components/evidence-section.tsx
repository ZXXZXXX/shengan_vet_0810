import React from "react";
import { Mic, X } from "lucide-react";
import { MediaGrid } from "@/components/m/media-grid";


export function EvidenceSection({
  desc,
  setDesc,
  photos,
  setPhotos,
  videos,
  setVideos,
  voiceSecs,
  setVoiceSecs,
  recording,
  onVoiceToggle,
  hideVideo,
  descLabel = "具体描述",
  descRequired = true,
  descPlaceholder = "补充体征、用药反应、隔离建议等",
  title = "现场记录",
  mediaRequired = false,
}: {
  desc: string;
  setDesc: (v: string) => void;
  photos: number[];
  setPhotos: React.Dispatch<React.SetStateAction<number[]>>;
  videos: number[];
  setVideos: React.Dispatch<React.SetStateAction<number[]>>;
  voiceSecs: number | null;
  setVoiceSecs: (v: number | null) => void;
  recording: boolean;
  onVoiceToggle: () => void;
  hideVideo?: boolean;
  descLabel?: string;
  descRequired?: boolean;
  mediaRequired?: boolean;
  descPlaceholder?: string;
  title?: string;
}) {
  type MediaItem = { id: number; type: "photo" | "video" };
  const media: MediaItem[] = [
    ...photos.map((id) => ({ id, type: "photo" as const })),
    ...videos.map((id) => ({ id, type: "video" as const })),
  ];
  const maxMedia = 9;
  const remaining = maxMedia - media.length;
  const voiceCount = voiceSecs === null ? 0 : 1;

  return (
    <section className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-card-title text-foreground">{title}</h3>
      </div>
      <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mb-2">
        <Camera className="h-3.5 w-3.5" /> 照片 / 视频
        {mediaRequired && <span className="text-[var(--state-danger)]">*</span>}
        <span>· {media.length} 条</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {media.map((m) => (
          <div
            key={`${m.type}-${m.id}`}
            className="relative aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border flex items-center justify-center"
          >
            {m.type === "video" && <Video className="h-5 w-5 text-text-tertiary" />}
            <button
              onClick={() =>
                m.type === "photo"
                  ? setPhotos((prev) => prev.filter((x) => x !== m.id))
                  : setVideos((prev) => prev.filter((x) => x !== m.id))
              }
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/85 text-background inline-flex items-center justify-center shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <label className="aspect-square rounded-lg bg-surface-subtle flex flex-col items-center justify-center gap-1 text-text-tertiary cursor-pointer active:bg-border transition-colors">
            <Camera className="h-5 w-5" />
            <span className="text-caption">添加</span>
            <input
              type="file"
              accept={hideVideo ? "image/*" : "image/*,video/*"}
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                files.forEach((f) => {
                  if (f.type.startsWith("video/"))
                    setVideos((p) => [...p, Date.now() + Math.random()]);
                  else setPhotos((p) => [...p, Date.now() + Math.random()]);
                });
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mt-4 mb-2">
        <Mic className="h-3.5 w-3.5" /> 录音 · {voiceCount} 条
      </div>
      {voiceSecs === null ? (
        <button
          onClick={onVoiceToggle}
          className={`w-full h-11 rounded-lg border border-dashed inline-flex items-center justify-center gap-2 text-body-sm active:scale-[0.98] transition-all ${
            recording
              ? "border-[var(--state-danger)]/50 bg-[var(--state-danger)]/8 text-[var(--state-danger)]"
              : "border-border bg-card text-text-secondary"
          }`}
        >
          <Mic className={`h-4 w-4 ${recording ? "animate-pulse" : ""}`} />
          {recording ? "录音中…点击结束" : "点击开始录音"}
        </button>
      ) : (
        <div className="flex items-center gap-2 h-11 px-3 rounded-lg bg-brand-subtle border border-primary/20">
          <Mic className="h-4 w-4 text-primary" />
          <div className="flex-1 h-1.5 rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full w-1/2 bg-primary" />
          </div>
          <span className="text-caption text-primary font-mono">
            00:{String(voiceSecs).padStart(2, "0")}
          </span>
          <button
            onClick={() => setVoiceSecs(null)}
            className="h-7 w-7 rounded-full bg-card border border-border inline-flex items-center justify-center text-text-tertiary active:bg-surface-subtle"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mt-4">
        <div className="text-body-sm text-foreground mb-2">
          {descLabel}
          {descRequired && (
            <span className="text-[var(--state-danger)] ml-0.5">*</span>
          )}
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={descPlaceholder}
          rows={3}
          maxLength={500}
          className="w-full p-3 rounded-lg text-body resize-none leading-relaxed"
        />
        <div className="text-right text-caption text-text-tertiary mt-1">
          {desc.length} / 500
        </div>
      </div>
    </section>
  );
}
