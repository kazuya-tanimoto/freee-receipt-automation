# PBI-1-03: 基本環境変数・設定ファイル

## 説明

プロジェクト全体で使用する環境変数と基本設定ファイルを整備します。API キー管理、開発・本番環境の切り替え、基本的な設定値管理を行います。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/config.ts` - 環境変数読み込みとバリデーション（80行以内）
2. `src/types/config.ts` - 設定型定義（20行以内）

### 技術要件

- 環境変数の型安全な読み込み
- 必須環境変数のバリデーション
- 開発・本番環境の分離
- エラーハンドリング

### 環境変数

```bash
# API設定
GOOGLE_VISION_API_KEY=your_vision_api_key
FREEE_CLIENT_ID=your_freee_client_id
FREEE_CLIENT_SECRET=your_freee_client_secret

# Gmail API
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret

# Drive API
GOOGLE_DRIVE_API_KEY=your_drive_api_key
```

### インターフェース仕様

```typescript
// 環境設定型定義
interface AppConfig {
  vision: {
    apiKey: string;
  };
  freee: {
    clientId: string;
    clientSecret: string;
  };
  gmail: {
    clientId: string;
    clientSecret: string;
  };
  drive: {
    apiKey: string;
  };
}

// 設定取得関数
interface ConfigManager {
  getConfig(): AppConfig;
  validateConfig(): boolean;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-02完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-01, PBI-1-02完了が前提
- [x] **spec要件確認**: API統合要件に必要な設定
- [x] **リソース確認**: 各種APIキーが取得可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 設定ファイル80行以内
- **単一責任**: 環境変数管理のみ、業務ロジックは含まない
- **直接実装**: 複雑な設定フレームワークは使用しない

### コード品質基準
- **TypeScript**: 型安全な環境変数アクセス
- **エラーハンドリング**: 必須変数不足時の明確なエラー
- **JSDoc**: 設定項目の説明記載

## 受け入れ基準

- [ ] 環境変数が型安全に読み込まれる
- [ ] 必須環境変数不足時にエラーが発生する
- [ ] 設定値の取得関数が正常動作する
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# 設定テスト
yarn dev
# 設定値が正しく読み込まれることを確認
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-1-03-environment-config`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-1-03-environment-config`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-03 basic environment configuration

- Add type-safe environment variable management
- Implement configuration validation
- Set up API keys management system
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: 環境変数管理が完了している
- [ ] **シンプル化**: 必要最小限の設定管理のみ
- [ ] **テスト**: 設定読み込みテストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 設定コードが理解しやすい
- [ ] **保守性**: 新しい設定項目の追加が容易
- [ ] **セキュリティ**: 秘密情報が適切に管理されている
- [ ] **パフォーマンス**: 不要な設定読み込み処理がない

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 設定読み込みテストパス / ❌ X失敗  
- ドキュメント: ✅ 設定項目説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: プロジェクト全体の設定管理基盤が整った
- **主要な実装**: 型安全な環境変数管理システム
- **残課題**: なし
- **次PBIへの引き継ぎ**: 各種API設定が他PBIで使用可能

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]