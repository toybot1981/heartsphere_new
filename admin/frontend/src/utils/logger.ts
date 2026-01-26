/**
 * 统一日志工具 - Admin 版本
 * 根据环境变量控制日志输出
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const defaultConfig: LoggerConfig = {
  level: isDevelopment ? 'debug' : 'error',
  enableConsole: isDevelopment,
  enableRemote: isProduction,
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie'];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  private outputToConsole(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.config.enableConsole || !this.shouldLog(level)) {
      return;
    }

    const sanitizedArgs = args.map(arg => this.sanitize(arg));
    const formattedMessage = this.formatMessage(level, message, ...sanitizedArgs);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, ...sanitizedArgs);
        break;
      case 'info':
        console.info(formattedMessage, ...sanitizedArgs);
        break;
      case 'warn':
        console.warn(formattedMessage, ...sanitizedArgs);
        break;
      case 'error':
        console.error(formattedMessage, ...sanitizedArgs);
        break;
    }
  }

  private async reportToRemote(level: LogLevel, message: string, ...args: unknown[]): Promise<void> {
    if (!this.config.enableRemote || level !== 'error') {
      return;
    }
    // 远程日志上报功能（可选）
  }

  debug(message: string, ...args: unknown[]): void {
    this.outputToConsole('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.outputToConsole('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.outputToConsole('warn', message, ...args);
  }

  async error(message: string, ...args: unknown[]): Promise<void> {
    this.outputToConsole('error', message, ...args);
    await this.reportToRemote('error', message, ...args);
  }

  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const logger = new Logger();
export type { LoggerConfig, LogLevel };
export { Logger };

export const log = {
  debug: (message: string, ...args: unknown[]) => logger.info(message, ...args),
  info: (message: string, ...args: unknown[]) => logger.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => logger.error(message, ...args),
};
