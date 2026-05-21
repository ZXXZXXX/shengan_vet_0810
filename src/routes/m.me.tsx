import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  Settings,
  HelpCircle,
  Bell,
  ShieldCheck,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { Role, roleLabel, roleGroup, setRole, useRole } from "@/lib/mobile-role";
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

export const Route = createFileRoute("/m/me")({
  head: () => ({ meta: [{ title: "我的 · 奇点智牧" }] }),
  component: MePage,
});

function MePage() {
  const role = useRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <MobileShell>
      {/* 个人信息卡 */}
      <header className="px-4 pt-12 pb-6 bg-gradient-to-br from-primary to-[var(--brand-strong,var(--brand))] text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-section-title">
            李
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-section-title">李师傅</div>
            <div className="text-caption opacity-85 mt-0.5">
              工号 W-1024 · 1 号牧场 · {roleLabel[role]}
            </div>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-3 text-center">
          <Brief label="本月工单" value="42" />
          <Brief label="按时完成" value="96%" />
          <Brief label="上报事件" value="8" />
        </div>
      </header>

      <section className="px-4 mt-5 space-y-2">
        <MenuItem icon={Bell} label="消息通知" badge="3" />
        <MenuItem icon={ShieldCheck} label="账号与安全" />
        <MenuItem icon={Settings} label="偏好设置" />
        <MenuItem icon={HelpCircle} label="帮助与反馈" />
      </section>

      {/* 退出 */}
      <section className="px-4 mt-5">
        <button
          onClick={() => setOpen(true)}
          className="w-full h-12 rounded-xl bg-card border border-border text-body text-[var(--state-danger)] inline-flex items-center justify-center gap-1.5 active:bg-[var(--state-danger)]/5"
        >
          <LogOut className="h-4 w-4" /> 退出登录
        </button>
        <p className="text-center text-caption text-text-tertiary mt-3">
          奇点智牧 v1.0.0 · 企业微信版
        </p>
      </section>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出登录？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后需要重新通过企业微信授权登录。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white"
              onClick={() => navigate({ to: "/m/login" })}
            >
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 角色切换 */}
      <section className="px-4 mt-5 mb-4">
        <div className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span className="text-body-sm font-medium text-foreground">角色切换</span>
            <span className="ml-auto text-caption text-text-tertiary">演示用</span>
          </div>
          <div className="space-y-3">
            {(["internal", "external"] as const).map((g) => {
              const roles = (Object.keys(roleLabel) as Role[]).filter((r) => roleGroup[r] === g);
              return (
                <div key={g}>
                  <div className="text-caption text-text-tertiary mb-1.5">
                    {g === "internal" ? "内部人员" : "外部人员"}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`h-10 rounded-lg text-body-sm transition-colors border ${
                          role === r
                            ? "bg-brand-subtle border-primary/40 text-primary"
                            : "bg-surface-subtle border-transparent text-text-secondary"
                        }`}
                      >
                        {roleLabel[r]}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </MobileShell>
  );
}

function Brief({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/12 backdrop-blur border border-white/15 py-2">
      <div className="text-section-title tabular-nums">{value}</div>
      <div className="text-caption opacity-85 mt-0.5">{label}</div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  badge,
}: {
  icon: typeof Bell;
  label: string;
  badge?: string;
}) {
  return (
    <Link
      to="/m/me"
      className="flex items-center gap-3 px-4 h-12 rounded-xl bg-card border border-border active:bg-surface-subtle"
    >
      <Icon className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
      <span className="flex-1 text-body text-foreground">{label}</span>
      {badge && <span className="tag tag-danger">{badge}</span>}
      <ChevronRight className="h-4 w-4 text-text-tertiary" />
    </Link>
  );
}
