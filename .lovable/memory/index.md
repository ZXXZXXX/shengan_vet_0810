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
小程序中兽医(vet)与场长(manager)视角数据/权限完全一致——任何 role 判断两者必须同时出现。
牛只编号 8 位 `aa-bb-cccc`：牧场(2)-出生年(2)-序号(4)。

## Memories
- [Permission merge](mem://features/permission-merge) — 账号-牧场-角色多对多 + 权限并集规则
- [MP vet/manager parity](mem://features/mp-vet-manager-parity) — 小程序兽医与场长视角完全一致
- [Cattle ID format](mem://features/cattle-id-format) — 牛只编号 8 位 aa-bb-cccc 格式
