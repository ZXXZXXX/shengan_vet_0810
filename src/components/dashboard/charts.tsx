import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";

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
  return (
    <Card id={id} className="border-border bg-card scroll-mt-24 flex flex-col">
      <div className="p-6 pb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <h3 className="truncate text-card-title text-foreground">{title}</h3>
          {desc && <span className="tag tag-muted shrink-0">{desc}</span>}
        </div>
        {extra}
      </div>
      <div className="px-6 pb-6 flex-1">{children}</div>
    </Card>
  );
}

function Tooltip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-card whitespace-nowrap"
      style={{ left: x, top: y - 8 }}
    >
      {children}
    </div>
  );
}

export function Donut({
  data,
  size = 168,
  centerLabel,
  centerValue,
  centerUnit,
  unit = "",
  onSliceClick,
}: {
  data: Slice[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
  centerUnit?: string;
  unit?: string;
  onSliceClick?: (slice: Slice, index: number) => void;
}) {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
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
  const hovered = hover ? data[hover.i] : null;
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
            onMouseMove={(e) => {
              const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
              setHover({ i, x: e.clientX - box.left, y: e.clientY - box.top });
            }}
            onMouseLeave={() => setHover(null)}
            className={`transition-opacity hover:opacity-80 ${onSliceClick ? "cursor-pointer" : ""}`}
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
      {hover && hovered && (
        <Tooltip x={hover.x} y={hover.y}>
          <div className="text-caption text-foreground">{hovered.name}</div>
          <div className="text-caption text-text-secondary tabular-nums">
            {hovered.value.toLocaleString()}
            {unit} · {((hovered.value / total) * 100).toFixed(1)}%
          </div>
        </Tooltip>
      )}
    </div>
  );
}

export function Legend({ data }: { data: Slice[]; unit?: string }) {
  return (
    <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {data.map((s, i) => (
        <span key={s.name} className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm shrink-0"
            style={{ background: s.color ?? PALETTE[i % PALETTE.length] }}
          />
          <span className="text-caption text-foreground">{s.name}</span>
        </span>
      ))}
    </div>
  );
}

export function StackedBar({
  data,
  unit = "",
  height = 28,
}: {
  data: Slice[];
  unit?: string;
  height?: number;
}) {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const hovered = hover ? data[hover.i] : null;
  return (
    <div className="w-full">
      <div className="relative">
        <div
          className="w-full flex overflow-hidden rounded-lg border border-border"
          style={{ height }}
        >
          {data.map((d, i) => {
            const pct = (d.value / total) * 100;
            return (
              <div
                key={d.name}
                className="h-full flex items-center justify-center overflow-hidden transition-opacity hover:opacity-85"
                style={{
                  width: `${pct}%`,
                  background: d.color ?? PALETTE[i % PALETTE.length],
                }}
                onMouseMove={(e) => {
                  const box = e.currentTarget.parentElement!.getBoundingClientRect();
                  setHover({ i, x: e.clientX - box.left, y: e.clientY - box.top });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </div>
        {hover && hovered && (
          <Tooltip x={hover.x} y={hover.y}>
            <div className="text-caption text-foreground">{hovered.name}</div>
            <div className="text-caption text-text-secondary tabular-nums">
              {hovered.value.toLocaleString()}
              {unit} · {((hovered.value / total) * 100).toFixed(1)}%
            </div>
          </Tooltip>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {data.map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-sm shrink-0"
              style={{ background: d.color ?? PALETTE[i % PALETTE.length] }}
            />
            <span className="text-caption text-foreground">{d.name}</span>
          </span>
        ))}
      </div>
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
  activeIndex,
  onPointClick,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  unit?: string;
  activeIndex?: number;
  onPointClick?: (index: number) => void;
}) {
  const w = 640;
  const h = height;
  const padL = 42;
  const padR = 28;
  const padB = 30;
  const padT = 10;
  const maxV = Math.max(...series.flatMap((s) => s.points), 1);
  const nice = Math.ceil(maxV / 5) * 5 || 5;
  const x = (i: number) => padL + (i * (w - padL - padR)) / Math.max(labels.length - 1, 1);
  const y = (v: number) => padT + (1 - v / nice) * (h - padT - padB);
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="trend-active-col" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.16" />
          </linearGradient>
        </defs>
        {activeIndex != null && activeIndex >= 0 && (() => {
          const step = (w - padL - padR) / Math.max(labels.length - 1, 1);
          // keep every highlight column the same width: use the narrowest one (edge points)
          const cw = labels.reduce(
            (m, _l, i) => Math.min(m, step, (w - x(i)) * 2, x(i) * 2),
            step,
          );
          return (
            <rect
              x={x(activeIndex) - cw / 2}
              y={padT}
              width={cw}
              height={h - padT}
              fill="url(#trend-active-col)"
            />
          );
        })()}



        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={w - padR}
              y1={padT + t * (h - padT - padB)}
              y2={padT + t * (h - padT - padB)}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <text
              x={4}
              y={padT + t * (h - padT - padB) + 5}
              className="tabular-nums"
              fill="var(--text-tertiary)"
              fontSize="13"
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
              <circle
                key={i}
                cx={x(i)}
                cy={y(p)}
                r={activeIndex === i ? 5 : 3}
                fill={activeIndex === i ? s.color : "var(--bg-surface)"}
                stroke={s.color}
                strokeWidth="2"
              />
            ))}
          </g>
        ))}
        {onPointClick &&
          labels.map((l, i) => (
            <g key={`hit-${l}-${i}`} onClick={() => onPointClick(i)} className="cursor-pointer">
              {activeIndex === i && (
                <line
                  x1={x(i)}
                  x2={x(i)}
                  y1={padT}
                  y2={h - padB}
                  stroke="var(--brand)"
                  strokeDasharray="3 4"
                  opacity="0.5"
                />
              )}
              <rect
                x={x(i) - (w - padL - padR) / Math.max(labels.length - 1, 1) / 2}
                y={padT}
                width={(w - padL - padR) / Math.max(labels.length - 1, 1)}
                height={h - padT - padB}
                fill="transparent"
              />
            </g>
          ))}
        {labels.map((l, i) => (
          <text
            key={l}
            x={x(i)}
            y={h - 8}
            textAnchor="middle"
            fill={activeIndex === i ? "var(--brand)" : "var(--text-tertiary)"}
            fontSize={activeIndex === i ? 14 : 13}
            fontWeight={activeIndex === i ? 600 : 400}
          >
            {l}
          </text>
        ))}

      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
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

/* ---------------- 垂直柱状 / 堆积柱状 ---------------- */
export function Columns({
  data,
  unit = "",
  height = 200,
  rounded = true,
}: {
  data: Slice[];
  unit?: string;
  height?: number;
  rounded?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.name} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-2 group">
              <span className="text-caption tabular-nums text-text-secondary">
                {d.value.toLocaleString()}
              </span>
              <div
                className={`w-full transition-all group-hover:opacity-85 ${rounded ? "rounded-t-lg" : ""}`}
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  background: d.color ?? PALETTE[i % PALETTE.length],
                }}
                title={`${d.name}: ${d.value}${unit}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((d) => (
          <span key={d.name} className="flex-1 min-w-0 text-center text-caption text-text-tertiary truncate">
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 面积图 ---------------- */
export function AreaTrend({
  labels,
  points,
  height = 220,
  unit = "",
  color = "var(--brand)",
  activeIndex,
  onPointClick,
}: {
  labels: string[];
  points: number[];
  height?: number;
  unit?: string;
  color?: string;
  activeIndex?: number;
  onPointClick?: (i: number) => void;
}) {
  const w = 640;
  const h = height;
  const padL = 44;
  const padR = 20;
  const padB = 28;
  const padT = 12;
  const maxV = Math.max(...points, 1);
  const nice = Math.ceil(maxV / 5) * 5 || 5;
  const x = (i: number) => padL + (i * (w - padL - padR)) / Math.max(labels.length - 1, 1);
  const y = (v: number) => padT + (1 - v / nice) * (h - padT - padB);
  const line = points.map((p, i) => `${x(i)},${y(p)}`).join(" ");
  const area = `${padL},${h - padB} ${line} ${x(points.length - 1)},${h - padB}`;
  const gid = `area-fill-${Math.round(height)}`;
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={w - padR}
              y1={padT + t * (h - padT - padB)}
              y2={padT + t * (h - padT - padB)}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <text x={4} y={padT + t * (h - padT - padB) + 5} fill="var(--text-tertiary)" fontSize="12" className="tabular-nums">
              {Math.round(nice * (1 - t))}
            </text>
          </g>
        ))}
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p)}
            r={activeIndex === i ? 5 : 3}
            fill={activeIndex === i ? color : "var(--bg-surface)"}
            stroke={color}
            strokeWidth="2"
          />
        ))}
        {onPointClick &&
          labels.map((l, i) => (
            <rect
              key={`hit-${l}-${i}`}
              x={x(i) - (w - padL - padR) / Math.max(labels.length - 1, 1) / 2}
              y={padT}
              width={(w - padL - padR) / Math.max(labels.length - 1, 1)}
              height={h - padT - padB}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onPointClick(i)}
            />
          ))}
        {labels.map((l, i) => (
          <text
            key={l}
            x={x(i)}
            y={h - 8}
            textAnchor="middle"
            fill={activeIndex === i ? "var(--brand)" : "var(--text-tertiary)"}
            fontSize={activeIndex === i ? 13 : 12}
            fontWeight={activeIndex === i ? 600 : 400}
          >
            {l}
          </text>
        ))}
      </svg>
      {unit && <div className="mt-1 text-caption text-text-tertiary">单位：{unit}</div>}
    </div>
  );
}

/* ---------------- 雷达图 ---------------- */
export function Radar({
  data,
  size = 240,
  unit = "",
  color = "var(--brand)",
}: {
  data: Slice[];
  size?: number;
  unit?: string;
  color?: string;
}) {
  const c = size / 2;
  const r = size / 2 - 62;
  const n = Math.max(data.length, 3);
  const max = Math.max(...data.map((d) => d.value), 1);
  const pt = (i: number, ratio: number) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [c + r * ratio * Math.cos(a), c + r * ratio * Math.sin(a)] as const;
  };
  const poly = data.map((d, i) => pt(i, d.value / max).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <polygon
          key={t}
          points={data.map((_, i) => pt(i, t).join(",")).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeDasharray={t === 1 ? undefined : "3 4"}
        />
      ))}
      {data.map((d, i) => {
        const [x2, y2] = pt(i, 1);
        return <line key={d.name} x1={c} y1={c} x2={x2} y2={y2} stroke="var(--border)" />;
      })}
      <polygon points={poly} fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [px, py] = pt(i, d.value / max);
        return <circle key={d.name} cx={px} cy={py} r="3.5" fill={color} />;
      })}
      {data.map((d, i) => {
        const [lx, ly] = pt(i, 1.16);
        return (
          <text
            key={`l-${d.name}`}
            x={lx}
            y={ly}
            textAnchor={Math.abs(lx - c) < 6 ? "middle" : lx > c ? "start" : "end"}
            dominantBaseline="middle"
            fontSize="12"
            fill="var(--text-secondary)"
          >
            {d.name} {d.value}
            {unit}
          </text>
        );
      })}
    </svg>
  );
}

/* ---------------- 进度环（半环仪表） ---------------- */
export function Gauge({
  value,
  max = 100,
  label,
  valueText,
  size = 180,
  color = "var(--brand)",
}: {
  value: number;
  max?: number;
  label?: string;
  valueText?: string;
  size?: number;
  color?: string;
}) {
  const r = size / 2 - 12;
  const c = size / 2;
  const circ = Math.PI * r;
  const ratio = Math.min(Math.max(value / (max || 1), 0), 1);
  const h = size / 2 + 20;
  return (
    <div className="relative shrink-0" style={{ width: size, height: h }}>
      <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`}>
        <path
          d={`M ${c - r} ${c} A ${r} ${r} 0 0 1 ${c + r} ${c}`}
          fill="none"
          stroke="var(--bg-surface-subtle)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M ${c - r} ${c} A ${r} ${r} 0 0 1 ${c + r} ${c}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circ * ratio} ${circ}`}
        />
      </svg>
      <div className="absolute inset-x-0 top-[38%] flex flex-col items-center">
        <span className="text-page-title tabular-nums text-foreground">{valueText ?? `${Math.round(ratio * 100)}%`}</span>
        {label && <span className="mt-1 text-caption text-text-tertiary">{label}</span>}
      </div>
    </div>
  );
}

/* ---------------- 进度条列表（带占比） ---------------- */
export function ProgressRows({ data, unit = "" }: { data: Slice[]; unit?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const color = d.color ?? PALETTE[i % PALETTE.length];
        const pct = (d.value / total) * 100;
        return (
          <div key={d.name}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-body-sm text-foreground truncate">{d.name}</span>
              <span className="text-caption tabular-nums text-text-secondary shrink-0">
                {d.value.toLocaleString()}
                {unit} · {pct.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-surface-subtle overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- 散点图 ---------------- */
export type ScatterPoint = { x: number; y: number; name: string; color?: string; size?: number };

export function Scatter({
  points,
  xLabel,
  yLabel,
  height = 240,
}: {
  points: ScatterPoint[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
}) {
  const w = 560;
  const h = height;
  const padL = 46;
  const padR = 18;
  const padB = 32;
  const padT = 14;
  const maxX = Math.max(...points.map((p) => p.x), 1) * 1.1;
  const maxY = Math.max(...points.map((p) => p.y), 1) * 1.15;
  const px = (v: number) => padL + (v / maxX) * (w - padL - padR);
  const py = (v: number) => padT + (1 - v / maxY) * (h - padT - padB);
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              x2={w - padR}
              y1={padT + t * (h - padT - padB)}
              y2={padT + t * (h - padT - padB)}
              stroke="var(--border)"
              strokeDasharray="3 4"
            />
            <text x={4} y={padT + t * (h - padT - padB) + 4} fontSize="12" fill="var(--text-tertiary)" className="tabular-nums">
              {Math.round(maxY * (1 - t))}
            </text>
          </g>
        ))}
        <line x1={padL} x2={padL} y1={padT} y2={h - padB} stroke="var(--border)" />
        {points.map((p) => (
          <g key={p.name}>
            <circle
              cx={px(p.x)}
              cy={py(p.y)}
              r={p.size ?? 7}
              fill={p.color ?? "var(--brand)"}
              fillOpacity="0.75"
              stroke="var(--bg-surface)"
              strokeWidth="1.5"
            />
            <text x={px(p.x)} y={py(p.y) - (p.size ?? 7) - 5} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
              {p.name}
            </text>
          </g>
        ))}
        {xLabel && (
          <text x={w - padR} y={h - 8} textAnchor="end" fontSize="12" fill="var(--text-tertiary)">
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text x={padL} y={h - 8} textAnchor="start" fontSize="12" fill="var(--text-tertiary)">
            {yLabel}
          </text>
        )}
      </svg>
    </div>
  );
}

/* ---------------- 华夫格 ---------------- */
export function Waffle({ data, cells = 100, unit = "" }: { data: Slice[]; cells?: number; unit?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const seq: { color: string; name: string }[] = [];
  data.forEach((d, i) => {
    const n = Math.round((d.value / total) * cells);
    for (let k = 0; k < n; k++) seq.push({ color: d.color ?? PALETTE[i % PALETTE.length], name: d.name });
  });
  while (seq.length < cells) seq.push({ color: "var(--bg-surface-subtle)", name: "" });
  return (
    <div className="w-full">
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(20, minmax(0,1fr))" }}>
        {seq.slice(0, cells).map((s, i) => (
          <span
            key={i}
            title={s.name}
            className="aspect-square rounded-[3px]"
            style={{ background: s.color }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {data.map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: d.color ?? PALETTE[i % PALETTE.length] }} />
            <span className="text-caption text-foreground">{d.name}</span>
            <span className="text-caption tabular-nums text-text-tertiary">
              {d.value.toLocaleString()}
              {unit}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
