# ForX 种子用户落地页（Web）

> **原型**：[`perp_dex/ForX种子用户.html`](../../perp_dex/ForX种子用户.html)  
> **预览**：https://dashuaibizzy.github.io/prototype/perp_dex/ForX种子用户.html

上线前独立 Web 页：社区信息收集 + 引导加入 Telegram。与合约交易主站导航 **无强耦合**，可单独部署子路径（如 `/seed`）。

---

## 1. 页面定位与文案

| 区块 | 说明 |
|------|------|
| Hero | **ForX 种子用户计划** — 链上永续 DEX 上线前招募；强调深度、低延迟、链上结算与早期权益 |
| 福利四格 | 上线礼包优先、内测与功能投票、积分/空投白名单、官方 Telegram 席位 |
| 登记表单 | 收集 Name / Email / Telegram / X，提交后验证码，成功后引导 TG |

Telegram 官方链接（原型占位）：`https://t.me/ForXOfficial` — 上线前替换为正式频道。

---

## 2. 表单字段

| 字段 | 必填 | 规则 |
|------|:----:|------|
| Name | ✓ | 非空 |
| Email | ✓ | 邮箱格式 |
| Telegram | ✓ | `@username`，5–32 位字母数字下划线；占位 `@username` |
| X (Twitter) | ✓ | 须 **Connect X** 授权成功后再提交；展示 `@handle` |

---

## 3. Connect X（OAuth）

- 按钮文案：**Connect X**
- **正式实现**：OAuth 2.0 Authorization Code + PKCE，由后端配置 `client_id` / `redirect_uri` / `state`。
- **Scope**：以 [X Developer Portal](https://developer.x.com/) 当前政策为准；产品曾要求可读用户可见帖子等能力时，需在 App 权限中申请对应 **tweet.read / users.read** 等 scope，**受保护推文** 仅在该用户授权且 API 允许范围内可读。
- **原型**：点击 Connect X 写入 mock `x_user_id` / `x_handle`，便于 UI 走通；注释中保留正式授权 URL 拼装示例。

---

## 4. 提交与验证码

1. 用户点击 **提交登记** → 前端校验必填与 X 已连接。  
2. 弹出 **安全验证** 层（非首屏），要求完成验证码。  
3. **生产建议**：接入 **Cloudflare Turnstile** 或 **hCaptcha**（开源/商用均可），后端 `siteverify` 通过后再写入 DB。  
4. **原型**：勾选「我不是机器人（原型模拟）」后 **确认提交** → 隐藏表单，展示 **登记成功** + **立即加入 Telegram 社群** 主按钮。

---

## 5. 成功态

- 表单区域隐藏（`#section-form`）。  
- 展示成功图标、感谢文案、**立即加入 Telegram 社群** CTA（同 TG 链接）。  
- 说明审核与内测通知优先通过 Telegram 触达。

---

## 6. 后端接口（建议，原型未实现）

```http
POST /api/v1/seed-users
Content-Type: application/json

{
  "name": "...",
  "email": "...",
  "telegram": "@username",
  "x_user_id": "...",
  "x_handle": "@...",
  "captcha_token": "<turnstile or hcaptcha token>"
}
```

响应 `201` 后前端进入成功态；失败返回字段级错误。

---

## 7. 防刷

- 验证码（§4）+ 服务端 rate limit（IP / email / x_user_id）。  
- 可选：同一 X 或 Email 仅允许登记一次。
