# Notification 接入文档

面向外部团队的行情与交易通知接入说明，涵盖 REST API、公有 WebSocket、私有 WebSocket。

| 文档 | 说明 |
|------|------|
| [REST API](./rest-api.md) | HTTP 行情查询接口 |
| [公有 WebSocket](./public-ws.md) | 无需登录的行情订阅与拉取 |
| [私有 WebSocket](./private-ws.md) | 登录、私有频道订阅、下单/撤单/改单 |

## 基础信息

| 项目 | 说明 |
|------|------|
| 协议前缀 | `/notification` |
| 默认 HTTP 端口 | `8080`（以实际部署为准） |
| REST 示例 | `https://{host}/notification/tickers` |
| 公有 WS | `wss://{host}/notification/public` |
| 私有 WS | `wss://{host}/notification/private` |

本地开发示例：

```text
http://localhost:8080/notification/tickers
ws://localhost:8080/notification/public
ws://localhost:8080/notification/private
```

## 通用约定

- 交易对 `symbol` / `product_name` 大小写不敏感，建议统一使用大写，如 `BTC-USDT`。
- 金额、价格字段均为字符串或数字均可（JSON 数字亦可），服务端按交易对精度处理。
- 时间戳：REST / WS 拉历史 K 线时使用 **秒级 Unix 时间戳**；WS 心跳 `ping` / `pong` 为 **毫秒**。
- 字符编码：UTF-8；WebSocket 使用文本帧（JSON）。
