# PBI-5-1-1: ユーザー修正データテーブル作成

## 説明

レシート-取引マッチングの手動調整からのユーザー修正データを保存するための
データベーステーブルと型を作成します。これにはスキーマ設計、RLSポリシー、
基本的なTypeScript型定義が含まれます。

## 実装詳細

### 作成/変更するファイル

1. `supabase/migrations/0005_create_correction_tables.sql` - データベーススキーママイグレーション
2. `src/types/corrections.ts` - 修正データ用TypeScript型
3. `src/lib/supabase/corrections.ts` - 修正データアクセス層
4. `src/types/supabase.ts` - 新しいテーブル型で更新
5. `docs/database/correction-schema.md` - ドキュメント

### 技術要件

- 適切なインデックス付きで`user_corrections`テーブルを作成
- Row Level Security (RLS) ポリシーを実装
- 修正前後データのJSON保存をサポート
- メタデータフィールド（タイムスタンプ、ユーザー、信頼度）を含める
- 全テーブルでUUID主キーを使用

### データベーススキーマ

```sql
CREATE TABLE user_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  correction_type TEXT NOT NULL CHECK (correction_type IN ('date', 'amount', 'vendor', 'category', 'unmatch')),
  before_data JSONB NOT NULL,
  after_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TypeScript型

```typescript
interface UserCorrection {
  id: string;
  userId: string;
  receiptId: string;
  transactionId: string | null;
  correctionType: CorrectionType;
  beforeData: CorrectionData;
  afterData: CorrectionData;
  confidenceScore?: number;
  createdAt: string;
}

type CorrectionType = "date" | "amount" | "vendor" | "category" | "unmatch";
```

## 受け入れ基準

- [ ] データベースマイグレーションで修正テーブルが正常に作成される
- [ ] RLSポリシーがユーザー自身の修正のみへのアクセスを制限する
- [ ] TypeScript型が適切に定義・エクスポートされる
- [ ] マイグレーションがクリーンにロールバック可能
- [ ] クエリ最適化のためのデータベースインデックスが作成される
- [ ] ドキュメントにスキーマ図が含まれる

## 依存関係

- **必須**: PBI-1-1-2 (コアテーブル作成)
- **必須**: PBI-3-3 (手動調整機能)

## テスト要件

- 単体テスト: TypeScript型検証
- 統合テスト: データベースマイグレーションとロールバック
- テストデータ: サンプル修正レコード

## 見積もり

1ストーリーポイント

## 優先度

中 - Phase 5学習機能の基盤

## 実装ノート

- 柔軟な修正データ保存のためJSONBを使用
- パフォーマンスのためuser_idとcreated_atにインデックス
- プライバシーのためのデータ保持ポリシーを検討
