import { useEffect, useState } from "react";

export type TransitionState = {
  rect: { top: number; left: number; width: number; height: number };
  tone: string;
  image: string;
  variant: "pc" | "mobile";
  title: string;
} | null;

const DURATION = 620;
const COMPLETE_AT = 720;

/** 卡片→详情页 流畅过渡 + 骨架屏，支持外部点击 / Esc 取消 */
export function ModuleTransition({
  state,
  onComplete,
  onCancel,
}: {
  state: TransitionState;
  onComplete: () => void;
  onCancel: () => void;
}) {
  // start = 卡片大小; expanded = 全屏; collapsing = 取消回缩
  const [phase, setPhase] = useState<"start" | "expanded" | "collapsing">("start");

  useEffect(() => {
    if (!state) {
      setPhase("start");
      return;
    }
    setPhase("start");
    let raf2 = 0;
    let cancelled = false;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (!cancelled) setPhase("expanded");
      });
    });
    const completeTimer = setTimeout(() => {
      if (!cancelled) onComplete();
    }, COMPLETE_AT);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelled = true;
        clearTimeout(completeTimer);
        setPhase("collapsing");
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(completeTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [state, onComplete]);

  // 回缩动画结束 → 通知父级清理
  useEffect(() => {
    if (phase !== "collapsing") return;
    const t = setTimeout(() => onCancel(), DURATION + 40);
    return () => clearTimeout(t);
  }, [phase, onCancel]);

  if (!state) return null;
  const { rect } = state;
  const atRect = phase === "start" || phase === "collapsing";
  const style = atRect
    ? {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 16,
      }
    : { top: 0, left: 0, width: "100vw", height: "100dvh", borderRadius: 0 };

  const handleBackdropClick = () => {
    if (phase === "expanded") setPhase("collapsing");
  };

  return (
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      {/* 背景遮罩 — 点击取消 */}
      <button
        type="button"
        aria-label="取消进入"
        onClick={handleBackdropClick}
        className="absolute inset-0 bg-background/40 backdrop-blur-sm transition-opacity duration-500 cursor-default"
        style={{ opacity: phase === "expanded" ? 1 : 0 }}
        tabIndex={-1}
      />
      {/* 主过渡层 */}
      <div
        className="absolute overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] pointer-events-none"
        style={{
          ...style,
          transition: `top ${DURATION}ms cubic-bezier(.22,.9,.32,1), left ${DURATION}ms cubic-bezier(.22,.9,.32,1), width ${DURATION}ms cubic-bezier(.22,.9,.32,1), height ${DURATION}ms cubic-bezier(.22,.9,.32,1), border-radius ${DURATION}ms cubic-bezier(.22,.9,.32,1)`,
          background: "var(--bg-page)",
          willChange: "top,left,width,height,border-radius",
        }}
      >
        {/* 底层图片 */}
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
        {/* 中央 loading 标识 */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          style={{ opacity: phase === "expanded" ? 0 : 1 }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-md text-white text-body-sm border border-white/40">
            <Spinner />
            进入 {state.title}
          </div>
        </div>
        {/* 骨架屏 */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: phase === "expanded" ? 1 : 0,
            transitionDelay: phase === "expanded" ? "150ms" : "0ms",
          }}
        >
          {state.variant === "pc" ? <PcSkeleton /> : <MobileSkeleton />}
        </div>
      </div>

      {/* 取消提示（仅扩张时显示） */}
      <div
        className="absolute top-4 right-4 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: phase === "expanded" ? 1 : 0 }}
      >
        <span className="px-3 py-1 rounded-full text-caption bg-black/40 backdrop-blur-md text-white border border-white/20">
          按 Esc 或点击空白处取消
        </span>
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
      <aside className="w-60 shrink-0 border-r border-border bg-card p-4 space-y-3">
        <Bar className="h-8 w-32" />
        <div className="pt-3 space-y-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Bar key={i} className="h-8 w-full" />
          ))}
        </div>
      </aside>
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
        <div className="h-16 border-t border-border bg-card grid grid-cols-4 gap-4 px-6 items-center">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bar key={i} className="h-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
