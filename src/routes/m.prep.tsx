import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ClipboardList,
  ScanLine,
  Package,
  Pill,
  Check,
  X,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { MobileShell } from "@/components/mobile-shell";
import {
  PICKUPS,
  useClaimed,
  genScanCode,
  genBatch,
  pickManufacturer,
} from "@/lib/pickup-store";
import {
  getRoleTasks,
  diseaseTaskMeta,
  typeMeta,
  type HomeTask,
} from "./m.homepage";
import { useRole } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/prep")({
  head: () => ({ meta: [{ title: "备药 · 奇点智牧" }] }),
  component: PrepPage,
});

// 演示药品池
const drugPool = [
  { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶" },
  { name: "头孢噻呋钠", spec: "1g / 支" },
  { name: "青霉素钠", spec: "80 万 IU / 支" },
  { name: "钙注射液", spec: "500ml / 瓶" },
  { name: "硫酸铜溶液", spec: "500ml / 瓶" },
  { name: "碘酊", spec: "100ml / 瓶" },
  { name: "维生素 C 注射液", spec: "10ml / 支" },
  { name: "口蹄疫疫苗 A 型", spec: "10ml / 支" },
  { name: "复合维生素 B", spec: "100ml / 瓶" },
  { name: "50% 葡萄糖", spec: "500ml / 瓶" },
];

type Scan = {
  name: string;
  spec: string;
  manufacturer: string;
  batch: string;
  code: string;
  scanUnit: string;
  claimed: number;
  stock: number;
};

function PrepPage() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [aggOpen, setAggOpen] = useState(false);

  const handleScan = () => {
    const d = drugPool[Math.floor(Math.random() * drugPool.length)];
    const manufacturer = pickManufacturer(d.name, scans.length);
    const batch = genBatch();
    const code = genScanCode(d.spec.includes("瓶") ? "UNIT" : "PACK");
    const scanUnit = d.spec.includes("瓶") ? "瓶" : "支";
    const stock = 8 + Math.floor(Math.random() * 20);
    setScans((s) => {
      const sameCount = s.filter((x) => x.name === d.name).length + 1;
      return [
        { ...d, manufacturer, batch, code, scanUnit, claimed: sameCount, stock },
        ...s,
      ];
    });
    toast.success(`已识别 · ${d.name}`);
  };


  return (
    <MobileShell hideTabBar>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="h-12 px-2 flex items-center gap-1">
          <button
            onClick={() => navigate({ to: "/m/homepage" })}
            className="h-9 w-9 inline-flex items-center justify-center text-text-secondary active:bg-surface-subtle rounded-lg"
            aria-label="返回"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-body font-semibold text-foreground">备药</div>
          <button
            onClick={() => setAggOpen(true)}
            className="h-8 px-2.5 rounded-md text-caption text-primary inline-flex items-center gap-1 active:bg-brand-subtle"
          >
            <ClipboardList className="h-4 w-4" />
            统计药品清单
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 pb-24">
        {/* 扫码按钮 */}
        <button
          onClick={handleScan}
          className="w-full rounded-2xl bg-gradient-to-br from-primary to-[#008C44] text-white p-5 flex items-center gap-3 active:scale-[.98] transition-transform shadow-[0_8px_22px_-8px_rgba(0,161,79,.55)]"
        >
          <span className="h-12 w-12 rounded-xl bg-white/15 inline-flex items-center justify-center shrink-0">
            <ScanLine className="h-6 w-6" />
          </span>
          <div className="text-left flex-1 min-w-0">
            <div className="text-body font-semibold">扫码领药</div>
            <div className="text-caption text-white/85 mt-0.5">
              扫描药品二维码登记本次领取
            </div>
          </div>
        </button>

        {/* 已扫描列表 */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-body-sm font-medium text-foreground inline-flex items-baseline gap-1.5">
              本次已扫描
              <span className="text-caption text-text-tertiary font-normal">
                共 {scans.length} 项
              </span>
            </div>
            {scans.length > 0 && (
              <button
                onClick={() => setScans([])}
                className="text-caption text-text-tertiary active:opacity-70"
              >
                清空
              </button>
            )}
          </div>

          {scans.length === 0 ? (
            <div className="rounded-xl bg-card border border-dashed border-border p-8 flex flex-col items-center text-center">
              <Inbox className="h-8 w-8 text-text-tertiary/60 mb-2" />
              <div className="text-caption text-text-tertiary">
                点击上方按钮扫描药品二维码
              </div>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {scans.map((s, i) => (
              <div
                key={`${s.code}-${i}`}
                className="rounded-xl bg-card border border-primary p-3"
              >
                  {/* 顶部：图标 + 名称 + 右上角已领/库存 */}
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <div className="flex-1 min-w-0 text-body-sm font-semibold text-foreground truncate">
                      {s.name}
                    </div>
                    <div className="text-caption text-text-tertiary shrink-0 text-right leading-tight">
                      已领{" "}
                      <span className="text-text-secondary">
                        {s.claimed}
                      </span>{" "}
                      {s.scanUnit}
                      <span className="mx-1 text-border">·</span>
                      库存{" "}
                      <span className="text-text-secondary">{s.stock}</span>{" "}
                      {s.scanUnit}
                    </div>
                    <button
                      onClick={() =>
                        setScans((arr) => arr.filter((_, j) => j !== i))
                      }
                      className="h-6 w-6 -mr-1 inline-flex items-center justify-center text-text-tertiary active:text-foreground shrink-0"
                      aria-label="移除"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 规格 + 扫码单位 */}
                  <div className="mt-1.5 text-caption text-text-tertiary">
                    规格{" "}
                    <span className="text-text-secondary">{s.spec}</span>
                    <span className="mx-2 text-border">·</span>
                    扫码单位{" "}
                    <span className="text-text-secondary">{s.scanUnit}</span>
                  </div>

                  {/* 厂商 chip */}
                  <div className="mt-1.5">
                    <span className="inline-flex items-center text-caption px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary">
                      厂商 {s.manufacturer}
                    </span>
                  </div>

                  {/* 追溯码 / 批号 */}
                  <div className="mt-1.5 text-caption text-text-tertiary font-mono">
                    {s.code}
                    <span className="mx-2 text-border">·</span>
                    {s.batch}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {scans.length > 0 && (
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-40">
            <button
              onClick={() => {
                toast.success(`已生成领药记录（${scans.length} 项）`);
                setScans([]);
              }}
              className="w-full h-11 rounded-lg bg-primary text-white text-body-sm font-semibold active:opacity-90"
            >
              完成领药（{scans.length} 项）
            </button>
          </div>
        )}
      </div>
      {aggOpen && (
        <AggregateDrawer
          onClose={() => setAggOpen(false)}
          onConfirm={(ids) => {
            setAggOpen(false);
            navigate({
              to: "/m/health/today_/pickup",
              search: { ids: ids.join(",") },
            });
          }}
        />
      )}
    </MobileShell>
  );
}

function AggregateDrawer({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const role = useRole();
  const claimed = useClaimed();
  const tasks: HomeTask[] = useMemo(() => {
    const roleTasks = getRoleTasks(role);
    return roleTasks.filter((t) =>
      PICKUPS.some((p) => p.source === t.id && !claimed.includes(p.id)),
    );
  }, [role, claimed]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allOn = tasks.length > 0 && selected.size === tasks.length;
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected(allOn ? new Set() : new Set(tasks.map((t) => t.id)));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl h-[75vh] max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-12 px-4 flex items-center justify-between border-b border-border shrink-0">
          <div className="text-body font-medium text-foreground">
            选择任务统计药品
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center text-text-secondary"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-2 border-b border-border flex items-center justify-between shrink-0">
          <button
            onClick={toggleAll}
            disabled={tasks.length === 0}
            className="text-caption text-primary inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            <span
              className={`h-4 w-4 rounded border inline-flex items-center justify-center ${
                allOn ? "bg-primary border-primary" : "border-border bg-card"
              }`}
            >
              {allOn && <Check className="h-3 w-3 text-white" />}
            </span>
            全选
          </button>
          <span className="text-caption text-text-tertiary">
            已选 {selected.size} / {tasks.length}
          </span>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border">
          {tasks.length === 0 && (
            <div className="p-10 text-center text-caption text-text-tertiary">
              暂无待领药的今日任务
            </div>
          )}
          {tasks.map((t) => {
            const on = selected.has(t.id);
            const meta = typeMeta[t.type];
            const Icon = meta?.icon ?? Pill;
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={`w-full p-3 flex items-center gap-3 text-left active:bg-surface-subtle ${
                  on ? "bg-brand-subtle/50" : ""
                }`}
              >
                <span
                  className={`h-4 w-4 rounded border shrink-0 inline-flex items-center justify-center ${
                    on ? "bg-primary border-primary" : "border-border bg-card"
                  }`}
                >
                  {on && <Check className="h-3 w-3 text-white" />}
                </span>
                <span
                  className={`h-8 w-8 rounded-lg ${meta?.bg ?? "bg-brand-subtle"} ${meta?.text ?? "text-primary"} inline-flex items-center justify-center shrink-0`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-caption text-text-tertiary">
                    <span className="font-mono">{t.id}</span>
                    <span className="mx-1.5 text-border">·</span>
                    {diseaseTaskMeta[t.id]?.disease ?? t.type}
                  </div>
                  <div className="text-body-sm text-foreground truncate mt-0.5">
                    {t.target} · {t.conclusion}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] border-t border-border shrink-0">
          <button
            disabled={selected.size === 0}
            onClick={() => onConfirm(Array.from(selected))}
            className="w-full h-11 rounded-lg bg-primary text-white text-body-sm font-semibold disabled:opacity-40 active:opacity-90"
          >
            生成领药清单（{selected.size}）
          </button>
        </div>
      </div>
    </div>
  );
}
