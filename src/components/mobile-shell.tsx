import { Link, useLocation } from "@tanstack/react-router";
import { Home, ClipboardList, Bell, User, ScanLine } from "lucide-react";
import { ReactNode } from "react";

const leftTabs = [
  { to: "/m", label: "首页", icon: Home, exact: true },
  { to: "/m/health", label: "工单", icon: ClipboardList },
];
const rightTabs = [
  { to: "/m/notifications", label: "消息", icon: Bell },
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
  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col bg-[var(--bg-page)] relative">
        {title && (
          <MobileTopBar title={title} back={back} right={right} />
        )}
        <main className={`flex-1 ${hideTabBar ? "" : "pb-20"}`}>{children}</main>
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
          <button
            onClick={() => window.history.back()}
            className="-ml-1 h-8 px-2 inline-flex items-center text-body-sm text-text-secondary hover:text-primary"
          >
            ‹ 返回
          </button>
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
  const renderTab = (t: (typeof leftTabs)[number]) => {
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
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16 relative">
        {leftTabs.map(renderTab)}
        {/* 中央扫码按钮 */}
        <div className="flex items-start justify-center">
          <Link
            to="/m/scan"
            aria-label="扫码"
            className="-mt-5 h-14 w-14 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shadow-[0_8px_20px_-6px_color-mix(in_oklab,var(--primary)_55%,transparent)] ring-4 ring-card active:scale-95 transition-transform"
          >
            <ScanLine className="h-6 w-6" strokeWidth={2} />
          </Link>
        </div>
        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}


const leftTabs = [
  { to: "/m", label: "首页", icon: Home, exact: true },
  { to: "/m/health", label: "工单", icon: ClipboardList },
];
const rightTabs = [
  { to: "/m/notifications", label: "消息", icon: Bell },
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
  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col bg-[var(--bg-page)] relative">
        {title && (
          <MobileTopBar title={title} back={back} right={right} />
        )}
        <main className={`flex-1 ${hideTabBar ? "" : "pb-20"}`}>{children}</main>
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
  const renderTab = (t: (typeof leftTabs)[number]) => {
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
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16 relative">
        {leftTabs.map(renderTab)}
        {/* 中央扫码按钮 */}
        <div className="flex items-start justify-center">
          <Link
            to="/m/scan"
            aria-label="扫码"
            className="-mt-5 h-14 w-14 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shadow-[0_8px_20px_-6px_color-mix(in_oklab,var(--primary)_55%,transparent)] ring-4 ring-card active:scale-95 transition-transform"
          >
            <ScanLine className="h-6 w-6" strokeWidth={2} />
          </Link>
        </div>
        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}
