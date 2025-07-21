/**
 * Simple Logger Utility
 * 
 * Minimal logging system for freee receipt automation
 * Replaces the previous 2,685-line monitoring system
 */

export interface LogData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Simple logger for basic application logging
 */
export const logger = {
  /**
   * Log informational message
   */
  info: (message: string, data?: LogData) => {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${timestamp}] INFO: ${message}${dataStr}`);
  },

  /**
   * Log error message
   */
  error: (message: string, error?: Error | unknown, data?: LogData) => {
    const timestamp = new Date().toISOString();
    const errorStr = error instanceof Error ? ` ${error.message}` : '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    console.error(`[${timestamp}] ERROR: ${message}${errorStr}${dataStr}`);
  },

  /**
   * Log warning message
   */
  warn: (message: string, data?: LogData) => {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    console.warn(`[${timestamp}] WARN: ${message}${dataStr}`);
  },

  /**
   * Log debug message (only in development)
   */
  debug: (message: string, data?: LogData) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const dataStr = data ? ` ${JSON.stringify(data)}` : '';
      console.debug(`[${timestamp}] DEBUG: ${message}${dataStr}`);
    }
  }
};

/**
 * Helper function for API call logging
 */
export const logApiCall = (
  operation: string,
  provider: 'gmail' | 'drive' | 'freee',
  duration?: number,
  error?: Error
) => {
  const data: LogData = { provider };
  if (duration) data.duration = duration;
  
  if (error) {
    logger.error(`${operation} failed`, error, data);
  } else {
    logger.info(`${operation} completed`, data);
  }
};