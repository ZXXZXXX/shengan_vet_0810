## 改动

`src/routes/m.health.today.tsx`：

1. **`getRoleTabs`**：移除，所有角色都使用 `["待诊断", "待执行", "待复查"]`。

2. **`getRoleAllTasks`**：扩展执行类角色（vet_assistant / immunizer / hoof_trimmer）的候选任务，使其同时包含三个状态——以便其他两个 tab 也能展示对应的内容或合理的空状态：
   - vet_assistant：疾病治疗/产后护理 的待诊断 + 待执行 + 待复查（实际通常只剩待执行，其他 tab 显示 0 与空态）
   - immunizer：疫苗免疫 全部（按 status 落入相应 tab；当前免疫只有"待执行"，其他 tab 自然为 0）
   - hoof_trimmer：修蹄 全部，同上

   非 vet/manager 角色，待诊断/待复查 tab 计数大概率为 0，但 tab 始终可见，结构与 vet/manager 完全一致。

3. **tab 渲染条件**：去掉 `tabs.length > 1` 判断，始终渲染 tab 条。

4. **空态文案**：在非 vet/manager 角色进入"待诊断/待复查" tab 时，EmptyState 提示"该任务由兽医/场长处理"（已有 EmptyState 组件，只需替换文案）。

## 不改动

- 卡片样式、批量执行、牛舍筛选、领药跳转逻辑全部保留。
- 其他页面不动。
