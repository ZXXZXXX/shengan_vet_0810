import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Boxes,
  Warehouse,
  Settings,
  PanelLeft,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children?: { title: string; url: string }[];
};

const items: NavItem[] = [
  { title: "首页总览", url: "/", icon: LayoutDashboard },
  {
    title: "生产对象",
    url: "/production",
    icon: Boxes,
    children: [
      { title: "对象档案", url: "/production" },
      { title: "健康防护", url: "/production/health" },
    ],
  },
  {
    title: "仓库管理",
    url: "/warehouse",
    icon: Warehouse,
    children: [
      { title: "库存管理", url: "/warehouse" },
      { title: "调拨申请", url: "/warehouse/transfer" },
    ],
  },
  {
    title: "组织管理",
    url: "/organization",
    icon: Users,
    children: [
      { title: "组织管理", url: "/organization" },
      { title: "角色权限", url: "/organization/role" },
      { title: "分组作业", url: "/organization/team" },
    ],
  },
  {
    title: "配置中心",
    url: "/settings",
    icon: Settings,
    children: [
      { title: "工单配置", url: "/settings" },
      { title: "规则配置", url: "/settings/rules" },
      { title: "知识库", url: "/settings/knowledge" },
    ],
  },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string) =>
    path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  // Auto-expand active group
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    items.forEach((i) => {
      if (i.children && isActive(i.url)) init[i.title] = true;
    });
    return init;
  });

  const toggle = (title: string) =>
    setExpanded((p) => ({ ...p, [title]: !p[title] }));

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
            <SidebarMenu className="gap-0.5">
              {items.map((item) => {
                const active = isActive(item.url);
                const open = expanded[item.title] ?? active;
                const hasChildren = !!item.children?.length;
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
                      <Link
                        to={item.url}
                        className="flex items-center gap-3"
                        onClick={(e) => {
                          if (hasChildren && !collapsed && active) {
                            e.preventDefault();
                            toggle(item.title);
                          } else if (hasChildren && !collapsed) {
                            setExpanded((p) => ({ ...p, [item.title]: true }));
                          }
                        }}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {hasChildren && (
                              <ChevronRight
                                className={`h-3.5 w-3.5 text-text-tertiary transition-transform ${open ? "rotate-90" : ""}`}
                              />
                            )}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>

                    {hasChildren && !collapsed && open && (
                      <ul className="mt-0.5 mb-1 ml-[26px] border-l border-border pl-2 space-y-0.5">
                        {item.children!.map((c) => {
                          const childActive = currentPath === c.url;
                          return (
                            <li key={c.title}>
                              <Link
                                to={c.url}
                                className={`flex items-center h-8 px-2.5 rounded-md text-body-sm transition-colors ${
                                  childActive
                                    ? "bg-brand-subtle text-primary font-medium"
                                    : "text-text-secondary hover:bg-[var(--sidebar-hover)] hover:text-foreground"
                                }`}
                              >
                                {c.title}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
