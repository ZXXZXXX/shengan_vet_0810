import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, ScanLine, Beef, Filter, ChevronRight } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/animals/")({
  head: () => ({ meta: [{ title: "基础档案 · 奇点智牧" }] }),
  component: AnimalsPage,
});

type Status = "健康" | "治疗中" | "观察中";

const animals: {
  id: string;
  breed: string;
  age: string;
  barn: string;
  stage: string;
  status: Status;
  health: number;
}[] = [
  { id: "A2381", breed: "荷斯坦", age: "3 岁 4 月", barn: "3 号牛舍", stage: "成母牛", status: "观察中", health: 3.6 },
  { id: "A2105", breed: "荷斯坦", age: "4 岁 1 月", barn: "1 号牛舍", stage: "成母牛", status: "健康", health: 4.8 },
  { id: "A2456", breed: "西门塔尔", age: "2 岁 9 月", barn: "2 号牛舍", stage: "青年", status: "健康", health: 4.6 },
  { id: "A2298", breed: "荷斯坦", age: "5 岁 2 月", barn: "1 号牛舍", stage: "成母牛", status: "治疗中", health: 2.9 },
  { id: "A2502", breed: "西门塔尔", age: "1 岁 8 月", barn: "犊牛舍 A", stage: "犊牛", status: "健康", health: 4.7 },
  { id: "A2611", breed: "荷斯坦", age: "干奶 32 天", barn: "干奶舍", stage: "干奶", status: "健康", health: 4.4 },
  { id: "A2324", breed: "荷斯坦", age: "2 岁 1 月", barn: "2 号牛舍", stage: "青年", status: "观察中", health: 3.8 },
];

const filters = ["全部", "健康", "观察中", "治疗中"] as const;

const statusTag: Record<Status, string> = {
  健康: "tag tag-success",
  观察中: "tag tag-warning",
  治疗中: "tag tag-danger",
};

function AnimalsPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("全部");
  const list = useMemo(
    () =>
      animals.filter((a) => {
        if (filter !== "全部" && a.status !== filter) return false;
        if (q && !`${a.id} ${a.breed} ${a.barn}`.toLowerCase().includes(q.toLowerCase())) {
          return false;
        }
        return true;
      }),
    [q, filter]
  );

  return (
    <MobileShell>
      {/* 顶部搜索区 */}
      <header className="px-4 pt-12 pb-3 bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-section-title text-foreground flex-1">基础档案</h1>
          <button className="h-8 w-8 rounded-full bg-surface-subtle text-text-secondary inline-flex items-center justify-center">
            <Filter className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="输入耳标编号 / 品种 / 牛舍"
              className="h-10 w-full pl-9 pr-3 rounded-lg bg-surface-subtle border border-transparent text-body-sm placeholder:text-text-tertiary"
            />
          </div>
          <button className="h-10 px-3 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-1 text-body-sm">
            <ScanLine className="h-4 w-4" /> 扫耳标
          </button>
        </div>
      </header>

      {/* 状态筛选 */}
      <div className="px-4 pt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 h-8 px-3 rounded-full text-body-sm transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-text-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="px-4 mt-3 space-y-2.5">
        <div className="text-caption text-text-tertiary">
          共 {list.length} 头
        </div>
        {list.map((a) => (
          <Link
            key={a.id}
            to="/m/animals/$id"
            params={{ id: a.id }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
          >
            <div className="h-12 w-12 rounded-lg bg-brand-subtle flex items-center justify-center">
              <Beef className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-body text-foreground">#{a.id}</span>
                <span className={statusTag[a.status]}>{a.status}</span>
              </div>
              <div className="text-caption text-text-tertiary mt-0.5 truncate">
                {a.breed} · {a.age} · {a.barn}
              </div>
              <HealthBars score={a.health} />
            </div>
            <ChevronRight className="h-4 w-4 text-text-tertiary" />
          </Link>
        ))}
        {list.length === 0 && (
          <div className="py-16 text-center text-body-sm text-text-tertiary">
            未找到匹配的牛只
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function HealthBars({ score }: { score: number }) {
  const r = Math.round(score);
  const tone =
    r >= 4 ? "bg-[var(--state-success)]" : r >= 3 ? "bg-[var(--state-warning)]" : "bg-[var(--state-danger)]";
  return (
    <div className="mt-1.5 flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-1 w-3.5 rounded-full ${i <= r ? tone : "bg-border"}`} />
      ))}
    </div>
  );
}
