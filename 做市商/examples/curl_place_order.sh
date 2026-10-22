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
