import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
  // 避免 SSR/客户端时间差导致的水合不一致
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // 已使用的药品，领取时间超过 24 小时后自动清除；非全场视角只看自己的
  const items = useMemo(() => {
    const scoped = farmView ? L3_ITEMS : L3_ITEMS.filter((i) => i.holder === CURRENT_HOLDER);
    if (now === null) return scoped;
    return scoped.filter((i) => {
      if (!i.used) return true;
      const claimed = new Date(i.claimedAt.replace(/-/g, "/")).getTime();
      if (Number.isNaN(claimed)) return true;
      return now - claimed < 24 * 60 * 60 * 1000;
    });
  }, [now, farmView]);

  /** 全场视角：按人员汇总 */
  const holders = useMemo(() => {
    const map = new Map<string, { name: string; role?: string; total: number; unused: number }>();
    items.forEach((i) => {
      const cur = map.get(i.holder) ?? { name: i.holder, role: i.holderRole, total: 0, unused: 0 };
      cur.total += 1;
      if (!i.used) cur.unused += 1;
      map.set(i.holder, cur);
    });
    return [...map.values()].sort((a, b) => b.unused - a.unused || b.total - a.total);
  }, [items]);

  const scopedItems = useMemo(
    () => (holder === "__all__" ? items : items.filter((i) => i.holder === holder)),
    [items, holder]
  );

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const filtered = scopedItems.filter((i) => {
      if (tab === "unused" && i.used) return false;
      if (tab === "used" && !i.used) return false;
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
  }, [scopedItems, tab, q]);

  const unusedCount = scopedItems.filter((i) => !i.used).length;
  const usedCount = scopedItems.length - unusedCount;
  const usedRate = scopedItems.length ? Math.round((usedCount / scopedItems.length) * 100) : 0;

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: `全部 ${scopedItems.length}` },
    { key: "unused", label: `未使用 ${unusedCount}` },
    { key: "used", label: `已使用 ${usedCount}` },
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




      <div className="px-4 pt-3 pb-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={farmView ? "搜索药品 / 追溯码 / 领用人 / 耳号" : "搜索药品 / 追溯码 / 牛只耳号"}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary"
          />
        </div>

        {/* 全场视角：按领用人筛选 */}
        {farmView && (
          <div className="-mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 w-max pb-0.5">
              <HolderChip
                active={holder === "__all__"}
                onClick={() => setHolder("__all__")}
                title="全部人员"
                sub={`${items.length} 件`}
              />
              {holders.map((h) => (
                <HolderChip
                  key={h.name}
                  active={holder === h.name}
                  onClick={() => setHolder(h.name)}
                  title={h.name}
                  sub={`${h.unused} 未用 / ${h.total} 件`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="inline-flex p-0.5 rounded-md bg-surface-subtle text-caption">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-2.5 h-7 rounded ${
                tab === t.key ? "bg-card text-primary font-medium shadow-sm" : "text-text-tertiary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
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

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "brand" }) {
  return (
    <div className="px-2 text-center">
      <div
        className={`text-section-title font-semibold tabular-nums ${
          tone === "brand" ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-caption text-text-tertiary">{label}</div>
    </div>
  );
}

function HolderChip({
  active,
  onClick,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-lg border text-left ${
        active ? "border-primary bg-brand-subtle" : "border-border bg-card"
      }`}
    >
      <div className={`text-caption font-medium ${active ? "text-primary" : "text-foreground"}`}>
        {title}
      </div>
      <div className="text-[11px] leading-4 text-text-tertiary tabular-nums">{sub}</div>
    </button>
  );
}

function ItemCard({ item: i, showHolder }: { item: L3Item; showHolder: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
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
          className={`shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-full text-caption font-medium ${
            i.used ? "bg-surface-subtle text-text-secondary" : "bg-brand-subtle text-primary"
          }`}
        >
          {i.used ? <CheckCircle2 className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
          {i.used ? "已使用" : "未使用"}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-caption text-text-tertiary font-mono truncate">{i.code}</span>
        {showHolder && (
          <span className="ml-auto shrink-0 inline-flex items-center gap-1 h-5 px-1.5 rounded bg-surface-subtle text-caption text-text-secondary">
            <User className="h-3 w-3 text-text-tertiary" />
            {i.holder}
            {i.holderRole ? <span className="text-text-tertiary">· {i.holderRole}</span> : null}
          </span>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-border space-y-1.5">
        <div className="flex items-center gap-1.5 text-caption text-text-secondary">
          <Clock className="h-3 w-3 text-text-tertiary shrink-0" />
          领取时间
          <span className="ml-auto tabular-nums text-foreground">{i.claimedAt}</span>
        </div>
        <div className="flex items-center gap-1.5 text-caption text-text-secondary">
          <CheckCircle2 className="h-3 w-3 text-text-tertiary shrink-0" />
          使用时间
          <span className="ml-auto tabular-nums text-foreground">{i.usedAt ?? "—"}</span>
        </div>
        <div className="flex items-start gap-1.5 text-caption text-text-secondary">
          <Beef className="h-3 w-3 text-text-tertiary shrink-0 mt-0.5" />
          相关牛只
          <span className="ml-auto text-right text-foreground">
            {i.cattle && i.cattle.length > 0 ? (
              <span className="inline-flex flex-wrap justify-end gap-1">
                {i.cattle.map((c) => (
                  <span
                    key={c}
                    className="px-1.5 h-5 inline-flex items-center rounded bg-surface-subtle font-mono"
                  >
                    {c}
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
