# TASK-001: 事前準備・バックアップ

## 🎯 概要
作業開始前の準備作業を行います。
- 作業ブランチの作成
- 現状のバックアップ
- 現状確認

## 📋 作業手順

### 1. 作業ブランチ作成
```bash
# 現在のブランチ確認
git branch

# 作業ブランチ作成・切り替え
git checkout -b feature/fix-readme-structure

# ブランチ確認
git branch
```

### 2. 現状バックアップ
```bash
# バックアップディレクトリ作成
mkdir -p .restructure/backups

# 全MDファイルをバックアップ
cp -r docs/ .restructure/backups/docs-backup
cp -r guidelines/ .restructure/backups/guidelines-backup
cp -r ai/ .restructure/backups/ai-backup

# バックアップ確認
find .restructure/backups -name "*.md" | wc -l
```

### 3. 現状確認・記録
```bash
# 現在のMDファイル数確認
echo "=== 現在のMDファイル ===" > .restructure/logs/before-state.log
fd -t f -e md >> .restructure/logs/before-state.log

# git状態確認
echo "=== Git状態 ===" >> .restructure/logs/before-state.log
git status >> .restructure/logs/before-state.log

# 構造確認
echo "=== ディレクトリ構造 ===" >> .restructure/logs/before-state.log
tree docs/ guidelines/ ai/ -I ".git" >> .restructure/logs/before-state.log
```

## ✅ 完了基準
- [ ] 作業ブランチ `feature/fix-readme-structure` 作成済み
- [ ] `docs/`, `guidelines/`, `ai/` のバックアップ完了
- [ ] `.restructure/logs/before-state.log` 作成済み
- [ ] 現在のMDファイル数が43個であることを確認

## ⚠️ 注意事項
- バックアップは必ず完了してから次作業に進む
- ログファイルで現状を確実に記録する
- git状態に未コミット変更がないことを確認

## 🔄 次タスク
TASK-002: 重複ファイル内容分析