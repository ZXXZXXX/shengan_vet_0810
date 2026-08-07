import { useMemo, useState } from "react";
import { X, Search, Beef, Clock, CheckCircle2, CircleDashed } from "lucide-react";

export type L3Item = {
  /** 单个药品的唯一码（扫码码/追溯码） */
  code: string;
  name: string;
  spec: string;
  batch?: string;
  manufacturer?: string;
  used: boolean;
  claimedAt: string;
  usedAt?: string;
  /** 用到的牛只耳号 */
  cattle?: string[];
};

/** 演示数据：三级库（个人库）中的药品 */
export const L3_ITEMS: L3Item[] = [
  {
    code: "SN-8801-0231",
    name: "精制盐酸头孢噻呋注射液",
    spec: "100ml:5g / 瓶",
    batch: "B240517",
    manufacturer: "齐鲁动保",
    used: true,
    claimedAt: "2026-08-07 07:42",
    usedAt: "2026-08-07 09:10",
    cattle: ["01-24-2412", "01-24-2376"],
  },
  {
    code: "SN-8801-0232",
    name: "精制盐酸头孢噻呋注射液",
    spec: "100ml:5g / 瓶",
    batch: "B240517",
    manufacturer: "齐鲁动保",
    used: false,
    claimedAt: "2026-08-07 07:42",
  },
  {
    code: "SN-6620-1187",
    name: "氟尼辛葡甲胺注射液",
    spec: "100ml / 瓶",
    batch: "B240603",
    manufacturer: "瑞普生物",
    used: true,
    claimedAt: "2026-08-07 07:42",
    usedAt: "2026-08-07 08:55",
    cattle: ["01-24-2381"],
  },
  {
    code: "SN-4410-0902",
    name: "20% 葡萄糖注射液",
    spec: "500ml / 瓶",
    batch: "B240419",
    manufacturer: "华农动保",
    used: false,
    claimedAt: "2026-08-06 07:30",
  },
  {
    code: "SN-4410-0903",
    name: "复方氯化钠注射液",
    spec: "500ml / 瓶",
    batch: "B240422",
    manufacturer: "华农动保",
    used: true,
    claimedAt: "2026-08-06 07:30",
    usedAt: "2026-08-06 10:12",
    cattle: ["01-24-2298"],
  },
];

export function Level3StoreSheet({
  open,
  onClose,
  items = L3_ITEMS,
}: {
  open: boolean;
  onClose: () => void;
  items?: L3Item[];
}) {
  const [tab, setTab] = useState<"all" | "unused" | "used">("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((i) => {
      if (tab === "unused" && i.used) return false;
      if (tab === "used" && !i.used) return false;
      if (!kw) return true;
      return (
        i.name.toLowerCase().includes(kw) ||
        i.code.toLowerCase().includes(kw) ||
        (i.cattle ?? []).some((c) => c.toLowerCase().includes(kw))
      );
    });
  }, [items, tab, q]);

  const unusedCount = items.filter((i) => !i.used).length;

  if (!open) return null;

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: `全部 ${items.length}` },
    { key: "unused", label: `未使用 ${unusedCount}` },
    { key: "used", label: `已使用 ${items.length - unusedCount}` },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[440px] bg-[var(--bg-page)] rounded-t-2xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 h-12 flex items-center justify-between border-b border-border bg-card rounded-t-2xl shrink-0">
          <div className="min-w-0">
            <div className="text-body font-medium text-foreground">三级库</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-2 bg-card shrink-0 space-y-2.5">
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

        <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
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
                      i.used
                        ? "bg-surface-subtle text-text-secondary"
                        : "bg-brand-subtle text-primary"
                    }`}
                  >
                    {i.used ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <CircleDashed className="h-3 w-3" />
                    )}
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
      </div>
    </div>
  );
}
