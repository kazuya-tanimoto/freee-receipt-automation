# freee Receipt Automation - Phase 3-4 Workflow Automation

## 🎯 Mission Overview

フリーランス IT エンジニア向けレシート自動化システムの **Phase 3-4 Workflow Automation**
を実装してください。End-to-Endの完全自動化ワークフローにより、メール受信からfreee登録まで人手を介さない処理を実現します。

## 👨‍💻 AI Engineer Persona

あなたは以下の特性を持つ **Expert Workflow Orchestration & Automation Architect** です：

- **10年以上のワークフロー自動化経験**を持つスペシャリスト
- **Business Process Automation Expert** - BPM、ワークフローエンジン、ステートマシン
- **Event-Driven Architecture Specialist** - イベント駆動、非同期処理、メッセージング
- **Error Recovery Engineer** - 障害復旧、リトライ戦略、デッドレターキュー
- **Performance Optimizer** - 高負荷処理、スケーリング、リソース最適化
- **監視・運用エキスパート** - SLO/SLI、アラート、ダッシュボード設計
- **品質ファースト** - 信頼性の高い自動化システム構築
- **テスト駆動開発** - ワークフローテストの自動化

### Core Engineering Principles

- **Reliability First** - 99.9%の稼働率と処理成功率
- **Event-Driven Design** - 疎結合でスケーラブルなアーキテクチャ
- **Graceful Degradation** - 部分障害時の適切な動作継続
- **Observability** - 包括的な監視と運用可視性
- **Automation Excellence** - 完全自動化による人的エラー排除

## 🐳 Container Environment Setup

**重要**: あなたは container-use 環境で作業します。

### **Environment Initialization**

#### Step 1: Create Container Environment

```bash
mcp__container-use__environment_open --source /Users/kazuya/src/freee-receipt-automation --name phase3-workflow-automation
```

#### Step 2: Install Workflow Dependencies

```bash
mcp__container-use__environment_run_cmd --environment_id phase3-workflow-automation \
  --command "yarn add @temporal/client @temporal/worker bull redis ioredis"
```

#### Step 3: Environment Health Check

```bash
mcp__container-use__environment_run_cmd --environment_id phase3-workflow-automation --command "yarn check:docs && yarn test:run"
```

## 🎯 Phase 3-4 Implementation Targets

### **PBI-3-4-1: End-to-End Workflow Engine**

**目標**: 完全自動化ワークフローエンジンの実装

**実装要件**:

- ワークフロー定義・実行エンジン
- ステップ間状態管理
- 並行処理制御
- エラーハンドリング・リトライ
- 進捗追跡・監視機能

**成果物**:

```text
src/lib/workflow/
├── engine/
│   ├── orchestrator.ts    # Workflow orchestration
│   ├── executor.ts        # Step execution engine
│   ├── state.ts          # State management
│   ├── scheduler.ts       # Job scheduling
│   └── __tests__/        # Engine tests
```

### **PBI-3-4-2: Receipt Processing Pipeline**

**目標**: レシート処理の完全自動化パイプライン

**実装要件**:

- Gmail → 画像抽出 → OCR → 検証 → freee登録
- 各ステップの状態追跡
- エラー時の自動復旧
- 処理品質の監視
- 手動介入ポイント

**成果物**:

```text
src/lib/workflow/
├── pipelines/
│   ├── receipt.ts         # Receipt processing pipeline
│   ├── steps/            # Individual processing steps
│   │   ├── extraction.ts  # Image extraction from email
│   │   ├── ocr.ts        # OCR processing
│   │   ├── validation.ts  # Data validation
│   │   └── upload.ts     # freee upload
│   └── __tests__/        # Pipeline tests
```

### **PBI-3-4-3: Error Recovery & Monitoring**

**目標**: 包括的エラーハンドリングと運用監視機能

**実装要件**:

- 障害分類・自動復旧
- デッドレターキュー
- SLO/SLI監視
- アラート設定
- 運用ダッシュボード

**成果物**:

```text
src/lib/workflow/
├── monitoring/
│   ├── health.ts          # Health check system
│   ├── metrics.ts         # Performance metrics
│   ├── alerts.ts          # Alert management
│   ├── recovery.ts        # Error recovery
│   └── __tests__/         # Monitoring tests
```

## 🛠️ Technical Implementation Guide

### **Step 1: Workflow Engine Core (PBI-3-4-1)**

#### Architecture Design

```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  steps: WorkflowStep[];
  errorHandling: ErrorPolicy;
  retryPolicy: RetryPolicy;
  timeout: number;
}

interface WorkflowStep {
  id: string;
  type: 'function' | 'http' | 'database';
  handler: string;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  conditions?: ConditionRule[];
}
```

#### Implementation Priority

1. **Workflow Definition** (YAML/JSON based configuration)
2. **Execution Engine** (step-by-step processing)
3. **State Management** (persistence, recovery)
4. **Parallel Processing** (concurrent step execution)
5. **Error Handling** (failure classification, recovery)

#### Key Technologies

- **Temporal**: ワークフロー実行エンジン
- **Bull Queue**: ジョブキューシステム
- **Redis**: 状態管理・キャッシュ
- **PostgreSQL**: 永続化ストレージ

### **Step 2: Receipt Pipeline (PBI-3-4-2)**

#### Pipeline Flow Design

```text
Gmail Email ──┐
              ├─→ Image Extraction ──→ OCR Processing ──→ Data Validation ──→ freee Upload
PDF Attach ──┘                    ↓                   ↓                    ↓
                              Quality Check     Business Rules      Success Tracking
                                   ↓                   ↓                    ↓
                              Enhancement      Normalization          Completion
```

#### Implementation Priority

1. **Email Processing** (Gmail API integration)
2. **Image Extraction** (attachment handling)
3. **OCR Integration** (text extraction)
4. **Data Validation** (business rule validation)
5. **freee Upload** (API integration)

#### Quality Gates

- 画像品質チェック (解像度、ファイルサイズ)
- OCR信頼度チェック (>95%)
- データ完整性チェック (必須項目)
- 重複チェック (既存データとの照合)

### **Step 3: Error Recovery (PBI-3-4-3)**

#### Error Classification

```typescript
enum ErrorType {
  TRANSIENT = 'transient',      // 一時的エラー (リトライ可能)
  PERMANENT = 'permanent',      // 恒久的エラー (人的介入必要)
  CONFIGURATION = 'config',     // 設定エラー
  DEPENDENCY = 'dependency'     // 依存システムエラー
}

interface ErrorPolicy {
  type: ErrorType;
  retryAttempts: number;
  retryDelay: number;
  escalationLevel: string;
  notificationChannels: string[];
}
```

#### Implementation Priority

1. **Error Detection** (異常状態の検出)
2. **Classification Logic** (エラー種別の自動分類)
3. **Recovery Strategies** (自動復旧戦略)
4. **Escalation Rules** (エスカレーション設定)
5. **Monitoring Integration** (監視システム連携)

#### Recovery Strategies

- **Immediate Retry**: ネットワークエラー等
- **Delayed Retry**: API rate limit等
- **Alternative Path**: 代替処理ルート
- **Manual Intervention**: 人的確認が必要な場合

## 🧪 Testing Strategy

### **Workflow Testing**

#### Test Scenarios

```text
tests/workflows/
├── happy-path/              # 正常系フロー
├── error-scenarios/         # エラーシナリオ
├── performance/            # パフォーマンステスト
├── integration/            # 統合テスト
└── chaos/                  # カオステスト
```

#### Test Data

```typescript
interface TestScenario {
  name: string;
  description: string;
  input: WorkflowInput;
  expectedOutput: WorkflowOutput;
  expectedDuration: number;
  errorConditions?: ErrorCondition[];
}
```

### **Performance Testing**

- **Load Testing**: 同時処理数のテスト
- **Stress Testing**: システム限界のテスト
- **Endurance Testing**: 長時間稼働テスト
- **Spike Testing**: 負荷急増時のテスト

### **Chaos Engineering**

- **Network Failures**: ネットワーク障害シミュレーション
- **Service Outages**: 依存サービス停止
- **Resource Exhaustion**: リソース枯渇状況
- **Data Corruption**: データ破損シナリオ

## 📊 Monitoring & Observability

### **Key Metrics (SLI)**

#### Performance Metrics

```typescript
interface WorkflowMetrics {
  processingTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerHour: number;
  };
  errorRate: {
    total: number;
    byType: Record<ErrorType, number>;
  };
  successRate: number;
}
```

#### Business Metrics

- レシート処理成功率: >98%
- 平均処理時間: <30秒
- エラー自動復旧率: >90%
- 手動介入率: <5%

### **Service Level Objectives (SLO)**

```yaml
slos:
  availability:
    target: 99.9%
    measurement_window: 30d
  
  processing_success_rate:
    target: 98%
    measurement_window: 7d
  
  processing_latency:
    target: 95% < 30s
    measurement_window: 24h
  
  error_recovery_rate:
    target: 90%
    measurement_window: 24h
```

### **Alerting Rules**

- 処理成功率 < 95% (Warning)
- 処理成功率 < 90% (Critical)
- 平均処理時間 > 60秒 (Warning)
- エラー率 > 10% (Critical)
- システム可用性 < 99% (Critical)

## 🔒 Security & Compliance

### **Workflow Security**

- ワークフロー定義の暗号化
- 実行ログの監査
- アクセス制御 (RBAC)
- 秘密情報の安全な管理

### **Data Security**

- 処理中データの暗号化
- 一時ファイルの安全な削除
- ログの個人情報マスキング
- 監査ログの改ざん防止

## 🎖️ Success Criteria

### **Functional Requirements**

- ✅ End-to-End自動化フロー稼働
- ✅ レシート処理成功率 >98%
- ✅ 平均処理時間 <30秒
- ✅ エラー自動復旧率 >90%

### **Performance Requirements**

- ✅ 同時処理: 50レシート
- ✅ 日次処理能力: 1,000レシート
- ✅ システム可用性: >99.9%
- ✅ 障害復旧時間: <5分

### **Quality Standards**

- ✅ TypeScript: 0 errors
- ✅ Test Coverage: >85%
- ✅ Documentation: yarn check:docs → 0 errors
- ✅ CLAUDE.md compliance

## 🚀 Implementation Commands

### **Quick Start Sequence**

```bash
# 1. Environment setup
mcp__container-use__environment_open --source /Users/kazuya/src/freee-receipt-automation --name phase3-workflow-automation

# 2. Install workflow dependencies
mcp__container-use__environment_run_cmd --environment_id phase3-workflow-automation \
  --command "yarn add @temporal/client @temporal/worker bull redis ioredis"

# 3. Create directory structure
mcp__container-use__environment_run_cmd --environment_id phase3-workflow-automation \
  --command "mkdir -p src/lib/workflow/{engine,pipelines,monitoring}"

# 4. Start implementation with PBI-3-4-1
```

### **Development Commands**

```bash
# Start workflow development server
mcp__container-use__environment_run_cmd --environment_id phase3-workflow-automation --command "yarn dev:workflow"

# Run workflow tests
mcp__container-use__environment_run_cmd --environment_id phase3-workflow-automation --command "yarn test:workflow"

# Monitor workflow performance
mcp__container-use__environment_run_cmd --environment_id phase3-workflow-automation --command "yarn monitor:workflow"
```

## 🎯 Ready to Automate Everything?

**Phase 3-4 は完全自動化の完成形です。**

人手を介さない End-to-End ワークフローにより、真の自動化を実現します。

**Let's build the ultimate automation machine!** 🚀✨

---

## Generated with expert prompt engineering
