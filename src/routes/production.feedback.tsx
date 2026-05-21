import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  MessageCircleWarning,
  Check,
  PenLine,
  FileSearch,
  Ban,
  GitFork,
  Link2,
  Mic,
  Video,
  FileText,
  ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/production/feedback")({
  head: () => ({ meta: [{ title: "反馈处理 — 奇点智牧" }] }),
  component: FeedbackPage,
});

type FBStatus = "待处理" | "已知悉" | "要求补充" | "重新编辑" | "已终止" | "终止后新建";

type Feedback = {
  id: string;
  workOrderId: string;
  kind: "健康" | "修蹄" | "免疫" | "干奶" | "驱虫" | "普修" | "复查" | "产后护理";
  target: string;
  barn: string;
  reporter: string; // 反馈提交者（执行者）
  submittedAt: string;
  tags: string[];
  content: string;
  attachments?: { type: "audio" | "video" | "text"; name: string; meta?: string }[];
  status: FBStatus;
  linkedTaskId?: string;
  remark?: string;
  remarkAt?: string;
  remarkBy?: string;
};

const initial: Feedback[] = [
  {
    id: "FB-2065",
    workOrderId: "WO-2298",
    kind: "健康",
    target: "#A2298",
    barn: "3 号牛舍",
    reporter: "李雨晴",
    submittedAt: "2026-05-20 10:18",
    tags: ["牛只状态异常"],
    content: "复诊时牛体温再次升至 39.8℃，建议追加抗生素治疗并安排隔离观察。",
    attachments: [
      { type: "video", name: "现场体温记录.mp4", meta: "00:46" },
      { type: "audio", name: "执行人语音说明.m4a", meta: "01:02" },
    ],
    status: "待处理",
  },
  {
    id: "FB-2064",
    workOrderId: "HF-0702",
    kind: "修蹄",
    target: "#A2150",
    barn: "2 号牛舍",
    reporter: "外部·张师傅",
    submittedAt: "2026-05-20 09:02",
    tags: ["操作受阻"],
    content: "现场牛只剧烈反抗，需要追加保定栏与一名助手才能完成修蹄。",
    attachments: [{ type: "text", name: "现场情况记录.txt" }],
    status: "待处理",
  },
  {
    id: "FB-2058",
    workOrderId: "WO-2415",
    kind: "健康",
    target: "#A2415",
    barn: "1 号牛舍",
    reporter: "陈晓东",
    submittedAt: "2026-05-19 16:20",
    tags: ["牛只状态异常", "其他"],
    content: "蹄叶炎症状减轻，但出现新的乳房红肿症状，建议终止当前工单并新建乳房炎处置工单。",
    status: "终止后新建",
    linkedTaskId: "WO-2418",
    remark: "原工单终止，已基于反馈新建乳房炎处置工单 WO-2418，由李雨晴接管。",
    remarkAt: "2026-05-19 17:05",
    remarkBy: "兽医·李雨晴",
  },
  {
    id: "FB-2052",
    workOrderId: "WO-2298",
    kind: "健康",
    target: "#A2298",
    barn: "3 号牛舍",
    reporter: "李雨晴",
    submittedAt: "2026-05-18 11:15",
    tags: ["环境 / 设施问题"],
    content: "隔离栏门锁损坏，临时使用绑带固定，需安排维修。",
    status: "已知悉",
    remark: "已记录设施异常并派单至基建组维护。",
    remarkAt: "2026-05-18 14:00",
    remarkBy: "场长·赵磊",
  },
];

const tabs: { key: FBStatus | "全部"; label: string }[] = [
  { key: "全部", label: "全部" },
  { key: "待处理", label: "待处理" },
  { key: "已知悉", label: "已知悉" },
  { key: "要求补充", label: "要求补充" },
  { key: "重新编辑", label: "重新编辑" },
  { key: "已终止", label: "已终止" },
  { key: "终止后新建", label: "终止后新建" },
];

const statusTone: Record<FBStatus, string> = {
  待处理: "tag tag-warning",
  已知悉: "tag tag-success",
  要求补充: "tag tag-brand",
  重新编辑: "tag tag-brand",
  已终止: "tag tag-muted",
  终止后新建: "tag tag-muted",
};

type ActionKind = "ack" | "supplement" | "edit" | "terminate" | "terminate-new";

const actionMeta: Record<ActionKind, { label: string; icon: typeof Check; tone: string }> = {
  ack: { label: "已知悉", icon: Check, tone: "text-[var(--state-success)]" },
  supplement: { label: "要求补充", icon: FileSearch, tone: "text-primary" },
  edit: { label: "重新编辑", icon: PenLine, tone: "text-primary" },
  terminate: { label: "终止 · 提前结束", icon: Ban, tone: "text-[var(--state-danger)]" },
  "terminate-new": { label: "终止后新建工单", icon: GitFork, tone: "text-[var(--state-danger)]" },
};

function FeedbackPage() {
  const [data, setData] = useState<Feedback[]>(initial);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("待处理");
  const [active, setActive] = useState<Feedback | null>(null);
  const [action, setAction] = useState<ActionKind | null>(null);
  const [remark, setRemark] = useState("");
  const [newWoId, setNewWoId] = useState("");

  const list = data.filter((f) => (tab === "全部" ? true : f.status === tab));

  const submit = () => {
    if (!active || !action) return;
    const map: Record<ActionKind, FBStatus> = {
      ack: "已知悉",
      supplement: "要求补充",
      edit: "重新编辑",
      terminate: "已终止",
      "terminate-new": "终止后新建",
    };
    setData((d) =>
      d.map((r) =>
        r.id === active.id
          ? {
              ...r,
              status: map[action],
              remark,
              remarkAt: new Date().toISOString().slice(0, 16).replace("T", " "),
              remarkBy: "兽医·李雨晴",
              linkedTaskId: action === "terminate-new" ? newWoId || "WO-NEW" : r.linkedTaskId,
            }
          : r,
      ),
    );
    setActive(null);
    setAction(null);
    setRemark("");
    setNewWoId("");
  };

  return (
    <>
      <AppHeader title="反馈处理" breadcrumb={["健康管理", "反馈处理"]} />
      <main className="flex-1 px-6 py-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <MessageCircleWarning className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="text-section-title text-foreground">反馈列表</h2>
            <span className="text-body-sm text-text-tertiary">
              来自小程序执行者的工单反馈，仅可在 PC 端处理
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`h-9 px-3 rounded-md text-body-sm transition-colors ${
                  tab === t.key
                    ? "bg-brand-subtle text-primary border border-primary/30"
                    : "bg-card border border-border text-text-secondary hover:bg-surface-subtle"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Card className="border-border bg-card overflow-hidden divide-y divide-border">
          {list.length === 0 && (
            <div className="py-16 text-center text-body-sm text-text-tertiary">
              暂无{tab === "全部" ? "" : tab}反馈
            </div>
          )}
          {list.map((f) => (
            <div key={f.id} className="px-6 py-5 hover:bg-surface-subtle transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-body-sm text-foreground">{f.id}</span>
                    <span className="text-text-tertiary text-caption">关联工单</span>
                    <Link
                      to="/production/disease"
                      className="font-mono text-body-sm text-primary hover:underline"
                    >
                      {f.workOrderId}
                    </Link>
                    <span className="tag tag-muted">{f.kind}</span>
                    <span className={statusTone[f.status]}>{f.status}</span>
                    {f.linkedTaskId && (
                      <span className="tag tag-outline inline-flex items-center gap-1">
                        <Link2 className="h-3 w-3" /> 新工单 {f.linkedTaskId}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-body text-foreground">
                    {f.target} · {f.barn} · 提交人 {f.reporter}
                  </div>
                  <div className="mt-1 text-caption text-text-tertiary">{f.submittedAt}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 h-6 rounded-full bg-surface-subtle border border-border text-caption text-text-secondary inline-flex items-center"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-body-sm text-text-secondary leading-relaxed">
                    {f.content}
                  </p>
                  {f.attachments && f.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {f.attachments.map((a, i) => {
                        const Icon =
                          a.type === "audio" ? Mic : a.type === "video" ? Video : FileText;
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2 h-7 rounded-md bg-surface-subtle border border-border text-caption text-text-secondary"
                          >
                            <Icon className="h-3 w-3" /> {a.name}
                            {a.meta && (
                              <span className="text-text-tertiary">· {a.meta}</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {f.remark && (
                    <div className="mt-3 rounded-md bg-surface-subtle border border-border px-3 py-2 text-caption text-text-secondary">
                      <span className="text-text-tertiary">处理备注 · {f.remarkBy} · {f.remarkAt}</span>
                      <div className="mt-1 text-body-sm text-foreground">{f.remark}</div>
                    </div>
                  )}
                </div>
                {f.status === "待处理" && (
                  <div className="shrink-0 flex flex-col gap-1.5 w-40">
                    {(Object.keys(actionMeta) as ActionKind[]).map((k) => {
                      const m = actionMeta[k];
                      const Icon = m.icon;
                      return (
                        <Button
                          key={k}
                          variant="outline"
                          size="sm"
                          className={`h-9 justify-start gap-1.5 text-body-sm font-normal border-border ${m.tone}`}
                          onClick={() => {
                            setActive(f);
                            setAction(k);
                            setRemark("");
                            setNewWoId("");
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" /> {m.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </Card>
      </main>

      <Dialog
        open={!!action && !!active}
        onOpenChange={(o) => {
          if (!o) {
            setActive(null);
            setAction(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2">
              {action && (() => {
                const Icon = actionMeta[action].icon;
                return <Icon className={`h-4 w-4 ${actionMeta[action].tone}`} />;
              })()}
              {action && actionMeta[action].label}
            </DialogTitle>
            <DialogDescription className="text-text-tertiary">
              {action === "ack" && "确认反馈被接受，无需调整原工单。"}
              {action === "supplement" && "请说明需要执行者补充的内容。"}
              {action === "edit" && "请说明本次工单需要调整的执行要求 / 时间 / 人员。"}
              {action === "terminate" && "原工单将提前结束，不再新建后续工单。"}
              {action === "terminate-new" &&
                "原工单结束并基于反馈新建后续处理工单，新旧工单将建立关联。"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-caption text-text-tertiary">
              反馈 {active?.id} · 关联工单 {active?.workOrderId}
            </div>
            {action === "terminate-new" && (
              <div className="space-y-2">
                <div className="text-body-sm text-foreground">新工单号</div>
                <Input
                  value={newWoId}
                  onChange={(e) => setNewWoId(e.target.value)}
                  placeholder="如 WO-2420，系统也可自动生成"
                />
                <div className="text-body-sm text-foreground">任务类型</div>
                <Select defaultValue="疾病治疗">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["疾病治疗", "免疫", "修蹄", "复查", "普修", "驱虫", "产后护理"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <div className="text-body-sm text-foreground mb-1">
                备注 <span className="text-[var(--state-danger)]">*</span>
              </div>
              <Textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="备注将写入工单，用于记录处理结果 / 终止原因 / 关联说明"
                rows={4}
              />
              <div className="mt-1 text-caption text-text-tertiary inline-flex items-center gap-1">
                <ClipboardList className="h-3 w-3" /> 处理结果将同步给执行者并在工单形成备注
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActive(null);
                setAction(null);
              }}
            >
              取消
            </Button>
            <Button
              disabled={!remark.trim() || (action === "terminate-new" && !newWoId.trim())}
              onClick={submit}
              className="bg-primary hover:bg-[var(--brand-hover)] text-primary-foreground"
            >
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
