import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  Search,
  Beef,
  Clock,
  CheckCircle2,
  CircleDashed,
  User,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { L3_ITEMS, CURRENT_HOLDER, type L3Item } from "@/lib/level3-items";
import { useRole } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/level3")({
  head: () => ({
    meta: [
      { title: "三级库 · 奇点智牧" },
      { name: "description", content: "查看已领取药品的使用状态、领取时间与相关牛只。" },
      { property: "og:title", content: "三级库 · 奇点智牧" },
      { property: "og:description", content: "查看已领取药品的使用状态、领取时间与相关牛只。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Level3Page,
});

function Level3Page() {
  const navigate = useNavigate();
  const role = useRole();
  // 兽医 / 场长 / 管理员：可查看全场所有人的三级库
  const farmView = role === "vet" || role === "manager" || role === "admin";

  const [tab, setTab] = useState<"all" | "unused" | "used">("all");
  const [q, setQ] = useState("");
  const [holder, setHolder] = useState<string>("__all__");



  // 已使用的药品保留展示，不做自动清除；非全场视角只看自己的
  const items = useMemo(
    () => (farmView ? L3_ITEMS : L3_ITEMS.filter((i) => i.holder === CURRENT_HOLDER)),
    [farmView],
  );


  /** 状态 tab 计数：全部人员口径 */
  const totalUnused = items.filter((i) => !i.used).length;
  const totalUsed = items.length - totalUnused;

  /** 当前状态下的药品（不受人员筛选影响），用于人员标签计数 */
  const statusItems = useMemo(
    () => items.filter((i) => (tab === "unused" ? !i.used : tab === "used" ? i.used : true)),
    [items, tab],
  );

  /** 全场视角：按人员汇总（当前状态口径） */
  const holders = useMemo(() => {
    const map = new Map<string, { name: string; role?: string; total: number }>();
    statusItems.forEach((i) => {
      const cur = map.get(i.holder) ?? { name: i.holder, role: i.holderRole, total: 0 };
      cur.total += 1;
      map.set(i.holder, cur);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [statusItems]);

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const filtered = statusItems.filter((i) => {
      if (holder !== "__all__" && i.holder !== holder) return false;
      if (!kw) return true;
      return (
        i.name.toLowerCase().includes(kw) ||
        i.code.toLowerCase().includes(kw) ||
        i.holder.toLowerCase().includes(kw) ||
        (i.cattle ?? []).some((c) => c.toLowerCase().includes(kw))
      );
    });
    // 未使用在前（按领取时间），已使用在后（按使用时间）
    return filtered.sort((a, b) => {
      if (a.used !== b.used) return a.used ? 1 : -1;
      if (a.used) return (a.usedAt ?? "").localeCompare(b.usedAt ?? "");
      return a.claimedAt.localeCompare(b.claimedAt);
    });
  }, [statusItems, holder, q]);

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: `全部 ${items.length}` },
    { key: "unused", label: `未使用 ${totalUnused}` },
    { key: "used", label: `已使用 ${totalUsed}` },
  ];


  return (
    <MobileShell hideTabBar>
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="h-12 px-2 flex items-center gap-1">
          <button
            onClick={() => navigate({ to: "/m/prep" })}
            className="h-9 w-9 inline-flex items-center justify-center text-text-secondary active:bg-surface-subtle rounded-lg"
            aria-label="返回"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-body font-semibold text-foreground">
            三级库
            {farmView && (
              <span className="ml-1.5 align-middle text-caption font-normal text-text-tertiary">全场</span>
            )}
          </h1>
        </div>
      </header>




      <div className="px-4 pt-3 pb-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={farmView ? "搜索药品 / 追溯码 / 领用人 / 耳号" : "搜索药品 / 追溯码 / 牛只耳号"}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* 状态分段控件 */}
        <div className="flex items-center gap-5 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative pb-2 text-body-sm transition-colors ${
                tab === t.key ? "text-primary font-medium" : "text-text-tertiary"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* 全场视角：按领用人筛选 */}
        {farmView && (
          <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 w-max pb-0.5">
              <HolderChip
                active={holder === "__all__"}
                onClick={() => setHolder("__all__")}
                title="全部人员"
                count={items.length}
              />
              {holders.map((h) => (
                <HolderChip
                  key={h.name}
                  active={holder === h.name}
                  onClick={() => setHolder(h.name)}
                  title={h.name}
                  count={h.total}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 space-y-2.5">
        {list.length === 0 ? (
          <div className="text-center py-12 text-body-sm text-text-tertiary">暂无药品</div>
        ) : (
          list.map((i) => <ItemCard key={i.code} item={i} showHolder={farmView} />)
        )}
      </div>
    </MobileShell>
  );
}

function HolderChip({
  active,
  onClick,
  title,
  count,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-caption border transition-colors ${
        active
          ? "bg-brand-subtle border-primary/30 text-primary font-medium"
          : "bg-card border-border text-text-secondary"
      }`}
    >
      <span>{title}</span>
      <span className={`tabular-nums ${active ? "text-primary/70" : "text-text-tertiary"}`}>{count}</span>
    </button>
  );
}



function ItemCard({ item: i, showHolder }: { item: L3Item; showHolder: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-card p-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${i.used ? "border-border" : "border-primary/40"}`}>
      <div>

        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-body-sm font-medium text-foreground truncate">{i.name}</div>
            <div className="text-caption text-text-tertiary mt-0.5 truncate">
              {i.spec}
              {i.manufacturer ? ` · ${i.manufacturer}` : ""}
              {i.batch ? ` · 批号 ${i.batch}` : ""}
            </div>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1 text-caption font-medium ${
              i.used ? "text-text-tertiary" : "text-primary"
            }`}
          >
            {i.used ? <CheckCircle2 className="h-3.5 w-3.5" /> : <CircleDashed className="h-3.5 w-3.5" />}
            {i.used ? "已使用" : "未使用"}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-caption">
          <span className="text-text-tertiary font-mono truncate">{i.code}</span>
          {showHolder && (
            <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-text-secondary">
              <User className="h-3 w-3 text-text-tertiary" />
              {i.holder}
              {i.holderRole ? <span className="text-text-tertiary">· {i.holderRole}</span> : null}
            </span>
          )}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-border/70 space-y-1.5">
          <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <Clock className="h-3 w-3 shrink-0" />
            领取
            <span className="ml-auto tabular-nums text-text-secondary">{i.claimedAt}</span>
          </div>
          <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            使用
            <span className="ml-auto tabular-nums text-text-secondary">{i.usedAt ?? "—"}</span>
          </div>
          <div className="flex items-start gap-1.5 text-caption text-text-tertiary">
            <Beef className="h-3 w-3 shrink-0 mt-0.5" />
            牛只
            <span className="ml-auto text-right">
              {i.cattle && i.cattle.length > 0 ? (
                <span className="inline-flex flex-wrap justify-end gap-1">
                  {i.cattle.map((c) => (
                    <span
                      key={c}
                      className="px-1.5 h-5 inline-flex items-center rounded-md bg-brand-subtle text-primary font-mono"
                    >
                      {c}
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-text-secondary">—</span>
              )}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
