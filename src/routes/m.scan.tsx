import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Beef, ClipboardPlus, ScanLine, X } from "lucide-react";

export const Route = createFileRoute("/m/scan")({
  head: () => ({ meta: [{ title: "扫码 · 奇点智牧" }] }),
  component: ScanPage,
});

// 模拟扫码：约 1.6s 后自动识别一个示例码
function ScanPage() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;
    const t = setTimeout(() => setScanning(false), 1600);
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
          {/* 四角 */}
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
          {/* 扫描线 */}
          {scanning && (
            <span className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_12px_var(--primary)] animate-[scan_1.6s_linear_infinite]" />
          )}
        </div>
        <p className="absolute bottom-8 left-0 right-0 text-center text-body-sm text-white/70">
          {scanning ? "对准牛舍码 / 耳标条码" : "未识别到有效编码,请选择下方手动入口"}
        </p>
        <style>{`@keyframes scan{0%{top:0}50%{top:calc(100% - 2px)}100%{top:0}}`}</style>
      </div>

      {/* 手动入口 */}
      <section className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 space-y-2">
        <div className="text-caption text-white/60 px-1 mb-1">手动入口（演示）</div>
        <ManualEntry
          icon={Home}
          title="模拟扫牛舍码"
          sub="跳转牛舍 B003 · 3 号牛舍"
          to="/m/barns/$id"
          params={{ id: "B003" }}
        />
        <ManualEntry
          icon={Beef}
          title="模拟扫牛耳码"
          sub="跳转牛只 #A2381"
          to="/m/animals/$id"
          params={{ id: "A2381" }}
        />
        <ManualEntry
          icon={ClipboardPlus}
          title="直接异常上报"
          sub="未识别码时,进入上报页手动填写"
          to="/m/report"
        />
      </section>
    </div>
  );
}

function ManualEntry({
  icon: Icon,
  title,
  sub,
  to,
  params,
}: {
  icon: typeof Home;
  title: string;
  sub: string;
  to: string;
  params?: Record<string, string>;
}) {
  return (
    <Link
      to={to as never}
      params={params as never}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/8 hover:bg-white/12 active:bg-white/15"
    >
      <span className="h-10 w-10 rounded-lg bg-primary/20 text-primary inline-flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-body text-white">{title}</div>
        <div className="text-caption text-white/60 mt-0.5 truncate">{sub}</div>
      </div>
      <ScanLine className="h-4 w-4 text-white/40" />
    </Link>
  );
}
