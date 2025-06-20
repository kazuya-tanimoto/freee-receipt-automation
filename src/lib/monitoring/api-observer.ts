/**
 * API Observer for Monitoring and Observability
 * 
 * Comprehensive API monitoring system that tracks requests, responses, errors,
 * and performance metrics across all services including Gmail and Drive integrations.
 */

import type {
  LogEntry,
  LogLevel,
  ServiceName,
  HttpMethod,
  RequestContext,
  ResponseContext,
  ErrorContext,
  OAuthContext,
  ExternalApiContext,
  MonitoringEvent,
  MonitoringEventType,
  ApiPerformanceMetrics,
  RateLimitMetrics,
  ExternalApiMetrics,
  Alert,
  AlertRule,
  AlertSeverity,
  HealthCheck,
  SystemHealth,
  TimeRange,
  QueryFilters,
  PaginationParams
} from './types';

// ============================================================================
// Logger Class
// ============================================================================

/**
 * Structured logger for API monitoring
 */
export class ApiLogger {
  private serviceName: ServiceName;
  private environment: string;
  private logLevel: LogLevel;

  constructor(serviceName: ServiceName, environment: string = 'development', logLevel: LogLevel = 'info') {
    this.serviceName = serviceName;
    this.environment = environment;
    this.logLevel = logLevel;
  }

  /**
   * Log levels hierarchy for filtering
   */
  private static LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4
  };

  /**
   * Check if log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    return ApiLogger.LOG_LEVELS[level] >= ApiLogger.LOG_LEVELS[this.logLevel];
  }

  /**
   * Create base log entry
   */
  private createBaseEntry(level: LogLevel, message: string): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      environment: this.environment
    };
  }

  /**
   * Log structured entry
   */
  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // In production, this would be sent to a logging service
    // For now, we'll use console with structured output
    const logOutput = {
      ...entry,
      // Add correlation ID for request tracing
      correlationId: entry.request?.requestId || this.generateCorrelationId()
    };

    switch (entry.level) {
      case 'debug':
        console.debug(JSON.stringify(logOutput));
        break;
      case 'info':
        console.info(JSON.stringify(logOutput));
        break;
      case 'warn':
        console.warn(JSON.stringify(logOutput));
        break;
      case 'error':
      case 'fatal':
        console.error(JSON.stringify(logOutput));
        break;
    }
  }

  /**
   * Generate correlation ID for request tracing
   */
  private generateCorrelationId(): string {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // Public Logging Methods
  // ============================================================================

  /**
   * Log API request
   */
  logRequest(
    level: LogLevel,
    message: string,
    request: RequestContext,
    metadata?: Record<string, unknown>
  ): void {
    const entry = this.createBaseEntry(level, message);
    entry.request = request;
    entry.metadata = metadata;
    this.log(entry);
  }

  /**
   * Log API response
   */
  logResponse(
    level: LogLevel,
    message: string,
    request: RequestContext,
    response: ResponseContext,
    metadata?: Record<string, unknown>
  ): void {
    const entry = this.createBaseEntry(level, message);
    entry.request = request;
    entry.response = response;
    entry.metadata = metadata;
    this.log(entry);
  }

  /**
   * Log API error
   */
  logError(
    message: string,
    error: ErrorContext,
    request?: RequestContext,
    metadata?: Record<string, unknown>
  ): void {
    const entry = this.createBaseEntry('error', message);
    entry.error = error;
    entry.request = request;
    entry.metadata = metadata;
    this.log(entry);
  }

  /**
   * Log OAuth operation
   */
  logOAuth(
    level: LogLevel,
    message: string,
    oauth: OAuthContext,
    request?: RequestContext,
    metadata?: Record<string, unknown>
  ): void {
    const entry = this.createBaseEntry(level, message);
    entry.oauth = oauth;
    entry.request = request;
    entry.metadata = metadata;
    this.log(entry);
  }

  /**
   * Log external API call
   */
  logExternalApi(
    level: LogLevel,
    message: string,
    externalApi: ExternalApiContext,
    request?: RequestContext,
    metadata?: Record<string, unknown>
  ): void {
    const entry = this.createBaseEntry(level, message);
    entry.externalApi = externalApi;
    entry.request = request;
    entry.metadata = metadata;
    this.log(entry);
  }

  /**
   * Log general information
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createBaseEntry('info', message);
    entry.metadata = metadata;
    this.log(entry);
  }

  /**
   * Log warning
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createBaseEntry('warn', message);
    entry.metadata = metadata;
    this.log(entry);
  }

  /**
   * Log debug information
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    const entry = this.createBaseEntry('debug', message);
    entry.metadata = metadata;
    this.log(entry);
  }

  /**
   * Log fatal error
   */
  fatal(message: string, error?: ErrorContext, metadata?: Record<string, unknown>): void {
    const entry = this.createBaseEntry('fatal', message);
    entry.error = error;
    entry.metadata = metadata;
    this.log(entry);
  }
}

// ============================================================================
// Metrics Collector Class
// ============================================================================

/**
 * Metrics collector for API performance monitoring
 */
export class MetricsCollector {
  private metrics: Map<string, ApiPerformanceMetrics> = new Map();
  private rateLimits: Map<string, RateLimitMetrics> = new Map();
  private externalApis: Map<string, ExternalApiMetrics> = new Map();
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];

  constructor() {
    this.initializeDefaultAlertRules();
    this.startMetricsAggregation();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds 5%',
        condition: 'error_rate_high',
        severity: 'warning',
        threshold: 5,
        timeWindow: 300, // 5 minutes
        services: ['api', 'gmail', 'drive'],
        enabled: true,
        notificationChannels: ['email', 'slack']
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time',
        description: 'Alert when P95 response time exceeds 2 seconds',
        condition: 'response_time_slow',
        severity: 'warning',
        threshold: 2000,
        timeWindow: 300,
        services: ['api', 'gmail', 'drive'],
        enabled: true,
        notificationChannels: ['email']
      },
      {
        id: 'rate-limit-approaching',
        name: 'Rate Limit Approaching',
        description: 'Alert when rate limit usage exceeds 80%',
        condition: 'rate_limit_approaching',
        severity: 'warning',
        threshold: 80,
        timeWindow: 60,
        services: ['gmail', 'drive'],
        enabled: true,
        notificationChannels: ['slack']
      },
      {
        id: 'quota-exhausted',
        name: 'API Quota Exhausted',
        description: 'Alert when API quota is exhausted',
        condition: 'quota_exhausted',
        severity: 'critical',
        threshold: 95,
        timeWindow: 60,
        services: ['gmail', 'drive'],
        enabled: true,
        notificationChannels: ['email', 'slack', 'pagerduty']
      }
    ];
  }

  /**
   * Start metrics aggregation interval
   */
  private startMetricsAggregation(): void {
    // Aggregate metrics every minute
    setInterval(() => {
      this.aggregateMetrics();
      this.evaluateAlertRules();
    }, 60000);
  }

  /**
   * Record API request metrics
   */
  recordApiRequest(
    endpoint: string,
    method: HttpMethod,
    statusCode: number,
    responseTime: number,
    userId?: string
  ): void {
    const key = `${method}:${endpoint}`;
    const now = new Date().toISOString();
    
    const existing = this.metrics.get(key);
    if (existing) {
      existing.requestCount++;
      if (statusCode >= 400) {
        existing.errorCount++;
      }
      existing.errorRate = (existing.errorCount / existing.requestCount) * 100;
      
      // Update response time statistics (simplified)
      const totalTime = existing.avgResponseTime * (existing.requestCount - 1) + responseTime;
      existing.avgResponseTime = totalTime / existing.requestCount;
      
      // Update percentiles (simplified - in production use proper histogram)
      existing.p95ResponseTime = Math.max(existing.p95ResponseTime, responseTime);
      existing.p99ResponseTime = Math.max(existing.p99ResponseTime, responseTime);
    } else {
      this.metrics.set(key, {
        endpoint,
        method,
        requestCount: 1,
        errorCount: statusCode >= 400 ? 1 : 0,
        errorRate: statusCode >= 400 ? 100 : 0,
        avgResponseTime: responseTime,
        p95ResponseTime: responseTime,
        p99ResponseTime: responseTime,
        requestsPerSecond: 0, // Calculated during aggregation
        timeWindow: {
          start: now,
          end: now
        }
      });
    }
  }

  /**
   * Record rate limit metrics
   */
  recordRateLimit(
    service: string,
    identifier: string,
    currentCount: number,
    limit: number,
    windowSeconds: number
  ): void {
    const key = `${service}:${identifier}`;
    const now = new Date();
    
    this.rateLimits.set(key, {
      service,
      identifier,
      currentCount,
      limit,
      windowSeconds,
      windowStart: now.toISOString(),
      exceeded: currentCount >= limit
    });
  }

  /**
   * Record external API metrics
   */
  recordExternalApi(
    service: 'gmail' | 'drive',
    endpoint: string,
    success: boolean,
    responseTime: number,
    quotaUsed?: number,
    quotaTotal?: number,
    rateLimitRemaining?: number,
    rateLimitTotal?: number,
    rateLimitReset?: string
  ): void {
    const key = `${service}:${endpoint}`;
    
    const existing = this.externalApis.get(key);
    if (existing) {
      existing.requestCount++;
      if (!success) {
        existing.errorCount++;
      }
      existing.successRate = ((existing.requestCount - existing.errorCount) / existing.requestCount) * 100;
      
      const totalTime = existing.avgResponseTime * (existing.requestCount - 1) + responseTime;
      existing.avgResponseTime = totalTime / existing.requestCount;
      
      if (quotaUsed !== undefined && quotaTotal !== undefined) {
        existing.quotaUsage = {
          used: quotaUsed,
          total: quotaTotal,
          percentage: (quotaUsed / quotaTotal) * 100
        };
      }
      
      if (rateLimitRemaining !== undefined && rateLimitTotal !== undefined) {
        existing.rateLimit = {
          remaining: rateLimitRemaining,
          total: rateLimitTotal,
          resetTime: rateLimitReset || new Date().toISOString()
        };
      }
    } else {
      this.externalApis.set(key, {
        service,
        endpoint,
        requestCount: 1,
        errorCount: success ? 0 : 1,
        successRate: success ? 100 : 0,
        avgResponseTime: responseTime,
        quotaUsage: quotaUsed !== undefined && quotaTotal !== undefined ? {
          used: quotaUsed,
          total: quotaTotal,
          percentage: (quotaUsed / quotaTotal) * 100
        } : undefined,
        rateLimit: rateLimitRemaining !== undefined && rateLimitTotal !== undefined ? {
          remaining: rateLimitRemaining,
          total: rateLimitTotal,
          resetTime: rateLimitReset || new Date().toISOString()
        } : undefined
      });
    }
  }

  /**
   * Aggregate metrics for time windows
   */
  private aggregateMetrics(): void {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    const metricsArray = Array.from(this.metrics.entries());
    for (const [key, metrics] of metricsArray) {
      // Calculate requests per second
      const timeWindowMs = now.getTime() - new Date(metrics.timeWindow.start).getTime();
      metrics.requestsPerSecond = (metrics.requestCount / (timeWindowMs / 1000));
      
      // Update time window end
      metrics.timeWindow.end = now.toISOString();
    }
  }

  /**
   * Evaluate alert rules and trigger alerts
   */
  private evaluateAlertRules(): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;
      
      switch (rule.condition) {
        case 'error_rate_high':
          this.evaluateErrorRateAlerts(rule);
          break;
        case 'response_time_slow':
          this.evaluateResponseTimeAlerts(rule);
          break;
        case 'rate_limit_approaching':
          this.evaluateRateLimitAlerts(rule);
          break;
        case 'quota_exhausted':
          this.evaluateQuotaAlerts(rule);
          break;
      }
    }
  }

  /**
   * Evaluate error rate alerts
   */
  private evaluateErrorRateAlerts(rule: AlertRule): void {
    const metricsArray = Array.from(this.metrics.entries());
    for (const [key, metrics] of metricsArray) {
      if (metrics.errorRate > rule.threshold) {
        this.createAlert(rule, {
          endpoint: metrics.endpoint,
          method: metrics.method,
          errorRate: metrics.errorRate,
          threshold: rule.threshold
        });
      }
    }
  }

  /**
   * Evaluate response time alerts
   */
  private evaluateResponseTimeAlerts(rule: AlertRule): void {
    const metricsArray = Array.from(this.metrics.entries());
    for (const [key, metrics] of metricsArray) {
      if (metrics.p95ResponseTime > rule.threshold) {
        this.createAlert(rule, {
          endpoint: metrics.endpoint,
          method: metrics.method,
          p95ResponseTime: metrics.p95ResponseTime,
          threshold: rule.threshold
        });
      }
    }
  }

  /**
   * Evaluate rate limit alerts
   */
  private evaluateRateLimitAlerts(rule: AlertRule): void {
    const rateLimitsArray = Array.from(this.rateLimits.entries());
    for (const [key, metrics] of rateLimitsArray) {
      const usage = (metrics.currentCount / metrics.limit) * 100;
      if (usage > rule.threshold) {
        this.createAlert(rule, {
          service: metrics.service,
          identifier: metrics.identifier,
          usage,
          threshold: rule.threshold
        });
      }
    }
  }

  /**
   * Evaluate quota alerts
   */
  private evaluateQuotaAlerts(rule: AlertRule): void {
    const externalApisArray = Array.from(this.externalApis.entries());
    for (const [key, metrics] of externalApisArray) {
      if (metrics.quotaUsage && metrics.quotaUsage.percentage > rule.threshold) {
        this.createAlert(rule, {
          service: metrics.service,
          endpoint: metrics.endpoint,
          quotaUsage: metrics.quotaUsage.percentage,
          threshold: rule.threshold
        });
      }
    }
  }

  /**
   * Create alert
   */
  private createAlert(rule: AlertRule, details: Record<string, unknown>): void {
    const alertId = `${rule.id}-${Date.now()}`;
    
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      severity: rule.severity,
      message: `${rule.name}: ${rule.description}`,
      details,
      timestamp: new Date().toISOString(),
      resolved: false,
      services: rule.services
    };
    
    this.alerts.push(alert);
    
    // In production, send notifications through configured channels
    console.warn(`ALERT: ${alert.message}`, alert.details);
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  /**
   * Get API performance metrics
   */
  getApiMetrics(timeRange?: TimeRange, filters?: QueryFilters): ApiPerformanceMetrics[] {
    const results = Array.from(this.metrics.values());
    
    // Apply filters (simplified implementation)
    return results.filter(metric => {
      if (filters?.search) {
        return metric.endpoint.includes(filters.search);
      }
      return true;
    });
  }

  /**
   * Get rate limit metrics
   */
  getRateLimitMetrics(): RateLimitMetrics[] {
    return Array.from(this.rateLimits.values());
  }

  /**
   * Get external API metrics
   */
  getExternalApiMetrics(): ExternalApiMetrics[] {
    return Array.from(this.externalApis.values());
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get alert history
   */
  getAlertHistory(pagination?: PaginationParams): Alert[] {
    const sortedAlerts = this.alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (pagination) {
      const start = (pagination.page - 1) * pagination.limit;
      const end = start + pagination.limit;
      return sortedAlerts.slice(start, end);
    }
    
    return sortedAlerts;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

// ============================================================================
// Health Check Monitor
// ============================================================================

/**
 * Health check monitor for system status
 */
export class HealthCheckMonitor {
  private checks: Map<string, HealthCheck> = new Map();
  
  /**
   * Register health check
   */
  registerCheck(name: string, checkFn: () => Promise<HealthCheck>): void {
    // Execute immediately on registration
    this.executeHealthCheck(name, checkFn);
    
    // Store check function for periodic execution
    setInterval(async () => {
      await this.executeHealthCheck(name, checkFn);
    }, 30000); // Run every 30 seconds
  }

  /**
   * Execute health check
   */
  private async executeHealthCheck(name: string, checkFn: () => Promise<HealthCheck>): Promise<void> {
    try {
      const result = await checkFn();
      this.checks.set(name, result);
    } catch (error) {
      this.checks.set(name, {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Health check failed',
        duration: 0,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const checks = Array.from(this.checks.values());
    const unhealthyChecks = checks.filter(check => check.status === 'unhealthy');
    const degradedChecks = checks.filter(check => check.status === 'degraded');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyChecks.length > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedChecks.length > 0) {
      overallStatus = 'degraded';
    }
    
    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime()
    };
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

/**
 * Global API observer instance
 */
export const apiObserver = {
  logger: new ApiLogger('api'),
  metrics: new MetricsCollector(),
  health: new HealthCheckMonitor()
};

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create logger for specific service
 */
export function createLogger(service: ServiceName, environment?: string): ApiLogger {
  return new ApiLogger(service, environment);
}

/**
 * Record API request
 */
export function recordApiRequest(
  endpoint: string,
  method: HttpMethod,
  statusCode: number,
  responseTime: number,
  userId?: string
): void {
  apiObserver.metrics.recordApiRequest(endpoint, method, statusCode, responseTime, userId);
}

/**
 * Record external API call
 */
export function recordExternalApiCall(
  service: 'gmail' | 'drive',
  endpoint: string,
  success: boolean,
  responseTime: number,
  additionalMetrics?: {
    quotaUsed?: number;
    quotaTotal?: number;
    rateLimitRemaining?: number;
    rateLimitTotal?: number;
    rateLimitReset?: string;
  }
): void {
  apiObserver.metrics.recordExternalApi(
    service,
    endpoint,
    success,
    responseTime,
    additionalMetrics?.quotaUsed,
    additionalMetrics?.quotaTotal,
    additionalMetrics?.rateLimitRemaining,
    additionalMetrics?.rateLimitTotal,
    additionalMetrics?.rateLimitReset
  );
}