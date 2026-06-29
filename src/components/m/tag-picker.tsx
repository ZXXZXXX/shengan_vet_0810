import { useMemo, useState } from "react";
import { Search, Plus, X, Sparkles, ChevronDown, Check } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export function TagPicker({
  selected,
  onChange,
  presets,
  placeholder = "点击选择或搜索",
  hotLabel = "常用标签",
  singleSelect = false,
  disableCreate = false,
  triggerLabel,
  drawerTitle = "选择标签",
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  presets: string[];
  placeholder?: string;
  hotLabel?: string;
  /** @deprecated 不再控制内联展示数量；池由抽屉承载 */
  maxHot?: number;
  singleSelect?: boolean;
  disableCreate?: boolean;
  triggerLabel?: string;
  drawerTitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const kw = q.trim();
  const lower = kw.toLowerCase();

  // 池：预设 + 已自定义的（已选的非预设也并入，保证保留可见）
  const pool = useMemo(() => {
    const set = new Set<string>(presets);
    selected.forEach((s) => set.add(s));
    return Array.from(set);
  }, [presets, selected]);

  const filtered = useMemo(() => {
    if (!kw) return pool;
    return pool.filter((t) => t.toLowerCase().includes(lower));
  }, [pool, kw, lower]);

  const exactExists = pool.some((t) => t.toLowerCase() === lower);
  const canCreate = !disableCreate && !!kw && !exactExists;

  const toggle = (t: string) => {
    if (singleSelect) {
      onChange(selected[0] === t ? [] : [t]);
      setOpen(false);
    } else {
      if (selected.includes(t)) onChange(selected.filter((x) => x !== t));
      else onChange([...selected, t]);
    }
  };

  const remove = (t: string) => onChange(selected.filter((x) => x !== t));

  const create = () => {
    if (!canCreate) return;
    if (singleSelect) {
      onChange([kw]);
      setOpen(false);
    } else {
      onChange([...selected, kw]);
    }
    setQ("");
  };

  return (
    <div className="space-y-2">
      {/* 已选（自定义，未在常用池中的） */}
      {selected.filter((t) => !presets.includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.filter((t) => !presets.includes(t)).map((t) => (
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

      {/* 常用标签快选（两行内，超出在抽屉内查看） */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-h-[76px] overflow-hidden">
          {presets.map((t) => {
            const active = selected.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggle(t)}
                className={`inline-flex items-center h-8 px-3 rounded-full text-body-sm border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border active:border-primary"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      )}


      {/* 触发器 */}
      <button
        type="button"
        onClick={() => {
          setQ("");
          setOpen(true);
        }}
        className="w-full h-10 px-3 inline-flex items-center justify-between rounded-lg bg-card border border-border text-body-sm text-text-tertiary active:border-primary"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-4 w-4" />
          {triggerLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="px-0">
          <DrawerHeader className="px-4 pt-2 pb-3 text-left">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-section-title">{drawerTitle}</DrawerTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 px-3 rounded-lg text-body-sm text-primary font-medium"
              >
                完成{selected.length > 0 ? `（${selected.length}）` : ""}
              </button>
            </div>
          </DrawerHeader>

          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={disableCreate ? "输入关键词搜索" : "搜索或直接输入新症状"}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="px-4 pt-1 pb-2 flex items-center gap-1 text-caption text-text-tertiary">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>{hotLabel}</span>
            <span className="ml-auto">{filtered.length} 项</span>
          </div>

          {/* 一屏最多 6 行，超出滚动；一行一个 */}
          <div className="px-4 pb-4 max-h-[calc(6*52px+24px)] overflow-y-auto">
            {filtered.length > 0 ? (
              <div className="flex flex-col">
                {filtered.map((t) => {
                  const active = selected.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggle(t)}
                      className={`h-12 px-1 flex items-center justify-between text-body border-b border-border/60 last:border-b-0 ${
                        active ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <span className="truncate">{t}</span>
                      {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              !canCreate && (
                <div className="py-6 text-center text-caption text-text-tertiary">
                  无匹配结果
                </div>
              )
            )}

            {canCreate && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={create}
                  className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-dashed border-primary/60 bg-brand-subtle text-primary text-body-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  新建「{kw}」
                </button>
              </div>
            )}
          </div>

        </DrawerContent>
      </Drawer>
    </div>
  );
}
