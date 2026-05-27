import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, MapPin, Users, Beef, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/archive/farm")({
  head: () => ({ meta: [{ title: "牛场信息 — 奇点智牧" }] }),
  component: FarmPage,
});

const farms = [
  { id: "F001", name: "1 号牧场", region: "内蒙古·呼伦贝尔", area: "1280 亩", manager: "张磊", stock: 1240, barns: 12, status: "运营中" },
  { id: "F002", name: "2 号牧场", region: "内蒙古·锡林郭勒", area: "960 亩", manager: "李建国", stock: 856, barns: 8, status: "运营中" },
  { id: "F003", name: "3 号牧场", region: "黑龙江·齐齐哈尔", area: "1450 亩", manager: "王志强", stock: 390, barns: 5, status: "筹建中" },
];

function FarmPage() {
  return (
    <>
      <AppHeader title="牛场信息" breadcrumb={["基础档案", "牛场信息"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input placeholder="搜索牛场名称 / 编号" className="h-9 w-72 pl-9 text-body-sm" />
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建牛场
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {farms.map((f) => (
            <Card key={f.id} className="border-border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="text-card-title text-foreground">{f.name}</div>
                    <div className="text-caption text-text-tertiary font-mono">{f.id}</div>
                  </div>
                </div>
                <span className={`tag ${f.status === "运营中" ? "tag-success" : "tag-warning"}`}>{f.status}</span>
              </div>
              <div className="space-y-2 text-body-sm">
                <div className="flex items-center gap-2 text-text-secondary"><MapPin className="h-3.5 w-3.5 text-text-tertiary" /> {f.region} · {f.area}</div>
                <div className="flex items-center gap-2 text-text-secondary"><Users className="h-3.5 w-3.5 text-text-tertiary" /> 负责人：{f.manager}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2">
                <div>
                  <div className="text-caption text-text-tertiary">存栏</div>
                  <div className="flex items-baseline gap-1 mt-0.5"><Beef className="h-3.5 w-3.5 text-primary" /><span className="tabular-nums text-section-title text-foreground">{f.stock}</span><span className="text-caption text-text-tertiary">头</span></div>
                </div>
                <div>
                  <div className="text-caption text-text-tertiary">牛舍</div>
                  <div className="flex items-baseline gap-1 mt-0.5"><span className="tabular-nums text-section-title text-foreground">{f.barns}</span><span className="text-caption text-text-tertiary">个</span></div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground">查看</Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground"><Pencil className="h-3.5 w-3.5" />编辑</Button>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-danger"><Trash2 className="h-3.5 w-3.5" />删除</Button>
              </div>
            </Card>

          ))}
        </div>
      </main>
    </>
  );
}
