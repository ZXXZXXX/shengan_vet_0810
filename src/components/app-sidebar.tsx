import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Boxes,
  Warehouse,
  Settings,
  PanelLeft,
  LogOut,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "首页总览", url: "/", icon: LayoutDashboard },
  { title: "组织与人员", url: "/organization", icon: Users },
  { title: "生产对象", url: "/production", icon: Boxes },
  { title: "仓库管理", url: "/warehouse", icon: Warehouse },
  { title: "配置中心", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-2 py-3">
          {!collapsed ? (
            <>
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-subtle">
                  <span className="text-card-title text-primary font-semibold leading-none">奇</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-card-title font-medium text-foreground leading-tight">奇点</span>
                  <span className="text-caption text-text-tertiary leading-tight">智牧管理系统</span>
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-text-tertiary hover:bg-surface-subtle hover:text-foreground transition-colors"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-brand-subtle text-primary font-semibold"
            >
              奇
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-card pt-2">
        <SidebarGroup className="px-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={collapsed ? item.title : undefined}
                      className={`relative h-10 rounded-md px-3 text-body transition-colors
                        hover:bg-[var(--sidebar-hover)] hover:text-foreground
                        data-[active=true]:bg-brand-subtle data-[active=true]:text-primary data-[active=true]:font-medium
                        data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1.5 data-[active=true]:before:bottom-1.5 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary`}
                      isActive={active}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-card p-2">
        {collapsed ? (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-surface-subtle">
            <User className="h-4 w-4 text-text-secondary" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-7 w-7 rounded-md bg-surface-subtle flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-text-secondary" />
            </div>
            <span className="text-body-sm text-foreground flex-1">管理员</span>
            <button className="h-7 w-7 inline-flex items-center justify-center rounded-md text-text-tertiary hover:bg-surface-subtle hover:text-foreground transition-colors">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
