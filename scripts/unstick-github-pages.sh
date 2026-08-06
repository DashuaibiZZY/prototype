#!/usr/bin/env bash
# 清理卡住的 github-pages 环境部署锁（需本机 gh 已登录个人账号，非 GITHUB_TOKEN）
#
# 部署记录不在 Settings → Environments 列表里，而在：
#   https://github.com/DashuaibiZZY/prototype/deployments
# Actions 页是 workflow 运行日志，可在这里取消卡住的 pages-build-deployment。
set -euo pipefail

REPO="${1:-DashuaibiZZY/prototype}"
ENVIRONMENT="github-pages"

echo "Repository: $REPO"
echo ""
echo "部署记录页面: https://github.com/${REPO}/deployments"
echo "Actions 运行: https://github.com/${REPO}/actions"
echo "Pages 设置:   https://github.com/${REPO}/settings/pages"
echo ""

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
echo "Switch Pages to GitHub Actions (workflow) deployment source..."
gh api --method PUT "repos/$REPO/pages" \
  -f build_type=workflow

echo ""
echo "Done. In Actions, cancel any in-progress 'pages-build-deployment' runs,"
echo "then run: gh workflow run 'Deploy prototype to Pages' --repo $REPO"
