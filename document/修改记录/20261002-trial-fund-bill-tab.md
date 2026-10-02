# 体验金账单独立标签（Web + App）

- **交易账单**：类型展示与筛选移除体验金主/子类型及 mock 数据。
- **体验金账单**（新主标签）：时间筛选与现有账单一致；类型筛选为激活 / 费用抵扣 / 亏损抵扣 / 回收；列表字段：时间、卡券ID、类型、金额变动、关联仓位ID。
- 文档：`持仓管理 & 资金流水 模块.md` §2 主标签、§3.4.4；`App 端交易流水页.md` §6.6.5。
- 原型：`perp_dex/合约交易.html`、`position-flow-module.js`、`perp_dex/app/交易流水頁面.html`。

**Hotfix（体验金账单 Tab）：** `合约交易.html` 更新 `position-flow-module.js` 缓存版本号；类型下拉写死选项；表格渲染改为 `renderWebTrialFundBillTable`（模块未加载时使用内联 mock，避免切换 Tab 后仍显示上一 Tab 数据）。
