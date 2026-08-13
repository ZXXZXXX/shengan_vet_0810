import { useSyncExternalStore } from "react";

export type ReportScope = "farm-in" | "farm-out" | "region" | "group";

export const scopeOptions: { key: ReportScope; label: string; desc: string }[] = [
  { key: "farm-in", label: "牧场级·内部", desc: "牧场内部视角：全量专题" },
  { key: "farm-out", label: "牧场级·外部", desc: "外部视角：默认隐藏药品、工单与预警告警" },
  { key: "region", label: "区域（中心）", desc: "牧场数据上卷至区域级" },
  { key: "group", label: "集团高管", desc: "牧场数据上卷至区域级、集团级" },
];

export type TopicKey =
  | "herd"
  | "calving"
  | "culling"
  | "disease"
  | "drug"
  | "vaccine"
  | "workorder"
  | "alert"
  | "ops";

export const topicMeta: { key: TopicKey; label: string; anchor?: string }[] = [
  { key: "herd", label: "牛群专题", anchor: "topic-herd" },
  { key: "calving", label: "产犊专题", anchor: "topic-calving" },
  { key: "culling", label: "死淘专题", anchor: "topic-culling" },
  { key: "disease", label: "疾病专题", anchor: "topic-disease" },
  { key: "drug", label: "药品专题", anchor: "topic-drug" },
  { key: "vaccine", label: "疫苗免疫专题", anchor: "topic-vaccine" },
  { key: "workorder", label: "兽医工单专题", anchor: "topic-workorder" },
  { key: "alert", label: "预警告警专题", anchor: "topic-alert" },
  { key: "ops", label: "区域 / 集团运营统计" },
];

export type TopicVisibility = Record<TopicKey, boolean>;

function base(overrides: Partial<TopicVisibility> = {}): TopicVisibility {
  const all = Object.fromEntries(topicMeta.map((t) => [t.key, true])) as TopicVisibility;
  return { ...all, ...overrides };
}

export const defaultConfig: Record<ReportScope, TopicVisibility> = {
  "farm-in": base({ ops: false }),
  "farm-out": base({ drug: false, workorder: false, alert: false, ops: false }),
  region: base(),
  group: base(),
};

type State = { scope: ReportScope; config: Record<ReportScope, TopicVisibility> };

const KEY = "pc:dashboard-view";
const listeners = new Set<() => void>();
let state: State = { scope: "farm-in", config: defaultConfig };
let loaded = false;

function load(): State {
  if (loaded || typeof window === "undefined") return state;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      state = {
        scope: parsed.scope ?? "farm-in",
        config: {
          "farm-in": { ...defaultConfig["farm-in"], ...(parsed.config?.["farm-in"] ?? {}) },
          "farm-out": { ...defaultConfig["farm-out"], ...(parsed.config?.["farm-out"] ?? {}) },
          region: { ...defaultConfig.region, ...(parsed.config?.region ?? {}) },
          group: { ...defaultConfig.group, ...(parsed.config?.group ?? {}) },
        },
      };
    }
  } catch {}
  return state;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((fn) => fn());
}

export function setScope(scope: ReportScope) {
  load();
  state = { ...state, scope };
  persist();
}

export function setTopicVisible(scope: ReportScope, topic: TopicKey, visible: boolean) {
  load();
  state = {
    ...state,
    config: { ...state.config, [scope]: { ...state.config[scope], [topic]: visible } },
  };
  persist();
}

export function resetScopeConfig(scope: ReportScope) {
  load();
  state = { ...state, config: { ...state.config, [scope]: { ...defaultConfig[scope] } } };
  persist();
}

export function useDashboardView(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => load(),
    () => state,
  );
}
