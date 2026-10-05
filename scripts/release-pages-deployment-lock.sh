#!/usr/bin/env bash
# 部署前释放 github-pages 环境锁（CI 用 GITHUB_TOKEN，本地用 gh 登录账号）。
# 解决 deploy-pages 超时后 Pages 侧仍占用锁，后续 push 报 400 in progress deployment。
set -euo pipefail

REPO="${GITHUB_REPOSITORY:-${1:-}}"
if [ -z "$REPO" ]; then
  echo "Usage: release-pages-deployment-lock.sh [owner/repo]" >&2
  exit 1
fi

GH_TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
if [ -z "$GH_TOKEN" ]; then
  echo "GH_TOKEN or GITHUB_TOKEN required" >&2
  exit 1
fi

API="https://api.github.com/repos/${REPO}"
AUTH=(-H "Accept: application/vnd.github+json" -H "Authorization: Bearer ${GH_TOKEN}" -H "X-GitHub-Api-Version: 2022-11-28")
CURRENT_SHA="${GITHUB_SHA:-}"

api_get() {
  curl -fsSL "${AUTH[@]}" "$@" || true
}

api_post() {
  curl -fsSL -X POST "${AUTH[@]}" "$@" || true
}

TERMINAL_PAGES='^(succeed|deployment_cancelled|deployment_failed|deployment_lost|deployment_content_failed|deployment_attempt_error|)$'

echo "Repository: ${REPO}"
echo "Current SHA: ${CURRENT_SHA:-<none>}"
echo "Pages config:"
api_get "${API}/pages" | jq '{status, build_type, html_url}' 2>/dev/null || echo "  (unable to read pages config)"

echo ""
echo "Cancelling stale Pages deployments..."
mapfile -t SHAS < <(api_get "${API}/deployments?environment=github-pages&per_page=20" | jq -r '.[].sha' | sort -u)
for sha in "${SHAS[@]}"; do
  if [ -n "$CURRENT_SHA" ] && [ "$sha" = "$CURRENT_SHA" ]; then
    continue
  fi
  status="$(api_get "${API}/pages/deployments/${sha}" | jq -r '.status // empty' 2>/dev/null || echo "")"
  echo "  ${sha:0:7}: pages_status=${status:-unknown}"
  if [ "${status}" = "succeed" ]; then
    continue
  fi
  echo "  -> cancel ${sha}"
  api_post "${API}/pages/deployments/${sha}/cancel"
done

echo ""
echo "Marking non-terminal environment deployments inactive..."
while read -r dep_id sha; do
  [ -n "${dep_id}" ] || continue
  state="$(api_get "${API}/deployments/${dep_id}/statuses?per_page=1" | jq -r '.[0].state // empty' 2>/dev/null || echo "")"
  if [ "${state}" = "success" ] || [ "${state}" = "inactive" ] || [ "${state}" = "failure" ]; then
    continue
  fi
  echo "  deployment ${dep_id} (${sha:0:7}) state=${state} -> inactive"
  api_post "${API}/deployments/${dep_id}/statuses" \
    --data-urlencode "state=inactive" \
    --data-urlencode "description=release pages deployment lock before deploy-pages"
done < <(api_get "${API}/deployments?environment=github-pages&per_page=20" | jq -r '.[] | "\(.id) \(.sha)"')

echo ""
echo "Waiting for Pages deployment lock to clear..."
for attempt in $(seq 1 18); do
  blocked=""
  for sha in "${SHAS[@]}"; do
    if [ -n "$CURRENT_SHA" ] && [ "$sha" = "$CURRENT_SHA" ]; then
      continue
    fi
    status="$(api_get "${API}/pages/deployments/${sha}" | jq -r '.status // empty' 2>/dev/null || echo "")"
    if [ -n "${status}" ] && ! echo "${status}" | grep -Eq "${TERMINAL_PAGES}"; then
      blocked="${sha}"
      break
    fi
  done
  if [ -z "${blocked}" ]; then
    echo "Lock clear (${attempt}0s elapsed)."
    exit 0
  fi
  echo "  still blocked by ${blocked:0:7} (${status}); retry ${attempt}/18"
  sleep 10
done

echo "::warning::Pages deployment lock may still be held after 180s; continuing to deploy-pages."
