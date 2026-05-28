import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole } from "@/lib/mobile-role";
import { ExecuteTab } from "./m.health.$id";

export const Route = createFileRoute("/m/health/$id/execute")({
  head: () => ({ meta: [{ title: "执行记录 · 奇点智牧" }] }),
  component: ExecuteRecordPage,
});

function ExecuteRecordPage() {
  const { id } = useParams({ from: "/m/health/$id/execute" });
  const role = useRole();
  const navigate = useNavigate();

  const isLoss = id.startsWith("LS");
  const isHoof = !isLoss && (role === "hoof_trimmer" || id.startsWith("HF"));

  const singleEarMap: Record<string, string> = {
    "WO-2298": "#A2298",
    "HF-0702": "#A2150",
    "HF-0688": "#A2270",
  };
  const singleEar = singleEarMap[id];
  const isSingle = isHoof || Boolean(singleEar);
  const earTag = singleEar ?? (isHoof ? "#A2150" : "#A2381");
  const execTags: string[] = isSingle ? [earTag] : ["#A2381", "#A2382", "#A2383"];
  const pickupCode = isLoss ? null : `PK-${id.replace(/^WO-?/i, "")}`;

  return (
    <MobileShell
      title="执行记录"
      back={{ to: "/m/health/$id" as string }}
      hideTabBar
    >
      <div className="pb-28">
        <div className="px-4 pt-3 pb-2">
          <div className="text-caption text-text-tertiary">
            工单 <span className="font-mono text-text-secondary">{id}</span>
          </div>
        </div>
        <div className="px-4 space-y-3">
          <ExecuteTab status="进行中" pickupCode={pickupCode} tags={execTags} />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.success("已保存");
            }}
            className="flex-1 h-11 rounded-lg border border-border text-body text-text-secondary"
          >
            保存
          </button>
          <button
            onClick={() => {
              toast.success("提交成功");
              navigate({ to: "/m/health" });
            }}
            className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
          >
            <Send className="h-4 w-4" /> 提交记录
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
