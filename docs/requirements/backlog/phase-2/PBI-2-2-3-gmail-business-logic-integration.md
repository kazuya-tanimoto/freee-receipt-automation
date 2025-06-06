# PBI-2-2-3: Gmail Business Logic Integration

## Description
Integrate Gmail operations with the receipt processing pipeline. This includes processing email attachments, converting HTML receipts to PDF, saving files to storage, and triggering OCR processing for extracted receipts.

## Implementation Details

### Files to Create/Modify
1. `src/lib/gmail/processor.ts` - Main email processing orchestrator
2. `src/lib/gmail/attachment-handler.ts` - Attachment processing logic
3. `src/lib/gmail/html-to-pdf.ts` - HTML email to PDF conversion
4. `src/lib/gmail/receipt-detector.ts` - Receipt classification logic
5. `src/pages/api/gmail/process.ts` - Email processing API endpoint
6. `src/services/email-processing.ts` - Background processing service
7. `docs/gmail/business-logic.md` - Business logic documentation

### Technical Requirements
- Process PDF attachments directly for OCR
- Convert HTML email receipts to PDF format
- Implement receipt classification using heuristics
- Save processed files to Supabase Storage
- Trigger OCR processing for saved receipts
- Track processing status in database

### Email Processing Orchestrator
```typescript
export class GmailProcessor {
  constructor(
    private gmailOps: GmailOperations,
    private storageService: StorageService,
    private ocrService: OCRService,
    private logger: Logger
  ) {}
  
  async processReceiptEmails(userId: string, filter: EmailFilter): Promise<ProcessingResult> {
    const span = this.tracer.startSpan('gmail.process_receipt_emails');
    
    try {
      // 1. Search for emails matching receipt criteria
      const query = buildGmailQuery(filter);
      const searchResult = await this.gmailOps.searchEmails({ query, maxResults: 50 });
      
      const results: EmailProcessingResult[] = [];
      
      for (const message of searchResult.messages) {
        const result = await this.processEmailMessage(userId, message.id!);
        results.push(result);
      }
      
      return {
        totalProcessed: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        results
      };
    } finally {
      span.end();
    }
  }
  
  private async processEmailMessage(userId: string, messageId: string): Promise<EmailProcessingResult> {
    try {
      // 1. Get email details
      const email = await this.gmailOps.getEmailDetails(messageId);
      
      // 2. Classify email as receipt
      const isReceipt = await this.classifyAsReceipt(email);
      if (!isReceipt) {
        return { messageId, status: 'skipped', reason: 'Not classified as receipt' };
      }
      
      // 3. Process attachments
      const attachmentResults = await this.processAttachments(userId, messageId, email);
      
      // 4. Process email body if no attachments found
      let bodyResult: FileProcessingResult | null = null;
      if (attachmentResults.length === 0 && this.hasReceiptContent(email)) {
        bodyResult = await this.processEmailBody(userId, email);
      }
      
      // 5. Save processing record
      await this.saveProcessingRecord(userId, messageId, email, attachmentResults, bodyResult);
      
      return {
        messageId,
        status: 'success',
        attachmentsProcessed: attachmentResults.length,
        bodyProcessed: bodyResult !== null
      };
    } catch (error) {
      this.logger.error('Failed to process email', error, { userId, messageId });
      return { messageId, status: 'failed', error: error.message };
    }
  }
}
```

### Attachment Processing
```typescript
export class AttachmentHandler {
  async processAttachments(
    userId: string, 
    messageId: string, 
    email: EmailDetails
  ): Promise<FileProcessingResult[]> {
    const attachments = await this.gmailOps.getEmailAttachments(messageId);
    const results: FileProcessingResult[] = [];
    
    for (const attachment of attachments) {
      if (this.isProcessableAttachment(attachment)) {
        const result = await this.processAttachment(userId, attachment, email);
        results.push(result);
      }
    }
    
    return results;
  }
  
  private async processAttachment(
    userId: string,
    attachment: EmailAttachment,
    email: EmailDetails
  ): Promise<FileProcessingResult> {
    // 1. Generate file path
    const fileName = this.generateFileName(attachment, email);
    const filePath = `receipts/${userId}/${new Date().getFullYear()}/${fileName}`;
    
    // 2. Decode and save to storage
    const fileData = Buffer.from(attachment.data, 'base64');
    const uploadResult = await this.storageService.upload(filePath, fileData, {
      contentType: attachment.mimeType,
      metadata: {
        source: 'gmail',
        messageId: email.id,
        originalName: attachment.filename
      }
    });
    
    // 3. Create receipt record
    const receipt = await this.createReceiptRecord(userId, uploadResult, email);
    
    // 4. Trigger OCR processing
    await this.ocrService.processReceipt(receipt.id);
    
    return {
      fileName,
      filePath,
      receiptId: receipt.id,
      status: 'success'
    };
  }
  
  private isProcessableAttachment(attachment: EmailAttachment): boolean {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    return allowedTypes.includes(attachment.mimeType) && attachment.size > 0;
  }
}
```

### HTML to PDF Conversion
```typescript
export class HtmlToPdfConverter {
  async convertEmailToPdf(email: EmailDetails): Promise<Buffer> {
    if (!email.body.html) {
      throw new Error('Email does not contain HTML content');
    }
    
    // 1. Clean and prepare HTML
    const cleanHtml = this.cleanEmailHtml(email.body.html);
    
    // 2. Generate PDF using puppeteer
    const pdf = await this.generatePdf(cleanHtml, {
      format: 'A4',
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size: 10px; text-align: center;">
        Email Receipt - ${email.subject} - ${email.date.toLocaleDateString()}
      </div>`,
      footerTemplate: '<div style="font-size: 10px; text-align: center;">Page <span class="pageNumber"></span></div>'
    });
    
    return pdf;
  }
  
  private cleanEmailHtml(html: string): string {
    // Remove email client specific elements
    const clean = html
      .replace(/<img[^>]*>/gi, '') // Remove images
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove styles
      .replace(/style="[^"]*"/gi, ''); // Remove inline styles
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            table { border-collapse: collapse; width: 100%; }
            td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>${clean}</body>
      </html>
    `;
  }
}
```

### Receipt Classification
```typescript
export class ReceiptDetector {
  classifyAsReceipt(email: EmailDetails): boolean {
    const receiptIndicators = [
      // Subject line indicators
      /receipt|invoice|billing|payment|order|purchase/i,
      // Sender indicators
      /noreply|no-reply|billing|orders|support/i,
      // Content indicators in body
      /total|amount|tax|subtotal|transaction|confirmation/i
    ];
    
    const subjectMatch = receiptIndicators[0].test(email.subject);
    const senderMatch = receiptIndicators[1].test(email.from);
    const contentMatch = receiptIndicators[2].test(email.body.text || email.body.html || '');
    
    // Require at least 2 indicators for classification
    const score = [subjectMatch, senderMatch, contentMatch].filter(Boolean).length;
    return score >= 2;
  }
}
```

### Code Patterns to Follow
- Use dependency injection for service composition
- Implement proper error handling and rollback mechanisms
- Add comprehensive logging for debugging
- Use database transactions for data consistency

### Interface Specifications
- **Input Interfaces**: Uses Gmail operations from PBI-2-2-2
- **Output Interfaces**: Creates receipt records for OCR processing
  ```typescript
  export interface ProcessingResult {
    totalProcessed: number;
    successful: number;
    failed: number;
    results: EmailProcessingResult[];
  }
  
  export interface EmailProcessingResult {
    messageId: string;
    status: 'success' | 'failed' | 'skipped';
    attachmentsProcessed?: number;
    bodyProcessed?: boolean;
    reason?: string;
    error?: string;
  }
  
  export interface FileProcessingResult {
    fileName: string;
    filePath: string;
    receiptId: string;
    status: 'success' | 'failed';
    error?: string;
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
- [ ] PDF attachments are processed and saved to storage
- [ ] HTML emails are converted to PDF format
- [ ] Receipt classification logic correctly identifies receipts
- [ ] Processing records are saved to database
- [ ] OCR processing is triggered for saved receipts
- [ ] Failed processing is logged with detailed error information

### Verification Commands
```bash
# Test email processing pipeline
npm run test:gmail -- --grep "business logic"
# Test HTML to PDF conversion
npm run test:pdf-conversion
# Process test emails
curl -X POST http://localhost:3000/api/gmail/process -d '{"filter":"apple"}'
```

## Dependencies
- **Required**: PBI-2-2-2 - Gmail basic operations
- **Required**: PBI-1-2-1 - Storage bucket setup
- **Required**: PBI-1-2-3 - OCR service integration

## Testing Requirements
- Unit tests: Test processing logic and classification
- Integration tests: Test end-to-end email processing
- Test data: Sample emails with various attachment types

## Estimate
2 story points

## Priority
High - Core business logic for Gmail receipt processing

## Implementation Notes
- Use puppeteer for HTML to PDF conversion
- Implement proper file cleanup for failed processing
- Add support for different email encoding formats
- Consider implementing duplicate detection for already processed emails
- Test with various email clients and formats (Outlook, Apple Mail, etc.)
- Implement proper MIME type detection for attachments
