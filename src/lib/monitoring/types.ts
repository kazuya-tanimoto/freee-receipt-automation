/**
 * Monitoring and Observability Type Definitions
 * 
 * Comprehensive type definitions for API monitoring, metrics collection,
 * and observability infrastructure.
 */

// ============================================================================
// Core Monitoring Types
// ============================================================================

/**
 * Log levels for structured logging
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Service identifiers for monitoring
 */
export type ServiceName = 'gmail' | 'drive' | 'oauth' | 'api' | 'supabase';

/**
 * HTTP methods for API monitoring
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

/**
 * Metric types for different measurement approaches
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

// ============================================================================
// Structured Logging Types
// ============================================================================

/**
 * Base log entry structure
 */
export interface BaseLogEntry {
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Timestamp in ISO format */
  timestamp: string;
  /** Service that generated the log */
  service: ServiceName;
  /** Environment (development, staging, production) */
  environment: string;
}

/**
 * Request context for API logs
 */
export interface RequestContext {
  /** Unique request identifier */
  requestId: string;
  /** HTTP method */
  method: HttpMethod;
  /** Request path */
  path: string;
  /** User agent string */
  userAgent?: string;
  /** Client IP address */
  clientIp?: string;
  /** User ID (if authenticated) */
  userId?: string;
  /** Session ID */
  sessionId?: string;
}

/**
 * Response context for API logs
 */
export interface ResponseContext {
  /** HTTP status code */
  statusCode: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Response time in milliseconds */
  responseTime: number;
  /** Whether response was from cache */
  cached?: boolean;
}

/**
 * Error context for error logs
 */
export interface ErrorContext {
  /** Error name/type */
  name: string;
  /** Error message */
  message: string;
  /** Error stack trace */
  stack?: string;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * OAuth operation context
 */
export interface OAuthContext {
  /** OAuth provider */
  provider: string;
  /** OAuth operation type */
  operation: 'initiate' | 'callback' | 'refresh' | 'revoke';
  /** Requested/granted scopes */
  scopes?: string[];
  /** Token expiry time */
  expiresIn?: number;
}

/**
 * External API operation context
 */
export interface ExternalApiContext {
  /** External service name */
  service: 'gmail' | 'drive';
  /** API endpoint called */
  endpoint: string;
  /** Operation type */
  operation: string;
  /** API response code */
  apiStatusCode?: number;
  /** Rate limit information */
  rateLimit?: {
    remaining: number;
    limit: number;
    resetAt: string;
  };
  /** Quota information */
  quota?: {
    used: number;
    total: number;
  };
}

/**
 * Complete log entry with all possible contexts
 */
export interface LogEntry extends BaseLogEntry {
  /** Request context */
  request?: RequestContext;
  /** Response context */
  response?: ResponseContext;
  /** Error context */
  error?: ErrorContext;
  /** OAuth context */
  oauth?: OAuthContext;
  /** External API context */
  externalApi?: ExternalApiContext;
  /** Additional structured data */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Metrics Types
// ============================================================================

/**
 * Base metric structure
 */
export interface BaseMetric {
  /** Metric name */
  name: string;
  /** Metric type */
  type: MetricType;
  /** Metric value */
  value: number;
  /** Metric timestamp */
  timestamp: string;
  /** Metric labels/tags */
  labels: Record<string, string>;
  /** Optional description */
  description?: string;
}

/**
 * Counter metric for counting events
 */
export interface CounterMetric extends BaseMetric {
  type: 'counter';
  /** Counter increment amount */
  increment: number;
}

/**
 * Gauge metric for current values
 */
export interface GaugeMetric extends BaseMetric {
  type: 'gauge';
  /** Current gauge value */
  value: number;
}

/**
 * Histogram metric for distributions
 */
export interface HistogramMetric extends BaseMetric {
  type: 'histogram';
  /** Histogram buckets */
  buckets: number[];
  /** Values in each bucket */
  counts: number[];
  /** Sum of all values */
  sum: number;
  /** Total count of observations */
  count: number;
}

/**
 * Summary metric for percentiles
 */
export interface SummaryMetric extends BaseMetric {
  type: 'summary';
  /** Quantile values (p50, p95, p99, etc.) */
  quantiles: Record<string, number>;
  /** Sum of all values */
  sum: number;
  /** Total count of observations */
  count: number;
}

/**
 * Union type for all metrics
 */
export type Metric = CounterMetric | GaugeMetric | HistogramMetric | SummaryMetric;

// ============================================================================
// API Monitoring Types
// ============================================================================

/**
 * API endpoint monitoring configuration
 */
export interface ApiEndpointConfig {
  /** Endpoint pattern */
  pattern: string;
  /** Service name */
  service: ServiceName;
  /** Whether to collect detailed metrics */
  collectDetailedMetrics: boolean;
  /** Response time SLA in milliseconds */
  responseTimeSla?: number;
  /** Error rate threshold (percentage) */
  errorRateThreshold?: number;
  /** Whether endpoint is critical */
  critical: boolean;
}

/**
 * API performance metrics
 */
export interface ApiPerformanceMetrics {
  /** Endpoint pattern */
  endpoint: string;
  /** HTTP method */
  method: HttpMethod;
  /** Total request count */
  requestCount: number;
  /** Error count */
  errorCount: number;
  /** Error rate percentage */
  errorRate: number;
  /** Average response time in milliseconds */
  avgResponseTime: number;
  /** 95th percentile response time */
  p95ResponseTime: number;
  /** 99th percentile response time */
  p99ResponseTime: number;
  /** Requests per second */
  requestsPerSecond: number;
  /** Time window for these metrics */
  timeWindow: {
    start: string;
    end: string;
  };
}

/**
 * Rate limiting metrics
 */
export interface RateLimitMetrics {
  /** Service/API being rate limited */
  service: string;
  /** User or client identifier */
  identifier: string;
  /** Current request count */
  currentCount: number;
  /** Rate limit threshold */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Window start time */
  windowStart: string;
  /** Whether rate limit was exceeded */
  exceeded: boolean;
}

/**
 * External API monitoring metrics
 */
export interface ExternalApiMetrics {
  /** External service name */
  service: 'gmail' | 'drive';
  /** API endpoint */
  endpoint: string;
  /** Request count */
  requestCount: number;
  /** Error count */
  errorCount: number;
  /** Success rate percentage */
  successRate: number;
  /** Average response time */
  avgResponseTime: number;
  /** Quota usage metrics */
  quotaUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  /** Rate limit metrics */
  rateLimit?: {
    remaining: number;
    total: number;
    resetTime: string;
  };
}

// ============================================================================
// Alert Types
// ============================================================================

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Alert conditions
 */
export type AlertCondition = 
  | 'threshold_exceeded'
  | 'rate_limit_approaching'
  | 'error_rate_high'
  | 'response_time_slow'
  | 'service_unavailable'
  | 'quota_exhausted';

/**
 * Alert rule configuration
 */
export interface AlertRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Alert condition */
  condition: AlertCondition;
  /** Alert severity */
  severity: AlertSeverity;
  /** Threshold value */
  threshold: number;
  /** Time window for evaluation */
  timeWindow: number;
  /** Services to monitor */
  services: ServiceName[];
  /** Whether rule is enabled */
  enabled: boolean;
  /** Notification channels */
  notificationChannels: string[];
}

/**
 * Alert instance
 */
export interface Alert {
  /** Alert identifier */
  id: string;
  /** Rule that triggered the alert */
  ruleId: string;
  /** Alert severity */
  severity: AlertSeverity;
  /** Alert message */
  message: string;
  /** Alert details */
  details: Record<string, unknown>;
  /** Alert timestamp */
  timestamp: string;
  /** Whether alert is resolved */
  resolved: boolean;
  /** Resolution timestamp */
  resolvedAt?: string;
  /** Services affected */
  services: ServiceName[];
}

// ============================================================================
// Health Check Types
// ============================================================================

/**
 * Health check status
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Individual health check result
 */
export interface HealthCheck {
  /** Check name */
  name: string;
  /** Check status */
  status: HealthStatus;
  /** Check message */
  message?: string;
  /** Check duration in milliseconds */
  duration: number;
  /** Check timestamp */
  timestamp: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Overall system health
 */
export interface SystemHealth {
  /** Overall status */
  status: HealthStatus;
  /** Individual checks */
  checks: HealthCheck[];
  /** Health check timestamp */
  timestamp: string;
  /** Version information */
  version: string;
  /** Uptime in seconds */
  uptime: number;
}

// ============================================================================
// Dashboard Types
// ============================================================================

/**
 * Dashboard widget types
 */
export type WidgetType = 
  | 'metric_chart'
  | 'alert_list'
  | 'health_status'
  | 'error_rate'
  | 'response_time'
  | 'request_volume'
  | 'quota_usage';

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  /** Widget identifier */
  id: string;
  /** Widget type */
  type: WidgetType;
  /** Widget title */
  title: string;
  /** Widget configuration */
  config: Record<string, unknown>;
  /** Widget position */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Dashboard configuration
 */
export interface Dashboard {
  /** Dashboard identifier */
  id: string;
  /** Dashboard name */
  name: string;
  /** Dashboard description */
  description?: string;
  /** Dashboard widgets */
  widgets: DashboardWidget[];
  /** Dashboard metadata */
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  /** Whether monitoring is enabled */
  enabled: boolean;
  /** Log level threshold */
  logLevel: LogLevel;
  /** Services to monitor */
  services: ServiceName[];
  /** Metrics collection interval in seconds */
  metricsInterval: number;
  /** Log retention period in days */
  logRetentionDays: number;
  /** Metrics retention period in days */
  metricsRetentionDays: number;
  /** Alert rules */
  alertRules: AlertRule[];
  /** API endpoint configurations */
  apiEndpoints: ApiEndpointConfig[];
  /** External services configuration */
  externalServices: {
    gmail: {
      quotaThreshold: number;
      rateLimitThreshold: number;
    };
    drive: {
      quotaThreshold: number;
      rateLimitThreshold: number;
    };
  };
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Monitoring event types
 */
export type MonitoringEventType = 
  | 'api_request'
  | 'api_response'
  | 'api_error'
  | 'oauth_flow'
  | 'external_api_call'
  | 'rate_limit_hit'
  | 'quota_exceeded'
  | 'health_check'
  | 'system_startup'
  | 'system_shutdown';

/**
 * Monitoring event
 */
export interface MonitoringEvent {
  /** Event type */
  type: MonitoringEventType;
  /** Event timestamp */
  timestamp: string;
  /** Event source service */
  service: ServiceName;
  /** Event data */
  data: Record<string, unknown>;
  /** Event severity */
  severity: LogLevel;
  /** Event message */
  message: string;
  /** Event correlation ID */
  correlationId?: string;
}

// ============================================================================
// Export Types
// ============================================================================

/**
 * Export formats for monitoring data
 */
export type ExportFormat = 'json' | 'csv' | 'prometheus' | 'grafana';

/**
 * Export request configuration
 */
export interface ExportRequest {
  /** Export format */
  format: ExportFormat;
  /** Start time for export */
  startTime: string;
  /** End time for export */
  endTime: string;
  /** Services to include */
  services: ServiceName[];
  /** Metrics to include */
  metrics?: string[];
  /** Log levels to include */
  logLevels?: LogLevel[];
  /** Additional filters */
  filters?: Record<string, unknown>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Time range for queries
 */
export interface TimeRange {
  /** Start time */
  start: string;
  /** End time */
  end: string;
  /** Optional timezone */
  timezone?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number;
  /** Items per page */
  limit: number;
  /** Sort field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query filters
 */
export interface QueryFilters {
  /** Service filters */
  services?: ServiceName[];
  /** Log level filters */
  logLevels?: LogLevel[];
  /** User ID filter */
  userId?: string;
  /** Request ID filter */
  requestId?: string;
  /** Text search */
  search?: string;
}

/**
 * Aggregation functions
 */
export type AggregationFunction = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'p50' | 'p95' | 'p99';

/**
 * Aggregation configuration
 */
export interface AggregationConfig {
  /** Field to aggregate */
  field: string;
  /** Aggregation function */
  function: AggregationFunction;
  /** Time interval for aggregation */
  interval?: string;
  /** Group by fields */
  groupBy?: string[];
}