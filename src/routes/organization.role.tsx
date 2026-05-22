import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  ShieldCheck,
  Briefcase,
  Stethoscope,
  HeartPulse,
  Monitor,
  Smartphone,
  MoreVertical,
  Users,
  Power,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organization/role")({
  head: () => ({ meta: [{ title: "角色权限 — 奇点智牧" }] }),
  component: RolePage,
});

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
  { key: "vet", name: "兽医", count: 8, scope: "健康相关数据", desc: "负责诊疗与健康管理，可处理疾病、疫苗、工作等业务。", enabled: true, icon: Stethoscope },
  { key: "assistant", name: "兽医助理", count: 6, scope: "健康执行 / 录入", desc: "协助兽医完成日常工作录入与执行，部分功能仅查看权限。", enabled: false, icon: HeartPulse },
];

type PcModuleKey = "health" | "drug" | "archive" | "organization" | "knowledge";

const pcModules: { key: PcModuleKey; name: string; desc: string }[] = [
  { key: "health", name: "健康管理", desc: "疾病、疫苗、修蹄等健康事项的方案确认、审批与执行计划" },
  { key: "drug", name: "药品管理", desc: "药品档案、库存、调拨、取药与损耗管理" },
  { key: "archive", name: "基础档案", desc: "牛场、牛舍、牛只档案的维护" },
  { key: "organization", name: "组织管理", desc: "账号、角色、租户与团队管理" },
  { key: "knowledge", name: "知识库管理", desc: "疾病、症状、处方等诊疗知识维护" },
];

type MiniEventKey =
  | "disease"
  | "hoof"
  | "drying"
  | "vaccine"
  | "postpartum"
  | "deworm"
  | "general"
  | "loss";

type MiniActionKey = "report" | "pickup" | "record";

const miniEvents: {
  key: MiniEventKey;
  name: string;
  actions: Record<MiniActionKey, string>;
}[] = [
  { key: "disease", name: "疾病治疗", actions: { report: "可上报", pickup: "可响应领取", record: "可回填执行记录" } },
  { key: "hoof", name: "修蹄", actions: { report: "可上报", pickup: "可响应领取", record: "可回填执行记录" } },
  { key: "drying", name: "干奶", actions: { report: "可上报", pickup: "可响应领取", record: "可回填执行记录" } },
  { key: "vaccine", name: "疫苗", actions: { report: "可上报", pickup: "可响应领取", record: "可回填执行记录" } },
  { key: "postpartum", name: "产后护理", actions: { report: "可上报", pickup: "可响应领取", record: "可回填执行记录" } },
  { key: "deworm", name: "驱虫", actions: { report: "可上报", pickup: "可响应领取", record: "可回填执行记录" } },
  { key: "general", name: "普修", actions: { report: "可上报", pickup: "可响应领取", record: "可回填执行记录" } },
  { key: "loss", name: "损耗 / 领用", actions: { report: "可上报损耗", pickup: "可处理损耗", record: "可领用核销" } },
];

type PcPerms = { allowLogin: boolean; modules: Record<PcModuleKey, boolean> };
type MiniPerms = Record<MiniEventKey, Record<MiniActionKey, boolean>>;
type RolePerms = Record<RoleKey, { pc: PcPerms; mini: MiniPerms }>;

function fullPc(allow = true, modules = true): PcPerms {
  return {
    allowLogin: allow,
    modules: pcModules.reduce(
      (acc, m) => ({ ...acc, [m.key]: modules }),
      {} as Record<PcModuleKey, boolean>,
    ),
  };
}
function fullMini(v = true): MiniPerms {
  return miniEvents.reduce(
    (acc, e) => ({ ...acc, [e.key]: { report: v, pickup: v, record: v } }),
    {} as MiniPerms,
  );
}
function partialPc(keys: PcModuleKey[]): PcPerms {
  return {
    allowLogin: true,
    modules: pcModules.reduce(
      (acc, m) => ({ ...acc, [m.key]: keys.includes(m.key) }),
      {} as Record<PcModuleKey, boolean>,
    ),
  };
}
function partialMini(map: Partial<Record<MiniEventKey, Partial<Record<MiniActionKey, boolean>>>>): MiniPerms {
  return miniEvents.reduce((acc, e) => {
    const m = map[e.key] ?? {};
    acc[e.key] = { report: !!m.report, pickup: !!m.pickup, record: !!m.record };
    return acc;
  }, {} as MiniPerms);
}

const defaultPerms: RolePerms = {
  admin: { pc: fullPc(true, true), mini: fullMini(true) },
  manager: {
    pc: partialPc(["health", "drug", "archive", "knowledge"]),
    mini: fullMini(true),
  },
  vet: {
    pc: partialPc(["health", "drug", "knowledge"]),
    mini: partialMini({
      disease: { report: true, pickup: true, record: true },
      vaccine: { report: true, pickup: true, record: true },
      postpartum: { report: true, pickup: true, record: true },
      deworm: { report: true, pickup: true, record: true },
      general: { report: true, pickup: true, record: true },
      loss: { report: true, pickup: true, record: true },
    }),
  },
  assistant: {
    pc: { allowLogin: false, modules: pcModules.reduce((a, m) => ({ ...a, [m.key]: false }), {} as Record<PcModuleKey, boolean>) },
    mini: partialMini({
      disease: { pickup: true, record: true },
      vaccine: { pickup: true, record: true },
      hoof: { pickup: true, record: true },
      drying: { pickup: true, record: true },
      deworm: { pickup: true, record: true },
      general: { pickup: true, record: true },
      loss: { report: true },
    }),
  },
};

type ViewMode = "detail" | "edit";

function RolePage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [perms, setPerms] = useState<RolePerms>(defaultPerms);

  const [drawerRole, setDrawerRole] = useState<RoleKey | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("detail");

  const [confirmAction, setConfirmAction] = useState<
    | { kind: "toggle"; role: Role }
    | { kind: "delete"; role: Role }
    | null
  >(null);

  const openDetail = (key: RoleKey) => {
    setDrawerRole(key);
    setViewMode("detail");
  };
  const openEdit = (key: RoleKey) => {
    setDrawerRole(key);
    setViewMode("edit");
  };

  const activeRole = drawerRole ? roles.find((r) => r.key === drawerRole)! : null;
  const editable = viewMode === "edit";
  const cur = drawerRole ? perms[drawerRole] : null;

  const setPcAllow = (v: boolean) => {
    if (!drawerRole || !editable) return;
    setPerms((prev) => ({
      ...prev,
      [drawerRole]: { ...prev[drawerRole], pc: { ...prev[drawerRole].pc, allowLogin: v } },
    }));
  };
  const setPcModule = (k: PcModuleKey, v: boolean) => {
    if (!drawerRole || !editable) return;
    setPerms((prev) => ({
      ...prev,
      [drawerRole]: {
        ...prev[drawerRole],
        pc: {
          ...prev[drawerRole].pc,
          modules: { ...prev[drawerRole].pc.modules, [k]: v },
        },
      },
    }));
  };
  const setMini = (e: MiniEventKey, a: MiniActionKey, v: boolean) => {
    if (!drawerRole || !editable) return;
    setPerms((prev) => ({
      ...prev,
      [drawerRole]: {
        ...prev[drawerRole],
        mini: {
          ...prev[drawerRole].mini,
          [e]: { ...prev[drawerRole].mini[e], [a]: v },
        },
      },
    }));
  };
  const setMiniRow = (e: MiniEventKey, v: boolean) => {
    if (!drawerRole || !editable) return;
    setPerms((prev) => ({
      ...prev,
      [drawerRole]: {
        ...prev[drawerRole],
        mini: {
          ...prev[drawerRole].mini,
          [e]: { report: v, pickup: v, record: v },
        },
      },
    }));
  };
  const setMiniColumn = (a: MiniActionKey, v: boolean) => {
    if (!drawerRole || !editable) return;
    setPerms((prev) => ({
      ...prev,
      [drawerRole]: {
        ...prev[drawerRole],
        mini: miniEvents.reduce((acc, e) => {
          acc[e.key] = { ...prev[drawerRole].mini[e.key], [a]: v };
          return acc;
        }, {} as MiniPerms),
      },
    }));
  };
  const setMiniAll = (v: boolean) => {
    if (!drawerRole || !editable) return;
    setPerms((prev) => ({
      ...prev,
      [drawerRole]: { ...prev[drawerRole], mini: fullMini(v) },
    }));
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
                      <DropdownMenuItem onClick={() => openEdit(r.key)}>编辑</DropdownMenuItem>
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
                <button
                  className="h-8 px-2 text-body-sm font-normal text-primary hover:underline"
                  onClick={() => setViewMode("edit")}
                >
                  编辑
                </button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {activeRole && cur && (
              <>
                {/* 1. Basic info */}
                <section className="px-6 py-5 border-b border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-1 rounded-full bg-primary" />
                    <h4 className="text-body font-medium text-foreground">基础信息</h4>
                  </div>
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
                      <Label className="text-caption text-text-tertiary">是否启用</Label>
                      {editable ? (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Switch
                            checked={activeRole.enabled}
                            onCheckedChange={(v) => {
                              setRoles((prev) =>
                                prev.map((r) =>
                                  r.key === activeRole.key ? { ...r, enabled: v } : r,
                                ),
                              );
                            }}
                          />
                          <span className="text-body-sm text-foreground">
                            {activeRole.enabled ? "启用" : "停用"}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center gap-1.5 text-body text-foreground">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              activeRole.enabled ? "bg-primary" : "bg-text-tertiary"
                            }`}
                          />
                          {activeRole.enabled ? "启用中" : "已停用"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-caption text-text-tertiary">角色说明</Label>
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
                </section>

                {/* 2. PC 管理与审批权限 */}
                <section className="px-6 py-5 border-b border-border space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-primary" />
                      <h4 className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 text-text-secondary" />
                        PC 端 · 管理与审批权限
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm text-text-secondary">允许登录 PC 端</span>
                      <Switch
                        checked={cur.pc.allowLogin}
                        disabled={!editable}
                        onCheckedChange={setPcAllow}
                      />
                    </div>
                  </div>
                  <p className="text-caption text-text-tertiary flex items-start gap-1.5 -mt-1">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    PC 模块权限不拆分“只读 / 操作”，可进入即视为可管理。健康事项审批、确认方案、执行计划配置、工单终止，由「允许登录 PC 端 + 健康管理」共同决定。
                  </p>

                  {cur.pc.allowLogin ? (
                    <div className="rounded-md border border-border overflow-hidden">
                      {pcModules.map((m, idx) => {
                        const checked = cur.pc.modules[m.key];
                        return (
                          <label
                            key={m.key}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface-subtle ${
                              idx > 0 ? "border-t border-border" : ""
                            } ${!editable ? "cursor-default" : ""}`}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={!editable}
                              onCheckedChange={(v) => setPcModule(m.key, !!v)}
                              className="mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-body-sm font-medium text-foreground">{m.name}</div>
                              <div className="text-caption text-text-tertiary mt-0.5">{m.desc}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed border-border bg-surface-subtle px-4 py-6 text-center text-body-sm text-text-tertiary">
                      已关闭 PC 端登录权限
                    </div>
                  )}

                </section>

                {/* 3. 小程序现场能力 */}
                <section className="px-6 py-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-1 rounded-full bg-primary" />
                    <h4 className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-text-secondary" />
                      小程序 · 现场能力
                    </h4>
                  </div>
                  <p className="text-caption text-text-tertiary flex items-start gap-1.5 -mt-1">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    所有账号均可自由登录小程序，请在此配置不同角色的事项权限范围。
                  </p>

                  <div className="rounded-md border border-border overflow-hidden">
                    {(() => {
                      const actions: MiniActionKey[] = ["report", "pickup", "record"];
                      const colChecked = (a: MiniActionKey) =>
                        miniEvents.every((e) => cur.mini[e.key][a]);
                      const colIndeterminate = (a: MiniActionKey) =>
                        !colChecked(a) && miniEvents.some((e) => cur.mini[e.key][a]);
                      const allChecked = miniEvents.every((e) =>
                        actions.every((a) => cur.mini[e.key][a]),
                      );
                      const anyChecked = miniEvents.some((e) =>
                        actions.some((a) => cur.mini[e.key][a]),
                      );
                      return (
                        <>
                          {editable && (
                            <div className="flex items-center justify-between px-4 py-2 bg-surface-subtle border-b border-border">
                              <span className="text-caption text-text-tertiary">
                                提示：点击表头可整列勾选；点击事项名称下方按钮可整行勾选
                              </span>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-caption text-text-secondary hover:text-foreground"
                                  onClick={() => setMiniAll(true)}
                                  disabled={allChecked}
                                >
                                  全选
                                </Button>
                                <span className="h-3 w-px bg-border" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-caption text-text-secondary hover:text-foreground"
                                  onClick={() => setMiniAll(false)}
                                  disabled={!anyChecked}
                                >
                                  全部清空
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-12 gap-3 px-4 h-10 items-center text-table-header text-text-secondary bg-surface-subtle border-b border-border">
                            <div className="col-span-3">事项类型</div>
                            {actions.map((a, i) => (
                              <div key={a} className="col-span-3 flex items-center justify-center gap-2">
                                {editable ? (
                                  <Checkbox
                                    checked={
                                      colIndeterminate(a)
                                        ? "indeterminate"
                                        : colChecked(a)
                                    }
                                    onCheckedChange={(v) => setMiniColumn(a, !!v)}
                                    aria-label={["上报", "响应 / 处理", "执行 / 核销"][i]}
                                  />
                                ) : null}
                                <span>{["上报", "响应 / 处理", "执行 / 核销"][i]}</span>
                              </div>
                            ))}
                          </div>
                          {miniEvents.map((e) => {
                            const p = cur.mini[e.key];
                            const all = p.report && p.pickup && p.record;
                            const none = !p.report && !p.pickup && !p.record;
                            return (
                              <div
                                key={e.key}
                                className="grid grid-cols-12 gap-3 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-surface-subtle"
                              >
                                <div className="col-span-3 min-w-0">
                                  <div className="text-body-sm font-medium text-foreground truncate">
                                    {e.name}
                                  </div>
                                  {editable && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <button
                                        className={`text-caption ${
                                          all
                                            ? "text-text-tertiary cursor-default"
                                            : "text-primary hover:underline"
                                        }`}
                                        onClick={() => setMiniRow(e.key, true)}
                                        disabled={all}
                                      >
                                        整行选中
                                      </button>
                                      <span className="text-text-tertiary">·</span>
                                      <button
                                        className={`text-caption ${
                                          none
                                            ? "text-text-tertiary cursor-default"
                                            : "text-text-secondary hover:text-foreground hover:underline"
                                        }`}
                                        onClick={() => setMiniRow(e.key, false)}
                                        disabled={none}
                                      >
                                        清空
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {actions.map((a) => (
                                  <label
                                    key={a}
                                    className={`col-span-3 flex items-center justify-center gap-2 ${
                                      editable ? "cursor-pointer" : ""
                                    }`}
                                  >
                                    <Checkbox
                                      checked={p[a]}
                                      disabled={!editable}
                                      onCheckedChange={(v) => setMini(e.key, a, !!v)}
                                    />
                                    <span className="text-body-sm text-text-secondary">{e.actions[a]}</span>
                                  </label>
                                ))}
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>

                </section>
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
                className="h-9 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
                onClick={() => {
                  toast.success("已保存变更");
                  setDrawerRole(null);
                }}
              >
                保存
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
