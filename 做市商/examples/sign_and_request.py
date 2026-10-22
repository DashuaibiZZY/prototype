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
