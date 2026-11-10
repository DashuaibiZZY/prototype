# REST API

中文：[`../rest-api.md`](../rest-api.md)

All API paths are prefixed with `/notification`.

## Unified response

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": {}
}
```

| Field | Type | Description |
|------|------|------|
| `code` | number | Business status code; success is typically `200` |
| `message` | string | Message text |
| `success` | boolean | Whether the request succeeded |
| `data` | any | Business payload; often `[]` on failure |

HTTP status is usually `200`; use `success` / `code` to determine the business outcome.

Failure example:

```json
{
  "code": 500,
  "message": "invalid symbol",
  "success": false,
  "data": []
}
```

---

## 1. All-market overview

`GET /notification/tickers`

### Request example

```http
GET /notification/tickers HTTP/1.1
Host: api.example.com
```

```bash
curl -s "https://api.example.com/notification/tickers"
```

### Response example

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

## 2. Single-symbol overview

`GET /notification/{symbol}/ticker`

| Path parameter | Description |
|----------|------|
| `symbol` | Trading pair, e.g. `BTC-USDT` |

### Request example

```http
GET /notification/BTC-USDT/ticker HTTP/1.1
Host: api.example.com
```

```bash
curl -s "https://api.example.com/notification/BTC-USDT/ticker"
```

### Response example

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

## 3. Candles (K-line)

`GET /notification/{symbol}/candles`

| Parameter | Location | Required | Description |
|------|------|------|------|
| `symbol` | path | Yes | Trading pair |
| `type` | query | Yes | `market` / `index` / `mark` |
| `interval` | query | Yes | Interval, e.g. `1m`, `5m`, `1h`, `1d`; also accepts `1min`, `1hour`, `1day`, etc. |
| `start` | query | Yes | Start time (Unix **seconds**) |
| `end` | query | Yes | End time (Unix **seconds**) |
| `size` | query | Yes | Number of bars, range `1`–`2000` |

### Request example

```http
GET /notification/BTC-USDT/candles?type=market&interval=1m&start=1710000000&end=1710003600&size=100 HTTP/1.1
Host: api.example.com
```

```bash
curl -s "https://api.example.com/notification/BTC-USDT/candles?type=market&interval=1m&start=1710000000&end=1710003600&size=100"
```

### Response example (`type=market`)

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

### Response example (`type=index` / `mark`)

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

## 4. Order book (depth snapshot)

`GET /notification/{symbol}/orderbook`

| Parameter | Location | Required | Description |
|------|------|------|------|
| `symbol` | path | Yes | Trading pair |
| `interval` | query | No | Aggregation step, default `0`; may be `0`, `1`, … or `step0`, `step1`, … |

### Request example

```http
GET /notification/BTC-USDT/orderbook?interval=0 HTTP/1.1
Host: api.example.com
```

```bash
curl -s "https://api.example.com/notification/BTC-USDT/orderbook?interval=0"
```

### Response example

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

When no cached data is available:

```json
{
  "code": 200,
  "message": "success",
  "success": true,
  "data": []
}
```

---

## 5. Recent trades

### 5.1 Latest trade

`GET /notification/{symbol}/fill`

#### Request example

```bash
curl -s "https://api.example.com/notification/BTC-USDT/fill"
```

#### Response example

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

| Field | Description |
|------|------|
| `v` | Trade size |
| `t` | Trade time (milliseconds) |
| `p` | Trade price |
| `d` | Side (`true` / `false`; per production convention) |

### 5.2 Recent trades (multiple)

`GET /notification/{symbol}/fills`

Returns up to about 100 trades by default.

#### Request example

```bash
curl -s "https://api.example.com/notification/BTC-USDT/fills"
```

#### Response example

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

## Overview field reference

| Field | Description |
|------|------|
| `pairCode` | Trading pair |
| `market.o` / `c` / `h` / `l` | Open / close / high / low |
| `market.t` / `v` | Turnover / volume |
| `market.b` / `a` | Best bid / best ask price |
| `market.bv` / `av` | Best bid / best ask size |
| `market.position_num` | Open interest (if present) |
| `index.c` | Index price |
| `tag.c` | Mark price |
| `r` | Funding rate |
| `nt` | Next funding time |
| `pr` | Previous funding rate |
| `rf` | Risk fund (if present) |
| `position_num` | Open interest (top-level duplicate) |

Some fields may be omitted when there is no data.
