# PBI-A-12: freee 経費登録API

## 説明

マッチングされたレシートデータをfreee APIを使用して経費として登録します。領収書添付、取引更新、基本的な経費登録機能を実装します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/freee-expense.ts` - freee経費登録処理（90行以内）

### 技術要件

- freee API経費登録
- 領収書ファイル添付
- 取引データ更新
- エラーハンドリング

### インターフェース仕様

```typescript
interface ExpenseRegistration {
  transactionId: number;
  amount: number;
  date: Date;
  description: string;
  receiptFile?: Buffer;
}

interface RegistrationResult {
  success: boolean;
  expenseId?: number;
  receiptId?: number;
  error?: string;
}

interface FreeeExpenseAPI {
  registerExpense(data: ExpenseRegistration): Promise<RegistrationResult>;
  uploadReceipt(expenseId: number, file: Buffer, filename: string): Promise<number>;
}
```

## 🎯 実装前チェックリスト（影響範囲分析）

- [x] **影響範囲確認**: PBI-A-11完了後に実施、他への影響なし
- [x] **依存関係確認**: PBI-A-09, PBI-A-11完了が前提
- [x] **spec要件確認**: 経費登録がspec必須要件
- [x] **リソース確認**: freee API認証とマッチング結果が利用可能

## 🔧 実装ガイドライン

### TooMuch回避指針
- **行数制限**: 経費登録処理90行以内
- **単一責任**: 経費登録のみ、UI更新は含まない
- **直接実装**: 複雑なバッチ登録は行わない

### コード品質基準
- **TypeScript**: 型安全なAPI登録処理
- **エラーハンドリング**: 登録失敗時の適切な処理
- **JSDoc**: 登録関数の説明記載

## 受け入れ基準

- [ ] freee経費登録が正常に動作する
- [ ] 領収書ファイル添付が成功する
- [ ] 登録結果が適切に返される
- [ ] TypeScriptエラーがない

### 検証コマンド

```bash
# TypeScript検証
npx tsc --noEmit

# 経費登録テスト
npm run dev
# テストデータで経費登録処理確認
```

## ✅ プロフェッショナルセルフレビュー

### 実装完了時必須チェック
- [ ] **影響範囲**: 既存PBIへの悪影響なし
- [ ] **要件達成**: freee経費登録が完了している
- [ ] **シンプル化**: 必要最小限の登録機能のみ
- [ ] **テスト**: 経費登録テストがパスしている
- [ ] **型安全性**: TypeScript型チェックが正しく動作している

### 第三者視点コードレビュー観点
- [ ] **可読性**: 登録処理コードが理解しやすい
- [ ] **保守性**: API呼び出しが適切に設計されている
- [ ] **セキュリティ**: freee API使用が安全に実装されている
- [ ] **パフォーマンス**: 効率的な登録処理

## 📋 完了報告テンプレート

### ✅ セルフチェック結果
- TypeScript: ✅ 0エラー / ❌ Xエラー
- テスト: ✅ 経費登録テストパス / ❌ X失敗  
- ドキュメント: ✅ 登録機能説明完備 / ❌ 不足
- 影響範囲: ✅ 他PBI機能に悪影響なし

### 実装サマリー
- **達成した価値**: レシートからfreee経費への自動登録が完了した
- **主要な実装**: freee経費登録API活用と領収書添付機能
- **残課題**: なし
- **次PBIへの引き継ぎ**: 基本的なエンドツーエンド処理が完成

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]