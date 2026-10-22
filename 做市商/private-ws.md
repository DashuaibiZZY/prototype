# 私有 WebSocket

用于账户级推送与交易指令（下单 / 撤单 / 改单）。**须先完成 `login`**，再订阅或交易。

## 连接

```text
wss://{host}/notification/private
```

本地示例：`ws://localhost:8080/notification/private`

### 连接成功（服务端可能先推送）

```json
{"pong": 1710000000000}
```

心跳与 [公有 WebSocket](./public-ws.md#心跳) 相同：收到 `{"ping": <ms>}` 后回复 `{"pong": <ms>}`。

---

## 通用格式

### 客户端请求

```json
{
  "id": "req-001",
  "event": "login",
  "params": {}
}
```

| 字段 | 说明 |
|------|------|
| `id` | 请求 ID，响应原样带回 |
| `event` | 事件名 |
| `params` | 参数对象；批量接口为数组 |

### 成功响应（通用形态）

```json
{
  "id": "req-001",
  "event": "login",
  "data": {}
}
```

### 错误响应

```json
{
  "id": "req-001",
  "event": "error",
  "code": "401",
  "msg": "unauthorized",
  "args": []
}
```

业务失败（处理后回包）示例：

```json
{
  "id": "req-003",
  "event": "error",
  "code": "50001",
  "msg": "insufficient balance",
  "args": []
}
```

---

## 登录 `login`

未登录时，`sub` / 交易事件返回 `401`。支持 **JWT** 或 **API Key**（二选一；同时传时优先 JWT）。

### 方式一：JWT

**请求**

```json
{
  "id": "1",
  "event": "login",
  "params": {
    "jwt": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**成功响应**

```json
{
  "id": "1",
  "event": "login",
  "data": {
    "code": 0,
    "message": "Ok"
  }
}
```

**失败响应**

```json
{
  "id": "1",
  "event": "error",
  "code": "401",
  "msg": "unauthorized",
  "args": []
}
```

### 方式二：API Key

**请求**

```json
{
  "id": "1",
  "event": "login",
  "params": {
    "apiKey": "your-api-key",
    "passphrase": "your-passphrase",
    "timestamp": "1710000000",
    "sign": "xr0EjNy7T3raK0cs3Zov1942FHcwMvYks+snq9rwWuQ="
  }
}
```

| 字段 | 说明 |
|------|------|
| `apiKey` | API Key |
| `passphrase` | 创建时口令（勿擅自 trim） |
| `timestamp` | 10 位秒 / 13 位毫秒 / RFC3339；与服务器相差须在 **±30 秒**内 |
| `sign` | Base64 签名 |

**签名算法**

```text
prehash = timestamp + "GET" + "/users/self/verify"
sign    = Base64( HMAC-SHA256(prehash, secretKey) )
```

**成功响应**

```json
{
  "id": "1",
  "event": "login",
  "data": {
    "code": 0,
    "message": "Ok"
  }
}
```

**失败响应**

```json
{
  "id": "1",
  "event": "error",
  "code": "401",
  "msg": "unauthorized",
  "args": []
}
```

---

## 私有频道订阅

须登录后调用。

### 可用频道

| type | 说明 |
|------|------|
| `notification.order` | 订单变更 |
| `notification.position` | 持仓变更 |
| `notification.account` | 账户 |
| `notification.wallet` | 钱包 |
| `notification.balance` | 余额变更 |
| `notification.margin` | 保证金 |
| `notification.config` | 配置 |
| `notification.algo` | 算法单 |

### 订阅

**请求**

```json
{
  "id": "2",
  "event": "sub",
  "params": {
    "type": "notification.order"
  }
}
```

**响应**

```json
{
  "id": "2",
  "event": "subscribe",
  "args": [
    {
      "type": "notification.order"
    }
  ]
}
```

### 取消订阅

**请求**

```json
{
  "id": "2",
  "event": "unsub",
  "params": {
    "type": "notification.order"
  }
}
```

**响应**

```json
{
  "id": "2",
  "event": "unsubscribe",
  "args": [
    {
      "type": "notification.order"
    }
  ]
}
```

### 推送示例（订单频道）

推送为业务原始 JSON，结构随频道变化。示意：

```json
{
  "arg": {
    "type": "notification.order"
  },
  "eventType": "update",
  "data": {
    "order_id": "66f1a2b3c4d5e6f708091011",
    "product_name": "BTC-USDT",
    "side": "buy",
    "status": "filled"
  }
}
```

未登录时订阅：

```json
{
  "id": "2",
  "event": "error",
  "code": "401",
  "msg": "unauthorized",
  "args": []
}
```

---

## 交易指令

均须登录。批量接口单次最多 **20** 条。

提交后通常等待处理结果再回复；超时可能返回 `status: "init"` 的受理结果，最终状态以私有频道推送为准。

### 1. 下单 `add-order`

**请求**

```json
{
  "id": "3",
  "event": "add-order",
  "params": {
    "product_name": "BTC-USDT",
    "cl_ord_id": "client-oid-001",
    "side": "buy",
    "pos_side": "long",
    "ord_type": "limit",
    "trade_unit": "base",
    "px": "50000",
    "sz": "0.01"
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `product_name` | 是 | 交易对 |
| `cl_ord_id` | 否 | 客户端订单号，最长 64 |
| `side` | 是 | `buy` / `sell` |
| `pos_side` | 是 | `long` / `short` |
| `ord_type` | 是 | `limit` / `market` / `fok` / `ioc` / `post_only` |
| `trade_unit` | 是 | `base`（币）/ `quote`（U）/ `size`（张） |
| `px` | 限价类是 | 价格；市价单可为 `0` |
| `sz` | 是 | 数量（含义由 `trade_unit` 决定） |

**成功响应（受理）**

```json
{
  "id": "3",
  "event": "add-order",
  "data": {
    "order_id": "66f1a2b3c4d5e6f708091011",
    "cl_ord_id": "client-oid-001",
    "status": "init"
  }
}
```

**参数错误**

```json
{
  "id": "3",
  "event": "error",
  "code": "400",
  "msg": "Bad Request",
  "args": []
}
```

**校验失败（如价格超限）**

```json
{
  "id": "3",
  "event": "error",
  "code": "422",
  "msg": "限价单的价格不能高于最高买价",
  "args": []
}
```

### 2. 批量下单 `add-batch-orders`

同一批次须为同一 `product_name`。

**请求**

```json
{
  "id": "4",
  "event": "add-batch-orders",
  "params": [
    {
      "product_name": "BTC-USDT",
      "cl_ord_id": "batch-1",
      "side": "buy",
      "pos_side": "long",
      "ord_type": "limit",
      "trade_unit": "base",
      "px": "50000",
      "sz": "0.01"
    },
    {
      "product_name": "BTC-USDT",
      "cl_ord_id": "batch-2",
      "side": "buy",
      "pos_side": "long",
      "ord_type": "limit",
      "trade_unit": "base",
      "px": "49900",
      "sz": "0.01"
    }
  ]
}
```

**成功响应**

```json
{
  "id": "4",
  "event": "add-batch-orders",
  "data": [
    {
      "order_id": "66f1a2b3c4d5e6f708091011",
      "cl_ord_id": "batch-1",
      "status": "init"
    },
    {
      "order_id": "66f1a2b3c4d5e6f708091012",
      "cl_ord_id": "batch-2",
      "status": "init"
    }
  ]
}
```

### 3. 撤单 `cancel-order`

`order_id` 与 `cl_ord_id` 至少提供一个；`order_id` 为 24 位十六进制 ObjectId。

**请求**

```json
{
  "id": "5",
  "event": "cancel-order",
  "params": {
    "product_name": "BTC-USDT",
    "order_id": "66f1a2b3c4d5e6f708091011",
    "cl_ord_id": ""
  }
}
```

或仅用客户端订单号：

```json
{
  "id": "5",
  "event": "cancel-order",
  "params": {
    "product_name": "BTC-USDT",
    "order_id": "",
    "cl_ord_id": "client-oid-001"
  }
}
```

**成功响应**

```json
{
  "id": "5",
  "event": "cancel-order",
  "data": {
    "order_id": "66f1a2b3c4d5e6f708091011"
  }
}
```

### 4. 批量撤单 `cancel-batch-orders`

**请求**

```json
{
  "id": "6",
  "event": "cancel-batch-orders",
  "params": [
    {
      "product_name": "BTC-USDT",
      "order_id": "66f1a2b3c4d5e6f708091011"
    },
    {
      "product_name": "BTC-USDT",
      "cl_ord_id": "client-oid-002"
    }
  ]
}
```

**成功响应**

```json
{
  "id": "6",
  "event": "cancel-batch-orders",
  "data": [
    "66f1a2b3c4d5e6f708091011",
    "client-oid-002"
  ]
}
```

### 5. 改单 `amend-order`

**请求**

```json
{
  "id": "7",
  "event": "amend-order",
  "params": {
    "product_name": "BTC-USDT",
    "order_id": "66f1a2b3c4d5e6f708091011",
    "cl_ord_id": "",
    "px": "51000",
    "sz": "0.02"
  }
}
```

| 字段 | 说明 |
|------|------|
| `product_name` | 交易对 |
| `order_id` / `cl_ord_id` | 至少一个 |
| `px` / `sz` | 新价格、新数量，须为正 |

**成功响应**

```json
{
  "id": "7",
  "event": "amend-order",
  "data": {
    "order_id": "66f1a2b3c4d5e6f708091011",
    "status": "init"
  }
}
```

### 6. 批量改单 `amend-batch-orders`

**请求**

```json
{
  "id": "8",
  "event": "amend-batch-orders",
  "params": [
    {
      "product_name": "BTC-USDT",
      "order_id": "66f1a2b3c4d5e6f708091011",
      "px": "51000",
      "sz": "0.02"
    },
    {
      "product_name": "BTC-USDT",
      "cl_ord_id": "client-oid-002",
      "px": "50500",
      "sz": "0.015"
    }
  ]
}
```

**成功响应**

```json
{
  "id": "8",
  "event": "amend-batch-orders",
  "data": [
    {
      "order_id": "66f1a2b3c4d5e6f708091011",
      "status": "init"
    },
    {
      "order_id": "client-oid-002",
      "status": "init"
    }
  ]
}
```

---

## 事件一览

| event | 说明 | 登录 |
|-------|------|------|
| `login` | 认证 | — |
| `sub` / `unsub` | 订阅 / 取消私有频道 | 需要 |
| `add-order` | 下单 | 需要 |
| `add-batch-orders` | 批量下单 | 需要 |
| `cancel-order` | 撤单 | 需要 |
| `cancel-batch-orders` | 批量撤单 | 需要 |
| `amend-order` | 改单 | 需要 |
| `amend-batch-orders` | 批量改单 | 需要 |

---

## 推荐调用顺序

```text
1. 连接 wss://{host}/notification/private
2. 处理 ping / pong
3. event=login（jwt 或 apiKey）
4. event=sub 订阅 notification.order 等
5. event=add-order / cancel-order / amend-order ...
6. 用响应 id 关联请求；用频道推送确认最终状态
```
