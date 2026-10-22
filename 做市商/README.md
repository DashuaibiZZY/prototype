# FORX 做市商接入

做市商（MM）接入文档：**REST** 与 **WebSocket（公共 / 私有）**。

| 文档 | 说明 |
| --- | --- |
| [`rest-api.md`](./rest-api.md) | REST：鉴权、接口列表、请求示例、枚举 |
| [`public-ws.md`](./public-ws.md) | 公共 WebSocket：行情、深度、成交等订阅 |
| [`private-ws.md`](./private-ws.md) | 私有 WebSocket：订单、持仓、账户等推送 |
| [`en/README.md`](./en/README.md) | English index |

## 示例代码

| 文件 | 说明 |
| --- | --- |
| [`examples/curl_place_order.sh`](./examples/curl_place_order.sh) | `curl` 签名并下单 |
| [`examples/sign_and_request.py`](./examples/sign_and_request.py) | Python 签名与常用 REST 调用 |

## 环境变量（示例脚本）

| 变量 | 说明 |
| --- | --- |
| `FORX_MM_BASE` | REST 根地址，如 `https://api.example.com` |
| `FORX_MM_WS_PUBLIC` | 公共 WS 地址，见 `public-ws.md` |
| `FORX_MM_WS_PRIVATE` | 私有 WS 地址，见 `private-ws.md` |
| `FORX_API_KEY` / `FORX_SECRET_KEY` / `FORX_PASSPHRASE` | API 凭证 |

## OpenAPI

若仓库提供 `openapi.yaml`，可用 Swagger UI / Redoc 预览；与本文冲突时以 **现网行为** 为准。
