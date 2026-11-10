# 2026-10-05 App 持仓多条止盈止损 + Web 列单行摘要

## 原型

- `perp_dex/app/app-position-tpsl.js`：App 共用 mock 列表/空态/表单逻辑
- `perp_dex/app/合约交易.html`：持仓弹层三态、卡片摘要行、确认提交写回
- `perp_dex/app/交易流水頁面.html`：止盈止损单编辑入口共用同一弹层
- `perp_dex/合约交易.html`：当前持仓列改为 `止盈止损：TP / SL (N)` 单行

## 文档

- `document/app/APP 端合约交易页.md` §4.2.2.4、§4.2.3
- `document/web&后台/持仓管理 & 资金流水 模块.md` 当前持仓止盈/止损列
