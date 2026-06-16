// 根据工单号推断对应牛只耳号，与 m.health.$id 中的映射保持一致。
// 用于转栏二次确认弹窗等需要展示具体牛只的场景。
const singleEarMap: Record<string, string> = {
  "WO-2298": "#01-24-2298",
  "WO-2410": "#01-24-2410",
  "WO-2420": "#01-24-2420",
  "WO-2430": "#01-24-2430",
  "WO-2440": "#01-24-2440",
  "HF-0702": "#01-24-2150",
  "HF-0688": "#01-24-2270",
  "PP-2501": "#01-24-2710",
};

export function getOrderEarTagLabel(id: string): string {
  if (singleEarMap[id]) return singleEarMap[id];
  if (id.startsWith("HF")) return "#01-24-2150";
  // 默认多头工单
  return "#01-24-2381 等 3 头";
}
