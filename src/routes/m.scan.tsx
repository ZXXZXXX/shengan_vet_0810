import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, ScanLine, AlertCircle, ClipboardPlus, RefreshCw, Home, Beef } from "lucide-react";

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
          onClick={() => navigate({ to: "/m" })}
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

      {/* 扫码失败提醒 */}
      {!scanning && (
        <div className="absolute inset-0 z-10 bg-black/55 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-[420px] m-3 rounded-2xl bg-card text-foreground p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-9 w-9 rounded-full bg-[var(--state-warning)]/15 text-[var(--state-warning)] inline-flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div className="text-card-title">未识别到有效码</div>
            </div>
            <p className="text-body-sm text-text-secondary leading-relaxed mb-4">
              请确认条码清晰且在框内。是否直接进入异常上报?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setScanning(true)}
                className="flex-1 h-11 rounded-lg border border-border text-body-sm text-text-secondary inline-flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" /> 重新扫描
              </button>
              <button
                onClick={() => navigate({ to: "/m/report" })}
                className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body-sm inline-flex items-center justify-center gap-1.5"
              >
                <ClipboardPlus className="h-4 w-4" /> 直接上报
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
