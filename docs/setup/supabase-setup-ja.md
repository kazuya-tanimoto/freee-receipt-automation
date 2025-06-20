# Supabaseセットアップガイド

このガイドでは、freee領収書自動化システムのSupabaseプロジェクトのセットアップ方法を説明します。

## 前提条件

- Node.js 18以上がインストールされていること
- Supabaseアカウントを持っていること（[無料登録](https://supabase.com)）
- Gitがインストールされており、リポジトリをクローンしていること

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabaseダッシュボード](https://app.supabase.com)にログイン
2. **"New Project"**をクリック
3. 以下の情報を入力：

   - **プロジェクト名**: `freee-receipt-automation`（任意）
   - **データベースパスワード**: 安全なパスワードを生成して保存
   - **リージョン**: 最寄りのリージョンを選択（例：東京）
   - **料金プラン**: Free（開始時）

4. **"Create new project"**をクリック

### 2. プロジェクト設定の取得

Supabaseプロジェクトダッシュボードから：

1. **Settings** → **API**に移動
2. 以下の値をコピー：
   - **Project URL**
   - **Project API Key** (anon key)
   - **Project API Key** (service_role key)

### 3. 環境変数の設定

1. 環境設定テンプレートをコピー：

   ```bash
   cp .env.example .env.local
   ```

2. `.env.local`ファイルにSupabase設定を記入：

   ```bash
   # Supabase設定
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # アプリケーション設定
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 4. Supabase CLIのインストール（オプション）

ローカル開発とマイグレーション管理用：

```bash
npm install -g supabase
```

### 5. データベースマイグレーションの実行

Supabaseダッシュボードを使用してマイグレーションを実行：

```sql
-- 1. SupabaseダッシュボードのSQL Editorに移動
-- 2. supabase/migrations/から各マイグレーションファイルをコピー＆ペースト
-- 3. 順番に実行: 001, 002, 003
```

### 6. セットアップの確認

1. 開発サーバーを起動：

   ```bash
   npm run dev
   ```

2. ブラウザコンソールで接続エラーがないか確認
3. 基本的な認証機能をテスト

## データベーススキーマ概要

システムは以下のテーブルを作成します：

- **user_settings**: ユーザー設定とfreee連携設定
- **receipts**: アップロードされた領収書ファイルと処理状況
- **transactions**: freeeトランザクションデータとマッチング情報
- **processing_logs**: 領収書処理ステップの監査証跡

## セキュリティ設定

### 行レベルセキュリティ（RLS）

すべてのテーブルでRLSが有効になっており、以下を保証します：

- ユーザーは自分のデータのみアクセス可能
- サービスロールはシステム操作のための管理者アクセス権限を持つ
- 匿名ユーザーはデータにアクセス不可

### 認証

- メール/パスワード認証が有効
- メール確認が必要
- パスワードリセット機能が利用可能

## トラブルシューティング

### よくある問題

#### 接続エラー: "Invalid API key"

- `.env.local`のAPIキーが正しいか確認
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`にanonキーを使用しているか確認

#### データベースエラー: "relation does not exist"

- データベースマイグレーションを順番に実行
- 3つのマイグレーションファイルがすべて実行されたか確認

#### RLSエラー: "Permission denied"

- RLSポリシーが正しく設定されているか確認
- ユーザーが認証されているか確認

### サポート

追加のヘルプについて：

1. [Supabaseドキュメント](https://supabase.com/docs)を確認
2. [トラブルシューティングガイド](../troubleshooting/supabase-issues-ja.md)を参照
3. プロジェクトのGitHub issuesを確認

## 次のステップ

Supabaseセットアップ完了後：

1. freee API連携の設定
2. OCRサービスの認証情報設定
3. 本番環境へのデプロイ

---

最終更新日: 2024-06-19
