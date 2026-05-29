import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pill, Search, TrendingUp, ChevronRight, X, Boxes, Lock } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useFarm } from "@/lib/farm-store";
import { canViewOperations, useRole } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/kb_drugs")({
  head: () => ({ meta: [{ title: "药品库 · 奇点智牧" }] }),
  component: DrugKBMobile,
});

type Drug = {
  id: string;
  name: string;
  spec: string;
  cat: string;
  maker: string;
  stock: number; // 库存数量
  unit: string;
  out7d: number; // 近 7 天出库数量
};

const DRUGS: Drug[] = [
  { id: "DR-0108", name: "头孢噻呋钠注射液", spec: "5mg × 10 支/盒", cat: "抗生素", maker: "齐鲁动保", stock: 36, unit: "盒", out7d: 24 },
  { id: "DR-0214", name: "口蹄疫疫苗 A 型", spec: "10ml/支", cat: "疫苗", maker: "国农生物", stock: 120, unit: "支", out7d: 84 },
  { id: "DR-0306", name: "伊维菌素注射液", spec: "100ml/瓶", cat: "驱虫药", maker: "瑞普生物", stock: 18, unit: "瓶", out7d: 12 },
  { id: "DR-0412", name: "复合维生素", spec: "500g/罐", cat: "营养剂", maker: "牧元生物", stock: 42, unit: "罐", out7d: 9 },
  { id: "DR-0521", name: "戊二醛消毒液", spec: "5L/桶", cat: "消毒剂", maker: "华北制药", stock: 26, unit: "桶", out7d: 18 },
  { id: "DR-0608", name: "氟尼辛葡甲胺", spec: "100ml/瓶", cat: "解热镇痛", maker: "中牧股份", stock: 14, unit: "瓶", out7d: 11 },
  { id: "DR-0712", name: "50% 葡萄糖注射液", spec: "500ml × 20 瓶", cat: "补液", maker: "齐鲁动保", stock: 8, unit: "件", out7d: 6 },
  { id: "DR-0815", name: "丙二醇", spec: "1L/瓶", cat: "代谢用药", maker: "上海同仁", stock: 22, unit: "瓶", out7d: 15 },
];

function stockTone(stock: number) {
  if (stock <= 10) return "text-[var(--state-danger)]";
  if (stock <= 20) return "text-[var(--state-alert)]";
  return "text-foreground";
}

function DrugKBMobile() {
  const role = useRole();
  const hasPermission = canViewOperations(role);
  const farm = useFarm();
  const [kw, setKw] = useState("");
  const [active, setActive] = useState<Drug | null>(null);

  const top = useMemo(() => [...DRUGS].sort((a, b) => b.out7d - a.out7d).slice(0, 5), []);
  const list = useMemo(() => {
    const k = kw.trim();
    if (!k) return DRUGS;
    return DRUGS.filter((d) => d.name.includes(k) || d.cat.includes(k) || d.maker.includes(k));
  }, [kw]);

  if (!hasPermission) {
    return (
      <MobileShell title="药品库" back hideTabBar>
        <div className="flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
          <div className="h-16 w-16 rounded-full bg-surface-subtle text-text-tertiary inline-flex items-center justify-center mb-3">
            <Lock className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div className="text-body text-foreground">无权限查看</div>
          <div className="text-caption text-text-tertiary mt-1 max-w-[260px]">
            请联系管理人员修改权限
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="药品库" back hideTabBar>
      <div className="px-4 pt-3 pb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="搜索药品 / 厂家 / 分类"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
          />
        </div>


        <section>
          <h3 className="text-card-title text-foreground mb-2">全部药品 · {list.length}</h3>
          <div className="space-y-2">
            {list.map((d) => (
              <button
                key={d.id}
                onClick={() => setActive(d)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle text-left"
              >
                <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
                  <Pill className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-body text-foreground truncate">{d.name}</div>
                  <div className="text-caption text-text-tertiary truncate">
                    {d.spec} · {d.maker}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-body tabular-nums ${stockTone(d.stock)}`}>{d.stock}</div>
                  <div className="text-[10px] text-text-tertiary">库存{d.unit}</div>
                </div>
              </button>
            ))}
            {list.length === 0 && (
              <div className="text-center text-caption text-text-tertiary py-8">未找到匹配的药品</div>
            )}
          </div>
        </section>
      </div>

      {active && <DrugDetailSheet item={active} onClose={() => setActive(null)} />}
    </MobileShell>
  );
}

function DrugDetailSheet({ item, onClose }: { item: Drug; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[440px] bg-card rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-10 w-10 rounded-xl bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
              <Pill className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <div className="text-card-title text-foreground truncate">{item.name}</div>
              <div className="text-caption text-text-tertiary">
                <span className="font-mono">{item.id}</span> · {item.cat}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-md text-text-tertiary active:bg-surface-subtle inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <Stat icon={Boxes} label="库存" value={`${item.stock} ${item.unit}`} tone={stockTone(item.stock)} />
          <Stat icon={TrendingUp} label="近 7 天出库" value={`${item.out7d} ${item.unit}`} />
        </div>

        <div className="rounded-lg border border-border divide-y divide-border">
          <Row label="规格" value={item.spec} />
          <Row label="分类" value={item.cat} />
          <Row label="生产厂家" value={item.maker} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Boxes;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl bg-surface-subtle p-3">
      <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-1 text-card-title tabular-nums ${tone ?? "text-foreground"}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <span className="w-20 shrink-0 text-caption text-text-tertiary">{label}</span>
      <span className="flex-1 text-body-sm text-foreground text-right">{value}</span>
    </div>
  );
}
