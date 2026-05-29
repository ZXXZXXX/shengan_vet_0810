import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  Beef,
  PlayCircle,
  ClipboardPlus,
  ChevronRight,
  Activity,
  Pill,
  Clock,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useRole, roleLabel } from "@/lib/mobile-role";

export const Route = createFileRoute("/m/animals/$id")({
  head: () => ({ meta: [{ title: "牛只详情 · 奇点智牧" }] }),
  component: AnimalDetailPage,
});

// 模拟当前扫码人姓名（根据角色）
const roleToName: Record<string, string> = {
  admin: "管理员",
  vet: "李雨晴",
  manager: "王场长",
  vet_assistant: "周凯",
  immunizer: "赵敏",
  hoof_trimmer: "张师傅",
};

function AnimalDetailPage() {
  const { id } = useParams({ from: "/m/animals/$id" });
  const role = useRole();
  const me = roleToName[role] ?? "我";

  // mock 牛只摘要
  const a = {
    id,
    barn: "3 号牛舍",
    breed: "荷斯坦",
    sex: "母",
    ageMonths: 40,
    health: "观察中" as "健康" | "观察中" | "异常",
    treating: true,
    withdrawalDays: 3, // 0 表示无休药期
  };

  // mock 执行中工作
  const orders = [
    {
      id: "WO-2026-0518",
      kind: "健康",
      type: "疾病治疗",
      event: "持续高烧 39.6℃",
      owner: "李雨晴",
    },
    {
      id: "WO-2026-0521",
      kind: "修蹄",
      type: "趾间皮炎处置",
      event: "右后蹄清创修蹄",
      owner: "张师傅",
    },
  ];

  return (
    <MobileShell title={`#${a.id}`} back hideTabBar>
      <div className="pb-28">
        {/* 头部：耳号 + 摘要 */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 p-5 text-primary-foreground relative overflow-hidden">
            <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Beef className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-caption opacity-85">耳号</div>
                <div className="text-section-title font-mono">#{a.id}</div>
              </div>
              <span
                className={`ml-auto h-8 px-3 rounded-full inline-flex items-center text-body-sm font-medium ${
                  a.health === "异常"
                    ? "bg-[#FFE4E1] text-[#D9534F]"
                    : a.health === "观察中"
                    ? "bg-[#FFF7D6] text-[#B8860B]"
                    : "bg-[#E8F5E9] text-[#2E7D32]"
                }`}
              >
                <Activity className="h-3.5 w-3.5 mr-1" />
                {a.health}
              </span>
            </div>

            <div className="relative mt-4 grid grid-cols-2 gap-2 text-caption">
              <Brief label="牛舍" value={a.barn} />
              <Brief
                label="品种 / 性别 / 月龄"
                value={`${a.breed} · ${a.sex} · ${a.ageMonths}月`}
              />
            </div>
          </div>
        </div>

        {/* 状态标签 */}
        <section className="px-4 mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-body-sm font-medium border ${
              a.treating
                ? "bg-[#FFF7D6] text-[#B8860B] border-[#F5D76E]"
                : "bg-surface-subtle text-text-tertiary border-border"
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            {a.treating ? "治疗中" : "未治疗"}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-body-sm font-medium border ${
              a.withdrawalDays > 0
                ? "bg-[#FFE4E1] text-[#D9534F] border-[#F5B7B1]"
                : "bg-surface-subtle text-text-tertiary border-border"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {a.withdrawalDays > 0
              ? `休药期 · 剩 ${a.withdrawalDays} 天`
              : "非休药期"}
          </span>
        </section>

        {/* 执行中工作 */}
        <section className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground">执行中工作</h3>
            <span className="text-caption text-text-tertiary">
              当前扫码人：{me}（{roleLabel[role]}）
            </span>
          </div>

          {(() => {
            const mineOrders = orders.filter((o) => o.owner === me);
            if (mineOrders.length === 0) {
              return (
                <div className="rounded-xl bg-card border border-dashed border-border p-6 text-center">
                  <div className="text-body-sm text-text-tertiary">暂无您负责的执行中工作</div>
                </div>
              );
            }
            return (
              <div className="space-y-2">
                {mineOrders.map((o) => (
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
                        <span className="tag tag-muted">{o.kind}</span>
                      </div>
                      <div className="text-caption text-text-tertiary mt-0.5 truncate">
                        {o.type} · {o.event}
                      </div>
                      <div className="text-caption text-text-tertiary mt-0.5">
                        负责人：{o.owner}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-tertiary" />
                  </Link>
                ))}
              </div>
            );
          })()}
        </section>

        {/* 个体用药记录 */}
        <section className="px-4 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-card-title text-foreground">用药记录</h3>
            <span className="text-caption text-text-tertiary">近 90 天</span>
          </div>
          {(() => {
            const meds = [
              {
                id: "M-0518-1",
                date: "2026-05-18",
                drug: "氟尼辛葡甲胺注射液",
                dose: "2ml / 次 · 肌肉注射",
                course: "共 3 天 · 第 1 天",
                operator: "李雨晴",
                orderId: "WO-2026-0518",
                withdrawal: 3,
              },
              {
                id: "M-0518-2",
                date: "2026-05-18",
                drug: "头孢噻呋钠",
                dose: "1g / 次 · 肌肉注射",
                course: "共 3 天 · 第 1 天",
                operator: "李雨晴",
                orderId: "WO-2026-0518",
                withdrawal: 4,
              },
              {
                id: "M-0421",
                date: "2026-04-21",
                drug: "伊维菌素注射液",
                dose: "1ml / 50kg · 皮下注射",
                course: "单次驱虫",
                operator: "周凯",
                orderId: "DW-2026-0421",
                withdrawal: 0,
              },
            ];
            return (
              <ul className="space-y-2">
                {meds.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-xl border border-border bg-card p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary flex items-center justify-center shrink-0">
                        <Pill className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-body-sm text-foreground truncate">
                            {m.drug}
                          </div>
                          <span className="text-caption text-text-tertiary font-mono shrink-0">
                            {m.date}
                          </span>
                        </div>
                        <div className="text-caption text-text-tertiary mt-0.5 truncate">
                          {m.dose} · {m.course}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="text-caption text-text-tertiary">
                            操作人 {m.operator} ·{" "}
                            <span className="font-mono">{m.orderId}</span>
                          </div>
                          {m.withdrawal > 0 ? (
                            <span className="inline-flex items-center h-5 px-2 rounded-full text-caption bg-[#FFE4E1] text-[#D9534F]">
                              休药 {m.withdrawal} 天
                            </span>
                          ) : (
                            <span className="inline-flex items-center h-5 px-2 rounded-full text-caption bg-surface-subtle text-text-tertiary">
                              无休药期
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </section>
      </div>

      {/* 底部固定：疾病上报入口 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-card border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Link
          to="/m/report"
          search={{ target: a.id, barn: a.barn, lock: 1 } as never}
          className="w-full h-12 rounded-lg bg-primary text-primary-foreground text-body inline-flex items-center justify-center gap-1.5"
        >
          <ClipboardPlus className="h-4 w-4" /> 疾病上报
        </Link>
      </div>
    </MobileShell>
  );
}

function Brief({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/15 backdrop-blur border border-white/15 px-3 py-2">
      <div className="text-caption opacity-85">{label}</div>
      <div className="text-body-sm mt-0.5 truncate">{value}</div>
    </div>
  );
}
