# FORX 做市私有 WebSocket

返回目录：[`README.md`](./README.md)  
英文：[`en/private-ws.md`](./en/private-ws.md)

私有频道推送 **本 API Key 账户** 的订单、成交、持仓、资金等；须先 **登录（鉴权）** 再订阅。

---

## 连接

| 项 | 说明 |
| --- | --- |
| 地址 | 由运营提供；示例 `wss://{host}/mm/ws/private`（环境变量 `FORX_MM_WS_PRIVATE`） |
| 协议 | WebSocket，文本帧 JSON |
| 顺序 | 连接成功 → **login** → 等待登录成功 → **subscribe** 私有频道 |

---

## 登录（鉴权）

连接建立后 **立即** 发送登录帧（在 subscribe 之前）：

```json
{
  "op": "login",
  "args": [
    {
      "apiKey": "YOUR_API_KEY",
      "passphrase": "YOUR_PASSPHRASE",
      "timestamp": "1730000000000",
      "sign": "BASE64_HMAC_SHA256"
    }
  ]
}
```

| 字段 | 说明 |
| --- | --- |
| `apiKey` | 同 REST 头 `FORX-ACCESS-KEY` |
| `passphrase` | 同 REST 头 `FORX-ACCESS-PASSPHRASE` |
| `timestamp` | 毫秒时间戳字符串；与签名使用同一值 |
| `sign` | `Base64(HMAC-SHA256(prehash, SecretKey))` |

**签名原文 `prehash`**（与 REST 规则一致，METHOD 固定为 `GET`）：

```
prehash = timestamp + "GET" + requestPath
```

| 项 | 说明 |
| --- | --- |
| `requestPath` | WebSocket 登录路径，**固定**为 `/mm/ws/private`（若运营另行约定，以约定为准） |
| `body` | 登录帧无 body，不参与拼接 |

登录成功示例：

```json
{ "event": "login", "code": "0", "msg": "" }
```

失败时 `code` 非 `0` 或连接被关闭；`msg` 含义可参考 REST 鉴权：`missing params`、`timestamp timeout`、`invalid token`、`invalid signature`。

---

## 心跳

与公共连接相同：

```json
{ "op": "ping" }
```

```json
{ "op": "pong" }
```

---

## 订阅与取消

格式同 [`public-ws.md`](./public-ws.md)，`op` 为 `subscribe` / `unsubscribe`。

**须在登录成功后** 再发送 subscribe。

```json
{
  "op": "subscribe",
  "args": [
    { "channel": "orders", "product_name": "BTC-USDT-SWAP" }
  ]
}
```

---

## 私有频道

| channel | 说明 |
| --- | --- |
| `orders` | 委托状态变更（新建、部分成交、完全成交、撤销等） |
| `fills` | 成交明细（单笔成交） |
| `positions` | 持仓变化（数量、保证金、盈亏等） |
| `account` | 账户余额 / 保证金汇总变化 |

是否支持 `product_name` 过滤、是否必须带 `product_name`，以服务端为准；不支持过滤时可省略或传空，按现网错误提示调整。

---

## 推送报文

```json
{
  "arg": {
    "channel": "orders",
    "product_name": "BTC-USDT-SWAP"
  },
  "data": []
}
```

`data` 内字段与 REST 查询接口（如 `GET /mm/trade/orders-pending`、`GET /mm/trade/fills`）保持一致，便于对账。

---

## 重连策略

1. 断线后重新连接。  
2. 重新 **login**。  
3. 重新 **subscribe** 原频道列表。  
4. 必要时用 REST 拉取快照（挂单、持仓）与推送对齐，避免漏单。

---

## 与 REST 的关系

| 场景 | 建议 |
| --- | --- |
| 下单 / 撤单 / 改杠杆 | 使用 [`rest-api.md`](./rest-api.md) |
| 订单 / 成交 / 持仓实时驱动 | 私有 WS + 定期 REST 对账 |
| 仅查询历史 | REST 查询接口 |
