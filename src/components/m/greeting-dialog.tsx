import { useEffect, useState } from "react";
import { Sun, Moon, Coffee, ArrowRight } from "lucide-react";
import morningGreeting from "@/assets/cow-morning-greeting.svg.asset.json";
import afternoonGreeting from "@/assets/cow-afternoon-greeting.svg.asset.json";
import morningStart from "@/assets/cow-_morning-start-work.svg.asset.json";
import afternoonStart from "@/assets/cow-_afternoon-start-work.svg.asset.json";
import leaveRest from "@/assets/cow-leave-rest.svg.asset.json";

/** 上午问候语（≤12 字） */
const MORNING_MOODS = [
  "新的一天，从巡栏开始",
  "早安，牛儿等你查栏",
  "今天也要元气满满",
  "阳光正好，慢慢来",
  "先喝口水，再开工",
];

/** 下午问候语（≤12 字） */
const AFTERNOON_MOODS = [
  "下午别硬撑，稳着来",
  "午后慢半拍也没关系",
  "再走一圈，就快收工",
  "喝口茶，接着加油",
  "傍晚前把事收个尾",
];

type Props = {
  /** 当前时段预计工作项数 */
  count: number;
  /** 每个会话只弹一次的存储 key */
  storageKey?: string;
};

/**
 * M 端问候卡弹窗：按时段问候 -> 出勤 / 请假 -> 反馈文案 -> 进入主页。
 * 情绪化设计：奶牛插画 + 柔和渐变底 + 鼓励文案。
 */
export function GreetingDialog({ count, storageKey = "mp:greeted" }: Props) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<null | "work" | "leave">(null);
  const [isMorning, setIsMorning] = useState(true);
  const [moodIndex, setMoodIndex] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {}
    setIsMorning(new Date().getHours() < 12);
    setMoodIndex(Math.floor(Math.random() * 5));
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
  const heroArt = isMorning ? morningGreeting.url : afternoonGreeting.url;
  const workArt = isMorning ? morningStart.url : afternoonStart.url;
  const heroBg = isMorning
    ? "linear-gradient(180deg,#F3FAEF 0%,#E7F6EA 100%)"
    : "linear-gradient(180deg,#FFF6EC 0%,#E9F6F0 100%)";
  const mood = isMorning
    ? MORNING_MOODS[moodIndex % MORNING_MOODS.length]
    : AFTERNOON_MOODS[moodIndex % AFTERNOON_MOODS.length];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-[2px] px-6 animate-in fade-in duration-200">
      <div className="w-full max-w-[344px] rounded-[28px] bg-card overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {feedback === null ? (
          <>
            {/* 插画区 */}
            <div className="relative" style={{ background: heroBg }}>
              <span className="absolute top-4 left-4 h-9 w-9 rounded-2xl bg-card/80 backdrop-blur-sm inline-flex items-center justify-center shadow-sm">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </span>
              <img
                src={heroArt}
                alt={`${period}问候插画`}
                className="w-full h-[188px] object-contain select-none pointer-events-none animate-in fade-in zoom-in-95 duration-500"
              />
            </div>

            <div className="px-6 pt-5">
              <div className="text-page-title font-semibold text-foreground tracking-tight">
                {period}好，李雨晴
              </div>
              <div className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                今天{period}预计有
                <span className="mx-1.5 inline-flex items-baseline gap-0.5 px-2 py-0.5 rounded-lg bg-[var(--surface-subtle,#EFFBF1)] font-semibold text-primary">
                  <span className="text-section-title leading-none">{count}</span>
                  <span className="text-caption">项</span>
                </span>
                工作，准备好就开始吧！
              </div>
              <div
                className="mt-3 text-page-title text-primary leading-snug"
                style={{ fontFamily: '"HYWangFeiJieLanManTongNian", "汉呈王飞杰烂漫童年", "Long Cang", "Liu Jian Mao Cao", "STXingkai", "KaiTi", cursive' }}
              >
                {mood}
              </div>
            </div>

            <div className="p-5 pt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => setFeedback("work")}
                className="w-full h-12 rounded-2xl text-primary-foreground text-body font-medium inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
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
          <div className="animate-in fade-in duration-200">
            <div
              className="relative"
              style={{
                background:
                  feedback === "work"
                    ? "linear-gradient(180deg,#F3FAEF 0%,#E7F6EA 100%)"
                    : "linear-gradient(180deg,#F2FAF6 0%,#E4F3EC 100%)",
              }}
            >
              <img
                src={feedback === "work" ? workArt : leaveRest.url}
                alt={feedback === "work" ? "开始工作插画" : "请假休息插画"}
                className="w-full h-[188px] object-contain select-none pointer-events-none animate-in zoom-in-95 duration-500"
              />
            </div>
            <div className="px-6 pt-5 text-center">
              <div className="text-section-title text-foreground font-medium">
                {feedback === "work" ? "已确认出勤" : "已记录本场请假"}
              </div>
              <div className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                {feedback === "work"
                  ? "已确认出勤，祝你今天工作顺利。"
                  : "已记录本场请假，请安心休息。"}
              </div>
            </div>
            <div className="p-5 pt-4">
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
