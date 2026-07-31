# APP 端首页

**原型**：[https://dashuaibizzy.github.io/prototype/perp_dex/app/首页.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/首页.html)

# 0. 页面概述

## 0.1 功能定位

APP 首页是用户进入应用后的默认 Tab 页，承担品牌展示、资产概览、快捷入口、活动 Banner、行情摘要与公告引流等职责。底部 Tab「首頁」为当前高亮项。

## 0.2 页面结构

页面截图：[**App · 首页整体（未登录）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-page-guest.png)

| 区域 | 说明 |
|---|---|
| 开屏页 | 首次进入短暂展示品牌 Logo（可跳过） |
| 顶部导航栏 | 居中 ForX 标题、右侧消息中心入口 |
| 权益/营销区 | 未登录：新人礼包 Banner；已登录：账户总权益卡片 |
| 快捷入口 | 已登录显示：活动、积分、邀请、VIP（四宫格） |
| Banner 轮播 | 活动营销卡片 + 指示圆点 |
| 行情摘要 | 收藏 / 热门 / 新币 / 涨跌幅榜 Tab + 列表 |
| 公告区 | 最新公告列表 + 查看更多 |
| 底部导航栏 | 首页（高亮）、行情、永续合约、奖励、我的 |

---

# 1. 开屏页

页面截图：[**App · 开屏页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-splash.png)

- 全屏白底，居中 ForX Logo 与 Slogan「Next-Gen Perp DEX」。

- 首次冷启动展示约 1.5s 后自动进入首页；再次进入可跳过（以产品策略为准）。

---

# 2. 顶部导航栏

页面截图：[**App · 顶部导航栏**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-header.png)

| 元素 | 说明 |
|---|---|
| 标题 | 居中「ForX」 |
| 消息入口 | 右侧气泡图标，带红点未读提示；跳转消息中心 |

---

# 3. 权益与营销区

## 3.1 未登录状态

页面截图：[**App · 新人礼包 Banner**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-guest-banner.png)

- 深色卡片展示新人活动文案、倒计时与「立即領取」按钮。

- 点击引导登录/注册或活动页（按活动配置）。

## 3.2 已登录状态

页面截图：[**App · 账户总权益卡片**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-equity-card.png)

| 字段 | 说明 |
|---|---|
| 賬戶總權益 (USDT) | 合约账户总权益；旁附眼睛图标可隐藏/显示金额 |
| 今日涨跌 | 金额 + 百分比；涨绿跌红 |
| 充值 | 右侧按钮，跳转充值页 |

- 点击眼睛图标：金额显示为 `******`，再次点击恢复。

---

# 4. 快捷入口（已登录）

页面截图：[**App · 快捷入口四宫格**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-quick-entry.png)

| 入口 | 跳转 |
|---|---|
| 活动 | 活动中心 |
| 积分 | 积分页 |
| 邀请 | 邀请返佣页 |
| VIP | VIP 费率等级页 |

- 未登录时整块隐藏。

---

# 5. Banner 轮播

页面截图：[**App · 活动 Banner**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-banner.png)

- 横向活动卡片，支持左右滑动切换（原型展示单卡 + 底部圆点指示器）。

- 点击跳转对应活动落地页。

---

# 6. 行情摘要区

页面截图：[**App · 行情 Tab 与收藏区**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-market-tabs.png)

## 6.1 Tab 列表

| Tab | 说明 |
|---|---|
| 收藏 | 用户自选合约；默认选中 |
| 熱門 | 按交易量/热度排序 |
| 新币上线 | 新上合约列表 |
| 漲幅榜 | 24h 涨幅 Top |
| 跌幅榜 | 24h 跌幅 Top |

- Tab 栏支持横向滚动；选中项黑色下划线。

## 6.2 收藏 Tab

页面截图：[**App · 收藏初始态（推荐卡片）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-fav-empty.png)

**初始态：**

- 2×3 推荐卡片网格，展示合约名、最新价、24h 涨跌幅；每卡带勾选框。

- 底部「一鍵收藏」：将当前推荐合约加入自选并切换为列表态。

页面截图：[**App · 收藏列表态**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-fav-filled.png)

**列表态：**

| 字段 | 说明 |
|---|---|
| 合約 | 交易对名称 |
| 成交量 | 24h 成交额（USDT） |
| 價格 | 最新价 |
| 漲跌幅 | 胶囊按钮样式，涨绿跌红 |

- 底部「查看更多」跳转行情页。

## 6.3 其他 Tab（热门 / 新币 / 涨跌幅）

页面截图：[**App · 热门列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-market-hot.png)

页面截图：[**App · 新币上线列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-market-new.png)

- 行布局：左侧合约 + 成交量，中间价格，右侧涨跌幅胶囊。

- 点击行跳转该合约行情详情页。

- 列表底部「查看更多」跳转行情页对应 Tab。

---

# 7. 公告区

页面截图：[**App · 公告列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-announcements.png)

| 元素 | 说明 |
|---|---|
| 标题 | 「公告」 |
| 列表项 | 标题（可选 NEW 红标）、日期、右侧箭头 |
| 查看更多 | 跳转消息中心公告 Tab |

- 点击单条跳转公告详情页。

---

# 8. 底部导航栏

页面截图：[**App · 底部导航栏**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-bottom-nav.png)

与全局 Tab 规范一致；本页「首頁」为选中态（黑色图标与文字）。

---

# 9. 异常状态

## 9.1 网络异常

页面截图：[**App · 网络异常态**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-net-error.png)

| 区域 | 展示 |
|---|---|
| 顶部横条 | 红色提示「網絡連接異常，請檢查您的網路設置」 |
| 权益区 | 金额与涨跌显示 `--` |
| 行情区 | 隐藏列表，显示「刷新頁面」按钮 |

## 9.2 请求超时弹窗

页面截图：[**App · 请求超时弹窗**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/首页-app/app-home-modal-timeout.png)

- 网络异常时可弹出居中弹窗：标题「請求超時」，说明文案 +「好的」按钮。

- 点击「好的」关闭弹窗；用户可点击刷新重试。

---

# 10. 数据刷新

- 权益数据：进入页面及下拉刷新时拉取。

- 行情列表：按 Tab 切换或定时轮询更新价格与涨跌幅。

- 公告：进入页面拉取最新列表。

---

*文档版本：与 `perp_dex/app/首页.html` 原型对齐。*
