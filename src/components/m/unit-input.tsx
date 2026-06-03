import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type UnitInputProps = {
  value: string;
  onChange: (v: string) => void;
  unit: string;
  onUnitChange: (u: string) => void;
  units: string[];
  placeholder?: string;
  inputMode?: "decimal" | "numeric" | "text";
  className?: string;
};

export function UnitInput({
  value,
  onChange,
  unit,
  onUnitChange,
  units,
  placeholder,
  inputMode = "decimal",
  className,
}: UnitInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`flex h-10 rounded-lg bg-white border border-border overflow-hidden focus-within:border-primary ${
          className || ""
        }`}
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="flex-1 min-w-0 px-3 bg-transparent text-body-sm focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-0.5 pl-2 pr-2 border-l border-border text-body-sm text-text-secondary bg-transparent active:bg-surface-subtle"
        >
          <span>{unit}</span>
          <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 flex items-end"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl pb-2 pt-3 max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pb-2 text-caption text-text-tertiary">
              选择单位
            </div>
            {units.map((u) => {
              const active = u === unit;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    onUnitChange(u);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 h-12 text-body ${
                    active ? "text-primary" : "text-foreground"
                  } active:bg-surface-subtle`}
                >
                  <span>{u}</span>
                  {active && <Check className="h-4 w-4" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-1 mx-3 mb-2 h-11 w-[calc(100%-1.5rem)] rounded-lg border border-border text-body-sm text-text-secondary"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}
