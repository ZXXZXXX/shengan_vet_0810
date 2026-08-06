import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight, Syringe, Home } from "lucide-react";

type Node = {
  id: string;
  name: string;
  planned: number;
  done: number;
  children?: Node[];
};

const GROUP: Node = {
  id: "group",
  name: "集团整体",
  planned: 0,
  done: 0,
  children: [
    {
      id: "r-northeast",
      name: "东北大区",
      planned: 0,
      done: 0,
      children: [
        { id: "f1", name: "1 号牧场", planned: 1284, done: 1196 },
        { id: "f2", name: "2 号牧场", planned: 968, done: 842 },
      ],
    },
    {
      id: "r-north",
      name: "华北大区",
      planned: 0,
      done: 0,
      children: [
        { id: "f3", name: "3 号牧场", planned: 2150, done: 2088 },
        { id: "f5", name: "5 号牧场", planned: 1032, done: 806 },
      ],
    },
    {
      id: "r-east",
      name: "华东大区",
      planned: 0,
      done: 0,
      children: [{ id: "f4", name: "4 号牧场", planned: 720, done: 702 }],
    },
  ],
};

function rollup(node: Node): { planned: number; done: number } {
  if (!node.children?.length) return { planned: node.planned, done: node.done };
  return node.children.reduce(
    (acc, c) => {
      const r = rollup(c);
      return { planned: acc.planned + r.planned, done: acc.done + r.done };
    },
    { planned: 0, done: 0 }
  );
}

function rate(n: Node) {
  const { planned, done } = rollup(n);
  return planned === 0 ? 0 : (done / planned) * 100;
}

function toneOf(pct: number) {
  if (pct >= 95) return "var(--state-success)";
  if (pct >= 85) return "var(--state-warning)";
  return "var(--state-danger)";
}

export function ImmunizationRateCard() {
  const [path, setPath] = useState<Node[]>([GROUP]);
  const current = path[path.length - 1];
  const { planned, done } = rollup(current);
  const pct = rate(current);
  const tone = toneOf(pct);
  const children = current.children ?? [];

  return (
    <Card className="border-border bg-card rounded-2xl shadow-card p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)", color: "var(--brand)" }}
            >
              <Syringe className="h-4 w-4" strokeWidth={2} />
            </div>
            <h3 className="text-card-title text-foreground">本期免疫完成率</h3>
          </div>

          {/* 面包屑下钻路径 */}
          <div className="mt-3 flex items-center gap-1 text-body-sm flex-wrap">
            {path.map((n, i) => {
              const last = i === path.length - 1;
              return (
                <span key={n.id} className="inline-flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />}
                  {last ? (
                    <span className="text-foreground font-medium inline-flex items-center gap-1">
                      {i === 0 && <Home className="h-3.5 w-3.5" />}
                      {n.name}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="text-text-tertiary hover:text-primary inline-flex items-center gap-1"
                      onClick={() => setPath(path.slice(0, i + 1))}
                    >
                      {i === 0 && <Home className="h-3.5 w-3.5" />}
                      {n.name}
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="tabular-nums font-semibold leading-none" style={{ fontSize: "32px", color: tone }}>
              {pct.toFixed(1)}
            </span>
            <span className="text-body-sm text-text-tertiary">%</span>
          </div>
          <p className="text-caption text-text-tertiary mt-1 tabular-nums">
            已免疫 {done.toLocaleString()} / 应免疫 {planned.toLocaleString()} 头
          </p>
        </div>
      </div>

      {/* 当前层级总进度 */}
      <div className="mt-4 h-2 rounded-full bg-surface-subtle overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: tone }} />
      </div>

      {/* 下钻列表 */}
      {children.length > 0 && (
        <div className="mt-5 space-y-2">
          {children.map((c) => {
            const cr = rate(c);
            const ct = toneOf(cr);
            const sums = rollup(c);
            const drillable = !!c.children?.length;
            return (
              <button
                key={c.id}
                type="button"
                disabled={!drillable}
                onClick={() => drillable && setPath([...path, c])}
                className={`w-full text-left rounded-xl border border-border px-4 py-3 transition-all ${
                  drillable ? "hover:border-primary/40 hover:bg-surface-subtle cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-body text-foreground">{c.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-caption text-text-tertiary tabular-nums">
                      {sums.done.toLocaleString()}/{sums.planned.toLocaleString()}
                    </span>
                    <span className="text-body-sm font-medium tabular-nums" style={{ color: ct }}>
                      {cr.toFixed(1)}%
                    </span>
                    {drillable && <ChevronRight className="h-4 w-4 text-text-tertiary" />}
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-surface-subtle overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${cr}%`, background: ct }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
