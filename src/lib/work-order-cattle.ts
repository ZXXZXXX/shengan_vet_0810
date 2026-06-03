// 根据工单号推断对应牛只耳号，与 m.health.$id 中的映射保持一致。
// 用于转栏二次确认弹窗等需要展示具体牛只的场景。
const singleEarMap: Record<string, string> = {
  "WO-2298": "#A2298",
  "WO-2410": "#A2410",
  "WO-2420": "#A2420",
  "WO-2430": "#A2430",
  "WO-2440": "#A2440",
  "HF-0702": "#A2150",
  "HF-0688": "#A2270",
  "PP-2501": "#A2710",
};

export function getOrderEarTagLabel(id: string): string {
  if (singleEarMap[id]) return singleEarMap[id];
  if (id.startsWith("HF")) return "#A2150";
  // 默认多头工单
  return "#A2381 等 3 头";
}
