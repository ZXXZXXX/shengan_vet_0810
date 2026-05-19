import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Filter, UserCog } from "lucide-react";

export const Route = createFileRoute("/organization/account")({
  head: () => ({ meta: [{ title: "账号管理 — 奇点智牧" }] }),
  component: AccountPage,
});

type Status = "启用" | "禁用";
const accounts: { id: string; name: string; initial: string; phone: string; role: string; org: string; lastLogin: string; status: Status }[] = [
  { id: "U001", name: "张磊", initial: "ZL", phone: "138****6201", role: "场长", org: "1 号牧场", lastLogin: "2026-05-12 08:42", status: "启用" },
  { id: "U002", name: "李雨晴", initial: "LY", phone: "139****3018", role: "兽医", org: "1 号牧场 / 兽医部", lastLogin: "2026-05-12 09:08", status: "启用" },
  { id: "U003", name: "陈晓东", initial: "CX", phone: "137****8520", role: "技术员", org: "1 号牧场 / 巡检 A 组", lastLogin: "2026-05-12 07:55", status: "启用" },
  { id: "U004", name: "王仓管", initial: "WC", phone: "136****4302", role: "仓管员", org: "1 号牧场 / 仓储部", lastLogin: "2026-05-11 17:30", status: "启用" },
  { id: "U005", name: "孙库管", initial: "SK", phone: "135****9012", role: "仓管员", org: "2 号牧场 / 仓储部", lastLogin: "2026-05-10 14:20", status: "禁用" },
];

function AccountPage() {
  return (
    <>
      <AppHeader title="账号管理" breadcrumb={["组织管理", "账号管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索姓名 / 手机号" className="h-9 w-64 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 角色</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建账号
          </Button>
        </div>

        <Card className="border-border bg-card overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <div className="col-span-3">用户</div>
            <div className="col-span-2">手机号</div>
            <div className="col-span-1">角色</div>
            <div className="col-span-3">所属组织</div>
            <div className="col-span-2">最近登录</div>
            <div className="col-span-1 text-right">状态</div>
          </div>
          {accounts.map((a) => (
            <div key={a.id} className="grid grid-cols-12 gap-3 px-6 h-14 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle">
              <div className="col-span-3 flex items-center gap-2.5">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-brand-subtle text-primary text-body-sm">{a.initial}</AvatarFallback></Avatar>
                <div className="leading-tight">
                  <div className="text-body text-foreground">{a.name}</div>
                  <div className="text-caption text-text-tertiary font-mono">{a.id}</div>
                </div>
              </div>
              <div className="col-span-2 text-body-sm text-text-secondary tabular-nums">{a.phone}</div>
              <div className="col-span-1"><span className="tag tag-brand">{a.role}</span></div>
              <div className="col-span-3 text-body-sm text-text-secondary truncate">{a.org}</div>
              <div className="col-span-2 text-body-sm text-text-tertiary tabular-nums">{a.lastLogin}</div>
              <div className="col-span-1 flex justify-end"><span className={`tag ${a.status === "启用" ? "tag-success" : "tag-muted"}`}>{a.status}</span></div>
            </div>
          ))}
        </Card>
      </main>
    </>
  );
}
