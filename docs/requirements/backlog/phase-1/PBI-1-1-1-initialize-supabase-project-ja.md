# PBI-1-1-1: Supabaseプロジェクトの初期化

## 説明

freeeレシート自動化システム用の初期設定を含む新しいSupabaseプロジェクトを作成します。これにはSupabase
CLI経由でのプロジェクトセットアップと基本設定の構成が含まれます。

## 実装詳細

### 作成/修正するファイル

1. `supabase/config.toml` - Supabaseプロジェクト設定
2. `.env.local` - ローカル開発用の環境変数
3. `.env.example` - ドキュメント用の環境変数例
4. `src/lib/supabase/client.ts` - Supabaseクライアント初期化
5. `src/types/supabase.ts` - SupabaseのTypeScript型

### 技術要件

- Supabase CLI v1.0+を使用
- 日本リージョン（ap-northeast-1）用にプロジェクトを設定
- メール認証を有効化
- 適切なCORS設定をセットアップ
- レート制限を設定

### 環境変数

- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY` - サービスロールキー（サーバーサイドのみ）

### 従うべきコードパターン

- Supabaseクライアントにはシングルトンパターンを使用
- ブラウザとサーバーコンテキスト用に別々のクライアントを実装
- 環境変数検証を使用

## 受け入れ基準

- [ ] Supabaseプロジェクトが作成されアクセス可能
- [ ] 環境変数が適切に設定されている
- [ ] Supabaseクライアントが正常に接続できる
- [ ] 基本認証が有効になっている
- [ ] Next.jsアプリ用にCORSが適切に設定されている

## 依存関係

- **必須**: なし（最初のタスク）

## テスト要件

- ユニットテスト: Supabaseクライアント初期化のテスト
- 統合テスト: Supabaseへの接続テスト
- テストデータ: 基本的なテストユーザー資格情報

## 見積もり

1ストーリーポイント

## 優先度

高 - すべての他の機能に必要な基盤タスク

## 実装メモ

- `npx supabase init`を使用してプロジェクトを初期化
- 最初は無料層の設定を使用することを確認
- プロジェクトURLとキーを安全に文書化
