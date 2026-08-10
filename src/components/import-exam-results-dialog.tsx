import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileSpreadsheet, X, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Result = { total: number; success: number; failed: number };

const ITEMS = ["尿液 PH 值", "酮病检测", "孕检", "体温", "子宫分泌物"];

export function ImportExamResultsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [item, setItem] = useState(ITEMS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setImporting(false);
    setDragging(false);
  };

  const pick = (f?: File | null) => {
    if (!f) return;
    setFile(f);
    setResult(null);
  };

  const submit = () => {
    if (!file) return;
    setImporting(true);
    setTimeout(() => {
      const total = 128;
      const failed = 3;
      setResult({ total, success: total - failed, failed });
      setImporting(false);
      toast.success(`已批量更新 ${total - failed} 头牛只的检测结果`);
    }, 900);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-card-title">导入检测结果</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="text-body-sm text-text-secondary">检测项目</div>
            <Select value={item} onValueChange={setItem}>
              <SelectTrigger className="h-9 text-body-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS.map((i) => (
                  <SelectItem key={i} value={i} className="text-body-sm">
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="text-body-sm text-text-secondary">上传文件</div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-body-sm text-primary hover:underline"
                onClick={() => toast.info("模板已开始下载")}
              >
                <Download className="h-3.5 w-3.5" /> 下载模板
              </button>
            </div>

            {!file ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pick(e.dataTransfer.files?.[0]);
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 transition-colors cursor-pointer ${
                  dragging ? "border-primary bg-brand-subtle" : "border-border bg-surface-subtle hover:border-primary"
                }`}
              >
                <UploadCloud className="h-6 w-6 text-primary" />
                <div className="text-body-sm text-foreground">点击或拖拽文件到此处上传</div>
                <div className="text-caption text-text-tertiary">支持 .xlsx / .xls / .csv，单个文件不超过 20MB</div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-2.5">
                <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-body-sm text-foreground truncate">{file.name}</div>
                  <div className="text-caption text-text-tertiary">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <button type="button" className="text-text-tertiary hover:text-foreground" onClick={() => reset()} aria-label="移除文件">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>

          {result && (
            <div className="rounded-lg border border-border p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-body-sm text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                导入完成：共 {result.total} 条，成功 {result.success} 条
              </div>
              {result.failed > 0 && (
                <div className="flex items-center gap-1.5 text-body-sm text-[var(--state-danger)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {result.failed} 条失败（耳号未匹配到档案）
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="h-9 text-body-sm font-normal" onClick={() => onOpenChange(false)}>
            {result ? "关闭" : "取消"}
          </Button>
          <Button
            size="sm"
            disabled={!file || importing || !!result}
            className="h-9 text-body-sm font-normal bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
            onClick={submit}
          >
            {importing ? "导入中…" : "开始导入"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
