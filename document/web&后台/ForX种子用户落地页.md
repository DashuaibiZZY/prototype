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
| X (Twitter) | ✓ | 须 **Connect X**（OAuth 2.0）授权成功后再提交；展示 `@handle` |

---

## 3. Connect X：OAuth 2.0 账号授权（技术定稿）

### 3.1 方案结论

| 项 | 约定 |
|----|------|
| 认证方式 | **仅 OAuth 2.0 Authorization Code + PKCE**（不接 OAuth 1.0a） |
| 用途 | 验证 X 账号身份，拉取**当前授权用户**的基础资料并**全量落库** |
| 不申请 | **`tweet.read`**、时间线/书签/点赞等读帖 scope（种子登记不需要，且显著增加 Credits 消耗） |
| 可选 | **`offline.access`**：发放 refresh token，便于 token 过期后刷新（推荐） |

### 3.2 官方文档（接口与授权）

| 主题 | 链接 |
|------|------|
| OAuth 2.0 Authorization Code Flow with PKCE | https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/authorization-code |
| OAuth 2.0 概览 / FAQ | https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/overview |
| **Authenticated User Lookup Quickstart**（`/users/me` 入门） | https://docs.x.com/x-api/users/lookup/quickstart/authenticated-lookup |
| **GET /2/users/me** API Reference | https://docs.x.com/x-api/users/get-me |
| User 对象字段说明（`user.fields`） | https://docs.x.com/x-api/data-dictionary/object-types/user |
| API 定价（Pay-per-usage / Credits） | https://docs.x.com/x-api/getting-started/pricing |
| Developer Console（App、Credits） | https://console.x.com |

### 3.3 授权流程（后端）

1. 前端点击 **Connect X** → 跳转 X 授权页（PKCE：`code_challenge` / `code_challenge_method=S256` + `state`）。
2. 用户同意后，X 重定向至 `redirect_uri`，携带 `code`。
3. 后端 `POST https://api.x.com/2/oauth2/token` 用 `code` + `code_verifier` 换取 **access_token**（及 `refresh_token`，若 scope 含 `offline.access`）。
4. 后端立即调用 **`GET https://api.x.com/2/users/me`**（User Context），解析 User 对象并**持久化 §3.4 全部字段**。
5. 前端仅展示必要 UI 字段（如 `@username`）；**token 与完整 profile 仅存服务端**。

**授权 URL（示例参数，以官方文档为准）：**

```text
GET https://x.com/i/oauth2/authorize
  ?response_type=code
  &client_id={CLIENT_ID}
  &redirect_uri={REDIRECT_URI}
  &scope=users.read%20offline.access
  &state={CSRF_STATE}
  &code_challenge={PKCE_CHALLENGE}
  &code_challenge_method=S256
```

**Scope 说明（官方 Scopes 表，节选）：**

| Scope | 说明 |
|-------|------|
| `users.read` | View any account you can see, including protected accounts（在 API 语义下指**该授权用户可见范围**内的用户资料 lookup，非全网爬取） |
| `offline.access` | 允许获取 refresh token |

本页**不需要** `users.email`（邮箱由表单 Email 字段收集；X 邮箱需单独 scope 与合规评估）。

### 3.4 读取资料：GET /2/users/me

- **方法**：`GET https://api.x.com/2/users/me`
- **认证**：`Authorization: Bearer {USER_ACCESS_TOKEN}`（OAuth 2.0 User Context）
- **要求**：App-only Bearer **不可**调用 `/me`（见 Authenticated User Quickstart）。

**请求示例（拉齐基础信息字段）：**

```http
GET /2/users/me?user.fields=created_at,description,entities,location,profile_image_url,protected,public_metrics,url,verified,verified_type,withheld,pinned_tweet_id HTTP/1.1
Host: api.x.com
Authorization: Bearer {USER_ACCESS_TOKEN}
```

说明：

- **`id`、`name`、`username`** 为 User 对象默认返回字段，无需写入 `user.fields`。
- `user.fields` 中列出的是 Quickstart / User 对象文档中常见的**公开基础资料**扩展字段；若官方后续新增可选字段，**同步扩展 `user.fields` 并整包保存 `data` 节点**。
- **`pinned_tweet_id`** 仅 ID；本方案**不**申请 `tweet.read`，**不**再请求置顶帖正文；若产品将来需要正文，需单独评审 scope 与成本。
- **`public_metrics`** 为嵌套对象（如 followers_count、following_count、tweet_count、listed_count 等），**原样 JSON 存库**。

**落库约定（建议表 `seed_user_x_profile` 或 JSON 列）：**

| 存储项 | 内容 |
|--------|------|
| `x_user_id` | `data.id` |
| `x_username` | `data.username` |
| `x_name` | `data.name` |
| `x_profile_raw` | 接口返回的 **`data` 对象完整 JSON**（含上述全部字段及 `public_metrics`、`entities` 等） |
| `x_profile_fetched_at` | 服务端拉取时间 ISO8601 |
| OAuth 密文 | `access_token` / `refresh_token` 加密存储（若仅一次性验号，可在落库后按策略撤销 token） |

**响应结构（示意，字段以实时的 [User 对象](https://docs.x.com/x-api/data-dictionary/object-types/user) 为准）：**

```json
{
  "data": {
    "id": "2244994945",
    "name": "Display Name",
    "username": "handle",
    "created_at": "2015-12-14T04:33:35.000Z",
    "description": "...",
    "location": "...",
    "url": "https://...",
    "profile_image_url": "https://...",
    "protected": false,
    "verified": false,
    "verified_type": "none",
    "pinned_tweet_id": "1234567890",
    "public_metrics": {
      "followers_count": 0,
      "following_count": 0,
      "tweet_count": 0,
      "listed_count": 0
    },
    "entities": { "url": {}, "description": {} },
    "withheld": null
  }
}
```

### 3.5 原型说明

- 原型页点击 Connect X 为 **mock**，不请求 X API。
- 正式环境按 §3.3–§3.4 实现；前端注释与本文档一致。

---

## 4. 提交与验证码

1. 用户点击 **提交登记** → 前端校验必填与 X 已连接。  
2. 弹出 **安全验证** 层（非首屏），要求完成验证码。  
3. **生产建议**：接入 **Cloudflare Turnstile** 或 **hCaptcha**，后端 `siteverify` 通过后再写入 DB。  
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
  "x_username": "...",
  "x_profile_raw": { },
  "captcha_token": "<turnstile or hcaptcha token>"
}
```

说明：`x_profile_raw` 为 §3.4 中 `GET /2/users/me` 的 `data` 全量；若 OAuth 在服务端完成，也可仅传 `oauth_session_id`，由后端合并写入。

响应 `201` 后前端进入成功态；失败返回字段级错误。

---

## 7. 防刷

- 验证码（§4）+ 服务端 rate limit（IP / email / x_user_id）。  
- 同一 **`x_user_id` 或 Email** 仅允许登记一次（推荐）。

---

## 8. X API 预计成本（OAuth 2.0，仅基础资料）

> 定价以 **[X API Pricing](https://docs.x.com/x-api/getting-started/pricing)** 与 **Developer Console** 实时费率为准；以下为产品评估用 **量级估算**。

### 8.1 计费模型（与 OAuth 版本无关）

- 采用 **Pay-per-usage**：预购 **Credits**，按 API 调用扣减。  
- **OAuth 1.0a 与 OAuth 2.0 单价相同**；本页固定 **OAuth 2.0**，不因协议省费。  
- 用户浏览器完成 X 授权 **不** 按「读帖」计费；**`GET /2/users/me` 成功一次** 通常计为 **User: Read** 资源。

### 8.2 官方参考单价（Pricing 页，可能调整）

| 资源类型 | 参考单价 |
|----------|----------|
| **User: Read** | **$0.010 / resource**（每成功返回 1 个 User 对象计 1 resource） |
| Post: Read | $0.005 / resource（本页 **不** 使用） |

`/users/me` 属于 **User 资料读取**，按 **User: Read** 计费；**不在** Owned Reads（$0.001/资源）那组「读自己时间线/书签」endpoint 优惠列表内。

Token 接口 `POST /2/oauth2/token` 是否单独扣费以 Console 说明为准；种子场景下 **主要成本为每人 1 次 `/users/me`**。

### 8.3 单次登记成本（定稿方案）

| 步骤 | 是否计费 | 备注 |
|------|:--------:|------|
| OAuth 授权跳转 | 否 | 用户与 X 交互 |
| `POST /oauth2/token` | 以 Console 为准 | 通常远低于读 profile |
| **`GET /2/users/me`（全量 user.fields §3.4）** | **是** | **约 $0.01 / 人 / 次**（1 User resource） |
| 重复提交 / 重试 | 是 | 每次成功 `/me` 再计 1 resource；需幂等与防重 |

**不含**：读时间线、粉丝列表、发帖等（均未申请 scope）。

### 8.4 规模粗算（仅 `/users/me`，单价按 $0.010）

| 成功登记人数 | 约 API 成本（User Read） |
|-------------|-------------------------|
| 1,000 | **~$10** |
| 10,000 | **~$100** |
| 100,000 | **~$1,000** |

另需预留：

- Console **最低充值 / Credits 包**（无长期免费档的新开发者账号以当前政策为准）；  
- 失败重试、运维拉取导致的 **额外 `/me`**；  
- 与 X API **无关** 的验证码（Turnstile/hCaptcha 各自定价）。

建议在 Console 设置 **Spending limit**，并在后端对 `x_user_id` **授权成功后只拉一次 profile**。
