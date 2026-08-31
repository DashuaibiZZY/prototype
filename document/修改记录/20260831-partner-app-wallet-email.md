# 2026-08-31 · 合伙人申请后台钱包/邮箱字段合并

## 变更

- 合伙人申请管理 **列表**、**详情** 将「钱包地址」「邮箱地址」合并为单列 **钱包地址 / 邮箱**
- 展示规则：按用户**登录方式** — **钱包登录**显示钱包地址，**邮箱验证登录**显示邮箱地址；无则 `—`
- 统一 `admin-copy-chip.js` 的 `loginContact` 逻辑，合伙人管理、积分后台等模块同步
- 与合伙人管理列表等其他后台模块命名与逻辑保持一致

## 涉及文件

- `perp_dex/admin/admin-copy-chip.js`
- `perp_dex/admin/admin-partner-applications.js`
- `perp_dex/admin/admin-partner-portal.js`
- `perp_dex/admin/积分后台.html`
- `perp_dex/admin/代理中心后台.html`
- `document/web&后台/邀请合伙人无限层返佣系统.md` §2.7.2 / §2.7.3 及全局地址展示说明
