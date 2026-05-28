import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  ScanLine,
  X,
  Plus,
  Camera,
  PackageX,
  ImagePlus,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/m/loss-report")({
  head: () => ({ meta: [{ title: "损耗上报 · 奇点智牧" }] }),
  component: LossReportPage,
});

// 物品/药品候选
const ITEMS = [
  { id: "DR-0108", name: "乳房炎抗生素 5mg", unit: "支" },
  { id: "DR-0214", name: "口蹄疫疫苗 A 型", unit: "支" },
  { id: "DR-0306", name: "驱虫剂 伊维菌素", unit: "瓶" },
  { id: "DR-0412", name: "营养补充剂 复合维生素", unit: "罐" },
  { id: "DR-0521", name: "消毒液 戊二醛", unit: "L" },
  { id: "DR-0633", name: "葡萄糖注射液", unit: "瓶" },
  { id: "DR-0712", name: "碳酸氢钠", unit: "袋" },
];

const REASON_TAGS = [
  "冷链断电",
  "过期失效",
  "运输破损",
  "盘点误差",
  "误开未用",
  "操作失误",
  "包装破损",
  "其他",
];

type Stage = "before" | "after";

type Line = { itemId: string; qty: string };

function LossReportPage() {
  const navigate = useNavigate();

  const [stage, setStage] = useState<Stage>("before");
  const [lines, setLines] = useState<Line[]>([{ itemId: "", qty: "" }]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState<number[]>([1]);
  const [showItemPicker, setShowItemPicker] = useState<number | null>(null);
  const [itemQuery, setItemQuery] = useState("");

  const matchedItems = useMemo(() => {
    const kw = itemQuery.trim().toLowerCase();
    const pool = kw
      ? ITEMS.filter((i) => `${i.id} ${i.name}`.toLowerCase().includes(kw))
      : ITEMS;
    return pool.slice(0, 8);
  }, [itemQuery]);

  const setLine = (idx: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const addLine = () => setLines((prev) => [...prev, { itemId: "", qty: "" }]);
  const removeLine = (idx: number) =>
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const toggleReason = (r: string) =>
    setReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const canSubmit =
    lines.every((l) => l.itemId && l.qty.trim()) &&
    reasons.length > 0 &&
    desc.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    toast.success("损耗上报已提交");
    setTimeout(() => navigate({ to: "/m" }), 600);
  };

  return (
    <MobileShell title="损耗上报" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-5">
        {/* 损耗阶段 */}
        <Section title="损耗阶段" required>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { v: "before", label: "出库前", hint: "库内损耗" },
                { v: "after", label: "出库后", hint: "使用环节损耗" },
              ] as { v: Stage; label: string; hint: string }[]
            ).map((o) => {
              const active = stage === o.v;
              return (
                <button
                  key={o.v}
                  onClick={() => setStage(o.v)}
                  className={`h-16 rounded-xl border text-left px-3 transition-colors ${
                    active
                      ? "border-primary bg-brand-subtle text-foreground"
                      : "border-border bg-card text-text-secondary"
                  }`}
                >
                  <div className="text-body font-medium">{o.label}</div>
                  <div className="text-caption text-text-tertiary mt-0.5">{o.hint}</div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* 损耗物品 */}
        <Section title="损耗物品" required hint="可一次性登记多项">
          <div className="space-y-2">
            {lines.map((l, idx) => {
              const item = ITEMS.find((i) => i.id === l.itemId);
              const canDelete = lines.length > 1;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-card border border-border p-2.5 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowItemPicker(idx);
                        setItemQuery("");
                      }}
                      className="flex-1 h-11 px-3 rounded-lg bg-surface-subtle border border-border text-left text-body inline-flex items-center"
                    >
                      {item ? (
                        <span className="truncate text-foreground">
                          {item.name}
                          <span className="ml-2 text-caption text-text-tertiary font-mono">
                            {item.id}
                          </span>
                        </span>
                      ) : (
                        <span className="text-text-tertiary">选择物品 / 药品</span>
                      )}
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => removeLine(idx)}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-full text-text-tertiary active:bg-surface-subtle"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={l.qty}
                      onChange={(e) => setLine(idx, { qty: e.target.value })}
                      inputMode="decimal"
                      placeholder="损耗数量"
                      className="flex-1 h-11 px-3 rounded-lg bg-surface-subtle border border-border text-body"
                    />
                    <span className="text-body-sm text-text-secondary w-10 text-center">
                      {item?.unit ?? "-"}
                    </span>
                  </div>
                </div>
              );
            })}
            <button
              onClick={addLine}
              className="w-full h-11 rounded-xl border border-dashed border-border bg-card text-body-sm text-text-secondary inline-flex items-center justify-center gap-1 active:bg-surface-subtle"
            >
              <Plus className="h-4 w-4" />
              追加损耗物品
            </button>
          </div>
        </Section>

        {/* 损耗原因 */}
        <Section title="损耗原因" required>
          <div className="flex flex-wrap gap-1.5">
            {REASON_TAGS.map((r) => {
              const active = reasons.includes(r);
              return (
                <button
                  key={r}
                  onClick={() => toggleReason(r)}
                  className={`h-8 px-3 rounded-full text-caption border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-text-secondary border-border"
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </Section>

        {/* 情况说明 */}
        <Section title="情况说明" required>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="请简要描述损耗经过、估损金额等"
            rows={3}
            className="w-full rounded-xl bg-card border border-border p-3 text-body resize-none"
          />
        </Section>

        {/* 现场照片 */}
        <Section title="现场照片" hint="选填">
          <div className="grid grid-cols-4 gap-2">
            {photos.map((p) => (
              <div
                key={p}
                className="aspect-square rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-text-tertiary"
              >
                <Camera className="h-5 w-5" />
              </div>
            ))}
            <button
              onClick={() => setPhotos((prev) => [...prev, prev.length + 1])}
              className="aspect-square rounded-lg border border-dashed border-border text-text-tertiary inline-flex items-center justify-center active:bg-surface-subtle"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
          </div>
        </Section>
      </div>

      {/* 底部提交栏 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] z-40">
        <button
          onClick={submit}
          disabled={!canSubmit}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-body font-medium inline-flex items-center justify-center gap-2 disabled:bg-surface-subtle disabled:text-text-tertiary"
        >
          <PackageX className="h-4 w-4" />
          提交损耗上报
        </button>
      </div>

      {/* 物品选择弹层 */}
      {showItemPicker !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
          onClick={() => setShowItemPicker(null)}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 text-body font-medium">选择物品 / 药品</div>
              <button
                onClick={() => setShowItemPicker(null)}
                className="h-8 w-8 inline-flex items-center justify-center text-text-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  autoFocus
                  value={itemQuery}
                  onChange={(e) => setItemQuery(e.target.value)}
                  placeholder="搜索物品编号或名称"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm"
                />
              </div>
              <button className="h-10 px-3 rounded-lg bg-brand-subtle text-primary inline-flex items-center gap-1 text-body-sm">
                <ScanLine className="h-4 w-4" /> 扫码
              </button>
            </div>
            <div className="flex-1 overflow-y-auto -mx-2">
              {matchedItems.length === 0 ? (
                <div className="text-center py-12 text-caption text-text-tertiary">
                  无匹配结果
                </div>
              ) : (
                matchedItems.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => {
                      setLine(showItemPicker, { itemId: i.id });
                      setShowItemPicker(null);
                    }}
                    className="w-full px-3 py-3 flex items-center gap-3 text-left active:bg-surface-subtle rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-body text-foreground truncate">{i.name}</div>
                      <div className="text-caption text-text-tertiary font-mono mt-0.5">
                        {i.id} · 单位 {i.unit}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Section({
  title,
  required,
  hint,
  children,
}: {
  title: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-card-title text-foreground">
          {title}
          {required && <span className="text-[var(--state-danger)] ml-0.5">*</span>}
        </h3>
        {hint && <span className="text-caption text-text-tertiary">{hint}</span>}
      </div>
      {children}
    </section>
  );
}
