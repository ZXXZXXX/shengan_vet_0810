代码中 `WEIGHT_OPTIONS`（src/routes/m.health.$id_.diagnose.tsx 第 152-157 行）已是你要求的 4 个档位：

1. 200～400 kg
2. 400～600 kg
3. 600～900 kg
4. 900 kg 以上

且底部抽屉（第 1395-1436 行）已用 `WEIGHT_OPTIONS.map` 渲染，显示 `opt.label`。

你截图中仍出现 350/400/450…/700 kg 的旧 8 项列表，应当是预览未刷新到最新构建。计划：

- 不改代码（当前实现已符合需求）
- 进入 build 模式后：硬刷新预览页 `/m/health/WO-2383/diagnose`，再点"牛只体重"重新打开抽屉确认显示 4 项区间
- 若仍显示旧 8 项，则在 build 模式下用 Playwright 截图 `/tmp/browser/weight.png` 复现并定位是否存在另一份组件覆盖此抽屉