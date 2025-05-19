# README.mdとの齟齬修正ワークスペース（更新版）

## 📁 目的
ルートのREADME.mdの理想構造と現在の構造の齟齬を修正し、重複ファイルを統合する作業用ディレクトリです。

## 🎯 修正方針
- 既存MDファイルのコンテンツは一切捨てない（重複統合により保持）
- 重複ファイルは内容比較して最良版に統合
- 理想構造にないディレクトリ・ファイルを削除
- README.md理想構造への100%準拠を実現

## 📂 ディレクトリ構造
```
.restructure/
├── README.md                 # このファイル
├── overview.md               # 修正概要・ファイル対応表
├── progress.md               # 進捗管理
├── ideal-structure.md        # 理想構造の完全版
├── tasks/                    # 4つの作業手順
│   ├── task-001-backup.md
│   ├── task-002-content-analysis.md
│   ├── task-003-integration.md
│   └── task-004-cleanup.md
├── scripts/                  # 自動化スクリプト
│   └── validate-links.sh     # リンクチェック
└── logs/                     # 作業ログ
```

## 🚀 作業開始手順

### 1. 現在の進捗確認
```bash
cat .restructure/progress.md
```

### 2. 次タスク確認（現在はTASK-001）
```bash
cat .restructure/tasks/task-001-backup.md
```

### 3. 理想構造確認
```bash
cat .restructure/ideal-structure.md
```

### 4. リンクチェック（作業後）
```bash
bash .restructure/scripts/validate-links.sh
```

## ⚠️ 重要な注意事項

- **必ずバックアップ作成**してから作業開始
- **小さなコミット**で進捗を記録
- **内容統合時**は必ず両方のファイルを比較
- **リンク修正**を忘れずに実行
- **セキュリティ・ドキュメント標準**はdocs/standards/に統合
- **document-template**は理想構造にないため削除

## 📋 修正後の成果物

- **重複ファイル**: 9パターン→0パターン
- **MDファイル数**: 43個→約21個
- **理想構造準拠**: 100%
- **情報欠落**: なし（統合により保持）

## 🔄 完了後

1. **完了報告書確認**: `.restructure/completion-report.md`
2. **Git履歴確認**: 適切にコミットされているか
3. **ディレクトリ削除**: `.restructure/`全体を削除

---
*README.md理想構造への完全準拠を実現します*