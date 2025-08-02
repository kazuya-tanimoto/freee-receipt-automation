# freee レシート自動化システム

フリーランサー向けの週4枚のレシート処理を自動化するMinimalな経費管理システム

## 🎯 概要

このシステムは、フリーランスITエンジニアの経費管理を自動化します：

- **週4枚のレシート処理**：Gmailから自動取得、手動配置PDFの処理
- **OCR自動処理**：Google Vision APIによるデータ抽出
- **freee連携**：取引データとの自動マッチング・経費登録
- **年間$5以下の運用コスト**：Supabase + Edge Functionsによる低コスト運用

## 🚀 クイックスタート

### 前提条件

- Node.js 20+
- Supabaseアカウント ([新規登録](https://supabase.com))
- freeeアカウントとAPI利用許可
- Google Cloud Platform アカウント（Vision API用）

### 1. プロジェクト準備

```bash
git clone https://github.com/your-username/freee-receipt-automation.git
cd freee-receipt-automation
```

**重要**: 本プロジェクトはPBI駆動開発により段階的に構築されます。
実装は `docs/requirements/backlog/phase-1/PBI-1-01-nextjs-project-initialization.md` から開始してください。

### 2. 開発開始

```bash
# PBI-1-01: Next.js 15.4プロジェクト初期化から開始
# docs/requirements/backlog/phase-1/ の順番で実装
```

## 🏗 技術アーキテクチャ

### モダン技術スタック (2025年基準)

- **Frontend**: Next.js 15.4 + React 19 + TypeScript
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **OCR**: Google Vision API
- **API連携**: freee API v1, Gmail API, Google Drive API
- **開発ツール**: Biome (Lint/Format), Vitest (Test), Lefthook (pre-commit)
- **パッケージ管理**: Yarn 4.x

### パフォーマンス特性

- **ビルド速度**: Turbopack により76.7%高速化
- **開発体験**: React 19 Server Componentsによる最適化
- **運用コスト**: 年間$5以下の制約下で設計

## 📋 実装計画

### Phase 1: 基盤構築 (12 PBI)
- **PBI-1-01~03**: プロジェクト初期化・環境構築
- **PBI-1-04~06**: Gmail連携・PDF処理
- **PBI-1-07~08**: OCR機能
- **PBI-1-09~12**: freee API連携

### Phase 2: UI・自動化 (8 PBI)
- **PBI-2-01~03**: 管理UI
- **PBI-2-04~06**: 自動実行システム
- **PBI-2-07~08**: 通知・ファイル管理

### 実装スケジュール
- **Week 1-2**: Phase 1 (基盤構築)
- **Week 3**: Phase 2 (UI・自動化)
- **合計**: 3週間で完了予定

## 💻 開発

### 品質基準

すべてのコードは以下の基準を満たす必要があります：

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック (Biome)
yarn lint

# テスト実行 (Vitest)
yarn test

```

### TooMuch回避原則

- **ファイル行数制限**: 60-120行 (PBIごとに個別調整)
- **単一責任原則**: 1PBI = 1つの明確な価値提供
- **ミニマム実装**: 必要最小限の機能のみ

### PBI駆動開発

各機能は `docs/requirements/backlog/` のPBI（Product Backlog Item）に基づいて実装：

1. PBI文書の要件確認
2. 受け入れ基準の実装
3. セルフレビューの実施
4. 次PBIへ進行

## 📁 プロジェクト構造

```
├── docs/
│   ├── requirements/backlog/     # PBI仕様書
│   ├── architecture/            # アーキテクチャ文書
│   └── refactor/               # プロジェクト計画
├── src/                        # 実装コード (PBI実装後に作成)
├── supabase/                   # DB設定・Edge Functions
└── CLAUDE.md                   # AI開発指針
```

## 🎯 目標システム動作

### 週次自動処理フロー

1. **月曜9時**: pg_cronによる自動実行開始
2. **Gmail監視**: Apple課金等のレシートメール検索
3. **OCR処理**: PDF添付ファイルからデータ抽出
4. **freee連携**: 取引データとのマッチング・経費登録
5. **結果通知**: 処理結果のメール送信
6. **Drive保存**: 月別フォルダへの整理保存

### 管理UI機能

- **ダッシュボード**: 処理状況の一覧表示
- **手動修正**: OCR結果の編集・取引選択
- **履歴確認**: 過去の処理結果参照

## 📖 ドキュメント

### 実装ガイド
- [プロジェクト計画](docs/refactor/post-reset-plan.md) - 実装戦略とスケジュール
- [PBIテンプレート](docs/requirements/backlog/PBI-template-enhanced.md) - 開発標準

### アーキテクチャ
- [モダン技術推奨](docs/architecture/2025-modern-stack-recommendations.md) - 2025年技術選択指針
- [要件仕様](docs/requirements/spec/) - システム要件定義

### AI開発指針
- [CLAUDE.md](CLAUDE.md) - AI開発の8原則とガイドライン

## 🛠 トラブルシューティング

### よくある問題

1. **PBI実装順序**: 必ず依存関係に従って順次実装
2. **行数制限超過**: PBI仕様の制限内でファイル分割
3. **型エラー**: TypeScript strict mode準拠の実装

### サポート

- **PBI仕様**: `docs/requirements/backlog/` 参照
- **実装指針**: `CLAUDE.md` 8原則に従った開発
- **品質確認**: 各PBIの受け入れ基準を満たすこと

## 📄 ライセンス

個人利用プロジェクト。詳細は [LICENSE](LICENSE) を参照。

---

**現在の状況**: プロジェクトリセット完了 | Phase 1実装準備完了  
**最終更新**: 2025-08-02  
**次のアクション**: PBI-1-01 (Next.js プロジェクト初期化) の実行