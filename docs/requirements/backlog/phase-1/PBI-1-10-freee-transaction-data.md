# PBI-1-10: freee 取引データ取得

## 説明

認証済みfreee APIを使用して取引データを取得します。未処理の経費取引を検索し、レシートマッチング用のデータを準備する機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/freee-transactions.ts` - freee取引データ取得（85行以内）

### 技術要件

- freee API v1使用
- 取引一覧取得
- 日付・金額による絞り込み
- ページネーション対応

### インターフェース仕様

```typescript
interface FreeeTransaction {
  id: number;
  date: string;
  amount: number;
  description: string;
  status: 'pending' | 'settled' | 'transferred';
  receipt_ids: number[];
}

interface TransactionQuery {
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

interface FreeeTransactionAPI {
  getTransactions(query?: TransactionQuery): Promise<FreeeTransaction[]>;
  getUnprocessedTransactions(): Promise<FreeeTransaction[]>;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-1-09完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-1-09（freee認証）完了が前提
- [x] **spec要件確認**: 取引データ取得がマッチング処理に必要
- [x] **リソース確認**: freee API認証が利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 取引取得処理85行以内
- **単一責任**: データ取得のみ、マッチング処理は含まない
- **直接実装**: 複雑なクエリビルダーは使用しない

### コード品質基準
- **TypeScript**: 型安全なAPI応答処理
- **エラーハンドリング**: freee API エラーの適切な処理
- **JSDoc**: 取引取得関数の説明記載

## 受け入れ基準

- [ ] freee取引データが正しく取得される
- [ ] 未処理取引の絞り込みができる
- [ ] API制限に適切に対応している
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# 取引取得テスト
yarn dev
# freee取引APIを呼び出してレスポンス確認
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
例: "PBI-1-10の作業をお願いします。まずは作業計画を立てて報告してください。"
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
git checkout -b feature/pbi-1-10-freee-transactions
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
git commit -m "feat: PBI-1-10 freee transaction data retrieval"
git push -u origin feature/pbi-1-10-freee-transactions

# PR作成
gh pr create --title "feat: PBI-1-10 freee transaction data retrieval" --body "[structured body]"
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
- **PBI**: PBI-1-10 freee 取引データ取得
- **実装内容**: freee APIから未処理取引データの取得機能
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
src/lib/freee-transactions.ts
```

### 検証手順
```bash
git checkout feature/pbi-1-10-freee-transactions
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
feat: PBI-1-10 freee transaction data retrieval

- Implement freee transaction API integration
- Add unprocessed transaction filtering
- Set up data preparation for receipt matching
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: freee取引データ取得が完了している
- [ ] **シンプル化**: 必要最小限の取得機能のみ
- [ ] **テスト**: 取引取得テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 取引取得コードが理解しやすい
- [ ] **保守性**: クエリ条件が修正しやすい設計
- [ ] **セキュリティ**: freee API使用が安全に実装されている
- [ ] **パフォーマンス**: 適切なページネーション対応

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 取引取得テストパス / ❌ X失敗  
- ドキュメント: ✅ 取引取得機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: freee取引データとのマッチング準備が完了した
- **主要な実装**: freee取引API活用とデータ取得機能
- **残課題**: なし
- **次PBIへの引き継ぎ**: 取得した取引データがマッチング処理で使用可能

## メタデータ
### 進捗記入欄
- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
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