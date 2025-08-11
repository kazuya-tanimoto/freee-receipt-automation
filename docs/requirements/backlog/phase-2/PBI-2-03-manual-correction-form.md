# PBI-2-03: 手動修正フォーム

## 説明

OCR・マッチング結果の手動修正機能を実装します。金額、日付、店舗名の編集、取引の手動選択、修正内容の保存機能を含むシンプルなフォームを作成します。

## 実装詳細

### 作成/修正するファイル

1. `src/components/Receipt/CorrectionForm.tsx` - 修正フォーム（140行以内）
2. `app/api/receipt/correct/route.ts` - 修正保存API（25行以内）

### 技術要件

- Next.js 15.4 App Router使用
- React 19使用
- フォームバリデーション
- 取引選択機能
- 修正内容保存
- 基本的なUI/UX

### インターフェース仕様

```typescript
interface CorrectionData {
  receiptId: string;
  correctedAmount?: number;
  correctedDate?: Date;
  correctedVendor?: string;
  selectedTransactionId?: number;
  notes?: string;
}

interface CorrectionFormProps {
  receipt: ReceiptProcessingData;
  availableTransactions: FreeeTransaction[];
  onSave: (data: CorrectionData) => Promise<void>;
}

interface CorrectionAPI {
  saveCorrection(data: CorrectionData): Promise<boolean>;
  reprocessReceipt(receiptId: string): Promise<void>;
}
```

### 環境変数（該当する場合）

```bash
# 修正フォーム設定
NEXT_PUBLIC_FORM_AUTOSAVE_DELAY=3000  # 自動保存遅延（ミリ秒）
```

### APIエンドポイント（該当する場合）

- `POST /api/receipt/correct` - 修正内容保存
  - リクエスト: `CorrectionData`
  - レスポンス: `{ success: boolean }`
- `POST /api/receipt/[id]/reprocess` - レシート再処理
  - リクエスト: なし
  - レスポンス: `{ success: boolean }`

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-02完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-2-02（状況表示）完了が前提
- [x] **spec要件確認**: 手動修正がspec必須要件
- [x] **リソース確認**: フォームコンポーネントが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 修正フォーム140行、API 25行以内
- **単一責任**: 修正機能のみ、複雑なワークフローは含まない
- **直接実装**: 重いフォームライブラリは使用しない

### コード品質基準
- **TypeScript**: 型安全なフォーム処理
- **エラーハンドリング**: 保存失敗時の適切なエラー表示
- **JSDoc**: フォーム関数の説明記載

## 受け入れ基準

- [ ] レシートデータの手動編集ができる
- [ ] 取引の手動選択ができる
- [ ] 修正内容が適切に保存される
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
yarn tsc --noEmit

# Lintチェック（Biome）
yarn lint

# テスト実行（Vitest）
yarn test

# 修正フォームテスト
yarn dev
# 修正フォームで編集・保存操作確認
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
例: "PBI-2-03の作業をお願いします。まずは作業計画を立てて報告してください。"
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
git checkout -b feature/pbi-2-03-manual-correction-form
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
git commit -m "feat: PBI-2-03 manual correction form"
git push -u origin feature/pbi-2-03-manual-correction-form

# PR作成
gh pr create --title "feat: PBI-2-03 manual correction form" --body "[structured body]"
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
- **PBI**: PBI-2-03 手動修正フォーム
- **実装内容**: OCR・マッチング結果の手動修正機能の実装
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
src/components/Receipt/CorrectionForm.tsx
app/api/receipt/correct/route.ts
docs/requirements/backlog/phase-2/PBI-2-03-manual-correction-form.md
```

### 検証手順
```bash
git checkout feature/pbi-2-03-manual-correction-form
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
feat: PBI-2-03 manual correction form

- Create receipt data correction interface
- Add transaction selection and editing capabilities
- Implement correction save and reprocessing functionality
- Support Next.js 15.4 App Router and React 19
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: 手動修正機能が完了している
- [ ] **シンプル化**: 必要最小限の修正機能のみ
- [ ] **テスト**: 修正フォームテストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: フォームコードが理解しやすい
- [ ] **保守性**: フィールド追加が容易な設計
- [ ] **セキュリティ**: フォーム入力が安全に処理されている
- [ ] **パフォーマンス**: 効率的なフォーム処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 修正フォームテストパス / ❌ X失敗  
- ドキュメント: ✅ 修正機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: レシート処理エラーの手動修正が可能になった
- **主要な実装**: React フォームベース修正機能
- **残課題**: なし
- **次PBIへの引き継ぎ**: 修正機能が自動実行システムで活用可能

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