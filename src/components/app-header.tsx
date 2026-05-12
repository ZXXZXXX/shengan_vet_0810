import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  title: string;
  breadcrumb?: string[];
}

export function AppHeader({ title, breadcrumb }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="flex h-14 items-center gap-3 px-6">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="text-body-sm text-text-tertiary flex items-center gap-1.5">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-text-tertiary/60">/</span>}
                <span className={i === breadcrumb.length - 1 ? "text-foreground" : ""}>{b}</span>
              </span>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input
              placeholder="请输入工单编号"
              className="h-9 w-64 rounded-md border-border bg-card pl-9 text-body-sm placeholder:text-text-tertiary focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>

          <button className="relative h-9 w-9 inline-flex items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </button>

          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-brand-subtle text-primary text-body-sm font-medium">
              ZL
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {title && (
        <div className="px-6 pb-4 pt-1">
          <h1 className="text-page-title text-foreground">{title}</h1>
        </div>
      )}
    </header>
  );
}
