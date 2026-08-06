# APP 端行情页面

**原型**：[https://dashuaibizzy.github.io/prototype/perp_dex/app/行情.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/行情.html)

**子页面原型（编辑自选）**：[https://dashuaibizzy.github.io/prototype/perp_dex/app/编辑自选.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/编辑自选.html)

## 页面概述

页面截图：[**App · 行情页整体**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-page.png)

行情页面是用户浏览所有可交易币种实时行情的核心入口。页面支持通过顶部标签（Tab）快速筛选不同分类的代币，并提供自选管理、排序和异常状态处理等功能。整体交互流畅，数据更新及时。

- 原型链接：见文档顶部。

## 功能模块详述

### 2\.1 搜索框

页面截图：[**App · 搜索框**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-search.png)

- 位置：页面顶部，Tab标签上方。

- 功能：支持模糊搜索交易对名称（如输入“BTC”可匹配“BTCUSDT”）。

- 交互：点击搜索框弹出键盘；输入后实时过滤下方列表，显示匹配结果；清空搜索词恢复当前Tab下的完整列表。

- 异常：若网络异常，搜索框可正常展示但无数据返回时需给出提示。



### 2\.2 分类标签栏（Tab）

页面截图：[**App · 分类标签栏**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-tabs.png)

- 展示规则：

    - 标签栏支持横向滚动，适应未来扩展更多分类。

    - 标签数量和名称由后台管理系统的代币标签配置决定，非固定写死。但“自选”、“全部”、“热门”是固定的三个标签，不受后台配置影响。

    - 示例标签（后台可配）：如新币上线、TradeFi、主流币、AI。

    - 如果后台下架某标签，该Tab直接隐藏；如果新增标签，动态追加到标签栏最后。

- “全部”标签：

    - 展示平台所有可交易交易对，不分标签，按默认排序（如成交额降序）排列。

    - 点击“全部”时，若有搜索关键词，则搜索范围为全部交易对。

- “自选”标签：

    - 展示用户已收藏的交易对。

    - 如果用户未添加任何自选，显示空状态提示文案（如“暂無自選，快去添加吧”），并保留搜索框。

    - 在该Tab下显示“编辑自选”按钮（铅笔图标），点击跳转至编辑自选页面，可进行批量删除、排序等操作。

- “热门”标签：[“热门”标签的特殊排序与填充逻辑](https://ksgf73ukjokp.sg.larksuite.com/docx/SLB5dwR8eo5xy9xNLAFllX1Lg4b?from=from_copylink)

- 其他动态标签：

    - 由后台配置，前端根据返回的标签列表渲染。

    - 点击某个标签，仅显示带有该标签的交易对列表。

---

### 2\.3 行情列表

页面截图：[**App · 列表表头与排序**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-list-header.png)

页面截图：[**App · 全部 Tab 列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-list-all.png)

页面截图：[**App · 自选 Tab 列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-tab-fav.png)

页面截图：[**App · 热门 Tab 列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-tab-hot.png)

页面截图：[**App · 新币 Tab 列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-tab-new.png)

页面截图：[**App · 动态标签列表（TradeFi）**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-tab-dynamic.png)

- 列表项字段（每行展示一个交易对）：

    - 交易对名称（如 BTCUSDT）：

        - 主标题字体加粗。

        - 点击进入该交易对详情页。

    - 成交额（以USDT计价）：

        - 显示格式：数字\+单位（如“1\.2亿 USDT”），保留合理小数或单位转换，超过万则显示“万”，超过亿显示“亿”。

        - 含义：最近24小时该交易对的成交额（以USDT为计量）。

    - 最新价：

        - 显示该交易对最新成交价格。

        - 格式：保留适当小数位（如价格较高的币种保留2位，价格极低的保留到合理科学计数或足够多的小数）。

    - 24小时涨跌幅：

        - 以百分比显示，带正负号。

        - 涨为绿色背景，跌为红色背景，正负号前加“\+”或“\-”（如“\+5\.42%”）。

        - 涨跌幅是相对于24小时前的价格计算。

- 排序功能：

    - 表头三列均可点击排序：名称/成交额、最新价、今日涨跌。

    - 支持升序/降序切换，默认排序可能为成交额降序。

    - 激活状态的排序箭头显示为黑色高亮。

    - 排序仅在当前Tab和搜索结果内进行。

    

### 2\.4 页面状态与异常处理

页面截图：[**App · 网络异常态**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-error.png)

页面截图：[**App · 数据加载失败占位**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-error-view.png)

页面截图：[**App · 请求超时弹窗**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-modal-timeout.png)

- 正常状态：展示列表。

- 加载中：可显示骨架屏或加载动画，避免白屏。

- 网络异常/数据加载失败：

    - 列表中显示异常视图（图标\+文案），取代列表内容。

    - 文案：“数据加载失败，请检查您的网络连接并重试”。

    - 提供“重新加载”按钮，点击后刷新页面或重新请求数据。

    - 同时可能弹出超时提示弹窗，用户可关闭。

- 数据为空（某个Tab下无交易对）：

    - 显示空状态插图与文案，例如“暂无相关币种”。

    

### 2\.5 自选功能

页面截图：[**App · 自选空状态**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-tab-fav-empty.png)

页面截图：[**App · 编辑自选子页面**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-subpage-edit-fav.png)

- 添加自选：在行情详情页或列表项上提供收藏入口（如星形图标），收藏后出现在“自选”Tab中。

- 移除自选：在“自选”Tab进入编辑模式可取消收藏；也可在详情页取消。

- 自选排序：自选列表默认按添加时间降序，或用户可手动排序，后台保存排序结果。



### 2\.6 数据更新策略

- 行情数据需支持实时或准实时更新。前端可采用WebSocket推送或定时轮询（每100毫秒）方式更新价格、涨跌幅、成交额。

- 更新时避免整页刷新，只更新变化字段，同时可添加微弱的数值变动动画。

- 如果连续多次更新失败，应进入异常状态。



### 2\.7 与其它页面联动

- 点击任意交易对，跳转至行情详情页，传入交易对标识。

- 底部导航栏保留，当前高亮“行情”图标。

页面截图：[**App · 底部导航栏**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/行情-app/app-markets-bottom-nav.png)

#### 2\.7\.1 从首页涨跌榜跳转至行情页的特殊逻辑



**触发场景**  

- 用户在首页点击“涨幅榜”或“跌幅榜”入口，期望跳转到行情页面并查看对应方向排序的全部交易对。

    

**跳转传达的信息**  

首页跳转到行情页时，会携带两个动作指令（无需定义具体参数名，由开发自行约定）：

- **切换到“全部”分类**：无论行情页之前停留在哪个标签，这次都强制显示全部交易对。

- **按“今日涨跌”排序**：

    - 若从“涨幅榜”进入，行情列表按涨跌幅从高到低排列（涨幅最大的排最前）。

    - 若从“跌幅榜”进入，行情列表按涨跌幅从低到高排列（跌幅最大的排最前，因为跌幅为负值，最小值代表跌幅最深）。

        

**行情页处理逻辑**  

1. 页面加载时，先检查是否携带了上述跳转指令。如果有，则优先执行指令：切换到“全部”标签，并激活对应涨跌幅排序方向。

2. 表头“今日涨跌”列的排序箭头呈黑色高亮激活态，箭头方向与实际排列方向一致（涨跌幅降序时箭头向下，升序时箭头向上）。

3. 该跳转指令仅当次生效。之后用户手动切换其他标签或更改排序时，以用户最新操作为准，不再维持跳转指令的状态。

