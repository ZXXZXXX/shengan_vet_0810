import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Beef, Home, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/search")({
  head: () => ({ meta: [{ title: "搜索档案 · 奇点智牧" }] }),
  component: SearchPage,
});

type CowStatus = "健康" | "观察中" | "治疗中" | "异常";
type Cow = { id: string; barnIdx: number; penIdx: number; status: CowStatus };
type PenType = "病牛舍" | "产后护理舍" | "成牛舍" | "犊牛舍" | "围产舍" | "干奶舍";

const statusTone: Record<CowStatus, string> = {
  健康: "tag tag-success",
  观察中: "tag tag-warning",
  治疗中: "tag tag-info",
  异常: "tag tag-danger",
};

const penTypeTone: Record<PenType, string> = {
  病牛舍: "tag tag-danger",
  产后护理舍: "tag tag-warning",
  成牛舍: "tag tag-brand",
  犊牛舍: "tag tag-info",
  围产舍: "tag tag-warning",
  干奶舍: "tag tag-muted",
};

const STATUSES: CowStatus[] = ["健康", "健康", "健康", "健康", "健康", "观察中", "治疗中", "异常"];
const BARN_COUNT = 8;
const PEN_PER_BARN = 4;
const COWS_PER_PEN = 100;

// 各牛舍主用途（一个牛舍内 4 个栏共享同一类型，简化 mock）
const BARN_TYPE: PenType[] = [
  "成牛舍",
  "成牛舍",
  "病牛舍",
  "产后护理舍",
  "围产舍",
  "犊牛舍",
  "干奶舍",
  "成牛舍",
];

function cowIdFor(barnIdx: number, penIdx: number, i: number) {
  const seq = (barnIdx - 1) * PEN_PER_BARN * COWS_PER_PEN + (penIdx - 1) * COWS_PER_PEN + i + 1;
  return `01-24-${String(2000 + seq).padStart(4, "0")}`;
}

function statusFor(barnIdx: number, penIdx: number, i: number): CowStatus {
  return STATUSES[(barnIdx * 13 + penIdx * 7 + i) % STATUSES.length];
}

// 今日移入 / 减少：根据牛舍、栏稳定生成 0~6
function todayInOut(barnIdx: number, penIdx: number) {
  const seed = barnIdx * 31 + penIdx * 11;
  return {
    movedIn: (seed * 7) % 7,
    movedOut: (seed * 5 + 3) % 5,
  };
}

type Pen = {
  barnIdx: number;
  barnId: string;
  barnName: string;
  idx: number;
  name: string;
  fullName: string;
  type: PenType;
  stock: number;
  movedIn: number;
  movedOut: number;
};

const allPens: Pen[] = [];
for (let bi = 0; bi < BARN_COUNT; bi++) {
  const barnIdx = bi + 1;
  const barnId = `B${String(barnIdx).padStart(3, "0")}`;
  const barnName = `${barnIdx} 号牛舍`;
  const type = BARN_TYPE[bi];
  for (let pi = 0; pi < PEN_PER_BARN; pi++) {
    const penIdx = pi + 1;
    const globalPenNo = (barnIdx - 1) * PEN_PER_BARN + penIdx;
    const { movedIn, movedOut } = todayInOut(barnIdx, penIdx);
    allPens.push({
      barnIdx,
      barnId,
      barnName,
      idx: penIdx,
      name: `${globalPenNo} 栏`,
      fullName: `${barnName} · ${globalPenNo} 栏`,
      type,
      stock: COWS_PER_PEN,
      movedIn,
      movedOut,
    });
  }
}

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

  const cowResults = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];
    return searchCows(kw);
  }, [q]);

  const penResults = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];
    return allPens.filter(
      (p) =>
        p.barnId.toLowerCase().includes(kw) ||
        p.barnName.includes(kw) ||
        p.fullName.includes(kw) ||
        p.type.includes(kw),
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
            placeholder={
              mode === "cow"
                ? "输入牛只编号，如 01-24-2381"
                : "输入牛舍编号、名称或类型，如 B001 / 病牛舍"
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
          <EmptyHint text="输入牛舍编号、名称或类型查询牛栏" />
        ) : penResults.length === 0 ? (
          <EmptyHint text="未找到匹配的牛栏" />
        ) : (
          <div className="space-y-2">
            <div className="text-caption text-text-tertiary px-1">
              共 {penResults.length} 个牛栏
            </div>
            {penResults.map((pen) => {
              const globalPenNo = (pen.barnIdx - 1) * PEN_PER_BARN + pen.idx;
              return (
              <button
                key={`${pen.barnId}-${pen.idx}`}
                onClick={() =>
                  navigate({
                    to: "/m/pens/$id",
                    params: { id: `${pen.barnId}-${globalPenNo}` },
                  })
                }
                className="w-full rounded-xl bg-card border border-border p-3 text-left active:bg-surface-subtle"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-body font-medium text-foreground">
                        {pen.fullName}
                      </span>
                      <span
                        className={penTypeTone[pen.type]}
                      >
                        {pen.type}
                      </span>
                    </div>
                    <div className="text-caption text-text-tertiary mt-0.5">编号 {pen.barnId}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
                </div>

                <div className="mt-3 grid grid-cols-3 divide-x divide-border">
                  <Stat label="当前存栏" value={pen.stock} unit="头" />
                  <Stat label="今日移入" value={pen.movedIn} unit="头" tone="up" />
                  <Stat label="今日移出" value={pen.movedOut} unit="头" tone="down" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number;
  unit: string;
  tone?: "up" | "down";
}) {
  const color =
    tone === "up"
      ? "text-status-success"
      : tone === "down"
        ? "text-status-danger"
        : "text-foreground";
  const Icon = tone === "up" ? ArrowUpRight : tone === "down" ? ArrowDownRight : null;
  return (
    <div className="px-3 first:pl-0 last:pr-0">
      <div className="text-caption text-text-tertiary">{label}</div>
      <div className={`mt-1 inline-flex items-baseline gap-0.5 ${color}`}>
        {Icon ? <Icon className="h-3.5 w-3.5 self-center" /> : null}
        <span className="text-section font-medium tabular-nums">{value}</span>
        <span className="text-caption text-text-tertiary ml-0.5">{unit}</span>
      </div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-card border border-dashed border-border py-10 text-center text-body-sm text-text-tertiary">
      {text}
    </div>
  );
}
