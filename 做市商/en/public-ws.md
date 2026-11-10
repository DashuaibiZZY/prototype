# Public WebSocket

中文：[`../public-ws.md`](../public-ws.md)

No login required. Use it to subscribe to real-time market data or pull snapshot data on demand.

## Connection

```text
wss://{host}/notification/public
```

Local example: `ws://localhost:8080/notification/public`

### On connect (server may push first)

```json
{"pong": 1710000000000}
```

---

## Heartbeat

### Server push

```json
{"ping": 1710000000123}
```

### Client reply (within about 30 seconds)

```json
{"pong": 1710000000123}
```

The connection is closed if no reply is received in time.

---

## Common format

### Client request

```json
{
  "event": "sub",
  "params": {}
}
```

| `event` | Description |
|---------|------|
| `sub` | Subscribe to a channel |
| `unsub` | Unsubscribe |
| `req` | One-shot fetch (rate limited) |

### Error response

```json
{
  "id": "1710000000",
  "event": "error",
  "code": "500",
  "msg": "params error",
  "args": []
}
```

Rate limit example:

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

## Subscribe / unsubscribe

### Supported channel `type`

| type | Description | Extra parameters |
|------|------|----------|
| `ticker` | Single-symbol ticker | `symbol` |
| `tickers` | All-market overview | None |
| `overview` | Single-symbol overview | `symbol` |
| `fills` / `trade` | Trade stream | `symbol` |
| `orderbook` | Order book depth | `symbol`, `interval` |
| `percent10` | Depth view | `symbol` |
| `position` | Market position stats | `symbol` |
| `market-candles` | Market candles | `symbol`, `interval` |
| `index-candles` | Index candles | `symbol`, `interval` |
| `mark-candles` | Mark candles | `symbol`, `interval` |

Candle intervals: `1m`, `5m`, `15m`, `1h`, `4h`, `1d`, etc.; also `1min`, `1hour`, `1day`.  
Depth step: `"0"`, `"1"` or `"step0"`, `"step1"`.

### 1. Subscribe to ticker

**Request**

```json
{
  "event": "sub",
  "params": {
    "type": "ticker",
    "symbol": "BTC-USDT"
  }
}
```

**Subscribe acknowledgment**

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

**Push example**

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

> The exact shape of push `data` may vary in production.

### 2. Subscribe to orderbook

**Request**

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

**Subscribe acknowledgment**

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

**Push example**

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

### 3. Subscribe to candles

**Request**

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

**Subscribe acknowledgment**

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

**Push example**

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

### 4. Subscribe to fills

**Request**

```json
{
  "event": "sub",
  "params": {
    "type": "fills",
    "symbol": "BTC-USDT"
  }
}
```

**Push example**

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

### 5. Unsubscribe

**Request**

```json
{
  "event": "unsub",
  "params": {
    "type": "ticker",
    "symbol": "BTC-USDT"
  }
}
```

**Response**

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

## One-shot requests (`req`)

No persistent subscription; suitable for initialization or backfill.

### 1. Fetch ticker

**Request**

```json
{
  "event": "req",
  "params": {
    "type": "ticker",
    "symbol": "BTC-USDT"
  }
}
```

**Response example**

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

### 2. Fetch orderbook

**Request**

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

**Response example**

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

### 3. Fetch recent trades

**Request**

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

**Response example**

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

### 4. Fetch historical candles

**Request**

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

| Field | Description |
|------|------|
| `from` / `to` | Unix **seconds** |
| `size` | Number of bars |
| `interval` | Candle interval |

**Response example**

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

## Integration tips

1. Handle `ping` / `pong` immediately after connecting.
2. Validate `symbol` and `interval` before subscribing.
3. Prefer `sub` for high-frequency use; use `req` for gaps or cold start.
4. For account and orders, use [Private WebSocket](./private-ws.md).
