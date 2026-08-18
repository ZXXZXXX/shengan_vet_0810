/**
 * 异常排查任务处理记录
 * 牛只档案页做出反馈（继续观察 / 健康上报）后，该牛只的异常排查任务
 * 当天不再出现在今日任务列表中，次日 00:00 自动恢复。
 */
const KEY = "alert-handled";
const EVENT = "alert-handled-change";

type Store = Record<string, number>; // cattleId -> 失效时间戳

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const obj = raw ? (JSON.parse(raw) as Store) : {};
    const now = Date.now();
    const next: Store = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v === "number" && v > now) next[k] = v;
    });
    return next;
  } catch {
    return {};
  }
}

export function getHandledAlerts(): Set<string> {
  return new Set(Object.keys(read()));
}

export function isAlertHandled(cattleId: string): boolean {
  return getHandledAlerts().has(cattleId);
}

export function markAlertHandled(cattleId: string) {
  if (typeof window === "undefined") return;
  const store = read();
  const d = new Date();
  d.setHours(24, 0, 0, 0); // 次日 00:00
  store[cattleId] = d.getTime();
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeAlerts(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
