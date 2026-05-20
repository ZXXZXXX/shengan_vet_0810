import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Home, Beef, Lock, ChevronRight, Activity, Pill } from "lucide-react";
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

type Animal = {
  id: string;
  sex: "公" | "母";
  breed: string;
  health: "健康" | "观察中" | "异常";
  treating: boolean;
  workKind: "健康" | "修蹄" | "免疫" | "普检";
  owner: string;
};

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

  // mock 需处理牛只
  const animals: Animal[] = [
    { id: "A2381", sex: "母", breed: "荷斯坦", health: "异常", treating: true, workKind: "健康", owner: "李雨晴" },
    { id: "A2298", sex: "母", breed: "荷斯坦", health: "观察中", treating: true, workKind: "健康", owner: "李雨晴" },
    { id: "A2150", sex: "母", breed: "荷斯坦", health: "观察中", treating: false, workKind: "修蹄", owner: "张师傅" },
    { id: "A2270", sex: "母", breed: "荷斯坦", health: "观察中", treating: false, workKind: "修蹄", owner: "张师傅" },
    { id: "A2324", sex: "母", breed: "西门塔尔", health: "观察中", treating: false, workKind: "普检", owner: "王建国" },
    { id: "A2401", sex: "公", breed: "荷斯坦", health: "健康", treating: false, workKind: "免疫", owner: "周凯" },
  ];

  // 优先展示能负责的
  // 仅返回当前账号可负责的牛只
  const visible = animals.filter((a) => a.owner === me);

  return (
    <MobileShell title={`牛舍 · ${barn.name}`} back hideTabBar>
      <div className="pb-10">
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

        {/* 需处理牛只 */}
        <section className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground">需处理牛只</h3>
            <span className="text-caption text-text-tertiary">
              {me}（{roleLabel[role]}）· 共 {visible.length} 头
            </span>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
              <div className="text-body-sm text-text-tertiary">暂无您负责的待处理牛只</div>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((a) => (
                <Link
                  key={a.id}
                  to="/m/animals/$id"
                  params={{ id: a.id }}
                  className="block rounded-xl border bg-card border-border p-3 flex items-center gap-3 active:bg-surface-subtle"
                >
                  <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary flex items-center justify-center">
                    <Beef className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-body-sm text-foreground">#{a.id}</span>
                      <span className="tag tag-muted">{a.sex} · {a.breed}</span>
                      <HealthTag health={a.health} />
                      {a.treating && (
                        <span className="inline-flex items-center gap-0.5 h-5 px-1.5 rounded text-caption bg-[var(--state-warning)]/12 text-[var(--state-warning)]">
                          <Pill className="h-3 w-3" /> 治疗中
                        </span>
                      )}
                    </div>
                    <div className="text-caption text-text-tertiary mt-1">
                      待处理：<span className="text-text-secondary">{a.workKind}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-tertiary" />
                </Link>
              ))}
            </div>
          )}
        </section>
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

function HealthTag({ health }: { health: Animal["health"] }) {
  const tone =
    health === "异常"
      ? "bg-[var(--state-danger)]/12 text-[var(--state-danger)]"
      : health === "观察中"
      ? "bg-[var(--state-warning)]/12 text-[var(--state-warning)]"
      : "bg-[var(--state-success)]/12 text-[var(--state-success)]";
  return (
    <span className={`inline-flex items-center gap-0.5 h-5 px-1.5 rounded text-caption ${tone}`}>
      <Activity className="h-3 w-3" />
      {health}
    </span>
  );
}
