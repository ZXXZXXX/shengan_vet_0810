import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  HelpCircle,
  LogOut,
  RefreshCw,
  ClipboardList,
  ShieldCheck,
  X,
} from "lucide-react";
import meHero from "@/assets/me-hero.png";

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
  const [roleOpen, setRoleOpen] = useState(false);

  return (
    <MobileShell>
      {/* 个人信息卡 */}
      <header className="px-4 pt-12 pb-6 text-primary-foreground relative overflow-hidden [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
        <img
          src={meHero}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-125 origin-top blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/45" />
        <div className="relative flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center text-section-title">
            李
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-section-title">李师傅</div>
            <div className="text-caption opacity-95 mt-0.5">
              工号 W-1024 · 1 号牧场 · {roleLabel[role]}
            </div>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-3 text-center">
          <Brief label="本月工作" value="42" />
          <Brief label="按时完成" value="96%" />
          <Brief label="上报事件" value="8" />
        </div>
      </header>


      <section className="px-4 mt-5 space-y-2">
        <MenuItem icon={ClipboardList} label="草稿箱" to="/m/drafts" />
        <MenuItem icon={ShieldCheck} label="账号安全" to="/m/account-security" />
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

      {/* 角色切换悬浮按钮（收起态） */}
      {!roleOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-[440px] px-4 relative pointer-events-auto">
            <button
              onClick={() => setRoleOpen(true)}
              className="absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 h-10 pl-3.5 pr-2.5 rounded-full bg-primary text-primary-foreground inline-flex items-center gap-1.5 shadow-[0_4px_16px_-4px_color-mix(in_oklab,var(--primary)_50%,transparent)] text-body-sm font-medium active:scale-95 transition-transform"
            >
              {roleLabel[role]}
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 角色切换展开面板 */}
      {roleOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setRoleOpen(false)}
          />
          <div className="relative bg-card rounded-t-2xl border-t border-border p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            {/* 把手 */}
            <div className="flex justify-center mb-3">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-body font-medium text-foreground">切换角色</span>
              <span className="text-caption text-text-tertiary">演示用</span>
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
                          onClick={() => {
                            setRole(r);
                            setRoleOpen(false);
                          }}
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
            <button
              onClick={() => setRoleOpen(false)}
              className="mt-4 w-full h-11 rounded-xl bg-surface-subtle text-body text-text-secondary inline-flex items-center justify-center gap-1.5 active:bg-border transition-colors"
            >
              <X className="h-4 w-4" />
              收起
            </button>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Brief({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/20 backdrop-blur-md border border-white/30 py-2">
      <div className="text-section-title tabular-nums">{value}</div>
      <div className="text-caption opacity-95 mt-0.5">{label}</div>
    </div>
  );
}


function MenuItem({
  icon: Icon,
  label,
  badge,
  to,
}: {
  icon: typeof HelpCircle;
  label: string;
  badge?: string;
  to?: string;
}) {
  return (
    <Link
      to={to ?? "/m/me"}
      className="flex items-center gap-3 px-4 h-12 rounded-xl bg-card border border-border active:bg-surface-subtle"
    >
      <Icon className="h-4 w-4 text-text-secondary" strokeWidth={1.75} />
      <span className="flex-1 text-body text-foreground">{label}</span>
      {badge && <span className="tag tag-danger">{badge}</span>}
      <ChevronRight className="h-4 w-4 text-text-tertiary" />
    </Link>
  );
}
