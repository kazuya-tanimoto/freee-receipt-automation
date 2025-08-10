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
例: "PBI-1-01の作業をお願いします。まずは作業計画を立てて報告してください。"
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
git checkout -b feature/pbi-1-01-nextjs-initialization
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
git commit -m "feat: PBI-1-01 Next.js project initialization"
git push -u origin feature/pbi-1-01-nextjs-initialization

# PR作成
gh pr create --title "feat: PBI-1-01 Next.js project initialization" --body "[structured body]"
```

**Step 2-5: 実装AI → セルフレビューチェックボックス記入**
- 実装完了時必須チェック（5項目）
- 第三者視点コードレビュー観点（4項目）

**Step 2-6: 実装AI → 外部レビュー依頼文生成・出力**

#### Phase 3: レビュー・完了フェーズ

**Step 3-1: 人間 → 外部AIレビュー依頼**
- 実装AIが出力したテキストを別AIにコピペ

**Step 3-2: レビューAI → 品質レビュー・完了処理**

1. **コード品質評価実施**

2. **評価結果による分岐：**

   **A. ❌要修正の場合：**
   - 具体的な修正点をリスト化
   - 修正方法の提案を含める
   - 「以下の修正が必要です」とユーザーに報告
   - 修正依頼文を出力して処理終了
   
   **B. ✅承認の場合：**
   - レビュー結果サマリーを提示
   - **「以下の作業を実施してよろしいですか？」と確認**
     - PBI進捗最終更新の内容提示
     - 進捗管理コミットの内容提示
     - PR承認・マージの確認
   
3. **ユーザー承認後（承認の場合のみ）：**
   - PBI進捗最終更新
   - 進捗管理コミット実行
   - PR承認・マージ・作業ブランチ削除
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
- **PBI**: PBI-1-01 Next.js プロジェクト初期化
- **実装内容**: Next.js 15.4 + React 19 基本プロジェクト構造
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


---

## ⚠️ 禁止事項・注意事項

**絶対禁止:**
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
- [x] **影響範囲**: 他PBI機能に悪影響を及ぼしていない（新規のため該当なし）
- [x] **要件達成**: Next.js基本プロジェクト構造が完成している
- [x] **シンプル化**: 必要最小限の設定のみ、TooMuchな設定を避けている
- [x] **テスト**: プロジェクト起動・ビルドテストがパスしている
- [x] **型安全性**: TypeScript設定が正しく動作している

### 第三者視点コードレビュー観点
- [x] **可読性**: 設定ファイルが理解しやすい
- [x] **保守性**: 将来の機能追加に対応できるシンプルな構造
- [x] **セキュリティ**: セキュリティリスクのある設定がない
- [x] **パフォーマンス**: 開発・ビルド速度が適切

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー
- テスト: ✅ 起動・ビルドテストパス
- ドキュメント: ✅ 設定ファイルコメント完備
- 影響範囲: ✅ 新規プロジェクトのため影響なし

### 実装サマリー
- **達成した価値**: freeeレシート自動化システムの開発基盤が整った
- **主要な実装**: Next.js 15.4 + React 19 + Turbopack + TypeScript + Biome + Vitest基本プロジェクト構造
- **残課題**: なし
- **次PBIへの引き継ぎ**: Supabaseプロジェクト設定で使用する基本構造が準備完了

## メタデータ
### 進捗記入欄
- **ステータス**: 完了
- **実際のストーリーポイント**: 1（想定通り）
- **作成日**: 2025-07-28
- **開始日**: 2025-08-02
- **完了日**: 2025-08-02
- **担当者**: Claude Code AI
- **レビュアー**: プロジェクトオーナー
- **実装メモ**: Next.js 15.4 + React 19基盤構築完了。yarn 4.x + Biome + Lefthook環境正常動作確認済み

### レビュー結果記入欄
- **総合判定**: ✅承認
- **主要な問題**: なし
- **改善提案**: なし（基本構造として適切）
- **品質スコア**: 5/5点
- **コメント**: Next.js 15.4 + React 19基盤として完璧な構築