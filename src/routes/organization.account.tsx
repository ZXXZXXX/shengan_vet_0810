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
type Account = {
  id: string;
  name: string;
  initial: string;
  phone: string;
  userType: UserType;
  role: string;
  org: string;
  farms: string[];
  wecomId: string | null;
  status: Status;
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
  "外部机构 / 兽药供应商",
];

const DEFAULT_ROLES = ["场长", "兽医", "兽医助理", "技术员", "仓管员", "修蹄工", "供应商联系人"];

const initialAccounts: Account[] = [
  { id: "U001", name: "张磊", initial: "ZL", phone: "138****6201", userType: "内部", role: "场长", org: "1 号牧场", farms: ["1 号牧场"], wecomId: "wm_zhanglei_8821", status: "启用" },
  { id: "U002", name: "李雨晴", initial: "LY", phone: "139****3018", userType: "内部", role: "兽医", org: "1 号牧场 / 兽医部", farms: ["1 号牧场", "2 号牧场"], wecomId: "wm_liyuqing_3210", status: "启用" },
  { id: "U003", name: "陈晓东", initial: "CX", phone: "137****8520", userType: "内部", role: "技术员", org: "1 号牧场 / 巡检 A 组", farms: ["1 号牧场"], wecomId: null, status: "启用" },
  { id: "U004", name: "王仓管", initial: "WC", phone: "136****4302", userType: "内部", role: "仓管员", org: "1 号牧场 / 仓储部", farms: ["1 号牧场", "2 号牧场", "3 号牧场"], wecomId: "wm_wangck_5601", status: "启用" },
  { id: "U005", name: "孙库管", initial: "SK", phone: "135****9012", userType: "内部", role: "仓管员", org: "2 号牧场 / 仓储部", farms: ["2 号牧场"], wecomId: null, status: "禁用" },
  { id: "U006", name: "赵修蹄", initial: "ZX", phone: "134****7788", userType: "外部", role: "修蹄工", org: "外部合作 / 修蹄队", farms: ["1 号牧场", "3 号牧场", "金辉牧场"], wecomId: "wm_zhaoxt_9912", status: "启用" },
  { id: "U007", name: "刘技师", initial: "LJ", phone: "133****5566", userType: "外部", role: "供应商联系人", org: "外部机构 / 兽药供应商", farms: ["2 号牧场"], wecomId: null, status: "启用" },
];

function AccountPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES);
  const [viewing, setViewing] = useState<Account | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

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
      setRoles((rs) => (rs.includes(newRoleCreated) ? rs : [...rs, newRoleCreated]));
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

  // 列宽：用户 类型 手机号 角色 关联牧场 企微ID 状态 管理
  const cols = "1.8fr 1.1fr 1.3fr 0.9fr 1.7fr 1.5fr 0.8fr 0.5fr";

  return (
    <>
      <AppHeader title="账号管理" breadcrumb={["组织管理", "账号管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索姓名 / 手机号 / 企微ID" className="h-9 w-72 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <Filter className="h-3.5 w-3.5" /> 人员类型
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <Filter className="h-3.5 w-3.5" /> 关联牧场
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
              <Filter className="h-3.5 w-3.5" /> 角色
            </Button>
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
          {accounts.map((a) => (
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
              <div className="text-body-sm text-text-secondary truncate">{a.role}</div>
              <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                {a.farms.length === 0 ? (
                  <span className="tag tag-muted">未关联</span>
                ) : a.farms.length === 1 ? (
                  <span className="tag tag-muted whitespace-nowrap">{a.farms[0]}</span>
                ) : (
                  <>
                    <span className="tag tag-muted whitespace-nowrap">{a.farms[0]}</span>
                    <span
                      className="tag tag-muted whitespace-nowrap"
                      title={a.farms.slice(1).join("、")}
                    >
                      +{a.farms.length - 1}
                    </span>
                  </>
                )}
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
              <DetailRow label="角色" value={<span className="tag tag-brand">{viewing.role}</span>} />
              <DetailRow label="所属组织" value={viewing.org} />
              <DetailRow
                label="关联牧场"
                value={
                  <div className="flex flex-wrap justify-end gap-1">
                    {viewing.farms.length === 0 ? (
                      <span className="tag tag-muted">未关联</span>
                    ) : (
                      viewing.farms.map((f) => (
                        <span key={f} className="tag tag-muted">{f}</span>
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
          roles={roles}
          onClose={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}

      {/* 新建 */}
      {creating && (
        <CreateDialog
          roles={roles}
          onClose={() => setCreating(false)}
          onCreate={handleCreate}
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

// 可搜索的牧场多选
function FarmPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (f: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return FARM_OPTIONS;
    return FARM_OPTIONS.filter((f) => f.toLowerCase().includes(kw));
  }, [q]);

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
      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-caption text-text-tertiary text-center py-3">无匹配牧场</div>
        ) : (
          filtered.map((f) => (
            <label
              key={f}
              className="flex items-center gap-2 cursor-pointer text-body-sm px-1.5 py-1 rounded hover:bg-card"
            >
              <Checkbox checked={selected.includes(f)} onCheckedChange={() => onToggle(f)} />
              <span className="text-foreground">{f}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 border-t border-border">
          {selected.map((f) => (
            <span key={f} className="tag tag-muted whitespace-nowrap">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function EditDialog({
  account,
  roles,
  onClose,
  onSave,
}: {
  account: Account;
  roles: string[];
  onClose: () => void;
  onSave: (a: Account) => void;
}) {
  const [phone, setPhone] = useState(account.phone);
  const [userType, setUserType] = useState<UserType>(account.userType);
  const [role, setRole] = useState(account.role);
  const [org, setOrg] = useState(account.org);
  const [farms, setFarms] = useState<string[]>(account.farms);
  const [wecomId, setWecomId] = useState<string | null>(account.wecomId);

  const orgValue = ORG_OPTIONS.includes(org) ? org : ORG_OPTIONS[0];
  const roleOptions = roles.includes(role) ? roles : [...roles, role];

  const toggleFarm = (f: string) => {
    setFarms((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑账号</DialogTitle>
          <DialogDescription>修改用户的手机号、所属组织、关联牧场或解绑企微 ID</DialogDescription>
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
            <Label className="text-body-sm text-text-secondary">角色</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-9 text-body-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r} value={r} className="text-body-sm">{r}</SelectItem>
                ))}
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
              <Label className="text-body-sm text-text-secondary">关联牧场</Label>
              <span className="text-caption text-text-tertiary">
                已选 {farms.length} 个{farms.length > 1 ? "（可在牧场间切换）" : farms.length === 1 ? "（仅访问该牧场数据）" : ""}
              </span>
            </div>
            <FarmPicker selected={farms} onToggle={toggleFarm} />
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
            onClick={() => onSave({ ...account, phone, userType, role, org, farms, wecomId })}
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
  roles,
  onClose,
  onCreate,
}: {
  roles: string[];
  onClose: () => void;
  onCreate: (a: Omit<Account, "id" | "initial">, newRoleCreated: string | null) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<UserType>("外部");
  const [roleQuery, setRoleQuery] = useState("");
  const [role, setRole] = useState<string>("");
  const [org, setOrg] = useState(ORG_OPTIONS[0]);
  const [farms, setFarms] = useState<string[]>([]);

  const toggleFarm = (f: string) => {
    setFarms((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  };

  const filteredRoles = useMemo(() => {
    const kw = roleQuery.trim().toLowerCase();
    if (!kw) return roles;
    return roles.filter((r) => r.toLowerCase().includes(kw));
  }, [roleQuery, roles]);

  const trimmedQuery = roleQuery.trim();
  const isNewRole =
    trimmedQuery.length > 0 && !roles.some((r) => r.toLowerCase() === trimmedQuery.toLowerCase());
  const effectiveRole = role || (isNewRole ? trimmedQuery : "");

  const canSubmit = name.trim() && phone.trim() && effectiveRole && farms.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const newRoleCreated = !roles.includes(effectiveRole) ? effectiveRole : null;
    onCreate(
      {
        name: name.trim(),
        phone: phone.trim(),
        userType,
        role: effectiveRole,
        org,
        farms,
        wecomId: null,
        status: "启用",
      },
      newRoleCreated,
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新建账号</DialogTitle>
          <DialogDescription>维护内部或外部人员账号</DialogDescription>
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
            <Select value={userType} onValueChange={(v) => setUserType(v as UserType)}>
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

          {/* 可搜索 / 可新建 的角色选择 */}
          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">
              角色
              {userType !== "内部" && (
                <span className="ml-1 text-caption text-text-tertiary">（找不到合适角色可直接输入名称创建）</span>
              )}
            </Label>
            <div className="rounded-md border border-border bg-surface-subtle">
              <div className="relative p-2 border-b border-border">
                <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <Input
                  value={roleQuery}
                  onChange={(e) => {
                    setRoleQuery(e.target.value);
                    setRole("");
                  }}
                  placeholder="搜索或输入新角色名"
                  className="h-8 pl-8 text-body-sm bg-card"
                />
              </div>
              <div className="max-h-40 overflow-y-auto p-1.5">
                {filteredRoles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setRoleQuery(r); }}
                    className={`w-full text-left px-2 py-1.5 rounded text-body-sm hover:bg-card ${role === r ? "bg-brand-subtle text-primary" : "text-foreground"}`}
                  >
                    {r}
                  </button>
                ))}
                {isNewRole && (
                  <button
                    type="button"
                    onClick={() => setRole(trimmedQuery)}
                    className={`w-full text-left px-2 py-1.5 rounded text-body-sm flex items-center gap-1.5 ${role === trimmedQuery ? "bg-brand-subtle text-primary" : "text-primary hover:bg-card"}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    创建新角色「{trimmedQuery}」
                  </button>
                )}
                {filteredRoles.length === 0 && !isNewRole && (
                  <div className="text-caption text-text-tertiary text-center py-3">输入角色名以创建</div>
                )}
              </div>
            </div>
            {effectiveRole && !roles.includes(effectiveRole) && (
              <p className="text-caption text-warning">
                将创建新角色「{effectiveRole}」，该角色暂无任何权限，需在「角色权限」中完成配置。
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-body-sm text-text-secondary">关联牧场</Label>
              <span className="text-caption text-text-tertiary">已选 {farms.length} 个</span>
            </div>
            <FarmPicker selected={farms} onToggle={toggleFarm} />
            <p className="text-caption text-text-tertiary">
              {userType === "内部"
                ? "勾选一个或多个牧场，账号将按权限查看这些牧场的数据。"
                : "外部人员仅服务一个牧场时只关联该牧场；服务多个牧场可勾选多个。"}
            </p>
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
