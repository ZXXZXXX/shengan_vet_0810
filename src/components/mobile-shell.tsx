import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, ClipboardList, Beef, User, ScanLine, X, Barcode, ClipboardPlus } from "lucide-react";
import { ReactNode, useState } from "react";

const tabs = [
  { to: "/m", label: "工作台", icon: Home, exact: true },
  { to: "/m/health", label: "任务", icon: ClipboardList },
  { to: "/m/animals", label: "档案", icon: Beef },
  { to: "/m/me", label: "我的", icon: User },
];

export function MobileShell({
  title,
  children,
  hideTabBar,
  back,
  right,
}: {
  title?: string;
  children: ReactNode;
  hideTabBar?: boolean;
  back?: { to: string; label?: string } | true;
  right?: ReactNode;
}) {
  const { pathname } = useLocation();
  // 登录页不显示扫码按钮
  const showScan = pathname !== "/m/login";
  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col bg-[var(--bg-page)] relative">
        {title && (
          <MobileTopBar title={title} back={back} right={right} />
        )}
        <main className={`flex-1 ${hideTabBar ? "" : "pb-20"}`}>{children}</main>
        {showScan && <ScanFab hasTabBar={!hideTabBar} />}
        {!hideTabBar && <MobileTabBar />}
      </div>
    </div>
  );
}

function MobileTopBar({
  title,
  back,
  right,
}: {
  title: string;
  back?: { to: string; label?: string } | true;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
      <div className="h-12 px-4 flex items-center gap-2">
        {back ? (
          <Link
            to={typeof back === "object" ? back.to : "/m"}
            className="-ml-1 h-8 px-2 inline-flex items-center text-body-sm text-text-secondary hover:text-primary"
          >
            ‹ 返回
          </Link>
        ) : (
          <span className="w-12" />
        )}
        <h1 className="flex-1 text-center text-card-title text-foreground truncate">
          {title}
        </h1>
        <div className="w-12 flex justify-end items-center">{right}</div>
      </div>
    </header>
  );
}

function MobileTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((t) => {
          const active = t.exact
            ? pathname === t.to || pathname === "/m/"
            : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-primary" : "text-text-tertiary"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
              <span className="text-[11px] leading-none">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * 全局扫码入口：固定在右下角，巡检中随时扫牛舍码/牛耳码查看基础信息并上报异常。
 * mock：扫码动作直接路由到示例对象。
 */
function ScanFab({ hasTabBar }: { hasTabBar: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const go = (path: { type: "barn" | "ear" | "report" }) => {
    close();
    if (path.type === "barn") navigate({ to: "/m/barns/$id", params: { id: "B-003" } });
    else if (path.type === "ear") navigate({ to: "/m/animals/$id", params: { id: "A2381" } });
    else navigate({ to: "/m/report" });
  };

  // FAB 距底距离：有底部 tab 时让出 64px + safe-area；否则只让 safe-area
  const fabBottom = hasTabBar
    ? "bottom-[calc(env(safe-area-inset-bottom)+72px)]"
    : "bottom-[calc(env(safe-area-inset-bottom)+76px)]";

  return (
    <>
      <button
        type="button"
        aria-label="扫码"
        onClick={() => setOpen(true)}
        className={`fixed right-4 ${fabBottom} z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform`}
      >
        <ScanLine className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={close}
          />
          <div className="relative w-full max-w-[440px] bg-card rounded-t-2xl border-t border-border pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-200">
            <div className="px-4 pt-3 pb-2 flex items-center">
              <div className="text-card-title text-foreground">扫码</div>
              <span className="ml-2 text-caption text-text-tertiary">
                巡检中随时查看与上报
              </span>
              <button
                onClick={close}
                aria-label="关闭"
                className="ml-auto h-8 w-8 rounded-full bg-surface-subtle text-text-tertiary inline-flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 模拟摄像头取景框 */}
            <div className="mx-4 mt-2 aspect-[16/9] rounded-xl bg-foreground/90 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-6 border-2 border-primary/80 rounded-lg" />
              <div className="absolute left-6 right-6 h-0.5 bg-primary animate-pulse top-1/2" />
              <span className="relative text-caption text-white/80">将二维码 / 耳标对准框内</span>
            </div>

            {/* 快捷动作 */}
            <div className="p-4 grid grid-cols-3 gap-2">
              <SheetAction
                icon={Barcode}
                label="扫牛舍码"
                onClick={() => go({ type: "barn" })}
              />
              <SheetAction
                icon={ScanLine}
                label="扫牛耳码"
                onClick={() => go({ type: "ear" })}
              />
              <SheetAction
                icon={ClipboardPlus}
                label="健康上报"
                tone="ghost"
                onClick={() => go({ type: "report" })}
              />
            </div>
            <div className="px-4 pb-4 text-caption text-text-tertiary text-center">
              扫码后将进入对应详情页,可查看基础信息、执行工单或上报异常
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SheetAction({
  icon: Icon,
  label,
  onClick,
  tone = "brand",
}: {
  icon: typeof ScanLine;
  label: string;
  onClick: () => void;
  tone?: "brand" | "ghost";
}) {
  const brand =
    tone === "brand"
      ? "bg-brand-subtle text-primary border-primary/20"
      : "bg-surface-subtle text-text-secondary border-border";
  return (
    <button
      onClick={onClick}
      className={`h-20 rounded-xl border ${brand} flex flex-col items-center justify-center gap-1.5 active:opacity-80`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-body-sm">{label}</span>
    </button>
  );
}
