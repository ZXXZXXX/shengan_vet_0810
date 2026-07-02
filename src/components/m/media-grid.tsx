import React from "react";
import { Camera, Video, X } from "lucide-react";

/**
 * 统一的照片 / 视频录入组件（与「现场记录」保持一致）。
 * - 4 列网格，方形卡片；右上角红点删除
 * - 空位卡片：Camera 图标 + "添加" 文案；点击唤起原生相册 / 相机
 * - 顶部展示「照片 / 视频 · N 条」提示；hideVideo=true 时仅照片
 */
export function MediaGrid({
  items,
  setItems,
  max = 9,
  disabled = false,
  hideVideo = false,
  required = false,
  caption,
  helper,
}: {
  items: number[];
  setItems: React.Dispatch<React.SetStateAction<number[]>>;
  max?: number;
  disabled?: boolean;
  hideVideo?: boolean;
  required?: boolean;
  caption?: string;
  helper?: string;
}) {
  const remaining = Math.max(0, max - items.length);
  const label = caption ?? (hideVideo ? "照片" : "照片 / 视频");

  return (
    <div>
      <div className="text-caption text-text-tertiary inline-flex items-center gap-1 mb-2">
        <Camera className="h-3.5 w-3.5" />
        {label}
        {required && <span className="text-[var(--state-danger)]">*</span>}
        <span>· {items.length} 条</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((id) => (
          <div
            key={id}
            className="relative aspect-square rounded-lg bg-gradient-to-br from-surface-subtle to-border border border-border flex items-center justify-center"
          >
            {!hideVideo && <Video className="h-5 w-5 text-text-tertiary opacity-0" />}
            <button
              type="button"
              disabled={disabled}
              onClick={() => setItems((prev) => prev.filter((x) => x !== id))}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/85 text-background inline-flex items-center justify-center shadow disabled:opacity-50"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <label
            className={`aspect-square rounded-lg bg-surface-subtle flex flex-col items-center justify-center gap-1 text-text-tertiary transition-colors ${
              disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:bg-border"
            }`}
          >
            <Camera className="h-5 w-5" />
            <span className="text-caption">添加</span>
            <input
              type="file"
              accept={hideVideo ? "image/*" : "image/*,video/*"}
              multiple
              disabled={disabled}
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length === 0) return;
                setItems((prev) => [
                  ...prev,
                  ...files.map(() => Date.now() + Math.random()),
                ]);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {helper && (
        <div className="mt-2 text-caption text-text-tertiary">{helper}</div>
      )}
    </div>
  );
}
