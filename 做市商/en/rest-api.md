# FORX Market Maker REST API

Back to index: [`README.md`](./README.md)  
中文：[`../rest-api.md`](../rest-api.md)  
OpenAPI (if provided): [`../openapi.yaml`](../openapi.yaml)

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

Set credentials before running either script:

| Variable | Description |
| --- | --- |
| `FORX_MM_BASE` | API base URL (default `http://localhost:8080`) |
| `FORX_API_KEY` | API Key |
| `FORX_SECRET_KEY` | Secret Key |
| `FORX_PASSPHRASE` | Passphrase |

#### `curl_place_order.sh`

Save as `curl_place_order.sh`, `chmod +x`, then run with the env vars above. It signs `POST /mm/trade/order` and places a **limit open-long** order.

```bash
#!/usr/bin/env bash
# Place-order curl example
set -euo pipefail

BASE_URL="${FORX_MM_BASE:-http://localhost:8080}"
API_KEY="${FORX_API_KEY:?set FORX_API_KEY}"
SECRET_KEY="${FORX_SECRET_KEY:?set FORX_SECRET_KEY}"
PASSPHRASE="${FORX_PASSPHRASE:?set FORX_PASSPHRASE}"

METHOD="POST"
PATH_ONLY="/mm/trade/order"
BODY='{"product_name":"BTC-USDT-SWAP","cl_ord_id":"mm-curl-1","side":"buy","pos_side":"long","ord_type":"limit","trade_unit":"size","px":"65000","sz":"1"}'
TS="$(python3 -c 'import time; print(int(time.time()*1000))')"

SIGN="$(
  TS="$TS" METHOD="$METHOD" PATH_ONLY="$PATH_ONLY" BODY="$BODY" SECRET_KEY="$SECRET_KEY" python3 - <<'PY'
import base64, hashlib, hmac, os
ts = os.environ["TS"]
method = os.environ["METHOD"]
path = os.environ["PATH_ONLY"]
body = os.environ["BODY"]
secret = os.environ["SECRET_KEY"]
prehash = f"{ts}{method}{path}{body}"
print(base64.b64encode(hmac.new(secret.encode(), prehash.encode(), hashlib.sha256).digest()).decode())
PY
)"

curl -sS -X POST "${BASE_URL}${PATH_ONLY}" \
  -H "Content-Type: application/json" \
  -H "FORX-ACCESS-KEY: ${API_KEY}" \
  -H "FORX-ACCESS-SIGN: ${SIGN}" \
  -H "FORX-ACCESS-TIMESTAMP: ${TS}" \
  -H "FORX-ACCESS-PASSPHRASE: ${PASSPHRASE}" \
  -d "${BODY}"
echo
```

#### `sign_and_request.py`

Save as `sign_and_request.py` and run with `python3 sign_and_request.py`. Stdlib only. `main()` calls: `GET /mm/ping` (no auth) → `POST /mm/trade/order` → `GET /mm/trade/orders-pending?product_name=...` → `GET /mm/account/trading-assets`. For GET with query, sign the full `requestPath` including `?key=value`.

```python
#!/usr/bin/env python3
"""FORX MM API — HMAC auth and basic request examples (OKX-style)."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Optional
from urllib.parse import urlencode

import urllib.request

BASE_URL = os.getenv("FORX_MM_BASE", "http://localhost:8080")
API_KEY = os.getenv("FORX_API_KEY", "your-api-key")
SECRET_KEY = os.getenv("FORX_SECRET_KEY", "your-secret-key")
PASSPHRASE = os.getenv("FORX_PASSPHRASE", "your-passphrase")


def sign(timestamp: str, method: str, request_path: str, body: str, secret: str) -> str:
    """prehash = timestamp + METHOD + requestPath + body → Base64(HMAC-SHA256)."""
    prehash = f"{timestamp}{method.upper()}{request_path}{body}"
    digest = hmac.new(secret.encode(), prehash.encode(), hashlib.sha256).digest()
    return base64.b64encode(digest).decode()


def request(
    method: str,
    path: str,
    *,
    query: Optional[dict[str, Any]] = None,
    body: Any = None,
    auth: bool = True,
) -> dict:
    request_path = path
    if query:
        request_path = f"{path}?{urlencode({k: v for k, v in query.items() if v is not None})}"

    body_str = ""
    if body is not None:
        body_str = json.dumps(body, separators=(",", ":"), ensure_ascii=False)

    headers = {"Content-Type": "application/json"}
    if auth:
        # Prefer 13-digit millisecond timestamp (also supports seconds / RFC3339)
        ts = str(int(time.time() * 1000))
        headers.update(
            {
                "FORX-ACCESS-KEY": API_KEY,
                "FORX-ACCESS-SIGN": sign(ts, method, request_path, body_str, SECRET_KEY),
                "FORX-ACCESS-TIMESTAMP": ts,
                "FORX-ACCESS-PASSPHRASE": PASSPHRASE,
            }
        )

    req = urllib.request.Request(
        f"{BASE_URL}{request_path}",
        data=body_str.encode() if body_str else None,
        headers=headers,
        method=method.upper(),
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def main() -> None:
    # 1) Public endpoint
    print("GET /mm/ping =>", request("GET", "/mm/ping", auth=False))

    # 2) Place order (limit open long)
    order = {
        "product_name": "BTC-USDT-SWAP",
        "cl_ord_id": f"mm-{int(time.time())}",
        "side": "buy",
        "pos_side": "long",
        "ord_type": "limit",
        "trade_unit": "size",
        "px": "65000",
        "sz": "1",
    }
    print("POST /mm/trade/order =>", request("POST", "/mm/trade/order", body=order))

    # 3) Query open orders
    print(
        "GET /mm/trade/orders-pending =>",
        request("GET", "/mm/trade/orders-pending", query={"product_name": "BTC-USDT-SWAP"}),
    )

    # 4) Trading account assets
    print("GET /mm/account/trading-assets =>", request("GET", "/mm/account/trading-assets"))


if __name__ == "__main__":
    main()
```

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
