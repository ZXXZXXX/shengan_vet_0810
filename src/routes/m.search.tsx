import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Beef, Home, ChevronRight, ChevronDown } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/search")({
  head: () => ({ meta: [{ title: "搜索档案 · 奇点智牧" }] }),
  component: SearchPage,
});

type CowStatus = "健康" | "观察中" | "治疗中" | "异常";
type Cow = { id: string; barnIdx: number; penIdx: number; status: CowStatus };

const statusTone: Record<CowStatus, string> = {
  健康: "tag tag-success",
  观察中: "tag tag-warning",
  治疗中: "tag tag-info",
  异常: "tag tag-danger",
};

const STATUSES: CowStatus[] = ["健康", "健康", "健康", "健康", "健康", "观察中", "治疗中", "异常"];
const BARN_COUNT = 8;
const PEN_PER_BARN = 4;
const COWS_PER_PEN = 100;

// 牛只编号：aa-bb-cccc。这里 mock 数据按全场顺序编号。
function cowIdFor(barnIdx: number, penIdx: number, i: number) {
  const seq = (barnIdx - 1) * PEN_PER_BARN * COWS_PER_PEN + (penIdx - 1) * COWS_PER_PEN + i + 1;
  return `01-24-${String(2000 + seq).padStart(4, "0")}`;
}

function statusFor(barnIdx: number, penIdx: number, i: number): CowStatus {
  return STATUSES[(barnIdx * 13 + penIdx * 7 + i) % STATUSES.length];
}

const allBarns = Array.from({ length: BARN_COUNT }, (_, bi) => {
  const idx = bi + 1;
  const pens = Array.from({ length: PEN_PER_BARN }, (_, pi) => {
    const penIdx = pi + 1;
    // 仅生成统计需要的状态分布，不预生成所有牛只对象
    const breakdown: Record<CowStatus, number> = { 健康: 0, 观察中: 0, 治疗中: 0, 异常: 0 };
    for (let i = 0; i < COWS_PER_PEN; i++) breakdown[statusFor(idx, penIdx, i)]++;
    return { idx: penIdx, name: `${penIdx} 栏`, stock: COWS_PER_PEN, breakdown };
  });
  return {
    id: `B${String(idx).padStart(3, "0")}`,
    idx,
    name: `${idx} 号牛舍`,
    stock: PEN_PER_BARN * COWS_PER_PEN,
    pens,
  };
});

function listCows(barnIdx: number, penIdx: number, limit = COWS_PER_PEN): Cow[] {
  const out: Cow[] = [];
  for (let i = 0; i < Math.min(limit, COWS_PER_PEN); i++) {
    out.push({ id: cowIdFor(barnIdx, penIdx, i), barnIdx, penIdx, status: statusFor(barnIdx, penIdx, i) });
  }
  return out;
}

// 牛只搜索：按编号过滤（在所有牛舍/栏中扫描）
function searchCows(kw: string, max = 30): Cow[] {
  const out: Cow[] = [];
  for (let b = 1; b <= BARN_COUNT && out.length < max; b++) {
    for (let p = 1; p <= PEN_PER_BARN && out.length < max; p++) {
      for (let i = 0; i < COWS_PER_PEN && out.length < max; i++) {
        const id = cowIdFor(b, p, i);
        if (id.includes(kw)) {
          out.push({ id, barnIdx: b, penIdx: p, status: statusFor(b, p, i) });
        }
      }
    }
  }
  return out;
}

function SearchPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"cow" | "barn">("cow");
  const [q, setQ] = useState("");
  const [expandedBarn, setExpandedBarn] = useState<string | null>(null);
  const [openPen, setOpenPen] = useState<string | null>(null); // `${barnId}-${penIdx}`

  const cowResults = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];
    return searchCows(kw);
  }, [q]);

  const barnResults = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];
    return allBarns.filter((b) => b.id.toLowerCase().includes(kw) || b.name.includes(kw));
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
                  setExpandedBarn(null);
                  setOpenPen(null);
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
              mode === "cow" ? "输入牛只编号，如 01-24-2381" : "输入牛舍编号或名称，如 B001 / 3 号牛舍"
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
                  onClick={() => navigate({ to: "/m/animals-{$id}", params: { id: c.id } })}
                  className="w-full flex items-center gap-3 h-14 px-3 rounded-xl bg-card border border-border active:bg-surface-subtle"
                >
                  <span className="h-8 w-8 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center">
                    <Beef className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-body font-mono text-foreground">#{c.id}</div>
                    <div className="text-caption text-text-tertiary">
                      {c.barnIdx} 号牛舍 · {c.penIdx} 栏
                    </div>
                  </div>
                  <span className={statusTone[c.status]}>{c.status}</span>
                  <ChevronRight className="h-4 w-4 text-text-tertiary" />
                </button>
              ))}
            </div>
          )
        ) : q.trim() === "" ? (
          <EmptyHint text="输入牛舍编号或名称查询" />
        ) : barnResults.length === 0 ? (
          <EmptyHint text="未找到匹配的牛舍" />
        ) : (
          <div className="space-y-3">
            {barnResults.map((b) => {
              const isOpen = expandedBarn === b.id;
              return (
                <div key={b.id} className="rounded-xl bg-card border border-border overflow-hidden">
                  {/* 牛舍头部：摘要 */}
                  <button
                    onClick={() => {
                      setExpandedBarn(isOpen ? null : b.id);
                      setOpenPen(null);
                    }}
                    className="w-full flex items-center gap-3 h-16 px-3 active:bg-surface-subtle"
                  >
                    <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center">
                      <Home className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-body text-foreground">{b.name}</div>
                      <div className="text-caption text-text-tertiary">
                        编号 {b.id} · {PEN_PER_BARN} 栏 · 存栏 {b.stock} 头
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

                  {/* 栏列表 */}
                  {isOpen && (
                    <div className="border-t border-border bg-surface-subtle/40 p-3 space-y-2">
                      {b.pens.map((pen) => {
                        const penKey = `${b.id}-${pen.idx}`;
                        const penOpen = openPen === penKey;
                        const preview = penOpen ? listCows(b.idx, pen.idx, 12) : [];
                        return (
                          <div
                            key={pen.idx}
                            className="rounded-lg bg-card border border-border overflow-hidden"
                          >
                            <button
                              onClick={() => setOpenPen(penOpen ? null : penKey)}
                              className="w-full flex items-center gap-2 h-12 px-3 active:bg-surface-subtle"
                            >
                              <div className="flex-1 min-w-0 text-left">
                                <div className="text-body-sm text-foreground font-medium">
                                  {pen.name}
                                </div>
                                <div className="text-caption text-text-tertiary mt-0.5 flex items-center gap-2 flex-wrap">
                                  <span>{pen.stock} 头</span>
                                  {(["观察中", "治疗中", "异常"] as CowStatus[])
                                    .filter((s) => pen.breakdown[s] > 0)
                                    .map((s) => (
                                      <span key={s} className={statusTone[s]}>
                                        {s} {pen.breakdown[s]}
                                      </span>
                                    ))}
                                </div>
                              </div>
                              <ChevronDown
                                className={`h-4 w-4 text-text-tertiary transition-transform ${
                                  penOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {penOpen && (
                              <div className="border-t border-border px-3 py-3">
                                <div className="grid grid-cols-2 gap-2">
                                  {preview.map((c) => (
                                    <button
                                      key={c.id}
                                      onClick={() =>
                                        navigate({
                                          to: "/m/animals-{$id}",
                                          params: { id: c.id },
                                        })
                                      }
                                      className="rounded-lg bg-surface-subtle border border-border p-2.5 text-left active:bg-card"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <Beef className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span className="text-body-sm font-mono text-foreground truncate">
                                          {c.id}
                                        </span>
                                      </div>
                                      <div className="mt-1.5">
                                        <span className={statusTone[c.status]}>{c.status}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() =>
                                    navigate({ to: "/m/barns/$id", params: { id: b.id } })
                                  }
                                  className="mt-3 w-full h-9 rounded-lg border border-border text-body-sm text-primary inline-flex items-center justify-center gap-1 active:bg-surface-subtle"
                                >
                                  查看该栏全部 {pen.stock} 头
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
