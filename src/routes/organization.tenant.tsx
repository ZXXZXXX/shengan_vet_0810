import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Building2, Plus, Search, Users, Beef, Info, MapPin, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organization/tenant")({
  head: () => ({ meta: [{ title: "租户管理 — 奇点智牧" }] }),
  component: TenantPage,
});

type TenantStatus = "正常" | "已冻结";
type TenantRow = {
  id: string;
  name: string;
  code: string;
  region: string;
  contact: string;
  users: number;
  cattle: number;
  status: TenantStatus;
};

const initialTenants: TenantRow[] = [
  { id: "T001", name: "奇点牧业集团", code: "qd-mu", region: "内蒙古 · 呼和浩特 · 赛罕区", contact: "王志远", users: 156, cattle: 2486, status: "正常" },
  { id: "T002", name: "绿源乳业", code: "ly-dairy", region: "黑龙江 · 哈尔滨 · 道里区", contact: "李 雯", users: 42, cattle: 860, status: "正常" },
  { id: "T003", name: "北疆牧场合作社", code: "bj-coop", region: "新疆 · 伊犁 · 伊宁市", contact: "马建国", users: 18, cattle: 320, status: "已冻结" },
];

type Scale = "small" | "large";

// 演示用地区数据
const REGION: Record<string, Record<string, string[]>> = {
  内蒙古: {
    呼和浩特: ["赛罕区", "新城区", "回民区", "玉泉区"],
    包头: ["昆都仑区", "青山区", "东河区"],
    通辽: ["科尔沁区", "霍林郭勒"],
  },
  黑龙江: {
    哈尔滨: ["道里区", "南岗区", "香坊区", "松北区"],
    齐齐哈尔: ["建华区", "龙沙区"],
    大庆: ["萨尔图区", "让胡路区"],
  },
  新疆: {
    乌鲁木齐: ["天山区", "沙依巴克区", "高新区"],
    伊犁: ["伊宁市", "奎屯市"],
    昌吉: ["昌吉市", "阜康市"],
  },
  河北: {
    石家庄: ["长安区", "桥西区", "新华区"],
    保定: ["竞秀区", "莲池区"],
    唐山: ["路北区", "路南区"],
  },
  山东: {
    济南: ["历下区", "市中区", "槐荫区"],
    青岛: ["市南区", "市北区", "崂山区"],
    潍坊: ["奎文区", "潍城区"],
  },
};

function TenantPage() {
  const [list, setList] = useState<TenantRow[]>(initialTenants);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [farmRange, setFarmRange] = useState("");
  const [cattleRange, setCattleRange] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [wecomEnabled, setWecomEnabled] = useState(false);
  const [corpId, setCorpId] = useState("");

  const cityOptions = useMemo(() => (province ? Object.keys(REGION[province] ?? {}) : []), [province]);
  const districtOptions = useMemo(
    () => (province && city ? REGION[province]?.[city] ?? [] : []),
    [province, city],
  );

  const reset = () => {
    setName(""); setShortName(""); setScale("small");
    setProvince(""); setCity(""); setDistrict("");
    setContact(""); setPhone("");
    setAdminName(""); setAdminPhone("");
    setWecomEnabled(false); setCorpId("");
  };

  const submit = () => {
    if (!name.trim()) return toast.error("请填写租户名称");
    if (!province || !city || !district) return toast.error("请完整选择所在地区");
    if (!contact.trim()) return toast.error("请填写租户联系人");
    if (!phone.trim()) return toast.error("请填写租户联系方式");
    if (!adminName.trim()) return toast.error("请填写管理员账号名称");
    if (!adminPhone.trim()) return toast.error("请填写管理员联系方式");
    if (wecomEnabled && !corpId.trim()) return toast.error("请填写企业微信 CorpID");
    toast.success("租户创建成功");
    setOpen(false);
    reset();
  };

  const toggleFreeze = (id: string, frozen: boolean) => {
    setList((prev) => prev.map((t) => (t.id === id ? { ...t, status: frozen ? "已冻结" : "正常" } : t)));
    toast.success(frozen ? "已冻结该租户" : "已恢复该租户");
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
          {list.map((t) => (
            <Card key={t.id} className="border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-card-title text-foreground truncate">{t.name}</div>
                    <div className="text-caption text-text-tertiary font-mono truncate">{t.code}</div>
                  </div>
                </div>
                <span className={`tag ${t.status === "正常" ? "tag-success" : "tag-muted"}`}>{t.status}</span>
              </div>
              <div className="text-caption text-text-tertiary truncate">{t.region}</div>
              <div className="text-caption text-text-tertiary mt-1">联系人：{t.contact}</div>
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
                <span className="text-caption text-text-tertiary">冻结该租户</span>
                <Switch
                  checked={t.status === "已冻结"}
                  onCheckedChange={(v) => toggleFreeze(t.id, v)}
                />
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col gap-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-brand-subtle flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-card-title text-foreground text-left">新建租户</SheetTitle>
                <SheetDescription className="text-caption text-text-tertiary text-left">
                  填写租户基础信息并创建管理员账号
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {/* 基础信息 */}
            <section className="px-6 py-5 border-b border-border space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-primary" />
                <h4 className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-text-secondary" />
                  基础信息
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="租户名称" required>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：奇点牧业集团" className="h-9 bg-card border-border text-body-sm" />
                </Field>
                <Field label="租户简称">
                  <Input value={shortName} onChange={(e) => setShortName(e.target.value)} placeholder="如：奇点" className="h-9 bg-card border-border text-body-sm" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="牧场数量范围">
                  <Select value={farmRange} onValueChange={setFarmRange}>
                    <SelectTrigger className="h-9 bg-card border-border text-body-sm">
                      <SelectValue placeholder="选择牧场数量范围" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lt5">&lt; 5 个</SelectItem>
                      <SelectItem value="5to20">5 ~ 20 个</SelectItem>
                      <SelectItem value="20to50">20 ~ 50 个</SelectItem>
                      <SelectItem value="gte50">≥ 50 个</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="牛只数量范围">
                  <Select value={cattleRange} onValueChange={setCattleRange}>
                    <SelectTrigger className="h-9 bg-card border-border text-body-sm">
                      <SelectValue placeholder="选择牛只数量范围" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lt3000">&lt; 3000 头</SelectItem>
                      <SelectItem value="3000to10000">3000 ~ 10000 头</SelectItem>
                      <SelectItem value="10000to50000">10000 ~ 50000 头</SelectItem>
                      <SelectItem value="gte50000">≥ 50000 头</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>

            {/* 所在地区 */}
            <section className="px-6 py-5 border-b border-border space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-primary" />
                <h4 className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                  所在地区与联系方式
                </h4>
              </div>

              <Field label="所在地区" required>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={province}
                    onValueChange={(v) => { setProvince(v); setCity(""); setDistrict(""); }}
                  >
                    <SelectTrigger className="h-9 bg-card border-border text-body-sm">
                      <SelectValue placeholder="省 / 自治区" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(REGION).map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={city}
                    onValueChange={(v) => { setCity(v); setDistrict(""); }}
                    disabled={!province}
                  >
                    <SelectTrigger className="h-9 bg-card border-border text-body-sm">
                      <SelectValue placeholder="市" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={district}
                    onValueChange={setDistrict}
                    disabled={!city}
                  >
                    <SelectTrigger className="h-9 bg-card border-border text-body-sm">
                      <SelectValue placeholder="区 / 县" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="租户联系人" required>
                  <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="姓名" className="h-9 bg-card border-border text-body-sm" />
                </Field>
                <Field label="租户联系方式" required>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" className="h-9 bg-card border-border text-body-sm" />
                </Field>
              </div>
            </section>

            {/* 管理员账号 */}
            <section className="px-6 py-5 border-b border-border space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-primary" />
                  <h4 className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-text-secondary" />
                    创建 / 绑定租户管理员账号
                  </h4>
                </div>
                <span className="text-caption text-text-tertiary">必填 · 仅限 1 个</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="账号名称" required>
                  <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="管理员姓名" className="h-9 bg-card border-border text-body-sm" />
                </Field>
                <Field label="联系方式" required>
                  <Input value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} placeholder="手机号" className="h-9 bg-card border-border text-body-sm" />
                </Field>
              </div>
            </section>

            {/* 登录方式 */}
            <section className="px-6 py-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-primary" />
                <h4 className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-text-secondary" />
                  登录方式
                </h4>
              </div>
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
                <div className="pl-6 pt-1 space-y-2">
                  <div className="flex items-start gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
                    <Info className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                    <span className="text-caption text-text-secondary leading-relaxed">
                      需由该企业的企业微信管理员完成授权后,该企业员工才可正常使用企微登录
                    </span>
                  </div>
                  <Field label="企业微信 CorpID" required>
                    <Input value={corpId} onChange={(e) => setCorpId(e.target.value)} placeholder="ww1234567890abcdef" className="h-9 bg-card border-border text-body-sm" />
                  </Field>
                </div>
              )}
            </section>
          </div>

          <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-background">
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submit} className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
              创建租户
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-caption text-text-tertiary">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
