# TASK-002: 重複ファイル内容分析（更新版）

## 🎯 概要
統合対象の重複ファイルの内容を比較・分析し、最良の統合方針を決定します。

## 📋 分析対象

### 1. 外部資産の棚卸し
```bash
echo "=== 外部資産確認 ===" > .restructure/logs/content-analysis.log

# 画像・図表ファイルの確認
git ls-files | grep -E "\.(png|svg|jpg|jpeg|puml|plantuml)$" >> .restructure/logs/content-analysis.log
echo "--- 画像・図表ファイル数: $(git ls-files | grep -E '\.(png|svg|jpg|jpeg|puml)$' | wc -l)" >> .restructure/logs/content-analysis.log

# READMEファイルの確認
find . -name "README*.md" -not -path "./.restructure/*" >> .restructure/logs/content-analysis.log
echo "--- READMEファイル数: $(find . -name 'README*.md' -not -path './.restructure/*' | wc -l)" >> .restructure/logs/content-analysis.log
```

### 2. context-optimization (3箇所)
```bash
echo "=== context-optimization 比較 ===" >> .restructure/logs/content-analysis.log

# 内容比較（カラー出力）
diff --color -u ai/context/context-optimization.md docs/ai/context-optimization.md >> .restructure/logs/content-analysis.log
diff --color -u ai/context/context-optimization.md docs/guidelines/context-optimization.md >> .restructure/logs/content-analysis.log

# ファイルサイズ・更新日時確認
ls -la ai/context/context-optimization*.md >> .restructure/logs/content-analysis.log
ls -la docs/ai/context-optimization*.md >> .restructure/logs/content-analysis.log
ls -la docs/guidelines/context-optimization*.md >> .restructure/logs/content-analysis.log
```

### 3. coding-standards (3箇所)
```bash
echo "=== coding-standards 比較 ===" >> .restructure/logs/content-analysis.log

# 詳細比較
diff --color -u docs/standards/coding-standards.md guidelines/coding-standards.md >> .restructure/logs/content-analysis.log
diff --color -u docs/standards/coding-standards.md docs/guidelines/coding-standards.md >> .restructure/logs/content-analysis.log

# 行数・サイズ確認（どれが最も包括的か）
echo "--- 行数比較 ---" >> .restructure/logs/content-analysis.log
wc -l docs/standards/coding-standards*.md >> .restructure/logs/content-analysis.log
wc -l guidelines/coding-standards*.md >> .restructure/logs/content-analysis.log
wc -l docs/guidelines/coding-standards*.md >> .restructure/logs/content-analysis.log
```

### 4. operational関連 (3箇所)
```bash
echo "=== operational 比較 ===" >> .restructure/logs/content-analysis.log

# 内容差分比較
diff --color -u docs/ops/operational-guidelines.md guidelines/operational-guidelines.md >> .restructure/logs/content-analysis.log
diff --color -u docs/ops/operational-guidelines.md docs/guidelines/operational-rules.md >> .restructure/logs/content-analysis.log

# 内容概要確認
echo "--- docs/ops/ 概要 ---" >> .restructure/logs/content-analysis.log
head -20 docs/ops/operational-guidelines*.md >> .restructure/logs/content-analysis.log
echo "--- guidelines/ 概要 ---" >> .restructure/logs/content-analysis.log
head -20 guidelines/operational-guidelines*.md >> .restructure/logs/content-analysis.log
echo "--- docs/guidelines/ 概要 ---" >> .restructure/logs/content-analysis.log
head -20 docs/guidelines/operational-rules*.md >> .restructure/logs/content-analysis.log
```

### 5. security-guidelines (2箇所)
```bash
echo "=== security-guidelines 比較 ===" >> .restructure/logs/content-analysis.log

# 詳細差分
diff --color -u docs/standards/security-guidelines.md guidelines/security-guidelines.md >> .restructure/logs/content-analysis.log

# ファイル情報
echo "--- ファイル情報 ---" >> .restructure/logs/content-analysis.log
ls -la docs/standards/security-guidelines*.md >> .restructure/logs/content-analysis.log
ls -la guidelines/security-guidelines*.md >> .restructure/logs/content-analysis.log
```

### 6. document-template (2箇所 - 削除対象)
```bash
echo "=== document-template 確認（削除対象） ===" >> .restructure/logs/content-analysis.log

# 参照チェック（削除前にリンク切れ確認）
echo "--- document-templateへの参照チェック ---" >> .restructure/logs/content-analysis.log
grep -r "document-template" --include="*.md" . >> .restructure/logs/content-analysis.log 2>/dev/null || echo "参照なし"

# 内容確認（念のため）
diff --color -u docs/templates/document-template.md guidelines/templates/document-template.md >> .restructure/logs/content-analysis.log

# ファイル情報
ls -la docs/templates/document-template*.md >> .restructure/logs/content-analysis.log
ls -la guidelines/templates/document-template*.md >> .restructure/logs/content-analysis.log
```

### 7. documentation-guidelines (移動のみ)
```bash
echo "=== documentation-guidelines 確認 ===" >> .restructure/logs/content-analysis.log

# 内容概要
echo "--- ファイル情報 ---" >> .restructure/logs/content-analysis.log
ls -la guidelines/documentation-guidelines*.md >> .restructure/logs/content-analysis.log
head -20 guidelines/documentation-guidelines*.md >> .restructure/logs/content-analysis.log

# 参照チェック
echo "--- documentation-guidelinesへの参照チェック ---" >> .restructure/logs/content-analysis.log
grep -r "documentation-guidelines" --include="*.md" . >> .restructure/logs/content-analysis.log 2>/dev/null || echo "参照なし"
```

## 📊 分析結果記録
```bash
# 統合方針を記録
echo "=== 統合方針決定 ===" >> .restructure/logs/content-analysis.log
echo "context-optimization: ai/context/をベースとする" >> .restructure/logs/content-analysis.log
echo "coding-standards: docs/standards/をベースとする（最包括的）" >> .restructure/logs/content-analysis.log
echo "operational: docs/ops/をベースとする" >> .restructure/logs/content-analysis.log
echo "security-guidelines: docs/standards/をベースとする（標準統合）" >> .restructure/logs/content-analysis.log
echo "document-template: 完全削除（理想構造にないため）" >> .restructure/logs/content-analysis.log
echo "documentation-guidelines: docs/standards/に移動（標準統合）" >> .restructure/logs/content-analysis.log

# リンク切れリスクの記録
echo "=== リンク切れリスク評価 ===" >> .restructure/logs/content-analysis.log
echo "高リスク: document-template削除によるリンク切れ" >> .restructure/logs/content-analysis.log
echo "中リスク: guidelines/ → docs/standards/ 参照変更" >> .restructure/logs/content-analysis.log
echo "低リスク: docs/guidelines/ 削除（古い構造説明のため）" >> .restructure/logs/content-analysis.log
```

## ✅ 完了基準
- [ ] 全重複ファイルの内容比較完了
- [ ] 外部資産（画像・図表）の棚卸し完了
- [ ] READMEファイルの確認完了
- [ ] `.restructure/logs/content-analysis.log` 作成済み
- [ ] 各ファイルパターンの統合方針決定
- [ ] 最良バージョンの特定完了
- [ ] **リンク切れリスクの評価完了**

## ⚠️ 注意事項
- diff コマンドはファイルが全く同じ場合は出力なし
- 日本語ファイル（-ja）も必ず同様に確認
- ファイルサイズや行数だけでなく内容の質も確認
- **外部資産やREADMEの参照関係を必ず確認**
- **リンク切れが発生する可能性を事前評価**

## 🔄 次タスク
TASK-003: ファイル統合実行