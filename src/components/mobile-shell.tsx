import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, ClipboardList, Bell, User, Search } from "lucide-react";
import { ReactNode } from "react";
import { useUnreadCount } from "@/lib/notify-store";

const leftTabs = [
  { to: "/m/homepage", label: "首页", icon: Home, exact: true },
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
  headerTone,
  headerExtra,
}: {
  title?: ReactNode;
  children: ReactNode;
  hideTabBar?: boolean;
  back?: { to: string; label?: string; search?: Record<string, string> } | true;
  right?: ReactNode;
  headerTone?: "brand";
  headerExtra?: ReactNode;
}) {
  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col bg-[var(--bg-page)] relative">
        {(title || back || right || headerExtra) && (
          <MobileTopBar title={title ?? ""} back={back} right={right} tone={headerTone} extra={headerExtra} />

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
  tone,
  extra,
}: {
  title: ReactNode;
  back?: { to: string; label?: string; search?: Record<string, string> } | true;
  right?: ReactNode;
  tone?: "brand";
  extra?: ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const goParent = () => {
    if (typeof back === "object" && back?.to) {
      navigate({ to: back.to, search: back.search });
      return;
    }
    const knownParents = new Set([
      "/m/homepage",
      "/m/health",
      "/m/me",
      "/m/notifications",
    ]);
    const segments = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    if (segments.length <= 1) {
      navigate({ to: "/m" });
      return;
    }
    const parent = "/" + segments.slice(0, -1).join("/");
    if (parent === "/m" || (parent.startsWith("/m/") && !knownParents.has(parent))) {
      navigate({ to: "/m/homepage" });
      return;
    }
    navigate({ to: parent || "/m/homepage" });
  };
  const brand = tone === "brand";
  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur ${
        brand
          ? "bg-primary text-primary-foreground border-b border-transparent"
          : "bg-card/95 border-b border-border"
      }`}
    >
      <div className="h-12 px-4 flex items-center gap-2">
        {back ? (
          <button
            onClick={goParent}
            className={`-ml-1 h-8 px-2 inline-flex items-center text-body-sm ${
              brand ? "text-primary-foreground/90 hover:text-primary-foreground" : "text-text-secondary hover:text-primary"
            }`}
          >
            ‹ 返回
          </button>
        ) : (
          <span className="w-12" />
        )}
        <h1 className={`flex-1 text-center text-card-title truncate ${brand ? "text-primary-foreground" : "text-foreground"}`}>
          {title}
        </h1>
        <div className="w-12 flex justify-end items-center">{right}</div>
      </div>
      {extra && <div className="px-4 pb-3">{extra}</div>}
    </header>
  );
}

export function MobileTabBar() {
  const { pathname } = useLocation();
  const unread = useUnreadCount();
  const renderTab = (t: (typeof leftTabs)[number]) => {
    const active = t.exact
      ? pathname === t.to || pathname === "/m/"
      : pathname.startsWith(t.to);
    const Icon = t.icon;
    const showBadge = t.to === "/m/notifications" && unread > 0;
    return (
      <Link
        key={t.to}
        to={t.to}
        className={`flex flex-col items-center justify-center gap-1 transition-colors ${
          active ? "text-primary" : "text-text-tertiary"
        }`}
      >
        <span className="relative inline-flex">
          <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.6} />
          {showBadge && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#F15454] text-white text-[10px] leading-4 font-medium text-center ring-2 ring-card">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
        <span className="text-caption leading-none">{t.label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16 relative">
        {leftTabs.map(renderTab)}
        {/* 中央搜索按钮 */}
        <div className="flex items-start justify-center relative">
          {/* 柔和漫射光晕阴影 */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-8 h-10 w-24 rounded-[50%] blur-2xl opacity-70"
            style={{ background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--primary) 55%, transparent) 0%, transparent 70%)" }}
          />
          <Link
            to="/m/search"
            aria-label="搜索档案"
            className="relative -mt-5 h-14 w-14 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center ring-4 ring-card active:scale-95 transition-transform"
          >
            <Search className="h-6 w-6" strokeWidth={2} />
          </Link>
        </div>


        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}
