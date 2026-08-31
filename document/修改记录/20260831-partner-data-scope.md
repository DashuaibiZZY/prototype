# 2026-08-31 · 合伙人管理数据权限范围（全局 / 个人）

## 变更

- 权限配置后台：「合伙人管理 · 读/写」时必选 **数据权限范围**（全局 / 个人）
- 合伙人管理页顶栏展示 **数据权限** 徽章；列表按范围过滤
- 文档：《后台权限与角色管理》§2.2、§6.2；《邀请合伙人无限层返佣系统》§2.1.0

## 规则摘要

| 范围 | 说明 |
|---|---|
| 全局 | 读/写 可见全部运营负责的多层级合伙人数据 |
| 个人 | 读/写 仅可见本人为配置运营的多层级合伙人数据 |

## 涉及文件

- `perp_dex/admin/admin-permission-store.js`
- `perp_dex/admin/权限配置后台.html`
- `perp_dex/admin/admin-permission-registry.js`
- `perp_dex/admin/admin-partner-portal.js`
- `perp_dex/admin/代理中心后台.html`
