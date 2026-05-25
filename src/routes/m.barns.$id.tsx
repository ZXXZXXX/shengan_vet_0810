import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  Home,
  PlayCircle,
  ChevronRight,
  ClipboardPlus,
  Stethoscope,
  Footprints,
  Syringe,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole, roleLabel } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/barns/$id")({
  head: () => ({ meta: [{ title: "牛舍详情 · 奇点智牧" }] }),
  component: BarnDetailPage,
});

const roleToName: Record<string, string> = {
  admin: "管理员",
  vet: "李雨晴",
  manager: "王场长",
  vet_assistant: "周凯",
  hoof_trimmer: "张师傅",
};

type WO = {
  id: string;
  target: string;
  kind: "健康" | "疾病治疗" | "免疫";
  type: string;
  event: string;
  owner: string;
};

const kindIcon = {
  健康: Stethoscope,
  修蹄: Footprints,
  免疫: Syringe,
} as const;

function BarnDetailPage() {
  const { id } = useParams({ from: "/m/barns/$id" });
  const role = useRole();
  const me = roleToName[role] ?? "我";

  // mock 牛舍基础信息
  const barn = {
    code: id,
    name: "3 号牛舍",
    farm: "华北一牧场",
    type: "成母牛舍",
    stock: 186,
  };

  // mock 该牛舍内全部待执行工作（不区分负责人）
  const all: WO[] = [
    { id: "WO-2381", target: "#A2381", kind: "健康", type: "疾病治疗", event: "持续高烧 39.6℃", owner: "李雨晴" },
    { id: "WO-2298", target: "#A2298", kind: "健康", type: "疾病治疗", event: "乳房炎复诊", owner: "李雨晴" },
    { id: "HF-0702", target: "#A2150", kind: "修蹄", type: "趾间皮炎处置", event: "右后蹄清创", owner: "张师傅" },
    { id: "HF-0688", target: "#A2270", kind: "修蹄", type: "蹄底溃疡", event: "处置 + 包蹄", owner: "张师傅" },
    { id: "WO-2401", target: "犊牛舍 A", kind: "免疫", type: "口蹄疫加强", event: "批次免疫", owner: "周凯" },
  ];

  // 仅返回当前账号负责的工作
  const mine = all.filter((o) => o.owner === me);

  return (
    <MobileShell title={`牛舍 · ${barn.name}`} back hideTabBar>
      <div className="pb-28">
        {/* 头图 + 基础信息 */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Home className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-caption opacity-85">牛舍编码 · {barn.code}</div>
                <div className="text-section-title">{barn.name}</div>
              </div>
              <span className="ml-auto h-7 px-2.5 rounded-full bg-white/15 backdrop-blur inline-flex items-center text-caption">
                {barn.type}
              </span>
            </div>
            <div className="relative mt-4 grid grid-cols-3 gap-2">
              <Stat label="所属牧场" value={barn.farm} />
              <Stat label="牛舍类型" value={barn.type} />
              <Stat label="当前存栏" value={`${barn.stock} 头`} highlight />
            </div>
          </div>
        </div>

        {/* 我的待执行工作 */}
        <section className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground">我的待执行工作</h3>
            <span className="text-caption text-text-tertiary">
              {me}（{roleLabel[role]}）· {mine.length} 项
            </span>
          </div>

          {mine.length === 0 ? (
            <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
              <div className="text-body-sm text-text-tertiary">本牛舍暂无您负责的待执行工作</div>
              <div className="text-caption text-text-tertiary mt-1">
                可直接通过下方「健康上报」记录异常
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {mine.map((o) => {
                const KIcon = kindIcon[o.kind];
                return (
                  <Link
                    key={o.id}
                    to="/m/health/$id"
                    params={{ id: o.id }}
                    className="block rounded-xl border bg-card border-border p-3 flex items-center gap-3 active:bg-surface-subtle"
                  >
                    <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary flex items-center justify-center">
                      <PlayCircle className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-body-sm text-foreground truncate">
                          {o.id}
                        </span>
                        <span className="tag tag-muted inline-flex items-center gap-1">
                          <KIcon className="h-3 w-3" /> {o.kind}
                        </span>
                      </div>
                      <div className="text-body-sm text-foreground mt-1 truncate">
                        {o.target} · {o.event}
                      </div>
                      <div className="text-caption text-text-tertiary mt-0.5 truncate">
                        {o.type}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-tertiary" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 底部固定：健康上报入口（带牛舍） */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Link
          to="/m/report"
          search={{ barn: barn.name, lock: 1 } as never}
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
        >
          <ClipboardPlus className="h-4 w-4" /> 健康上报
        </Link>
      </div>
    </MobileShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-white/15 backdrop-blur border border-white/15 px-3 py-2">
      <div className="text-caption opacity-85">{label}</div>
      <div className={`mt-0.5 truncate ${highlight ? "text-card-title tabular-nums" : "text-body-sm"}`}>
        {value}
      </div>
    </div>
  );
}
