import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Stethoscope, Search, TrendingUp, ChevronRight, X } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { useFarm } from "@/lib/farm-store";

export const Route = createFileRoute("/m/kb_diseases")({
  head: () => ({ meta: [{ title: "疾病库 · 奇点智牧" }] }),
  component: DiseaseKBMobile,
});

type Disease = {
  id: string;
  name: string;
  cat: string;
  severity: "高" | "中" | "低";
  desc: string;
  symptoms: string[];
  prescriptions: { name: string; usage: string }[];
  recent7d: number; // 近7天发病头数
};

const DISEASES: Disease[] = [
  {
    id: "DZ-001",
    name: "乳房炎",
    cat: "繁殖系统",
    severity: "高",
    desc: "乳腺组织炎症,常由细菌感染引起,表现为乳房红肿热痛、乳汁絮状或血色,严重者全身发热、产奶骤降。",
    symptoms: ["乳房红肿", "持续高烧", "乳汁异常", "产奶量骤降"],
    prescriptions: [
      { name: "头孢噻呋钠注射液", usage: "肌注 2.2mg/kg · 日 1 次 × 3-5 天" },
      { name: "乳房灌注 头孢洛宁", usage: "患区灌注 · 每次挤奶后 1 次 × 3 天" },
    ],
    recent7d: 7,
  },
  {
    id: "DZ-002",
    name: "蹄叶炎",
    cat: "蹄部疾病",
    severity: "中",
    desc: "蹄真皮层弥漫性无菌性炎症,与高精料、产后代谢紊乱相关,表现为跛行、蹄部发热、运步困难。",
    symptoms: ["跛行", "蹄部发热", "行走困难"],
    prescriptions: [
      { name: "氟尼辛葡甲胺", usage: "静注 2.2mg/kg · 日 1 次 × 3 天" },
      { name: "局部修蹄 + 蹄垫", usage: "削薄患蹄并粘贴健蹄蹄垫" },
    ],
    recent7d: 5,
  },
  {
    id: "DZ-003",
    name: "瘤胃酸中毒",
    cat: "消化系统",
    severity: "高",
    desc: "瘤胃内乳酸快速堆积导致 pH 下降,常因突然加大精料或采食大量易发酵碳水化合物引起。",
    symptoms: ["食欲减退", "腹泻", "瘤胃运动减弱"],
    prescriptions: [
      { name: "5% 碳酸氢钠溶液", usage: "静注 500-1000ml · 缓慢" },
      { name: "瘤胃液移植", usage: "健康牛瘤胃液 4-8L 投服" },
    ],
    recent7d: 4,
  },
  {
    id: "DZ-005",
    name: "酮病",
    cat: "代谢疾病",
    severity: "中",
    desc: "围产后期能量负平衡导致血酮升高,表现为食欲下降、产奶量骤减、呼气酮味、消瘦。",
    symptoms: ["食欲减退", "产奶量骤降", "体温偏低"],
    prescriptions: [
      { name: "50% 葡萄糖", usage: "静注 500ml · 日 1-2 次" },
      { name: "丙二醇", usage: "口服 300ml · 日 2 次 × 3-5 天" },
    ],
    recent7d: 3,
  },
  {
    id: "DZ-006",
    name: "产后子宫炎",
    cat: "繁殖系统",
    severity: "中",
    desc: "产后 21 天内子宫感染,恶露异味、发热,影响后续配种。",
    symptoms: ["持续高烧", "食欲减退"],
    prescriptions: [
      { name: "头孢噻呋钠", usage: "肌注 2.2mg/kg · 日 1 次 × 5 天" },
      { name: "宫内灌注 土霉素", usage: "宫腔灌注 · 隔日 1 次 × 3 次" },
    ],
    recent7d: 2,
  },
  {
    id: "DZ-004",
    name: "口蹄疫",
    cat: "传染病",
    severity: "高",
    desc: "口蹄疫病毒引起的烈性传染病,口、蹄、乳房出现水疱与溃烂,传播极快,须立即上报隔离。",
    symptoms: ["口腔水疱", "跛行", "持续高烧"],
    prescriptions: [{ name: "对症治疗 + 强制免疫", usage: "依据当地兽医主管部门要求执行" }],
    recent7d: 0,
  },
];

function severityTone(s: string) {
  if (s === "高") return "bg-[var(--state-danger)]/12 text-[var(--state-danger)]";
  if (s === "中") return "bg-[var(--state-warning)]/20 text-[var(--state-alert)]";
  return "bg-surface-subtle text-text-secondary";
}

function DiseaseKBMobile() {
  const farm = useFarm();
  const [kw, setKw] = useState("");
  const [active, setActive] = useState<Disease | null>(null);

  const top = useMemo(() => [...DISEASES].sort((a, b) => b.recent7d - a.recent7d).slice(0, 5), []);
  const list = useMemo(() => {
    const k = kw.trim();
    if (!k) return DISEASES;
    return DISEASES.filter(
      (d) => d.name.includes(k) || d.cat.includes(k) || d.symptoms.some((s) => s.includes(k)),
    );
  }, [kw]);

  return (
    <MobileShell title="疾病库" back hideTabBar>
      <div className="px-4 pt-3 pb-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="搜索疾病 / 症状 / 分类"
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-border text-body-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary"
          />
        </div>

        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-card-title text-foreground">近 7 天高发疾病</h3>
            </div>
            <span className="text-caption text-text-tertiary">{farm.name}</span>
          </div>
          <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
            {top.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setActive(d)}
                className="w-full flex items-center gap-3 px-4 py-3 active:bg-surface-subtle text-left"
              >
                <span
                  className={`h-6 w-6 rounded-md inline-flex items-center justify-center text-[12px] font-semibold tabular-nums ${
                    i === 0
                      ? "bg-[var(--state-danger)]/12 text-[var(--state-danger)]"
                      : i === 1
                      ? "bg-[var(--state-warning)]/25 text-[var(--state-alert)]"
                      : i === 2
                      ? "bg-brand-subtle text-primary"
                      : "bg-surface-subtle text-text-secondary"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-body text-foreground truncate">{d.name}</span>
                <span className="text-caption text-text-tertiary tabular-nums">{d.recent7d} 头</span>
                <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-card-title text-foreground mb-2">全部疾病 · {list.length}</h3>
          <div className="space-y-2">
            {list.map((d) => (
              <button
                key={d.id}
                onClick={() => setActive(d)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border active:bg-surface-subtle text-left"
              >
                <span className="h-9 w-9 rounded-lg bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
                  <Stethoscope className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body text-foreground truncate">{d.name}</span>
                  </div>
                  <div className="text-caption text-text-tertiary mt-0.5 line-clamp-1">{d.cat} · {d.desc}</div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-text-tertiary shrink-0" />
              </button>
            ))}
            {list.length === 0 && (
              <div className="text-center text-caption text-text-tertiary py-8">未找到匹配的疾病</div>
            )}
          </div>
        </section>
      </div>

      {active && <DiseaseDetailSheet item={active} onClose={() => setActive(null)} />}
    </MobileShell>
  );
}

function DiseaseDetailSheet({ item, onClose }: { item: Disease; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-[440px] bg-card rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+16px)] h-[75vh] max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-10 w-10 rounded-xl bg-brand-subtle text-primary inline-flex items-center justify-center shrink-0">
              <Stethoscope className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <div className="text-card-title text-foreground truncate">{item.name}</div>
              <div className="text-caption text-text-tertiary">
                <span className="font-mono">{item.id}</span> · {item.cat}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-md text-text-tertiary active:bg-surface-subtle inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-caption text-text-tertiary">近 7 天 {item.recent7d} 头</span>
        </div>

        <Section label="典型表现">
          <p className="text-body-sm text-text-secondary leading-relaxed">{item.desc}</p>
        </Section>

        <Section label="常见症状">
          <div className="flex flex-wrap gap-1.5">
            {item.symptoms.map((s) => (
              <span key={s} className="text-body-sm px-2 py-1 rounded-md bg-surface-subtle text-text-secondary">
                {s}
              </span>
            ))}
          </div>
        </Section>

        <Section label="常用处方">
          <div className="space-y-2">
            {item.prescriptions.map((p) => (
              <div key={p.name} className="rounded-lg border border-border p-3">
                <div className="text-body text-foreground">{p.name}</div>
                <div className="text-caption text-text-tertiary mt-1">{p.usage}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-caption text-text-tertiary mb-1.5">{label}</div>
      {children}
    </div>
  );
}
