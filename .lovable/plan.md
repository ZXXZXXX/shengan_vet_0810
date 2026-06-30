## 计划

### 目标
将备药页「药品清单」药品维度中，药品名称列的字号统一改为 14px，其他列（厂商、规格、数量）保持当前字号不变。

### 修改范围
1. `src/styles.css`：在移动端字体体系中新增语义类 `.m-scope .text-list`（14px / 24px / 400），作为列表主信息的标准字号。
2. `src/routes/m.prep.tsx`：药品维度（drug view）每一行的药品名称列 className 由 `text-body` 改为 `text-list`，保留 `font-medium` 等现有样式。

### 验证
- 在 `/m/prep` 页面选择任务并生成药品清单后，通过浏览器 DevTools 确认：
  - 药品名称列计算字号为 14px
  - 数量列仍为 16px
  - 厂商、规格列仍为 11px
