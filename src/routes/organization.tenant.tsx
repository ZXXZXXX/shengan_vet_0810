import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Plus, Search, Users, Beef, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organization/tenant")({
  head: () => ({ meta: [{ title: "租户管理 — 奇点智牧" }] }),
  component: TenantPage,
});

type Plan = "旗舰版" | "专业版" | "标准版";
const tenants: { id: string; name: string; code: string; plan: Plan; users: number; cattle: number; expiry: string; status: "正常" | "即将到期" }[] = [
  { id: "T001", name: "奇点牧业集团", code: "qd-mu", plan: "旗舰版", users: 156, cattle: 2486, expiry: "2027-12-31", status: "正常" },
  { id: "T002", name: "绿源乳业", code: "ly-dairy", plan: "专业版", users: 42, cattle: 860, expiry: "2026-08-15", status: "即将到期" },
  { id: "T003", name: "北疆牧场合作社", code: "bj-coop", plan: "标准版", users: 18, cattle: 320, expiry: "2026-11-20", status: "正常" },
];

function planTag(p: Plan) {
  return p === "旗舰版" ? "tag tag-brand" : p === "专业版" ? "tag tag-brand" : "tag tag-muted";
}

type Scale = "small" | "large";

function TenantPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [scale, setScale] = useState<Scale>("small");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [wecomEnabled, setWecomEnabled] = useState(false);
  const [corpId, setCorpId] = useState("");

  const reset = () => {
    setName(""); setShortName(""); setScale("small");
    setProvince(""); setCity(""); setDistrict("");
    setContact(""); setPhone("");
    setAdminName(""); setAdminPhone("");
    setWecomEnabled(false); setCorpId("");
  };

  const submit = () => {
    if (!name.trim()) return toast.error("请填写租户名称");
    if (!province.trim() || !city.trim() || !district.trim()) return toast.error("请完整填写所在地区");
    if (!contact.trim()) return toast.error("请填写租户联系人");
    if (!phone.trim()) return toast.error("请填写租户联系方式");
    if (!adminName.trim()) return toast.error("请填写管理员账号名称");
    if (!adminPhone.trim()) return toast.error("请填写管理员联系方式");
    if (wecomEnabled && !corpId.trim()) return toast.error("请填写企业微信 CorpID");
    toast.success("租户创建成功");
    setOpen(false);
    reset();
  };

  return (
    <>
      <AppHeader title="租户管理" breadcrumb={["组织管理", "租户管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input placeholder="搜索租户名称 / 编码" className="h-9 w-72 pl-9 text-body-sm" />
          </div>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 新建租户
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((t) => (
            <Card key={t.id} className="border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-card-title text-foreground">{t.name}</div>
                    <div className="text-caption text-text-tertiary font-mono">{t.code}</div>
                  </div>
                </div>
                <span className={planTag(t.plan)}>{t.plan}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-border">
                <div>
                  <div className="flex items-center gap-1.5 text-caption text-text-tertiary"><Users className="h-3 w-3" /> 用户</div>
                  <div className="tabular-nums text-section-title text-foreground mt-0.5">{t.users}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-caption text-text-tertiary"><Beef className="h-3 w-3" /> 存栏</div>
                  <div className="tabular-nums text-section-title text-foreground mt-0.5">{t.cattle.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-caption text-text-tertiary"><Calendar className="h-3 w-3" /> 到期 {t.expiry}</div>
                <span className={`tag ${t.status === "正常" ? "tag-success" : "tag-warning"}`}>{t.status}</span>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新建租户</DialogTitle>
            <DialogDescription>填写租户基础信息并创建管理员账号</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* 1. 基础信息 */}
            <section className="space-y-4">
              <div className="text-section-title text-foreground">1. 基础信息</div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="租户名称" required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：奇点牧业集团" />
                </Field>
                <Field label="租户简称">
                  <Input value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="如：奇点" />
                </Field>
              </div>

              <Field label="租户规模">
                <RadioGroup value={scale} onValueChange={(v) => setScale(v as Scale)} className="flex gap-6 pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <RadioGroupItem value="small" id="scale-small" className="mt-0.5" />
                    <div className="leading-tight">
                      <div className="text-body-sm text-foreground">中小型</div>
                      <div className="text-caption text-text-tertiary">牧场数 &lt; 5 个 或 牛只数量 &lt; 300</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <RadioGroupItem value="large" id="scale-large" className="mt-0.5" />
                    <div className="leading-tight">
                      <div className="text-body-sm text-foreground">大型</div>
                      <div className="text-caption text-text-tertiary">牧场数 ≥ 5 个 或 牛只数量 ≥ 300</div>
                    </div>
                  </label>
                </RadioGroup>
              </Field>

              <Field label="所在地区" required>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="省" />
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="市" />
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="区" />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="租户联系人" required>
                  <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="姓名" />
                </Field>
                <Field label="租户联系方式" required>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" />
                </Field>
              </div>
            </section>

            {/* 2. 管理员账号 */}
            <section className="space-y-4">
              <div className="text-section-title text-foreground">2. 创建 / 绑定租户管理员账号</div>
              <div className="text-caption text-text-tertiary -mt-2">必填，仅限 1 个</div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="账号名称" required>
                  <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="管理员姓名" />
                </Field>
                <Field label="联系方式" required>
                  <Input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} placeholder="手机号" />
                </Field>
              </div>
            </section>

            {/* 3. 登录方式 */}
            <section className="space-y-3">
              <div className="text-section-title text-foreground">3. 登录方式</div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 opacity-90">
                  <Checkbox checked disabled />
                  <span className="text-body-sm text-foreground">系统帐密登录</span>
                  <span className="text-caption text-text-tertiary">（必选）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={wecomEnabled} onCheckedChange={(v) => setWecomEnabled(!!v)} />
                  <span className="text-body-sm text-foreground">企微登录</span>
                </label>
              </div>
              {wecomEnabled && (
                <div className="pl-6 pt-1">
                  <Field label="企业微信 CorpID" required>
                    <Input value={corpId} onChange={(e) => setCorpId(e.target.value)} placeholder="ww1234567890abcdef" />
                  </Field>
                </div>
              )}
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submit} className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
              创建租户
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-body-sm text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
