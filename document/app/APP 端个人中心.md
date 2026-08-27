# APP 端个人中心

**原型（个人中心）**：[https://dashuaibizzy.github.io/prototype/perp_dex/app/个人中心.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/个人中心.html)

**原型（个人资料）**：[https://dashuaibizzy.github.io/prototype/perp_dex/app/个人资料.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/个人资料.html)

**原型（设置）**：[https://dashuaibizzy.github.io/prototype/perp_dex/app/设置.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/设置.html)

**原型（身份验证器）**：[https://dashuaibizzy.github.io/prototype/perp_dex/app/身份验证器.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/身份验证器.html)

页面截图：[**App · 个人中心（钱包登录）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-hub-wallet.png)

---

## 1\. 页面概述

### 1\.1 功能定位

个人中心是 ForX App 的**账户与权益聚合入口**，与底部 Tab「资产」分工明确：

| 模块 | 职责 |
|---|---|
| **个人中心**（本需求） | 账户身份展示、快捷充提/交易、活动与权益导航、设置入口；**不承担**完整资产明细与多账户余额拆解 |
| **资产 Tab** | 总资产估值、资金/合约账户余额、充提划转操作区、流水入口 |

个人中心从**首页顶部左侧人像图标**进入；设置从个人中心右上角齿轮进入。个人中心**不是**底部 Tab 页面，返回后落点一般为首页（或进入前的页面栈上一级）。

### 1\.2 登录方式与账户模型（业务约束）

平台支持两种登录方式，**互斥**，登录后**不支持**再关联或切换另一种登录方式：

邮箱登录用户的身份标识为注册/登录邮箱；**个人资料页不展示** Privy 自动生成的链上钱包地址行（该地址仍可在后台与链上能力中使用，但不在用户端资料页露出）。

| 登录方式 | 身份标识 | 钱包地址来源 | 身份验证器 |
|---|---|---|---|
| **钱包登录** | 用户连接的外部钱包地址 | 用户授权连接的钱包 | **不展示**绑定入口 |
| **邮箱登录** | 注册/登录邮箱 | Privy 为账号**自动生成**的链上地址（用户端资料页**不展示**） | **展示**绑定/管理入口 |

### 1\.3 全局规则

- 页面内跳转均为 App 内原生路由；隐私政策、服务条款、帮助文档等外链通过 WebView 或系统浏览器打开（以客户端统一策略为准）。
- 需登录态的入口（快捷充提、划转、部分权益页）在未登录时走统一登录引导，登录成功后按 `redirectUrl` 回跳原目标（与全站登录拦截一致）。
- 列表类入口（VIP、活动、积分等）跳转至各业务模块已有页面，本模块不重复实现业务详情。
- 网络异常时：账户信息区可展示上次缓存 + 刷新；跳转类入口仍可进入，目标页自行处理加载失败。

### 1\.4 页面关系总览

```Plain Text
首页（人像入口）
    ↓
个人中心
├─ 左上角返回 → 首页（或上一页）
├─ 右上角设置 → 设置页
├─ 账户信息行 → 个人资料页
├─ 快捷入口（4）
├─ 活动和奖励（5）
└─ 更多（2）

个人资料页
├─ 返回 → 个人中心
├─ 身份验证器入口（仅邮箱登录）
├─ VIP 费率区块 → VIP 费率等级页
└─ 复制（UID / 邮箱 / 地址）

设置页
├─ 账户安全（仅邮箱登录）→ 身份验证器页
├─ 币种 / 语言 / 主题子页
├─ 隐私政策 / 服务条款
└─ 关于 ForX 子页

身份验证器页
├─ 未绑定引导
├─ 绑定：扫码/密钥 → 验证码确认
├─ 已绑定管理：修改 / 移除
└─ 修改：验证旧码 → 重新绑定流程
```

页面截图：[**App · 个人中心（邮箱登录）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-hub-email.png)

---

## 2\. 个人中心主页面

### 2\.1 整体布局

页面截图：[**App · 个人中心整体（钱包）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-hub-wallet.png)

- **单列纵向滚动**，无页面级标题文案（顶部仅返回与设置，中间留白）。
- 自上而下：账户信息行 → 分割线 → 快捷入口 → 分割线 → 活动和奖励 → 分割线 → 更多。
- **不展示**底部 Tab 高亮变化（仍停留在进入前的 Tab，通常为首页）。

### 2\.2 顶部栏

页面截图：[**App · 个人中心顶部栏**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-hub-header.png)

| 位置 | 元素 | 行为 |
|---|---|---|
| 左侧 | 返回箭头 | 返回上一页；从首页进入时返回首页 |
| 中间 | 无标题 | 刻意留白，不以「个人中心」作为顶栏标题 |
| 右侧 | 设置（齿轮） | 进入设置页；邮箱登录态进入时设置页展示「账户安全」分区 |

### 2\.3 账户信息行

页面截图：[**App · 账户信息行**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-account-row.png)

**功能描述**  

展示当前用户最简身份摘要，整行可点击进入个人资料详情。

**展示内容**

| 元素 | 说明 |
|---|---|
| 左侧头像区 | 默认人像图标（不支持用户上传头像为 V1 范围外，若后续支持则替换为头像图） |
| 主文案 | `UID：` + 数字 UID，示例 `UID：10002345` |
| 副文案 | 登录方式相关的简化标识，单行截断 |
| 右侧 | 向右箭头，表示可进入下一级 |

**副文案规则**

| 登录方式 | 副文案内容 | 示例 |
|---|---|---|
| 钱包登录 | 简化钱包地址 | `0x7a3f...9c2e` |
| 邮箱登录 | 简化邮箱 | `u***@forx.fi`（中间段打星，保留域名） |

**交互**

- 点击整行（含箭头）→ 个人资料页。
- 长按副文案（可选实现）：快捷复制完整邮箱或地址；若不做长按，复制仅在个人资料页提供。

**数据与异常**

- UID、副文案依赖用户中心接口；加载中可展示骨架或 `--`；失败时副文案可为「加载失败」，行仍可点击进入资料页尝试刷新。

### 2\.4 快捷入口

页面截图：[**App · 快捷入口**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-quick-entry.png)

**分区标题**：`快捷入口`（灰色小标题，左对齐）。

**布局**：一行 **4 列**图标宫格，图标 + 短标签。

| 序号 | 标签 | 跳转目标 | 说明 |
|---|---|---|---|
| 1 | 永续交易 | 合约交易页 | 底部 Tab 交易页 |
| 2 | 充值 | 充值页 | 需登录 |
| 3 | 提现 | 提现页 | 需登录 |
| 4 | 划转 | 划转页 | 需登录；账户内资金划转 |

**交互**

- 点击图标区域跳转对应页面。
- 未登录点击充提/划转：弹出登录引导，成功后回跳目标页。

### 2\.5 活动和奖励

页面截图：[**App · 活动和奖励入口**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-rewards-grid.png)

**分区标题**：`活动和奖励`。

**布局**：**4 列**图标宫格；本区共 **5 个**入口，第 5 个「我的卡券」独占下一行第一列（与 VIP、活动等**同款宫格样式**，不使用横条列表样式）。

| 序号 | 标签 | 跳转目标 |
|---|---|---|
| 1 | VIP | VIP 费率等级页 |
| 2 | 热门活动 | 活动中心页 |
| 3 | 积分 | 积分页 |
| 4 | 邀请赚币 | 邀请返佣页 |
| 5 | 我的卡券 | 卡券中心页 |

**交互**

- 各入口点击跳转；未登录时按各业务模块既有规则拦截或展示游客态（与奖励中心权益卡片策略对齐）。

### 2\.6 更多

页面截图：[**App · 更多入口**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-more-grid.png)

**分区标题**：`更多`。

**布局**：**2 列**宫格（仅占半宽区域，左对齐两格）。

| 标签 | 跳转目标 | 说明 |
|---|---|---|
| 公告 | 消息中心页 | 默认进入消息中心，由消息中心承接公告类消息 |
| 文档 | 帮助文档 | 外链或内置帮助中心 URL，由运营配置 |

### 2\.7 个人中心 · 登录态差异汇总

页面截图：[**App · 个人中心（邮箱登录）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-hub-email.png)

| 能力 | 钱包登录 | 邮箱登录 |
|---|---|---|
| 账户行副文案 | 简化钱包地址 | 简化邮箱 |
| 个人资料 · 邮箱行 | 不展示 | 展示 |
| 个人资料 · Privy 钱包行 | 不展示 | **不展示** |
| 个人资料 · 身份验证器入口 | 不展示 | 展示 |
| 设置 · 账户安全 | 不展示 | 展示 |

---

## 3\. 个人资料子页面

**路由**：个人中心账户信息行进入。

**原型**：[个人资料.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/个人资料.html)（全状态平铺：① 钱包登录 · ② 邮箱 + 验证器未设置 · ③ 邮箱 + 验证器已设置）

页面截图：[**App · 个人资料（钱包登录）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-detail-wallet.png)

### 3\.1 顶部导航栏

| 位置 | 元素 |
|---|---|
| 左侧 | 返回 → 个人中心 |
| 中间 | 标题「个人资料」 |
| 右侧 | 占位，无操作按钮 |

### 3\.2 头像区

- 页面顶部居中展示大号默认人像图标（与账户行头像风格一致，尺寸更大）。
- V1 不支持编辑头像；无「更换头像」入口。

### 3\.3 信息卡片列表

页面截图：[**App · 个人资料（邮箱登录）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-detail-email.png)

所有卡片**左右边距一致**（与页面 `padding` 对齐），圆角白底卡片 + 卡片间距统一；VIP 卡片宽度与其他卡片**拉齐**，不得缩进或全宽例外。

**卡片顺序（自上而下）**

| 登录方式 | 卡片顺序 |
|---|---|
| 钱包登录 | 钱包地址 → UID → VIP 等级与合约费率 |
| 邮箱登录 | 邮箱地址 → UID → 身份验证器 App → VIP 等级与合约费率 |

#### 3\.3\.1 钱包登录 · 钱包地址卡片

| 字段 | 说明 |
|---|---|
| 标签 | `钱包地址` |
| 内容 | 简化地址展示，如 `0x7a3f...9c2e` |
| 操作 | 「复制」按钮，复制**完整**钱包地址 |

#### 3\.3\.2 邮箱登录 · 邮箱地址卡片

| 字段 | 说明 |
|---|---|
| 标签 | `邮箱地址` |
| 内容 | 简化邮箱，如 `u***@forx.fi` |
| 操作 | 「复制」→ 完整邮箱 |

#### 3\.3\.3 UID 卡片（两种登录均展示）

| 字段 | 说明 |
|---|---|
| 内容 | `UID：` + 数字 |
| 操作 | 「复制」→ 纯数字 UID 或带 `UID：` 前缀（与后台查询口径一致，建议仅数字） |

复制成功：Toast「已复制」；失败提示「复制失败，请重试」。

#### 3\.3\.4 邮箱登录 · 身份验证器 App 卡片

| 元素 | 说明 |
|---|---|
| 主标题 | `身份验证器 App` |
| 副标题 | 未绑定：`未绑定`；已绑定：`已绑定`（或「已启用动态验证码保护」） |
| 状态标签 | 未绑定：橙色 `未设置`；已绑定：绿色 `已绑定` |
| 右侧 | 箭头，进入身份验证器页 |

**业务说明**：身份验证器用于账户安全增强（动态验证码/TOTP），**不强制绑定于提币流程**；具体在哪些操作触发验证由安全策略配置，本页仅展示绑定状态与入口。卡片位于 **UID 下方**、VIP 卡片上方。

#### 3\.3\.5 VIP 等级与合约费率卡片（可点击）

页面截图：[**App · VIP 等级与合约费率卡**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-profile-detail-vip-card.png)

整卡点击进入 **VIP 费率等级页**。

**卡片结构**

1. 第一行：`VIP 等级` + 右侧等级标签（如 `VIP 1`，琥珀色胶囊）。
2. 分割线。
3. 小标题：`合约费率`。
4. 费率行：左侧 Maker 费率 / 中间 `/` / 右侧 Taker 费率 + **最右侧箭头**（再次强调可进入 VIP 页）。

| 字段 | 数据来源 | 展示格式 |
|---|---|---|
| Maker | 用户当前 VIP 档位 | 百分比，如 `0.020%` |
| Taker | 用户当前 VIP 档位 | 百分比，如 `0.050%` |

加载失败：费率展示 `--`，卡片仍可点击进入 VIP 页查看说明。

---

## 4\. 设置子页面

**路由**：个人中心右上角设置进入；系统返回键与左上角返回均回到个人中心（或页面栈上一级）。

**原型**：[设置.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/设置.html)

页面截图：[**App · 设置主页（钱包登录）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-settings-main-wallet.png)

### 4\.1 设置主页 · 顶部栏

| 位置 | 元素 |
|---|---|
| 左侧 | 返回 |
| 中间 | 标题「设置」 |

### 4\.2 设置列表结构

自上而下：

```Plain Text
[账户安全]（仅邮箱登录）
  └─ 身份验证器 App

[通用]
  ├─ 币种设置 → 子页
  ├─ 语言设置 → 子页
  ├─ 主题模式 → 子页
  ├─ 隐私政策 → 外链
  ├─ 服务条款 → 外链
  └─ 关于 ForX → 子页

[底部]
  └─ 社交媒体图标（X / Discord / Telegram 等，链到官方社群）
```

### 4\.3 账户安全（仅邮箱登录）

页面截图：[**App · 设置主页（邮箱登录 · 账户安全）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-settings-main-email.png)

| 项 | 右侧展示 | 点击行为 |
|---|---|---|
| 身份验证器 App | 状态标签 + 箭头 | 进入身份验证器页 |

**状态标签**

| 状态 | 文案 | 样式 |
|---|---|---|
| 未绑定 | `未绑定` | 橙色/警告色 |
| 已绑定 | `已绑定` | 绿色 |

钱包登录用户**不展示**整个「账户安全」分区（含分区标题）。

### 4\.4 币种设置子页

页面截图：[**App · 币种设置子页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-settings-currency.png)

**进入**：设置主页「币种设置」行。

**顶栏**：返回 → 关闭子页回到设置主页；标题「币种设置」。

**选项**（单选，选中即时生效并写本地偏好，并同步服务端若已有用户配置接口）：

| 顺序 | 选项 |
|---|---|
| 1 | 美元 (USD) |
| 2 | 日元 (JPY) |
| 3 | 韩元 (KRW) |
| 4 | 欧元 (EUR) |
| 5 | 人民币 (CNY) |

**规则**

- 默认选中用户上次选择；无记录时默认 USD。
- 切换后设置主页「币种设置」行右侧摘要更新为当前选项文案。
- 影响范围：App 内资产估值、部分法币折算展示（与全站币种偏好一致，具体字段由全局配置定义）。

### 4\.5 语言设置子页

页面截图：[**App · 语言设置子页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-settings-language.png)

**选项**（单选）：

- English
- 繁體中文
- 简体中文（默认）
- 日本語

切换后触发 App 语言包切换（若采用跟随系统策略，则本页可改为「跟随系统 / 自定义」——以客户端 i18n 方案为准）；返回设置主页后右侧展示当前语言。

### 4\.6 主题模式子页

页面截图：[**App · 主题模式子页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-settings-theme.png)

**选项**（单选）：

- 日间模式（默认）
- 夜间模式

切换后立即应用主题；状态持久化本地。

### 4\.7 隐私政策与服务条款

- 点击行进入对应 H5 或内置 WebView。
- 右侧仅箭头，无状态文案。
- URL 由运营/法务配置，支持多语言版本跳转。

### 4\.8 关于 ForX 子页

页面截图：[**App · 关于 ForX 子页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-settings-about.png)

**顶栏**：仅左侧返回，**中间无标题**（顶部留白，与原型一致）。

**内容区**

| 区域 | 内容 |
|---|---|
| 上部居中 | ForX Logo、应用名、版本号（如 `版本：v1.1.0`） |
| 列表 | 检查更新：右侧版本号 + 若有新版本展示 `New` 红点标签 |
| 列表 | 电子邮件：`support@forx.fi`（只读，不可点击发邮件或可复制） |

**检查更新**

- 点击行触发版本检查；有新版本走 App 更新流程（应用商店或热更新策略由客户端定义）。
- 无新版本：Toast「当前已是最新版本」。

### 4\.9 底部社交媒体区

- 设置主页底部固定展示官方社群图标，点击外链。
- 与列表滚动区分离，浅分割线上方的列表可滚动，底部图标区常驻（或随页滚动，以设计稿为准；原型为列表底部分割 + 图标区）。

---

## 5\. 身份验证器 App 子页面

**路由**

- 设置 → 账户安全 → 身份验证器 App
- 个人资料 → 身份验证器 App 卡片

**原型**：[身份验证器.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/身份验证器.html)

**适用范围**：仅**邮箱登录**用户；钱包登录用户不应通过路由直接进入（若 DeepLink 命中则提示「当前登录方式不支持」并返回）。

**技术标准**：TOTP（RFC 6238），兼容 Google Authenticator、Microsoft Authenticator 等；密钥 6 位数字动态码，周期 30 秒。

页面截图：[**App · 身份验证器 · 未绑定引导**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-totp-not-set.png)

### 5\.1 状态机总览

```Plain Text
未绑定
  → [立即绑定] → 扫码/密钥页 → 验证码确认 → 已绑定

已绑定
  → [修改验证器] → 验证旧码 → 扫码/密钥页 → 验证码确认 → 已绑定（新密钥）
  → [移除验证器] → 风险提示 + 验证动态码 → 未绑定
```

### 5\.2 未绑定 · 引导页

页面截图：[**App · 身份验证器 · 未绑定引导**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-totp-not-set.png)

**顶栏**：返回（设置/个人资料）；标题「身份验证器 App」。

**内容**

| 元素 | 文案/说明 |
|---|---|
| 图标 | 手机/验证器示意 |
| 主标题 | `绑定身份验证器 App` |
| 说明 | `绑定后可使用动态验证码保护账户安全。`（不做提币强引导） |
| 辅助 | `支持 Google Authenticator、Microsoft Authenticator 等标准 TOTP 应用` |
| 主按钮 | `立即绑定` → 进入扫码/密钥页 |

**不出现**：「为何必须绑定」「提币必选」等强引导琥珀色说明块。

### 5\.3 绑定 · 扫码/密钥页

页面截图：[**App · 身份验证器 · 扫码绑定**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-totp-setup-qr.png)

**顶栏**：返回 → 未绑定引导页；标题「绑定验证器」。

**内容**

1. 说明：`使用身份验证器 App 扫描下方二维码，或手动输入密钥`
2. **二维码**：服务端下发的 TOTP 绑定 QR（含 issuer、账号标识）；加载失败展示刷新。
3. **手动密钥**：分段展示密钥字符串；提供「复制密钥」。
4. 主按钮：`下一步` → 验证码确认页（未扫码也可手动输入密钥后下一步）。

**安全**

- 密钥仅在一次绑定流程中展示；绑定成功后不可再次查看完整密钥（修改流程重新下发新密钥）。

### 5\.4 绑定 · 验证码确认页

页面截图：[**App · 身份验证器 · 验证码确认**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-totp-setup-verify.png)

**顶栏**：返回 → 扫码/密钥页；标题「验证绑定」。

**内容**

- 主文案：`输入验证器中的 6 位验证码`
- 副文案：`验证码每 30 秒更新一次`
- **6 格数字输入框**：仅数字；支持自动焦点跳格与退格回退。
- 主按钮：`确认绑定`

**校验逻辑**

| 结果 | 表现 |
|---|---|
| 验证码正确 | 绑定成功 → 已绑定管理页；Toast「绑定成功」；同步更新设置/个人资料状态标签 |
| 验证码错误 | 行内错误提示「验证码错误」；输入框可清空重试 |
| 验证码过期 | 提示「验证码已过期，请重新输入」 |
| 连续失败 N 次 | 冷却 5 分钟（N 由风控配置，建议 5 次） |

### 5\.5 已绑定 · 管理页

页面截图：[**App · 身份验证器 · 已绑定管理**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-totp-bound.png)

**顶栏**：返回；标题「身份验证器 App」。

**状态卡片**

| 元素 | 内容 |
|---|---|
| 图标 | 绿色成功勾 |
| 主文案 | `已绑定身份验证器` |
| 副文案 | `已启用动态验证码保护` |
| 标签 | `安全等级：高` |

**操作区**

| 按钮 | 说明 |
|---|---|
| 修改验证器 | 进入「验证旧码」页 |
| 移除验证器 | 进入「移除确认」页 |

辅助灰字：

- 修改下：`更换手机或验证器 App 时需重新绑定`
- 移除下：`移除后账户安全等级将降低`（不特指提币）

### 5\.6 修改验证器 · 验证旧码页

页面截图：[**App · 身份验证器 · 修改验证旧码**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-totp-modify.png)

**顶栏**：返回 → 已绑定管理页；标题「修改验证器」。

**内容**

- 主文案：`验证当前身份验证器`
- 副文案：`请输入旧验证器中的 6 位动态码以继续`
- 6 格输入 + 主按钮 `下一步`

**成功**：进入**新绑定**扫码/密钥页（与 5\.3 相同，服务端轮换 secret）。

**失败**：同 5\.4 错误处理。

### 5\.7 移除验证器 · 安全确认页

页面截图：[**App · 身份验证器 · 移除确认**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/个人中心-app/app-totp-remove.png)

**顶栏**：返回 → 已绑定管理页；标题「移除验证器」。

**风险提示块**（红色浅底）

- 标题：`安全风险提示`
- 正文：`移除后将无法使用验证器进行安全验证。建议仅在无法继续使用当前验证器时操作。`

**验证**

- 主文案：`输入验证器动态码确认移除`
- 6 格输入

**按钮**

| 按钮 | 行为 |
|---|---|
| 确认移除（危险样式） | 校验通过 → 解除绑定 → 回到未绑定引导态；Toast「验证器已移除」 |
| 取消 | 返回已绑定管理页 |

移除成功后：设置与个人资料中状态同步为「未绑定 / 未设置」。

### 5\.8 身份验证器 · 异常与边界

| 场景 | 处理 |
|---|---|
| 绑定流程中途返回 | 未点确认绑定则 secret 不生效；再次进入从未绑定或继续未完成步骤（以服务端是否已预注册 secret 为准） |
| 账号在绑定中被登出 | 终止流程，回登录页 |
| 网络失败 | 提交验证码/获取 QR 失败时 Toast + 重试按钮 |
| 同账号多端 | 以服务端最新绑定状态为准；一端移除后另一端刷新状态 |

---

## 6\. 入口与路由汇总

| 来源 | 目标 | 备注 |
|---|---|---|
| 首页 · 左上角人像 | 个人中心 | 主入口 |
| 资产页 · 左上角人像 | 个人中心 | 与首页同一 hub |
| 个人中心 · 设置 | 设置页 | |
| 个人中心 · 账户行 | 个人资料 | |
| 个人资料 · 身份验证器 | 身份验证器 | 仅邮箱 |
| 设置 · 身份验证器 | 身份验证器 | 仅邮箱 |
| 快捷入口 / 活动入口 | 各业务页 | 见 2\.4、2\.5 |
| 个人资料 · VIP 卡 | VIP 费率等级页 | |