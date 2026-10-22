# FORX Market Maker Public WebSocket

Back to index: [`README.md`](./README.md)  
中文：[`../public-ws.md`](../public-ws.md)

Public channels do **not** require REST auth headers. Use them for tickers, order book, trades, mark/index price, funding rate, etc.

---

## Connection

| Item | Description |
| --- | --- |
| URL | Provided by operations; example `wss://{host}/mm/ws/public` (`FORX_MM_WS_PUBLIC`) |
| Protocol | WebSocket, **text frames**, UTF-8 JSON |
| Compression | Per gateway config if enabled |

On disconnect: reconnect with backoff and **re-subscribe** all channels.

---

## Heartbeat

Client (interval ≤ 30s unless server specifies otherwise):

```json
{ "op": "ping" }
```

Server:

```json
{ "op": "pong" }
```

If no `pong` within the server timeout, close and reconnect.

---

## Subscribe / unsubscribe

**Subscribe**

```json
{
  "op": "subscribe",
  "args": [
    { "channel": "books", "product_name": "BTC-USDT-SWAP" }
  ]
}
```

**Unsubscribe**

```json
{
  "op": "unsubscribe",
  "args": [
    { "channel": "books", "product_name": "BTC-USDT-SWAP" }
  ]
}
```

| Field | Type | Description |
| --- | --- | --- |
| `op` | string | `subscribe` / `unsubscribe` / `ping` |
| `args` | array | Subscription items |
| `args[].channel` | string | Channel name (table below) |
| `args[].product_name` | string | Same as REST `product_name`, e.g. `BTC-USDT-SWAP` |

---

## Channels

| channel | Description |
| --- | --- |
| `tickers` | 24h ticker snapshot |
| `books` | Order book (depth granularity per server) |
| `trades` | Public trades |
| `mark-price` | Mark price |
| `index-price` | Index price |
| `funding-rate` | Funding rate / next funding time |

Multiple `product_name` and `channel` values per connection are allowed.

---

## Push format

```json
{
  "arg": {
    "channel": "books",
    "product_name": "BTC-USDT-SWAP"
  },
  "data": []
}
```

Snapshot vs incremental updates (e.g. depth `action`: `snapshot` / `update`) follow server/OpenAPI specs.

---

## Errors

```json
{
  "event": "error",
  "code": "60012",
  "msg": "Invalid request"
}
```

Fix `channel` / `product_name` before retrying. Auth errors on a public socket should not occur.

---

## REST

- Trading and queries: [`rest-api.md`](./rest-api.md).
- MM price reports (if enabled): REST `POST /mm/trade/report-*`.
