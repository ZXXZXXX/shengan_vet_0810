---
name: MP manager restrictions
description: 小程序场长(manager)权限：不看/不处理工单，仅可见自己上报的
type: feature
---
场长(manager)在小程序中：
- 无"今日任务"板块（首页隐藏）。
- 无"待响应"工单（m.respond 返回空）。
- 无"今日工作"任务（m.health.today 返回空）。
- 工单列表(m.health.index)仅展示 proposer === "李雨晴"（当前登录账号）的工单。
- 无诊断权限 canDiagnose(manager) = false；无执行权限 canExecute(manager) = false。
- 保留 canViewOperations = true，可查看运营概览数据统计。

之前"兽医与场长视角完全一致"的规则已废弃。新增角色判断时，不要把 manager 与 vet 归为一类。
