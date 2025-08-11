# PBI-2-04: Edge Function実装（処理オーケストレーション）

## 説明

Supabase Edge Functionsを使用してレシート処理の全体的なワークフローを制御するオーケストレーション機能を実装します。Gmail取得、OCR処理、freee連携の一連の処理を統合し、エラーハンドリングを含む基本的な処理フローを構築します。

## 実装詳細

### 作成/修正するファイル

1. `supabase/functions/weekly-process/index.ts` - 処理オーケストレーション（55行以内）

### 技術要件

- Next.js 15.4 App Router使用
- React 19使用
- Supabase Edge Functions
- TypeScript
- 処理フロー制御
- 基本的なエラーハンドリング

### インターフェース仕様

```typescript
interface ProcessingResult {
  success: boolean;
  processedCount: number;
  errors: string[];
  startedAt: Date;
  completedAt: Date;
}

interface EdgeFunctionOrchestrator {
  orchestrateProcessing(): Promise<ProcessingResult>;
}
```

### 環境変数（該当する場合）

```bash
# Edge Function実行設定
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EDGE_FUNCTION_TIMEOUT=300000  # 実行タイムアウト（ミリ秒）
```

### APIエンドポイント（該当する場合）

- `POST /api/process/orchestrate` - 処理オーケストレーション開始
  - リクエスト: なし
  - レスポンス: `ProcessingResult`
- Edge Function: `supabase/functions/weekly-process` - 週次処理実行
  - トリガー: cron または手動
  - レスポンス: `ProcessingResult`

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-03完了後に実施
- [x] **依存関係確認**: Phase 1全機能（Gmail/OCR/freee）が前提
- [x] **spec要件確認**: 自動処理のコア機能
- [x] **リソース確認**: Supabase Edge Functions利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 55行以内で処理フローを実装
- **単一責任**: オーケストレーションのみ、個別処理は含まない
- **直接実装**: 複雑なワークフローエンジンは使用しない

### コード品質基準
- **TypeScript**: 完全な型定義
- **エラーハンドリング**: try-catchで基本的なエラー処理
- **JSDoc**: 処理フローの説明記載

## 受け入れ基準

- [ ] 処理フローが正常に動作する
- [ ] エラー時に適切に処理が中断される
- [ ] 処理結果が返される
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# Edge Function テスト
supabase functions serve
# 手動でEdge Function呼び出し確認
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
例: "PBI-2-04の作業をお願いします。まずは作業計画を立てて報告してください。"
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
git checkout -b feature/pbi-2-04-edge-orchestrator
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
supabase functions serve

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
git commit -m "feat: PBI-2-04 Edge Function orchestration"
git push -u origin feature/pbi-2-04-edge-orchestrator

# PR作成
gh pr create --title "feat: PBI-2-04 Edge Function orchestration" --body "[structured body]"
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
- **PBI**: PBI-2-04 Edge Function実装（処理オーケストレーション）
- **実装内容**: Supabase Edge Functionsによる処理オーケストレーション機能の実装
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
supabase/functions/weekly-process/index.ts
docs/requirements/backlog/phase-2/PBI-2-04-edge-function-orchestrator.md
```

### 検証手順
```bash
git checkout feature/pbi-2-04-edge-orchestrator
yarn tsc --noEmit
yarn test:run
supabase functions serve
```


---

## ⚠️ 禁止事項・注意事項

**絶対禁止:**
- ❌ **mainブランチへの直接コミット** - 必ずフィーチャーブランチを使用
- ❌ **`--no-verify`フラグ使用** - pre-commitチェックは必須
- ❌ **コンフリクト状態でのマージ** - 解決後に再実行

**コミットメッセージ規約:**
```
feat: PBI-2-04 Edge Function orchestration

- Implement Supabase Edge Function workflow controller
- Add processing orchestration and error handling
- Set up automated receipt processing pipeline
- Support Next.js 15.4 App Router and React 19
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: Phase 1機能を適切に呼び出している
- [ ] **要件達成**: 処理オーケストレーションが完了
- [ ] **シンプル化**: 必要最小限のフロー制御のみ
- [ ] **テスト**: Edge Function動作確認完了
- [ ] **型安全性**: TypeScript型チェックがパス

### 第三者視点コードレビュー観点
- [ ] **可読性**: 処理フローが明確
- [ ] **保守性**: 処理の追加/変更が容易
- [ ] **エラー処理**: 適切なエラーハンドリング
- [ ] **パフォーマンス**: 効率的な処理順序

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ Edge Function動作確認 / ❌ X失敗  
- ドキュメント: ✅ 処理フロー説明完備 / ❌ 不足
- 影響範囲: ✅ Phase 1機能正常動作

### 実装サマリー
- **達成した価値**: 自動処理の中核となるオーケストレーション機能
- **主要な実装**: Supabase Edge Functionsによる処理統合
- **残課題**: なし
- **次PBIへの引き継ぎ**: オーケストレーション関数が利用可能

## 重要な原則

### 1PBI基準
- **1機能 = 1ファイル = 100行以内**
- **1日で完了可能**
- **独立してテスト可能**

### TooMuch厳禁
- エンタープライズパターン使用禁止
- 複雑な抽象化禁止
- 過度なエラーハンドリング禁止

### プロフェッショナル品質
- セルフレビュー必須
- 第三者視点での検証必須
- spec要件100%準拠必須

## メタデータ
### 進捗記入欄
- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-08-02
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]

### レビュー結果記入欄
- **総合判定**: ✅承認 / ❌要修正
- **主要な問題**:
- **改善提案**:
- **品質スコア**: [1-5点]
- **コメント**: