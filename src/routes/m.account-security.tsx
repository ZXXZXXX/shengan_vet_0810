import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, ShieldCheck } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/account-security")({
  head: () => ({ meta: [{ title: "账号安全 · 奇点智牧" }] }),
  component: AccountSecurityPage,
});

const PHONE_KEY = "mp:bound_phone";

function fallbackPhone(p: string) {
  return p || "未绑定";
}

function AccountSecurityPage() {
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPhone(localStorage.getItem(PHONE_KEY) ?? "");
  }, []);

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
                {fallbackPhone(phone)}
              </div>
              <div className="text-caption text-text-tertiary mt-0.5">
                绑定手机号
              </div>
            </div>
            <span className="text-caption text-text-tertiary">已绑定</span>
          </div>
        </section>

        <p className="text-center text-caption text-text-tertiary">
          如需变更绑定手机号，请联系牧场管理人员
        </p>
      </div>
    </MobileShell>
  );
}
