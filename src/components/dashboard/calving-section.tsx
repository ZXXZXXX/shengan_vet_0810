import { useState } from "react";
import { Baby, ChevronLeft } from "lucide-react";
import { SectionCard, Donut, Legend, PeriodTabs } from "./charts";
import { scaleList, scaleValue, useDataLevel } from "@/lib/dashboard-view";

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
  { name: "< 30 kg", value: 12, color: "var(--state-warning)" },
  { name: "30 - 35 kg", value: 40, color: "var(--effect-ai-cyan)" },
  { name: "35 - 40 kg", value: 72, color: "var(--brand)" },
  { name: "40 - 45 kg", value: 31, color: "var(--effect-ai-purple)" },
  { name: "≥ 45 kg", value: 15, color: "var(--state-danger)" },
];

const difficulty = [
  { name: "顺产", value: 132, color: "var(--brand)" },
  { name: "轻度助产", value: 28, color: "var(--effect-ai-cyan)" },
  { name: "中度助产", value: 13, color: "var(--state-warning)" },
  { name: "难产/手术", value: 6, color: "var(--state-danger)" },
];

const TAB_PARITY = "胎型分布";
const TAB_SEX = "性别比例";
const TAB_WEIGHT = "体重分布";

const VIEW_CALF = "犊牛情况";
const VIEW_COW = "母牛情况";


export function CalvingSection() {
  const [view, setView] = useState(VIEW_CALF);
  const [drill, setDrill] = useState(false);
  const [tab, setTab] = useState(TAB_PARITY);
  const { factor } = useDataLevel();
  const alive = scaleValue(aliveTotal, factor);
  const survivalData = scaleList(survival, factor);
  const difficultyData = scaleList(difficulty, factor);
  const total = alive + scaleValue(deadTotal, factor);
  const detail = scaleList(tab === TAB_PARITY ? parityDist : tab === TAB_SEX ? sexRatio : birthWeight, factor);

  return (
    <SectionCard
      id="topic-calving"
      title="产犊专题"
      desc={"\n"}
      icon={<Baby className="h-4 w-4 text-primary" strokeWidth={1.75} />}
      extra={
        <div className="flex items-center gap-3 flex-wrap">
          {view === VIEW_CALF && drill ? (
            <PeriodTabs value={tab} onChange={setTab} options={[TAB_PARITY, TAB_SEX, TAB_WEIGHT]} />
          ) : (
            <PeriodTabs
              value={view}
              onChange={(v) => {
                setView(v);
                setDrill(false);
              }}
              options={[VIEW_CALF, VIEW_COW]}
            />
          )}
        </div>
      }
    >
      {view === VIEW_CALF ? (
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
                <span className="text-text-tertiary">{"\n"}</span>
              </button>
              <div className="flex flex-col items-center gap-4">
                <Donut
                  data={detail}
                  centerLabel="成活总数"
                  centerValue={alive.toLocaleString()}
                  centerUnit="头" unit=" 头"
                />
                <Legend data={detail} unit=" 头" />
              </div>
            </>
          ) : (
            <>
              <p className="text-body-sm text-text-secondary mb-3">
                （本月）产犊成活与死亡分布
                <span className="text-caption text-text-tertiary ml-2"></span>
              </p>
              <div className="flex flex-col items-center gap-4">
                <Donut
                  data={survivalData}
                  centerLabel="产犊总数"
                  centerValue={total.toLocaleString()}
                  centerUnit="头" unit=" 头"
                  onSliceClick={(s) => {
                    if (s.name === "成活") setDrill(true);
                  }}
                />
                <Legend data={survivalData} unit=" 头" />
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <p className="text-body-sm text-text-secondary mb-3">（本月）产犊难易度分布</p>
          <div className="flex flex-col items-center gap-4">
            <Donut data={difficultyData} centerLabel="顺产率" centerValue="74.6%" unit=" 例" />
            <Legend data={difficultyData} unit=" 例" />
          </div>
        </div>
      )}
    </SectionCard>
  );
}


