---
name: index
description: Project memory index
type: reference
---
# Project Memory

## Core
品牌色 brand green #00A14F。基础色板：core/state/effect 三类，所有语义变量必须 alias 到 primitive。
字体 PingFang SC。Page Title 24/34 Medium，Section 18/28，Card 16/26 Medium，Body 14/24，Body Small 13/22，Caption 12/20。
PC 国内：24px page margin，16px gutter，card padding 24px，table row 48px。
Sidebar active 用 #EFFBF1 底 + 左侧 brand 强调线，hover 用浅灰绿 (--sidebar-hover)。
按钮主色用 button/primary（不直接拼 green 色阶）。AI 元素用 effect/ai-purple 紫 + ai-cyan 青渐变。
账号可绑定多牧场，每牧场可有多角色；同牧场功能权限与数据权限均取并集。
小程序场长(manager)无工单处理权限，仅可见自己上报的工单，无今日任务板块。不要与 vet 归为一类。
牛只编号 8 位 `aa-bb-cccc`：牧场(2)-出生年(2)-序号(4)。

## Memories
- [Permission merge](mem://features/permission-merge) — 账号-牧场-角色多对多 + 权限并集规则
- [MP manager restrictions](mem://features/mp-manager-restrictions) — 小程序场长权限限制
- [Sick pen rule](mem://features/sick-pen-rule) — 疾病类必须进病牛舍，仅群体工单跨牛舍
- [Cattle ID format](mem://features/cattle-id-format) — 牛只编号 8 位 aa-bb-cccc 格式
