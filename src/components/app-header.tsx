import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="flex flex-col leading-tight mr-auto">
        <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <span className="text-[11px] text-muted-foreground">{subtitle}</span>
        )}
      </div>

      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索 / 命令..."
          className="h-9 w-72 rounded-lg border-border/60 bg-muted/40 pl-9 text-xs"
        />
        <kbd className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span className="text-xs">AI 助手</span>
      </Button>

      <Button variant="ghost" size="icon" className="relative h-9 w-9">
        <Bell className="h-4 w-4" />
        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive" />
      </Button>

      <Avatar className="h-8 w-8 ring-2 ring-primary/10">
        <AvatarFallback className="bg-gradient-primary text-[11px] font-medium text-primary-foreground">
          ZL
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
