import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
} from "lucide-react";

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
  icon: typeof ShieldCheck;
};

const roles: Role[] = [
  { key: "admin", name: "超级管理员", count: 2, scope: "全平台", icon: ShieldCheck },
  { key: "manager", name: "场长", count: 3, scope: "本牧场全部", icon: Briefcase },
  { key: "vet", name: "兽医", count: 8, scope: "健康相关数据", icon: Stethoscope },
  { key: "assistant", name: "兽医助理", count: 6, scope: "健康执行 / 录入", icon: HeartPulse },
];

type Feature = { key: string; name: string };
type FeatureGroup = { group: string; items: Feature[] };

const pcFeatures: FeatureGroup[] = [
  {
    group: "首页总览",
    items: [{ key: "dashboard", name: "运营看板" }],
  },
  {
    group: "基础档案",
    items: [
      { key: "farm", name: "牛场信息" },
      { key: "barn", name: "牛舍信息" },
      { key: "cattle", name: "牛只信息" },
    ],
  },
  {
    group: "健康管理",
    items: [
      { key: "disease", name: "疾病治疗" },
      { key: "vaccine", name: "疫苗免疫" },
      { key: "postpartum", name: "产后护理" },
      { key: "hoof", name: "修蹄工单" },
      { key: "drying", name: "干奶工单" },
      { key: "deworm", name: "驱虫工单" },
      { key: "general", name: "普修工单" },
    ],
  },
  {
    group: "药品管理",
    items: [
      { key: "drug", name: "药品档案" },
      { key: "stock", name: "药品库存" },
      { key: "transfer", name: "调拨转库" },
      { key: "dispense", name: "取药记录" },
      { key: "loss", name: "损耗管理" },
    ],
  },
  {
    group: "诊疗知识库",
    items: [
      { key: "k-disease", name: "疾病知识库" },
      { key: "k-symptom", name: "症状知识库" },
      { key: "k-prescription", name: "处方管理" },
    ],
  },
  {
    group: "组织管理",
    items: [
      { key: "account", name: "账号管理" },
      { key: "role", name: "角色管理" },
      { key: "tenant", name: "租户管理" },
    ],
  },
];

const miniFeatures: FeatureGroup[] = [
  {
    group: "工作台",
    items: [
      { key: "m-workspace", name: "工作台首页" },
      { key: "m-todo", name: "待办工单" },
    ],
  },
  {
    group: "牛只",
    items: [
      { key: "m-animals", name: "牛只列表" },
      { key: "m-animal-detail", name: "牛只档案" },
    ],
  },
  {
    group: "健康",
    items: [
      { key: "m-health", name: "健康事件列表" },
      { key: "m-health-detail", name: "事件详情" },
      { key: "m-report", name: "上报事件" },
    ],
  },
  {
    group: "我的",
    items: [{ key: "m-me", name: "个人中心" }],
  },
];

type PermMap = Record<string, { view: boolean; edit: boolean }>;
type RolePerms = Record<RoleKey, { pc: PermMap; mini: PermMap }>;

// 角色默认权限模版
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
    // 只读项
    ["cattle", "k-disease", "k-symptom", "m-animal-detail"],
  ),
};

function allKeys() {
  return [
    ...pcFeatures.flatMap((g) => g.items.map((i) => i.key)),
    ...miniFeatures.flatMap((g) => g.items.map((i) => i.key)),
  ];
}

function seed(view: boolean, edit: boolean, excludeEdit: string[] = []) {
  const pc: PermMap = {};
  const mini: PermMap = {};
  pcFeatures.forEach((g) =>
    g.items.forEach((i) => {
      pc[i.key] = { view, edit: edit && !excludeEdit.includes(i.key) };
    }),
  );
  miniFeatures.forEach((g) =>
    g.items.forEach((i) => {
      mini[i.key] = { view, edit: edit && !excludeEdit.includes(i.key) };
    }),
  );
  return { pc, mini };
}

function seedSelective(viewKeys: string[], viewOnlyKeys: string[] = []) {
  const pc: PermMap = {};
  const mini: PermMap = {};
  const keys = allKeys();
  keys.forEach((k) => {
    const hasView = viewKeys.includes(k);
    const canEdit = hasView && !viewOnlyKeys.includes(k);
    const target = pcFeatures.flatMap((g) => g.items).some((i) => i.key === k) ? pc : mini;
    target[k] = { view: hasView, edit: canEdit };
  });
  return { pc, mini };
}

function RolePage() {
  const [activeRole, setActiveRole] = useState<RoleKey>("vet");
  const [platform, setPlatform] = useState<Platform>("pc");
  const [perms, setPerms] = useState<RolePerms>(defaultPerms);
  const [query, setQuery] = useState("");

  const features = platform === "pc" ? pcFeatures : miniFeatures;
  const current = perms[activeRole][platform];

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

  const toggle = (key: string, field: "view" | "edit", value: boolean) => {
    setPerms((prev) => {
      const next = { ...prev };
      const slot = { ...next[activeRole][platform][key], [field]: value };
      // 编辑权依赖查看权
      if (field === "edit" && value) slot.view = true;
      if (field === "view" && !value) slot.edit = false;
      next[activeRole] = {
        ...next[activeRole],
        [platform]: { ...next[activeRole][platform], [key]: slot },
      };
      return next;
    });
  };

  const toggleGroup = (group: FeatureGroup, field: "view" | "edit", value: boolean) => {
    setPerms((prev) => {
      const next = { ...prev };
      const slot = { ...next[activeRole][platform] };
      group.items.forEach((i) => {
        const cur = { ...slot[i.key], [field]: value };
        if (field === "edit" && value) cur.view = true;
        if (field === "view" && !value) cur.edit = false;
        slot[i.key] = cur;
      });
      next[activeRole] = { ...next[activeRole], [platform]: slot };
      return next;
    });
  };

  const groupState = (group: FeatureGroup, field: "view" | "edit") => {
    const flags = group.items.map((i) => current[i.key]?.[field]);
    if (flags.every(Boolean)) return true;
    if (flags.every((f) => !f)) return false;
    return "indeterminate" as const;
  };

  return (
    <>
      <AppHeader title="角色管理" breadcrumb={["组织管理", "角色管理"]} />
      <main className="flex-1 px-6 py-6 grid grid-cols-12 gap-4">
        {/* Left: roles */}
        <Card className="col-span-12 lg:col-span-3 border-border bg-card p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-card-title text-foreground">角色列表</h3>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> 新建
            </Button>
          </div>
          <div className="space-y-1">
            {roles.map((r) => {
              const active = activeRole === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setActiveRole(r.key)}
                  className={`w-full flex items-center gap-3 px-3 h-12 rounded-md text-left transition-colors ${
                    active
                      ? "bg-brand-subtle text-primary"
                      : "text-text-secondary hover:bg-[var(--sidebar-hover)]"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                      active ? "bg-card" : "bg-surface-subtle"
                    }`}
                  >
                    <r.icon
                      className={`h-4 w-4 ${active ? "text-primary" : "text-text-tertiary"}`}
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-body-sm truncate ${active ? "font-medium" : ""}`}>
                      {r.name}
                    </div>
                    <div className="text-caption text-text-tertiary truncate">
                      {r.count} 人 · {r.scope}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right: permission matrix */}
        <Card className="col-span-12 lg:col-span-9 border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-card-title text-foreground">
                {roles.find((r) => r.key === activeRole)?.name} · 权限配置
              </h3>
              <p className="text-caption text-text-tertiary mt-0.5">
                共 {totals.total} 项功能 · 查看 {totals.view} · 编辑 {totals.edit}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索功能"
                  className="h-9 w-56 pl-9 text-body-sm bg-card border-border"
                />
              </div>
              <Button
                size="sm"
                className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
              >
                <Save className="h-3.5 w-3.5" /> 保存变更
              </Button>
            </div>
          </div>

          <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
            <div className="px-6 pb-2">
              <TabsList className="bg-surface-subtle">
                <TabsTrigger value="pc" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary">
                  <Monitor className="h-3.5 w-3.5" /> PC 端
                </TabsTrigger>
                <TabsTrigger value="mini" className="gap-1.5 data-[state=active]:bg-card data-[state=active]:text-primary">
                  <Smartphone className="h-3.5 w-3.5" /> 小程序端
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={platform} className="m-0">
              <div className="grid grid-cols-12 gap-3 px-6 h-11 items-center text-table-header text-text-secondary border-y border-border bg-surface-subtle">
                <div className="col-span-7">功能</div>
                <div className="col-span-2 text-center">查看权</div>
                <div className="col-span-2 text-center">编辑权</div>
                <div className="col-span-1" />
              </div>

              {filtered.length === 0 ? (
                <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">
                  没有匹配的功能
                </div>
              ) : (
                filtered.map((g) => {
                  const viewState = groupState(g, "view");
                  const editState = groupState(g, "edit");
                  return (
                    <div key={g.group}>
                      <div className="grid grid-cols-12 gap-3 px-6 h-10 items-center bg-[#FAFEFB] border-b border-border">
                        <div className="col-span-7 text-body-sm font-medium text-foreground">
                          {g.group}
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <Checkbox
                            checked={viewState}
                            onCheckedChange={(v) => toggleGroup(g, "view", !!v)}
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <Checkbox
                            checked={editState}
                            onCheckedChange={(v) => toggleGroup(g, "edit", !!v)}
                          />
                        </div>
                        <div className="col-span-1 text-caption text-text-tertiary text-right">
                          {g.items.length} 项
                        </div>
                      </div>
                      {g.items.map((i) => {
                        const p = current[i.key] ?? { view: false, edit: false };
                        return (
                          <div
                            key={i.key}
                            className="grid grid-cols-12 gap-3 px-6 h-12 items-center border-b border-border last:border-0 hover:bg-surface-subtle"
                          >
                            <div className="col-span-7 text-body text-foreground pl-4">
                              {i.name}
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <Checkbox
                                checked={p.view}
                                onCheckedChange={(v) => toggle(i.key, "view", !!v)}
                              />
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <Checkbox
                                checked={p.edit}
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
        </Card>
      </main>
    </>
  );
}
