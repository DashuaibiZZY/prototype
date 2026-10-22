# FORX Market Maker Integration

Documentation for market maker (MM) **REST** and **WebSocket** (public / private).

| Doc | Description |
| --- | --- |
| [`rest-api.md`](./rest-api.md) | REST: auth, endpoints, examples, enums |
| [`public-ws.md`](./public-ws.md) | Public WebSocket: market data subscriptions |
| [`private-ws.md`](./private-ws.md) | Private WebSocket: orders, positions, account |
| [`../README.md`](../README.md) | 中文目录 |

## Examples

| File | Description |
| --- | --- |
| [`../examples/curl_place_order.sh`](../examples/curl_place_order.sh) | Signed `curl` place order |
| [`../examples/sign_and_request.py`](../examples/sign_and_request.py) | Python signing and sample REST calls |

## Environment variables

| Variable | Description |
| --- | --- |
| `FORX_MM_BASE` | REST base URL |
| `FORX_MM_WS_PUBLIC` | Public WS URL — see `public-ws.md` |
| `FORX_MM_WS_PRIVATE` | Private WS URL — see `private-ws.md` |
| `FORX_API_KEY` / `FORX_SECRET_KEY` / `FORX_PASSPHRASE` | API credentials |
