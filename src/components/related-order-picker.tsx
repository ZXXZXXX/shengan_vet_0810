import { useMemo, useState } from "react";
import { X, Search, Check, Stethoscope } from "lucide-react";

export type RelatedOrder = {
  id: string;
  type: string;
  conclusion: string;
  target: string;
  reportedAt?: string;
  diagnosedAt?: string;
  startedAt?: string;
  completedAt?: string;
  recent?: boolean;
};

export function RelatedOrderCard({
  order,
  selected,
  onClick,
}: {
  order: RelatedOrder;
  selected?: boolean;
  onClick?: () => void;
}) {
  const times: { label: string; value?: string }[] = [
    { label: "上报", value: order.reportedAt },
    { label: "诊断", value: order.diagnosedAt },
    { label: "开始执行", value: order.startedAt },
    { label: "完成", value: order.completedAt },
  ].filter((t) => !!t.value);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3 bg-card transition-colors ${
        selected
          ? "border-primary"
          : "border-border active:bg-surface-subtle"
      }`}
    >
      <div className="flex items-center gap-1.5 text-caption text-text-tertiary mb-1.5">
        <span className="font-mono">{order.id}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <Stethoscope className="h-3 w-3" />
          {order.type}
        </span>
        {order.recent && (
          <span className="ml-auto tag tag-muted">近 7 日</span>
        )}
      </div>
      <div className="text-body-sm text-foreground font-medium truncate">
        <span className="font-mono text-text-secondary">{order.target}</span>
        <span className="text-text-tertiary"> · </span>
        {order.conclusion}
      </div>
      {times.length > 0 && (
        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-caption text-text-tertiary">
          {times.map((t) => (
            <div key={t.label} className="flex items-center gap-1 truncate">
              <span>{t.label}</span>
              <span className="text-text-secondary truncate">{t.value}</span>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <div className="mt-1.5 inline-flex items-center gap-0.5 text-caption text-primary font-medium">
          <Check className="h-3.5 w-3.5" />
          已选
        </div>
      )}
    </button>
  );
}

export function RelatedOrderPicker({
  open,
  onClose,
  orders,
  selectedId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  orders: RelatedOrder[];
  selectedId?: string;
  onSelect: (order: RelatedOrder) => void;
}) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return orders;
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(kw) ||
        o.conclusion.toLowerCase().includes(kw) ||
        o.target.toLowerCase().includes(kw)
    );
  }, [orders, q]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] bg-card rounded-t-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 h-12 flex items-center justify-between border-b border-border shrink-0">
          <div className="text-body font-medium text-foreground">
            选择关联工单
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pt-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索工单编号 / 结论 / 牛只"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary"
            />
          </div>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {list.length === 0 ? (
            <div className="text-center py-12 text-body-sm text-text-tertiary">
              无匹配工单
            </div>
          ) : (
            list.map((o) => (
              <RelatedOrderCard
                key={o.id}
                order={o}
                selected={o.id === selectedId}
                onClick={() => {
                  onSelect(o);
                  onClose();
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
