import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/mobile-shell";
import { Baby, LogOut, Stethoscope } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/m/events/$type/$id")({
  head: () => ({ meta: [{ title: "事件记录 · 奇点智牧" }] }),
  component: EventPage,
});

function EventPage() {
  const { type, id } = useParams({ from: "/m/events/$type/$id" });
  const navigate = useNavigate();
  const done = () => navigate({ to: "/m/animals-{$id}", params: { id } });
  if (type === "calving") return <CalvingForm id={id} onDone={done} />;
  if (type === "exam") return <ExamForm id={id} onDone={done} />;
  return <LeaveForm id={id} onDone={done} />;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-body-sm text-foreground mb-1.5">
        {label}
        {required && <span className="text-[var(--state-danger)] ml-0.5">*</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full h-11 px-3 rounded-lg border border-border bg-card text-body-sm text-foreground outline-none focus:border-primary";

function CalvingForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [difficulty, setDifficulty] = useState<"顺产" | "助产" | "难产">("顺产");
  const [calfCount, setCalfCount] = useState("1");
  const [calfSex, setCalfSex] = useState<"母" | "公" | "混">("母");
  const [calfWeight, setCalfWeight] = useState("");
  const [alive, setAlive] = useState<"存活" | "死胎">("存活");
  const [note, setNote] = useState("");

  const submit = () => {
    if (!date) return toast.error("请选择产犊日期");
    if (!calfWeight) return toast.error("请输入犊牛体重");
    toast.success("产犊记录已保存");
    onDone();
  };

  return (
    <MobileShell title={`#${id} · 产犊记录`} back hideTabBar>
      <div className="pb-24">
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-[#00823F] p-4 text-primary-foreground flex items-center gap-3">
            <span className="h-11 w-11 rounded-xl bg-white/20 inline-flex items-center justify-center">
              <Baby className="h-5 w-5" />
            </span>
            <div>
              <div className="text-card-title">产犊记录</div>
              <div className="text-caption opacity-85">牛只 #{id}</div>
            </div>
          </div>
        </div>
        <div className="px-4 mt-4 space-y-4">
          <Field label="产犊日期" required>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="分娩方式" required>
            <div className="grid grid-cols-3 gap-2">
              {(["顺产", "助产", "难产"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDifficulty(k)}
                  className={`h-10 rounded-lg text-body-sm ${
                    difficulty === k
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-text-secondary"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="犊牛数量" required>
              <input type="number" min="1" value={calfCount} onChange={(e) => setCalfCount(e.target.value)} className={inputCls} />
            </Field>
            <Field label="性别" required>
              <div className="grid grid-cols-3 gap-1">
                {(["母", "公", "混"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setCalfSex(k)}
                    className={`h-11 rounded-lg text-body-sm ${
                      calfSex === k
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-text-secondary"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="犊牛体重 (kg)" required>
              <input type="number" value={calfWeight} onChange={(e) => setCalfWeight(e.target.value)} className={inputCls} />
            </Field>
            <Field label="犊牛状态" required>
              <div className="grid grid-cols-2 gap-1">
                {(["存活", "死胎"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setAlive(k)}
                    className={`h-11 rounded-lg text-body-sm ${
                      alive === k
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-text-secondary"
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field label="备注">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg border border-border bg-card text-body-sm text-foreground outline-none focus:border-primary resize-none"
              placeholder="产程时长、助产人员、异常处置等"
            />
          </Field>
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          type="button"
          onClick={submit}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-body font-semibold"
        >
          保存产犊记录
        </button>
      </div>
    </MobileShell>
  );
}

function LeaveForm({ id, onDone }: { id: string; onDone: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState<"淘汰" | "死亡" | "出售" | "转场">("淘汰");
  const [detail, setDetail] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    if (!date) return toast.error("请选择离场日期");
    if (!detail) return toast.error("请填写离场原因/详情");
    toast.success("离场记录已保存");
    onDone();
  };

  const reasons = ["淘汰", "死亡", "出售", "转场"] as const;

  return (
    <MobileShell title={`#${id} · 离场记录`} back hideTabBar>
      <div className="pb-24">
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#B75B37] to-[#8B3D1F] p-4 text-white flex items-center gap-3">
            <span className="h-11 w-11 rounded-xl bg-white/20 inline-flex items-center justify-center">
              <LogOut className="h-5 w-5" />
            </span>
            <div>
              <div className="text-card-title">离场记录</div>
              <div className="text-caption opacity-85">牛只 #{id}</div>
            </div>
          </div>
        </div>
        <div className="px-4 mt-4 space-y-4">
          <Field label="离场日期" required>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="离场类型" required>
            <div className="grid grid-cols-4 gap-2">
              {reasons.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setReason(k)}
                  className={`h-10 rounded-lg text-body-sm ${
                    reason === k
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-text-secondary"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </Field>
          <Field label={reason === "死亡" ? "死亡原因" : reason === "出售" ? "买方 / 去向" : "详情"} required>
            <input
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className={inputCls}
              placeholder={
                reason === "死亡"
                  ? "如：乳房炎并发症"
                  : reason === "出售"
                  ? "如：XX 屠宰场"
                  : reason === "转场"
                  ? "目标牧场"
                  : "淘汰原因"
              }
            />
          </Field>
          {(reason === "出售" || reason === "淘汰") && (
            <Field label="金额 (元)">
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
            </Field>
          )}
          <Field label="备注">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg border border-border bg-card text-body-sm text-foreground outline-none focus:border-primary resize-none"
              placeholder="补充说明"
            />
          </Field>
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          type="button"
          onClick={submit}
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-body font-semibold"
        >
          保存离场记录
        </button>
      </div>
    </MobileShell>
  );
}
