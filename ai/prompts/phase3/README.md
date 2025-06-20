# Phase 3 AI Development Prompts

## 🎯 Overview

freee Receipt Automation プロジェクトの **Phase 3**
AI開発用プロンプト集です。freee API統合による完全自動化システムの実装を支援します。

## 📋 Available Prompts

### **Phase 3 Development Prompts**

| No  | ファイル                          | Track             | PBI範囲         | SP  | 実行方式 | 状況     |
| --- | --------------------------------- | ----------------- | --------------- | --- | -------- | -------- |
| 1   | **1-freee-api-prompt.md**         | freee API         | PBI-3-1-x (4個) | 4   | 順次実行 | ✅ Ready |
| 2   | **2-receipt-processing-prompt.md** | Receipt Processing| PBI-3-2-x (5個) | 5   | 順次実行 | ✅ Ready |
| 3   | **3-ocr-integration-prompt.md**   | OCR Integration   | PBI-3-3-x (4個) | 4   | 順次実行 | ✅ Ready |
| 4   | **4-workflow-automation-prompt.md** | Workflow Auto   | PBI-3-4-x (3個) | 3   | 順次実行 | ✅ Ready |

### **Execution Guide**

| ファイル               | 用途       | 内容                        |
| ---------------------- | ---------- | --------------------------- |
| **EXECUTION-GUIDE.md** | 実行手順書 | Phase 3完了までの詳細ガイド |

## Total: 16 SP / 推定実装期間: 4-6日

## 🚀 Quick Start

### **Step 1: freee API Integration (必須先行)**

```bash
# Claude Code で実行
cat ai/prompts/phase3/1-freee-api-prompt.md
# ↑ 内容をコピー&ペースト
```

### **Step 2: Receipt Processing**

```bash
# Claude Code Session #1: Receipt Processing
cat ai/prompts/phase3/2-receipt-processing-prompt.md
```

### **Step 3: OCR Integration**

```bash
# Claude Code Session #2: OCR Integration
cat ai/prompts/phase3/3-ocr-integration-prompt.md
```

### **Step 4: Workflow Automation**

```bash
# Claude Code Session #3: Workflow Automation
cat ai/prompts/phase3/4-workflow-automation-prompt.md
```

## 📊 Implementation Strategy

### **Phase 3A: freee API Foundation** (順次実行必須)

```text
PBI-3-1-1: freee API Client → PBI-3-1-2: Receipt Models → PBI-3-1-3: Upload Service → PBI-3-1-4: Error Handling
```

### **Phase 3B: Processing Pipeline** (Foundation完了後)

```text
Receipt Processing (PBI-3-2-x) → OCR Integration (PBI-3-3-x) → Workflow Automation (PBI-3-4-x)
```

## 🛡️ Quality Standards

### **必須品質基準** (全Track共通)

- ✅ **TypeScript**: 0 errors (strict mode)
- ✅ **Tests**: >80% coverage, all pass
- ✅ **Documentation**: yarn check:docs → 0 errors
- ✅ **Security**: npm audit → 0 high/critical
- ✅ **CLAUDE.md Compliance**: 全ルール遵守

### **Track固有要件**

- **freee API**: OAuth2.0 + REST API Client + Rate Limiting
- **Receipt Processing**: Image processing + Validation + Transformation
- **OCR Integration**: Google Vision API + Text extraction + Accuracy validation
- **Workflow Automation**: End-to-end pipeline + Error recovery

## 🔄 Dependencies & Execution Order

### **必須依存関係**

```text
Phase 2 Complete → freee API → Receipt Processing → OCR Integration → Workflow Automation
```

### **技術的依存関係**

- **freee API**: Phase 2完了必須
- **Receipt Processing**: freee API完了必須
- **OCR Integration**: Receipt Processing推奨完了
- **Workflow Automation**: 全Track推奨完了

## 🎖️ Phase 3 Success Criteria

### **Functional Completeness**

- ✅ **freee API Integration**: 自動レシートアップロード
- ✅ **Receipt Processing**: 画像前処理・検証・変換
- ✅ **OCR Integration**: 高精度テキスト抽出
- ✅ **Workflow Automation**: End-to-Endパイプライン稼働

### **Technical Excellence**

- ✅ **End-to-End Workflow**: Email → OCR → Validation → freee Upload
- ✅ **API Integration**: freee + Google Vision APIs完全動作
- ✅ **Automation**: 完全自動化フロー稼働
- ✅ **Error Recovery**: 障害時の自動復旧機能

---

## 🎯 Ready to Complete the Automation?

**Phase 3 は freee Receipt Automation の完成形です。**

freee API統合により、レシート画像から経費データベースへの完全自動化を実現します。

**Phase 3 完全制覇で、真の自動化システムを実現しましょう！** 🚀✨

---

## Generated with expert prompt engineering
