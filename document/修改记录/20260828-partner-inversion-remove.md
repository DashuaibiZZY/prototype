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
| `scripts/capture-partner-doc-screenshots.mjs` | 移除异常截图步骤 |

## 恢复方式

见 `document/备份/合伙人-异常返佣倒挂-归档.md` §Git 恢复提示。
