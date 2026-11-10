# 公有 WebSocket

无需登录。用于订阅实时行情，或按需拉取快照数据。

## 连接

```text
wss://{host}/notification/public
```

本地示例：`ws://localhost:8080/notification/public`

### 连接成功（服务端可能先推送）

```json
{"pong": 1710000000000}
```

---

## 心跳

### 服务端推送

```json
{"ping": 1710000000123}
```

### 客户端回复（约 30 秒内）

```json
{"pong": 1710000000123}
```

超时未回复会被断开。

---

## 通用格式

### 客户端请求

```json
{
  "event": "sub",
  "params": {}
}
```

| `event` | 说明 |
|---------|------|
| `sub` | 订阅频道 |
| `unsub` | 取消订阅 |
| `req` | 一次性拉取（受请求频率限制） |

### 错误响应

```json
{
  "id": "1710000000",
  "event": "error",
  "code": "500",
  "msg": "params error",
  "args": []
}
```

频率超限示例：

```json
{
  "id": "1710000000",
  "event": "error",
  "code": "500",
  "msg": "too many requests",
  "args": []
}
```

---

## 订阅 / 取消订阅

### 支持的频道 `type`

| type | 说明 | 额外参数 |
|------|------|----------|
| `ticker` | 单交易对 ticker | `symbol` |
| `tickers` | 全市场概览 | 无 |
| `overview` | 单交易对概览 | `symbol` |
| `fills` / `trade` | 成交明细 | `symbol` |
| `orderbook` | 订单簿深度 | `symbol`、`interval` |
| `percent10` | 深度视图 | `symbol` |
| `position` | 市场持仓统计 | `symbol` |
| `market-candles` | 市场 K 线 | `symbol`、`interval` |
| `index-candles` | 指数 K 线 | `symbol`、`interval` |
| `mark-candles` | 标记 K 线 | `symbol`、`interval` |

K 线周期：`1m`、`5m`、`15m`、`1h`、`4h`、`1d` 等；也兼容 `1min`、`1hour`、`1day`。  
深度档位：`"0"`、`"1"` 或 `"step0"`、`"step1"`。

### 1. 订阅 ticker

**请求**

```json
{
  "event": "sub",
  "params": {
    "type": "ticker",
    "symbol": "BTC-USDT"
  }
}
```

**订阅确认**

```json
{
  "id": "1710000000",
  "event": "subscribe",
  "args": [
    {
      "type": "ticker",
      "symbol": "BTC-USDT"
    }
  ]
}
```

**推送示例**

```json
{
  "arg": {
    "channel": "market.BTC-USDT.ticker",
    "symbol": "BTC-USDT"
  },
  "data": {
    "channel": "market.BTC-USDT.ticker",
    "pari_code": "BTC-USDT",
    "data": {
      "o": "64000",
      "c": "65123.5",
      "h": "65500",
      "l": "63800",
      "t": "125000000",
      "v": "1920.5",
      "b": "65120",
      "a": "65125"
    }
  }
}
```

> 推送 `data` 具体结构以线上为准，可能是业务原始 payload。

### 2. 订阅 orderbook

**请求**

```json
{
  "event": "sub",
  "params": {
    "type": "orderbook",
    "symbol": "BTC-USDT",
    "interval": "0"
  }
}
```

**订阅确认**

```json
{
  "id": "1710000001",
  "event": "subscribe",
  "args": [
    {
      "type": "orderbook",
      "symbol": "BTC-USDT",
      "interval": "0"
    }
  ]
}
```

**推送示例**

```json
{
  "arg": {
    "channel": "depth.BTC-USDT.0",
    "symbol": "BTC-USDT"
  },
  "data": {
    "channel": "depth.BTC-USDT.0",
    "pari_code": "BTC-USDT",
    "data": {
      "b": [["65120", "1.25"], ["65110", "2.1"]],
      "a": [["65125", "0.9"], ["65130", "1.5"]],
      "t": 1710000000123,
      "v": 987654321,
      "i": "0"
    }
  }
}
```

### 3. 订阅 K 线

**请求**

```json
{
  "event": "sub",
  "params": {
    "type": "market-candles",
    "symbol": "BTC-USDT",
    "interval": "1m"
  }
}
```

**订阅确认**

```json
{
  "id": "1710000002",
  "event": "subscribe",
  "args": [
    {
      "type": "market-candles",
      "symbol": "BTC-USDT",
      "interval": "1m"
    }
  ]
}
```

**推送示例**

```json
{
  "arg": {
    "channel": "kline.BTC-USDT.market.1m",
    "symbol": "BTC-USDT",
    "type": "market"
  },
  "data": {
    "s": 1710000000,
    "o": "65000",
    "c": "65050.5",
    "h": "65100",
    "l": "64980",
    "t": "1250000",
    "v": "19.2"
  }
}
```

### 4. 订阅成交 fills

**请求**

```json
{
  "event": "sub",
  "params": {
    "type": "fills",
    "symbol": "BTC-USDT"
  }
}
```

**推送示例**

```json
{
  "arg": {
    "channel": "market.BTC-USDT.trade",
    "symbol": "BTC-USDT"
  },
  "data": {
    "pari_code": "BTC-USDT",
    "channel": "market.BTC-USDT.trade",
    "data": [
      { "v": "0.01", "t": 1710000000123, "p": "65123.5", "d": true }
    ]
  }
}
```

### 5. 取消订阅

**请求**

```json
{
  "event": "unsub",
  "params": {
    "type": "ticker",
    "symbol": "BTC-USDT"
  }
}
```

**响应**

```json
{
  "id": "1710000003",
  "event": "unsubscribe",
  "args": [
    {
      "type": "ticker",
      "symbol": "BTC-USDT"
    }
  ]
}
```

---

## 一次性请求 `req`

不建立持续订阅，适合初始化或补数据。

### 1. 拉取 ticker

**请求**

```json
{
  "event": "req",
  "params": {
    "type": "ticker",
    "symbol": "BTC-USDT"
  }
}
```

**响应示例**

```json
{
  "arg": {
    "channel": "market.Overview",
    "symbol": "BTC-USDT"
  },
  "data": {
    "pairCode": "BTC-USDT",
    "market": {
      "o": "64000",
      "c": "65123.5",
      "h": "65500",
      "l": "63800",
      "t": "125000000",
      "v": "1920.5",
      "b": "65120",
      "a": "65125"
    },
    "index": { "c": "65110" },
    "tag": { "c": "65115" }
  }
}
```

### 2. 拉取 orderbook

**请求**

```json
{
  "event": "req",
  "params": {
    "type": "orderbook",
    "symbol": "BTC-USDT",
    "interval": "0"
  }
}
```

**响应示例**

```json
{
  "arg": {
    "channel": "depth.BTC-USDT.0",
    "symbol": "BTC-USDT"
  },
  "data": {
    "b": [["65120", "1.25"]],
    "a": [["65125", "0.9"]],
    "t": 1710000000123,
    "v": 987654321
  }
}
```

### 3. 拉取最近成交

**请求**

```json
{
  "event": "req",
  "params": {
    "type": "trade",
    "symbol": "BTC-USDT",
    "size": 50
  }
}
```

**响应示例**

```json
{
  "arg": {
    "channel": "market.BTC-USDT.trade",
    "symbol": "BTC-USDT"
  },
  "data": [
    { "v": "0.01", "t": 1710000000123, "p": "65123.5", "d": true },
    { "v": "0.02", "t": 1710000000456, "p": "65120", "d": false }
  ]
}
```

### 4. 拉取历史 K 线

**请求**

```json
{
  "event": "req",
  "params": {
    "type": "market-candles",
    "symbol": "BTC-USDT",
    "interval": "1m",
    "from": 1710000000,
    "to": 1710003600,
    "size": 100
  }
}
```

| 字段 | 说明 |
|------|------|
| `from` / `to` | Unix **秒** |
| `size` | 条数 |
| `interval` | 周期 |

**响应示例**

```json
{
  "arg": {
    "channel": "request-kline",
    "symbol": "BTC-USDT",
    "type": "market-candles"
  },
  "data": [
    {
      "s": 1710000000,
      "o": "65000",
      "c": "65050.5",
      "h": "65100",
      "l": "64980",
      "t": "1250000",
      "v": "19.2",
      "p": "BTC-USDT",
      "i": "1m"
    }
  ]
}
```

---

## 接入建议

1. 连接后立即处理 `ping` / `pong`。
2. 订阅前确认 `symbol`、`interval` 有效。
3. 高频场景优先用 `sub`；`req` 用于补洞或初始化。
4. 账户与订单请使用 [私有 WebSocket](./private-ws.md)。
