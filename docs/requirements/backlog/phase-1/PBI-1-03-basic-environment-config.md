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

## 🚀 プロフェッショナル作業プロセス

### 👥 役割分担

**🧑‍💼 人間（プロジェクトマネージャー）:**
1. PBI提示・作業指示
2. 作業計画承認（Go/No-Go判断）
3. 外部AIレビュー依頼（コピペ実行）

**🤖 実装AI（実行担当）:**
1. 作業計画立案・提示
2. 技術実装・テスト・PR作成
3. 統合セルフレビュー・進捗記録
4. 外部レビュー依頼文生成・出力

**🔍 レビューAI（品質保証担当）:**
1. コード品質レビュー実施
2. 承認/要修正判断
3. PBI進捗最終更新・コミット
4. 完了宣言

### 📋 作業プロセス詳細

#### Phase 1: 計画・承認フェーズ

**Step 1-1: 人間 → PBI提示**
```
例: "PBI-1-03の作業をお願いします。まずは作業計画を立てて報告してください。"
```

**Step 1-2: 実装AI → 作業計画立案・提示**
- 前提条件確認結果
- 実装ファイル詳細  
- 技術アプローチ
- 検証手順
- リスク分析

**完了条件:** "実装が完了しました。レビューして次の指示をお願いします。"

**Step 1-3: 人間 → 承認判断**
```
承認: "進行してください"
修正要求: "○○を修正して再提案してください"
```

#### Phase 2: 実装・PR作成フェーズ

**Step 2-1: 実装AI → フィーチャーブランチ作成**
```bash
git checkout -b feature/pbi-1-03-environment-config
```

**Step 2-2: 実装AI → 技術実装**
- コード実装
- 機能動作確認

**Step 2-3: 実装AI → 統合セルフレビュー（コミット前）**
```bash
# 技術検証
yarn tsc --noEmit
yarn lint
yarn test:run
yarn dev

# 変更内容レビュー
git diff

# 要件適合確認
# - PBI受け入れ基準チェック
# - 行数制限遵守確認
# - TooMuch回避確認
```

**Step 2-4: 実装AI → コミット・プッシュ・PR作成**
```bash
# コミット・プッシュ
git add .
git commit -m "feat: PBI-1-03 basic environment configuration"
git push -u origin feature/pbi-1-03-environment-config

# PR作成
gh pr create --title "feat: PBI-1-03 basic environment configuration" --body "[structured body]"
```

**Step 2-5: 実装AI → セルフレビューチェックボックス記入**
- 実装完了時必須チェック（5項目）
- 第三者視点コードレビュー観点（4項目）

**Step 2-6: 実装AI → 外部レビュー依頼文生成・出力**

#### Phase 3: レビュー・完了フェーズ

**Step 3-1: 人間 → 外部AIレビュー依頼**
- 実装AIが出力したテキストを別AIにコピペ

**Step 3-2: レビューAI → 品質レビュー・完了処理**
- コード品質評価
- PBI進捗最終更新
- 進捗管理コミット実行
- PR承認・マージ
- 完了宣言

## 🔍 外部AIレビュー依頼文（テンプレート）

**実装AI は以下のフォーマットで完全なコピペ用テキストを出力する:**

```markdown
## 🔍 外部AIレビュー依頼（コピペ用）

以下のテキストを別のAIにコピペして依頼してください：

---

## PBI実装レビュー依頼

### レビュー対象
- **プロジェクト**: freeeレシート自動化システム
- **PBI**: PBI-1-03 基本環境変数・設定ファイル
- **実装内容**: 型安全な環境変数管理システム
- **PRリンク**: [GitHub PR URL]

### レビュー観点
以下4つの観点で客観的レビューをお願いします：

#### 1. 技術品質 ⭐
- [ ] TypeScript型安全性とエラーハンドリング
- [ ] テストカバレッジと品質
- [ ] コード可読性と保守性
- [ ] セキュリティ考慮事項

#### 2. アーキテクチャ適合性 ⭐
- [ ] Next.js 15.4 + React 19 ベストプラクティス準拠
- [ ] プロジェクト構造との整合性
- [ ] 依存関係の適切性

#### 3. 要件適合性 ⭐
- [ ] PBI受け入れ基準100%達成
- [ ] spec要件との整合性
- [ ] TooMuch回避原則遵守

#### 4. 運用品質 ⭐
- [ ] エラー処理とログ出力
- [ ] パフォーマンス影響
- [ ] 将来の拡張性

### 確認対象ファイル
```
[実装したファイルパス一覧]
```

### 検証手順
```bash
git checkout [ブランチ名]
yarn tsc --noEmit
yarn test:run
yarn dev
```

### 必須作業（レビュー完了後）
**レビュー結果をPBIに記録し、以下を実行してください：**

1. **PBI進捗最終更新**
   - ステータス: 完了
   - 完了日: [今日の日付]
   - レビュアー: [あなたのAI識別子]
   - レビュー結果: [承認/要修正]

2. **進捗管理コミット実行**
```bash
git checkout main
git pull origin main
git add docs/requirements/backlog/phase-1/PBI-1-03-*.md
git commit -m "docs: PBI-1-03 completed with external review"
git push origin main
```

3. **PR承認・マージ**
```bash
gh pr merge --merge --delete-branch
```

4. **完了宣言**
「PBI-1-03 は品質基準を満たし、完了しました。」

### レビュー結果記入
- **総合判定**: ✅承認 / ❌要修正
- **主要な問題**: 
- **改善提案**: 
- **品質スコア**: [1-5点]
- **コメント**: 

---
```

## ⚠️ 禁止事項・注意事項

**絶対禁止:**
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