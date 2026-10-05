# 2026-08-28 · 合伙人中心热修（#261～#263）

> 前置：`#259` 移除异常返佣倒挂逻辑  
> 归档：`document/备份/合伙人-异常返佣倒挂-归档.md`

## 背景

#259 从原型与主文档移除异常返佣倒挂能力后，用户侧 `partner-center-user.js` 仍有个别残留，导致页面初始化失败或继续展示已废弃状态。

## 原型修复

| PR | 问题 | 修复 |
|---|---|---|
| **#261** | `teamTreeAbnormalData` 删除后仍被 UID bootstrap / `expandAllTeamTrees` 引用 → `ReferenceError`，三页 mock 数据无法渲染 | 删除残留引用 |
| **#262** | 每日结算流水仍保留「返佣异常停止结算」筛选、状态文案与 mock 行 | 仅保留 **待结算 / 已结算** |
| **#263** | 浏览器缓存无版本号的 `partner-center-user.js`，仍可能加载旧脚本 | `?v=partner-user-24` + 防御性过滤 `rebate_stopped` 行 |

## 文档同步

| 文件 | 变更 |
|---|---|
| `web&后台/邀请合伙人无限层返佣系统.md` | §3.0 补充用户侧脚本 cache bust；§3.4.2 明确流水状态**不含**「返佣异常停止结算」 |
| `修改记录/20260828-partner-inversion-remove.md` | 补充 #261～#263 索引；修正 capture 脚本说明 |
| `scripts/capture-partner-doc-screenshots.mjs` | 移除已无文档引用的 `admin-modal-team-tree` / `web-modal-team-tree` 截图步骤 |

## 文档审计结论

- **当前产品文档**（`document/web&后台/邀请合伙人无限层返佣系统.md`）在 #259 已删除 §3.2.4 异常横幅、§3.2.8 团队返佣树弹窗、§3.4.2「返佣异常停止结算」等章节；#261～#263 仅做口径澄清，无大块重写。
- **`document/备份/合伙人-异常返佣倒挂-归档*.md`** 为历史快照与恢复索引，**刻意保留**旧需求正文，不代表当前产品；请勿与主文档混读。
