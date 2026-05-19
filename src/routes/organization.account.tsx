import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

export const Route = createFileRoute("/organization/account")({
  head: () => ({ meta: [{ title: "账号管理 — 奇点智牧" }] }),
  component: AccountPage,
});

type Status = "启用" | "禁用";
type Account = {
  id: string;
  name: string;
  initial: string;
  phone: string;
  role: string;
  org: string;
  wecomId: string | null;
  lastLogin: string;
  status: Status;
};

const initialAccounts: Account[] = [
  { id: "U001", name: "张磊", initial: "ZL", phone: "138****6201", role: "场长", org: "1 号牧场", wecomId: "wm_zhanglei_8821", lastLogin: "2026-05-12 08:42", status: "启用" },
  { id: "U002", name: "李雨晴", initial: "LY", phone: "139****3018", role: "兽医", org: "1 号牧场 / 兽医部", wecomId: "wm_liyuqing_3210", lastLogin: "2026-05-12 09:08", status: "启用" },
  { id: "U003", name: "陈晓东", initial: "CX", phone: "137****8520", role: "技术员", org: "1 号牧场 / 巡检 A 组", wecomId: null, lastLogin: "2026-05-12 07:55", status: "启用" },
  { id: "U004", name: "王仓管", initial: "WC", phone: "136****4302", role: "仓管员", org: "1 号牧场 / 仓储部", wecomId: "wm_wangck_5601", lastLogin: "2026-05-11 17:30", status: "启用" },
  { id: "U005", name: "孙库管", initial: "SK", phone: "135****9012", role: "仓管员", org: "2 号牧场 / 仓储部", wecomId: null, lastLogin: "2026-05-10 14:20", status: "禁用" },
];

const ORG_OPTIONS = [
  "1 号牧场",
  "1 号牧场 / 兽医部",
  "1 号牧场 / 巡检 A 组",
  "1 号牧场 / 仓储部",
  "2 号牧场",
  "2 号牧场 / 仓储部",
];

function AccountPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [viewing, setViewing] = useState<Account | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);

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
              <Filter className="h-3.5 w-3.5" /> 角色
            </Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建账号
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle"
            style={{ gridTemplateColumns: "2.4fr 1.6fr 0.9fr 2.2fr 1.8fr 1fr 0.6fr" }}>
            <div>用户</div>
            <div>手机号</div>
            <div>角色</div>
            <div>所属组织</div>
            <div>企微 ID</div>
            <div>状态</div>
            <div className="text-right">管理</div>
          </div>
          {accounts.map((a) => (
            <div key={a.id} className="grid gap-3 px-6 h-14 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle"
              style={{ gridTemplateColumns: "2.4fr 1.6fr 0.9fr 2.2fr 1.8fr 1.6fr 1fr 0.6fr" }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-brand-subtle text-primary text-body-sm">{a.initial}</AvatarFallback></Avatar>
                <div className="leading-tight min-w-0">
                  <div className="text-body text-foreground truncate">{a.name}</div>
                  <div className="text-caption text-text-tertiary font-mono">{a.id}</div>
                </div>
              </div>
              <div className="text-body-sm text-text-secondary tabular-nums">{a.phone}</div>
              <div><span className="tag tag-brand">{a.role}</span></div>
              <div className="text-body-sm text-text-secondary truncate">{a.org}</div>
              <div className="text-body-sm tabular-nums truncate">
                {a.wecomId ? (
                  <span className="text-text-secondary font-mono">{a.wecomId}</span>
                ) : (
                  <span className="tag tag-muted">未绑定</span>
                )}
              </div>
              <div className="text-body-sm text-text-tertiary tabular-nums">{a.lastLogin}</div>
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
              <DetailRow label="手机号" value={<span className="tabular-nums">{viewing.phone}</span>} />
              <DetailRow label="角色" value={<span className="tag tag-brand">{viewing.role}</span>} />
              <DetailRow label="所属组织" value={viewing.org} />
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
              <DetailRow label="最近登录" value={<span className="tabular-nums">{viewing.lastLogin}</span>} />
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
          onClose={() => setEditing(null)}
          onSave={saveEdit}
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

function EditDialog({
  account,
  onClose,
  onSave,
}: {
  account: Account;
  onClose: () => void;
  onSave: (a: Account) => void;
}) {
  const [phone, setPhone] = useState(account.phone);
  const [org, setOrg] = useState(account.org);
  const [wecomId, setWecomId] = useState<string | null>(account.wecomId);

  const orgValue = ORG_OPTIONS.includes(org) ? org : ORG_OPTIONS[0];

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑账号</DialogTitle>
          <DialogDescription>修改用户的手机号、所属组织或解绑企微 ID</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">姓名</Label>
            <Input value={account.name} disabled className="h-9" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone" className="text-body-sm text-text-secondary">手机号</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9 tabular-nums"
              placeholder="请输入手机号"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">所属组织</Label>
            <Select value={orgValue} onValueChange={setOrg}>
              <SelectTrigger className="h-9 text-body-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o} className="text-body-sm">{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-body-sm text-text-secondary">企微 ID</Label>
            <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-subtle px-3 h-9">
              {wecomId ? (
                <>
                  <span className="text-body-sm font-mono text-text-secondary truncate">{wecomId}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setWecomId(null)}
                    className="h-7 gap-1 text-caption text-destructive hover:text-destructive"
                  >
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
            onClick={() => onSave({ ...account, phone, org, wecomId })}
            className="h-9 bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
