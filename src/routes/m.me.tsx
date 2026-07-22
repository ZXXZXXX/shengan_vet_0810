import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  HelpCircle,
  LogOut,
  ClipboardList,
  ShieldCheck,
  LayoutGrid,
  FileText,
} from "lucide-react";

import meHero from "@/assets/me-hero.png";

import { useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { roleLabel, useRole } from "@/lib/mobile-role";
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
      {/* 顶部装饰图（仅作背景，不承载文字） */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={meHero}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <button
          onClick={() => navigate({ to: "/m" })}
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 h-8 px-2.5 rounded-full bg-white/85 backdrop-blur-sm text-caption text-foreground border border-white/60 shadow-sm active:bg-white"
          aria-label="返回工作台"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          返回工作台
        </button>
      </div>


      {/* 个人信息卡（上浮覆盖图底部） */}
      <section className="px-4 -mt-10 relative">
        <div className="rounded-2xl bg-card border border-border shadow-[0_4px_16px_-8px_rgba(0,0,0,0.12)] p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-brand-subtle text-primary flex items-center justify-center text-section-title font-medium">
              李
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-section-title text-foreground">李师傅</div>
              <div className="text-caption text-text-secondary mt-0.5">
                工号 W-1024 · 1 号牧场 · {roleLabel[role]}
              </div>
            </div>
          </div>
        </div>
      </section>



      <section className="px-4 mt-5 space-y-2">
        <MenuItem icon={ClipboardList} label="草稿箱" to="/m/drafts" />
        {role === "manager" && (
          <MenuItem icon={FileText} label="月度报告" to="/m/monthly-reports" />
        )}
        <MenuItem icon={ShieldCheck} label="账号安全" to="/m/account-security" />
        <MenuItem icon={HelpCircle} label="帮助与反馈" to="/m/feedback" />
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

    </MobileShell>
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
