# FORX Market Maker API

中文：[`README.zh.md`](./README.zh.md)  
OpenAPI spec: [`openapi.yaml`](./openapi.yaml)  

Preview with Swagger UI / Redoc / Stoplight.

---

## Authentication

All endpoints except health checks require:

| Header | Description |
| --- | --- |
| `FORX-ACCESS-KEY` | API Key |
| `FORX-ACCESS-SIGN` | `Base64(HMAC-SHA256(prehash, SecretKey))` |
| `FORX-ACCESS-TIMESTAMP` | Milliseconds / seconds / RFC3339 (must match the signed value) |
| `FORX-ACCESS-PASSPHRASE` | Passphrase set when creating the key |

```
prehash = timestamp + METHOD + requestPath + body
```

- `METHOD`: uppercase (`GET` / `POST` / `PUT`)
- `requestPath`: path including query, e.g. `/mm/trade/orders-pending?product_name=BTC-USDT-SWAP`
- `body`: raw JSON string; empty string when there is no body
- Clock skew > 30s → `timestamp timeout`

### Python signing snippet

```python
import base64, hashlib, hmac, time

ts = str(int(time.time() * 1000))
method = "POST"
path = "/mm/trade/order"
body = '{"product_name":"BTC-USDT-SWAP","side":"buy","pos_side":"long","ord_type":"limit","trade_unit":"size","px":"65000","sz":"1"}'
prehash = ts + method + path + body
sign = base64.b64encode(
    hmac.new(secret.encode(), prehash.encode(), hashlib.sha256).digest()
).decode()
```

### Examples

Set credentials (both scripts read these environment variables):

| Variable | Description |
| --- | --- |
| `FORX_MM_BASE` | API base URL (default `http://localhost:8080`) |
| `FORX_API_KEY` | API Key |
| `FORX_SECRET_KEY` | Secret Key |
| `FORX_PASSPHRASE` | Passphrase |

#### cURL — place order

[`examples/curl_place_order.sh`](./examples/curl_place_order.sh) builds a millisecond timestamp, signs `POST` + `/mm/trade/order` + JSON body, and sends a **limit open-long** order.

```bash
export FORX_MM_BASE=https://your-mm-gateway.example
export FORX_API_KEY=your-api-key
export FORX_SECRET_KEY=your-secret-key
export FORX_PASSPHRASE=your-passphrase

chmod +x examples/curl_place_order.sh
./examples/curl_place_order.sh
```

#### Python — sign helper and sample calls

[`examples/sign_and_request.py`](./examples/sign_and_request.py) provides `sign()` and `request()` (stdlib only). Running `main()` calls, in order:

1. `GET /mm/ping` (no auth)
2. `POST /mm/trade/order` (limit open long, same fields as the curl example)
3. `GET /mm/trade/orders-pending?product_name=BTC-USDT-SWAP`
4. `GET /mm/account/trading-assets`

```bash
export FORX_API_KEY=your-api-key
export FORX_SECRET_KEY=your-secret-key
export FORX_PASSPHRASE=your-passphrase

python3 examples/sign_and_request.py
```

For GET requests with query strings, `request()` signs the full `requestPath` including `?key=value` (see `orders-pending` in the script).

---

## Response format

```json
{ "code": 0, "msg": "success", "data": {}, "fd": "..." }
```

| Field | Description |
| --- | --- |
| `code` | `0` success; non-zero business error |
| `msg` | Message or error detail |
| `data` | Payload |
| `fd` | Request trace ID |

Business endpoints usually return HTTP `200`; check `code`. Auth failures return `401`.

---

## Endpoints

### Public (no auth)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/mm/ping` | Health ping |
| GET | `/mm/ts` | Server timestamp (ms) |

### Trade

| Method | Path | Description |
| --- | --- | --- |
| POST | `/mm/trade/order` | Place order |
| POST | `/mm/trade/batch-orders` | Batch place (≤20) |
| PUT | `/mm/trade/cancel-order` | Cancel order |
| PUT | `/mm/trade/cancel-batch-orders` | Batch cancel (≤20) |
| PUT | `/mm/trade/close-position` | Market close position |
| PUT | `/mm/trade/close-batch-positions` | Batch market close |
| POST | `/mm/trade/wash-trading` | Wash trading order |
| POST | `/mm/trade/self-trading` | Self-trading order |
| POST | `/mm/trade/report-index` | Report index price |
| POST | `/mm/trade/report-mark` | Report mark price |
| POST | `/mm/trade/report-funding-rate` | Report funding rate |
| GET | `/mm/trade/orders-pending` | Open orders |
| GET | `/mm/trade/orders-history` | Order history |
| GET | `/mm/trade/positions` | Open positions |
| GET | `/mm/trade/positions-history` | Position history |
| GET | `/mm/trade/fills` | Fill details |

### Account

| Method | Path | Description |
| --- | --- | --- |
| PUT | `/mm/account/margin-balance` | Adjust margin (isolated only) |
| PUT | `/mm/account/set-mgn-mode` | Set margin mode |
| PUT | `/mm/account/set-leverage` | Set position leverage |
| PUT | `/mm/account/set-dual-leverage` | Set product leverage |
| GET | `/mm/account/funding-assets` | Funding account assets |
| GET | `/mm/account/trading-assets` | Trading account assets |
| GET | `/mm/account/funding-bills` | Funding bills |
| GET | `/mm/account/trading-bills` | Trading bills |

### Asset

| Method | Path | Description |
| --- | --- | --- |
| POST | `/mm/asset/transfer` | Funding ↔ trading transfer. `trans_type` 1 funding→trading, 2 trading→funding |

---

## Basic examples

### Place order

`POST /mm/trade/order`

```json
{
  "product_name": "BTC-USDT-SWAP",
  "cl_ord_id": "mm-001",
  "side": "buy",
  "pos_side": "long",
  "ord_type": "limit",
  "trade_unit": "size",
  "px": "65000",
  "sz": "1"
}
```

Success response:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "order_id": "1987654321098765432",
    "cl_ord_id": "mm-001",
    "state": "order init"
  },
  "fd": "..."
}
```

### Cancel order

`PUT /mm/trade/cancel-order`

```json
{
  "product_name": "BTC-USDT-SWAP",
  "order_id": "1987654321098765432"
}
```

### Open orders (cursor pagination)

`GET /mm/trade/orders-pending?product_name=BTC-USDT-SWAP`

Next page — pass the last item from the previous page:

`?after_created_at=1730000000123&after_order_id=1987654321098765432`

### Trading assets

`GET /mm/account/trading-assets`

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "coin_id": 1,
      "coin_name": "USDT",
      "balance": { "total": "10000", "self": "10000", "bonus": "0" },
      "swap_entrust_margin": { "total": "0", "self": "0", "bonus": "0" },
      "isolated_position_margin": { "total": "0", "self": "0", "bonus": "0" },
      "cross_position_margin": { "total": "0", "self": "0", "bonus": "0" }
    }
  ],
  "fd": "..."
}
```

### Transfer

`POST /mm/asset/transfer`

```json
{
  "trans_type": 1,
  "coin_id": 1,
  "amount": "100"
}
```

`trans_type`: `1` funding → trading, `2` trading → funding.

---

## Enums

| Field | Values |
| --- | --- |
| `side` | `buy` / `sell` |
| `pos_side` | `long` / `short` (`net` also allowed for set-leverage) |
| `ord_type` | `limit` / `market` / `fok` / `ioc` / `post_only` |
| `trade_unit` | `base` / `quote` / `size` |
| `mgn_mode` | `isolated` / `cross` |
| `product_type` (query) | `swap` / `spot` |
| `trans_type` | `1` funding→trading / `2` trading→funding |

History queries default to a **7-day** window. Orders/bills pages are fixed at **20** items; use `after_*` cursors for pagination.
