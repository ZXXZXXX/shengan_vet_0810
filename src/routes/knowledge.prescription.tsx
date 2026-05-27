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
import { FileText, Plus, Search, Filter, Pencil, Trash2, X, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/knowledge/prescription")({
  head: () => ({ meta: [{ title: "处方管理 — 奇点智牧" }] }),
  component: PrescriptionPage,
});

type Rx = {
  id: string;
  name: string;
  disease: string;
  drugs: string[];
  duration: string;
  author: string;
  updated: string;
};

const seed: Rx[] = [
  { id: "RX-001", name: "乳房炎标准处方 A", disease: "乳房炎", drugs: ["乳房炎抗生素 5mg ×2", "消炎药 ×1"], duration: "5 天", author: "李雨晴", updated: "2026-04-20" },
  { id: "RX-002", name: "口蹄疫紧急处方", disease: "口蹄疫", drugs: ["口蹄疫疫苗 A 型 ×1", "消毒液 ×5L"], duration: "立即", author: "陈晓东", updated: "2026-04-12" },
  { id: "RX-003", name: "蹄叶炎康复处方", disease: "蹄叶炎", drugs: ["消炎止痛剂 ×1", "蹄部护理液 ×1"], duration: "7 天", author: "李雨晴", updated: "2026-03-28" },
  { id: "RX-004", name: "酮病调理处方", disease: "酮病", drugs: ["丙二醇 500ml ×1", "葡萄糖注射液"], duration: "3 天", author: "赵兽医", updated: "2026-03-15" },
];

function PrescriptionPage() {
  const [list, setList] = useState<Rx[]>(seed);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Rx | null>(null);
  const [viewing, setViewing] = useState<Rx | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const allChecked = list.length > 0 && selected.size === list.length;
  const someChecked = selected.size > 0 && !allChecked;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(list.map((r) => r.id)));

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setList((prev) => prev.filter((r) => !pendingDelete.includes(r.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      pendingDelete.forEach((id) => next.delete(id));
      return next;
    });
    toast.success(`已删除 ${pendingDelete.length} 条处方`);
    setPendingDelete(null);
  };

  const saveEdit = () => {
    if (!editing) return;
    setList((prev) => prev.map((r) => (r.id === editing.id ? editing : r)));
    toast.success("已保存");
    setEditing(null);
  };

  const batchEdit = () => {
    if (selected.size === 1) {
      const one = list.find((r) => r.id === Array.from(selected)[0]);
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
      <AppHeader title="处方管理" breadcrumb={["诊疗知识库", "处方管理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
              <Input placeholder="搜索处方 / 疾病" className="h-9 w-72 pl-9 text-body-sm" />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal"><Filter className="h-3.5 w-3.5" /> 适用疾病</Button>
          </div>
          <Button size="sm" className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> 新建处方
          </Button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 h-11 rounded-md border border-primary/30 bg-brand-subtle">
            <span className="text-body-sm text-foreground">已选 {selected.size} 项</span>
            <div className="flex items-center gap-1.5">
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
            </div>
          </div>
        )}

        <Card className="border-border bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-6 h-12 text-table-header text-text-secondary border-b border-border bg-surface-subtle">
            <Checkbox ref={headerCheckRef} checked={allChecked} onCheckedChange={toggleAll} aria-label="全选" />
            <div className="grid grid-cols-5 gap-4 flex-1 min-w-0">
              <div>编号</div>
              <div>处方名称</div>
              <div>适用疾病</div>
              <div>用药组成</div>
              <div>疗程</div>
            </div>
            <div className="w-[160px] text-right shrink-0">功能</div>
          </div>
          {list.map((r) => {
            const checked = selected.has(r.id);
            return (
              <div
                key={r.id}
                className={`flex items-center gap-4 px-6 py-3 text-table-cell border-b border-border last:border-0 ${checked ? "bg-brand-subtle/60" : "hover:bg-surface-subtle"}`}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleOne(r.id)} aria-label={`选择 ${r.name}`} />
                <div className="grid grid-cols-5 gap-4 flex-1 min-w-0">
                  <div className="font-mono text-body text-foreground truncate">{r.id}</div>
                  <div className="flex items-center gap-1.5 text-body text-foreground truncate"><FileText className="h-3.5 w-3.5 text-primary shrink-0" /><span className="truncate">{r.name}</span></div>
                  <div className="truncate"><span className="tag tag-brand">{r.disease}</span></div>
                  <div className="text-body-sm text-text-secondary truncate">{r.drugs.join("、")}</div>
                  <div className="text-body-sm text-text-secondary truncate">{r.duration}</div>
                </div>
                <div className="w-[160px] shrink-0 flex justify-end items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground"
                    onClick={() => setViewing(r)}
                  >
                    查看
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary"
                    onClick={() => setEditing({ ...r })}
                  >
                    编辑
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-text-secondary hover:bg-surface-subtle hover:text-foreground"
                        aria-label="更多操作"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        className="text-[var(--state-danger)] focus:text-[var(--state-danger)]"
                        onClick={() => setPendingDelete([r.id])}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> 删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </Card>
      </main>

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-section-title">编辑处方</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">处方名称</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-body-sm text-text-secondary">适用疾病</Label>
                  <Input value={editing.disease} onChange={(e) => setEditing({ ...editing, disease: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-body-sm text-text-secondary">疗程</Label>
                  <Input value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">用药组成（每行一项）</Label>
                <Textarea
                  rows={4}
                  value={editing.drugs.join("\n")}
                  onChange={(e) => setEditing({ ...editing, drugs: e.target.value.split("\n").map((t) => t.trim()).filter(Boolean) })}
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

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-section-title">处方详情</SheetTitle>
          </SheetHeader>
          {viewing && (
            <div className="mt-4 space-y-4 text-body-sm">
              <ViewRow label="编号" value={viewing.id} mono />
              <ViewRow label="处方名称" value={viewing.name} />
              <ViewRow label="适用疾病" value={viewing.disease} />
              <ViewRow label="疗程" value={viewing.duration} />
              <div className="space-y-1.5">
                <div className="text-body-sm text-text-secondary">用药组成</div>
                <ul className="list-disc pl-5 text-body text-foreground space-y-0.5">
                  {viewing.drugs.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
              <ViewRow label="创建人" value={viewing.author} />
              <ViewRow label="更新时间" value={viewing.updated} />
            </div>
          )}
          <SheetFooter className="mt-6 flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setViewing(null)}>关闭</Button>
            <Button className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground" onClick={() => { if (viewing) { setEditing({ ...viewing }); setViewing(null); } }}>编辑</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              将删除 {pendingDelete?.length ?? 0} 条处方，删除后不可恢复。
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

function ViewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-20 shrink-0 text-body-sm text-text-secondary">{label}</div>
      <div className={`flex-1 text-body text-foreground ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
