import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  desc,
  action,
  size = "md",
}: {
  icon?: LucideIcon;
  title: string;
  desc?: string;
  action?: ReactNode;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "py-10" : "py-16";
  const iconSize = size === "sm" ? "h-12 w-12" : "h-16 w-16";
  const innerIcon = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  return (
    <div className={`flex flex-col items-center justify-center text-center ${pad} px-6`}>
      <div className={`${iconSize} rounded-full bg-surface-subtle text-text-tertiary inline-flex items-center justify-center mb-3`}>
        <Icon className={innerIcon} strokeWidth={1.5} />
      </div>
      <div className="text-body text-foreground">{title}</div>
      {desc && <div className="text-caption text-text-tertiary mt-1 max-w-[260px]">{desc}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
