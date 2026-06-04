import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, ScanLine, AlertCircle, RefreshCw, Home, Beef, Search } from "lucide-react";

export const Route = createFileRoute("/m/scan")({
  head: () => ({ meta: [{ title: "扫码 · 奇点智牧" }] }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;
    const t = setTimeout(() => setScanning(false), 2000);
    return () => clearTimeout(t);
  }, [scanning]);

  return (
    <div className="m-scope fixed inset-0 z-50 bg-black text-white flex flex-col">
      {/* 顶部 */}
      <header className="h-12 px-4 flex items-center gap-2 text-white/90">
        <button
          onClick={() => navigate({ to: "/m/homepage" })}
          className="-ml-1 h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/10"
        >
          <X className="h-4 w-4" />
        </button>
        <h1 className="flex-1 text-center text-card-title">扫码</h1>
        <span className="w-8" />
      </header>

      {/* 取景框 */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="relative h-64 w-64 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 border-2 border-white/40 rounded-2xl" />
          {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map(
            (p, i) => (
              <span
                key={i}
                className={`absolute ${p} h-6 w-6 border-primary`}
                style={{
                  borderTopWidth: p.includes("top") ? 3 : 0,
                  borderBottomWidth: p.includes("bottom") ? 3 : 0,
                  borderLeftWidth: p.includes("left") ? 3 : 0,
                  borderRightWidth: p.includes("right") ? 3 : 0,
                }}
              />
            )
          )}
          {scanning && (
            <span className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_12px_var(--primary)] animate-[scan_1.6s_linear_infinite]" />
          )}
        </div>
        <p className="absolute bottom-10 left-0 right-0 text-center text-body-sm text-white/70 inline-flex items-center justify-center gap-1.5">
          <ScanLine className="h-3.5 w-3.5" /> 对准牛舍码 / 耳标条码
        </p>
        <style>{`@keyframes scan{0%{top:0}50%{top:calc(100% - 2px)}100%{top:0}}`}</style>
      </div>

      {/* Demo 情景模拟（仅演示用） */}
      {scanning && (
        <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="text-caption text-white/50 text-center mb-2">
            演示 · 模拟识别成功场景
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                navigate({ to: "/m/barns/$id", params: { id: "B003" } })
              }
              className="h-12 rounded-lg bg-white/10 hover:bg-white/15 text-white text-body-sm inline-flex items-center justify-center gap-1.5"
            >
              <Home className="h-4 w-4" /> 模拟扫到牛舍
            </button>
            <button
              onClick={() =>
                navigate({ to: "/m/animals-{$id}", params: { id: "A2381" } })

              }
              className="h-12 rounded-lg bg-white/10 hover:bg-white/15 text-white text-body-sm inline-flex items-center justify-center gap-1.5"
            >
              <Beef className="h-4 w-4" /> 模拟扫到耳标
            </button>
          </div>
        </div>
      )}

      {/* 扫码失败提醒 */}
      {!scanning && (
        <div className="absolute inset-0 z-10 bg-black/55 flex items-end justify-center">
          <div className="w-full max-w-[440px] rounded-t-2xl bg-card text-foreground shadow-xl pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <div className="px-6 pt-7 pb-2 flex flex-col items-center text-center">
              <span className="h-12 w-12 rounded-full bg-[var(--state-warning)]/15 text-[var(--state-warning)] inline-flex items-center justify-center mb-3">
                <AlertCircle className="h-6 w-6" />
              </span>
              <div className="text-section-title">未识别到有效码</div>
              <p className="text-body-sm text-text-tertiary leading-relaxed mt-2">
                可手动输入牛只编号或牛舍编号快速查询
              </p>
            </div>
            <div className="px-4 pt-4 flex gap-3">
              <button
                onClick={() => setScanning(true)}
                className="flex-1 h-12 rounded-xl bg-surface-subtle text-body text-text-secondary inline-flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" /> 重新扫描
              </button>
              <button
                onClick={() => navigate({ to: "/m/search" })}
                className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
              >
                <Search className="h-4 w-4" /> 搜索查询
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
