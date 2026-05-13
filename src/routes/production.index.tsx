import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Beef,
  Search,
  Filter,
  Plus,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Building2,
  Home,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

export const Route = createFileRoute("/production/")({
  head: () => ({
    meta: [
      { title: "对象档案 — 奇点智牧" },
      { name: "description", content: "生产对象档案列表" },
    ],
  }),
  component: ObjectListPage,
});

type Barn = { id: string; name: string };
type Farm = { id: string; name: string; barns: Barn[] };

const initialFarms: Farm[] = [
  {
    id: "farm-1",
    name: "1 号牧场",
    barns: [
      { id: "b-1", name: "1 号牛舍" },
      { id: "b-2", name: "2 号牛舍" },
      { id: "b-iso", name: "隔离区" },
    ],
  },
  {
    id: "farm-2",
    name: "2 号牧场",
    barns: [
      { id: "b-3", name: "3 号牛舍" },
      { id: "b-dry", name: "干奶舍" },
    ],
  },
  {
    id: "farm-3",
    name: "3 号牧场",
    barns: [{ id: "b-calf-a", name: "犊牛舍 A" }],
  },
];

type Animal = {
  id: string;
  breed: string;
  age: string;
  barn: string;
  stage: string;
  status: string;
  health: number; // 0-5
  lastCheck: string;
  alert: string | null;
};

const animals: Animal[] = [
  { id: "A2381", breed: "荷斯坦", age: "3 岁 4 月", barn: "3 号牛舍", stage: "成母牛", status: "观察中", health: 3.6, lastCheck: "2026-05-09", alert: "体温异常" },
  { id: "A2105", breed: "荷斯坦", age: "4 岁 1 月", barn: "1 号牛舍", stage: "成母牛", status: "健康", health: 4.8, lastCheck: "2026-05-10", alert: null },
  { id: "A2456", breed: "西门塔尔", age: "2 岁 9 月", barn: "2 号牛舍", stage: "青年", status: "健康", health: 4.6, lastCheck: "2026-05-11", alert: null },
  { id: "A2298", breed: "荷斯坦", age: "5 岁 2 月", barn: "1 号牛舍", stage: "成母牛", status: "治疗中", health: 2.9, lastCheck: "2026-05-08", alert: "乳房炎复查" },
  { id: "A2502", breed: "西门塔尔", age: "1 岁 8 月", barn: "犊牛舍 A", stage: "犊牛", status: "健康", health: 4.7, lastCheck: "2026-05-11", alert: null },
  { id: "A2178", breed: "荷斯坦", age: "3 岁 11 月", barn: "2 号牛舍", stage: "成母牛", status: "健康", health: 4.5, lastCheck: "2026-05-10", alert: null },
  { id: "A2611", breed: "荷斯坦", age: "干奶期 32 天", barn: "干奶舍", stage: "干奶", status: "健康", health: 4.4, lastCheck: "2026-05-09", alert: null },
  { id: "A2324", breed: "荷斯坦", age: "2 岁 1 月", barn: "2 号牛舍", stage: "青年", status: "观察中", health: 3.8, lastCheck: "2026-05-09", alert: "采食量下降" },
  { id: "A2087", breed: "西门塔尔", age: "6 岁", barn: "1 号牛舍", stage: "成母牛", status: "健康", health: 4.6, lastCheck: "2026-05-11", alert: null },
  { id: "A2733", breed: "荷斯坦", age: "3 岁", barn: "3 号牛舍", stage: "成母牛", status: "健康", health: 4.3, lastCheck: "2026-05-10", alert: null },
];

function statusTag(s: string) {
  if (s === "健康") return "tag tag-success";
  if (s === "观察中") return "tag tag-warning";
  return "tag tag-danger";
}

function HealthBars({ score }: { score: number }) {
  const rounded = Math.round(score);
  const tone =
    rounded >= 4
      ? "bg-[var(--state-success)]"
      : rounded >= 3
      ? "bg-[var(--state-warning)]"
      : "bg-[var(--state-danger)]";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1 w-4 rounded-full ${i <= rounded ? tone : "bg-border"}`}
        />
      ))}
    </div>
  );
}

type EditState =
  | { kind: "farm-add" }
  | { kind: "farm-rename"; farmId: string; current: string }
  | { kind: "barn-add"; farmId: string }
  | { kind: "barn-rename"; farmId: string; barnId: string; current: string };

type DeleteState =
  | { kind: "farm"; farmId: string; name: string }
  | { kind: "barn"; farmId: string; barnId: string; name: string };

function ObjectListPage() {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(initialFarms.map((f) => f.id))
  );
  const [activeBarn, setActiveBarn] = useState<string>(initialFarms[0].barns[0].name);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [editValue, setEditValue] = useState("");
  const [del, setDel] = useState<DeleteState | null>(null);

  const list = animals.filter((a) => a.barn === activeBarn);
  const totalBarns = useMemo(
    () => farms.reduce((s, f) => s + f.barns.length, 0),
    [farms]
  );

  const barnCount = (name: string) => animals.filter((a) => a.barn === name).length;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openEdit = (s: EditState) => {
    setEdit(s);
    setEditValue(
      s.kind === "farm-rename" || s.kind === "barn-rename" ? s.current : ""
    );
  };

  const submitEdit = () => {
    const v = editValue.trim();
    if (!v || !edit) return;
    setFarms((prev) => {
      if (edit.kind === "farm-add") {
        return [...prev, { id: `farm-${Date.now()}`, name: v, barns: [] }];
      }
      if (edit.kind === "farm-rename") {
        return prev.map((f) => (f.id === edit.farmId ? { ...f, name: v } : f));
      }
      if (edit.kind === "barn-add") {
        return prev.map((f) =>
          f.id === edit.farmId
            ? { ...f, barns: [...f.barns, { id: `b-${Date.now()}`, name: v }] }
            : f
        );
      }
      // barn-rename
      return prev.map((f) =>
        f.id === edit.farmId
          ? {
              ...f,
              barns: f.barns.map((b) =>
                b.id === edit.barnId ? { ...b, name: v } : b
              ),
            }
          : f
      );
    });
    if (edit.kind === "barn-rename" && activeBarn === edit.current) {
      setActiveBarn(v);
    }
    setEdit(null);
  };

  const submitDelete = () => {
    if (!del) return;
    setFarms((prev) => {
      if (del.kind === "farm") return prev.filter((f) => f.id !== del.farmId);
      return prev.map((f) =>
        f.id === del.farmId
          ? { ...f, barns: f.barns.filter((b) => b.id !== del.barnId) }
          : f
      );
    });
    if (del.kind === "barn" && activeBarn === del.name) {
      const remaining = farms.flatMap((f) => f.barns).filter((b) => b.name !== del.name);
      if (remaining[0]) setActiveBarn(remaining[0].name);
    }
    setDel(null);
  };

  return (
    <>
      <AppHeader title="对象档案" breadcrumb={["生产对象", "对象档案"]} />
      <main className="flex-1 px-6 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* 左：牧场 / 牛舍树 */}
          <Card className="col-span-3 border-border bg-card overflow-hidden h-fit">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" strokeWidth={1.75} />
              <h3 className="text-card-title text-foreground">牧场 / 牛舍</h3>
              <span className="ml-auto tag tag-muted">
                {farms.length} · {totalBarns}
              </span>
            </div>
            <div className="px-2 py-1.5 border-b border-border bg-surface-subtle/40 flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 text-text-tertiary" />
              <span className="text-caption text-text-tertiary flex-1">
                牧场与架构管理双向同步
              </span>
            </div>
            <div className="py-2">
              {farms.map((f) => {
                const open = expanded.has(f.id);
                return (
                  <div key={f.id} className="select-none">
                    {/* 牧场行 */}
                    <div className="group relative flex items-center gap-1 px-2 py-2 hover:bg-[var(--sidebar-hover,var(--bg-surface-subtle))]">
                      <button
                        onClick={() => toggle(f.id)}
                        className="h-5 w-5 inline-flex items-center justify-center text-text-tertiary hover:text-foreground"
                      >
                        {open ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Building2 className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                      <span className="text-body text-foreground flex-1 truncate">
                        {f.name}
                      </span>
                      <span className="text-caption text-text-tertiary tabular-nums opacity-100 group-hover:opacity-0 transition-opacity">
                        {f.barns.length}
                      </span>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-[var(--sidebar-hover,var(--bg-surface-subtle))] pl-3 pr-1 py-0.5 shadow-sm before:content-[''] before:absolute before:-left-4 before:top-0 before:bottom-0 before:w-4 before:bg-gradient-to-r before:from-transparent before:to-[var(--sidebar-hover,var(--bg-surface-subtle))] before:pointer-events-none">
                        <IconBtn
                          title="新增牛舍"
                          onClick={() => {
                            setExpanded((p) => new Set(p).add(f.id));
                            openEdit({ kind: "barn-add", farmId: f.id });
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </IconBtn>
                        <IconBtn
                          title="重命名牧场"
                          onClick={() =>
                            openEdit({ kind: "farm-rename", farmId: f.id, current: f.name })
                          }
                        >
                          <Pencil className="h-3 w-3" />
                        </IconBtn>
                        <IconBtn
                          title="删除牧场"
                          danger
                          onClick={() => setDel({ kind: "farm", farmId: f.id, name: f.name })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </IconBtn>
                      </div>
                    </div>

                    {/* 牛舍子节点 */}
                    {open && (
                      <div className="pb-1">
                        {f.barns.length === 0 && (
                          <div className="pl-10 py-1.5 text-caption text-text-tertiary">
                            暂无牛舍
                          </div>
                        )}
                        {f.barns.map((b) => {
                          const active = b.name === activeBarn;
                          return (
                            <div
                              key={b.id}
                              className={`group relative flex items-center gap-1 pl-10 pr-2 py-1.5 cursor-pointer transition-colors ${
                                active
                                  ? "bg-brand-subtle text-primary"
                                  : "text-text-secondary hover:bg-[var(--sidebar-hover,var(--bg-surface-subtle))]"
                              }`}
                              onClick={() => setActiveBarn(b.name)}
                            >
                              {active && (
                                <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r bg-primary" />
                              )}
                              <span className="text-body-sm flex-1 truncate">{b.name}</span>
                              <span className="text-caption text-text-tertiary tabular-nums opacity-100 group-hover:opacity-0 transition-opacity">
                                {barnCount(b.name)}
                              </span>
                              <div className="absolute right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconBtn
                                  title="重命名牛舍"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEdit({
                                      kind: "barn-rename",
                                      farmId: f.id,
                                      barnId: b.id,
                                      current: b.name,
                                    });
                                  }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </IconBtn>
                                <IconBtn
                                  title="删除牛舍"
                                  danger
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDel({
                                      kind: "barn",
                                      farmId: f.id,
                                      barnId: b.id,
                                      name: b.name,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </IconBtn>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={() => openEdit({ kind: "farm-add" })}
                className="mt-1 mx-2 mb-1 w-[calc(100%-1rem)] flex items-center justify-center gap-1 px-2 py-2 rounded border border-dashed border-border text-body-sm text-text-tertiary hover:text-primary hover:border-primary hover:bg-brand-subtle/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> 新增牧场
              </button>
            </div>
          </Card>

          {/* 右：牛只列表 */}
          <div className="col-span-9 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                  <Input
                    placeholder="按编号 / 品种搜索"
                    className="h-9 w-64 pl-9 text-body-sm bg-card border-border"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="h-9 w-[120px] text-body-sm bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部品种</SelectItem>
                    <SelectItem value="holstein">荷斯坦</SelectItem>
                    <SelectItem value="simmental">西门塔尔</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="h-9 w-[120px] text-body-sm bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部阶段</SelectItem>
                    <SelectItem value="calf">犊牛</SelectItem>
                    <SelectItem value="young">青年</SelectItem>
                    <SelectItem value="mature">成母牛</SelectItem>
                    <SelectItem value="dry">干奶</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-body-sm font-normal">
                  <Filter className="h-3.5 w-3.5" /> 高级筛选
                </Button>
              </div>
              <Button
                size="sm"
                className="h-9 gap-1.5 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground ml-auto"
              >
                <Plus className="h-3.5 w-3.5" /> 新建档案
              </Button>
            </div>

            <Card className="border-border bg-card overflow-hidden">
              <div className="px-6 h-12 flex items-center justify-between border-b border-border bg-surface-subtle">
                <div className="text-body text-foreground">
                  {activeBarn}
                  <span className="ml-2 text-caption text-text-tertiary tabular-nums">
                    共 {list.length} 头
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-header text-text-secondary border-b border-border">
                <div className="col-span-2">编号</div>
                <div className="col-span-2">品种 / 月龄</div>
                <div className="col-span-2">阶段</div>
                <div className="col-span-2">状态</div>
                <div className="col-span-3">健康指数</div>
                <div className="col-span-1 text-right">操作</div>
              </div>
              {list.length === 0 && (
                <div className="px-6 py-12 text-center text-body-sm text-text-tertiary">
                  当前牛舍暂无档案
                </div>
              )}
              {list.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-12 gap-3 px-6 h-12 items-center text-table-cell border-b border-border last:border-0 hover:bg-surface-subtle transition-colors relative"
                >
                  {a.alert && (
                    <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-[var(--state-danger)]" />
                  )}
                  <div className="col-span-2 flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-md bg-brand-subtle flex items-center justify-center">
                      <Beef className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                    </div>
                    <div className="font-mono text-body text-foreground">#{a.id}</div>
                  </div>
                  <div className="col-span-2 leading-tight">
                    <div className="text-body text-foreground">{a.breed}</div>
                    <div className="text-caption text-text-tertiary">{a.age}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="tag tag-muted">{a.stage}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={statusTag(a.status)}>{a.status}</span>
                  </div>
                  <div className="col-span-3">
                    <HealthBars score={a.health} />
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-body-sm font-normal text-primary hover:bg-brand-subtle hover:text-primary gap-0.5"
                    >
                      详情 <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </main>

      {/* 新增 / 重命名 弹窗 */}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {edit?.kind === "farm-add" && "新增牧场"}
              {edit?.kind === "farm-rename" && "重命名牧场"}
              {edit?.kind === "barn-add" && "新增牛舍"}
              {edit?.kind === "barn-rename" && "重命名牛舍"}
            </DialogTitle>
            {(edit?.kind === "farm-add" || edit?.kind === "farm-rename") && (
              <DialogDescription>
                牧场信息将与「架构管理」双向同步。
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-body-sm">
              名称
            </Label>
            <Input
              id="edit-name"
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitEdit()}
              placeholder={
                edit?.kind?.startsWith("farm") ? "请输入牧场名称" : "请输入牛舍名称"
              }
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEdit(null)}>
              取消
            </Button>
            <Button
              className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
              onClick={submitEdit}
              disabled={!editValue.trim()}
            >
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认删除{del?.kind === "farm" ? "牧场" : "牛舍"}「{del?.name}」？
            </AlertDialogTitle>
            <AlertDialogDescription>
              {del?.kind === "farm"
                ? "删除牧场将同时移除其下所有牛舍，且会同步至架构管理，操作不可撤销。"
                : "删除后该牛舍下的牛只档案需要重新分配，操作不可撤销。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--state-danger)] hover:bg-[var(--state-danger)]/90 text-white"
              onClick={submitDelete}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`h-5 w-5 inline-flex items-center justify-center rounded transition-colors ${
        danger
          ? "text-text-tertiary hover:text-[var(--state-danger)] hover:bg-[var(--state-danger)]/10"
          : "text-text-tertiary hover:text-primary hover:bg-brand-subtle"
      }`}
    >
      {children}
    </button>
  );
}
