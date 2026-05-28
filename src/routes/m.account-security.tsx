import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/m/account-security")({
  head: () => ({ meta: [{ title: "账号安全 · 奇点智牧" }] }),
  component: AccountSecurityPage,
});

const PHONE_KEY = "mp:bound_phone";
const PASSWORD_KEY = "mp:account_password";

function maskPhone(p: string) {
  if (!/^1\d{10}$/.test(p)) return p || "未绑定";
  return `${p.slice(0, 3)} **** ${p.slice(7)}`;
}

function AccountSecurityPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPhone(localStorage.getItem(PHONE_KEY) ?? "");
  }, []);

  const isPwdStrong = (v: string) =>
    v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);

  const submitReset = () => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(PASSWORD_KEY) : null;
    if (!saved) {
      toast.error("未检测到原密码，请重新登录");
      return;
    }
    if (oldPwd !== saved) {
      toast.error("原密码不正确");
      return;
    }
    if (!isPwdStrong(newPwd)) {
      toast.error("新密码至少 8 位，且包含字母和数字");
      return;
    }
    if (newPwd !== newPwd2) {
      toast.error("两次输入的新密码不一致");
      return;
    }
    if (newPwd === oldPwd) {
      toast.error("新密码不能与原密码相同");
      return;
    }
    localStorage.setItem(PASSWORD_KEY, newPwd);
    toast.success("密码已重设");
    setOldPwd("");
    setNewPwd("");
    setNewPwd2("");
    setResetOpen(false);
  };

  return (
    <MobileShell title="账号安全" back hideTabBar>
      <div className="px-4 pt-4 pb-10 space-y-4">
        {/* 绑定手机号 */}
        <section className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-4 h-12 flex items-center justify-between border-b border-border">
            <span className="text-body-sm text-text-tertiary">账号信息</span>
            <span className="inline-flex items-center gap-1 text-caption text-primary">
              <ShieldCheck className="h-3 w-3" /> 安全可控
            </span>
          </div>
          <div className="px-4 h-14 flex items-center gap-3">
            <Phone className="h-4 w-4 text-text-secondary" />
            <div className="flex-1 min-w-0">
              <div className="text-body text-foreground tabular-nums">
                {maskPhone(phone)}
              </div>
              <div className="text-caption text-text-tertiary mt-0.5">
                绑定手机号 · 不可更改
              </div>
            </div>
            <span className="text-caption text-text-tertiary">已绑定</span>
          </div>
        </section>

        {/* 密码 */}
        <section className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="px-4 h-12 flex items-center">
            <span className="text-body-sm text-text-tertiary">登录密码</span>
          </div>
          {resetOpen ? (
            <div className="px-4 pb-4 space-y-3">
              <PwdInput
                value={oldPwd}
                onChange={setOldPwd}
                placeholder="请输入原密码"
                show={showPwd}
                onToggle={() => setShowPwd((v) => !v)}
              />
              <PwdInput
                value={newPwd}
                onChange={setNewPwd}
                placeholder="新密码（8-32 位，含字母与数字）"
                show={showPwd}
              />
              <PwdInput
                value={newPwd2}
                onChange={setNewPwd2}
                placeholder="再次输入新密码"
                show={showPwd}
              />
              <div className="rounded-lg bg-brand-subtle/60 px-3 py-2 flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-caption text-text-secondary leading-relaxed">
                  修改成功后，需在其他设备上重新登录
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResetOpen(false);
                    setOldPwd("");
                    setNewPwd("");
                    setNewPwd2("");
                  }}
                  className="flex-1 h-11"
                >
                  取消
                </Button>
                <Button
                  onClick={submitReset}
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  确认重设
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setResetOpen(true)}
              className="w-full px-4 h-14 flex items-center gap-3 active:bg-surface-subtle"
            >
              <Lock className="h-4 w-4 text-text-secondary" />
              <div className="flex-1 text-left">
                <div className="text-body text-foreground">重新设置密码</div>
                <div className="text-caption text-text-tertiary mt-0.5">
                  需校验原密码，新旧密码不可相同
                </div>
              </div>
              <span className="text-caption text-primary">重设 →</span>
            </button>
          )}
        </section>

        <p className="text-center text-caption text-text-tertiary">
          如需更换绑定手机号，请联系牧场管理员
        </p>

        {/* 占位防止误触到底部 */}
        <div className="h-4" />
        <button
          onClick={() => navigate({ to: "/m/me" })}
          className="hidden"
          aria-hidden
        />
      </div>
    </MobileShell>
  );
}

function PwdInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 h-12 px-3 rounded-lg bg-surface-subtle border border-border">
      <Lock className="h-4 w-4 text-text-tertiary" />
      <input
        type={show ? "text" : "password"}
        maxLength={32}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-body text-foreground placeholder:text-text-tertiary"
      />
      {onToggle && (
        <button onClick={onToggle} className="text-text-tertiary" aria-label="显示密码">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
