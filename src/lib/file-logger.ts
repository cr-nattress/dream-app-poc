/**
 * File-based logging for debugging
 */

import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Logs to a file specific to a job ID
 */
export function logToFile(jobId: string, level: string, message: string, context?: Record<string, unknown>) {
  try {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context,
    };

    const logLine = JSON.stringify(logEntry, null, 2) + '\n';
    const logFile = path.join(LOGS_DIR, `${jobId}.log`);

    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

/**
 * Logs to a general application log
 */
export function logToAppFile(level: string, message: string, context?: Record<string, unknown>) {
  try {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context,
    };

    const logLine = JSON.stringify(logEntry, null, 2) + '\n';
    const logFile = path.join(LOGS_DIR, 'app.log');

    fs.appendFileSync(logFile, logLine);
  } catch (error) {
    console.error('Failed to write to app log file:', error);
  }
}

/**
 * Convenience functions for different log levels
 */
export const fileLogger = {
  info: (jobId: string, message: string, context?: Record<string, unknown>) => {
    logToFile(jobId, 'info', message, context);
  },
  error: (jobId: string, message: string, context?: Record<string, unknown>) => {
    logToFile(jobId, 'error', message, context);
  },
  debug: (jobId: string, message: string, context?: Record<string, unknown>) => {
    logToFile(jobId, 'debug', message, context);
  },
  warn: (jobId: string, message: string, context?: Record<string, unknown>) => {
    logToFile(jobId, 'warn', message, context);
  },
};
