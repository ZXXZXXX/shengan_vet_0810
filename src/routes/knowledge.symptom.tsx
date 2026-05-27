import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Activity, Plus, Search, Pencil, Trash2, X, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/knowledge/symptom")({
  head: () => ({ meta: [{ title: "症状知识库 — 奇点智牧" }] }),
  component: SymptomKBPage,
});

type Symptom = { id: string; name: string; related: string[]; urgency: string };

const seed: Symptom[] = [
  { id: "SY-01", name: "持续高烧", related: ["呼吸道疾病", "乳房炎", "口蹄疫"], urgency: "高" },
  { id: "SY-02", name: "跛行", related: ["蹄叶炎", "关节炎"], urgency: "中" },
  { id: "SY-03", name: "食欲减退", related: ["瘤胃酸中毒", "酮病"], urgency: "中" },
  { id: "SY-04", name: "乳房红肿", related: ["乳房炎"], urgency: "高" },
  { id: "SY-05", name: "腹泻", related: ["瘤胃酸中毒", "犊牛腹泻症"], urgency: "中" },
  { id: "SY-06", name: "产奶量骤降", related: ["乳房炎", "酮病"], urgency: "高" },
  { id: "SY-07", name: "口腔水疱", related: ["口蹄疫"], urgency: "高" },
  { id: "SY-08", name: "体温偏低", related: ["产后瘫痪", "酮病"], urgency: "中" },
];

function SymptomKBPage() {
  const [list, setList] = useState<Symptom[]>(seed);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Symptom | null>(null);
  const [viewing, setViewing] = useState<Symptom | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const allChecked = list.length > 0 && selected.size === list.length;
  const someChecked = selected.size > 0 && !allChecked;

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(list.map((s) => s.id)));

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setList((prev) => prev.filter((s) => !pendingDelete.includes(s.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      pendingDelete.forEach((id) => next.delete(id));
      return next;
    });
    toast.success(`已删除 ${pendingDelete.length} 条症状`);
    setPendingDelete(null);
  };

  const saveEdit = () => {
    if (!editing) return;
    setList((prev) => prev.map((s) => (s.id === editing.id ? editing : s)));
    toast.success("已保存");
    setEditing(null);
  };

  const batchEdit = () => {
    if (selected.size === 1) {
      const one = list.find((s) => s.id === Array.from(selected)[0]);
      if (one) setEditing({ ...one });
    } else {
      toast.info("批量编辑仅支持单条，多条请逐条编辑或使用批量删除");
    }
  };

  const headerCheckRef = useMemo(
    () => (el: HTMLButtonElement | null) => {
      if (el) (el as unknown as { dataset: DOMStringMap }).dataset.indeterminate = someChecked ? "true" : "false";
    },
    [someChecked],
  );

  return (
    <>
      <AppHeader title="症状知识库" breadcrumb={["诊疗知识库", "症状知识库"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input placeholder="搜索症状关键词" className="h-9 w-72 pl-9 text-body-sm" />
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建症状
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 h-11 rounded-md border border-border bg-surface-subtle">
          <div className="flex items-center gap-3">
            <Checkbox ref={headerCheckRef} checked={allChecked} onCheckedChange={toggleAll} aria-label="全选" />
            <span className="text-body-sm text-text-secondary">
              {selected.size > 0 ? `已选 ${selected.size} 项` : `共 ${list.length} 条`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {selected.size > 0 && (
              <>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-body-sm font-normal" onClick={batchEdit}>
                  <Pencil className="h-3.5 w-3.5" /> 批量编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-body-sm font-normal text-[var(--state-danger)] hover:text-[var(--state-danger)] hover:bg-[color-mix(in_oklab,var(--state-danger)_8%,transparent)]"
                  onClick={() => setPendingDelete(Array.from(selected))}
                >
                  <Trash2 className="h-3.5 w-3.5" /> 批量删除
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-body-sm font-normal text-text-tertiary" onClick={() => setSelected(new Set())}>
                  <X className="h-3.5 w-3.5" /> 取消
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((s) => {
            const checked = selected.has(s.id);
            return (
              <Card
                key={s.id}
                className={`relative border-border bg-card p-5 transition-colors ${checked ? "border-primary/60 ring-1 ring-primary/20" : "hover:border-primary/40"}`}
              >
                <div className="absolute top-3 left-3">
                  <Checkbox checked={checked} onCheckedChange={() => toggleOne(s.id)} aria-label={`选择 ${s.name}`} />
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-tertiary hover:text-primary hover:bg-brand-subtle"
                    aria-label="编辑"
                    onClick={() => setEditing({ ...s })}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-tertiary hover:text-[var(--state-danger)] hover:bg-[color-mix(in_oklab,var(--state-danger)_8%,transparent)]"
                    aria-label="删除"
                    onClick={() => setPendingDelete([s.id])}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-start justify-between mb-3 pl-7 pr-16">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    <span className="text-card-title text-foreground">{s.name}</span>
                  </div>
                  <span className={`tag ${s.urgency === "高" ? "tag-danger" : "tag-warning"}`}>{s.urgency}</span>
                </div>
                <div className="text-caption text-text-tertiary mb-2">关联疾病</div>
                <div className="flex flex-wrap gap-1.5">
                  {s.related.map((r) => (
                    <span key={r} className="tag tag-muted">{r}</span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-section-title">编辑症状</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">症状名称</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">紧急程度</Label>
                <Input value={editing.urgency} onChange={(e) => setEditing({ ...editing, urgency: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">关联疾病（顿号分隔）</Label>
                <Input
                  value={editing.related.join("、")}
                  onChange={(e) => setEditing({ ...editing, related: e.target.value.split(/[、,，]/).map((t) => t.trim()).filter(Boolean) })}
                />
              </div>
            </div>
          )}
          <SheetFooter className="mt-6 flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>取消</Button>
            <Button className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground" onClick={saveEdit}>保存</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              将删除 {pendingDelete?.length ?? 0} 条症状，删除后不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
