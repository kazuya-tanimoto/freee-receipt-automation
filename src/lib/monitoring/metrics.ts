/**
 * Metrics Collection and Aggregation System
 * 
 * Advanced metrics collection system for monitoring API performance,
 * OAuth flows, external service integrations, and system health.
 */

import type {
  Metric,
  CounterMetric,
  GaugeMetric,
  HistogramMetric,
  SummaryMetric,
  MetricType,
  ServiceName,
  TimeRange,
  AggregationConfig,
  AggregationFunction
} from './types';

// ============================================================================
// Metric Value Storage
// ============================================================================

/**
 * Time-series data point
 */
interface DataPoint {
  timestamp: number;
  value: number;
  labels: Record<string, string>;
}

/**
 * Histogram bucket configuration
 */
interface HistogramBucket {
  upperBound: number;
  count: number;
}

/**
 * Summary quantile configuration
 */
interface SummaryQuantile {
  quantile: number;
  value: number;
}

// ============================================================================
// Base Metric Classes
// ============================================================================

/**
 * Base metric implementation
 */
abstract class BaseMetricImpl {
  protected name: string;
  protected type: MetricType;
  protected description: string;
  protected labels: Record<string, string>;
  protected dataPoints: DataPoint[] = [];

  constructor(name: string, type: MetricType, description: string, labels: Record<string, string> = {}) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.labels = labels;
  }

  /**
   * Get metric metadata
   */
  getMetadata() {
    return {
      name: this.name,
      type: this.type,
      description: this.description,
      labels: this.labels
    };
  }

  /**
   * Get data points within time range
   */
  getDataPoints(timeRange?: TimeRange): DataPoint[] {
    if (!timeRange) {
      return this.dataPoints;
    }

    const start = new Date(timeRange.start).getTime();
    const end = new Date(timeRange.end).getTime();

    return this.dataPoints.filter(point => 
      point.timestamp >= start && point.timestamp <= end
    );
  }

  /**
   * Clear old data points (retention policy)
   */
  cleanup(retentionMs: number): void {
    const cutoff = Date.now() - retentionMs;
    this.dataPoints = this.dataPoints.filter(point => point.timestamp > cutoff);
  }

  /**
   * Add data point
   */
  protected addDataPoint(value: number, labels: Record<string, string> = {}): void {
    this.dataPoints.push({
      timestamp: Date.now(),
      value,
      labels: { ...this.labels, ...labels }
    });
  }

  /**
   * Export metric data
   */
  abstract export(): Metric;
}

/**
 * Counter metric implementation
 */
class CounterImpl extends BaseMetricImpl {
  private value = 0;

  constructor(name: string, description: string, labels: Record<string, string> = {}) {
    super(name, 'counter', description, labels);
  }

  /**
   * Increment counter
   */
  inc(amount = 1, labels: Record<string, string> = {}): void {
    this.value += amount;
    this.addDataPoint(this.value, labels);
  }

  /**
   * Get current value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Reset counter
   */
  reset(): void {
    this.value = 0;
    this.addDataPoint(this.value);
  }

  /**
   * Export counter metric
   */
  export(): CounterMetric {
    return {
      name: this.name,
      type: 'counter',
      value: this.value,
      timestamp: new Date().toISOString(),
      labels: this.labels,
      description: this.description,
      increment: 1
    };
  }
}

/**
 * Gauge metric implementation
 */
class GaugeImpl extends BaseMetricImpl {
  private value = 0;

  constructor(name: string, description: string, labels: Record<string, string> = {}) {
    super(name, 'gauge', description, labels);
  }

  /**
   * Set gauge value
   */
  set(value: number, labels: Record<string, string> = {}): void {
    this.value = value;
    this.addDataPoint(this.value, labels);
  }

  /**
   * Increment gauge
   */
  inc(amount = 1, labels: Record<string, string> = {}): void {
    this.value += amount;
    this.addDataPoint(this.value, labels);
  }

  /**
   * Decrement gauge
   */
  dec(amount = 1, labels: Record<string, string> = {}): void {
    this.value -= amount;
    this.addDataPoint(this.value, labels);
  }

  /**
   * Get current value
   */
  getValue(): number {
    return this.value;
  }

  /**
   * Export gauge metric
   */
  export(): GaugeMetric {
    return {
      name: this.name,
      type: 'gauge',
      value: this.value,
      timestamp: new Date().toISOString(),
      labels: this.labels,
      description: this.description
    };
  }
}

/**
 * Histogram metric implementation
 */
class HistogramImpl extends BaseMetricImpl {
  private buckets: HistogramBucket[];
  private sum = 0;
  private count = 0;

  constructor(
    name: string,
    description: string,
    buckets: number[] = [0.1, 0.5, 1, 2.5, 5, 10],
    labels: Record<string, string> = {}
  ) {
    super(name, 'histogram', description, labels);
    this.buckets = buckets.map(upperBound => ({ upperBound, count: 0 }));
    // Add +Inf bucket
    this.buckets.push({ upperBound: Infinity, count: 0 });
  }

  /**
   * Observe value
   */
  observe(value: number, labels: Record<string, string> = {}): void {
    this.sum += value;
    this.count++;

    // Update buckets
    for (const bucket of this.buckets) {
      if (value <= bucket.upperBound) {
        bucket.count++;
      }
    }

    this.addDataPoint(value, labels);
  }

  /**
   * Get percentile value
   */
  getPercentile(percentile: number): number {
    const sortedValues = this.dataPoints
      .map(point => point.value)
      .sort((a, b) => a - b);
    
    if (sortedValues.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Export histogram metric
   */
  export(): HistogramMetric {
    return {
      name: this.name,
      type: 'histogram',
      value: this.sum,
      timestamp: new Date().toISOString(),
      labels: this.labels,
      description: this.description,
      buckets: this.buckets.map(b => b.upperBound),
      counts: this.buckets.map(b => b.count),
      sum: this.sum,
      count: this.count
    };
  }
}

/**
 * Summary metric implementation
 */
class SummaryImpl extends BaseMetricImpl {
  private sum = 0;
  private count = 0;
  private quantiles: SummaryQuantile[];

  constructor(
    name: string,
    description: string,
    quantiles: number[] = [0.5, 0.9, 0.95, 0.99],
    labels: Record<string, string> = {}
  ) {
    super(name, 'summary', description, labels);
    this.quantiles = quantiles.map(quantile => ({ quantile, value: 0 }));
  }

  /**
   * Observe value
   */
  observe(value: number, labels: Record<string, string> = {}): void {
    this.sum += value;
    this.count++;
    this.updateQuantiles();
    this.addDataPoint(value, labels);
  }

  /**
   * Update quantile values
   */
  private updateQuantiles(): void {
    const sortedValues = this.dataPoints
      .map(point => point.value)
      .sort((a, b) => a - b);

    for (const quantile of this.quantiles) {
      if (sortedValues.length === 0) {
        quantile.value = 0;
      } else {
        const index = Math.ceil(quantile.quantile * sortedValues.length) - 1;
        quantile.value = sortedValues[Math.max(0, index)];
      }
    }
  }

  /**
   * Export summary metric
   */
  export(): SummaryMetric {
    return {
      name: this.name,
      type: 'summary',
      value: this.sum,
      timestamp: new Date().toISOString(),
      labels: this.labels,
      description: this.description,
      quantiles: this.quantiles.reduce((acc, q) => {
        acc[`p${(q.quantile * 100).toFixed(0)}`] = q.value;
        return acc;
      }, {} as Record<string, number>),
      sum: this.sum,
      count: this.count
    };
  }
}

// ============================================================================
// Metrics Registry
// ============================================================================

/**
 * Central metrics registry
 */
export class MetricsRegistry {
  private metrics: Map<string, BaseMetricImpl> = new Map();
  private retentionMs: number;

  constructor(retentionMs = 24 * 60 * 60 * 1000) { // 24 hours default
    this.retentionMs = retentionMs;
    this.startCleanupInterval();
  }

  /**
   * Start cleanup interval for old metrics
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Clean up old metric data
   */
  private cleanup(): void {
    const metricsArray = Array.from(this.metrics.values());
    for (const metric of metricsArray) {
      metric.cleanup(this.retentionMs);
    }
  }

  /**
   * Generate metric key
   */
  private getMetricKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  // ============================================================================
  // Metric Creation Methods
  // ============================================================================

  /**
   * Create or get counter metric
   */
  counter(name: string, description: string, labels: Record<string, string> = {}): CounterImpl {
    const key = this.getMetricKey(name, labels);
    
    if (this.metrics.has(key)) {
      const metric = this.metrics.get(key);
      if (metric instanceof CounterImpl) {
        return metric;
      }
      throw new Error(`Metric ${name} already exists with different type`);
    }

    const counter = new CounterImpl(name, description, labels);
    this.metrics.set(key, counter);
    return counter;
  }

  /**
   * Create or get gauge metric
   */
  gauge(name: string, description: string, labels: Record<string, string> = {}): GaugeImpl {
    const key = this.getMetricKey(name, labels);
    
    if (this.metrics.has(key)) {
      const metric = this.metrics.get(key);
      if (metric instanceof GaugeImpl) {
        return metric;
      }
      throw new Error(`Metric ${name} already exists with different type`);
    }

    const gauge = new GaugeImpl(name, description, labels);
    this.metrics.set(key, gauge);
    return gauge;
  }

  /**
   * Create or get histogram metric
   */
  histogram(
    name: string,
    description: string,
    buckets?: number[],
    labels: Record<string, string> = {}
  ): HistogramImpl {
    const key = this.getMetricKey(name, labels);
    
    if (this.metrics.has(key)) {
      const metric = this.metrics.get(key);
      if (metric instanceof HistogramImpl) {
        return metric;
      }
      throw new Error(`Metric ${name} already exists with different type`);
    }

    const histogram = new HistogramImpl(name, description, buckets, labels);
    this.metrics.set(key, histogram);
    return histogram;
  }

  /**
   * Create or get summary metric
   */
  summary(
    name: string,
    description: string,
    quantiles?: number[],
    labels: Record<string, string> = {}
  ): SummaryImpl {
    const key = this.getMetricKey(name, labels);
    
    if (this.metrics.has(key)) {
      const metric = this.metrics.get(key);
      if (metric instanceof SummaryImpl) {
        return metric;
      }
      throw new Error(`Metric ${name} already exists with different type`);
    }

    const summary = new SummaryImpl(name, description, quantiles, labels);
    this.metrics.set(key, summary);
    return summary;
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  /**
   * Get all metrics
   */
  getAllMetrics(): Metric[] {
    const metricsArray = Array.from(this.metrics.values());
    return metricsArray.map(metric => metric.export());
  }

  /**
   * Get metrics by name pattern
   */
  getMetricsByName(namePattern: string): Metric[] {
    const regex = new RegExp(namePattern);
    const metricsArray = Array.from(this.metrics.values());
    return metricsArray
      .filter(metric => regex.test(metric.getMetadata().name))
      .map(metric => metric.export());
  }

  /**
   * Get metrics by labels
   */
  getMetricsByLabels(labelFilters: Record<string, string>): Metric[] {
    const metricsArray = Array.from(this.metrics.values());
    return metricsArray
      .filter(metric => {
        const labels = metric.getMetadata().labels;
        return Object.entries(labelFilters).every(([key, value]) => 
          labels[key] === value
        );
      })
      .map(metric => metric.export());
  }

  /**
   * Aggregate metrics
   */
  aggregateMetrics(
    namePattern: string,
    config: AggregationConfig,
    timeRange?: TimeRange
  ): Record<string, number> {
    const metrics = this.getMetricsByName(namePattern);
    const results: Record<string, number> = {};

    for (const metric of metrics) {
      const groupKey = this.getGroupKey(metric.labels, config.groupBy || []);
      
      if (!results[groupKey]) {
        results[groupKey] = 0;
      }

      switch (config.function) {
        case 'count':
          results[groupKey]++;
          break;
        case 'sum':
          results[groupKey] += metric.value;
          break;
        case 'avg':
          // Simplified average calculation
          results[groupKey] = (results[groupKey] + metric.value) / 2;
          break;
        case 'min':
          results[groupKey] = Math.min(results[groupKey] || Infinity, metric.value);
          break;
        case 'max':
          results[groupKey] = Math.max(results[groupKey] || -Infinity, metric.value);
          break;
      }
    }

    return results;
  }

  /**
   * Generate group key for aggregation
   */
  private getGroupKey(labels: Record<string, string>, groupBy: string[]): string {
    if (groupBy.length === 0) {
      return 'total';
    }
    
    return groupBy
      .map(key => `${key}=${labels[key] || 'unknown'}`)
      .join(',');
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = [];
    const metricsArray = Array.from(this.metrics.values());
    
    for (const metric of metricsArray) {
      const exported = metric.export();
      const metadata = metric.getMetadata();
      
      // Add help comment
      lines.push(`# HELP ${metadata.name} ${metadata.description}`);
      lines.push(`# TYPE ${metadata.name} ${metadata.type}`);
      
      // Add metric value
      const labelsStr = Object.entries(exported.labels)
        .map(([key, value]) => `${key}="${value}"`)
        .join(',');
      
      if (exported.type === 'histogram') {
        const histogramMetric = exported as HistogramMetric;
        // Add bucket metrics
        histogramMetric.buckets.forEach((bucket, index) => {
          const bucketLabels = labelsStr ? `${labelsStr},le="${bucket}"` : `le="${bucket}"`;
          lines.push(`${metadata.name}_bucket{${bucketLabels}} ${histogramMetric.counts[index]}`);
        });
        lines.push(`${metadata.name}_count{${labelsStr}} ${histogramMetric.count}`);
        lines.push(`${metadata.name}_sum{${labelsStr}} ${histogramMetric.sum}`);
      } else if (exported.type === 'summary') {
        const summaryMetric = exported as SummaryMetric;
        // Add quantile metrics
        Object.entries(summaryMetric.quantiles).forEach(([quantile, value]) => {
          const quantileLabels = labelsStr ? `${labelsStr},quantile="${quantile}"` : `quantile="${quantile}"`;
          lines.push(`${metadata.name}{${quantileLabels}} ${value}`);
        });
        lines.push(`${metadata.name}_count{${labelsStr}} ${summaryMetric.count}`);
        lines.push(`${metadata.name}_sum{${labelsStr}} ${summaryMetric.sum}`);
      } else {
        lines.push(`${metadata.name}{${labelsStr}} ${exported.value}`);
      }
      
      lines.push(''); // Empty line between metrics
    }
    
    return lines.join('\n');
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get metrics count
   */
  getMetricsCount(): number {
    return this.metrics.size;
  }
}

// ============================================================================
// Pre-defined Application Metrics
// ============================================================================

/**
 * Application metrics collection
 */
export class ApplicationMetrics {
  private registry: MetricsRegistry;

  // API Metrics
  public readonly httpRequestsTotal: CounterImpl;
  public readonly httpRequestDuration: HistogramImpl;
  public readonly httpRequestsInFlight: GaugeImpl;

  // OAuth Metrics  
  public readonly oauthFlowsTotal: CounterImpl;
  public readonly oauthFlowDuration: HistogramImpl;
  public readonly oauthTokensActive: GaugeImpl;

  // External API Metrics
  public readonly externalApiRequestsTotal: CounterImpl;
  public readonly externalApiRequestDuration: HistogramImpl;
  public readonly externalApiErrors: CounterImpl;
  public readonly externalApiQuotaUsage: GaugeImpl;

  // System Metrics
  public readonly memoryUsage: GaugeImpl;
  public readonly cpuUsage: GaugeImpl;
  public readonly activeConnections: GaugeImpl;

  constructor(registry: MetricsRegistry) {
    this.registry = registry;

    // Initialize API metrics
    this.httpRequestsTotal = registry.counter(
      'http_requests_total',
      'Total number of HTTP requests'
    );
    
    this.httpRequestDuration = registry.histogram(
      'http_request_duration_seconds',
      'HTTP request duration in seconds',
      [0.1, 0.25, 0.5, 1, 2.5, 5, 10]
    );
    
    this.httpRequestsInFlight = registry.gauge(
      'http_requests_in_flight',
      'Current number of HTTP requests being processed'
    );

    // Initialize OAuth metrics
    this.oauthFlowsTotal = registry.counter(
      'oauth_flows_total',
      'Total number of OAuth flows completed'
    );
    
    this.oauthFlowDuration = registry.histogram(
      'oauth_flow_duration_seconds',
      'OAuth flow completion time in seconds'
    );
    
    this.oauthTokensActive = registry.gauge(
      'oauth_tokens_active',
      'Number of active OAuth tokens'
    );

    // Initialize external API metrics
    this.externalApiRequestsTotal = registry.counter(
      'external_api_requests_total',
      'Total number of external API requests'
    );
    
    this.externalApiRequestDuration = registry.histogram(
      'external_api_request_duration_seconds',
      'External API request duration in seconds'
    );
    
    this.externalApiErrors = registry.counter(
      'external_api_errors_total',
      'Total number of external API errors'
    );
    
    this.externalApiQuotaUsage = registry.gauge(
      'external_api_quota_usage_percent',
      'External API quota usage percentage'
    );

    // Initialize system metrics
    this.memoryUsage = registry.gauge(
      'memory_usage_bytes',
      'Current memory usage in bytes'
    );
    
    this.cpuUsage = registry.gauge(
      'cpu_usage_percent',
      'Current CPU usage percentage'
    );
    
    this.activeConnections = registry.gauge(
      'active_connections',
      'Number of active connections'
    );
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    const labels = { method, path, status: statusCode.toString() };
    
    this.httpRequestsTotal.inc(1, labels);
    this.httpRequestDuration.observe(duration / 1000, labels); // Convert to seconds
  }

  /**
   * Record OAuth flow
   */
  recordOAuthFlow(
    provider: string,
    operation: string,
    success: boolean,
    duration: number
  ): void {
    const labels = { 
      provider, 
      operation, 
      status: success ? 'success' : 'failure' 
    };
    
    this.oauthFlowsTotal.inc(1, labels);
    this.oauthFlowDuration.observe(duration / 1000, labels);
  }

  /**
   * Record external API request
   */
  recordExternalApiRequest(
    service: string,
    endpoint: string,
    success: boolean,
    duration: number
  ): void {
    const labels = { 
      service, 
      endpoint, 
      status: success ? 'success' : 'failure' 
    };
    
    this.externalApiRequestsTotal.inc(1, labels);
    this.externalApiRequestDuration.observe(duration / 1000, labels);
    
    if (!success) {
      this.externalApiErrors.inc(1, labels);
    }
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics(): void {
    // Update memory usage
    const memUsage = process.memoryUsage();
    this.memoryUsage.set(memUsage.heapUsed);
    
    // Update CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    this.cpuUsage.set((cpuUsage.user + cpuUsage.system) / 1000000); // Convert to percentage
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global metrics registry instance
 */
export const metricsRegistry = new MetricsRegistry();

/**
 * Global application metrics instance
 */
export const applicationMetrics = new ApplicationMetrics(metricsRegistry);

// Start system metrics collection
setInterval(() => {
  applicationMetrics.updateSystemMetrics();
}, 5000); // Update every 5 seconds