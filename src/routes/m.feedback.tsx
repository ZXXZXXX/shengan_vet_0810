import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star, X } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { MediaGrid } from "@/components/m/media-grid";
import { toast } from "sonner";

export const Route = createFileRoute("/m/feedback")({
  head: () => ({ meta: [{ title: "帮助与反馈 · 奇点智牧" }] }),
  component: FeedbackPage,
});

const RATING_LABELS = ["很差", "较差", "一般", "满意", "非常满意"];

const TOPICS = [
  "功能建议",
  "使用问题",
  "数据/账号",
  "性能卡顿",
  "界面体验",
  "其他",
];

function FeedbackPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [topic, setTopic] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<number[]>([]);
  const [showRatingCard, setShowRatingCard] = useState(true);

  const canSubmit = topic !== null && content.trim().length >= 5;

  const submit = () => {
    if (!topic) {
      toast.error("请选择反馈类型");
      return;
    }
    if (content.trim().length < 5) {
      toast.error("请填写至少 5 个字的反馈内容");
      return;
    }
    toast.success("反馈已提交,感谢您的支持");
    setTimeout(() => navigate({ to: "/m/me" }), 300);
  };

  const currentRating = hoverRating || rating;

  return (
    <MobileShell title="帮助与反馈" back={{ to: "/m/me" }} hideTabBar>
      <div className="px-4 py-4 space-y-4 pb-32">
        {/* 评分(可关闭) */}
        {showRatingCard && (
          <section className="relative bg-card rounded-2xl border border-border p-4">
            <button
              type="button"
              onClick={() => setShowRatingCard(false)}
              aria-label="关闭"
              className="absolute top-3 right-3 h-7 w-7 rounded-full inline-flex items-center justify-center text-text-tertiary active:bg-surface-subtle"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-card-title text-foreground mb-1 pr-8">您对系统的整体使用体验?</div>
            <div className="text-caption text-text-tertiary mb-4">点击星星进行评分</div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 active:scale-90 transition-transform"
                  aria-label={`${n} 星`}
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      n <= currentRating
                        ? "fill-[#F5B301] text-[#F5B301]"
                        : "text-border"
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <div className="text-center mt-3 text-body-sm h-5">
              {currentRating > 0 ? (
                <span className="text-primary font-medium">
                  {RATING_LABELS[currentRating - 1]}
                </span>
              ) : (
                <span className="text-text-tertiary">未评分</span>
              )}
            </div>
          </section>
        )}

        {/* 反馈类型 */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="text-card-title text-foreground mb-3">
            反馈类型<span className="text-[var(--state-danger)] ml-0.5">*</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const active = topic === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(active ? null : t)}
                  className={`h-8 px-3 rounded-full text-body-sm border transition-colors ${
                    active
                      ? "bg-brand-subtle border-primary text-primary"
                      : "bg-card border-border text-text-secondary active:bg-surface-subtle"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        {/* 详细内容 */}
        <section className="bg-card rounded-2xl border border-border p-4">
          <div className="text-card-title text-foreground mb-2">
            详细描述<span className="text-[var(--state-danger)] ml-0.5">*</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请描述您遇到的问题或建议,越具体越有助于我们改进"
            rows={5}
            maxLength={500}
            className="w-full p-3 rounded-lg text-body resize-none leading-relaxed bg-surface-subtle border border-border focus:outline-none focus:border-primary"
          />
          <div className="text-right text-caption text-text-tertiary mt-1">
            {content.length} / 500
          </div>

          <div className="mt-3">
            <MediaGrid
              items={photos}
              setItems={setPhotos}
              max={6}
              caption="上传图片/视频"
              helper="最多可上传 6 个文件,便于我们定位问题"
            />
          </div>
        </section>
      </div>

      {/* 吸底按钮 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={`w-full h-11 rounded-xl text-body font-medium transition-colors ${
            canSubmit
              ? "bg-primary text-primary-foreground active:bg-[var(--brand-hover)]"
              : "bg-surface-subtle text-text-tertiary"
          }`}
        >
          提交反馈
        </button>
      </div>
    </MobileShell>
  );
}
