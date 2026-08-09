import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { Card } from "@/components/ui/card";

/** 处于下钻抽屉内时，专题卡去掉卡片外壳，避免“卡中卡” */
export const BareContext = createContext(false);

export const PALETTE = [
  "var(--brand)",
  "var(--effect-ai-cyan)",
  "var(--state-warning)",
  "var(--effect-ai-purple)",
  "var(--state-danger)",
  "color-mix(in oklab, var(--brand) 30%, var(--bg-surface-subtle))",
];

export type Slice = { name: string; value: number; color?: string };

export function SectionCard({
  title,
  icon,
  extra,
  children,
  id,
  desc,
}: {
  title: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  id?: string;
  desc?: string;
}) {
  const bare = useContext(BareContext);
  if (bare) {
    return (
      <div id={id}>
        {extra && <div className="mb-4 flex justify-end">{extra}</div>}
        {children}
      </div>
    );
  }
  return (
    <Card id={id} className="border-border bg-card scroll-mt-24">
      <div className="p-6 pb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <h3 className="truncate text-card-title text-foreground">{title}</h3>
          {desc && <span className="tag tag-muted shrink-0">{desc}</span>}
        </div>
        {extra}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </Card>
  );
}


export function Donut({
  data,
  size = 168,
  centerLabel,
  centerValue,
  centerUnit,
  onSliceClick,
}: {
  data: Slice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
  centerUnit?: string;
  onSliceClick?: (slice: Slice, index: number) => void;
}) {

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 8;
  const inner = r * 0.62;
  const c = size / 2;
  let acc = 0;
  const arcs = data.map((seg, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += seg.value;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const p = (rad: number, radius: number) => [c + radius * Math.cos(rad), c + radius * Math.sin(rad)];
    const [x1, y1] = p(start, r);
    const [x2, y2] = p(end, r);
    const [xi2, yi2] = p(end, inner);
    const [xi1, yi1] = p(start, inner);
    return {
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${large} 0 ${xi1} ${yi1} Z`,
      color: seg.color ?? PALETTE[i % PALETTE.length],
    };
  });
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((a, i) => (
          <path
            key={i}
            d={a.d}
            fill={a.color}
            stroke="var(--bg-surface)"
            strokeWidth="1.5"
            onClick={onSliceClick ? () => onSliceClick(data[i]!, i) : undefined}
            className={onSliceClick ? "cursor-pointer transition-opacity hover:opacity-80" : undefined}
          />
        ))}

      </svg>
      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerLabel && <span className="text-caption text-text-tertiary">{centerLabel}</span>}
          {centerValue && (
            <span className="text-section-title tabular-nums text-foreground">{centerValue}</span>
          )}
          {centerUnit && <span className="text-caption text-text-tertiary">{centerUnit}</span>}
        </div>
      )}
    </div>
  );
}

export function Legend({ data, unit = "" }: { data: Slice[]; unit?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="flex-1 min-w-[220px] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
      {data.map((s, i) => (
        <div key={s.name} className="flex items-center gap-2 py-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ background: s.color ?? PALETTE[i % PALETTE.length] }}
          />
          <span className="text-body-sm text-foreground flex-1 min-w-0 truncate">{s.name}</span>
          <span className="text-body-sm text-text-secondary tabular-nums">
            {s.value.toLocaleString()}
            {unit}
          </span>
          <span className="text-caption text-text-tertiary tabular-nums w-12 text-right">
            {((s.value / total) * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarList({
  data,
  unit = "",
  max,
}: {
  data: Slice[];
  unit?: string;
  max?: number;
}) {
  const top = max ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-body-sm text-foreground truncate">{d.name}</span>
              <span className="text-body-sm text-text-secondary tabular-nums shrink-0">
                {d.value.toLocaleString()}
                {unit}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-surface-subtle overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(d.value / top) * 100}%`,
                  background: d.color ?? PALETTE[i % PALETTE.length],
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export type Series = { name: string; color: string; points: number[] };

export function LineTrend({
  labels,
  series,
  height = 180,
  unit = "",
}: {
  labels: string[];
  series: Series[];
  height?: number;
  unit?: string;
}) {
  const w = 640;
  const h = height;
  const padL = 34;
  const padB = 22;
  const padT = 10;
  const maxV = Math.max(...series.flatMap((s) => s.points), 1);
  const nice = Math.ceil(maxV / 5) * 5 || 5;
  const x = (i: number) => padL + (i * (w - padL - 8)) / Math.max(labels.length - 1, 1);
  const y = (v: number) => padT + (1 - v / nice) * (h - padT - padB);
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={w - 8}
              y1={padT + t * (h - padT - padB)}
              y2={padT + t * (h - padT - padB)}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <text
              x={4}
              y={padT + t * (h - padT - padB) + 4}
              className="tabular-nums"
              fill="var(--text-tertiary)"
              fontSize="10"
            >
              {Math.round(nice * (1 - t))}
            </text>
          </g>
        ))}
        {series.map((s) => (
          <g key={s.name}>
            <polyline
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={s.points.map((p, i) => `${x(i)},${y(p)}`).join(" ")}
            />
            {s.points.map((p, i) => (
              <circle key={i} cx={x(i)} cy={y(p)} r="3" fill="var(--bg-surface)" stroke={s.color} strokeWidth="2" />
            ))}
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={x(i)} y={h - 6} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">
            {l}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-caption text-text-secondary">
            <span className="h-1.5 w-4 rounded-full" style={{ background: s.color }} />
            {s.name}
            {unit && <span className="text-text-tertiary">（{unit}）</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MiniStat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-subtle px-4 py-3">
      <div className="text-caption text-text-tertiary truncate">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className="text-section-title tabular-nums font-medium"
          style={{ color: tone ?? "var(--text-primary)" }}
        >
          {value}
        </span>
        {unit && <span className="text-caption text-text-tertiary">{unit}</span>}
      </div>
    </div>
  );
}

export function PeriodTabs({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-surface-subtle p-0.5 shrink-0">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`h-7 px-3 rounded-full text-caption transition-colors ${
            value === o ? "bg-card text-primary shadow-card" : "text-text-secondary"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
