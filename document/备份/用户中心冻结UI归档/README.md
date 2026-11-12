# 用户中心 · 冻结 / 用户状态 UI 归档

**归档日期：** 2026-11-12（UTC+8 业务日）

从后台原型 `perp_dex/admin/用户中心.html` 与 `用户中心详情.html` 中移除的「用户状态」「冻结配置」「详情冻结信息」相关实现，便于日后整段恢复。

## 快照文件（移除前完整页面）

| 文件 | 说明 |
|------|------|
| [用户中心.html.snapshot](./用户中心.html.snapshot) | 列表：状态筛选/列、冻结抽屉、操作「冻结」 |
| [用户中心详情.html.snapshot](./用户中心详情.html.snapshot) | 详情：用户状态区块、冻结行为 pills、冻结记录弹窗、冻结抽屉 |
| [admin-user-center-actions.js.snapshot](./admin-user-center-actions.js.snapshot) | 含 `openFreezeDrawer` / `saveFreezeConfig` / `statusFromFlags` 等 |

## 恢复步骤（概要）

1. 从快照中把 **冻结配置 drawer HTML**、**列表筛选/列/按钮**、**详情状态区块与 freezeLogModal** 贴回对应 HTML。
2. 将 `admin-user-center-actions.js.snapshot` 中的冻结相关函数与 `global.openFreezeDrawer` 等导出合并回 `admin-user-center-actions.js`，或整体替换后再与当前「团队标签 / 做市商」逻辑做一次 diff 合并。
3. 列表页脚本中恢复 `statusTag`、`filterStatus`、`statusFromFlags` 过滤与表格列。
4. 详情页脚本中恢复 `FREEZE_BEHAVIORS`、`FREEZE_LOGS`、`renderFreezeLogTable` 与 `renderProfile` 内冻结 pills。

独立风控冻结后台仍保留：`perp_dex/admin/用户冻结设置.html`（与用户中心模块无强绑定）。
