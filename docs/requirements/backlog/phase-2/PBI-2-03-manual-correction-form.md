# PBI-2-03: 手動修正フォーム

## 説明

OCR・マッチング結果の手動修正機能を実装します。金額、日付、店舗名の編集、取引の手動選択、修正内容の保存機能を含むシンプルなフォームを作成します。

## 実装詳細

### 作成/修正するファイル

1. `src/components/Receipt/CorrectionForm.tsx` - 修正フォーム（95行以内）
2. `pages/api/receipt/correct.ts` - 修正保存API（25行以内）

### 技術要件

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

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-2-02完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-2-02（状況表示）完了が前提
- [x] **spec要件確認**: 手動修正がspec必須要件
- [x] **リソース確認**: フォームコンポーネントが利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 修正フォーム95行、API 25行以内
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
npx tsc --noEmit

# Lintチェック（Biome）
npm run lint

# テスト実行（Vitest）
npm run test

# 修正フォームテスト
npm run dev
# 修正フォームで編集・保存操作確認
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

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]