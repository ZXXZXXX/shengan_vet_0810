import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HeartPulse, Stethoscope, Wheat, Activity, Lock, BadgeCheck, Truck, Droplets, Building2, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
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
import heroImg from "@/assets/grassland-hero.png";

const ACCOUNT = {
  name: "李雨晴",
  workId: "W-1024",
  role: "兽医",
  group: "奇点智牧集团",
  farms: ["1号牧场", "3号牧场"],
};

export const Route = createFileRoute("/m/")({
  head: () => ({ meta: [{ title: "工作台 · 奇点智牧" }] }),
  component: MWorkspacePage,
});

type Module = {
  id: string;
  name: string;
  desc: string;
  icon: typeof Stethoscope;
  to?: string;
  enabled: boolean;
  gradient: string;
};

const MODULES: Module[] = [
  { id: "vet", name: "智慧兽医", desc: "诊疗 · 处方 · 药品", icon: Stethoscope, to: "/m/homepage", enabled: true, gradient: "linear-gradient(135deg,#00A85A 0%,#3FD49C 100%)" },
  { id: "birth", name: "智能接生", desc: "产前预警 · 接产", icon: HeartPulse, enabled: false, gradient: "linear-gradient(135deg,#EC4899 0%,#F9A8D4 100%)" },
  { id: "feed", name: "饲喂管理", desc: "配方 · 投喂任务", icon: Wheat, enabled: false, gradient: "linear-gradient(135deg,#D4A017 0%,#F5D77A 100%)" },
  { id: "env", name: "环境监测", desc: "温湿度 · 氨气", icon: Activity, enabled: false, gradient: "linear-gradient(135deg,#22ACEB 0%,#7DD3F8 100%)" },
  { id: "transport", name: "运牛管理", desc: "调运 · 路线追踪", icon: Truck, enabled: false, gradient: "linear-gradient(135deg,#EA580C 0%,#FB923C 100%)" },
  { id: "milk", name: "产奶分析", desc: "产量 · 品质监控", icon: Droplets, enabled: false, gradient: "linear-gradient(135deg,#14B8A6 0%,#5EEAD4 100%)" },
];

function MWorkspacePage() {
  const navigate = useNavigate();
  const enabledCount = MODULES.filter((m) => m.enabled).length;
  const [logoutOpen, setLogoutOpen] = useState(false);

  const pick = (m: Module) => {
    if (!m.enabled || !m.to) return;
    try { localStorage.setItem("mp:active_module", m.id); } catch {}
    navigate({ to: m.to });
  };

  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col">
        {/* 顶部头图：牛在草原上 */}
        <div className="pt-0 pb-20 px-4 relative overflow-hidden" style={{ minHeight: 180 }}>
          <img
            src={heroImg.url}
            alt="草原上的牛群"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 95%" }}
          />

          {/* 底部渐变隐去，避免硬裁切 */}
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"

            style={{
              background:
                "linear-gradient(180deg, rgba(245,247,250,0) 0%, var(--bg-page) 100%)",
            }}
          />




          <div className="relative pt-6 text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.45)" }}>
            <div className="text-page-title font-semibold tracking-tight">工作台</div>
            <div className="text-caption text-white/95 mt-1">让每一头牛都被照顾到</div>
          </div>


        </div>

        <div className="flex-1 px-4 pb-8 space-y-5 -mt-[72px]">
          {/* 名片 */}
          <div className="relative rounded-3xl bg-card shadow-xl overflow-hidden"
            style={{ boxShadow: "0 12px 32px -12px rgba(0,168,90,0.25), 0 4px 12px rgba(0,0,0,0.06)" }}>

            <button
              onClick={() => setLogoutOpen(true)}
              className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 h-7 px-3 rounded-full text-caption text-white shadow-sm active:opacity-90"
              style={{ background: "linear-gradient(135deg,#00A85A 0%,#3FD49C 100%)" }}
              aria-label="退出登录"
            >
              <LogOut className="h-3.5 w-3.5" />
              退出登录
            </button>

            <div className="relative p-5">
              <div className="flex items-start gap-3.5">
                {/* 头像 */}
                <div className="relative shrink-0">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center text-section-title font-semibold text-white shadow-md"
                    style={{ background: "linear-gradient(135deg,#00A85A 0%,#3FD49C 100%)" }}
                  >
                    {ACCOUNT.name.slice(-2)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-0.5 pr-20">
                  <div className="flex items-baseline gap-2">
                    <span className="text-section-title text-foreground font-semibold tracking-tight truncate">
                      {ACCOUNT.name}
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium shrink-0"
                      style={{
                        background: "color-mix(in oklab, #00A85A 10%, transparent)",
                        color: "#00A85A",
                      }}
                    >
                      {ACCOUNT.role}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5 text-caption text-text-secondary">
                    <Building2 className="h-3 w-3 text-text-tertiary shrink-0" />
                    <span className="truncate">{ACCOUNT.group}</span>
                    <span className="text-text-tertiary">·</span>
                    <span className="font-mono text-text-tertiary">{ACCOUNT.workId}</span>
                  </div>
                </div>
              </div>

              {/* 所属牧场 */}
              <div className="mt-4 pt-4 border-t border-dashed border-border">
                <div className="flex items-center justify-between">
                  <span className="text-caption text-text-tertiary">所属牧场</span>
                  <span className="text-caption text-text-tertiary">共 {ACCOUNT.farms.length} 个</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ACCOUNT.farms.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-caption font-medium"
                      style={{
                        background: "color-mix(in oklab, #00A85A 8%, transparent)",
                        color: "var(--foreground)",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#00A85A" }} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>



          {/* 业务入口 */}
          <div>
            <div className="px-1 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 rounded-full" style={{ background: "#00A85A" }} />
                <span className="text-section-title text-foreground font-medium">业务入口</span>
              </div>
              <span className="text-caption text-text-tertiary">
                已开通 <span className="text-foreground font-medium">{enabledCount}</span> / {MODULES.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MODULES.map((m) => {
                const Icon = m.icon;
                const disabled = !m.enabled;
                return (
                  <button
                    key={m.id}
                    onClick={() => pick(m)}
                    disabled={disabled}
                    className={`group relative rounded-2xl overflow-hidden text-left p-4 bg-card border border-border transition-all ${
                      disabled ? "" : "active:scale-[0.97] hover:shadow-md"
                    }`}
                    style={{ minHeight: 132 }}
                  >
                    {/* 顶部色带 */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ background: m.gradient }}
                    />

                    {/* 图标块 */}
                    <div
                      className="relative h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{
                        background: m.gradient,
                        color: "#ffffff",
                      }}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2} />
                      {disabled && (
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card border border-border flex items-center justify-center">
                          <Lock className="h-2.5 w-2.5 text-text-tertiary" />
                        </span>
                      )}
                    </div>

                    {/* 未开通蒙版 */}
                    {disabled && (
                      <span
                        aria-hidden
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "rgba(245,246,248,0.55)" }}
                      />
                    )}

                    {/* 文字 */}
                    <div className="relative mt-3">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-body font-medium truncate ${disabled ? "text-text-secondary" : "text-foreground"}`}>
                          {m.name}
                        </span>
                        {!disabled && (
                          <ChevronRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
                        )}
                      </div>
                      <div className="text-caption text-text-tertiary mt-0.5 truncate">
                        {disabled ? "未开通" : m.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 text-caption text-text-tertiary text-center">
              如需开通其他系统，请联系您的牧场管理员
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
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
    </div>
  );
}
