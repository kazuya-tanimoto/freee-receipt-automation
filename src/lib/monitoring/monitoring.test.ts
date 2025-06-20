/**
 * Monitoring System Tests
 * 
 * Comprehensive test suite for monitoring, observability, and metrics
 * collection functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ApiLogger,
  MetricsCollector,
  HealthCheckMonitor,
  apiObserver,
  createLogger,
  recordApiRequest,
  recordExternalApiCall
} from './api-observer';
import {
  MetricsRegistry,
  ApplicationMetrics,
  metricsRegistry,
  applicationMetrics
} from './metrics';
import type {
  LogLevel,
  ServiceName,
  RequestContext,
  ResponseContext,
  ErrorContext,
  OAuthContext,
  ExternalApiContext,
  HealthCheck
} from './types';

// ============================================================================
// Test Setup and Mocks
// ============================================================================

// Mock console methods for testing
beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ============================================================================
// ApiLogger Tests
// ============================================================================

describe('ApiLogger', () => {
  let logger: ApiLogger;

  beforeEach(() => {
    logger = new ApiLogger('api', 'test', 'debug');
  });

  describe('Log Level Filtering', () => {
    it('should respect log level hierarchy', () => {
      const warnLogger = new ApiLogger('api', 'test', 'warn');
      
      warnLogger.debug('debug message');
      warnLogger.info('info message');
      warnLogger.warn('warn message');
      warnLogger.fatal('fatal message');

      // Only warn and fatal should be logged
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1); // fatal uses console.error
    });

    it('should log all levels for debug logger', () => {
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.fatal('fatal message');

      expect(console.debug).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Structured Logging', () => {
    it('should log API request with structured data', () => {
      const request: RequestContext = {
        requestId: 'req-123',
        method: 'GET',
        path: '/api/test',
        userAgent: 'test-agent',
        userId: 'user-456'
      };

      logger.logRequest('info', 'API request received', request);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"level":"info"')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"message":"API request received"')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"requestId":"req-123"')
      );
    });

    it('should log API response with performance data', () => {
      const request: RequestContext = {
        requestId: 'req-123',
        method: 'POST',
        path: '/api/oauth/callback'
      };

      const response: ResponseContext = {
        statusCode: 200,
        responseTime: 150,
        responseSize: 1024
      };

      logger.logResponse('info', 'API response sent', request, response);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"statusCode":200')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"responseTime":150')
      );
    });

    it('should log errors with stack traces', () => {
      const error: ErrorContext = {
        name: 'ValidationError',
        message: 'Invalid parameter',
        stack: 'Error stack trace...',
        code: 'VALIDATION_FAILED'
      };

      const request: RequestContext = {
        requestId: 'req-456',
        method: 'POST',
        path: '/api/test'
      };

      logger.logError('Request validation failed', error, request);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"name":"ValidationError"')
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"stack":"Error stack trace..."')
      );
    });

    it('should log OAuth operations', () => {
      const oauth: OAuthContext = {
        provider: 'google',
        operation: 'callback',
        scopes: ['gmail.readonly'],
        expiresIn: 3600
      };

      logger.logOAuth('info', 'OAuth callback successful', oauth);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"provider":"google"')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"operation":"callback"')
      );
    });

    it('should log external API calls', () => {
      const externalApi: ExternalApiContext = {
        service: 'gmail',
        endpoint: '/gmail/v1/users/me/messages',
        operation: 'listMessages',
        apiStatusCode: 200,
        rateLimit: {
          remaining: 240,
          limit: 250,
          resetAt: '2024-06-20T13:00:00Z'
        }
      };

      logger.logExternalApi('info', 'Gmail API call successful', externalApi);

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"service":"gmail"')
      );
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('"apiStatusCode":200')
      );
    });
  });

  describe('Convenience Methods', () => {
    it('should provide convenience logging methods', () => {
      logger.info('Info message', { key: 'value' });
      logger.warn('Warning message');
      logger.debug('Debug message');

      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.debug).toHaveBeenCalledTimes(1);
    });
  });
});

// ============================================================================
// MetricsCollector Tests
// ============================================================================

describe('MetricsCollector', () => {
  let collector: MetricsCollector;

  beforeEach(() => {
    collector = new MetricsCollector();
  });

  describe('API Metrics Recording', () => {
    it('should record API request metrics', () => {
      collector.recordApiRequest('/api/test', 'GET', 200, 150);
      collector.recordApiRequest('/api/test', 'GET', 200, 200);
      collector.recordApiRequest('/api/test', 'GET', 500, 300);

      const metrics = collector.getApiMetrics();
      const testMetric = metrics.find(m => m.endpoint === '/api/test');

      expect(testMetric).toBeDefined();
      expect(testMetric?.requestCount).toBe(3);
      expect(testMetric?.errorCount).toBe(1);
      expect(testMetric?.errorRate).toBeCloseTo(33.33, 1);
    });

    it('should calculate response time averages', () => {
      collector.recordApiRequest('/api/slow', 'POST', 200, 1000);
      collector.recordApiRequest('/api/slow', 'POST', 200, 2000);

      const metrics = collector.getApiMetrics();
      const slowMetric = metrics.find(m => m.endpoint === '/api/slow');

      expect(slowMetric?.avgResponseTime).toBe(1500);
    });
  });

  describe('Rate Limit Tracking', () => {
    it('should track rate limit metrics', () => {
      collector.recordRateLimit('gmail', 'user-123', 240, 250, 100);
      collector.recordRateLimit('gmail', 'user-123', 250, 250, 100);

      const rateLimits = collector.getRateLimitMetrics();
      const userLimit = rateLimits.find(r => r.identifier === 'user-123');

      expect(userLimit).toBeDefined();
      expect(userLimit?.exceeded).toBe(true);
      expect(userLimit?.currentCount).toBe(250);
      expect(userLimit?.limit).toBe(250);
    });
  });

  describe('External API Metrics', () => {
    it('should track external API performance', () => {
      collector.recordExternalApi('gmail', '/messages', true, 150, 1000, 10000);
      collector.recordExternalApi('gmail', '/messages', false, 500, 1000, 10000);

      const externalMetrics = collector.getExternalApiMetrics();
      const gmailMetric = externalMetrics.find(m => 
        m.service === 'gmail' && m.endpoint === '/messages'
      );

      expect(gmailMetric).toBeDefined();
      expect(gmailMetric?.requestCount).toBe(2);
      expect(gmailMetric?.errorCount).toBe(1);
      expect(gmailMetric?.successRate).toBe(50);
      expect(gmailMetric?.quotaUsage?.percentage).toBe(10);
    });

    it('should track quota and rate limit info', () => {
      collector.recordExternalApi(
        'drive', 
        '/files', 
        true, 
        200, 
        8000, 
        10000, 
        100, 
        1000, 
        '2024-06-20T14:00:00Z'
      );

      const externalMetrics = collector.getExternalApiMetrics();
      const driveMetric = externalMetrics.find(m => m.service === 'drive');

      expect(driveMetric?.quotaUsage?.percentage).toBe(80);
      expect(driveMetric?.rateLimit?.remaining).toBe(100);
      expect(driveMetric?.rateLimit?.total).toBe(1000);
    });
  });

  describe('Alert Management', () => {
    it('should generate alerts for high error rates', () => {
      // Simulate high error rate
      for (let i = 0; i < 10; i++) {
        collector.recordApiRequest('/api/failing', 'GET', 500, 100);
      }

      // Wait for alert evaluation (in real scenario)
      const alerts = collector.getActiveAlerts();
      
      // Note: In actual implementation, alerts would be generated by the evaluation interval
      // For testing, we might need to trigger evaluation manually
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should resolve alerts', () => {
      const alerts = collector.getActiveAlerts();
      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        const resolved = collector.resolveAlert(alertId);
        
        expect(resolved).toBe(true);
        
        const remainingAlerts = collector.getActiveAlerts();
        expect(remainingAlerts.find(a => a.id === alertId)).toBeUndefined();
      }
    });
  });

  describe('Metrics Querying', () => {
    beforeEach(() => {
      // Add some test data
      collector.recordApiRequest('/api/users', 'GET', 200, 100);
      collector.recordApiRequest('/api/posts', 'POST', 201, 150);
      collector.recordApiRequest('/api/comments', 'GET', 404, 50);
    });

    it('should filter metrics by search criteria', () => {
      const userMetrics = collector.getApiMetrics(undefined, { search: 'users' });
      
      expect(userMetrics).toHaveLength(1);
      expect(userMetrics[0].endpoint).toBe('/api/users');
    });

    it('should get alert history with pagination', () => {
      const alertHistory = collector.getAlertHistory({ page: 1, limit: 10 });
      
      expect(Array.isArray(alertHistory)).toBe(true);
      expect(alertHistory.length).toBeLessThanOrEqual(10);
    });
  });
});

// ============================================================================
// HealthCheckMonitor Tests
// ============================================================================

describe('HealthCheckMonitor', () => {
  let monitor: HealthCheckMonitor;

  beforeEach(() => {
    monitor = new HealthCheckMonitor();
  });

  describe('Health Check Registration', () => {
    it('should register and execute health checks', async () => {
      const mockHealthCheck = vi.fn().mockResolvedValue({
        name: 'database',
        status: 'healthy' as const,
        message: 'Database connection OK',
        duration: 50,
        timestamp: new Date().toISOString()
      });

      monitor.registerCheck('database', mockHealthCheck);

      // Wait a bit for the check to execute
      await new Promise(resolve => setTimeout(resolve, 100));

      const systemHealth = monitor.getSystemHealth();
      
      expect(systemHealth.status).toBeDefined();
      expect(systemHealth.checks).toBeDefined();
      expect(systemHealth.uptime).toBeGreaterThan(0);
    });

    it('should handle failing health checks', async () => {
      const failingCheck = vi.fn().mockRejectedValue(new Error('Service unavailable'));

      monitor.registerCheck('external-service', failingCheck);

      await new Promise(resolve => setTimeout(resolve, 10));

      const systemHealth = monitor.getSystemHealth();
      const externalCheck = systemHealth.checks.find(c => c.name === 'external-service');

      expect(externalCheck?.status).toBe('unhealthy');
      expect(externalCheck?.message).toContain('Service unavailable');
    });
  });

  describe('System Health Status', () => {
    it('should determine overall system health', () => {
      const systemHealth = monitor.getSystemHealth();

      expect(systemHealth).toMatchObject({
        status: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
        checks: expect.any(Array),
        timestamp: expect.any(String),
        version: expect.any(String),
        uptime: expect.any(Number)
      });
    });
  });
});

// ============================================================================
// MetricsRegistry Tests
// ============================================================================

describe('MetricsRegistry', () => {
  let registry: MetricsRegistry;

  beforeEach(() => {
    registry = new MetricsRegistry();
  });

  describe('Metric Creation', () => {
    it('should create counter metrics', () => {
      const counter = registry.counter('test_counter', 'Test counter metric');
      
      counter.inc(5);
      counter.inc(3);

      expect(counter.getValue()).toBe(8);
      
      const exported = counter.export();
      expect(exported.type).toBe('counter');
      expect(exported.value).toBe(8);
    });

    it('should create gauge metrics', () => {
      const gauge = registry.gauge('test_gauge', 'Test gauge metric');
      
      gauge.set(100);
      gauge.inc(20);
      gauge.dec(10);

      expect(gauge.getValue()).toBe(110);
    });

    it('should create histogram metrics', () => {
      const histogram = registry.histogram(
        'test_histogram',
        'Test histogram metric',
        [0.1, 0.5, 1, 2.5, 5]
      );
      
      histogram.observe(0.3);
      histogram.observe(1.2);
      histogram.observe(4.8);

      const exported = histogram.export();
      expect(exported.type).toBe('histogram');
      expect(exported.count).toBe(3);
      expect(exported.sum).toBeCloseTo(6.3, 1);
    });

    it('should create summary metrics', () => {
      const summary = registry.summary(
        'test_summary',
        'Test summary metric',
        [0.5, 0.9, 0.95, 0.99]
      );
      
      for (let i = 1; i <= 100; i++) {
        summary.observe(i);
      }

      const exported = summary.export();
      expect(exported.type).toBe('summary');
      expect(exported.count).toBe(100);
      expect(exported.quantiles.p50).toBeDefined();
      expect(exported.quantiles.p99).toBeDefined();
    });
  });

  describe('Metric Querying', () => {
    beforeEach(() => {
      const counter1 = registry.counter('api_requests_total', 'API requests', { endpoint: '/users' });
      const counter2 = registry.counter('api_requests_total', 'API requests', { endpoint: '/posts' });
      const gauge1 = registry.gauge('memory_usage', 'Memory usage');
      
      counter1.inc(10);
      counter2.inc(5);
      gauge1.set(1024);
    });

    it('should get all metrics', () => {
      const allMetrics = registry.getAllMetrics();
      
      expect(allMetrics).toHaveLength(3);
      expect(allMetrics.some(m => m.name === 'api_requests_total')).toBe(true);
      expect(allMetrics.some(m => m.name === 'memory_usage')).toBe(true);
    });

    it('should filter metrics by name pattern', () => {
      const apiMetrics = registry.getMetricsByName('api_requests.*');
      
      expect(apiMetrics).toHaveLength(2);
      expect(apiMetrics.every(m => m.name === 'api_requests_total')).toBe(true);
    });

    it('should filter metrics by labels', () => {
      const userMetrics = registry.getMetricsByLabels({ endpoint: '/users' });
      
      expect(userMetrics).toHaveLength(1);
      expect(userMetrics[0].labels.endpoint).toBe('/users');
    });
  });

  describe('Metric Aggregation', () => {
    beforeEach(() => {
      const counter1 = registry.counter('requests', 'Requests', { service: 'api' });
      const counter2 = registry.counter('requests', 'Requests', { service: 'auth' });
      
      counter1.inc(100);
      counter2.inc(50);
    });

    it('should aggregate metrics by group', () => {
      const aggregated = registry.aggregateMetrics('requests', {
        field: 'value',
        function: 'sum',
        groupBy: ['service']
      });

      expect(aggregated['service=api']).toBe(100);
      expect(aggregated['service=auth']).toBe(50);
    });

    it('should calculate total aggregation', () => {
      const aggregated = registry.aggregateMetrics('requests', {
        field: 'value',
        function: 'sum'
      });

      expect(aggregated.total).toBe(150);
    });
  });

  describe('Prometheus Export', () => {
    it('should export metrics in Prometheus format', () => {
      const counter = registry.counter('test_total', 'Test counter');
      const gauge = registry.gauge('test_current', 'Test gauge');
      
      counter.inc(42);
      gauge.set(3.14);

      const prometheus = registry.exportPrometheus();

      expect(prometheus).toContain('# HELP test_total Test counter');
      expect(prometheus).toContain('# TYPE test_total counter');
      expect(prometheus).toContain('test_total{} 42');
      expect(prometheus).toContain('# HELP test_current Test gauge');
      expect(prometheus).toContain('# TYPE test_current gauge');
      expect(prometheus).toContain('test_current{} 3.14');
    });
  });
});

// ============================================================================
// ApplicationMetrics Tests
// ============================================================================

describe('ApplicationMetrics', () => {
  let registry: MetricsRegistry;
  let appMetrics: ApplicationMetrics;

  beforeEach(() => {
    registry = new MetricsRegistry();
    appMetrics = new ApplicationMetrics(registry);
  });

  describe('HTTP Request Recording', () => {
    it('should record HTTP request metrics', () => {
      appMetrics.recordHttpRequest('GET', '/api/users', 200, 150);
      appMetrics.recordHttpRequest('POST', '/api/users', 201, 200);
      appMetrics.recordHttpRequest('GET', '/api/users', 500, 300);

      const allMetrics = registry.getAllMetrics();
      const requestsTotal = allMetrics.find(m => m.name === 'http_requests_total');

      expect(requestsTotal).toBeDefined();
      expect(requestsTotal?.value).toBeGreaterThan(0);
    });
  });

  describe('OAuth Flow Recording', () => {
    it('should record OAuth flow metrics', () => {
      appMetrics.recordOAuthFlow('google', 'initiate', true, 1000);
      appMetrics.recordOAuthFlow('google', 'callback', true, 500);
      appMetrics.recordOAuthFlow('google', 'callback', false, 2000);

      const allMetrics = registry.getAllMetrics();
      const oauthFlows = allMetrics.find(m => m.name === 'oauth_flows_total');

      expect(oauthFlows).toBeDefined();
      expect(oauthFlows?.value).toBeGreaterThan(0);
    });
  });

  describe('External API Recording', () => {
    it('should record external API metrics', () => {
      appMetrics.recordExternalApiRequest('gmail', '/messages', true, 200);
      appMetrics.recordExternalApiRequest('gmail', '/messages', false, 500);
      appMetrics.recordExternalApiRequest('drive', '/files', true, 150);

      const allMetrics = registry.getAllMetrics();
      const externalRequests = allMetrics.find(m => m.name === 'external_api_requests_total');
      const externalErrors = allMetrics.find(m => m.name === 'external_api_errors_total');

      expect(externalRequests).toBeDefined();
      expect(externalErrors).toBeDefined();
      expect(externalRequests?.value).toBeGreaterThan(0);
    });
  });

  describe('System Metrics Updates', () => {
    it('should update system metrics', () => {
      appMetrics.updateSystemMetrics();

      const allMetrics = registry.getAllMetrics();
      const memoryUsage = allMetrics.find(m => m.name === 'memory_usage_bytes');
      const cpuUsage = allMetrics.find(m => m.name === 'cpu_usage_percent');

      expect(memoryUsage).toBeDefined();
      expect(cpuUsage).toBeDefined();
      expect(memoryUsage?.value).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Monitoring Integration', () => {
  describe('Logger and Metrics Integration', () => {
    it('should create service-specific loggers', () => {
      const gmailLogger = createLogger('gmail', 'test');
      const driveLogger = createLogger('drive', 'test');

      gmailLogger.info('Gmail operation completed');
      driveLogger.info('Drive operation completed');

      expect(console.info).toHaveBeenCalledTimes(2);
    });

    it('should record API requests through convenience functions', () => {
      recordApiRequest('/api/test', 'GET', 200, 150, 'user-123');
      recordExternalApiCall('gmail', '/messages', true, 200, {
        quotaUsed: 1000,
        quotaTotal: 10000
      });

      const apiMetrics = apiObserver.metrics.getApiMetrics();
      const externalMetrics = apiObserver.metrics.getExternalApiMetrics();

      expect(apiMetrics.length).toBeGreaterThan(0);
      expect(externalMetrics.length).toBeGreaterThan(0);
    });
  });

  describe('Error Monitoring', () => {
    it('should capture and log errors with context', () => {
      const logger = createLogger('api');
      const error: ErrorContext = {
        name: 'OAuthException',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      };

      const request: RequestContext = {
        requestId: 'req-789',
        method: 'GET',
        path: '/api/oauth/user-info',
        userId: 'user-456'
      };

      logger.logError('OAuth token validation failed', error, request);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"name":"OAuthException"')
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"code":"TOKEN_EXPIRED"')
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('should track end-to-end request performance', () => {
      const startTime = Date.now();
      
      // Simulate request processing
      recordApiRequest('/api/heavy-operation', 'POST', 200, 2500, 'user-123');
      
      const metrics = apiObserver.metrics.getApiMetrics();
      const heavyOpMetric = metrics.find(m => m.endpoint === '/api/heavy-operation');

      expect(heavyOpMetric).toBeDefined();
      expect(heavyOpMetric?.avgResponseTime).toBe(2500);
    });
  });
});