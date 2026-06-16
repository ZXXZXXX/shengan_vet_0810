import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Beef, Home, ChevronRight, ChevronDown } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/search")({
  head: () => ({ meta: [{ title: "搜索档案 · 奇点智牧" }] }),
  component: SearchPage,
});

type CowStatus = "健康" | "观察中" | "治疗中" | "异常";
type Cow = { id: string; barnIdx: number; pen: string; status: CowStatus };

const statusTone: Record<CowStatus, string> = {
  健康: "tag tag-success",
  观察中: "tag tag-warning",
  治疗中: "tag tag-info",
  异常: "tag tag-danger",
};

// mock 数据：8 个牛舍，每舍 3 栏，每栏 6 头牛
const allCows: Cow[] = (() => {
  const list: Cow[] = [];
  let seq = 2381;
  const statuses: CowStatus[] = ["健康", "健康", "健康", "观察中", "治疗中", "异常"];
  for (let b = 1; b <= 8; b++) {
    for (let p = 1; p <= 3; p++) {
      for (let i = 0; i < 6; i++) {
        list.push({
          id: `01-24-${String(seq++).padStart(4, "0")}`,
          barnIdx: b,
          pen: `${p} 栏`,
          status: statuses[(b + p + i) % statuses.length],
        });
      }
    }
  }
  return list;
})();

const allBarns = Array.from({ length: 8 }, (_, i) => {
  const idx = i + 1;
  const cows = allCows.filter((c) => c.barnIdx === idx);
  return {
    id: `B${String(idx).padStart(3, "0")}`,
    idx,
    name: `${idx} 号牛舍`,
    stock: cows.length,
    cows,
  };
});

function SearchPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"cow" | "barn">("cow");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const cowResults = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];
    return allCows.filter((c) => c.id.toLowerCase().includes(kw)).slice(0, 30);
  }, [q]);

  const barnResults = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return allBarns;
    return allBarns.filter(
      (b) => b.id.toLowerCase().includes(kw) || b.name.includes(kw)
    );
  }, [q]);

  return (
    <MobileShell title="搜索档案" back hideTabBar>
      <div className="px-4 pt-3 pb-8 space-y-4">
        {/* 切换 */}
        <div className="inline-flex rounded-full border border-border bg-surface-subtle p-0.5">
          {[
            { v: "cow" as const, label: "按牛只", Icon: Beef },
            { v: "barn" as const, label: "按牛舍", Icon: Home },
          ].map(({ v, label, Icon }) => {
            const active = mode === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setMode(v);
                  setExpanded(null);
                }}
                className={`h-8 min-w-[88px] px-3 rounded-full text-body-sm inline-flex items-center justify-center gap-1 transition-colors ${
                  active
                    ? "bg-card text-foreground border border-border shadow-sm"
                    : "text-text-tertiary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              mode === "cow" ? "输入牛只编号，如 01-24-2381" : "输入牛舍编号或名称"
            }
            className="w-full h-11 pl-9 pr-3 rounded-xl bg-card border border-border text-body placeholder:text-text-tertiary"
          />
        </div>

        {/* 结果 */}
        {mode === "cow" ? (
          q.trim() === "" ? (
            <EmptyHint text="输入牛只编号查询档案" />
          ) : cowResults.length === 0 ? (
            <EmptyHint text="未找到匹配的牛只" />
          ) : (
            <div className="space-y-2">
              {cowResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    navigate({ to: "/m/animals-{$id}", params: { id: c.id } })
                  }
                  className="w-full flex items-center gap-3 h-14 px-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
                >
                  <span className="h-8 w-8 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center">
                    <Beef className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-body font-mono text-foreground">#{c.id}</div>
                    <div className="text-caption text-text-tertiary">
                      {c.barnIdx} 号牛舍 · {c.pen}
                    </div>
                  </div>
                  <span className={statusTone[c.status]}>{c.status}</span>
                  <ChevronRight className="h-4 w-4 text-text-tertiary" />
                </button>
              ))}
            </div>
          )
        ) : barnResults.length === 0 ? (
          <EmptyHint text="未找到匹配的牛舍" />
        ) : (
          <div className="space-y-2">
            {q.trim() === "" && (
              <div className="text-caption text-text-tertiary px-1">
                全部牛舍 · 点击展开查看栏内牛只档案
              </div>
            )}
            {barnResults.map((b) => {
              const isOpen = expanded === b.id;
              const grouped = b.cows.reduce<Record<string, Cow[]>>((acc, c) => {
                (acc[c.pen] ||= []).push(c);
                return acc;
              }, {});
              return (
                <div
                  key={b.id}
                  className="rounded-xl bg-card border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : b.id)}
                    className="w-full flex items-center gap-3 h-14 px-3 active:bg-surface-subtle"
                  >
                    <span className="h-8 w-8 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center">
                      <Home className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-body text-foreground">{b.name}</div>
                      <div className="text-caption text-text-tertiary">
                        编号 {b.id} · 存栏 {b.stock} 头
                      </div>
                    </div>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate({ to: "/m/barns/$id", params: { id: b.id } });
                      }}
                      className="text-caption text-primary px-2 h-7 inline-flex items-center"
                    >
                      牛舍详情
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-text-tertiary transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border bg-surface-subtle/40 px-3 py-3 space-y-3">
                      {Object.entries(grouped).map(([pen, cows]) => (
                        <div key={pen}>
                          <div className="flex items-center justify-between mb-2 px-1">
                            <div className="text-body-sm text-text-secondary font-medium">
                              {pen}
                            </div>
                            <div className="text-caption text-text-tertiary">
                              {cows.length} 头
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {cows.map((c) => (
                              <button
                                key={c.id}
                                onClick={() =>
                                  navigate({
                                    to: "/m/animals-{$id}",
                                    params: { id: c.id },
                                  })
                                }
                                className="rounded-lg bg-card border border-border p-2.5 text-left active:bg-surface-subtle"
                              >
                                <div className="flex items-center gap-1.5">
                                  <Beef className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span className="text-body-sm font-mono text-foreground truncate">
                                    {c.id}
                                  </span>
                                </div>
                                <div className="mt-1.5">
                                  <span className={statusTone[c.status]}>
                                    {c.status}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-card border border-dashed border-border py-10 text-center text-body-sm text-text-tertiary">
      {text}
    </div>
  );
}
