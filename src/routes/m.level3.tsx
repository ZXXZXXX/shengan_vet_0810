import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, Search, Beef, Clock, CheckCircle2, CircleDashed } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { L3_ITEMS } from "@/lib/level3-items";

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
  const [tab, setTab] = useState<"all" | "unused" | "used">("all");
  const [q, setQ] = useState("");
  // 避免 SSR/客户端时间差导致的水合不一致
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // 已使用的药品，领取时间超过 24 小时后自动清除
  const items = useMemo(() => {
    if (now === null) return L3_ITEMS;
    return L3_ITEMS.filter((i) => {
      if (!i.used) return true;
      const claimed = new Date(i.claimedAt.replace(/-/g, "/")).getTime();
      if (Number.isNaN(claimed)) return true;
      return now - claimed < 24 * 60 * 60 * 1000;
    });
  }, [now]);

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const filtered = items.filter((i) => {
      if (tab === "unused" && i.used) return false;
      if (tab === "used" && !i.used) return false;
      if (!kw) return true;
      return (
        i.name.toLowerCase().includes(kw) ||
        i.code.toLowerCase().includes(kw) ||
        (i.cattle ?? []).some((c) => c.toLowerCase().includes(kw))
      );
    });
    // 未使用在前（按领取时间），已使用在后（按使用时间）
    return filtered.sort((a, b) => {
      if (a.used !== b.used) return a.used ? 1 : -1;
      if (a.used) return (a.usedAt ?? "").localeCompare(b.usedAt ?? "");
      return a.claimedAt.localeCompare(b.claimedAt);
    });
  }, [items, tab, q]);


  const unusedCount = items.filter((i) => !i.used).length;

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: `全部 ${items.length}` },
    { key: "unused", label: `未使用 ${unusedCount}` },
    { key: "used", label: `已使用 ${items.length - unusedCount}` },
  ];

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
          <h1 className="flex-1 text-body font-semibold text-foreground">三级库</h1>
        </div>
      </header>

      <div className="px-4 pt-3 pb-3 bg-card border-b border-border space-y-2.5">
        <div className="text-caption text-text-tertiary">
          已领取但尚未核销的药品，按单件展示状态与去向
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索药品 / 追溯码 / 牛只耳号"
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary"
          />
        </div>
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

      <div className="p-4 space-y-2.5">
        {list.length === 0 ? (
          <div className="text-center py-12 text-body-sm text-text-tertiary">暂无药品</div>
        ) : (
          list.map((i) => (
            <div key={i.code} className="rounded-xl border border-border bg-card p-3">
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

              <div className="mt-2 text-caption text-text-tertiary font-mono truncate">{i.code}</div>

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
          ))
        )}
      </div>
    </MobileShell>
  );
}
