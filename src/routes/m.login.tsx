import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ArrowLeft, Phone, KeyRound, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/m/login")({
  head: () => ({ meta: [{ title: "登录 · 奇点智牧" }] }),
  component: MLoginPage,
});

const BOUND_KEY = "mp:wecom_bound";
const PHONE_KEY = "mp:bound_phone";
const PASSWORD_KEY = "mp:account_password";

type Step = "idle" | "binding" | "password" | "loading";

function MLoginPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const onWeComLogin = () => {
    if (!agreed) {
      toast.error("请先勾选并同意服务协议");
      return;
    }
    // 登录、绑定手机号、设置密码均为必须流程，不区分是否已绑定
    setStep("binding");
  };

  const sendCode = () => {
    if (!/^1\d{10}$/.test(phone)) {
      toast.error("请输入正确的手机号");
      return;
    }
    setCountdown(60);
    toast.success("验证码已发送");
  };

  const verifyPhone = () => {
    if (!/^1\d{10}$/.test(phone)) {
      toast.error("请输入正确的手机号");
      return;
    }
    if (code.length < 4) {
      toast.error("请输入验证码");
      return;
    }
    setStep("password");
  };

  const isPwdStrong = (v: string) =>
    v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);

  const confirmPassword = () => {
    if (!isPwdStrong(pwd)) {
      toast.error("密码至少 8 位，且包含字母和数字");
      return;
    }
    if (pwd !== pwd2) {
      toast.error("两次输入的密码不一致");
      return;
    }
    localStorage.setItem(BOUND_KEY, "1");
    localStorage.setItem(PHONE_KEY, phone);
    localStorage.setItem(PASSWORD_KEY, pwd);
    toast.success("账号设置成功");
    navigate({ to: "/m/workspace" });
  };

  return (
    <div className="m-scope min-h-dvh bg-[var(--bg-page)] flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col relative overflow-hidden">
        {/* 视觉背景 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* 顶部品牌区 */}
        <div className="px-6 pt-24 pb-12">
          {step === "binding" ? (
            <>
              <button
                onClick={() => setStep("idle")}
                className="inline-flex items-center gap-1 text-body-sm text-text-tertiary mb-3"
              >
                <ArrowLeft className="h-4 w-4" /> 返回
              </button>
              <h1 className="text-page-title text-foreground tracking-tight">验证手机号</h1>
              <p className="text-body text-text-secondary mt-1">
                请验证手机号以继续登录
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-caption text-text-tertiary">
                <span className="h-1.5 w-6 rounded-full bg-primary" />
                <span className="h-1.5 w-6 rounded-full bg-border" />
                <span className="ml-1">第 1 / 2 步</span>
              </div>
            </>
          ) : step === "password" ? (
            <>
              <button
                onClick={() => setStep("binding")}
                className="inline-flex items-center gap-1 text-body-sm text-text-tertiary mb-3"
              >
                <ArrowLeft className="h-4 w-4" /> 返回
              </button>
              <h1 className="text-page-title text-foreground tracking-tight">设置账号密码</h1>
              <p className="text-body text-text-secondary mt-1">
                将作为后续登录、修改信息等场景的账号凭证
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-caption text-text-tertiary">
                <span className="h-1.5 w-6 rounded-full bg-primary" />
                <span className="h-1.5 w-6 rounded-full bg-primary" />
                <span className="ml-1">第 2 / 2 步</span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-page-title text-foreground tracking-tight">奇点智牧</h1>
              <p className="text-body text-text-secondary mt-1">让每一头牛被精准照护</p>
            </>
          )}
        </div>

        {/* 中间区 */}
        {step === "binding" ? (
          <div className="flex-1 px-6 space-y-4">
            <div className="rounded-xl bg-card border border-border p-1.5">
              <div className="flex items-center gap-2 h-12 px-3">
                <Phone className="h-4 w-4 text-text-tertiary" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-text-tertiary"
                />
              </div>
              <div className="h-px bg-border mx-3" />
              <div className="flex items-center gap-2 h-12 px-3">
                <KeyRound className="h-4 w-4 text-text-tertiary" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-text-tertiary"
                />
                <button
                  onClick={sendCode}
                  disabled={countdown > 0}
                  className="text-body-sm text-primary disabled:text-text-tertiary"
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-brand-subtle/60 px-3 py-2 flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <span className="text-caption text-text-secondary leading-relaxed">
                手机号绑定后不可更改，将作为账号唯一标识
              </span>
            </div>
          </div>
        ) : step === "password" ? (
          <div className="flex-1 px-6 space-y-4">
            <div className="rounded-xl bg-card border border-border p-1.5">
              <div className="flex items-center gap-2 h-12 px-3">
                <Lock className="h-4 w-4 text-text-tertiary" />
                <input
                  type={showPwd ? "text" : "password"}
                  maxLength={32}
                  placeholder="设置登录密码（8-32 位，含字母与数字）"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-text-tertiary"
                />
                <button
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-text-tertiary"
                  aria-label="显示密码"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="h-px bg-border mx-3" />
              <div className="flex items-center gap-2 h-12 px-3">
                <Lock className="h-4 w-4 text-text-tertiary" />
                <input
                  type={showPwd ? "text" : "password"}
                  maxLength={32}
                  placeholder="再次输入密码"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-text-tertiary"
                />
              </div>
            </div>
            <div className="rounded-lg bg-brand-subtle/60 px-3 py-2 flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <span className="text-caption text-text-secondary leading-relaxed">
                密码用于账号安全验证，可在「我的 → 账号安全」中随时重设
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="relative w-full aspect-square max-w-[260px]">
              <div className="absolute inset-4 rounded-full border border-primary/20 animate-pulse" />
              <div className="absolute inset-10 rounded-full border border-primary/15" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-[0_20px_60px_-20px_var(--brand)] flex items-center justify-center">
                  <span className="text-[40px] leading-none text-primary-foreground font-medium">智</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部操作 */}
        <div className="px-6 pb-10 space-y-4">
          {step === "binding" ? (
            <Button
              onClick={verifyPhone}
              className="w-full h-12 text-body bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              下一步：设置密码
            </Button>
          ) : step === "password" ? (
            <Button
              onClick={confirmPassword}
              className="w-full h-12 text-body bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              完成并进入首页
            </Button>
          ) : (
            <>
              <Button
                onClick={onWeComLogin}
                disabled={step === "loading"}
                className="w-full h-12 text-body bg-[#07C160] hover:bg-[#07C160]/90 text-white gap-2 disabled:opacity-50"
              >
                <WeComIcon className="h-5 w-5" />
                {step === "loading" ? "正在登录..." : "企业微信一键登录"}
              </Button>

              <label className="flex items-start gap-2 px-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 accent-[var(--brand)]"
                />
                <span className="text-caption text-text-tertiary leading-relaxed">
                  已阅读并同意
                  <Link to="/m/login" className="text-primary mx-0.5">《用户服务协议》</Link>
                  与
                  <Link to="/m/login" className="text-primary mx-0.5">《隐私政策》</Link>
                  ，授权使用企业微信身份完成登录
                </span>
              </label>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-caption text-text-tertiary">
                <ShieldCheck className="h-3 w-3" /> 企业级身份与权限受控
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WeComIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8.5 4.5C5 4.5 2 6.8 2 10c0 1.7.9 3.2 2.3 4.2-.1.4-.5 1.5-.6 1.8 0 .1.1.2.2.1.3-.1 1.7-.9 2.3-1.2.7.2 1.5.3 2.3.3.2 0 .3 0 .5 0-.1-.4-.2-.9-.2-1.4 0-3 2.9-5.4 6.5-5.4h.4C14.7 6.1 11.9 4.5 8.5 4.5zm-2 4.5c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zm5 0c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" opacity=".95"/>
      <path d="M22 14.5c0-2.7-2.6-4.9-5.8-4.9-3.3 0-5.9 2.2-5.9 4.9s2.6 4.9 5.9 4.9c.7 0 1.3-.1 1.9-.3.5.3 1.6.9 1.9 1 .1 0 .2 0 .2-.1-.1-.3-.4-1.1-.5-1.4 1.4-.9 2.3-2.2 2.3-4.1zm-7.7-.6c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7zm3.8 0c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z"/>
    </svg>
  );
}
