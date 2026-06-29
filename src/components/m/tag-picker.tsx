import { useMemo, useState } from "react";
import { Search, Plus, X, Sparkles } from "lucide-react";

export function TagPicker({
  selected,
  onChange,
  presets,
  placeholder = "输入关键词搜索，或创建新标签",
  hotLabel = "常用标签",
  maxHot = 8,
  singleSelect = false,
  disableCreate = false,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  presets: string[];
  placeholder?: string;
  hotLabel?: string;
  maxHot?: number;
  singleSelect?: boolean;
  disableCreate?: boolean;
}) {
  const [q, setQ] = useState("");

  const kw = q.trim();
  const lower = kw.toLowerCase();

  // 全部可见候选（预设 + 已自定义的）
  const pool = useMemo(() => {
    const set = new Set<string>(presets);
    selected.forEach((s) => set.add(s));
    return Array.from(set);
  }, [presets, selected]);

  // 搜索命中（已选项也参与匹配以便取消）
  const matches = useMemo(() => {
    if (!kw) return [];
    return pool.filter((t) => t.toLowerCase().includes(lower));
  }, [pool, kw, lower]);

  // 无关键词时：展示常用标签（去掉已选）
  const hot = useMemo(
    () => presets.filter((t) => !selected.includes(t)).slice(0, maxHot),
    [presets, selected, maxHot]
  );

  const exactExists = pool.some((t) => t.toLowerCase() === lower);
  const canCreate = !!kw && !exactExists;

  const select = (t: string) => {
    if (singleSelect) {
      onChange(selected[0] === t ? [] : [t]);
    } else {
      if (selected.includes(t)) onChange(selected.filter((x) => x !== t));
      else onChange([...selected, t]);
    }
  };

  const remove = (t: string) => onChange(selected.filter((x) => x !== t));

  const create = () => {
    if (!canCreate) return;
    onChange(singleSelect ? [kw] : [...selected, kw]);
    setQ("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!kw) return;
    const exact = pool.find((t) => t.toLowerCase() === lower);
    if (exact) {
      select(exact);
      setQ("");
      return;
    }
    if (matches.length > 0) {
      select(matches[0]);
      setQ("");
      return;
    }
    create();
  };


  return (
    <div className="space-y-3">
      {/* 已选 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 h-8 pl-3 pr-1.5 rounded-full bg-primary text-primary-foreground text-body-sm shadow-[0_2px_6px_-2px_color-mix(in_oklab,var(--primary)_50%,transparent)]"
            >
              {t}
              <button
                type="button"
                onClick={() => remove(t)}
                className="h-5 w-5 inline-flex items-center justify-center rounded-full hover:bg-white/15"
                aria-label={`移除 ${t}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
        />
      </div>

      {/* 搜索结果 / 常用标签 / 新建 */}
      {kw ? (
        <div className="space-y-2">
          {matches.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {matches.map((t) => {
                const active = selected.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => select(t)}
                    className={`h-8 px-3 rounded-full text-body-sm border transition-colors ${
                      active
                        ? "bg-brand-subtle text-primary border-primary/40"
                        : "bg-card text-text-secondary border-border active:scale-[0.97]"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
          {canCreate && (
            <button
              type="button"
              onClick={create}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-dashed border-primary/50 bg-brand-subtle text-primary text-body-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              新建标签「{kw}」
            </button>
          )}
          {matches.length === 0 && !canCreate && (
            <div className="text-caption text-text-tertiary">无匹配结果</div>
          )}
        </div>
      ) : (
        hot.length > 0 && (
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1 text-caption text-text-tertiary">
              <Sparkles className="h-3 w-3 text-primary" />
              {hotLabel}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hot.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => select(t)}
                  className="h-8 px-3 rounded-full text-body-sm border border-border bg-card text-text-secondary active:scale-[0.97]"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
