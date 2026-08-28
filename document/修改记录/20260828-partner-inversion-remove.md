# 2026-08-28 · 合伙人异常返佣倒挂移除

> 分支：`cursor/partner-remove-inversion-75dd`  
> 归档：`document/备份/合伙人-异常返佣倒挂-归档.md` + 完整文档快照

## 变更摘要

从合伙人**原型**与**需求文档**中移除全部「异常返佣倒挂」相关逻辑（停结、待修正、异常返佣线、迁移倒挂校验等）。级差计算与比例配置能力保留；上下级比例允许相等（级差为 0）。

## 文档

| 文件 | 说明 |
|---|---|
| `web&后台/邀请合伙人无限层返佣系统.md` | 重写 §1.4 / §2 / §3，删除倒挂章节与 UI 描述 |
| `备份/合伙人-异常返佣倒挂-归档.md` | 归档索引 |
| `备份/合伙人-异常返佣倒挂-归档-文档完整快照.md` | main 合并前完整需求正文 |

## 原型

| 文件 | 说明 |
|---|---|
| `admin/admin-partner-portal.js` | `DATA_VERSION` → `partner-demo-23` |
| `admin/代理中心后台.html` | 移除异常 DOM / 筛选 / 弹窗 |
| `partner-center-user.js` | 移除用户侧异常横幅与倒挂状态 |
| `代理中心.html` | 同上 |
| `admin/admin-approval.js` / `admin-approval-ui.js` | 移除迁移 `ratioFixes` |
| `scripts/capture-partner-doc-screenshots.mjs` | 移除异常返佣线 / 团队返佣树异常弹窗等截图步骤（`admin-modal-abnormal-list`、`admin-modal-team-tree`、`web-modal-team-tree`） |

## 恢复方式

见 `document/备份/合伙人-异常返佣倒挂-归档.md` §Git 恢复提示。

## 后续热修（#261～#263）

#259 合并后用户侧原型仍有个别残留，已在 `document/修改记录/20260828-partner-center-hotfix.md` 记录：

| PR | 修复 |
|---|---|
| #261 | 移除 `teamTreeAbnormalData` 残留引用，恢复三页数据渲染 |
| #262 | 移除每日流水「返佣异常停止结算」筛选 / 状态 / mock 行 |
| #263 | 用户侧脚本 cache bust（`partner-user-24`）并防御性过滤 legacy 行 |

**文档口径**：`邀请合伙人无限层返佣系统.md` 在 #259 已删除异常停结相关章节；#261～#263 仅同步 §3.0 / §3.4.2 澄清与修改记录。完整旧版需求正文仅保留于 `document/备份/` 归档，**非**当前产品文档。
