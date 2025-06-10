# PBI-2-1-1: OpenAPI定義の作成

## 説明

freee領収書自動化システムのすべてのAPIエンドポイントに対する包括的なOpenAPI 3.0仕様を作成します。
これにより、フロントエンドとバックエンド間の明確な契約を確立し、実装開始前に型安全な開発と
自動テストを可能にします。

## 実装詳細

### 作成/修正するファイル

1. `docs/api/openapi.yaml` - メインOpenAPI仕様
2. `docs/api/schemas/` - 再利用可能なスキーマ定義
3. `src/types/api/generated.ts` - 生成されたTypeScript型
4. `scripts/generate-api-types.sh` - 型生成スクリプト
5. `docs/api/endpoints.md` - APIエンドポイントドキュメント

### 技術要件

- OpenAPI 3.0.3仕様を使用
- 領収書処理のすべてのREST APIエンドポイントを定義
- バリデーションルールを含むリクエスト/レスポンススキーマを含める
- エラーレスポンスとステータスコードを文書化
- JSONとmultipart/form-dataコンテンツタイプをサポート

### 定義するAPIエンドポイント

```yaml
# 領収書管理
POST /api/receipts/upload - 領収書ファイルのアップロード
GET /api/receipts - ユーザーの領収書一覧
GET /api/receipts/{id} - 領収書詳細の取得
PUT /api/receipts/{id} - 領収書メタデータの更新
DELETE /api/receipts/{id} - 領収書の削除

# OCR処理
POST /api/ocr/process - 領収書OCRの処理
GET /api/ocr/status/{jobId} - OCRステータスの確認

# 取引管理
GET /api/transactions - 取引一覧
POST /api/transactions/sync - freee APIとの同期
PUT /api/transactions/{id}/match - 領収書とのマッチング

# メール処理
POST /api/email/scan - メールスキャンの実行
GET /api/email/receipts - メール領収書の一覧

# ユーザー設定
GET /api/user/settings - ユーザー設定の取得
PUT /api/user/settings - ユーザー設定の更新
```

### スキーマ定義

```yaml
components:
  schemas:
    Receipt:
      type: object
      required: [id, user_id, file_name, status]
      properties:
        id: { type: string, format: uuid }
        user_id: { type: string, format: uuid }
        file_name: { type: string, maxLength: 255 }
        file_path: { type: string }
        file_size: { type: integer, minimum: 0 }
        ocr_text: { type: string }
        status: { type: string, enum: [pending, processing, completed, failed] }
        created_at: { type: string, format: date-time }

    Transaction:
      type: object
      required: [id, amount, date, description]
      properties:
        id: { type: string, format: uuid }
        freee_transaction_id: { type: string }
        amount: { type: number, format: decimal }
        date: { type: string, format: date }
        description: { type: string }
        matching_status:
          {
            type: string,
            enum: [unmatched, auto_matched, manual_matched, rejected],
          }
```

### 従うべきコードパターン

- 一貫した命名規則を使用（プロパティにはcamelCase）
- 包括的な例の値を含める
- 各エンドポイントに適切なHTTPステータスコードを定義
- ポリモーフィック型にはdiscriminatorを使用

### インターフェース仕様

- **入力インターフェース**: なし（基礎タスク）
- **出力インターフェース**: すべての他のPBIにAPIコントラクトを提供

  ```typescript
  // OpenAPI仕様から生成
  export interface Receipt {
    id: string;
    user_id: string;
    file_name: string;
    status: "pending" | "processing" | "completed" | "failed";
    created_at: string;
  }

  export interface UploadReceiptRequest {
    file: File;
    metadata?: Record<string, any>;
  }
  ```

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-06-04
- **開始日**: [日付]
- **完了日**: [日付]
- **所有者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]

## 受け入れ基準

- [ ] OpenAPI 3.0仕様が完全で有効である
- [ ] すべてのAPIエンドポイントが例とともに文書化されている
- [ ] TypeScript型が正常に生成される
- [ ] APIドキュメントがアクセス可能で読みやすい
- [ ] スキーマ検証ルールが包括的である
- [ ] エラーレスポンスが適切に文書化されている

### 検証コマンド

```bash
# OpenAPI仕様の検証
npx swagger-codegen validate -i docs/api/openapi.yaml
# TypeScript型の生成
npm run generate:api-types
# APIドキュメントのビルド
npx redoc-cli build docs/api/openapi.yaml --output docs/api/index.html
```

## 依存関係

- **必須**: PBI-1-1-1 - 基本的なプロジェクト構造が存在している必要がある

## テスト要件

- ユニットテスト: 生成されたTypeScript型のコンパイルをテスト
- 統合テスト: モックサーバーに対してAPI仕様を検証
- テストデータ: サンプルリクエスト/レスポンスの例

## 見積もり

1ストーリーポイント

## 優先度

高 - エンドポイント実装前にAPIコントラクトが必要

## 実装メモ

- 仕様開発にはSwagger Editorなどのツールを使用
- クライアントSDK生成にはOpenAPI Generatorの使用を検討
- API進化のためのバージョニング戦略を含める
- 各エンドポイントの認証要件を文書化
