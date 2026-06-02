import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Check, Search, X } from "lucide-react";

const LAST_KEY = "mp:lastTransferBarn";

export const DEFAULT_BARNS = [
  "1 号牛舍",
  "2 号牛舍",
  "3 号牛舍",
  "4 号牛舍",
  "5 号牛舍",
  "6 号牛舍",
  "7 号牛舍",
  "8 号牛舍",
  "隔离舍 A",
  "隔离舍 B",
  "康复舍",
  "产房 1 号",
  "淘汰栏",
];

type Props = {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  value: string;
  onValueChange: (v: string) => void;
  /** 不在候选中出现的栏（如当前所在栏） */
  exclude?: string[];
  /** 自定义可选栏列表，默认使用 DEFAULT_BARNS */
  options?: string[];
  /** 开关左侧 label，默认"是否需要转栏" */
  label?: string;
  /** 是否带卡片容器，默认 true */
  bordered?: boolean;
};

/**
 * M 端统一的"是否转栏 + 转栏去向"组件。
 * - 用开关切换是否需要转栏
 * - 点击输入框打开底部 Sheet 进行搜索匹配；默认优先展示上次所选
 */
export function TransferBarnControl({
  enabled,
  onEnabledChange,
  value,
  onValueChange,
  exclude = [],
  options = DEFAULT_BARNS,
  label = "是否需要转栏",
  bordered = true,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [lastPicked, setLastPicked] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLastPicked(localStorage.getItem(LAST_KEY) ?? "");
    }
  }, []);

  const pool = useMemo(
    () => options.filter((b) => !exclude.includes(b)),
    [options, exclude],
  );

  const list = useMemo(() => {
    const kw = query.trim();
    const ordered = lastPicked && pool.includes(lastPicked)
      ? [lastPicked, ...pool.filter((b) => b !== lastPicked)]
      : pool;
    return kw ? ordered.filter((b) => b.includes(kw)) : ordered;
  }, [pool, lastPicked, query]);

  const pick = (b: string) => {
    onValueChange(b);
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_KEY, b);
      setLastPicked(b);
    }
    setSheetOpen(false);
    setQuery("");
  };

  const toggle = () => {
    const next = !enabled;
    onEnabledChange(next);
    if (!next) {
      onValueChange("");
      setQuery("");
      setSheetOpen(false);
    }
  };

  const openSheet = () => {
    setQuery("");
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setQuery("");
  };

  const wrapperCls = bordered
    ? "rounded-xl bg-card border border-border p-4"
    : "";

  return (
    <div className={wrapperCls}>
      <div className="flex items-center justify-between">
        <div className="text-body-sm text-foreground inline-flex items-center gap-1.5">
          <ArrowRightLeft className="h-3.5 w-3.5 text-text-tertiary" />
          {label}
        </div>
        <button
          type="button"
          onClick={toggle}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-border"
          }`}
          aria-pressed={enabled}
          aria-label={label}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              enabled ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-3">
          <button
            type="button"
            onClick={openSheet}
            className="w-full h-11 px-3 rounded-lg bg-card border border-border flex items-center justify-between gap-2 text-left"
          >
            {value ? (
              <span className="inline-flex items-center gap-1.5 text-body-sm text-primary font-medium">
                <Check className="h-3.5 w-3.5" />
                转入 {value}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-body-sm text-text-tertiary">
                <Search className="h-3.5 w-3.5" />
                输入或选择转栏去向
              </span>
            )}
            <span className="text-caption text-text-tertiary">
              {value ? "更换" : "选择"}
            </span>
          </button>
        </div>
      )}

      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={closeSheet}
        >
          <div
            className="w-full max-w-[440px] bg-card rounded-t-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 h-12 flex items-center justify-between border-b border-border shrink-0">
              <div className="text-body font-medium text-foreground inline-flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                选择转栏去向
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="h-8 w-8 -mr-2 inline-flex items-center justify-center text-text-tertiary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-4 pt-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) {
                      e.preventDefault();
                      pick(query.trim());
                    }
                  }}
                  placeholder="搜索或输入转入栏名称"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-subtle border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
                />
              </div>
              {!query && lastPicked && pool.includes(lastPicked) && (
                <div className="mt-2 text-caption text-text-tertiary">
                  已优先展示上次选择
                </div>
              )}
            </div>

            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              {list.length === 0 ? (
                <div className="text-center py-12 text-body-sm text-text-tertiary">
                  无匹配栏舍，按回车可直接使用输入值
                </div>
              ) : (
                list.map((b) => {
                  const selected = b === value;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => pick(b)}
                      className={`w-full text-left rounded-xl border p-3 bg-card transition-colors flex items-center justify-between gap-2 ${
                        selected
                          ? "border-primary"
                          : "border-border active:bg-surface-subtle"
                      }`}
                    >
                      <span className="text-body-sm text-foreground font-medium">{b}</span>
                      <span className="inline-flex items-center gap-2">
                        {b === lastPicked && (
                          <span className="tag tag-muted">上次选择</span>
                        )}
                        {selected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
