import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Power,
  Unlink,
  RotateCcw,
  Check,
  ChevronDown,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organization/account")({
  head: () => ({ meta: [{ title: "账号管理 — 奇点智牧" }] }),
  component: AccountPage,
});

type Status = "启用" | "禁用";
type UserType = "内部" | "外部";
type FarmRole = { farm: string; roles: string[] };
type Account = {
  id: string;
  name: string;
  initial: string;
  phone: string;
  userType: UserType;
  org: string;
  farmRoles: FarmRole[]; // 每个关联牧场对应一个角色
  wecomId: string | null;
  wechatId: string | null;
  status: Status;
  createdAt: string;
};

// 脱敏：保留前 4 后 3，中间以 **** 替代；过短时仅保留首尾各 1
const maskId = (id: string) => {
  if (id.length <= 7) {
    if (id.length <= 2) return id;
    return `${id[0]}****${id[id.length - 1]}`;
  }
  return `${id.slice(0, 4)}****${id.slice(-3)}`;
};

// 文本省略
const ellipsize = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);


// 模拟较多牧场场景，验证搜索能力
const FARM_OPTIONS = [
  "1 号牧场", "2 号牧场", "3 号牧场", "4 号牧场", "5 号牧场",
  "金辉牧场", "云岭牧场", "锦绣牧场", "丰泽牧场", "祥和牧场",
  "天禾牧场", "牧原一场", "牧原二场", "蒙原牧场", "晨光牧场",
  "向阳牧场", "草原之星", "北疆牧场", "南山牧场", "万象牧场",
];

const ORG_OPTIONS = [
  "1 号牧场",
  "1 号牧场 / 兽医部",
  "1 号牧场 / 巡检 A 组",
  "1 号牧场 / 仓储部",
  "2 号牧场",
  "2 号牧场 / 仓储部",
  "外部合作 / 修蹄队",
  "外部合作 / 干奶服务队",
  "外部合作 / 驱虫服务队",
];

const INTERNAL_ROLES = ["场长", "兽医", "兽医助理", "技术员", "仓管员"];
const EXTERNAL_ROLES = ["修蹄工", "普修工", "干奶工", "驱虫工"];
const DEFAULT_ROLES = [...INTERNAL_ROLES, ...EXTERNAL_ROLES];

const initialAccounts: Account[] = [
  { id: "U001", name: "张磊", initial: "ZL", phone: "138****6201", userType: "内部", org: "1 号牧场", farmRoles: [{ farm: "1 号牧场", roles: ["场长"] }], wecomId: "wm_zhanglei_8821", wechatId: "wx_zhanglei_6688", status: "启用", createdAt: "2024-03-08" },
  { id: "U002", name: "李雨晴", initial: "LY", phone: "139****3018", userType: "内部", org: "1 号牧场 / 兽医部", farmRoles: [{ farm: "1 号牧场", roles: ["兽医", "技术员"] }, { farm: "2 号牧场", roles: ["兽医助理"] }], wecomId: "wm_liyuqing_3210", wechatId: "wx_liyuqing_4521", status: "启用", createdAt: "2024-06-21" },
  { id: "U003", name: "陈晓东", initial: "CX", phone: "137****8520", userType: "内部", org: "1 号牧场 / 巡检 A 组", farmRoles: [{ farm: "1 号牧场", roles: ["技术员"] }], wecomId: null, wechatId: "wx_chenxd_7702", status: "启用", createdAt: "2025-09-12" },
  { id: "U004", name: "王仓管", initial: "WC", phone: "136****4302", userType: "内部", org: "1 号牧场 / 仓储部", farmRoles: [{ farm: "1 号牧场", roles: ["仓管员"] }, { farm: "2 号牧场", roles: ["仓管员"] }, { farm: "3 号牧场", roles: ["技术员", "仓管员"] }], wecomId: "wm_wangck_5601", wechatId: null, status: "启用", createdAt: "2026-02-04" },
  { id: "U005", name: "孙库管", initial: "SK", phone: "135****9012", userType: "内部", org: "2 号牧场 / 仓储部", farmRoles: [{ farm: "2 号牧场", roles: ["仓管员"] }], wecomId: null, wechatId: null, status: "禁用", createdAt: "2026-04-30" },
  { id: "U006", name: "赵修蹄", initial: "ZX", phone: "134****7788", userType: "外部", org: "外部合作 / 修蹄队", farmRoles: [{ farm: "1 号牧场", roles: ["修蹄工"] }, { farm: "3 号牧场", roles: ["修蹄工", "普修工"] }, { farm: "金辉牧场", roles: ["普修工"] }], wecomId: "wm_zhaoxt_9912", wechatId: "wx_zhaoxt_3344", status: "启用", createdAt: "2025-11-18" },
  { id: "U007", name: "刘技师", initial: "LJ", phone: "133****5566", userType: "外部", org: "外部合作 / 干奶服务队", farmRoles: [{ farm: "2 号牧场", roles: ["干奶工"] }], wecomId: null, wechatId: "wx_liujs_1209", status: "启用", createdAt: "2026-05-09" },

];

// 辅助：从 farmRoles 派生
const farmsOf = (a: Pick<Account, "farmRoles">) => a.farmRoles.map((x) => x.farm);
const rolesOf = (a: Pick<Account, "farmRoles">) =>
  Array.from(new Set(a.farmRoles.flatMap((x) => x.roles)));

function AccountPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [internalRoles, setInternalRoles] = useState<string[]>(INTERNAL_ROLES);
  const [externalRoles, setExternalRoles] = useState<string[]>(EXTERNAL_ROLES);
  const roles = useMemo(() => [...internalRoles, ...externalRoles], [internalRoles, externalRoles]);
  const addRoleFor = (type: UserType, r: string) => {
    if (type === "内部") {
      setInternalRoles((rs) => (rs.includes(r) ? rs : [...rs, r]));
    } else {
      setExternalRoles((rs) => (rs.includes(r) ? rs : [...rs, r]));
    }
  };
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerMode, setDrawerMode] = useState<"detail" | "edit">("detail");
  const [creating, setCreating] = useState(false);
  const drawerAccount = useMemo(
    () => (drawerId ? accounts.find((a) => a.id === drawerId) ?? null : null),
    [drawerId, accounts],
  );
  const openDetail = (a: Account) => {
    setDrawerId(a.id);
    setDrawerMode("detail");
  };
  const openEdit = (a: Account) => {
    setDrawerId(a.id);
    setDrawerMode("edit");
  };
  const closeDrawer = () => setDrawerId(null);

  // 筛选状态
  const [keyword, setKeyword] = useState("");
  const [onlyInternal, setOnlyInternal] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterFarms, setFilterFarms] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [advOpen, setAdvOpen] = useState(false);
  const [farmFilterOpen, setFarmFilterOpen] = useState(false);

  const resetAdv = () => {
    setFilterRole("all");
    setFilterFarms([]);
    setFilterStatus("all");
  };

  const advCount =
    (filterRole !== "all" ? 1 : 0) +
    (filterFarms.length > 0 ? 1 : 0) +
    (filterStatus !== "all" ? 1 : 0);

  const toggleStatus = (id: string) => {
    setAccounts((list) =>
      list.map((a) =>
        a.id === id ? { ...a, status: a.status === "启用" ? "禁用" : "启用" } : a,
      ),
    );
  };

  const saveEdit = (updated: Account) => {
    setAccounts((list) => list.map((a) => (a.id === updated.id ? updated : a)));
    closeDrawer();
  };

  const handleCreate = (
    acc: Omit<Account, "id" | "initial">,
    newRoleCreated: string | null,
  ) => {
    const id = `U${String(accounts.length + 1).padStart(3, "0")}`;
    const initial = acc.name.slice(0, 2).toUpperCase();
    setAccounts((list) => [...list, { ...acc, id, initial }]);
    if (newRoleCreated) {
      addRoleFor(acc.userType, newRoleCreated);
      toast.success(`已创建账号「${acc.name}」`, {
        description: `新角色「${newRoleCreated}」暂无权限，请尽快前往角色权限完成配置。`,
        action: {
          label: "去配置",
          onClick: () => navigate({ to: "/organization/role" }),
        },
        duration: 8000,
      });
    } else {
      toast.success(`已创建账号「${acc.name}」`);
    }
    setCreating(false);
  };

  const userTypeTagClass = (t: UserType) =>
    t === "内部" ? "tag-brand" : "tag-warning";

  // 过滤 + 排序：启用优先；同状态内按创建时间倒序（越新越靠前）
  const filteredAccounts = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return accounts
      .filter((a) => {
        if (onlyInternal && a.userType !== "内部") return false;
        if (filterRole !== "all" && !rolesOf(a).includes(filterRole)) return false;
        if (filterFarms.length > 0 && !filterFarms.some((f) => farmsOf(a).includes(f))) return false;
        if (filterStatus !== "all" && a.status !== filterStatus) return false;
        if (kw) {
          const hay = `${a.name} ${a.phone} ${a.wecomId ?? ""} ${a.wechatId ?? ""}`.toLowerCase();
          if (!hay.includes(kw)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "启用" ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [accounts, keyword, onlyInternal, filterRole, filterFarms, filterStatus]);

  // 列宽：用户 类型 手机号 角色 关联牧场 企微ID 微信ID 状态 管理
  const cols = "1.5fr 0.8fr 1.1fr 1.3fr 1.8fr 140px 140px 0.7fr 0.5fr";


  return (
    <>
      <AppHeader title="账号管理" breadcrumb={["组织管理", "账号管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索姓名 / 手机号 / 企微 / 微信 ID"
                className="h-9 w-72 pl-9 text-body-sm"
              />
            </div>
            <label className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card cursor-pointer select-none">
              <Switch checked={onlyInternal} onCheckedChange={setOnlyInternal} />
              <span className="text-body-sm text-text-secondary">仅查看内部</span>
            </label>
            <Popover open={advOpen} onOpenChange={setAdvOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
                  <Filter className="h-3.5 w-3.5" /> 精细筛选
                  {advCount > 0 && (
                    <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-caption">
                      {advCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-body-sm text-foreground font-medium">精细筛选</div>
                  <button
                    type="button"
                    onClick={resetAdv}
                    className="inline-flex items-center gap-1 text-caption text-text-tertiary hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" /> 重置
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="text-caption text-text-tertiary">角色</div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-body-sm">全部角色</SelectItem>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r} className="text-body-sm">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <div className="text-caption text-text-tertiary">关联牧场</div>
                  <Popover open={farmFilterOpen} onOpenChange={setFarmFilterOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-3 text-body-sm text-left hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                      >
                        <span className={filterFarms.length === 0 ? "text-text-tertiary" : "text-foreground truncate"}>
                          {filterFarms.length === 0
                            ? "全部牧场"
                            : filterFarms.length === 1
                              ? filterFarms[0]
                              : `已选 ${filterFarms.length} 个牧场`}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="输入牧场名称搜索" className="text-body-sm" />
                        <CommandList className="max-h-64">
                          <CommandEmpty className="text-caption text-text-tertiary py-4 text-center">无匹配牧场</CommandEmpty>
                          <CommandGroup>
                            {FARM_OPTIONS.map((f) => {
                              const checked = filterFarms.includes(f);
                              return (
                                <CommandItem
                                  key={f}
                                  value={f}
                                  onSelect={() => {
                                    setFilterFarms((prev) =>
                                      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
                                    );
                                  }}
                                  className="text-body-sm gap-2"
                                >
                                  <Checkbox checked={checked} className="h-4 w-4 pointer-events-none" />
                                  <span className="flex-1 truncate">{f}</span>
                                  {checked && <Check className="h-3.5 w-3.5 text-primary" />}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                        {filterFarms.length > 0 && (
                          <div className="border-t border-border px-2 py-1.5 flex items-center justify-between">
                            <span className="text-caption text-text-tertiary">已选 {filterFarms.length} 个</span>
                            <button
                              type="button"
                              onClick={() => setFilterFarms([])}
                              className="text-caption text-text-tertiary hover:text-foreground inline-flex items-center gap-1"
                            >
                              <X className="h-3 w-3" /> 清空
                            </button>
                          </div>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <div className="text-caption text-text-tertiary">状态</div>
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as "all" | Status)}>
                    <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-body-sm">全部状态</SelectItem>
                      <SelectItem value="启用" className="text-body-sm">启用</SelectItem>
                      <SelectItem value="禁用" className="text-body-sm">禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            size="sm"
            onClick={() => setCreating(true)}
            className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 新建账号
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle"
            style={{ gridTemplateColumns: cols }}>
            <div>用户</div>
            <div>人员类型</div>
            <div>手机号</div>
            <div>角色</div>
            <div>关联牧场</div>
            <div>企微 ID</div>
            <div>微信 ID</div>
            <div>状态</div>
            <div className="text-right">管理</div>

          </div>
          {filteredAccounts.map((a) => (
            <div key={a.id} className="grid gap-3 px-6 h-14 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle"
              style={{ gridTemplateColumns: cols }}>
              <div className="leading-tight min-w-0">
                <div className="text-body text-foreground truncate">{a.name}</div>
                <div className="text-caption text-text-tertiary font-mono">{a.id}</div>
              </div>
              <div><span className={`tag ${userTypeTagClass(a.userType)}`}>{a.userType}</span></div>
              <div className="text-body-sm text-text-secondary tabular-nums">{a.phone}</div>
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                {(() => {
                  const rs = rolesOf(a);
                  if (rs.length === 0) return <span className="tag tag-muted">未分配</span>;
                  return (
                    <>
                      <span className="tag tag-brand whitespace-nowrap" title={rs[0]}>{ellipsize(rs[0], 3)}</span>
                      {rs.length > 1 && (
                        <span
                          className="tag tag-brand whitespace-nowrap"
                          title={rs.slice(1).join("、")}
                        >
                          +{rs.length - 1}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                {(() => {
                  const fs = farmsOf(a);
                  if (fs.length === 0) return <span className="tag tag-muted">未关联</span>;
                  return (
                    <>
                      <span className="tag tag-muted whitespace-nowrap" title={fs[0]}>{ellipsize(fs[0], 4)}</span>
                      {fs.length > 1 && (
                        <span
                          className="tag tag-muted whitespace-nowrap"
                          title={a.farmRoles.slice(1).map((x) => `${x.farm}（${x.roles.join("、") || "未分配"}）`).join("\n")}
                        >
                          +{fs.length - 1}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="text-body-sm tabular-nums min-w-0 overflow-hidden">
                {a.wecomId ? (
                  <span className="block truncate text-text-secondary font-mono" title="已脱敏显示">{maskId(a.wecomId)}</span>
                ) : (
                  <span className="tag tag-muted">未绑定</span>
                )}
              </div>
              <div className="text-body-sm tabular-nums min-w-0 overflow-hidden">
                {a.wechatId ? (
                  <span className="block truncate text-text-secondary font-mono" title="已脱敏显示">{maskId(a.wechatId)}</span>
                ) : (
                  <span className="tag tag-muted">未绑定</span>
                )}
              </div>


              <div><span className={`tag ${a.status === "启用" ? "tag-success" : "tag-muted"}`}>{a.status}</span></div>
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={() => openDetail(a)} className="gap-2 text-body-sm">
                      <Eye className="h-3.5 w-3.5" /> 查看
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEdit(a)} className="gap-2 text-body-sm">
                      <Pencil className="h-3.5 w-3.5" /> 编辑
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toggleStatus(a.id)}
                      className={`gap-2 text-body-sm ${a.status === "启用" ? "text-destructive focus:text-destructive" : ""}`}
                    >
                      <Power className="h-3.5 w-3.5" /> {a.status === "启用" ? "停用" : "启用"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {filteredAccounts.length === 0 && (
            <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">
              暂无符合条件的账号
            </div>
          )}
        </Card>

        <p className="text-caption text-text-tertiary">
          说明：账号关联一个牧场时，仅能查看和操作该牧场的数据；关联多个牧场时，可在关联牧场之间切换并按权限查看数据。所属组织信息可在查看详情中查阅。
        </p>
      </main>

      {/* 查看 / 编辑 抽屉 */}
      <AccountDrawer
        account={drawerAccount}
        mode={drawerMode}
        onModeChange={setDrawerMode}
        internalRoles={internalRoles}
        externalRoles={externalRoles}
        onClose={closeDrawer}
        onSave={saveEdit}
        onCreateRole={addRoleFor}
        userTypeTagClass={userTypeTagClass}
      />


      {/* 新建 */}
      {creating && (
        <CreateDialog
          internalRoles={internalRoles}
          externalRoles={externalRoles}
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
          onCreateRole={addRoleFor}
        />
      )}
    </>
  );
}



// 可搜索的「牧场—角色」多选：每个关联的牧场需选择对应角色
function FarmRolePicker({
  value,
  onChange,
  roles,
  onCreateRole,
}: {
  value: FarmRole[];
  onChange: (next: FarmRole[]) => void;
  roles: string[];
  onCreateRole: (r: string) => void;
}) {
  const [q, setQ] = useState("");
  const filteredFarms = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return FARM_OPTIONS;
    return FARM_OPTIONS.filter((f) => f.toLowerCase().includes(kw));
  }, [q]);

  const selectedMap = useMemo(() => {
    const m = new Map<string, string[]>();
    value.forEach((v) => m.set(v.farm, v.roles));
    return m;
  }, [value]);

  const toggleFarm = (f: string) => {
    if (selectedMap.has(f)) {
      onChange(value.filter((v) => v.farm !== f));
    } else {
      onChange([...value, { farm: f, roles: [] }]);
    }
  };

  const toggleRoleFor = (f: string, r: string) => {
    onChange(
      value.map((v) =>
        v.farm === f
          ? { ...v, roles: v.roles.includes(r) ? v.roles.filter((x) => x !== r) : [...v.roles, r] }
          : v,
      ),
    );
  };

  const addRoleToFarm = (f: string, r: string) => {
    onChange(
      value.map((v) =>
        v.farm === f && !v.roles.includes(r) ? { ...v, roles: [...v.roles, r] } : v,
      ),
    );
  };

  return (
    <div className="rounded-md border border-border bg-surface-subtle">
      <div className="relative p-2 border-b border-border">
        <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="输入牧场名称搜索"
          className="h-8 pl-8 text-body-sm bg-card"
        />
      </div>
      <div className="max-h-40 overflow-y-auto p-2 space-y-1">
        {filteredFarms.length === 0 ? (
          <div className="text-caption text-text-tertiary text-center py-3">无匹配牧场</div>
        ) : (
          filteredFarms.map((f) => (
            <label
              key={f}
              className="flex items-center gap-2 cursor-pointer text-body-sm px-1.5 py-1 rounded hover:bg-card"
            >
              <Checkbox checked={selectedMap.has(f)} onCheckedChange={() => toggleFarm(f)} />
              <span className="text-foreground">{f}</span>
            </label>
          ))
        )}
      </div>

      {value.length > 0 && (
        <div className="border-t border-border p-2 space-y-2">
          <div className="text-caption text-text-tertiary">为每个关联牧场选择角色（可多选，可输入新建）</div>
          <div className="space-y-1.5">
            {value.map((fr) => (
              <div key={fr.farm} className="flex items-start gap-2">
                <span className="tag tag-muted whitespace-nowrap shrink-0 mt-1.5">{fr.farm}</span>
                <div className="flex-1 min-w-0">
                  <RoleCombobox
                    allRoles={roles}
                    selected={fr.roles}
                    onToggle={(r) => toggleRoleFor(fr.farm, r)}
                    onCreate={(r) => {
                      onCreateRole(r);
                      addRoleToFarm(fr.farm, r);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFarm(fr.farm)}
                  className="h-8 w-8 text-text-tertiary hover:text-destructive shrink-0 mt-0.5"
                  aria-label="移除"
                >
                  <Unlink className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <p className="text-caption text-text-tertiary leading-relaxed">
              提示：同一牧场下可分配多个角色，功能权限与数据权限均取所有角色的并集。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// 单牧场角色组合框：可搜索匹配、勾选已有角色，也可输入新角色名直接创建
function RoleCombobox({
  allRoles,
  selected,
  onToggle,
  onCreate,
}: {
  allRoles: string[];
  selected: string[];
  onToggle: (r: string) => void;
  onCreate: (r: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const kw = query.trim();
  const matched = useMemo(() => {
    if (!kw) return allRoles;
    return allRoles.filter((r) => r.toLowerCase().includes(kw.toLowerCase()));
  }, [allRoles, kw]);
  const exact = allRoles.some((r) => r === kw);
  const canCreate = kw.length > 0 && !exact;

  const handleCreate = () => {
    if (!canCreate) return;
    if (kw.length > 6) {
      toast.error("角色名称不超过 6 个字");
      return;
    }
    onCreate(kw);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full min-h-9 px-2 py-1 text-left rounded-md border border-border bg-card text-body-sm hover:border-primary/40 flex items-center gap-1.5"
        >
          <div className="flex-1 flex flex-wrap items-center gap-1 min-w-0">
            {selected.length === 0 ? (
              <span className="text-text-tertiary">选择或输入角色</span>
            ) : (
              selected.map((r) => (
                <span key={r} className="tag tag-brand whitespace-nowrap">{r}</span>
              ))
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={(v) => setQuery(v.slice(0, 6))}
            placeholder="搜索或输入新角色名"
            className="text-body-sm"
          />
          <CommandList>
            {matched.length === 0 && !canCreate && (
              <CommandEmpty>无匹配角色</CommandEmpty>
            )}
            {matched.length > 0 && (
              <CommandGroup heading="选择角色">
                {matched.map((r) => {
                  const checked = selected.includes(r);
                  return (
                    <CommandItem
                      key={r}
                      value={r}
                      onSelect={() => onToggle(r)}
                      className="text-body-sm flex items-center gap-2"
                    >
                      <Checkbox checked={checked} className="pointer-events-none" />
                      <span className="flex-1">{r}</span>
                      {checked && <Check className="h-3.5 w-3.5 text-primary" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {canCreate && (
              <CommandGroup heading="新建">
                <CommandItem
                  value={`__create__${kw}`}
                  onSelect={handleCreate}
                  className="text-body-sm flex items-center gap-2 text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>新建角色「{kw}」</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


function AccountDrawer({
  account,
  mode,
  onModeChange,
  internalRoles,
  externalRoles,
  onClose,
  onSave,
  onCreateRole,
  userTypeTagClass,
}: {
  account: Account | null;
  mode: "detail" | "edit";
  onModeChange: (m: "detail" | "edit") => void;
  internalRoles: string[];
  externalRoles: string[];
  onClose: () => void;
  onSave: (a: Account) => void;
  onCreateRole: (type: UserType, r: string) => void;
  userTypeTagClass: (t: UserType) => string;
}) {
  return (
    <Sheet open={!!account} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0 flex flex-col gap-0">
        {account && (
          <AccountDrawerInner
            key={account.id}
            account={account}
            mode={mode}
            onModeChange={onModeChange}
            internalRoles={internalRoles}
            externalRoles={externalRoles}
            onClose={onClose}
            onSave={onSave}
            onCreateRole={onCreateRole}
            userTypeTagClass={userTypeTagClass}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function AccountDrawerInner({
  account,
  mode,
  onModeChange,
  internalRoles,
  externalRoles,
  onClose,
  onSave,
  onCreateRole,
  userTypeTagClass,
}: {
  account: Account;
  mode: "detail" | "edit";
  onModeChange: (m: "detail" | "edit") => void;
  internalRoles: string[];
  externalRoles: string[];
  onClose: () => void;
  onSave: (a: Account) => void;
  onCreateRole: (type: UserType, r: string) => void;
  userTypeTagClass: (t: UserType) => string;
}) {
  const editable = mode === "edit";

  const [phone, setPhone] = useState(account.phone);
  const [userType, setUserType] = useState<UserType>(account.userType);
  const [org, setOrg] = useState(account.org);
  const [farmRoles, setFarmRoles] = useState<FarmRole[]>(account.farmRoles);
  const [wecomId, setWecomId] = useState<string | null>(account.wecomId);
  const [wechatId, setWechatId] = useState<string | null>(account.wechatId);

  const orgValue = ORG_OPTIONS.includes(org) ? org : ORG_OPTIONS[0];
  const baseRoles = userType === "内部" ? internalRoles : externalRoles;
  const availableRoles = useMemo(() => {
    const set = new Set(baseRoles);
    farmRoles.forEach((fr) => fr.roles.forEach((r) => baseRoles.includes(r) && set.add(r)));
    return Array.from(set);
  }, [baseRoles, farmRoles]);

  const incomplete = farmRoles.some((fr) => fr.roles.length === 0);
  const canSave = farmRoles.length > 0 && !incomplete;

  return (
    <>
      <SheetHeader className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-brand-subtle flex items-center justify-center shrink-0 text-primary text-body font-medium">
              {account.initial}
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-card-title text-foreground truncate text-left">
                {account.name} · {editable ? "编辑" : "详情"}
              </SheetTitle>
              <SheetDescription className="text-caption text-text-tertiary text-left font-mono">
                {account.id}
              </SheetDescription>
            </div>
          </div>
          {!editable && (
            <button
              className="h-8 px-2 text-body-sm font-normal text-primary hover:underline"
              onClick={() => onModeChange("edit")}
            >
              编辑
            </button>
          )}
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        {/* 基础信息 */}
        <section className="px-6 py-5 border-b border-border space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-primary" />
            <h4 className="text-body font-medium text-foreground">基础信息</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-caption text-text-tertiary">姓名</Label>
              <div className="mt-1.5">
                {editable ? (
                  <Input value={account.name} disabled className="h-9 bg-card border-border text-body-sm" />
                ) : (
                  <div className="text-body text-foreground">{account.name}</div>
                )}
              </div>
            </div>
            <div>
              <Label className="text-caption text-text-tertiary">人员类型</Label>
              <div className="mt-1.5">
                {editable ? (
                  <Select
                    value={userType}
                    onValueChange={(v) => {
                      const next = v as UserType;
                      if (next !== userType) {
                        setUserType(next);
                        setFarmRoles((cur) => cur.map((fr) => ({ ...fr, roles: [] })));
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-body-sm bg-card border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="内部" className="text-body-sm">内部</SelectItem>
                      <SelectItem value="外部" className="text-body-sm">外部</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={`tag ${userTypeTagClass(account.userType)}`}>{account.userType}</span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-caption text-text-tertiary">手机号</Label>
              <div className="mt-1.5">
                {editable ? (
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 bg-card border-border text-body-sm tabular-nums" />
                ) : (
                  <div className="text-body text-foreground tabular-nums">{account.phone}</div>
                )}
              </div>
            </div>
            <div>
              <Label className="text-caption text-text-tertiary">所属组织</Label>
              <div className="mt-1.5">
                {editable ? (
                  <Select value={orgValue} onValueChange={setOrg}>
                    <SelectTrigger className="h-9 text-body-sm bg-card border-border"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORG_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o} className="text-body-sm">{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-body text-foreground">{account.org}</div>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-caption text-text-tertiary">状态</Label>
              <div className="mt-1.5">
                <span className={`tag ${account.status === "启用" ? "tag-success" : "tag-muted"}`}>{account.status}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 关联牧场 / 角色 */}
        <section className="px-6 py-5 border-b border-border space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-primary" />
              <h4 className="text-body font-medium text-foreground">关联牧场 / 角色</h4>
            </div>
            {editable && (
              <span className="text-caption text-text-tertiary">已选 {farmRoles.length} 个牧场</span>
            )}
          </div>

          {editable ? (
            <>
              <FarmRolePicker
                value={farmRoles}
                onChange={setFarmRoles}
                roles={availableRoles}
                onCreateRole={(r) => onCreateRole(userType, r)}
              />
              {incomplete && (
                <p className="text-caption text-warning">请为每个关联牧场选择至少一个角色后再保存</p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {account.farmRoles.length === 0 ? (
                <span className="tag tag-muted">未关联</span>
              ) : (
                account.farmRoles.map((fr) => (
                  <div key={fr.farm} className="flex items-center gap-2 flex-wrap">
                    <span className="tag tag-muted whitespace-nowrap">{fr.farm}</span>
                    {fr.roles.length === 0 ? (
                      <span className="tag tag-muted">未分配</span>
                    ) : (
                      fr.roles.map((r) => (
                        <span key={r} className="tag tag-brand whitespace-nowrap">{r}</span>
                      ))
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* 绑定 ID */}
        <section className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-primary" />
            <h4 className="text-body font-medium text-foreground">第三方绑定</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BindRow
              label="企微 ID"
              value={editable ? wecomId : account.wecomId}
              editable={editable}
              onUnbind={() => setWecomId(null)}
              hint={editable && !wecomId && account.wecomId ? "保存后该用户需重新通过企业微信扫码绑定" : null}
            />
            <BindRow
              label="微信 ID"
              value={editable ? wechatId : account.wechatId}
              editable={editable}
              onUnbind={() => setWechatId(null)}
              hint={editable && !wechatId && account.wechatId ? "保存后该用户需重新通过微信扫码绑定" : null}
            />
          </div>
        </section>
      </div>

      {editable && (
        <SheetFooter className="px-6 py-3 border-t border-border bg-card">
          <Button variant="outline" onClick={onClose} className="h-9 text-body-sm font-normal">取消</Button>
          <Button
            disabled={!canSave}
            onClick={() => onSave({ ...account, phone, userType, org, farmRoles, wecomId, wechatId })}
            className="h-9 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
            保存
          </Button>
        </SheetFooter>
      )}
    </>
  );
}

function BindRow({
  label,
  value,
  editable,
  onUnbind,
  hint,
}: {
  label: string;
  value: string | null;
  editable: boolean;
  onUnbind: () => void;
  hint: string | null;
}) {
  return (
    <div>
      <Label className="text-caption text-text-tertiary">{label}</Label>
      <div className="mt-1.5 flex items-center justify-between gap-2 rounded-md border border-border bg-surface-subtle px-3 h-9">
        {value ? (
          <>
            <span className="text-body-sm font-mono text-text-secondary truncate" title="已脱敏显示">{maskId(value)}</span>
            {editable && (
              <Button type="button" variant="ghost" size="sm" onClick={onUnbind} className="h-7 gap-1 text-caption text-destructive hover:text-destructive">
                <Unlink className="h-3 w-3" /> 解绑
              </Button>
            )}
          </>
        ) : (
          <span className="tag tag-muted">未绑定</span>
        )}
      </div>
      {hint && <p className="mt-1 text-caption text-text-tertiary">{hint}</p>}
    </div>
  );
}


function CreateDialog({
  internalRoles,
  externalRoles,
  onClose,
  onCreate,
  onCreateRole,
}: {
  internalRoles: string[];
  externalRoles: string[];
  onClose: () => void;
  onCreate: (a: Omit<Account, "id" | "initial">, newRoleCreated: string | null) => void;
  onCreateRole: (type: UserType, r: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<UserType>("外部");
  const [org, setOrg] = useState(ORG_OPTIONS[0]);
  const [farmRoles, setFarmRoles] = useState<FarmRole[]>([]);

  const baseRoles = userType === "内部" ? internalRoles : externalRoles;
  // 切换人员类型时，清空已选角色（保留牧场选择）
  const handleUserTypeChange = (v: UserType) => {
    setUserType(v);
    setFarmRoles((cur) => cur.map((fr) => ({ ...fr, roles: [] })));
  };

  const incomplete = farmRoles.some((fr) => fr.roles.length === 0);
  const canSubmit = !!name.trim() && !!phone.trim() && farmRoles.length > 0 && !incomplete;

  const submit = () => {
    if (!canSubmit) return;
    const firstNewRole =
      farmRoles.flatMap((fr) => fr.roles).find((r) => !baseRoles.includes(r)) ?? null;
    onCreate(
      {
        name: name.trim(),
        phone: phone.trim(),
        userType,
        org,
        farmRoles,
        wecomId: null,
        wechatId: null,

        status: "启用",
        createdAt: new Date().toISOString().slice(0, 10),
      },
      firstNewRole,
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建账号</DialogTitle>
          <DialogDescription>维护内部或外部人员账号，并为每个关联牧场指定角色</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-body-sm text-text-secondary">姓名</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" placeholder="请输入" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-body-sm text-text-secondary">手机号</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 tabular-nums" placeholder="11 位手机号" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">人员类型</Label>
            <Select value={userType} onValueChange={(v) => handleUserTypeChange(v as UserType)}>
              <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="内部" className="text-body-sm">内部</SelectItem>
                <SelectItem value="外部" className="text-body-sm">外部</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">所属组织</Label>
            <Select value={org} onValueChange={setOrg}>
              <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORG_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o} className="text-body-sm">{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-body-sm text-text-secondary">关联牧场 / 角色</Label>
              <span className="text-caption text-text-tertiary">已选 {farmRoles.length} 个</span>
            </div>
            <FarmRolePicker
              value={farmRoles}
              onChange={setFarmRoles}
              roles={baseRoles}
              onCreateRole={(r) => onCreateRole(userType, r)}
            />
            <p className="text-caption text-text-tertiary">
              勾选牧场后请为每个牧场指定角色；当前为「{userType}」人员，可在右上方输入新角色名创建。
            </p>
            {incomplete && (
              <p className="text-caption text-warning">请为每个关联牧场选择角色后再创建</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="h-9">取消</Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            className="h-9 bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
            创建账号
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
