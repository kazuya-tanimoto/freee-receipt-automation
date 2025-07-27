# PBI-5-3-1: ルール実行エンジン

## 説明

レシート-取引ペアにマッチングルールを解析、解釈、適用できるルール実行エンジンを実装します。これには、ルール解析、実行フレームワーク、ログ機能が含まれます。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/rules/execution-engine.ts` - コアルール実行エンジン
2. `src/lib/rules/rule-parser.ts` - ルール解析・解釈
3. `src/lib/rules/rule-executor.ts` - 個別ルール実行ロジック
4. `src/types/rule-execution.ts` - 実行タイプとインターフェース
5. `src/lib/rules/__tests__/execution-engine.test.ts` - 単体テスト
6. `src/lib/rules/execution-logger.ts` - ルール実行ログ

### 技術要件

- 異なるルールタイプ（ベンダー、キーワード、金額、日付）を解析
- 適切なエラーハンドリング付きルール実行
- ルールチェーンと依存関係をサポート
- デバッグ用実行結果ログ
- 実行タイムアウトと制限を実装

### エンジンアーキテクチャ

```typescript
interface RuleExecutionEngine {
  executeRule(rule: MatchingRule, context: ExecutionContext): Promise<RuleResult>;
  executeRuleSet(rules: MatchingRule[], context: ExecutionContext): Promise<RuleSetResult>;
  parseRule(rule: MatchingRule): ParsedRule;
  validateRule(rule: MatchingRule): ValidationResult;
}

interface ExecutionContext {
  receipt: Receipt;
  transactions: Transaction[];
  userId: string;
  timestamp: Date;
}

interface RuleResult {
  ruleId: string;
  success: boolean;
  confidence: number;
  matches: MatchCandidate[];
  executionTime: number;
  errors?: ExecutionError[];
}
```

### 実行フレームワーク

```typescript
interface RuleExecutor {
  executeVendorRule(rule: VendorRule, context: ExecutionContext): Promise<VendorRuleResult>;
  executeKeywordRule(rule: KeywordRule, context: ExecutionContext): Promise<KeywordRuleResult>;
  executeAmountRule(rule: AmountToleranceRule, context: ExecutionContext): Promise<AmountRuleResult>;
  executeDateRule(rule: DateToleranceRule, context: ExecutionContext): Promise<DateRuleResult>;
}

interface ExecutionLogger {
  logExecution(result: RuleResult): Promise<void>;
  logError(error: ExecutionError): Promise<void>;
  getExecutionHistory(ruleId: string): Promise<ExecutionLogEntry[]>;
}
```

## 受け入れ基準

- [ ] すべてのルールタイプ（ベンダー、キーワード、金額、日付）を実行
- [ ] 適切なエラーハンドリングとタイムアウト処理
- [ ] ルール依存関係とチェーン実行をサポート
- [ ] 包括的な実行ログとデバッグ情報
- [ ] マッチング信頼度と候補の計算
- [ ] 並列ルール実行の最適化

## 依存関係

- **必須**: PBI-5-2-6 (ルール検証システム)
- **必須**: すべてのルール生成PBI (5-2-2, 5-2-3, 5-2-4)

## テスト要件

- 単体テスト: 個別ルールタイプの実行
- 統合テスト: 複数ルールセットの実行
- パフォーマンステスト: 大量ルール実行の最適化

## 見積もり

2ストーリーポイント

## 優先度

高 - ルールベースマッチングのコア機能

## 実装ノート

- 非同期ルール実行とPromise処理
- 適切なエラー分離とリカバリ
- 実行メトリクスとパフォーマンス監視
- サーキットブレーカーパターンで障害耐性を向上
