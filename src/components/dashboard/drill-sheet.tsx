import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { BareContext } from "./charts";

export function DrillSheet({
  open,
  onOpenChange,
  title,
  desc,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-[860px]"
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-border bg-card px-6 py-4">
          <SheetTitle className="text-section-title text-foreground">{title}</SheetTitle>
          {desc && <SheetDescription className="text-caption text-text-tertiary">{desc}</SheetDescription>}
        </SheetHeader>
        <div className="px-6 py-5 [&_[data-slot=card]]:border-0 [&_[data-slot=card]]:bg-transparent [&_[data-slot=card]]:shadow-none">
          <BareContext.Provider value>{children}</BareContext.Provider>
        </div>
      </SheetContent>
    </Sheet>
  );
}
