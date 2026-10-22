# FORX Market Maker Private WebSocket

Back to index: [`README.md`](./README.md)  
中文：[`../private-ws.md`](../private-ws.md)

Private channels push **your API key’s** orders, fills, positions, and account updates. **Log in** before subscribing.

---

## Connection

| Item | Description |
| --- | --- |
| URL | Example `wss://{host}/mm/ws/private` (`FORX_MM_WS_PRIVATE`) |
| Protocol | WebSocket, JSON text frames |
| Order | Connect → **login** → wait for success → **subscribe** |

---

## Login (auth)

Send immediately after connect (before subscribe):

```json
{
  "op": "login",
  "args": [
    {
      "apiKey": "YOUR_API_KEY",
      "passphrase": "YOUR_PASSPHRASE",
      "timestamp": "1730000000000",
      "sign": "BASE64_HMAC_SHA256"
    }
  ]
}
```

| Field | Description |
| --- | --- |
| `apiKey` | Same as REST `FORX-ACCESS-KEY` |
| `passphrase` | Same as REST `FORX-ACCESS-PASSPHRASE` |
| `timestamp` | Milliseconds as string; must match signed value |
| `sign` | `Base64(HMAC-SHA256(prehash, SecretKey))` |

**Prehash** (same family as REST; METHOD is `GET`):

```
prehash = timestamp + "GET" + requestPath
```

| Item | Description |
| --- | --- |
| `requestPath` | Fixed `/mm/ws/private` unless operations specifies otherwise |
| `body` | Empty for login; not included in prehash |

Success example:

```json
{ "event": "login", "code": "0", "msg": "" }
```

Failures: non-zero `code` or disconnect. Messages align with REST auth: `missing params`, `timestamp timeout`, `invalid token`, `invalid signature`.

---

## Heartbeat

Same as public WS: `ping` / `pong`.

---

## Subscribe / unsubscribe

Same JSON shape as [`public-ws.md`](./public-ws.md). Send **after** successful login.

---

## Private channels

| channel | Description |
| --- | --- |
| `orders` | Order state updates |
| `fills` | Fill events |
| `positions` | Position changes |
| `account` | Balance / margin summary |

Whether `product_name` is required or optional is server-defined.

---

## Push format

```json
{
  "arg": {
    "channel": "orders",
    "product_name": "BTC-USDT-SWAP"
  },
  "data": []
}
```

Fields in `data` should match REST resources (`orders-pending`, `fills`, etc.) for reconciliation.

---

## Reconnect

1. Reconnect WebSocket.  
2. **Login** again.  
3. **Re-subscribe** all channels.  
4. Optionally REST snapshot (open orders, positions) to heal gaps.

---

## REST

| Use case | Approach |
| --- | --- |
| Place / cancel / leverage | [`rest-api.md`](./rest-api.md) |
| Real-time state | Private WS + periodic REST reconciliation |
| History only | REST queries |
