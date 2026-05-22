import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Smartphone, ShieldCheck, RefreshCw, ScanLine, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { setPcRole } from "@/lib/pc-role";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "登录 — 奇点牧业智能管理平台" },
      { name: "description", content: "登录奇点牧业智能管理平台" },
    ],
  }),
  component: LoginPage,
});

type LoginTab = "phone" | "wecom";
type WecomStage = "qr" | "bind-phone" | "bound";

function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<LoginTab>("phone");
  const [agreed, setAgreed] = useState(true);

  // 手机号登录
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);

  // 企微扫码
  const [wecomStage, setWecomStage] = useState<WecomStage>("qr");
  const [bindPhone, setBindPhone] = useState("");
  const [bindCode, setBindCode] = useState("");
  const [bindCountdown, setBindCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);
  useEffect(() => {
    if (bindCountdown <= 0) return;
    const t = setTimeout(() => setBindCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [bindCountdown]);

  const isPhoneValid = /^1\d{10}$/.test(phone);
  const isBindPhoneValid = /^1\d{10}$/.test(bindPhone);

  const sendCode = () => {
    if (!isPhoneValid || countdown > 0) return;
    setCountdown(60);
  };
  const sendBindCode = () => {
    if (!isBindPhoneValid || bindCountdown > 0) return;
    setBindCountdown(60);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !isPhoneValid || code.length < 4) return;
    setPcRole("admin");
    navigate({ to: "/workspace" });
  };

  // 模拟扫码：3 秒后进入绑定手机号阶段
  useEffect(() => {
    if (tab !== "wecom" || wecomStage !== "qr") return;
    const t = setTimeout(() => setWecomStage("bind-phone"), 3500);
    return () => clearTimeout(t);
  }, [tab, wecomStage]);

  const confirmBind = () => {
    if (!agreed || !isBindPhoneValid || bindCode.length < 4) return;
    setWecomStage("bound");
    setTimeout(() => navigate({ to: "/workspace" }), 800);
  };


  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
        style={{
          background:
            "linear-gradient(135deg, #008542 0%, #00A14F 50%, #006B36 100%)",
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
        <div className="w-full max-w-[400px] space-y-7">
          <div className="space-y-2">
            <h1 className="text-page-title text-foreground">欢迎回来</h1>
            <p className="text-body-sm text-text-tertiary">
              请选择登录方式进入管理平台
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
            <button
              type="button"
              onClick={() => setTab("phone")}
              className={cn(
                "flex-1 h-9 rounded-md text-body-sm transition-colors flex items-center justify-center gap-1.5",
                tab === "phone"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-text-secondary hover:text-foreground",
              )}
            >
              <Smartphone className="h-3.5 w-3.5" /> 手机号登录
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("wecom");
                setWecomStage("qr");
              }}
              className={cn(
                "flex-1 h-9 rounded-md text-body-sm transition-colors flex items-center justify-center gap-1.5",
                tab === "wecom"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-text-secondary hover:text-foreground",
              )}
            >
              <ScanLine className="h-3.5 w-3.5" /> 企业微信
            </button>
          </div>

          {tab === "phone" && (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-body-sm text-text-secondary">
                  手机号
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm text-text-tertiary">+86</span>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="请输入手机号"
                    className="h-10 pl-12"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-body-sm text-text-secondary">
                  短信验证码
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="请输入 6 位验证码"
                    className="h-10 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isPhoneValid || countdown > 0}
                    onClick={sendCode}
                    className="h-10 min-w-[112px] text-body-sm"
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : "获取验证码"}
                  </Button>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <Checkbox
                  className="mt-0.5"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(!!v)}
                />
                <span className="text-caption text-text-tertiary leading-relaxed">
                  已阅读并同意
                  <a className="text-primary hover:underline mx-1">服务协议</a>与
                  <a className="text-primary hover:underline mx-1">隐私政策</a>
                </span>
              </label>

              <Button
                type="submit"
                disabled={!agreed || !isPhoneValid || code.length < 4}
                className="w-full h-10 text-body"
              >
                登 录
              </Button>
            </form>
          )}

          {tab === "wecom" && wecomStage === "qr" && (
            <div className="space-y-5">
              <div className="relative mx-auto w-[220px] h-[220px] rounded-xl border border-border bg-card flex items-center justify-center overflow-hidden">
                {/* 伪二维码 */}
                <div
                  className="w-[180px] h-[180px]"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(#0F172A 0% 25%, transparent 0% 50%)",
                    backgroundSize: "12px 12px",
                    maskImage:
                      "radial-gradient(circle at center, black 70%, transparent 100%)",
                  }}
                />
                {/* 扫描线 */}
                <div
                  className="absolute left-5 right-5 h-0.5 bg-primary/70 shadow-[0_0_12px_var(--brand)]"
                  style={{ animation: "scanLine 2.4s linear infinite" }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-card/80 backdrop-blur text-caption text-text-secondary">
                  <RefreshCw className="h-2.5 w-2.5" /> 等待扫码
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-body text-foreground">请使用企业微信扫一扫</p>
                <p className="text-caption text-text-tertiary">
                  首次扫码登录需补充手机号完成身份绑定
                </p>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  className="mt-0.5"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(!!v)}
                />
                <span className="text-caption text-text-tertiary leading-relaxed">
                  已阅读并同意
                  <a className="text-primary hover:underline mx-1">服务协议</a>与
                  <a className="text-primary hover:underline mx-1">隐私政策</a>
                </span>
              </label>
              <style>{`@keyframes scanLine { 0% { top: 14%; } 50% { top: 82%; } 100% { top: 14%; } }`}</style>
            </div>
          )}

          {tab === "wecom" && wecomStage === "bind-phone" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setWecomStage("qr")}
                className="flex items-center gap-1 text-body-sm text-text-secondary hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> 返回扫码
              </button>
              <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-body-sm text-foreground">
                    检测到首次企业微信登录
                  </p>
                  <p className="text-caption text-text-tertiary leading-relaxed">
                    请补充手机号并完成验证，用于建立企微 ID 与平台账号的绑定关系。
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bindPhone" className="text-body-sm text-text-secondary">
                  手机号
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm text-text-tertiary">+86</span>
                  <Input
                    id="bindPhone"
                    inputMode="numeric"
                    maxLength={11}
                    value={bindPhone}
                    onChange={(e) => setBindPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="请输入手机号"
                    className="h-10 pl-12"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bindCode" className="text-body-sm text-text-secondary">
                  短信验证码
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="bindCode"
                    inputMode="numeric"
                    maxLength={6}
                    value={bindCode}
                    onChange={(e) => setBindCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="请输入 6 位验证码"
                    className="h-10 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isBindPhoneValid || bindCountdown > 0}
                    onClick={sendBindCode}
                    className="h-10 min-w-[112px] text-body-sm"
                  >
                    {bindCountdown > 0 ? `${bindCountdown}s 后重发` : "获取验证码"}
                  </Button>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <Checkbox
                  className="mt-0.5"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(!!v)}
                />
                <span className="text-caption text-text-tertiary leading-relaxed">
                  已阅读并同意
                  <a className="text-primary hover:underline mx-1">服务协议</a>与
                  <a className="text-primary hover:underline mx-1">隐私政策</a>
                </span>
              </label>

              <Button
                type="button"
                onClick={confirmBind}
                disabled={!agreed || !isBindPhoneValid || bindCode.length < 4}
                className="w-full h-10 text-body"
              >
                绑定并登录
              </Button>
            </div>
          )}

          {tab === "wecom" && wecomStage === "bound" && (
            <div className="py-10 flex flex-col items-center text-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="text-body text-foreground">企微账号绑定成功</p>
              <p className="text-caption text-text-tertiary">正在进入管理平台…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

