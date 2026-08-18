import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";

export const Route = createFileRoute("/m/empty-states")({
  head: () => ({ meta: [{ title: "空状态系列 · 奇点智牧" }] }),
  component: EmptyStatesPage,
});

type Scenario = {
  title: string;
  desc: string;
  tags: string[];
  results: string[];
  empties: { label: string; hint: string }[];
};

const scenarios: Scenario[] = [
  {
    title: "验证手机号",
    desc: "首次使用企业微信登录时绑定手机号，确认账号身份后进入系统。",
    tags: ["登录前置", "账号校验"],
    results: [
      "仅支持已存在账号登录，不提供自助注册入口。",
      "验证码错误、未匹配账号、重复获取验证码需给出明确提示。",
      "绑定成功后，下次可直接使用企业微信一键登录。",
    ],
    empties: [
      { label: "手机号未匹配账号", hint: "请联系管理员开通账号。" },
      { label: "验证码失效", hint: "请重新获取验证码。" },
    ],
  },
  {
    title: "首页：切换牧场",
    desc: "多牧场账号在首页切换当前数据范围，切换后首页、工单、档案同步更新。",
    tags: ["全局范围", "多牧场"],
    results: [
      "仅展示当前账号已绑定牧场。",
      "切换成功后用轻提示反馈，避免用户误以为数据异常。",
      "单牧场账号不展示切换列表，只显示当前牧场名称。",
    ],
    empties: [
      { label: "无绑定牧场", hint: "请联系管理员配置牧场范围。" },
      { label: "牧场列表为空", hint: "展示当前账号暂无可切换牧场。" },
    ],
  },
  {
    title: "现场上报",
    desc: "现场人员提交健康线索，生成待诊断工单，由 PC 端完成诊疗确认与派单。",
    tags: ["现场线索", "PC 诊断"],
    results: [
      "上报阶段只负责线索采集，不形成最终诊疗方案。",
      "照片、视频、语音、文字至少完成一种线索材料。",
      "保存草稿后，可在我的–草稿箱继续编辑。",
    ],
    empties: [{ label: "无上报权限", hint: "当前角色暂无健康上报能力。" }],
  },
  {
    title: "首页：待响应",
    desc: "展示当前牧场下可由本人响应接单的工单，响应后进入本人待执行列表。",
    tags: ["接单池", "先响应先处理"],
    results: [
      "待响应不是个人派单，而是权限池任务。",
      "响应成功后，其他同权限人员不再看到该待响应任务。",
      "响应失败需区分工单已变更与网络异常。",
    ],
    empties: [
      { label: "暂无待响应工单", hint: "当前牧场下没有可由您接单的任务。" },
      { label: "筛选无结果", hint: "请调整工单类型、牛舍或时间条件。" },
    ],
  },
  {
    title: "工单列表",
    desc: "按状态查看与本人相关的工单，支持搜索、筛选、分组和快速进入详情。",
    tags: ["状态筛选", "牛舍分组"],
    results: [
      "列表优先展示需要本人响应或执行的任务。",
      "牛舍分组优先，物资类任务归入物资分组。",
      "待诊断在小程序仅可查看，诊断操作需前往 PC 端。",
    ],
    empties: [
      { label: "暂无工单", hint: "当前状态下没有相关工单。" },
      { label: "未找到匹配结果", hint: "请清空搜索或调整筛选条件。" },
    ],
  },
  {
    title: "首页：待领物",
    desc: "集中展示待领取药品器材，执行人员凭领物码到仓库核销领取。",
    tags: ["领物码", "仓库核销"],
    results: [
      "待领物与工单关联，需展示工单号、仓库、物资清单和诊断信息。",
      "可选择无需领物原因，提交后不再进入领物流程。",
      "领物码状态需支持可领取、已领取、已失效。",
    ],
    empties: [
      { label: "暂无待领物", hint: "需要领取的药品器材会显示在这里。" },
      { label: "暂无既往记录", hint: "完成核销后、已确认失效的领物记录会显示在这里。" },
    ],
  },
  {
    title: "工单详情",
    desc: "展示工单从上报、诊断到执行的完整信息，便于现场人员理解任务要求。",
    tags: ["流程追踪", "只读/执行"],
    results: [
      "详情页需区分上报记录、诊断记录、执行记录。",
      "非执行人进入时只展示查看态，不展示执行按钮。",
      "已完成、已终止状态需展示结果与原因。",
    ],
    empties: [
      { label: "暂无诊断记录", hint: "PC 端诊断后会同步展示。" },
      { label: "暂无执行记录", hint: "执行人员回填后会显示在这里。" },
    ],
  },
  {
    title: "扫码：快速上报",
    desc: "扫码识别对象后自动带入牛只或牛舍信息，减少现场上报录入成本。",
    tags: ["对象带入", "线索上报"],
    results: [
      "扫码带入的对象信息不可编辑，避免误报对象。",
      "未识别到有效码时，可选择重新扫描或直接上报。",
      "直接上报需由用户手动补充对象信息。",
    ],
    empties: [
      { label: "未识别到有效码", hint: "可重新扫描或直接发起上报。" },
      { label: "无上报权限", hint: "当前角色不可发起健康上报。" },
    ],
  },
  {
    title: "扫码：执行记录",
    desc: "通过扫码快速进入本人负责的工单，并回填现场执行记录。",
    tags: ["快速执行", "记录回填"],
    results: [
      "仅执行者可提交执行记录，其他角色进入查看态。",
      "当前批次未完成必填项时，提交按钮需置灰或拦截提示。",
      "未来批次仅可查看，不可提前回填。",
    ],
    empties: [
      { label: "暂无可执行工单", hint: "当前对象没有需要您处理的任务。" },
      { label: "当前批次已完成", hint: "可查看记录，不可重复提交。" },
    ],
  },
  {
    title: "牛只档案",
    desc: "快速查询牛只健康状态、休药期和相关工单，支持从档案发起健康上报。",
    tags: ["档案查询", "健康上报"],
    results: [
      "健康、观察中、治疗中、休药期状态需有明确颜色区分。",
      "相关工单仅展示当前账号可查看或可负责的对象。",
      "无执行权限时可查看工单，但不可进入执行记录流程。",
    ],
    empties: [
      { label: "暂无相关工单", hint: "当前没有与您相关的执行中任务。" },
      { label: "未找到牛只档案", hint: "请检查耳号或筛选条件。" },
    ],
  },
];

function EmptyStatesPage() {
  return (
    <MobileShell title="空状态系列" back>
      <div className="px-4 py-4 space-y-4">
        {scenarios.map((s) => (
          <ScenarioCard key={s.title} s={s} />
        ))}
      </div>
    </MobileShell>
  );
}

function ScenarioCard({ s }: { s: Scenario }) {
  return (
    <article className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="h-1 w-full bg-primary" />
      <div className="p-4 space-y-3">
        <div>
          <h2 className="text-section-title text-foreground">{s.title}</h2>
          <p className="text-body-sm text-text-secondary leading-relaxed mt-1.5">
            {s.desc}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {s.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center h-7 px-2.5 rounded-md bg-primary/10 text-primary text-caption"
            >
              {t}
            </span>
          ))}
        </div>

        <div>
          <div className="text-body-sm font-medium text-foreground mb-2">
            操作结果说明
          </div>
          <ul className="space-y-1.5">
            {s.results.map((r) => (
              <li key={r} className="flex gap-2 text-body-sm text-text-secondary leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border pt-3">
          <div className="text-body-sm font-medium text-foreground mb-2">
            空状态说明
          </div>
          <ul className="space-y-1.5">
            {s.empties.map((e) => (
              <li key={e.label} className="flex gap-2 text-body-sm text-text-secondary leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[var(--state-warning)] shrink-0" />
                <span>
                  <span className="text-foreground">{e.label}：</span>
                  {e.hint}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
