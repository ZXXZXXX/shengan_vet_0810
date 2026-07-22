import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { Radio, AlertTriangle, Activity, ChevronDown } from "lucide-react";

type DeviceKind = "collar" | "ear";

export const Route = createFileRoute("/m/animals-device/$id")({
  head: () => ({ meta: [{ title: "外接设备数据 · 奇点智牧" }] }),
  validateSearch: (search: Record<string, unknown>): { kind?: DeviceKind } => ({
    kind: search.kind === "collar" || search.kind === "ear" ? (search.kind as DeviceKind) : undefined,
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
    id: "D-BOL-088",
    name: "耳温设备 · smaXtec",
    status: "异常",
    metrics: [
      { label: "耳部温度", value: "39.8", unit: "℃", abnormal: true },
      { label: "饮水次数", value: "4", unit: "次" },
      { label: "活动指数", value: "62", unit: "" },
      { label: "反刍活跃度", value: "78", unit: "" },
    ],
    alerts: [
      { time: "2026-05-29 08:12", text: "耳部温度持续 2 小时高于 39.6℃", level: "danger" },
      { time: "2026-05-28 21:40", text: "饮水量低于个体均值 30%", level: "warn" },
    ],
  },
];

function AnimalDevicePage() {
  const { id } = useParams({ from: "/m/animals-device/$id" });
  const { kind } = Route.useSearch();

  const list = useMemo(() => (kind ? DEVICES.filter((d) => d.kind === kind) : DEVICES), [kind]);
  const initialOpen = kind ? list[0]?.id ?? null : list[0]?.id ?? null;
  const [expanded, setExpanded] = useState<string | null>(initialOpen);

  const title = kind
    ? `#${id} · ${list[0]?.name.split(" · ")[0] ?? "外接设备"}`
    : `#${id} · 全部外接设备`;

  return (
    <MobileShell title={title} back hideTabBar>
      <div className="px-4 pt-3 pb-6 space-y-3">
        {list.map((d) => {
          const open = kind ? true : expanded === d.id;
          return (
            <div key={d.id} className="rounded-2xl bg-card border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => !kind && setExpanded(open ? null : d.id)}
                className="w-full flex items-center gap-2.5 p-3 active:bg-surface-subtle"
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
                {!kind && (
                  <ChevronDown className={`h-4 w-4 text-text-tertiary transition ${open ? "rotate-180" : ""}`} />
                )}
              </button>

              {open && (
                <div className="px-3 pb-3 space-y-3">
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

                  <div className="grid grid-cols-2 gap-2">
                    {d.metrics.map((m) => (
                      <div
                        key={m.label}
                        className={`rounded-xl px-3 py-2.5 ${
                          m.abnormal ? "bg-[#FFF1F0]" : "bg-surface-subtle"
                        }`}
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </MobileShell>
  );
}
