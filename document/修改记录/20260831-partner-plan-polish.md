# 2026-08-31 · 合伙人计划 polish (#276 优化)

## 变更

### ForX 合伙人计划子页

- 移除「← 返回邀请返佣」
- 取消独立「未登录 · 点击立即申请」画框；未登录点击在当前页弹出登录引导
- 表单新增选填「补充材料」上传（PNG/JPG/Word/PDF/Excel）
- 新增「已是合伙人 · 不可申请」状态；文档注明任意层级合伙人均不可重复申请

### 合伙人申请管理

- 列表 UID 后新增：合伙人身份、后台操作人员
- 详情拆分为「用户申请信息」与「用户数据信息」；展示附件

## 涉及文件

- `perp_dex/合伙人计划.html`
- `perp_dex/admin/admin-partner-applications.js`
- `perp_dex/admin/代理中心后台.html`
- `document/web&后台/邀请返佣（Web_APP）.md`
- `document/web&后台/邀请合伙人无限层返佣系统.md`
