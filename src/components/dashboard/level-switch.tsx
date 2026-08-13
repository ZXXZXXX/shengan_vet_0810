import { Layers } from "lucide-react";
import { levelMeta, setDataLevel, useDataLevel } from "@/lib/dashboard-view";

/**
 * 数量级分层：集团级 > 区域级 > 牧场级
 * 专题内容与牧场级完全一致，仅统计口径逐层上卷。
 */
export function LevelSwitch() {
  const { level, levels } = useDataLevel();
  if (levels.length <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="inline-flex items-center gap-1.5 text-body-sm text-text-secondary">
        <Layers className="h-4 w-4 text-primary" strokeWidth={1.75} />
        统计口径
      </span>

      <div className="flex items-center gap-1 rounded-lg bg-surface-subtle p-1">
        {levels.map((l, i) => (
          <div key={l} className="flex items-center">
            {i > 0 && <span className="px-1 text-caption text-text-tertiary">›</span>}
            <button
              type="button"
              onClick={() => setDataLevel(l)}
              className={`h-7 rounded-md px-3 text-body-sm transition-colors ${
                level === l
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-text-secondary hover:text-foreground"
              }`}
            >
              {levelMeta[l].label}
            </button>
          </div>
        ))}
      </div>

      <span className="text-caption text-text-tertiary">
        当前汇总范围：{levelMeta[level].desc}
      </span>
    </div>
  );
}
