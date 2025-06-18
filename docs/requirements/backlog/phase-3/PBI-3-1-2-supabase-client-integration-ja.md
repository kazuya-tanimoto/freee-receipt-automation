# PBI-3-1-2: Supabaseクライアント統合と認証セットアップ

## 概要

ブラウザ・サーバーサイド操作用Supabaseクライアントをクッキーベース認証で設定。安全なデータベースアクセス用のTypeScript型と環境設定をセットアップする。

## 実装詳細

### 作成・変更するファイル

1. `src/lib/supabase/client.ts` - ブラウザSupabaseクライアント設定
2. `src/lib/supabase/server.ts` - サーバーサイドSupabaseクライアント
3. `src/lib/supabase/middleware.ts` - 認証ミドルウェアロジック
4. `middleware.ts` - ルート保護用NextJSミドルウェア
5. `src/types/database.ts` - 自動生成データベース型
6. `.env.local.example` - 環境変数テンプレート

### 技術要件

- SSRサポート付きSupabaseクライアントv2
- NextJS App Router用クッキーベース認証
- データベーススキーマからの自動生成TypeScript型
- 安全な環境変数処理
- ルート保護ミドルウェア

### 環境変数

- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY` - サービスロールキー（サーバーサイドのみ）

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント

## 受け入れ基準

- [ ] Supabaseクライアントがデータベースに正常接続する
- [ ] 認証ミドルウェアがルートを正しく保護する
- [ ] データベーススキーマからTypeScript型が生成される
- [ ] 環境変数が適切に設定される
- [ ] セッション管理がクッキーで動作する
- [ ] サーバー・クライアント操作が独立して動作する

## 依存関係

- **必須**: PBI-3-1-1 - NextJSプロジェクトセットアップ
- **必須**: Phase 1完了 - Supabaseデータベーススキーマ

## 見積もり

1ストーリーポイント

## 優先度

高 - 全データ操作と認証に必要
