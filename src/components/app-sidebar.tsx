import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Boxes,
  Warehouse,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type LeafItem = { title: string; url: string };
type NavGroup = {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  // 单入口分组：直接作为可点击的二级入口（无子项）
  url?: string;
  children?: LeafItem[];
};

const groups: NavGroup[] = [
  {
    title: "首页总览",
    icon: LayoutDashboard,
    children: [{ title: "运营看板", url: "/" }],
  },
  {
    title: "生产对象",
    icon: Boxes,
    children: [
      { title: "对象档案", url: "/production" },
      { title: "健康防护", url: "/production/health" },
    ],
  },
  {
    title: "仓库管理",
    icon: Warehouse,
    children: [
      { title: "库存管理", url: "/warehouse" },
      { title: "调拨申请", url: "/warehouse/transfer" },
    ],
  },
  {
    title: "组织管理",
    icon: Users,
    children: [
      { title: "组织管理", url: "/organization" },
      { title: "角色权限", url: "/organization/role" },
      { title: "分组作业", url: "/organization/team" },
    ],
  },
  {
    title: "配置中心",
    icon: Settings,
    children: [
      { title: "工单配置", url: "/settings" },
      { title: "规则配置", url: "/settings/rules" },
      { title: "知识库", url: "/settings/knowledge" },
    ],
  },
];

export function AppSidebar() {
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  // 二级菜单严格匹配，避免一级被"自动选中"
  const isLeafActive = (url: string) =>
    url === "/" ? currentPath === "/" : currentPath === url;

  return (
    <Sidebar collapsible="none" className="border-r border-border bg-card">
      {/* 顶部品牌区（顶部分割线由 border-b 提供） */}
      <SidebarHeader className="border-b border-border bg-card">
        <div className="flex items-center px-2 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-subtle">
              <span className="text-card-title text-primary font-semibold leading-none">奇</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-card-title font-medium text-foreground leading-tight">奇点</span>
              <span className="text-caption text-text-tertiary leading-tight">智牧管理系统</span>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      {/* 中部导航 */}
      <SidebarContent className="bg-card pt-2">
        {groups.map((group) => {
          const hasChildren = !!group.children?.length;

          // 收起态：只显示一级 icon（用作纯视觉锚点 / tooltip）
          if (collapsed) {
            return (
              <SidebarGroup key={group.title} className="px-2">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    <SidebarMenuItem>
                      {hasChildren ? (
                        <SidebarMenuButton
                          tooltip={group.title}
                          className="h-10 rounded-md px-3 text-text-tertiary hover:bg-[var(--sidebar-hover)] hover:text-foreground cursor-default"
                        >
                          <group.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                        </SidebarMenuButton>
                      ) : (
                        <SidebarMenuButton
                          asChild
                          tooltip={group.title}
                          isActive={isLeafActive(group.url!)}
                          className="h-10 rounded-md px-3 text-body transition-colors
                            hover:bg-[var(--sidebar-hover)] hover:text-foreground
                            data-[active=true]:bg-brand-subtle data-[active=true]:text-primary data-[active=true]:font-medium"
                        >
                          <Link to={group.url!} className="flex items-center gap-3">
                            <group.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          // 展开态：单入口分组直接作为二级入口
          if (!hasChildren) {
            const active = isLeafActive(group.url!);
            return (
              <SidebarGroup key={group.title} className="px-2">
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`relative h-10 rounded-md px-3 text-body transition-colors
                          hover:bg-[var(--sidebar-hover)] hover:text-foreground
                          data-[active=true]:bg-brand-subtle data-[active=true]:text-primary data-[active=true]:font-medium
                          data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1.5 data-[active=true]:before:bottom-1.5 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary`}
                      >
                        <Link to={group.url!} className="flex items-center gap-3">
                          <group.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                          <span className="flex-1">{group.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          // 展开态：多子项分组——一级仅作分组标题，不可点击、不跳转
          return (
            <SidebarGroup key={group.title} className="px-2">
              <SidebarGroupLabel className="h-8 px-3 text-caption text-text-tertiary font-normal flex items-center gap-2">
                <group.icon className="h-[14px] w-[14px] shrink-0 text-text-tertiary" strokeWidth={1.75} />
                <span>{group.title}</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.children!.map((c) => {
                    const active = isLeafActive(c.url);
                    return (
                      <SidebarMenuItem key={c.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={`relative h-9 rounded-md pl-9 pr-3 text-body-sm transition-colors
                            text-text-secondary
                            hover:bg-[var(--sidebar-hover)] hover:text-foreground
                            data-[active=true]:bg-brand-subtle data-[active=true]:text-primary data-[active=true]:font-medium
                            data-[active=true]:before:absolute data-[active=true]:before:left-0 data-[active=true]:before:top-1.5 data-[active=true]:before:bottom-1.5 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-r-full data-[active=true]:before:bg-primary`}
                        >
                          <Link to={c.url}>{c.title}</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
