# REST API

所有接口路径以 `/notification` 为前缀。

## 统一响应

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | number | 业务状态码；成功一般为 `200` |
| `message` | string | 提示信息 |
| `success` | boolean | 是否成功 |
| `data` | any | 业务数据；失败时多为 `[]` |

HTTP 状态码通常为 `200`，请以 `success` / `code` 判断业务结果。

失败示例：

```json
{
  "code": 500,
  "message": "invalid symbol",
  "success": false,
  "data": []
}
```

---

## 1. 全市场概览

`GET /notification/tickers`

### 请求示例

```http
GET /notification/tickers HTTP/1.1
Host: api.example.com
```

```bash
curl -s "https://api.example.com/notification/tickers"
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": [
    {
      "pairCode": "BTC-USDT",
      "market": {
        "o": "64000",
        "c": "65123.5",
        "h": "65500",
        "l": "63800",
        "t": "125000000",
        "v": "1920.5",
        "b": "65120",
        "a": "65125",
        "bv": "1.2",
        "av": "0.8",
        "position_num": "3200.5"
      },
      "index": { "c": "65110" },
      "tag": { "c": "65115" },
      "r": "0.0001",
      "nt": 1710003600000,
      "pr": "0.00008",
      "position_num": "3200.5"
    }
  ]
}
```

---

## 2. 单交易对概览

`GET /notification/{symbol}/ticker`

| 路径参数 | 说明 |
|----------|------|
| `symbol` | 交易对，如 `BTC-USDT` |

### 请求示例

```http
GET /notification/BTC-USDT/ticker HTTP/1.1
Host: api.example.com
```

```bash
curl -s "https://api.example.com/notification/BTC-USDT/ticker"
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "success": true,
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
      "a": "65125",
      "bv": "1.2",
      "av": "0.8"
    },
    "index": { "c": "65110" },
    "tag": { "c": "65115" },
    "r": "0.0001",
    "nt": 1710003600000,
    "pr": "0.00008"
  }
}
```

---

## 3. K 线

`GET /notification/{symbol}/candles`

| 参数 | 位置 | 必填 | 说明 |
|------|------|------|------|
| `symbol` | path | 是 | 交易对 |
| `type` | query | 是 | `market` / `index` / `mark` |
| `interval` | query | 是 | 周期，如 `1m`、`5m`、`1h`、`1d`；也兼容 `1min`、`1hour`、`1day` 等 |
| `start` | query | 是 | 起始时间（Unix **秒**） |
| `end` | query | 是 | 结束时间（Unix **秒**） |
| `size` | query | 是 | 条数，范围 `1`–`2000` |

### 请求示例

```http
GET /notification/BTC-USDT/candles?type=market&interval=1m&start=1710000000&end=1710003600&size=100 HTTP/1.1
Host: api.example.com
```

```bash
curl -s "https://api.example.com/notification/BTC-USDT/candles?type=market&interval=1m&start=1710000000&end=1710003600&size=100"
```

### 响应示例（`type=market`）

```json
{
  "code": 200,
  "message": "success",
  "success": true,
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

### 响应示例（`type=index` / `mark`）

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": [
    {
      "s": 1710000000,
      "o": "65010",
      "c": "65055",
      "h": "65090",
      "l": "64995",
      "p": "BTC-USDT",
      "i": "1m"
    }
  ]
}
```

---

## 4. 订单簿（深度快照）

`GET /notification/{symbol}/orderbook`

| 参数 | 位置 | 必填 | 说明 |
|------|------|------|------|
| `symbol` | path | 是 | 交易对 |
| `interval` | query | 否 | 聚合档位，默认 `0`；可传 `0`、`1`… 或 `step0`、`step1`… |

### 请求示例

```http
GET /notification/BTC-USDT/orderbook?interval=0 HTTP/1.1
Host: api.example.com
```

```bash
curl -s "https://api.example.com/notification/BTC-USDT/orderbook?interval=0"
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "success": true,
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

无缓存数据时：

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": []
}
```

---

## 5. 最近成交

### 5.1 最新一条

`GET /notification/{symbol}/fill`

#### 请求示例

```bash
curl -s "https://api.example.com/notification/BTC-USDT/fill"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": [
    {
      "v": "0.01",
      "t": 1710000000123,
      "p": "65123.5",
      "d": true
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `v` | 成交量 |
| `t` | 成交时间（毫秒） |
| `p` | 成交价 |
| `d` | 方向（`true` / `false`，以线上约定为准） |

### 5.2 最近多条

`GET /notification/{symbol}/fills`

默认最多约 100 条。

#### 请求示例

```bash
curl -s "https://api.example.com/notification/BTC-USDT/fills"
```

#### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": [
    { "v": "0.01", "t": 1710000000123, "p": "65123.5", "d": true },
    { "v": "0.02", "t": 1710000000456, "p": "65120", "d": false }
  ]
}
```

---

## Overview 字段说明

| 字段 | 说明 |
|------|------|
| `pairCode` | 交易对 |
| `market.o` / `c` / `h` / `l` | 开 / 收 / 高 / 低 |
| `market.t` / `v` | 成交额 / 成交量 |
| `market.b` / `a` | 买一价 / 卖一价 |
| `market.bv` / `av` | 买一量 / 卖一量 |
| `market.position_num` | 未平仓数量（若有） |
| `index.c` | 指数价 |
| `tag.c` | 标记价 |
| `r` | 资金费率 |
| `nt` | 下一次资金费时间 |
| `pr` | 上次资金费率 |
| `rf` | 风险基金（若有） |
| `position_num` | 未平仓数量（顶层冗余） |

部分字段在无数据时可能省略。
