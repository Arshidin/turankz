/**
 * Centralized logging utility
 * 
 * Provides consistent error logging across the application.
 * In production, errors can be sent to an error tracking service.
 * In development, errors are logged to console for debugging.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log an error
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      // TODO: Integrate with error tracking service
      // For now, we'll just store it for potential future integration
    }
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }
}

export const logger = new Logger();

