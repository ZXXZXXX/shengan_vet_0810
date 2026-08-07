import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles, PartyPopper, Coffee, ArrowRight } from "lucide-react";

type Props = {
  /** 当前时段预计工作项数 */
  count: number;
  /** 每个会话只弹一次的存储 key */
  storageKey?: string;
};

/**
 * M 端问候卡弹窗：按时段问候 -> 出勤 / 请假 -> 反馈文案 -> 进入主页。
 * 情绪化设计：时段插画天空、光晕、飘浮元素与鼓励文案。
 */
export function GreetingDialog({ count, storageKey = "mp:greeted" }: Props) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<null | "work" | "leave">(null);
  const [isMorning, setIsMorning] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {}
    setIsMorning(new Date().getHours() < 12);
    setOpen(true);
  }, [storageKey]);

  const close = () => {
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {}
    setOpen(false);
  };

  if (!open) return null;

  const period = isMorning ? "早上" : "下午";
  const Icon = isMorning ? Sun : Moon;
  const sky = isMorning
    ? "linear-gradient(160deg,#FFD98E 0%,#7FE3B4 55%,#00A85A 100%)"
    : "linear-gradient(160deg,#FFB27A 0%,#5FCFAE 55%,#00875C 100%)";
  const mood = isMorning
    ? "新的一天，从一次巡栏开始 ☀️"
    : "下午也别硬撑，节奏稳一点就好 🌤️";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-6 animate-in fade-in duration-200">
      <div className="w-full max-w-[344px] rounded-[28px] bg-card overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {feedback === null ? (
          <>
            {/* 情绪化天空插画 */}
            <div className="relative px-6 pt-7 pb-6 text-white overflow-hidden" style={{ background: sky }}>
              {/* 光晕 */}
              <span
                aria-hidden
                className="absolute -top-16 -right-10 h-44 w-44 rounded-full animate-pulse"
                style={{ background: "radial-gradient(circle,rgba(255,255,255,0.55),transparent 70%)" }}
              />
              <span
                aria-hidden
                className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full"
                style={{ background: "radial-gradient(circle,rgba(255,255,255,0.28),transparent 70%)" }}
              />
              {/* 云朵 */}
              <span aria-hidden className="absolute top-6 left-4 h-3 w-14 rounded-full bg-white/40" />
              <span aria-hidden className="absolute top-11 left-10 h-2.5 w-9 rounded-full bg-white/25" />
              <Sparkles aria-hidden className="absolute top-5 right-24 h-4 w-4 text-white/70 animate-pulse" />

              <div className="relative">
                <span className="h-14 w-14 rounded-2xl bg-white/25 backdrop-blur-sm inline-flex items-center justify-center shadow-lg ring-1 ring-white/40">
                  <Icon className="h-7 w-7 drop-shadow" />
                </span>
                <div className="mt-4 text-page-title font-semibold tracking-tight drop-shadow-sm">
                  {period}好，李雨晴
                </div>
                <div className="mt-2 text-body-sm text-white/95 leading-relaxed">
                  今天{period}预计有
                  <span className="mx-1.5 inline-flex items-baseline gap-0.5 px-2 py-0.5 rounded-lg bg-white/25 font-semibold text-white">
                    <span className="text-section-title leading-none">{count}</span>
                    <span className="text-caption">项</span>
                  </span>
                  工作，准备好就开始吧！
                </div>
              </div>
            </div>

            {/* 情绪文案 */}
            <div className="px-6 pt-4">
              <div className="rounded-2xl bg-surface-subtle px-3.5 py-2.5 text-caption text-text-secondary leading-relaxed">
                {mood}
              </div>
            </div>

            <div className="p-5 pt-3 space-y-2.5">
              <button
                type="button"
                onClick={() => setFeedback("work")}
                className="w-full h-12 rounded-2xl text-primary-foreground text-body font-medium inline-flex items-center justify-center gap-1.5 shadow-lg active:scale-[0.98] transition-transform"
                style={{
                  background: "linear-gradient(135deg,#00A85A 0%,#3FD49C 100%)",
                  boxShadow: "0 10px 24px -10px color-mix(in oklab, var(--primary) 60%, transparent)",
                }}
              >
                开始工作
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setFeedback("leave")}
                className="w-full h-11 rounded-2xl text-body-sm text-text-tertiary inline-flex items-center justify-center gap-1.5 active:opacity-70"
              >
                <Coffee className="h-3.5 w-3.5" />
                我请假了
              </button>
            </div>
          </>
        ) : (
          <div className="relative p-7 text-center overflow-hidden animate-in fade-in duration-200">
            <span
              aria-hidden
              className="absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full"
              style={{
                background:
                  feedback === "work"
                    ? "radial-gradient(circle, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)"
                    : "radial-gradient(circle, rgba(255,178,122,0.35), transparent 70%)",
              }}
            />
            <div className="relative space-y-4">
              <span
                className="h-16 w-16 rounded-full inline-flex items-center justify-center shadow-md animate-in zoom-in duration-300"
                style={{
                  background:
                    feedback === "work"
                      ? "linear-gradient(135deg,#00A85A 0%,#3FD49C 100%)"
                      : "linear-gradient(135deg,#FFB27A 0%,#FFD98E 100%)",
                }}
              >
                {feedback === "work" ? (
                  <PartyPopper className="h-7 w-7 text-white" />
                ) : (
                  <Coffee className="h-7 w-7 text-white" />
                )}
              </span>
              <div className="text-section-title text-foreground font-medium">
                {feedback === "work" ? "已确认出勤" : "已记录本场请假"}
              </div>
              <div className="text-body-sm text-text-secondary leading-relaxed">
                {feedback === "work"
                  ? "已确认出勤，祝你今天工作顺利。"
                  : "已记录本场请假，请安心休息。"}
              </div>
              <button
                type="button"
                onClick={close}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-body font-medium active:scale-[0.98] transition-transform"
              >
                好的
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
