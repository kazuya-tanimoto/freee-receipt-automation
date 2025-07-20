# Phase 2 Complete Execution Guide

## 🎯 Overview

freee Receipt Automation プロジェクトの **Phase 2** 完了までの実行手順書です。Foundation から Background
Processing まで、全 5 Track を効率的に実装するためのガイドです。

## 📊 Phase 2 構成

| Track                     | PBI範囲         | SP  | 実行方式 | 推定時間 |
| ------------------------- | --------------- | --- | -------- | -------- |
| **Foundation**            | PBI-2-1-x (3個) | 3   | 順次実行 | 1-2日    |
| **Gmail Track**           | PBI-2-2-x (5個) | 5   | 並行実行 | 2-3日    |
| **Drive Track**           | PBI-2-3-x (5個) | 5   | 並行実行 | 2-3日    |
| **File Management**       | PBI-2-4-x (4個) | 4   | 並行実行 | 1-2日    |
| **Background Processing** | PBI-2-5-x (2個) | 2   | 順次実行 | 1日      |

## Total: 19 SP / 推定 5-7日

## 🚀 実行戦略

### **Phase 2A: Foundation** (必須先行)

```bash
# ローカル環境で順次実行
1-foundation-prompt.md
→ PBI-2-1-1: OpenAPI Definition
→ PBI-2-1-2: Common OAuth Module
→ PBI-2-1-3: Observability Setup
```

### **Phase 2B: 並行開発 Wave 1** (Foundation完了後)

```bash
# ローカル環境で順次実行
Local Session 1: 2-gmail-track-prompt.md     │ PBI-2-2-x (Gmail統合)
Local Session 2: 3-drive-track-prompt.md     │ PBI-2-3-x (Drive統合)
```

### **Phase 2C: 並行開発 Wave 2** (Wave 1完了後)

```bash
# ローカル環境で順次実行
Local Session 3: 4-file-management-prompt.md       │ PBI-2-4-x (ファイル管理)
Local Session 4: 5-background-processing-prompt.md │ PBI-2-5-x (バックグラウンド処理)
```

## 📋 実行手順詳細

### **Step 1: Phase 2A - Foundation Track**

```bash
# Claude Codeで実行
cat ai/prompts/phase2/1-foundation-prompt.md
# ↑ 内容をClaude Codeにコピー&ペースト

# 完了確認
✅ TypeScript: 0 errors
✅ Tests: >80% coverage
✅ Documentation: 0 errors
✅ OAuth module動作確認
✅ OpenAPI仕様完成
✅ Monitoring基盤確認
```

### **Step 2: Phase 2B - 並行開発 Wave 1**

#### **Gmail Track (ローカル環境)**

```bash
# ローカル環境でClaude Code新セッション #1
cat ai/prompts/phase2/2-gmail-track-prompt.md
# ↑ 内容をコピー&ペースト

# 完了確認
✅ Gmail API統合完了
✅ Receipt detection動作
✅ Error handling確認
```

#### **Drive Track (ローカル環境)**

```bash
# ローカル環境でClaude Code新セッション #2
cat ai/prompts/phase2/3-drive-track-prompt.md
# ↑ 内容をコピー&ペースト

# 完了確認
✅ Drive API統合完了
✅ File organization動作
✅ Permission management確認
```

### **Step 3: Phase 2C - 並行開発 Wave 2**

#### **File Management (ローカル環境)**

```bash
# ローカル環境でClaude Code新セッション #3
cat ai/prompts/phase2/4-file-management-prompt.md
# ↑ 内容をコピー&ペースト

# 完了確認
✅ File naming system動作
✅ Duplicate detection確認
✅ Folder structure automation
```

#### **Background Processing (Container 4)**

```bash
# Claude Code新セッション #4 (並行実行)
cat ai/prompts/phase2/5-background-processing-prompt.md
# ↑ 内容をコピー&ペースト

# 完了確認
✅ pg_cron setup完了
✅ Job queue動作確認
✅ End-to-end workflow確認
```

## 🔍 品質チェックポイント

### **各Track完了時の必須確認**

```bash
# Technical validation
npx tsc --noEmit           # TypeScript: 0 errors
yarn test:run              # Tests: All pass
yarn test:coverage         # Coverage: >80%
yarn check:docs            # Documentation: 0 errors
npm audit                  # Security: 0 high/critical
```

### **Self-Check Reporting Format**

```text
## ✅ Self-Check Results (Track X)
- TypeScript: ✅ 0 errors / ❌ X errors
- Tests: ✅ All passed (coverage: X%) / ❌ X failed
- Documentation: ✅ 0 errors / ❌ X errors
- Security: ✅ 0 vulnerabilities / ❌ X issues

## 🎯 Implementation Summary
- [実装コンポーネント概要]
- [次Track連携ポイント]
- [既知の制限事項]
```

## 🔄 依存関係とブロッカー

### **必須依存関係**

```text
Phase 1 完了 → Foundation → Gmail/Drive (並行) → File Mgmt/Background (並行)
```

### **技術的依存関係**

- **Gmail/Drive**: Foundation OAuth必須
- **File Management**: Gmail/Drive Track推奨完了
- **Background Processing**: 全Track推奨完了

### **リソース競合回避**

- **Database Schema**: Foundation で定義済み
- **Package.json**: 各Track で独立管理
- **Container環境**: 完全分離で競合なし

## 📊 進捗監視

### **Daily Progress Tracking**

```text
Day 1: ✅ Foundation (PBI-2-1-x)
Day 2-3: ✅ Gmail Track (PBI-2-2-x) | ✅ Drive Track (PBI-2-3-x)
Day 4-5: ✅ File Management (PBI-2-4-x) | ✅ Background (PBI-2-5-x)
Day 6: ✅ Integration Testing & Documentation
Day 7: ✅ Production Deployment Prep
```

### **Milestone Gates**

- **Gate 1**: Foundation完了 → Wave 1開始可能
- **Gate 2**: Wave 1完了 → Wave 2開始可能
- **Gate 3**: Wave 2完了 → Phase 2 Complete

## 🚨 トラブルシューティング

### **Container Environment Issues**

```bash
# Environment reset
mcp__container-use__environment_open --source /path --name new-name

# Dependencies reinstall
mcp__container-use__environment_run_cmd --command "yarn install"
```

### **Common Issues**

1. **TypeScript Errors**: 先行Trackの型定義確認
2. **Test Failures**: Mock設定とデータ準備確認
3. **Documentation Errors**: Markdown format修正
4. **Container Issues**: 新環境作成で解決

### **Emergency Procedures**

- **Rule Violation**: 即座に作業停止、報告
- **3回エラー**: 作業停止、ガイダンス要求
- **Dependency Missing**: Foundation完了確認

## 🎖️ Phase 2 完了条件

### **Technical Requirements**

- ✅ **All Tracks**: TypeScript 0 errors
- ✅ **All Tracks**: Tests >80% coverage, all pass
- ✅ **All Tracks**: Documentation 0 errors
- ✅ **All Tracks**: Security 0 high/critical issues

### **Functional Requirements**

- ✅ **Gmail Integration**: Email monitoring & receipt processing
- ✅ **Drive Integration**: File storage & organization
- ✅ **File Management**: Naming & duplicate handling
- ✅ **Background Processing**: Automation & scheduling

### **Integration Requirements**

- ✅ **End-to-End Workflow**: Email → Processing → Storage → Organization
- ✅ **API Integration**: Gmail + Drive APIs working
- ✅ **Automation**: Scheduled tasks executing
- ✅ **Monitoring**: Observability & error tracking

## 🎯 Success Metrics

### **Development Efficiency**

- **Total Time**: Target 5-7 days
- **Code Quality**: >80% test coverage across all tracks
- **Error Rate**: <5% implementation errors
- **Rework**: <10% code changes post-implementation

### **System Performance**

- **API Response**: <2s average response time
- **File Processing**: <30s per receipt
- **Background Jobs**: 99% success rate
- **Storage Efficiency**: Optimal Drive quota usage

---

## 🚀 Ready to Start?

**Pre-flight Checklist:**

- [ ] Phase 1 完了確認
- [ ] Claude Code 準備完了
- [ ] Git repository 最新状態
- [ ] Container-use 環境利用可能

**開始コマンド:**

```bash
# Foundation Track開始
cat ai/prompts/phase2/1-foundation-prompt.md
# ↑ Claude Codeにコピー&ペーストして開始！
```

**Phase 2 を完全制覇して、freee Receipt Automation の基盤を完成させましょう！** 🚀✨
