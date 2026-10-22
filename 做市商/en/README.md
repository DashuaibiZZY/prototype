# Notification Integration Guide

Market data and trading notification integration for external teams, covering REST API, public WebSocket, and private WebSocket.

| Document | Description |
|------|------|
| [REST API](./rest-api.md) | HTTP market data queries |
| [Public WebSocket](./public-ws.md) | Market subscribe and pull without login |
| [Private WebSocket](./private-ws.md) | Login, private channels, place / cancel / amend orders |

中文：[`../README.md`](../README.md)

## Basics

| Item | Description |
|------|------|
| Path prefix | `/notification` |
| Default HTTP port | `8080` (per deployment) |
| REST example | `https://{host}/notification/tickers` |
| Public WS | `wss://{host}/notification/public` |
| Private WS | `wss://{host}/notification/private` |

Local development:

```text
http://localhost:8080/notification/tickers
ws://localhost:8080/notification/public
ws://localhost:8080/notification/private
```

## Conventions

- `symbol` / `product_name` are case-insensitive; use uppercase consistently, e.g. `BTC-USDT`.
- Amount and price fields may be strings or JSON numbers; the server applies instrument precision.
- Timestamps: use **Unix seconds** for REST / WS historical candle pulls; WS heartbeat `ping` / `pong` use **milliseconds**.
- UTF-8 encoding; WebSocket text frames (JSON).
