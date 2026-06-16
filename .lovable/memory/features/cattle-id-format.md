---
name: cattle-id-format
description: 牛只编号格式 aa-bb-cccc（牧场-出生年-序号），共 8 位数字
type: feature
---
牛只编号统一 8 位数字，格式 `aa-bb-cccc`：
- `aa` 出生所在牧场编号（2 位）
- `bb` 出生年份后两位（2 位）
- `cccc` 序号（4 位）

示例：`01-24-0381` 表示 1 号牧场 2024 年第 381 头。
所有 mock 数据、表单校验、展示（含 `#` 前缀）都应遵循此格式。
