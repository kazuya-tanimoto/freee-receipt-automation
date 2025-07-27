# PBI-3-3-1: 領収書リストインターフェースとフィルタリング

## 概要

処理済み領収書の管理とレビュー用の検索、フィルタリング、ソート、ページネーション機能を備えた包括的な領収書リストページを作成。

## 実装詳細

### 作成・変更するファイル

1. `src/app/(dashboard)/receipts/page.tsx` - 領収書リストページ
2. `src/components/receipts/ReceiptList.tsx` - メインリストコンポーネント
3. `src/components/receipts/ReceiptCard.tsx` - 個別領収書カード
4. `src/components/receipts/ReceiptFilters.tsx` - フィルターコントロール
5. `src/lib/receipts/queries.ts` - 領収書データベースクエリ
6. `src/hooks/useReceiptFilters.ts` - フィルター状態管理

### 技術要件

- 大規模データセットのパフォーマンス用サーバーサイドページネーション
- ベンダー名とファイル名でのデバウンス付きリアルタイム検索
- 複数フィルター条件: 日付範囲、ステータス、金額、ベンダー
- ソート可能列: 日付、金額、ベンダー、ステータス、信頼度
- 一括選択と操作
- モバイル・デスクトップ対応レスポンシブデザイン

### フィルターインターフェース

```typescript
interface ReceiptFilters {
  search?: string;
  dateRange?: { from: Date; to: Date };
  status?: Array<'pending' | 'processed' | 'error'>;
  amountRange?: { min: number; max: number };
  vendorNames?: string[];
}
```

## メタデータ

- **ステータス**: 未開始
- **作成日**: 2025-01-13
- **担当者**: AIアシスタント

## 受け入れ基準

- [ ] 領収書リストが適切なページネーションで表示
- [ ] 検索がベンダー名とファイル名で結果をフィルタリング
- [ ] 日付と金額範囲フィルターが正しく動作
- [ ] サポートされる全列でソート機能が動作
- [ ] 一括選択が複数領収書操作を可能に
- [ ] ローディング・エラー状態が適切に処理される

## 依存関係

- **必須**: PBI-3-1-5 - アプリケーションレイアウト
- **必須**: Phase 1 - 領収書データベーススキーマ

## テスト要件

- パフォーマンス: 10,000+領収書でテスト
- フィルター精度: 全フィルター組み合わせの動作を検証

## 見積もり

2ストーリーポイント

## 優先度

高 - 領収書管理のコア機能
