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
| **参数必填** | 字典中列出的参数 **全部必传**；不允许省略、不允许「可选」；无法取真实值时按各参数「无法取值时」栏传约定占位值 |
| 参数写法 | 下表统一为：`参数名`（类型）【中文含义】。取值：…；无法取值时：… |

**变更**：已上线事件名不修改（改名将产生新事件序列）；废弃事件停止上报即可，历史数据保留。

---

## 3\. 业务事件字典（产品维护）

说明：

- **P0**：首期必做，用于核心漏斗与留存。
- **P1**：第二期按需扩展。
- 列 **Web / Android / iOS** 表示该端是否需要上报（✓ / —）。
- **参数** 列：该事件上报时必须携带的全部键值；开发按字面含义赋值即可。

### 3\.1 P0 事件

| event_name | 中文说明 | 触发时机 | Web | Android | iOS | 参数（全部必填） | 关键事件 |
|---|---|---|---|---|---|---|---|
| `sign_up_complete` | 注册完成 | 账户创建成功并进入可交易态前首页 | ✓ | ✓ | ✓ | `method`（string）【注册方式】。取值：`wallet` / `email` | 是 |
| `login_success` | 登录成功 | 获得有效 Session 后上报一次 | ✓ | ✓ | ✓ | `method`（string）【登录方式】。取值：`wallet` / `email` | 否 |
| `logout` | 退出登录 | 本地 Session 清除完成时上报 | ✓ | ✓ | ✓ | `logout_type`（string）【退出类型】。取值：`user_initiated`（用户点击退出）/ `session_expired`（会话过期被动退出） | 否 |
| `kyc_submit` | KYC 提交 | 用户提交 KYC 且接口返回成功 | ✓ | ✓ | ✓ | `kyc_level`（string）【本次提交的 KYC 等级或步骤标识】。取值：与后台 KYC 配置一致，如 `l1` / `l2`；无法分级时传 `default` | 是 |
| `deposit_success` | 充值成功 | 到账确认（与资金模块口径一致） | ✓ | ✓ | ✓ | `currency`（string）【到账币种】。如 `USDT`<br>`amount`（number）【到账数量】。法币或稳定币数值，不含千分位 | 是 |
| `withdraw_submit` | 提现提交 | 用户提交提现且校验通过 | ✓ | ✓ | ✓ | `currency`（string）【提现币种】<br>`amount`（number）【提现申请数量】 | 否 |

合约相关动作与页面见 **§3.2**。

### 3\.2 合约交易事件

**公共枚举（本节多处复用）**

| 参数名 | 含义 | 取值 |
|---|---|---|
| `entry_source` | 进入当前页/弹窗的上级入口 | 各端路由名或模块名，如 `markets` / `home` / `trade` / `position_tab`；无法识别时统一传 `unknown` |
| `symbol` | 合约交易对 | 与行情、下单一致，如 `BTCUSDC` |
| `side` | 买卖方向 | `buy` / `sell` |
| `order_type` | 委托类型 | `limit` / `market` / `TPSL` / `Post_Only` / `FOK` / `IOC` |
| `position_side` | 持仓方向 | `long` / `short` |
| `close_ratio` | 平仓数量占该仓位可平数量的比例 | number；全平传 `-` |
| `error_code` | 失败错误码 | 接口返回码；仅前端拦截无码时传 `client_validation` |
| `close_order_location` | 平仓下单位置 | `trade_terminal`（交易终端内）/ `position_tab_standard`（持仓 Tab 标准平仓弹窗或表单）/ `position_tab_quick`（持仓 Tab 快捷平仓） |

| event_name | 中文说明 | 触发时机 | Web | Android | iOS | 参数（全部必填） | 关键事件 |
|---|---|---|---|---|---|---|---|
| `trade_page_view` | 交易页面浏览 | 合约交易主页面首屏就绪，或切换交易对后新 `symbol` 页面就绪 | ✓ | ✓ | ✓ | `symbol`（string）【当前交易对】<br>`entry_source`（string）【进入交易页的入口】 | 否 |
| `contract_order_submit` | 合约下单 | 开仓/加仓类委托被交易系统接受（非平仓单） | ✓ | ✓ | ✓ | `symbol`【交易对】<br>`side`【买卖方向】<br>`order_type`【委托类型】<br>`position_side`【持仓方向】 | 是 |
| `contract_order_submit_fail` | 下单失败 | 委托未形成有效订单（前端拦截或接口拒绝） | ✓ | ✓ | ✓ | `symbol`【交易对】<br>`error_code`【错误码】 | 否 |
| `contract_close_order_submit` | 平仓下单 | 平仓委托被交易系统接受（交易终端、持仓 Tab 标准平仓、持仓 Tab 快捷平仓统一上报） | ✓ | ✓ | ✓ | `symbol`【交易对】<br>`order_type`【委托类型】<br>`close_order_location`【平仓下单位置】 | 否 |
| `position_close_all_submit` | 一键平仓 | 一键平仓请求被系统接受 | ✓ | ✓ | ✓ | `symbol_count`（number）【本次平仓涉及的交易对个数】。仅平当前页交易对传 `1`；平多个传实际个数 | 是 |
| `position_share_click` | 点击持仓分享 | 点击持仓盈亏分享/海报入口 | ✓ | ✓ | ✓ | `symbol`【交易对】<br>`share_channel`（string）【分享形式】。取值：`poster` / `link` / `other` | 否 |
| `order_modify_submit` | 修改委托 | 修改未成交委托且保存成功 | ✓ | ✓ | ✓ | `symbol`【交易对】<br>`order_id`（string）【订单 ID】。传系统内部订单号，勿传钱包/邮箱 | 否 |
| `tpsl_order_modify_submit` | 修改止盈止损委托 | 修改止盈/止损条件单且保存成功 | ✓ | ✓ | ✓ | `symbol`【交易对】<br>`tpsl_type`（string）【修改类型】。取值：`tp` / `sl` / `both` | 否 |
| `order_cancel_all_submit` | 一键撤单 | 一键撤单请求成功 | ✓ | ✓ | ✓ | `symbol`（string）【交易对】。仅撤该交易对挂单传具体 `symbol`；撤全部挂单传 `ALL`<br>`cancel_scope`（string）【撤单范围】。取值：`single_symbol` / `all_symbols` | 否 |
| `contract_depth_modal_view` | 合约深度窗口浏览 | Web 合约页打开深度弹窗/侧栏并展示 | ✓ | — | — | `symbol`【交易对】<br>`entry_source`【从交易页哪个控件打开，如 `trade_chart_toolbar`；无法识别传 `unknown`】 | 否 |
| `funding_rate_modal_view` | 资金费率详情窗口预览 | Web 合约页打开资金费率详情弹窗 | ✓ | — | — | `symbol`【交易对】<br>`entry_source`【入口标识】 | 否 |
| `contract_detail_modal_view` | 合约详情窗口预览 | Web 合约页打开合约详情弹窗 | ✓ | — | — | `symbol`【交易对】<br>`entry_source`【入口标识】 | 否 |
| `portfolio_page_view` | 投资组合页浏览 | Web 投资组合页首屏展示 | ✓ | — | — | `entry_source`【进入投资组合页的入口】 | 否 |
| `vip_fee_modal_view` | VIP 费率弹窗浏览 | Web 打开 VIP 费率弹窗 | ✓ | — | — | `entry_source`【触发弹窗的入口，如 `nav_user_menu` / `trade_fee_link`】 | 否 |
| `home_page_view` | 首页预览 | App 首页首屏展示 | — | ✓ | ✓ | `entry_source`【进入首页方式，冷启动传 `app_launch`，其他传上级路由名】 | 否 |
| `contract_bill_page_view` | 合约流水页预览 | App 合约流水页首屏展示 | — | ✓ | ✓ | `entry_source`【进入流水页的入口】 | 否 |
| `contract_order_detail_page_view` | 合约订单详情页预览 | App 进入合约订单详情页 | — | ✓ | ✓ | `order_id`【订单 ID】<br>`entry_source`【从哪个列表/入口进入】 | 否 |
| `markets_page_view` | 行情页预览 | App 行情列表页首屏展示 | — | ✓ | ✓ | `entry_source`【进入行情 Tab/页的入口】 | 否 |
| `market_detail_page_view` | 行情详情页预览 | App 行情详情页首屏展示 | — | ✓ | ✓ | `symbol`【交易对】<br>`entry_source`【进入详情页入口】 | 否 |
| `market_detail_funding_modal_view` | 行情详情页资金费率弹窗预览 | App 行情详情内打开资金费率弹窗 | — | ✓ | ✓ | `symbol`【交易对】<br>`entry_source`【弹窗触发控件标识】 | 否 |
| `market_detail_depth_modal_view` | 行情详情页深度弹窗预览 | App 行情详情内打开深度弹窗 | — | ✓ | ✓ | `symbol`【交易对】<br>`entry_source`【弹窗触发控件标识】 | 否 |
| `vip_fee_page_view` | VIP 费率页预览 | App VIP 费率全屏页首屏展示 | — | ✓ | ✓ | `entry_source`【进入 VIP 费率页的入口】 | 否 |

### 3\.3 P1 事件（示例，按需删减）

| event_name | 中文说明 | 触发时机 | Web | Android | iOS | 参数（全部必填） | 关键事件 |
|---|---|---|---|---|---|---|---|
| `invite_share` | 邀请分享 | 用户触发分享或复制邀请链接 | ✓ | ✓ | ✓ | `channel`（string）【分享渠道】。取值：`link` / `poster` | 否 |
| `campaign_view` | 活动曝光 | 活动详情页展示 | ✓ | ✓ | ✓ | `campaign_id`（string）【活动 ID】<br>`entry_source`【进入活动页入口】 | 否 |
| `campaign_join` | 参与活动 | 报名或参与成功 | ✓ | ✓ | ✓ | `campaign_id`（string）【活动 ID】 | 否 |
| `coupon_redeem` | 卡券使用 | 卡券核销成功 | ✓ | ✓ | ✓ | `coupon_type`（string）【卡券类型】。与卡券中心类型枚举一致 | 否 |
| `partner_center_view` | 合伙人中心 | 进入合伙人中心 Hub | ✓ | ✓ | ✓ | `entry_source`【进入合伙人中心入口】 | 否 |

### 3\.4 待补充（产品填写）

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

建议各端封装唯一入口 `track(eventName, params)`：**Release 亦校验** §3 字典中该事件的参数键是否齐全（缺键打日志 / 拒发，由技术选型）；参数脱敏；预发/生产 Firebase 项目若拆分则分环境配置。

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
gtag('event', 'contract_order_submit', {
  symbol: 'BTCUSDC',
  side: 'buy',
  order_type: 'limit',
  position_side: 'long'
});

gtag('event', 'contract_close_order_submit', {
  symbol: 'BTCUSDC',
  order_type: 'market',
  close_order_location: 'position_tab_quick'
});

gtag('event', 'trade_page_view', {
  symbol: 'BTCUSDC',
  entry_source: 'markets'
});

// 联调（参数亦必填）
gtag('event', 'analytics_test', { platform: 'web' });
```

**自测**：GA4 → 报告 → **实时**；或 GTM 预览模式。

### 4\.3 Android（Kotlin）

依赖与 `google-services.json` 按 [Firebase Android 入门](https://firebase.google.com/docs/android/setup) 配置；包名 `com.velo.forx`。

```kotlin
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.analytics.logEvent

val analytics = Firebase.analytics

fun trackContractOrderSubmit(
    symbol: String, side: String, orderType: String, positionSide: String
) {
    analytics.logEvent("contract_order_submit") {
        param("symbol", symbol)
        param("side", side)
        param("order_type", orderType)
        param("position_side", positionSide)
    }
}

analytics.logEvent("analytics_test") {
    param("platform", "android")
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

func trackContractOrderSubmit(
    symbol: String, side: String, orderType: String, positionSide: String
) {
    Analytics.logEvent("contract_order_submit", parameters: [
        "symbol": symbol,
        "side": side,
        "order_type": orderType,
        "position_side": positionSide
    ])
}

Analytics.logEvent("analytics_test", parameters: ["platform": "ios"])
```

**DebugView**：Xcode → Edit Scheme → Run → Arguments → 添加 `-FIRDebugEnabled`（仅 Debug 配置）。

### 4\.5 联调与验收

| 步骤 | 负责人 | 通过标准 |
|---|---|---|
| 各端上报 `analytics_test` | 开发 | DebugView（App）或 GA4 实时（Web）可见 |
| §3.1 P0、§3.2 合约事件按字典实现 | 开发 | 产品抽测 1 条真实路径，参数与表一致 |
| 标关键事件 | 产品 + 数据 | GA4 管理 → 事件 → 将表中「关键事件=是」项标记 |
| 隐私 | 法务 / 产品 | 隐私政策已披露；参数无 PII |

---

## 5\. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-10-21 | 0.1 | 初版：环境信息 + P0/P1 事件字典模板 + 三端示例 |
| 2026-10-21 | 0.2 | 新增 §3.2 合约交易事件表（Web/App 分端浏览与下单类） |
| 2026-10-21 | 0.3 | 参数全部必填；补充中文含义与取值；§3.2 增加公共枚举表 |
| 2026-10-22 | 0.4 | §3.2 公共参数与 `order_type` / `close_ratio` 取值对齐产品；平仓三事件合并为 `contract_close_order_submit` + `close_order_location`；下单失败去掉 `fail_reason` |
