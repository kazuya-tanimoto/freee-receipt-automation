# PBI-5-1-2: 修正データ収集API

## 説明

手動マッチング調整からのユーザー修正データを収集するためのServer
ActionsとAPI層を実装します。これにはデータ検証、保存、基本的な分析収集メカニズムが含まれます。

## 実装詳細

### 作成/変更するファイル

1. `src/app/actions/corrections.ts` - 修正データ用Server Actions
2. `src/lib/corrections/collector.ts` - 修正データ収集サービス
3. `src/lib/corrections/validator.ts` - 入力検証とサニタイゼーション
4. `src/types/corrections.ts` - API型で更新
5. `src/lib/supabase/corrections.ts` - 収集メソッドで更新

### 技術要件

- 安全なデータ収集にNext.js Server Actionsを使用
- 入力検証とサニタイゼーションを実装
- レート制限: ユーザーあたり1時間に100修正
- 自動メタデータ収集（タイムスタンプ、ユーザーエージェント）
- エラーハンドリングとログ記録

### APIアーキテクチャ

```typescript
// Server Actions
async function collectCorrection(correctionData: CreateCorrectionData): Promise<UserCorrection>;

async function getCorrectionHistory(userId: string, limit?: number): Promise<UserCorrection[]>;

// 収集サービス
interface CorrectionCollector {
  collect(data: CreateCorrectionData): Promise<UserCorrection>;
  validate(data: CreateCorrectionData): ValidationResult;
  sanitize(data: CreateCorrectionData): CreateCorrectionData;
}
```

### 入力検証

```typescript
interface CreateCorrectionData {
  receiptId: string;
  transactionId?: string;
  correctionType: CorrectionType;
  beforeData: CorrectionData;
  afterData: CorrectionData;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

## 受け入れ基準

- [ ] Server Actionsが修正データを安全に処理する
- [ ] 入力検証が悪意のあるデータを防ぐ
- [ ] レート制限が乱用から保護する
- [ ] 修正が適切なメタデータと共に保存される
- [ ] エラーハンドリングが有用なフィードバックを提供する
- [ ] ユーザーが修正履歴を取得できる

## 依存関係

- **必須**: PBI-5-1-1 (修正データテーブル)
- **必須**: PBI-3-3 (手動調整機能)

## テスト要件

- 単体テスト: 検証とサニタイゼーション関数
- 統合テスト: Server Actionsとデータベース操作
- テストデータ: 様々な修正シナリオ

## 見積もり

1ストーリーポイント

## 優先度

高 - Phase 5学習のコア機能

## 実装ノート

- 堅牢な入力検証にZodを使用
- 適切なエラー境界を実装
- デバッグと分析のための修正ログ
