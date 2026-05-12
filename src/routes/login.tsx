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
            "linear-gradient(135deg, #2F5230 0%, #416F42 45%, #5C8A5D 100%)",
        }}
      >
        <div
          className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #A6E3FA 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-20 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #C8B6FF 0%, transparent 70%)" }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="text-body font-medium tracking-wide">奇点牧业 · 智能管理平台</div>
        </div>

        <div className="relative space-y-5">
          <h2 className="text-[36px] leading-[48px] font-medium">
            连接每一头牛 ·<br />让牧场决策更敏捷
          </h2>
          <p className="text-body text-white/75 max-w-md">
            从生产巡检到健康防护，从仓储调度到组织协同，统一的数据底座让一线动作与管理决策高效闭环。
          </p>
          <div className="flex gap-6 pt-4">
            {[
              { v: "98.7%", l: "工单按时完成率" },
              { v: "1,200+", l: "在管牛只" },
              { v: "24/7", l: "AI 异常监测" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[24px] leading-[34px] font-medium">{s.v}</div>
                <div className="text-caption text-white/65 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
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
