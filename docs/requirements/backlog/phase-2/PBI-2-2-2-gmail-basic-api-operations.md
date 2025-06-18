# PBI-2-2-2: Gmail Basic API Operations

## Description

Implement core Gmail API operations for searching, filtering, and retrieving email messages. This provides the
foundation for identifying and accessing receipt emails through configurable search criteria.

## Implementation Details

### Files to Create/Modify

1. `src/lib/gmail/operations.ts` - Gmail API operation implementations
2. `src/lib/gmail/filters.ts` - Email filtering and search logic
3. `src/lib/gmail/types.ts` - Gmail-specific TypeScript types
4. `src/lib/gmail/utils.ts` - Gmail utility functions
5. `src/pages/api/gmail/search.ts` - Email search API endpoint
6. `docs/gmail/api-operations.md` - Gmail operations documentation

### Technical Requirements

- Implement Gmail search with configurable filters
- Support pagination for large email result sets
- Handle Gmail API rate limiting with exponential backoff
- Parse email headers and metadata efficiently
- Support multiple email formats (HTML, plain text)

### Gmail Search Operations

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
      userId: 'me',
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
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    return this.parseEmailMessage(response.data);
  }

  async getEmailAttachments(messageId: string): Promise<EmailAttachment[]> {
    const message = await this.getEmailDetails(messageId);
    const attachments: EmailAttachment[] = [];

    for (const part of this.findAttachmentParts(message.payload)) {
      if (part.body?.attachmentId) {
        const attachment = await this.client.users.messages.attachments.get({
          userId: 'me',
          messageId: messageId,
          id: part.body.attachmentId,
        });

        attachments.push({
          filename: part.filename || 'attachment',
          mimeType: part.mimeType || 'application/octet-stream',
          size: part.body.size || 0,
          data: attachment.data.data || '',
        });
      }
    }

    return attachments;
  }
}
```

### Email Filtering Logic

```typescript
export function buildGmailQuery(filter: EmailFilter): string {
  const queryParts: string[] = [];

  if (filter.senders?.length) {
    const senderQuery = filter.senders.map(sender => `from:${sender}`).join(' OR ');
    queryParts.push(`(${senderQuery})`);
  }

  if (filter.subjects?.length) {
    const subjectQuery = filter.subjects.map(subject => `subject:"${subject}"`).join(' OR ');
    queryParts.push(`(${subjectQuery})`);
  }

  if (filter.dateRange?.after) {
    queryParts.push(`after:${formatGmailDate(filter.dateRange.after)}`);
  }

  if (filter.dateRange?.before) {
    queryParts.push(`before:${formatGmailDate(filter.dateRange.before)}`);
  }

  if (filter.hasAttachment) {
    queryParts.push('has:attachment');
  }

  if (filter.labels?.length) {
    filter.labels.forEach(label => queryParts.push(`label:${label}`));
  }

  return queryParts.join(' ');
}

// Predefined receipt filters
export const RECEIPT_FILTERS = {
  apple: {
    senders: ['no_reply@email.apple.com', 'noreply@email.apple.com'],
    subjects: ['Your receipt from Apple'],
  },
  subscription: {
    subjects: ['receipt', 'invoice', 'billing'],
    hasAttachment: true,
  },
  ecommerce: {
    subjects: ['order confirmation', 'purchase receipt', 'transaction complete'],
  },
} as const;
```

### API Endpoints

```typescript
// GET /api/gmail/search?filter=apple&page=1
interface SearchEmailsRequest {
  filter: keyof typeof RECEIPT_FILTERS | 'custom';
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

### Code Patterns to Follow

- Use async/await for all Gmail API calls
- Implement proper error handling for API failures
- Cache expensive operations where appropriate
- Use TypeScript for strong typing of Gmail responses

### Interface Specifications

- **Input Interfaces**: Requires Gmail client from PBI-2-2-1
- **Output Interfaces**: Provides email data for processing PBIs

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
    data: string; // base64 encoded
  }
  ```

## Metadata

- **Status**: Not Started
- **Actual Story Points**: [To be filled after completion]
- **Created**: 2025-06-04
- **Started**: [Date]
- **Completed**: [Date]
- **Owner**: [AI Assistant ID or Human]
- **Reviewer**: [Who reviewed this PBI]
- **Implementation Notes**: [Post-completion learnings]

## Acceptance Criteria

- [ ] Email search with predefined filters works correctly
- [ ] Custom email filters can be applied successfully
- [ ] Email details and metadata are retrieved accurately
- [ ] Email attachments are downloaded and accessible
- [ ] Pagination handles large result sets properly
- [ ] Gmail API rate limits are respected with proper backoff

### Verification Commands

```bash
# Test Gmail search operations
npm run test:gmail -- --grep "search operations"
# Test email retrieval
curl "http://localhost:3000/api/gmail/search?filter=apple"
# Test attachment download
npm run test:integration -- gmail-attachments
```

## Dependencies

- **Required**: PBI-2-2-1 - Gmail OAuth must be configured
- **Required**: PBI-2-1-3 - Observability for API monitoring

## Testing Requirements

- Unit tests: Test search query building and email parsing
- Integration tests: Test actual Gmail API operations with test account
- Test data: Sample Gmail API responses for different email types

## Estimate

1 story point

## Priority

High - Basic operations needed before business logic integration

## Implementation Notes

- Use googleapis npm package for type-safe Gmail API access
- Implement proper base64 decoding for attachment data
- Add comprehensive error handling for different Gmail API error codes
- Consider implementing email caching for frequently accessed messages
- Test with various email formats and attachment types
- Respect Gmail API quotas and implement appropriate rate limiting
