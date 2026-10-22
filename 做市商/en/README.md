# FORX Market Maker API

中文总览：[`../README.md`](../README.md)  
OpenAPI: [`../openapi.yaml`](../openapi.yaml)

Preview `openapi.yaml` with Swagger UI / Redoc / Stoplight.

---

## Documentation

| File | Description |
| --- | --- |
| **README.md** | Index (this page) |
| [**rest-api.md**](./rest-api.md) | REST: auth, endpoints, examples, enums |
| [**public-ws.md**](./public-ws.md) | Public WebSocket |
| [**private-ws.md**](./private-ws.md) | Private WebSocket |

---

## Overview

| Channel | Use |
| --- | --- |
| **REST** | Place/cancel orders, queries, transfers |
| **Public WS** | Market data streams |
| **Private WS** | Account order/fill/position updates |

Private WS login uses the same API key material as REST (see `rest-api.md` and `private-ws.md`).

---

## Authentication (summary)

REST calls (except health) require `FORX-ACCESS-KEY`, `FORX-ACCESS-SIGN`, `FORX-ACCESS-TIMESTAMP`, `FORX-ACCESS-PASSPHRASE`.

```
prehash = timestamp + METHOD + requestPath + body
```

Full signing rules, scripts, and error messages: **[rest-api.md](./rest-api.md)** (Authentication section).

---

## Examples

| File | Description |
| --- | --- |
| [`../examples/curl_place_order.sh`](../examples/curl_place_order.sh) | Signed `curl` limit open-long |
| [`../examples/sign_and_request.py`](../examples/sign_and_request.py) | Python: ping → order → open orders → assets |

Environment variables: `FORX_MM_BASE`, `FORX_API_KEY`, `FORX_SECRET_KEY`, `FORX_PASSPHRASE`.  
WebSocket URLs: see `public-ws.md` / `private-ws.md`.

---

## REST response envelope

```json
{ "code": 0, "msg": "success", "data": {}, "fd": "..." }
```

Details: [rest-api.md § Response format](./rest-api.md#response-format).
