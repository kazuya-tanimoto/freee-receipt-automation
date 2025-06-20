# freee Receipt Automation - Phase 2 AI Development Prompts

## 🎯 Overview

freee Receipt Automation プロジェクトの **Phase 2**
AI開発用プロンプト集です。Gmail/Drive統合による自動レシート処理システムの完全実装を支援します。

## 📋 Available Prompts

### **Phase 2 Development Prompts**

| No  | ファイル                                     | Track           | PBI範囲         | SP  | 実行方式 | 状況     |
| --- | -------------------------------------------- | --------------- | --------------- | --- | -------- | -------- |
| 1   | **phase2/1-foundation-prompt.md**            | Foundation      | PBI-2-1-x (3個) | 3   | 順次実行 | ✅ Ready |
| 2   | **phase2/2-gmail-track-prompt.md**           | Gmail Track     | PBI-2-2-x (5個) | 5   | 並行実行 | ✅ Ready |
| 3   | **phase2/3-drive-track-prompt.md**           | Drive Track     | PBI-2-3-x (5個) | 5   | 並行実行 | ✅ Ready |
| 4   | **phase2/4-file-management-prompt.md**       | File Management | PBI-2-4-x (4個) | 4   | 並行実行 | ✅ Ready |
| 5   | **phase2/5-background-processing-prompt.md** | Background      | PBI-2-5-x (2個) | 2   | 順次実行 | ✅ Ready |

### **Execution Guide**

| ファイル                      | 用途       | 内容                        |
| ----------------------------- | ---------- | --------------------------- |
| **phase2/EXECUTION-GUIDE.md** | 実行手順書 | Phase 2完了までの詳細ガイド |

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

### **リソース競合回避**

- **Container環境**: 完全分離 (environment_id別)
- **Database Schema**: Foundation で事前定義
- **Git Branch**: Track別 feature branch

## 📋 Progress Tracking

### **Daily Milestone**

```text
Day 1: ✅ Foundation Complete
Day 2-3: ✅ Gmail + Drive Tracks Complete
Day 4-5: ✅ File Management + Background Complete
Day 6: ✅ Integration Testing
Day 7: ✅ Production Deployment Prep
```

### **Self-Check Format** (各Track完了時)

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

## 🚨 Emergency Procedures

### **Rule Violation Detection**

- **即座停止**: CLAUDE.md違反検出時
- **報告**: 具体的違反内容と停止理由
- **待機**: 人間の判断・指示待ち

### **Technical Issues**

- **3回エラー**: 作業停止、ガイダンス要求
- **Container問題**: 新環境作成で解決
- **Dependency Missing**: 前Track完了確認

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

### **Business Value**

- ✅ **Cost Efficiency**: 年間$5以下で運用可能
- ✅ **Time Savings**: 手動作業95%削減
- ✅ **Accuracy**: レシート処理精度>95%
- ✅ **Compliance**: 会計・税務要件対応

## 🧠 Prompt Engineering Excellence

### **Design Principles**

- **Persona-Driven**: Track専用エキスパート人格
- **Container-First**: container-use環境完全対応
- **Security-Focused**: セキュリティルール厳格遵守
- **Quality-Obsessed**: 品質基準妥協なし
- **Business-Aligned**: 実用性・コスト効率重視

### **Template Consistency**

1. **Mission Overview** - 目的・スコープ明確化
1. **AI Engineer Persona** - Track専用専門性
1. **Container Environment Setup** - 実行環境・依存関係
1. **Absolute Rules** - CLAUDE.md準拠ルール
1. **Implementation Scope** - PBI詳細・技術要件
1. **Quality Assurance** - 品質確認・テスト戦略
1. **Completion Criteria** - 完了条件・成果物

### **Optimization Features**

- **Parallel Execution**: 効率的な並行開発支援
- **Dependency Management**: 依存関係明確化
- **Error Prevention**: ルール違反防止機構
- **Progress Tracking**: 詳細な進捗監視
- **Knowledge Transfer**: 実装ノウハウ蓄積

## 📚 Additional Resources

### **Related Documentation**

- **CLAUDE.md**: プロジェクト品質基準・ルール
- **README.md**: プロジェクト概要・技術スタック
- **docs/**: 技術仕様・API設計書

### **Backup & Archive**

- **phase2-prompts-backup/**: 開発履歴・実験版保管

---

## 🎯 Ready to Transform freee Receipt Automation?

**Phase 2 は freee Receipt Automation の心臓部です。**

Gmail/Drive統合により、手動レシート処理から完全自動化への革命的転換を実現します。

天才プロンプトエンジニアリングにより、最高品質・最短期間での実装を支援します。

**Phase 2 完全制覇で、次世代の自動化システムを構築しましょう！** 🚀✨

---

## Generated with expert prompt engineering - 2024-06-20
