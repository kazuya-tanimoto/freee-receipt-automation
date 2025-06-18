# PBI-2-1-3: オブザーバビリティ設定

## 説明

構造化ロギング、メトリクス収集、分散トレーシングを含む包括的なオブザーバビリティインフラストラクチャを実装します。これにより、AI生成コードと外部API統合の監視、デバッグ、パフォーマンス分析が可能になります。

## 実装詳細

### 作成/修正するファイル

1. `src/lib/observability/logger.ts` - 構造化ロギング設定
2. `src/lib/observability/metrics.ts` - メトリクス収集ユーティリティ
3. `src/lib/observability/tracing.ts` - 分散トレーシング設定
4. `src/lib/observability/index.ts` - オブザーバビリティモジュールのエクスポート
5. `src/middleware/observability.ts` - リクエスト追跡用Next.jsミドルウェア
6. `docs/observability/monitoring-guide.md` - 監視とアラートのガイド
7. `docker-compose.observability.yml` - ローカルオブザーバビリティスタック

### 技術要件

- 複数レベルの構造化JSONロギングを実装
- 分散トレーシング用のOpenTelemetryを設定
- Prometheus互換のメトリクスエクスポートを構成
- リクエスト/レスポンスロギングミドルウェアを追加
- エラー追跡とパフォーマンス監視を含める

### ロギング設定

```typescript
interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  provider?: string;
  duration?: number;
  [key: string]: any;
}

interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}

// 使用例
logger.info('OAuthトークンが更新されました', {
  userId: user.id,
  provider: 'google',
  operation: 'token_refresh',
  duration: 150,
});
```

### メトリクス設定

```typescript
interface Metrics {
  // カウンター
  incrementOAuthAttempts(provider: string, status: 'success' | 'failure'): void;
  incrementOCRProcessed(status: 'success' | 'failure'): void;
  incrementEmailsProcessed(provider: string): void;

  // ヒストグラム
  recordApiDuration(provider: string, operation: string, duration: number): void;
  recordOCRDuration(duration: number): void;
  recordEmailProcessingDuration(duration: number): void;

  // ゲージ
  setActiveUsers(count: number): void;
  setPendingJobs(count: number): void;
}
```

### トレーシング設定

```typescript
// OpenTelemetry設定
const tracer = trace.getTracer('freee-receipt-automation', '1.0.0');

// スパン作成ヘルパー
export function createSpan<T>(
  name: string,
  operation: () => Promise<T>,
  attributes?: Record<string, string | number>
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async span => {
    try {
      const result = await operation();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : '不明なエラー',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### 環境変数

```bash
# オブザーバビリティ設定
LOG_LEVEL=info
ENABLE_TRACING=true
METRICS_PORT=9090
JAEGER_ENDPOINT=http://localhost:14268/api/traces
PROMETHEUS_METRICS_PATH=/metrics

# 本番環境用
DATADOG_API_KEY=<your-key>
SENTRY_DSN=<your-dsn>
```

### 従うべきコードパターン

- 一貫したフィールド名で構造化ロギングを使用
- リクエスト追跡用の相関IDを含める
- すべての外部API呼び出しにテレメトリーを追加
- オブザーバビリティが失敗した場合の適切な劣化を実装

### インターフェース仕様

- **入力インターフェース**: 監視のためのすべての他のPBIと統合
- **出力インターフェース**: オブザーバビリティユーティリティを提供

  ```typescript
  export interface ObservabilityContext {
    logger: Logger;
    metrics: Metrics;
    createSpan: typeof createSpan;
    requestId: string;
  }

  export interface PerformanceMetrics {
    operation: string;
    duration: number;
    status: 'success' | 'failure' | 'timeout';
    provider?: string;
    errorCode?: string;
  }
  ```

## メタデータ

- **ステータス**: 未開始
- **実際のストーリーポイント**: [完了後に記入]
- **作成日**: 2025-06-04
- **開始日**: [日付]
- **完了日**: [日付]
- **所有者**: [AIアシスタントIDまたは人間]
- **レビュアー**: [このPBIをレビューした人]
- **実装メモ**: [完了後の学び]

## 受け入れ基準

- [ ] 複数レベルで構造化ロギングが設定されている
- [ ] OpenTelemetryトレーシングが設定され動作している
- [ ] 主要操作のメトリクス収集が実装されている
- [ ] リクエスト相関IDが生成され追跡されている
- [ ] エラー追跡が例外をキャプチャしレポートする
- [ ] パフォーマンス監視が外部API呼び出しをカバーしている

### 検証コマンド

```bash
# ロギング出力のテスト
npm run dev && curl http://localhost:3000/api/health | jq .
# メトリクスエンドポイントの確認
curl http://localhost:9090/metrics
# トレーシングの検証（Jaegerが必要）
docker-compose -f docker-compose.observability.yml up -d
```

## 依存関係

- **必須**: PBI-1-1-4 - オブザーバビリティ設定用の環境構成

## テスト要件

- ユニットテスト: ロギング、メトリクス、トレーシングユーティリティをテスト
- 統合テスト: 現実的なシナリオでオブザーバビリティを検証
- テストデータ: ダッシュボードテスト用のモックテレメトリーデータ

## 見積もり

1ストーリーポイント

## 優先度

高 - AI生成コードのデバッグにオブザーバビリティが必要

## 実装メモ

- 構造化ロギングにはWinstonまたはPinoの使用を検討
- ローカル開発トレーシング用にJaegerを設定
- Node.jsメトリクス用のPrometheusクライアントを使用
- 大量トレース用のサンプリングを実装
- 監視システム用のヘルスチェックエンドポイントを追加
- 自動リクエスト追跡用のNext.jsミドルウェアの使用を検討
