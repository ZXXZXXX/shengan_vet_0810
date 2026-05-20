import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/m/login")({
  head: () => ({ meta: [{ title: "登录 · 奇点智牧" }] }),
  component: MLoginPage,
});

function MLoginPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = () => {
    if (!agreed) return;
    setLoading(true);
    setTimeout(() => navigate({ to: "/m/workspace" }), 600);
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
          <h1 className="text-page-title text-foreground tracking-tight">奇点智牧</h1>
          <p className="text-body text-text-secondary mt-1">让每一头牛被精准照护</p>
        </div>

        {/* 中间品牌图形 */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="relative w-full aspect-square max-w-[260px]">
            <div className="absolute inset-4 rounded-full border border-primary/20 animate-pulse" />
            <div className="absolute inset-10 rounded-full border border-[var(--effect-ai-cyan)]/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-[0_20px_60px_-20px_var(--brand)] flex items-center justify-center">
                <span className="text-[40px] leading-none text-primary-foreground font-medium">智</span>
              </div>
            </div>
          </div>
        </div>

        {/* 登录操作 */}
        <div className="px-6 pb-10 space-y-4">
          <Button
            onClick={onLogin}
            disabled={!agreed || loading}
            className="w-full h-12 text-body bg-[#07C160] hover:bg-[#07C160]/90 text-white gap-2 disabled:opacity-50"
          >
            <WeComIcon className="h-5 w-5" />
            {loading ? "正在登录..." : "企业微信一键登录"}
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
