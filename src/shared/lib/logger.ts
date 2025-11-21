/**
 * Frontend logging utility for React application
 * Provides structured logging with environment-aware behavior
 */

export interface LogContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown; // Support Error.cause chain for diagnostic context
  };
}

/**
 * Frontend logger with environment-aware behavior
 *
 * Features:
 * - Development: Enhanced console output with timestamps and context
 * - Production: Minimal console output + structured logs for external services
 * - Error correlation and user context tracking
 *
 * Note: Data sanitization (removal of sensitive information) is handled by
 * external logging tools and infrastructure, not by this frontend logger.
 */
export class FrontendLogger {
  private static instance: FrontendLogger;
  private isDevelopment: boolean;
  private sessionId: string;

  private constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.sessionId = crypto.randomUUID();
  }

  /**
   * Get singleton logger instance
   */
  static getInstance(): FrontendLogger {
    if (!FrontendLogger.instance) {
      FrontendLogger.instance = new FrontendLogger();
    }
    return FrontendLogger.instance;
  }

  /**
   * Recursively serialize error with cause chain
   *
   * Handles Error.cause to preserve full diagnostic context:
   * - Recursively serializes Error instances
   * - Preserves non-Error causes (strings, objects, etc.)
   * - Prevents infinite loops with depth limit
   */
  private serializeError(
    error: Error,
    depth = 0,
    maxDepth = 10
  ): LogEntry['error'] {
    // Prevent infinite recursion
    if (depth >= maxDepth) {
      return {
        name: 'ErrorSerializationLimit',
        message: `Max depth ${maxDepth} reached in error cause chain`,
      };
    }

    const serialized: LogEntry['error'] = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Recursively serialize cause if it exists
    if (error.cause !== undefined) {
      const cause: unknown = error.cause;
      serialized.cause =
        cause instanceof Error
          ? this.serializeError(cause, depth + 1, maxDepth)
          : cause;
    }

    return serialized;
  }

  /**
   * Create log entry with context
   */
  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        sessionId: this.sessionId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
      },
    };

    if (error) {
      entry.error = this.serializeError(error);
    }

    return entry;
  }

  /**
   * Format log for console output
   */
  private formatForConsole(entry: LogEntry): [string, ...unknown[]] {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] ${entry.level.toUpperCase()}`;

    if (this.isDevelopment) {
      // Enhanced development output
      const contextInfo = entry.context?.component
        ? ` [${entry.context.component}]`
        : '';

      const formattedMessage = `${prefix}${contextInfo}: ${entry.message}`;

      const additionalData = [];
      if (entry.context && Object.keys(entry.context).length > 0) {
        additionalData.push('Context:', entry.context);
      }
      if (entry.error) {
        additionalData.push('Error:', entry.error);
      }

      return [formattedMessage, ...additionalData];
    } else {
      // Minimal production output
      return [`${prefix}: ${entry.message}`];
    }
  }

  /**
   * Send log to external service (production)
   */
  private sendToExternalService(_entry: LogEntry): void {
    if (this.isDevelopment) {
      return;
    }

    try {
      // In a real application, you would send to your logging service
      // e.g., Sentry, LogRocket, DataDog, etc.
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      // Fallback to console in case external service fails
      console.error('Failed to send log to external service:', error);
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) {
      return;
    }

    const entry = this.createLogEntry('debug', message, context);
    const [formattedMessage, ...additionalData] = this.formatForConsole(entry);
    console.debug(formattedMessage, ...additionalData);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('info', message, context);
    const [formattedMessage, ...additionalData] = this.formatForConsole(entry);
    console.info(formattedMessage, ...additionalData);

    if (!this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    const entry = this.createLogEntry('warn', message, context);
    const [formattedMessage, ...additionalData] = this.formatForConsole(entry);
    console.warn(formattedMessage, ...additionalData);

    this.sendToExternalService(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.createLogEntry('error', message, context, error);
    const [formattedMessage, ...additionalData] = this.formatForConsole(entry);
    console.error(formattedMessage, ...additionalData);

    this.sendToExternalService(entry);
  }

  /**
   * Log API call for debugging
   */
  apiCall(method: string, url: string, context?: LogContext): void {
    this.debug(`API Call: ${method} ${url}`, {
      ...context,
      component: 'API',
      action: 'request',
      method,
      endpoint: url,
    });
  }

  /**
   * Log API response for debugging
   */
  apiResponse(
    method: string,
    url: string,
    status: number,
    context?: LogContext
  ): void {
    const level = status >= 400 ? 'warn' : 'debug';
    const message = `API Response: ${method} ${url} - ${status}`;

    if (level === 'warn') {
      this.warn(message, {
        ...context,
        component: 'API',
        action: 'response',
        method,
        endpoint: url,
        statusCode: status,
      });
    } else {
      this.debug(message, {
        ...context,
        component: 'API',
        action: 'response',
        method,
        endpoint: url,
        statusCode: status,
      });
    }
  }

  /**
   * Log user action for analytics
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      ...context,
      component: 'UserInteraction',
      action,
    });
  }

  /**
   * Log form validation error
   */
  validationError(field: string, error: string, context?: LogContext): void {
    this.warn(`Validation Error: ${field} - ${error}`, {
      ...context,
      component: 'FormValidation',
      field,
      validationError: error,
    });
  }

  /**
   * Log performance metric
   */
  performance(
    metric: string,
    value: number,
    unit = 'ms',
    context?: LogContext
  ): void {
    this.debug(`Performance: ${metric} = ${value}${unit}`, {
      ...context,
      component: 'Performance',
      metric,
      value,
      unit,
    });
  }
}

// Export singleton instance
export const logger = FrontendLogger.getInstance();

// Export convenience functions for common use cases
export const logApiCall = (method: string, url: string, context?: LogContext) =>
  logger.apiCall(method, url, context);

export const logApiResponse = (
  method: string,
  url: string,
  status: number,
  context?: LogContext
) => logger.apiResponse(method, url, status, context);

export const logUserAction = (action: string, context?: LogContext) =>
  logger.userAction(action, context);

export const logValidationError = (
  field: string,
  error: string,
  context?: LogContext
) => logger.validationError(field, error, context);

export const logPerformance = (
  metric: string,
  value: number,
  unit?: string,
  context?: LogContext
) => logger.performance(metric, value, unit, context);
