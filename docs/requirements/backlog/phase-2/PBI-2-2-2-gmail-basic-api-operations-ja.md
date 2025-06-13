# PBI-2-2-2: Gmail基本API操作

## 説明

メールメッセージの検索、フィルタリング、取得のためのコアGmail API操作を実装します。
これにより、構成可能な検索条件を通じて領収書メールを識別およびアクセスするための
基盤を提供します。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/gmail/operations.ts` - Gmail API操作の実装
2. `src/lib/gmail/filters.ts` - メールフィルタリングと検索ロジック
3. `src/lib/gmail/types.ts` - Gmail固有のTypeScript型
4. `src/lib/gmail/utils.ts` - Gmailユーティリティ関数
5. `src/pages/api/gmail/search.ts` - メール検索APIエンドポイント
6. `docs/gmail/api-operations.md` - Gmail操作ドキュメント

### 技術要件

- 構成可能なフィルターでGmail検索を実装
- 大量のメール結果セットのページネーションをサポート
- 指数バックオフでGmail APIレート制限を処理
- メールヘッダーとメタデータを効率的に解析
- 複数のメール形式（HTML、プレーンテキスト）をサポート

### Gmail検索操作

```typescript
export interface GmailSearchOptions {
  query: string;
  maxResults?: number;
  pageToken?: string;
  includeSpamTrash?: boolean;
}

export interface EmailFilter {
  senders?: string[];
  subjects?: string[];
  dateRange?: {
    after?: Date;
    before?: Date;
  };
  hasAttachment?: boolean;
  labels?: string[];
}

export class GmailOperations {
  constructor(private client: gmail_v1.Gmail) {}

  async searchEmails(options: GmailSearchOptions): Promise<EmailSearchResult> {
    const response = await this.client.users.messages.list({
      userId: "me",
      q: options.query,
      maxResults: options.maxResults || 50,
      pageToken: options.pageToken,
    });

    return {
      messages: response.data.messages || [],
      nextPageToken: response.data.nextPageToken,
      resultSizeEstimate: response.data.resultSizeEstimate || 0,
    };
  }

  async getEmailDetails(messageId: string): Promise<EmailDetails> {
    const response = await this.client.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    return this.parseEmailMessage(response.data);
  }

  async getEmailAttachments(messageId: string): Promise<EmailAttachment[]> {
    const message = await this.getEmailDetails(messageId);
    const attachments: EmailAttachment[] = [];

    for (const part of this.findAttachmentParts(message.payload)) {
      if (part.body?.attachmentId) {
        const attachment = await this.client.users.messages.attachments.get({
          userId: "me",
          messageId: messageId,
          id: part.body.attachmentId,
        });

        attachments.push({
          filename: part.filename || "attachment",
          mimeType: part.mimeType || "application/octet-stream",
          size: part.body.size || 0,
          data: attachment.data.data || "",
        });
      }
    }

    return attachments;
  }
}
```

### メールフィルタリングロジック

```typescript
export function buildGmailQuery(filter: EmailFilter): string {
  const queryParts: string[] = [];

  if (filter.senders?.length) {
    const senderQuery = filter.senders
      .map((sender) => `from:${sender}`)
      .join(" OR ");
    queryParts.push(`(${senderQuery})`);
  }

  if (filter.subjects?.length) {
    const subjectQuery = filter.subjects
      .map((subject) => `subject:"${subject}"`)
      .join(" OR ");
    queryParts.push(`(${subjectQuery})`);
  }

  if (filter.dateRange?.after) {
    queryParts.push(`after:${formatGmailDate(filter.dateRange.after)}`);
  }

  if (filter.dateRange?.before) {
    queryParts.push(`before:${formatGmailDate(filter.dateRange.before)}`);
  }

  if (filter.hasAttachment) {
    queryParts.push("has:attachment");
  }

  if (filter.labels?.length) {
    filter.labels.forEach((label) => queryParts.push(`label:${label}`));
  }

  return queryParts.join(" ");
}

// 事前定義された領収書フィルター
export const RECEIPT_FILTERS = {
  apple: {
    senders: ["no_reply@email.apple.com", "noreply@email.apple.com"],
    subjects: ["Your receipt from Apple"],
  },
  subscription: {
    subjects: ["receipt", "invoice", "billing"],
    hasAttachment: true,
  },
  ecommerce: {
    subjects: [
      "order confirmation",
      "purchase receipt",
      "transaction complete",
    ],
  },
} as const;
```

### APIエンドポイント

```typescript
// GET /api/gmail/search?filter=apple&page=1
interface SearchEmailsRequest {
  filter: keyof typeof RECEIPT_FILTERS | "custom";
  customFilter?: EmailFilter;
  page?: number;
  limit?: number;
}

interface SearchEmailsResponse {
  emails: EmailSummary[];
  nextPage?: number;
  totalEstimate: number;
}

// GET /api/gmail/email/{messageId}
interface GetEmailResponse {
  email: EmailDetails;
  attachments: EmailAttachment[];
}
```

### 従うべきコードパターン

- すべてのGmail API呼び出しにasync/awaitを使用
- API失敗に対する適切なエラーハンドリングを実装
- 適切な場所で高コストな操作をキャッシュ
- Gmailレスポンスの強い型付けにTypeScriptを使用

### インターフェース仕様

- **入力インターフェース**: PBI-2-2-1からGmailクライアントが必要
- **出力インターフェース**: 処理PBIにメールデータを提供

  ```typescript
  export interface EmailSummary {
    id: string;
    threadId: string;
    subject: string;
    from: string;
    date: Date;
    snippet: string;
    hasAttachment: boolean;
    labels: string[];
  }

  export interface EmailDetails extends EmailSummary {
    to: string[];
    cc: string[];
    bcc: string[];
    body: {
      html?: string;
      text?: string;
    };
    headers: Record<string, string>;
  }

  export interface EmailAttachment {
    filename: string;
    mimeType: string;
    size: number;
    data: string; // base64エンコード
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

- [ ] 事前定義されたフィルターでのメール検索が正しく動作する
- [ ] カスタムメールフィルターが正常に適用できる
- [ ] メールの詳細とメタデータが正確に取得される
- [ ] メール添付ファイルがダウンロードされアクセス可能である
- [ ] ページネーションが大きな結果セットを適切に処理する
- [ ] Gmail APIレート制限が適切なバックオフで遵守される

### 検証コマンド

```bash
# Gmail検索操作のテスト
npm run test:gmail -- --grep "search operations"
# メール取得のテスト
curl "http://localhost:3000/api/gmail/search?filter=apple"
# 添付ファイルダウンロードのテスト
npm run test:integration -- gmail-attachments
```

## 依存関係

- **必須**: PBI-2-2-1 - Gmail OAuthが構成されている必要がある
- **必須**: PBI-2-1-3 - API監視用のオブザーバビリティ

## テスト要件

- ユニットテスト: 検索クエリ構築とメール解析をテスト
- 統合テスト: テストアカウントで実際のGmail API操作をテスト
- テストデータ: 異なるメールタイプ用のサンプルGmail APIレスポンス

## 見積もり

1ストーリーポイント

## 優先度

高 - ビジネスロジック統合前に基本操作が必要

## 実装メモ

- 型安全なGmail APIアクセスにgoogleapis npmパッケージを使用
- 添付ファイルデータの適切なbase64デコーディングを実装
- 異なるGmail APIエラーコードの包括的なエラーハンドリングを追加
- 頻繁にアクセスされるメッセージのメールキャッシングの実装を検討
- 様々なメール形式と添付ファイルタイプでテスト
- Gmail APIクォータを尊重し、適切なレート制限を実装
