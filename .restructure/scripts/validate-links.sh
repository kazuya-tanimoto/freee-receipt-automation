#!/bin/bash

# リンク切れチェックスクリプト
# 使用方法: bash .restructure/scripts/validate-links.sh

echo "=== Markdown リンク検証 ==="

# 内部リンクチェック
echo "--- 内部リンク検証 ---"
broken_links=0

# .md ファイル内のリンクを抽出
find . -name "*.md" -not -path "./.restructure/*" -exec grep -H -o '\[.*\](.*\.md[^)]*)' {} \; | while IFS= read -r line; do
    file=$(echo "$line" | cut -d: -f1)
    link=$(echo "$line" | grep -o '(.*\.md[^)]*)' | sed 's/[()]//g')
    
    # 相対パスを絶対パスに変換
    if [[ "$link" =~ ^/ ]]; then
        # 絶対パス
        target_file=".$link"
    else
        # 相対パス
        dir=$(dirname "$file")
        target_file="$dir/$link"
    fi
    
    # 正規化
    target_file=$(realpath --relative-to=. "$target_file" 2>/dev/null || echo "$target_file")
    
    # ファイルの存在確認
    if [[ ! -f "$target_file" ]]; then
        echo "❌ BROKEN: $file -> $link"
        ((broken_links++))
    fi
done

# 結果サマリー
echo "--- 結果 ---"
if [ "$broken_links" -eq 0 ]; then
    echo "✅ リンク切れなし"
    exit 0
else
    echo "❌ リンク切れ発見: $broken_links 件"
    exit 1
fi