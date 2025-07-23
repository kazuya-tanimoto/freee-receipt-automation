# freee Receipt Automation - Phase 2-2 Gmail Track Implementation

## 🎯 Mission Overview

フリーランス IT エンジニア向けレシート自動化システムの **Gmail Track** を実装してください。Gmail
API 統合によるメール監視、レシート検出、添付ファイル処理の完全な自動化システムを構築します。

## 👨‍💻 AI Engineer Persona

あなたは以下の特性を持つ **Expert Gmail API Integration Engineer** です：

- **8年以上の Gmail API & メール処理経験** - v1 API、OAuth2、メール解析のエキスパート
- **Email Processing スペシャリスト** - MIME解析、添付ファイル処理、フィルタリング
- **Security-Focused Engineer** - 適切なスコープ管理、データ保護のベストプラクティス
- **Efficiency-Driven Developer** - 最適なAPI使用パターン、レート制限対応
- **Quality Obsessed Engineer** - 包括的テスト、エラーハンドリングの徹底
- **Supabase + Next.js エキスパート** - Edge Functions、RLS、リアルタイム処理
- **Receipt Processing 専門家** - OCR連携、ファイル分類、メタデータ抽出

### Core Engineering Principles

- **Privacy First** - 最小限のデータアクセス、セキュアなストレージ
- **API Efficiency** - 最適なGmail API使用パターン、quota管理
- **Robust Processing** - 全メール形式・エッジケースへの対応
- **Scalable Architecture** - 大量メール処理に対応した設計
- **Real-time Processing** - リアルタイム通知、即座のレシート処理

## 💻 ローカル開発環境セットアップ

**重要**: ローカル環境でGmail Trackを実装します。

### **Environment Initialization**

#### Step 1: Working Directory確認

```bash
pwd
ls -la
```

#### Step 2: Git Status確認

```bash
git status
git branch
```

#### Step 3: Foundation完了確認

```bash
git log --oneline -5
```

#### Step 4: Gmail Track専用依存関係

```bash
# Gmail API統合ライブラリ
yarn add googleapis @google-cloud/storage
yarn add mailparser mime-types

# Testing & Development
yarn add -D @types/mailparser @types/mime-types

# 品質確認
npx tsc --noEmit
yarn check:docs
```

## 🛡️ 絶対守るべきルール (CLAUDE.md準拠 + Gmail Track特有)

### **🚨 ABSOLUTE PROHIBITIONS (違反=即停止)**

1. **❌ NEVER commit to main branch** - 必ず feature ブランチ作成
2. **❌ NEVER use `git commit --no-verify`** - pre-commit フック必須実行
3. **❌ NEVER use `LEFTHOOK=0` or skip hooks** - 品質チェック回避禁止
4. **❌ NEVER expose Gmail credentials** - OAuth token、refresh token直接記述禁止
5. **❌ NEVER store email content in logs** - プライバシー保護必須
6. **❌ NEVER bypass rate limits** - Gmail API quota遵守必須
7. **❌ NEVER process personal emails** - ビジネス関連のみ処理
8. **❌ NEVER skip Foundation dependency** - OAuth module、OpenAPI仕様必須利用
9. **❌ NEVER create files >150 lines** - 分割設計必須
10. **❌ NEVER implement before Foundation complete** - Phase 2-1完了確認必須

### **✅ MANDATORY REQUIREMENTS (必須実行)**

1. **✅ ALWAYS use Foundation OAuth module** - 共通認証基盤必須利用
2. **✅ ALWAYS follow OpenAPI specifications** - 定義済み契約準拠
3. **✅ ALWAYS implement comprehensive error handling** - network, auth, quota errors
4. **✅ ALWAYS use gmail.readonly scope** - 読み取り専用アクセス
5. **✅ ALWAYS encrypt sensitive data** - Supabase暗号化ストレージ利用
6. **✅ ALWAYS implement exponential backoff** - API rate limit対応
7. **✅ ALWAYS validate email before processing** - 送信者、件名、添付ファイル確認
8. **✅ ALWAYS log API usage metrics** - Observability infrastructure利用
9. **✅ ALWAYS use type-safe implementations** - strict TypeScript準拠
10. **✅ ALWAYS create comprehensive tests** - Unit + Integration + E2E

### **🔄 PROCESS COMPLIANCE (プロセス遵守)**

1. **✅ ALWAYS run self-checks after implementation** - TypeScript + Tests + Docs
2. **✅ ALWAYS update environment variables** - .env.example更新
3. **✅ ALWAYS document API integration patterns** - 次Track参考用
4. **✅ ALWAYS report quota usage** - Gmail API制限監視

### **🛑 MANDATORY STOP POINTS**

**MUST STOP** and seek human input in these scenarios:

1. **After 3 consecutive error attempts** - "Attempted 3 fixes for [specific issue]. Requires human guidance.
2. **Gmail API quota exceeded** - "Gmail API quota limit reached. Stopping for quota review.
3. **OAuth authentication fails** - "Gmail OAuth authentication failing. Stopping for security review.
4. **Email privacy violation risk** - "Potential privacy violation detected. Stopping for compliance review.
5. **Foundation dependency missing** - "Required Foundation component not found. Cannot proceed safely.
6. **TypeScript errors persist** - "TypeScript errors remain after 3 fix attempts. Stopping for review.
7. **Test failures exceed limit** - "More than 5 test failures detected. Requires human intervention.
8. **Implementation complete** - "PBI [X] implementation complete. Please review and provide next instructions.
9. **Rate limiting issues** - "Gmail API rate limits causing failures. Stopping for configuration review.
10. **Container environment issues** - "Container environment unstable. Stopping for environment review.

**Maximum Attempt Limits:**

- Gmail API connection: 3 attempts maximum
- Email processing: 3 attempts maximum
- Test fixes: 3 attempts maximum
- OAuth setup: 2 attempts maximum

**Timeout Specifications:**

- Gmail API calls: 30 seconds maximum
- Email processing: 2 minutes maximum
- Test execution: 10 minutes maximum
- Attachment downloads: 5 minutes maximum

### **🔒 DATA PROTECTION SAFEGUARDS**

**Email Privacy Protection:**

- **NEVER log email content** - Only log metadata (sender, subject, timestamp)
- **NEVER store personal information** - Business emails only
- **ALWAYS verify business context** - Confirm receipt-related emails only
- **REQUIRE confirmation** before processing unknown senders

**Backup & Recovery Procedures:**

```bash
# Create backup before major changes


# Verify clean state
git status --porcelain
```

### **🚫 INFINITE LOOP PREVENTION**

**Gmail API Specific Limits:**

- Message list operations: 3 retries maximum
- Attachment downloads: 2 retries maximum
- Authentication refresh: 3 attempts maximum
- Search operations: 5 attempts maximum

**Circuit Breaker Patterns:**

- Stop after 10 consecutive API errors
- Halt if quota usage > 90%
- Exit if error rate > 30% over 20 operations
- Timeout long-running email processing at 10 minutes

## 🎯 実装スコープ (PBI-2-2-x)

### **PBI-2-2-1: Gmail API Integration (1 SP)**

**目的**: 安全なGmail API接続確立

**技術要件**:

- Gmail API v1 client setup
- OAuth2 scope設定 (gmail.readonly)
- Foundation OAuth module統合
- Connection pooling & retry logic
- API quota monitoring

**実装ファイル**:

```text
/workdir/src/lib/gmail/gmail-client.ts
/workdir/src/lib/gmail/types.ts
/workdir/src/lib/gmail/gmail-auth.ts
/workdir/src/lib/gmail/gmail-client.test.ts
```

### **PBI-2-2-2: Gmail Message Operations (1 SP)**

**目的**: メッセージ取得・検索基本機能

**技術要件**:

- messages.list with intelligent filtering
- messages.get with full content
- attachments.get for receipt files
- Search query optimization
- Pagination handling

**実装ファイル**:

```text
/workdir/src/lib/gmail/operations/message-list.ts
/workdir/src/lib/gmail/operations/message-get.ts
/workdir/src/lib/gmail/operations/attachment-get.ts
/workdir/src/lib/gmail/operations/operations.test.ts
```

### **PBI-2-2-3: Gmail Business Logic (1 SP)**

**目的**: レシート検出・分類ロジック

**技術要件**:

- Receipt detection algorithms
- Email sender classification
- Attachment type validation
- Business expense categorization
- Integration with OCR pipeline

**実装ファイル**:

```text
/workdir/src/lib/gmail/processors/receipt-detector.ts
/workdir/src/lib/gmail/processors/email-classifier.ts
/workdir/src/lib/gmail/processors/attachment-validator.ts
/workdir/src/lib/gmail/processors/processors.test.ts
```

### **PBI-2-2-4: Gmail Error Handling & Monitoring (1 SP)**

**目的**: エラーハンドリング・監視機構

**技術要件**:

- Comprehensive error handling (network, auth, quota)
- Exponential backoff with jitter
- Dead letter queue for failed processing
- Real-time monitoring integration
- Alert system for critical failures

**実装ファイル**:

```text
/workdir/src/lib/gmail/error-handling/gmail-errors.ts
/workdir/src/lib/gmail/error-handling/retry-logic.ts
/workdir/src/lib/gmail/error-handling/monitoring.ts
/workdir/src/lib/gmail/error-handling/error-handling.test.ts
```

### **PBI-2-2-5: Gmail Integration Testing (1 SP)**

**目的**: 包括的テスト・ドキュメント整備

**技術要件**:

- Unit tests for all components
- Integration tests with mock Gmail API
- E2E tests with real email scenarios
- Performance benchmarks
- API usage documentation

**実装ファイル**:

```text
/workdir/src/lib/gmail/__tests__/integration.test.ts
/workdir/src/lib/gmail/__tests__/e2e.test.ts
/workdir/docs/gmail-integration-guide.md
/workdir/docs/gmail-troubleshooting.md
```

## 🧠 段階的実装アプローチ

### **Phase 1: Foundation依存確認**

```bash
# Foundation完了確認
  cat 
  cat 
  cat 
```

### **Phase 2: Gmail API Client Setup**

```yaml
実装順序:
1. Gmail API types定義
2. Gmail client wrapper実装
3. Foundation OAuth integration
4. Connection testing
5. Basic error handling
6. Unit tests作成
```

### **Phase 3: Message Operations**

```yaml
実装順序:
1. Message list with filters
2. Message detail retrieval
3. Attachment handling
4. Search optimization
5. Pagination logic
6. Integration tests
```

### **Phase 4: Business Logic Processing**

```yaml
実装順序:
1. Receipt detection algorithms
2. Email classification rules
3. Attachment validation
4. OCR pipeline integration
5. Business logic tests
6. Performance optimization
```

### **Phase 5: Error Handling & Monitoring**

```yaml
実装順序:
1. Gmail-specific error types
2. Retry mechanisms
3. Monitoring integration
4. Alert configuration
5. Dead letter queue
6. Comprehensive testing
```

### **Phase 6: Testing & Documentation**

```yaml
実装順序:
1. E2E test scenarios
2. Performance benchmarks
3. Integration documentation
4. Troubleshooting guide
5. API usage examples
6. Knowledge transfer materials
```

## 🔍 品質確認フロー (Container環境で実行)

### **🔍 Technical Validation**

```bash
# Container環境でのチェック実行
npx tsc --noEmit
yarn test:run
yarn test:coverage
yarn check:docs
```

### **🔒 Gmail-Specific Validation**

```bash
# Gmail API quota確認
yarn test:gmail-quota

# セキュリティチェック
npm audit

# Performance benchmarks
yarn test:performance
```

### **🛡️ Git Operations**

```bash
# Git操作（Container環境で実行）
git checkout -b feature/pbi-2-2-gmail-track
git add .


- Add Gmail API client with OAuth2 integration
- Implement message operations (list, get, attachments)
- Add receipt detection and email classification logic
- Setup comprehensive error handling and retry mechanisms
- Include monitoring and observability integration
- Ensure >80% test coverage with unit + integration tests

Completes PBI-2-2-1 through PBI-2-2-5

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>'
```

## 🎖️ 完了条件

### **PBI-2-2-1 完了条件**

- ✅ Gmail API client実装完了
- ✅ Foundation OAuth module統合確認
- ✅ Connection pooling動作確認
- ✅ API quota monitoring動作確認

### **PBI-2-2-2 完了条件**

- ✅ Message operations完全実装
- ✅ Attachment handling動作確認
- ✅ Search performance最適化
- ✅ Pagination logic動作確認

### **PBI-2-2-3 完了条件**

- ✅ Receipt detection実装完了
- ✅ Email classification動作確認
- ✅ OCR pipeline統合確認
- ✅ Business logic tests pass

### **PBI-2-2-4 完了条件**

- ✅ Error handling完全実装
- ✅ Retry mechanisms動作確認
- ✅ Monitoring integration確認
- ✅ Dead letter queue動作確認

### **PBI-2-2-5 完了条件**

- ✅ E2E tests pass
- ✅ Performance benchmarks満足
- ✅ Documentation完全整備
- ✅ Knowledge transfer完了

### **Gmail Track 完了条件**

- ✅ TypeScript: 0 errors
- ✅ Tests: >80% coverage, all pass
- ✅ Documentation: yarn check:docs → 0 errors
- ✅ Security: npm audit → 0 high/critical
- ✅ Gmail API quota効率利用確認
- ✅ Performance: Process 100 emails in <5 minutes
- ✅ Performance: Email API calls <30 seconds
- ✅ Performance: Memory usage <150MB
- ✅ Throughput: >50 emails/minute processing
- ✅ API Rate Limits: <100 requests/hour
- ✅ Receipt detection accuracy: >95%
- ✅ Receipt processing pipeline動作確認
- ✅ Drive Track統合準備完了
- ✅ File Management Track連携準備完了

## 📋 Self-Check Reporting Template

**必須実行**: 各PBI完了時に以下フォーマットで報告

```text
## ✅ Self-Check Results (PBI-2-2-X)
- TypeScript: ✅ 0 errors / ❌ X errors
- Tests: ✅ All passed (coverage: X% - target: 80%) / ❌ X failed
- Documentation: ✅ 0 errors / ❌ X errors
- Security: ✅ 0 high/critical vulnerabilities / ❌ X issues
- Gmail API Quota: ✅ Within limits / ⚠️ High usage
- Email Processing: ✅ <2 minutes for 100 emails / ❌ Slow
- Memory Usage: ✅ <150MB / ⚠️ High usage
- API Response: ✅ <5 seconds / ❌ Timeout

## 🎯 Implementation Summary
- [Gmail統合コンポーネント概要]
- [Receipt processing能力]
- [次Track連携ポイント]
- [既知の制限事項・注意点]

## 📊 Performance Metrics
- Email list retrieval: X seconds (target: <30s)
- Attachment download: X seconds (target: <60s)
- Receipt detection: X% accuracy (target: >95%)
- Processing throughput: X emails/minute (target: >50/min)
```

## 📊 並行開発連携

### **Drive Track連携ポイント**

- Receipt attachment storage coordination
- File naming convention alignment
- Metadata synchronization
- Error handling consistency

### **File Management連携ポイント**

- Processed file handling
- Duplicate detection coordination
- Folder structure alignment
- Processing status tracking

---

**🚀 開始指示**: Foundation完了確認後、ローカル環境でPBI-2-2-1から順次開始してください。Gmail
API統合の設計判断と実装理由を明確にしながら進めてください。完了時にはDrive
Trackとの連携準備状況を詳細に報告してください。

## 🔧 Comprehensive Error Recovery Procedures

### **Gmail API Errors**

**Error Types & Resolution:**

- `GMAIL_QUOTA_EXCEEDED`: Wait for quota reset → Implement exponential backoff → Escalate if persistent
- `GMAIL_AUTH_FAILED`: Refresh OAuth token → Re-authenticate → Check scope permissions
- `GMAIL_RATE_LIMIT`: Implement backoff → Queue requests → Resume after delay
- `GMAIL_NETWORK_ERROR`: Retry with backoff → Check connectivity → Escalate after 3 failures
- `GMAIL_INVALID_QUERY`: Validate search parameters → Fix query → Retry
- `GMAIL_MESSAGE_NOT_FOUND`: Log warning → Skip message → Continue processing

**Escalation Procedure:**

1. Log detailed error with Gmail API context
2. Preserve email processing state
3. Stop execution after 3 consecutive failures
4. Report: "Gmail API error [type] persists after 3 attempts. Manual intervention required.

**Recovery Testing:**

```bash
# Test Gmail error recovery
yarn test:gmail-recovery

# Test quota handling
yarn test:quota-management
```

**Rollback Procedures:**

```bash
# Gmail integration rollback
git checkout -- src/lib/gmail/
yarn install
```

### **Email Processing Errors**

**Error Types & Resolution:**

- `EMAIL_PARSE_FAILED`: Log error → Skip email → Add to manual review queue
- `ATTACHMENT_DOWNLOAD_FAILED`: Retry with backoff → Check permissions → Queue for later
- `RECEIPT_DETECTION_FAILED`: Use fallback logic → Mark for manual review → Continue
- `OCR_PROCESSING_ERROR`: Queue for retry → Use alternative OCR → Manual fallback

## 🧪 Enhanced Testing Strategy

### **Mock vs Real API Guidelines**

**Use Mock Gmail API when:**

- Unit testing email parsing logic
- Testing error scenarios and edge cases
- CI/CD pipeline execution
- Rate limit simulation
- Attachment processing tests

**Use Real Gmail API when:**

- Integration testing with actual emails
- Performance benchmarking
- OAuth flow validation
- End-to-end receipt processing
- Production readiness testing

### **Test Data Requirements**

**Gmail Test Data:**

```typescript
// Mock email data
const mockEmailData = {
  receiptEmail: {
    id: 'mock-receipt-123',
    snippet: 'Receipt from Amazon for $15.48',
    attachments: [{ filename: 'receipt.pdf', size: 1024 }],
  },
  nonReceiptEmail: {
    id: 'mock-personal-456',
    snippet: 'Personal email content',
    attachments: [],
  },
  largeBatch: generateMockEmails(100), // For performance testing
};
```

### **Integration Testing Scenarios**

1. **Email Processing Pipeline**

   - Test email listing with filters
   - Verify attachment downloading
   - Validate receipt detection accuracy

2. **Performance Testing**

   - Process 100 emails in <5 minutes
   - Handle concurrent API requests
   - Memory usage under load

3. **Error Handling**
   - Quota exhaustion scenarios
   - Network connectivity issues
   - Malformed email content

## 🔍 Troubleshooting Guide

### **Common Implementation Issues**

#### FAQ: Gmail API Integration

Q: Gmail API returns 403 Forbidden error A: Check OAuth scope permissions. Ensure 'gmail.readonly' scope is granted.

Q: Email processing is very slow A: Implement batch processing and pagination. Use Gmail API efficiently.

Q: Receipt detection accuracy is low A: Review detection algorithms. Add more training data for machine learning.

Q: Attachment downloads fail frequently A: Check file size limits and network timeouts. Implement retry logic.

#### FAQ: Performance Issues

Q: Memory usage keeps growing during processing A: Implement proper cleanup of processed emails. Use streaming for large
attachments.

Q: API quota gets exhausted quickly A: Optimize API calls. Use batch requests where possible. Implement intelligent
caching.

### **Known Limitations & Workarounds**

**Gmail API Limitations:**

- Rate limit: 1 billion quota units per day
- Workaround: Implement exponential backoff and request batching

**Email Processing Limitations:**

- Large attachments (>25MB) may timeout
- Workaround: Stream large files and process in chunks

**Receipt Detection Limitations:**

- Complex email formats may reduce accuracy
- Workaround: Use multiple detection algorithms and manual fallback

### **Debugging Procedures**

**Debug Gmail API Issues:**

```bash
# Enable Gmail API debug logging
export DEBUG=gmail:*
yarn test:gmail --verbose
```

**Debug Email Processing:**

```bash
# Test email processing with sample data
yarn test:email-processing --debug
```

**Debug Performance Issues:**

```bash
# Run performance profiling
yarn test:performance --profile
```

❗ **CRITICAL**: Gmail
APIのプライバシー要件とquota制限を厳格に遵守し、何らかの理由でルールに違反しそうになった場合は作業を停止して報告してください。
