#!/bin/bash
# scripts/check-environment.sh

set -e

echo "🔍 Environment Safety Check"
echo "=========================="

# 現在の環境情報表示（セキュリティ改善版）
echo "Current path: $PWD"
echo "Current user: $(whoami)"
echo "Container indicators:"
echo "  - /.dockerenv: $([ -f /.dockerenv ] && echo '✅ found' || echo '❌ missing')"
echo "  - CONTAINER var: $([ -n "$CONTAINER" ] && echo '✅ set' || echo '❌ unset')"
echo "  - Workspace path: $(echo $PWD | grep -E '^/(workspaces|workspace|workdir)/' && echo '✅ container path' || echo '❌ non-container path')"

# ローカル環境チェック
if [[ "$PWD" == "/Users/"* ]]; then
  echo ""
  echo "🚨 DANGER: Local environment detected"
  echo "❌ This environment is not safe for AI development"
  echo ""
  echo "Required actions:"
  echo "1. Switch to Container Use environment"
  echo "2. Use mcp__container-use__ tools only"
  echo "3. Never work directly on local filesystem"
  exit 1
fi

echo ""
echo "✅ Environment safety confirmed"
exit 0