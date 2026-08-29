# 2026-08-29 · #271 合并后小优化

## 变更

1. **冻结状态展示**：后台合伙人列表/详情统一显示 **部分冻结**（不论账户冻结或单项冻结）。
2. **合伙人审核类型**：新增 **一级合伙人绑定（跨权限）**（`partner_l1_bind_cross`）；种子单 `APR20260829001` 演示待风控状态。
3. **跨 BD 一级绑定**：移除独立「跨权限配置商务原因」输入框；改为在 **申请备注** 中填写，amber 提示引导。

## 涉及文件

- `perp_dex/admin/admin-partner-portal.js`
- `perp_dex/admin/代理中心后台.html`
- `perp_dex/admin/admin-approval.js`
- `perp_dex/admin/admin-approval-ui.js`
- `document/web&后台/邀请合伙人无限层返佣系统.md`
