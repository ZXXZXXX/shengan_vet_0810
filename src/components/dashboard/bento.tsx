import type { ReactNode } from "react";
import { ArrowUpRight, TrendingDown, TrendingUp, Minus } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Tile                                                                */
/* ------------------------------------------------------------------ */

export function Tile({
  span = "col-span-12 md:col-span-6 xl:col-span-4",
  tone = "var(--brand)",
  title,
  caption,
  icon,
  onClick,
  children,
  action = "查看详情",
}: {
  span?: string;
  tone?: string;
  title: string;
  caption?: string;
  icon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
  action?: string;
}) {
  return (
    <section
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all ${span} ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-elevated" : ""
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${tone}, transparent)` }}
      />
      <header className="flex items-start gap-2">
        {icon && (
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone }}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-card-title text-foreground">{title}</h3>
          {caption && <p className="mt-0.5 truncate text-caption text-text-tertiary">{caption}</p>}
        </div>
        {onClick && (
          <span className="inline-flex shrink-0 items-center gap-0.5 text-caption text-text-tertiary transition-colors group-hover:text-primary">
            {action}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        )}
      </header>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Headline metric                                                     */
/* ------------------------------------------------------------------ */

export function Headline({
  value,
  unit,
  delta,
  good,
  note,
  size = 34,
}: {
  value: string;
  unit?: string;
  delta?: string;
  good?: boolean;
  note?: string;
  size?: number;
}) {
  const tone = good ? "var(--state-success)" : "var(--state-danger)";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span
        className="font-semibold leading-none tabular-nums text-foreground"
        style={{ fontSize: size }}
      >
        {value}
      </span>
      {unit && <span className="text-body-sm text-text-tertiary">{unit}</span>}
      {delta && (
        <span
          className="inline-flex h-[22px] items-center gap-0.5 rounded-md px-1.5 text-caption font-medium tabular-nums"
          style={{ background: `color-mix(in oklab, ${tone} 14%, transparent)`, color: tone }}
        >
          {delta.startsWith("-") ? (
            <TrendingDown className="h-3 w-3" />
          ) : delta.startsWith("+") ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <Minus className="h-3 w-3" />
          )}
          {delta}
        </span>
      )}
      {note && <span className="text-caption text-text-tertiary">{note}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Micro visualisations                                                */
/* ------------------------------------------------------------------ */

export function Sparkline({
  points,
  color = "var(--brand)",
  height = 46,
}: {
  points: number[];
  color?: string;
  height?: number;
}) {
  const w = 240;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const x = (i: number) => (i * w) / Math.max(points.length - 1, 1);
  const y = (v: number) => 4 + (1 - (v - min) / span) * (height - 8);
  const line = points.map((p, i) => `${x(i)},${y(p)}`).join(" ");
  const id = `sp-${color.replace(/\W/g, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${id})`} points={`0,${height} ${line} ${w},${height}`} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={line} />
    </svg>
  );
}

export function SplitBar({
  segments,
  height = 10,
}: {
  segments: { name: string; value: number; color: string }[];
  height?: number;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div>
      <div className="flex w-full overflow-hidden rounded-full bg-surface-subtle" style={{ height }}>
        {segments.map((s) => (
          <span
            key={s.name}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
            className="h-full"
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-caption text-text-secondary">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.name}
            <b className="font-medium tabular-nums text-foreground">{s.value.toLocaleString()}</b>
            <span className="text-text-tertiary tabular-nums">
              {((s.value / total) * 100).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Ring({
  value,
  size = 92,
  color = "var(--brand)",
  label,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-surface-subtle)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * circ} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-card-title font-medium tabular-nums text-foreground">{value}%</span>
        {label && <span className="text-caption text-text-tertiary">{label}</span>}
      </div>
    </div>
  );
}

export function RankRows({
  data,
  unit = "",
  color = "var(--brand)",
}: {
  data: { name: string; value: number; color?: string }[];
  unit?: string;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.name} className="grid grid-cols-[86px_minmax(0,1fr)_auto] items-center gap-2.5">
          <span className="truncate text-caption text-text-secondary">{d.name}</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
            <span
              className="block h-full rounded-full"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? color }}
            />
          </span>
          <span className="text-caption tabular-nums text-foreground">
            {d.value.toLocaleString()}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StatRow({
  items,
}: {
  items: { label: string; value: string; unit?: string; tone?: string }[];
}) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
      {items.map((i) => (
        <div key={i.label} className="min-w-0">
          <div className="truncate text-caption text-text-tertiary">{i.label}</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span
              className="text-card-title font-medium tabular-nums"
              style={{ color: i.tone ?? "var(--text-primary)" }}
            >
              {i.value}
            </span>
            {i.unit && <span className="text-caption text-text-tertiary">{i.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
