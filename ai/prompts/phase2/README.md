# Phase 2 AI Development Prompts

## 🎯 Overview

freee Receipt Automation プロジェクトの **Phase 2**
AI開発用プロンプト集です。Gmail/Drive統合による自動レシート処理システムの完全実装を支援します。

## 📋 Available Prompts

### **Phase 2 Development Prompts**

| No  | ファイル                              | Track                 | PBI範囲         | SP  | 実行方式 | 状況     |
| --- | ------------------------------------- | --------------------- | --------------- | --- | -------- | -------- |
| 1   | **1-foundation-prompt.md**            | Foundation            | PBI-2-1-x (3個) | 3   | 順次実行 | ✅ Ready |
| 2   | **2-gmail-track-prompt.md**           | Gmail Track           | PBI-2-2-x (5個) | 5   | 並行実行 | ✅ Ready |
| 3   | **3-drive-track-prompt.md**           | Drive Track           | PBI-2-3-x (5個) | 5   | 並行実行 | ✅ Ready |
| 4   | **4-file-management-prompt.md**       | File Management       | PBI-2-4-x (4個) | 4   | 並行実行 | ✅ Ready |
| 5   | **5-background-processing-prompt.md** | Background Processing | PBI-2-5-x (2個) | 2   | 順次実行 | ✅ Ready |

### **Execution Guide**

| ファイル               | 用途       | 内容                        |
| ---------------------- | ---------- | --------------------------- |
| **EXECUTION-GUIDE.md** | 実行手順書 | Phase 2完了までの詳細ガイド |

## Total: 19 SP / 推定実装期間: 5-7日

## 🚀 Quick Start

### **Step 1: Foundation Track (必須先行)**

```bash
# Claude Code で実行
cat ai/prompts/phase2/1-foundation-prompt.md
# ↑ 内容をコピー&ペースト
```

### **Step 2: 並行開発 Wave 1**

```bash
# Claude Code Session #1: Gmail Track
cat ai/prompts/phase2/2-gmail-track-prompt.md

# Claude Code Session #2: Drive Track
cat ai/prompts/phase2/3-drive-track-prompt.md
```

### **Step 3: 並行開発 Wave 2**

```bash
# Claude Code Session #3: File Management
cat ai/prompts/phase2/4-file-management-prompt.md

# Claude Code Session #4: Background Processing
cat ai/prompts/phase2/5-background-processing-prompt.md
```

## 📊 Implementation Strategy

### **Phase 2A: Foundation** (順次実行必須)

```text
PBI-2-1-1: OpenAPI Definition → PBI-2-1-2: OAuth Module → PBI-2-1-3: Observability
```

### **Phase 2B: 並行開発 Wave 1** (Foundation完了後)

```text
Gmail Track (PBI-2-2-x) ∥ Drive Track (PBI-2-3-x)
```

### **Phase 2C: 並行開発 Wave 2** (Wave 1完了後)

```text
File Management (PBI-2-4-x) ∥ Background Processing (PBI-2-5-x)
```

## 🛡️ Quality Standards

### **必須品質基準** (全Track共通)

- ✅ **TypeScript**: 0 errors (strict mode)
- ✅ **Tests**: >80% coverage, all pass
- ✅ **Documentation**: yarn check:docs → 0 errors
- ✅ **Security**: npm audit → 0 high/critical
- ✅ **CLAUDE.md Compliance**: 全ルール遵守

### **Track固有要件**

- **Foundation**: OAuth2.0 + OpenAPI + Monitoring基盤
- **Gmail**: Email processing + Receipt detection
- **Drive**: File organization + Permission management
- **File Management**: Naming rules + Duplicate handling
- **Background**: Scheduling + Job queue system

## 🔄 Dependencies & Execution Order

### **必須依存関係**

```text
Phase 1 Complete → Foundation → Gmail/Drive (並行) → File Mgmt/Background (並行)
```

### **技術的依存関係**

- **Foundation**: Phase 1完了必須
- **Gmail/Drive**: Foundation完了必須
- **File Management**: Gmail/Drive推奨完了
- **Background Processing**: 全Track推奨完了

## 🎖️ Phase 2 Success Criteria

### **Functional Completeness**

- ✅ **Gmail Integration**: 自動メール監視・レシート処理
- ✅ **Drive Integration**: ファイル保存・整理自動化
- ✅ **File Management**: 命名規則・重複処理
- ✅ **Background Automation**: スケジュール実行・ジョブ管理

### **Technical Excellence**

- ✅ **End-to-End Workflow**: Email → Process → Store → Organize
- ✅ **API Integration**: Gmail + Drive APIs完全動作
- ✅ **Automation**: pg_cron + Job Queue稼働
- ✅ **Observability**: 監視・ログ・メトリクス完備

---

## 🎯 Ready to Transform freee Receipt Automation?

**Phase 2 は freee Receipt Automation の心臓部です。**

Gmail/Drive統合により、手動レシート処理から完全自動化への革命的転換を実現します。

**Phase 2 完全制覇で、次世代の自動化システムを構築しましょう！** 🚀✨

---

## Generated with expert prompt engineering
