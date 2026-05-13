import { useEffect, useState } from "react";

export type TransitionState = {
  rect: { top: number; left: number; width: number; height: number };
  tone: string;
  image: string;
  variant: "pc" | "mobile";
  title: string;
} | null;

/** 卡片→详情页 流畅过渡 + 骨架屏 */
export function ModuleTransition({
  state,
  onDone,
}: {
  state: TransitionState;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"start" | "expanded">("start");

  useEffect(() => {
    if (!state) {
      setPhase("start");
      return;
    }
    setPhase("start");
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase("expanded"));
    });
    const t = setTimeout(() => onDone(), 720);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(t);
    };
  }, [state, onDone]);

  if (!state) return null;
  const { rect } = state;
  const style =
    phase === "start"
      ? {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: 16,
        }
      : { top: 0, left: 0, width: "100vw", height: "100dvh", borderRadius: 0 };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* 背景淡入遮罩 */}
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm transition-opacity duration-500"
        style={{ opacity: phase === "expanded" ? 1 : 0 }}
      />
      {/* 主过渡层：从卡片矩形扩张到全屏 */}
      <div
        className="absolute overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]"
        style={{
          ...style,
          transition:
            "top 620ms cubic-bezier(.22,.9,.32,1), left 620ms cubic-bezier(.22,.9,.32,1), width 620ms cubic-bezier(.22,.9,.32,1), height 620ms cubic-bezier(.22,.9,.32,1), border-radius 620ms cubic-bezier(.22,.9,.32,1)",
          background: "var(--bg-page)",
          willChange: "top,left,width,height,border-radius",
        }}
      >
        {/* 底层图片（淡出） */}
        <img
          src={state.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: phase === "expanded" ? 0.18 : 0.7 }}
        />
        {/* 品牌色渐变 */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, color-mix(in oklab, ${state.tone} 90%, transparent) 0%, color-mix(in oklab, ${state.tone} 30%, transparent) 60%, color-mix(in oklab, ${state.tone} 5%, transparent) 100%)`,
            opacity: phase === "expanded" ? 0.55 : 1,
          }}
        />
        {/* 中央 loading 标识（早期） */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          style={{ opacity: phase === "expanded" ? 0 : 1 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-md text-white text-body-sm border border-white/40">
            <Spinner />
            进入 {state.title}
          </div>
        </div>
        {/* 骨架屏（后期淡入） */}
        <div
          className="absolute inset-0 transition-opacity duration-400"
          style={{
            opacity: phase === "expanded" ? 1 : 0,
            transitionDelay: phase === "expanded" ? "150ms" : "0ms",
          }}
        >
          {state.variant === "pc" ? <PcSkeleton /> : <MobileSkeleton />}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
  );
}

function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md animate-pulse ${className}`}
      style={{ background: "color-mix(in oklab, var(--brand) 6%, var(--bg-surface-subtle))" }}
    />
  );
}

function PcSkeleton() {
  return (
    <div className="absolute inset-0 bg-background flex">
      {/* sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-card p-4 space-y-3">
        <Bar className="h-8 w-32" />
        <div className="pt-3 space-y-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Bar key={i} className="h-8 w-full" />
          ))}
        </div>
      </aside>
      {/* main */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card px-6 flex items-center gap-3">
          <Bar className="h-5 w-40" />
          <div className="ml-auto flex items-center gap-3">
            <Bar className="h-7 w-7 rounded-full" />
            <Bar className="h-7 w-24" />
          </div>
        </header>
        <div className="flex-1 p-6 space-y-4 overflow-hidden">
          <Bar className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bar key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Bar className="h-60 col-span-2 rounded-xl" />
            <Bar className="h-60 rounded-xl" />
          </div>
          <Bar className="h-40 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function MobileSkeleton() {
  return (
    <div className="absolute inset-0 bg-background flex justify-center">
      <div className="w-full max-w-[440px] flex flex-col">
        {/* hero */}
        <div className="h-44 bg-gradient-to-br from-primary to-[var(--effect-ai-cyan)]/70 px-4 pt-12 space-y-3">
          <Bar className="h-4 w-24 bg-white/30" />
          <Bar className="h-7 w-32 bg-white/40" />
          <div className="grid grid-cols-3 gap-3 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bar key={i} className="h-14 bg-white/25" />
            ))}
          </div>
        </div>
        <div className="p-4 space-y-3 flex-1">
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bar key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <Bar className="h-24 rounded-xl" />
          <Bar className="h-16 rounded-xl" />
          <Bar className="h-16 rounded-xl" />
          <Bar className="h-16 rounded-xl" />
        </div>
        {/* tabbar */}
        <div className="h-16 border-t border-border bg-card grid grid-cols-4 gap-4 px-6 items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} className="h-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
