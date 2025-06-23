/**
 * Gmail API Monitoring Integration
 * 
 * Comprehensive monitoring system for Gmail API operations including
 * error tracking, performance metrics, quota management, and alerting.
 */

import { apiObserver } from '../../monitoring/api-observer';
import type { GmailError } from './gmail-errors';

// ============================================================================
// Types
// ============================================================================

export interface GmailOperationMetrics {
  operation: string;
  success: boolean;
  quotaUsed: number;
  errorCode?: string;
  errorMessage?: string;
  rateLimitRemaining?: number;
  timestamp: Date;
}

export interface GmailQuotaAlert {
  type: 'quota_usage' | 'rate_limit' | 'error_rate';
  service: 'gmail';
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface GmailMonitoringStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  averageResponseTime: number;
  quotaUsage: number;
  rateLimitStatus: {
    remaining: number;
    total: number;
    resetTime: Date;
  };
  topErrors: Array<{
    code: string;
    count: number;
    lastOccurred: Date;
  }>;
}

// ============================================================================
// Gmail Monitor
// ============================================================================

export class GmailMonitor {
  private operationHistory: GmailOperationMetrics[] = [];
  private readonly maxHistorySize = 1000;
  
  private quotaTracker = {
    dailyUsed: 0,
    dailyLimit: 1000000000, // 1 billion quota units per day
    lastReset: new Date()
  };

  private alertThresholds = {
    quotaUsage: 0.8, // 80%
    errorRate: 0.3,  // 30%
    responseTime: 30000 // 30 seconds
  };

  /**
   * Record Gmail operation metrics
   */
  recordOperation(metrics: GmailOperationMetrics): void {
    // Add to history
    this.operationHistory.push(metrics);
    
    // Trim history if needed
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory.shift();
    }

    // Update quota tracking
    this.updateQuotaTracking(metrics.quotaUsed);

    // Log to Foundation monitoring
    this.logToFoundation(metrics);

    // Check for alert conditions
    this.checkAlertConditions(metrics);
  }

  /**
   * Get current monitoring statistics
   */
  getStats(): GmailMonitoringStats {
    const totalRequests = this.operationHistory.length;
    const successfulRequests = this.operationHistory.filter(op => op.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const errorRate = totalRequests > 0 ? failedRequests / totalRequests : 0;

    // Calculate average response time (simplified - would need actual timing data)
    const averageResponseTime = 1500; // Placeholder

    // Count error types
    const errorCounts = new Map<string, { count: number; lastOccurred: Date }>();
    this.operationHistory
      .filter(op => !op.success && op.errorCode)
      .forEach(op => {
        const code = op.errorCode!;
        const existing = errorCounts.get(code);
        if (existing) {
          existing.count++;
          existing.lastOccurred = op.timestamp;
        } else {
          errorCounts.set(code, { count: 1, lastOccurred: op.timestamp });
        }
      });

    const topErrors = Array.from(errorCounts.entries())
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      errorRate,
      averageResponseTime,
      quotaUsage: this.quotaTracker.dailyUsed,
      rateLimitStatus: {
        remaining: Math.max(0, this.quotaTracker.dailyLimit - this.quotaTracker.dailyUsed),
        total: this.quotaTracker.dailyLimit,
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      topErrors
    };
  }

  /**
   * Reset daily quota tracking
   */
  resetDailyQuota(): void {
    this.quotaTracker.dailyUsed = 0;
    this.quotaTracker.lastReset = new Date();
  }

  /**
   * Get quota usage percentage
   */
  getQuotaUsagePercentage(): number {
    return this.quotaTracker.dailyUsed / this.quotaTracker.dailyLimit;
  }

  /**
   * Check if quota is nearly exhausted
   */
  isQuotaNearlyExhausted(): boolean {
    return this.getQuotaUsagePercentage() > this.alertThresholds.quotaUsage;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Log operation to Foundation monitoring system
   */
  private logToFoundation(metrics: GmailOperationMetrics): void {
    apiObserver.logger.logExternalApi(
      metrics.success ? 'info' : 'error',
      `Gmail ${metrics.operation} ${metrics.success ? 'completed' : 'failed'}`,
      {
        service: 'gmail',
        endpoint: `/gmail/${metrics.operation}`,
        operation: metrics.operation,
        apiStatusCode: metrics.success ? 200 : 500,
        quota: {
          used: metrics.quotaUsed,
          total: this.quotaTracker.dailyLimit
        }
      },
      {
        requestId: `gmail-${Date.now()}`,
        userId: 'system',
        path: `/gmail/${metrics.operation}`,
        method: 'POST',
        userAgent: 'Gmail-Monitor/1.0'
      }
    );
  }

  /**
   * Update quota tracking
   */
  private updateQuotaTracking(quotaUsed: number): void {
    const now = new Date();
    
    // Reset daily quota if it's a new day
    if (now.getDate() !== this.quotaTracker.lastReset.getDate()) {
      this.quotaTracker.dailyUsed = 0;
      this.quotaTracker.lastReset = now;
    }
    
    this.quotaTracker.dailyUsed += quotaUsed;
  }

  /**
   * Check for alert conditions
   */
  private checkAlertConditions(metrics: GmailOperationMetrics): void {
    // Check quota usage
    const quotaUsagePercentage = this.quotaTracker.dailyUsed / this.quotaTracker.dailyLimit;
    if (quotaUsagePercentage > this.alertThresholds.quotaUsage) {
      this.triggerAlert({
        type: 'quota_usage',
        service: 'gmail',
        severity: 'high',
        data: { 
          quotaUsed: this.quotaTracker.dailyUsed, 
          threshold: this.alertThresholds.quotaUsage 
        },
        timestamp: new Date()
      });
    }

    // Check error rate (last 20 operations)
    const recentOps = this.operationHistory.slice(-20);
    if (recentOps.length >= 10) {
      const errorRate = recentOps.filter(op => !op.success).length / recentOps.length;
      if (errorRate > this.alertThresholds.errorRate) {
        this.triggerAlert({
          type: 'error_rate',
          service: 'gmail',
          severity: 'high',
          data: { 
            errorRate, 
            threshold: this.alertThresholds.errorRate,
            period: '5 minutes'
          },
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Trigger alert
   */
  private triggerAlert(alert: GmailQuotaAlert): void {
    // Log alert
    console.warn('Gmail Alert:', alert);
    
    // In production, this would send to alerting systems
    // For now, we'll use Foundation logging
    apiObserver.logger.warn(`Gmail ${alert.type} alert`, {
      severity: alert.severity,
      data: alert.data,
      timestamp: alert.timestamp.toISOString()
    });
  }
}

// ============================================================================
// Global Monitor Instance and Utility Functions
// ============================================================================

export const gmailMonitor = new GmailMonitor();

/**
 * Record Gmail operation for monitoring
 */
export function recordGmailOperation(
  operation: string,
  success: boolean,
  quotaUsed: number,
  error?: GmailError
): void {
  gmailMonitor.recordOperation({
    operation,
    success,
    quotaUsed,
    errorCode: error?.code,
    errorMessage: error?.message,
    timestamp: new Date()
  });
}

/**
 * Get Gmail monitoring statistics
 */
export function getGmailStats(): GmailMonitoringStats {
  return gmailMonitor.getStats();
}

/**
 * Check if Gmail quota is nearly exhausted
 */
export function isGmailQuotaNearlyExhausted(): boolean {
  return gmailMonitor.isQuotaNearlyExhausted();
}

/**
 * Reset Gmail quota tracking (for testing)
 */
export function resetGmailQuota(): void {
  gmailMonitor.resetDailyQuota();
}