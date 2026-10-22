# FORX 做市接口

英文文档：[`en/rest-api.md`](./en/rest-api.md)（REST）、[`en/public-ws.md`](./en/public-ws.md)、[`en/private-ws.md`](./en/private-ws.md)  
OpenAPI：[`openapi.yaml`](./openapi.yaml)

可用 Swagger UI / Redoc / Stoplight 打开 `openapi.yaml`。

---

## 文档结构

| 文件 | 说明 |
| --- | --- |
| **README.md** | 总览与导航（本页） |
| [**rest-api.md**](./rest-api.md) | REST：鉴权、接口列表、请求/响应示例、枚举 |
| [**public-ws.md**](./public-ws.md) | 公共 WebSocket：行情、深度、成交等订阅 |
| [**private-ws.md**](./private-ws.md) | 私有 WebSocket：订单、持仓、账户等推送 |

---

## 接入方式概览

| 方式 | 用途 |
| --- | --- |
| **REST** | 下单、撤单、查单、持仓、资产、划转等请求/响应接口 |
| **公共 WS** | 低延迟行情与公共市场数据推送 |
| **私有 WS** | 本账户订单、成交、持仓、资金变动推送 |

REST 与私有 WS 使用同一套 API Key 鉴权体系（见 `rest-api.md` 与 `private-ws.md`）。

---

## 鉴权（摘要）

除探活外，REST 请求需携带四个头：`FORX-ACCESS-KEY`、`FORX-ACCESS-SIGN`、`FORX-ACCESS-TIMESTAMP`、`FORX-ACCESS-PASSPHRASE`。

```
prehash = timestamp + METHOD + requestPath + body
```

签名、示例脚本、鉴权错误码等 **完整说明见 [rest-api.md](./rest-api.md)**（「鉴权」章节）。

---

## 示例代码

| 文件 | 说明 |
| --- | --- |
| [`examples/curl_place_order.sh`](./examples/curl_place_order.sh) | `curl` 签名并提交限价开多 |
| [`examples/sign_and_request.py`](./examples/sign_and_request.py) | Python：探活 → 下单 → 查挂单 → 查资产 |

运行前设置环境变量：

| 变量 | 说明 |
| --- | --- |
| `FORX_MM_BASE` | REST 根地址（示例脚本默认 `http://localhost:8080`） |
| `FORX_API_KEY` | API Key |
| `FORX_SECRET_KEY` | Secret Key |
| `FORX_PASSPHRASE` | 创建 Key 时设置的口令 |

WebSocket 地址见 `public-ws.md` / `private-ws.md`（可用 `FORX_MM_WS_PUBLIC`、`FORX_MM_WS_PRIVATE` 配置）。

---

## 响应格式（REST）

```json
{ "code": 0, "msg": "success", "data": {}, "fd": "..." }
```

业务接口通常 HTTP `200`，以 body 中 `code` 判断成功与否；鉴权失败 HTTP `401`。字段说明见 [rest-api.md § 响应格式](./rest-api.md#响应格式)。
