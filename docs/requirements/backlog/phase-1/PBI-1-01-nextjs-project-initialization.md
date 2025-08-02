# PBI-1-01: Next.js プロジェクト初期化

## ⚠️ 重要: 完全リセット前提での新規構築

**現状認識**: 
- 既存の設定ファイル（package.json等）は過去の失敗実装の残骸
- 本PBIは**完全なゼロからの新規構築**を実行
- 古いライブラリ・設定は全て破棄済み、新しい技術スタックで構築

## 説明

freeeレシート自動化システム用のNext.js 15.4プロジェクトを**ゼロから**初期化し、基本的な設定とディレクトリ構造を作成します。React 19、TypeScript、Turbopack、Biome（Linter/Formatter）、Lefthook（pre-commit）、Vitest（テスト）、基本的な依存関係を含む最小限の構成で開始します。

## 実装詳細

### 作成/修正するファイル

1. `package.json` - Next.js 15.4プロジェクト依存関係とスクリプト（50行以内）
2. `next.config.ts` - TypeScript基本設定（20行以内）
3. `tsconfig.json` - TypeScript設定（30行以内）
4. `.lefthook.yml` - ミニマムpre-commit設定（15行以内）

### 技術要件

- Next.js 15.4 App Router + Turbopack
- React 19 with React Server Components (RSC)
- TypeScript strict mode
- Biome（Linter/Formatter）
- Lefthook（pre-commit: TypeScript型チェック・Biome・テスト実行）
- Vitest + React Testing Library（テスト）
- 必要最小限の依存関係のみ
- @/ パスエイリアス設定
- TooMuch回避原則に基づく設定

### 環境変数

```bash
# 開発環境設定
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### インターフェース仕様

```typescript
// 基本プロジェクト構造の型定義
interface ProjectConfig {
  name: string;
  version: string;
  environment: 'development' | 'production';
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: 新規プロジェクトのため影響なし
- [x] **依存関係確認**: 前提PBIなし（最初のPBI）
- [x] **spec要件確認**: Next.js使用がspec要件に合致
- [x] **リソース確認**: Node.js環境が利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: package.json 50行、設定ファイル各30行以内
- **単一責任**: 基本プロジェクト構造のみ、UI/機能は含まない
- **直接実装**: 複雑なbuild設定やプラグインは避ける

### コード品質基準
- **TypeScript**: strict mode有効
- **エラーハンドリング**: Next.js標準エラーページ
- **JSDoc**: 設定ファイルにコメント記載

## 受け入れ基準

- [ ] Next.js 15.4プロジェクトが正常に起動する
- [ ] TypeScriptコンパイルがエラーなしで通る
- [ ] localhost:3000でアクセス可能
- [ ] `yarn build`が成功する
- [ ] Lefthook pre-commitが正常動作する

### 検証コマンド

```bash
# 依存関係インストール
yarn install

# 開発サーバー起動
yarn dev

# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# フォーマットチェック（Biome）
yarn format:check

# テスト実行（Vitest）
yarn test

# ビルド確認
yarn build

# pre-commit動作確認
git add . && git commit --dry-run
```

### Git ワークフロー

**必須手順:**
1. **フィーチャーブランチ作成**: `git checkout -b feature/pbi-1-01-nextjs-initialization`
2. **実装・テスト・コミット**: 通常のコミット（`--no-verify`禁止）
3. **プッシュ**: `git push -u origin feature/pbi-1-01-nextjs-initialization`
4. **PR作成**: GitHub UIまたは`gh pr create`
5. **レビュー・マージ**: コンフリクトなしの場合は自動マージ可

**禁止事項:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-1-01 Next.js project initialization

- Add Next.js 15.4 + React 19 + TypeScript setup
- Configure Biome, Lefthook, Vitest
- Establish basic project structure
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 他PBI機能に悪影響を及ぼしていない（新規のため該当なし）
- [ ] **要件達成**: Next.js基本プロジェクト構造が完成している
- [ ] **シンプル化**: 必要最小限の設定のみ、TooMuchな設定を避けている
- [ ] **テスト**: プロジェクト起動・ビルドテストがパスしている
- [ ] **型安全性**: TypeScript設定が正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 設定ファイルが理解しやすい
- [ ] **保守性**: 将来の機能追加に対応できるシンプルな構造
- [ ] **セキュリティ**: セキュリティリスクのある設定がない
- [ ] **パフォーマンス**: 開発・ビルド速度が適切

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 起動・ビルドテストパス / ❌ X失敗  
- ドキュメント: ✅ 設定ファイルコメント完備 / ❌ 不足
- 影響範囲: ✅ 新規プロジェクトのため影響なし

### 実装サマリー
- **達成した価値**: freeeレシート自動化システムの開発基盤が整った
- **主要な実装**: Next.js 15.4 + React 19 + Turbopack + TypeScript + Biome + Vitest基本プロジェクト構造
- **残課題**: なし
- **次PBIへの引き継ぎ**: Supabaseプロジェクト設定で使用する基本構造が準備完了

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]