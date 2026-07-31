# 需求文档配图

配图**不进入 `main` 分支**，单独存放在 Git 分支 **`doc-assets`**，文档内通过 GitHub 链接引用。

## 文档中的引用格式

上传 Lark 时勿使用 `![]()` 图片语法（会显示无法导入图片），请用超链接（只显示链接文案，点击在新页打开图片）：

```markdown
页面截图：[**后台 · 新人任务规则（只读）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/积分/admin-config-newbie-tasks.png)

**原型**：[https://dashuaibizzy.github.io/prototype/perp_dex/admin/积分后台.html](https://dashuaibizzy.github.io/prototype/perp_dex/admin/积分后台.html)
```

本地 `git pull main` **不会**拉取 PNG 文件。

## 配图覆盖标准（与《合约交易页》Web 对齐）

每份需求文档应对原型中**可独立触发的 UI** 配图，并在对应章节正文引用：

| 类型 | 说明 | 示例 |
|---|---|---|
| **局部功能区域** | 单页内固定区块、列表、卡片 | 市场信息栏、积分看板、VIP 权益卡 |
| **子页面** | 独立路由/Hash 页（非弹层） | 用户积分详情、积分发放记录、审批详情 |
| **弹窗 / 居中 Modal** | 二次确认、审批提交确认 | 下单确认、费率撤销确认 |
| **浮窗 / 浮层 / Sheet** | Tooltip、下拉、底部弹层、抽屉 | 资金费率说明、货币单位、委托筛选 |

原则：**文档里描述了交互入口的 UI，应有对应截图**；同一弹层在概述章与细则章可只引用一次。

## 各文档覆盖情况

| 文档 | 配图目录 | Capture 脚本 | 状态 |
|---|---|---|---|
| 积分（后台/Web/APP） | `积分/` | `capture-points-doc-screenshots.mjs` | 后台列表/详情/抽屉式确认弹窗、Web/App 页面与分享弹窗 |
| VIP 费率与后台配置 | `费率/` | `capture-fee-doc-screenshots.mjs` | 后台列表/抽屉/审批、提交与撤销确认弹窗、Web VIP 卡/弹窗、App VIP 页 |
| 合约体验金&卡券中心 | `体验金/` | `capture-trial-doc-screenshots.mjs` | 后台五页/弹窗、Web/App 卡券中心与划转确认 |
| 合约交易页（Web） | `合约交易-web/` | `capture-web-contract-doc-screenshots.mjs` | 区域 + 弹窗 + 浮窗/tooltip/下拉 |
| APP 端合约交易页 | `合约交易-app/` | `capture-app-contract-doc-screenshots.mjs` | 区域 + Sheet/Modal + 委托筛选与撤单流程 |
| APP 端行情页面 | `行情-app/` | `capture-markets-doc-screenshots.mjs` | 搜索/Tab/列表/排序表头、各 Tab 列表与自选空态、网络异常与超时弹窗、编辑自选子页、底栏 |
| APP 端指标设置页 | `指标设置-app/` | `capture-indicator-settings-doc-screenshots.mjs` | 主列表/各指标子页、线宽与颜色浮层、参数校验提示、重置确认底栏 |
| 导航栏（Web） | `导航栏/` | `capture-navbar-doc-screenshots.mjs` | Logo/主导航/更多下拉、主题/铃铛/语言/设置抽屉（钱包充提见关联文档） |

### 已知未纳入（低优先级 / 跨文档）

- 投资组合页历史订单/持仓**筛选下拉**（费率文档仅覆盖 VIP 卡片与费率表弹窗）
- 审批详情内**附件图片预览**浮层（列表/详情页已配图）
- APP 合约**充币入口**跳转页（文档描述为跳转充值页，非本页弹层）

## 生成与上传配图

```bash
# 1. 按各文档的 capture 脚本生成 PNG（写入本目录，main 分支 .gitignore 忽略）
node scripts/capture-points-doc-screenshots.mjs
node scripts/capture-fee-doc-screenshots.mjs
node scripts/capture-trial-doc-screenshots.mjs
node scripts/capture-web-contract-doc-screenshots.mjs
node scripts/capture-app-contract-doc-screenshots.mjs
node scripts/capture-markets-doc-screenshots.mjs
node scripts/capture-indicator-settings-doc-screenshots.mjs
node scripts/capture-navbar-doc-screenshots.mjs

# 2. 推送到 doc-assets 分支
node scripts/push-doc-assets.mjs
```

## 目录约定

| 路径 | 说明 |
|---|---|
| `document/assets/积分/` | 《积分（后台/Web/APP）》配图 |
| `document/assets/费率/` | 《VIP 费率与后台配置》配图 |
| `document/assets/体验金/` | 《合约体验金&卡券中心页》（后台/Web/APP）配图 |
| `document/assets/合约交易-web/` | 《合约交易页》（Web）配图 |
| `document/assets/合约交易-app/` | 《APP 端合约交易页》配图 |
| `document/assets/行情-app/` | 《APP 端行情页面》配图 |
| `document/assets/指标设置-app/` | 《APP 端指标设置页》配图 |
| `document/assets/导航栏/` | 《导航栏》（Web 顶部导航）配图 |

新增文档配图时，在对应子目录存放 PNG，并更新 `doc-assets` 分支。
