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
npx tsc --noEmit

# Lintチェック（Biome）
npm run lint

# テスト実行（Vitest）
npm run test

# 取引取得テスト
npm run dev
# freee取引APIを呼び出してレスポンス確認
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

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-07-28
- **開始日**: [日付]
- **完了日**: [日付]
- **担当者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]