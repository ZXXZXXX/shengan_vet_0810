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

// 物品/药品候选（含参考单价，用于自动估算损耗金额）
const ITEMS = [
  { id: "DR-0108", name: "乳房炎抗生素 5mg", unit: "支", price: 18 },
  { id: "DR-0214", name: "口蹄疫疫苗 A 型", unit: "支", price: 60 },
  { id: "DR-0306", name: "驱虫剂 伊维菌素", unit: "瓶", price: 45 },
  { id: "DR-0412", name: "营养补充剂 复合维生素", unit: "罐", price: 88 },
  { id: "DR-0521", name: "消毒液 戊二醛", unit: "L", price: 44 },
  { id: "DR-0633", name: "葡萄糖注射液", unit: "瓶", price: 12 },
  { id: "DR-0712", name: "碳酸氢钠", unit: "袋", price: 9 },
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

type Line = { itemId: string; qty: string };

function LossReportPage() {
  const navigate = useNavigate();

  const [lines, setLines] = useState<Line[]>([{ itemId: "", qty: "" }]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState("");
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

  const estimatedTotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const item = ITEMS.find((i) => i.id === l.itemId);
      const qty = Number(l.qty);
      if (!item || !qty || Number.isNaN(qty)) return sum;
      return sum + item.price * qty;
    }, 0);
  }, [lines]);

  const setLine = (idx: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const addLine = () => setLines((prev) => [...prev, { itemId: "", qty: "" }]);
  const removeLine = (idx: number) =>
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  const toggleReason = (r: string) =>
    setReasons((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const otherSelected = reasons.includes("其他");
  const canSubmit =
    lines.every((l) => l.itemId && l.qty.trim()) &&
    reasons.length > 0 &&
    (!otherSelected || otherReason.trim().length > 0);

  const [submitted, setSubmitted] = useState(false);
  const otherInvalid = submitted && otherSelected && otherReason.trim().length === 0;

  const submit = () => {
    setSubmitted(true);
    if (!canSubmit) {
      toast.error("请完善必填项");
      return;
    }
    toast.success("损耗上报已提交");
    setTimeout(() => navigate({ to: "/m" }), 600);
  };

  return (
    <MobileShell title="损耗上报" back hideTabBar>
      <div className="px-4 pt-3 pb-28 space-y-5">
        {/* 损耗物品 */}
        <Section title="损耗物品" required hint="可一次性登记多项">
          <div className="space-y-2">
            {lines.map((l, idx) => {
              const item = ITEMS.find((i) => i.id === l.itemId);
              const qty = Number(l.qty);
              const lineAmount =
                item && qty && !Number.isNaN(qty) ? item.price * qty : 0;
              const canDelete = lines.length > 1;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary z-10 pointer-events-none" />
                      <input
                        value={
                          showItemPicker === idx
                            ? itemQuery
                            : item
                              ? `${item.name}  ${item.id}`
                              : ""
                        }
                        onFocus={() => {
                          setShowItemPicker(idx);
                          setItemQuery(item ? "" : "");
                        }}
                        onChange={(e) => {
                          setShowItemPicker(idx);
                          setItemQuery(e.target.value);
                          if (item) setLine(idx, { itemId: "" });
                        }}
                        onBlur={() => {
                          // delay so click on dropdown can register
                          setTimeout(() => {
                            setShowItemPicker((cur) => (cur === idx ? null : cur));
                          }, 150);
                        }}
                        placeholder="搜索物品编号 / 名称"
                        className="w-full h-11 pl-9 pr-3 rounded-lg text-body"
                      />
                      {showItemPicker === idx && (
                        <div className="absolute left-0 right-0 top-12 z-30 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {matchedItems.length === 0 ? (
                            <div className="text-center py-6 text-caption text-text-tertiary">
                              无匹配结果
                            </div>
                          ) : (
                            matchedItems.map((i) => (
                              <button
                                key={i.id}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setLine(idx, { itemId: i.id });
                                  setShowItemPicker(null);
                                  setItemQuery("");
                                }}
                                className="w-full px-3 py-2.5 flex items-center gap-3 text-left active:bg-surface-subtle hover:bg-surface-subtle"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-body text-foreground truncate">
                                    {i.name}
                                  </div>
                                  <div className="text-caption text-text-tertiary font-mono mt-0.5">
                                    {i.id} · {i.unit} · ¥ {i.price}/{i.unit}
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowItemPicker(idx);
                        setItemQuery("");
                        toast("已唤起扫码（演示）");
                      }}
                      className="h-11 w-11 inline-flex items-center justify-center rounded-lg bg-brand-subtle text-primary shrink-0"
                      aria-label="扫码录入"
                    >
                      <ScanLine className="h-4 w-4" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => removeLine(idx)}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-full text-text-tertiary active:bg-surface-subtle shrink-0"
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
                      className="flex-1 h-11 px-3 rounded-lg text-body"
                    />
                    <span className="text-body-sm text-text-secondary w-10 text-center">
                      {item?.unit ?? "-"}
                    </span>
                    <span className="text-body-sm text-text-secondary w-20 text-right tabular-nums">
                      {lineAmount > 0 ? `¥ ${lineAmount.toFixed(2)}` : "—"}
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

            {/* 估算总金额 */}
            <div
              className="flex items-center justify-between rounded-xl px-3 py-2.5 mt-1"
              style={{
                background:
                  "color-mix(in oklab, var(--primary) 6%, transparent)",
              }}
            >
              <span className="text-body-sm text-text-secondary">估算损耗金额</span>
              <span className="text-card-title text-primary tabular-nums">
                ¥ {estimatedTotal.toFixed(2)}
              </span>
            </div>
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
          {otherSelected && (
            <input
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              placeholder="请填写其他损耗原因"
              className="w-full h-11 px-3 rounded-lg text-body mt-2"
              aria-invalid={otherInvalid || undefined}
            />
          )}
        </Section>

        {/* 情况说明（非必填） */}
        <Section title="情况说明" hint="选填">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="可补充损耗经过、影响范围等说明"
            rows={3}
            className="w-full p-3 text-body resize-none"
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
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-body font-medium inline-flex items-center justify-center gap-2"
        >
          <PackageX className="h-4 w-4" />
          提交损耗上报
        </button>
      </div>

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
