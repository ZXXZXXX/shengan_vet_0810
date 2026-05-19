import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  ShieldCheck,
  Briefcase,
  Stethoscope,
  HeartPulse,
  Search,
  Save,
  Monitor,
  Smartphone,
  MoreVertical,
  Users,
  Power,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organization/role")({
  head: () => ({ meta: [{ title: "角色权限 — 奇点智牧" }] }),
  component: RolePage,
});

type Platform = "pc" | "mini";
type RoleKey = "admin" | "manager" | "vet" | "assistant";

type Role = {
  key: RoleKey;
  name: string;
  count: number;
  scope: string;
  desc: string;
  enabled: boolean;
  icon: typeof ShieldCheck;
};

const initialRoles: Role[] = [
  { key: "admin", name: "超级管理员", count: 2, scope: "全平台", desc: "拥有系统全部权限，可管理租户、角色与所有业务数据。", enabled: true, icon: ShieldCheck },
  { key: "manager", name: "场长", count: 3, scope: "本牧场全部", desc: "负责牧场日常运营管理，拥有除组织权限外的所有业务功能。", enabled: true, icon: Briefcase },
  { key: "vet", name: "兽医", count: 8, scope: "健康相关数据", desc: "负责诊疗与健康管理，可处理疾病、疫苗、工单等业务。", enabled: true, icon: Stethoscope },
  { key: "assistant", name: "兽医助理", count: 6, scope: "健康执行 / 录入", desc: "协助兽医完成日常工单录入与执行，部分功能仅查看权限。", enabled: false, icon: HeartPulse },
];

type Feature = { key: string; name: string };
type FeatureGroup = { group: string; items: Feature[] };

const pcFeatures: FeatureGroup[] = [
  { group: "首页总览", items: [{ key: "dashboard", name: "运营看板" }] },
  { group: "基础档案", items: [
    { key: "farm", name: "牛场信息" },
    { key: "barn", name: "牛舍信息" },
    { key: "cattle", name: "牛只信息" },
  ] },
  { group: "健康管理", items: [
    { key: "disease", name: "疾病治疗" },
    { key: "vaccine", name: "疫苗免疫" },
    { key: "postpartum", name: "产后护理" },
    { key: "hoof", name: "修蹄工单" },
    { key: "drying", name: "干奶工单" },
    { key: "deworm", name: "驱虫工单" },
    { key: "general", name: "普修工单" },
  ] },
  { group: "药品管理", items: [
    { key: "drug", name: "药品档案" },
    { key: "stock", name: "药品库存" },
    { key: "transfer", name: "调拨转库" },
    { key: "dispense", name: "取药记录" },
    { key: "loss", name: "损耗管理" },
  ] },
  { group: "诊疗知识库", items: [
    { key: "k-disease", name: "疾病知识库" },
    { key: "k-symptom", name: "症状知识库" },
    { key: "k-prescription", name: "处方管理" },
  ] },
  { group: "组织管理", items: [
    { key: "account", name: "账号管理" },
    { key: "role", name: "角色管理" },
    { key: "tenant", name: "租户管理" },
  ] },
];

const miniFeatures: FeatureGroup[] = [
  { group: "工作台", items: [
    { key: "m-workspace", name: "工作台首页" },
    { key: "m-todo", name: "待办工单" },
  ] },
  { group: "牛只", items: [
    { key: "m-animals", name: "牛只列表" },
    { key: "m-animal-detail", name: "牛只档案" },
  ] },
  { group: "健康", items: [
    { key: "m-health", name: "健康事件列表" },
    { key: "m-health-detail", name: "事件详情" },
    { key: "m-report", name: "上报事件" },
  ] },
  { group: "我的", items: [{ key: "m-me", name: "个人中心" }] },
];

type PermMap = Record<string, { view: boolean; edit: boolean }>;
type RolePerms = Record<RoleKey, { pc: PermMap; mini: PermMap }>;

function allKeys() {
  return [
    ...pcFeatures.flatMap((g) => g.items.map((i) => i.key)),
    ...miniFeatures.flatMap((g) => g.items.map((i) => i.key)),
  ];
}

function seed(view: boolean, edit: boolean, excludeEdit: string[] = []) {
  const pc: PermMap = {};
  const mini: PermMap = {};
  pcFeatures.forEach((g) => g.items.forEach((i) => {
    pc[i.key] = { view, edit: edit && !excludeEdit.includes(i.key) };
  }));
  miniFeatures.forEach((g) => g.items.forEach((i) => {
    mini[i.key] = { view, edit: edit && !excludeEdit.includes(i.key) };
  }));
  return { pc, mini };
}

function seedSelective(viewKeys: string[], viewOnlyKeys: string[] = []) {
  const pc: PermMap = {};
  const mini: PermMap = {};
  allKeys().forEach((k) => {
    const hasView = viewKeys.includes(k);
    const canEdit = hasView && !viewOnlyKeys.includes(k);
    const target = pcFeatures.flatMap((g) => g.items).some((i) => i.key === k) ? pc : mini;
    target[k] = { view: hasView, edit: canEdit };
  });
  return { pc, mini };
}

const defaultPerms: RolePerms = {
  admin: seed(true, true),
  manager: seed(true, true, ["account", "role", "tenant"]),
  vet: seedSelective([
    "dashboard", "cattle", "disease", "vaccine", "postpartum", "hoof", "drying", "deworm", "general",
    "drug", "stock", "dispense", "k-disease", "k-symptom", "k-prescription",
    "m-workspace", "m-todo", "m-animals", "m-animal-detail", "m-health", "m-health-detail", "m-report",
  ]),
  assistant: seedSelective(
    [
      "dashboard", "cattle", "disease", "vaccine", "hoof", "drying", "deworm", "general",
      "dispense", "k-disease", "k-symptom",
      "m-workspace", "m-todo", "m-animals", "m-animal-detail", "m-health", "m-health-detail", "m-report",
    ],
    ["cattle", "k-disease", "k-symptom", "m-animal-detail"],
  ),
};

type ViewMode = "detail" | "edit";

function RolePage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [perms, setPerms] = useState<RolePerms>(defaultPerms);

  const [drawerRole, setDrawerRole] = useState<RoleKey | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("detail");
  const [platform, setPlatform] = useState<Platform>("pc");
  const [query, setQuery] = useState("");

  const [confirmAction, setConfirmAction] = useState<
    | { kind: "toggle"; role: Role }
    | { kind: "delete"; role: Role }
    | null
  >(null);

  const openDetail = (key: RoleKey) => {
    setDrawerRole(key);
    setViewMode("detail");
    setPlatform("pc");
    setQuery("");
  };
  const openEdit = (key: RoleKey) => {
    setDrawerRole(key);
    setViewMode("edit");
    setPlatform("pc");
    setQuery("");
  };

  const activeRole = drawerRole ? roles.find((r) => r.key === drawerRole)! : null;
  const features = platform === "pc" ? pcFeatures : miniFeatures;
  const current = drawerRole ? perms[drawerRole][platform] : {};

  const filtered = useMemo(() => {
    if (!query.trim()) return features;
    return features
      .map((g) => ({ ...g, items: g.items.filter((i) => i.name.includes(query)) }))
      .filter((g) => g.items.length > 0);
  }, [features, query]);

  const totals = useMemo(() => {
    const all = Object.values(current);
    return {
      view: all.filter((p) => p.view).length,
      edit: all.filter((p) => p.edit).length,
      total: all.length,
    };
  }, [current]);

  const editable = viewMode === "edit";

  const toggle = (key: string, field: "view" | "edit", value: boolean) => {
    if (!drawerRole || !editable) return;
    setPerms((prev) => {
      const next = { ...prev };
      const slot = { ...next[drawerRole][platform][key], [field]: value };
      if (field === "edit" && value) slot.view = true;
      if (field === "view" && !value) slot.edit = false;
      next[drawerRole] = {
        ...next[drawerRole],
        [platform]: { ...next[drawerRole][platform], [key]: slot },
      };
      return next;
    });
  };

  const toggleGroup = (group: FeatureGroup, field: "view" | "edit", value: boolean) => {
    if (!drawerRole || !editable) return;
    setPerms((prev) => {
      const next = { ...prev };
      const slot = { ...next[drawerRole][platform] };
      group.items.forEach((i) => {
        const cur = { ...slot[i.key], [field]: value };
        if (field === "edit" && value) cur.view = true;
        if (field === "view" && !value) cur.edit = false;
        slot[i.key] = cur;
      });
      next[drawerRole] = { ...next[drawerRole], [platform]: slot };
      return next;
    });
  };

  const groupState = (group: FeatureGroup, field: "view" | "edit") => {
    const flags = group.items.map((i) => current[i.key]?.[field]);
    if (flags.every(Boolean)) return true;
    if (flags.every((f) => !f)) return false;
    return "indeterminate" as const;
  };

  const handleConfirmToggle = () => {
    if (confirmAction?.kind !== "toggle") return;
    const r = confirmAction.role;
    setRoles((prev) => prev.map((x) => (x.key === r.key ? { ...x, enabled: !x.enabled } : x)));
    toast.success(`${r.name} 已${r.enabled ? "停用" : "启用"}`);
    setConfirmAction(null);
  };
  const handleConfirmDelete = () => {
    if (confirmAction?.kind !== "delete") return;
    const r = confirmAction.role;
    setRoles((prev) => prev.filter((x) => x.key !== r.key));
    toast.success(`已删除角色：${r.name}`);
    setConfirmAction(null);
  };

  return (
    <>
      <AppHeader title="角色管理" breadcrumb={["组织管理", "角色管理"]} />
      <main className="flex-1 px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-card-title text-foreground">角色列表</h3>
            <p className="text-caption text-text-tertiary mt-0.5">共 {roles.length} 个角色</p>
          </div>
          <Button
            size="sm"
            className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 新建角色
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roles.map((r) => {
            const disabled = !r.enabled;
            return (
              <Card
                key={r.key}
                onClick={() => openDetail(r.key)}
                className={`group relative border-border bg-card p-5 cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm ${
                  disabled ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-md bg-brand-subtle flex items-center justify-center shrink-0">
                    <r.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-card-title text-foreground truncate">{r.name}</h4>
                      {!r.enabled && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-caption font-normal">
                          已停用
                        </Badge>
                      )}
                    </div>
                    <p className="text-caption text-text-tertiary mt-0.5 truncate">{r.scope}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 w-7 rounded-md flex items-center justify-center text-text-tertiary hover:bg-surface-subtle hover:text-foreground transition-colors"
                        aria-label="更多操作"
                      >
                        <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-32"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem onClick={() => openEdit(r.key)}>
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setConfirmAction({ kind: "toggle", role: r })}>
                        {r.enabled ? "停用" : "启用"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setConfirmAction({ kind: "delete", role: r })}
                      >
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-body-sm text-text-secondary mt-3 line-clamp-2 min-h-[2.5rem]">
                  {r.desc}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-caption text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" strokeWidth={1.75} /> {r.count} 人
                  </span>
                  <span className="flex items-center gap-1">
                    <Power className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {r.enabled ? "启用中" : "已停用"}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {/* Drawer: detail / edit */}
      <Sheet open={!!drawerRole} onOpenChange={(v) => !v && setDrawerRole(null)}>
        <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col gap-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {activeRole && (
                  <div className="h-10 w-10 rounded-md bg-brand-subtle flex items-center justify-center shrink-0">
                    <activeRole.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  </div>
                )}
                <div className="min-w-0">
                  <SheetTitle className="text-card-title text-foreground truncate text-left">
                    {activeRole?.name} · {viewMode === "edit" ? "编辑" : "详情"}
                  </SheetTitle>
                  <SheetDescription className="text-caption text-text-tertiary text-left">
                    {viewMode === "edit" ? "可调整角色信息与权限配置" : "查看角色信息与全部权限"}
                  </SheetDescription>
                </div>
              </div>
              {viewMode === "detail" && activeRole && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-body-sm font-normal"
                  onClick={() => setViewMode("edit")}
                >
                  编辑
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {activeRole && (
              <>
                {/* Basic info */}
                <div className="px-6 py-5 border-b border-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-caption text-text-tertiary">角色名称</Label>
                      {editable ? (
                        <Input
                          defaultValue={activeRole.name}
                          className="h-9 mt-1.5 bg-card border-border text-body-sm"
                        />
                      ) : (
                        <div className="mt-1.5 text-body text-foreground">{activeRole.name}</div>
                      )}
                    </div>
                    <div>
                      <Label className="text-caption text-text-tertiary">数据范围</Label>
                      {editable ? (
                        <Input
                          defaultValue={activeRole.scope}
                          className="h-9 mt-1.5 bg-card border-border text-body-sm"
                        />
                      ) : (
                        <div className="mt-1.5 text-body text-foreground">{activeRole.scope}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-caption text-text-tertiary">角色描述</Label>
                    {editable ? (
                      <Textarea
                        defaultValue={activeRole.desc}
                        rows={2}
                        className="mt-1.5 bg-card border-border text-body-sm"
                      />
                    ) : (
                      <p className="mt-1.5 text-body-sm text-text-secondary">{activeRole.desc}</p>
                    )}
                  </div>
                </div>

                {/* Permissions */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                    <div>
                      <h4 className="text-card-title text-foreground">权限配置</h4>
                      <p className="text-caption text-text-tertiary mt-0.5">
                        共 {totals.total} 项 · 查看 {totals.view} · 编辑 {totals.edit}
                      </p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="搜索功能"
                        className="h-9 w-56 pl-9 text-body-sm bg-card border-border"
                      />
                    </div>
                  </div>

                  <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                    <TabsList className="bg-surface-subtle">
                      <TabsTrigger value="pc" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary">
                        <Monitor className="h-3.5 w-3.5" /> PC 端
                      </TabsTrigger>
                      <TabsTrigger value="mini" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary">
                        <Smartphone className="h-3.5 w-3.5" /> 小程序端
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value={platform} className="m-0 mt-3 border border-border rounded-md overflow-hidden">
                      <div className="grid grid-cols-12 gap-3 px-4 h-10 items-center text-table-header text-text-secondary bg-surface-subtle border-b border-border">
                        <div className="col-span-7">功能</div>
                        <div className="col-span-2 text-center">查看权</div>
                        <div className="col-span-2 text-center">管理权</div>
                        <div className="col-span-1" />
                      </div>

                      {filtered.length === 0 ? (
                        <div className="px-4 py-10 text-center text-body-sm text-text-tertiary">
                          没有匹配的功能
                        </div>
                      ) : (
                        filtered.map((g) => {
                          const viewState = groupState(g, "view");
                          const editState = groupState(g, "edit");
                          return (
                            <div key={g.group}>
                              <div className="grid grid-cols-12 gap-3 px-4 h-10 items-center bg-[#FAFEFB] border-b border-border">
                                <div className="col-span-7 text-body-sm font-medium text-foreground">
                                  {g.group}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                  <Checkbox
                                    checked={viewState}
                                    disabled={!editable}
                                    onCheckedChange={(v) => toggleGroup(g, "view", !!v)}
                                  />
                                </div>
                                <div className="col-span-2 flex justify-center">
                                  <Checkbox
                                    checked={editState}
                                    disabled={!editable}
                                    onCheckedChange={(v) => toggleGroup(g, "edit", !!v)}
                                  />
                                </div>
                                <div className="col-span-1 text-caption text-text-tertiary text-right">
                                  {g.items.length}
                                </div>
                              </div>
                              {g.items.map((i) => {
                                const p = current[i.key] ?? { view: false, edit: false };
                                return (
                                  <div
                                    key={i.key}
                                    className="grid grid-cols-12 gap-3 px-4 h-11 items-center border-b border-border last:border-0 hover:bg-surface-subtle"
                                  >
                                    <div className="col-span-7 text-body text-foreground pl-4">
                                      {i.name}
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                      <Checkbox
                                        checked={p.view}
                                        disabled={!editable}
                                        onCheckedChange={(v) => toggle(i.key, "view", !!v)}
                                      />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                      <Checkbox
                                        checked={p.edit}
                                        disabled={!editable}
                                        onCheckedChange={(v) => toggle(i.key, "edit", !!v)}
                                      />
                                    </div>
                                    <div className="col-span-1" />
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
          </div>

          {editable && (
            <SheetFooter className="px-6 py-3 border-t border-border bg-card">
              <Button
                variant="outline"
                className="h-9 text-body-sm font-normal"
                onClick={() => setDrawerRole(null)}
              >
                取消
              </Button>
              <Button
                className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
                onClick={() => {
                  toast.success("已保存变更");
                  setDrawerRole(null);
                }}
              >
                <Save className="h-3.5 w-3.5" /> 保存
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      {/* Enable / Disable confirm */}
      <AlertDialog
        open={confirmAction?.kind === "toggle"}
        onOpenChange={(v) => !v && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认{confirmAction?.kind === "toggle" && confirmAction.role.enabled ? "停用" : "启用"}该角色？
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.kind === "toggle" && confirmAction.role.enabled
                ? `停用后，「${confirmAction.role.name}」名下的 ${confirmAction.role.count} 名成员将无法继续使用对应权限。`
                : confirmAction?.kind === "toggle"
                ? `启用后，「${confirmAction.role.name}」名下成员将恢复对应权限。`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggle}
              className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
            >
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog
        open={confirmAction?.kind === "delete"}
        onOpenChange={(v) => !v && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该角色？</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.kind === "delete"
                ? `删除「${confirmAction.role.name}」后将无法恢复，名下 ${confirmAction.role.count} 名成员需重新分配角色。`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
