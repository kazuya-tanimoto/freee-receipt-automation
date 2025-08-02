# PBI-1-01: Next.js プロジェクト初期化

## 説明

freeeレシート自動化システム用のNext.js 15.4プロジェクトを初期化し、基本的な設定とディレクトリ構造を作成します。React 19、TypeScript、Turbopack、Biome（Linter/Formatter）、Lefthook（pre-commit）、Vitest（テスト）、基本的な依存関係を含む最小限の構成で開始します。

## 実装詳細

### 作成/修正するファイル

1. `package.json` - Next.js 15.4プロジェクト依存関係とスクリプト（50行以内）
2. `next.config.ts` - TypeScript基本設定（20行以内）
3. `tsconfig.json` - TypeScript設定（30行以内）

### 技術要件

- Next.js 15.4 App Router + Turbopack
- React 19 with React Server Components (RSC)
- TypeScript strict mode
- Biome（Linter/Formatter）
- Lefthook（pre-commit hooks）
- Vitest + React Testing Library（テスト）
- 必要最小限の依存関係のみ
- @/ パスエイリアス設定

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
- [ ] `npm run build`が成功する

### 検証コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# TypeScript検証
npx tsc --noEmit

# Lintチェック（Biome）
npm run lint

# フォーマットチェック（Biome）
npm run format:check

# テスト実行（Vitest）
npm run test

# ビルド確認
npm run build
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