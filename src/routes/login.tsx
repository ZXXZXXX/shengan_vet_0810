import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Eye, EyeOff, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "登录 — 奇点牧业智能管理平台" },
      { name: "description", content: "登录奇点牧业智能管理平台" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState("zhanglei");
  const [password, setPassword] = useState("••••••••");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
        style={{
          background:
            "linear-gradient(135deg, #2F5230 0%, #416F42 50%, #1F3F2A 100%)",
        }}
      >
        {/* AI ambient blobs — ai-purple / ai-cyan */}
        <div
          className="absolute -top-40 -right-32 h-[460px] w-[460px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--effect-ai-cyan) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-24 h-[520px] w-[520px] rounded-full opacity-35 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--effect-ai-purple) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[280px] w-[280px] rounded-full opacity-25 blur-2xl"
          style={{ background: "radial-gradient(circle, #A6E3FA 0%, transparent 70%)" }}
        />

        {/* Subtle grid + dotted noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          }}
        />

        {/* Decorative AI ring */}
        <svg
          className="absolute right-10 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none"
          width="380" height="380" viewBox="0 0 380 380" fill="none"
        >
          <defs>
            <linearGradient id="aiRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--effect-ai-cyan)" />
              <stop offset="100%" stopColor="var(--effect-ai-purple)" />
            </linearGradient>
          </defs>
          <circle cx="190" cy="190" r="180" stroke="url(#aiRing)" strokeWidth="1" strokeDasharray="2 6" />
          <circle cx="190" cy="190" r="130" stroke="url(#aiRing)" strokeWidth="1" />
          <circle cx="190" cy="190" r="80" stroke="url(#aiRing)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>

        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-body font-medium tracking-wide">奇点牧业 · 智能管理平台</div>
        </div>

        <div className="relative space-y-5 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-caption backdrop-blur"
            style={{
              background: "linear-gradient(90deg, color-mix(in oklab, var(--effect-ai-purple) 35%, transparent), color-mix(in oklab, var(--effect-ai-cyan) 35%, transparent))",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <Sparkles className="h-3 w-3" />
            <span>AI 驱动的牧场协同平台</span>
          </div>
          <h2 className="text-[36px] leading-[48px] font-medium">
            连接每一头牛 ·<br />让牧场决策更敏捷
          </h2>
          <p className="text-body text-white/75">
            从生产巡检到健康防护，从仓储调度到组织协同，统一的数据底座让一线动作与管理决策高效闭环。
          </p>
        </div>

        <div className="relative text-caption text-white/55">
          © 2026 Singularity Dairy. All rights reserved.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <form
          onSubmit={submit}
          className="w-full max-w-[400px] space-y-7"
        >
          <div className="space-y-2">
            <h1 className="text-page-title text-foreground">欢迎回来</h1>
            <p className="text-body-sm text-text-tertiary">
              请输入账号信息以进入管理平台
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="account" className="text-body-sm text-text-secondary">
                账号
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <Input
                  id="account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入手机号 / 工号"
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-body-sm text-text-secondary">
                密码
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="h-10 pl-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground"
                  aria-label="切换密码可见"
                >
                  {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(!!v)}
                />
                <span className="text-body-sm text-text-secondary">记住登录状态</span>
              </label>
              <button
                type="button"
                className="text-body-sm text-primary hover:underline"
              >
                忘记密码？
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-10 text-body">
            登 录
          </Button>

          <div className="flex items-center gap-3 text-caption text-text-tertiary">
            <span className="h-px flex-1 bg-border" />
            <span>其他登录方式</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="h-10 text-body-sm">
              企业微信
            </Button>
            <Button type="button" variant="outline" className="h-10 text-body-sm">
              钉钉扫码
            </Button>
          </div>

          <p className="text-caption text-text-tertiary text-center">
            登录即代表已阅读并同意
            <a className="text-primary hover:underline mx-1">服务协议</a>
            与
            <a className="text-primary hover:underline mx-1">隐私政策</a>
          </p>
        </form>
      </div>
    </div>
  );
}
