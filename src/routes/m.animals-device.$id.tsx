import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Radio, AlertTriangle, Activity, ChevronRight } from "lucide-react";

type DeviceKind = "collar" | "ear";

export const Route = createFileRoute("/m/animals-device/$id")({
  head: () => ({ meta: [{ title: "外接设备 · 奇点智牧" }] }),
  validateSearch: (search: Record<string, unknown>): { kind?: DeviceKind; deviceId?: string } => ({
    kind: search.kind === "collar" || search.kind === "ear" ? (search.kind as DeviceKind) : undefined,
    deviceId: typeof search.deviceId === "string" ? search.deviceId : undefined,
  }),
  component: AnimalDevicePage,
});

type Device = {
  kind: DeviceKind;
  id: string;
  name: string;
  status: "正常" | "异常" | "离线";
  metrics: { label: string; value: string; unit: string; abnormal?: boolean }[];
  alerts: { time: string; text: string; level: "warn" | "danger" }[];
};

const DEVICES: Device[] = [
  {
    kind: "collar",
    id: "D-COL-012",
    name: "颈环项圈 · Nedap",
    status: "正常",
    metrics: [
      { label: "活动量", value: "128", unit: "" },
      { label: "反刍时长", value: "512", unit: "分钟" },
      { label: "采食时长", value: "241", unit: "分钟" },
      { label: "静卧时长", value: "687", unit: "分钟" },
    ],
    alerts: [],
  },
  {
    kind: "ear",
    id: "D-EAR-088",
    name: "耳温设备 · smaXtec",
    status: "异常",
    metrics: [],
    alerts: [
      { time: "2026-05-29 08:12", text: "耳部温度持续 2 小时高于 39.6℃", level: "danger" },
      { time: "2026-05-28 21:40", text: "耳部温度较个体基线偏高 0.6℃", level: "warn" },
    ],
  },
];

// 近 24 小时耳温采样（每 2 小时一次，单位 ℃）
const EAR_TEMP_SERIES: { time: string; value: number }[] = [
  { time: "10:00", value: 38.6 },
  { time: "12:00", value: 38.7 },
  { time: "14:00", value: 38.9 },
  { time: "16:00", value: 39.0 },
  { time: "18:00", value: 38.8 },
  { time: "20:00", value: 38.7 },
  { time: "22:00", value: 38.9 },
  { time: "00:00", value: 39.2 },
  { time: "02:00", value: 39.4 },
  { time: "04:00", value: 39.5 },
  { time: "06:00", value: 39.7 },
  { time: "08:00", value: 39.8 },
];

function EarTempChart() {
  const w = 320;
  const h = 140;
  const padL = 28;
  const padR = 8;
  const padT = 10;
  const padB = 20;
  const min = 38;
  const max = 40.5;
  const data = EAR_TEMP_SERIES;
  const xStep = (w - padL - padR) / (data.length - 1);
  const y = (v: number) => padT + ((max - v) / (max - min)) * (h - padT - padB);
  const points = data.map((d, i) => ({ x: padL + i * xStep, y: y(d.value), ...d }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${points[points.length - 1].x},${h - padB} L${points[0].x},${h - padB} Z`;
  const warnY = y(39.6);
  const gridVals = [38, 39, 40];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[140px]">
      <defs>
        <linearGradient id="earTempFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00A14F" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00A14F" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridVals.map((v) => (
        <g key={v}>
          <line x1={padL} x2={w - padR} y1={y(v)} y2={y(v)} stroke="hsl(var(--border))" strokeDasharray="2 3" />
          <text x={4} y={y(v) + 3} fontSize="10" fill="hsl(var(--text-tertiary))">{v.toFixed(0)}</text>
        </g>
      ))}
      <line x1={padL} x2={w - padR} y1={warnY} y2={warnY} stroke="#CF1322" strokeDasharray="3 3" strokeWidth="1" />
      <text x={w - padR} y={warnY - 3} fontSize="9" fill="#CF1322" textAnchor="end">预警 39.6℃</text>
      <path d={area} fill="url(#earTempFill)" />
      <path d={path} fill="none" stroke="#00A14F" strokeWidth="1.8" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="2.5"
          fill={p.value >= 39.6 ? "#CF1322" : "#00A14F"}
        />
      ))}
      {points.map((p, i) => (
        i % 3 === 0 ? (
          <text key={`t-${i}`} x={p.x} y={h - 6} fontSize="9" fill="hsl(var(--text-tertiary))" textAnchor="middle">
            {p.time}
          </text>
        ) : null
      ))}
    </svg>
  );
}

function DeviceRow({ d, to }: { d: Device; to: () => void }) {
  return (
    <button
      type="button"
      onClick={to}
      className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-card border border-border active:bg-surface-subtle"
    >
      <span
        className={`h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0 ${
          d.status === "异常" ? "bg-[#FFF1F0] text-[#CF1322]" : "bg-brand-subtle text-primary"
        }`}
      >
        <Radio className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <div className="text-body-sm text-foreground truncate">{d.name}</div>
        <div className="text-caption text-text-tertiary font-mono">{d.id}</div>
      </div>
      <span
        className={
          d.status === "异常" ? "tag tag-danger" : d.status === "离线" ? "tag tag-warning" : "tag tag-success"
        }
      >
        {d.status}
      </span>
      <ChevronRight className="h-4 w-4 text-text-tertiary" />
    </button>
  );
}

function DeviceDetail({ d }: { d: Device }) {
  return (
    <div className="space-y-3">
      {d.alerts.length > 0 && (
        <div className="space-y-1.5">
          {d.alerts.map((a, i) => (
            <div
              key={i}
              className={`rounded-lg px-2.5 py-2 flex items-start gap-1.5 ${
                a.level === "danger" ? "bg-[#FFF1F0] text-[#CF1322]" : "bg-[#FFF7E6] text-[#B8860B]"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-body-sm">{a.text}</div>
                <div className="text-caption opacity-80 mt-0.5">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {d.kind === "ear" ? (
        <div className="rounded-xl bg-surface-subtle p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-caption text-text-tertiary inline-flex items-center gap-1.5">
              <Activity className="h-3 w-3" /> 近 24 小时耳温变化
            </div>
            <div className="text-caption text-text-tertiary">单位 ℃</div>
          </div>
          <EarTempChart />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {d.metrics.map((m) => (
              <div
                key={m.label}
                className={`rounded-xl px-3 py-2.5 ${m.abnormal ? "bg-[#FFF1F0]" : "bg-surface-subtle"}`}
              >
                <div className="text-caption text-text-tertiary">{m.label}</div>
                <div className="mt-0.5">
                  <span
                    className={`text-[20px] font-semibold tabular-nums ${
                      m.abnormal ? "text-[#CF1322]" : "text-foreground"
                    }`}
                  >
                    {m.value}
                  </span>
                  {m.unit && (
                    <span className="text-caption text-text-tertiary ml-0.5">{m.unit}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-surface-subtle p-3">
            <div className="text-caption text-text-tertiary inline-flex items-center gap-1.5 mb-1">
              <Activity className="h-3 w-3" /> 近 24 小时
            </div>
            <div className="text-caption text-text-secondary">
              详细趋势图待接入设备数据源。
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AnimalDevicePage() {
  const { id } = useParams({ from: "/m/animals-device/$id" });
  const { kind, deviceId } = Route.useSearch();
  const navigate = useNavigate();

  // 优先按 deviceId 精确匹配；否则按 kind 过滤；都无则展示全部列表
  const activeByDeviceId = deviceId ? DEVICES.find((d) => d.id === deviceId) : undefined;
  const kindList = kind ? DEVICES.filter((d) => d.kind === kind) : DEVICES;
  const active = activeByDeviceId ?? (kind && kindList.length === 1 ? kindList[0] : undefined);

  if (active) {
    return (
      <MobileShell title="外接设备" back hideTabBar>
        <div className="px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-card border border-border">
            <span
              className={`h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0 ${
                active.status === "异常" ? "bg-[#FFF1F0] text-[#CF1322]" : "bg-brand-subtle text-primary"
              }`}
            >
              <Radio className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-body-sm text-foreground truncate">{active.name}</div>
              <div className="text-caption text-text-tertiary font-mono">{active.id}</div>
            </div>
            <span
              className={
                active.status === "异常"
                  ? "tag tag-danger"
                  : active.status === "离线"
                  ? "tag tag-warning"
                  : "tag tag-success"
              }
            >
              {active.status}
            </span>
          </div>
          <DeviceDetail d={active} />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="外接设备" back hideTabBar>
      <div className="px-4 pt-3 pb-6 space-y-2">
        {kindList.map((d) => (
          <DeviceRow
            key={d.id}
            d={d}
            to={() =>
              navigate({
                to: "/m/animals-device/$id",
                params: { id },
                search: { deviceId: d.id },
              })
            }
          />
        ))}
        {kindList.length === 0 && (
          <div className="text-caption text-text-tertiary text-center py-10">暂无外接设备</div>
        )}
      </div>
      {/* Link import kept for type-safety even if unused */}
      <Link to="/m/animals-device/$id" params={{ id }} className="hidden" />
    </MobileShell>
  );
}
