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
  Pill,

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

  const [tab, setTab] = useState<"all" | "unused" | "partial" | "used">("all");
  const [q, setQ] = useState("");
  const [holder, setHolder] = useState<string>("__all__");



  // 仅展示最近 7 天领取的药品；已使用的保留展示，不做自动清除；非全场视角只看自己的
  const items = useMemo(() => {
    const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const within7d = (i: L3Item) => {
      const t = new Date(i.claimedAt.replace(" ", "T")).getTime();
      return Number.isNaN(t) ? true : t >= since;
    };
    return L3_ITEMS.filter((i) => within7d(i) && (farmView || i.holder === CURRENT_HOLDER));
  }, [farmView]);



  /** 关键词过滤后的全部药品 */
  const searched = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(kw) ||
        i.code.toLowerCase().includes(kw) ||
        i.holder.toLowerCase().includes(kw) ||
        (i.cattle ?? []).some((c) => c.toLowerCase().includes(kw)),
    );
  }, [items, q]);

  /** 分组：组合用药按 comboId 合并；单项药品按「药品 + 规格 + 领用人」合并为一张卡片 */
  const allGroups = useMemo(() => {
    const out: { key: string; items: L3Item[]; combo: boolean }[] = [];
    const idx = new Map<string, number>();
    [...searched]
      .sort((a, b) => {
        if (a.used !== b.used) return a.used ? 1 : -1;
        if (a.used) return (a.usedAt ?? "").localeCompare(b.usedAt ?? "");
        return a.claimedAt.localeCompare(b.claimedAt);
      })
      .forEach((i) => {
        const key = i.comboId ? `combo:${i.comboId}` : `drug:${i.name}|${i.spec}|${i.holder}`;
        const at = idx.get(key);
        if (at === undefined) {
          idx.set(key, out.length);
          out.push({ key, items: [i], combo: !!i.comboId });
        } else {
          out[at].items.push(i);
        }
      });
    return out.map((g) => ({ ...g, status: groupStatus(g.items, g.combo).status }));
  }, [searched]);

  /** 状态 tab 计数（整卡口径） */
  const totalUnused = allGroups.filter((g) => g.status === "unused").length;
  const totalPartial = allGroups.filter((g) => g.status === "partial").length;
  const totalUsed = allGroups.filter((g) => g.status === "used").length;

  /** 当前状态下的卡片（不受人员筛选影响），用于人员标签计数 */
  const statusGroups = useMemo(
    () => allGroups.filter((g) => (tab === "all" ? true : g.status === tab)),
    [allGroups, tab],
  );

  /** 全场视角：按人员汇总（当前状态口径） */
  const holders = useMemo(() => {
    const map = new Map<string, { name: string; role?: string; total: number }>();
    statusGroups.forEach((g) => {
      const h = g.items[0];
      const cur = map.get(h.holder) ?? { name: h.holder, role: h.holderRole, total: 0 };
      cur.total += 1;
      map.set(h.holder, cur);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [statusGroups]);

  const groups = useMemo(
    () => statusGroups.filter((g) => holder === "__all__" || g.items[0].holder === holder),
    [statusGroups, holder],
  );

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: `全部 ${allGroups.length}` },
    { key: "unused", label: `未使用 ${totalUnused}` },
    { key: "partial", label: `使用中 ${totalPartial}` },
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
              <span className="ml-1.5 align-middle text-caption font-normal text-text-tertiary"></span>
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
                count={statusItems.length}

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
        {groups.length === 0 ? (
          <div className="text-center py-12 text-body-sm text-text-tertiary">暂无药品</div>
        ) : (
          groups.map((g) =>
            g.combo ? (
              <ComboCard key={g.key} items={g.items} showHolder={farmView} />
            ) : (
              <ItemCard key={g.key} items={g.items} showHolder={farmView} />
            ),
          )
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



function ItemCard({ items, showHolder }: { items: L3Item[]; showHolder: boolean }) {
  const head = items[0];
  const allUsed = items.every((i) => i.used);
  const usedCount = items.filter((i) => i.used).length;
  const cattle = Array.from(new Set(items.flatMap((i) => i.cattle ?? [])));
  const claimedAt = items.map((i) => i.claimedAt).sort()[0];
  const usedAt = items
    .map((i) => i.usedAt)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <div
      className="rounded-xl bg-card border p-3.5"
      style={{ borderColor: allUsed ? "#E8EAE9" : "#B8E0C2" }}
    >
      {/* 顶部：药品名称 + 使用状态 */}
      <div className="flex items-center gap-2">
        <Pill className={`h-5 w-5 shrink-0 ${allUsed ? "text-text-tertiary" : "text-primary"}`} />
        <div className="flex-1 min-w-0 text-body font-semibold text-foreground truncate">
          {head.name}
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 text-caption font-medium ${
            allUsed ? "text-text-tertiary" : "text-primary"
          }`}
        >
          {allUsed ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <CircleDashed className="h-3.5 w-3.5" />
          )}
          {allUsed
            ? "已使用"
            : items.length <= 1
              ? "未使用"
              : `已用 ${usedCount}/${items.length}`}
        </span>
      </div>

      {/* 第二行：规格 · 数量 + 领用人 */}
      <div className="mt-2 flex items-center justify-between gap-2 text-caption">
        <div className="text-text-tertiary truncate">
          规格 <span className="text-text-secondary">{head.spec}</span>
          <span className="mx-2 text-border">·</span>
          共 <span className="text-text-secondary">{items.length}</span> 支
        </div>
        {showHolder && (
          <span className="shrink-0 inline-flex items-center gap-1 text-text-secondary">
            <User className="h-3 w-3 text-text-tertiary" />
            {head.holder}
            {head.holderRole ? (
              <span className="text-text-tertiary">· {head.holderRole}</span>
            ) : null}
          </span>
        )}
      </div>

      {/* 虚线分隔 */}
      <div className="my-3 border-t border-dashed border-border" />

      {/* 明细：每支药品的追溯码 / 厂商 · 批次 */}
      <div className="space-y-2.5">
        {items.map((i) => (
          <div key={i.code} className={`min-w-0 ${i.used ? "line-through opacity-55" : ""}`}>
            <div
              className={`text-caption font-mono truncate ${i.used ? "text-text-tertiary" : "text-text-secondary"}`}
            >
              {i.code}
            </div>
            <div className="text-caption mt-0.5">
              <span className={i.used ? "text-text-tertiary" : "text-primary"}>
                {i.manufacturer ?? "—"}
              </span>
              {i.batch && (
                <>
                  <span className="mx-2 text-border">·</span>
                  <span className="text-text-tertiary font-mono">{i.batch}</span>
                </>
              )}
            </div>
          </div>
        ))}


        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <Clock className="h-3 w-3 shrink-0" />
            领取
            <span className="ml-auto tabular-nums text-text-secondary">{claimedAt}</span>
          </div>
          <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            使用
            <span className="ml-auto tabular-nums text-text-secondary">{usedAt ?? "—"}</span>
          </div>
          <div className="flex items-start gap-1.5 text-caption text-text-tertiary">
            <Beef className="h-3 w-3 shrink-0 mt-0.5" />
            牛只
            <span className="ml-auto text-right">
              {cattle.length > 0 ? (
                <span className="inline-flex flex-wrap justify-end gap-1">
                  {cattle.map((c) => (
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


/** 组合用药卡片：结构与领药端保持一致（橙色系 + 双药丸图标 + 组内明细） */
function ComboCard({ items, showHolder }: { items: L3Item[]; showHolder: boolean }) {
  const head = items[0];
  const allUsed = items.every((i) => i.used);
  const usedCount = items.filter((i) => i.used).length;
  const names = Array.from(new Set(items.map((i) => i.name)));
  const title = `用药组合：${names
    .slice(0, 3)
    .map((n) => (n.length > 3 ? `${n.slice(0, 3)}…` : n))
    .join(" + ")}${names.length > 3 ? " + …" : ""}`;
  const cattle = Array.from(new Set(items.flatMap((i) => i.cattle ?? [])));
  const usedAt = items
    .map((i) => i.usedAt)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <div
      className="rounded-xl bg-card border p-3.5"
      style={{ borderColor: allUsed ? "#E8EAE9" : "#FFD2A8" }}
    >
      {/* 顶部：组合名称 + 使用状态 */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex -space-x-1 shrink-0 ${allUsed ? "text-text-tertiary" : "text-[#E5751A]"}`}
        >
          <Pill className="h-4 w-4" />
          <Pill className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-0 text-body font-semibold text-foreground truncate">
          {title}
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 text-caption font-medium ${
            allUsed ? "text-text-tertiary" : "text-[#E5751A]"
          }`}
        >
          {allUsed ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <CircleDashed className="h-3.5 w-3.5" />
          )}
          {(() => {
            const total =
              head.comboScope === "single" ? 1 : (head.comboCattleCount ?? items.length);
            if (allUsed) return "已使用";
            if (total <= 1) return "未使用";
            return `已用 ${usedCount}/${total}`;
          })()}
        </span>
      </div>

      {/* 第二行：治疗牛只 / 组合项数 + 领用人 */}
      <div className="mt-2 flex items-center justify-between gap-2 text-caption">
        <div className="text-text-tertiary truncate">
          {head.comboScope
            ? `治疗牛只 ${head.comboScope === "single" ? 1 : (head.comboCattleCount ?? 1)} 头`
            : `组合 ${items.length} 项`}
          <span className="mx-2 text-border">·</span>
          共 <span className="text-text-secondary">{items.length}</span> 项
        </div>
        {showHolder && (
          <span className="shrink-0 inline-flex items-center gap-1 text-text-secondary">
            <User className="h-3 w-3 text-text-tertiary" />
            {head.holder}
            {head.holderRole ? <span className="text-text-tertiary">· {head.holderRole}</span> : null}
          </span>
        )}
      </div>

      <div className="my-3 border-t border-dashed border-border" />

      {/* 组内药品明细 */}
      <div className="space-y-2.5">
        {items.map((i) => (
          <div key={i.code} className={`min-w-0 ${i.used ? "line-through opacity-55" : ""}`}>
            <div className="flex items-center gap-2">
              <div
                className={`flex-1 min-w-0 text-caption font-medium truncate ${i.used ? "text-text-tertiary" : "text-foreground"}`}
              >
                {i.name}
              </div>
            </div>
            <div
              className={`text-caption font-mono truncate ${i.used ? "text-text-tertiary" : "text-text-secondary"}`}
            >
              {i.code}
            </div>

            <div className="text-caption mt-0.5">
              <span className={i.used ? "text-text-tertiary" : "text-[#E5751A]"}>
                {i.manufacturer ?? "—"}
              </span>
              {i.batch && (
                <>
                  <span className="mx-2 text-border">·</span>
                  <span className="text-text-tertiary font-mono">{i.batch}</span>
                </>
              )}
            </div>
          </div>
        ))}

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <Clock className="h-3 w-3 shrink-0" />
            领取
            <span className="ml-auto tabular-nums text-text-secondary">{head.claimedAt}</span>
          </div>
          <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            使用
            <span className="ml-auto tabular-nums text-text-secondary">{usedAt ?? "—"}</span>
          </div>
          <div className="flex items-start gap-1.5 text-caption text-text-tertiary">
            <Beef className="h-3 w-3 shrink-0 mt-0.5" />
            牛只
            <span className="ml-auto text-right">
              {cattle.length > 0 ? (
                <span className="inline-flex flex-wrap justify-end gap-1">
                  {cattle.map((c) => (
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


