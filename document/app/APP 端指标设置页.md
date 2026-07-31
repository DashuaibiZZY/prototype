# APP 端指标设置页

**原型**：[https://dashuaibizzy.github.io/prototype/perp_dex/app/指标设置.html](https://dashuaibizzy.github.io/prototype/perp_dex/app/指标设置.html)

## 页面概述

页面截图：[**App · 指标设置主列表页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-list-page.png)

指标设置页用于用户自定义行情详情页K线图表的主图与附图指标显示样式和计算参数，所有修改保存后即时生效。页面由指标主列表页和各个指标的子设置页构成，采用右侧滑入式导航。

## 指标主列表页

### 2\.1 导航栏

页面截图：[**App · 指标设置导航栏**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-list-header.png)

- 标题居中显示“指标设置”，字体加粗倾斜。

- 左侧返回按钮，点击返回行情详情页。

### 2\.2 指标分类列表

页面截图：[**App · 主图指标列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-list-main.png)

页面截图：[**App · 副图指标列表**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-list-sub.png)

列表分为两大区块：主图指标与副图指标，每个区块有灰色背景的小标题。

#### 主图指标

- MA

- EMA

- BOLL

#### 副图指标

- MACD

- KDJ

- RSI

每个指标项为一行，显示指标名称，右侧有箭头图标，点击进入对应的指标设置子页面。

### 2\.3 交互与状态

- 所有指标项均可点击进入，无默认选中或启用状态开关（启用开关在子页面内）。

- 列表不支持排序，顺序固定。

## 指标设置子页面（通用结构）

页面截图：[**App · MA 指标设置子页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-subpage-ma.png)

页面截图：[**App · 底部重置与确认**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-footer-actions.png)

每个指标的子页面布局类似，包含：

- 顶部状态栏（示意，实际以真机为准）

- 导航栏（返回按钮 \+ 指标名称标题）

- 参数配置区

- 指标线启用开关及样式设置（若适用）

- 底部固定按钮：重置、确认

点击确认后保存设置并返回列表页；点击重置恢复该指标所有设置项为该指标的默认值；返回按钮直接返回列表页，不保存未确认的修改（即放弃修改）。

## 各指标详细设置项

### 4\.1 MA（移动平均线）

页面截图：[**App · MA 设置页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-subpage-ma.png)

性质：主图指标，可有多条线，每条线有独立的启用开关、周期、线宽、颜色。

- 配置行（最多5条，示例已有3条启用\+2条禁用）

    - 复选框：控制该条MA线是否显示在图表上。

    - 标签：`MA` \+ 序号（或固定MA）。

    - 参数值：数字输入框，表示该MA的计算周期（默认示例：7、25、99，禁用行为空）。

    - 线宽选择：点击弹出线宽选择器（预设几个线宽如1px,2px,3px），当前选中预览显示一条横线示意。

页面截图：[**App · 线宽选择浮层**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-picker-width.png)

    - 颜色选择：点击弹出颜色选择器，当前选中预览显示一个色块。

页面截图：[**App · 颜色选择浮层**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-picker-color.png)

- 默认状态：三条MA线启用，周期分别为7、25、99，线宽默认2px，颜色分别为黄、紫、蓝。额外两条默认禁用。

- 重置行为：恢复为上述默认值。

### 4\.2 EMA（指数移动平均线）

页面截图：[**App · EMA 设置页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-subpage-ema.png)

性质：主图指标，结构同MA，但指标线名称显示为`EMA`。

- 配置行：与MA完全相同。

- 默认状态：两条EMA线启用，周期分别为7、25，线宽默认2px，颜色分别为黄、紫。额外一条禁用（蓝色预设）。可根据需要扩展到5行。

- 重置行为：恢复为默认值。

### 4\.3 BOLL（布林带）

页面截图：[**App · BOLL 设置页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-subpage-boll.png)

性质：主图指标，由三条线组成（上轨UP、中轨MB、下轨DN），共享计算参数，每条线可单独控制显示/隐藏及样式。

- 基础参数区（位于配置线上方）：

    - 计算周期：数字输入，默认21。

    - 带宽（标准差倍数）：数字输入，默认2。

- 指标线配置区（表头：指标线、线宽、颜色）

    - UP线：复选框默认勾选，线宽、颜色可调（默认黄色）。

    - MB线：复选框默认勾选，线宽、颜色可调（默认紫色）。

    - DN线：复选框默认勾选，线宽、颜色可调（默认蓝色）。

    - 注意：BOLL没有多条同种线，这三条是固定的。

- 重置行为：周期恢复21，带宽恢复2，三条线全部启用，线宽默认2px，颜色分别恢复默认。

### 4\.4 MACD（指数平滑异同移动平均线）

页面截图：[**App · MACD 设置页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-subpage-macd.png)

性质：副图指标，包含两条曲线（DIF、DEA）和柱状图（MACD柱）。柱状图通常不设置线宽，仅通过涨跌颜色区分。

- 基础参数区：

    - 短周期（快线）：默认12。

    - 长周期（慢线）：默认26。

    - 移动平均周期（DEA周期）：默认9。

- 指标线配置区（表头：指标线、线宽、颜色）

    - DIF线：复选框默认勾选，线宽可选，颜色默认黄色。

    - DEA线：复选框默认勾选，线宽可选，颜色默认蓝色。

    - MACD柱：只有复选框（默认勾选），无单独线宽和颜色调整（因柱状图颜色通常由涨跌决定，但可考虑全局涨跌红绿配置，此处暂定不可调）。

- 重置行为：恢复参数为12/26/9，DIF、DEA、MACD均启用，线宽默认2px，颜色恢复默认。

### 4\.5 KDJ（随机指标）

页面截图：[**App · KDJ 设置页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-subpage-kdj.png)

性质：副图指标，由三条曲线组成（K、D、J），有共享参数。

- 基础参数区：

    - 计算周期（%K周期）：默认9。

    - 移动平均周期1（%K平滑）：默认3。

    - 移动平均周期2（%D平滑）：默认3。

- 指标线配置区（表头：指标线、线宽、颜色）

    - K线：复选框默认勾选，线宽可选，颜色默认黄色。

    - D线：复选框默认勾选，线宽可选，颜色默认蓝色。

    - J线：复选框默认勾选，线宽可选，颜色默认紫色。

- 重置行为：参数恢复9/3/3，三条线全部启用，线宽2px，颜色默认。

### 4\.6 RSI（相对强弱指标）

页面截图：[**App · RSI 设置页**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-subpage-rsi.png)

性质：副图指标，可添加多条不同周期的RSI线，每条线独立设置周期、线宽、颜色。

- 配置行：结构类似MA，每行：

    - 复选框：控制该RSI线是否显示。

    - 标签：RSI（或RSI 6等，但界面仅显示RSI）。

    - 参数值：数字输入框，为RSI的计算周期，默认6、12、24。

    - 线宽选择器。

    - 颜色选择器。

- 默认状态：三条RSI线启用，周期分别为6、12、24，线宽默认2px，颜色依次为黄、蓝、紫。

- 重置行为：恢复默认值。

## 全局交互说明

### 5\.1 页面切换

- 从指标主列表页进入某个指标子页面时，采用右侧滑入动画；返回主列表时左侧滑出。

- 子页面内点击返回箭头直接返回列表（不保存），点击确认保存后自动返回列表。

### 5\.2 确认保存

- 确认按钮保存当前所有修改（包括复选框状态、数值、线宽、颜色），更新到本地存储或用户账户配置，并立即反映在行情详情页的图表中。

- 若用户在设置后未按确认直接返回，则所有修改舍弃。

### 5\.3 重置

- 每个子页面底部的重置按钮仅重置当前指标的设置项至默认值，不自动保存；用户需点确认才生效。

### 5\.4 数值输入校验

页面截图：[**App · 参数输入错误提示**](https://raw.githubusercontent.com/DashuaibiZZY/prototype/doc-assets/document/assets/指标设置-app/app-indicator-input-error.png)

- 参数值必须为正整数，输入非数字或0时给出错误提示。

- MA/EMA/RSI的周期数一般不超过500，BOLL周期不超过200等，具体限制可根据实际确定并在界面提示。

- 线宽选择提供1、2、3三个选项。

- 颜色选择器提供一组预设常用颜色（如红、橙、黄、绿、青、蓝、紫、白、灰等）。

### 5\.5 异常状态

- 设置页所有数据均为本地配置，无网络依赖，因此不存在加载异常。但如果从服务器同步配置失败，可静默使用本地设置。

- 当用户登录后，设置应同步到账户，多端一致。

## 与行情详情页联动

- 行情详情页K线图表实时读取指标设置配置，无需刷新即可在点击确认后立刻更新指标显示。

- 指标开启/关闭状态与详情页指标选择栏的按钮状态同步：例如用户在此禁用MA某条线，详情页的MA按钮可能仍然高亮（只要还有至少一条MA线启用）。推荐逻辑：指标选择栏的按钮高亮当且仅当该主图/副图指标有任意一条线启用。

