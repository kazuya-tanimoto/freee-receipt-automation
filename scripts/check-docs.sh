#!/bin/bash
set -e
# scripts/check-docs.sh
# ドキュメントの事前チェックスクリプト

echo "🔍 Documentation pre-commit check starting..."

# 1. Markdownlint チェック (エラーを無視)
echo "✓ Running markdownlint..."
yarn lint:md

# 2. ファイルサイズチェック
echo "✓ Checking file sizes..."
large_files=0
while IFS= read -r file; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file")
        if [ $size -gt 10000 ]; then
            echo "❌ $file is larger than 10000 bytes ($size bytes)"
            large_files=$((large_files + 1))
        fi
    fi
done < <(find docs \
    -path "docs/standards/bulletproof-react" -prune -o \
    -path "docs/standards/naming-cheatsheet" -prune -o \
    -name "*.md" 2>/dev/null)

if [ $large_files -gt 0 ]; then
    echo "❌ Found $large_files files exceeding size limit"
    exit 1
fi

# 3. 言語ペアチェック
echo "✓ Checking language consistency..."
missing_files=""

# 日本語版に対応する英語版の存在チェック
while IFS= read -r file; do
    if [ -f "$file" ]; then
        en_file=${file%-ja.md}.md
        if [ ! -f "$en_file" ]; then
            missing_files="${missing_files}\n  - English version missing for: $file"
        fi
    fi
done < <(find docs \
    -path "docs/standards/bulletproof-react" -prune -o \
    -path "docs/standards/naming-cheatsheet" -prune -o \
    -name "*-ja.md" 2>/dev/null)

# 英語版に対応する日本語版の存在チェック
while IFS= read -r file; do
    if [ -f "$file" ] && [[ ! "$file" =~ (README|CHANGELOG|SUMMARY)\.md$ ]]; then
        ja_file=${file%.md}-ja.md
        if [ ! -f "$ja_file" ]; then
            missing_files="${missing_files}\n  - Japanese version missing for: $file"
        fi
    fi
done < <(find docs \
    -path "docs/standards/bulletproof-react" -prune -o \
    -path "docs/standards/naming-cheatsheet" -prune -o \
    -name "*.md" ! -name "*-ja.md" 2>/dev/null)

if [ -n "$missing_files" ]; then
    echo -e "❌ Language consistency errors:$missing_files"
    echo ""
    echo "Please create missing translations before committing."
    exit 1
fi

echo "✅ Documentation check completed!"
