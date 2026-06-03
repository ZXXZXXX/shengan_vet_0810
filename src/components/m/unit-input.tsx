import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  title?: string;
};

function UnitSheet({ open, onClose, value, onChange, options, title = "选择单位" }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full max-w-[440px] mx-auto bg-card rounded-t-2xl pb-2 pt-3 max-h-[60vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 pb-2 text-caption text-text-tertiary">{title}</div>
        {options.map((u) => {
          const active = u === value;
          return (
            <button
              key={u}
              type="button"
              onClick={() => {
                onChange(u);
                onClose();
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
          onClick={onClose}
          className="mt-1 mx-3 mb-2 h-11 w-[calc(100%-1.5rem)] rounded-lg border border-border text-body-sm text-text-secondary"
        >
          取消
        </button>
      </div>
    </div>
  );
}

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
      <UnitSheet open={open} onClose={() => setOpen(false)} value={unit} onChange={onUnitChange} options={units} />
    </>
  );
}

type UnitPickerProps = {
  value: string;
  onChange: (v: string) => void;
  units: string[];
  className?: string;
};

export function UnitPicker({ value, onChange, units, className }: UnitPickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-0.5 h-7 px-2 rounded-md bg-white border border-border text-caption text-text-secondary active:bg-surface-subtle ${
          className || ""
        }`}
      >
        <span>{value}</span>
        <ChevronDown className="h-3 w-3 text-text-tertiary" />
      </button>
      <UnitSheet open={open} onClose={() => setOpen(false)} value={value} onChange={onChange} options={units} />
    </>
  );
}

