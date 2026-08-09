import { useState } from "react";
import { Baby, ChevronLeft } from "lucide-react";
import { SectionCard, Donut, Legend, BarList, MiniStat, PeriodTabs } from "./charts";

const aliveTotal = 170;
const deadTotal = 9;

const survival = [
  { name: "成活", value: aliveTotal, color: "var(--brand)" },
  { name: "死亡", value: deadTotal, color: "var(--state-danger)" },
];

const parityDist = [
  { name: "单胎", value: 148, color: "var(--brand)" },
  { name: "双胎及以上", value: 22, color: "var(--effect-ai-cyan)" },
];

const sexRatio = [
  { name: "母犊", value: 91, color: "var(--effect-ai-purple)" },
  { name: "公犊", value: 79, color: "var(--effect-ai-cyan)" },
];

const birthWeight = [
  { name: "< 30 kg", value: 12 },
  { name: "30 - 35 kg", value: 41 },
  { name: "35 - 40 kg", value: 78 },
  { name: "40 - 45 kg", value: 33 },
  { name: "≥ 45 kg", value: 15 },
];

const difficulty = [
  { name: "顺产", value: 132, color: "var(--brand)" },
  { name: "轻度助产", value: 28, color: "var(--effect-ai-cyan)" },
  { name: "中度助产", value: 13, color: "var(--state-warning)" },
  { name: "难产/手术", value: 6, color: "var(--state-danger)" },
];

const TAB_PARITY = "胎型分布";
const TAB_SEX = "性别比例";

export function CalvingSection() {
  const [drill, setDrill] = useState(false);
  const [tab, setTab] = useState(TAB_PARITY);
  const total = aliveTotal + deadTotal;
  const detail = tab === TAB_PARITY ? parityDist : sexRatio;

  return (
    <SectionCard
      id="topic-calving"
      title="产犊专题"
      desc={`本月产犊 ${total} 头`}
      icon={<Baby className="h-4 w-4 text-primary" strokeWidth={1.75} />}
      extra={
        drill ? (
          <PeriodTabs value={tab} onChange={setTab} options={[TAB_PARITY, TAB_SEX]} />
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          {drill ? (
            <>
              <button
                type="button"
                onClick={() => setDrill(false)}
                className="mb-3 inline-flex items-center gap-1 text-body-sm text-text-secondary hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                产犊成活与死亡分布
                <span className="text-text-tertiary">／ 成活 {aliveTotal} 头</span>
              </button>
              <div className="flex items-center gap-8 flex-wrap">
                <Donut
                  data={detail}
                  centerLabel="成活总数"
                  centerValue={String(aliveTotal)}
                  centerUnit="头"
                />
                <Legend data={detail} unit=" 头" />
              </div>
            </>
          ) : (
            <>
              <p className="text-body-sm text-text-secondary mb-3">
                （本月）产犊成活与死亡分布
                <span className="text-caption text-text-tertiary ml-2">点击「成活」查看下钻</span>
              </p>
              <div className="flex items-center gap-8 flex-wrap">
                <Donut
                  data={survival}
                  centerLabel="产犊总数"
                  centerValue={String(total)}
                  centerUnit="头"
                  onSliceClick={(s) => {
                    if (s.name === "成活") setDrill(true);
                  }}
                />
                <Legend data={survival} unit=" 头" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  label={`成活率 ${((aliveTotal / total) * 100).toFixed(1)}%`}
                  value={String(aliveTotal)}
                  unit="头"
                  tone="var(--brand)"
                />
                <MiniStat
                  label={`死亡率 ${((deadTotal / total) * 100).toFixed(1)}%`}
                  value={String(deadTotal)}
                  unit="头"
                  tone="var(--state-danger)"
                />
              </div>
            </>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <p className="text-body-sm text-text-secondary mb-3">（本月）初生牛犊体重分布</p>
            <BarList data={birthWeight} unit=" 头" />
          </div>
          <div>
            <p className="text-body-sm text-text-secondary mb-3">（本月）产犊难易度</p>
            <div className="flex items-center gap-6 flex-wrap">
              <Donut data={difficulty} size={136} centerLabel="顺产率" centerValue="74.6%" />
              <Legend data={difficulty} unit=" 例" />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

