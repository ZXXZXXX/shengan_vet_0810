import { useEffect, useState } from "react";
import { Sun, Sunset, CheckCircle2 } from "lucide-react";

type Props = {
  /** 当前时段预计工作项数 */
  count: number;
  /** 每个会话只弹一次的存储 key */
  storageKey?: string;
};

/**
 * M 端问候卡弹窗：按时段问候 -> 出勤 / 请假 -> 反馈文案 -> 进入主页。
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
  const Icon = isMorning ? Sun : Sunset;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-6">
      <div className="w-full max-w-[340px] rounded-3xl bg-card overflow-hidden shadow-xl">
        {feedback === null ? (
          <>
            <div
              className="px-5 pt-6 pb-5 text-white"
              style={{ background: "linear-gradient(135deg,#00A85A 0%,#3FD49C 100%)" }}
            >
              <span className="h-11 w-11 rounded-2xl bg-white/20 inline-flex items-center justify-center">
                <Icon className="h-6 w-6" />
              </span>
              <div className="mt-3 text-section-title font-semibold">{period}好</div>
              <div className="mt-1 text-body-sm text-white/90 leading-relaxed">
                今天{period}预计有 <span className="font-semibold">{count}</span> 项工作，准备好就开始吧！
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => setFeedback("work")}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-body font-medium active:opacity-90"
              >
                开始工作
              </button>
              <button
                type="button"
                onClick={() => setFeedback("leave")}
                className="w-full h-11 rounded-xl border border-border bg-card text-body text-text-secondary active:opacity-80"
              >
                我请假了
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center space-y-4">
            <span className="h-12 w-12 rounded-full bg-brand-subtle inline-flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </span>
            <div className="text-body text-foreground leading-relaxed">
              {feedback === "work"
                ? "已确认出勤，祝你今天工作顺利。"
                : "已记录本场请假，请安心休息。"}
            </div>
            <button
              type="button"
              onClick={close}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-body font-medium active:opacity-90"
            >
              好的
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
