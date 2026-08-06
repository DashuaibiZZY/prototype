#!/usr/bin/env bash
# 清理卡住的 github-pages 环境部署锁（需本机 gh 已登录个人账号，非 GITHUB_TOKEN）
set -euo pipefail

REPO="${1:-DashuaibiZZY/prototype}"
ENVIRONMENT="github-pages"

echo "Repository: $REPO"
echo "Checking gh auth..."
gh auth status

echo "Current Pages config:"
gh api "repos/$REPO/pages" --jq '{build_type, source, status}'

echo "Listing recent $ENVIRONMENT deployments..."
gh api --paginate "repos/$REPO/deployments?environment=$ENVIRONMENT" --jq '.[] | {id, sha, ref, created_at}' | head -40

echo ""
echo "Marking non-success deployments as inactive, then deleting where allowed..."
gh api --paginate "repos/$REPO/deployments?environment=$ENVIRONMENT" --jq '.[].id' | while read -r dep_id; do
  state="$(gh api "repos/$REPO/deployments/${dep_id}/statuses?per_page=1" --jq '.[0].state // empty')"
  echo "deployment $dep_id latest state: ${state:-unknown}"
  if [ "$state" = "success" ]; then
    continue
  fi
  gh api --method POST "repos/$REPO/deployments/${dep_id}/statuses" \
    -f state=inactive \
    -f description="manual cleanup: release pages deployment lock" || true
  gh api --method DELETE "repos/$REPO/deployments/${dep_id}" || true
done

echo ""
echo "Re-apply Pages source as GitHub Actions (workflow deployment):"
gh api --method PUT "repos/$REPO/pages" \
  -f build_type=workflow || {
  echo "If workflow mode fails, try legacy main branch:"
  gh api --method PUT "repos/$REPO/pages" \
    -f build_type=legacy \
    -f 'source[branch]=main' \
    -f 'source[path]=/'
}

echo ""
echo "Done. Run workflow: gh workflow run 'Deploy prototype to Pages' --repo $REPO"
