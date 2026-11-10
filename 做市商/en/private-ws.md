# Private WebSocket

中文：[`../private-ws.md`](../private-ws.md)

Account-level pushes and trading commands (place / cancel / amend orders). **Complete `login` first**, then subscribe or trade.

## Connection

```text
wss://{host}/notification/private
```

Local example: `ws://localhost:8080/notification/private`

### On connect (server may push first)

```json
{"pong": 1710000000000}
```

Heartbeats work the same as [Public WebSocket](./public-ws.md#heartbeat): on `{"ping": <ms>}`, reply with `{"pong": <ms>}`.

---

## Common format

### Client request

```json
{
  "id": "req-001",
  "event": "login",
  "params": {}
}
```

| Field | Description |
|------|------|
| `id` | Request ID; echoed in the response |
| `event` | Event name |
| `params` | Parameter object; an array for batch APIs |

### Success response (generic)

```json
{
  "id": "req-001",
  "event": "login",
  "data": {}
}
```

### Error response

```json
{
  "id": "req-001",
  "event": "error",
  "code": "401",
  "msg": "unauthorized",
  "args": []
}
```

Business failure (after processing) example:

```json
{
  "id": "req-003",
  "event": "error",
  "code": "50001",
  "msg": "insufficient balance",
  "args": []
}
```

---

## Login (`login`)

When not logged in, `sub` and trading events return `401`. Supports **JWT** or **API Key** (use one; JWT takes precedence if both are sent).

### Option 1: JWT

**Request**

```json
{
  "id": "1",
  "event": "login",
  "params": {
    "jwt": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Success response**

```json
{
  "id": "1",
  "event": "login",
  "data": {
    "code": 0,
    "message": "Ok"
  }
}
```

**Failure response**

```json
{
  "id": "1",
  "event": "error",
  "code": "401",
  "msg": "unauthorized",
  "args": []
}
```

### Option 2: API Key

**Request**

```json
{
  "id": "1",
  "event": "login",
  "params": {
    "apiKey": "your-api-key",
    "passphrase": "your-passphrase",
    "timestamp": "1710000000",
    "sign": "xr0EjNy7T3raK0cs3Zov1942FHcwMvYks+snq9rwWuQ="
  }
}
```

| Field | Description |
|------|------|
| `apiKey` | API Key |
| `passphrase` | Passphrase set at creation (do not trim) |
| `timestamp` | 10-digit seconds / 13-digit milliseconds / RFC3339; must be within **±30 seconds** of server time |
| `sign` | Base64 signature |

**Signing**

```text
prehash = timestamp + "GET" + "/users/self/verify"
sign    = Base64( HMAC-SHA256(prehash, secretKey) )
```

**Success response**

```json
{
  "id": "1",
  "event": "login",
  "data": {
    "code": 0,
    "message": "Ok"
  }
}
```

**Failure response**

```json
{
  "id": "1",
  "event": "error",
  "code": "401",
  "msg": "unauthorized",
  "args": []
}
```

---

## Private channel subscriptions

Requires a successful login.

### Available channels

| type | Description |
|------|------|
| `notification.order` | Order updates |
| `notification.position` | Position updates |
| `notification.account` | Account |
| `notification.wallet` | Wallet |
| `notification.balance` | Balance changes |
| `notification.margin` | Margin |
| `notification.config` | Configuration |
| `notification.algo` | Algo orders |

### Subscribe

**Request**

```json
{
  "id": "2",
  "event": "sub",
  "params": {
    "type": "notification.order"
  }
}
```

**Response**

```json
{
  "id": "2",
  "event": "subscribe",
  "args": [
    {
      "type": "notification.order"
    }
  ]
}
```

### Unsubscribe

**Request**

```json
{
  "id": "2",
  "event": "unsub",
  "params": {
    "type": "notification.order"
  }
}
```

**Response**

```json
{
  "id": "2",
  "event": "unsubscribe",
  "args": [
    {
      "type": "notification.order"
    }
  ]
}
```

### Push example (order channel)

Pushes are raw business JSON; structure varies by channel. Illustrative:

```json
{
  "arg": {
    "type": "notification.order"
  },
  "eventType": "update",
  "data": {
    "order_id": "66f1a2b3c4d5e6f708091011",
    "product_name": "BTC-USDT",
    "side": "buy",
    "status": "filled"
  }
}
```

Subscribe while not logged in:

```json
{
  "id": "2",
  "event": "error",
  "code": "401",
  "msg": "unauthorized",
  "args": []
}
```

---

## Trading commands

Login required. Batch APIs accept at most **20** items per call.

After submit, the server usually replies when processing completes; on timeout you may receive an acceptance with `status: "init"`. Final state is confirmed via private channel pushes.

### 1. Place order (`add-order`)

**Request**

```json
{
  "id": "3",
  "event": "add-order",
  "params": {
    "product_name": "BTC-USDT",
    "cl_ord_id": "client-oid-001",
    "side": "buy",
    "pos_side": "long",
    "ord_type": "limit",
    "trade_unit": "base",
    "px": "50000",
    "sz": "0.01"
  }
}
```

| Field | Required | Description |
|------|------|------|
| `product_name` | Yes | Trading pair |
| `cl_ord_id` | No | Client order ID, max 64 chars |
| `side` | Yes | `buy` / `sell` |
| `pos_side` | Yes | `long` / `short` |
| `ord_type` | Yes | `limit` / `market` / `fok` / `ioc` / `post_only` |
| `trade_unit` | Yes | `base` (coin) / `quote` (quote currency) / `size` (contracts) |
| `px` | For limit types | Price; `0` allowed for market orders |
| `sz` | Yes | Size (meaning depends on `trade_unit`) |

**Success response (accepted)**

```json
{
  "id": "3",
  "event": "add-order",
  "data": {
    "order_id": "66f1a2b3c4d5e6f708091011",
    "cl_ord_id": "client-oid-001",
    "status": "init"
  }
}
```

**Invalid parameters**

```json
{
  "id": "3",
  "event": "error",
  "code": "400",
  "msg": "Bad Request",
  "args": []
}
```

**Validation failure (e.g. price limit)**

```json
{
  "id": "3",
  "event": "error",
  "code": "422",
  "msg": "限价单的价格不能高于最高买价",
  "args": []
}
```

### 2. Batch place (`add-batch-orders`)

All items in one batch must share the same `product_name`.

**Request**

```json
{
  "id": "4",
  "event": "add-batch-orders",
  "params": [
    {
      "product_name": "BTC-USDT",
      "cl_ord_id": "batch-1",
      "side": "buy",
      "pos_side": "long",
      "ord_type": "limit",
      "trade_unit": "base",
      "px": "50000",
      "sz": "0.01"
    },
    {
      "product_name": "BTC-USDT",
      "cl_ord_id": "batch-2",
      "side": "buy",
      "pos_side": "long",
      "ord_type": "limit",
      "trade_unit": "base",
      "px": "49900",
      "sz": "0.01"
    }
  ]
}
```

**Success response**

```json
{
  "id": "4",
  "event": "add-batch-orders",
  "data": [
    {
      "order_id": "66f1a2b3c4d5e6f708091011",
      "cl_ord_id": "batch-1",
      "status": "init"
    },
    {
      "order_id": "66f1a2b3c4d5e6f708091012",
      "cl_ord_id": "batch-2",
      "status": "init"
    }
  ]
}
```

### 3. Cancel order (`cancel-order`)

Provide at least one of `order_id` or `cl_ord_id`; `order_id` is a 24-character hex ObjectId.

**Request**

```json
{
  "id": "5",
  "event": "cancel-order",
  "params": {
    "product_name": "BTC-USDT",
    "order_id": "66f1a2b3c4d5e6f708091011",
    "cl_ord_id": ""
  }
}
```

Or client order ID only:

```json
{
  "id": "5",
  "event": "cancel-order",
  "params": {
    "product_name": "BTC-USDT",
    "order_id": "",
    "cl_ord_id": "client-oid-001"
  }
}
```

**Success response**

```json
{
  "id": "5",
  "event": "cancel-order",
  "data": {
    "order_id": "66f1a2b3c4d5e6f708091011"
  }
}
```

### 4. Batch cancel (`cancel-batch-orders`)

**Request**

```json
{
  "id": "6",
  "event": "cancel-batch-orders",
  "params": [
    {
      "product_name": "BTC-USDT",
      "order_id": "66f1a2b3c4d5e6f708091011"
    },
    {
      "product_name": "BTC-USDT",
      "cl_ord_id": "client-oid-002"
    }
  ]
}
```

**Success response**

```json
{
  "id": "6",
  "event": "cancel-batch-orders",
  "data": [
    "66f1a2b3c4d5e6f708091011",
    "client-oid-002"
  ]
}
```

### 5. Amend order (`amend-order`)

**Request**

```json
{
  "id": "7",
  "event": "amend-order",
  "params": {
    "product_name": "BTC-USDT",
    "order_id": "66f1a2b3c4d5e6f708091011",
    "cl_ord_id": "",
    "px": "51000",
    "sz": "0.02"
  }
}
```

| Field | Description |
|------|------|
| `product_name` | Trading pair |
| `order_id` / `cl_ord_id` | At least one required |
| `px` / `sz` | New price and size; must be positive |

**Success response**

```json
{
  "id": "7",
  "event": "amend-order",
  "data": {
    "order_id": "66f1a2b3c4d5e6f708091011",
    "status": "init"
  }
}
```

### 6. Batch amend (`amend-batch-orders`)

**Request**

```json
{
  "id": "8",
  "event": "amend-batch-orders",
  "params": [
    {
      "product_name": "BTC-USDT",
      "order_id": "66f1a2b3c4d5e6f708091011",
      "px": "51000",
      "sz": "0.02"
    },
    {
      "product_name": "BTC-USDT",
      "cl_ord_id": "client-oid-002",
      "px": "50500",
      "sz": "0.015"
    }
  ]
}
```

**Success response**

```json
{
  "id": "8",
  "event": "amend-batch-orders",
  "data": [
    {
      "order_id": "66f1a2b3c4d5e6f708091011",
      "status": "init"
    },
    {
      "order_id": "client-oid-002",
      "status": "init"
    }
  ]
}
```

---

## Event reference

| event | Description | Login required |
|-------|------|------|
| `login` | Authentication | — |
| `sub` / `unsub` | Subscribe / unsubscribe private channels | Yes |
| `add-order` | Place order | Yes |
| `add-batch-orders` | Batch place | Yes |
| `cancel-order` | Cancel order | Yes |
| `cancel-batch-orders` | Batch cancel | Yes |
| `amend-order` | Amend order | Yes |
| `amend-batch-orders` | Batch amend | Yes |

---

## Recommended call sequence

```text
1. Connect to wss://{host}/notification/private
2. Handle ping / pong
3. event=login (jwt or apiKey)
4. event=sub to notification.order, etc.
5. event=add-order / cancel-order / amend-order ...
6. Correlate requests with response id; confirm final state via channel pushes
```
