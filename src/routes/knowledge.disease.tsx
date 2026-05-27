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
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Search, Filter, Pencil, Trash2, X, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/knowledge/disease")({
  head: () => ({ meta: [{ title: "疾病知识库 — 奇点智牧" }] }),
  component: DiseaseKBPage,
});

type Disease = {
  id: string;
  name: string;
  cat: string;
  severity: string;
  symptoms: string;
  prevent: string;
};

const seed: Disease[] = [
  { id: "DZ-001", name: "乳房炎", cat: "繁殖系统", severity: "中-高", symptoms: "乳房红肿、热痛，乳汁异常", prevent: "挤奶卫生、乳头药浴" },
  { id: "DZ-002", name: "蹄叶炎", cat: "蹄部疾病", severity: "中", symptoms: "跛行、蹄部发热、行走困难", prevent: "定期修蹄、地面保持干燥" },
  { id: "DZ-003", name: "瘤胃酸中毒", cat: "消化系统", severity: "高", symptoms: "食欲减退、腹泻、瘤胃运动减弱", prevent: "饲料过渡渐进、平衡精粗比" },
  { id: "DZ-004", name: "口蹄疫", cat: "传染病", severity: "高", symptoms: "口腔、蹄部、乳房水疱、溃烂", prevent: "强制免疫、隔离消毒" },
  { id: "DZ-005", name: "酮病", cat: "代谢疾病", severity: "中", symptoms: "食欲下降、产奶量骤减、酮味", prevent: "围产期能量平衡、监测血酮" },
];

function DiseaseKBPage() {
  const [list, setList] = useState<Disease[]>(seed);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Disease | null>(null);
  const [viewing, setViewing] = useState<Disease | null>(null);
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
  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(list.map((d) => d.id)));
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setList((prev) => prev.filter((d) => !pendingDelete.includes(d.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      pendingDelete.forEach((id) => next.delete(id));
      return next;
    });
    toast.success(`已删除 ${pendingDelete.length} 条词条`);
    setPendingDelete(null);
  };

  const saveEdit = () => {
    if (!editing) return;
    setList((prev) => prev.map((d) => (d.id === editing.id ? editing : d)));
    toast.success("已保存");
    setEditing(null);
  };

  const batchEdit = () => {
    if (selected.size === 1) {
      const one = list.find((d) => d.id === Array.from(selected)[0]);
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
      <AppHeader title="疾病知识库" breadcrumb={["诊疗知识库", "疾病知识库"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索疾病名称 / 症状" className="h-9 w-72 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 分类</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建词条
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {list.map((d) => {
            const checked = selected.has(d.id);
            return (
              <Card
                key={d.id}
                className={`relative border-border bg-card p-5 transition-colors ${checked ? "border-primary/60 ring-1 ring-primary/20" : "hover:border-primary/40"}`}
              >
                <div className="absolute top-3 left-3">
                  <Checkbox checked={checked} onCheckedChange={() => toggleOne(d.id)} aria-label={`选择 ${d.name}`} />
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-tertiary hover:text-primary hover:bg-brand-subtle"
                    aria-label="编辑"
                    onClick={() => setEditing({ ...d })}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-text-tertiary hover:text-[var(--state-danger)] hover:bg-[color-mix(in_oklab,var(--state-danger)_8%,transparent)]"
                    aria-label="删除"
                    onClick={() => setPendingDelete([d.id])}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-start justify-between mb-3 pl-7 pr-16">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-lg bg-brand-subtle flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-card-title text-foreground">{d.name}</div>
                      <div className="text-caption text-text-tertiary font-mono">{d.id} · {d.cat}</div>
                    </div>
                  </div>
                  <span className={`tag ${d.severity === "高" ? "tag-danger" : d.severity === "中" ? "tag-warning" : "tag-muted"}`}>{d.severity}</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-caption text-text-tertiary mb-1">典型症状</div>
                    <p className="text-body-sm text-text-secondary leading-relaxed">{d.symptoms}</p>
                  </div>
                  <div>
                    <div className="text-caption text-text-tertiary mb-1">防控要点</div>
                    <p className="text-body-sm text-text-secondary leading-relaxed">{d.prevent}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-section-title">编辑疾病词条</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">疾病名称</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-body-sm text-text-secondary">分类</Label>
                  <Input value={editing.cat} onChange={(e) => setEditing({ ...editing, cat: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-body-sm text-text-secondary">严重程度</Label>
                  <Input value={editing.severity} onChange={(e) => setEditing({ ...editing, severity: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">典型症状</Label>
                <Textarea rows={3} value={editing.symptoms} onChange={(e) => setEditing({ ...editing, symptoms: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">防控要点</Label>
                <Textarea rows={3} value={editing.prevent} onChange={(e) => setEditing({ ...editing, prevent: e.target.value })} />
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
              将删除 {pendingDelete?.length ?? 0} 条疾病词条，删除后不可恢复。
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
