import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft,
  ClipboardList,
  PackagePlus,
  ScanLine,
  Search,
  Pill,
  Plus,
  Minus,
  X,
  Link2,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { MobileShell } from "@/components/mobile-shell";
import { PICKUPS, parseQty, useClaimed, type PickupItem } from "@/lib/pickup-store";

export const Route = createFileRoute("/m/prep")({
  head: () => ({ meta: [{ title: "备药 · 奇点智牧" }] }),
  component: PrepPage,
});

// 复用药品库（与诊断页一致的子集）
const drugCatalog = [
  { name: "氟尼辛葡甲胺注射液", spec: "100ml / 瓶", unit: "瓶" },
  { name: "头孢噻呋钠", spec: "1g / 支", unit: "支" },
  { name: "青霉素钠", spec: "80 万 IU / 支", unit: "支" },
  { name: "复合维生素 B", spec: "100ml / 瓶", unit: "瓶" },
  { name: "50% 葡萄糖", spec: "500ml / 瓶", unit: "瓶" },
  { name: "口服补液盐", spec: "100g / 包", unit: "包" },
  { name: "钙注射液", spec: "500ml / 瓶", unit: "瓶" },
  { name: "硫酸铜溶液", spec: "500ml / 瓶", unit: "瓶" },
  { name: "碘酊", spec: "100ml / 瓶", unit: "瓶" },
  { name: "维生素 C 注射液", spec: "10ml / 支", unit: "支" },
  { name: "地塞米松磷酸钠", spec: "5ml / 支", unit: "支" },
  { name: "口蹄疫疫苗 A 型", spec: "10ml / 支", unit: "支" },
];

type Mode = "byTask" | "direct";

function PrepPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("byTask");

  return (
    <MobileShell>
      {/* 顶部栏 */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="h-12 px-3 flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/m/homepage" })}
            className="h-9 w-9 -ml-1 inline-flex items-center justify-center text-text-secondary active:bg-surface-subtle rounded-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-body font-semibold text-foreground">备药</div>
        </div>
        {/* Tab */}
        <div className="px-3 pb-2 flex gap-2">
          <TabBtn active={mode === "byTask"} onClick={() => setMode("byTask")} icon={ClipboardList} label="按任务领药" />
          <TabBtn active={mode === "direct"} onClick={() => setMode("direct")} icon={PackagePlus} label="直接领药" />
        </div>
      </header>

      {mode === "byTask" ? <ByTaskFlow /> : <DirectFlow />}

      {/* 数据原则提示 */}
      <div className="px-4 mt-3 mb-24">
        <div className="rounded-lg bg-surface-subtle border border-border p-3 flex gap-2">
          <AlertCircle className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
          <div className="text-caption text-text-tertiary leading-relaxed">
            领药阶段仅记录药品被领出及可选的组合关系，不绑定到任务或牛只。实际用药数据在任务执行扫码核验时生成。
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ClipboardList;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-9 rounded-lg inline-flex items-center justify-center gap-1.5 text-body-sm font-medium transition-colors ${
        active
          ? "bg-brand-subtle text-primary border border-primary/30"
          : "bg-surface-subtle text-text-secondary border border-transparent"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ====================== 按任务领药 ======================
function ByTaskFlow() {
  const claimed = useClaimed();
  // 今日待执行任务（取未被领过的 PICKUPS 来源工单）
  const tasks = useMemo(
    () => PICKUPS.filter((p) => !claimed.includes(p.id)),
    [claimed],
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // 汇总建议清单
  const suggested = useMemo(() => {
    const map = new Map<string, { item: PickupItem; total: number; unit: string }>();
    PICKUPS.filter((p) => selected.has(p.id)).forEach((p) => {
      p.items.forEach((it) => {
        const { num, unit } = parseQty(it.qty);
        const key = it.name + "|" + (it.spec ?? "");
        const cur = map.get(key);
        if (cur) cur.total += num;
        else map.set(key, { item: it, total: num, unit });
      });
    });
    return Array.from(map.values());
  }, [selected]);

  const [combos, setCombos] = useState<string[][]>([]); // 组合关联：每组里包含药品 key
  return (
    <>
      <div className="px-4 pt-3">
        <div className="text-caption text-text-tertiary mb-2">
          选择今日待执行任务 · 仅作辅助参考
        </div>
        <div className="space-y-2">
          {tasks.length === 0 && (
            <div className="rounded-xl bg-card border border-border p-6 text-center text-caption text-text-tertiary">
              暂无可领药的任务
            </div>
          )}
          {tasks.map((p) => {
            const on = selected.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                  on ? "bg-brand-subtle border-primary" : "bg-card border-border"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded border shrink-0 inline-flex items-center justify-center ${
                    on ? "bg-primary border-primary" : "border-border bg-card"
                  }`}
                >
                  {on && <Check className="h-3 w-3 text-white" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-caption text-text-tertiary flex items-center gap-1.5">
                    <span className="font-mono">{p.source}</span>
                    <span>·</span>
                    <span>{p.barn}</span>
                  </div>
                  <div className="text-body-sm text-foreground truncate mt-0.5">{p.title}</div>
                </div>
                <span className="text-caption text-text-tertiary shrink-0">{p.items.length} 项</span>
              </button>
            );
          })}
        </div>
      </div>

      {suggested.length > 0 && (
        <div className="px-4 mt-4">
          <div className="text-body-sm font-medium text-foreground mb-2">
            建议领药清单 <span className="text-caption text-text-tertiary">共 {suggested.length} 种</span>
          </div>
          <div className="rounded-xl bg-card border border-border divide-y divide-border">
            {suggested.map((s) => (
              <div key={s.item.name} className="p-3 flex items-center gap-3">
                <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
                  <Pill className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm text-foreground truncate">{s.item.name}</div>
                  <div className="text-caption text-text-tertiary">{s.item.spec}</div>
                </div>
                <div className="text-body-sm font-semibold text-foreground tabular-nums">
                  {s.total} {s.unit}
                </div>
              </div>
            ))}
          </div>

          <ComboSection
            items={suggested.map((s) => ({ key: s.item.name, label: s.item.name }))}
            combos={combos}
            setCombos={setCombos}
          />
        </div>
      )}

      <SubmitBar
        disabled={selected.size === 0}
        text={`提交领药（${selected.size} 个任务）`}
        onSubmit={() => {
          toast.success("已生成领药记录", { description: "未与任务/牛只建立使用关系" });
          history.back();
        }}
      />
    </>
  );
}

// ====================== 直接领药 ======================
type DirectItem = { name: string; spec: string; unit: string; qty: number };

function DirectFlow() {
  const [picks, setPicks] = useState<DirectItem[]>([]);
  const [reason, setReason] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [combos, setCombos] = useState<string[][]>([]);

  const setQty = (name: string, delta: number) =>
    setPicks((arr) =>
      arr
        .map((it) => (it.name === name ? { ...it, qty: Math.max(0, it.qty + delta) } : it))
        .filter((it) => it.qty > 0),
    );

  const addDrug = (d: (typeof drugCatalog)[number]) => {
    setPicks((arr) =>
      arr.some((x) => x.name === d.name)
        ? arr.map((x) => (x.name === d.name ? { ...x, qty: x.qty + 1 } : x))
        : [...arr, { ...d, qty: 1 }],
    );
  };

  const handleScan = () => {
    const d = drugCatalog[Math.floor(Math.random() * drugCatalog.length)];
    addDrug(d);
    toast.success(`扫码识别：${d.name}`);
  };

  return (
    <>
      <div className="px-4 pt-3">
        <div className="flex gap-2">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex-1 h-10 rounded-lg bg-card border border-border inline-flex items-center justify-center gap-1.5 text-body-sm text-text-secondary active:bg-surface-subtle"
          >
            <Search className="h-4 w-4" />
            搜索 / 选择药品
          </button>
          <button
            onClick={handleScan}
            className="h-10 px-3 rounded-lg bg-card border border-border inline-flex items-center justify-center gap-1.5 text-body-sm text-text-secondary active:bg-surface-subtle"
          >
            <ScanLine className="h-4 w-4" />
            扫码
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {picks.length === 0 && (
            <div className="rounded-xl bg-card border border-border p-6 text-center text-caption text-text-tertiary">
              尚未选择药品
            </div>
          )}
          {picks.map((it) => (
            <div key={it.name} className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
                <Pill className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-body-sm text-foreground truncate">{it.name}</div>
                <div className="text-caption text-text-tertiary">{it.spec}</div>
              </div>
              <div className="inline-flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setQty(it.name, -1)}
                  className="h-7 w-7 rounded-md border border-border inline-flex items-center justify-center text-text-secondary active:bg-surface-subtle"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-body-sm font-semibold text-foreground tabular-nums w-10 text-center">
                  {it.qty} {it.unit}
                </span>
                <button
                  onClick={() => setQty(it.name, 1)}
                  className="h-7 w-7 rounded-md border border-border inline-flex items-center justify-center text-text-secondary active:bg-surface-subtle"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 领取原因 */}
        <div className="mt-4">
          <div className="text-body-sm font-medium text-foreground mb-1.5">
            领取原因 <span className="text-[var(--state-danger)]">*</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {["临时用药", "应急处理", "无工单先领", "配药备用"].map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`px-2.5 h-7 rounded-md text-caption ${
                  reason === r
                    ? "bg-brand-subtle text-primary border border-primary/30"
                    : "bg-surface-subtle text-text-secondary border border-transparent"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="请简要说明领取原因"
            rows={2}
            className="w-full rounded-lg border border-border bg-card p-2.5 text-body-sm resize-none focus:outline-none focus:border-primary"
          />
        </div>

        {picks.length >= 2 && (
          <ComboSection
            items={picks.map((p) => ({ key: p.name, label: p.name }))}
            combos={combos}
            setCombos={setCombos}
          />
        )}
      </div>

      <SubmitBar
        disabled={picks.length === 0 || !reason.trim()}
        text={`提交领药（${picks.length} 种药品）`}
        onSubmit={() => {
          toast.success("已生成领药记录", { description: "未与任务/牛只建立使用关系" });
          history.back();
        }}
      />

      {/* 药品选择弹层 */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 px-4 flex items-center justify-between border-b border-border">
              <div className="text-body font-medium text-foreground">选择药品</div>
              <button onClick={() => setPickerOpen(false)} className="h-8 w-8 inline-flex items-center justify-center text-text-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto divide-y divide-border">
              {drugCatalog.map((d) => (
                <button
                  key={d.name}
                  onClick={() => {
                    addDrug(d);
                    setPickerOpen(false);
                  }}
                  className="w-full p-3 flex items-center gap-3 text-left active:bg-surface-subtle"
                >
                  <span className="h-8 w-8 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
                    <Pill className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-sm text-foreground">{d.name}</div>
                    <div className="text-caption text-text-tertiary">{d.spec}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ====================== 组合关联 ======================
function ComboSection({
  items,
  combos,
  setCombos,
}: {
  items: { key: string; label: string }[];
  combos: string[][];
  setCombos: (c: string[][]) => void;
}) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  if (items.length < 2) return null;

  const toggleInCombo = (idx: number, key: string) => {
    const next = combos.map((c, i) => {
      if (i !== idx) return c.filter((k) => k !== key); // 同药品只能在一个组合里
      return c.includes(key) ? c.filter((k) => k !== key) : [...c, key];
    });
    setCombos(next);
  };

  const addCombo = () => {
    setCombos([...combos, []]);
    setEditingIdx(combos.length);
  };
  const removeCombo = (idx: number) => {
    setCombos(combos.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const labelOf = (k: string) => items.find((i) => i.key === k)?.label ?? k;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-body-sm font-medium text-foreground inline-flex items-center gap-1.5">
          <Link2 className="h-4 w-4 text-text-tertiary" />
          组合关联 <span className="text-caption text-text-tertiary font-normal">（选填）</span>
        </div>
        <button onClick={addCombo} className="text-caption text-primary inline-flex items-center gap-0.5 active:opacity-70">
          <Plus className="h-3.5 w-3.5" />
          新增组合
        </button>
      </div>
      <div className="text-caption text-text-tertiary mb-2 leading-relaxed">
        如多种药品配置到同一瓶静脉点滴中，可建立组合标记。仅表示配药关系，不绑定任务或牛只。
      </div>

      {combos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-3 text-center text-caption text-text-tertiary">
          暂未创建组合
        </div>
      ) : (
        <div className="space-y-2">
          {combos.map((c, idx) => (
            <div key={idx} className="rounded-xl bg-card border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-body-sm font-medium text-foreground">组合 {String.fromCharCode(65 + idx)}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                    className="text-caption text-primary active:opacity-70"
                  >
                    {editingIdx === idx ? "完成" : "编辑"}
                  </button>
                  <button onClick={() => removeCombo(idx)} className="text-caption text-text-tertiary active:opacity-70">
                    删除
                  </button>
                </div>
              </div>
              {editingIdx === idx ? (
                <div className="flex flex-wrap gap-1.5">
                  {items.map((it) => {
                    const on = c.includes(it.key);
                    return (
                      <button
                        key={it.key}
                        onClick={() => toggleInCombo(idx, it.key)}
                        className={`px-2 h-7 rounded-md text-caption inline-flex items-center gap-1 ${
                          on
                            ? "bg-brand-subtle text-primary border border-primary/30"
                            : "bg-surface-subtle text-text-secondary border border-transparent"
                        }`}
                      >
                        {on && <Check className="h-3 w-3" />}
                        {it.label}
                      </button>
                    );
                  })}
                </div>
              ) : c.length === 0 ? (
                <div className="text-caption text-text-tertiary">尚未选择药品</div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {c.map((k) => (
                    <span key={k} className="px-1.5 h-6 inline-flex items-center rounded bg-surface-subtle text-caption text-text-secondary">
                      {labelOf(k)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====================== 提交栏 ======================
function SubmitBar({
  disabled,
  text,
  onSubmit,
}: {
  disabled: boolean;
  text: string;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 max-w-[440px] mx-auto bg-card border-t border-border px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      <button
        disabled={disabled}
        onClick={onSubmit}
        className="w-full h-11 rounded-lg bg-primary text-white text-body-sm font-semibold disabled:opacity-40 active:opacity-90"
      >
        {text}
      </button>
    </div>
  );
}
