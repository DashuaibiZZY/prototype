# GA4 + Firebase 数据埋点

## 文档说明

本文档合并 **业务事件字典（产品维护）** 与 **开发接入说明（工程实现）**，适用于 **Web、Android、iOS** 三端，统一汇入同一 GA4 媒体资源。

- **第一步（账号与数据流）** 已完成；下文为已登记的环境信息。
- **事件字典** 由产品按业务增删改；开发以本表为唯一口径实现与联调。
- 不在 GA4 后台预先「创建」业务事件；代码上报后，事件会在 GA4 **管理 → 事件** 中自动出现。稳定后再将核心事件标为 **关键事件**。

---

## 1\. 环境与标识（已配置）

| 端 | 标识 | 值 |
|---|---|---|
| **Web** | GA4 衡量 ID | `G-21W14V9YPC` |
| **Web** | 数据流 ID | `16170638288` |
| **iOS** | Bundle ID | `com.velo.forx` |
| **iOS** | 数据流 ID | `16171023830` |
| **iOS** | Firebase 应用 ID | `1:928426449462:ios:c8ca37dd890b0746ab1697` |
| **Android** | 应用包名 | `com.velo.forx` |
| **Android** | 数据流 ID | `16171062236` |
| **Android** | Firebase 应用 ID | `1:928426449462:android:2a8fb732c279f4f0ab1697` |

配置文件（勿提交公开仓库）：

- Android：`google-services.json`（包名须为 `com.velo.forx`）
- iOS：`GoogleService-Info.plist`（Bundle ID 须为 `com.velo.forx`）

联调统一使用测试事件名：`analytics_test`（联调通过后保留或下线均可）。

---

## 2\. 命名与参数规范

| 规则 | 说明 |
|---|---|
| 事件名 | 小写英文 + 下划线，≤ 40 字符，如 `deposit_success` |
| 参数名 | 同上，如 `symbol`、`order_type` |
| 三端一致 | 同一业务动作，Web / Android / iOS **同一 `event_name`、同一套参数名** |
| 金额 | 建议 `amount`（number）+ `currency`（如 `USDT`），或统一 `amount_usd` |
| 禁止上报 | 邮箱、手机号、完整钱包地址、证件号、完整 IP 等 PII |

**变更**：已上线事件名不修改（改名将产生新事件序列）；废弃事件停止上报即可，历史数据保留。

---

## 3\. 业务事件字典（产品维护）

说明：

- **P0**：首期必做，用于核心漏斗与留存。
- **P1**：第二期按需扩展。
- 列 **Web / Android / iOS** 表示该端是否需要上报（✓ / —）。
- 参数类型：`string` / `number` / `boolean`；示例仅供联调参考。

### 3\.1 P0 事件

| event_name | 中文说明 | 触发时机 | Web | Android | iOS | 参数（name: 类型，说明） | 关键事件 |
|---|---|---|---|---|---|---|---|
| `sign_up_complete` | 注册完成 | 账户创建成功并进入可交易态前首页 | ✓ | ✓ | ✓ | `method`: string，wallet / email | 是 |
| `login_success` | 登录成功 | 获得有效 Session 后一次 | ✓ | ✓ | ✓ | `method`: string | 否 |
| `logout` | 退出登录 | 用户主动退出或 Session 失效清本地态时（择一口径） | ✓ | ✓ | ✓ | — | 否 |
| `kyc_submit` | KYC 提交 | 用户提交 KYC 且接口返回成功 | ✓ | ✓ | ✓ | `kyc_level`: string，可选 | 是 |
| `deposit_success` | 充值成功 | 到账确认（与资金模块口径一致） | ✓ | ✓ | ✓ | `currency`: string；`amount`: number | 是 |
| `withdraw_submit` | 提现提交 | 用户提交提现且校验通过 | ✓ | ✓ | ✓ | `currency`: string；`amount`: number | 否 |
| `order_submit` | 下单提交 | 订单被交易系统接受 | ✓ | ✓ | ✓ | `symbol`: string；`side`: buy/sell；`order_type`: limit/market/… | 是 |
| `position_close` | 平仓 | 仓位平仓成交或完全关闭（与交易 PRD 一致） | ✓ | ✓ | ✓ | `symbol`: string；`close_type`: string，可选 | 否 |
| `screen_view` | 页面浏览 | 进入主要页面时（App 可用 Firebase 自动 screen；Web 用自定义或 page_view） | ✓ | ✓ | ✓ | `screen_name`: string；`screen_class`: string，可选 | 否 |

### 3\.2 P1 事件（示例，按需删减）

| event_name | 中文说明 | 触发时机 | Web | Android | iOS | 参数 | 关键事件 |
|---|---|---|---|---|---|---|---|
| `invite_share` | 邀请分享 | 用户触发分享或复制邀请链接 | ✓ | ✓ | ✓ | `channel`: link / poster | 否 |
| `campaign_view` | 活动曝光 | 活动详情页展示 | ✓ | ✓ | ✓ | `campaign_id`: string | 否 |
| `campaign_join` | 参与活动 | 报名或参与成功 | ✓ | ✓ | ✓ | `campaign_id`: string | 否 |
| `coupon_redeem` | 卡券使用 | 卡券核销成功 | ✓ | ✓ | ✓ | `coupon_type`: string | 否 |
| `partner_center_view` | 合伙人中心 | 进入合伙人中心 Hub | ✓ | ✓ | ✓ | — | 否 |

### 3\.3 待补充（产品填写）

| event_name | 中文说明 | 触发时机 | Web | Android | iOS | 参数 | 关键事件 |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

---

## 4\. 开发接入说明

### 4\.1 总体

```
Web     → gtag（或 GTM）→ 衡量 ID G-21W14V9YPC
Android → Firebase Analytics → 数据流 16171062236
iOS     → Firebase Analytics → 数据流 16171023830
```

建议各端封装唯一入口 `track(eventName, params)`，内做：字典校验（Debug）、参数脱敏、环境区分（预发/生产 Firebase 项目若拆分）。

### 4\.2 Web

**全站加载 GA4（衡量 ID 固定为 `G-21W14V9YPC`）**

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-21W14V9YPC"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-21W14V9YPC');
</script>
```

**业务埋点示例（与 §3 字典一致）**

```javascript
gtag('event', 'order_submit', {
  symbol: 'BTC-USDT',
  side: 'buy',
  order_type: 'limit'
});

// 联调
gtag('event', 'analytics_test', { source: 'web' });
```

**自测**：GA4 → 报告 → **实时**；或 GTM 预览模式。

### 4\.3 Android（Kotlin）

依赖与 `google-services.json` 按 [Firebase Android 入门](https://firebase.google.com/docs/android/setup) 配置；包名 `com.velo.forx`。

```kotlin
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.logEvent

val analytics = Firebase.analytics

fun trackOrderSubmit(symbol: String, side: String, orderType: String) {
    analytics.logEvent("order_submit") {
        param("symbol", symbol)
        param("side", side)
        param("order_type", orderType)
    }
}

// 联调
analytics.logEvent("analytics_test") {
    param("source", "android")
}
```

**DebugView**（开发包）：

```bash
adb shell setprop debug.firebase.analytics.app com.velo.forx
```

Firebase Console → Analytics → **DebugView** 查看 `analytics_test`。

### 4\.4 iOS（Swift）

`GoogleService-Info.plist` 与 SDK 按 [Firebase iOS 入门](https://firebase.google.com/docs/ios/setup) 配置；Bundle ID `com.velo.forx`。

```swift
import FirebaseAnalytics

func trackOrderSubmit(symbol: String, side: String, orderType: String) {
    Analytics.logEvent("order_submit", parameters: [
        "symbol": symbol,
        "side": side,
        "order_type": orderType
    ])
}

// 联调
Analytics.logEvent("analytics_test", parameters: ["source": "ios"])
```

**DebugView**：Xcode → Edit Scheme → Run → Arguments → 添加 `-FIRDebugEnabled`（仅 Debug 配置）。

### 4\.5 联调与验收

| 步骤 | 负责人 | 通过标准 |
|---|---|---|
| 各端上报 `analytics_test` | 开发 | DebugView（App）或 GA4 实时（Web）可见 |
| §3.1 P0 事件按字典实现 | 开发 | 产品抽测 1 条真实路径，参数与表一致 |
| 标关键事件 | 产品 + 数据 | GA4 管理 → 事件 → 将表中「关键事件=是」项标记 |
| 隐私 | 法务 / 产品 | 隐私政策已披露；参数无 PII |

---

## 5\. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-10-21 | 0.1 | 初版：环境信息 + P0/P1 事件字典模板 + 三端示例 |
