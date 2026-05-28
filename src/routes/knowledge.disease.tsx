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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  symptoms: string[];
  prevent: string;
};

const CAT_OPTIONS = ["繁殖系统", "蹄部疾病", "消化系统", "传染病", "代谢疾病", "呼吸系统", "其他"];
const SEVERITY_OPTIONS = ["低", "中", "高"];

const seed: Disease[] = [
  { id: "DZ-001", name: "乳房炎", cat: "繁殖系统", severity: "高", symptoms: ["乳房红肿", "热痛", "乳汁异常"], prevent: "挤奶卫生、乳头药浴" },
  { id: "DZ-002", name: "蹄叶炎", cat: "蹄部疾病", severity: "中", symptoms: ["跛行", "蹄部发热", "行走困难"], prevent: "定期修蹄、地面保持干燥" },
  { id: "DZ-003", name: "瘤胃酸中毒", cat: "消化系统", severity: "高", symptoms: ["食欲减退", "腹泻", "瘤胃运动减弱"], prevent: "饲料过渡渐进、平衡精粗比" },
  { id: "DZ-004", name: "口蹄疫", cat: "传染病", severity: "高", symptoms: ["口腔水疱", "蹄部水疱", "乳房水疱", "溃烂"], prevent: "强制免疫、隔离消毒" },
  { id: "DZ-005", name: "酮病", cat: "代谢疾病", severity: "中", symptoms: ["食欲下降", "产奶量骤减", "酮味"], prevent: "围产期能量平衡、监测血酮" },
];

function severityTagClass(s: string) {
  if (s === "高") return "tag-danger";
  if (s === "中-高") return "tag-warning";
  if (s === "中") return "tag-warning";
  return "tag-muted";
}

function DiseaseKBPage() {
  const [list, setList] = useState<Disease[]>(seed);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Disease | null>(null);
  const [viewing, setViewing] = useState<Disease | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  const allChecked = list.length > 0 && selected.size === list.length;
  const someChecked = selected.size > 0 && !allChecked;

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(list.map((d) => d.id)));

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
      toast.info("批量编辑仅支持单条,多条请逐条编辑或使用批量删除");
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
              <div>名称</div>
              <div>分类</div>
              <div>严重程度</div>
              <div className="col-span-1">典型症状</div>
            </div>
            <div className="w-[160px] text-right shrink-0">功能</div>
          </div>
          {list.map((d) => {
            const checked = selected.has(d.id);
            return (
              <div
                key={d.id}
                className={`flex items-center gap-4 px-6 h-12 text-table-cell border-b border-border last:border-0 ${checked ? "bg-brand-subtle/60" : "hover:bg-surface-subtle"}`}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleOne(d.id)} aria-label={`选择 ${d.name}`} />
                <div className="grid grid-cols-5 gap-4 flex-1 min-w-0">
                  <div className="font-mono text-body text-foreground truncate">{d.id}</div>
                  <div className="flex items-center gap-1.5 text-body text-foreground truncate">
                    <BookOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{d.name}</span>
                  </div>
                  <div className="text-body-sm text-text-secondary truncate">{d.cat}</div>
                  <div className="truncate"><span className={`tag ${severityTagClass(d.severity)}`}>{d.severity}</span></div>
                  <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                    {d.symptoms.slice(0, 2).map((s) => (
                      <span key={s} className="tag tag-muted whitespace-nowrap">{s}</span>
                    ))}
                    {d.symptoms.length > 2 && (
                      <span className="tag tag-muted whitespace-nowrap">+{d.symptoms.length - 2}</span>
                    )}
                  </div>
                </div>
                <div className="w-[160px] shrink-0 flex justify-end items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-body-sm font-normal text-text-secondary hover:bg-surface-subtle hover:text-foreground"
                    onClick={() => setViewing(d)}
                  >
                    查看
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary"
                    onClick={() => setEditing({ ...d })}
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
                        onClick={() => setPendingDelete([d.id])}
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
                  <Select value={editing.cat} onValueChange={(v) => setEditing({ ...editing, cat: v })}>
                    <SelectTrigger><SelectValue placeholder="选择分类" /></SelectTrigger>
                    <SelectContent>
                      {CAT_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-body-sm text-text-secondary">严重程度</Label>
                  <Select value={editing.severity} onValueChange={(v) => setEditing({ ...editing, severity: v })}>
                    <SelectTrigger><SelectValue placeholder="选择严重程度" /></SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-body-sm text-text-secondary">典型症状</Label>
                <SymptomTags
                  value={editing.symptoms}
                  onChange={(next) => setEditing({ ...editing, symptoms: next })}
                />
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

      <Sheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-section-title">疾病词条详情</SheetTitle>
          </SheetHeader>
          {viewing && (
            <div className="mt-4 space-y-3">
              <ViewRow label="编号" value={viewing.id} mono />
              <ViewRow label="名称" value={viewing.name} />
              <ViewRow label="分类" value={viewing.cat} />
              <ViewRow label="严重程度" value={viewing.severity} />
              <div className="flex items-start gap-3">
                <div className="w-20 shrink-0 text-body-sm text-text-secondary">典型症状</div>
                <div className="flex-1 flex flex-wrap gap-1">
                  {viewing.symptoms.map((s) => <span key={s} className="tag tag-muted">{s}</span>)}
                </div>
              </div>
              <ViewRow label="防控要点" value={viewing.prevent} />
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
              将删除 {pendingDelete?.length ?? 0} 条疾病词条,删除后不可恢复。
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

function SymptomTags({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || value.includes(v)) { setDraft(""); return; }
    onChange([...value, v]);
    setDraft("");
  };
  const remove = (s: string) => onChange(value.filter((x) => x !== s));
  return (
    <div className="rounded-md border border-input bg-background px-2 py-2 min-h-[40px] flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
      {value.map((s) => (
        <span key={s} className="inline-flex items-center gap-1 rounded-md bg-brand-subtle text-primary text-body-sm px-2 py-0.5">
          {s}
          <button type="button" onClick={() => remove(s)} className="hover:text-[var(--state-danger)]" aria-label={`移除 ${s}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          else if (e.key === "Backspace" && !draft && value.length) { onChange(value.slice(0, -1)); }
        }}
        onBlur={add}
        placeholder={value.length ? "" : "输入症状后回车添加"}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-body-sm placeholder:text-text-tertiary"
      />
    </div>
  );
}
