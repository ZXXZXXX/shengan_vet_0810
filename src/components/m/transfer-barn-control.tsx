import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Check, Search } from "lucide-react";

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
 * - 输入框匹配候选；优先展示上次所选
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
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
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

  const matches = useMemo(() => {
    const kw = query.trim();
    const ordered = lastPicked && pool.includes(lastPicked)
      ? [lastPicked, ...pool.filter((b) => b !== lastPicked)]
      : pool;
    return (kw ? ordered.filter((b) => b.includes(kw)) : ordered).slice(0, 6);
  }, [pool, lastPicked, query]);

  const pick = (b: string) => {
    onValueChange(b);
    if (typeof window !== "undefined") {
      localStorage.setItem(LAST_KEY, b);
      setLastPicked(b);
    }
    setFocused(false);
    setQuery("");
  };

  const toggle = () => {
    const next = !enabled;
    onEnabledChange(next);
    if (!next) {
      onValueChange("");
      setQuery("");
    }
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
          {value ? (
            <div className="flex items-center justify-between gap-2 h-11 px-3 rounded-xl bg-brand-subtle border border-primary/20">
              <span className="inline-flex items-center gap-1.5 text-body-sm text-primary font-medium">
                <Check className="h-3.5 w-3.5" />
                转入 {value}
              </span>
              <button
                type="button"
                onClick={() => {
                  onValueChange("");
                  setQuery("");
                }}
                className="text-caption text-text-tertiary"
              >
                更换
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setFocused(true);
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    e.preventDefault();
                    pick(query.trim());
                  }
                }}
                placeholder="输入或搜索转入栏编号"
                className="w-full h-11 pl-9 pr-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
              {focused && matches.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-lg max-h-72 overflow-auto">
                  {matches.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(b)}
                      className="w-full text-left px-3 py-2.5 hover:bg-surface-subtle border-b border-border last:border-b-0 flex items-center justify-between gap-2"
                    >
                      <span className="text-body-sm text-foreground">{b}</span>
                      {b === lastPicked && (
                        <span className="tag tag-muted">上次选择</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
