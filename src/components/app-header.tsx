import { useState, useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  Users,
  Briefcase,
  LogOut,
  Check,
  ChevronDown,
  PanelLeft,
  Search,
  Sun,
  Moon,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FARMS, useFarm, setFarmId } from "@/lib/farm-store";
import { useSidebar } from "@/components/ui/sidebar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppHeaderProps {
  title: string;
  breadcrumb?: string[];
}

const currentUser = {
  name: "张磊",
  initial: "ZL",
  role: "牧场管理员",
  team: "兽医部 · 巡检 A 组",
};

export function AppHeader({ title, breadcrumb }: AppHeaderProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [farmOpen, setFarmOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const currentFarm = useFarm();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showFarmSwitcher = pathname === "/" || pathname.startsWith("/production");
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Build breadcrumb: 控制台 / ...rest / title
  const crumbs: string[] = ["控制台"];
  if (breadcrumb && breadcrumb.length > 0) {
    breadcrumb.forEach((c) => {
      if (!crumbs.includes(c)) crumbs.push(c);
    });
  }
  if (title && crumbs[crumbs.length - 1] !== title) crumbs.push(title);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="flex h-14 items-center gap-3 px-4">
        <button
          onClick={toggleSidebar}
          className="h-9 w-9 inline-flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle hover:text-foreground transition-colors shrink-0"
          aria-label="切换侧边栏"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <nav className="text-body-sm flex items-center gap-1.5 shrink-0">
          {crumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-text-tertiary/60">/</span>}
              <span className={i === crumbs.length - 1 ? "text-foreground font-medium" : "text-text-tertiary"}>{b}</span>
            </span>
          ))}
        </nav>

        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              placeholder="搜索牛只编号、栏舍、设备…"
              className="w-full h-9 pl-9 pr-14 rounded-md border border-border bg-surface-subtle/60 text-body-sm text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-card transition-colors"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center h-5 px-1.5 rounded border border-border bg-card text-caption text-text-tertiary font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {showFarmSwitcher && (
            <Popover open={farmOpen} onOpenChange={setFarmOpen}>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card hover:bg-surface-subtle transition-colors">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-body-sm text-foreground font-medium">{currentFarm.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0 border-border">
                <div className="px-3 py-2 border-b border-border">
                  <div className="text-caption text-text-tertiary">切换牧场视角 · 仅影响当前模块的数据范围</div>
                </div>
                <div className="p-1 max-h-80 overflow-auto">
                  {FARMS.map((f) => {
                    const active = f.id === currentFarm.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => { setFarmId(f.id); setFarmOpen(false); }}
                        className={`w-full flex items-start gap-2 px-2 py-2 rounded-md text-left hover:bg-surface-subtle transition-colors ${active ? "bg-brand-subtle" : ""}`}
                      >
                        <div className="flex-1 min-w-0 leading-tight">
                          <div className={`text-body-sm ${active ? "text-primary font-medium" : "text-foreground"}`}>{f.name}</div>
                          <div className="text-caption text-text-tertiary mt-0.5 truncate">{f.region} · {f.scale}</div>
                        </div>
                        {active && <Check className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <button className="relative h-9 w-9 inline-flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </button>

          <button
            onClick={() => setDark((v) => !v)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle hover:text-foreground transition-colors"
            aria-label="切换主题"
          >
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-2 h-9 pl-1 pr-2 rounded-md hover:bg-surface-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-brand-subtle text-primary text-caption font-medium">
                    {currentUser.initial}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight text-left hidden md:block">
                  <div className="text-body-sm text-foreground font-medium">{currentUser.name}</div>
                  <div className="text-caption text-text-tertiary">{currentUser.role}</div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0 border-border">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-brand-subtle text-primary text-body font-medium">
                    {currentUser.initial}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight min-w-0">
                  <div className="text-body text-foreground font-medium truncate">{currentUser.name}</div>
                  <div className="text-caption text-text-tertiary">当前账号</div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Users className="h-3.5 w-3.5 text-text-tertiary mt-0.5 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-caption text-text-tertiary">角色</div>
                    <div className="text-body-sm text-foreground">{currentUser.role}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Briefcase className="h-3.5 w-3.5 text-text-tertiary mt-0.5 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-caption text-text-tertiary">所属班组</div>
                    <div className="text-body-sm text-foreground">{currentUser.team}</div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <button
            onClick={() => setConfirmOpen(true)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle hover:text-foreground transition-colors"
            aria-label="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后将返回登录页面，未保存的内容可能会丢失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
              onClick={() => {
                setConfirmOpen(false);
                navigate({ to: "/login" });
              }}
            >
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preserve title prop reference to avoid unused warning */}
      <span className="hidden" aria-hidden>{title}</span>
    </header>
  );
}
