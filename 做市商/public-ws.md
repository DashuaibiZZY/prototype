# FORX 做市公共 WebSocket

返回目录：[`README.md`](./README.md)  
英文：[`en/public-ws.md`](./en/public-ws.md)

公共频道 **无需** REST 鉴权头；用于行情、深度、成交、标记价、资金费率等。

---

## 连接

| 项 | 说明 |
| --- | --- |
| 地址 | 由运营提供；示例 `wss://{host}/mm/ws/public`（环境变量 `FORX_MM_WS_PUBLIC`） |
| 协议 | WebSocket，**文本帧**，UTF-8 JSON |
| 压缩 | 以服务端配置为准（若启用 permessage-deflate，按网关说明握手） |

建议：断线后指数退避重连；重连后 **重新 subscribe** 全部频道。

---

## 心跳

客户端定时发送（建议间隔 ≤ 30s，以服务端要求为准）：

```json
{ "op": "ping" }
```

服务端回复：

```json
{ "op": "pong" }
```

若超过约定时间未收到 `pong`，应主动断开并重连。

---

## 订阅与取消

**订阅**

```json
{
  "op": "subscribe",
  "args": [
    { "channel": "books", "product_name": "BTC-USDT-SWAP" }
  ]
}
```

**取消订阅**

```json
{
  "op": "unsubscribe",
  "args": [
    { "channel": "books", "product_name": "BTC-USDT-SWAP" }
  ]
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `op` | string | `subscribe` / `unsubscribe` / `ping` |
| `args` | array | 订阅项列表 |
| `args[].channel` | string | 频道名，见下表 |
| `args[].product_name` | string | 合约名称，与 REST `product_name` 一致，如 `BTC-USDT-SWAP` |

---

## 频道

| channel | 说明 | 推送内容概要 |
| --- | --- | --- |
| `tickers` | 24h 行情快照 | 最新价、涨跌、成交量等 |
| `books` | 深度 | 买卖盘档位；可能有 `books5` / `books50` 等粒度，以服务端为准 |
| `trades` | 公共成交 | 时间、价格、数量、方向 |
| `mark-price` | 标记价格 | 标记价、指数价（若合并推送以报文为准） |
| `index-price` | 指数价格 | 指数价 |
| `funding-rate` | 资金费率 | 当前/预测资金费率、下一结算时间 |

同一连接可订阅多个 `product_name`、多个 `channel`。

---

## 推送报文

通用结构（字段名以现网为准）：

```json
{
  "arg": {
    "channel": "books",
    "product_name": "BTC-USDT-SWAP"
  },
  "data": []
}
```

- `data` 为数组；元素结构因 `channel` 不同而不同。
- 全量快照与增量更新规则（如深度 `action`: `snapshot` / `update`）以服务端文档或 OpenAPI 为准。

---

## 错误

订阅失败或参数错误时，可能收到：

```json
{
  "event": "error",
  "code": "60012",
  "msg": "Invalid request"
}
```

| 处理 | 说明 |
| --- | --- |
| 修正 `channel` / `product_name` 后重试 | 不要盲目重连刷屏 |
| 鉴权类错误 | 公共连接不应出现；若出现联系技术支持 |

---

## 与 REST 的关系

- 公共 WS 仅推送；**下单、撤单、查单** 走 [`rest-api.md`](./rest-api.md)。
- 做市上报指数/标记价/资金费率走 REST `POST /mm/trade/report-*`（若启用）。
