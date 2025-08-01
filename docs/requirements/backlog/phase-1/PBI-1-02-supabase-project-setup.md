# PBI-1-02: Supabaseプロジェクト設定

## 説明

Supabaseプロジェクトを作成し、基本的なデータベース設定とクライアント接続を構成します。環境変数設定とSupabaseクライアント初期化を含む最小限の設定を行います。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/supabase.ts` - Supabaseクライアント初期化（50行以内）
2. `.env.local` - ローカル環境変数（10行以内）
3. `.env.example` - 環境変数例（10行以内）
4. `supabase/config.toml` - Supabase設定（30行以内）

### 技術要件

- Supabase JavaScript SDK
- 環境変数による設定管理
- クライアント/サーバー両対応
- エラーハンドリング基本実装

### 環境変数

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### インターフェース仕様

```typescript
// Supabaseクライアント型定義
interface SupabaseClient {
  from: (table: string) => any;
  auth: any;
  storage: any;
}

// 設定インターフェース
interface SupabaseConfig {
  url: string;
  anonKey: string;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-01完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-01（Next.jsプロジェクト）完了が前提
- [x] **spec要件確認**: Supabase使用がspec要件に合致
- [x] **リソース確認**: Supabaseアカウント・プロジェクトが必要

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: クライアント初期化50行以内
- **単一責任**: Supabase接続のみ、業務ロジックは含まない
- **直接実装**: 複雑なコネクションプールや高度な設定は避ける

### コード品質基準
- **TypeScript**: Supabase型定義活用
- **エラーハンドリング**: 接続エラーの基本処理
- **JSDoc**: 重要な関数にコメント

## 受け入れ基準

- [ ] Supabaseクライアントが正常に初期化される
- [ ] 環境変数が正しく読み込まれる
- [ ] データベース接続テストが成功する
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# 接続テスト（開発時）
yarn dev
# ブラウザコンソールでエラーがないことを確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-1-02-supabase-setup`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-1-02-supabase-setup`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-02 Supabase project setup

- Configure Supabase client initialization
- Set up environment variables
- Add database connection testing
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: PBI-1-01への悪影響なし
- [ ] **要件達成**: Supabase基本接続が完了している
- [ ] **シンプル化**: 必要最小限の接続設定のみ
- [ ] **テスト**: 接続テストがパスしている
- [ ] **型安全性**: TypeScript設定が正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 設定コードが理解しやすい
- [ ] **保守性**: 環境変数変更に柔軟に対応できる
- [ ] **セキュリティ**: 秘密鍵が適切に管理されている
- [ ] **パフォーマンス**: 不要な接続処理がない

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 接続テストパス / ❌ X失敗  
- ドキュメント: ✅ 環境変数設定完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: データベース基盤への接続が確立された
- **主要な実装**: Supabaseクライアント初期化と環境変数設定
- **残課題**: なし
- **次PBIへの引き継ぎ**: Supabaseクライアントが他PBIで使用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]