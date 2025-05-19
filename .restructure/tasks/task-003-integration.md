# TASK-003: ファイル統合実行（更新版）

## 🎯 概要
TASK-002の分析結果をもとに、実際にファイル統合を実行します。

## 📋 統合作業

### 1. context-optimization統合
```bash
# ai/context/をベースとして残し、他を削除
echo "=== context-optimization統合 ===" > .restructure/logs/integration.log

# 統合前の内容確認（必要に応じて手動マージ）
# 統合元の削除
rm docs/ai/context-optimization*.md
rm docs/guidelines/context-optimization*.md

# docs/ai/ディレクトリ削除（空の場合）
rmdir docs/ai/ 2>/dev/null || echo "docs/ai/は空でない"

echo "context-optimization統合完了" >> .restructure/logs/integration.log
```

### 2. coding-standards統合
```bash
echo "=== coding-standards統合 ===" >> .restructure/logs/integration.log

# docs/standards/をベースとして残し、他を削除
# 必要に応じて内容マージを手動実行
rm guidelines/coding-standards*.md
rm docs/guidelines/coding-standards*.md

echo "coding-standards統合完了" >> .restructure/logs/integration.log
```

### 3. operational関連統合
```bash
echo "=== operational統合 ===" >> .restructure/logs/integration.log

# docs/ops/をベースとして残し、他を削除
rm guidelines/operational-guidelines*.md
rm docs/guidelines/operational-rules*.md

echo "operational統合完了" >> .restructure/logs/integration.log
```

### 4. security-guidelines統合
```bash
echo "=== security-guidelines統合 ===" >> .restructure/logs/integration.log

# docs/standards/をベースとして残し、guidelinesを削除
# 必要に応じて内容マージ
rm guidelines/security-guidelines*.md

echo "security-guidelines統合完了" >> .restructure/logs/integration.log
```

### 5. document-template削除
```bash
echo "=== document-template削除 ===" >> .restructure/logs/integration.log

# 理想構造にないため完全削除
rm guidelines/templates/document-template*.md
rm docs/templates/document-template*.md

# ディレクトリも削除
rmdir guidelines/templates/ 2>/dev/null || echo "guidelines/templates/が空でない"
rmdir docs/templates/ 2>/dev/null || echo "docs/templates/が空でない"

echo "document-template削除完了" >> .restructure/logs/integration.log
```

### 6. documentation-guidelines移動
```bash
echo "=== documentation-guidelines移動 ===" >> .restructure/logs/integration.log

# guidelines/からdocs/standards/に移動
mv guidelines/documentation-guidelines*.md docs/standards/

echo "documentation-guidelines移動完了" >> .restructure/logs/integration.log
```

### 7. 不要ディレクトリ・ファイル削除
```bash
echo "=== 不要ファイル削除 ===" >> .restructure/logs/integration.log

# docs/guidelines/の残りファイル削除
rm docs/guidelines/README*.md
rm docs/guidelines/SUMMARY*.md

# 空ディレクトリ削除
rmdir docs/guidelines/ 2>/dev/null || echo "docs/guidelines/が空でない"
rmdir guidelines/ 2>/dev/null || echo "guidelines/が空でない"

echo "不要ファイル削除完了" >> .restructure/logs/integration.log
```

### 8. **リンク修正（重要）**
```bash
echo "=== リンク修正 ===" >> .restructure/logs/integration.log

# 旧パスから新パスへのリンク書き換え
echo "--- guidelines/パス修正 ---" >> .restructure/logs/integration.log
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "guidelines/" {} \; | \
  xargs sed -i '' -E 's@guidelines/coding-standards@docs/standards/coding-standards@g'
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "guidelines/" {} \; | \
  xargs sed -i '' -E 's@guidelines/security-guidelines@docs/standards/security-guidelines@g'  
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "guidelines/" {} \; | \
  xargs sed -i '' -E 's@guidelines/operational-guidelines@docs/ops/operational-guidelines@g'
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "guidelines/" {} \; | \
  xargs sed -i '' -E 's@guidelines/documentation-guidelines@docs/standards/documentation-guidelines@g'

echo "--- docs/guidelines/パス修正 ---" >> .restructure/logs/integration.log
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "docs/guidelines/" {} \; | \
  xargs sed -i '' -E 's@docs/guidelines/coding-standards@docs/standards/coding-standards@g'
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "docs/guidelines/" {} \; | \
  xargs sed -i '' -E 's@docs/guidelines/operational-rules@docs/ops/operational-guidelines@g'
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "docs/guidelines/" {} \; | \
  xargs sed -i '' -E 's@docs/guidelines/context-optimization@ai/context/context-optimization@g'

echo "--- docs/templates/パス修正（削除警告） ---" >> .restructure/logs/integration.log
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "docs/templates/document-template" {} \; >> .restructure/logs/integration.log || echo "参照なし"

echo "--- docs/ai/パス修正 ---" >> .restructure/logs/integration.log
find . -name "*.md" -not -path "./.restructure/*" -exec grep -l "docs/ai/" {} \; | \
  xargs sed -i '' -E 's@docs/ai/context-optimization@ai/context/context-optimization@g'

echo "リンク修正完了" >> .restructure/logs/integration.log
```

### 9. 統合後の状態確認
```bash
echo "=== 統合後状態確認 ===" >> .restructure/logs/integration.log

# ファイル数確認
echo "MD ファイル数: $(fd -t f -e md | wc -l)" >> .restructure/logs/integration.log

# 構造確認
tree docs/ ai/ -I ".git" >> .restructure/logs/integration.log

# 残存リンクチェック
echo "=== 残存リンクチェック ===" >> .restructure/logs/integration.log
echo "guidelines/への参照:" >> .restructure/logs/integration.log
grep -r "guidelines/" --include="*.md" . 2>/dev/null || echo "なし" >> .restructure/logs/integration.log
echo "docs/guidelines/への参照:" >> .restructure/logs/integration.log  
grep -r "docs/guidelines/" --include="*.md" . 2>/dev/null || echo "なし" >> .restructure/logs/integration.log
echo "docs/ai/への参照:" >> .restructure/logs/integration.log
grep -r "docs/ai/" --include="*.md" . 2>/dev/null || echo "なし" >> .restructure/logs/integration.log
echo "docs/templates/への参照:" >> .restructure/logs/integration.log
grep -r "docs/templates/" --include="*.md" . 2>/dev/null || echo "なし" >> .restructure/logs/integration.log

# git状態
git status >> .restructure/logs/integration.log
```

## ✅ 完了基準
- [ ] context-optimization統合完了（ai/context/のみ）
- [ ] coding-standards統合完了（docs/standards/のみ）  
- [ ] operational統合完了（docs/ops/のみ）
- [ ] security-guidelines統合完了（docs/standards/のみ）
- [ ] **document-template削除完了**（理想構造にないため）
- [ ] documentation-guidelines移動完了（docs/standards/に追加）
- [ ] guidelines/ディレクトリ削除完了
- [ ] docs/guidelines/ディレクトリ削除完了
- [ ] docs/ai/ディレクトリ削除完了
- [ ] **docs/templates/ディレクトリ削除完了**
- [ ] **リンク修正完了**（切れたリンクなし）
- [ ] MDファイル数が約21個に減少

## ⚠️ 注意事項
- 削除前に内容を必ず確認
- 特に重要な差分がある場合は手動マージ
- 日本語ファイル（-ja）も忘れずに処理
- 各ステップでgit addしてコミット
- **リンク修正は慎重に実行**（バックアップを確認しながら）
- **document-templateへの参照がある場合は手動対応**

## 🔄 次タスク
TASK-004: 最終確認・清掃