import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organization/account")({
  head: () => ({ meta: [{ title: "账号管理 — 奇点智牧" }] }),
  component: AccountPage,
});

type Status = "启用" | "禁用";
type UserType = "内部" | "外部";
type FarmRole = { farm: string; role: string };
type Account = {
  id: string;
  name: string;
  initial: string;
  phone: string;
  userType: UserType;
  org: string;
  farmRoles: FarmRole[]; // 每个关联牧场对应一个角色
  wecomId: string | null;
  status: Status;
  createdAt: string;
};

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
  { id: "U001", name: "张磊", initial: "ZL", phone: "138****6201", userType: "内部", org: "1 号牧场", farmRoles: [{ farm: "1 号牧场", role: "场长" }], wecomId: "wm_zhanglei_8821", status: "启用", createdAt: "2024-03-08" },
  { id: "U002", name: "李雨晴", initial: "LY", phone: "139****3018", userType: "内部", org: "1 号牧场 / 兽医部", farmRoles: [{ farm: "1 号牧场", role: "兽医" }, { farm: "2 号牧场", role: "兽医助理" }], wecomId: "wm_liyuqing_3210", status: "启用", createdAt: "2024-06-21" },
  { id: "U003", name: "陈晓东", initial: "CX", phone: "137****8520", userType: "内部", org: "1 号牧场 / 巡检 A 组", farmRoles: [{ farm: "1 号牧场", role: "技术员" }], wecomId: null, status: "启用", createdAt: "2025-09-12" },
  { id: "U004", name: "王仓管", initial: "WC", phone: "136****4302", userType: "内部", org: "1 号牧场 / 仓储部", farmRoles: [{ farm: "1 号牧场", role: "仓管员" }, { farm: "2 号牧场", role: "仓管员" }, { farm: "3 号牧场", role: "技术员" }], wecomId: "wm_wangck_5601", status: "启用", createdAt: "2026-02-04" },
  { id: "U005", name: "孙库管", initial: "SK", phone: "135****9012", userType: "内部", org: "2 号牧场 / 仓储部", farmRoles: [{ farm: "2 号牧场", role: "仓管员" }], wecomId: null, status: "禁用", createdAt: "2026-04-30" },
  { id: "U006", name: "赵修蹄", initial: "ZX", phone: "134****7788", userType: "外部", org: "外部合作 / 修蹄队", farmRoles: [{ farm: "1 号牧场", role: "修蹄工" }, { farm: "3 号牧场", role: "修蹄工" }, { farm: "金辉牧场", role: "普修工" }], wecomId: "wm_zhaoxt_9912", status: "启用", createdAt: "2025-11-18" },
  { id: "U007", name: "刘技师", initial: "LJ", phone: "133****5566", userType: "外部", org: "外部合作 / 干奶服务队", farmRoles: [{ farm: "2 号牧场", role: "干奶工" }], wecomId: null, status: "启用", createdAt: "2026-05-09" },
];

// 辅助：从 farmRoles 派生
const farmsOf = (a: Pick<Account, "farmRoles">) => a.farmRoles.map((x) => x.farm);
const rolesOf = (a: Pick<Account, "farmRoles">) =>
  Array.from(new Set(a.farmRoles.map((x) => x.role)));

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
  const [viewing, setViewing] = useState<Account | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

  // 筛选状态
  const [keyword, setKeyword] = useState("");
  const [onlyInternal, setOnlyInternal] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterFarm, setFilterFarm] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");
  const [advOpen, setAdvOpen] = useState(false);

  const resetAdv = () => {
    setFilterRole("all");
    setFilterFarm("all");
    setFilterStatus("all");
  };

  const advCount =
    (filterRole !== "all" ? 1 : 0) +
    (filterFarm !== "all" ? 1 : 0) +
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
    setEditing(null);
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
        if (filterFarm !== "all" && !farmsOf(a).includes(filterFarm)) return false;
        if (filterStatus !== "all" && a.status !== filterStatus) return false;
        if (kw) {
          const hay = `${a.name} ${a.phone} ${a.wecomId ?? ""}`.toLowerCase();
          if (!hay.includes(kw)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "启用" ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [accounts, keyword, onlyInternal, filterRole, filterFarm, filterStatus]);

  // 列宽：用户 类型 手机号 角色 关联牧场 企微ID 状态 管理
  const cols = "1.8fr 1.1fr 1.3fr 0.9fr 1.7fr 1.5fr 0.8fr 0.5fr";

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
                placeholder="搜索姓名 / 手机号 / 企微ID"
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
                  <Select value={filterFarm} onValueChange={setFilterFarm}>
                    <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectItem value="all" className="text-body-sm">全部牧场</SelectItem>
                      {FARM_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f} className="text-body-sm">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <div>状态</div>
            <div className="text-right">管理</div>
          </div>
          {filteredAccounts.map((a) => (
            <div key={a.id} className="grid gap-3 px-6 h-14 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle"
              style={{ gridTemplateColumns: cols }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-brand-subtle text-primary text-body-sm">{a.initial}</AvatarFallback></Avatar>
                <div className="leading-tight min-w-0">
                  <div className="text-body text-foreground truncate">{a.name}</div>
                  <div className="text-caption text-text-tertiary font-mono">{a.id}</div>
                </div>
              </div>
              <div><span className={`tag ${userTypeTagClass(a.userType)}`}>{a.userType}</span></div>
              <div className="text-body-sm text-text-secondary tabular-nums">{a.phone}</div>
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                {(() => {
                  const rs = rolesOf(a);
                  if (rs.length === 0) return <span className="tag tag-muted">未分配</span>;
                  return (
                    <>
                      <span className="tag tag-brand whitespace-nowrap">{rs[0]}</span>
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
                      <span className="tag tag-muted whitespace-nowrap">{fs[0]}</span>
                      {fs.length > 1 && (
                        <span
                          className="tag tag-muted whitespace-nowrap"
                          title={a.farmRoles.slice(1).map((x) => `${x.farm}（${x.role}）`).join("、")}
                        >
                          +{fs.length - 1}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="text-body-sm tabular-nums truncate">
                {a.wecomId ? (
                  <span className="text-text-secondary font-mono">{a.wecomId}</span>
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
                    <DropdownMenuItem onClick={() => setViewing(a)} className="gap-2 text-body-sm">
                      <Eye className="h-3.5 w-3.5" /> 查看
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditing(a)} className="gap-2 text-body-sm">
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

      {/* 查看 */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>账号详情</DialogTitle>
            <DialogDescription>查看用户账号的基础信息</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-body-sm">
              <DetailRow label="用户编号" value={<span className="font-mono">{viewing.id}</span>} />
              <DetailRow label="姓名" value={viewing.name} />
              <DetailRow label="人员类型" value={<span className={`tag ${userTypeTagClass(viewing.userType)}`}>{viewing.userType}</span>} />
              <DetailRow label="手机号" value={<span className="tabular-nums">{viewing.phone}</span>} />
              <DetailRow label="所属组织" value={viewing.org} />
              <DetailRow
                label="关联牧场 / 角色"
                value={
                  <div className="flex flex-col items-end gap-1">
                    {viewing.farmRoles.length === 0 ? (
                      <span className="tag tag-muted">未关联</span>
                    ) : (
                      viewing.farmRoles.map((fr) => (
                        <div key={fr.farm} className="flex items-center gap-1.5">
                          <span className="tag tag-muted whitespace-nowrap">{fr.farm}</span>
                          <span className="tag tag-brand whitespace-nowrap">{fr.role}</span>
                        </div>
                      ))
                    )}
                  </div>
                }
              />
              <DetailRow
                label="企微 ID"
                value={
                  viewing.wecomId ? (
                    <span className="font-mono text-text-secondary">{viewing.wecomId}</span>
                  ) : (
                    <span className="tag tag-muted">未绑定</span>
                  )
                }
              />
              <DetailRow
                label="状态"
                value={<span className={`tag ${viewing.status === "启用" ? "tag-success" : "tag-muted"}`}>{viewing.status}</span>}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑 */}
      {editing && (
        <EditDialog
          account={editing}
          internalRoles={internalRoles}
          externalRoles={externalRoles}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          onCreateRole={addRoleFor}
        />
      )}

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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border last:border-0">
      <span className="text-text-tertiary shrink-0">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
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
  const [newRole, setNewRole] = useState("");
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return FARM_OPTIONS;
    return FARM_OPTIONS.filter((f) => f.toLowerCase().includes(kw));
  }, [q]);

  const selectedMap = useMemo(() => {
    const m = new Map<string, string>();
    value.forEach((v) => m.set(v.farm, v.role));
    return m;
  }, [value]);

  const toggleFarm = (f: string) => {
    if (selectedMap.has(f)) {
      onChange(value.filter((v) => v.farm !== f));
    } else {
      onChange([...value, { farm: f, role: "" }]);
    }
  };

  const setRoleFor = (f: string, r: string) => {
    onChange(value.map((v) => (v.farm === f ? { ...v, role: r } : v)));
  };

  const addNewRole = () => {
    const r = newRole.trim();
    if (!r) return;
    if (!roles.includes(r)) onCreateRole(r);
    setNewRole("");
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
        {filtered.length === 0 ? (
          <div className="text-caption text-text-tertiary text-center py-3">无匹配牧场</div>
        ) : (
          filtered.map((f) => (
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
          <div className="flex items-center justify-between">
            <div className="text-caption text-text-tertiary">为每个关联牧场选择角色</div>
            <div className="flex items-center gap-1">
              <Input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNewRole();
                  }
                }}
                placeholder="新增角色名"
                className="h-7 w-28 text-caption bg-card"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addNewRole}
                disabled={!newRole.trim()}
                className="h-7 px-2 text-caption text-primary hover:text-primary"
              >
                <Sparkles className="h-3 w-3 mr-0.5" /> 新建
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            {value.map((fr) => (
              <div key={fr.farm} className="flex items-center gap-2">
                <span className="tag tag-muted whitespace-nowrap shrink-0">{fr.farm}</span>
                <Select value={fr.role} onValueChange={(v) => setRoleFor(fr.farm, v)}>
                  <SelectTrigger className="h-8 text-body-sm bg-card flex-1">
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r} className="text-body-sm">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFarm(fr.farm)}
                  className="h-7 w-7 text-text-tertiary hover:text-destructive shrink-0"
                  aria-label="移除"
                >
                  <Unlink className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EditDialog({
  account,
  internalRoles,
  externalRoles,
  onClose,
  onSave,
  onCreateRole,
}: {
  account: Account;
  internalRoles: string[];
  externalRoles: string[];
  onClose: () => void;
  onSave: (a: Account) => void;
  onCreateRole: (type: UserType, r: string) => void;
}) {
  const [phone, setPhone] = useState(account.phone);
  const [userType, setUserType] = useState<UserType>(account.userType);
  const [org, setOrg] = useState(account.org);
  const [farmRoles, setFarmRoles] = useState<FarmRole[]>(account.farmRoles);
  const [wecomId, setWecomId] = useState<string | null>(account.wecomId);

  const orgValue = ORG_OPTIONS.includes(org) ? org : ORG_OPTIONS[0];
  const baseRoles = userType === "内部" ? internalRoles : externalRoles;
  // 切换人员类型时，已选 farmRoles 中不属于当前类型角色的清空，避免脏数据
  const availableRoles = useMemo(() => {
    const set = new Set(baseRoles);
    farmRoles.forEach((fr) => fr.role && baseRoles.includes(fr.role) && set.add(fr.role));
    return Array.from(set);
  }, [baseRoles, farmRoles]);

  const incomplete = farmRoles.some((fr) => !fr.role);
  const canSave = farmRoles.length > 0 && !incomplete;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑账号</DialogTitle>
          <DialogDescription>修改手机号、所属组织、关联牧场及对应角色或解绑企微 ID</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">姓名</Label>
            <Input value={account.name} disabled className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">人员类型</Label>
            <Select value={userType} onValueChange={(v) => setUserType(v as UserType)}>
              <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="内部" className="text-body-sm">内部</SelectItem>
                <SelectItem value="外部" className="text-body-sm">外部</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone" className="text-body-sm text-text-secondary">手机号</Label>
            <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 tabular-nums" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">所属组织</Label>
            <Select value={orgValue} onValueChange={setOrg}>
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
              <span className="text-caption text-text-tertiary">
                已选 {farmRoles.length} 个{farmRoles.length > 1 ? "（可在牧场间切换）" : ""}
              </span>
            </div>
            <FarmRolePicker
              value={farmRoles}
              onChange={setFarmRoles}
              roles={availableRoles}
              onCreateRole={(r) => onCreateRole(userType, r)}
            />
            {incomplete && (
              <p className="text-caption text-warning">请为每个关联牧场选择角色后再保存</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">企微 ID</Label>
            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-subtle px-3 h-9">
              {wecomId ? (
                <>
                  <span className="text-body-sm font-mono text-text-secondary truncate">{wecomId}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setWecomId(null)} className="h-7 gap-1 text-caption text-destructive hover:text-destructive">
                    <Unlink className="h-3 w-3" /> 解绑
                  </Button>
                </>
              ) : (
                <span className="tag tag-muted">未绑定</span>
              )}
            </div>
            {!wecomId && account.wecomId && (
              <p className="text-caption text-text-tertiary">保存后该用户需重新通过企业微信扫码绑定</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="h-9">取消</Button>
          <Button
            disabled={!canSave}
            onClick={() => onSave({ ...account, phone, userType, org, farmRoles, wecomId })}
            className="h-9 bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    setFarmRoles((cur) => cur.map((fr) => ({ ...fr, role: "" })));
  };

  const incomplete = farmRoles.some((fr) => !fr.role);
  const canSubmit = !!name.trim() && !!phone.trim() && farmRoles.length > 0 && !incomplete;

  const submit = () => {
    if (!canSubmit) return;
    const firstNewRole =
      farmRoles.map((fr) => fr.role).find((r) => !baseRoles.includes(r)) ?? null;
    onCreate(
      {
        name: name.trim(),
        phone: phone.trim(),
        userType,
        org,
        farmRoles,
        wecomId: null,
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
