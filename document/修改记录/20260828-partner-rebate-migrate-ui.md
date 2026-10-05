# 2026-08-28 · 合伙人返佣配置 / 用户规模 / 迁移身份

## 5. 返佣配置生效时机

- `邀请合伙人无限层返佣系统.md` §1.4 / §2.2.3 / §2.4：明确 **≤ 运营上限即刻生效**；**需审批项审批通过后即刻生效**（一级绑定、比例调整、迁移）。
- `admin-partner-portal.js`：返佣树/绑定文案统一为「即刻生效」；权限内绑定调用 `applyL1BindPayload` 立即写入 mock；新增 `applyPartnerApprovalEffect`，审批通过更新比例或绑定。
- `admin-approval.js`：`approveApplication` / `simulateLarkApprove` 通过合伙人三类审批后调用上述生效钩子。

## 6. 用户规模悬停提示

- `partner-center-user.js` / `代理中心.html`：直属下级表头「用户规模」虚线下划线 + **悬停浮层**提示「交易用户数据每天 UTC+8 0 点更新」（非浏览器原生 title）。
- `admin-partner-portal.js`：后台详情/穿透子表同口径。
- 文档 §1.5 / §2.1.4 / §3.2.4 同步说明（交易用户数据 **UTC+8 0 点** 日更）。

## 7. 迁移普通用户 · 身份选择

- `代理中心后台.html` / `admin-partner-portal.js`：普通用户迁移增加「下级直客 / 下级代理」单选；选直客时隐藏比例输入且跳过校验；确认弹窗与审批 payload 含 `plainRole`。
- `admin-approval-ui.js`：迁移审批详情展示迁移后身份与按需比例。
- 文档 §1.4 / §2.3 / §2.4 同步。

## 缓存

- `partner-demo-25`（后台）、`partner-user-27`（用户端）。
