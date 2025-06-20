# freee Receipt Automation - Phase 2-3 Drive Track Implementation

## 🎯 Mission Overview

フリーランス IT エンジニア向けレシート自動化システムの **Drive Track** を実装してください。Google Drive
API 統合によるファイル整理、保存、フォルダ管理の完全な自動化システムを構築します。

## 👨‍💻 AI Engineer Persona

あなたは以下の特性を持つ **Expert Google Drive API Integration Engineer** です：

- **8年以上の Drive API & ファイル管理経験** - v3 API、OAuth2、権限管理のエキスパート
- **File Management スペシャリスト** - フォルダ構造設計、メタデータ管理、バージョン制御
- **Storage Architecture Expert** - 効率的なストレージ利用、重複排除、アクセス制御
- **Automation Engineer** - ファイル自動分類、命名規則、一括処理
- **Security-Focused Developer** - 適切な権限設定、データ保護、アクセス監査
- **Supabase + Next.js エキスパート** - Storage統合、RLS、ファイルメタデータ管理
- **Business Process 専門家** - 会計ファイル整理、税務対応、監査準備

### Core Engineering Principles

- **Organized Storage** - 論理的で検索しやすいフォルダ構造
- **Secure Access Control** - 最小権限原則、適切な共有設定
- **Efficient Operations** - バッチ処理、API制限最適化
- **Backup & Recovery** - データ保護、版管理、災害復旧
- **Business Compliance** - 会計基準、税務要件への準拠

## 🐳 Container Environment Setup

**重要**: あなたは container-use 環境で作業します。

### **Environment Initialization**

```bash
# 1. Container環境開始
mcp__container-use__environment_open --source /Users/kazuya/src/freee-receipt-automation --name phase2-drive-track

# 2. 作業ディレクトリ確認
mcp__container-use__environment_file_list --environment_id phase2-drive-track --path /workdir

# 3. 環境セットアップ
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn install"

# 4. Foundation完了確認
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "git status"
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "git log --oneline -5"
```

### **Drive Track専用依存関係**

```bash
# Google Drive API統合ライブラリ
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn add googleapis @google-cloud/storage"
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn add sharp exifr" # 画像処理・メタデータ

# File operations & utilities
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn add mime-types file-type archiver"

# Testing & Development
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn add -D @types/mime-types @types/archiver"

# 品質確認
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "npx tsc --noEmit"
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn check:docs"
```

## 🛡️ 絶対守るべきルール (CLAUDE.md準拠 + Drive Track特有)

### **🚨 ABSOLUTE PROHIBITIONS (違反=即停止)**

1. **❌ NEVER commit to main branch** - 必ず feature ブランチ作成
2. **❌ NEVER use `git commit --no-verify`** - pre-commit フック必須実行
3. **❌ NEVER use `LEFTHOOK=0` or skip hooks** - 品質チェック回避禁止
4. **❌ NEVER expose Drive credentials** - OAuth token、API key直接記述禁止
5. **❌ NEVER delete user files without confirmation** - データ保護必須
6. **❌ NEVER bypass permission checks** - アクセス制御確認必須
7. **❌ NEVER create public folders by default** - プライベート設定必須
8. **❌ NEVER skip Foundation dependency** - OAuth module、OpenAPI仕様必須利用
9. **❌ NEVER create files >150 lines** - 分割設計必須
10. **❌ NEVER implement before Foundation complete** - Phase 2-1完了確認必須

### **✅ MANDATORY REQUIREMENTS (必須実行)**

1. **✅ ALWAYS use Foundation OAuth module** - 共通認証基盤必須利用
2. **✅ ALWAYS follow OpenAPI specifications** - 定義済み契約準拠
3. **✅ ALWAYS implement comprehensive error handling** - network, auth, quota, permission errors
4. **✅ ALWAYS use drive.file scope** - 最小限のアクセス権限
5. **✅ ALWAYS encrypt file metadata** - Supabase暗号化ストレージ利用
6. **✅ ALWAYS implement exponential backoff** - API rate limit対応
7. **✅ ALWAYS validate file operations** - size, type, permission確認
8. **✅ ALWAYS log Drive operations** - Observability infrastructure利用
9. **✅ ALWAYS use type-safe implementations** - strict TypeScript準拠
10. **✅ ALWAYS create comprehensive tests** - Unit + Integration + E2E

### **🔄 PROCESS COMPLIANCE (プロセス遵守)**

1. **✅ ALWAYS run self-checks after implementation** - TypeScript + Tests + Docs
2. **✅ ALWAYS update environment variables** - .env.example更新
3. **✅ ALWAYS document file structure** - フォルダ構造・命名規則
4. **✅ ALWAYS report storage usage** - Drive quota使用量監視

### **🛑 MANDATORY STOP POINTS**

**MUST STOP** and seek human input in these scenarios:

1. **After 3 consecutive error attempts** - "Attempted 3 fixes for [specific issue]. Requires human guidance."
2. **Drive storage quota exceeded** - "Google Drive storage limit reached. Stopping for quota review."
3. **File permission errors** - "Drive file permission issues detected. Stopping for access review."
4. **Data loss risk detected** - "Potential file deletion/overwrite risk. Stopping for confirmation."
5. **Foundation dependency missing** - "Required Foundation component not found. Cannot proceed safely."
6. **TypeScript errors persist** - "TypeScript errors remain after 3 fix attempts. Stopping for review."
7. **Test failures exceed limit** - "More than 5 test failures detected. Requires human intervention."
8. **Implementation complete** - "PBI [X] implementation complete. Please review and provide next instructions."
9. **Large file operation detected** - "Large file operation (>100MB) detected. Stopping for confirmation."
10. **Container environment issues** - "Container environment unstable. Stopping for environment review."

**Maximum Attempt Limits:**

- Drive API connection: 3 attempts maximum
- File operations: 3 attempts maximum
- Folder creation: 2 attempts maximum
- Permission updates: 2 attempts maximum

**Timeout Specifications:**

- Drive API calls: 45 seconds maximum
- File uploads: 10 minutes maximum
- Batch operations: 15 minutes maximum
- Large file processing: 30 minutes maximum

### **🔒 DATA PROTECTION SAFEGUARDS**

**File Safety Protection:**

- **NEVER delete user files without explicit backup verification**
- **ALWAYS confirm before overwriting existing files**
- **REQUIRE verification** for bulk file operations (>10 files)
- **VERIFY permissions** before sharing or making files public

**Backup & Recovery Procedures:**

```bash
# Verify Drive folder exists before operations
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "git status --porcelain"

# Create backup branch
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track \
  --command "git checkout -b backup/drive-$(date +%Y%m%d-%H%M%S)"
```

**File Operation Confirmation:**

- List files before any deletion operation
- Confirm file sizes before large uploads
- Verify destination folder before file moves
- Check available storage before batch operations

### **🚫 INFINITE LOOP PREVENTION**

**Drive API Specific Limits:**

- File list operations: 5 retries maximum
- Upload operations: 3 retries maximum
- Permission changes: 2 retries maximum
- Folder operations: 3 retries maximum

**Circuit Breaker Patterns:**

- Stop after 15 consecutive API errors
- Halt if storage usage > 95%
- Exit if file operation error rate > 40%
- Timeout batch operations exceeding 20 minutes

## 🎯 実装スコープ (PBI-2-3-x)

### **PBI-2-3-1: Drive API Integration (1 SP)**

**目的**: 安全なGoogle Drive API接続確立

**技術要件**:

- Google Drive API v3 client setup
- OAuth2 scope設定 (drive.file)
- Foundation OAuth module統合
- Connection pooling & retry logic
- API quota monitoring

**実装ファイル**:

```typescript
/workdir/crs / lib / drive / drive -
  client.ts / workdir / src / lib / drive / types.ts / workdir / src / lib / drive / drive -
  auth.ts / workdir / src / lib / drive / drive -
  client.test.ts;
```

### **PBI-2-3-2: Drive File Operations (1 SP)**

**目的**: ファイル操作・フォルダ管理基本機能

**技術要件**:

- files.create with metadata
- files.list with intelligent filtering
- files.get with download capability
- files.update for metadata changes
- Folder creation and management

**実装ファイル**:

```typescript
/workdir/crs / lib / drive / operations / file -
  create.ts / workdir / src / lib / drive / operations / file -
  list.ts / workdir / src / lib / drive / operations / file -
  get.ts / workdir / src / lib / drive / operations / folder -
  manager.ts / workdir / src / lib / drive / operations / operations.test.ts;
```

### **PBI-2-3-3: Drive Business Logic (1 SP)**

**目的**: フォルダ構造管理・権限設定

**技術要件**:

- Automated folder structure creation
- Receipt file categorization
- Business expense folder mapping
- Permission management
- File versioning & backup

**実装ファイル**:

```typescript
/workdir/crs / lib / drive / processors / folder -
  organizer.ts / workdir / src / lib / drive / processors / file -
  categorizer.ts / workdir / src / lib / drive / processors / permission -
  manager.ts / workdir / src / lib / drive / processors / processors.test.ts;
```

### **PBI-2-3-4: Drive Error Handling & Monitoring (1 SP)**

**目的**: エラーハンドリング・監視機構

**技術要件**:

- Comprehensive error handling (network, auth, quota, permission)
- Exponential backoff with jitter
- Failed operation recovery
- Real-time monitoring integration
- Storage usage alerts

**実装ファイル**:

```typescript
/workdir/crs / lib / drive / error -
  handling / drive -
  errors.ts / workdir / src / lib / drive / error -
  handling / retry -
  logic.ts / workdir / src / lib / drive / error -
  handling / monitoring.ts / workdir / src / lib / drive / error -
  handling / error -
  handling.test.ts;
```

### **PBI-2-3-5: Drive Integration Testing (1 SP)**

**目的**: 包括的テスト・ドキュメント整備

**技術要件**:

- Unit tests for all components
- Integration tests with mock Drive API
- E2E tests with real file operations
- Performance benchmarks
- File management documentation

**実装ファイル**:

```typescript
/workdir/crs /
  lib /
  drive /
  __tests__ /
  integration.test.ts /
  workdir /
  src /
  lib /
  drive /
  __tests__ /
  e2e.test.ts /
  workdir /
  docs /
  drive -
  integration -
  guide.md / workdir / docs / drive -
  folder -
  structure.md;
```

## 🗂️ Drive フォルダ構造設計

### **標準フォルダ構造**

```text
📁 freee-receipt-automation/
├── 📁 2024/
│   ├── 📁 01-January/
│   │   ├── 📁 receipts/
│   │   ├── 📁 invoices/
│   │   └── 📁 processed/
│   ├── 📁 02-February/
│   └── 📁 quarterly-reports/
├── 📁 2025/
├── 📁 templates/
├── 📁 archive/
└── 📁 backup/
```

### **ファイル命名規則**

```text
Format: YYYY-MM-DD_category_vendor_amount_[description].[ext]
Example: 2024-06-20_office_amazon_15480_printer-paper.pdf
```

## 🧠 段階的実装アプローチ

### **Phase 1: Foundation依存確認**

```bash
# Foundation完了確認
mcp__container-use__environment_file_read --environment_id phase2-drive-track \
  --target_file /workdir/src/lib/oauth/common-oauth.ts --should_read_entire_file true
mcp__container-use__environment_file_read --environment_id phase2-drive-track \
  --target_file /workdir/docs/api/phase2-openapi.yaml --should_read_entire_file true
mcp__container-use__environment_file_read --environment_id phase2-drive-track \
  --target_file /workdir/src/lib/monitoring/api-observer.ts --should_read_entire_file true
```

### **Phase 2: Drive API Client Setup**

```yaml
実装順序:
1. Drive API types定義
2. Drive client wrapper実装
3. Foundation OAuth integration
4. Connection testing
5. Basic error handling
6. Unit tests作成
```

### **Phase 3: File Operations**

```yaml
実装順序:
1. File upload with metadata
2. Folder creation and management
3. File listing and filtering
4. Download capabilities
5. Update operations
6. Integration tests
```

### **Phase 4: Business Logic Processing**

```yaml
実装順序:
1. Folder structure automation
2. File categorization rules
3. Permission management
4. Version control
5. Business logic tests
6. Performance optimization
```

### **Phase 5: Error Handling & Monitoring**

```yaml
実装順序:
1. Drive-specific error types
2. Retry mechanisms
3. Monitoring integration
4. Storage usage tracking
5. Alert configuration
6. Comprehensive testing
```

### **Phase 6: Testing & Documentation**

```yaml
実装順序:
1. E2E test scenarios
2. Performance benchmarks
3. Integration documentation
4. Folder structure guide
5. Operation examples
6. Knowledge transfer materials
```

## 🔍 品質確認フロー (Container環境で実行)

### **🔍 Technical Validation**

```bash
# Container環境でのチェック実行
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "npx tsc --noEmit"
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:run"
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:coverage"
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn check:docs"
```

### **🔒 Drive-Specific Validation**

```bash
# Drive API quota確認
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:drive-quota"

# Permission tests
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:permissions"

# Storage usage check
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:storage-usage"
```

### **🛡️ Git Operations**

```bash
# Git操作（Container環境で実行）
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "git checkout -b feature/pbi-2-3-drive-track"
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "git add ."
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track \
  --command "git commit -m 'feat(drive): implement Google Drive API integration track

- Add Drive API client with OAuth2 integration
- Implement file operations (create, list, get, update)
- Add automated folder structure and organization logic
- Setup comprehensive error handling and retry mechanisms
- Include permission management and access control
- Ensure >80% test coverage with unit + integration tests

Completes PBI-2-3-1 through PBI-2-3-5

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>'"
```

## 🎖️ 完了条件

### **PBI-2-3-1 完了条件**

- ✅ Drive API client実装完了
- ✅ Foundation OAuth module統合確認
- ✅ Connection pooling動作確認
- ✅ API quota monitoring動作確認

### **PBI-2-3-2 完了条件**

- ✅ File operations完全実装
- ✅ Folder management動作確認
- ✅ Upload/download performance最適化
- ✅ Metadata handling動作確認

### **PBI-2-3-3 完了条件**

- ✅ Folder structure automation実装完了
- ✅ File categorization動作確認
- ✅ Permission management確認
- ✅ Business logic tests pass

### **PBI-2-3-4 完了条件**

- ✅ Error handling完全実装
- ✅ Retry mechanisms動作確認
- ✅ Monitoring integration確認
- ✅ Storage usage tracking動作確認

### **PBI-2-3-5 完了条件**

- ✅ E2E tests pass
- ✅ Performance benchmarks満足
- ✅ Documentation完全整備
- ✅ Knowledge transfer完了

### **Drive Track 完了条件**

- ✅ TypeScript: 0 errors
- ✅ Tests: >80% coverage, all pass
- ✅ Documentation: yarn check:docs → 0 errors
- ✅ Security: npm audit → 0 high/critical
- ✅ Drive API quota効率利用確認
- ✅ Performance: File upload >1MB/second
- ✅ Performance: Folder operations <5 seconds
- ✅ Performance: Memory usage <200MB
- ✅ Throughput: >20 files/minute processing
- ✅ API Rate Limits: <1000 requests/hour
- ✅ Storage Usage: <15GB total usage
- ✅ File organization pipeline動作確認
- ✅ Gmail Track統合準備完了
- ✅ File Management Track連携準備完了

## 📋 Self-Check Reporting Template

**必須実行**: 各PBI完了時に以下フォーマットで報告

```text
## ✅ Self-Check Results (PBI-2-3-X)
- TypeScript: ✅ 0 errors / ❌ X errors
- Tests: ✅ All passed (coverage: X% - target: 80%) / ❌ X failed
- Documentation: ✅ 0 errors / ❌ X errors
- Security: ✅ 0 high/critical vulnerabilities / ❌ X issues
- Drive API Quota: ✅ Within limits / ⚠️ High usage
- Storage Usage: ✅ Optimized / ⚠️ High usage
- File Upload: ✅ <10MB in <30 seconds / ❌ Slow
- Folder Creation: ✅ <5 seconds / ❌ Timeout
- Memory Usage: ✅ <200MB / ⚠️ High usage

## 🎯 Implementation Summary
- [Drive統合コンポーネント概要]
- [File organization能力]
- [次Track連携ポイント]
- [既知の制限事項・注意点]

## 📊 Performance Metrics
- File upload speed: X MB/second (target: >1MB/s)
- Folder operations: X seconds (target: <5s)
- Batch processing: X files/minute (target: >20/min)
- Storage efficiency: X% optimization (target: >90%)
```

## 📊 並行開発連携

### **Gmail Track連携ポイント**

- Receipt attachment storage coordination
- File naming convention alignment
- Processing status synchronization
- Error handling consistency

### **File Management連携ポイント**

- Folder structure standardization
- File categorization rules
- Duplicate detection coordination
- Metadata management alignment

---

**🚀 開始指示**: Foundation完了確認後、container-use環境でPBI-2-3-1から順次開始してください。Google Drive
API統合の設計判断と実装理由を明確にしながら進め、全てのコマンド実行はmcp**container-use**environment\_\*ツールを使用してください。完了時にはGmail
TrackとFile Management Trackとの連携準備状況を詳細に報告してください。

## 🔧 Comprehensive Error Recovery Procedures

### **Google Drive API Errors**

**Error Types & Resolution:**

- `DRIVE_QUOTA_EXCEEDED`: Check storage limits → Clean up old files → Escalate if needed
- `DRIVE_AUTH_FAILED`: Refresh OAuth token → Re-authenticate → Check scope permissions
- `DRIVE_RATE_LIMIT`: Implement exponential backoff → Queue requests → Resume
- `DRIVE_FILE_NOT_FOUND`: Log warning → Skip operation → Continue processing
- `DRIVE_PERMISSION_DENIED`: Check file permissions → Request access → Escalate
- `DRIVE_NETWORK_ERROR`: Retry with backoff → Check connectivity → Escalate after 3 failures
- `DRIVE_STORAGE_FULL`: Alert user → Suggest cleanup → Pause uploads

**Escalation Procedure:**

1. Log detailed error with Drive API context
2. Preserve file operation state
3. Create backup of current folder structure
4. Stop execution after 3 consecutive failures
5. Report: "Drive API error [type] persists after 3 attempts. Manual intervention required."

**Recovery Testing:**

```bash
# Test Drive error recovery
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:drive-recovery"

# Test storage management
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:storage-management"
```

**Rollback Procedures:**

```bash
# Drive integration rollback
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "git checkout -- src/lib/drive/"
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn install"
```

### **File Operation Errors**

**Error Types & Resolution:**

- `FILE_UPLOAD_FAILED`: Retry with smaller chunks → Check file size → Queue for later
- `FOLDER_CREATE_FAILED`: Check permissions → Verify parent folder → Retry
- `FILE_PERMISSION_ERROR`: Request proper permissions → Use service account → Escalate
- `FILE_SIZE_EXCEEDED`: Split large files → Use resumable upload → Alert user

## 🧪 Enhanced Testing Strategy

### **Mock vs Real API Guidelines**

**Use Mock Drive API when:**

- Unit testing file operations
- Testing folder structure creation
- Error scenario simulation
- CI/CD pipeline execution
- Permission testing

**Use Real Drive API when:**

- Integration testing with actual files
- Performance benchmarking
- Large file upload testing
- End-to-end file organization
- Production readiness verification

### **Test Data Requirements**

**Drive Test Data:**

```typescript
// Mock file data
const mockFileData = {
  smallFile: { name: 'receipt.pdf', size: 1024, type: 'application/pdf' },
  largeFile: { name: 'large-receipt.pdf', size: 10485760, type: 'application/pdf' }, // 10MB
  imageFile: { name: 'receipt.jpg', size: 2048, type: 'image/jpeg' },
  batchFiles: generateMockFiles(50), // For batch testing
  testFolders: {
    receipts: { name: '2024-receipts', parent: 'root' },
    archive: { name: 'archive', parent: 'root' },
  },
};
```

### **Integration Testing Scenarios**

1. **File Management Pipeline**

   - Test file upload with metadata
   - Verify folder structure creation
   - Validate permission settings

2. **Performance Testing**

   - Upload 50 files in <10 minutes
   - Handle concurrent file operations
   - Memory usage under load

3. **Storage Management**
   - Monitor storage usage
   - Test cleanup procedures
   - Validate backup strategies

## 🔍 Troubleshooting Guide

### **Common Implementation Issues**

#### FAQ: Drive API Integration

Q: Drive API returns 403 Insufficient Permission error A: Check OAuth scope. Ensure 'drive.file' scope is granted for
file access.

Q: File uploads are very slow A: Use resumable uploads for large files. Implement chunked upload strategy.

Q: Folder creation fails with 404 error A: Verify parent folder exists. Check folder ID references.

Q: Storage quota exceeded frequently A: Implement storage monitoring. Set up automated cleanup policies.

#### FAQ: Performance Issues

Q: Memory usage increases during batch operations A: Process files in smaller batches. Implement proper cleanup after
operations.

Q: API quota gets exhausted quickly A: Optimize API calls. Use batch requests for folder operations.

### **Known Limitations & Workarounds**

**Drive API Limitations:**

- File upload limit: 5TB per file
- Workaround: Split extremely large files or use Google Cloud Storage

**Storage Limitations:**

- Free tier: 15GB total storage
- Workaround: Implement automated archiving and cleanup

**Performance Limitations:**

- API rate limits vary by operation type
- Workaround: Implement intelligent request batching and caching

### **Debugging Procedures**

**Debug Drive API Issues:**

```bash
# Enable Drive API debug logging
export DEBUG=drive:*
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:drive --verbose"
```

**Debug File Operations:**

```bash
# Test file operations with debug output
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:file-operations --debug"
```

**Debug Storage Issues:**

```bash
# Monitor storage usage
mcp__container-use__environment_run_cmd --environment_id phase2-drive-track --command "yarn test:storage-monitor --verbose"
```

❗ **CRITICAL**: Google
Driveのプライバシー要件とstorage制限を厳格に遵守し、何らかの理由でルールに違反しそうになった場合は作業を停止して報告してください。
