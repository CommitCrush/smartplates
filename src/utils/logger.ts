import fs from 'fs';
import path from 'path';
import { storageConfig } from '@/config/storage';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: string;
  metadata?: Record<string, any>;
}

/**
 * Enhanced Logger for Render.com with persistent file storage
 * Falls back to console logging if file operations fail
 */
export class Logger {
  private logFile: string;
  private context: string;

  constructor(context: string = 'SmartPlates') {
    this.context = context;
    
    // Use persistent storage path for Render.com
    this.logFile = path.join(
      storageConfig.logsPath, 
      `${context.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`
    );
    
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    try {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Could not create log directory, falling back to console only');
    }
  }

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${metaStr}`;
  }

  private logToFile(formattedMessage: string): void {
    try {
      // Use persistent file storage on Render.com
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    } catch (error) {
      // Fallback to console if file operations fail
      console.warn('Failed to write to log file, using console only:', error);
    }
  }

  private logToConsole(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const formattedMessage = this.formatMessage(level, message, metadata);
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const formattedMessage = this.formatMessage(level, message, metadata);
    
    // Always log to console for immediate visibility
    this.logToConsole(level, message, metadata);
    
    // Try to log to file for persistence (Render.com advantage)
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
      this.logToFile(formattedMessage);
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      this.log('debug', message, metadata);
    }
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  /**
   * Get recent log entries from file
   */
  async getRecentLogs(limit: number = 100): Promise<LogEntry[]> {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const content = fs.readFileSync(this.logFile, 'utf-8');
      const lines = content.trim().split('\n');
      const recentLines = lines.slice(-limit);

      return recentLines
        .filter(line => line.trim())
        .map(line => {
          try {
            const match = line.match(/\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.+)/);
            if (match) {
              const [, timestamp, level, context, messageWithMeta] = match;
              const parts = messageWithMeta.split(' | ');
              const message = parts[0];
              const metadata = parts[1] ? JSON.parse(parts[1]) : undefined;

              return {
                timestamp,
                level: level.toLowerCase() as LogLevel,
                message,
                context,
                metadata
              } as LogEntry;
            }
            return null;
          } catch {
            return null;
          }
        })
        .filter((entry): entry is LogEntry => entry !== null);

    } catch (error) {
      console.error('Failed to read log file:', error);
      return [];
    }
  }

  /**
   * Clear old log files (cleanup utility)
   */
  static async cleanupOldLogs(daysToKeep: number = 7): Promise<void> {
    try {
      const logDir = storageConfig.logsPath;
      if (!fs.existsSync(logDir)) return;

      const files = fs.readdirSync(logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      for (const file of files) {
        if (!file.endsWith('.log')) continue;

        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old log file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }
}

// Export default logger instance
export const logger = new Logger('SmartPlates');

// Export specialized loggers for different components
export const dbLogger = new Logger('Database');
export const authLogger = new Logger('Authentication'); 
export const apiLogger = new Logger('API');
export const aiLogger = new Logger('AI');

export default logger;