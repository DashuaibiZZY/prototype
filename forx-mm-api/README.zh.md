# FORX 做市接口

英文文档：[`README.md`](./README.md)  
OpenAPI：[`openapi.yaml`](./openapi.yaml)

可用 Swagger UI / Redoc / Stoplight 打开 `openapi.yaml`。

---

## 鉴权

除探活和监控外，所有接口都要带下面四个头：

| Header | 说明 |
| --- | --- |
| `FORX-ACCESS-KEY` | API Key |
| `FORX-ACCESS-SIGN` | `Base64(HMAC-SHA256(prehash, SecretKey))` |
| `FORX-ACCESS-TIMESTAMP` | 毫秒 / 秒 / RFC3339。必须与参与签名的原文一致 |
| `FORX-ACCESS-PASSPHRASE` | 创建 Key 时设置的口令。不参与 HMAC |

```
prehash = timestamp + METHOD + requestPath + body
```

- `METHOD`：大写，`GET` / `POST` / `PUT`
- `requestPath`：path 加 query，不含域名。例如 `/mm/trade/orders-pending?product_name=BTC-USDT-SWAP`
- `body`：原始 JSON 字符串。没有 body 时为空字符串，不要重新排版
- 与服务端时间相差超过 30 秒，返回 `timestamp timeout`

### Python 签名

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

### 示例

运行前设置环境变量：

| 变量 | 说明 |
| --- | --- |
| `FORX_MM_BASE` | 接口根地址（默认 `http://localhost:8080`） |
| `FORX_API_KEY` | API Key |
| `FORX_SECRET_KEY` | Secret Key |
| `FORX_PASSPHRASE` | 口令 |

#### `curl_place_order.sh`

保存为 `curl_place_order.sh`，`chmod +x` 后执行。对 `POST /mm/trade/order` 签名并提交**限价开多**委托。

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

保存为 `sign_and_request.py`，执行 `python3 sign_and_request.py`。仅标准库。`main()` 依次：`GET /mm/ping`（不鉴权）→ `POST /mm/trade/order` → `GET /mm/trade/orders-pending?product_name=...` → `GET /mm/account/trading-assets`。带 query 的 GET 须在签名原文中包含完整 `requestPath`（含 `?` 后参数）。

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

鉴权失败 HTTP `401`，`msg` 为：

| msg | 原因 |
| --- | --- |
| `missing params` | 四个头缺任意一个 |
| `timestamp timeout` | 时间戳无法解析，或与服务端相差超过 30 秒 |
| `invalid token` | API Key / 口令无效，或凭证拉取失败 |
| `invalid signature` | 签名与 method、path、body、timestamp 不一致 |

---

## 响应格式

```json
{ "code": 0, "msg": "success", "data": {}, "fd": "..." }
```

| 字段 | 说明 |
| --- | --- |
| `code` | `0` 成功；非 0 为业务错误码 |
| `msg` | 成功文案或错误详情 |
| `data` | 业务数据 |
| `fd` | 请求追踪 ID |

业务接口通常 HTTP `200`，以 body 里的 `code` 判断结果。鉴权失败返回 `401`。

---

## 接口

### 公开接口（不鉴权）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/mm/ping` | 探活 |
| GET | `/mm/ts` | 服务端时间，unix 毫秒 |

### 交易

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/mm/trade/order` | 下单 |
| POST | `/mm/trade/batch-orders` | 批量下单（≤20） |
| PUT | `/mm/trade/cancel-order` | 撤单 |
| PUT | `/mm/trade/cancel-batch-orders` | 批量撤单（≤20） |
| PUT | `/mm/trade/close-position` | 市价全平 |
| PUT | `/mm/trade/close-batch-positions` | 批量市价全平 |
| POST | `/mm/trade/wash-trading` | 刷量单 |
| POST | `/mm/trade/self-trading` | 对敲单 |
| POST | `/mm/trade/report-index` | 上报指数价格 |
| POST | `/mm/trade/report-mark` | 上报标记价格 |
| POST | `/mm/trade/report-funding-rate` | 上报资金费率 |
| GET | `/mm/trade/orders-pending` | 当前委托 |
| GET | `/mm/trade/orders-history` | 历史委托 |
| GET | `/mm/trade/positions` | 当前持仓 |
| GET | `/mm/trade/positions-history` | 历史持仓 |
| GET | `/mm/trade/fills` | 成交明细 |

### 账户

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| PUT | `/mm/account/margin-balance` | 调整保证金（仅逐仓） |
| PUT | `/mm/account/set-mgn-mode` | 修改保证金模式 |
| PUT | `/mm/account/set-leverage` | 修改仓位杠杆 |
| PUT | `/mm/account/set-dual-leverage` | 修改币对杠杆 |
| GET | `/mm/account/funding-assets` | 资金账户资产 |
| GET | `/mm/account/trading-assets` | 交易账户资产 |
| GET | `/mm/account/funding-bills` | 资金账单 |
| GET | `/mm/account/trading-bills` | 交易账单 |

### 划转

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/mm/asset/transfer` | 资金账户与交易账户互转。`trans_type` 为 `1` 资金→交易，`2` 交易→资金 |

---

## 示例

### 下单

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

成功响应：

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

### 撤单

`PUT /mm/trade/cancel-order`

`order_id` 与 `cl_ord_id` 至少填一个。

```json
{
  "product_name": "BTC-USDT-SWAP",
  "order_id": "1987654321098765432"
}
```

### 当前委托（游标分页）

`GET /mm/trade/orders-pending?product_name=BTC-USDT-SWAP`

下一页带上一页最后一条的 `created_at` 和 `order_id`：

`?after_created_at=1730000000123&after_order_id=1987654321098765432`

### 交易账户资产

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

`balance` 等字段：`total` 为总额，`self` 为自有，`bonus` 为体验金。

### 划转

`POST /mm/asset/transfer`

```json
{
  "trans_type": 1,
  "coin_id": 1,
  "amount": "100"
}
```

`trans_type`：`1` 资金账户 → 交易账户，`2` 交易账户 → 资金账户。

---

## 枚举

| 字段 | 取值 |
| --- | --- |
| `side` | `buy` / `sell` |
| `pos_side` | `long` / `short`（`set-leverage` 还允许 `net`） |
| `ord_type` | `limit` / `market` / `fok` / `ioc` / `post_only` |
| `trade_unit` | `base` 基础币数量 / `quote` 计价币金额 / `size` 合约张数 |
| `mgn_mode` | `isolated` 逐仓 / `cross` 全仓 |
| `product_type`（query） | `swap` / `spot` |
| `trans_type` | `1` 资金→交易 / `2` 交易→资金 |

历史查询默认窗口为 **7 天**。委托和账单每页固定 **20** 条，用 `after_*` 游标翻页。
