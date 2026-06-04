import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Beef, Home, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/search")({
  head: () => ({ meta: [{ title: "搜索查询 · 奇点智牧" }] }),
  component: SearchPage,
});

// mock 牛只 / 牛舍数据
const allCows = Array.from({ length: 36 }, (_, i) => {
  const id = `A${2381 + i}`;
  const barnIdx = (i % 8) + 1;
  return { id, barn: `${barnIdx} 号牛舍` };
});
const allBarns = Array.from({ length: 8 }, (_, i) => ({
  id: `B${String(i + 1).padStart(3, "0")}`,
  name: `${i + 1} 号牛舍`,
  stock: 120 + i * 12,
}));

function SearchPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"cow" | "barn">("cow");
  const [q, setQ] = useState("");

  const cowResults = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];
    return allCows.filter((c) => c.id.toLowerCase().includes(kw)).slice(0, 20);
  }, [q]);

  const barnResults = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return allBarns;
    return allBarns.filter(
      (b) => b.id.toLowerCase().includes(kw) || b.name.includes(kw)
    );
  }, [q]);

  return (
    <MobileShell title="搜索查询" back hideTabBar>
      <div className="px-4 pt-3 pb-8 space-y-4">
        {/* 切换 */}
        <div className="inline-flex rounded-full border border-border bg-surface-subtle p-0.5">
          {[
            { v: "cow" as const, label: "牛只", Icon: Beef },
            { v: "barn" as const, label: "牛舍", Icon: Home },
          ].map(({ v, label, Icon }) => {
            const active = mode === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setMode(v)}
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
            placeholder={mode === "cow" ? "输入牛只编号" : "输入牛舍编号或名称"}
            className="w-full h-11 pl-9 pr-3 rounded-xl bg-card border border-border text-body placeholder:text-text-tertiary"
          />
        </div>

        {/* 结果 */}
        {mode === "cow" ? (
          q.trim() === "" ? (
            <EmptyHint text="输入牛只编号开始查询" />
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
                    <div className="text-caption text-text-tertiary">{c.barn}</div>
                  </div>
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
              <div className="text-caption text-text-tertiary px-1">全部牛舍</div>
            )}
            {barnResults.map((b) => (
              <button
                key={b.id}
                onClick={() =>
                  navigate({ to: "/m/barns/$id", params: { id: b.id } })
                }
                className="w-full flex items-center gap-3 h-14 px-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
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
                <ChevronRight className="h-4 w-4 text-text-tertiary" />
              </button>
            ))}
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
